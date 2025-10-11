// Variable globale pour la langue actuelle
let currentLang = 'ar';

// Fonction pour changer de langue
function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'fr' : 'ar';
    const html = document.documentElement;
    
    // Changer la langue et la direction du document
    html.setAttribute('lang', currentLang);
    html.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
    
    // Mettre à jour tous les éléments avec data-ar et data-fr
    document.querySelectorAll('[data-ar][data-fr]').forEach(el => {
        const text = el.getAttribute(`data-${currentLang}`);
        
        // Gérer les placeholders pour les inputs
        if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
            el.placeholder = el.getAttribute(`data-${currentLang}-placeholder`) || text;
        } 
        // Gérer les options de select
        else if (el.tagName === 'OPTION') {
            el.textContent = text;
        }
        // Gérer les autres éléments
        else {
            el.textContent = text;
        }
    });
    
    // Mettre à jour le bouton de langue
    document.getElementById('langText').textContent = currentLang === 'ar' ? '🇩🇿 Français' : '🇩🇿 العربية';
    
    // Sauvegarder la préférence de langue
    localStorage.setItem('preferredLanguage', currentLang);
}

// Charger la préférence de langue au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('preferredLanguage');
    
    // Si une langue est sauvegardée et différente de la langue actuelle
    if (savedLang && savedLang !== currentLang) {
        toggleLanguage();
    }
    
    // Mettre en surbrillance le lien actif dans la navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});
