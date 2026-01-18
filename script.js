// 🔥 Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";




console.log("Leadership script loaded");

document.addEventListener("DOMContentLoaded", () => {

  // 🚫 GLOBAL GUARD — prevents double execution
  if (window.__registerFormBound) return;
  window.__registerFormBound = true;

  // ELEMENTS
  const form = document.getElementById("registerForm");
  const roleSelect = document.getElementById('role');
  const leadershipSection = document.getElementById('leadershipSection');
  const positionSection = document.getElementById('positionSection');
  const levelSelect = document.getElementById('level');
  const positionSelect = document.getElementById('position');

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

  // HIDE SECTIONS INITIALLY
  leadershipSection.style.display = 'none';
  positionSection.style.display = 'none';

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

  // 🚀 SUBMIT HANDLING
  let isSubmitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    try {
      const phone = document.getElementById("phone").value.trim();

      // ❌ Check if user already exists
      const q = query(collection(db, "registrations"), where("phone", "==", phone));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        alert("❌ This phone number is already registered!");
        isSubmitting = false;
        return;
      }

      // Gather form values
      const formData = {
        name: document.getElementById("fullName").value.trim(),
        phone,
        age: document.getElementById("Age").value,
        gender: document.getElementById("Gender").value,
        localChurch: document.getElementById("localChurch").value,
        role: roleSelect.value,
        level: levelSelect.value || "",
        position: positionSelect.value || "",
        createdAt: serverTimestamp()
      };

      // Save to Firestore using addDoc (auto-generated ID)
      await addDoc(collection(db, "registrations"), formData);

      alert("✅ Registration successful!");
      form.reset();
      leadershipSection.style.display = 'none';
      positionSection.style.display = 'none';

    } catch (err) {
      console.error("Firestore error:", err);
      alert("❌ Error: " + err.message);
    } finally {
      isSubmitting = false;
    }
  });

});

