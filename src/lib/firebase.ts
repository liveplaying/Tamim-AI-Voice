import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// We use a dummy config if the real one isn't available yet to prevent crashes
let firebaseConfig = {
  apiKey: "dummy",
  authDomain: "dummy",
  projectId: "dummy",
  storageBucket: "dummy",
  messagingSenderId: "dummy",
  appId: "dummy"
};

try {
  // @ts-ignore
  import config from './firebase-applet-config.json';
  firebaseConfig = config;
} catch (e) {
  console.warn("Firebase config not found, using dummy config");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signIn = () => signInWithPopup(auth, googleProvider);
export const signOut = () => auth.signOut();

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
