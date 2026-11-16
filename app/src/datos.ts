import type { Dataset } from './tipos';

// Copia incluida en la app (funciona sin conexión). Se actualiza en cada versión.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const incluido: Dataset = require('../assets/dataset.json');

/**
 * URL del dataset actualizado, publicado por el propio repositorio en GitHub Pages.
 * La inyecta el workflow de compilación (EXPO_PUBLIC_DATA_URL). Sin ella, solo se usa la copia incluida.
 */
const URL_DATOS = process.env.EXPO_PUBLIC_DATA_URL ?? '';

export function datosIncluidos(): Dataset {
  return incluido;
}

function valido(d: unknown): d is Dataset {
  const x = d as Dataset;
  return Boolean(x && x.version === 1 && Array.isArray(x.leyes) && Array.isArray(x.temas) && x.fuentes?.congreso && x.fuentes?.ecetm);
}

/** Descarga la versión más reciente; si falla o es más antigua, devuelve null. */
export async function datosActualizados(actual: Dataset): Promise<Dataset | null> {
  if (!URL_DATOS) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    const r = await fetch(URL_DATOS, { signal: ctrl.signal, cache: 'no-cache' });
    clearTimeout(t);
    if (!r.ok) return null;
    const d: unknown = await r.json();
    if (!valido(d)) return null;
    return d.generado > actual.generado ? d : null;
  } catch {
    return null;
  }
}
