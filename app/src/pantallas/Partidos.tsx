import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChipPartido, ChipTema, Titulo } from '../componentes';
import { SERIF, UI, VOTO, colorPartido } from '../estilo';
import { coincidencia, resumenPorTema } from '../filtros';
import type { Dataset, Postura } from '../tipos';

const ORDEN: Postura[] = ['si', 'abstencion', 'dividido', 'no', 'novota'];

export default function Partidos({ datos }: { datos: Dataset }) {
  const codigos = Object.keys(datos.grupos);
  const [grupo, setGrupo] = useState(codigos[0]);
  const filas = useMemo(() => resumenPorTema(datos, grupo), [datos, grupo]);
  const afinidad = useMemo(
    () =>
      codigos
        .filter((c) => c !== grupo)
        .map((c) => ({ c, ...coincidencia(datos, grupo, c) }))
        .sort((a, b) => b.pct - a.pct),
    [datos, grupo],
  );
  const c = colorPartido(grupo);

  return (
    <ScrollView contentContainerStyle={s.cont}>
      <View style={s.fila}>
        {codigos.map((cod) => (
          <ChipPartido key={cod} cod={cod} nombre={datos.grupos[cod].corto} activo={grupo === cod} onPress={() => setGrupo(cod)} />
        ))}
      </View>

      <View style={[s.ficha, { backgroundColor: c.color }]}>
        <Text style={[s.fichaCorto, { color: c.tinta }]}>{datos.grupos[grupo].corto}</Text>
        <Text style={[s.fichaLargo, { color: c.tinta }]}>{datos.grupos[grupo].nombre}</Text>
      </View>

      <View style={s.caja}>
        <Titulo tam={17}>Cómo votó en cada tipo de ley</Titulo>
        <View style={s.leyenda}>
          {ORDEN.slice(0, 4).map((p) => (
            <View key={p} style={s.ley}>
              <View style={[s.punto, { backgroundColor: VOTO[p].color }]} />
              <Text style={s.leyTxt}>{VOTO[p].texto}</Text>
            </View>
          ))}
        </View>
        {filas.map(({ tema, cuenta, total }) => (
          <View key={tema.id} style={s.tema}>
            <View style={s.temaCab}>
              <ChipTema id={tema.id} nombre={tema.nombre} pequeño />
              <Text style={s.n}>
                {total} {total === 1 ? 'ley' : 'leyes'}
              </Text>
            </View>
            <View style={s.barra}>
              {ORDEN.filter((p) => cuenta[p] > 0).map((p) => (
                <View key={p} style={{ flex: cuenta[p], backgroundColor: VOTO[p].color, borderRadius: 5, justifyContent: 'center' }}>
                  {cuenta[p] / total >= 0.15 ? <Text style={[s.num, { color: VOTO[p].tinta }]}>{cuenta[p]}</Text> : null}
                </View>
              ))}
            </View>
          </View>
        ))}
        <Text style={s.nota}>Solo cuentan las leyes con voto nominal oficial publicado por el Congreso.</Text>
      </View>

      <View style={s.caja}>
        <Titulo tam={17}>Con quién coincide</Titulo>
        {afinidad.map(({ c: otro, pct, n }) => (
          <View key={otro} style={s.af}>
            <Text style={s.afNombre}>{datos.grupos[otro].corto}</Text>
            <View style={s.afPista}>
              <View style={[s.afBarra, { width: `${pct}%`, backgroundColor: colorPartido(otro).color }]} />
            </View>
            <Text style={s.afPct}>{pct} %</Text>
            <Text style={s.afN}>({n})</Text>
          </View>
        ))}
        <Text style={s.nota}>Porcentaje de leyes en que ambos grupos tuvieron la misma postura mayoritaria.</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  cont: { padding: 16, paddingBottom: 48, gap: 12 },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ficha: { borderRadius: UI.radio, padding: 16 },
  fichaCorto: { fontFamily: SERIF, fontSize: 28, fontWeight: '700' },
  fichaLargo: { fontSize: 14, opacity: 0.9 },
  leyenda: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  ley: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  leyTxt: { color: UI.texto2, fontSize: 13 },
  punto: { width: 10, height: 10, borderRadius: 5 },
  caja: { backgroundColor: UI.superficie, borderRadius: UI.radio, padding: 16, gap: 10 },
  tema: { gap: 5 },
  temaCab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  n: { color: UI.texto3, fontSize: 12 },
  barra: { flexDirection: 'row', gap: 2, height: 20 },
  num: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  nota: { color: UI.texto3, fontSize: 12 },
  af: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  afNombre: { width: 70, fontSize: 14, color: UI.texto, fontWeight: '600' },
  afPista: { flex: 1, height: 12, backgroundColor: '#EFEFF6', borderRadius: 6, overflow: 'hidden' },
  afBarra: { height: 12, borderRadius: 6 },
  afPct: { width: 44, textAlign: 'right', fontSize: 13, color: UI.texto, fontWeight: '700' },
  afN: { width: 34, fontSize: 11, color: UI.texto3 },
});
