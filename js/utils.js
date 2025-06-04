/*utils.js - Funciones de utilidad (copiar, formatear, etc.)*/
// Módulo de utilidades
const Utils = (function() {
    return {
        // Copiar texto al portapapeles
        copyToClipboard: function(text) {
            return new Promise((resolve, reject) => {
                // Usar la API moderna del portapapeles si está disponible
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(text)
                        .then(() => {
                            UI.showSuccessMessage();
                            resolve(true);
                        })
                        .catch(err => {
                            console.error('Error al copiar (API): ', err);
                            reject(err);
                        });
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
                            resolve(true);
                        } else {
                            console.error('Error al copiar (execCommand)');
                            reject(new Error('Fallback copy failed'));
                        }
                    } catch (err) {
                        console.error('Error al copiar (execCommand catch): ', err);
                        reject(err);
                    }

                    document.body.removeChild(textArea);
                }
            });
        }
    };
})();
