import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { leer, guardar } from '../almacen';
import { Titulo } from '../componentes';
import { SERIF, UI, VOTO, colorPartido } from '../estilo';
import type { Dataset, DatosDiputados, Diputado } from '../tipos';

const CODIGO: Record<string, 'si' | 'no' | 'abstencion' | 'novota'> = { S: 'si', N: 'no', A: 'abstencion', '-': 'novota' };

function nombreLegible(n: string) {
  const [apellidos, nombre] = n.split(',').map((x) => x.trim());
  return nombre ? `${nombre} ${apellidos}` : n;
}

export default function Diputados({ datos, dip }: { datos: Dataset; dip: DatosDiputados }) {
  const [provincia, setProvincia] = useState<string | null>(null);
  const [abierto, setAbierto] = useState<Diputado | null>(null);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    leer<string | null>('provincia', null).then(setProvincia);
  }, []);
  const elegir = (p: string | null) => {
    setProvincia(p);
    guardar('provincia', p);
  };

  const provincias = useMemo(() => [...new Set(dip.diputados.map((d) => d.circunscripcion))].sort((a, b) => a.localeCompare(b, 'es')), [dip]);

  if (!dip.diputados.length) {
    return (
      <View style={[s.cont, { flex: 1 }]}>
        <View style={s.caja}>
          <Titulo tam={18}>Datos en preparación</Titulo>
          <Text style={s.p}>La lista de diputados y su participación se genera automáticamente desde los datos abiertos del Congreso. Vuelve a abrir la app en un rato.</Text>
        </View>
      </View>
    );
  }

  if (abierto) return <Ficha d={abierto} datos={datos} dip={dip} volver={() => setAbierto(null)} />;

  if (!provincia) {
    const lista = provincias.filter((p) => p.toLowerCase().includes(busca.toLowerCase()));
    return (
      <ScrollView contentContainerStyle={s.cont} keyboardShouldPersistTaps="handled">
        <View style={s.heroe}>
          <Text style={s.heroeTitulo}>Mis diputados</Text>
          <Text style={s.heroeTxt}>Elige tu provincia para ver quién la representa en el Congreso, qué ha votado y en cuántas votaciones ha participado.</Text>
        </View>
        <TextInput value={busca} onChangeText={setBusca} placeholder="Buscar provincia" placeholderTextColor={UI.texto3} style={s.buscar} />
        <View style={s.rejilla}>
          {lista.map((p) => (
            <Pressable key={p} onPress={() => elegir(p)} style={({ pressed }) => [s.prov, pressed && { opacity: 0.8 }]} accessibilityRole="button">
              <Text style={s.provTxt}>{p}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={s.nota}>Tu provincia se guarda solo en este móvil. La app no usa tu ubicación.</Text>
      </ScrollView>
    );
  }

  const suyos = dip.diputados
    .filter((d) => d.circunscripcion === provincia)
    .sort((a, b) => Number(Boolean(a.baja && a.baja.slice(-4) < '2026')) - Number(Boolean(b.baja && b.baja.slice(-4) < '2026')) || a.nombre.localeCompare(b.nombre, 'es'));

  return (
    <FlatList
      data={suyos}
      keyExtractor={(d) => d.nombre}
      contentContainerStyle={s.cont}
      ListHeaderComponent={
        <View style={{ gap: 8 }}>
          <View style={s.cabProv}>
            <Titulo tam={24}>{provincia}</Titulo>
            <Pressable onPress={() => elegir(null)} accessibilityRole="button">
              <Text style={s.cambiar}>Cambiar</Text>
            </Pressable>
          </View>
          <Text style={s.nota}>
            Diputados de la Legislatura {dip.legislatura} (2023–2026, disuelta en octubre de 2026). «Participación» es el porcentaje de las votaciones del Pleno en las que votó (sí, no o abstención) mientras era diputado; no mide la asistencia a otras actividades.
          </Text>
        </View>
      }
      renderItem={({ item }) => <FilaDiputado d={item} datos={datos} onPress={() => setAbierto(item)} />}
    />
  );
}

function FilaDiputado({ d, datos, onPress }: { d: Diputado; datos: Dataset; onPress: () => void }) {
  const pct = d.total ? Math.round((100 * d.votadas) / d.total) : 0;
  const c = colorPartido(d.grupo ?? '');
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.fila, pressed && { opacity: 0.85 }]} accessibilityRole="button">
      <View style={[s.avatar, { backgroundColor: c.color }]}>
        <Text style={[s.avatarTxt, { color: c.tinta }]}>{nombreLegible(d.nombre).split(' ').map((x) => x[0]).slice(0, 2).join('')}</Text>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={s.nombre}>{nombreLegible(d.nombre)}</Text>
        <Text style={s.meta}>
          {d.formacion}
          {d.grupo ? ` · ${datos.grupos[d.grupo]?.corto ?? d.grupo}` : ''}
          {d.baja && !d.baja.endsWith('2026') ? ` · baja el ${d.baja}` : ''}
        </Text>
        <View style={s.partRow}>
          <View style={s.partPista}>
            <View style={[s.partBarra, { width: `${pct}%` }]} />
          </View>
          <Text style={s.partTxt}>{pct}%</Text>
        </View>
      </View>
    </Pressable>
  );
}

function Ficha({ d, datos, dip, volver }: { d: Diputado; datos: Dataset; dip: DatosDiputados; volver: () => void }) {
  const pct = d.total ? Math.round((100 * d.votadas) / d.total) : 0;
  const c = colorPartido(d.grupo ?? '');
  const votos = dip.leyes
    .map((id, i) => ({ ley: datos.leyes.find((l) => l.id === id), codigo: d.votos[i] }))
    .filter((x) => x.ley && x.codigo && x.codigo !== ' ');
  const conGrupo = votos.filter((x) => {
    const p = d.grupo ? x.ley!.grupos?.[d.grupo]?.postura : undefined;
    return p && CODIGO[x.codigo] !== 'novota' && p !== 'dividido' && p !== 'novota';
  });
  const igual = conGrupo.filter((x) => CODIGO[x.codigo] === x.ley!.grupos?.[d.grupo!]?.postura).length;

  return (
    <ScrollView contentContainerStyle={s.cont}>
      <Pressable onPress={volver} accessibilityRole="button">
        <Text style={s.cambiar}>‹ Volver a la lista</Text>
      </Pressable>
      <View style={[s.ficha, { backgroundColor: c.color }]}>
        <Text style={[s.fichaNombre, { color: c.tinta }]}>{nombreLegible(d.nombre)}</Text>
        <Text style={[s.fichaMeta, { color: c.tinta }]}>
          {d.formacion} · {d.circunscripcion}
        </Text>
      </View>
      <View style={s.datos}>
        <Dato valor={`${pct}%`} etiqueta="Participación en votaciones" />
        <Dato valor={`${d.votadas}/${d.total}`} etiqueta="Votaciones en las que votó" />
        {conGrupo.length > 0 && <Dato valor={`${Math.round((100 * igual) / conGrupo.length)}%`} etiqueta="Votó como su grupo" />}
      </View>
      <View style={s.caja}>
        <Titulo tam={17}>Su voto en las leyes</Titulo>
        {votos.length ? (
          votos.map(({ ley, codigo }) => {
            const p = CODIGO[codigo] ?? 'novota';
            return (
              <View key={ley!.id} style={s.voto}>
                <View style={[s.votoEtq, { backgroundColor: VOTO[p].color }]}>
                  <Text style={[s.votoEtqTxt, { color: VOTO[p].tinta }]}>{VOTO[p].icono}</Text>
                </View>
                <Text style={s.votoTxt} numberOfLines={2}>
                  {ley!.titulo}
                </Text>
              </View>
            );
          })
        ) : (
          <Text style={s.p}>Sin votos registrados en las leyes de la app.</Text>
        )}
        <Text style={s.nota}>Fuente: voto nominal oficial del Congreso de los Diputados (datos abiertos).</Text>
      </View>
    </ScrollView>
  );
}

function Dato({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <View style={s.dato}>
      <Text style={s.datoValor}>{valor}</Text>
      <Text style={s.datoEtq}>{etiqueta}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  cont: { padding: 16, paddingBottom: 48, gap: 10 },
  heroe: { backgroundColor: UI.marca, borderRadius: UI.radio, padding: 20, gap: 6 },
  heroeTitulo: { fontFamily: SERIF, color: '#fff', fontSize: 28, fontWeight: '700' },
  heroeTxt: { color: UI.sobreMarca2, fontSize: 14, lineHeight: 20 },
  caja: { backgroundColor: UI.superficie, borderRadius: UI.radio, padding: 16, gap: 10 },
  p: { color: UI.texto, fontSize: 14, lineHeight: 20 },
  nota: { color: UI.texto3, fontSize: 12, lineHeight: 17 },
  buscar: { backgroundColor: UI.superficie, borderRadius: 14, borderWidth: 1.5, borderColor: UI.linea, paddingHorizontal: 14, paddingVertical: 11, fontSize: 16, color: UI.texto },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  prov: { backgroundColor: UI.superficie, borderRadius: 10, borderWidth: 1.5, borderColor: UI.linea, paddingHorizontal: 12, paddingVertical: 8 },
  provTxt: { color: UI.texto, fontSize: 14 },
  cabProv: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cambiar: { color: UI.acento, fontWeight: '700' },
  fila: { flexDirection: 'row', gap: 12, backgroundColor: UI.superficie, borderRadius: 16, padding: 12, alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontWeight: '800', fontSize: 15 },
  nombre: { fontSize: 15, fontWeight: '700', color: UI.texto },
  meta: { fontSize: 12, color: UI.texto2 },
  partRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  partPista: { flex: 1, height: 7, backgroundColor: '#ECECF4', borderRadius: 4, overflow: 'hidden' },
  partBarra: { height: 7, backgroundColor: UI.acento, borderRadius: 4 },
  partTxt: { width: 38, textAlign: 'right', fontSize: 12, fontWeight: '700', color: UI.texto },
  ficha: { borderRadius: UI.radio, padding: 18, gap: 4 },
  fichaNombre: { fontFamily: SERIF, fontSize: 24, fontWeight: '700' },
  fichaMeta: { fontSize: 14, opacity: 0.9 },
  datos: { flexDirection: 'row', gap: 8 },
  dato: { flex: 1, backgroundColor: UI.superficie, borderRadius: 14, padding: 12, gap: 2 },
  datoValor: { fontFamily: SERIF, fontSize: 22, fontWeight: '700', color: UI.marca },
  datoEtq: { fontSize: 11, color: UI.texto2 },
  voto: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  votoEtq: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  votoEtqTxt: { fontWeight: '900', fontSize: 13 },
  votoTxt: { flex: 1, fontSize: 13, color: UI.texto },
});
