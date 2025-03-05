/*cards.js - Creación y manejo de tarjetas de resultado con detección de episodios*/
// Módulo para crear y manejar tarjetas de resultados
const CardBuilder = (function() {
    return {
        // Función para detectar número de episodio
        detectEpisodeNumber: function(title) {
            // Patrones comunes para números de episodio
            const patterns = [
                /\bE(\d{1,3})\b/i,                          // Formato E01, E1, E001
                /\bEP(\d{1,3})\b/i,                         // Formato EP01, EP1, EP001
                /\bEpisodio\s*(\d{1,3})\b/i,                // Formato Episodio 1, Episodio 01
                /\bCapitulo\s*(\d{1,3})\b/i,                // Formato Capitulo 1, Capitulo 01
                /\b(\d{1,3})[vV]\d{1}\b/,                   // Formato 01v2 (versión)
                /\b[Ss](\d{1,2})[Ee](\d{1,3})\b/,           // Formato S01E01
                /\s(\d{1,2})x(\d{1,3})\b/,                  // Formato 1x01
                /\s-\s(\d{1,3})\s/,                         // Formato - 01 -
                /\s(\d{1,3})\s?of\s?\d{1,3}\b/i,            // Formato 01 of 12
                /\s(\d{1,3})([\s\.\-\_])(?!season|s\d)/i,    // Formato general con separador después
                /\b#(\d{1,3})\b/,                           // Formato #01
            ];
            
            // Buscar coincidencias con los patrones
            for (const pattern of patterns) {
                const match = title.match(pattern);
                if (match) {
                    // Los patrones SxxExx y nxnn tienen el episodio en el grupo 2
                    if (pattern.toString().includes('[Ss]') || pattern.toString().includes('x')) {
                        if (match[2]) return parseInt(match[2], 10);
                    } 
                    // El resto tiene el episodio en el grupo 1
                    else if (match[1]) {
                        return parseInt(match[1], 10);
                    }
                }
            }
            
            return null; // No se encontró número de episodio
        },
        
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
            
            // Detectar número de episodio
            const episodeNumber = this.detectEpisodeNumber(item.nombre);
            
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
                <div class="card-header">`;
            
            // Agregar badge de episodio si se detectó
            if (episodeNumber !== null) {
                cardHTML += `<span class="episode-badge">EP ${episodeNumber}</span>`;
            }
            
            cardHTML += `
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
            
            // Añadir información del episodio en el cuerpo de la tarjeta si se detectó
            if (episodeNumber !== null) {
                cardHTML += `
                        <li class="info-item">
                            <span class="info-label">Episodio:</span>
                            <span class="info-value episode-number">${episodeNumber}</span>
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
                    <div class="download-actions">
                        <a href="${item.enlaceMagnet}" class="download-btn">
                            <span>Descargar torrent</span>
                        </a>
                        <button class="copy-btn" data-magnet="${item.enlaceMagnet}" title="Copiar enlace magnet">
                            <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="stremio-actions">
                        <button class="stremio-web-btn" data-magnet="${item.enlaceMagnet}" title="Ver en Stremio Web">
                            <svg class="stremio-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l5-3-5-3v6z"/>
                            </svg>
                            <span>Ver en Web</span>
                        </button>
                        <button class="stremio-desktop-btn" data-magnet="${item.enlaceMagnet}" title="Ver en Stremio Escritorio">
                            <svg class="stremio-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L22 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>
                            </svg>
                            <span>Abrir App</span>
                        </button>
                    </div>
                </div>
            `;
            
            card.innerHTML = cardHTML;
            
            // Configurar eventos
            this.setupCardEvents(card);
            
            return card;
        },
        
        // El resto del código de configuración de eventos permanece sin cambios
        setupCardEvents: function(card) {
            // Configurar botón de descarga
            const downloadBtn = card.querySelector('.download-btn');
            downloadBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = this.getAttribute('href');
            });
            
            // Configurar botón de Stremio Web
            const stremioWebBtn = card.querySelector('.stremio-web-btn');
            stremioWebBtn.addEventListener('click', function() {
                const magnetLink = this.getAttribute('data-magnet');
                openInStremio(magnetLink, 'web');
            });
            
            // Configurar botón de Stremio Desktop
            const stremioDesktopBtn = card.querySelector('.stremio-desktop-btn');
            stremioDesktopBtn.addEventListener('click', function() {
                const magnetLink = this.getAttribute('data-magnet');
                openInStremio(magnetLink, 'desktop');
            });
            
            // Configurar botón de copiar al portapapeles
            const copyBtn = card.querySelector('.copy-btn');
            copyBtn.addEventListener('click', function() {
                const magnetLink = this.getAttribute('data-magnet');
                Utils.copyToClipboard(magnetLink);
            });
            
            // Función para abrir en Stremio según la versión
            function openInStremio(magnetLink, version) {
                // Extraer info hash correctamente
                const infoHashMatch = magnetLink.match(/urn:btih:([a-f0-9]+)/i);
                if (!infoHashMatch) {
                    UI.showError('El enlace magnet no contiene un info hash válido.');
                    return;
                }
                const infoHash = infoHashMatch[1].toLowerCase();
                
                // Construir URL según versión
                let url;
                switch(version) {
                    case 'web':
                        url = `https://web.stremio.com/#/detail/other/bt:${infoHash}`;
                        break;
                    case 'desktop':
                        url = `stremio://detail/other/bt:${infoHash}`;
                        break;
                    default:
                        UI.showError('Versión de Stremio no válida.');
                        return;
                }
                
                // Abrir en nueva pestaña
                window.open(url, '_blank');
            }

        }
    };
})();