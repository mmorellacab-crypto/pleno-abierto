import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { UI, fechaCorta } from '../estilo';
import type { Dataset } from '../tipos';
import { Enlace } from './Detalle';
import { APP } from '../app-info';

export default function Fuentes({ datos }: { datos: Dataset }) {
  const { congreso, ecetm } = datos.fuentes;
  return (
    <ScrollView contentContainerStyle={s.cont}>
      <View style={[s.caja, s.aviso]}>
        <Text style={s.avisoTxt}>
          {APP.nombre} es una app independiente, gratuita y sin publicidad. No representa al Congreso de los Diputados,
          a ninguna administración pública ni a ningún partido político, y no está afiliada a El Congreso en tu mano.
        </Text>
      </View>

      <View style={s.caja}>
        <Text style={s.h}>Datos de esta versión</Text>
        <Text style={s.p}>Actualizados el {fechaCorta(datos.generado.slice(0, 10))} · Legislatura {datos.legislatura}</Text>
        <Text style={s.p}>Lista de leyes de El Congreso en tu mano con datos hasta el {fechaCorta(ecetm.datosHasta)}.</Text>
      </View>

      <View style={s.caja}>
        <Text style={s.h}>1 · Fuente oficial</Text>
        <Text style={s.p}>
          <Text style={s.b}>Origen de los datos: {congreso.nombre}.</Text> {congreso.uso} Los totales se muestran tal como
          los publica el Congreso; el recuento por grupo es una suma del voto nominal oficial y no altera la información.
        </Text>
        <Enlace texto="Datos abiertos del Congreso: votaciones" url={congreso.url} />
        <Enlace texto="Condiciones de reutilización (aviso legal del Congreso)" url={congreso.condiciones} />
      </View>

      <View style={s.caja}>
        <Text style={s.h}>2 · El Congreso en tu mano</Text>
        <Text style={s.p}>
          <Text style={s.b}>«El Congreso en tu mano» (elcongresoentumano.es)</Text>, licencia {ecetm.licencia}. Usamos solo:{' '}
          {ecetm.uso.toLowerCase()} No usamos sus resúmenes, impactos ni nombres populares.
        </Text>
        <Text style={s.p}>
          Aviso: los temas están generados con IA, son orientativos y pueden contener errores. Cambios realizados: hemos
          vinculado cada ley con su votación oficial del Congreso.
        </Text>
        <Enlace texto="elcongresoentumano.es" url={ecetm.url} />
        <Enlace texto={`Licencia ${ecetm.licencia}`} url={ecetm.licenciaUrl} />
      </View>

      <View style={s.caja}>
        <Text style={s.h}>Privacidad</Text>
        <Text style={s.p}>
          La app no pide cuenta, no recoge datos personales, no usa analítica ni publicidad. Solo descarga el fichero de
          datos públicos desde GitHub Pages, que como cualquier servidor web registra la dirección IP de la petición.
        </Text>
        <Enlace texto="Política de privacidad" url={APP.privacidad} />
      </View>

      <View style={s.caja}>
        <Text style={s.h}>Código abierto</Text>
        <Text style={s.p}>
          El código de la app es software libre (licencia {APP.licencia}). Las bibliotecas de terceros y sus licencias
          figuran en el repositorio.
        </Text>
        <Enlace texto="Código fuente y licencias" url={APP.repositorio} />
        <Text style={s.version}>Versión {APP.version}</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  cont: { padding: 16, paddingBottom: 48, gap: 12 },
  caja: { backgroundColor: UI.superficie, borderRadius: UI.radio, padding: 14, gap: 8 },
  aviso: { backgroundColor: '#fff6dc', borderWidth: 1, borderColor: '#f0d58a' },
  avisoTxt: { color: UI.texto, fontSize: 14, lineHeight: 20 },
  h: { fontSize: 13, fontWeight: '700', color: UI.texto2, textTransform: 'uppercase', letterSpacing: 0.5 },
  p: { color: UI.texto, fontSize: 14, lineHeight: 20 },
  b: { fontWeight: '700' },
  version: { color: UI.texto3, fontSize: 12, marginTop: 6 },
});
