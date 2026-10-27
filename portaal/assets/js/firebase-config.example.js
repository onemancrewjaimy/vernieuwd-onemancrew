/**
 * ONEMANCREW PORTAAL - Firebase config template
 *
 * Kopieer dit bestand naar "firebase-config.js" (zonder ".example") in
 * dezelfde map, en vul de echte waarden in vanuit je Firebase-project:
 * Project instellingen > Algemeen > Jouw apps > Web-app > SDK-configuratie.
 *
 * Dit zijn GEEN geheimen: Firebase's eigen documentatie zegt expliciet dat
 * deze client-config publiek in de browser mag staan. De echte beveiliging
 * zit in firestore.rules, niet in het verbergen van deze waarden.
 * "firebase-config.js" staat alleen in .gitignore zodat ieder
 * project (bijvoorbeeld een los test-project) zijn eigen lokale waarden
 * kan hebben zonder dat die per ongeluk worden overschreven door een git
 * pull.
 */
export const firebaseConfig = {
  apiKey: 'VUL_IN',
  authDomain: 'VUL_IN.firebaseapp.com',
  projectId: 'VUL_IN',
  storageBucket: 'VUL_IN.appspot.com',
  messagingSenderId: 'VUL_IN',
  appId: 'VUL_IN',
};
