import React, { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton, Titulo } from '../componentes';
import { SERIF, UI, colorPartido } from '../estilo';
import { DIMENSIONES, PREGUNTAS, Pregunta, REFERENCIAS } from '../test/modelo';
import { Respuestas, calcular, dimensionMedible, etiquetaDimension, etiquetaIzqDer, valoresRespuesta } from '../test/calculo';
import type { Dataset } from '../tipos';

export interface EstadoTest {
  fase: 'intro' | 'preguntas' | 'resultados';
  indice: number;
  respuestas: Respuestas;
}
export const TEST_INICIAL: EstadoTest = { fase: 'intro', indice: 0, respuestas: {} };

const LIKERT = ['Muy de acuerdo', 'De acuerdo', 'Ni de acuerdo ni en desacuerdo', 'En desacuerdo', 'Muy en desacuerdo'];
const VALORES_LIKERT = [1, 0.5, 0, -0.5, -1];

export default function Test({ datos, estado, setEstado }: { datos: Dataset; estado: EstadoTest; setEstado: (e: EstadoTest) => void }) {
  if (estado.fase === 'intro') return <Intro empezar={() => setEstado({ ...TEST_INICIAL, fase: 'preguntas' })} />;
  if (estado.fase === 'preguntas') return <Preguntas datos={datos} estado={estado} setEstado={setEstado} />;
  return <Resultados datos={datos} estado={estado} setEstado={setEstado} />;
}

function Intro({ empezar }: { empezar: () => void }) {
  return (
    <ScrollView contentContainerStyle={s.cont}>
      <View style={s.heroe}>
        <Text style={s.heroeIcono}>🧭</Text>
        <Text style={s.heroeTitulo}>Brújula</Text>
        <Text style={s.heroeTxt}>40 preguntas para conocer tu orientación política y compararla con lo que cada grupo votó de verdad en el Congreso.</Text>
      </View>
      <View style={s.caja}>
        <Titulo tam={17}>Cómo funciona</Titulo>
        <Punto>Las preguntas proceden de escalas usadas en investigación revisada por pares (European Social Survey, Chapel Hill Expert Survey, CIS, escala NEP, valores de crianza de Feldman y Stenner…). Cada una muestra su fuente.</Punto>
        <Punto>Miden 6 dimensiones: economía, valores sociales, autoridad, inmigración, territorio y medio ambiente.</Punto>
        <Punto>La posición de los partidos no se basa en sus programas ni en opiniones: se calcula solo con sus votos oficiales en las leyes relacionadas con cada pregunta.</Punto>
        <Punto>Tardarás unos 8 minutos. Puedes saltarte cualquier pregunta.</Punto>
        <Punto>Tus respuestas no se guardan ni se envían a ningún sitio: se quedan en este móvil mientras usas la app.</Punto>
      </View>
      <View style={[s.caja, s.avisoCaja]}>
        <Text style={s.avisoTxt}>
          Esto no es una recomendación de voto. Es una orientación aproximada, con los límites que se explican al final.
        </Text>
      </View>
      <Boton texto="Empezar" onPress={empezar} principal />
    </ScrollView>
  );
}

function Punto({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.punto}>
      <Text style={s.puntoMarca}>•</Text>
      <Text style={s.p}>{children}</Text>
    </View>
  );
}

function Preguntas({ datos, estado, setEstado }: { datos: Dataset; estado: EstadoTest; setEstado: (e: EstadoTest) => void }) {
  const [verFuente, setVerFuente] = useState(false);
  const p = PREGUNTAS[estado.indice];
  const dim = DIMENSIONES.find((d) => d.id === p.dim)!;
  const actual = estado.respuestas[p.id];

  const responder = (v: number | null) => {
    const respuestas = { ...estado.respuestas, [p.id]: v };
    const ultima = estado.indice === PREGUNTAS.length - 1;
    setVerFuente(false);
    setEstado({ fase: ultima ? 'resultados' : 'preguntas', indice: ultima ? estado.indice : estado.indice + 1, respuestas });
  };
  const atras = () => {
    setVerFuente(false);
    if (estado.indice === 0) setEstado(TEST_INICIAL);
    else setEstado({ ...estado, indice: estado.indice - 1 });
  };

  let opciones: { texto: string; valor: number }[];
  if (p.tipo === 'likert') opciones = LIKERT.map((t, i) => ({ texto: t, valor: VALORES_LIKERT[i] }));
  else if (p.tipo === 'par') opciones = [
    { texto: p.opciones![0], valor: -1 },
    { texto: 'Las dos por igual', valor: 0 },
    { texto: p.opciones![1], valor: 1 },
  ];
  else opciones = (p.opciones ?? []).map((t, i) => ({ texto: t, valor: valoresRespuesta(p)[i] }));

  return (
    <ScrollView contentContainerStyle={s.cont}>
      <View style={s.progresoCab}>
        <Pressable onPress={atras} accessibilityRole="button">
          <Text style={s.atras}>‹ Anterior</Text>
        </Pressable>
        <Text style={s.contador}>
          {estado.indice + 1} / {PREGUNTAS.length}
        </Text>
      </View>
      <View style={s.pista}>
        <View style={[s.relleno, { width: `${((estado.indice + 1) / PREGUNTAS.length) * 100}%` }]} />
      </View>

      <View style={s.tarjetaPregunta}>
        <Text style={s.dimEtiqueta}>{dim.nombre}</Text>
        <Text style={s.pregunta}>{p.texto}</Text>
      </View>

      <View style={{ gap: 8 }}>
        {opciones.map((o) => {
          const elegida = actual === o.valor;
          return (
            <Pressable
              key={o.texto}
              onPress={() => responder(o.valor)}
              accessibilityRole="button"
              accessibilityState={{ selected: elegida }}
              style={({ pressed }) => [s.opcion, elegida && s.opcionElegida, pressed && { opacity: 0.85 }]}
            >
              <Text style={[s.opcionTxt, elegida && s.opcionTxtElegida]}>{o.texto}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={() => responder(null)} accessibilityRole="button" style={s.saltar}>
        <Text style={s.saltarTxt}>Prefiero no responder</Text>
      </Pressable>

      <Pressable onPress={() => setVerFuente(!verFuente)} accessibilityRole="button">
        <Text style={s.fuenteBtn}>{verFuente ? 'Ocultar la fuente' : '¿De dónde sale esta pregunta?'}</Text>
      </Pressable>
      {verFuente && <Fuente p={p} datos={datos} />}
    </ScrollView>
  );
}

function Fuente({ p, datos }: { p: Pregunta; datos: Dataset }) {
  const refs = REFERENCIAS.filter((r) => p.fuentes.includes(r.id));
  return (
    <View style={s.caja}>
      <Text style={s.p}>{p.nota}</Text>
      {refs.map((r) => (
        <Text key={r.id} style={[s.ref, r.url ? s.refLink : null]} onPress={r.url ? () => Linking.openURL(r.url) : undefined}>
          {r.cita}
        </Text>
      ))}
      <Text style={s.subt}>Leyes con las que se sitúa a los partidos</Text>
      {p.leyes.length && dimensionMedible(p.dim) ? (
        p.leyes.map((l) => {
          const ley = datos.leyes.find((x) => x.id === l.id);
          return (
            <Text key={l.id} style={s.pequeño}>
              {l.sentido === 1 ? '✓ Votar Sí = estar de acuerdo' : '✕ Votar Sí = estar en desacuerdo'} · {ley?.titulo.slice(0, 140) ?? l.id}
              {ley && ley.titulo.length > 140 ? '…' : ''}
            </Text>
          );
        })
      ) : (
        <Text style={s.pequeño}>Ninguna: esta pregunta solo cuenta para tu perfil, no para la afinidad con los partidos.</Text>
      )}
    </View>
  );
}

function Resultados({ datos, estado, setEstado }: { datos: Dataset; estado: EstadoTest; setEstado: (e: EstadoTest) => void }) {
  const r = useMemo(() => calcular(estado.respuestas, datos), [estado.respuestas, datos]);
  const grupos = Object.keys(datos.grupos);
  const eco = r.dimensiones.find((d) => d.id === 'eco')!;
  const soc = r.dimensiones.find((d) => d.id === 'soc')!;

  return (
    <ScrollView contentContainerStyle={s.cont}>
      <View style={s.heroe}>
        <Text style={s.heroeSub}>Tu orientación estimada</Text>
        {r.izqDer != null ? (
          <>
            <Text style={s.heroeTitulo}>{etiquetaIzqDer(r.izqDer)}</Text>
            <Escala10 valor={r.izqDer} />
            <Text style={s.heroeTxt}>
              {r.izqDer.toFixed(1).replace('.', ',')} en una escala de 1 (izquierda) a 10 (derecha), como la del CIS. Combina tus respuestas de economía, valores, autoridad, inmigración y medio ambiente.
            </Text>
          </>
        ) : (
          <Text style={s.heroeTxt}>No hay respuestas suficientes para estimarla.</Text>
        )}
      </View>

      {r.respondidas < 20 && (
        <View style={[s.caja, s.avisoCaja]}>
          <Text style={s.avisoTxt}>Has respondido {r.respondidas} de 40 preguntas: los resultados son poco fiables.</Text>
        </View>
      )}

      <View style={s.caja}>
        <Titulo tam={18}>Tu perfil en 6 dimensiones</Titulo>
        <Text style={s.pequeño}>El punto negro eres tú; los de color, cada grupo según sus votos.</Text>
        <View style={s.leyenda}>
          {grupos.map((g) => (
            <View key={g} style={s.leyendaItem}>
              <View style={[s.afPunto, { backgroundColor: colorPartido(g).color }]} />
              <Text style={s.pequeño}>{datos.grupos[g].corto}</Text>
            </View>
          ))}
        </View>
        {DIMENSIONES.map((d) => {
          const fila = r.dimensiones.find((x) => x.id === d.id)!;
          return (
            <View key={d.id} style={s.dim}>
              <Text style={s.dimNombre}>{d.nombre}</Text>
              <Text style={s.dimEtq}>{etiquetaDimension(d.id, fila.usuario)}</Text>
              <EjeDimension usuario={fila.usuario} grupos={dimensionMedible(d.id) ? fila.grupos : {}} />
              <View style={s.polos}>
                <Text style={s.polo}>{d.negativo}</Text>
                <Text style={s.polo}>{d.positivo}</Text>
              </View>
              {!dimensionMedible(d.id) && <Text style={s.pequeño}>Sin posición de los grupos: hay menos de dos leyes que permitan medirla.</Text>}
            </View>
          );
        })}
      </View>

      <View style={s.caja}>
        <Titulo tam={18}>Mapa: economía y valores</Titulo>
        <Mapa
          usuario={eco.usuario != null && soc.usuario != null ? { x: eco.usuario, y: soc.usuario } : null}
          grupos={grupos
            .filter((g) => eco.grupos[g] != null && soc.grupos[g] != null)
            .map((g) => ({ g, nombre: datos.grupos[g].corto, x: eco.grupos[g] as number, y: soc.grupos[g] as number }))}
        />
        <View style={s.leyenda}>
          {grupos.map((g) => (
            <View key={g} style={s.leyendaItem}>
              <View style={[s.afPunto, { backgroundColor: colorPartido(g).color }]} />
              <Text style={s.pequeño}>{datos.grupos[g].corto}</Text>
            </View>
          ))}
        </View>
        <Text style={s.pequeño}>Horizontal: más Estado (izquierda) o más mercado (derecha). Vertical: progresista (abajo) o tradicional (arriba), como el eje GAL–TAN. Varios grupos pueden coincidir en el mismo punto.</Text>
      </View>

      <View style={s.caja}>
        <Titulo tam={18}>Coincidencia con cada grupo</Titulo>
        {r.afinidades.length ? (
          r.afinidades.map((a) => (
            <View key={a.grupo} style={s.af}>
              <View style={[s.afPunto, { backgroundColor: colorPartido(a.grupo).color }]} />
              <Text style={s.afNombre}>{datos.grupos[a.grupo].corto}</Text>
              <View style={s.afPista}>
                <View style={[s.afBarra, { width: `${a.pct}%`, backgroundColor: colorPartido(a.grupo).color }]} />
              </View>
              <Text style={s.afPct}>{a.pct} %</Text>
            </View>
          ))
        ) : (
          <Text style={s.p}>Responde a alguna pregunta vinculada a leyes para ver la coincidencia.</Text>
        )}
        <Text style={s.pequeño}>
          Calculada con las {r.conLeyes} preguntas que respondiste y que están vinculadas a leyes votadas (distancia media por pregunta; Louwerse y Rosema, 2014). El Grupo Mixto reúne partidos distintos.
        </Text>
      </View>

      <View style={s.caja}>
        <Titulo tam={18}>Cómo leer estos resultados</Titulo>
        <Punto>Los grupos se sitúan solo con sus votos reales. En parlamentos como el español el voto refleja también la relación gobierno–oposición, no solo la ideología (Hix y Noury, 2016): los partidos del Gobierno tienden a votar Sí a todo lo que presenta.</Punto>
        <Punto>Un «No» puede significar rechazo de fondo o que la ley se queda corta. Por eso solo se sitúa a los grupos en dimensiones con al menos dos leyes distintas.</Punto>
        <Punto>Muchas leyes, sobre todo los decretos, mezclan medidas variadas; la relación de cada pregunta con sus leyes es una decisión de este proyecto y puedes revisarla en «¿De dónde sale esta pregunta?».</Punto>
        <Punto>Tu estimación de izquierda–derecha es una media de tus respuestas, no la de un estudio validado para esta muestra.</Punto>
        <Punto>Esto no es una recomendación de voto. Contrasta con los programas electorales y otras fuentes.</Punto>
      </View>

      <View style={s.caja}>
        <Titulo tam={18}>Referencias</Titulo>
        {REFERENCIAS.map((ref) => (
          <Text key={ref.id} style={[s.ref, ref.url ? s.refLink : null]} onPress={ref.url ? () => Linking.openURL(ref.url) : undefined}>
            {ref.cita}
          </Text>
        ))}
      </View>

      <View style={s.botones}>
        <Boton texto="Revisar respuestas" onPress={() => setEstado({ ...estado, fase: 'preguntas', indice: 0 })} />
        <Boton texto="Repetir el test" onPress={() => setEstado(TEST_INICIAL)} />
      </View>
    </ScrollView>
  );
}

function Escala10({ valor }: { valor: number }) {
  const pct = ((valor - 1) / 9) * 100;
  return (
    <View style={s.escala}>
      <View style={s.escalaPista} />
      <View style={[s.escalaMarca, { left: `${pct}%` }]} />
      <View style={s.escalaNums}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <Text key={n} style={s.escalaNum}>
            {n}
          </Text>
        ))}
      </View>
    </View>
  );
}

function EjeDimension({ usuario, grupos }: { usuario: number | null; grupos: Record<string, number | null> }) {
  const pos = (v: number) => `${((v + 1) / 2) * 100}%` as const;
  return (
    <View style={s.eje}>
      <View style={s.ejePista} />
      <View style={s.ejeCentro} />
      {Object.entries(grupos).map(([g, v]) =>
        v == null ? null : <View key={g} style={[s.ejeGrupo, { left: pos(v), backgroundColor: colorPartido(g).color }]} />,
      )}
      {usuario != null && <View style={[s.ejeUsuario, { left: pos(usuario) }]} />}
    </View>
  );
}

function Mapa({ usuario, grupos }: { usuario: { x: number; y: number } | null; grupos: { g: string; nombre: string; x: number; y: number }[] }) {
  const lado = 230;
  const px = (v: number) => ((v + 1) / 2) * (lado - 24) + 12;
  const py = (v: number) => ((1 - v) / 2) * (lado - 24) + 12;
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={s.mapaEje}>Tradicional</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[s.mapaEje, s.mapaEjeLado]}>Más{'\n'}Estado</Text>
        <View style={[s.mapa, { width: lado, height: lado }]}>
          <View style={[s.mapaLineaV, { left: lado / 2 }]} />
          <View style={[s.mapaLineaH, { top: lado / 2 }]} />
          {grupos.map((p) => (
            <View key={p.g} style={[s.mapaGrupo, { position: 'absolute', left: px(p.x) - 7, top: py(p.y) - 7, backgroundColor: colorPartido(p.g).color }]} />
          ))}
          {usuario && (
            <View style={[s.mapaUsuario, { left: px(usuario.x) - 11, top: py(usuario.y) - 11 }]}>
              <Text style={s.mapaUsuarioTxt}>Tú</Text>
            </View>
          )}
        </View>
        <Text style={[s.mapaEje, s.mapaEjeLado]}>Más{'\n'}mercado</Text>
      </View>
      <Text style={s.mapaEje}>Progresista</Text>
    </View>
  );
}

const s = StyleSheet.create({
  cont: { padding: 16, paddingBottom: 56, gap: 12 },
  heroe: { backgroundColor: UI.marca, borderRadius: UI.radio, padding: 20, gap: 8 },
  heroeIcono: { fontSize: 36 },
  heroeSub: { color: UI.sobreMarca2, fontSize: 14, fontWeight: '600' },
  heroeTitulo: { fontFamily: SERIF, color: UI.sobreMarca, fontSize: 30, fontWeight: '700' },
  heroeTxt: { color: UI.sobreMarca2, fontSize: 14, lineHeight: 20 },
  caja: { backgroundColor: UI.superficie, borderRadius: UI.radio, padding: 16, gap: 10 },
  avisoCaja: { backgroundColor: '#FFF4D6' },
  avisoTxt: { color: UI.texto, fontSize: 14, lineHeight: 20 },
  punto: { flexDirection: 'row', gap: 8 },
  puntoMarca: { color: UI.acento, fontSize: 16, lineHeight: 20, fontWeight: '900' },
  p: { flex: 1, color: UI.texto, fontSize: 14, lineHeight: 20 },
  pequeño: { color: UI.texto3, fontSize: 12, lineHeight: 17 },
  subt: { fontSize: 13, fontWeight: '700', color: UI.marca2, marginTop: 4 },
  ref: { color: UI.texto2, fontSize: 12, lineHeight: 17 },
  refLink: { color: UI.acento },
  progresoCab: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  atras: { color: UI.acento, fontWeight: '700', fontSize: 15 },
  contador: { color: UI.texto2, fontWeight: '700' },
  pista: { height: 6, backgroundColor: UI.marcaSuave, borderRadius: 3, overflow: 'hidden' },
  relleno: { height: 6, backgroundColor: UI.acento, borderRadius: 3 },
  tarjetaPregunta: { backgroundColor: UI.superficie, borderRadius: UI.radio, padding: 20, gap: 10, minHeight: 150, justifyContent: 'center' },
  dimEtiqueta: { alignSelf: 'flex-start', backgroundColor: UI.marcaSuave, color: UI.marca2, fontWeight: '700', fontSize: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
  pregunta: { fontFamily: SERIF, fontSize: 21, lineHeight: 29, color: UI.texto },
  opcion: { backgroundColor: UI.superficie, borderRadius: 14, borderWidth: 1.5, borderColor: UI.linea, paddingVertical: 14, paddingHorizontal: 16 },
  opcionElegida: { backgroundColor: UI.acento, borderColor: UI.acento },
  opcionTxt: { fontSize: 15, color: UI.texto },
  opcionTxtElegida: { color: '#fff', fontWeight: '700' },
  saltar: { alignSelf: 'center', paddingVertical: 8 },
  saltarTxt: { color: UI.texto2, textDecorationLine: 'underline' },
  fuenteBtn: { color: UI.acento, fontWeight: '600', textAlign: 'center' },
  escala: { marginTop: 6, marginBottom: 2 },
  escalaPista: { height: 8, borderRadius: 4, backgroundColor: UI.marca2 },
  escalaMarca: { position: 'absolute', top: -5, width: 18, height: 18, marginLeft: -9, borderRadius: 9, backgroundColor: '#fff', borderWidth: 3, borderColor: UI.acento },
  escalaNums: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  escalaNum: { color: UI.sobreMarca2, fontSize: 11 },
  dim: { gap: 4, paddingTop: 10, borderTopWidth: 1, borderTopColor: UI.linea },
  dimNombre: { fontSize: 15, fontWeight: '700', color: UI.texto },
  dimEtq: { fontSize: 13, color: UI.texto2 },
  eje: { height: 24, justifyContent: 'center', marginTop: 4 },
  ejePista: { height: 6, borderRadius: 3, backgroundColor: '#ECECF4' },
  ejeCentro: { position: 'absolute', left: '50%', width: 2, height: 14, marginLeft: -1, backgroundColor: '#C9C9DA' },
  ejeGrupo: { position: 'absolute', width: 12, height: 12, marginLeft: -6, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  ejeUsuario: { position: 'absolute', width: 20, height: 20, marginLeft: -10, borderRadius: 10, backgroundColor: UI.texto, borderWidth: 3, borderColor: '#fff' },
  polos: { flexDirection: 'row', justifyContent: 'space-between' },
  polo: { fontSize: 11, color: UI.texto3 },
  mapa: { backgroundColor: '#F7F7FC', borderRadius: 12, borderWidth: 1, borderColor: UI.linea, position: 'relative' },
  mapaLineaV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#D6D6E6' },
  mapaLineaH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#D6D6E6' },
  mapaGrupo: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#fff' },
  mapaUsuario: { position: 'absolute', width: 22, height: 22, borderRadius: 11, backgroundColor: UI.texto, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  mapaUsuarioTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  mapaEje: { fontSize: 11, color: UI.texto3, textAlign: 'center', marginVertical: 3 },
  mapaEjeLado: { width: 54 },
  af: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  afPunto: { width: 10, height: 10, borderRadius: 5 },
  afNombre: { width: 64, fontSize: 14, color: UI.texto, fontWeight: '600' },
  afPista: { flex: 1, height: 12, backgroundColor: '#EFEFF6', borderRadius: 6, overflow: 'hidden' },
  afBarra: { height: 12, borderRadius: 6 },
  afPct: { width: 44, textAlign: 'right', fontSize: 13, color: UI.texto, fontWeight: '700' },
  leyenda: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  botones: { flexDirection: 'row', gap: 10, justifyContent: 'center', flexWrap: 'wrap' },
});
