// Leyes de «Vota tú también». Resúmenes redactados con IA (Claude) a partir del articulado
// publicado en el BOE; describen qué hace cada norma, sin valorarla. Revisados contra el texto
// oficial el 16/11/2026. Las leyes no tienen derechos de autor (art. 13 de la Ley de Propiedad
// Intelectual); se enlaza siempre el texto oficial.

export interface LeyVota {
  id: string; // identificador en dataset.json
  boe: string;
  eli: string;
  nombre: string; // nombre corto descriptivo (no oficial)
  resumen: string;
  puntos: string[];
}

export const LEYES_VOTA: LeyVota[] = [
  {
    id: 'real-decreto-ley-8-2026-de-20-de-marzo-de-medidas-en-el-alqu',
    boe: 'BOE-A-2026-6545',
    eli: 'https://www.boe.es/eli/es/rdl/2026/03/20/8',
    nombre: 'Prórroga de alquileres y tope a la subida de la renta',
    resumen: 'Decreto del Gobierno sobre alquiler de vivienda habitual, dictado en el contexto de la guerra de Irán.',
    puntos: [
      'Los inquilinos cuyo contrato termine antes de finales de 2027 pueden pedir una prórroga extraordinaria de hasta dos años con las mismas condiciones.',
      'Limita la actualización anual de la renta de los contratos de alquiler de vivienda.',
      'El propietario debe aceptar la prórroga salvo acuerdo distinto entre las partes o las excepciones previstas.',
    ],
  },
  {
    id: 'real-decreto-ley-9-2025-de-29-de-julio-por-el-que-se-amplia',
    boe: 'BOE-A-2025-15741',
    eli: 'https://www.boe.es/eli/es/rdl/2025/07/29/9',
    nombre: 'Permiso por nacimiento de 19 semanas',
    resumen: 'Amplía el permiso por nacimiento y cuidado de menor para trabajadores, empleados públicos y en la Seguridad Social.',
    puntos: [
      'El permiso de cada progenitor pasa a 19 semanas.',
      'En familias monoparentales, el permiso es de 32 semanas.',
      'Modifica el Estatuto de los Trabajadores, el Estatuto del Empleado Público y la Ley General de la Seguridad Social.',
    ],
  },
  {
    id: 'real-decreto-ley-10-2024-de-23-de-diciembre-para-el-establec',
    boe: 'BOE-A-2024-26916',
    eli: 'https://www.boe.es/eli/es/rdl/2024/12/23/10',
    nombre: 'Gravamen temporal a las grandes energéticas en 2025',
    resumen: 'Mantiene durante 2025 un impuesto temporal a los grandes operadores del sector energético.',
    puntos: [
      'Afecta a los operadores principales del sector energético.',
      'Quedan exentas las empresas con una cifra de negocios inferior a 1.000 millones de euros.',
      'Prevé revisar el gravamen para integrarlo en el sistema tributario.',
    ],
  },
  {
    id: 'real-decreto-ley-11-2026-de-12-de-mayo-por-el-que-se-modific',
    boe: 'BOE-A-2026-10324',
    eli: 'https://www.boe.es/eli/es/rdl/2026/05/12/11',
    nombre: 'Cambios en el copago de medicamentos',
    resumen: 'Modifica la aportación que pagan usuarios y beneficiarios por los medicamentos con receta (copago farmacéutico).',
    puntos: [
      'Da nueva redacción al artículo de la ley del medicamento que regula el copago.',
      'Mantiene exentos de pagar a los pensionistas que ya lo estaban por su nivel de renta.',
      'Habilita al Gobierno para desarrollarlo por reglamento.',
    ],
  },
  {
    id: 'proyecto-de-ley-por-la-que-se-regulan-las-ensenanzas-artisti',
    boe: 'BOE-A-2024-11613',
    eli: 'https://www.boe.es/eli/es/l/2024/06/07/1',
    nombre: 'Ley de enseñanzas artísticas superiores',
    resumen: 'Regula los estudios artísticos superiores (música, danza, arte dramático, diseño, conservación…).',
    puntos: [
      'Organiza estos estudios en grado, máster y doctorado.',
      'Fija requisitos de acceso, títulos y planes de estudio.',
      'Regula los centros que imparten estas enseñanzas.',
    ],
  },
  {
    id: 'proyecto-de-ley-organica-de-representacion-paritaria-y-prese',
    boe: 'BOE-A-2024-15936',
    eli: 'https://www.boe.es/eli/es/lo/2024/08/01/2',
    nombre: 'Ley de paridad',
    resumen: 'Exige una presencia equilibrada de mujeres y hombres en distintos ámbitos públicos y privados.',
    puntos: [
      'Presencia equilibrada: ningún sexo por encima del 60 % ni por debajo del 40 %.',
      'Se aplica, entre otros, a listas electorales, Gobierno, órganos constitucionales y consejos de grandes empresas cotizadas.',
      'Modifica, entre otras, la ley electoral y la Ley de Sociedades de Capital.',
    ],
  },
  {
    id: 'real-decreto-ley-6-2026-de-3-de-marzo-por-el-que-se-modifica',
    boe: 'BOE-A-2026-5060',
    eli: 'https://www.boe.es/eli/es/rdl/2026/03/03/6',
    nombre: 'Indemnizaciones a víctimas por defender la democracia (1968-1978)',
    resumen: 'Añade a la Ley de Memoria Democrática indemnizaciones para víctimas muertas o con lesiones graves por defender las libertades.',
    puntos: [
      'Reconoce 250.000 euros a los beneficiarios de quienes murieron entre 1968 y 1978 en defensa de los derechos democráticos.',
      'Prevé también indemnizaciones por lesiones incapacitantes.',
      'Excluye a quienes hayan pertenecido a bandas o grupos terroristas.',
    ],
  },
  {
    id: 'votacion-de-conjunto-de-la-proposicion-de-ley-organica-en-ma',
    boe: 'BOE-A-2026-7966',
    eli: 'https://www.boe.es/eli/es/lo/2026/04/08/1',
    nombre: 'Ley de multirreincidencia',
    resumen: 'Reforma el Código Penal y la Ley de Enjuiciamiento Criminal para endurecer la respuesta ante quienes cometen delitos de forma repetida.',
    puntos: [
      'Modifica la agravante de reincidencia y crea tipos agravados por multirreincidencia en delitos leves.',
      'Cambia varios artículos sobre hurtos, estafas y otros delitos contra el patrimonio.',
      'Introduce cambios procesales, como medidas de alejamiento con control telemático.',
    ],
  },
  {
    id: 'proposicion-de-ley-organica-de-amnistia-para-la-normalizacio',
    boe: 'BOE-A-2024-11776',
    eli: 'https://www.boe.es/eli/es/lo/2024/06/10/1',
    nombre: 'Ley de amnistía',
    resumen: 'Amnistía actos vinculados al proceso independentista catalán.',
    puntos: [
      'Abarca actos relacionados con las consultas del 9-N de 2014 y del 1-O de 2017, y otros del proceso independentista.',
      'Cubre hechos realizados entre el 1 de noviembre de 2011 y el 13 de noviembre de 2023.',
      'Extingue la responsabilidad penal, administrativa y contable, con exclusiones previstas en la ley.',
    ],
  },
  {
    id: 'proyecto-de-ley-de-movilidad-sostenible',
    boe: 'BOE-A-2025-24545',
    eli: 'https://www.boe.es/eli/es/l/2025/12/03/9',
    nombre: 'Ley de movilidad sostenible',
    resumen: 'Establece un marco estatal para el transporte y la movilidad sostenibles.',
    puntos: [
      'Reconoce un derecho a la movilidad sostenible y fija principios rectores.',
      'Crea un Sistema General de Movilidad Sostenible con órganos de coordinación entre administraciones.',
      'Prevé planes, indicadores y un espacio de datos de movilidad compartido.',
    ],
  },
  {
    id: 'proyecto-de-ley-de-prevencion-de-las-perdidas-y-el-desperdic-2',
    boe: 'BOE-A-2025-6597',
    eli: 'https://www.boe.es/eli/es/l/2025/04/01/1',
    nombre: 'Ley contra el desperdicio alimentario',
    resumen: 'Obliga a los agentes de la cadena alimentaria a prevenir y reducir el desperdicio de alimentos.',
    puntos: [
      'Fija un orden de prioridades: donación, transformación, alimentación animal y otros usos.',
      'Obliga a las empresas a tener un plan de prevención y convenios de donación.',
      'Incluye obligaciones específicas para la hostelería y la venta al consumidor.',
    ],
  },
  {
    id: 'real-decreto-ley-17-2025-de-23-de-diciembre-de-medidas-de-pr',
    boe: 'BOE-A-2025-26459',
    eli: 'https://www.boe.es/eli/es/rdl/2025/12/23/17',
    nombre: 'Descuentos en abonos de transporte público',
    resumen: 'Regula bonificaciones y ayudas para abaratar el transporte público.',
    puntos: [
      'Descuentos para usuarios recurrentes de autobuses de competencia estatal y de servicios de Renfe.',
      'Ayudas a comunidades autónomas y ayuntamientos que rebajen sus abonos y títulos multiviaje.',
      'Exige cofinanciación de las administraciones que reciban las ayudas.',
    ],
  },
  {
    id: 'real-decreto-ley-7-2025-de-24-de-junio-por-el-que-se-aprueba',
    boe: 'BOE-A-2025-12857',
    eli: 'https://www.boe.es/eli/es/rdl/2025/06/24/7',
    nombre: 'Refuerzo del sistema eléctrico tras el apagón',
    resumen: 'Medidas para el sistema eléctrico tras el apagón del 28 de abril de 2025.',
    puntos: [
      'Encargos a la CNMC y al operador del sistema en relación con el apagón.',
      'Medidas para aumentar la resiliencia de la red y el control de tensión.',
      'Facilita la instalación de almacenamiento de energía (baterías) y la hibridación.',
    ],
  },
  {
    id: 'real-decreto-ley-16-2026-de-16-de-junio-de-medidas-para-gara',
    boe: 'BOE-A-2026-13107',
    eli: 'https://www.boe.es/eli/es/rdl/2026/06/16/16',
    nombre: 'Financiación de RTVE',
    resumen: 'Modifica la ley de la radio y televisión pública estatal.',
    puntos: [
      'Considera coste del servicio público de RTVE los impuestos que la corporación no puede deducir.',
      'Ese coste, incluido el de años anteriores, lo compensa el Estado.',
      'Habilita al Gobierno para desarrollarlo.',
    ],
  },
  {
    id: 'real-decreto-ley-21-2026-de-25-de-agosto-de-transparencia-e',
    boe: 'BOE-A-2026-18148',
    eli: 'https://www.boe.es/eli/es/rdl/2026/08/25/21',
    nombre: 'Registro de lobbies (grupos de interés)',
    resumen: 'Regula la relación entre los grupos de interés y los cargos de la Administración General del Estado.',
    puntos: [
      'Crea un registro obligatorio de grupos de interés.',
      'Fija obligaciones para lobbies y cargos públicos, y un informe de «huella normativa».',
      'Establece infracciones y sanciones.',
    ],
  },
  {
    id: 'real-decreto-ley-3-2026-de-3-de-febrero-para-la-revalorizaci',
    boe: 'BOE-A-2026-2548',
    eli: 'https://www.boe.es/eli/es/rdl/2026/02/03/3',
    nombre: 'Subida de las pensiones en 2026',
    resumen: 'Revaloriza las pensiones públicas y actualiza las cotizaciones a la Seguridad Social para 2026.',
    puntos: [
      'Las pensiones contributivas suben con carácter general un 2,7 % (IPC medio).',
      'Actualiza las bases máximas y mínimas de cotización.',
      'Amplía el plazo para devolver préstamos del Estado a la Seguridad Social.',
    ],
  },
  {
    id: 'real-decreto-ley-11-2024-de-23-de-diciembre-para-la-mejora-d',
    boe: 'BOE-A-2024-26917',
    eli: 'https://www.boe.es/eli/es/rdl/2024/12/23/11',
    nombre: 'Compatibilizar pensión de jubilación y trabajo',
    resumen: 'Cambia las reglas para trabajar después de la edad de jubilación o mientras se cobra la pensión.',
    puntos: [
      'Modifica la jubilación demorada, la jubilación activa y la jubilación parcial.',
      'Ajusta los complementos por retrasar la jubilación.',
      'Prevé evaluar la reforma de la jubilación parcial en 2028.',
    ],
  },
  {
    id: 'real-decreto-ley-2-2025-de-18-de-marzo-por-el-que-se-aprueba',
    boe: 'BOE-A-2025-5404',
    eli: 'https://www.boe.es/eli/es/rdl/2025/03/18/2',
    nombre: 'Reparto de menores migrantes no acompañados',
    resumen: 'Modifica la Ley de Extranjería para repartir entre comunidades a menores migrantes que llegan solos en situaciones extraordinarias.',
    puntos: [
      'Permite declarar una «contingencia migratoria extraordinaria».',
      'Establece un mecanismo para trasladar a menores entre comunidades autónomas.',
      'Fija plazos para aprobar los criterios del plan de respuesta.',
    ],
  },
  {
    id: 'proyecto-de-ley-por-la-que-se-establecen-un-impuesto-complem',
    boe: 'BOE-A-2024-26694',
    eli: 'https://www.boe.es/eli/es/l/2024/12/20/7',
    nombre: 'Impuesto mínimo global a multinacionales',
    resumen: 'Crea un impuesto complementario para que los grandes grupos multinacionales tributen un mínimo.',
    puntos: [
      'Aplica la directiva europea sobre tributación mínima global (15 %).',
      'Afecta a grandes grupos multinacionales y nacionales.',
      'Regula cómo calcular la base y los impuestos ya pagados.',
    ],
  },
  {
    id: 'proyecto-de-ley-por-la-que-se-regulan-los-servicios-de-atenc-2',
    boe: 'BOE-A-2025-26698',
    eli: 'https://www.boe.es/eli/es/l/2025/12/26/10',
    nombre: 'Ley de atención a la clientela',
    resumen: 'Fija requisitos mínimos a los servicios de atención al cliente de las empresas.',
    puntos: [
      'El 95 % de las peticiones de atención personalizada deben atenderse en menos de tres minutos de media.',
      'Derecho a ser atendido por una persona y a pasar a un supervisor si no se está satisfecho.',
      'Plazos de respuesta a quejas y reclamaciones, y sanciones.',
    ],
  },
];
