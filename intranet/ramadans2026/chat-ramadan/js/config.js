/**
 * Chat Ramadan - Configuration Firebase
 * Version: v2.001 - Architecture modulaire
 */

console.log('🔧 Config v2.001 - Chargement...');

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBoF6xTWr4dzgbWFwXavVC2mMshHCTK6fM",
    authDomain: "ramadan-chat-auth.firebaseapp.com",
    projectId: "ramadan-chat-auth",
    storageBucket: "ramadan-chat-auth.firebasestorage.app",
    messagingSenderId: "785976346844",
    appId: "1:785976346844:web:62b890dbc32a32596f8c19"
};

// Initialisation Firebase
firebase.initializeApp(firebaseConfig);

// Exports globaux
const auth = firebase.auth();
const db = firebase.firestore();
const messagesRef = db.collection('messages');
const usersRef = db.collection('users');
const reactionsRef = db.collection('reactions');
const typingRef = db.collection('typingIndicators');
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Configuration rate limiting
const RATE_LIMIT = {
    maxMessages: 6,
    timeWindow: 60000,
    cooldownTime: 15000
};

// Mots interdits
const FORBIDDEN_WORDS = [
    'merde', 'putain', 'connard', 'salope', 'enculé', 'con', 'conne', 
    'pute', 'chier', 'bordel', 'foutre', 'bite', 'couille', 'pétasse',
    'enfoiré', 'débile', 'crétin', 'abruti', 'idiot', 'imbécile',
    'pd', 'tapette', 'tarlouze', 'pédé', 'sale', 'nègre', 'bamboula',
    'youpin', 'arabe', 'bougnoule', 'raton', 'chinetoque'
];

// Emojis et cadeaux
const EMOJIS = ['😊', '😂', '❤️', '🌙', '⭐', '🕌', '🤲', '📿', '🌟', '✨', 
               '🙏', '💚', '🌸', '🌺', '🎉', '🎊', '👏', '🤝', '💫', '☪️',
               '🕋', '📖', '🍽️', '🥘', '🍰', '☕', '🫖', '🌹', '💐', '🎁'];

const GIFTS = [
    { icon: '🎁', label: 'Cadeau' },
    { icon: '🌙', label: 'Lune' },
    { icon: '⭐', label: 'Étoile' },
    { icon: '🕌', label: 'Mosquée' },
    { icon: '💐', label: 'Fleurs' },
    { icon: '🍰', label: 'Gâteau' },
    { icon: '☕', label: 'Café' },
    { icon: '📿', label: 'Tasbih' },
    { icon: '💚', label: 'Cœur' }
];

const REACTION_EMOJIS = ['👍', '❤️', '😂', '🙏', '⭐'];

console.log('✅ Config chargée - Firebase initialisé');
```

---

## FICHIER 3 : Structure des dossiers

Crée cette structure :
```
ton-dossier/
├── index.html
├── css/
│   └── styles.css (vide pour l'instant)
├── js/
│   ├── config.js (fichier ci-dessus)
│   ├── ui.js (vide pour l'instant)
│   ├── auth.js (vide pour l'instant)
│   └── chat.js (vide pour l'instant)
