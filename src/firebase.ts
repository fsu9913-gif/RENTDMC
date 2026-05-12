import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import fallbackConfig from '../firebase-applet-config.json';

// VITE_FIREBASE_* env vars take precedence when present. This lets you point
// the app at a different Firebase project (e.g. `samantha-gumption`) by
// pasting values into `.env.local` instead of editing tracked JSON.
// Falls back to firebase-applet-config.json (the AI Studio-provisioned project)
// when env vars are missing — i.e. zero-config local dev still works.
const env = import.meta.env;

const pick = (envValue: string | undefined, fallback: string): string =>
  envValue && envValue.length > 0 ? envValue : fallback;

const firebaseConfig: FirebaseOptions = {
  apiKey: pick(env.VITE_FIREBASE_API_KEY, fallbackConfig.apiKey),
  authDomain: pick(env.VITE_FIREBASE_AUTH_DOMAIN, fallbackConfig.authDomain),
  projectId: pick(env.VITE_FIREBASE_PROJECT_ID, fallbackConfig.projectId),
  storageBucket: pick(env.VITE_FIREBASE_STORAGE_BUCKET, fallbackConfig.storageBucket),
  messagingSenderId: pick(env.VITE_FIREBASE_MESSAGING_SENDER_ID, fallbackConfig.messagingSenderId),
  appId: pick(env.VITE_FIREBASE_APP_ID, fallbackConfig.appId),
  measurementId: pick(env.VITE_FIREBASE_MEASUREMENT_ID, fallbackConfig.measurementId),
};

const firestoreDatabaseId: string = pick(
  env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
  fallbackConfig.firestoreDatabaseId,
);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app, firestoreDatabaseId);
