/*utils.js - Funciones de utilidad (copiar, formatear, etc.)*/
// Módulo de utilidades
const Utils = (function() {
    return {
        // Copiar texto al portapapeles
        copyToClipboard: function(text) {
            // Usar la API moderna del portapapeles si está disponible
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text)
                    .then(() => UI.showSuccessMessage())
                    .catch(err => console.error('Error al copiar: ', err));
            } else {
                // Método alternativo para navegadores que no soportan la API Clipboard
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        UI.showSuccessMessage();
                    } else {
                        console.error('Error al copiar');
                    }
                } catch (err) {
                    console.error('Error al copiar: ', err);
                }
                
                document.body.removeChild(textArea);
            }
        }
    };
})();
