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
                    throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
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