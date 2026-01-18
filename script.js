
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

// 🔹 Firebase config
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

console.log("Leadership script loaded");

document.addEventListener("DOMContentLoaded", () => {

  if (window.__registerFormBound) return; // prevent double binding
  window.__registerFormBound = true;

  // ELEMENTS
  const form = document.getElementById("registerForm");
  const roleSelect = document.getElementById('role');
  const leadershipSection = document.getElementById('leadershipSection');
  const positionSection = document.getElementById('positionSection');
  const levelSelect = document.getElementById('level');
  const positionSelect = document.getElementById('position');
  const mpesaInput = document.getElementById("code");
  const submitBtn = document.getElementById("submitBtn");

  // PARISH & LOCAL POSITIONS
  const parishPositions = [
    "Parish Coordinator", "Parish vice coordinator",
    "Parish Secretary", "Parish vice secretary",
    "Parish Treasurer", "Parish liturgist",
    "Parish vice liturgist", "Parish organizing secretary",
    "Parish games captain", "Parish Disciplinarian"
  ];

  const localPositions = [
    "Local Coordinator", "Local vice coordinator",
    "Local Secretary", "Local vice secretary",
    "Local liturgist", "Local vice liturgist",
    "Local organizing secretary", "Local games captain",
    "Local Disciplinarian"
  ];

  // INITIAL STATE
  leadershipSection.style.display = 'none';
  positionSection.style.display = 'none';
  submitBtn.disabled = true; // initially disable register button

  // ROLE CHANGE
  roleSelect.addEventListener('change', () => {
    if (roleSelect.value.toLowerCase() === 'leader') {
      leadershipSection.style.display = 'block';
    } else {
      leadershipSection.style.display = 'none';
      positionSection.style.display = 'none';
      levelSelect.value = "";
      positionSelect.innerHTML = '<option value="">-- Choose Position --</option>';
    }
  });

  // LEVEL CHANGE
  levelSelect.addEventListener('change', () => {
    positionSelect.innerHTML = '<option value="">-- Choose Position --</option>';

    const positions =
      levelSelect.value === 'parish' ? parishPositions :
      levelSelect.value === 'local' ? localPositions : [];

    positions.forEach(pos => {
      const option = document.createElement('option');
      option.value = pos;
      option.textContent = pos;
      positionSelect.appendChild(option);
    });

    positionSection.style.display = positions.length ? 'block' : 'none';
  });

  // ENABLE/DISABLE SUBMIT BASED ON MPESA CODE
  mpesaInput.addEventListener('input', () => {
    submitBtn.disabled = mpesaInput.value.trim() === "";
  });

  // SUBMIT HANDLING
  let isSubmitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    try {
      const phone = document.getElementById("phone").value.trim();
      const mpesaCode = mpesaInput.value.trim();

      // ✅ VALIDATE MPESA CODE
      if (!mpesaCode) {
        alert("❌ Please paste your MPESA transaction code before registering.");
        mpesaInput.focus();
        isSubmitting = false;
        return;
      }

      // ❌ CHECK FOR DUPLICATE PHONE
      const q = query(collection(db, "registrations"), where("phone", "==", phone));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        alert("❌ This phone number is already registered!");
        isSubmitting = false;
        return;
      }

      // GATHER FORM DATA
      const formData = {
        name: document.getElementById("fullName").value.trim(),
        phone,
        age: document.getElementById("Age").value,
        gender: document.getElementById("Gender").value,
        localChurch: document.getElementById("localChurch").value,
        role: roleSelect.value,
        level: levelSelect.value || "",
        position: positionSelect.value || "",
        smallChristianCommunity: document.getElementById("jumuia").value.trim(),
        mpesaCode, // validated
        createdAt: serverTimestamp()
      };

      console.log("Form data to save:", formData);

      // SAVE TO FIRESTORE
      await addDoc(collection(db, "registrations"), formData);

      alert("✅ Registration successful!");
      form.reset();
      leadershipSection.style.display = 'none';
      positionSection.style.display = 'none';
      submitBtn.disabled = true; // disable again until next MPESA code

    } catch (err) {
      console.error("Firestore error:", err);
      alert("❌ Error: " + err.message);
    } finally {
      isSubmitting = false;
    }
  });

});
