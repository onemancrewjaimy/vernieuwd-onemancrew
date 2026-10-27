/**
 * ONEMANCREW PORTAAL - admin: één project beheren
 * Fase/afspraken, versies, deadlines, bestanden en feedback, allemaal
 * directe Firestore-writes (firestore.rules staat isAdmin() overal toe).
 */
import { requireSession, signOutUser } from './auth.js';
import {
  getProject,
  getVersions,
  getDeadlines,
  getAllFiles,
  getFeedback,
  getReplies,
  postReply,
  updateFeedbackStatus,
  updateProject,
  createVersion,
  updateVersion,
  createDeadline,
  updateDeadline,
  createFile,
  updateFile,
  TYPE_LABELS,
} from './data.js';
import { formatDate, formatTimecode } from './format.js';

var projectId = new URLSearchParams(window.location.search).get('id');
var session = null;
var state = {
  project: null,
  versions: [],
  deadlines: [],
  files: [],
  feedback: [],
  repliesByFeedbackId: {},
};

init();

async function init() {
  session = await requireSession({ adminOnly: true });
  if (!session) return;

  document.getElementById('userEmail').textContent = session.user.email;
  document.getElementById('signOutBtn').addEventListener('click', signOutUser);

  if (!projectId) {
    showError();
    return;
  }

  try {
    state.project = await getProject(projectId);
    if (!state.project) {
      showError();
      return;
    }
    var results = await Promise.all([
      getVersions(projectId),
      getDeadlines(projectId),
      getAllFiles(projectId),
      getFeedback(projectId),
    ]);
    state.versions = results[0];
    state.deadlines = results[1];
    state.files = results[2];
    state.feedback = results[3];
    state.repliesByFeedbackId = await loadAllReplies(state.feedback);

    renderAll();
    wireForms();

    document.getElementById('loadingState').hidden = true;
    document.getElementById('projectContent').hidden = false;
  } catch (error) {
    console.error('Project laden mislukt:', error);
    showError();
  }
}

function showError() {
  document.getElementById('loadingState').hidden = true;
  document.getElementById('errorState').hidden = false;
}

async function loadAllReplies(feedbackItems) {
  var map = {};
  await Promise.all(
    feedbackItems.map(async function (item) {
      map[item.id] = await getReplies(projectId, item.id).catch(function () { return []; });
    })
  );
  return map;
}

function renderAll() {
  var p = state.project;
  document.getElementById('projectType').textContent = TYPE_LABELS[p.type] || p.type || '';
  document.getElementById('projectTitle').innerHTML =
    '<span class="p-weight-light">' + escapeHtml(p.titel || 'Zonder titel') + '</span>';

  document.getElementById('mfFase').value = p.fase || 'briefing';
  document.getElementById('mfStart').value = p.startdatum || '';
  document.getElementById('mfOplevering').value = p.opleverdatum || '';
  var a = p.afspraken || {};
  document.getElementById('mfWatJeKrijgt').value = a.watJeKrijgt || '';
  document.getElementById('mfFormaten').value = a.formaten || '';
  document.getElementById('mfInvestering').value = a.investeringExclBtw || '';
  document.getElementById('mfFacturatie').value = a.facturatie || '';
  document.getElementById('mfGebruik').value = a.gebruik || '';
  document.getElementById('mfPdfUrl').value = a.pdfUrl || '';

  renderVersionList();
  renderDeadlineList();
  renderFileList();
  renderFeedbackThread();
}

function renderVersionList() {
  var html = state.versions
    .map(function (v) {
      return (
        '<li class="p-admin-row" data-version-id="' + v.id + '">' +
          '<span class="p-admin-row__title">' + escapeHtml(v.label) + '</span>' +
          '<span class="p-text-muted p-text-sm">' + (v.approvedAt ? 'Goedgekeurd' : 'Nog niet goedgekeurd') + '</span>' +
          '<input type="text" class="p-admin-inline-input" value="' + escapeHtml(v.bunnyVideoId || '') + '" placeholder="Bunny video-GUID" data-version-bunny>' +
          '<button type="button" class="p-btn p-btn--ghost p-btn--sm" data-save-version>Opslaan</button>' +
        '</li>'
      );
    })
    .join('');
  document.getElementById('versionList').innerHTML = html || '<li class="p-text-muted p-text-sm">Nog geen versies.</li>';

  Array.prototype.forEach.call(document.querySelectorAll('[data-save-version]'), function (btn) {
    btn.addEventListener('click', async function () {
      var row = btn.closest('[data-version-id]');
      var versionId = row.getAttribute('data-version-id');
      var bunnyId = row.querySelector('[data-version-bunny]').value.trim();
      btn.disabled = true;
      try {
        await updateVersion(projectId, versionId, { bunnyVideoId: bunnyId || null });
        state.versions = await getVersions(projectId);
        renderVersionList();
      } catch (error) {
        console.error('Versie opslaan mislukt:', error);
        window.alert('Opslaan ging niet goed. Probeer het opnieuw.');
      } finally {
        btn.disabled = false;
      }
    });
  });
}

function renderDeadlineList() {
  var html = state.deadlines
    .map(function (d) {
      return (
        '<li class="p-admin-row" data-deadline-id="' + d.id + '">' +
          '<span class="p-admin-row__title">' + escapeHtml(d.titel) + '</span>' +
          '<span class="p-text-muted p-text-sm">' + formatDate(d.datum) + '</span>' +
          '<span class="p-text-muted p-text-sm">' + escapeHtml(d.verantwoordelijke || '') + '</span>' +
          '<label class="p-admin-checklist__item"><input type="checkbox" data-deadline-afgerond' + (d.afgerond ? ' checked' : '') + '> Afgerond</label>' +
        '</li>'
      );
    })
    .join('');
  document.getElementById('deadlineList').innerHTML = html || '<li class="p-text-muted p-text-sm">Nog geen deadlines.</li>';

  Array.prototype.forEach.call(document.querySelectorAll('[data-deadline-afgerond]'), function (checkbox) {
    checkbox.addEventListener('change', async function () {
      var row = checkbox.closest('[data-deadline-id]');
      var deadlineId = row.getAttribute('data-deadline-id');
      checkbox.disabled = true;
      try {
        await updateDeadline(projectId, deadlineId, { afgerond: checkbox.checked });
        state.deadlines = await getDeadlines(projectId);
      } catch (error) {
        console.error('Deadline bijwerken mislukt:', error);
        checkbox.checked = !checkbox.checked;
      } finally {
        checkbox.disabled = false;
      }
    });
  });
}

function renderFileList() {
  var html = state.files
    .map(function (f) {
      var toggle = f.type === 'eindbestand'
        ? '<label class="p-admin-checklist__item"><input type="checkbox" data-file-zichtbaar' + (f.zichtbaarNaGoedkeuring ? ' checked' : '') + '> Zichtbaar voor klant</label>'
        : '<span class="p-text-muted p-text-sm">Altijd zichtbaar</span>';
      return (
        '<li class="p-admin-row" data-file-id="' + f.id + '">' +
          '<a class="p-admin-row__title" href="' + escapeHtml(f.url) + '" target="_blank" rel="noopener">' + escapeHtml(f.naam) + '</a>' +
          '<span class="p-text-muted p-text-sm">' + (f.type === 'eindbestand' ? 'Eindbestand' : 'Document') + '</span>' +
          toggle +
        '</li>'
      );
    })
    .join('');
  document.getElementById('fileList').innerHTML = html || '<li class="p-text-muted p-text-sm">Nog geen bestanden.</li>';

  Array.prototype.forEach.call(document.querySelectorAll('[data-file-zichtbaar]'), function (checkbox) {
    checkbox.addEventListener('change', async function () {
      var row = checkbox.closest('[data-file-id]');
      var fileId = row.getAttribute('data-file-id');
      checkbox.disabled = true;
      try {
        await updateFile(projectId, fileId, { zichtbaarNaGoedkeuring: checkbox.checked });
        state.files = await getAllFiles(projectId);
      } catch (error) {
        console.error('Bestand bijwerken mislukt:', error);
        checkbox.checked = !checkbox.checked;
      } finally {
        checkbox.disabled = false;
      }
    });
  });
}

function renderFeedbackThread() {
  var sorted = state.feedback.slice().sort(function (a, b) { return a.tijdcode - b.tijdcode; });
  var html = sorted
    .map(function (f) {
      var replies = state.repliesByFeedbackId[f.id] || [];
      var repliesHtml = replies
        .map(function (r) {
          var naam = r.auteur.rol === 'admin' ? 'Jaimy · ONEMANCREW' : escapeHtml(r.auteur.naam);
          return '<li class="p-feedback-reply"><span class="p-feedback-reply__author">' + naam + '</span><p>' + escapeHtml(r.tekst) + '</p></li>';
        })
        .join('');
      var naam = f.auteur.rol === 'admin' ? 'Jaimy · ONEMANCREW' : escapeHtml(f.auteur.naam);
      var verwerkt = f.status === 'verwerkt';
      var versieLabel = versionLabel(f.versionId);

      return (
        '<li class="p-feedback-item' + (verwerkt ? ' p-feedback-item--verwerkt' : '') + '" data-feedback-id="' + f.id + '">' +
          '<div class="p-feedback-item__head">' +
            '<span class="p-feedback-item__time">' + formatTimecode(f.tijdcode) + ' &middot; ' + escapeHtml(versieLabel) + '</span>' +
            '<span class="p-feedback-item__author">' + naam + '</span>' +
            '<span class="p-label p-feedback-item__status">' + (verwerkt ? 'Verwerkt' : 'Open') + '</span>' +
          '</div>' +
          '<p class="p-feedback-item__text">' + escapeHtml(f.tekst) + '</p>' +
          (repliesHtml ? '<ul class="p-feedback-replies">' + repliesHtml + '</ul>' : '') +
          '<form class="p-admin-reply-form" data-reply-form>' +
            '<input type="text" placeholder="Reactie..." data-reply-text required>' +
            '<button type="submit" class="p-btn p-btn--ghost p-btn--sm">Reageren</button>' +
            '<button type="button" class="p-btn p-btn--ghost p-btn--sm" data-toggle-status>' + (verwerkt ? 'Heropenen' : 'Markeer verwerkt') + '</button>' +
          '</form>' +
        '</li>'
      );
    })
    .join('');

  document.getElementById('feedbackThread').innerHTML = html || '<li class="p-text-muted p-text-sm">Nog geen feedback.</li>';

  Array.prototype.forEach.call(document.querySelectorAll('[data-reply-form]'), function (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      var feedbackId = form.closest('[data-feedback-id]').getAttribute('data-feedback-id');
      var input = form.querySelector('[data-reply-text]');
      var tekst = input.value.trim();
      if (!tekst) return;
      try {
        await postReply(projectId, feedbackId, {
          tekst: tekst,
          auteur: { uid: session.user.uid, naam: session.user.email, rol: 'admin' },
        });
        state.feedback = await getFeedback(projectId);
        state.repliesByFeedbackId = await loadAllReplies(state.feedback);
        renderFeedbackThread();
      } catch (error) {
        console.error('Reageren mislukt:', error);
        window.alert('Reageren ging niet goed. Probeer het opnieuw.');
      }
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-toggle-status]'), function (btn) {
    btn.addEventListener('click', async function () {
      var feedbackId = btn.closest('[data-feedback-id]').getAttribute('data-feedback-id');
      var current = state.feedback.find(function (f) { return f.id === feedbackId; });
      var nieuwStatus = current && current.status === 'verwerkt' ? 'open' : 'verwerkt';
      btn.disabled = true;
      try {
        await updateFeedbackStatus(projectId, feedbackId, nieuwStatus);
        state.feedback = await getFeedback(projectId);
        renderFeedbackThread();
      } catch (error) {
        console.error('Status bijwerken mislukt:', error);
        btn.disabled = false;
      }
    });
  });
}

function versionLabel(versionId) {
  var v = state.versions.find(function (x) { return x.id === versionId; });
  return v ? v.label : '';
}

function wireForms() {
  document.getElementById('metaForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    var statusEl = document.getElementById('mfStatus');
    var submitBtn = document.getElementById('mfSubmit');
    submitBtn.disabled = true;
    statusEl.textContent = '';
    try {
      await updateProject(projectId, {
        fase: document.getElementById('mfFase').value,
        startdatum: document.getElementById('mfStart').value || null,
        opleverdatum: document.getElementById('mfOplevering').value || null,
        afspraken: {
          watJeKrijgt: document.getElementById('mfWatJeKrijgt').value.trim(),
          formaten: document.getElementById('mfFormaten').value.trim(),
          investeringExclBtw: document.getElementById('mfInvestering').value.trim(),
          facturatie: document.getElementById('mfFacturatie').value.trim(),
          gebruik: document.getElementById('mfGebruik').value.trim(),
          pdfUrl: document.getElementById('mfPdfUrl').value.trim(),
        },
      });
      state.project = await getProject(projectId);
      statusEl.textContent = 'Opgeslagen.';
    } catch (error) {
      console.error('Opslaan mislukt:', error);
      statusEl.textContent = 'Opslaan ging niet goed. Probeer het opnieuw.';
    } finally {
      submitBtn.disabled = false;
    }
  });

  document.getElementById('versionForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    var statusEl = document.getElementById('vfStatus');
    var label = document.getElementById('vfLabel').value.trim();
    if (!label) {
      statusEl.textContent = 'Vul een label in.';
      return;
    }
    var submitBtn = document.getElementById('vfSubmit');
    submitBtn.disabled = true;
    try {
      var bunnyId = document.getElementById('vfBunnyId').value.trim();
      var duur = document.getElementById('vfDuur').value;
      await createVersion(projectId, {
        label: label,
        bunnyVideoId: bunnyId || null,
        duur: duur ? Number(duur) : null,
      });
      document.getElementById('versionForm').reset();
      statusEl.textContent = '';
      state.versions = await getVersions(projectId);
      renderVersionList();
    } catch (error) {
      console.error('Versie toevoegen mislukt:', error);
      statusEl.textContent = 'Toevoegen ging niet goed. Probeer het opnieuw.';
    } finally {
      submitBtn.disabled = false;
    }
  });

  document.getElementById('deadlineForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    var statusEl = document.getElementById('dfStatus');
    var titel = document.getElementById('dfTitel').value.trim();
    var datum = document.getElementById('dfDatum').value;
    if (!titel || !datum) {
      statusEl.textContent = 'Vul titel en datum in.';
      return;
    }
    var submitBtn = document.getElementById('dfSubmit');
    submitBtn.disabled = true;
    try {
      await createDeadline(projectId, {
        titel: titel,
        datum: datum,
        verantwoordelijke: document.getElementById('dfVerantwoordelijke').value,
      });
      document.getElementById('deadlineForm').reset();
      statusEl.textContent = '';
      state.deadlines = await getDeadlines(projectId);
      renderDeadlineList();
    } catch (error) {
      console.error('Deadline toevoegen mislukt:', error);
      statusEl.textContent = 'Toevoegen ging niet goed. Probeer het opnieuw.';
    } finally {
      submitBtn.disabled = false;
    }
  });

  document.getElementById('ffType').addEventListener('change', function () {
    document.getElementById('ffZichtbaarWrap').hidden = this.value !== 'eindbestand';
  });

  document.getElementById('fileForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    var statusEl = document.getElementById('ffStatus');
    var naam = document.getElementById('ffNaam').value.trim();
    var url = document.getElementById('ffUrl').value.trim();
    if (!naam || !url) {
      statusEl.textContent = 'Vul naam en link in.';
      return;
    }
    var submitBtn = document.getElementById('ffSubmit');
    submitBtn.disabled = true;
    try {
      var type = document.getElementById('ffType').value;
      await createFile(projectId, {
        naam: naam,
        url: url,
        type: type,
        zichtbaarNaGoedkeuring: type === 'eindbestand' ? document.getElementById('ffZichtbaar').checked : true,
      });
      document.getElementById('fileForm').reset();
      document.getElementById('ffZichtbaarWrap').hidden = true;
      statusEl.textContent = '';
      state.files = await getAllFiles(projectId);
      renderFileList();
    } catch (error) {
      console.error('Bestand toevoegen mislukt:', error);
      statusEl.textContent = 'Toevoegen ging niet goed. Probeer het opnieuw.';
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function escapeHtml(value) {
  var div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML;
}
