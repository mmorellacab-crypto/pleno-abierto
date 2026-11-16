#!/usr/bin/env node
// Genera docs/data/dataset.json a partir de:
//  1. Datos abiertos del Congreso de los Diputados (votos oficiales: totales y voto nominal).
//  2. API pública de El Congreso en tu mano (solo: lista de leyes y el TEMA asignado a cada una).
// Se ejecuta en GitHub Actions (ver .github/workflows/datos.yml). Requiere Node 20+.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GRUPOS, emparejar, fechaCongreso, fechaIso, recuentoPorGrupo, registroLey } from './lib.mjs';
import { construirDiputados, construirProximas } from './diputados.mjs';


const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = process.env.PLENO_CACHE || path.join(RAIZ, 'data', 'cache', 'oficial');
const SALIDA = process.env.PLENO_SALIDA || path.join(RAIZ, 'docs', 'data', 'dataset.json');

const ECETM = 'https://www.elcongresoentumano.es/api/public/v1';
const CONGRESO = 'https://www.congreso.es';
let LEGISLATURA = process.env.LEGISLATURA || '';
const REPO = process.env.GITHUB_REPOSITORY || 'pleno-abierto';
const UA = `PlenoAbierto/1.0 (app libre y gratuita; https://github.com/${REPO})`;
const PAUSA_MS = Number(process.env.PLENO_PAUSA_MS ?? 400); // uso diligente: peticiones espaciadas

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function pedir(url, tipo = 'json', intentos = 3) {
  for (let i = 1; i <= intentos; i += 1) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: tipo === 'json' ? 'application/json' : 'text/html' } });
      if (r.status === 429) throw new Error('429');
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return tipo === 'json' ? await r.json() : await r.text();
    } catch (e) {
      if (i === intentos) throw new Error(`${url}: ${e.message}`);
      await dormir(2000 * i);
    }
  }
}

async function leyesECETM() {
  const leyes = [];
  for (let offset = 0; ; offset += 100) {
    const p = await pedir(`${ECETM}/votaciones?limit=100&offset=${offset}`);
    leyes.push(...p.items);
    if (leyes.length >= p.total || p.items.length === 0) break;
    await dormir(PAUSA_MS);
  }
  return leyes;
}

/**
 * Índice de las votaciones oficiales de un día, leído de la página de datos abiertos:
 * [{ url, si, no, abstencion }]. Se guarda en caché (los ficheros publicados no cambian).
 */
export function indiceDesdeHtml(html) {
  const out = [];
  const re = /Si:\s*(\d+)\s*<\/p>\s*<p>\s*No:\s*(\d+)\s*<\/p>\s*<p>\s*Abstenciones:\s*(\d+)\s*<\/p>[\s\S]*?href=["'](\/webpublica\/opendata\/votaciones\/[^"']+\.json)["']/gi;
  for (const m of html.matchAll(re)) out.push({ url: CONGRESO + m[4], si: +m[1], no: +m[2], abstencion: +m[3] });
  return out;
}

async function leerCache(fecha) {
  const f = path.join(CACHE, `${fecha}.json`);
  return existsSync(f) ? JSON.parse(await readFile(f, 'utf8')) : null;
}

async function guardarCache(fecha, dia) {
  await mkdir(CACHE, { recursive: true });
  await writeFile(path.join(CACHE, `${fecha}.json`), JSON.stringify(dia));
}

async function diaOficial(fecha) {
  const cache = await leerCache(fecha);
  if (cache) return cache;
  const pagina = `${CONGRESO}/es/opendata/votaciones?p_p_id=votaciones&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&targetLegislatura=${LEGISLATURA}&targetDate=${fechaCongreso(fecha)}`;
  const html = await pedir(pagina, 'html');
  const dias = (html.match(/var diasVotaciones = \[([^\]]*)\]/) || [])[1] || '';
  // Ese día no hubo votaciones de Pleno publicadas (p. ej. Diputación Permanente): no se cachea.
  if (!dias.includes(fecha.replaceAll('-', ''))) return { fecha, indice: [], votaciones: {} };
  const dia = { fecha, indice: indiceDesdeHtml(html), votaciones: {} };
  await guardarCache(fecha, dia);
  return dia;
}

/** Descarga (o lee de caché) las votaciones candidatas para una ley. */
async function candidatas(dia, ley) {
  const t = ley.totales || {};
  let elegidas = dia.indice.filter((x) => x.si === t.si && x.no === t.no && x.abstencion === t.abstencion);
  if (!elegidas.length) elegidas = dia.indice; // sin coincidencia exacta: se revisan todas las del día
  const lista = [];
  let cambios = false;
  for (const { url } of elegidas) {
    if (!dia.votaciones[url]) {
      await dormir(PAUSA_MS);
      const d = await pedir(url);
      dia.votaciones[url] = { url, informacion: d.informacion, totales: d.totales, recuento: recuentoPorGrupo(d.votaciones) };
      cambios = true;
    }
    lista.push(dia.votaciones[url]);
  }
  if (cambios) await guardarCache(dia.fecha, dia);
  return lista.filter((v) => fechaIso(v.informacion?.fecha) === dia.fecha);
}

/** Grupos conocidos + cualquier código nuevo que aparezca en los datos oficiales (p. ej. otra legislatura). */
function gruposPresentes(registros) {
  const out = { ...GRUPOS };
  for (const r of registros) for (const g of Object.keys(r.grupos || {})) out[g] ??= { corto: g, nombre: g };
  return out;
}

export async function main() {
  const [salud, cats, leyes] = [await pedir(`${ECETM}/health`), await pedir(`${ECETM}/categorias`), await leyesECETM()];
  LEGISLATURA ||= salud.legislatura || 'XV';
  console.log(`El Congreso en tu mano: ${leyes.length} leyes, legislatura ${LEGISLATURA} (datos hasta ${salud.version})`);

  const dias = {};
  const registros = [];
  const sinOficial = [];
  for (const ley of leyes) {
    let m = null;
    try {
      dias[ley.fecha] ??= await diaOficial(ley.fecha);
      m = emparejar(ley, await candidatas(dias[ley.fecha], ley));
    } catch (e) {
      console.warn(`  ${ley.fecha}: error al descargar (${e.message})`);
    }
    if (!m) sinOficial.push(`${ley.fecha} ${ley.tituloOficial.slice(0, 90)}`);
    registros.push(registroLey(ley, m));
  }
  registros.sort((a, b) => b.fecha.localeCompare(a.fecha));

  const dataset = {
    version: 1,
    generado: new Date().toISOString(),
    legislatura: LEGISLATURA,
    fuentes: {
      congreso: {
        nombre: 'Congreso de los Diputados — Datos abiertos',
        url: `${CONGRESO}/es/opendata/votaciones`,
        condiciones: `${CONGRESO}/es/cem/aviso-legal`,
        uso: 'Votos oficiales: totales y voto nominal de cada diputado (recontado por grupo).',
      },
      ecetm: {
        nombre: 'El Congreso en tu mano',
        url: 'https://www.elcongresoentumano.es',
        licencia: 'CC BY 4.0',
        licenciaUrl: 'https://creativecommons.org/licenses/by/4.0/deed.es',
        datosHasta: salud.version,
        uso: 'Lista de leyes y decretos seleccionados y el tema asignado a cada uno (asignado con IA, orientativo).',
      },
    },
    temas: cats.categorias.map((c) => ({ id: c.id, nombre: c.label })),
    proximas: await construirProximas({ pedir, ecetm: ECETM }),
    grupos: gruposPresentes(registros),
    leyes: registros,
  };

  await mkdir(path.dirname(SALIDA), { recursive: true });
  await writeFile(SALIDA, JSON.stringify(dataset));

  if (process.env.PLENO_SIN_DIPUTADOS !== '1') {
    const { diputados, totalVotaciones } = await construirDiputados({ pedir, dormir, pausa: PAUSA_MS, raiz: RAIZ, legislatura: LEGISLATURA, leyes: registros });
    const salidaDip = path.join(path.dirname(SALIDA), 'diputados.json');
    await writeFile(salidaDip, JSON.stringify({ version: 1, generado: dataset.generado, legislatura: LEGISLATURA, diasConVotaciones: totalVotaciones, leyes: registros.map((r) => r.id), diputados }));
    console.log(`Guardado ${path.relative(RAIZ, salidaDip)}: ${diputados.length} diputados.`);
  }
  const conOficial = registros.filter((r) => r.fuenteVotos === 'congreso').length;
  console.log(`\nGuardado ${path.relative(RAIZ, SALIDA)}: ${registros.length} leyes, ${conOficial} con voto oficial.`);
  if (sinOficial.length) console.log(`Sin votación oficial emparejada (${sinOficial.length}):\n  ${sinOficial.join('\n  ')}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
