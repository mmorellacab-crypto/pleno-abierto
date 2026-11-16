import type { Dataset, Ley, Postura } from './tipos';

export interface Filtros {
  texto: string;
  temas: string[]; // vacío = todos
  grupo: string | null; // código del grupo parlamentario (GS, GP...)
  posturas: Postura[]; // qué votó el grupo elegido; vacío = cualquiera
  resultado: 'todas' | 'aprobadas' | 'rechazadas';
}

export const FILTROS_INICIALES: Filtros = { texto: '', temas: [], grupo: null, posturas: [], resultado: 'todas' };

function sinTildes(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function posturaDe(ley: Ley, grupo: string): Postura | null {
  return ley.grupos?.[grupo]?.postura ?? null;
}

export function filtrar(leyes: Ley[], f: Filtros): Ley[] {
  const q = sinTildes(f.texto.trim());
  return leyes.filter((l) => {
    if (f.temas.length && !f.temas.includes(l.tema)) return false;
    if (f.resultado === 'aprobadas' && !l.aprobada) return false;
    if (f.resultado === 'rechazadas' && l.aprobada) return false;
    if (f.grupo && f.posturas.length) {
      const p = posturaDe(l, f.grupo);
      if (!p || !f.posturas.includes(p)) return false;
    }
    if (q && !sinTildes(`${l.titulo} ${l.apartado ?? ''}`).includes(q)) return false;
    return true;
  });
}

export function alternar<T>(lista: T[], valor: T): T[] {
  return lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor];
}

/** Para la pestaña Partidos: cómo votó un grupo en cada tema. */
export function resumenPorTema(datos: Dataset, grupo: string) {
  return datos.temas
    .map((t) => {
      const cuenta: Record<Postura, number> = { si: 0, no: 0, abstencion: 0, dividido: 0, novota: 0 };
      let total = 0;
      for (const l of datos.leyes) {
        if (l.tema !== t.id) continue;
        const p = posturaDe(l, grupo);
        if (!p) continue;
        cuenta[p] += 1;
        total += 1;
      }
      return { tema: t, cuenta, total };
    })
    .filter((r) => r.total > 0);
}

/** Porcentaje de leyes en que dos grupos tuvieron la misma postura (ambos con voto oficial). */
export function coincidencia(datos: Dataset, a: string, b: string): { pct: number; n: number } {
  let n = 0;
  let iguales = 0;
  for (const l of datos.leyes) {
    const pa = posturaDe(l, a);
    const pb = posturaDe(l, b);
    if (!pa || !pb || pa === 'novota' || pb === 'novota') continue;
    n += 1;
    if (pa === pb) iguales += 1;
  }
  return { pct: n ? Math.round((iguales / n) * 100) : 0, n };
}
