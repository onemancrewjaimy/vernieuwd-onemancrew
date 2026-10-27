/**
 * ONEMANCREW PORTAAL - admin-overzicht
 * Alle klanten en projecten, met formulieren om nieuwe aan te maken.
 */
import { requireSession, signOutUser, resetPassword } from './auth.js';
import { functions } from './firebase-init.js';
import { httpsCallable } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js';
import {
  getAllProjects,
  getAllClients,
  createProject,
  createClientRecord,
  getFeedback,
  FASE_LABELS,
  TYPE_LABELS,
} from './data.js';

var createClientAccount = httpsCallable(functions, 'createClientAccount');
var clients = [];
var projects = [];

init();

async function init() {
  var session = await requireSession({ adminOnly: true });
  if (!session) return;

  document.getElementById('userEmail').textContent = session.user.email;
  document.getElementById('signOutBtn').addEventListener('click', signOutUser);

  wireToggle('toggleProjectForm', 'projectForm');
  wireToggle('toggleClientForm', 'clientForm');

  document.getElementById('projectForm').addEventListener('submit', onCreateProject);
  document.getElementById('clientForm').addEventListener('submit', onCreateClient);

  await Promise.all([loadClients(), loadProjects()]);
}

function wireToggle(buttonId, formId) {
  document.getElementById(buttonId).addEventListener('click', function () {
    var form = document.getElementById(formId);
    form.hidden = !form.hidden;
  });
}

async function loadClients() {
  clients = await getAllClients();
  renderClientChecklist();
  renderClientList();
}

async function loadProjects() {
  projects = await getAllProjects();
  await Promise.all(
    projects.map(async function (p) {
      var feedback = await getFeedback(p.id).catch(function () { return []; });
      p.openFeedbackCount = feedback.filter(function (f) { return f.status === 'open'; }).length;
    })
  );
  renderProjectList();
  renderSummary();
}

function renderSummary() {
  var projectenMetFeedback = projects.filter(function (p) { return (p.openFeedbackCount || 0) > 0; }).length;
  var summaryEl = document.getElementById('adminSummary');
  if (!projectenMetFeedback) {
    summaryEl.hidden = true;
    return;
  }
  summaryEl.hidden = false;
  summaryEl.innerHTML =
    '<span class="p-rec-dot" aria-hidden="true"></span> ' +
    projectenMetFeedback + (projectenMetFeedback === 1 ? ' project wacht' : ' projecten wachten') +
    ' op jouw reactie.';
}

function clientNaam(clientId) {
  var c = clients.find(function (x) { return x.id === clientId; });
  return c ? c.bedrijfsnaam : '(onbekende klant)';
}

function renderClientChecklist() {
  var html = clients
    .map(function (c) {
      return (
        '<label class="p-admin-checklist__item">' +
          '<input type="checkbox" value="' + c.id + '"> ' + escapeHtml(c.bedrijfsnaam) +
        '</label>'
      );
    })
    .join('');
  document.getElementById('pfClients').innerHTML = html || '<p class="p-text-muted p-text-sm">Nog geen klanten, maak er eerst een aan.</p>';
}

function renderClientList() {
  document.getElementById('clientLoading').hidden = true;
  var listEl = document.getElementById('clientList');
  listEl.hidden = false;
  var html = clients
    .map(function (c) {
      return (
        '<li class="p-admin-row">' +
          '<span class="p-admin-row__title">' + escapeHtml(c.bedrijfsnaam) + '</span>' +
          '<span class="p-text-muted p-text-sm">' + escapeHtml(c.contactpersoon || '') + '</span>' +
          '<span class="p-text-muted p-text-sm">' + escapeHtml(c.email || '') + '</span>' +
        '</li>'
      );
    })
    .join('');
  listEl.innerHTML = html || '<li class="p-text-muted p-text-sm">Nog geen klanten.</li>';
}

function renderProjectList() {
  document.getElementById('projectLoading').hidden = true;
  var listEl = document.getElementById('projectList');
  listEl.hidden = false;

  var sorted = projects.slice().sort(function (a, b) {
    return (b.openFeedbackCount || 0) - (a.openFeedbackCount || 0);
  });

  var html = sorted
    .map(function (p) {
      var klantNamen = (p.clientIds || []).map(clientNaam).join(', ');
      var count = p.openFeedbackCount || 0;
      var melding = count
        ? '<span class="p-admin-badge"><span class="p-rec-dot" aria-hidden="true"></span>' + count + ' open</span>'
        : '<span class="p-text-muted p-text-sm">Geen open feedback</span>';
      return (
        '<li class="p-admin-row">' +
          '<a class="p-admin-row__title" href="project.html?id=' + encodeURIComponent(p.id) + '">' + escapeHtml(p.titel || 'Zonder titel') + '</a>' +
          '<span class="p-label">' + escapeHtml(FASE_LABELS[p.fase] || p.fase || '') + '</span>' +
          '<span class="p-text-muted p-text-sm">' + escapeHtml(klantNamen) + '</span>' +
          melding +
        '</li>'
      );
    })
    .join('');
  listEl.innerHTML = html || '<li class="p-text-muted p-text-sm">Nog geen projecten.</li>';
}

async function onCreateProject(event) {
  event.preventDefault();
  var statusEl = document.getElementById('pfStatus');
  var submitBtn = document.getElementById('pfSubmit');
  var titel = document.getElementById('pfTitel').value.trim();
  if (!titel) {
    statusEl.textContent = 'Vul een titel in.';
    return;
  }
  var clientIds = Array.prototype.map.call(
    document.querySelectorAll('#pfClients input[type="checkbox"]:checked'),
    function (el) { return el.value; }
  );

  submitBtn.disabled = true;
  statusEl.textContent = '';
  try {
    await createProject({
      titel: titel,
      type: document.getElementById('pfType').value,
      fase: document.getElementById('pfFase').value,
      startdatum: dateOrNull('pfStart'),
      opleverdatum: dateOrNull('pfOplevering'),
      clientIds: clientIds,
      afspraken: {},
    });
    document.getElementById('projectForm').reset();
    document.getElementById('projectForm').hidden = true;
    await loadProjects();
  } catch (error) {
    console.error('Project aanmaken mislukt:', error);
    statusEl.textContent = 'Aanmaken ging niet goed. Probeer het opnieuw.';
  } finally {
    submitBtn.disabled = false;
  }
}

async function onCreateClient(event) {
  event.preventDefault();
  var statusEl = document.getElementById('cfStatus');
  var submitBtn = document.getElementById('cfSubmit');
  var bedrijfsnaam = document.getElementById('cfBedrijfsnaam').value.trim();
  var email = document.getElementById('cfEmail').value.trim();
  if (!bedrijfsnaam || !email) {
    statusEl.textContent = 'Vul bedrijfsnaam en e-mailadres in.';
    return;
  }

  submitBtn.disabled = true;
  statusEl.textContent = 'Account aanmaken...';
  try {
    var result = await createClientAccount({ email: email });
    await createClientRecord({
      bedrijfsnaam: bedrijfsnaam,
      contactpersoon: document.getElementById('cfContactpersoon').value.trim(),
      email: email,
      uids: [result.data.uid],
    });
    statusEl.textContent = 'Uitnodiging versturen...';
    await resetPassword(email);
    document.getElementById('clientForm').reset();
    document.getElementById('clientForm').hidden = true;
    await loadClients();
  } catch (error) {
    console.error('Klant aanmaken mislukt:', error);
    statusEl.textContent = 'Aanmaken ging niet goed. Probeer het opnieuw.';
  } finally {
    submitBtn.disabled = false;
  }
}

function dateOrNull(inputId) {
  var value = document.getElementById(inputId).value;
  return value ? value : null;
}

function escapeHtml(value) {
  var div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML;
}
