# Pleno Abierto

App Android **libre y gratuita** para ver, con filtros y colores, **qué votó cada grupo parlamentario** en cada ley o decreto del Congreso de los Diputados, organizado por **tema** (vivienda, trabajo, impuestos, sanidad…).

- Sin anuncios, sin compras, sin registro y sin recogida de datos.
- Votos **oficiales** del Congreso (datos abiertos), cruzados con la selección de leyes y temas de **El Congreso en tu mano** (CC BY 4.0).
- Código libre bajo **GPL-3.0**. Detalles legales en [FUENTES-Y-LICENCIAS.md](FUENTES-Y-LICENCIAS.md).

> App independiente: no representa al Congreso de los Diputados, a ninguna administración ni a ningún partido político, y no está afiliada a El Congreso en tu mano.

## Qué hace

| Pestaña | Contenido |
|---|---|
| **Leyes** | Lista con filtros combinables: tema, partido, qué votó ese partido (Sí / No / Abstención / Dividido), resultado y búsqueda. Cada tarjeta muestra el resultado, una barra de votos y la postura de todos los grupos. |
| **Detalle** | Título oficial, resultado, voto de cada grupo con su barra y enlaces a la votación oficial y a la ficha de El Congreso en tu mano. |
| **Partidos** | Cómo votó cada grupo en cada tema y con qué otros grupos coincide más. |
| **Fuentes** | Atribuciones, licencias, aviso de no afiliación, privacidad y fecha de los datos. |

Colores: azul = Sí, rojo = No, amarillo = Abstención, gris = Dividido / No vota (siempre con texto e icono, legibles con daltonismo).

## Cómo funciona

```
Congreso (datos abiertos) ─┐
                           ├─> pipeline/build.mjs ─> docs/data/dataset.json ─> GitHub Pages ─> app
El Congreso en tu mano ────┘        (GitHub Actions, cada lunes)                (copia incluida en la app para usarla sin conexión)
```

1. `pipeline/build.mjs` pide a El Congreso en tu mano la lista de leyes y su tema, localiza la votación oficial de cada una en los datos abiertos del Congreso (por título, número de norma y totales), y suma el voto nominal por grupo.
2. `.github/workflows/datos.yml` lo ejecuta cada semana y guarda el resultado en `docs/data/dataset.json`.
3. `.github/workflows/android.yml` compila la app (APK para instalar y AAB para Google Play).

## Puesta en marcha (una sola vez)

1. **Publica el repositorio** con GitHub Desktop: *File → Add local repository* → elige esta carpeta → acepta *create a repository* (crear repositorio aquí) → *Publish repository* (desmarca «Keep this code private»: debe ser público para que Actions y Pages sean gratis).
2. **Activa GitHub Pages**: en github.com → tu repositorio → *Settings → Pages* → *Source: Deploy from a branch* → rama `main`, carpeta `/docs` → *Save*.
3. **Permite que Actions guarde datos**: *Settings → Actions → General → Workflow permissions* → *Read and write permissions* → *Save*.
4. Ve a la pestaña **Actions** y lanza *Actualizar datos* y *Compilar Android* (*Run workflow*). Al terminar, en la ejecución de *Compilar Android* tendrás el artefacto `pleno-abierto-android` con el APK.
5. Para instalarlo en el móvil: descarga el APK en el teléfono y ábrelo (Android pedirá permitir «instalar apps desconocidas» para tu navegador).

## Publicar una versión

En GitHub Desktop: *Repository → Create tag…* (`v1.0.0`) y *Push*. El workflow publicará el APK en la sección *Releases*, donde cualquiera puede descargarlo gratis.

## Google Play (opcional)

Hace falta una cuenta de desarrollador (pago único de 25 $) y, en cuentas personales nuevas, una prueba cerrada con 12 testers durante 14 días. Para firmar:

1. Crea una clave de subida (en Android Studio o con `keytool`) y guárdala en un lugar seguro; **no la subas al repositorio**.
2. Añade en *Settings → Secrets and variables → Actions*: `ANDROID_KEYSTORE_BASE64` (el fichero .jks en base64), `ANDROID_KEYSTORE_PASSWORD` y `ANDROID_KEY_ALIAS`.
3. Activa *Play App Signing* al crear la app en Play Console y sube el `.aab`.
4. Ficha de la tienda: incluye las fuentes (con enlaces), el aviso de no afiliación y la URL de privacidad (`https://TU_USUARIO.github.io/pleno-abierto/privacidad.html`). En *Contenido de la app* declara: sin anuncios, sin recogida de datos, y «no es una app gubernamental».

## Desarrollo

```bash
npm test                 # tests del pipeline
npm run datos            # regenerar el dataset (necesita acceso a internet)
cd app && npm install
npx tsc --noEmit         # comprobar tipos
npx expo start           # probar en el móvil con Expo Go o en el navegador (tecla w)
npm run licencias        # regenerar LICENCIAS-TERCEROS.md
```

Antes de publicar en Google Play, revisa que el nombre «Pleno Abierto» no esté registrado como marca ni usado por otra app, y cambia `android.package` en `app/app.json` si lo deseas: no se puede cambiar después de publicar.
