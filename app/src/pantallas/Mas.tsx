import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { leer, guardar } from '../almacen';
import { activarAvisos, avisosDisponibles, desactivarAvisos } from '../avisos';
import { Titulo } from '../componentes';
import { SERIF, UI, fechaCorta } from '../estilo';
import type { Dataset } from '../tipos';

export type SubMas = 'menu' | 'partidos' | 'avisos' | 'promesas' | 'fuentes';

const OPCIONES: { id: SubMas; icono: string; titulo: string; texto: string }[] = [
  { id: 'avisos', icono: '🔔', titulo: 'Próximas votaciones y avisos', texto: 'Qué se va a votar y notificaciones con el resultado' },
  { id: 'partidos', icono: '🏛️', titulo: 'Partidos', texto: 'Cómo vota cada grupo por tipo de ley y con quién coincide' },
  { id: 'promesas', icono: '🚦', titulo: 'Promesas vs hechos', texto: 'Programa electoral de 2023 frente a lo que votó cada partido' },
  { id: 'fuentes', icono: 'ℹ️', titulo: 'Fuentes, licencias y privacidad', texto: 'De dónde salen los datos y cómo se usan' },
];

export function MenuMas({ ir }: { ir: (s: SubMas) => void }) {
  return (
    <ScrollView contentContainerStyle={s.cont}>
      {OPCIONES.map((o) => (
        <Pressable key={o.id} onPress={() => ir(o.id)} style={({ pressed }) => [s.opcion, pressed && { opacity: 0.85 }]} accessibilityRole="button">
          <Text style={s.icono}>{o.icono}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.titulo}>{o.titulo}</Text>
            <Text style={s.texto}>{o.texto}</Text>
          </View>
          <Text style={s.flecha}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function Avisos({ datos }: { datos: Dataset }) {
  const [activo, setActivo] = useState(false);
  const [mensaje, setMensaje] = useState('');
  useEffect(() => {
    leer('avisos-activos', false).then(setActivo);
  }, []);

  const cambiar = async (v: boolean) => {
    if (v) {
      const r = await activarAvisos();
      if (r === 'ok') {
        setActivo(true);
        guardar('avisos-activos', true);
        setMensaje('Avisos activados. Recibirás una notificación cuando se anuncie una votación y cuando se publique su resultado.');
      } else if (r === 'denegado') setMensaje('Para recibir avisos, permite las notificaciones de Pleno Abierto en los ajustes del móvil.');
      else setMensaje('Los avisos solo funcionan en la app instalada en el móvil.');
    } else {
      await desactivarAvisos();
      setActivo(false);
      guardar('avisos-activos', false);
      setMensaje('Avisos desactivados.');
    }
  };

  const proximas = datos.proximas ?? [];
  return (
    <ScrollView contentContainerStyle={s.cont}>
      <View style={s.caja}>
        <View style={s.filaSwitch}>
          <View style={{ flex: 1 }}>
            <Titulo tam={17}>Avisarme de las votaciones</Titulo>
            <Text style={s.texto}>Cuando se anuncie una votación y cuando se publique su resultado (con tarjeta para compartir).</Text>
          </View>
          <Switch value={activo} onValueChange={cambiar} disabled={!avisosDisponibles} trackColor={{ true: UI.acento, false: '#D6D6E6' }} />
        </View>
        {mensaje ? <Text style={s.mensaje}>{mensaje}</Text> : null}
        <Text style={s.nota}>
          La app comprueba los datos públicos cada pocas horas en segundo plano, así que el aviso puede llegar con algo de retraso. No se usa ningún servidor de notificaciones ni se guarda ningún identificador tuyo.
        </Text>
      </View>

      <Titulo tam={19}>Próximas votaciones</Titulo>
      {proximas.length === 0 && <Text style={s.texto}>No hay votaciones anunciadas ahora mismo.</Text>}
      {proximas.map((p) => (
        <View key={p.id} style={s.caja}>
          <View style={s.cabProx}>
            <Text style={s.fecha}>{fechaCorta(p.fecha)}</Text>
            <Text style={[s.estado, p.estado === 'publicada' && { backgroundColor: '#E3F6E5', color: '#11692A' }]}>{ESTADO[p.estado] ?? p.estado}</Text>
          </View>
          <Text style={s.tituloProx}>{p.titulo}</Text>
          {p.articulos.filter((a) => !a.startsWith('«')).length > 0 && (
            <View style={{ gap: 3 }}>
              <Text style={s.sub}>Qué contiene (índice oficial del BOE)</Text>
              {p.articulos.filter((a) => !a.startsWith('«')).map((a) => (
                <Text key={a} style={s.art}>
                  · {a}
                </Text>
              ))}
            </View>
          )}
          {p.totales && (
            <Text style={s.texto}>
              Resultado: Sí {p.totales.si} · No {p.totales.no} · Abst. {p.totales.abstencion} {p.aprobada != null ? (p.aprobada ? '· Aprobada' : '· Rechazada') : ''}
            </Text>
          )}
          <View style={s.enlaces}>
            {p.eli && (
              <Text style={s.enlace} onPress={() => Linking.openURL(p.eli!)}>
                ↗ Texto en el BOE
              </Text>
            )}
            <Text style={s.enlace} onPress={() => Linking.openURL(p.fuente)}>
              ↗ Anuncio del Congreso
            </Text>
          </View>
        </View>
      ))}
      <Text style={s.nota}>Agenda obtenida de El Congreso en tu mano a partir de las notas oficiales del Congreso. Las fechas pueden cambiar.</Text>
    </ScrollView>
  );
}

const ESTADO: Record<string, string> = { prevista: 'Prevista', pendiente: 'Pendiente', votada: 'Votada', publicada: 'Resultado publicado' };

export function Promesas() {
  return (
    <ScrollView contentContainerStyle={s.cont}>
      <View style={s.heroe}>
        <Text style={s.heroeTitulo}>🚦 Promesas vs hechos</Text>
        <Text style={s.heroeTxt}>
          Para cada partido: promesas verificables de su programa de las elecciones de 2023 relacionadas con leyes votadas, y si su voto en el Congreso fue coherente con ellas.
        </Text>
      </View>
      <View style={s.caja}>
        <Titulo tam={17}>En preparación</Titulo>
        <Text style={s.texto}>
          Estamos revisando los programas de todos los partidos con el mismo criterio antes de publicar ningún semáforo. Cada promesa irá con la cita y la página del programa, y la votación oficial con la que se compara.
        </Text>
        <Text style={s.nota}>Semáforo: 🟢 voto coherente con la promesa · 🟡 coherencia parcial o abstención · 🔴 voto contrario a la promesa.</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  cont: { padding: 16, paddingBottom: 48, gap: 10 },
  opcion: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: UI.superficie, borderRadius: UI.radio, padding: 16 },
  icono: { fontSize: 26 },
  titulo: { fontSize: 16, fontWeight: '700', color: UI.texto },
  texto: { fontSize: 13, color: UI.texto2, lineHeight: 19 },
  flecha: { fontSize: 26, color: UI.texto3 },
  caja: { backgroundColor: UI.superficie, borderRadius: UI.radio, padding: 16, gap: 8 },
  filaSwitch: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mensaje: { color: UI.marca2, fontSize: 13, fontWeight: '600' },
  nota: { color: UI.texto3, fontSize: 12, lineHeight: 17 },
  cabProx: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fecha: { fontWeight: '700', color: UI.marca2 },
  estado: { backgroundColor: UI.marcaSuave, color: UI.marca2, fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  tituloProx: { fontFamily: SERIF, fontSize: 16, lineHeight: 22, color: UI.texto },
  sub: { fontSize: 12, fontWeight: '700', color: UI.texto2 },
  art: { fontSize: 12, color: UI.texto2 },
  enlaces: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  enlace: { color: UI.acento, fontWeight: '600' },
  heroe: { backgroundColor: UI.marca, borderRadius: UI.radio, padding: 20, gap: 6 },
  heroeTitulo: { fontFamily: SERIF, color: '#fff', fontSize: 26, fontWeight: '700' },
  heroeTxt: { color: UI.sobreMarca2, fontSize: 14, lineHeight: 20 },
});
