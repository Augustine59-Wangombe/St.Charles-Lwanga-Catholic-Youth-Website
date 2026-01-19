
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

// 🔹 Firebase Config
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

  // ELEMENTS
  const form = document.getElementById("registerForm");
  const roleSelect = document.getElementById("role");
  const leadershipSection = document.getElementById("leadershipSection");
  const positionSection = document.getElementById("positionSection");
  const levelSelect = document.getElementById("level");
  const positionSelect = document.getElementById("position");
  const mpesaInput = document.getElementById("code");
  const submitBtn = document.getElementById("submitBtn");

  // PARISH & LOCAL POSITIONS
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

  // FLEXIBLE MPESA / AIRTEL SMS PATTERN
  const mpesaPattern = /[A-Z0-9]{10}.*Confirmed\..*Ksh\d+(\.\d{2})?.*sent.*to.*\d{10}.*on.*\d{1,2}\/\d{1,2}\/\d{2}.*at.*\d{1,2}:\d{2}\s*(AM|PM)/i;

  // INITIAL STATE
  leadershipSection.style.display = "none";
  positionSection.style.display = "none";
  submitBtn.disabled = true;

  let isSubmitting = false;

  // VALIDATION FUNCTION
  function validateMpesa() {
    const text = mpesaInput.value.trim();
    if (!text || !mpesaPattern.test(text)) {
      mpesaInput.style.border = "2px solid red";
      submitBtn.disabled = true;
      return false;
    }
    mpesaInput.style.border = "2px solid green";
    submitBtn.disabled = false;
    return true;
  }

  // BLOCK TYPING — Paste Only
  mpesaInput.addEventListener("keydown", e => {
    if (!(e.ctrlKey || e.metaKey)) e.preventDefault();
  });

  // REAL-TIME VALIDATION ON INPUT (paste or typing)
  mpesaInput.addEventListener("input", validateMpesa);

  // ROLE CHANGE
  roleSelect.addEventListener("change", () => {
    if (roleSelect.value.toLowerCase() === "leader") {
      leadershipSection.style.display = "block";
    } else {
      leadershipSection.style.display = "none";
      positionSection.style.display = "none";
      levelSelect.value = "";
      positionSelect.innerHTML = "<option value=''>-- Choose Position --</option>";
    }
  });

  // LEVEL CHANGE
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

  // FORM SUBMIT HANDLER
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    const phone = document.getElementById("phone").value.trim();
    const mpesaCode = mpesaInput.value.trim();

    // VALIDATE MPESA BEFORE SUBMIT
    if (!validateMpesa()) {
      alert("❌ Please paste your valid MPESA/Airtel SMS before registering!");
      mpesaInput.focus();
      isSubmitting = false;
      return;
    }

    // CHECK DUPLICATE PHONE
    const q = query(collection(db, "registrations"), where("phone", "==", phone));
    const snap = await getDocs(q);
    if (!snap.empty) {
      alert("❌ Phone already registered!");
      mpesaInput.focus();
      isSubmitting = false;
      return;
    }

    // SAVE TO FIRESTORE
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
    mpesaInput.style.border = "";
    isSubmitting = false;
  });

});
