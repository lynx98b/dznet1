#!/bin/bash

# Script de déploiement automatique pour le Chat Ramadan
# Usage: ./deploy.sh

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║   🚀 Déploiement Chat Ramadan sur dznet1.com                    ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
BRANCH="claude/fix-ramadan-chat-errors-019PCHCTZXHt2hAt5ymAYUnL"
CHAT_DIR="/home/user/dznet1/intranet/ramadans2026/chat-ramadan"

echo "📍 Répertoire : $CHAT_DIR"
echo "🌿 Branche    : $BRANCH"
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "$CHAT_DIR/index.html" ]; then
    echo -e "${RED}❌ Erreur : Répertoire du chat introuvable${NC}"
    exit 1
fi

cd "$CHAT_DIR" || exit 1

# Vérifier que Git est disponible
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Git détecté${NC}"
echo ""

# Vérifier l'état Git
echo "🔍 Vérification de l'état Git..."
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Ce n'est pas un dépôt Git${NC}"
    exit 1
fi

# Sauvegarder les modifications locales si nécessaire
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  Modifications locales détectées${NC}"
    read -p "Voulez-vous les sauvegarder (stash) ? (o/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        git stash
        echo -e "${GREEN}✅ Modifications sauvegardées${NC}"
    fi
fi

# Récupérer les dernières modifications
echo ""
echo "📥 Récupération des dernières modifications..."
git fetch origin

# Basculer sur la bonne branche si nécessaire
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    echo "🔄 Passage à la branche $BRANCH..."
    git checkout "$BRANCH"
fi

# Tirer les dernières modifications
echo "⬇️  Mise à jour depuis GitHub..."
git pull origin "$BRANCH"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Déploiement réussi !${NC}"
    echo ""
    echo "📋 Prochaines étapes :"
    echo "  1. Purgez le cache Cloudflare"
    echo "  2. Testez : https://dznet1.com/intranet/ramadans2026/chat-ramadan/?v=$(date +%s)"
    echo ""
    echo "🔧 Pour purger Cloudflare :"
    echo "  → https://dash.cloudflare.com"
    echo "  → dznet1.com → Mise en cache → Purger tout"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Erreur lors du pull${NC}"
    echo ""
    echo "Solutions possibles :"
    echo "  1. Vérifiez votre connexion Internet"
    echo "  2. Vérifiez les permissions Git"
    echo "  3. Résolvez les conflits éventuels"
    exit 1
fi

# Afficher les fichiers modifiés
echo "📝 Fichiers mis à jour :"
git log --name-status HEAD@{1}..HEAD --oneline | head -20

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║   ✅ DÉPLOIEMENT TERMINÉ                                         ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
