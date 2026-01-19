
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBTetCGwIFv5q8GYe9j4KMTjrcPKCGlK5w",
  authDomain: "fyp-database-f2d52.firebaseapp.com",
  databaseURL: "https://fyp-database-f2d52-default-rtdb.firebaseio.com",
  projectId: "fyp-database-f2d52",
  storageBucket: "fyp-database-f2d52.firebasestorage.app",
  messagingSenderId: "1053510911104",
  appId: "1:1053510911104:web:4301add2bf55e63db39265",
  measurementId: "G-Y4RVW0SYY1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
