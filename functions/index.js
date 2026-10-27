const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ region: 'europe-west1' });

const bunnyTokenKey = defineSecret('BUNNY_TOKEN_KEY');
const BUNNY_LIBRARY_ID = '791978';
const PLAYBACK_TTL_SECONDS = 300;

/**
 * Geeft een tijdelijke, afgetekende Bunny-afspeellink terug voor een
 * projectversie, maar alleen als de ingelogde gebruiker (admin of klant
 * met toegang tot dit project) daar recht op heeft. De Bunny-sleutels
 * komen nooit in de browser-code; alleen deze server-functie kent ze.
 */
exports.getPlaybackUrl = onCall({ secrets: [bunnyTokenKey] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Je moet ingelogd zijn.');
  }

  const projectId = request.data && request.data.projectId;
  const versionId = request.data && request.data.versionId;
  if (!projectId || !versionId) {
    throw new HttpsError('invalid-argument', 'projectId en versionId zijn verplicht.');
  }

  const isAdmin = request.auth.token.admin === true;

  const projectSnap = await db.doc('projects/' + projectId).get();
  if (!projectSnap.exists) {
    throw new HttpsError('not-found', 'Project niet gevonden.');
  }
  const clientIds = projectSnap.data().clientIds || [];
  if (!isAdmin && clientIds.indexOf(request.auth.uid) === -1) {
    throw new HttpsError('permission-denied', 'Geen toegang tot dit project.');
  }

  const versionSnap = await db.doc('projects/' + projectId + '/versions/' + versionId).get();
  if (!versionSnap.exists) {
    throw new HttpsError('not-found', 'Versie niet gevonden.');
  }
  const bunnyVideoId = versionSnap.data().bunnyVideoId;
  if (!bunnyVideoId) {
    throw new HttpsError('failed-precondition', 'Deze versie heeft nog geen video.');
  }

  const expires = Math.floor(Date.now() / 1000) + PLAYBACK_TTL_SECONDS;
  const token = crypto
    .createHash('sha256')
    .update(bunnyTokenKey.value() + bunnyVideoId + expires)
    .digest('hex');

  const embedUrl =
    'https://player.mediadelivery.net/embed/' + BUNNY_LIBRARY_ID + '/' + bunnyVideoId +
    '?token=' + token + '&expires=' + expires + '&autoplay=false';

  return { embedUrl: embedUrl, expires: expires };
});

/**
 * Maakt (of hergebruikt) een Firebase Auth-account voor een nieuwe klant.
 * Geeft alleen de uid terug; het wachtwoord is willekeurig en onbekend,
 * de klant zet zelf een wachtwoord via de "wachtwoord vergeten"-mail die
 * de portaal-frontend na deze aanroep verstuurt.
 */
exports.createClientAccount = onCall(async (request) => {
  if (!request.auth || request.auth.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Alleen de beheerder mag klantaccounts aanmaken.');
  }

  const email = request.data && request.data.email;
  if (!email) {
    throw new HttpsError('invalid-argument', 'E-mailadres is verplicht.');
  }

  try {
    const existing = await admin.auth().getUserByEmail(email);
    return { uid: existing.uid, nieuw: false };
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      throw new HttpsError('internal', 'Account opzoeken mislukt.');
    }
  }

  const userRecord = await admin.auth().createUser({
    email: email,
    password: crypto.randomBytes(24).toString('hex'),
  });
  return { uid: userRecord.uid, nieuw: true };
});
