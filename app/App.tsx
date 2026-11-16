import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { alAbrirAviso } from './src/avisos';
import { datosActualizados, datosIncluidos, diputadosActualizados, diputadosLocales } from './src/datos';
import { SERIF, UI } from './src/estilo';
import { APP } from './src/app-info';
import Detalle from './src/pantallas/Detalle';
import Diputados from './src/pantallas/Diputados';
import Fuentes from './src/pantallas/Fuentes';
import Leyes from './src/pantallas/Leyes';
import { Avisos, MenuMas, Promesas, SubMas } from './src/pantallas/Mas';
import Partidos from './src/pantallas/Partidos';
import Test, { EstadoTest, TEST_INICIAL } from './src/pantallas/Test';
import VotaTu, { EstadoVota, VOTA_INICIAL } from './src/pantallas/VotaTu';
import type { Dataset, DatosDiputados, Ley } from './src/tipos';

type Pestaña = 'leyes' | 'vota' | 'test' | 'diputados' | 'mas';
const PESTAÑAS: { id: Pestaña; texto: string; icono: string }[] = [
  { id: 'leyes', texto: 'Leyes', icono: '📜' },
  { id: 'vota', texto: 'Vota', icono: '🗳️' },
  { id: 'test', texto: 'Brújula', icono: '🧭' },
  { id: 'diputados', texto: 'Diputados', icono: '👤' },
  { id: 'mas', texto: 'Más', icono: '☰' },
];
const SUBTITULO: Record<Pestaña, string> = {
  leyes: 'Qué votó cada partido, ley a ley',
  vota: 'Vota tú también',
  test: 'Test de orientación política',
  diputados: 'Quién representa a tu provincia',
  mas: 'Partidos, avisos, promesas y fuentes',
};
const SUB_MAS: Record<SubMas, string> = {
  menu: 'Más',
  partidos: 'Partidos',
  avisos: 'Próximas votaciones y avisos',
  promesas: 'Promesas vs hechos',
  fuentes: 'Fuentes, licencias y privacidad',
};

export default function App() {
  const [datos, setDatos] = useState<Dataset>(datosIncluidos);
  const [dip, setDip] = useState<DatosDiputados>(diputadosLocales);
  const [pestaña, setPestaña] = useState<Pestaña>('leyes');
  const [mas, setMas] = useState<SubMas>('menu');
  const [abierta, setAbierta] = useState<Ley | null>(null);
  const [test, setTest] = useState<EstadoTest>(TEST_INICIAL);
  const [vota, setVota] = useState<EstadoVota>(VOTA_INICIAL);

  useEffect(() => {
    datosActualizados(datos).then((d) => d && setDatos(d));
    diputadosActualizados(dip).then((d) => d && setDip(d));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Al tocar una notificación de resultado, abrir la ficha de esa ley (con su tarjeta para compartir).
  useEffect(
    () =>
      alAbrirAviso((id) => {
        if (id) {
          const ley = datos.leyes.find((l) => l.id === id);
          if (ley) setAbierta(ley);
        } else {
          setPestaña('mas');
          setMas('avisos');
        }
      }),
    [datos],
  );

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (abierta) return setAbierta(null), true;
      if (pestaña === 'test' && test.fase === 'preguntas') return setTest(test.indice > 0 ? { ...test, indice: test.indice - 1 } : TEST_INICIAL), true;
      if (pestaña === 'mas' && mas !== 'menu') return setMas('menu'), true;
      if (pestaña !== 'leyes') return setPestaña('leyes'), true;
      return false;
    });
    return () => sub.remove();
  }, [abierta, pestaña, test, mas]);

  const enSub = pestaña === 'mas' && mas !== 'menu';
  const volver = abierta ? () => setAbierta(null) : enSub ? () => setMas('menu') : null;

  let cuerpo: React.ReactNode;
  if (abierta) cuerpo = <Detalle ley={abierta} datos={datos} />;
  else if (pestaña === 'leyes') cuerpo = <Leyes datos={datos} abrir={setAbierta} verProximas={() => (setPestaña('mas'), setMas('avisos'))} />;
  else if (pestaña === 'vota') cuerpo = <VotaTu datos={datos} estado={vota} setEstado={setVota} />;
  else if (pestaña === 'test') cuerpo = <Test datos={datos} estado={test} setEstado={setTest} />;
  else if (pestaña === 'diputados') cuerpo = <Diputados datos={datos} dip={dip} />;
  else if (mas === 'partidos') cuerpo = <Partidos datos={datos} />;
  else if (mas === 'avisos') cuerpo = <Avisos datos={datos} />;
  else if (mas === 'promesas') cuerpo = <Promesas />;
  else if (mas === 'fuentes') cuerpo = <Fuentes datos={datos} />;
  else cuerpo = <MenuMas ir={setMas} />;

  return (
    <View style={s.raiz}>
      <StatusBar style="light" />
      <View style={s.barraSup}>
        {volver ? (
          <Pressable onPress={volver} accessibilityRole="button" accessibilityLabel="Volver" style={s.volver}>
            <Text style={s.volverTxt}>‹ {abierta ? 'Volver' : SUB_MAS[mas]}</Text>
          </Pressable>
        ) : (
          <View>
            <Text style={s.marca}>{APP.nombre}</Text>
            <Text style={s.sub}>{SUBTITULO[pestaña]}</Text>
          </View>
        )}
      </View>

      <View style={s.cuerpo}>{cuerpo}</View>

      {!abierta && (
        <View style={s.tabs} accessibilityRole="tablist">
          {PESTAÑAS.map((p) => {
            const on = p.id === pestaña;
            return (
              <Pressable
                key={p.id}
                onPress={() => {
                  setPestaña(p.id);
                  if (p.id === 'mas') setMas('menu');
                }}
                style={s.tab}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
              >
                <View style={[s.tabIconoCaja, on && s.tabIconoCajaOn]}>
                  <Text style={[s.tabIcono, !on && s.apagado]}>{p.icono}</Text>
                </View>
                <Text style={[s.tabTxt, on && s.tabTxtOn]}>{p.texto}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: UI.fondo },
  barraSup: {
    paddingTop: Platform.OS === 'android' ? 46 : 52,
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: UI.marca,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    minHeight: 104,
    justifyContent: 'flex-end',
  },
  marca: { fontFamily: SERIF, fontSize: 26, fontWeight: '700', color: UI.sobreMarca },
  sub: { fontSize: 13, color: UI.sobreMarca2, marginTop: 1 },
  volver: { paddingVertical: 8 },
  volverTxt: { fontSize: 17, color: UI.sobreMarca, fontWeight: '700' },
  cuerpo: { flex: 1 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: UI.superficie,
    borderTopWidth: 1,
    borderTopColor: UI.linea,
    paddingBottom: Platform.OS === 'android' ? 16 : 24,
    paddingTop: 6,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  tabIconoCaja: { paddingHorizontal: 12, paddingVertical: 3, borderRadius: 14 },
  tabIconoCajaOn: { backgroundColor: UI.marcaSuave },
  tabIcono: { fontSize: 18 },
  apagado: { opacity: 0.5 },
  tabTxt: { fontSize: 11, color: UI.texto3, marginTop: 2 },
  tabTxtOn: { color: UI.marca, fontWeight: '700' },
});
