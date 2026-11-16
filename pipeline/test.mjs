// Tests del pipeline: node --test pipeline/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { emparejar, fechaCongreso, fechaIso, postura, recuentoPorGrupo, referenciaNormativa, registroLey, resultadoOficial } from './lib.mjs';

const fx = JSON.parse(readFileSync(new URL('./fixtures/votacion-oficial.json', import.meta.url)));
const dataset = JSON.parse(readFileSync(new URL('../docs/data/dataset.json', import.meta.url)));

test('fechas', () => {
  assert.equal(fechaIso('16/9/2026'), '2026-09-16');
  assert.equal(fechaCongreso('2026-09-16'), '16/09/2026');
});

test('referencia normativa', () => {
  assert.equal(referenciaNormativa('Real Decreto-ley 17/2026, de 23 de junio'), 'rdl 17/2026');
  assert.equal(referenciaNormativa('Convalidación del Real Decreto-ley 5/2025'), 'rdl 5/2025');
  assert.equal(referenciaNormativa('Proyecto de Ley de Movilidad Sostenible'), null);
});

test('el recuento por grupo suma exactamente los totales oficiales', () => {
  const r = recuentoPorGrupo(fx.data.votaciones);
  const suma = (k) => Object.values(r).reduce((s, g) => s + g[k], 0);
  assert.equal(suma('si'), fx.data.totales.afavor);
  assert.equal(suma('no'), fx.data.totales.enContra);
  assert.equal(suma('abstencion'), fx.data.totales.abstenciones);
  assert.equal(suma('novota'), fx.data.totales.noVotan);
});

test('postura del grupo', () => {
  assert.equal(postura({ si: 10, no: 0, abstencion: 0, novota: 1 }), 'si');
  assert.equal(postura({ si: 4, no: 4, abstencion: 1, novota: 0 }), 'dividido');
  assert.equal(postura({ si: 5, no: 2, abstencion: 0, novota: 0 }), 'dividido'); // 71 % < 75 %
  assert.equal(postura({ si: 0, no: 0, abstencion: 0, novota: 3 }), 'novota');
});

test('resultado: mayoría absoluta en votación de conjunto de ley orgánica', () => {
  const info = { textoExpediente: 'Proposición de Ley Orgánica X', tituloSubGrupo: 'Votación de conjunto.' };
  assert.equal(resultadoOficial(info, { afavor: 175, enContra: 30, asentimiento: 'No' }, true), false);
  assert.equal(resultadoOficial(info, { afavor: 176, enContra: 30, asentimiento: 'No' }, false), true);
  assert.equal(resultadoOficial({ textoExpediente: 'Ley X' }, { afavor: 167, enContra: 176, asentimiento: 'No' }, true), false);
});

test('emparejar elige la votación correcta y descarta las ajenas', () => {
  const oficial = { url: fx.url, informacion: fx.data.informacion, totales: fx.data.totales, recuento: recuentoPorGrupo(fx.data.votaciones) };
  const otra = {
    url: 'x',
    informacion: { textoExpediente: 'Real Decreto-ley 99/2026, de otra cosa', fecha: '16/9/2026' },
    totales: { afavor: 1, enContra: 2, abstenciones: 3 },
    recuento: {},
  };
  const ley = {
    id: 'pnl',
    tituloOficial: fx.data.informacion.textoExpediente,
    fecha: '2026-09-16',
    totales: { si: 170, no: 177, abstencion: 0 },
    categoria: 'migracion',
    urlApp: 'https://www.elcongresoentumano.es/ley/x',
  };
  const m = emparejar(ley, [otra, oficial]);
  assert.equal(m.votacion.url, fx.url);
  const reg = registroLey(ley, m);
  assert.equal(reg.fuenteVotos, 'congreso');
  assert.equal(reg.totales.si, 170);
  assert.equal(reg.aprobada, false);
  assert.equal(emparejar({ ...ley, tituloOficial: 'Ley de algo completamente distinto', totales: {} }, [otra]), null);
});

test('dataset publicado: coherente y con atribución', () => {
  assert.equal(dataset.version, 1);
  assert.equal(dataset.fuentes.ecetm.licencia, 'CC BY 4.0');
  assert.ok(dataset.fuentes.congreso.condiciones.includes('aviso-legal'));
  for (const l of dataset.leyes) {
    assert.ok(l.tema && l.titulo && l.fecha && l.fichaECETM, l.id);
    if (l.fuenteVotos === 'congreso') {
      assert.ok(l.oficial.url.startsWith('https://www.congreso.es/webpublica/opendata/votaciones/'), l.id);
      for (const k of ['si', 'no', 'abstencion', 'novota']) {
        const suma = Object.values(l.grupos).reduce((s, g) => s + g[k], 0);
        assert.equal(suma, l.totales[k], `${l.id} ${k}`);
      }
    }
  }
});
