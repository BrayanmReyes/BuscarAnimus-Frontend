/*main.js - Inicialización y manejo del formulario*/
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const animeNameInput = document.getElementById('anime-name');
    const timezoneSelect = document.getElementById('timezone');
    const serverUrlInput = document.getElementById('server-url');
    
    // Cargar preferencias almacenadas
    loadStoredPreferences();
    
    // Configurar el evento submit del formulario
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const animeName = animeNameInput.value.trim();
        const timezone = timezoneSelect.value;
        const serverUrl = serverUrlInput.value.trim();
        
        if (!animeName) {
            UI.showError('Por favor, introduce el nombre de un anime');
            return;
        }
        
        // Guardar preferencias en localStorage
        savePreferences(serverUrl, timezone);
        
        // Resetear UI y mostrar loading
        UI.resetUI();
        UI.showLoading();
        
        // Realizar búsqueda
        searchAnime(animeName, timezone, serverUrl);
    });

    // Initialize Scroll to Top button
    if (UI && typeof UI.initScrollToTopButton === 'function') {
        UI.initScrollToTopButton();
    }
    
    // Initialize Navigation Feedback
    if (UI && typeof UI.initNavigationFeedback === 'function') {
        UI.initNavigationFeedback();
    }

    // Initialize Toggle Search
    if (UI && typeof UI.initToggleSearch === 'function') {
        UI.initToggleSearch();
    }

    // Initialize Hamburger Menu
    if (UI && typeof UI.initHamburgerMenu === 'function') {
        UI.initHamburgerMenu();
    }

    // Función para cargar preferencias almacenadas
    function loadStoredPreferences() {
        if (localStorage.getItem('serverUrl')) {
            serverUrlInput.value = localStorage.getItem('serverUrl');
        }
        
        if (localStorage.getItem('timezone')) {
            timezoneSelect.value = localStorage.getItem('timezone');
        }
    }
    
    // Función para guardar preferencias
    function savePreferences(serverUrl, timezone) {
        localStorage.setItem('serverUrl', serverUrl);
        localStorage.setItem('timezone', timezone);
    }
    
    // Función para buscar anime
    function searchAnime(animeName, timezone, serverUrl) {
        const apiUrl = `${serverUrl}/buscar-anime?nombre=${encodeURIComponent(animeName)}&timezone=${encodeURIComponent(timezone)}`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    let errorMessage;
                    switch (response.status) {
                        case 400:
                            errorMessage = `Solicitud incorrecta (Error 400). Verifica los parámetros enviados.`;
                            break;
                        case 401:
                            errorMessage = `No autorizado (Error 401). Se requiere autenticación.`;
                            break;
                        case 403:
                            errorMessage = `Acceso prohibido al recurso (Error 403).`;
                            break;
                        case 404:
                            errorMessage = `Servidor no encontrado o recurso no disponible (Error 404). Verifica la URL: ${apiUrl}`;
                            break;
                        case 500:
                            errorMessage = `Error interno del servidor (Error 500). Intenta más tarde.`;
                            break;
                        case 502:
                            errorMessage = `Gateway incorrecto (Error 502). El servidor recibió una respuesta inválida.`;
                            break;
                        case 503:
                            errorMessage = `Servicio no disponible (Error 503). El servidor está sobrecargado o en mantenimiento.`;
                            break;
                        default:
                            if (response.status >= 400 && response.status < 500) {
                                errorMessage = `Error del cliente: ${response.status} - ${response.statusText}. Por favor, verifica la URL y los parámetros.`;
                            } else if (response.status >= 500 && response.status < 600) {
                                errorMessage = `Error del servidor: ${response.status} - ${response.statusText}. Por favor, verifica la URL del servidor.`;
                            } else {
                                errorMessage = `Error: ${response.status} - ${response.statusText}.`;
                            }
                    }
                    throw new Error(errorMessage);
                }
                return response.json();
            })
            .then(data => {
                UI.hideLoading();
                
                if (data.length === 0) {
                    UI.showEmptyState();
                    return;
                }
                
                // Guardar datos en el gestor de filtros
                FiltersManager.setOriginalData(data);
                
                // Mostrar resultados
                UI.showResults(data);
            })
            .catch(error => {
                UI.hideLoading();
                UI.showError(`Error al buscar: ${error.message}`);
            });
    }
});