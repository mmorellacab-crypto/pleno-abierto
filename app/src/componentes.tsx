import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SERIF, TEMAS, TEMA_DESCONOCIDO, UI, VOTO, colorPartido } from './estilo';
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
          <View key={k} style={{ flex: n / total, backgroundColor: VOTO[k].color, borderRadius: alto / 2 }} />
        ))}
    </View>
  );
}

export function Cifras({ t }: { t: Ley['totales'] }) {
  return (
    <View style={s.cifras}>
      {(['si', 'no', 'abstencion'] as Postura[]).map((k) => (
        <View key={k} style={s.cifra}>
          <Text style={[s.cifraIcono, { color: VOTO[k].color }]}>{VOTO[k].icono}</Text>
          <Text style={s.cifraTxt}>
            {VOTO[k].texto} <Text style={s.negrita}>{t[k as 'si' | 'no' | 'abstencion']}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

export function Titulo({ children, tam = 20 }: { children: React.ReactNode; tam?: number }) {
  return <Text style={[s.titulo, { fontSize: tam, lineHeight: tam * 1.3 }]}>{children}</Text>;
}

export function Seccion({ children }: { children: React.ReactNode }) {
  return <Text style={s.seccion}>{children}</Text>;
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
        { backgroundColor: activo ? m.borde : m.fondo },
        activo === false && s.apagado,
      ]}
    >
      <Text style={[pequeño ? s.chipTxtPeq : s.chipTxt, activo && { color: '#fff', fontWeight: '700' }]}>
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

/** Grupo parlamentario con su color de partido: punto de color + nombre; relleno si está activo. */
export function ChipPartido({ cod, nombre, activo, onPress }: { cod: string; nombre: string; activo?: boolean; onPress?: () => void }) {
  const c = colorPartido(cod);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!activo }}
      style={[s.partido, activo && { backgroundColor: c.color, borderColor: c.color }]}
    >
      {!activo && <View style={[s.puntoPartido, { backgroundColor: c.color }]} />}
      <Text style={[s.partidoTxt, activo && { color: c.tinta, fontWeight: '700' }]}>{nombre}</Text>
    </Pressable>
  );
}

/** Marca de color del partido (barra vertical o punto). */
export function MarcaPartido({ cod, alto = 18 }: { cod: string; alto?: number }) {
  return <View style={{ width: 5, height: alto, borderRadius: 3, backgroundColor: colorPartido(cod).color }} />;
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
    <View style={[s.res, { backgroundColor: aprobada ? '#E3F6E5' : '#FDE7E7' }]}>
      <Text style={[s.resTxt, { color: aprobada ? '#11692A' : '#A32020' }]}>{aprobada ? '✓ Aprobada' : '✕ Rechazada'}</Text>
    </View>
  );
}

export function Boton({ texto, onPress, activo, principal }: { texto: string; onPress: () => void; activo?: boolean; principal?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!activo }}
      style={({ pressed }) => [s.boton, (activo || principal) && s.botonActivo, principal && s.botonPrincipal, pressed && { opacity: 0.8 }]}
    >
      <Text style={[s.botonTxt, (activo || principal) && s.botonTxtActivo]}>{texto}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  barra: { flexDirection: 'row', gap: 2, overflow: 'hidden' },
  cifras: { flexDirection: 'row', gap: 16, marginTop: 8, flexWrap: 'wrap' },
  cifra: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cifraIcono: { fontSize: 14, fontWeight: '900' },
  cifraTxt: { color: UI.texto2, fontSize: 13 },
  negrita: { color: UI.texto, fontWeight: '700' },
  titulo: { fontFamily: SERIF, color: UI.texto, fontWeight: '700' },
  seccion: { fontSize: 14, fontWeight: '700', color: UI.marca2, marginTop: 6 },
  chip: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: UI.radioChip },
  chipPeq: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  apagado: { opacity: 0.5 },
  chipTxt: { fontSize: 14, color: UI.texto },
  chipTxtPeq: { fontSize: 12, color: UI.texto },
  partido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: UI.radioChip,
    borderWidth: 1.5,
    borderColor: UI.linea,
    backgroundColor: UI.superficie,
  },
  puntoPartido: { width: 10, height: 10, borderRadius: 5 },
  partidoTxt: { fontSize: 14, color: UI.texto },
  etq: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  etqGrande: { paddingHorizontal: 10, paddingVertical: 4 },
  etqTxt: { fontSize: 12, fontWeight: '700' },
  etqTxtGrande: { fontSize: 14 },
  res: { borderRadius: 7, paddingHorizontal: 8, paddingVertical: 2 },
  resTxt: { fontSize: 12, fontWeight: '700' },
  boton: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: UI.radioChip,
    backgroundColor: UI.superficie,
    borderWidth: 1.5,
    borderColor: UI.linea,
  },
  botonActivo: { backgroundColor: UI.acento, borderColor: UI.acento },
  botonPrincipal: { paddingVertical: 13, paddingHorizontal: 20, alignItems: 'center', backgroundColor: UI.marca, borderColor: UI.marca },
  botonTxt: { fontSize: 14, color: UI.texto },
  botonTxtActivo: { color: '#ffffff', fontWeight: '700' },
});
