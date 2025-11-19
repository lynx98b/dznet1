#!/bin/bash

# Script de déploiement des règles Firestore pour le Chat Ramadan
# Usage: ./deploy-rules.sh

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║   🔥 Déploiement des Règles Firestore - Chat Ramadan            ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier si Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI n'est pas installé"
    echo ""
    echo "📋 Vous avez 2 options :"
    echo ""
    echo "OPTION 1 : Installer Firebase CLI (recommandé pour usage futur)"
    echo "   npm install -g firebase-tools"
    echo "   puis relancez ce script : ./deploy-rules.sh"
    echo ""
    echo "OPTION 2 : Déploiement manuel via la console Firebase"
    echo "   1. Ouvrez : https://console.firebase.google.com"
    echo "   2. Sélectionnez le projet : ramadan-chat-auth"
    echo "   3. Firestore Database → Règles"
    echo "   4. Copiez le contenu de firestore.rules"
    echo "   5. Collez dans l'éditeur"
    echo "   6. Cliquez sur Publier"
    echo ""
    echo "📖 Pour plus de détails, consultez :"
    echo "   → GUIDE_RAPIDE.txt"
    echo "   → DEPLOY_FIRESTORE_RULES.md"
    echo ""
    exit 1
fi

# Firebase CLI est installé, procéder au déploiement
echo "✅ Firebase CLI détecté"
echo ""

# Vérifier que le fichier firestore.rules existe
if [ ! -f "firestore.rules" ]; then
    echo "❌ Fichier firestore.rules introuvable"
    echo "   Assurez-vous d'être dans le bon dossier :"
    echo "   cd intranet/ramadans2026/chat-ramadan"
    exit 1
fi

echo "✅ Fichier firestore.rules trouvé"
echo ""

# Vérifier que firebase.json existe
if [ ! -f "firebase.json" ]; then
    echo "❌ Fichier firebase.json introuvable"
    echo "   Un fichier de configuration est nécessaire"
    exit 1
fi

echo "✅ Fichier firebase.json trouvé"
echo ""

# Demander confirmation
echo "🔄 Prêt à déployer les règles Firestore"
echo ""
read -p "Continuer ? (o/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo "❌ Déploiement annulé"
    exit 1
fi

echo ""
echo "🚀 Déploiement en cours..."
echo ""

# Se connecter à Firebase si nécessaire
firebase login

# Déployer uniquement les règles Firestore
firebase deploy --only firestore:rules --project ramadan-chat-auth

# Vérifier le résultat
if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║   ✅ DÉPLOIEMENT RÉUSSI                                          ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🎉 Les règles Firestore ont été déployées avec succès !"
    echo ""
    echo "🧪 Prochaines étapes :"
    echo "   1. Videz le cache de votre navigateur (Ctrl+Shift+Delete)"
    echo "   2. Rechargez votre page de chat (F5)"
    echo "   3. Connectez-vous avec Google"
    echo "   4. Vérifiez que l'erreur a disparu"
    echo ""
    echo "✅ Vous devriez maintenant pouvoir :"
    echo "   → Charger votre profil sans erreur"
    echo "   → Envoyer des messages"
    echo "   → Voir les utilisateurs en ligne"
    echo ""
else
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║   ❌ ERREUR LORS DU DÉPLOIEMENT                                  ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🔍 Vérifiez :"
    echo "   → Que vous êtes connecté au bon compte Google"
    echo "   → Que vous avez les permissions sur le projet ramadan-chat-auth"
    echo "   → Votre connexion Internet"
    echo ""
    echo "📖 Consultez DEPLOY_FIRESTORE_RULES.md pour un déploiement manuel"
    echo ""
    exit 1
fi
