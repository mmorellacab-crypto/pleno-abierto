#!/usr/bin/env python3
"""Prepara la firma de iOS con la API de App Store Connect, sin Mac.

- Certificado de distribución: se crea una vez y se guarda CIFRADO (AES-256, clave derivada del
  secreto de la API de Apple) en la rama «credenciales» del repositorio. Si falta o caduca, se crea otro.
- Perfil de aprovisionamiento App Store: se crea o reutiliza en cada ejecución.
- Escribe app/credentials.json para EAS Build (credentialsSource: local).
Variables: ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_PATH, ASC_KEY_B64, BUNDLE_ID, CRED_DIR (clon de la rama).
"""
import base64, hashlib, json, os, subprocess, sys, time, urllib.error, urllib.parse, urllib.request
import jwt  # PyJWT

API = 'https://api.appstoreconnect.apple.com/v1'
KEY_ID, ISSUER = os.environ['ASC_KEY_ID'], os.environ['ASC_ISSUER_ID']
KEY = open(os.environ['ASC_KEY_PATH']).read()
BUNDLE = os.environ.get('BUNDLE_ID', 'es.plenoabierto.app')
CRED = os.environ['CRED_DIR']
APP = os.environ.get('APP_DIR', 'app')
NOMBRE_PERFIL = 'Pleno Abierto App Store (CI)'
CLAVE_CIFRADO = hashlib.sha256(('pleno-abierto-p12:' + os.environ['ASC_KEY_B64']).encode()).hexdigest()


def token():
    now = int(time.time())
    return jwt.encode({'iss': ISSUER, 'iat': now, 'exp': now + 900, 'aud': 'appstoreconnect-v1'}, KEY,
                      algorithm='ES256', headers={'kid': KEY_ID, 'typ': 'JWT'})


def api(method, path, body=None):
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body else None,
                                 headers={'Authorization': 'Bearer ' + token(), 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as r:
            txt = r.read()
            return json.loads(txt) if txt else {}
    except urllib.error.HTTPError as e:
        print(f'Error {e.code} en {method} {path}: {e.read().decode()[:800]}', file=sys.stderr)
        raise


def sh(*cmd, entrada=None):
    return subprocess.run(cmd, check=True, capture_output=True, input=entrada).stdout


def certificado():
    """Devuelve (id, ruta_p12, contraseña_p12). Reutiliza el guardado si sigue válido en Apple."""
    meta_f, enc_f = os.path.join(CRED, 'ios-cert.json'), os.path.join(CRED, 'ios-cert.p12.enc')
    validos = {c['id']: c for c in api('GET', '/certificates?filter[certificateType]=DISTRIBUTION&limit=50')['data']}
    if os.path.exists(meta_f) and os.path.exists(enc_f):
        meta = json.load(open(meta_f))
        c = validos.get(meta['id'])
        if c and c['attributes']['expirationDate'] > time.strftime('%Y-%m-%dT%H:%M:%S', time.gmtime(time.time() + 86400 * 7)):
            sh('openssl', 'enc', '-d', '-aes-256-cbc', '-pbkdf2', '-iter', '200000', '-in', enc_f,
               '-out', 'ios-dist.p12', '-pass', 'pass:' + CLAVE_CIFRADO)
            print(f"Reutilizando certificado {meta['id']} (caduca {c['attributes']['expirationDate'][:10]})")
            return meta['id'], 'ios-dist.p12', meta['p12pass']
        print('El certificado guardado ya no es válido: se creará otro.')
    sh('openssl', 'genrsa', '-out', 'ios-dist.key', '2048')
    csr = sh('openssl', 'req', '-new', '-key', 'ios-dist.key', '-subj', '/CN=Pleno Abierto CI/C=ES').decode()
    r = api('POST', '/certificates', {'data': {'type': 'certificates', 'attributes': {'certificateType': 'DISTRIBUTION', 'csrContent': csr}}})
    cid = r['data']['id']
    der = base64.b64decode(r['data']['attributes']['certificateContent'])
    open('ios-dist.cer', 'wb').write(der)
    sh('openssl', 'x509', '-inform', 'DER', '-in', 'ios-dist.cer', '-out', 'ios-dist.pem')
    p12pass = base64.urlsafe_b64encode(os.urandom(18)).decode()
    sh('openssl', 'pkcs12', '-export', '-legacy', '-inkey', 'ios-dist.key', '-in', 'ios-dist.pem', '-out', 'ios-dist.p12',
       '-name', 'Pleno Abierto CI', '-passout', 'pass:' + p12pass)
    os.makedirs(CRED, exist_ok=True)
    sh('openssl', 'enc', '-aes-256-cbc', '-pbkdf2', '-iter', '200000', '-salt', '-in', 'ios-dist.p12', '-out', enc_f,
       '-pass', 'pass:' + CLAVE_CIFRADO)
    json.dump({'id': cid, 'p12pass': p12pass, 'creado': time.strftime('%Y-%m-%d')}, open(meta_f, 'w'))
    for f in ('ios-dist.key', 'ios-dist.cer', 'ios-dist.pem'):
        os.remove(f)
    print('Certificado de distribución creado:', cid)
    with open(os.environ.get('GITHUB_OUTPUT', '/dev/null'), 'a') as out:
        out.write('cert_nuevo=1\n')
    return cid, 'ios-dist.p12', p12pass


def perfil(cid):
    b = api('GET', f'/bundleIds?filter[identifier]={BUNDLE}')['data']
    bid = next(x['id'] for x in b if x['attributes']['identifier'] == BUNDLE)
    for p in api('GET', f'/profiles?filter[name]={urllib.parse.quote(NOMBRE_PERFIL)}&include=certificates&limit=20').get('data', []):
        certs = [c['id'] for c in p['relationships']['certificates'].get('data', [])] if 'data' in p['relationships'].get('certificates', {}) else []
        if p['attributes']['profileState'] == 'ACTIVE' and cid in certs:
            print('Reutilizando perfil', p['id'])
            return base64.b64decode(p['attributes']['profileContent'])
        print('Eliminando perfil antiguo', p['id'])
        api('DELETE', f"/profiles/{p['id']}")
    r = api('POST', '/profiles', {'data': {'type': 'profiles', 'attributes': {'name': NOMBRE_PERFIL, 'profileType': 'IOS_APP_STORE'},
                                           'relationships': {'bundleId': {'data': {'type': 'bundleIds', 'id': bid}},
                                                             'certificates': {'data': [{'type': 'certificates', 'id': cid}]}}}})
    print('Perfil creado', r['data']['id'])
    return base64.b64decode(r['data']['attributes']['profileContent'])


cid, p12, p12pass = certificado()
os.makedirs(os.path.join(APP, 'credenciales-ios'), exist_ok=True)
os.replace(p12, os.path.join(APP, 'credenciales-ios', 'dist.p12'))
open(os.path.join(APP, 'credenciales-ios', 'perfil.mobileprovision'), 'wb').write(perfil(cid))
json.dump({'ios': {'provisioningProfilePath': 'credenciales-ios/perfil.mobileprovision',
                   'distributionCertificate': {'path': 'credenciales-ios/dist.p12', 'password': p12pass}}},
          open(os.path.join(APP, 'credentials.json'), 'w'), indent=2)
print('credentials.json listo')
