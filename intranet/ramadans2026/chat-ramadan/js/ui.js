/**
 * ui.js
 * Version: v3.001 - UI, modals, dark mode, sons, pickers
 */

console.log("🎨 UI v3.001 - Chargement...");

document.addEventListener("DOMContentLoaded", () => {
  setupDisclaimer();
  setupDarkMode();
  setupSoundToggle();
  setupPickers();
  setupSelectedUserBanner();
  setupProfilePreview();
  console.log("✅ UI chargée - Disclaimer, Profil, Dark Mode, Sons OK");
});

// ==============================
// 📜 DISCLAIMER
// ==============================

function setupDisclaimer() {
  const modal = document.getElementById("disclaimerModal");
  const checkbox = document.getElementById("acceptCheckbox");
  const btn = document.getElementById("acceptBtn");

  if (!modal || !checkbox || !btn) return;

  checkbox.addEventListener("change", () => {
    btn.disabled = !checkbox.checked;
  });

  btn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
}

// ==============================
// 🌙 DARK MODE
// ==============================

function setupDarkMode() {
  const btn = document.getElementById("darkModeBtn");
  if (!btn) return;

  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
  };

  const stored = localStorage.getItem("theme") || "dark";
  applyTheme(stored);

  btn.addEventListener("click", () => {
    const current =
      document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
  });
}

// ==============================
// 🔊 SONS
// ==============================

function setupSoundToggle() {
  const btn = document.getElementById("soundBtn");
  if (!btn) return;

  const updateIcon = () => {
    btn.textContent = window.soundEnabled ? "🔔" : "🔕";
  };

  updateIcon();
  btn.addEventListener("click", () => {
    window.soundEnabled = !window.soundEnabled;
    updateIcon();
  });
}

// ==============================
// 😊 EMOJIS / 🎁 CADEAUX
// ==============================

const EMOJI_LIST = ["😊", "😂", "🥰", "👍", "🙏", "😢", "🔥", "🎉"];
const GIFT_LIST = [
  { icon: "🥐", label: "Chbakia" },
  { icon: "☕", label: "Thé" },
  { icon: "🍲", label: "Soupe" },
  { icon: "🍩", label: "Douceur" }
];

function setupPickers() {
  const emojiBtn = document.getElementById("emojiBtn");
  const emojiPicker = document.getElementById("emojiPicker");
  const emojiGrid = document.getElementById("emojiGrid");
  const giftBtn = document.getElementById("giftBtn");
  const giftPicker = document.getElementById("giftPicker");
  const giftGrid = document.getElementById("giftGrid");
  const messageInput = document.getElementById("messageInput");

  if (emojiBtn && emojiPicker && emojiGrid && messageInput) {
    EMOJI_LIST.forEach((e) => {
      const span = document.createElement("button");
      span.type = "button";
      span.className = "emoji-item";
      span.textContent = e;
      span.addEventListener("click", () => {
        messageInput.value += e;
        emojiPicker.classList.remove("show");
        messageInput.focus();
      });
      emojiGrid.appendChild(span);
    });

    emojiBtn.addEventListener("click", () => {
      emojiPicker.classList.toggle("show");
      giftPicker && giftPicker.classList.remove("show");
    });
  }

  if (giftBtn && giftPicker && giftGrid) {
    GIFT_LIST.forEach((g) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gift-item";
      btn.innerHTML = `<span class="gift-icon">${g.icon}</span><span>${g.label}</span>`;
      btn.addEventListener("click", () => {
        if (window.sendGift) {
          window.sendGift(g);
        }
        giftPicker.classList.remove("show");
      });
      giftGrid.appendChild(btn);
    });

    giftBtn.addEventListener("click", () => {
      giftPicker.classList.toggle("show");
      emojiPicker && emojiPicker.classList.remove("show");
    });
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".picker") && !e.target.closest(".action-btn")) {
      emojiPicker && emojiPicker.classList.remove("show");
      giftPicker && giftPicker.classList.remove("show");
    }
  });
}

// ==============================
// 🎁 BANNIÈRE UTILISATEUR CIBLE
// ==============================

function setupSelectedUserBanner() {
  const banner = document.getElementById("selectedUserBanner");
  const clearBtn = document.getElementById("clearSelection");

  if (!banner || !clearBtn) return;

  clearBtn.addEventListener("click", () => {
    window.setSelectedUser && window.setSelectedUser(null);
    banner.classList.remove("show");
    document
      .querySelectorAll(".user-item.selected")
      .forEach((el) => el.classList.remove("selected"));
  });
}

// ==============================
// 👤 PRÉVISUALISATION PROFIL
// ==============================

function setupProfilePreview() {
  const pseudoInput = document.getElementById("pseudoInput");
  const ageInput = document.getElementById("ageInput");
  const profilePreview = document.getElementById("profilePreview");

  if (!pseudoInput || !ageInput || !profilePreview) return;

  const updatePreview = () => {
    const pseudo = pseudoInput.value.trim() || "pseudo…";
    const age = ageInput.value.trim() || "âge ?";
    profilePreview.textContent = `${pseudo}, ${age} ans`;
  };

  pseudoInput.addEventListener("input", updatePreview);
  ageInput.addEventListener("input", updatePreview);
}
