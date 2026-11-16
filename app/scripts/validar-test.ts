// Comprueba la coherencia del banco de preguntas y del cálculo. Uso: npm run validar-test
import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { DIMENSIONES, PREGUNTAS, REFERENCIAS } from '../src/test/modelo';
import { afinidad, calcular, posicionGrupo } from '../src/test/calculo';
import type { Dataset } from '../src/tipos';

const datos: Dataset = JSON.parse(readFileSync(path.join(__dirname, '../../assets/dataset.json'), 'utf8'));

assert.equal(PREGUNTAS.length, 40, 'Debe haber 40 preguntas');
assert.equal(new Set(PREGUNTAS.map((p) => p.id)).size, 40, 'Identificadores únicos');
const refs = new Set(REFERENCIAS.map((r) => r.id));
for (const p of PREGUNTAS) {
  for (const f of p.fuentes) assert.ok(refs.has(f), `${p.id}: fuente desconocida ${f}`);
  for (const l of p.leyes) {
    const ley = datos.leyes.find((x) => x.id === l.id);
    assert.ok(ley, `${p.id}: ley no encontrada ${l.id}`);
    assert.ok(ley!.grupos, `${p.id}: la ley ${l.id} no tiene voto por grupo`);
  }
  if (p.tipo !== 'likert') assert.ok(p.opciones && p.opciones.length >= 2, `${p.id}: faltan opciones`);
}
for (const d of DIMENSIONES) {
  const ps = PREGUNTAS.filter((p) => p.dim === d.id);
  assert.ok(ps.length >= 6, `${d.id}: pocas preguntas`);
  console.log(`${d.nombre}: ${ps.length} preguntas, ${ps.filter((p) => p.leyes.length).length} con leyes, claves +${ps.filter((p) => p.clave === 1).length}/-${ps.filter((p) => p.clave === -1).length}`);
}

// Un usuario que responde siempre lo mismo que un grupo tiene 100 % de afinidad con él.
for (const g of Object.keys(datos.grupos)) {
  const r: Record<string, number | null> = {};
  for (const p of PREGUNTAS) r[p.id] = posicionGrupo(p, datos, g);
  const a = afinidad(r, datos, g);
  if (a.pct != null) assert.equal(a.pct, 100, `${g}: autoafinidad`);
}

// Neutralidad: todo «neutral» no debe dar a ningún grupo ventaja artificial grande y la posición es centro.
const neutro = Object.fromEntries(PREGUNTAS.map((p) => [p.id, 0]));
const rn = calcular(neutro, datos);
assert.equal(rn.izqDer, 5.5);

// Validez aparente: un perfil claramente de izquierda/derecha debe coincidir más con los grupos
// cuyos votos lo están (sin imponerlo: solo se comprueba el resultado del cálculo).
const perfil = (signo: number) =>
  Object.fromEntries(PREGUNTAS.map((p) => [p.id, p.dim === 'ter' || p.dim === 'aut' ? 0 : signo * p.clave])) as Record<string, number>;
const izq = calcular(perfil(-1), datos);
const der = calcular(perfil(1), datos);
console.log('\nPerfil izquierda →', izq.izqDer, izq.afinidades.slice(0, 3).map((a) => `${datos.grupos[a.grupo].corto} ${a.pct}%`).join(', '));
console.log('Perfil derecha   →', der.izqDer, der.afinidades.slice(0, 3).map((a) => `${datos.grupos[a.grupo].corto} ${a.pct}%`).join(', '));
assert.ok(izq.izqDer! < 3 && der.izqDer! > 8);
assert.ok(['GVOX', 'GP'].includes(der.afinidades[0].grupo));

const res = calcular({}, datos);
console.log('\nPosición de cada grupo por dimensión (solo votos en leyes vinculadas):');
for (const d of res.dimensiones) {
  console.log(`  ${d.id}: ` + Object.entries(d.grupos).map(([g, v]) => `${datos.grupos[g].corto} ${v == null ? '—' : v.toFixed(2)}`).join(' · '));
}
console.log('\nOK: banco de 40 preguntas y cálculo coherentes.');
