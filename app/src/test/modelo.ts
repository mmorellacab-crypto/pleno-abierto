// Banco de preguntas del test «Brújula». Cada afirmación procede (adaptada y traducida) de
// instrumentos usados en investigación revisada por pares, o sigue el formato de afirmación de las
// aplicaciones de consejo de voto (VAA) cuando se refiere a una ley concreta. Ver REFERENCIAS.
//
// Convenciones:
// - Respuesta del usuario en escala de acuerdo: -1 (muy en desacuerdo) … +1 (muy de acuerdo).
//   En preguntas «par» y «opciones», -1 es la primera opción y +1 la última.
// - `clave`: +1 si responder +1 acerca al polo positivo de la dimensión; -1 si aleja.
// - Orientación de los ejes como el CHES: el polo izquierdo es el asociado a la izquierda / GAL y el
//   derecho a la derecha / TAN (excepto Territorio, que no se asocia a izquierda-derecha).
// - `leyes[].sentido`: +1 si votar Sí a esa ley equivale a estar DE ACUERDO con la afirmación.
//   La posición de cada grupo en la pregunta se calcula SOLO con sus votos oficiales en esas leyes.

export type DimId = 'eco' | 'soc' | 'aut' | 'inm' | 'ter' | 'amb';

export interface Dimension {
  id: DimId;
  nombre: string;
  negativo: string; // polo -1
  positivo: string; // polo +1
  descripcion: string;
}

export const DIMENSIONES: Dimension[] = [
  {
    id: 'eco',
    nombre: 'Economía',
    negativo: 'Más Estado',
    positivo: 'Más mercado',
    descripcion: 'Redistribución, regulación y gasto público (eje izquierda-derecha económico del Chapel Hill Expert Survey).',
  },
  {
    id: 'soc',
    nombre: 'Valores sociales',
    negativo: 'Progresista',
    positivo: 'Tradicional',
    descripcion: 'Libertades personales, igualdad de género y moral (eje GAL–TAN de Hooghe, Marks y Wilson).',
  },
  {
    id: 'aut',
    nombre: 'Autoridad',
    negativo: 'Autonomía',
    positivo: 'Orden',
    descripcion: 'Preferencia por la autonomía o por el orden y la obediencia (valores de crianza de Feldman y Stenner).',
  },
  {
    id: 'inm',
    nombre: 'Inmigración',
    negativo: 'Más apertura',
    positivo: 'Más control',
    descripcion: 'Actitudes ante la inmigración (módulo de inmigración de la European Social Survey).',
  },
  {
    id: 'ter',
    nombre: 'Territorio',
    negativo: 'Más centralización',
    positivo: 'Más autogobierno',
    descripcion: 'Modelo territorial e identidad (pregunta del CIS sobre organización del Estado y pregunta Linz–Moreno).',
  },
  {
    id: 'amb',
    nombre: 'Medio ambiente',
    negativo: 'Prioridad ambiental',
    positivo: 'Prioridad crecimiento',
    descripcion: 'Visión ecológica y apoyo a políticas climáticas (escala NEP y módulo climático de la ESS).',
  },
];

export interface Referencia {
  id: string;
  cita: string;
  url: string; // vacío si no hay enlace verificado
}

export const REFERENCIAS: Referencia[] = [
  { id: 'bafumi2010', cita: 'Bafumi, J., y Herron, M. C. (2010). Leapfrog representation and extremism: A study of American voters and their members in Congress. American Political Science Review, 104(3), 519–542.', url: 'https://doi.org/10.1017/S0003055410000316' },
  { id: 'louwerse2014', cita: 'Louwerse, T., y Rosema, M. (2014). The design effects of voting advice applications: Comparing methods of calculating matches. Acta Politica, 49(3), 286–312.', url: 'https://www.tomlouwerse.nl/publications/2014-louwerse-rosema-actapolitica/' },
  { id: 'rosema2016', cita: 'Rosema, M., y Louwerse, T. (2016). Response scales in voting advice applications: Do different designs produce different outcomes? Policy & Internet, 8(4), 431–456.', url: 'https://doi.org/10.1002/poi3.139' },
  { id: 'garzia2012', cita: 'Garzia, D., y Marschall, S. (2012). Voting advice applications under review: The state of research. International Journal of Electronic Governance, 5(3/4), 203–222.', url: 'https://doi.org/10.1504/IJEG.2012.051309' },
  { id: 'hix2016', cita: 'Hix, S., y Noury, A. (2016). Government-opposition or left-right? The institutional determinants of voting in legislatures. Political Science Research and Methods, 4(2), 249–273.', url: 'https://doi.org/10.1017/psrm.2015.9' },
  { id: 'hooghe2002', cita: 'Hooghe, L., Marks, G., y Wilson, C. J. (2002). Does left/right structure party positions on European integration? Comparative Political Studies, 35(8), 965–989.', url: 'https://doi.org/10.1177/001041402236310' },
  { id: 'jolly2022', cita: 'Jolly, S., Bakker, R., Hooghe, L., Marks, G., Polk, J., Rovny, J., Steenbergen, M., y Vachudova, M. A. (2022). Chapel Hill Expert Survey trend file, 1999–2019. Electoral Studies, 75, 102420.', url: 'https://doi.org/10.1016/j.electstud.2021.102420' },
  { id: 'feldman1997', cita: 'Feldman, S., y Stenner, K. (1997). Perceived threat and authoritarianism. Political Psychology, 18(4), 741–770.', url: 'https://doi.org/10.1111/0162-895X.00077' },
  { id: 'feldman2014', cita: 'Feldman, S., y Johnston, C. (2014). Understanding the determinants of political ideology: Implications of structural complexity. Political Psychology, 35(3), 337–358.', url: 'https://doi.org/10.1111/pops.12055' },
  { id: 'everett2013', cita: 'Everett, J. A. C. (2013). The 12 item Social and Economic Conservatism Scale (SECS). PLOS ONE, 8(12), e82131.', url: 'https://doi.org/10.1371/journal.pone.0082131' },
  { id: 'knutsen1995', cita: 'Knutsen, O. (1995). Value orientations, political conflicts and left-right identification: A comparative study. European Journal of Political Research, 28(1), 63–93.', url: '' },
  { id: 'jaeger2006', cita: 'Jæger, M. M. (2006). What makes people support public responsibility for welfare provision: Self-interest or political ideology? Acta Sociologica, 49(3), 321–338.', url: '' },
  { id: 'davidov2008', cita: 'Davidov, E., Meuleman, B., Billiet, J., y Schmidt, P. (2008). Values and support for immigration: A cross-country comparison. European Sociological Review, 24(5), 583–599.', url: 'https://doi.org/10.1093/esr/jcn020' },
  { id: 'jackson2011', cita: 'Jackson, J., Bradford, B., Hough, M., Kuha, J., Stares, S., Widdop, S., Fitzgerald, R., Yordanova, M., y Galev, T. (2011). Developing European indicators of trust in justice. European Journal of Criminology, 8(4), 267–285.', url: 'https://doi.org/10.1177/1477370811411458' },
  { id: 'dunlap2000', cita: 'Dunlap, R. E., Van Liere, K. D., Mertig, A. G., y Jones, R. E. (2000). Measuring endorsement of the New Ecological Paradigm: A revised NEP scale. Journal of Social Issues, 56(3), 425–442.', url: 'https://doi.org/10.1111/0022-4537.00176' },
  { id: 'poortinga2019', cita: 'Poortinga, W., Whitmarsh, L., Steg, L., Böhm, G., y Fisher, S. (2019). Climate change perceptions and their individual-level determinants: A cross-European analysis. Global Environmental Change, 55, 25–35.', url: 'https://doi.org/10.1016/j.gloenvcha.2019.01.007' },
  { id: 'moreno2006', cita: 'Moreno, L. (2006). Scotland, Catalonia, Europeanization and the «Moreno question». Scottish Affairs, 54(1), 1–21.', url: 'https://ipp.csic.es/workpaper/scotland-catalonia-europeanization-moreno-question' },
  { id: 'navarro2015', cita: 'Navarro Ardoy, L. (2015). Las huellas electorales del nacionalismo español. Identificación territorial y voto en los partidos políticos de ámbito estatal, 1980-2013. Revista Internacional de Sociología, 73(1), e001.', url: 'https://doi.org/10.3989/ris.2012.02.12' },
  { id: 'krosnick1999', cita: 'Krosnick, J. A. (1999). Survey research. Annual Review of Psychology, 50, 537–567.', url: 'https://doi.org/10.1146/annurev.psych.50.1.537' },
  { id: 'ess', cita: 'European Social Survey ERIC. Cuestionarios fuente de las rondas 1–11 (módulos básicos, inmigración, justicia y clima).', url: 'https://www.europeansocialsurvey.org/methodology/ess-methodology/source-questionnaire' },
  { id: 'issp', cita: 'International Social Survey Programme. Módulos «Role of Government» y «Family and Changing Gender Roles».', url: 'https://issp.org' },
  { id: 'evs', cita: 'European Values Study. Batería de justificabilidad (aborto, eutanasia).', url: 'https://europeanvaluesstudy.eu' },
  { id: 'cis', cita: 'Centro de Investigaciones Sociológicas. Barómetros: preferencia sobre la organización territorial del Estado y sentimiento de identidad.', url: 'https://www.cis.es' },
];

export type Tipo = 'likert' | 'par' | 'opciones';

export interface Pregunta {
  id: string;
  dim: DimId;
  tipo: Tipo;
  texto: string;
  opciones?: string[]; // para 'par' (2) y 'opciones' (5)
  clave: 1 | -1;
  origen: 'escala' | 'vaa'; // escala validada / afirmación de formato VAA sobre una ley concreta
  fuentes: string[];
  nota: string; // de qué ítem procede o cómo se adaptó
  leyes: { id: string; sentido: 1 | -1 }[];
}

const L = {
  gravamen: 'real-decreto-ley-10-2024-de-23-de-diciembre-para-el-establec',
  impuestoMinimo: 'proyecto-de-ley-por-la-que-se-establecen-un-impuesto-complem',
  alquiler2026: 'real-decreto-ley-8-2026-de-20-de-marzo-de-medidas-en-el-alqu',
  lanzamientos: 'real-decreto-ley-1-2024-de-14-de-mayo-por-el-que-se-prorroga',
  vulnerabilidad: 'real-decreto-ley-2-2026-de-3-de-febrero-por-el-que-se-adopta',
  pensiones: 'real-decreto-ley-3-2026-de-3-de-febrero-para-la-revalorizaci',
  retribuciones: 'real-decreto-ley-14-2025-de-2-de-diciembre-por-el-que-se-apr',
  transporte1: 'real-decreto-ley-17-2025-de-23-de-diciembre-de-medidas-de-pr',
  transporte2: 'real-decreto-ley-14-2026-de-9-de-junio-de-medidas-de-promoci',
  transporte3: 'real-decreto-ley-5-2025-de-10-de-junio-de-medidas-de-promoci',
  transporte4: 'real-decreto-ley-3-2024-de-4-de-junio-de-medidas-de-promocio',
  terapias: 'proposicion-de-ley-organica-por-la-que-se-modifica-la-ley-or-2',
  paridad1: 'votacion-de-conjunto-del-proyecto-de-ley-organica-de-represe',
  paridad2: 'proyecto-de-ley-organica-de-representacion-paritaria-y-prese',
  permisos: 'real-decreto-ley-9-2025-de-29-de-julio-por-el-que-se-amplia',
  memoria: 'real-decreto-ley-6-2026-de-3-de-marzo-por-el-que-se-modifica',
  reincidencia: 'votacion-de-conjunto-de-la-proposicion-de-ley-organica-en-ma',
  menores: 'real-decreto-ley-2-2025-de-18-de-marzo-por-el-que-se-aprueba',
  nacionalidad: 'proposicion-de-ley-sobre-concesion-de-nacionalidad-espanola',
  convenio: 'proyecto-de-ley-por-la-que-se-modifica-la-ley-28-1990-de-26',
  concierto: 'proyecto-de-ley-por-la-que-se-modifica-la-ley-12-2002-de-23',
  amnistia: 'proposicion-de-ley-organica-de-amnistia-para-la-normalizacio',
  ap9: 'proposicion-de-ley-organica-de-transferencia-de-la-titularid',
  moves: 'real-decreto-ley-3-2025-de-1-de-abril-por-el-que-se-establec',
  movilidad: 'proyecto-de-ley-de-movilidad-sostenible',
  desperdicio: 'proyecto-de-ley-de-prevencion-de-las-perdidas-y-el-desperdic-2',
};

const CRIANZA = 'Pregunta de valores de crianza (elegir entre dos cualidades), usada para medir la predisposición autoritaria.';

const BANCO: Pregunta[] = [
  // ── Economía ──────────────────────────────────────────────
  { id: 'E1', dim: 'eco', tipo: 'likert', clave: -1, origen: 'escala', fuentes: ['ess', 'jaeger2006'],
    texto: 'El Estado debería tomar medidas para reducir las diferencias de ingresos entre quienes más y quienes menos ganan.',
    nota: 'Traducción del ítem «gincdif» del cuestionario básico de la ESS.',
    leyes: [{ id: L.gravamen, sentido: 1 }] },
  { id: 'E2', dim: 'eco', tipo: 'likert', clave: 1, origen: 'escala', fuentes: ['jolly2022', 'issp'],
    texto: 'Bajar los impuestos a las grandes empresas es mejor para la economía que subirlos.',
    nota: 'Adaptado de la dimensión de redistribución y desregulación del CHES y de la batería de impuestos del ISSP.',
    leyes: [{ id: L.gravamen, sentido: -1 }, { id: L.impuestoMinimo, sentido: -1 }] },
  { id: 'E3', dim: 'eco', tipo: 'likert', clave: -1, origen: 'escala', fuentes: ['issp', 'jaeger2006'],
    texto: 'Es responsabilidad del Estado garantizar una vivienda digna a quien no puede pagarla, aunque eso suponga limitar los alquileres.',
    nota: 'Adaptado del ítem de vivienda del módulo «Role of Government» del ISSP.',
    leyes: [{ id: L.alquiler2026, sentido: 1 }, { id: L.lanzamientos, sentido: 1 }] },
  { id: 'E4', dim: 'eco', tipo: 'likert', clave: 1, origen: 'escala', fuentes: ['jolly2022', 'everett2013'],
    texto: 'Cuando el Estado interviene en el mercado del alquiler, al final hay menos viviendas disponibles.',
    nota: 'Afirmación pro-mercado construida a partir de la dimensión de desregulación del CHES (redacción inversa para equilibrar la escala).',
    leyes: [{ id: L.alquiler2026, sentido: -1 }, { id: L.vulnerabilidad, sentido: -1 }] },
  { id: 'E5', dim: 'eco', tipo: 'likert', clave: -1, origen: 'escala', fuentes: ['issp', 'jaeger2006'],
    texto: 'Las pensiones públicas deberían subir cada año, como mínimo, lo mismo que los precios.',
    nota: 'Adaptado del ítem «nivel de vida digno para las personas mayores» del ISSP «Role of Government».',
    leyes: [{ id: L.pensiones, sentido: 1 }] },
  { id: 'E6', dim: 'eco', tipo: 'likert', clave: 1, origen: 'escala', fuentes: ['issp', 'everett2013'],
    texto: 'Habría que reducir el gasto público, aunque eso suponga recortar algunos servicios.',
    nota: 'Adaptado del ítem «recortes del gasto público» del ISSP «Role of Government».',
    leyes: [{ id: L.retribuciones, sentido: -1 }] },
  { id: 'E7', dim: 'eco', tipo: 'likert', clave: -1, origen: 'escala', fuentes: ['issp'],
    texto: 'El transporte público debería estar subvencionado para que sea barato o gratuito.',
    nota: 'Adaptado de la batería de gasto público del ISSP «Role of Government».',
    leyes: [{ id: L.transporte1, sentido: 1 }, { id: L.transporte2, sentido: 1 }, { id: L.transporte3, sentido: 1 }, { id: L.transporte4, sentido: 1 }] },
  { id: 'E8', dim: 'eco', tipo: 'likert', clave: 1, origen: 'escala', fuentes: ['issp', 'jolly2022'],
    texto: 'El Estado no debería intervenir en los precios de la energía: deberían fijarlos las empresas y el mercado.',
    nota: 'Adaptado del ítem «controlar los precios por ley» del ISSP «Role of Government» (redacción inversa).',
    leyes: [{ id: L.gravamen, sentido: -1 }] },

  // ── Valores sociales (GAL–TAN) ────────────────────────────
  { id: 'S1', dim: 'soc', tipo: 'likert', clave: -1, origen: 'escala', fuentes: ['ess', 'hooghe2002'],
    texto: 'Las personas gais y lesbianas deberían ser libres de vivir su vida como deseen.',
    nota: 'Traducción del ítem «freehms» del cuestionario básico de la ESS.',
    leyes: [{ id: L.terapias, sentido: 1 }] },
  { id: 'S2', dim: 'soc', tipo: 'likert', clave: 1, origen: 'escala', fuentes: ['hooghe2002', 'jolly2022'],
    texto: 'La ley no debería obligar a que haya un mínimo de mujeres en las listas electorales o en los consejos de administración.',
    nota: 'Basado en el componente de igualdad de género del eje GAL–TAN del CHES (redacción inversa).',
    leyes: [{ id: L.paridad1, sentido: -1 }, { id: L.paridad2, sentido: -1 }] },
  { id: 'S3', dim: 'soc', tipo: 'likert', clave: -1, origen: 'escala', fuentes: ['issp'],
    texto: 'Los permisos por nacimiento y cuidado de hijos deberían ser más largos y estar pagados, tanto para madres como para padres.',
    nota: 'Adaptado del módulo «Family and Changing Gender Roles» del ISSP (permisos parentales).',
    leyes: [{ id: L.permisos, sentido: 1 }] },
  { id: 'S4', dim: 'soc', tipo: 'likert', clave: -1, origen: 'vaa', fuentes: ['garzia2012', 'hooghe2002'],
    texto: 'El Estado debe promover el reconocimiento y la reparación de las víctimas de la Guerra Civil y de la dictadura.',
    nota: 'Afirmación en formato VAA sobre la ley vinculada; no procede de una escala previa.',
    leyes: [{ id: L.memoria, sentido: 1 }] },
  { id: 'S5', dim: 'soc', tipo: 'likert', clave: 1, origen: 'escala', fuentes: ['knutsen1995', 'jolly2022'],
    texto: 'La religión debería tener más peso en las decisiones públicas.',
    nota: 'Basado en la orientación religioso-secular (Knutsen) y el ítem de principios religiosos del CHES.',
    leyes: [] },
  { id: 'S6', dim: 'soc', tipo: 'likert', clave: -1, origen: 'escala', fuentes: ['evs', 'knutsen1995'],
    texto: 'Una persona con una enfermedad grave e incurable debería poder pedir ayuda médica para morir.',
    nota: 'Adaptado del ítem de justificabilidad de la eutanasia de la European Values Study.',
    leyes: [] },
  { id: 'S7', dim: 'soc', tipo: 'likert', clave: -1, origen: 'escala', fuentes: ['evs', 'knutsen1995'],
    texto: 'El aborto debería ser un derecho garantizado por la sanidad pública.',
    nota: 'Adaptado del ítem de justificabilidad del aborto de la European Values Study.',
    leyes: [] },
  { id: 'S8', dim: 'soc', tipo: 'likert', clave: 1, origen: 'escala', fuentes: ['everett2013', 'hooghe2002'],
    texto: 'La familia tradicional debería tener una protección especial del Estado frente a otros modelos de familia.',
    nota: 'Basado en los ítems «matrimonio tradicional» y «unidad familiar» de la escala SECS (Everett).',
    leyes: [] },

  // ── Autoridad ─────────────────────────────────────────────
  { id: 'A1', dim: 'aut', tipo: 'par', clave: 1, origen: 'escala', fuentes: ['feldman1997', 'feldman2014'],
    texto: '¿Qué cualidad te parece más importante que tenga un niño o una niña?', opciones: ['Independencia', 'Respeto a los mayores'],
    nota: CRIANZA, leyes: [] },
  { id: 'A2', dim: 'aut', tipo: 'par', clave: 1, origen: 'escala', fuentes: ['feldman1997'],
    texto: '¿Qué cualidad te parece más importante que tenga un niño o una niña?', opciones: ['Curiosidad', 'Buenos modales'],
    nota: CRIANZA, leyes: [] },
  { id: 'A3', dim: 'aut', tipo: 'par', clave: 1, origen: 'escala', fuentes: ['feldman1997'],
    texto: '¿Qué cualidad te parece más importante que tenga un niño o una niña?', opciones: ['Confianza en sí mismo/a', 'Obediencia'],
    nota: CRIANZA, leyes: [] },
  { id: 'A4', dim: 'aut', tipo: 'par', clave: 1, origen: 'escala', fuentes: ['feldman1997'],
    texto: '¿Qué cualidad te parece más importante que tenga un niño o una niña?', opciones: ['Ser considerado/a con los demás', 'Portarse bien'],
    nota: CRIANZA, leyes: [] },
  { id: 'A5', dim: 'aut', tipo: 'likert', clave: 1, origen: 'escala', fuentes: ['jackson2011'],
    texto: 'Quien comete delitos de forma repetida debería recibir penas de prisión más duras.',
    nota: 'Adaptado de las actitudes punitivas del módulo «Trust in Justice» (ESS ronda 5).',
    leyes: [{ id: L.reincidencia, sentido: 1 }] },
  { id: 'A6', dim: 'aut', tipo: 'likert', clave: -1, origen: 'escala', fuentes: ['jackson2011'],
    texto: 'Las prisiones deberían centrarse más en la reinserción que en el castigo.',
    nota: 'Adaptado del módulo «Trust in Justice» (ESS ronda 5), redacción inversa.',
    leyes: [{ id: L.reincidencia, sentido: -1 }] },

  // ── Inmigración ───────────────────────────────────────────
  { id: 'I1', dim: 'inm', tipo: 'likert', clave: -1, origen: 'escala', fuentes: ['ess', 'davidov2008'],
    texto: 'España debería permitir que vengan a vivir y trabajar más personas de otros países.',
    nota: 'Adaptado de los ítems «imdfetn/impcntr» de la ESS.',
    leyes: [] },
  { id: 'I2', dim: 'inm', tipo: 'likert', clave: 1, origen: 'escala', fuentes: ['ess', 'davidov2008'],
    texto: 'En general, la inmigración es mala para la economía de España.',
    nota: 'Adaptado del ítem «imbgeco» de la ESS (formato de acuerdo).',
    leyes: [] },
  { id: 'I3', dim: 'inm', tipo: 'likert', clave: -1, origen: 'escala', fuentes: ['ess', 'davidov2008'],
    texto: 'La vida cultural de España se enriquece con las personas que llegan de otros países.',
    nota: 'Adaptado del ítem «imueclt» de la ESS (formato de acuerdo).',
    leyes: [] },
  { id: 'I4', dim: 'inm', tipo: 'likert', clave: -1, origen: 'vaa', fuentes: ['garzia2012'],
    texto: 'Los menores migrantes que llegan solos deberían repartirse entre todas las comunidades autónomas para atenderlos.',
    nota: 'Afirmación en formato VAA sobre la ley vinculada.',
    leyes: [{ id: L.menores, sentido: 1 }] },
  { id: 'I5', dim: 'inm', tipo: 'likert', clave: 1, origen: 'vaa', fuentes: ['garzia2012'],
    texto: 'Deberían endurecerse los requisitos para obtener la nacionalidad española.',
    nota: 'Afirmación en formato VAA sobre la ley vinculada (redacción inversa).',
    leyes: [{ id: L.nacionalidad, sentido: -1 }] },
  { id: 'I6', dim: 'inm', tipo: 'likert', clave: -1, origen: 'vaa', fuentes: ['garzia2012', 'davidov2008'],
    texto: 'Las personas inmigrantes en situación irregular que ya trabajan aquí deberían poder regularizar su situación.',
    nota: 'Afirmación en formato VAA; no hay ley de esta legislatura con voto final en los datos.',
    leyes: [] },

  // ── Territorio ────────────────────────────────────────────
  { id: 'T1', dim: 'ter', tipo: 'opciones', clave: 1, origen: 'escala', fuentes: ['cis', 'navarro2015'],
    texto: '¿Qué forma de organización territorial del Estado prefieres?',
    opciones: [
      'Un Estado con un único Gobierno central, sin autonomías',
      'Un Estado con comunidades autónomas con menos autonomía que ahora',
      'Un Estado con comunidades autónomas como el actual',
      'Un Estado con comunidades autónomas con más autonomía que ahora',
      'Un Estado que reconozca que las comunidades puedan convertirse en Estados independientes',
    ],
    nota: 'Pregunta de los barómetros del CIS sobre organización territorial del Estado.',
    leyes: [] },
  { id: 'T2', dim: 'ter', tipo: 'opciones', clave: 1, origen: 'escala', fuentes: ['moreno2006', 'cis'],
    texto: '¿Con cuál de estas frases te identificas más?',
    opciones: [
      'Me siento únicamente español/a',
      'Me siento más español/a que de mi comunidad',
      'Me siento tan español/a como de mi comunidad',
      'Me siento más de mi comunidad que español/a',
      'Me siento únicamente de mi comunidad',
    ],
    nota: 'Escala de identidad dual Linz–Moreno («pregunta Moreno»), usada por el CIS.',
    leyes: [] },
  { id: 'T3', dim: 'ter', tipo: 'likert', clave: 1, origen: 'escala', fuentes: ['jolly2022'],
    texto: 'Las comunidades autónomas deberían recaudar y gestionar más impuestos propios.',
    nota: 'Adaptado del ítem de descentralización regional del CHES.',
    leyes: [{ id: L.convenio, sentido: 1 }, { id: L.concierto, sentido: 1 }] },
  { id: 'T4', dim: 'ter', tipo: 'likert', clave: -1, origen: 'escala', fuentes: ['cis', 'jolly2022'],
    texto: 'Algunas competencias de las comunidades autónomas deberían volver al Estado central.',
    nota: 'Derivado de la pregunta del CIS sobre organización territorial y del ítem de descentralización del CHES (redacción inversa).',
    leyes: [] },
  { id: 'T5', dim: 'ter', tipo: 'likert', clave: 1, origen: 'vaa', fuentes: ['garzia2012'],
    texto: 'La ley de amnistía fue una medida adecuada para normalizar la situación política en Cataluña.',
    nota: 'Afirmación en formato VAA sobre la ley vinculada.',
    leyes: [{ id: L.amnistia, sentido: 1 }] },
  { id: 'T6', dim: 'ter', tipo: 'likert', clave: 1, origen: 'escala', fuentes: ['jolly2022', 'garzia2012'],
    texto: 'Infraestructuras estatales como algunas autopistas deberían poder transferirse a las comunidades autónomas.',
    nota: 'Adaptado del ítem de descentralización regional del CHES, aplicado a la ley vinculada.',
    leyes: [{ id: L.ap9, sentido: 1 }] },

  // ── Medio ambiente ────────────────────────────────────────
  { id: 'M1', dim: 'amb', tipo: 'likert', clave: -1, origen: 'escala', fuentes: ['dunlap2000'],
    texto: 'Si las cosas siguen como hasta ahora, pronto sufriremos una gran catástrofe ecológica.',
    nota: 'Traducción de un ítem pro-NEP de la escala revisada de Dunlap et al.',
    leyes: [] },
  { id: 'M2', dim: 'amb', tipo: 'likert', clave: 1, origen: 'escala', fuentes: ['dunlap2000'],
    texto: 'Los seres humanos acabarán sabiendo lo suficiente sobre la naturaleza como para poder controlarla.',
    nota: 'Traducción de un ítem anti-NEP de la escala revisada de Dunlap et al.',
    leyes: [] },
  { id: 'M3', dim: 'amb', tipo: 'likert', clave: -1, origen: 'escala', fuentes: ['poortinga2019', 'ess'],
    texto: 'El Estado debería subvencionar la compra de vehículos eléctricos.',
    nota: 'Adaptado de los ítems de apoyo a políticas climáticas de la ESS ronda 8.',
    leyes: [{ id: L.moves, sentido: 1 }] },
  { id: 'M4', dim: 'amb', tipo: 'likert', clave: -1, origen: 'escala', fuentes: ['poortinga2019', 'ess'],
    texto: 'Las ciudades deberían limitar el uso del coche privado para reducir la contaminación.',
    nota: 'Adaptado de los ítems de apoyo a políticas climáticas de la ESS ronda 8.',
    leyes: [{ id: L.movilidad, sentido: 1 }] },
  { id: 'M5', dim: 'amb', tipo: 'likert', clave: -1, origen: 'vaa', fuentes: ['garzia2012'],
    texto: 'La ley debería obligar a supermercados y restaurantes a reducir el desperdicio de alimentos.',
    nota: 'Afirmación en formato VAA sobre la ley vinculada.',
    leyes: [{ id: L.desperdicio, sentido: 1 }] },
  { id: 'M6', dim: 'amb', tipo: 'likert', clave: 1, origen: 'escala', fuentes: ['poortinga2019', 'ess'],
    texto: 'La preocupación por el cambio climático está exagerada.',
    nota: 'Adaptado de los ítems de percepción del cambio climático de la ESS ronda 8 (redacción inversa).',
    leyes: [] },
];

/** Orden de presentación: se alternan las dimensiones para evitar efectos de bloque. */
function intercalar(banco: Pregunta[]): Pregunta[] {
  const grupos = DIMENSIONES.map((d) => banco.filter((p) => p.dim === d.id));
  const out: Pregunta[] = [];
  for (let i = 0; out.length < banco.length; i += 1) for (const g of grupos) if (g[i]) out.push(g[i]);
  return out;
}

export const PREGUNTAS: Pregunta[] = intercalar(BANCO);
