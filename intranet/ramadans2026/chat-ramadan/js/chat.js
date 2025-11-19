/**
 * chat.js
 * Version: v3.001 - Chat + Réactions, sans doublons de refs
 */

if (window.chatLoaded) {
  console.warn("⚠️ chat.js déjà chargé → on ignore ce chargement.");
  throw new Error("chat.js double load");
}
window.chatLoaded = true;

console.log("💬 Chat v3.001 - Chargement...");

// ==============================
// VARS & DOM
// ==============================

let messagesUnsubscribe = null;
let usersUnsubscribe = null;
let typingUnsubscribe = null;
let heartbeatInterval = null;
let typingTimeout = null;

const chatMessages    = document.getElementById("chatMessages");
const typingIndicator = document.getElementById("typingIndicator");
const typingText      = document.getElementById("typingText");
const onlineCount     = document.getElementById("onlineCount");
const usersList       = document.getElementById("usersList");
const messageForm     = document.getElementById("messageForm");
const messageInput    = document.getElementById("messageInput");

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

// ==============================
// 🕒 FORMATAGE HEURE
// ==============================

function formatTime(timestamp) {
  if (!timestamp) return "";
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

// ==============================
// INIT & CLEANUP
// ==============================

window.initializeChat = function () {
  console.log("🚀 Initialisation du chat...");

  // Au cas où l'auth relance plusieurs fois initializeChat
  if (heartbeatInterval) clearInterval(heartbeatInterval);

  listenToMessages();
  listenToUsers();
  listenToTyping();

  if (window.updateRateCounter && window.RATE_LIMIT) {
    window.updateRateCounter(window.RATE_LIMIT.maxMessages);
  }

  heartbeatInterval = setInterval(() => {
    const user = window.getCurrentUser();
    if (user && window.usersRef) {
      window.usersRef
        .doc(user.uid)
        .update({
          lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
          online: true
        })
        .catch(() => {});
    }
  }, 30_000);

  console.log("✅ Chat initialisé");
};

window.cleanupChat = function () {
  console.log("🧹 Nettoyage du chat...");

  if (heartbeatInterval) clearInterval(heartbeatInterval);
  if (typingTimeout) clearTimeout(typingTimeout);

  if (messagesUnsubscribe) messagesUnsubscribe();
  if (usersUnsubscribe) usersUnsubscribe();
  if (typingUnsubscribe) typingUnsubscribe();

  if (chatMessages) chatMessages.innerHTML = "";
  if (usersList) usersList.innerHTML = "";
  const banner = document.getElementById("selectedUserBanner");
  if (banner) banner.classList.remove("show");
  if (typingIndicator) typingIndicator.classList.remove("show");

  window.messageTimestamps = [];
};

// ==============================
// ÉCOUTE MESSAGES
// ==============================

function listenToMessages() {
  if (!window.messagesRef) {
    console.error("messagesRef non défini");
    return;
  }
  if (messagesUnsubscribe) messagesUnsubscribe();

  const connectionTime = new Date();
  console.log("🕐 Écoute messages depuis:", connectionTime.toLocaleTimeString());

  messagesUnsubscribe = window.messagesRef
    .where("timestamp", ">", connectionTime)
    .orderBy("timestamp", "asc")
    .onSnapshot(
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const msg = change.doc.data();
            const user = window.getCurrentUser();
            const isOwn = user && msg.userId === user.uid;
            addMessage(msg, change.doc.id, isOwn);

            if (!isOwn) {
              if (msg.type === "gift") window.playGiftSound();
              else if (msg.type !== "system") window.playMessageSound();
            }
          }
        });
      },
      (err) => {
        console.error("❌ Erreur listenToMessages:", err);
      }
    );

  addWelcomeMessage();
}

function addWelcomeMessage() {
  if (!chatMessages) return;
  const welcomeDiv = document.createElement("div");
  welcomeDiv.className = "message system";
  welcomeDiv.innerHTML = `
    <div class="message-content">
      🌙 Bienvenue dans le chat Ramadan !<br>
      <small>Vous voyez uniquement les messages à partir de maintenant.</small>
    </div>
  `;
  chatMessages.appendChild(welcomeDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==============================
// AFFICHAGE MESSAGE
// ==============================

function addMessage(msg, msgId, isOwn = false) {
  if (!chatMessages) return;
  if (document.querySelector(`[data-msg-id="${msgId}"]`)) return;

  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${
    msg.type === "system" ? "system" : ""
  } ${msg.type === "gift" ? "gift" : ""} ${isOwn ? "own" : ""}`;
  messageDiv.dataset.msgId = msgId;

  if (msg.type === "system") {
    messageDiv.innerHTML = `<div class="message-content">${msg.content}</div>`;
  } else if (msg.type === "gift") {
    const recipientText = msg.recipientName
      ? `<div class="gift-recipient">Pour ${msg.recipientName}</div>`
      : "";

    messageDiv.innerHTML = `
      <div class="message-header">
        <img src="${msg.photoURL}" class="message-avatar" alt="">
        <span class="message-username">${msg.username}</span>
        <span class="message-time">${formatTime(msg.timestamp)}</span>
      </div>
      <div class="message-body">
        <div class="message-content">
          <div class="gift-icon">${msg.giftIcon}</div>
          <div class="gift-text">${msg.username} offre ${msg.giftLabel}</div>
          ${recipientText}
        </div>
        <div class="message-reactions" data-msg-id="${msgId}"></div>
        <button class="add-reaction-btn" type="button" data-msg-id="${msgId}">+</button>
      </div>
    `;
    createReactionPicker(messageDiv, msgId);
    listenToReactions(msgId);
  } else {
    const readStatus =
      msg.readBy && Object.keys(msg.readBy).length > 1
        ? `<div class="read-status">✓✓ ${Object.keys(msg.readBy).length}</div>`
        : isOwn
        ? '<div class="read-status">✓</div>'
        : "";

    messageDiv.innerHTML = `
      <div class="message-header">
        <img src="${msg.photoURL}" class="message-avatar" alt="">
        <span class="message-username">${msg.username}</span>
        <span class="message-time">${formatTime(msg.timestamp)}</span>
      </div>
      <div class="message-body">
        <div class="message-content">${msg.content}</div>
        <div class="message-reactions" data-msg-id="${msgId}"></div>
        <button class="add-reaction-btn" type="button" data-msg-id="${msgId}">+</button>
        ${readStatus}
      </div>
    `;
    createReactionPicker(messageDiv, msgId);
    if (!isOwn) markMessageAsRead(msgId);
    listenToReactions(msgId);
  }

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==============================
// RÉACTIONS
// ==============================

function createReactionPicker(messageDiv, msgId) {
  const messageBody = messageDiv.querySelector(".message-body");
  if (!messageBody) return;
  const addBtn = messageBody.querySelector(".add-reaction-btn");
  if (!addBtn) return;

  const pickerDiv = document.createElement("div");
  pickerDiv.className = "reaction-picker";
  pickerDiv.id = `picker-${msgId}`;

  REACTION_EMOJIS.forEach((emoji) => {
    const btn = document.createElement("button");
    btn.className = "reaction-picker-btn";
    btn.type = "button";
    btn.textContent = emoji;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      addReaction(msgId, emoji);
    });
    pickerDiv.appendChild(btn);
  });

  addBtn.insertAdjacentElement("afterend", pickerDiv);
}

function listenToReactions(msgId) {
  if (!window.reactionsRef) {
    console.error("reactionsRef non défini");
    return;
  }

  window.reactionsRef
    .where("messageId", "==", msgId)
    .onSnapshot(
      (snapshot) => {
        const reactionsContainer = document.querySelector(
          `.message-reactions[data-msg-id="${msgId}"]`
        );
        if (!reactionsContainer) return;

        const reactions = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (!reactions[data.emoji]) {
            reactions[data.emoji] = { count: 0, users: [] };
          }
          reactions[data.emoji].count++;
          reactions[data.emoji].users.push(data.userId);
        });

        reactionsContainer.innerHTML = "";
        Object.entries(reactions).forEach(([emoji, data]) => {
          const div = document.createElement("div");
          div.className = "reaction-item";
          const user = window.getCurrentUser();
          if (user && data.users.includes(user.uid)) {
            div.classList.add("user-reacted");
          }
          div.innerHTML = `
            <span class="reaction-emoji">${emoji}</span>
            <span class="reaction-count">${data.count}</span>
          `;
          div.addEventListener("click", () => addReaction(msgId, emoji));
          reactionsContainer.appendChild(div);
        });
      },
      (err) => {
        console.error("❌ Erreur listenToReactions:", err);
      }
    );
}

async function addReaction(msgId, emoji) {
  const user = window.getCurrentUser();
  if (!user || !window.reactionsRef) {
    console.warn("⚠️ Pas d'utilisateur connecté ou reactionsRef manquant");
    return;
  }

  console.log("👍 Ajout/retrait réaction:", emoji, "sur message:", msgId);

  try {
    const existing = await window.reactionsRef
      .where("messageId", "==", msgId)
      .where("userId", "==", user.uid)
      .where("emoji", "==", emoji)
      .get();

    if (!existing.empty) {
      console.log("❌ Retrait réaction existante");
      await existing.docs[0].ref.delete();
    } else {
      console.log("✅ Ajout nouvelle réaction");
      await window.reactionsRef.add({
        messageId: msgId,
        userId: user.uid,
        emoji: emoji,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

    const picker = document.getElementById(`picker-${msgId}`);
    if (picker) picker.classList.remove("show");
  } catch (err) {
    console.error("❌ Erreur réaction:", err);
    alert("Erreur lors de l'ajout de la réaction");
  }
}

// ==============================
// LECTURE
// ==============================

function markMessageAsRead(messageId) {
  const user = window.getCurrentUser();
  if (!user || !window.messagesRef) return;

  window.messagesRef
    .doc(messageId)
    .update({
      [`readBy.${user.uid}`]: true,
      readCount: firebase.firestore.FieldValue.increment(1)
    })
    .catch(() => {});
}

// ==============================
// DELEGATION POUR BOUTON "+"
// ==============================

if (chatMessages) {
  chatMessages.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-reaction-btn")) {
      e.stopPropagation();
      const msgId = e.target.dataset.msgId;
      const picker = document.getElementById(`picker-${msgId}`);
      if (!picker) return;

      document
        .querySelectorAll(".reaction-picker")
        .forEach((p) => p.id !== `picker-${msgId}` && p.classList.remove("show"));

      picker.classList.toggle("show");
      console.log("🎯 Picker toggled pour message:", msgId);
    }
  });
}

document.addEventListener("click", (e) => {
  if (
    !e.target.closest(".add-reaction-btn") &&
    !e.target.closest(".reaction-picker")
  ) {
    document
      .querySelectorAll(".reaction-picker")
      .forEach((p) => p.classList.remove("show"));
  }
});

// ==============================
// TYPING
// ==============================

if (messageInput) {
  messageInput.addEventListener("input", () => {
    const user = window.getCurrentUser();
    const profile = window.getUserProfile();
    if (!user || !profile || !window.typingRef) return;

    setUserTyping(true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => setUserTyping(false), 1000);
  });
}

async function setUserTyping(isTyping) {
  const user = window.getCurrentUser();
  const profile = window.getUserProfile();
  if (!user || !profile || !window.typingRef) return;

  try {
    if (isTyping) {
      await window.typingRef.doc(user.uid).set({
        userId: user.uid,
        username: profile.displayName,
        isTyping: true,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        channel: "ramadan"
      });
    } else {
      await window.typingRef.doc(user.uid).delete();
    }
  } catch (err) {
    console.error("Erreur typing indicator:", err);
  }
}

function listenToTyping() {
  if (!window.typingRef) {
    console.error("typingRef non défini");
    return;
  }
  if (typingUnsubscribe) typingUnsubscribe();

  typingUnsubscribe = window.typingRef
    .where("channel", "==", "ramadan")
    .onSnapshot(
      (snapshot) => {
        const typingUsers = [];
        const user = window.getCurrentUser();

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (user && data.userId !== user.uid && data.isTyping) {
            typingUsers.push(data);
          }
        });

        updateTypingIndicator(typingUsers);
      },
      (err) => {
        console.error("Erreur listenToTyping:", err);
      }
    );
}

function updateTypingIndicator(typingUsers) {
  if (!typingIndicator || !typingText) return;

  if (typingUsers.length === 0) {
    typingIndicator.classList.remove("show");
  } else {
    if (typingUsers.length === 1) {
      typingText.textContent = `${typingUsers[0].username} est en train d'écrire...`;
    } else if (typingUsers.length === 2) {
      typingText.textContent = `${typingUsers[0].username} et ${typingUsers[1].username} écrivent...`;
    } else {
      typingText.textContent = `${typingUsers.length} personnes sont en train d'écrire...`;
    }
    typingIndicator.classList.add("show");
  }
}

// ==============================
// USERS EN LIGNE
// ==============================

function listenToUsers() {
  if (!window.usersRef) {
    console.error("usersRef non défini");
    return;
  }
  if (usersUnsubscribe) usersUnsubscribe();

  usersUnsubscribe = window.usersRef
    .where("online", "==", true)
    .onSnapshot(
      (snapshot) => {
        const users = [];
        const currentUser = window.getCurrentUser();

        snapshot.forEach((doc) => {
          const user = doc.data();
          if (!currentUser || user.uid !== currentUser.uid) {
            users.push(user);
          }
        });

        if (onlineCount) {
          onlineCount.textContent = `${
            (currentUser ? 1 : 0) + users.length
          } connectés`;
        }

        if (!usersList) return;
        usersList.innerHTML = "";

        users.forEach((user) => {
          const userDiv = document.createElement("div");
          userDiv.className = "user-item";

          if (window.selectedUser && window.selectedUser.uid === user.uid) {
            userDiv.classList.add("selected");
          }

          userDiv.innerHTML = `
            <div style="position: relative;">
              <img src="${user.photoURL || ""}" class="user-avatar" alt="">
              <div class="user-status"></div>
            </div>
            <div class="user-info">
              <div class="user-name">${user.displayName || "?"}</div>
              <div class="user-activity">● En ligne</div>
            </div>
          `;

          userDiv.addEventListener("click", () => {
            const selectedUserBanner =
              document.getElementById("selectedUserBanner");
            const selectedUserName =
              document.getElementById("selectedUserName");

            document
              .querySelectorAll(".user-item")
              .forEach((item) => item.classList.remove("selected"));

            if (window.selectedUser && window.selectedUser.uid === user.uid) {
              window.setSelectedUser(null);
              selectedUserBanner && selectedUserBanner.classList.remove("show");
            } else {
              window.setSelectedUser(user);
              selectedUserName && (selectedUserName.textContent = user.displayName);
              selectedUserBanner && selectedUserBanner.classList.add("show");
              userDiv.classList.add("selected");
            }
          });

          usersList.appendChild(userDiv);
        });
      },
      (err) => {
        console.error("Erreur listenToUsers:", err);
      }
    );
}

// ==============================
// ENVOI MESSAGE
// ==============================

if (messageForm && messageInput) {
  messageForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = window.getCurrentUser();
    const profile = window.getUserProfile();

    if (!user || !profile || !window.messagesRef) return;
    if (!window.checkRateLimit()) return;

    let message = messageInput.value.trim();
    if (!message) return;

    message = window.filterBadWords(message);

    try {
      await window.messagesRef.add({
        userId: user.uid,
        username: profile.displayName,
        photoURL: user.photoURL,
        content: window.sanitizeHTML(message),
        type: "text",
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        readBy: { [user.uid]: true },
        readCount: 1
      });

      window.messageTimestamps.push(Date.now());
      messageInput.value = "";
      messageInput.focus();
      window.checkRateLimit();
      console.log("✅ Message envoyé");
    } catch (err) {
      console.error("❌ Erreur envoi message:", err);
      alert("Erreur envoi message: " + err.message);
    }
  });
}

// ==============================
// ENVOI CADEAU
// ==============================

window.sendGift = async function (gift) {
  const user = window.getCurrentUser();
  const profile = window.getUserProfile();

  if (!user || !profile || !window.messagesRef) return;
  if (!window.checkRateLimit()) return;

  try {
    const giftData = {
      type: "gift",
      userId: user.uid,
      username: profile.displayName,
      photoURL: user.photoURL,
      giftIcon: gift.icon,
      giftLabel: gift.label,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      readBy: { [user.uid]: true },
      readCount: 1
    };

    if (window.selectedUser) {
      giftData.recipientUid = window.selectedUser.uid;
      giftData.recipientName = window.selectedUser.displayName;
    }

    await window.messagesRef.add(giftData);

    window.messageTimestamps.push(Date.now());
    const giftPicker = document.getElementById("giftPicker");
    if (giftPicker) giftPicker.classList.remove("show");
    window.checkRateLimit();

    console.log("✅ Cadeau envoyé");

    if (window.selectedUser) {
      const selectedUserBanner = document.getElementById("selectedUserBanner");
      window.setSelectedUser(null);
      selectedUserBanner && selectedUserBanner.classList.remove("show");
      document
        .querySelectorAll(".user-item")
        .forEach((item) => item.classList.remove("selected"));
    }
  } catch (err) {
    console.error("❌ Erreur envoi cadeau:", err);
    alert("Erreur envoi cadeau: " + err.message);
  }
};

console.log("✅ Chat v3.001 chargé - Messages, Réactions, Typing, Users OK");
