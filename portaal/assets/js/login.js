/**
 * ONEMANCREW PORTAAL - loginpagina
 */
import { signIn, resetPassword, describeAuthError, getCurrentSession, PORTAL_ROOT } from './auth.js';

var form = document.getElementById('loginForm');
var emailInput = document.getElementById('email');
var passwordInput = document.getElementById('password');
var submitBtn = document.getElementById('submitBtn');
var forgotBtn = document.getElementById('forgotBtn');
var statusMsg = document.getElementById('statusMsg');

function setStatus(message, tone) {
  statusMsg.textContent = message || '';
  if (tone) {
    statusMsg.setAttribute('data-tone', tone);
  } else {
    statusMsg.removeAttribute('data-tone');
  }
}

function setBusy(isBusy) {
  submitBtn.disabled = isBusy;
  submitBtn.textContent = isBusy ? 'Bezig…' : 'Inloggen';
}

// Al ingelogd? Dan niet nog eens het loginscherm tonen.
getCurrentSession().then(function (session) {
  if (session.user) {
    window.location.href = PORTAL_ROOT + (session.isAdmin ? 'admin/' : '');
  }
});

form.addEventListener('submit', function (event) {
  event.preventDefault();
  var email = emailInput.value.trim();
  var password = passwordInput.value;

  if (!email || !password) {
    setStatus('Vul je e-mailadres en wachtwoord in.', 'error');
    return;
  }

  setBusy(true);
  setStatus('');

  signIn(email, password)
    .then(function () {
      return getCurrentSession();
    })
    .then(function (session) {
      window.location.href = PORTAL_ROOT + (session.isAdmin ? 'admin/' : '');
    })
    .catch(function (error) {
      setBusy(false);
      setStatus(describeAuthError(error), 'error');
    });
});

forgotBtn.addEventListener('click', function () {
  var email = emailInput.value.trim();
  if (!email) {
    setStatus('Vul eerst je e-mailadres in, dan sturen we een resetlink.', 'error');
    emailInput.focus();
    return;
  }

  setStatus('Bezig…');
  resetPassword(email)
    .then(function () {
      setStatus('Check je inbox: we hebben een link gestuurd om je wachtwoord opnieuw in te stellen.', 'success');
    })
    .catch(function (error) {
      setStatus(describeAuthError(error), 'error');
    });
});
