
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBw90VniQ8yVJiIPAAXiXO3qA_kpGDrz6w",
  authDomain: "registrations-5594b.firebaseapp.com",
  projectId: "registrations-5594b",
  storageBucket: "registrations-5594b.firebasestorage.app",
  messagingSenderId: "811011800366",
  appId: "1:811011800366:web:dd3c191aa20f8bc43a0ebf",
  measurementId: "G-YVRZ1WHD8R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
