/**
 * Chat Ramadan - Interface Utilisateur
 * Version: v2.003 - Modals, Sons, Dark Mode, Emojis
 */

console.log('🎨 UI v2.003 - Chargement...');

// ===== VARIABLES GLOBALES UI =====
let termsAccepted = localStorage.getItem('ramadan-terms') === 'true';
let darkMode = localStorage.getItem('ramadan-dark') === 'true';
let soundEnabled = localStorage.getItem('ramadan-sound') !== 'false';
let messageTimestamps = [];
let isRateLimited = false;
let selectedUser = null;

// ===== ÉLÉMENTS DOM =====
const disclaimerModal = document.getElementById('disclaimerModal');
const acceptCheckbox = document.getElementById('acceptCheckbox');
const acceptBtn = document.getElementById('acceptBtn');
const profileModal = document.getElementById('profileModal');
const profileForm = document.getElementById('profileForm');
const pseudoInput = document.getElementById('pseudoInput');
const ageInput = document.getElementById('ageInput');
const profilePreview = document.getElementById('profilePreview');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const darkModeBtn = document.getElementById('darkModeBtn');
const soundBtn = document.getElementById('soundBtn');
const rateWarning = document.getElementById('rateWarning');
const rateCountdown = document.getElementById('rateCountdown');
const rateCounter = document.getElementById('rateCounter');
const emojiBtn = document.getElementById('emojiBtn');
const giftBtn = document.getElementById('giftBtn');
const emojiPicker = document.getElementById('emojiPicker');
const giftPicker = document.getElementById('giftPicker');
const emojiGrid = document.getElementById('emojiGrid');
const giftGrid = document.getElementById('giftGrid');
const selectedUserBanner = document.getElementById('selectedUserBanner');
const selectedUserName = document.getElementById('selectedUserName');
const clearSelection = document.getElementById('clearSelection');
const messageInput = document.getElementById('messageInput');

// ===== DISCLAIMER MODAL =====
if (!termsAccepted) {
    disclaimerModal.classList.remove('hidden');
} else {
    disclaimerModal.classList.add('hidden');
}

acceptCheckbox.addEventListener('change', () => {
    acceptBtn.disabled = !acceptCheckbox.checked;
});

acceptBtn.addEventListener('click', () => {
    localStorage.setItem('ramadan-terms', 'true');
    termsAccepted = true;
    disclaimerModal.classList.add('hidden');
});

// ===== PROFIL MODAL - APERÇU TEMPS RÉEL =====
function updateProfilePreview() {
    const pseudo = pseudoInput.value.trim() || '???';
    const gender = document.querySelector('input[name="gender"]:checked')?.value || '?';
    const age = ageInput.value || '??';
    
    profilePreview.textContent = `${pseudo} / ${gender} / ${age} ans`;
}

pseudoInput.addEventListener('input', updateProfilePreview);
ageInput.addEventListener('input', updateProfilePreview);

document.querySelectorAll('input[name="gender"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        document.querySelectorAll('.gender-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        e.target.closest('.gender-option').classList.add('selected');
        updateProfilePreview();
    });
});

// Export pour auth.js
window.showProfileModal = () => {
    profileModal.classList.remove('hidden');
};

window.hideProfileModal = () => {
    profileModal.classList.add('hidden');
};

// ===== MODE SOMBRE =====
if (darkMode) {
    document.body.classList.add('dark-mode');
    darkModeBtn.textContent = '☀️';
}

darkModeBtn.addEventListener('click', () => {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode');
    darkModeBtn.textContent = darkMode ? '☀️' : '🌙';
    localStorage.setItem('ramadan-dark', darkMode);
});

// ===== SONS =====
if (!soundEnabled) {
    soundBtn.classList.remove('active');
    soundBtn.textContent = '🔕';
} else {
    soundBtn.classList.add('active');
}

soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.classList.toggle('active');
    soundBtn.textContent = soundEnabled ? '🔔' : '🔕';
    localStorage.setItem('ramadan-sound', soundEnabled);
});

function playMessageSound() {
    if (!soundEnabled) return;
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
            audioContext.close();
        }, 100);
    } catch (error) {
        console.log('Audio non supporté');
    }
}

function playGiftSound() {
    if (!soundEnabled) return;
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const playBeep = (frequency, time) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.value = frequency;
                gainNode.gain.value = 0.1;
                oscillator.start();
                setTimeout(() => oscillator.stop(), 80);
            }, time);
        };
        playBeep(600, 0);
        playBeep(800, 100);
        playBeep(1000, 200);
        setTimeout(() => audioContext.close(), 500);
    } catch (error) {
        console.log('Audio non supporté');
    }
}

// Exports pour chat.js
window.playMessageSound = playMessageSound;
window.playGiftSound = playGiftSound;

// ===== RATE LIMITING UI =====
function updateRateCounter(remaining) {
    rateCounter.textContent = `${remaining}/${RATE_LIMIT.maxMessages} messages`;
    rateCounter.className = 'rate-counter';
    if (remaining <= 1) rateCounter.classList.add('danger');
    else if (remaining <= 2) rateCounter.classList.add('warning');
}

function activateRateLimit() {
    if (isRateLimited) return;
    isRateLimited = true;
    
    const sendBtn = document.getElementById('sendBtn');
    
    rateWarning.classList.add('show');
    sendBtn.disabled = true;
    messageInput.disabled = true;
    
    let seconds = RATE_LIMIT.cooldownTime / 1000;
    rateCountdown.textContent = `${seconds}s`;
    
    const interval = setInterval(() => {
        seconds--;
        rateCountdown.textContent = `${seconds}s`;
        if (seconds <= 0) clearInterval(interval);
    }, 1000);
    
    setTimeout(() => {
        isRateLimited = false;
        rateWarning.classList.remove('show');
        sendBtn.disabled = false;
        messageInput.disabled = false;
        messageTimestamps = [];
        updateRateCounter(RATE_LIMIT.maxMessages);
    }, RATE_LIMIT.cooldownTime);
}

function checkRateLimit() {
    const now = Date.now();
    messageTimestamps = messageTimestamps.filter(t => now - t < RATE_LIMIT.timeWindow);
    
    const remaining = RATE_LIMIT.maxMessages - messageTimestamps.length;
    updateRateCounter(remaining);
    
    if (messageTimestamps.length >= RATE_LIMIT.maxMessages) {
        activateRateLimit();
        return false;
    }
    return true;
}

// Exports
window.updateRateCounter = updateRateCounter;
window.checkRateLimit = checkRateLimit;
window.messageTimestamps = messageTimestamps;

// ===== EMOJIS =====
EMOJIS.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'emoji-btn';
    btn.textContent = emoji;
    btn.type = 'button';
    btn.onclick = () => {
        messageInput.value += emoji;
        messageInput.focus();
    };
    emojiGrid.appendChild(btn);
});

// ===== CADEAUX =====
GIFTS.forEach(gift => {
    const btn = document.createElement('button');
    btn.className = 'gift-btn';
    btn.type = 'button';
    btn.innerHTML = `
        <div class="gift-btn-icon">${gift.icon}</div>
        <div class="gift-btn-label">${gift.label}</div>
    `;
    btn.onclick = () => {
        // Sera géré par chat.js
        if (window.sendGift) {
            window.sendGift(gift);
        }
    };
    giftGrid.appendChild(btn);
});

// ===== TOGGLE PICKERS =====
emojiBtn.addEventListener('click', () => {
    emojiPicker.classList.toggle('show');
    giftPicker.classList.remove('show');
});

giftBtn.addEventListener('click', () => {
    giftPicker.classList.toggle('show');
    emojiPicker.classList.remove('show');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.action-btn') && !e.target.closest('.picker')) {
        emojiPicker.classList.remove('show');
        giftPicker.classList.remove('show');
    }
    if (!e.target.closest('.add-reaction-btn') && !e.target.closest('.reaction-picker')) {
        document.querySelectorAll('.reaction-picker').forEach(p => p.classList.remove('show'));
    }
});

// ===== SÉLECTION UTILISATEUR POUR CADEAU =====
clearSelection.addEventListener('click', () => {
    selectedUser = null;
    selectedUserBanner.classList.remove('show');
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('selected');
    });
});

// Export
window.selectedUser = null;
window.setSelectedUser = (user) => {
    selectedUser = user;
    window.selectedUser = user;
};

// ===== UTILITAIRES =====
function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function filterBadWords(text) {
    let filtered = text;
    FORBIDDEN_WORDS.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filtered = filtered.replace(regex, '***');
    });
    return filtered;
}

// Exports
window.sanitizeHTML = sanitizeHTML;
window.formatTime = formatTime;
window.filterBadWords = filterBadWords;

console.log('✅ UI chargée - Disclaimer, Profil, Dark Mode, Sons OK');
