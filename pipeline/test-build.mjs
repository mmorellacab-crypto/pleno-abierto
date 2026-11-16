// Prueba de humo del pipeline completo con la red simulada: node --test pipeline/test-build.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const fx = JSON.parse(readFileSync(new URL('./fixtures/votacion-oficial.json', import.meta.url)));
const rel = new URL(fx.url).pathname;

test('build.mjs genera un dataset válido', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'pleno-'));
  process.env.PLENO_CACHE = path.join(dir, 'cache');
  process.env.PLENO_SALIDA = path.join(dir, 'dataset.json');
  process.env.PLENO_PAUSA_MS = '0';
  process.env.PLENO_SIN_DIPUTADOS = '1';
  const ley = {
    id: 'pnl-x', tituloOficial: fx.data.informacion.textoExpediente, tipo: 'Proposiciones no de Ley', categoria: 'migracion',
    fecha: '2026-09-16', aprobada: false, totales: { si: 170, no: 177, abstencion: 0, ausente: 3 }, urlApp: 'https://www.elcongresoentumano.es/ley/pnl-x',
  };
  const html = `<script>var diasVotaciones = [20260915, 20260916]</script><p>Si: 170</p><p>No: 177</p><p>Abstenciones: 0</p><a href="${rel}">JSON</a>`;
  globalThis.fetch = async (url) => {
    const u = String(url);
    const json = (b) => ({ ok: true, status: 200, json: async () => b, text: async () => JSON.stringify(b) });
    if (u.endsWith('/health')) return json({ legislatura: 'XV', version: '2026-11-12' });
    if (u.includes('/proximas')) return json({ items: [] });
    if (u.endsWith('/categorias')) return json({ categorias: [{ id: 'migracion', label: 'Migración' }] });
    if (u.includes('/votaciones?limit=')) return json({ total: 1, items: [ley] });
    if (u.includes('/es/opendata/votaciones?')) return { ok: true, status: 200, text: async () => html };
    if (u.endsWith('.json')) return json(fx.data);
    throw new Error('URL inesperada ' + u);
  };
  const { main } = await import('./build.mjs');
  await main();
  const d = JSON.parse(readFileSync(process.env.PLENO_SALIDA, 'utf8'));
  assert.equal(d.leyes.length, 1);
  assert.equal(d.leyes[0].fuenteVotos, 'congreso');
  assert.equal(d.leyes[0].oficial.url, fx.url);
  assert.equal(d.legislatura, 'XV');
  assert.ok(readFileSync(path.join(process.env.PLENO_CACHE, '2026-09-16.json'), 'utf8').includes(fx.url));
});
