import type { Dataset, DatosDiputados } from './tipos';

// Copias incluidas en la app (funcionan sin conexión). Se actualizan en cada versión.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const incluido: Dataset = require('../assets/dataset.json');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const diputadosIncluidos: DatosDiputados = require('../assets/diputados.json');

/**
 * URL del dataset actualizado, publicado por el propio repositorio en GitHub Pages.
 * La inyecta el workflow de compilación (EXPO_PUBLIC_DATA_URL). Sin ella, solo se usa la copia incluida.
 */
export const URL_DATOS = process.env.EXPO_PUBLIC_DATA_URL ?? '';
const URL_DIPUTADOS = URL_DATOS.replace(/dataset\.json$/, 'diputados.json');

export function datosIncluidos(): Dataset {
  return incluido;
}
export function diputadosLocales(): DatosDiputados {
  return diputadosIncluidos;
}

export function datasetValido(d: unknown): d is Dataset {
  const x = d as Dataset;
  return Boolean(x && x.version === 1 && Array.isArray(x.leyes) && Array.isArray(x.temas) && x.fuentes?.congreso && x.fuentes?.ecetm);
}

async function descargar(url: string): Promise<unknown | null> {
  if (!url) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const r = await fetch(url, { signal: ctrl.signal, cache: 'no-cache' });
    clearTimeout(t);
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

/** Descarga la versión más reciente; si falla o es más antigua, devuelve null. */
export async function datosActualizados(actual: Dataset): Promise<Dataset | null> {
  const d = await descargar(URL_DATOS);
  if (!datasetValido(d)) return null;
  return d.generado > actual.generado ? d : null;
}

export async function diputadosActualizados(actual: DatosDiputados): Promise<DatosDiputados | null> {
  const d = (await descargar(URL_DIPUTADOS)) as DatosDiputados | null;
  if (!d || d.version !== 1 || !Array.isArray(d.diputados)) return null;
  return d.generado > actual.generado ? d : null;
}
