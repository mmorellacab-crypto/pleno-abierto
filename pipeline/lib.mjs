// Funciones puras del pipeline de datos (sin dependencias, sin acceso a red).
// Se usan en Node (pipeline/build.mjs) y en los tests (pipeline/test.mjs).

/** Grupos parlamentarios de la XV Legislatura, tal como los codifica el Congreso en sus JSON. */
export const GRUPOS = {
  GS: { corto: 'PSOE', nombre: 'G.P. Socialista' },
  GP: { corto: 'PP', nombre: 'G.P. Popular' },
  GVOX: { corto: 'VOX', nombre: 'G.P. VOX' },
  GSUMAR: { corto: 'Sumar', nombre: 'G.P. Plurinacional Sumar' },
  GR: { corto: 'ERC', nombre: 'G.P. Republicano' },
  GJxCAT: { corto: 'Junts', nombre: 'G.P. Junts per Catalunya' },
  'GEH Bildu': { corto: 'EH Bildu', nombre: 'G.P. EH Bildu' },
  'GV (EAJ-PNV)': { corto: 'PNV', nombre: 'G.P. Vasco (EAJ-PNV)' },
  GMx: { corto: 'Mixto', nombre: 'G.P. Mixto' },
};

const STOP = new Set(
  'de la el los las del y por que se en a al con para su sus o u un una sobre lo como entre otras otros'.split(' '),
);

export function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9/ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(texto) {
  return new Set(
    normalizar(texto)
      .split(' ')
      .filter((t) => t.length > 2 && !STOP.has(t)),
  );
}

/** Identificador normativo, p. ej. "real decreto-ley 17/2026" -> "rdl 17/2026"; "ley organica 1/2025" -> "lo 1/2025". */
export function referenciaNormativa(texto) {
  const t = normalizar(texto);
  const m = t.match(/real decreto ?ley (\d+\/\d{4})/);
  if (m) return `rdl ${m[1]}`;
  const lo = t.match(/ley organica (\d+\/\d{4})/);
  if (lo) return `lo ${lo[1]}`;
  return null;
}

/** Fecha oficial "14/7/2026" -> "2026-07-14". */
export function fechaIso(fechaOficial) {
  const [d, m, a] = String(fechaOficial).split('/').map((x) => parseInt(x, 10));
  if (!a) return null;
  return `${a}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** "2026-07-14" -> "14/07/2026" (formato del parámetro targetDate del Congreso). */
export function fechaCongreso(iso) {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

const VOTO = { 'Sí': 'si', Si: 'si', No: 'no', 'Abstención': 'abstencion', Abstencion: 'abstencion', 'No vota': 'novota' };

/** Recuento por grupo a partir del voto nominal oficial (no altera nada: solo cuenta). */
export function recuentoPorGrupo(votaciones) {
  const out = {};
  for (const v of votaciones || []) {
    const g = v.grupo || '¿?';
    out[g] ??= { si: 0, no: 0, abstencion: 0, novota: 0 };
    const k = VOTO[v.voto] ?? 'novota';
    out[g][k] += 1;
  }
  return out;
}

/** Postura mayoritaria del grupo: si / no / abstencion / dividido / novota. */
export function postura(r) {
  const emitidos = r.si + r.no + r.abstencion;
  if (emitidos === 0) return 'novota';
  const max = Math.max(r.si, r.no, r.abstencion);
  const ganadores = ['si', 'no', 'abstencion'].filter((k) => r[k] === max);
  if (ganadores.length > 1) return 'dividido';
  // Si la opción mayoritaria no llega al 75 % de los votos emitidos, se marca como dividido.
  if (max / emitidos < 0.75) return 'dividido';
  return ganadores[0];
}

/**
 * Elige, entre las votaciones oficiales de un día, la que corresponde a una ley de la lista de
 * El Congreso en tu mano. Puntúa por parecido de título, referencia normativa y coincidencia
 * exacta de totales. Devuelve { votacion, puntuacion } o null.
 */
export function emparejar(ley, votacionesDelDia) {
  const tLey = tokens(ley.tituloOficial);
  const refLey = referenciaNormativa(ley.tituloOficial);
  let mejor = null;
  for (const v of votacionesDelDia) {
    const info = v.informacion || {};
    const texto = `${info.textoExpediente || ''} ${info.tituloSubGrupo || ''}`;
    const tVot = tokens(info.textoExpediente);
    let comunes = 0;
    for (const t of tLey) if (tVot.has(t)) comunes += 1;
    const jaccard = comunes / Math.max(1, new Set([...tLey, ...tVot]).size);
    let p = jaccard * 10;
    const refVot = referenciaNormativa(info.textoExpediente);
    if (refLey && refVot === refLey) p += 6;
    else if (refLey && refVot && refVot !== refLey) p -= 6;
    const tot = v.totales || {};
    const lt = ley.totales || {};
    // (v.recuento se calcula al descargar; no interviene en la puntuación)
    if (tot.afavor === lt.si && tot.enContra === lt.no && tot.abstenciones === lt.abstencion) p += 8;
    // Las enmiendas sueltas rara vez son "la" votación de la ley.
    if (/enmienda/i.test(texto) && !/conjunto|dictamen/i.test(info.tituloSubGrupo || '')) p -= 2;
    if (!mejor || p > mejor.puntuacion) mejor = { votacion: v, puntuacion: p };
  }
  // Umbral: exige coincidencia clara (referencia normativa, totales o título muy parecido).
  if (!mejor || mejor.puntuacion < 7) return null;
  return mejor;
}

/**
 * Resultado a partir de los totales oficiales. Las votaciones de conjunto de leyes orgánicas
 * exigen mayoría absoluta (176 de 350, art. 81 CE). El asentimiento cuenta como aprobado.
 * Si la regla no es concluyente se usa el resultado indicado por la fuente secundaria.
 */
export function resultadoOficial(info, tot, respaldo) {
  if (tot.asentimiento === 'Sí') return true;
  const organica = /org[aá]nica/i.test(info.textoExpediente || '') &&
    /conjunto/i.test(`${info.tituloSubGrupo || ''} ${info.textoSubGrupo || ''}`);
  if (organica) return tot.afavor >= 176;
  if (tot.afavor !== tot.enContra) return tot.afavor > tot.enContra;
  return Boolean(respaldo);
}

/** Registro compacto que guarda la app para una ley. */
export function registroLey(ley, emparejada) {
  const base = {
    id: ley.id,
    fecha: ley.fecha,
    tipo: ley.tipo,
    // Único dato de elaboración propia de El Congreso en tu mano que usamos (CC BY 4.0, asignado con IA):
    tema: ley.categoria,
    fichaECETM: ley.urlApp,
  };
  if (!emparejada) {
    // Sin voto nominal oficial en datos abiertos (p. ej. Diputación Permanente):
    // se muestran los totales que publica El Congreso en tu mano, indicándolo en la app.
    const t = ley.totales || {};
    return {
      ...base,
      titulo: ley.tituloOficial,
      apartado: null,
      aprobada: Boolean(ley.aprobada),
      fuenteVotos: 'ecetm',
      oficial: null,
      totales: { si: t.si ?? 0, no: t.no ?? 0, abstencion: t.abstencion ?? 0, novota: t.ausente ?? 0, presentes: null, asentimiento: false },
      grupos: null,
    };
  }
  const v = emparejada.votacion;
  const info = v.informacion;
  const tot = v.totales;
  const rec = v.recuento ?? recuentoPorGrupo(v.votaciones);
  const grupos = Object.fromEntries(
    Object.entries(rec).map(([g, r]) => [g, { ...r, postura: postura(r) }]),
  );
  return {
    ...base,
    titulo: (info.textoExpediente || ley.tituloOficial).trim(),
    apartado: [info.tituloSubGrupo, info.textoSubGrupo].filter(Boolean).join(' · ') || null,
    aprobada: resultadoOficial(info, tot, ley.aprobada),
    fuenteVotos: 'congreso',
    oficial: {
      sesion: info.sesion,
      votacion: info.numeroVotacion,
      fecha: fechaIso(info.fecha),
      url: emparejada.votacion.url,
    },
    totales: {
      si: tot.afavor,
      no: tot.enContra,
      abstencion: tot.abstenciones,
      novota: tot.noVotan,
      presentes: tot.presentes,
      asentimiento: tot.asentimiento === 'Sí',
    },
    grupos,
  };
}
