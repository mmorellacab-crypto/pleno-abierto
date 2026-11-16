import type { Postura } from './tipos';

// Colores del voto: azul/rojo como polos (distinguibles con daltonismo), amarillo para la
// abstención y gris neutro para "no vota". Siempre van acompañados de texto o icono.
export const VOTO: Record<Postura, { color: string; texto: string; icono: string; tinta: string }> = {
  si: { color: '#2a78d6', texto: 'Sí', icono: '✓', tinta: '#ffffff' },
  no: { color: '#e34948', texto: 'No', icono: '✕', tinta: '#ffffff' },
  abstencion: { color: '#eda100', texto: 'Abstención', icono: '○', tinta: '#0b0b0b' },
  dividido: { color: '#8a8984', texto: 'Dividido', icono: '±', tinta: '#ffffff' },
  novota: { color: '#d6d5d0', texto: 'No vota', icono: '–', tinta: '#52514e' },
};

// Cada tema lleva icono + nombre siempre visibles; el color es un apoyo, nunca el único código.
export const TEMAS: Record<string, { icono: string; fondo: string; borde: string }> = {
  vivienda: { icono: '🏠', fondo: '#fde7dc', borde: '#eb6834' },
  trabajo: { icono: '💼', fondo: '#dbe9fa', borde: '#2a78d6' },
  fiscalidad: { icono: '💶', fondo: '#fdf0cf', borde: '#c98500' },
  sanidad: { icono: '🩺', fondo: '#d6f3e8', borde: '#1baf7a' },
  educacion: { icono: '🎓', fondo: '#e6e2fa', borde: '#6250d6' },
  derechos: { icono: '⚖️', fondo: '#fbe1eb', borde: '#d55181' },
  justicia: { icono: '🏛️', fondo: '#e8e7e3', borde: '#52514e' },
  medioambiente: { icono: '🌿', fondo: '#d9f0d9', borde: '#008300' },
  economia: { icono: '📈', fondo: '#d7e6f6', borde: '#184f95' },
  institucional: { icono: '🗳️', fondo: '#ece6f4', borde: '#7a5ca8' },
  pensiones: { icono: '👵', fondo: '#f6e3d3', borde: '#a35a1f' },
  migracion: { icono: '🧭', fondo: '#dcf1f3', borde: '#13838f' },
};
export const TEMA_DESCONOCIDO = { icono: '📄', fondo: '#efeeea', borde: '#8a8984' };

export const UI = {
  fondo: '#f6f5f2',
  superficie: '#fcfcfb',
  texto: '#0b0b0b',
  texto2: '#52514e',
  texto3: '#7c7b76',
  linea: '#e3e2dd',
  acento: '#1c5cab',
  radio: 12,
};

export function fechaCorta(iso: string): string {
  const [a, m, d] = iso.split('-');
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]} ${a}`;
}
