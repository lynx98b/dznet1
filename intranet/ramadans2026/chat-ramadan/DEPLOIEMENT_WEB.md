# 🚀 Déploiement sur dznet1.com

## 📍 Situation Actuelle

Les fichiers ont été **modifiés localement** dans :
```
/home/user/dznet1/intranet/ramadans2026/chat-ramadan/
```

Mais votre site web **https://dznet1.com** affiche encore les **anciens fichiers**.

---

## 🔄 Vous Devez Synchroniser les Fichiers

Les modifications locales doivent être **copiées/uploadées** sur votre serveur web.

---

## 📋 Méthodes de Déploiement

### Méthode 1 : FTP/SFTP (Si vous utilisez FileZilla, WinSCP, etc.)

1. **Connectez-vous** à votre serveur dznet1.com
2. **Naviguez** vers : `/intranet/ramadans2026/chat-ramadan/`
3. **Uploadez ces fichiers** :
   - `index.html` (version modifiée avec bouton ✏️)
   - `js/auth.js` (version v3.003)
4. **Remplacez** les anciens fichiers
5. **Purger Cloudflare** (voir ci-dessous)

---

### Méthode 2 : SSH/SCP

Si vous avez accès SSH au serveur :

```bash
# Depuis votre machine locale
scp /home/user/dznet1/intranet/ramadans2026/chat-ramadan/index.html \
    user@dznet1.com:/chemin/vers/intranet/ramadans2026/chat-ramadan/

scp /home/user/dznet1/intranet/ramadans2026/chat-ramadan/js/auth.js \
    user@dznet1.com:/chemin/vers/intranet/ramadans2026/chat-ramadan/js/
```

---

### Méthode 3 : Git Pull (Si le serveur a accès au dépôt)

Si votre serveur web peut faire `git pull` :

```bash
# Sur le serveur dznet1.com
cd /chemin/vers/intranet/ramadans2026/chat-ramadan/
git pull origin claude/fix-ramadan-chat-errors-019PCHCTZXHt2hAt5ymAYUnL
```

---

### Méthode 4 : Panel d'Hébergement (cPanel, Plesk, etc.)

1. **Connectez-vous** à votre panel d'hébergement
2. **Gestionnaire de fichiers**
3. **Naviguez** vers `intranet/ramadans2026/chat-ramadan/`
4. **Uploadez** les fichiers modifiés
5. **Remplacez** les anciens

---

## 🧹 Purger le Cache Cloudflare (IMPORTANT)

Après avoir uploadé les fichiers :

1. Allez sur https://dash.cloudflare.com
2. Sélectionnez **dznet1.com**
3. Menu **"Mise en cache"** (Caching)
4. **"Purger tout"** (Purge Everything)
5. Attendez 30 secondes

---

## 📁 Fichiers à Déployer

### Fichiers Critiques (OBLIGATOIRES)

```
index.html          ← Contient le bouton ✏️
js/auth.js          ← Version v3.003 avec modification profil
```

### Fichiers Firestore (IMPORTANTS)

```
firestore.rules     ← Règles production (strict)
firestore.rules.dev ← Règles développement (souple)
```

⚠️ **Note :** Les règles Firestore ne se déploient **pas via FTP** !
Elles se déploient via la **Console Firebase** (voir guides précédents).

---

## 🧪 Vérifier le Déploiement

Après avoir uploadé et purgé Cloudflare :

1. **Allez sur** : https://dznet1.com/intranet/ramadans2026/chat-ramadan/?v=3
2. **Ouvrez F12** (console)
3. **Cherchez** : `✅ Auth v3.003`
4. **Vérifiez** : Le bouton ✏️ doit apparaître dans le header

---

## 🔍 Identifier Votre Méthode de Déploiement

**Comment déployez-vous habituellement vos fichiers sur dznet1.com ?**

- [ ] FTP (FileZilla, WinSCP)
- [ ] SSH/SCP
- [ ] Git (le serveur fait git pull)
- [ ] Panel hébergement (cPanel, Plesk)
- [ ] Autre : __________

---

## 🆘 Dépannage

### Le bouton n'apparaît toujours pas

✅ **Vérifiez que vous avez uploadé :**
- `index.html` (11,897 bytes)
- `js/auth.js` (contient "v3.003")

✅ **Vérifiez dans la console (F12) :**
```
✅ Auth v3.003 - Chargée (Firestore + Modification profil)
```

Si vous voyez `v3.002`, les fichiers ne sont pas à jour.

✅ **Purgez Cloudflare**

✅ **Videz le cache navigateur** : Ctrl+Shift+Delete

---

## 📊 Structure des Répertoires

**Local (où vous travaillez) :**
```
/home/user/dznet1/intranet/ramadans2026/chat-ramadan/
├── index.html          ← MODIFIÉ (bouton ✏️)
├── js/
│   ├── auth.js         ← MODIFIÉ (v3.003)
│   ├── chat.js
│   ├── config.js
│   └── ui.js
├── css/
│   └── styles.css
└── firestore.rules     ← À déployer via Firebase Console
```

**Distant (serveur dznet1.com) :**
```
https://dznet1.com/intranet/ramadans2026/chat-ramadan/
├── index.html          ← ANCIEN (pas de bouton ✏️)
├── js/
│   ├── auth.js         ← ANCIEN (v3.002)
│   └── ...
└── ...
```

**Vous devez synchroniser Local → Distant**

---

## 🎯 Action Immédiate

1. **Identifiez votre méthode de déploiement** (FTP, SSH, etc.)
2. **Uploadez `index.html` et `js/auth.js`**
3. **Purgez Cloudflare**
4. **Testez** : https://dznet1.com/intranet/ramadans2026/chat-ramadan/?v=3

Le bouton ✏️ devrait alors apparaître !

---

## 💡 Pour Éviter ce Problème à l'Avenir

**Configurez un déploiement automatique :**
- GitHub Actions
- GitLab CI/CD
- Script de déploiement automatique
- Webhook qui déclenche un `git pull` sur le serveur

Cela synchronisera automatiquement vos commits avec le serveur web.
