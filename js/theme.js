// Crear un nuevo archivo js/theme.js
// Módulo para manejar el cambio de tema (claro/oscuro)
const ThemeManager = (function() {
    // Elementos del DOM
    const themeToggleInput = document.getElementById('theme-toggle-input');
    const body = document.body;
    
    // Clave para guardar la preferencia en localStorage
    const THEME_STORAGE_KEY = 'preferredTheme';
    
    return {
        // Inicializar el manejador de temas
        init: function() {
            // Asegurarnos de que el toggle exista antes de configurarlo
            if (themeToggleInput) {
                // Cargar el tema preferido del usuario
                this.loadTheme();
                
                // Configurar evento para el toggle
                themeToggleInput.addEventListener('change', function() {
                    if (this.checked) {
                        ThemeManager.setDarkMode();
                    } else {
                        ThemeManager.setLightMode();
                    }
                });
            } else {
                console.error('Elemento theme-toggle-input no encontrado');
            }
        },
        
        // Cargar el tema desde localStorage o usar la preferencia del sistema
        loadTheme: function() {
            const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
            
            if (savedTheme) {
                // Si hay una preferencia guardada, usarla
                if (savedTheme === 'dark') {
                    this.setDarkMode();
                } else {
                    this.setLightMode();
                }
            } else {
                // De lo contrario, usar la preferencia del sistema
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    this.setDarkMode();
                } else {
                    this.setLightMode();
                }
                
                // Agregar listener para cambios en la preferencia del sistema
                // pero solo si no hay una preferencia guardada
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                    // Solo cambiar automáticamente si no hay una preferencia explícita
                    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
                        if (e.matches) {
                            this.setDarkMode();
                        } else {
                            this.setLightMode();
                        }
                    }
                });
            }
        },
        
        // Activar el modo oscuro
        setDarkMode: function() {
            body.classList.add('dark-mode');
            if (themeToggleInput) themeToggleInput.checked = true;
            localStorage.setItem(THEME_STORAGE_KEY, 'dark');
        },
        
        // Activar el modo claro
        setLightMode: function() {
            body.classList.remove('dark-mode');
            if (themeToggleInput) themeToggleInput.checked = false;
            localStorage.setItem(THEME_STORAGE_KEY, 'light');
        },
        
        // Cambiar entre modos
        toggleTheme: function() {
            if (body.classList.contains('dark-mode')) {
                this.setLightMode();
            } else {
                this.setDarkMode();
            }
        }
    };
})();

// Inicializar el manejador de temas cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    ThemeManager.init();
});