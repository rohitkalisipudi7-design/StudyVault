import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const apiKey =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("YOUR_")
    ? process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    : "AIzaSyDUMMY_FOR_PRERENDER_BUILD_VALID";

const firebaseConfig = {
  apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "edufind-ai.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "edufind-ai",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "edufind-ai.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
};

let app: any;
let auth: any;
let googleProvider: any;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} catch (e) {
  auth = {
    currentUser: null,
    onAuthStateChanged: (_cb: any) => () => {},
    signOut: async () => {},
  } as any;
  googleProvider = {} as any;
}

export { auth, googleProvider };
