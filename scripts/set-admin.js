/**
 * ONEMANCREW PORTAAL - scripts/set-admin.js
 *
 * Eenmalig scriptje dat de custom claim "admin: true" zet op jouw account
 * (contact@onemancrew.nl), met de Firebase Admin SDK. Dit is de ENIGE
 * plek waar de admin-rol wordt toegekend, niet in de frontend en niet in
 * Firestore (claims kun je vanuit de browser niet zelf aanpassen).
 *
 * Gebruik:
 *   1. npm install          (vanuit de map scripts/)
 *   2. Zet GOOGLE_APPLICATION_CREDENTIALS op het pad naar je service
 *      account-sleutel (zie README.md, sectie "Admin-account aanmaken").
 *   3. node set-admin.js contact@onemancrew.nl
 *
 * Het e-mailadres als argument is bewust verplicht (niet hardcoded), zodat
 * dit scriptje ook bruikbaar is als er ooit een tweede beheerder bijkomt.
 */
const admin = require('firebase-admin');

async function main() {
  var email = process.argv[2];
  if (!email) {
    console.error('Gebruik: node set-admin.js <e-mailadres>');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });

  var user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { admin: true });

  console.log('Klaar: ' + email + ' heeft nu admin: true.');
  console.log('Log opnieuw in (of ververs het token) voordat de rol actief wordt in het portaal.');
}

main().catch(function (error) {
  console.error('Mislukt:', error.message);
  process.exit(1);
});
