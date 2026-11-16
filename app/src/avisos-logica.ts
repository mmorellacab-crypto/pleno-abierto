import type { Dataset } from './tipos';

export interface EstadoAvisos {
  proximas: string[]; // ids ya avisados como «se va a votar»
  leyes: string[]; // ids de resultados ya conocidos
}

export interface Aviso {
  titulo: string;
  cuerpo: string;
  leyId: string | null;
}

function corto(t: string, n = 110) {
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

/**
 * Compara los datos nuevos con lo ya avisado y devuelve los avisos pendientes.
 * La primera vez (estado vacío) no avisa de nada: solo memoriza lo existente.
 */
export function calcularAvisos(datos: Dataset, estado: EstadoAvisos | null): { avisos: Aviso[]; estado: EstadoAvisos } {
  const proximas = (datos.proximas ?? []).filter((p) => p.estado === 'prevista' || p.estado === 'pendiente');
  const nuevo: EstadoAvisos = { proximas: proximas.map((p) => p.id), leyes: datos.leyes.map((l) => l.id) };
  if (!estado) return { avisos: [], estado: nuevo };
  const avisos: Aviso[] = [];
  for (const p of proximas) {
    if (estado.proximas.includes(p.id)) continue;
    avisos.push({ titulo: `🗳️ Se votará el ${p.fecha.split('-').reverse().join('/')}`, cuerpo: corto(p.titulo), leyId: null });
  }
  for (const l of datos.leyes) {
    if (estado.leyes.includes(l.id)) continue;
    const t = l.totales;
    avisos.push({
      titulo: `${l.aprobada ? '✅ Aprobada' : '❌ Rechazada'}: resultado de la votación`,
      cuerpo: `${corto(l.titulo, 90)} · Sí ${t.si} · No ${t.no} · Abst. ${t.abstencion}`,
      leyId: l.id,
    });
  }
  return { avisos: avisos.slice(0, 5), estado: nuevo };
}
