/**
 * ONEMANCREW PORTAAL - auth
 *
 * Alle Firebase Authentication-logica op één plek: inloggen, wachtwoord
 * vergeten, uitloggen, en een route-guard die de admin-rol uitleest uit de
 * custom claim "admin" (gezet via scripts/set-admin.js met de Admin SDK,
 * nooit in de frontend zelf).
 */
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { auth } from './firebase-init.js';

export const PORTAL_ROOT = '/portaal/';

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export function signOutUser() {
  return signOut(auth).then(() => {
    window.location.href = PORTAL_ROOT + 'login.html';
  });
}

/**
 * Wacht op de eerste auth-statuscheck (Firebase kan dit even laten duren
 * bij page load) en geeft { user, isAdmin } terug. isAdmin komt uit de
 * ID-token-claim, niet uit Firestore, zodat de rol niet client-side te
 * manipuleren is.
 */
export function getCurrentSession() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (!user) {
        resolve({ user: null, isAdmin: false });
        return;
      }
      try {
        const tokenResult = await user.getIdTokenResult();
        resolve({ user, isAdmin: tokenResult.claims.admin === true });
      } catch (error) {
        resolve({ user, isAdmin: false });
      }
    });
  });
}

/**
 * Route-guard voor beveiligde paginas.
 * - Niemand ingelogd: terug naar login.html.
 * - adminOnly=true maar geen admin: terug naar de klant-landingspagina.
 * Roep dit als eerste aan op elke pagina onder /portaal, behalve
 * login.html zelf.
 */
export async function requireSession(options) {
  var opts = options || {};
  var session = await getCurrentSession();
  if (!session.user) {
    window.location.href = PORTAL_ROOT + 'login.html';
    return null;
  }
  if (opts.adminOnly && !session.isAdmin) {
    window.location.href = PORTAL_ROOT + 'index.html';
    return null;
  }
  return session;
}

/**
 * Vertaalt de meest voorkomende Firebase auth-foutcodes naar korte,
 * Nederlandse meldingen. Firebase's eigen berichten zijn Engels en vaak te
 * technisch voor een klant.
 */
export function describeAuthError(error) {
  var code = error && error.code;
  switch (code) {
    case 'auth/invalid-email':
      return 'Dit is geen geldig e-mailadres.';
    case 'auth/user-disabled':
      return 'Dit account is gedeactiveerd. Neem contact op met Jaimy.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mailadres of wachtwoord klopt niet.';
    case 'auth/too-many-requests':
      return 'Te veel pogingen. Probeer het zo meteen opnieuw.';
    case 'auth/network-request-failed':
      return 'Geen verbinding. Controleer je internet en probeer opnieuw.';
    default:
      return 'Er ging iets mis. Probeer het opnieuw.';
  }
}
