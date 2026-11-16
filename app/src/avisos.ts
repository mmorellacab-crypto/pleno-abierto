// Versión web: sin notificaciones.
export const avisosDisponibles = false;
export async function activarAvisos(): Promise<'ok' | 'denegado' | 'no-disponible'> {
  return 'no-disponible';
}
export async function desactivarAvisos(): Promise<void> {}
export function alAbrirAviso(_f: (leyId: string | null) => void): () => void {
  return () => {};
}
