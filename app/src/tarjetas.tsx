import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { compartirVista, puedeCompartir } from './compartir';
import { SERIF, TEMAS, TEMA_DESCONOCIDO, UI, VOTO, colorPartido, fechaCorta } from './estilo';
import type { Dataset, Ley, Postura } from './tipos';

/** Envuelve una tarjeta y añade el botón «Compartir imagen» (solo en el móvil). */
export function Compartible({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);
  const [ocupado, setOcupado] = useState(false);
  return (
    <View style={{ gap: 10 }}>
      <View ref={ref} collapsable={false}>
        {children}
      </View>
      {puedeCompartir && (
        <Pressable
          accessibilityRole="button"
          disabled={ocupado}
          onPress={async () => {
            setOcupado(true);
            try {
              await compartirVista(ref, titulo);
            } finally {
              setOcupado(false);
            }
          }}
          style={({ pressed }) => [s.boton, pressed && { opacity: 0.85 }]}
        >
          <Text style={s.botonTxt}>{ocupado ? 'Preparando imagen…' : '↗ Compartir imagen'}</Text>
        </Pressable>
      )}
    </View>
  );
}

function Pie() {
  return (
    <View style={s.pie}>
      <Text style={s.pieMarca}>Pleno Abierto</Text>
      <Text style={s.pieTxt}>Datos: Congreso de los Diputados · App libre y gratuita</Text>
    </View>
  );
}

/** Tarjeta con el resultado de una votación y lo que votó cada grupo. */
export function TarjetaLey({ ley, datos, nombre, miVoto }: { ley: Ley; datos: Dataset; nombre?: string; miVoto?: Postura | null }) {
  const m = TEMAS[ley.tema] ?? TEMA_DESCONOCIDO;
  const tema = datos.temas.find((t) => t.id === ley.tema)?.nombre ?? ley.tema;
  const t = ley.totales;
  const total = t.si + t.no + t.abstencion + t.novota || 1;
  return (
    <View style={s.tarjeta}>
      <View style={s.cab}>
        <Text style={s.cabTema}>
          {m.icono} {tema}
        </Text>
        <Text style={s.cabFecha}>{fechaCorta(ley.fecha)}</Text>
      </View>
      <Text style={s.titulo} numberOfLines={4}>
        {nombre ?? ley.titulo}
      </Text>
      <View style={[s.resultado, { backgroundColor: ley.aprobada ? '#1F9D55' : '#D64545' }]}>
        <Text style={s.resultadoTxt}>{ley.aprobada ? 'APROBADA' : 'RECHAZADA'}</Text>
      </View>
      <View style={s.barra}>
        {(['si', 'abstencion', 'no'] as const).map((k) =>
          t[k] > 0 ? <View key={k} style={{ flex: t[k] / total, backgroundColor: VOTO[k].color, borderRadius: 6 }} /> : null,
        )}
      </View>
      <Text style={s.cifras}>
        ✓ Sí {t.si}   ✕ No {t.no}   ○ Abst. {t.abstencion}
      </Text>
      {ley.grupos && (
        <View style={s.grupos}>
          {Object.entries(datos.grupos).map(([cod, g]) => {
            const p = ley.grupos?.[cod]?.postura;
            if (!p) return null;
            return (
              <View key={cod} style={s.grupo}>
                <View style={[s.punto, { backgroundColor: colorPartido(cod).color }]} />
                <Text style={s.grupoTxt}>{g.corto}</Text>
                <Text style={[s.grupoVoto, { color: VOTO[p].color }]}>{VOTO[p].icono}</Text>
              </View>
            );
          })}
        </View>
      )}
      {miVoto && (
        <View style={s.mio}>
          <Text style={s.mioTxt}>
            Yo habría votado: <Text style={{ fontWeight: '800' }}>{VOTO[miVoto].texto}</Text>
          </Text>
        </View>
      )}
      <Pie />
    </View>
  );
}

/** Tarjeta de coincidencia con los grupos (Vota tú también o Brújula). */
export function TarjetaAfinidad({
  titular,
  subtitulo,
  afinidades,
  datos,
}: {
  titular: string;
  subtitulo: string;
  afinidades: { grupo: string; pct: number }[];
  datos: Dataset;
}) {
  return (
    <View style={s.tarjeta}>
      <Text style={s.cabTema}>{subtitulo}</Text>
      <Text style={[s.titulo, { fontSize: 24, lineHeight: 30 }]}>{titular}</Text>
      <View style={{ gap: 8, marginTop: 4 }}>
        {afinidades.slice(0, 6).map((a) => (
          <View key={a.grupo} style={s.af}>
            <Text style={s.afNombre}>{datos.grupos[a.grupo]?.corto ?? a.grupo}</Text>
            <View style={s.afPista}>
              <View style={[s.afBarra, { width: `${a.pct}%`, backgroundColor: colorPartido(a.grupo).color }]} />
            </View>
            <Text style={s.afPct}>{a.pct}%</Text>
          </View>
        ))}
      </View>
      <Text style={s.nota}>Coincidencia con lo que votó cada grupo en el Congreso. No es una recomendación de voto.</Text>
      <Pie />
    </View>
  );
}

const s = StyleSheet.create({
  tarjeta: { backgroundColor: UI.marca, borderRadius: 22, padding: 20, gap: 10 },
  cab: { flexDirection: 'row', justifyContent: 'space-between' },
  cabTema: { color: UI.sobreMarca2, fontSize: 13, fontWeight: '700' },
  cabFecha: { color: UI.sobreMarca2, fontSize: 13 },
  titulo: { fontFamily: SERIF, color: '#fff', fontSize: 19, lineHeight: 25, fontWeight: '700' },
  resultado: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  resultadoTxt: { color: '#fff', fontWeight: '900', letterSpacing: 1, fontSize: 13 },
  barra: { flexDirection: 'row', gap: 3, height: 14 },
  cifras: { color: '#fff', fontSize: 14, fontWeight: '600' },
  grupos: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  grupo: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  punto: { width: 9, height: 9, borderRadius: 5 },
  grupoTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  grupoVoto: { fontSize: 13, fontWeight: '900' },
  mio: { backgroundColor: '#fff', borderRadius: 10, padding: 10 },
  mioTxt: { color: UI.marca, fontSize: 15 },
  af: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  afNombre: { width: 70, color: '#fff', fontWeight: '700', fontSize: 14 },
  afPista: { flex: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 6, overflow: 'hidden' },
  afBarra: { height: 12, borderRadius: 6 },
  afPct: { width: 42, textAlign: 'right', color: '#fff', fontWeight: '800' },
  nota: { color: UI.sobreMarca2, fontSize: 11 },
  pie: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 8, marginTop: 4 },
  pieMarca: { fontFamily: SERIF, color: '#fff', fontWeight: '700', fontSize: 15 },
  pieTxt: { color: UI.sobreMarca2, fontSize: 11 },
  boton: { alignSelf: 'center', backgroundColor: UI.acento, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10 },
  botonTxt: { color: '#fff', fontWeight: '700' },
});
