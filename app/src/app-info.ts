// Datos de la app. El workflow de compilación rellena las URL con el repositorio real
// (EXPO_PUBLIC_REPO_URL y EXPO_PUBLIC_PAGES_URL).
const repo = process.env.EXPO_PUBLIC_REPO_URL || 'https://github.com/';
const pages = process.env.EXPO_PUBLIC_PAGES_URL || '';

export const APP = {
  nombre: 'Pleno Abierto',
  version: '1.0.0',
  licencia: 'GPL-3.0',
  repositorio: repo,
  privacidad: pages ? `${pages}/privacidad.html` : `${repo}`,
};
