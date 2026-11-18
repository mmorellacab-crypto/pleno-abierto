import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SERIF, UI, fechaCorta } from '../estilo';
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
          No ofrece ningún servicio público ni recomienda el voto a ningún partido.
        </Text>
      </View>

      <View style={s.caja}>
        <Text style={s.h}>Datos de esta versión</Text>
        <Text style={s.p}>Actualizados el {fechaCorta(datos.generado.slice(0, 10))} · Legislatura {datos.legislatura}</Text>
        <Text style={s.p}>Lista de leyes de El Congreso en tu mano con datos hasta el {fechaCorta(ecetm.datosHasta)}.</Text>
      </View>

      <View style={s.caja}>
        <Text style={s.h}>Fuente oficial</Text>
        <Text style={s.p}>
          <Text style={s.b}>Origen de los datos: {congreso.nombre}.</Text> {congreso.uso} Los totales se muestran tal como
          los publica el Congreso; el recuento por grupo es una suma del voto nominal oficial y no altera la información.
        </Text>
        <Enlace texto="Datos abiertos del Congreso: votaciones" url={congreso.url} />
        <Enlace texto="Condiciones de reutilización (aviso legal del Congreso)" url={congreso.condiciones} />
      </View>

      <View style={s.caja}>
        <Text style={s.h}>Texto de las leyes (BOE)</Text>
        <Text style={s.p}>
          <Text style={s.b}>Origen: Boletín Oficial del Estado.</Text> Los resúmenes de «Vota tú también» se han redactado
          con ayuda de inteligencia artificial a partir del texto publicado en el BOE (las leyes no tienen derechos de
          autor, art. 13 LPI). Son orientativos y pueden contener errores: cada ley enlaza a su texto oficial.
        </Text>
        <Enlace texto="Boletín Oficial del Estado (boe.es)" url="https://www.boe.es" />
      </View>

      <View style={s.caja}>
        <Text style={s.h}>El Congreso en tu mano</Text>
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
        <Text style={s.h}>Test «Brújula»</Text>
        <Text style={s.p}>
          Sus 45 preguntas están adaptadas de escalas usadas en investigación revisada por pares (European Social Survey,
          Chapel Hill Expert Survey, CIS, escala NEP, valores de crianza de Feldman y Stenner, entre otras) o siguen el
          formato de afirmación de las aplicaciones de consejo de voto. La posición de cada grupo se calcula solo con sus
          votos oficiales. Cada pregunta muestra su fuente y las referencias completas aparecen al final del test.
        </Text>
      </View>

      <View style={s.caja}>
        <Text style={s.h}>Neutralidad y exactitud</Text>
        <Text style={s.p}>
          La Brújula y «Vota tú también» calculan afinidades solo con los votos oficiales y tus respuestas, que no se
          guardan ni se envían. No son encuestas ni sondeos electorales. La información se ofrece con cuidado pero sin
          garantía: para cualquier uso con efectos jurídicos consulta la fuente oficial. Si ves un error, avísanos.
        </Text>
        <Enlace texto="Informar de un error" url={APP.incidencias} />
        <Enlace texto="Aviso legal" url={APP.avisoLegal} />
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
  aviso: { backgroundColor: UI.marcaSuave },
  avisoTxt: { color: UI.texto, fontSize: 14, lineHeight: 20 },
  h: { fontSize: 16, fontWeight: '700', color: UI.marca2, fontFamily: SERIF },
  p: { color: UI.texto, fontSize: 14, lineHeight: 20 },
  b: { fontWeight: '700' },
  version: { color: UI.texto3, fontSize: 12, marginTop: 6 },
});
