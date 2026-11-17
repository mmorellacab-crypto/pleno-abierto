# Seguridad

## Informar de un problema

Si encuentras un fallo de seguridad o datos incorrectos que puedan inducir a error, **no abras una incidencia pública**.
Usa *Security → Report a vulnerability* en este repositorio (aviso privado). Se responderá lo antes posible.

## Cómo verificar que tu app es auténtica

Pleno Abierto solo se distribuye desde las [Releases de este repositorio](../../releases) (y, si se publica, desde Google Play).
Cualquier copia con el mismo nombre o logo descargada de otro sitio puede estar modificada.

**Huella SHA-256 del certificado de firma oficial:**

```
5C:5D:E6:08:47:02:13:E1:06:88:4C:78:3D:01:63:A1:99:46:BC:46:54:3C:5F:FE:DC:9A:0C:28:63:F0:CE:50
```

Para comprobarla en un ordenador con las herramientas de Android:

```bash
apksigner verify --print-certs pleno-abierto.apk
```

Cada versión publicada incluye además:

- `SHA256SUMS.txt`: la huella de cada fichero. Compárala con `sha256sum pleno-abierto.apk` (Linux/Mac) o `certutil -hashfile pleno-abierto.apk SHA256` (Windows).
- Un **certificado de procedencia** firmado por GitHub que demuestra que el fichero se compiló en GitHub Actions a partir de este código. Para comprobarlo: `gh attestation verify pleno-abierto.apk -R mmorellacab-crypto/pleno-abierto`.

Las compilaciones de prueba (sin clave oficial) se llaman `pleno-abierto-prueba.apk` y **no** llevan esta firma.

## Medidas de protección del proyecto

- La rama `main` no se puede borrar ni reescribir (sin *force push*).
- Las acciones de GitHub están fijadas a versiones exactas (commit SHA) y con permisos mínimos.
- Dependabot avisa de dependencias con vulnerabilidades conocidas.
- La compilación falla si un APK firmado no coincide con la huella oficial.
- Los datos se descargan de fuentes oficiales y la actualización se detiene si el número de votaciones verificadas cae de forma anómala.
