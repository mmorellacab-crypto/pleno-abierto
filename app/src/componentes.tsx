import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TEMAS, TEMA_DESCONOCIDO, UI, VOTO } from './estilo';
import type { Ley, Postura } from './tipos';

/** Barra apilada Sí | Abstención | No | No vota, con huecos de 2 px entre tramos. */
export function BarraVotos({ t, alto = 10 }: { t: Ley['totales']; alto?: number }) {
  const tramos: [Postura, number][] = [
    ['si', t.si],
    ['abstencion', t.abstencion],
    ['no', t.no],
    ['novota', t.novota],
  ];
  const total = tramos.reduce((s, [, n]) => s + n, 0) || 1;
  return (
    <View
      style={[s.barra, { height: alto }]}
      accessible
      accessibilityLabel={`Sí ${t.si}, No ${t.no}, Abstención ${t.abstencion}, No votan ${t.novota}`}
    >
      {tramos
        .filter(([, n]) => n > 0)
        .map(([k, n]) => (
          <View key={k} style={{ flex: n / total, backgroundColor: VOTO[k].color, borderRadius: 3 }} />
        ))}
    </View>
  );
}

export function Cifras({ t }: { t: Ley['totales'] }) {
  return (
    <View style={s.cifras}>
      {(['si', 'no', 'abstencion'] as Postura[]).map((k) => (
        <View key={k} style={s.cifra}>
          <View style={[s.punto, { backgroundColor: VOTO[k].color }]} />
          <Text style={s.cifraTxt}>
            {VOTO[k].texto} <Text style={s.negrita}>{t[k as 'si' | 'no' | 'abstencion']}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

export function ChipTema({
  id,
  nombre,
  activo,
  onPress,
  pequeño,
}: {
  id: string;
  nombre: string;
  activo?: boolean;
  onPress?: () => void;
  pequeño?: boolean;
}) {
  const m = TEMAS[id] ?? TEMA_DESCONOCIDO;
  const contenido = (
    <View
      style={[
        s.chip,
        pequeño && s.chipPeq,
        { backgroundColor: m.fondo, borderColor: activo ? m.borde : 'transparent' },
        activo === false && s.chipApagado,
      ]}
    >
      <Text style={pequeño ? s.chipTxtPeq : s.chipTxt}>
        {m.icono} {nombre}
      </Text>
    </View>
  );
  if (!onPress) return contenido;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!activo }}>
      {contenido}
    </Pressable>
  );
}

export function Etiqueta({ postura, grande }: { postura: Postura; grande?: boolean }) {
  const v = VOTO[postura];
  return (
    <View style={[s.etq, grande && s.etqGrande, { backgroundColor: v.color }]}>
      <Text style={[s.etqTxt, grande && s.etqTxtGrande, { color: v.tinta }]}>
        {v.icono} {v.texto}
      </Text>
    </View>
  );
}

export function Resultado({ aprobada }: { aprobada: boolean }) {
  return (
    <View style={[s.res, { borderColor: aprobada ? '#0ca30c' : '#d03b3b' }]}>
      <Text style={[s.resTxt, { color: aprobada ? '#006300' : '#b02a2a' }]}>
        {aprobada ? '✓ Aprobada' : '✕ Rechazada'}
      </Text>
    </View>
  );
}

export function Boton({ texto, onPress, activo }: { texto: string; onPress: () => void; activo?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!activo }}
      style={[s.boton, activo && s.botonActivo]}
    >
      <Text style={[s.botonTxt, activo && s.botonTxtActivo]}>{texto}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  barra: { flexDirection: 'row', gap: 2, borderRadius: 4, overflow: 'hidden', backgroundColor: UI.superficie },
  cifras: { flexDirection: 'row', gap: 14, marginTop: 6, flexWrap: 'wrap' },
  cifra: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  punto: { width: 9, height: 9, borderRadius: 5 },
  cifraTxt: { color: UI.texto2, fontSize: 13 },
  negrita: { color: UI.texto, fontWeight: '700' },
  chip: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, borderWidth: 2 },
  chipPeq: { paddingHorizontal: 8, paddingVertical: 2, borderWidth: 0 },
  chipApagado: { opacity: 0.55 },
  chipTxt: { fontSize: 14, color: UI.texto },
  chipTxtPeq: { fontSize: 12, color: UI.texto },
  etq: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  etqGrande: { paddingHorizontal: 10, paddingVertical: 4 },
  etqTxt: { fontSize: 12, fontWeight: '700' },
  etqTxtGrande: { fontSize: 14 },
  res: { borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 1 },
  resTxt: { fontSize: 12, fontWeight: '700' },
  boton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: UI.superficie,
    borderWidth: 1,
    borderColor: UI.linea,
  },
  botonActivo: { backgroundColor: UI.texto, borderColor: UI.texto },
  botonTxt: { fontSize: 14, color: UI.texto },
  botonTxtActivo: { color: '#ffffff', fontWeight: '600' },
});
