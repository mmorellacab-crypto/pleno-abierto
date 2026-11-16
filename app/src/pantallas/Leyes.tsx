import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BarraVotos, Boton, ChipTema, Etiqueta, Resultado } from '../componentes';
import { TEMAS, TEMA_DESCONOCIDO, UI, VOTO, fechaCorta } from '../estilo';
import { FILTROS_INICIALES, Filtros, alternar, filtrar } from '../filtros';
import type { Dataset, Ley, Postura } from '../tipos';

const POSTURAS: Postura[] = ['si', 'no', 'abstencion', 'dividido'];

export default function Leyes({ datos, abrir }: { datos: Dataset; abrir: (l: Ley) => void }) {
  const [f, setF] = useState<Filtros>(FILTROS_INICIALES);
  const [verFiltros, setVerFiltros] = useState(true);
  const lista = useMemo(() => filtrar(datos.leyes, f), [datos, f]);
  const nombreTema = useMemo(() => Object.fromEntries(datos.temas.map((t) => [t.id, t.nombre])), [datos]);
  const grupos = Object.entries(datos.grupos);
  const hayFiltros = f.temas.length || f.grupo || f.resultado !== 'todas' || f.texto;

  const cabecera = (
    <View style={s.cab}>
      <TextInput
        value={f.texto}
        onChangeText={(texto) => setF({ ...f, texto })}
        placeholder="Buscar en el título oficial…"
        placeholderTextColor={UI.texto3}
        style={s.buscar}
        accessibilityLabel="Buscar leyes"
      />
      <Pressable onPress={() => setVerFiltros(!verFiltros)} style={s.plegar} accessibilityRole="button">
        <Text style={s.plegarTxt}>{verFiltros ? '▾ Ocultar filtros' : '▸ Mostrar filtros'}</Text>
        {hayFiltros ? (
          <Pressable onPress={() => setF(FILTROS_INICIALES)} accessibilityRole="button">
            <Text style={s.limpiar}>Quitar filtros</Text>
          </Pressable>
        ) : null}
      </Pressable>

      {verFiltros && (
        <>
          <Text style={s.titulo}>Tema</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.fila}>
            {datos.temas.map((t) => (
              <ChipTema
                key={t.id}
                id={t.id}
                nombre={t.nombre}
                activo={f.temas.length ? f.temas.includes(t.id) : undefined}
                onPress={() => setF({ ...f, temas: alternar(f.temas, t.id) })}
              />
            ))}
          </ScrollView>

          <Text style={s.titulo}>Partido (grupo parlamentario)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.fila}>
            {grupos.map(([cod, g]) => (
              <Boton
                key={cod}
                texto={g.corto}
                activo={f.grupo === cod}
                onPress={() => setF({ ...f, grupo: f.grupo === cod ? null : cod, posturas: [] })}
              />
            ))}
          </ScrollView>

          {f.grupo && (
            <>
              <Text style={s.titulo}>Qué votó {datos.grupos[f.grupo].corto}</Text>
              <View style={[s.fila, s.envolver]}>
                {POSTURAS.map((p) => {
                  const on = f.posturas.includes(p);
                  return (
                    <Pressable
                      key={p}
                      onPress={() => setF({ ...f, posturas: alternar(f.posturas, p) })}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      style={[s.voto, { borderColor: VOTO[p].color, backgroundColor: on ? VOTO[p].color : UI.superficie }]}
                    >
                      <Text style={[s.votoTxt, { color: on ? VOTO[p].tinta : UI.texto }]}>
                        {VOTO[p].icono} {VOTO[p].texto}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          <Text style={s.titulo}>Resultado</Text>
          <View style={[s.fila, s.envolver]}>
            {(['todas', 'aprobadas', 'rechazadas'] as const).map((r) => (
              <Boton key={r} texto={r[0].toUpperCase() + r.slice(1)} activo={f.resultado === r} onPress={() => setF({ ...f, resultado: r })} />
            ))}
          </View>
        </>
      )}
      <Text style={s.cuenta}>
        {lista.length} de {datos.leyes.length} leyes y decretos
      </Text>
    </View>
  );

  return (
    <FlatList
      data={lista}
      keyExtractor={(l) => l.id}
      ListHeaderComponent={cabecera}
      contentContainerStyle={s.lista}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={<Text style={s.vacio}>Ninguna ley cumple estos filtros.</Text>}
      renderItem={({ item }) => (
        <Tarjeta ley={item} nombreTema={nombreTema[item.tema] ?? item.tema} grupos={datos.grupos} grupoSel={f.grupo} onPress={() => abrir(item)} />
      )}
    />
  );
}

function Tarjeta({
  ley,
  nombreTema,
  grupos,
  grupoSel,
  onPress,
}: {
  ley: Ley;
  nombreTema: string;
  grupos: Dataset['grupos'];
  grupoSel: string | null;
  onPress: () => void;
}) {
  const m = TEMAS[ley.tema] ?? TEMA_DESCONOCIDO;
  const posturaSel = grupoSel ? ley.grupos?.[grupoSel]?.postura : null;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.tarjeta, { borderLeftColor: m.borde }, pressed && { opacity: 0.85 }]} accessibilityRole="button">
      <View style={s.meta}>
        <ChipTema id={ley.tema} nombre={nombreTema} pequeño />
        <Text style={s.fecha}>{fechaCorta(ley.fecha)}</Text>
        <View style={{ flex: 1 }} />
        <Resultado aprobada={ley.aprobada} />
      </View>
      <Text style={s.tTitulo} numberOfLines={3}>
        {ley.titulo}
      </Text>
      {grupoSel && (
        <View style={s.sel}>
          <Text style={s.selTxt}>{grupos[grupoSel].corto} votó</Text>
          {posturaSel ? <Etiqueta postura={posturaSel} grande /> : <Text style={s.selSin}>sin voto nominal publicado</Text>}
        </View>
      )}
      <View style={{ marginTop: 10 }}>
        <BarraVotos t={ley.totales} />
      </View>
      {ley.grupos ? (
        <View style={s.grupos}>
          {Object.entries(grupos).map(([cod, g]) => {
            const p = ley.grupos?.[cod]?.postura;
            if (!p) return null;
            return (
              <View key={cod} style={[s.gPill, { backgroundColor: VOTO[p].color }, grupoSel && grupoSel !== cod && { opacity: 0.35 }]}>
                <Text style={[s.gPillTxt, { color: VOTO[p].tinta }]}>
                  {VOTO[p].icono} {g.corto}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={s.aviso}>Sin voto por grupo: el Congreso no publica voto nominal de esta votación en datos abiertos.</Text>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  lista: { padding: 14, paddingBottom: 40, gap: 12 },
  cab: { gap: 8, marginBottom: 4 },
  buscar: {
    backgroundColor: UI.superficie,
    borderRadius: UI.radio,
    borderWidth: 1,
    borderColor: UI.linea,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: UI.texto,
  },
  plegar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  plegarTxt: { color: UI.acento, fontWeight: '600' },
  limpiar: { color: UI.texto2, textDecorationLine: 'underline' },
  titulo: { fontSize: 13, fontWeight: '700', color: UI.texto2, marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  fila: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  envolver: { flexWrap: 'wrap' },
  voto: { borderWidth: 2, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  votoTxt: { fontWeight: '600', fontSize: 14 },
  cuenta: { color: UI.texto3, marginTop: 8, fontSize: 13 },
  vacio: { textAlign: 'center', color: UI.texto2, marginTop: 30 },
  tarjeta: {
    backgroundColor: UI.superficie,
    borderRadius: UI.radio,
    padding: 14,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fecha: { color: UI.texto3, fontSize: 12 },
  tTitulo: { fontSize: 15, lineHeight: 21, color: UI.texto, marginTop: 8, fontWeight: '500' },
  sel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  selTxt: { color: UI.texto2, fontWeight: '600' },
  selSin: { color: UI.texto3, fontStyle: 'italic' },
  grupos: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 10 },
  gPill: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  gPillTxt: { fontSize: 11, fontWeight: '700' },
  aviso: { color: UI.texto3, fontSize: 12, marginTop: 8, fontStyle: 'italic' },
});
