import { Platform } from 'react-native';
import type { Postura } from './tipos';

// ── Identidad visual de Pleno Abierto ──────────────────────────────────────
// Banda superior índigo profundo, fondo lavanda muy claro, tarjetas blancas con radio amplio,
// titulares con tipografía serif y etiquetas en minúscula (sin versalitas).
export const UI = {
  marca: '#1E1B4B', // índigo profundo
  marca2: '#312E81',
  marcaSuave: '#E0E7FF',
  acento: '#4F46E5',
  fondo: '#F4F4FB',
  superficie: '#FFFFFF',
  texto: '#14132B',
  texto2: '#4B4A68',
  texto3: '#7B7A96',
  linea: '#E4E4F0',
  sobreMarca: '#FFFFFF',
  sobreMarca2: '#C7C9F5',
  radio: 18,
  radioChip: 10,
};

export const SERIF = Platform.select({ android: 'serif', ios: 'Georgia', default: 'Georgia, "Times New Roman", serif' });

// Colores del voto: polos azul/rojo (distinguibles con daltonismo), amarillo para la abstención
// y grises para «dividido» y «no vota». Siempre acompañados de texto e icono.
export const VOTO: Record<Postura, { color: string; texto: string; icono: string; tinta: string }> = {
  si: { color: '#2a78d6', texto: 'Sí', icono: '✓', tinta: '#ffffff' },
  no: { color: '#e34948', texto: 'No', icono: '✕', tinta: '#ffffff' },
  abstencion: { color: '#eda100', texto: 'Abstención', icono: '○', tinta: '#14132B' },
  dividido: { color: '#8a8984', texto: 'Dividido', icono: '±', tinta: '#ffffff' },
  novota: { color: '#d6d5d0', texto: 'No vota', icono: '–', tinta: '#4B4A68' },
};

// Colores identitarios de cada partido (los que usan sus propias marcas y los medios),
// asignados a su grupo parlamentario. Siempre aparecen junto al nombre del grupo.
export const PARTIDO: Record<string, { color: string; tinta: string }> = {
  GS: { color: '#E30613', tinta: '#ffffff' }, // PSOE
  GP: { color: '#1D84CE', tinta: '#ffffff' }, // PP
  GVOX: { color: '#63BE21', tinta: '#14132B' }, // VOX
  GSUMAR: { color: '#E51C55', tinta: '#ffffff' }, // Sumar
  GR: { color: '#FFB232', tinta: '#14132B' }, // ERC
  GJxCAT: { color: '#00C3B2', tinta: '#14132B' }, // Junts
  'GEH Bildu': { color: '#A4C400', tinta: '#14132B' }, // EH Bildu
  'GV (EAJ-PNV)': { color: '#008135', tinta: '#ffffff' }, // PNV
  GMx: { color: '#8C8C99', tinta: '#ffffff' }, // Mixto (varios partidos)
};
export const PARTIDO_DESCONOCIDO = { color: '#8C8C99', tinta: '#ffffff' };
export const colorPartido = (cod: string) => PARTIDO[cod] ?? PARTIDO_DESCONOCIDO;

// Cada tema lleva icono + nombre siempre visibles; el color es un apoyo, nunca el único código.
export const TEMAS: Record<string, { icono: string; fondo: string; borde: string }> = {
  vivienda: { icono: '🏠', fondo: '#FFE8DC', borde: '#E8692E' },
  trabajo: { icono: '💼', fondo: '#E2ECFF', borde: '#3A6FD8' },
  fiscalidad: { icono: '💶', fondo: '#FFF2CC', borde: '#B98400' },
  sanidad: { icono: '🩺', fondo: '#D9F5EA', borde: '#15A06E' },
  educacion: { icono: '🎓', fondo: '#ECE7FF', borde: '#6A4FD8' },
  derechos: { icono: '⚖️', fondo: '#FFE3EE', borde: '#C9437A' },
  justicia: { icono: '🏛️', fondo: '#ECECF2', borde: '#55546E' },
  medioambiente: { icono: '🌿', fondo: '#E1F4D9', borde: '#3A8A1F' },
  economia: { icono: '📈', fondo: '#DCEBFA', borde: '#1C5A9C' },
  institucional: { icono: '🗳️', fondo: '#EEE6F7', borde: '#7A5CA8' },
  pensiones: { icono: '👵', fondo: '#F8E7D8', borde: '#A35A1F' },
  migracion: { icono: '🧭', fondo: '#DDF3F5', borde: '#13838F' },
};
export const TEMA_DESCONOCIDO = { icono: '📄', fondo: '#EFEFF5', borde: '#8C8C99' };

export function fechaCorta(iso: string): string {
  const [a, m, d] = iso.split('-');
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]} ${a}`;
}
