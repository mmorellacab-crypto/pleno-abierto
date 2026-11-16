import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BarraVotos, Boton, ChipPartido, ChipTema, Etiqueta, Resultado, Seccion } from '../componentes';
import { SERIF, TEMAS, TEMA_DESCONOCIDO, UI, VOTO, colorPartido, fechaCorta } from '../estilo';
import { FILTROS_INICIALES, Filtros, alternar, filtrar } from '../filtros';
import type { Dataset, Ley, Postura } from '../tipos';

const POSTURAS: Postura[] = ['si', 'no', 'abstencion', 'dividido'];

export default function Leyes({ datos, abrir, verProximas }: { datos: Dataset; abrir: (l: Ley) => void; verProximas: () => void }) {
  const [f, setF] = useState<Filtros>(FILTROS_INICIALES);
  const [verFiltros, setVerFiltros] = useState(true);
  const lista = useMemo(() => filtrar(datos.leyes, f), [datos, f]);
  const nombreTema = useMemo(() => Object.fromEntries(datos.temas.map((t) => [t.id, t.nombre])), [datos]);
  const grupos = Object.entries(datos.grupos);
  const hayFiltros = f.temas.length || f.grupo || f.resultado !== 'todas' || f.texto;

  const proximas = (datos.proximas ?? []).filter((p) => p.estado === 'prevista' || p.estado === 'pendiente');
  const cabecera = (
    <View style={s.cab}>
      {proximas.length > 0 && (
        <Pressable onPress={verProximas} style={s.aviso2} accessibilityRole="button">
          <Text style={s.aviso2Icono}>🔔</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.aviso2Tit}>
              {proximas.length} {proximas.length === 1 ? 'votación anunciada' : 'votaciones anunciadas'}
            </Text>
            <Text style={s.aviso2Txt} numberOfLines={1}>
              {proximas[0].titulo}
            </Text>
          </View>
          <Text style={s.aviso2Flecha}>›</Text>
        </Pressable>
      )}
      <View style={s.buscarCaja}>
        <Text style={s.lupa}>⌕</Text>
        <TextInput
          value={f.texto}
          onChangeText={(texto) => setF({ ...f, texto })}
          placeholder="Buscar en el título oficial"
          placeholderTextColor={UI.texto3}
          style={s.buscar}
          accessibilityLabel="Buscar leyes"
        />
      </View>
      <View style={s.plegar}>
        <Pressable onPress={() => setVerFiltros(!verFiltros)} accessibilityRole="button">
          <Text style={s.plegarTxt}>{verFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}</Text>
        </Pressable>
        {hayFiltros ? (
          <Pressable onPress={() => setF(FILTROS_INICIALES)} accessibilityRole="button">
            <Text style={s.limpiar}>Quitar filtros ✕</Text>
          </Pressable>
        ) : null}
      </View>

      {verFiltros && (
        <View style={s.panel}>
          <Seccion>Tipo de ley</Seccion>
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

          <Seccion>Partido</Seccion>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.fila}>
            {grupos.map(([cod, g]) => (
              <ChipPartido
                key={cod}
                cod={cod}
                nombre={g.corto}
                activo={f.grupo === cod}
                onPress={() => setF({ ...f, grupo: f.grupo === cod ? null : cod, posturas: [] })}
              />
            ))}
          </ScrollView>

          {f.grupo && (
            <>
              <Seccion>Qué votó {datos.grupos[f.grupo].corto}</Seccion>
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

          <Seccion>Resultado</Seccion>
          <View style={[s.fila, s.envolver]}>
            {(['todas', 'aprobadas', 'rechazadas'] as const).map((r) => (
              <Boton key={r} texto={r[0].toUpperCase() + r.slice(1)} activo={f.resultado === r} onPress={() => setF({ ...f, resultado: r })} />
            ))}
          </View>
        </View>
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
    <Pressable onPress={onPress} style={({ pressed }) => [s.tarjeta, pressed && { opacity: 0.88 }]} accessibilityRole="button">
      <View style={[s.franja, { backgroundColor: m.fondo }]}>
        <Text style={s.franjaTxt}>
          {m.icono} {nombreTema}
        </Text>
        <Text style={s.fecha}>{fechaCorta(ley.fecha)}</Text>
      </View>
      <View style={s.cuerpo}>
        <Text style={s.tTitulo} numberOfLines={3}>
          {ley.titulo}
        </Text>
        <View style={s.lineaRes}>
          <Resultado aprobada={ley.aprobada} />
          <Text style={s.mini}>
            {ley.totales.si} sí · {ley.totales.no} no · {ley.totales.abstencion} abst.
          </Text>
        </View>
        <BarraVotos t={ley.totales} alto={8} />
        {grupoSel && (
          <View style={s.sel}>
            <View style={[s.puntoGrande, { backgroundColor: colorPartido(grupoSel).color }]} />
            <Text style={s.selTxt}>{grupos[grupoSel].corto} votó</Text>
            {posturaSel ? <Etiqueta postura={posturaSel} grande /> : <Text style={s.selSin}>sin voto nominal publicado</Text>}
          </View>
        )}
        {ley.grupos ? (
          <View style={s.grupos}>
            {Object.entries(grupos).map(([cod, g]) => {
              const p = ley.grupos?.[cod]?.postura;
              if (!p) return null;
              return (
                <View key={cod} style={[s.gPill, grupoSel && grupoSel !== cod && { opacity: 0.35 }]}>
                  <View style={[s.punto, { backgroundColor: colorPartido(cod).color }]} />
                  <Text style={s.gPillTxt}>{g.corto}</Text>
                  <View style={[s.gVoto, { backgroundColor: VOTO[p].color }]}>
                    <Text style={[s.gVotoTxt, { color: VOTO[p].tinta }]}>{VOTO[p].icono}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={s.aviso}>Sin voto por grupo: el Congreso no publica voto nominal de esta votación en datos abiertos.</Text>
        )}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  lista: { padding: 14, paddingBottom: 40, gap: 14 },
  aviso2: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: UI.marcaSuave, borderRadius: 14, padding: 12 },
  aviso2Icono: { fontSize: 20 },
  aviso2Tit: { fontWeight: '700', color: UI.marca },
  aviso2Txt: { fontSize: 12, color: UI.texto2 },
  aviso2Flecha: { fontSize: 22, color: UI.marca2 },
  cab: { gap: 8, marginBottom: 2 },
  buscarCaja: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.superficie,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: UI.linea,
    paddingHorizontal: 12,
  },
  lupa: { fontSize: 20, color: UI.texto3, marginRight: 6 },
  buscar: { flex: 1, paddingVertical: 11, fontSize: 16, color: UI.texto },
  plegar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 },
  plegarTxt: { color: UI.acento, fontWeight: '700' },
  limpiar: { color: UI.texto2 },
  panel: { backgroundColor: UI.superficie, borderRadius: UI.radio, padding: 14, gap: 6 },
  fila: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  envolver: { flexWrap: 'wrap' },
  voto: { borderWidth: 2, borderRadius: UI.radioChip, paddingHorizontal: 12, paddingVertical: 6 },
  votoTxt: { fontWeight: '700', fontSize: 14 },
  cuenta: { color: UI.texto3, marginTop: 4, fontSize: 13, paddingHorizontal: 2 },
  vacio: { textAlign: 'center', color: UI.texto2, marginTop: 30 },
  tarjeta: {
    backgroundColor: UI.superficie,
    borderRadius: UI.radio,
    overflow: 'hidden',
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  franja: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7 },
  franjaTxt: { fontSize: 13, fontWeight: '700', color: UI.texto },
  fecha: { color: UI.texto2, fontSize: 12 },
  cuerpo: { padding: 14, gap: 9 },
  tTitulo: { fontFamily: SERIF, fontSize: 16, lineHeight: 22, color: UI.texto },
  lineaRes: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mini: { color: UI.texto3, fontSize: 12 },
  sel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  puntoGrande: { width: 12, height: 12, borderRadius: 6 },
  selTxt: { color: UI.texto2, fontWeight: '700' },
  selSin: { color: UI.texto3, fontStyle: 'italic' },
  grupos: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  gPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: UI.linea,
    borderRadius: 8,
    paddingLeft: 6,
    paddingRight: 3,
    paddingVertical: 2,
  },
  punto: { width: 8, height: 8, borderRadius: 4 },
  gPillTxt: { fontSize: 11, fontWeight: '700', color: UI.texto },
  gVoto: { width: 17, height: 17, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  gVotoTxt: { fontSize: 11, fontWeight: '900' },
  aviso: { color: UI.texto3, fontSize: 12, fontStyle: 'italic' },
});
