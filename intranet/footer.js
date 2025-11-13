(function() {
  function injectFooter(html) {
    var placeholders = document.querySelectorAll('[data-include="footer"]');
    placeholders.forEach(function(placeholder) {
      placeholder.innerHTML = html;
      var yearElement = placeholder.querySelector('#footer-year');
      if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
      }
    });
  }

  function loadFooter() {
    var placeholders = document.querySelectorAll('[data-include="footer"]');
    if (!placeholders.length) {
      return;
    }

    fetch('/intranet/footer.html')
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Statut HTTP inattendu: ' + response.status);
        }
        return response.text();
      })
      .then(injectFooter)
      .catch(function(error) {
        console.error('Erreur lors du chargement du pied de page partagé:', error);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFooter);
  } else {
    loadFooter();
  }
})();
