// Diputados, participación en votaciones y próximas votaciones.
// Fuentes: datos abiertos del Congreso (diputados y voto nominal de cada votación del Pleno),
// BOE (índice oficial de artículos de los decretos-ley pendientes) y, solo para la agenda de
// próximas votaciones, la API de El Congreso en tu mano.

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CONGRESO = 'https://www.congreso.es';
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function codigoVoto(v) {
  return v === 'Sí' ? 'S' : v === 'No' ? 'N' : v === 'Abstención' ? 'A' : '-';
}

/** «Real Decreto-ley 31/2026, de 20 de octubre, …» → https://www.boe.es/eli/es/rdl/2026/10/20/31 */
export function eliDesdeTitulo(titulo) {
  const m = String(titulo).match(/Real Decreto-ley (\d+)\/(\d{4}), de (\d{1,2}) de ([a-záéíóú]+)/i);
  if (!m) return null;
  const mes = MESES.indexOf(m[4].toLowerCase()) + 1;
  if (!mes) return null;
  return `https://www.boe.es/eli/es/rdl/${m[2]}/${String(mes).padStart(2, '0')}/${m[3].padStart(2, '0')}/${m[1]}`;
}

/** Acumula el voto nominal de una votación en la ficha de cada diputado. */
export function acumular(dip, votaciones, indiceLey) {
  for (const v of votaciones || []) {
    const e = (dip[v.diputado] ??= { votadas: 0, total: 0, grupos: {}, votos: {} });
    e.total += 1;
    if (['Sí', 'No', 'Abstención'].includes(v.voto)) e.votadas += 1;
    e.grupos[v.grupo] = (e.grupos[v.grupo] || 0) + 1;
    if (indiceLey !== undefined) e.votos[indiceLey] = codigoVoto(v.voto);
  }
}

export async function construirDiputados({ pedir, dormir, pausa, raiz, legislatura, leyes }) {
  const cacheDir = path.join(raiz, 'data', 'cache', 'nominal');
  await mkdir(cacheDir, { recursive: true });

  // 1. Lista oficial de diputados (en activo y de baja) de la legislatura.
  const pagina = await pedir(`${CONGRESO}/es/opendata/diputados`, 'html');
  const enlace = (nombre) => (pagina.match(new RegExp(`href=["'](/webpublica/opendata/diputados/${nombre}__\\d+\\.json)["']`)) || [])[1];
  const activos = enlace('DiputadosActivos') ? await pedir(CONGRESO + enlace('DiputadosActivos')) : [];
  const baja = enlace('DiputadosDeBaja') ? await pedir(CONGRESO + enlace('DiputadosDeBaja')) : [];

  // 2. Todas las votaciones del Pleno (caché por día: los ficheros publicados no cambian).
  const portada = await pedir(`${CONGRESO}/es/opendata/votaciones`, 'html');
  const dias = ((portada.match(/var diasVotaciones = \[([^\]]*)\]/) || [])[1] || '').split(',').map((s) => s.trim()).filter(Boolean);
  const indicePorUrl = Object.fromEntries(leyes.map((l, i) => [l.oficial?.url, i]).filter(([u]) => u));
  const dip = {};
  for (const d of dias) {
    const fichero = path.join(cacheDir, `${d}.json`);
    let dia;
    if (existsSync(fichero)) dia = JSON.parse(await readFile(fichero, 'utf8'));
    else {
      const f = `${d.slice(6, 8)}/${d.slice(4, 6)}/${d.slice(0, 4)}`;
      const html = await pedir(`${CONGRESO}/es/opendata/votaciones?p_p_id=votaciones&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&targetLegislatura=${legislatura}&targetDate=${f}`, 'html');
      const urls = [...new Set([...html.matchAll(/href=["'](\/webpublica\/opendata\/votaciones\/[^"']+\/Votacion\d+\/[^"']+\.json)["']/gi)].map((m) => CONGRESO + m[1]))];
      // Formato compacto: lista de diputados del día y, por votación, una cadena de códigos S/N/A/-.
      dia = { nombres: [], grupos: [], votaciones: [] };
      const pos = {};
      for (const url of urls) {
        await dormir(pausa);
        const j = await pedir(url);
        const codigos = [];
        for (const v of j.votaciones || []) {
          if (pos[v.diputado] === undefined) {
            pos[v.diputado] = dia.nombres.length;
            dia.nombres.push(v.diputado);
            dia.grupos.push(v.grupo);
          }
          codigos[pos[v.diputado]] = codigoVoto(v.voto);
        }
        dia.votaciones.push({ url, codigos: Array.from({ length: dia.nombres.length }, (_, i) => codigos[i] || ' ').join('') });
      }
      await writeFile(fichero, JSON.stringify(dia));
    }
    for (const v of dia.votaciones) {
      const votaciones = [];
      for (let i = 0; i < v.codigos.length; i += 1) {
        const c = v.codigos[i];
        if (c === ' ') continue; // no era diputado en esa votación
        votaciones.push({ diputado: dia.nombres[i], grupo: dia.grupos[i], voto: c === 'S' ? 'Sí' : c === 'N' ? 'No' : c === 'A' ? 'Abstención' : 'No vota' });
      }
      acumular(dip, votaciones, indicePorUrl[v.url]);
    }
  }

  // 3. Ficha compacta de cada diputado.
  const lista = [...activos.map((d) => ({ ...d, activo: true })), ...baja.map((d) => ({ ...d, activo: false }))];
  const diputados = lista
    .map((d) => {
      const e = dip[d.NOMBRE] || { votadas: 0, total: 0, grupos: {}, votos: {} };
      const grupo = Object.entries(e.grupos).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
      return {
        nombre: d.NOMBRE,
        circunscripcion: d.CIRCUNSCRIPCION,
        formacion: d.FORMACIONELECTORAL,
        grupo,
        alta: d.FECHAALTA,
        baja: d.FECHABAJA || null,
        votadas: e.votadas,
        total: e.total,
        votos: leyes.map((_, i) => e.votos[i] || ' ').join(''),
      };
    })
    .filter((d) => d.total > 0)
    .sort((a, b) => a.circunscripcion.localeCompare(b.circunscripcion, 'es') || a.nombre.localeCompare(b.nombre, 'es'));
  return { diputados, totalVotaciones: dias.length };
}

/** Próximas votaciones anunciadas, con el índice oficial de artículos del BOE si es un decreto-ley. */
export async function construirProximas({ pedir, ecetm }) {
  let items = [];
  try {
    items = (await pedir(`${ecetm}/proximas?todas=1`)).items || [];
  } catch {
    return [];
  }
  const out = [];
  for (const p of items) {
    const eli = eliDesdeTitulo(p.titulo);
    let articulos = [];
    if (eli) {
      try {
        const html = await pedir(eli, 'html');
        const id = (html.match(/BOE-A-\d{4}-\d+/) || [])[0];
        if (id) {
          const xml = await pedir(`https://www.boe.es/diario_boe/xml.php?id=${id}`, 'html');
          articulos = [...xml.matchAll(/<p class="articulo">([^<]+)<\/p>/g)]
            .map((m) => m[1].trim())
            .filter((t) => !/título competencial|entrada en vigor|habilitación|desarrollo reglamentario|salvaguarda/i.test(t))
            .slice(0, 12);
        }
      } catch {
        /* sin índice */
      }
    }
    out.push({
      id: p.id,
      fecha: p.fecha,
      titulo: p.titulo,
      estado: p.estado,
      fuente: p.fuente,
      eli,
      articulos,
      totales: p.a_favor == null ? null : { si: p.a_favor, no: p.en_contra, abstencion: p.abstenciones },
      aprobada: p.aprobada,
    });
  }
  return out;
}
