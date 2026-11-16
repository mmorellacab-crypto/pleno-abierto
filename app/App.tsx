import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { datosActualizados, datosIncluidos } from './src/datos';
import { UI } from './src/estilo';
import { APP } from './src/app-info';
import Detalle from './src/pantallas/Detalle';
import Fuentes from './src/pantallas/Fuentes';
import Leyes from './src/pantallas/Leyes';
import Partidos from './src/pantallas/Partidos';
import type { Dataset, Ley } from './src/tipos';

type Pestaña = 'leyes' | 'partidos' | 'fuentes';
const PESTAÑAS: { id: Pestaña; texto: string; icono: string }[] = [
  { id: 'leyes', texto: 'Leyes', icono: '📜' },
  { id: 'partidos', texto: 'Partidos', icono: '👥' },
  { id: 'fuentes', texto: 'Fuentes', icono: 'ℹ️' },
];

export default function App() {
  const [datos, setDatos] = useState<Dataset>(datosIncluidos);
  const [pestaña, setPestaña] = useState<Pestaña>('leyes');
  const [abierta, setAbierta] = useState<Ley | null>(null);

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
      if (pestaña !== 'leyes') {
        setPestaña('leyes');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [abierta, pestaña]);

  return (
    <View style={s.raiz}>
      <StatusBar style="dark" />
      <View style={s.barraSup}>
        {abierta ? (
          <Pressable onPress={() => setAbierta(null)} accessibilityRole="button" accessibilityLabel="Volver" style={s.volver}>
            <Text style={s.volverTxt}>‹ Volver</Text>
          </Pressable>
        ) : (
          <View>
            <Text style={s.marca}>{APP.nombre}</Text>
            <Text style={s.sub}>Qué votó cada grupo en el Congreso</Text>
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
                <Text style={[s.tabIcono, !on && s.apagado]}>{p.icono}</Text>
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
    paddingTop: Platform.OS === 'android' ? 44 : 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: UI.superficie,
    borderBottomWidth: 1,
    borderBottomColor: UI.linea,
    minHeight: 96,
    justifyContent: 'flex-end',
  },
  marca: { fontSize: 22, fontWeight: '800', color: UI.texto },
  sub: { fontSize: 13, color: UI.texto2 },
  volver: { paddingVertical: 8 },
  volverTxt: { fontSize: 17, color: UI.acento, fontWeight: '600' },
  cuerpo: { flex: 1 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: UI.superficie,
    borderTopWidth: 1,
    borderTopColor: UI.linea,
    paddingBottom: Platform.OS === 'android' ? 18 : 24,
    paddingTop: 6,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  tabIcono: { fontSize: 20 },
  apagado: { opacity: 0.45 },
  tabTxt: { fontSize: 12, color: UI.texto3, marginTop: 2 },
  tabTxtOn: { color: UI.texto, fontWeight: '700' },
});
