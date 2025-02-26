/*cards.js - Creación y manejo de tarjetas de resultado*/
// Módulo para crear y manejar tarjetas de resultados
const CardBuilder = (function() {
    return {
        // Crear tarjeta de resultado
        createResultCard: function(item) {
            const card = document.createElement('div');
            card.className = 'result-card';
            
            // Extraer submitter (grupos como Erai-raws, SubsPlease, etc.)
            const submitterRegex = /\[(.*?)\]/;
            const submitterMatch = submitterRegex.exec(item.nombre);
            const submitter = submitterMatch ? submitterMatch[1] : null;
            
            // Formatear nombre para título (eliminar tags comunes)
            let title = item.nombre
                .replace(/\[.*?\]/g, '')
                .replace(/\(.*?\)/g, '')
                .replace(/\.mkv$|\.mp4$/i, '')
                .trim();
            
            // Si el título es muy largo, acortarlo
            if (title.length > 100) {
                title = title.substring(0, 100) + '...';
            }
            
            let fecha = item.fecha.formateada || item.fecha.original || 'Fecha desconocida';
            
            // Preparar la información de subtítulos y calidad
            const subtitulos = item.subtitulos || { texto: 'No disponible', tipo: '' };
            const calidad = item.calidad || { resolucion: '', fuente: '', codec: '', audio: '' };
            
            // Crear badges para calidad y subtítulos
            const calidadBadges = [];
            if (calidad.resolucion) calidadBadges.push(calidad.resolucion);
            if (calidad.fuente) calidadBadges.push(calidad.fuente);
            if (calidad.codec) calidadBadges.push(calidad.codec);
            if (calidad.audio) calidadBadges.push(calidad.audio);
            
            // Template para la tarjeta
            let cardHTML = `
                <div class="card-header">
                    <h3 class="anime-title">${title}</h3>`;
            
            // Añadir submitter solo si se encontró
            if (submitter) {
                cardHTML += `<div class="submitter-tag">${submitter}</div>`;
            }
            
            // Añadir badges de calidad si están disponibles
            if (calidadBadges.length > 0) {
                cardHTML += `<div class="badges-container">`;
                calidadBadges.forEach(badge => {
                    cardHTML += `<span class="badge badge-calidad">${badge}</span>`;
                });
                cardHTML += `</div>`;
            }
            
            cardHTML += `
                </div>
                <div class="card-body">
                    <ul class="info-list">
                        <li class="info-item">
                            <span class="info-label">Fecha:</span>
                            <span class="info-value">${fecha}</span>
                        </li>
                        <li class="info-item">
                            <span class="info-label">Tamaño:</span>
                            <span class="info-value">${item.tamano || 'No disponible'}</span>
                        </li>`;
            
            // Añadir información de subtítulos
            if (subtitulos.texto || subtitulos.tipo) {
                cardHTML += `
                        <li class="info-item">
                            <span class="info-label">Subtítulos:</span>
                            <span class="info-value">
                                ${subtitulos.texto || 'No disponible'}
                                ${subtitulos.tipo ? `<span class="subtitulos-tipo">(${subtitulos.tipo})</span>` : ''}
                            </span>
                        </li>`;
            }
            
            cardHTML += `
                    </ul>
                    <div class="stats">
                        <div class="stat">
                            <span class="stat-value seeders">${item.seeders || 0}</span>
                            <span class="stat-label">Seeders</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value leechers">${item.leechers || 0}</span>
                            <span class="stat-label">Leechers</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value downloads">${item.downloads || 0}</span>
                            <span class="stat-label">Descargas</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <a href="${item.enlaceMagnet}" class="download-btn button">Descargar en torrent</a>
                    <button class="copy-btn" data-magnet="${item.enlaceMagnet}" title="Copiar enlace magnet">
                        <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        </svg>
                    </button>
                </div>
            `;
            
            card.innerHTML = cardHTML;
            
            // Configurar eventos
            this.setupCardEvents(card);
            
            return card;
        },
        
        // Configurar eventos para la tarjeta
        setupCardEvents: function(card) {
            // Configurar botón de descarga
            const downloadBtn = card.querySelector('.download-btn');
            downloadBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = this.getAttribute('href');
            });
            
            // Configurar botón de copiar al portapapeles
            const copyBtn = card.querySelector('.copy-btn');
            copyBtn.addEventListener('click', function() {
                const magnetLink = this.getAttribute('data-magnet');
                Utils.copyToClipboard(magnetLink);
            });
        }
    };
})();
