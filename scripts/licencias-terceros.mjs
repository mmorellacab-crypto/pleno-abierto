#!/usr/bin/env node
// Genera LICENCIAS-TERCEROS.md con todas las dependencias de producción de la app y el texto
// de su licencia (requisito de MIT, BSD, Apache-2.0, etc.). Uso: cd app && npm run licencias
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(RAIZ, 'app');

const dirs = execSync('npm ls --omit=dev --all --parseable', { cwd: APP, maxBuffer: 64 * 1024 * 1024 })
  .toString()
  .split(/\r?\n/)
  .filter((d) => d && path.resolve(d) !== APP);
const paquetes = new Map();
for (const dir of dirs) {
  const f = path.join(dir, 'package.json');
  if (!existsSync(f)) continue;
  const pj = JSON.parse(readFileSync(f, 'utf8'));
  const clave = `${pj.name}@${pj.version}`;
  if (!paquetes.has(clave)) paquetes.set(clave, { nombre: pj.name, version: pj.version, dir });
}

const filas = [];
const textos = [];
const recuento = {};
for (const p of [...paquetes.values()].sort((a, b) => a.nombre.localeCompare(b.nombre))) {
  const pj = JSON.parse(readFileSync(path.join(p.dir, 'package.json'), 'utf8'));
  const lic = typeof pj.license === 'string' ? pj.license : pj.license?.type || (pj.licenses || []).map((l) => l.type).join(' OR ') || 'Desconocida';
  recuento[lic] = (recuento[lic] || 0) + 1;
  filas.push(`| ${p.nombre} | ${p.version} | ${lic} |`);
  const fichero = existsSync(p.dir) && readdirSync(p.dir).find((f) => /^(licen[cs]e|copying)(\.|$)/i.test(f));
  if (fichero) textos.push(`### ${p.nombre}@${p.version}\n\n\`\`\`\n${readFileSync(path.join(p.dir, fichero), 'utf8').trim()}\n\`\`\`\n`);
}

const md = `# Licencias de terceros

Componentes de software libre incluidos en la app Pleno Abierto (dependencias de producción).
Generado automáticamente con \`scripts/licencias-terceros.mjs\`.

Resumen: ${Object.entries(recuento).map(([l, n]) => `${l} (${n})`).join(', ')}.

| Paquete | Versión | Licencia |
|---|---|---|
${filas.join('\n')}

## Textos de las licencias

${textos.join('\n')}`;
writeFileSync(path.join(RAIZ, 'LICENCIAS-TERCEROS.md'), md);
console.log(`LICENCIAS-TERCEROS.md: ${paquetes.size} paquetes. ${JSON.stringify(recuento)}`);
