
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

// Firebase Config
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

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("registerForm");
  const roleSelect = document.getElementById("role");
  const leadershipSection = document.getElementById("leadershipSection");
  const positionSection = document.getElementById("positionSection");
  const levelSelect = document.getElementById("level");
  const positionSelect = document.getElementById("position");
  const mpesaInput = document.getElementById("code");
  const submitBtn = document.getElementById("submitBtn");

  // STRICT MPESA / AIRTEL SMS PATTERN
  const mpesaPattern = /^[A-Z0-9]{10}\s+Confirmed\.\s*Ksh\d+(\.\d{2})?\s*sent\s+to\s+.+\s+\d{10}\s+on\s+\d{1,2}\/\d{1,2}\/\d{2}\s+at\s+\d{1,2}:\d{2}\s*(AM|PM)\./i;

  // BLOCK TYPING
  mpesaInput.addEventListener("keydown", e => e.preventDefault());

  // VALIDATE AFTER PASTE
  mpesaInput.addEventListener("paste", () => {
    setTimeout(() => {
      const text = mpesaInput.value.trim();
      submitBtn.disabled = !mpesaPattern.test(text);
      if (submitBtn.disabled) {
        alert("❌ Only valid MPESA/Airtel SMS allowed!");
        mpesaInput.value = "";
      }
    }, 50);
  });

  leadershipSection.style.display = "none";
  positionSection.style.display = "none";
  submitBtn.disabled = true;

  const parishPositions = [
    "Parish Coordinator","Parish vice coordinator","Parish Secretary",
    "Parish vice secretary","Parish Treasurer","Parish liturgist",
    "Parish vice liturgist","Parish organizing secretary",
    "Parish games captain","Parish Disciplinarian"
  ];

  const localPositions = [
    "Local Coordinator","Local vice coordinator","Local Secretary",
    "Local vice secretary","Local liturgist","Local vice liturgist",
    "Local organizing secretary","Local games captain","Local Disciplinarian"
  ];

  roleSelect.addEventListener("change", () => {
    if (roleSelect.value.toLowerCase() === "leader") {
      leadershipSection.style.display = "block";
    } else {
      leadershipSection.style.display = "none";
      positionSection.style.display = "none";
    }
  });

  levelSelect.addEventListener("change", () => {
    positionSelect.innerHTML = "<option value=''>-- Choose Position --</option>";
    const list = levelSelect.value === "parish" ? parishPositions :
                 levelSelect.value === "local" ? localPositions : [];
    list.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p;
      opt.textContent = p;
      positionSelect.appendChild(opt);
    });
    positionSection.style.display = list.length ? "block" : "none";
  });

  let isSubmitting = false;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    const phone = document.getElementById("phone").value.trim();
    const mpesaCode = mpesaInput.value.trim();

    // STRICT CHECK AGAIN
    if (!mpesaPattern.test(mpesaCode)) {
      alert("❌ Invalid MPESA/Airtel SMS format!");
      isSubmitting = false;
      return;
    }

    const q = query(collection(db, "registrations"), where("phone", "==", phone));
    const snap = await getDocs(q);
    if (!snap.empty) {
      alert("❌ Phone already registered!");
      isSubmitting = false;
      return;
    }

    await addDoc(collection(db, "registrations"), {
      name: document.getElementById("fullName").value.trim(),
      phone,
      age: document.getElementById("Age").value,
      gender: document.getElementById("Gender").value,
      localChurch: document.getElementById("localChurch").value,
      role: roleSelect.value,
      level: levelSelect.value || "",
      position: positionSelect.value || "",
      smallChristianCommunity: document.getElementById("jumuia").value.trim(),
      mpesaCode,
      createdAt: serverTimestamp()
    });

    alert("✅ Registration Successful!");
    form.reset();
    submitBtn.disabled = true;
    leadershipSection.style.display = "none";
    positionSection.style.display = "none";
    isSubmitting = false;
  });

});
