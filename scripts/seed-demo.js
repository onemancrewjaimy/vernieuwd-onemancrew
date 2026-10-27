/**
 * ONEMANCREW PORTAAL - demo-data inschieten
 *
 * Maakt (of overschrijft) één demo-klant en één demo-project met versies,
 * feedback, deadlines en bestanden, zodat je het portaal als klant kunt
 * bekijken zonder dat er al een echt project bestaat. Draait met de Admin
 * SDK, dus buiten de security rules om (zoals de echte admin-tools dat
 * straks ook doen).
 *
 * Gebruik (vanuit de map scripts/):
 *   npm install
 *   GOOGLE_APPLICATION_CREDENTIALS=... node seed-demo.js
 *
 * Print aan het eind het e-mailadres en wachtwoord van de demo-klant
 * waarmee je kunt inloggen op /portaal/login.html.
 */
const admin = require('firebase-admin');

admin.initializeApp({ credential: admin.credential.applicationDefault() });

const auth = admin.auth();
const db = admin.firestore();

const DEMO_EMAIL = 'demo-klant@onemancrew.nl';
const DEMO_PASSWORD = 'DemoKlant2026!';
const CLIENT_ID = 'demo-client';
const PROJECT_ID = 'demo-project';

async function ensureDemoUser() {
  try {
    const user = await auth.getUserByEmail(DEMO_EMAIL);
    return user.uid;
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error;
    const user = await auth.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      displayName: 'Demo Klant',
    });
    return user.uid;
  }
}

async function seed() {
  const uid = await ensureDemoUser();

  await db.doc(`clients/${CLIENT_ID}`).set({
    bedrijfsnaam: 'Demo BV',
    contactpersoon: 'Demo Klant',
    email: DEMO_EMAIL,
    uids: [uid],
  });

  const now = admin.firestore.Timestamp.now();
  const inDays = (n) => admin.firestore.Timestamp.fromMillis(Date.now() + n * 24 * 60 * 60 * 1000);

  await db.doc(`projects/${PROJECT_ID}`).set({
    titel: 'Bedrijfsfilm Demo BV',
    type: 'bedrijfsfilm',
    clientIds: [uid],
    fase: 'review',
    status: 'actief',
    startdatum: inDays(-21),
    opleverdatum: inDays(14),
    afspraken: {
      watJeKrijgt: 'Eén hoofdfilm (2-3 min) plus drie cutdowns voor social.',
      formaten: '16:9 voor web, 9:16 voor social.',
      investeringExclBtw: 'EUR 3.250',
      facturatie: 'Na oplevering.',
      gebruik: 'Onbeperkt gebruik door Demo BV. Copyright blijft bij ONEMANCREW. Ruwe beelden alleen tegen meerprijs.',
      pdfUrl: 'https://example.com/demo-offerte.pdf',
    },
    retentionDays: 90,
  }, { merge: true });

  const versionsRef = db.collection(`projects/${PROJECT_ID}/versions`);
  await versionsRef.doc('v1').set({
    label: 'V1',
    duur: 132,
    bunnyVideoId: '3b8e60e5-f910-4fec-9cc4-9c57ec8868dc',
    aangemaaktOp: inDays(-10),
    approvedAt: inDays(-7),
    approvedBy: uid,
  });
  await versionsRef.doc('v2').set({
    label: 'V2',
    duur: 128,
    bunnyVideoId: '3b8e60e5-f910-4fec-9cc4-9c57ec8868dc',
    aangemaaktOp: inDays(-2),
    approvedAt: null,
    approvedBy: null,
  });

  const feedbackRef = db.collection(`projects/${PROJECT_ID}/feedback`);
  await feedbackRef.doc('f1').set({
    versionId: 'v2',
    tijdcode: 18,
    tekst: 'Kan het logo hier iets groter in beeld?',
    auteur: { uid, naam: 'Demo Klant', rol: 'klant' },
    status: 'verwerkt',
    aangemaaktOp: inDays(-2),
  });
  await db.doc(`projects/${PROJECT_ID}/feedback/f1/replies/r1`).set({
    tekst: 'Aangepast in deze versie.',
    auteur: { uid: 'admin-demo', naam: 'Jaimy', rol: 'admin' },
    aangemaaktOp: inDays(-1),
  });
  await feedbackRef.doc('f2').set({
    versionId: 'v2',
    tijdcode: 64,
    tekst: 'Dit stukje muziek mag wat rustiger.',
    auteur: { uid, naam: 'Demo Klant', rol: 'klant' },
    status: 'open',
    aangemaaktOp: inDays(-1),
  });

  const deadlinesRef = db.collection(`projects/${PROJECT_ID}/deadlines`);
  await deadlinesRef.doc('d1').set({
    titel: 'Feedback op V1',
    datum: inDays(-8),
    verantwoordelijke: 'klant',
    afgerond: true,
  });
  await deadlinesRef.doc('d2').set({
    titel: 'Feedback op V2',
    datum: inDays(3),
    verantwoordelijke: 'klant',
    afgerond: false,
  });
  await deadlinesRef.doc('d3').set({
    titel: 'Oplevering eindfilm',
    datum: inDays(14),
    verantwoordelijke: 'onemancrew',
    afgerond: false,
  });

  const filesRef = db.collection(`projects/${PROJECT_ID}/files`);
  await filesRef.doc('doc1').set({
    naam: 'Offerte en voorwaarden',
    url: 'https://example.com/demo-offerte.pdf',
    type: 'document',
  });
  await filesRef.doc('final1').set({
    naam: 'Eindfilm (V1)',
    url: 'https://example.com/demo-eindfilm-v1.mp4',
    type: 'eindbestand',
    zichtbaarNaGoedkeuring: true,
  });

  console.log('Klaar. Demo-klant:');
  console.log('  e-mail:    ' + DEMO_EMAIL);
  console.log('  wachtwoord: ' + DEMO_PASSWORD);
  console.log('Log hiermee in op /portaal/login.html om het portaal als klant te bekijken.');
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
