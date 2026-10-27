/**
 * ONEMANCREW PORTAAL - Firebase init
 *
 * Laadt de Firebase JS SDK als ES-modules rechtstreeks vanaf Google's CDN,
 * precies zoals de rest van de site fonts en iconen via een CDN laadt.
 * Geen bundler, geen npm install nodig om de site te bekijken.
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { getFunctions } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js';
import { firebaseConfig } from './firebase-config.js';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'europe-west1');
