# Fuentes de datos y licencias

Este documento explica de dónde salen los datos de Pleno Abierto, con qué condiciones se reutilizan y cómo se cumplen.

## Resumen

| Qué | Licencia / condiciones | Cómo se cumple |
|---|---|---|
| Código de la app y del pipeline | GPL-3.0-or-later (`LICENSE`) | Repositorio público; cualquier versión derivada debe seguir siendo libre |
| Votos oficiales (Congreso de los Diputados) | Aviso legal de congreso.es: reutilización permitida sin alterar el contenido, sin desnaturalizar su sentido, citando la fuente y la fecha de última actualización | Totales tal cual; el voto por grupo es una suma del voto nominal oficial; cita y enlace a cada votación; fecha de actualización visible en la app |
| Lista de leyes y tema de cada una (El Congreso en tu mano) | CC BY 4.0, con aviso obligatorio de contenido generado con IA | Atribución «El Congreso en tu mano» + enlace + licencia + aviso IA + indicación de cambios, en la app y en la web |
| Bibliotecas de terceros | MIT, ISC, BSD, Apache-2.0, MPL-2.0… (todas compatibles con GPL-3.0) | Listado y textos en `LICENCIAS-TERCEROS.md` |
| Icono y diseño | Originales del proyecto (GPL-3.0) | Sin escudos, logotipos oficiales ni de partidos |

## 1. Congreso de los Diputados — fuente principal

- Datos: <https://www.congreso.es/es/opendata/votaciones> (un fichero JSON por votación: totales y voto de cada diputado con su grupo).
- Condiciones: <https://www.congreso.es/es/cem/aviso-legal>, apartado «Reutilización de información»: (a) no alterar el contenido; (b) no desnaturalizar su sentido; (c) citar la fuente; (d) mencionar la fecha de la última actualización; (e) uso diligente.
- Lo que usamos: título oficial del expediente, sesión, número y fecha de la votación, totales y voto nominal (que solo sumamos por grupo parlamentario). No usamos fotografías, escudos ni logotipos.
- Uso diligente: el pipeline descarga solo las votaciones necesarias, con pausas entre peticiones, una vez por semana, con un User-Agent que identifica el proyecto, y guarda en caché lo ya descargado (los ficheros publicados no cambian).

Cita usada: «Origen de los datos: Congreso de los Diputados — Datos abiertos», con la fecha de actualización.

## 2. El Congreso en tu mano — fuente secundaria y mínima

- API pública: <https://www.elcongresoentumano.es/api> · Web: <https://www.elcongresoentumano.es>
- Licencia de su elaboración propia: CC BY 4.0 (<https://creativecommons.org/licenses/by/4.0/deed.es>). Exigen citar «El Congreso en tu mano» (elcongresoentumano.es) e indicar qué parte es oficial y cuál elaborada con IA.
- Lo que usamos (lo mínimo imprescindible):
  1. **La selección de leyes y decretos** que siguen (identificador, fecha y enlace a su ficha).
  2. **El tema** asignado a cada ley (vivienda, trabajo, impuestos…), generado con IA.
  3. Sus totales, **solo para localizar** la votación oficial correspondiente, y **solo se muestran** cuando el Congreso no publica voto nominal (votaciones de la Diputación Permanente), indicándolo.
- Agenda de próximas votaciones (fecha, título oficial, estado y enlace a la nota del Congreso).
- Lo que no usamos: resúmenes, «qué propone», impactos, nombres populares, patrimonio, test, fotos.
- Cambios realizados (requisito CC BY): hemos vinculado cada ley con su votación oficial del Congreso y recalculado el resultado y el voto por grupo a partir de los datos oficiales.
- Aviso: los temas están generados con IA, son orientativos y pueden contener errores.

## 3. Test «Brújula»

- 40 preguntas en 6 dimensiones (economía, valores sociales, autoridad, inmigración, territorio y medio ambiente), orientadas como el Chapel Hill Expert Survey.
- Procedencia de los ítems: European Social Survey, ISSP, European Values Study, CIS (organización territorial y pregunta Linz–Moreno), escala NEP revisada (Dunlap et al., 2000), valores de crianza (Feldman y Stenner, 1997). Algunas afirmaciones sobre leyes concretas siguen el formato de las aplicaciones de consejo de voto (Garzia y Marschall, 2012). Cada pregunta muestra su fuente en la app; el banco completo y las referencias están en `app/src/test/modelo.ts`.
- Los grupos se sitúan solo con sus votos oficiales en las leyes vinculadas (escalado conjunto con votaciones; Bafumi y Herron, 2010). La afinidad usa distancia media por pregunta (Louwerse y Rosema, 2014).
- Salvaguardas: ítems con redacción equilibrada (a favor y en contra) para limitar la aquiescencia (Krosnick, 1999); los grupos solo se sitúan en dimensiones con al menos dos leyes distintas; se advierte de la dinámica gobierno–oposición (Hix y Noury, 2016); no es una recomendación de voto y las respuestas no salen del dispositivo.
- `npm run validar-test` (en `app/`) comprueba el banco de preguntas y el cálculo en cada compilación.

## 4. Otras secciones

- **Vota tú también**: 20 leyes con resúmenes propios redactados con IA (Claude) a partir del articulado oficial del BOE, revisados contra el texto y marcados como tales en la app, con enlace al BOE. Las disposiciones legales no son objeto de propiedad intelectual (art. 13 del texto refundido de la Ley de Propiedad Intelectual).
- **Mis diputados**: lista oficial de diputados (datos abiertos del Congreso: en activo y de baja) y su participación calculada con el voto nominal oficial de todas las votaciones del Pleno de la legislatura. «Participación» es el porcentaje de votaciones en que votó sí, no o abstención mientras era diputado.
- **Próximas votaciones**: agenda de El Congreso en tu mano (fecha, título oficial y enlace a la nota oficial del Congreso) y el índice oficial de artículos del BOE para los decretos-ley.
- **Promesas vs hechos**: en preparación; se publicará solo cuando estén revisados con el mismo criterio los programas de todos los partidos, cada promesa con cita y página.

## 5. No afiliación

Pleno Abierto es independiente: no representa al Congreso de los Diputados, a ninguna administración pública ni a ningún partido político, y no está afiliada a El Congreso en tu mano. Este aviso aparece en la app, en la web y debe figurar en la ficha de Google Play (política de Google sobre apps que comunican información gubernamental).

## 6. Gratuidad

La app es y será gratuita: sin anuncios, sin compras dentro de la app, sin suscripciones y sin recogida de datos. La licencia GPL-3.0 garantiza que el código siga siendo libre.
