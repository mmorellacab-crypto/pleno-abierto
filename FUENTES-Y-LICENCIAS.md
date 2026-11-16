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
- Lo que no usamos: resúmenes, «qué propone», impactos, nombres populares, patrimonio, test, fotos.
- Cambios realizados (requisito CC BY): hemos vinculado cada ley con su votación oficial del Congreso y recalculado el resultado y el voto por grupo a partir de los datos oficiales.
- Aviso: los temas están generados con IA, son orientativos y pueden contener errores.

## 3. No afiliación

Pleno Abierto es independiente: no representa al Congreso de los Diputados, a ninguna administración pública ni a ningún partido político, y no está afiliada a El Congreso en tu mano. Este aviso aparece en la app, en la web y debe figurar en la ficha de Google Play (política de Google sobre apps que comunican información gubernamental).

## 4. Gratuidad

La app es y será gratuita: sin anuncios, sin compras dentro de la app, sin suscripciones y sin recogida de datos. La licencia GPL-3.0 garantiza que el código siga siendo libre.
