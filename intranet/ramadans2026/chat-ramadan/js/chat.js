/**
 * Chat Ramadan - Gestion Messages & Réactions
 * Version: v2.005 - Messages, Réactions, Typing, Users
 */

console.log('💬 Chat v2.005 - Chargement...');

// ===== VARIABLES GLOBALES CHAT =====
let messagesUnsubscribe = null;
let usersUnsubscribe = null;
let typingUnsubscribe = null;
let heartbeatInterval = null;
let typingTimeout = null;

// ===== ÉLÉMENTS DOM =====
const chatMessages = document.getElementById('chatMessages');
const typingIndicator = document.getElementById('typingIndicator');
const typingText = document.getElementById('typingText');
const onlineCount = document.getElementById('onlineCount');
const usersList = document.getElementById('usersList');
const messageForm = document.getElementById('messageForm');
const sendBtn = document.getElementById('sendBtn');

// ===== INITIALISATION CHAT =====
window.initializeChat = function() {
    console.log('🚀 Initialisation du chat...');
    
    listenToMessages();
    listenToUsers();
    listenToTyping();
    updateRateCounter(RATE_LIMIT.maxMessages);
    
    // Heartbeat toutes les 30s
    heartbeatInterval = setInterval(() => {
        const user = window.getCurrentUser();
        if (user) {
            usersRef.doc(user.uid).update({
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(() => {});
        }
    }, 30000);
    
    console.log('✅ Chat initialisé');
};

// ===== NETTOYAGE CHAT =====
window.cleanupChat = function() {
    console.log('🧹 Nettoyage du chat...');
    
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (typingTimeout) clearTimeout(typingTimeout);
    
    if (messagesUnsubscribe) messagesUnsubscribe();
    if (usersUnsubscribe) usersUnsubscribe();
    if (typingUnsubscribe) typingUnsubscribe();
    
    chatMessages.innerHTML = '';
    usersList.innerHTML = '';
    selectedUserBanner.classList.remove('show');
    typingIndicator.classList.remove('show');
    window.messageTimestamps = [];
};

// ===== ÉCOUTER MESSAGES =====
function listenToMessages() {
    if (messagesUnsubscribe) messagesUnsubscribe();
    
    const connectionTime = new Date();
    console.log('🕐 Écoute messages depuis:', connectionTime.toLocaleTimeString());
    
    messagesUnsubscribe = messagesRef
        .where('timestamp', '>', connectionTime)
        .orderBy('timestamp', 'asc')
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const msg = change.doc.data();
                    const user = window.getCurrentUser();
                    const isOwn = user && msg.userId === user.uid;
                    addMessage(msg, change.doc.id, isOwn);
                    
                    if (!isOwn) {
                        if (msg.type === 'gift') window.playGiftSound();
                        else if (msg.type !== 'system') window.playMessageSound();
                    }
                }
            });
        });
    
    addWelcomeMessage();
}

// ===== MESSAGE DE BIENVENUE =====
function addWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'message system';
    welcomeDiv.innerHTML = `
        <div class="message-content">
            🌙 Bienvenue dans le chat Ramadan !<br>
            <small>Vous voyez uniquement les messages à partir de maintenant.</small>
        </div>
    `;
    chatMessages.appendChild(welcomeDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===== AFFICHER MESSAGE =====
function addMessage(msg, msgId, isOwn = false) {
    if (document.querySelector(`[data-msg-id="${msgId}"]`)) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.type === 'system' ? 'system' : ''} ${msg.type === 'gift' ? 'gift' : ''} ${isOwn ? 'own' : ''}`;
    messageDiv.dataset.msgId = msgId;
    
    if (msg.type === 'system') {
        messageDiv.innerHTML = `<div class="message-content">${msg.content}</div>`;
    } else if (msg.type === 'gift') {
        const recipientText = msg.recipientName ? 
            `<div class="gift-recipient">Pour ${msg.recipientName}</div>` : '';
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <img src="${msg.photoURL}" class="message-avatar">
                <span class="message-username">${msg.username}</span>
                <span class="message-time">${formatTime(msg.timestamp)}</span>
            </div>
            <div class="message-body">
                <div class="message-content">
                    <div class="gift-icon">${msg.giftIcon}</div>
                    <div class="gift-text">${msg.username} offre ${msg.giftLabel}</div>
                    ${recipientText}
                </div>
                <div class="message-reactions" id="reactions-${msgId}"></div>
                <button class="add-reaction-btn" data-msg-id="${msgId}">+</button>
                <div class="reaction-picker" id="picker-${msgId}">
                    ${REACTION_EMOJIS.map(e => 
                        `<button class="reaction-picker-btn" data-msg-id="${msgId}" data-emoji="${e}">${e}</button>`
                    ).join('')}
                </div>
            </div>
        `;
        
        listenToReactions(msgId);
    } else {
        const readStatus = msg.readBy && Object.keys(msg.readBy).length > 1 ? 
            `<div class="read-status">✓✓ ${Object.keys(msg.readBy).length}</div>` : 
            (isOwn ? '<div class="read-status">✓</div>' : '');
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <img src="${msg.photoURL}" class="message-avatar">
                <span class="message-username">${msg.username}</span>
                <span class="message-time">${formatTime(msg.timestamp)}</span>
            </div>
            <div class="message-body">
                <div class="message-content">${msg.content}</div>
                <div class="message-reactions" id="reactions-${msgId}"></div>
                <button class="add-reaction-btn" data-msg-id="${msgId}">+</button>
                ${readStatus}
                <div class="reaction-picker" id="picker-${msgId}">
                    ${REACTION_EMOJIS.map(e => 
                        `<button class="reaction-picker-btn" data-msg-id="${msgId}" data-emoji="${e}">${e}</button>`
                    ).join('')}
                </div>
            </div>
        `;
        
        if (!isOwn) {
            markMessageAsRead(msgId);
        }
        
        listenToReactions(msgId);
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===== MARQUER MESSAGE COMME LU =====
function markMessageAsRead(messageId) {
    const user = window.getCurrentUser();
    if (!user) return;
    
    const messageRef = messagesRef.doc(messageId);
    messageRef.update({
        [`readBy.${user.uid}`]: true,
        readCount: firebase.firestore.FieldValue.increment(1)
    }).catch(() => {});
}

// ===== RÉACTIONS =====
document.addEventListener('click', (e) => {
    // Bouton ajouter réaction
    if (e.target.classList.contains('add-reaction-btn')) {
        const msgId = e.target.dataset.msgId;
        const picker = document.getElementById(`picker-${msgId}`);
        if (!picker) return;
        
        document.querySelectorAll('.reaction-picker').forEach(p => {
            if (p.id !== `picker-${msgId}`) p.classList.remove('show');
        });
        
        picker.classList.toggle('show');
    }
    
    // Bouton sélectionner emoji
    if (e.target.classList.contains('reaction-picker-btn')) {
        const msgId = e.target.dataset.msgId;
        const emoji = e.target.dataset.emoji;
        addReaction(msgId, emoji);
    }
});

function listenToReactions(msgId) {
    reactionsRef
        .where('messageId', '==', msgId)
        .onSnapshot((snapshot) => {
            const reactionsContainer = document.getElementById(`reactions-${msgId}`);
            if (!reactionsContainer) return;
            
            const reactions = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                if (!reactions[data.emoji]) {
                    reactions[data.emoji] = { count: 0, users: [] };
                }
                reactions[data.emoji].count++;
                reactions[data.emoji].users.push(data.userId);
            });
            
            reactionsContainer.innerHTML = '';
            Object.entries(reactions).forEach(([emoji, data]) => {
                const div = document.createElement('div');
                div.className = 'reaction-item';
                const user = window.getCurrentUser();
                if (user && data.users.includes(user.uid)) {
                    div.classList.add('user-reacted');
                }
                div.innerHTML = `
                    <span class="reaction-emoji">${emoji}</span>
                    <span class="reaction-count">${data.count}</span>
                `;
                div.onclick = () => addReaction(msgId, emoji);
                reactionsContainer.appendChild(div);
            });
        });
}

async function addReaction(msgId, emoji) {
    const user = window.getCurrentUser();
    if (!user) return;
    
    try {
        const existing = await reactionsRef
            .where('messageId', '==', msgId)
            .where('userId', '==', user.uid)
            .where('emoji', '==', emoji)
            .get();
        
        if (!existing.empty) {
            existing.docs[0].ref.delete();
        } else {
            await reactionsRef.add({
                messageId: msgId,
                userId: user.uid,
                emoji: emoji,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        const picker = document.getElementById(`picker-${msgId}`);
        if (picker) picker.classList.remove('show');
        
    } catch (error) {
        console.error('❌ Erreur réaction:', error);
    }
}

// ===== TYPING INDICATORS =====
messageInput.addEventListener('input', () => {
    const user = window.getCurrentUser();
    const profile = window.getUserProfile();
    if (!user || !profile) return;
    
    setUserTyping(true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        setUserTyping(false);
    }, 1000);
});

async function setUserTyping(isTyping) {
    const user = window.getCurrentUser();
    const profile = window.getUserProfile();
    if (!user || !profile) return;
    
    try {
        if (isTyping) {
            await typingRef.doc(user.uid).set({
                userId: user.uid,
                username: profile.displayName,
                isTyping: true,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                channel: 'ramadan'
            });
        } else {
            await typingRef.doc(user.uid).delete();
        }
    } catch (error) {
        console.error('Erreur typing indicator:', error);
    }
}

function listenToTyping() {
    if (typingUnsubscribe) typingUnsubscribe();
    
    typingUnsubscribe = typingRef
        .where('channel', '==', 'ramadan')
        .onSnapshot((snapshot) => {
            const typingUsers = [];
            const user = window.getCurrentUser();
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.userId !== user.uid && data.isTyping) {
                    typingUsers.push(data);
                }
            });
            
            updateTypingIndicator(typingUsers);
        });
}

function updateTypingIndicator(typingUsers) {
    if (typingUsers.length === 0) {
        typingIndicator.classList.remove('show');
    } else {
        if (typingUsers.length === 1) {
            typingText.textContent = `${typingUsers[0].username} est en train d'écrire...`;
        } else if (typingUsers.length === 2) {
            typingText.textContent = `${typingUsers[0].username} et ${typingUsers[1].username} écrivent...`;
        } else {
            typingText.textContent = `${typingUsers.length} personnes sont en train d'écrire...`;
        }
        typingIndicator.classList.add('show');
    }
}

// ===== ÉCOUTER USERS EN LIGNE =====
function listenToUsers() {
    usersUnsubscribe = usersRef
        .where('online', '==', true)
        .onSnapshot((snapshot) => {
            const users = [];
            const currentUser = window.getCurrentUser();
            
            snapshot.forEach((doc) => {
                const user = doc.data();
                if (user.uid !== currentUser.uid) {
                    users.push(user);
                }
            });
            
            onlineCount.textContent = `${users.length + 1} connectés`;
            usersList.innerHTML = '';
            
            users.forEach((user) => {
                const userDiv = document.createElement('div');
                userDiv.className = 'user-item';
                
                if (window.selectedUser && window.selectedUser.uid === user.uid) {
                    userDiv.classList.add('selected');
                }
                
                userDiv.innerHTML = `
                    <div style="position: relative;">
                        <img src="${user.photoURL}" class="user-avatar">
                        <div class="user-status"></div>
                    </div>
                    <div class="user-info">
                        <div class="user-name">${user.displayName}</div>
                        <div class="user-activity">● En ligne</div>
                    </div>
                `;
                
                userDiv.addEventListener('click', () => {
                    document.querySelectorAll('.user-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    
                    if (window.selectedUser && window.selectedUser.uid === user.uid) {
                        window.setSelectedUser(null);
                        selectedUserBanner.classList.remove('show');
                    } else {
                        window.setSelectedUser(user);
                        selectedUserName.textContent = user.displayName;
                        selectedUserBanner.classList.add('show');
                        userDiv.classList.add('selected');
                    }
                });
                
                usersList.appendChild(userDiv);
            });
        });
}

// ===== ENVOYER MESSAGE =====
messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = window.getCurrentUser();
    const profile = window.getUserProfile();
    
    if (!user || !profile || window.isRateLimited) return;
    if (!window.checkRateLimit()) return;
    
    let message = messageInput.value.trim();
    if (!message) return;
    
    message = window.filterBadWords(message);
    
    try {
        await messagesRef.add({
            userId: user.uid,
            username: profile.displayName,
            photoURL: user.photoURL,
            content: window.sanitizeHTML(message),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            readBy: { [user.uid]: true },
            readCount: 1
        });
        
        window.messageTimestamps.push(Date.now());
        messageInput.value = '';
        messageInput.focus();
        window.checkRateLimit();
        
    } catch (error) {
        console.error('❌ Erreur envoi message:', error);
        alert('Erreur envoi message');
    }
});

// ===== ENVOYER CADEAU =====
window.sendGift = async function(gift) {
    const user = window.getCurrentUser();
    const profile = window.getUserProfile();
    
    if (!user || !profile || window.isRateLimited) return;
    if (!window.checkRateLimit()) return;
    
    try {
        const giftData = {
            type: 'gift',
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
        
        await messagesRef.add(giftData);
        
        window.messageTimestamps.push(Date.now());
        document.getElementById('giftPicker').classList.remove('show');
        window.checkRateLimit();
        
        if (window.selectedUser) {
            window.setSelectedUser(null);
            selectedUserBanner.classList.remove('show');
            document.querySelectorAll('.user-item').forEach(item => {
                item.classList.remove('selected');
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur envoi cadeau:', error);
        alert('Erreur envoi cadeau');
    }
};

console.log('✅ Chat chargé - Messages, Réactions, Typing, Users OK');
