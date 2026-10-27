/**
 * ONEMANCREW PORTAAL - "Jouw projecten." (klant)
 */
import { requireSession, signOutUser } from './auth.js';
import { getClientProjects, getDeadlines, nextDeadline, FASE_LABELS, TYPE_LABELS } from './data.js';
import { formatDate } from './format.js';

var session = await requireSession();
if (!session) {
  // requireSession heeft al doorgestuurd.
} else {
  document.getElementById('userEmail').textContent = session.user.email;
  document.getElementById('signOutBtn').addEventListener('click', signOutUser);
  await renderProjects(session.user.uid);
}

async function renderProjects(uid) {
  var loadingEl = document.getElementById('loadingState');
  var gridEl = document.getElementById('projectGrid');
  var emptyEl = document.getElementById('emptyState');

  try {
    var projects = await getClientProjects(uid);
    loadingEl.hidden = true;

    if (projects.length === 0) {
      emptyEl.hidden = false;
      return;
    }

    var cards = await Promise.all(projects.map(renderCard));
    gridEl.innerHTML = cards.join('');
    gridEl.hidden = false;
  } catch (error) {
    loadingEl.textContent = 'Projecten laden ging niet goed. Probeer de pagina te herladen.';
  }
}

async function renderCard(project) {
  var deadlines = await getDeadlines(project.id).catch(function () {
    return [];
  });
  var deadline = nextDeadline(deadlines);
  var isReview = project.fase === 'review';

  return (
    '<a class="p-project-card" href="project.html?id=' + encodeURIComponent(project.id) + '">' +
      '<div class="p-project-card__thumb p-viewfinder">' +
        (isReview ? '<span class="p-rec-dot" aria-hidden="true"></span>' : '') +
      '</div>' +
      '<div class="p-project-card__body">' +
        '<p class="p-label p-project-card__status">' + (project.status === 'afgerond' ? 'Afgerond' : 'Actief') + '</p>' +
        '<h2 class="p-project-card__title">' + escapeHtml(project.titel) + '</h2>' +
        '<p class="p-text-sm p-text-muted">' + escapeHtml(TYPE_LABELS[project.type] || project.type) + '</p>' +
        '<p class="p-text-sm">Huidige fase: <strong>' + escapeHtml(FASE_LABELS[project.fase] || project.fase) + '</strong></p>' +
        '<p class="p-text-sm p-text-muted">' +
          (deadline ? 'Volgende deadline: ' + escapeHtml(deadline.titel) + ' op ' + formatDate(deadline.datum) : 'Geen openstaande deadlines') +
        '</p>' +
      '</div>' +
    '</a>'
  );
}

function escapeHtml(value) {
  var div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML;
}
