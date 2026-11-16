import React, { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton, ChipTema, Titulo } from '../componentes';
import { SERIF, UI, VOTO, colorPartido } from '../estilo';
import { Compartible, TarjetaAfinidad, TarjetaLey } from '../tarjetas';
import type { Dataset } from '../tipos';
import { VotoUsuario, afinidadVotos, coincide } from '../vota/calculo';
import { LEYES_VOTA } from '../vota/leyes';

export interface EstadoVota {
  fase: 'intro' | 'votando' | 'final';
  indice: number;
  revelada: boolean;
  votos: Record<string, VotoUsuario>;
}
export const VOTA_INICIAL: EstadoVota = { fase: 'intro', indice: 0, revelada: false, votos: {} };

export default function VotaTu({ datos, estado, setEstado }: { datos: Dataset; estado: EstadoVota; setEstado: (e: EstadoVota) => void }) {
  const leyes = useMemo(() => LEYES_VOTA.filter((l) => datos.leyes.some((x) => x.id === l.id && x.grupos)), [datos]);

  if (estado.fase === 'intro') {
    return (
      <ScrollView key={`${estado.fase}-${estado.indice}`} contentContainerStyle={s.cont}>
        <View style={s.heroe}>
          <Text style={s.heroeIcono}>🗳️</Text>
          <Text style={s.heroeTitulo}>Vota tú también</Text>
          <Text style={s.heroeTxt}>
            {leyes.length} leyes y decretos reales que se votaron en el Congreso. Lee de qué tratan, decide qué habrías votado y descubre con qué grupos coincides.
          </Text>
        </View>
        <View style={s.caja}>
          <Punto>Cada ley tiene un resumen neutral de lo que hace, redactado con IA a partir del texto oficial del BOE, y el enlace al texto completo.</Punto>
          <Punto>Después de votar verás el resultado real y lo que votó cada grupo.</Punto>
          <Punto>Tus votos no se guardan ni se envían: se quedan en el móvil mientras usas la app.</Punto>
        </View>
        <Boton texto="Empezar a votar" onPress={() => setEstado({ ...VOTA_INICIAL, fase: 'votando' })} principal />
      </ScrollView>
    );
  }

  if (estado.fase === 'final') {
    const af = afinidadVotos(estado.votos, datos);
    const n = Object.values(estado.votos).filter(Boolean).length;
    return (
      <ScrollView key={`${estado.fase}-${estado.indice}`} contentContainerStyle={s.cont}>
        <Titulo tam={22}>Tu resultado</Titulo>
        <Text style={s.p}>Has votado {n} de {leyes.length} leyes.</Text>
        {af.length ? (
          <Compartible titulo="Mi coincidencia con los grupos del Congreso">
            <TarjetaAfinidad
              datos={datos}
              subtitulo="🗳️ VOTA TÚ TAMBIÉN · PLENO ABIERTO"
              titular={`Coincido un ${af[0].pct}% con ${datos.grupos[af[0].grupo].corto}`}
              afinidades={af}
            />
          </Compartible>
        ) : (
          <Text style={s.p}>No has votado ninguna ley.</Text>
        )}
        <View style={s.caja}>
          <Text style={s.p}>
            Cálculo: si votas lo mismo que un grupo cuenta 1; si uno vota Sí y el otro No, 0; si hay abstención o el grupo votó dividido, 0,5. El Grupo Mixto reúne partidos distintos. En el Congreso el voto refleja también la relación Gobierno–oposición.
          </Text>
        </View>
        <View style={s.botones}>
          <Boton texto="Revisar mis votos" onPress={() => setEstado({ ...estado, fase: 'votando', indice: 0, revelada: true })} />
          <Boton texto="Volver a empezar" onPress={() => setEstado(VOTA_INICIAL)} />
        </View>
      </ScrollView>
    );
  }

  const lv = leyes[estado.indice];
  const ley = datos.leyes.find((l) => l.id === lv.id)!;
  const tema = datos.temas.find((t) => t.id === ley.tema);
  const miVoto = estado.votos[lv.id] ?? null;
  const ultima = estado.indice === leyes.length - 1;

  const votar = (v: VotoUsuario) => setEstado({ ...estado, votos: { ...estado.votos, [lv.id]: v }, revelada: true });
  const siguiente = () =>
    ultima ? setEstado({ ...estado, fase: 'final' }) : setEstado({ ...estado, indice: estado.indice + 1, revelada: Boolean(estado.votos[leyes[estado.indice + 1].id]) });

  return (
    <ScrollView key={`${estado.fase}-${estado.indice}`} contentContainerStyle={s.cont}>
      <View style={s.progresoCab}>
        <Pressable
          accessibilityRole="button"
          onPress={() => (estado.indice === 0 ? setEstado(VOTA_INICIAL) : setEstado({ ...estado, indice: estado.indice - 1, revelada: true }))}
        >
          <Text style={s.atras}>‹ Anterior</Text>
        </Pressable>
        <Text style={s.contador}>
          {estado.indice + 1} / {leyes.length}
        </Text>
      </View>
      <View style={s.pista}>
        <View style={[s.relleno, { width: `${((estado.indice + 1) / leyes.length) * 100}%` }]} />
      </View>

      <View style={s.caja}>
        {tema && <ChipTema id={tema.id} nombre={tema.nombre} pequeño />}
        <Text style={s.nombre}>{lv.nombre}</Text>
        <Text style={s.resumen}>{lv.resumen}</Text>
        {lv.puntos.map((p) => (
          <Punto key={p}>{p}</Punto>
        ))}
        <Text style={s.oficial} numberOfLines={3}>
          Título oficial: {ley.titulo}
        </Text>
        <Text style={s.enlace} onPress={() => Linking.openURL(lv.eli)} accessibilityRole="link">
          ↗ Leer el texto en el BOE ({lv.boe})
        </Text>
        <Text style={s.ia}>Resumen generado con IA a partir del texto oficial; puede contener imprecisiones.</Text>
      </View>

      {!estado.revelada ? (
        <>
          <Text style={s.pregunta}>¿Qué habrías votado tú?</Text>
          <View style={s.opciones}>
            {(['si', 'no', 'abstencion'] as const).map((v) => (
              <Pressable
                key={v}
                onPress={() => votar(v)}
                accessibilityRole="button"
                style={({ pressed }) => [s.opcion, { backgroundColor: VOTO[v].color }, pressed && { opacity: 0.85 }]}
              >
                <Text style={[s.opcionTxt, { color: VOTO[v].tinta }]}>
                  {VOTO[v].icono} {VOTO[v].texto}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => votar(null)} accessibilityRole="button" style={{ alignSelf: 'center', padding: 8 }}>
            <Text style={s.saltar}>Prefiero no votar esta</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Compartible titulo="Mi voto en el Congreso">
            <TarjetaLey ley={ley} datos={datos} nombre={lv.nombre} miVoto={miVoto} />
          </Compartible>
          {miVoto && ley.grupos && (
            <View style={s.caja}>
              <Text style={s.sub}>Votaron lo mismo que tú</Text>
              <View style={s.fila}>
                {Object.entries(datos.grupos)
                  .filter(([cod]) => coincide(miVoto, ley.grupos?.[cod]?.postura) === 1)
                  .map(([cod, g]) => (
                    <View key={cod} style={[s.chip, { backgroundColor: colorPartido(cod).color }]}>
                      <Text style={[s.chipTxt, { color: colorPartido(cod).tinta }]}>{g.corto}</Text>
                    </View>
                  ))}
              </View>
            </View>
          )}
          <Boton texto={ultima ? 'Ver mi resultado' : 'Siguiente ley ›'} onPress={siguiente} principal />
        </>
      )}
    </ScrollView>
  );
}

function Punto({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Text style={{ color: UI.acento, fontWeight: '900', fontSize: 16, lineHeight: 21 }}>•</Text>
      <Text style={s.p}>{children}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  cont: { padding: 16, paddingBottom: 56, gap: 12 },
  heroe: { backgroundColor: UI.marca, borderRadius: UI.radio, padding: 20, gap: 8 },
  heroeIcono: { fontSize: 36 },
  heroeTitulo: { fontFamily: SERIF, color: '#fff', fontSize: 30, fontWeight: '700' },
  heroeTxt: { color: UI.sobreMarca2, fontSize: 14, lineHeight: 20 },
  caja: { backgroundColor: UI.superficie, borderRadius: UI.radio, padding: 16, gap: 9 },
  p: { flex: 1, color: UI.texto, fontSize: 14, lineHeight: 21 },
  nombre: { fontFamily: SERIF, fontSize: 21, lineHeight: 28, fontWeight: '700', color: UI.texto },
  resumen: { fontSize: 15, lineHeight: 22, color: UI.texto2 },
  oficial: { fontSize: 12, color: UI.texto3, marginTop: 4 },
  enlace: { color: UI.acento, fontWeight: '600' },
  ia: { fontSize: 11, color: UI.texto3, fontStyle: 'italic' },
  pregunta: { fontFamily: SERIF, fontSize: 19, fontWeight: '700', color: UI.texto, textAlign: 'center', marginTop: 4 },
  opciones: { flexDirection: 'row', gap: 8 },
  opcion: { flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  opcionTxt: { fontWeight: '800', fontSize: 15 },
  saltar: { color: UI.texto2, textDecorationLine: 'underline' },
  sub: { fontWeight: '700', color: UI.marca2 },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  chipTxt: { fontWeight: '700', fontSize: 13 },
  progresoCab: { flexDirection: 'row', justifyContent: 'space-between' },
  atras: { color: UI.acento, fontWeight: '700', fontSize: 15 },
  contador: { color: UI.texto2, fontWeight: '700' },
  pista: { height: 6, backgroundColor: UI.marcaSuave, borderRadius: 3, overflow: 'hidden' },
  relleno: { height: 6, backgroundColor: UI.acento },
  botones: { flexDirection: 'row', gap: 10, justifyContent: 'center', flexWrap: 'wrap' },
});
