/**
 * auth.js
 * Version: v3.001 - Auth Google + profil persistant
 */

console.log("🔐 Auth v3.001 - Chargement...");

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
// 👤 GESTION PROFIL FIRESTORE
// ==============================

async function fetchUserProfile(user) {
  const doc = await window.usersRef.doc(user.uid).get();
  if (!doc.exists) return null;
  return doc.data();
}

async function createUserProfile(user, pseudo, gender, age) {
  const profileData = {
    uid: user.uid,
    displayName: pseudo,
    gender: gender,
    age: age,
    photoURL: user.photoURL || "",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  await window.usersRef.doc(user.uid).set(profileData, { merge: true });
  console.log("✅ Profil sauvegardé dans Firestore");
  return profileData;
}

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
// 🎯 FLUX COMPLET AUTH + PROFIL
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
      showLoginUI(); // on ne montre pas le chat tant que le profil n'est pas créé
    } else {
      console.log("✅ Profil existant trouvé:", profile.displayName);
      window.currentProfile = profile;
      applyProfileToHeader(profile);
      hideProfileModal();
      showChatUI();
      if (window.initializeChat) {
        window.initializeChat();
      }
    }
  } catch (err) {
    console.error("❌ Erreur chargement profil:", err);
  }
});

// ==============================
// 💾 ENREGISTREMENT PROFIL (MODAL)
// ==============================

if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", async () => {
    const user = window.getCurrentUser();
    if (!user) return;

    const pseudo = pseudoInput.value.trim();
    const age = parseInt(ageInput.value.trim(), 10);
    const genderInput = document.querySelector(
      'input[name="gender"]:checked'
    );

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
      console.log(
        "💾 Création profil:",
        pseudo,
        genderInput.value,
        age
      );
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

function applyProfileToHeader(profile) {
  if (headerName) headerName.textContent = profile.displayName || "Utilisateur";
  if (headerAvatar && profile.photoURL) {
    headerAvatar.src = profile.photoURL;
  }
}

console.log("✅ Auth chargée - Connexion Google + Profil OK");
