# 🚀 Déploiement Automatique via GitHub

## 🎯 Pourquoi Via GitHub ?

**Beaucoup plus simple !** Au lieu d'uploader manuellement les fichiers :

✅ **Un seul `git pull`** met à jour tout
✅ **Historique des versions** conservé
✅ **Automatisable** avec des webhooks
✅ **Pas de risque d'oublier un fichier**

---

## 🔍 Deux Scénarios Possibles

### Scénario A : Vous Êtes DÉJÀ sur le Serveur Web

Si `/home/user/dznet1/` **EST** votre serveur web dznet1.com :

```bash
cd /home/user/dznet1/intranet/ramadans2026/chat-ramadan/
./deploy.sh
```

✅ **C'est tout !** Les fichiers sont mis à jour automatiquement.

---

### Scénario B : Le Serveur Web est Distant

Si dznet1.com est un **serveur distant séparé** :

#### Option 1 : Script de Déploiement Manuel

```bash
# Sur votre machine locale
cd /home/user/dznet1/intranet/ramadans2026/chat-ramadan/

# Copier le script sur le serveur
scp deploy.sh user@dznet1.com:/chemin/vers/chat-ramadan/

# Se connecter au serveur
ssh user@dznet1.com

# Sur le serveur distant
cd /chemin/vers/chat-ramadan/
./deploy.sh
```

#### Option 2 : Commande SSH Unique

```bash
# Depuis votre machine locale, exécuter le déploiement sur le serveur
ssh user@dznet1.com "cd /chemin/vers/chat-ramadan && git pull origin claude/fix-ramadan-chat-errors-019PCHCTZXHt2hAt5ymAYUnL"
```

---

## 📋 Script deploy.sh Créé

J'ai créé un script qui fait automatiquement :

1. ✅ Vérification du dépôt Git
2. ✅ Sauvegarde des modifications locales (si besoin)
3. ✅ Passage à la bonne branche
4. ✅ Pull des dernières modifications
5. ✅ Affichage des fichiers mis à jour

**Usage simple :**
```bash
./deploy.sh
```

---

## 🤖 Automatisation Complète (Optionnel)

### Option A : GitHub Webhook

Déploiement **automatique** à chaque commit :

1. **Sur le serveur dznet1.com**, créez un script webhook :

```bash
# /var/www/webhook.php
<?php
$secret = 'VOTRE_SECRET_ICI';
$payload = file_get_contents('php://input');
$signature = hash_hmac('sha256', $payload, $secret);

if (hash_equals('sha256=' . $signature, $_SERVER['HTTP_X_HUB_SIGNATURE_256'])) {
    shell_exec('cd /chemin/vers/chat-ramadan && git pull origin claude/fix-ramadan-chat-errors-019PCHCTZXHt2hAt5ymAYUnL 2>&1');
    echo "Déploiement réussi";
} else {
    echo "Signature invalide";
}
?>
```

2. **Sur GitHub** :
   - Settings → Webhooks → Add webhook
   - URL : `https://dznet1.com/webhook.php`
   - Secret : Votre secret
   - Events : Just the push event

3. **Chaque commit** déclenche automatiquement le déploiement !

---

### Option B : Cron Job

Déploiement **automatique toutes les X minutes** :

```bash
# Éditer le crontab sur le serveur
crontab -e

# Ajouter cette ligne (déploie toutes les 5 minutes)
*/5 * * * * cd /chemin/vers/chat-ramadan && git pull origin claude/fix-ramadan-chat-errors-019PCHCTZXHt2hAt5ymAYUnL >> /tmp/deploy.log 2>&1
```

---

### Option C : GitHub Actions + SSH

Déploiement via GitHub Actions :

```yaml
# .github/workflows/deploy.yml
name: Deploy to dznet1.com

on:
  push:
    branches:
      - claude/fix-ramadan-chat-errors-019PCHCTZXHt2hAt5ymAYUnL

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: dznet1.com
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /chemin/vers/chat-ramadan
            git pull origin claude/fix-ramadan-chat-errors-019PCHCTZXHt2hAt5ymAYUnL
```

---

## 🧪 Test Rapide : Êtes-Vous sur le Serveur Web ?

**Pour savoir si `/home/user/dznet1/` est déjà le serveur web :**

```bash
# Test 1 : Vérifier si le serveur web existe
which nginx || which apache2 || which httpd

# Test 2 : Vérifier les processus web
ps aux | grep -E 'nginx|apache|httpd' | grep -v grep

# Test 3 : Vérifier la configuration web
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || ls -la /etc/apache2/sites-enabled/ 2>/dev/null
```

Si ces commandes retournent des résultats, **vous êtes sur le serveur web** !

---

## 🎯 Solution Immédiate (Selon Votre Cas)

### Cas 1 : Vous êtes SUR le serveur dznet1.com

```bash
cd /home/user/dznet1/intranet/ramadans2026/chat-ramadan/
./deploy.sh
```

**Puis purgez Cloudflare**

---

### Cas 2 : Le serveur est DISTANT

**Connectez-vous au serveur :**
```bash
ssh user@dznet1.com
```

**Puis sur le serveur :**
```bash
cd /chemin/vers/chat-ramadan/
git status  # Vérifier que c'est un dépôt Git
git pull origin claude/fix-ramadan-chat-errors-019PCHCTZXHt2hAt5ymAYUnL
```

**Puis purgez Cloudflare**

---

## ❓ Questions pour Vous

Pour vous aider précisément :

1. **Où travaillez-vous actuellement ?**
   - [ ] Sur le serveur dznet1.com directement
   - [ ] Sur une machine locale qui doit ensuite uploader

2. **Le dossier sur dznet1.com est-il un dépôt Git ?**
   - [ ] Oui, je peux faire `git pull`
   - [ ] Non, je dois uploader les fichiers

3. **Avez-vous un accès SSH à dznet1.com ?**
   - [ ] Oui
   - [ ] Non

---

## 📊 Comparaison des Méthodes

| Méthode | Difficulté | Rapidité | Automation |
|---------|-----------|----------|------------|
| **Git Pull Manuel** | ⭐ Facile | ⚡⚡⚡ | ❌ |
| **FTP Manual** | ⭐⭐ Moyen | ⚡ | ❌ |
| **Script deploy.sh** | ⭐ Facile | ⚡⚡⚡ | ✅ |
| **GitHub Webhook** | ⭐⭐⭐ Avancé | ⚡⚡⚡ | ✅✅✅ |
| **GitHub Actions** | ⭐⭐⭐ Avancé | ⚡⚡⚡ | ✅✅✅ |

---

## 🎯 Ma Recommandation

**Si le serveur a accès Git :**
1. Utilisez `./deploy.sh` (manuel simple)
2. Ensuite configurez un webhook (automatique)

**Sinon :**
- Utilisez GitHub Actions pour déployer via SSH

---

## 🆘 Besoin d'Aide

Dites-moi :
- Avez-vous accès SSH au serveur ?
- Le dossier sur dznet1.com est-il déjà un dépôt Git ?

Et je vous donnerai la **commande exacte** à exécuter ! 🚀
