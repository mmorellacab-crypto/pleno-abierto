import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarraVotos, ChipTema, Cifras, Etiqueta, MarcaPartido, Resultado, Titulo } from '../componentes';
import { SERIF, UI, fechaCorta } from '../estilo';
import type { Dataset, Ley } from '../tipos';

export default function Detalle({ ley, datos }: { ley: Ley; datos: Dataset }) {
  const tema = datos.temas.find((t) => t.id === ley.tema);
  return (
    <ScrollView contentContainerStyle={s.cont}>
      <View style={s.meta}>
        <ChipTema id={ley.tema} nombre={tema?.nombre ?? ley.tema} />
        <Resultado aprobada={ley.aprobada} />
      </View>
      <Text style={s.fecha}>
        {fechaCorta(ley.fecha)} · {ley.tipo}
      </Text>
      <Titulo tam={19}>{ley.titulo}</Titulo>
      {ley.apartado ? <Text style={s.apartado}>{ley.apartado}</Text> : null}

      <View style={s.caja}>
        <Text style={s.h}>Resultado de la votación</Text>
        <BarraVotos t={ley.totales} alto={16} />
        <Cifras t={ley.totales} />
        <Text style={s.nota}>
          No votan: {ley.totales.novota}
          {ley.totales.presentes != null ? ` · Presentes: ${ley.totales.presentes}` : ''}
        </Text>
      </View>

      <View style={s.caja}>
        <Text style={s.h}>Qué votó cada grupo</Text>
        {ley.grupos ? (
          Object.entries(datos.grupos).map(([cod, g]) => {
            const r = ley.grupos?.[cod];
            if (!r) return null;
            const t = { si: r.si, no: r.no, abstencion: r.abstencion, novota: r.novota, presentes: null, asentimiento: false };
            return (
              <View key={cod} style={s.grupo}>
                <View style={s.gCab}>
                  <MarcaPartido cod={cod} alto={32} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.gNombre}>{g.corto}</Text>
                    <Text style={s.gLargo}>{g.nombre}</Text>
                  </View>
                  <Etiqueta postura={r.postura} />
                </View>
                <BarraVotos t={t} alto={8} />
                <Text style={s.gCifras}>
                  Sí {r.si} · No {r.no} · Abst. {r.abstencion} · No vota {r.novota}
                </Text>
              </View>
            );
          })
        ) : (
          <Text style={s.nota}>
            El Congreso no publica en datos abiertos el voto nominal de esta votación (por ejemplo, las de la
            Diputación Permanente). Los totales mostrados proceden de El Congreso en tu mano.
          </Text>
        )}
        <Text style={s.nota}>
          La postura del grupo es la opción de la mayoría de sus diputados. «Dividido» significa que ninguna opción
          reunió al menos el 75 % de los votos emitidos del grupo. El Grupo Mixto reúne partidos distintos.
        </Text>
      </View>

      <View style={s.caja}>
        <Text style={s.h}>Fuentes</Text>
        {ley.oficial ? (
          <Enlace
            texto={`Votación oficial: sesión ${ley.oficial.sesion}, votación ${ley.oficial.votacion} — Congreso de los Diputados (datos abiertos)`}
            url={ley.oficial.url}
          />
        ) : null}
        <Enlace texto="Ficha en El Congreso en tu mano (tema y selección de la ley)" url={ley.fichaECETM} />
        <Text style={s.nota}>
          El tema lo asigna El Congreso en tu mano con IA: es orientativo y puede contener errores (CC BY 4.0). Los
          votos{ley.fuenteVotos === 'congreso' ? ' son los oficiales del Congreso; el recuento por grupo lo calcula esta app a partir del voto nominal' : ' proceden de El Congreso en tu mano'}.
        </Text>
      </View>
    </ScrollView>
  );
}

export function Enlace({ texto, url }: { texto: string; url: string }) {
  return (
    <Text style={s.enlace} onPress={() => Linking.openURL(url)} accessibilityRole="link">
      ↗ {texto}
    </Text>
  );
}

const s = StyleSheet.create({
  cont: { padding: 16, paddingBottom: 48, gap: 10 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fecha: { color: UI.texto3, fontSize: 13 },
    apartado: { color: UI.texto2, fontSize: 14 },
  caja: { backgroundColor: UI.superficie, borderRadius: UI.radio, padding: 16, gap: 8, marginTop: 4 },
  h: { fontSize: 16, fontWeight: '700', color: UI.marca2, fontFamily: SERIF },
  nota: { color: UI.texto3, fontSize: 12, lineHeight: 17 },
  grupo: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: UI.linea, gap: 6 },
  gCab: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  gNombre: { fontSize: 15, fontWeight: '700', color: UI.texto },
  gLargo: { fontSize: 12, color: UI.texto3 },
  gCifras: { fontSize: 12, color: UI.texto2 },
  enlace: { color: UI.acento, fontSize: 14, lineHeight: 20, paddingVertical: 4 },
});
