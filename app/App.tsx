import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { datosActualizados, datosIncluidos } from './src/datos';
import { SERIF, UI } from './src/estilo';
import { APP } from './src/app-info';
import Detalle from './src/pantallas/Detalle';
import Fuentes from './src/pantallas/Fuentes';
import Leyes from './src/pantallas/Leyes';
import Partidos from './src/pantallas/Partidos';
import Test, { EstadoTest, TEST_INICIAL } from './src/pantallas/Test';
import type { Dataset, Ley } from './src/tipos';

type Pestaña = 'leyes' | 'partidos' | 'test' | 'fuentes';
const PESTAÑAS: { id: Pestaña; texto: string; icono: string }[] = [
  { id: 'leyes', texto: 'Leyes', icono: '📜' },
  { id: 'partidos', texto: 'Partidos', icono: '🏛️' },
  { id: 'test', texto: 'Brújula', icono: '🧭' },
  { id: 'fuentes', texto: 'Fuentes', icono: 'ℹ️' },
];
const SUBTITULO: Record<Pestaña, string> = {
  leyes: 'Qué votó cada partido, ley a ley',
  partidos: 'Cómo vota cada grupo parlamentario',
  test: 'Test de orientación política',
  fuentes: 'Datos, licencias y privacidad',
};

export default function App() {
  const [datos, setDatos] = useState<Dataset>(datosIncluidos);
  const [pestaña, setPestaña] = useState<Pestaña>('leyes');
  const [abierta, setAbierta] = useState<Ley | null>(null);
  const [test, setTest] = useState<EstadoTest>(TEST_INICIAL);

  useEffect(() => {
    datosActualizados(datos).then((d) => d && setDatos(d));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (abierta) {
        setAbierta(null);
        return true;
      }
      if (pestaña === 'test' && test.fase === 'preguntas') {
        setTest(test.indice > 0 ? { ...test, indice: test.indice - 1 } : TEST_INICIAL);
        return true;
      }
      if (pestaña !== 'leyes') {
        setPestaña('leyes');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [abierta, pestaña, test]);

  return (
    <View style={s.raiz}>
      <StatusBar style="light" />
      <View style={s.barraSup}>
        {abierta ? (
          <Pressable onPress={() => setAbierta(null)} accessibilityRole="button" accessibilityLabel="Volver" style={s.volver}>
            <Text style={s.volverTxt}>‹ Volver</Text>
          </Pressable>
        ) : (
          <View>
            <Text style={s.marca}>{APP.nombre}</Text>
            <Text style={s.sub}>{SUBTITULO[pestaña]}</Text>
          </View>
        )}
      </View>

      <View style={s.cuerpo}>
        {abierta ? (
          <Detalle ley={abierta} datos={datos} />
        ) : pestaña === 'leyes' ? (
          <Leyes datos={datos} abrir={setAbierta} />
        ) : pestaña === 'partidos' ? (
          <Partidos datos={datos} />
        ) : pestaña === 'test' ? (
          <Test datos={datos} estado={test} setEstado={setTest} />
        ) : (
          <Fuentes datos={datos} />
        )}
      </View>

      {!abierta && (
        <View style={s.tabs} accessibilityRole="tablist">
          {PESTAÑAS.map((p) => {
            const on = p.id === pestaña;
            return (
              <Pressable
                key={p.id}
                onPress={() => setPestaña(p.id)}
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
  tabIconoCaja: { paddingHorizontal: 16, paddingVertical: 3, borderRadius: 14 },
  tabIconoCajaOn: { backgroundColor: UI.marcaSuave },
  tabIcono: { fontSize: 19 },
  apagado: { opacity: 0.5 },
  tabTxt: { fontSize: 12, color: UI.texto3, marginTop: 2 },
  tabTxtOn: { color: UI.marca, fontWeight: '700' },
});
