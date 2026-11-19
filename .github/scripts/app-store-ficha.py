#!/usr/bin/env python3
"""Rellena la ficha de App Store Connect con la API oficial (sin navegador).

Lee tienda/app-store/ficha.json y tienda/app-store/capturas/*.png y:
  1. Información de la app: subtítulo, URL de privacidad, categorías, derechos de contenido.
  2. Clasificación por edades: «ninguno» en todas las preguntas.
  3. Precio gratis y disponibilidad en todos los países.
  4. Versión: textos, copyright, compilación más reciente ya procesada.
  5. Capturas de iPhone 6,9".
  6. Contacto para el revisor (si existen los secretos APPLE_REVIEW_*).
  7. Envío a revisión, solo si ENVIAR=1.
La sección «Privacidad de la app» no existe en la API: se hace una vez en la web.
Variables: ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_PATH; opcionales REVIEW_NOMBRE, REVIEW_APELLIDOS,
REVIEW_EMAIL, REVIEW_TELEFONO, ENVIAR.
"""
import glob, hashlib, json, os, sys, time, urllib.error, urllib.parse, urllib.request
import jwt

API = 'https://api.appstoreconnect.apple.com'
KEY_ID, ISSUER = os.environ['ASC_KEY_ID'], os.environ['ASC_ISSUER_ID']
KEY = open(os.environ['ASC_KEY_PATH']).read()
F = json.load(open('tienda/app-store/ficha.json'))
APP = F['appId']
PENDIENTE = []


_TOKEN = {'valor': None, 'caduca': 0}


def token(nuevo=False):
    """Un mismo token durante ~15 min (Apple rechaza a veces tokens recién emitidos)."""
    now = int(time.time())
    if nuevo or not _TOKEN['valor'] or now > _TOKEN['caduca'] - 60:
        _TOKEN['valor'] = jwt.encode({'iss': ISSUER, 'iat': now - 60, 'exp': now + 1080, 'aud': 'appstoreconnect-v1'},
                                     KEY, algorithm='ES256', headers={'kid': KEY_ID, 'typ': 'JWT'})
        _TOKEN['caduca'] = now + 1080
    return _TOKEN['valor']


def api(method, path, body=None, ok_error=False, intento=0):
    url = path if path.startswith('http') else API + path
    req = urllib.request.Request(url, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'Authorization': 'Bearer ' + token(), 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as r:
            t = r.read()
            return json.loads(t) if t else {}
    except urllib.error.HTTPError as e:
        txt = e.read().decode()
        if e.code in (401, 429, 500, 502, 503) and intento < 4:
            espera = 5 * (intento + 1)
            print(f'  (Apple respondió {e.code}; reintento en {espera} s)')
            time.sleep(espera)
            if e.code == 401:
                token(nuevo=True)
            return api(method, path, body, ok_error, intento + 1)
        if ok_error:
            return {'_error': e.code, '_texto': txt}
        print(f'::error::{method} {path} → {e.code}: {txt[:6000]}')
        raise


def paso(nombre):
    print(f'\n== {nombre}')


def patch_tolerante(path, tipo, id_, attrs):
    """PATCH que se adapta a cambios de Apple: quita campos que ya no existen y responde
    «no/ninguno» a preguntas obligatorias nuevas."""
    attrs = dict(attrs)
    for _ in range(3 * len(attrs) + 10):
        r = api('PATCH', path, {'data': {'type': tipo, 'id': id_, 'attributes': attrs}}, ok_error=True)
        if '_error' not in r:
            return r
        cambios = False
        try:
            errores = json.loads(r['_texto']).get('errors', [])
        except Exception:
            errores = []
        for err in errores:
            p = (err.get('source') or {}).get('pointer', '')
            if not p.startswith('/data/attributes/'):
                continue
            campo, codigo = p.split('/')[-1], err.get('code', '')
            if 'REQUIRED' in codigo and campo not in attrs:
                attrs[campo] = False
                print('  (pregunta nueva de Apple respondida «no»:', campo + ')')
                cambios = True
            elif campo in attrs and attrs[campo] is False and 'REQUIRED' not in codigo and 'UNKNOWN' not in codigo:
                attrs[campo] = 'NONE'
                print('  (pregunta nueva de Apple respondida «ninguno»:', campo + ')')
                cambios = True
            elif campo in attrs:
                print('  (se omite el campo no admitido:', campo + ')')
                attrs.pop(campo)
                cambios = True
        if not cambios:
            print(f'::error::PATCH {path}: {r["_texto"][:1500]}')
            raise SystemExit(1)
    raise SystemExit(1)


# 1. Información de la app
paso('Información de la app')
infos = api('GET', f'/v1/apps/{APP}/appInfos')['data']
info = next((i for i in infos if (i['attributes'].get('state') or i['attributes'].get('appStoreState') or '') not in ('READY_FOR_DISTRIBUTION', 'READY_FOR_SALE')), infos[0])
for loc in api('GET', f"/v1/appInfos/{info['id']}/appInfoLocalizations")['data']:
    if loc['attributes']['locale'] == F['locale']:
        patch_tolerante(f"/v1/appInfoLocalizations/{loc['id']}", 'appInfoLocalizations', loc['id'],
                        {'subtitle': F['subtitulo'], 'privacyPolicyUrl': F['privacidad']})
        print('  subtítulo y URL de privacidad')
api('PATCH', f"/v1/appInfos/{info['id']}", {'data': {'type': 'appInfos', 'id': info['id'], 'relationships': {
    'primaryCategory': {'data': {'type': 'appCategories', 'id': F['categoriaPrincipal']}},
    'secondaryCategory': {'data': {'type': 'appCategories', 'id': F['categoriaSecundaria']}}}}})
print('  categorías', F['categoriaPrincipal'], '/', F['categoriaSecundaria'])
patch_tolerante(f'/v1/apps/{APP}', 'apps', APP, {'contentRightsDeclaration': 'USES_THIRD_PARTY_CONTENT'})
print('  derechos de contenido: usa contenido de terceros con derecho a usarlo')

# 2. Clasificación por edades
paso('Clasificación por edades')
ar = api('GET', f"/v1/appInfos/{info['id']}/ageRatingDeclaration")['data']
NINGUNO = ['alcoholTobaccoOrDrugUseOrReferences', 'contests', 'gamblingSimulated', 'gunsOrOtherWeapons',
           'horrorOrFearThemes', 'matureOrSuggestiveThemes', 'medicalOrTreatmentInformation', 'profanityOrCrudeHumor',
           'sexualContentGraphicAndNudity', 'sexualContentOrNudity', 'violenceCartoonOrFantasy', 'violenceRealistic',
           'violenceRealisticProlongedGraphicOrSadistic']
NO = ['advertising', 'ageAssurance', 'gambling', 'healthOrWellnessTopics', 'lootBox', 'messagingAndChat',
      'parentalControls', 'unrestrictedWebAccess', 'userGeneratedContent', 'seventeenPlus']
attrs = {k: 'NONE' for k in NINGUNO}
attrs.update({k: False for k in NO})
patch_tolerante(f"/v1/ageRatingDeclarations/{ar['id']}", 'ageRatingDeclarations', ar['id'], attrs)
print('  todas las respuestas en «ninguno / no»')

# 3. Precio y disponibilidad
paso('Precio y disponibilidad')
sched = api('GET', f'/v1/apps/{APP}/appPriceSchedule', ok_error=True)
if '_error' in sched or not (sched.get('data') or {}).get('id'):
    pts = api('GET', f'/v1/apps/{APP}/appPricePoints?filter[territory]=ESP&limit=200')['data']
    gratis = next(p for p in pts if float(p['attributes']['customerPrice']) == 0)
    api('POST', '/v1/appPriceSchedules', {
        'data': {'type': 'appPriceSchedules', 'relationships': {
            'app': {'data': {'type': 'apps', 'id': APP}},
            'baseTerritory': {'data': {'type': 'territories', 'id': 'ESP'}},
            'manualPrices': {'data': [{'type': 'appPrices', 'id': '${gratis}'}]}}},
        'included': [{'type': 'appPrices', 'id': '${gratis}', 'attributes': {'startDate': None},
                      'relationships': {'appPricePoint': {'data': {'type': 'appPricePoints', 'id': gratis['id']}}}}]})
    print('  precio: gratis')
else:
    print('  ya tenía precio configurado')
disp = api('GET', f'/v1/apps/{APP}/appAvailabilityV2', ok_error=True)
if '_error' in disp or not (disp.get('data') or {}).get('id'):
    terr, url = [], '/v1/territories?limit=200'
    while url:
        r = api('GET', url)
        terr += [t['id'] for t in r['data']]
        url = (r.get('links') or {}).get('next')
    api('POST', '/v2/appAvailabilities', {
        'data': {'type': 'appAvailabilities', 'attributes': {'availableInNewTerritories': True}, 'relationships': {
            'app': {'data': {'type': 'apps', 'id': APP}},
            'territoryAvailabilities': {'data': [{'type': 'territoryAvailabilities', 'id': f'${{{t}}}'} for t in terr]}}},
        'included': [{'type': 'territoryAvailabilities', 'id': f'${{{t}}}', 'attributes': {'available': True},
                      'relationships': {'territory': {'data': {'type': 'territories', 'id': t}}}} for t in terr]})
    print(f'  disponible en {len(terr)} países o regiones')
else:
    print('  ya tenía disponibilidad configurada')
# China continental exige declaraciones propias (contenido de IA y evaluación de seguridad): no se distribuye allí.
disp = api('GET', f'/v1/apps/{APP}/appAvailabilityV2', ok_error=True)
if (disp.get('data') or {}).get('id'):
    url = f"/v2/appAvailabilities/{disp['data']['id']}/territoryAvailabilities?include=territory&limit=200"
    while url:
        r = api('GET', url)
        for ta in r['data']:
            terr = ((ta.get('relationships') or {}).get('territory') or {}).get('data') or {}
            if terr.get('id') == 'CHN' and ta['attributes'].get('available'):
                api('PATCH', f"/v1/territoryAvailabilities/{ta['id']}", {'data': {'type': 'territoryAvailabilities', 'id': ta['id'],
                    'attributes': {'available': False}}})
                print('  China continental excluida (requiere declaraciones específicas de ese país)')
        url = (r.get('links') or {}).get('next')

# 4. Versión
paso('Versión 1.0')
ver = next(v for v in api('GET', f'/v1/apps/{APP}/appStoreVersions?filter[platform]=IOS&limit=10')['data']
           if v['attributes']['appStoreState'] in ('PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED', 'METADATA_REJECTED'))
VID = ver['id']
patch_tolerante(f'/v1/appStoreVersions/{VID}', 'appStoreVersions', VID, {'copyright': F['copyright']})
vloc = next(l for l in api('GET', f'/v1/appStoreVersions/{VID}/appStoreVersionLocalizations')['data']
            if l['attributes']['locale'] == F['locale'])
patch_tolerante(f"/v1/appStoreVersionLocalizations/{vloc['id']}", 'appStoreVersionLocalizations', vloc['id'], {
    'description': F['descripcion'], 'keywords': F['palabrasClave'], 'promotionalText': F['textoPromocional'],
    'supportUrl': F['urlSoporte'], 'marketingUrl': F['urlMarketing']})
print('  descripción, palabras clave, texto promocional y enlaces')
builds = api('GET', f'/v1/builds?filter[app]={APP}&filter[processingState]=VALID&sort=-uploadedDate&limit=1')['data']
if builds:
    api('PATCH', f'/v1/appStoreVersions/{VID}/relationships/build', {'data': {'type': 'builds', 'id': builds[0]['id']}})
    print('  compilación', builds[0]['attributes']['version'], 'asignada')
else:
    PENDIENTE.append('Apple todavía está procesando la compilación')
    print('  ::warning::Aún no hay compilación procesada')

# 5. Capturas
paso('Capturas de iPhone 6,9"')
sets = api('GET', f"/v1/appStoreVersionLocalizations/{vloc['id']}/appScreenshotSets")['data']
cset = next((s for s in sets if s['attributes']['screenshotDisplayType'] == 'APP_IPHONE_67'), None)
if not cset:
    cset = api('POST', '/v1/appScreenshotSets', {'data': {'type': 'appScreenshotSets',
               'attributes': {'screenshotDisplayType': 'APP_IPHONE_67'},
               'relationships': {'appStoreVersionLocalization': {'data': {'type': 'appStoreVersionLocalizations', 'id': vloc['id']}}}}})['data']
locales = sorted(glob.glob('tienda/app-store/capturas/*.png'))
existentes = api('GET', f"/v1/appScreenshotSets/{cset['id']}/appScreenshots")['data']
iguales = ([s['attributes'].get('sourceFileChecksum') for s in existentes]
           == [hashlib.md5(open(f, 'rb').read()).hexdigest() for f in locales])
if iguales:
    # Volver a subirlas obliga a Apple a procesarlas de nuevo y bloquea el envío a revisión un rato.
    print('  sin cambios: no se vuelven a subir')
    locales = []
else:
    for s in existentes:
        api('DELETE', f"/v1/appScreenshots/{s['id']}")
for f in locales:
    datos = open(f, 'rb').read()
    sc = api('POST', '/v1/appScreenshots', {'data': {'type': 'appScreenshots',
             'attributes': {'fileName': os.path.basename(f), 'fileSize': len(datos)},
             'relationships': {'appScreenshotSet': {'data': {'type': 'appScreenshotSets', 'id': cset['id']}}}}})['data']
    for op in sc['attributes']['uploadOperations']:
        trozo = datos[op['offset']:op['offset'] + op['length']]
        req = urllib.request.Request(op['url'], method=op['method'], data=trozo,
                                     headers={h['name']: h['value'] for h in op.get('requestHeaders', [])})
        urllib.request.urlopen(req).read()
    api('PATCH', f"/v1/appScreenshots/{sc['id']}", {'data': {'type': 'appScreenshots', 'id': sc['id'],
        'attributes': {'uploaded': True, 'sourceFileChecksum': hashlib.md5(datos).hexdigest()}}})
    print('  subida', os.path.basename(f))

# 6. Contacto para el revisor (opcional aquí: también se puede rellenar en la web)
paso('Datos para el revisor de Apple')
contacto = {k: os.environ.get(v, '').strip() for k, v in [('contactFirstName', 'REVIEW_NOMBRE'), ('contactLastName', 'REVIEW_APELLIDOS'),
                                                          ('contactEmail', 'REVIEW_EMAIL'), ('contactPhone', 'REVIEW_TELEFONO')]}
# También se aceptan como parámetros privados de la ejecución manual (se leen del evento, nunca se imprimen)
try:
    _ev = json.load(open(os.environ.get('GITHUB_EVENT_PATH', '/dev/null'))).get('inputs') or {}
except Exception:
    _ev = {}
for k, campo in (('contactEmail', 'email_revisor'), ('contactPhone', 'telefono_revisor')):
    v = (_ev.get(campo) or '').strip()
    if v and not contacto[k]:
        print('::add-mask::' + v)
        contacto[k] = v
rd = api('GET', f'/v1/appStoreVersions/{VID}/appStoreReviewDetail', ok_error=True)
rd_id = (rd.get('data') or {}).get('id')
notas = F['notasRevisor']
video = (_ev.get('video_revisor') or os.environ.get('REVIEW_VIDEO', '')).strip()
attrs = {'demoAccountRequired': False}
if '[VIDEO_LINK]' in notas and not video:
    # Sin enlace al vídeo no se tocan las notas, para no borrar uno puesto antes.
    print('  notas sin cambios (falta el enlace al vídeo: parámetro video_revisor)')
else:
    if video:
        print('::add-mask::' + video)
    attrs['notes'] = notas.replace('[VIDEO_LINK]', video)
if all(contacto.values()):
    attrs.update(contacto)
if rd_id:
    patch_tolerante(f"/v1/appStoreReviewDetails/{rd_id}", 'appStoreReviewDetails', rd_id, attrs)
    print('  notas para el revisor actualizadas')
elif all(contacto.values()):
    api('POST', '/v1/appStoreReviewDetails', {'data': {'type': 'appStoreReviewDetails', 'attributes': attrs,
        'relationships': {'appStoreVersion': {'data': {'type': 'appStoreVersions', 'id': VID}}}}})
    print('  notas y contacto para el revisor')
else:
    PENDIENTE.append('el contacto para el revisor (rellénalo en la web: «Información de la revisión de la app»)')
    print('  ::warning::Sin contacto para el revisor: se rellena en la web de App Store Connect')

# 7. Envío a revisión
paso('Envío a revisión')
if os.environ.get('ENVIAR') == '1' and not PENDIENTE:
    abiertos = [x for x in api('GET', f'/v1/reviewSubmissions?filter[app]={APP}&filter[platform]=IOS&limit=20')['data']
                if x['attributes'].get('state') in ('READY_FOR_REVIEW', 'UNRESOLVED_ISSUES')]
    sub = abiertos[0] if abiertos else api('POST', '/v1/reviewSubmissions', {'data': {'type': 'reviewSubmissions',
              'attributes': {'platform': 'IOS'}, 'relationships': {'app': {'data': {'type': 'apps', 'id': APP}}}}})['data']
    items = api('GET', f"/v1/reviewSubmissions/{sub['id']}/items", ok_error=True).get('data') or []
    # Tras una respuesta de Apple (envío «UNRESOLVED_ISSUES»), cada elemento rechazado
    # debe marcarse como resuelto antes de volver a enviar.
    for it in items:
        if it['attributes'].get('state') in ('REJECTED', 'UNRESOLVED') and not it['attributes'].get('resolved'):
            api('PATCH', f"/v1/reviewSubmissionItems/{it['id']}", {'data': {'type': 'reviewSubmissionItems', 'id': it['id'],
                'attributes': {'resolved': True}}})
            print('  elemento rechazado marcado como resuelto')
    if not items:
        api('POST', '/v1/reviewSubmissionItems', {'data': {'type': 'reviewSubmissionItems', 'relationships': {
            'reviewSubmission': {'data': {'type': 'reviewSubmissions', 'id': sub['id']}},
            'appStoreVersion': {'data': {'type': 'appStoreVersions', 'id': VID}}}}})
    # Si Apple aún está procesando algo (por ejemplo capturas recién subidas) responde
    # «not ready to be submitted yet»: se espera y se reintenta durante unos 15 minutos.
    for intento in range(16):
        r = api('PATCH', f"/v1/reviewSubmissions/{sub['id']}", {'data': {'type': 'reviewSubmissions', 'id': sub['id'],
                'attributes': {'submitted': True}}}, ok_error=True)
        if '_error' not in r or 'not ready to be submitted yet' not in r.get('_texto', ''):
            break
        print('  Apple todavía está procesando la versión; nuevo intento en 60 s')
        if intento == 0:
            v = api('GET', f'/v1/appStoreVersions/{VID}', ok_error=True).get('data') or {}
            print('    estado de la versión:', (v.get('attributes') or {}).get('appStoreState'), '/', (v.get('attributes') or {}).get('appVersionState'))
            print('    estado del envío:', sub['attributes'].get('state'), sub['id'])
            for sc in api('GET', f"/v1/appScreenshotSets/{cset['id']}/appScreenshots", ok_error=True).get('data') or []:
                print('    captura', sc['attributes'].get('fileName'), (sc['attributes'].get('assetDeliveryState') or {}).get('state'),
                      (sc['attributes'].get('assetDeliveryState') or {}).get('errors'))
            for it in api('GET', f"/v1/reviewSubmissions/{sub['id']}/items", ok_error=True).get('data') or []:
                print('    elemento del envío:', it['attributes'].get('state'), it['id'])
            todos = api('GET', f'/v1/reviewSubmissions?filter[app]={APP}&filter[platform]=IOS&limit=20', ok_error=True).get('data') or []
            for x in todos:
                print('    envío', x['id'], x['attributes'].get('state'), x['attributes'].get('submittedDate'))
        time.sleep(60)
    if '_error' in r:
        print('::error::Apple no ha aceptado el envío (¿falta «Privacidad de la app» en la web?):', r['_texto'][:1500])
        raise SystemExit(1)
    print('  ENVIADA A REVISIÓN')
else:
    print('  No se envía todavía.', ('Pendiente: ' + '; '.join(PENDIENTE)) if PENDIENTE else 'Ejecuta con «enviar» para mandarla a revisión.')
print('\nRecuerda: «Privacidad de la app → Datos no recopilados» solo se puede marcar en la web de App Store Connect.')
