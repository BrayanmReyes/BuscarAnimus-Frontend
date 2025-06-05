/*ui.js - Funciones de manipulación de la interfaz*/
// Módulo para manejar la interfaz de usuario
const UI = (function() {
    // Elementos del DOM
    const loadingElement = document.getElementById('loading');
    const resultsArea = document.getElementById('results-area');
    const resultsCount = document.getElementById('results-count');
    const resultsGrid = document.getElementById('results-grid');
    const errorMessage = document.getElementById('error-message');
    const emptyState = document.getElementById('empty-state');
    const successMessage = document.getElementById('success-message');
    const filtersContent = document.getElementById('filters-content');
    
    return {
        // Mostrar/ocultar loading
        showLoading: function() {
            loadingElement.style.display = 'block';
        },
        
        hideLoading: function() {
            loadingElement.style.display = 'none';
        },
        
        // Mostrar resultados
        showResults: function(data) {
            resultsArea.style.display = 'block';
            resultsCount.textContent = `Se encontraron ${data.length} resultados`;
            
            // Limpiar resultados anteriores
            resultsGrid.innerHTML = '';
            
            // Crear tarjetas para cada resultado
            data.forEach(item => {
                const card = CardBuilder.createResultCard(item);
                resultsGrid.appendChild(card);
            });
            
            // Si no hay resultados después del filtrado, mostrar mensaje
            if (data.length === 0) {
                const noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-filtered-results';
                noResultsMsg.textContent = 'No hay resultados que coincidan con los filtros seleccionados';
                resultsGrid.appendChild(noResultsMsg);
            }

            // Initialize event listeners for the newly created cards
            CardBuilder.init(resultsGrid);
        },
        
        // Mostrar mensaje de error
        showError: function(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            
            // Ocultar después de 5 segundos
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 5000);
        },
        
        // Mostrar mensaje de éxito
        showSuccessMessage: function() {
            successMessage.classList.add('show');
            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 2000);
        },
        
        // Mostrar estado vacío (sin resultados)
        showEmptyState: function() {
            emptyState.style.display = 'block';
        },
        
        // Resetear la interfaz
        resetUI: function() {
            errorMessage.style.display = 'none';
            loadingElement.style.display = 'none';
            resultsArea.style.display = 'none';
            emptyState.style.display = 'none';
            // Ocultar filtros al hacer una nueva búsqueda
            filtersContent.classList.remove('show');
            document.getElementById('toggle-filters').querySelector('.toggle-text').textContent = 'Mostrar filtros';
        },

        initScrollToTopButton: function() { // Added function directly to returned object
            const scrollToTopBtn = document.getElementById('scrollToTopBtn');
            if (!scrollToTopBtn) {
                console.warn('Scroll to top button not found.'); // Optional warning
                return;
            }

            // Throttle scroll event listener for performance
            let isThrottled = false;
            const throttleDuration = 100; // ms

            window.addEventListener('scroll', () => {
                if (isThrottled) return;
                isThrottled = true;
                setTimeout(() => {
                    isThrottled = false;
                }, throttleDuration);

                if (window.pageYOffset > 300) {
                    scrollToTopBtn.classList.add('show');
                } else {
                    scrollToTopBtn.classList.remove('show');
                }
            });

            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        },

        initNavigationFeedback: function() {
            const pageTransitionLoader = document.getElementById('pageTransitionLoader');
            if (!pageTransitionLoader) {
                console.warn('Page transition loader not found.');
                return;
            }

            function showPageTransitionLoader() { // Local helper function
                if (pageTransitionLoader) {
                    pageTransitionLoader.classList.add('show');
                }
            }

            // More general approach for all nav-buttons
            const navButtons = document.querySelectorAll('.nav-buttons a.nav-button');
            const currentPage = window.location.pathname.split('/').pop() || 'index.html'; // Get current page filename

            navButtons.forEach(link => {
                const linkPage = link.getAttribute('href').split('/').pop() || 'index.html';

                // Only add listener if the link is not for the current page
                if (linkPage !== currentPage) {
                    link.addEventListener('click', function(event) {
                        // Check if it's a genuine navigation and not just a hash link or JS prevented action
                        if (link.getAttribute('href').startsWith('#')) return;
                        if (event.defaultPrevented) return; // if other JS called preventDefault

                        showPageTransitionLoader();
                        // Note: The loader ideally hides on 'pageshow' or 'bfcache' events,
                        // or if navigation fails. For now, it shows on click.
                    });
                }
            });
        }
    };
})();