/**
 * auth.js
 * Version: v3.002 - Fix complet Firestore + pseudo obligatoire
 */

console.log("🔐 Auth v3.002 - Chargement...");

const loginScreen    = document.getElementById("loginScreen");
const chatActive     = document.getElementById("chatActive");
const googleBtn      = document.getElementById("googleSignInBtn");
const logoutBtn      = document.getElementById("logoutBtn");
const profileModal   = document.getElementById("profileModal");
const saveProfileBtn = document.getElementById("saveProfileBtn");

const headerAvatar = document.getElementById("headerAvatar");
const headerName   = document.getElementById("headerName");

const pseudoInput  = document.getElementById("pseudoInput");
const ageInput     = document.getElementById("ageInput");

// ==============================
// 🔑 CONNEXION GOOGLE
// ==============================

if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    console.log("🔑 Tentative de connexion Google...");
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await window.auth.signInWithPopup(provider);
    } catch (err) {
      console.error("❌ Erreur connexion Google:", err);
      alert("Erreur de connexion: " + err.message);
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await window.auth.signOut();
      console.log("🚪 Déconnexion");
    } catch (err) {
      console.error("❌ Erreur déconnexion:", err);
    }
  });
}

// ==============================
// 📥 RECUP PROFIL
// ==============================

async function fetchUserProfile(user) {
  const doc = await window.usersRef.doc(user.uid).get();
  if (!doc.exists) return null;
  return doc.data();
}

// ==============================
// 💾 CREATION PROFIL (CORRIGÉE)
// ==============================

async function createUserProfile(user, pseudo, gender, age) {

  const profileData = {
    pseudo: pseudo,                      // 🔥 obligatoire selon Firestore Rules
    displayName: pseudo,                 // ok
    gender: gender,
    age: age,
    photoURL: user.photoURL || "",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  await window.usersRef.doc(user.uid).set(profileData);
  console.log("✅ Profil sauvegardé dans Firestore");
  return profileData;
}

// ==============================
// UI
// ==============================

function showLoginUI() {
  loginScreen && (loginScreen.style.display = "flex");
  chatActive && (chatActive.style.display = "none");
}

function showChatUI() {
  loginScreen && (loginScreen.style.display = "none");
  chatActive && (chatActive.style.display = "flex");
}

function showProfileModal() {
  profileModal && profileModal.classList.remove("hidden");
}

function hideProfileModal() {
  profileModal && profileModal.classList.add("hidden");
}

// ==============================
// 🔄 FLUX COMPLET AUTH
// ==============================

window.auth.onAuthStateChanged(async (user) => {
  if (!user) {
    console.log("ℹ️ Aucun utilisateur connecté");
    window.currentUser = null;
    window.currentProfile = null;
    showLoginUI();
    return;
  }

  console.log("👤 Utilisateur connecté:", user.displayName);
  window.currentUser = user;

  try {
    let profile = await fetchUserProfile(user);

    if (!profile) {
      console.log("📝 Nouveau profil requis");
      showProfileModal();
      showLoginUI();
      return;
    }

    // Profil OK
    console.log("✅ Profil existant trouvé:", profile.pseudo);
    window.currentProfile = profile;

    applyProfileToHeader(profile);
    hideProfileModal();
    showChatUI();

    if (window.initializeChat) {
      window.initializeChat();
    }

  } catch (err) {
    console.error("❌ Erreur chargement profil:", err);
  }
});

// ==============================
// 💾 SAUVEGARDE DU PROFIL
// ==============================

if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", async () => {
    const user = window.getCurrentUser();
    if (!user) return;

    const pseudo = pseudoInput.value.trim();
    const age = parseInt(ageInput.value.trim(), 10);
    const genderInput = document.querySelector('input[name="gender"]:checked');

    let valid = true;

    if (!pseudo || pseudo.length < 3 || pseudo.length > 20) {
      document.getElementById("pseudoError").classList.add("show");
      valid = false;
    } else {
      document.getElementById("pseudoError").classList.remove("show");
    }

    if (!genderInput) {
      document.getElementById("genderError").classList.add("show");
      valid = false;
    } else {
      document.getElementById("genderError").classList.remove("show");
    }

    if (isNaN(age) || age < 13 || age > 99) {
      document.getElementById("ageError").classList.add("show");
      valid = false;
    } else {
      document.getElementById("ageError").classList.remove("show");
    }

    if (!valid) return;

    try {
      console.log("💾 Création profil:", pseudo, genderInput.value, age);

      const profile = await createUserProfile(
        user,
        pseudo,
        genderInput.value,
        age
      );

      window.currentProfile = profile;

      applyProfileToHeader(profile);
      hideProfileModal();
      showChatUI();

      if (window.initializeChat) {
        window.initializeChat();
      }

      console.log("🎉 Interface chat activée");

    } catch (err) {
      console.error("❌ Erreur création profil:", err);
      alert("Erreur enregistrement profil: " + err.message);
    }
  });
}

// ==============================
// AVATAR + HEADER
// ==============================

function applyProfileToHeader(profile) {
  if (headerName) headerName.textContent = profile.pseudo || "Utilisateur";
  if (headerAvatar && profile.photoURL) {
    headerAvatar.src = profile.photoURL;
  }
}

console.log("✅ Auth v3.002 - Chargée avec correctifs Firestore");
