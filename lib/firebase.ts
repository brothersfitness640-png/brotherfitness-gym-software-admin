import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCVN4peRbWTqSgMPvV2AnDp4KTnFFt5NuE",
  authDomain: "brothers-fitness-3fb8b.firebaseapp.com",
  projectId: "brothers-fitness-3fb8b",
  storageBucket: "brothers-fitness-3fb8b.firebasestorage.app",
  messagingSenderId: "994625435035",
  appId: "1:994625435035:web:f895377de6e1619acb9d3e",
  measurementId: "G-YCL3NFV6YB"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
