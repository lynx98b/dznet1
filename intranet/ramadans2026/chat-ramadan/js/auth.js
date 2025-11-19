/**
 * Chat Ramadan - Authentification & Profil
 * Version: v2.004 - Google Auth + Profil utilisateur
 */

console.log('🔐 Auth v2.004 - Chargement...');

// ===== VARIABLES GLOBALES AUTH =====
let currentUser = null;
let userProfile = null;

// ===== ÉLÉMENTS DOM =====
const loginScreen = document.getElementById('loginScreen');
const chatActive = document.getElementById('chatActive');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const logoutBtn = document.getElementById('logoutBtn');
const headerName = document.getElementById('headerName');
const headerAvatar = document.getElementById('headerAvatar');

// ===== CONNEXION GOOGLE =====
googleSignInBtn.addEventListener('click', async () => {
    if (!termsAccepted) {
        disclaimerModal.classList.remove('hidden');
        return;
    }
    
    try {
        console.log('🔑 Tentative de connexion Google...');
        await auth.signInWithPopup(googleProvider);
        console.log('✅ Connexion Google réussie');
    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        alert('Erreur de connexion: ' + error.message);
    }
});

// ===== DÉCONNEXION =====
logoutBtn.addEventListener('click', async () => {
    if (!confirm('Déconnexion ?')) return;
    
    if (currentUser) {
        try {
            console.log('🚪 Déconnexion en cours...');
            await Promise.all([
                usersRef.doc(currentUser.uid).delete().catch(e => console.warn('User delete:', e)),
                typingRef.doc(currentUser.uid).delete().catch(e => console.warn('Typing delete:', e))
            ]);
            console.log('✅ Nettoyage Firestore réussi');
        } catch (error) {
            console.warn('⚠️ Erreur nettoyage:', error.code);
        }
    }
    
    await auth.signOut();
});

// ===== NETTOYAGE AVANT FERMETURE =====
window.addEventListener('beforeunload', async () => {
    if (currentUser) {
        try {
            const batch = db.batch();
            batch.delete(usersRef.doc(currentUser.uid));
            batch.delete(typingRef.doc(currentUser.uid));
            await batch.commit();
        } catch (error) {
            usersRef.doc(currentUser.uid).update({
                online: false,
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(() => {});
        }
    }
});

// ===== VALIDATION PROFIL =====
saveProfileBtn.addEventListener('click', async () => {
    const pseudo = pseudoInput.value.trim();
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const age = parseInt(ageInput.value);
    
    // Réinitialiser les erreurs
    document.querySelectorAll('.form-error').forEach(err => err.classList.remove('show'));
    document.querySelectorAll('.form-input').forEach(input => input.classList.remove('error'));
    
    let hasError = false;
    
    // Validation pseudo
    if (!pseudo || pseudo.length < 3 || pseudo.length > 20) {
        document.getElementById('pseudoError').classList.add('show');
        pseudoInput.classList.add('error');
        hasError = true;
    }
    
    // Validation sexe
    if (!gender) {
        document.getElementById('genderError').classList.add('show');
        hasError = true;
    }
    
    // Validation âge
    if (!age || age < 13 || age > 99) {
        document.getElementById('ageError').classList.add('show');
        ageInput.classList.add('error');
        hasError = true;
    }
    
    if (hasError) return;
    
    // Filtrer le pseudo
    const filteredPseudo = filterBadWords(pseudo);
    
    try {
        saveProfileBtn.disabled = true;
        saveProfileBtn.textContent = 'Enregistrement...';
        
        console.log('💾 Création profil:', filteredPseudo, gender, age);
        
        // Créer le profil
        userProfile = {
            pseudo: filteredPseudo,
            gender: gender,
            age: age,
            displayName: `${filteredPseudo} / ${gender} / ${age} ans`
        };
        
        // Sauvegarder dans Firestore
        await usersRef.doc(currentUser.uid).set({
            uid: currentUser.uid,
            pseudo: filteredPseudo,
            gender: gender,
            age: age,
            displayName: userProfile.displayName,
            photoURL: currentUser.photoURL,
            online: true,
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Profil sauvegardé dans Firestore');
        
        // Message système
        await messagesRef.add({
            type: 'system',
            content: `${userProfile.displayName} a rejoint le chat 🌙`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userId: currentUser.uid
        });
        
        // Fermer le modal profil
        window.hideProfileModal();
        
        // Afficher le chat
        loginScreen.style.display = 'none';
        chatActive.classList.add('show');
        headerName.textContent = userProfile.displayName;
        
        console.log('🎉 Interface chat activée');
        
        // Initialiser le chat (sera géré par chat.js au Bloc #5)
        if (window.initializeChat) {
            window.initializeChat();
        }
        
    } catch (error) {
        console.error('❌ Erreur sauvegarde profil:', error);
        alert('Erreur lors de la sauvegarde du profil: ' + error.message);
        saveProfileBtn.disabled = false;
        saveProfileBtn.textContent = 'Enregistrer';
    }
});

// ===== GESTION ÉTAT AUTHENTIFICATION =====
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log('👤 Utilisateur connecté:', user.displayName);
        currentUser = user;
        headerAvatar.src = user.photoURL;
        
        // Vérifier si profil existe
        const userDoc = await usersRef.doc(user.uid).get();
        
        if (userDoc.exists) {
            // ✅ Profil existe déjà
            console.log('📋 Profil existant trouvé');
            const data = userDoc.data();
            userProfile = {
                pseudo: data.pseudo,
                gender: data.gender,
                age: data.age,
                displayName: data.displayName
            };
            
            // Réactiver le profil
            await usersRef.doc(user.uid).update({
                online: true,
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Message système
            await messagesRef.add({
                type: 'system',
                content: `${userProfile.displayName} a rejoint le chat 🌙`,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userId: user.uid
            });
            
            // Afficher le chat
            loginScreen.style.display = 'none';
            chatActive.classList.add('show');
            headerName.textContent = userProfile.displayName;
            
            console.log('🎉 Reconnexion réussie');
            
            // Initialiser le chat
            if (window.initializeChat) {
                window.initializeChat();
            }
            
        } else {
            // ❌ Profil n'existe pas → Afficher modal de création
            console.log('📝 Nouveau profil requis');
            loginScreen.style.display = 'none';
            window.showProfileModal();
        }
        
    } else {
        console.log('❌ Utilisateur déconnecté');
        currentUser = null;
        userProfile = null;
        
        loginScreen.style.display = 'flex';
        chatActive.classList.remove('show');
        window.hideProfileModal();
        
        // Nettoyage (sera géré par chat.js)
        if (window.cleanupChat) {
            window.cleanupChat();
        }
    }
});

// ===== EXPORTS =====
window.currentUser = null;
window.userProfile = null;
window.getCurrentUser = () => currentUser;
window.getUserProfile = () => userProfile;

console.log('✅ Auth chargée - Connexion Google + Profil OK');
