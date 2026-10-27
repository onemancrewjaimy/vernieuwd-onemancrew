/**
 * ONEMANCREW PORTAAL - projectdetailpagina
 *
 * De tijdcode komt altijd van de eigen klikbare balk (niet van de
 * ingebedde player), zodat feedback-tijdcodes consistent blijven ongeacht
 * welke versie of player wordt getoond.
 */
import { requireSession, signOutUser } from './auth.js';
import { functions } from './firebase-init.js';
import { httpsCallable } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js';
import {
  getProject,
  getVersions,
  getFeedback,
  getReplies,
  postFeedback,
  approveVersion,
  getDeadlines,
  getFiles,
  nextDeadline,
  FASES,
  FASE_LABELS,
  TYPE_LABELS,
} from './data.js';
import { formatDate, formatTimecode, parseTimecode } from './format.js';

var getPlaybackUrl = httpsCallable(functions, 'getPlaybackUrl');

var projectId = new URLSearchParams(window.location.search).get('id');
var state = {
  session: null,
  project: null,
  versions: [],
  deadlines: [],
  files: [],
  feedback: [],
  repliesByFeedbackId: {},
  selectedVersionId: null,
};

init();

async function init() {
  state.session = await requireSession();
  if (!state.session) return;

  document.getElementById('userEmail').textContent = state.session.user.email;
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
      getFiles(projectId),
      getFeedback(projectId),
    ]);
    state.versions = results[0];
    state.deadlines = results[1];
    state.files = results[2];
    state.feedback = results[3];
    state.repliesByFeedbackId = await loadAllReplies(state.feedback);

    state.selectedVersionId = state.versions.length
      ? state.versions[state.versions.length - 1].id
      : null;

    render();
    wireEvents();

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
      map[item.id] = await getReplies(projectId, item.id).catch(function () {
        return [];
      });
    })
  );
  return map;
}

function render() {
  renderHeader();
  renderPhaseBar();
  renderVersionSwitcher();
  renderPlayer();
  renderFeedbackThread();
  renderDeadlines();
  renderAgreement();
  renderFiles();
}

function renderHeader() {
  var p = state.project;
  document.getElementById('projectType').textContent = TYPE_LABELS[p.type] || p.type || '';
  document.getElementById('projectTitle').innerHTML =
    '<span class="p-weight-light">' + escapeHtml(p.titel || 'Zonder titel') + '</span>';
  document.getElementById('projectDates').textContent =
    (p.startdatum ? 'Start ' + formatDate(p.startdatum) : '') +
    (p.opleverdatum ? ' · Oplevering ' + formatDate(p.opleverdatum) : '');
  document.getElementById('mailJaimyBtn').href =
    'mailto:contact@onemancrew.nl?subject=' + encodeURIComponent('Project: ' + (p.titel || ''));
}

function renderPhaseBar() {
  var currentIndex = FASES.indexOf(state.project.fase);
  var html = FASES.map(function (fase, i) {
    var cls = 'p-phase-bar__step';
    if (i < currentIndex) cls += ' p-phase-bar__step--done';
    if (i === currentIndex) cls += ' p-phase-bar__step--current';
    return '<li class="' + cls + '">' + escapeHtml(FASE_LABELS[fase]) + '</li>';
  }).join('');
  document.getElementById('phaseBar').innerHTML = html;
}

function selectedVersion() {
  return state.versions.find(function (v) {
    return v.id === state.selectedVersionId;
  });
}

function renderVersionSwitcher() {
  var html = state.versions
    .map(function (v) {
      var active = v.id === state.selectedVersionId;
      return (
        '<button type="button" role="tab" aria-selected="' + active + '" class="p-version-switcher__btn' +
        (active ? ' p-version-switcher__btn--active' : '') +
        '" data-version-id="' + v.id + '">' + escapeHtml(v.label) + '</button>'
      );
    })
    .join('');
  document.getElementById('versionSwitcher').innerHTML =
    html || '<p class="p-text-muted p-text-sm">Nog geen versie opgeleverd.</p>';

  Array.prototype.forEach.call(document.querySelectorAll('[data-version-id]'), function (btn) {
    btn.addEventListener('click', function () {
      state.selectedVersionId = btn.getAttribute('data-version-id');
      renderVersionSwitcher();
      renderPlayer();
      renderFeedbackThread();
    });
  });
}

function renderPlayer() {
  var v = selectedVersion();
  document.getElementById('playerVersionLabel').textContent = v ? v.label : '';

  var approveBtn = document.getElementById('approveBtn');
  if (!v) {
    approveBtn.hidden = true;
  } else if (v.approvedAt) {
    approveBtn.hidden = false;
    approveBtn.disabled = true;
    approveBtn.textContent = 'Goedgekeurd';
  } else {
    approveBtn.hidden = false;
    approveBtn.disabled = false;
    approveBtn.textContent = 'Versie goedkeuren';
  }

  loadPlayerFrame(v);
}

async function loadPlayerFrame(v) {
  var frame = document.getElementById('playerFrame');
  var placeholder = document.querySelector('#player .p-player__placeholder');

  if (!v || !v.bunnyVideoId) {
    frame.hidden = true;
    frame.innerHTML = '';
    placeholder.hidden = false;
    return;
  }

  try {
    var result = await getPlaybackUrl({ projectId: projectId, versionId: v.id });
    if (!selectedVersion() || selectedVersion().id !== v.id) return; // intussen gewisseld
    frame.innerHTML =
      '<iframe src="' + result.data.embedUrl + '" loading="lazy" ' +
      'allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;" allowfullscreen></iframe>';
    frame.hidden = false;
    placeholder.hidden = true;
  } catch (error) {
    console.error('Video laden mislukt:', error);
    if (!selectedVersion() || selectedVersion().id !== v.id) return;
    frame.hidden = true;
    frame.innerHTML = '';
    placeholder.hidden = false;
  }
}

function renderFeedbackThread() {
  var feedbackForVersion = state.feedback
    .filter(function (f) {
      return f.versionId === state.selectedVersionId;
    })
    .slice()
    .sort(function (a, b) {
      return a.tijdcode - b.tijdcode;
    });

  var html = feedbackForVersion
    .map(function (f) {
      var replies = state.repliesByFeedbackId[f.id] || [];
      var repliesHtml = replies
        .map(function (r) {
          var naam = r.auteur.rol === 'admin' ? 'Jaimy · ONEMANCREW' : escapeHtml(r.auteur.naam);
          return (
            '<li class="p-feedback-reply"><span class="p-feedback-reply__author">' + naam + '</span>' +
            '<p>' + escapeHtml(r.tekst) + '</p></li>'
          );
        })
        .join('');
      var naam = f.auteur.rol === 'admin' ? 'Jaimy · ONEMANCREW' : escapeHtml(f.auteur.naam);
      var verwerkt = f.status === 'verwerkt';

      return (
        '<li class="p-feedback-item' + (verwerkt ? ' p-feedback-item--verwerkt' : '') + '">' +
          '<div class="p-feedback-item__head">' +
            '<button type="button" class="p-feedback-item__time" data-seek="' + f.tijdcode + '">' + formatTimecode(f.tijdcode) + '</button>' +
            '<span class="p-feedback-item__author">' + naam + '</span>' +
            '<span class="p-label p-feedback-item__status">' + (verwerkt ? 'Verwerkt' : 'Open') + '</span>' +
          '</div>' +
          '<p class="p-feedback-item__text">' + escapeHtml(f.tekst) + '</p>' +
          (repliesHtml ? '<ul class="p-feedback-replies">' + repliesHtml + '</ul>' : '') +
        '</li>'
      );
    })
    .join('');

  document.getElementById('feedbackThread').innerHTML =
    html || '<li class="p-text-muted p-text-sm">Nog geen feedback op deze versie.</li>';

  Array.prototype.forEach.call(document.querySelectorAll('[data-seek]'), function (btn) {
    btn.addEventListener('click', function () {
      document.getElementById('feedbackTimecode').value = formatTimecode(Number(btn.getAttribute('data-seek')));
      document.getElementById('feedbackText').focus();
    });
  });
}

function renderDeadlines() {
  var next = nextDeadline(state.deadlines);
  var html = state.deadlines
    .map(function (d) {
      var cls = 'p-deadline-item';
      if (d.afgerond) cls += ' p-deadline-item--done';
      else if (next && d.id === next.id) cls += ' p-deadline-item--next';
      return (
        '<li class="' + cls + '">' +
          '<span class="p-deadline-item__dot" aria-hidden="true"></span>' +
          '<span class="p-deadline-item__title">' + escapeHtml(d.titel) + '</span>' +
          '<span class="p-deadline-item__date">' + formatDate(d.datum) + '</span>' +
        '</li>'
      );
    })
    .join('');
  document.getElementById('deadlineList').innerHTML = html || '<li class="p-text-muted p-text-sm">Geen deadlines.</li>';
}

function renderAgreement() {
  var a = state.project.afspraken || {};
  var rows = [
    ['Wat je krijgt', a.watJeKrijgt],
    ['Formaten', a.formaten],
    ['Investering (excl. btw)', a.investeringExclBtw],
    ['Facturatie', a.facturatie],
    ['Gebruik', a.gebruik],
  ]
    .filter(function (row) {
      return row[1];
    })
    .map(function (row) {
      return '<dt>' + escapeHtml(row[0]) + '</dt><dd>' + escapeHtml(row[1]) + '</dd>';
    })
    .join('');

  document.getElementById('agreementBlock').innerHTML =
    '<p class="p-agreement__pledge">We schaven tot het klopt.</p>' +
    (rows ? '<dl class="p-agreement__list">' + rows + '</dl>' : '') +
    (a.pdfUrl
      ? '<a class="p-agreement__link" href="' + escapeHtml(a.pdfUrl) + '" target="_blank" rel="noopener">Bekijk offerte en voorwaarden</a>'
      : '');
}

function renderFiles() {
  var html = state.files
    .map(function (f) {
      return (
        '<li class="p-file-item">' +
          '<a href="' + escapeHtml(f.url) + '" target="_blank" rel="noopener">' + escapeHtml(f.naam) + '</a>' +
        '</li>'
      );
    })
    .join('');
  document.getElementById('fileList').innerHTML = html || '<li class="p-text-muted p-text-sm">Nog geen bestanden.</li>';
}

function wireEvents() {
  document.getElementById('approveBtn').addEventListener('click', async function () {
    if (!state.selectedVersionId) return;
    var btn = document.getElementById('approveBtn');
    btn.disabled = true;
    try {
      await approveVersion(projectId, state.selectedVersionId, state.session.user.uid);
      state.versions = await getVersions(projectId);
      renderPlayer();
    } catch (error) {
      btn.disabled = false;
      window.alert('Goedkeuren ging niet goed. Probeer het opnieuw.');
    }
  });

  document.getElementById('feedbackForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    var textEl = document.getElementById('feedbackText');
    var timecodeEl = document.getElementById('feedbackTimecode');
    var statusEl = document.getElementById('feedbackStatus');
    var text = textEl.value.trim();
    var tijdcode = parseTimecode(timecodeEl.value);

    if (!text) {
      statusEl.textContent = 'Vul eerst je feedback in.';
      return;
    }
    if (tijdcode === null) {
      statusEl.textContent = 'Vul een geldige tijdcode in, bijvoorbeeld 1:23.';
      return;
    }
    if (!state.selectedVersionId) {
      statusEl.textContent = 'Er is nog geen versie om feedback op te geven.';
      return;
    }

    var submitBtn = document.getElementById('feedbackSubmit');
    submitBtn.disabled = true;
    statusEl.textContent = '';

    try {
      await postFeedback(projectId, {
        versionId: state.selectedVersionId,
        tijdcode: tijdcode,
        tekst: text,
        auteur: {
          uid: state.session.user.uid,
          naam: state.session.user.email,
          rol: state.session.isAdmin ? 'admin' : 'klant',
        },
      });
      textEl.value = '';
      timecodeEl.value = '0:00';
      state.feedback = await getFeedback(projectId);
      state.repliesByFeedbackId = await loadAllReplies(state.feedback);
      renderFeedbackThread();
    } catch (error) {
      console.error('Feedback plaatsen mislukt:', error);
      statusEl.textContent = 'Plaatsen ging niet goed. Probeer het opnieuw.';
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
