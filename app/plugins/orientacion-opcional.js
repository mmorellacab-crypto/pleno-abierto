// La app se muestra en vertical, pero eso no debe impedir instalarla en
// dispositivos sin pantalla vertical (algunos Chromebooks, Android XR).
// Google Play deduce el requisito android.hardware.screen.portrait de la
// orientación fija; aquí se declara como opcional.
const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function orientacionOpcional(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    manifest['uses-feature'] = manifest['uses-feature'] || [];
    const nombre = 'android.hardware.screen.portrait';
    const existente = manifest['uses-feature'].find((f) => f.$['android:name'] === nombre);
    if (existente) {
      existente.$['android:required'] = 'false';
    } else {
      manifest['uses-feature'].push({ $: { 'android:name': nombre, 'android:required': 'false' } });
    }
    return cfg;
  });
};
