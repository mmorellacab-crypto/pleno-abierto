import type { Dataset, Postura } from '../tipos';
import { DIMENSIONES, DimId, PREGUNTAS, Pregunta } from './modelo';

/** Respuesta en escala -1…+1 (null = sin responder / prefiere no responder). */
export type Respuestas = Record<string, number | null>;

const VALOR_VOTO: Partial<Record<Postura, number>> = { si: 1, no: -1, abstencion: 0, dividido: 0 };

/**
 * Mínimo de leyes distintas para situar a los grupos en una dimensión. Con una sola ley no se
 * puede distinguir si un «No» significa rechazo de fondo o que la ley «se queda corta», y en
 * parlamentos como el español el voto refleja también la dinámica gobierno–oposición
 * (Hix y Noury, 2016).
 */
export const MIN_LEYES_DIMENSION = 2;

export function leyesDeDimension(dim: DimId, preguntas = PREGUNTAS): string[] {
  return [...new Set(preguntas.filter((p) => p.dim === dim).flatMap((p) => p.leyes.map((l) => l.id)))];
}

export function dimensionMedible(dim: DimId, preguntas = PREGUNTAS): boolean {
  return leyesDeDimension(dim, preguntas).length >= MIN_LEYES_DIMENSION;
}

/**
 * Posición de un grupo en una pregunta, en la misma escala de acuerdo que el usuario.
 * Se calcula SOLO con sus votos oficiales en las leyes vinculadas (estrategia de
 * escalado conjunto con votaciones reales; Bafumi y Herron, 2010).
 */
export function posicionGrupo(p: Pregunta, datos: Dataset, grupo: string): number | null {
  if (!dimensionMedible(p.dim)) return null;
  const valores: number[] = [];
  for (const enlace of p.leyes) {
    const ley = datos.leyes.find((l) => l.id === enlace.id);
    const postura = ley?.grupos?.[grupo]?.postura;
    const v = postura ? VALOR_VOTO[postura] : undefined;
    if (v === undefined) continue;
    valores.push(v * enlace.sentido);
  }
  if (!valores.length) return null;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

function media(xs: number[]): number | null {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

/** Puntuación de una dimensión (-1 polo negativo … +1 polo positivo). */
export function puntuacionUsuario(r: Respuestas, dim: DimId, preguntas = PREGUNTAS): { valor: number | null; n: number } {
  const xs = preguntas.filter((p) => p.dim === dim && r[p.id] != null).map((p) => (r[p.id] as number) * p.clave);
  return { valor: media(xs), n: xs.length };
}

export function puntuacionGrupo(datos: Dataset, grupo: string, dim: DimId, preguntas = PREGUNTAS): { valor: number | null; n: number } {
  const xs: number[] = [];
  for (const p of preguntas) {
    if (p.dim !== dim) continue;
    const pos = posicionGrupo(p, datos, grupo);
    if (pos != null) xs.push(pos * p.clave);
  }
  return { valor: media(xs), n: xs.length };
}

/**
 * Afinidad usuario–grupo: 100 × (1 − distancia media / 2), con distancia «city-block» por pregunta
 * (Louwerse y Rosema, 2014). Solo cuentan las preguntas que el usuario respondió y en las que el
 * grupo tiene votos en las leyes vinculadas.
 */
export function afinidad(r: Respuestas, datos: Dataset, grupo: string, preguntas = PREGUNTAS): { pct: number | null; n: number } {
  const d: number[] = [];
  for (const p of preguntas) {
    const u = r[p.id];
    if (u == null) continue;
    const g = posicionGrupo(p, datos, grupo);
    if (g == null) continue;
    d.push(Math.abs(u - g));
  }
  const m = media(d);
  return { pct: m == null ? null : Math.round(100 * (1 - m / 2)), n: d.length };
}

/**
 * Estimación izquierda–derecha en escala 1–10 (como la del CIS): combina las dimensiones que la
 * literatura asocia al significado de izquierda y derecha (economía, valores, autoridad,
 * inmigración y medio ambiente; Knutsen, 1995). El territorio se trata aparte.
 */
export function izquierdaDerecha(puntos: Partial<Record<DimId, number | null>>): number | null {
  const signo: Partial<Record<DimId, number>> = { eco: 1, soc: 1, aut: 1, inm: 1, amb: 1 };
  const xs = (Object.keys(signo) as DimId[]).filter((d) => puntos[d] != null).map((d) => (puntos[d] as number) * (signo[d] as number));
  const m = media(xs);
  if (m == null) return null;
  return Math.round((5.5 + 4.5 * m) * 10) / 10;
}

export function etiquetaIzqDer(v: number): string {
  if (v < 2.5) return 'Izquierda';
  if (v < 4.5) return 'Centro-izquierda';
  if (v <= 6.5) return 'Centro';
  if (v <= 8.5) return 'Centro-derecha';
  return 'Derecha';
}

export function etiquetaDimension(dim: DimId, v: number | null): string {
  const d = DIMENSIONES.find((x) => x.id === dim)!;
  if (v == null) return 'Sin datos suficientes';
  const a = Math.abs(v);
  if (a < 0.15) return 'Posición intermedia';
  const polo = v > 0 ? d.positivo : d.negativo;
  return `${a >= 0.5 ? 'Clara' : 'Ligera'} preferencia por «${polo.toLowerCase()}»`;
}

export interface Resultado {
  dimensiones: { id: DimId; usuario: number | null; n: number; grupos: Record<string, number | null> }[];
  izqDer: number | null;
  afinidades: { grupo: string; pct: number; n: number }[];
  respondidas: number;
  conLeyes: number;
}

export function calcular(r: Respuestas, datos: Dataset, preguntas = PREGUNTAS): Resultado {
  const grupos = Object.keys(datos.grupos);
  const dimensiones = DIMENSIONES.map((d) => {
    const u = puntuacionUsuario(r, d.id, preguntas);
    return {
      id: d.id,
      usuario: u.valor,
      n: u.n,
      grupos: Object.fromEntries(grupos.map((g) => [g, puntuacionGrupo(datos, g, d.id, preguntas).valor])),
    };
  });
  const puntos = Object.fromEntries(dimensiones.map((d) => [d.id, d.usuario])) as Record<DimId, number | null>;
  const afinidades = grupos
    .map((g) => ({ grupo: g, ...afinidad(r, datos, g, preguntas) }))
    .filter((a): a is { grupo: string; pct: number; n: number } => a.pct != null)
    .sort((a, b) => b.pct - a.pct);
  return {
    dimensiones,
    izqDer: izquierdaDerecha(puntos),
    afinidades,
    respondidas: preguntas.filter((p) => r[p.id] != null).length,
    conLeyes: preguntas.filter((p) => r[p.id] != null && p.leyes.length > 0).length,
  };
}

/** Valores de respuesta para cada tipo de pregunta (de la primera a la última opción). */
export function valoresRespuesta(p: Pregunta): number[] {
  if (p.tipo === 'par') return [-1, -0.5, 0, 0.5, 1];
  if (p.tipo === 'opciones') return (p.opciones ?? []).map((_, i, a) => (a.length === 1 ? 0 : -1 + (2 * i) / (a.length - 1)));
  return [-1, -0.5, 0, 0.5, 1];
}
