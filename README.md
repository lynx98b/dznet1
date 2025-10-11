# dznet1
internet pour la famille algerie filtrage et protéctions
# DzNet1 - Structure du Projet

## 📁 Structure des fichiers

```
dznet1/
│
├── index.html              # Page d'accueil
├── contact.html            # Page de contact
├── filtres.html            # Page des filtres communautaires
├── enfants.html            # Page portail enfants
├── faq.html                # Page FAQ
├── categorisation.html     # Page de catégorisation
│
├── styles.css              # Feuille de styles commune à toutes les pages
├── script.js               # Script JavaScript pour changement de langue
│
└── images/                 # Dossier pour les images (à créer)
    └── router.png          # Image du routeur TP-Link
```

## 🎨 Composants communs à toutes les pages

### 1. En-tête (Navigation)
Tous les fichiers HTML partagent le même en-tête avec :
- Logo DzNet1
- Menu de navigation avec liens vers toutes les pages
- Bouton de changement de langue (AR/FR)

### 2. Section Hero
Chaque page a une section hero avec :
- Un titre principal
- Une icône représentative
- Une description courte

### 3. Fichiers communs
- **styles.css** : Tous les styles CSS sont centralisés
- **script.js** : Gère le changement de langue et la navigation active

## 🌐 Fonctionnalités

### Changement de langue
- Bouton fixe en haut à gauche
- Bascule entre Arabe (RTL) et Français (LTR)
- Sauvegarde de la préférence dans le localStorage
- Attributs `data-ar` et `data-fr` sur tous les éléments traduisibles

### Navigation
- Menu sticky qui reste en haut lors du défilement
- Mise en surbrillance automatique de la page active
- Responsive sur mobile

## 📄 Pages à créer

### Pages restantes à créer :

1. **filtres.html** - Filtres Communautaires
   - Explication du système de filtrage
   - Liste des 20+ catégories bloquées
   - Exemples de sites bloqués/autorisés

2. **enfants.html** - Portail Enfants
   - Groupes d'âge (3-6, 7-11, 12-15, 16+)
   - Sites recommandés par âge
   - Exemples de portails éducatifs

3. **faq.html** - Questions Fréquentes
   - Questions courantes sur le service
   - Installation et configuration
   - Dépannage

4. **categorisation.html** - Outil de Catégorisation
   - Formulaire pour suggérer des sites à bloquer/débloquer
   - Recherche de catégorisation de sites

## 🎯 Utilisation

### Pour ajouter une nouvelle page :

1. Copier le template de base (index.html ou contact.html)
2. Modifier la classe `active` dans le menu de navigation
3. Remplacer le contenu de la section hero
4. Ajouter le contenu spécifique de la page
5. S'assurer que tous les textes ont des attributs `data-ar` et `data-fr`

### Pour modifier les styles :

1. Éditer **styles.css** uniquement
2. Les modifications s'appliqueront automatiquement à toutes les pages

### Pour ajouter une traduction :

1. Ajouter les attributs `data-ar="texte arabe"` et `data-fr="texte français"` à l'élément
2. Le script JavaScript gérera automatiquement le changement de langue

## 📱 Responsive Design

Le site est entièrement responsive avec des breakpoints :
- Mobile : < 768px
- Tablette : 769px - 1024px
- Desktop : > 1024px

## 🔧 Technologies utilisées

- HTML5
- CSS3 (avec Flexbox et Grid)
- JavaScript vanilla (pas de framework)
- LocalStorage pour la sauvegarde des préférences

## 🎨 Palette de couleurs

- Primaire : #667eea (Violet)
- Secondaire : #764ba2 (Violet foncé)
- Succès : #28a745 (Vert)
- Danger : #dc3545 (Rouge)
- Attention : #ffc107 (Jaune)
- Accent : #00D563 (Vert DZ)

## 📞 Informations de contact

- Téléphone : 070 400 369
- Support : 070 708 060
- Email : contact@dznet1.com

## ✅ Checklist de déploiement

- [ ] Créer toutes les pages HTML
- [ ] Ajouter les images du routeur dans le dossier images/
- [ ] Tester le changement de langue sur toutes les pages
- [ ] Vérifier la navigation entre les pages
- [ ] Tester le responsive sur mobile/tablette
- [ ] Vérifier les liens de contact (tel: et mailto:)
- [ ] Optimiser les images
- [ ] Tester sur différents navigateurs
