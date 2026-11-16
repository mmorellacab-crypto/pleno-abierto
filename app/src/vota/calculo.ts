import type { Dataset, Postura } from '../tipos';

export type VotoUsuario = 'si' | 'no' | 'abstencion' | null;

/** Coincidencia entre dos votos: igual = 1; Sí frente a No = 0; con abstención o grupo dividido = 0,5. */
export function coincide(a: VotoUsuario, b: Postura | undefined): number | null {
  if (!a || !b || b === 'novota') return null;
  if (b === 'dividido') return 0.5;
  if (a === b) return 1;
  if (a === 'abstencion' || b === 'abstencion') return 0.5;
  return 0;
}

export function afinidadVotos(votos: Record<string, VotoUsuario>, datos: Dataset) {
  return Object.keys(datos.grupos)
    .map((g) => {
      const xs: number[] = [];
      for (const [id, v] of Object.entries(votos)) {
        const ley = datos.leyes.find((l) => l.id === id);
        const c = coincide(v, ley?.grupos?.[g]?.postura);
        if (c != null) xs.push(c);
      }
      return { grupo: g, pct: xs.length ? Math.round((100 * xs.reduce((a, b) => a + b, 0)) / xs.length) : -1, n: xs.length };
    })
    .filter((a) => a.pct >= 0)
    .sort((a, b) => b.pct - a.pct);
}
