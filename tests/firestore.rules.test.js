/**
 * ONEMANCREW PORTAAL - Firestore rules tests
 *
 * Stap 1: auth/rollen, de "clients"-collectie.
 * Stap 2: projects + versions/feedback(+replies)/deadlines/files.
 *
 * Draait tegen de Firebase-emulator, raakt nooit een echt project.
 * Uitvoeren vanuit de map tests/:
 *   npm install
 *   npm test
 * (npm test start de firestore-emulator, voert de tests uit en sluit hem
 * weer af, via "firebase emulators:exec".)
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require('@firebase/rules-unit-testing');

let testEnv;

test.before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'onemancrew-portaal-test',
    firestore: {
      rules: fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8'),
    },
  });
});

test.after(async () => {
  await testEnv.cleanup();
});

test.beforeEach(async () => {
  await testEnv.clearFirestore();
  // Testdata inschieten met admin-rechten (omzeilt de rules, zoals de
  // seed/backoffice dat ook zou doen).
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await db.doc('clients/client-1').set({
      bedrijfsnaam: 'Demo BV',
      uids: ['client-uid-1'],
    });
    await db.doc('projects/project-1').set({
      titel: 'Demo project',
      type: 'bedrijfsfilm',
      clientIds: ['client-uid-1'],
      fase: 'montage',
      status: 'actief',
    });
    await db.doc('projects/project-1/versions/v1').set({
      label: 'V1',
      approvedAt: null,
      approvedBy: null,
    });
    await db.doc('projects/project-1/feedback/f1').set({
      versionId: 'v1',
      tijdcode: 12,
      tekst: 'Bestaande feedback',
      auteur: { uid: 'client-uid-1', naam: 'Klant', rol: 'klant' },
      status: 'open',
    });
    await db.doc('projects/project-1/deadlines/d1').set({
      titel: 'Oplevering',
      verantwoordelijke: 'onemancrew',
      afgerond: false,
    });
    await db.doc('projects/project-1/files/doc1').set({
      naam: 'Offerte',
      url: 'https://example.com/offerte.pdf',
      type: 'document',
    });
    await db.doc('projects/project-1/files/final1').set({
      naam: 'Eindfilm.mp4',
      url: 'https://example.com/eindfilm.mp4',
      type: 'eindbestand',
      zichtbaarNaGoedkeuring: false,
    });
  });
});

test('een niet-ingelogde gebruiker mag geen klantrecord lezen', async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(db.doc('clients/client-1').get());
});

test('een klant die niet in uids staat mag het record niet lezen', async () => {
  const db = testEnv.authenticatedContext('andere-uid').firestore();
  await assertFails(db.doc('clients/client-1').get());
});

test('een klant die wel in uids staat mag zijn eigen record lezen', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertSucceeds(db.doc('clients/client-1').get());
});

test('een klant mag zijn eigen record niet wijzigen', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertFails(db.doc('clients/client-1').update({ bedrijfsnaam: 'Gehackt BV' }));
});

test('admin mag elk klantrecord lezen, ook als zijn uid er niet in staat', async () => {
  const db = testEnv.authenticatedContext('admin-uid', { admin: true }).firestore();
  await assertSucceeds(db.doc('clients/client-1').get());
});

test('admin mag een klantrecord wijzigen', async () => {
  const db = testEnv.authenticatedContext('admin-uid', { admin: true }).firestore();
  await assertSucceeds(db.doc('clients/client-1').update({ bedrijfsnaam: 'Nieuwe naam BV' }));
});

test('een onbekend pad is standaard dicht, ook voor ingelogde niet-admins', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertFails(db.doc('iets-dat-niet-bestaat/doc-1').get());
});

// --- projects ---------------------------------------------------------

test('een klant in clientIds mag het project lezen', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertSucceeds(db.doc('projects/project-1').get());
});

test('een klant buiten clientIds mag het project niet lezen', async () => {
  const db = testEnv.authenticatedContext('andere-uid').firestore();
  await assertFails(db.doc('projects/project-1').get());
});

test('een klant mag de fase van een project niet wijzigen', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertFails(db.doc('projects/project-1').update({ fase: 'oplevering' }));
});

test('admin mag de fase van een project wijzigen', async () => {
  const db = testEnv.authenticatedContext('admin-uid', { admin: true }).firestore();
  await assertSucceeds(db.doc('projects/project-1').update({ fase: 'oplevering' }));
});

// --- versions -----------------------------------------------------------

test('een klant met toegang mag een versie lezen', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertSucceeds(db.doc('projects/project-1/versions/v1').get());
});

test('een klant zonder toegang mag een versie niet lezen', async () => {
  const db = testEnv.authenticatedContext('andere-uid').firestore();
  await assertFails(db.doc('projects/project-1/versions/v1').get());
});

test('een klant mag geen nieuwe versie aanmaken', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertFails(db.doc('projects/project-1/versions/v2').set({ label: 'V2' }));
});

test('een klant mag een versie goedkeuren (alleen approvedAt/approvedBy, eigen uid)', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertSucceeds(
    db.doc('projects/project-1/versions/v1').update({
      approvedAt: Date.now(),
      approvedBy: 'client-uid-1',
    })
  );
});

test('een klant mag niet goedkeuren namens een andere uid', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertFails(
    db.doc('projects/project-1/versions/v1').update({
      approvedAt: Date.now(),
      approvedBy: 'iemand-anders',
    })
  );
});

test('een klant mag bij het goedkeuren geen ander veld meesturen', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertFails(
    db.doc('projects/project-1/versions/v1').update({
      approvedAt: Date.now(),
      approvedBy: 'client-uid-1',
      label: 'V1 (aangepast)',
    })
  );
});

// --- feedback -------------------------------------------------------------

test('een klant mag feedback plaatsen op eigen naam', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertSucceeds(
    db.collection('projects/project-1/feedback').add({
      versionId: 'v1',
      tijdcode: 30,
      tekst: 'Kan dit stuk korter?',
      auteur: { uid: 'client-uid-1', naam: 'Klant', rol: 'klant' },
      status: 'open',
    })
  );
});

test('een klant mag geen feedback plaatsen namens een andere uid', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertFails(
    db.collection('projects/project-1/feedback').add({
      versionId: 'v1',
      tijdcode: 30,
      tekst: 'Kan dit stuk korter?',
      auteur: { uid: 'iemand-anders', naam: 'Klant', rol: 'klant' },
      status: 'open',
    })
  );
});

test('een klant mag zich niet voordoen als admin in feedback', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertFails(
    db.collection('projects/project-1/feedback').add({
      versionId: 'v1',
      tijdcode: 30,
      tekst: 'Kan dit stuk korter?',
      auteur: { uid: 'client-uid-1', naam: 'Klant', rol: 'admin' },
      status: 'open',
    })
  );
});

test('een klant mag de status van feedback niet wijzigen', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertFails(db.doc('projects/project-1/feedback/f1').update({ status: 'verwerkt' }));
});

test('admin mag feedback als verwerkt markeren', async () => {
  const db = testEnv.authenticatedContext('admin-uid', { admin: true }).firestore();
  await assertSucceeds(db.doc('projects/project-1/feedback/f1').update({ status: 'verwerkt' }));
});

test('een klant met toegang mag op feedback reageren', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertSucceeds(
    db.collection('projects/project-1/feedback/f1/replies').add({
      tekst: 'Zeker, pas ik aan.',
      auteur: { uid: 'client-uid-1', naam: 'Klant', rol: 'klant' },
    })
  );
});

// --- deadlines ------------------------------------------------------------

test('een klant met toegang mag deadlines lezen', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertSucceeds(db.doc('projects/project-1/deadlines/d1').get());
});

test('een klant mag een deadline niet afvinken', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertFails(db.doc('projects/project-1/deadlines/d1').update({ afgerond: true }));
});

// --- files ------------------------------------------------------------------

test('een klant met toegang mag een documentbestand lezen', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertSucceeds(db.doc('projects/project-1/files/doc1').get());
});

test('een klant mag een eindbestand niet lezen voor het zichtbaar is', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertFails(db.doc('projects/project-1/files/final1').get());
});

test('een klant mag een eindbestand lezen zodra het zichtbaar is', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc('projects/project-1/files/final1').update({ zichtbaarNaGoedkeuring: true });
  });
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertSucceeds(db.doc('projects/project-1/files/final1').get());
});

// Stap 4: beheerder-only list-queries. isAdmin() hangt niet van resource.data
// af, dus een ongefilterde list-query moet voor een admin gewoon mogen, ook
// als de rule verder op resource.data-velden steunt (zoals bij files).
test('admin mag alle klanten zonder filter oplijsten', async () => {
  const db = testEnv.authenticatedContext('admin-uid', { admin: true }).firestore();
  const snap = await assertSucceeds(db.collection('clients').get());
  assert.equal(snap.size, 1);
});

test('een klant mag de klantenlijst niet ongefilterd oplijsten', async () => {
  const db = testEnv.authenticatedContext('client-uid-1').firestore();
  await assertFails(db.collection('clients').get());
});

test('admin mag alle bestanden van een project zonder filter oplijsten, inclusief niet-zichtbare eindbestanden', async () => {
  const db = testEnv.authenticatedContext('admin-uid', { admin: true }).firestore();
  const snap = await assertSucceeds(db.collection('projects/project-1/files').get());
  assert.equal(snap.size, 2);
});
