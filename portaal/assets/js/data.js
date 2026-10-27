/**
 * ONEMANCREW PORTAAL - data
 *
 * Alle Firestore-toegang op één plek: projecten, versies, feedback (en
 * replies), deadlines en bestanden. Geen businesslogica over rollen hier,
 * dat regelen firestore.rules al. Deze module gaat er dus van uit dat de
 * aanroeper al weet dat hij toegang heeft (via requireSession()).
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { db } from './firebase-init.js';

export const FASES = ['briefing', 'opname', 'montage', 'review', 'oplevering'];

export const FASE_LABELS = {
  briefing: 'Briefing',
  opname: 'Opname',
  montage: 'Montage',
  review: 'Review',
  oplevering: 'Oplevering',
};

export const TYPE_LABELS = {
  bedrijfsfilm: 'Bedrijfsfilm',
  recruitment: 'Recruitment',
  aftermovie: 'Aftermovie',
  'social content': 'Social content',
  overig: 'Overig',
};

function toDocs(snapshot) {
  return snapshot.docs.map(function (d) {
    return Object.assign({ id: d.id }, d.data());
  });
}

export async function getClientProjects(uid) {
  var q = query(collection(db, 'projects'), where('clientIds', 'array-contains', uid));
  var snapshot = await getDocs(q);
  return toDocs(snapshot);
}

export async function getAllProjects() {
  var snapshot = await getDocs(collection(db, 'projects'));
  return toDocs(snapshot);
}

export async function getProject(projectId) {
  var snapshot = await getDoc(doc(db, 'projects', projectId));
  if (!snapshot.exists()) {
    return null;
  }
  return Object.assign({ id: snapshot.id }, snapshot.data());
}

export async function getVersions(projectId) {
  var q = query(collection(db, 'projects', projectId, 'versions'), orderBy('aangemaaktOp', 'asc'));
  var snapshot = await getDocs(q);
  return toDocs(snapshot);
}

export async function getFeedback(projectId) {
  var q = query(collection(db, 'projects', projectId, 'feedback'), orderBy('tijdcode', 'asc'));
  var snapshot = await getDocs(q);
  return toDocs(snapshot);
}

export async function getReplies(projectId, feedbackId) {
  var q = query(
    collection(db, 'projects', projectId, 'feedback', feedbackId, 'replies'),
    orderBy('aangemaaktOp', 'asc')
  );
  var snapshot = await getDocs(q);
  return toDocs(snapshot);
}

export async function postFeedback(projectId, data) {
  return addDoc(collection(db, 'projects', projectId, 'feedback'), Object.assign({}, data, {
    status: 'open',
    aangemaaktOp: serverTimestamp(),
  }));
}

export async function postReply(projectId, feedbackId, data) {
  return addDoc(
    collection(db, 'projects', projectId, 'feedback', feedbackId, 'replies'),
    Object.assign({}, data, { aangemaaktOp: serverTimestamp() })
  );
}

export async function approveVersion(projectId, versionId, uid) {
  return updateDoc(doc(db, 'projects', projectId, 'versions', versionId), {
    approvedAt: serverTimestamp(),
    approvedBy: uid,
  });
}

export async function getDeadlines(projectId) {
  var q = query(collection(db, 'projects', projectId, 'deadlines'), orderBy('datum', 'asc'));
  var snapshot = await getDocs(q);
  return toDocs(snapshot);
}

/**
 * Eerste niet-afgeronde deadline, of null. Filtert client-side zodat we
 * geen samengestelde index (where + orderBy op verschillende velden) nodig
 * hebben voor zo'n klein, per-project lijstje.
 */
export function nextDeadline(deadlines) {
  for (var i = 0; i < deadlines.length; i++) {
    if (!deadlines[i].afgerond) {
      return deadlines[i];
    }
  }
  return null;
}

/**
 * De files-rule staat per document toe op "type == document" OF
 * "zichtbaarNaGoedkeuring == true" (naast admin). Een ongefilterde list-
 * query kan Firestore dat niet laten bewijzen (list-rules met resource.data
 * moeten overeenkomen met een where() in de query), dus we doen twee
 * gefilterde queries die elk precies op één van die twee takken aansluiten
 * en voegen de resultaten samen.
 */
/**
 * Admin-versie van getFiles: geen where()-filters nodig omdat isAdmin() in
 * de rule niet van resource.data afhangt, dus een ongefilterde list-query
 * mag gewoon (en toont ook nog-niet-zichtbare eindbestanden).
 */
export async function getAllFiles(projectId) {
  var snapshot = await getDocs(collection(db, 'projects', projectId, 'files'));
  return toDocs(snapshot);
}

export async function getFiles(projectId) {
  var col = collection(db, 'projects', projectId, 'files');
  var snapshots = await Promise.all([
    getDocs(query(col, where('type', '==', 'document'))),
    getDocs(query(col, where('zichtbaarNaGoedkeuring', '==', true))),
  ]);
  var seen = {};
  var result = [];
  snapshots.forEach(function (snapshot) {
    snapshot.docs.forEach(function (d) {
      if (!seen[d.id]) {
        seen[d.id] = true;
        result.push(Object.assign({ id: d.id }, d.data()));
      }
    });
  });
  return result;
}

/* --------------------------------------------------------------------------
 * Admin-schrijffuncties. Firestore-rules staan isAdmin() overal toe; deze
 * module checkt zelf geen rollen, dat doet firestore.rules al.
 * ------------------------------------------------------------------------ */

export async function getAllClients() {
  var snapshot = await getDocs(collection(db, 'clients'));
  return toDocs(snapshot);
}

export async function createClientRecord(data) {
  return addDoc(collection(db, 'clients'), Object.assign({}, data, { aangemaaktOp: serverTimestamp() }));
}

export async function createProject(data) {
  return addDoc(collection(db, 'projects'), Object.assign({}, data, { aangemaaktOp: serverTimestamp() }));
}

export async function updateProject(projectId, data) {
  return updateDoc(doc(db, 'projects', projectId), data);
}

export async function createVersion(projectId, data) {
  return addDoc(
    collection(db, 'projects', projectId, 'versions'),
    Object.assign({}, data, { aangemaaktOp: serverTimestamp(), approvedAt: null, approvedBy: null })
  );
}

export async function updateVersion(projectId, versionId, data) {
  return updateDoc(doc(db, 'projects', projectId, 'versions', versionId), data);
}

export async function createDeadline(projectId, data) {
  return addDoc(collection(db, 'projects', projectId, 'deadlines'), Object.assign({ afgerond: false }, data));
}

export async function updateDeadline(projectId, deadlineId, data) {
  return updateDoc(doc(db, 'projects', projectId, 'deadlines', deadlineId), data);
}

export async function createFile(projectId, data) {
  return addDoc(collection(db, 'projects', projectId, 'files'), data);
}

export async function updateFile(projectId, fileId, data) {
  return updateDoc(doc(db, 'projects', projectId, 'files', fileId), data);
}

export async function updateFeedbackStatus(projectId, feedbackId, status) {
  return updateDoc(doc(db, 'projects', projectId, 'feedback', feedbackId), { status: status });
}
