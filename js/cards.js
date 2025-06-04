/*cards.js - Creación y manejo de tarjetas de resultado con detección de episodios*/
// Módulo para crear y manejar tarjetas de resultados
const CardBuilder = (function() {
    return {
        // Función para detectar número de episodio
        detectEpisodeNumber: function(title) {
            // Patrones comunes para números de episodio, ordenados de más específico a más general
            const patterns = [
                /\b[Ss](\d{1,2})[Ee](\d{1,3})\b/,           // Formato S01E01 (Episode in group 2)
                /\s(\d{1,2})x(\d{1,3})\b/,                  // Formato 1x01 (Episode in group 2)
                /\bE[Pp]?(\d{1,3})\b/i,                     // Formato E01, EP01, Ep01, e01 etc.
                /\b(?:Episodio|Capitulo)\s*(\d{1,3})\b/i,   // Formato Episodio 1, Capitulo 01
                /\b#(\d{1,3})\b/,                           // Formato #01
                /\s-\s(\d{1,3})\s/,                         // Formato - 01 -
                /\s(\d{1,3})\s?of\s?\d{1,3}\b/i,            // Formato 01 of 12
                /\b(\d{1,3})[vV]\d{1}\b/,                   // Formato 01v2 (versión) - Potentially ambiguous
                /\s(\d{1,3})([\s\.\-\_])(?!season|s\d|[vV]\d)/i,    // Formato general con separador (avoiding seasons, versions)
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

            // --- Card Header ---
            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header';

            // Extraer submitter
            const submitterRegex = /\[(.*?)\]/;
            const submitterMatch = submitterRegex.exec(item.nombre);
            const submitter = submitterMatch ? submitterMatch[1] : null;

            // Formatear nombre para título
            let titleText = item.nombre
                .replace(/\[.*?\]/g, '')
                .replace(/\(.*?\)/g, '')
                .replace(/\.mkv$|\.mp4$/i, '')
                .trim();
            if (titleText.length > 100) {
                titleText = titleText.substring(0, 100) + '...';
            }

            // Detectar número de episodio
            const episodeNumber = this.detectEpisodeNumber(item.nombre);
            if (episodeNumber !== null) {
                const episodeBadge = document.createElement('span');
                episodeBadge.className = 'episode-badge';
                episodeBadge.textContent = `EP ${episodeNumber}`;
                cardHeader.appendChild(episodeBadge);
            }

            const animeTitle = document.createElement('h3');
            animeTitle.className = 'anime-title';
            animeTitle.textContent = titleText;
            cardHeader.appendChild(animeTitle);

            if (submitter) {
                const submitterTag = document.createElement('div');
                submitterTag.className = 'submitter-tag';
                submitterTag.textContent = submitter;
                cardHeader.appendChild(submitterTag);
            }

            // Calidad Badges
            const calidad = item.calidad || { resolucion: '', fuente: '', codec: '', audio: '' };
            const calidadBadgesData = [];
            if (calidad.resolucion) calidadBadgesData.push(calidad.resolucion);
            if (calidad.fuente) calidadBadgesData.push(calidad.fuente);
            if (calidad.codec) calidadBadgesData.push(calidad.codec);
            if (calidad.audio) calidadBadgesData.push(calidad.audio);

            if (calidadBadgesData.length > 0) {
                const badgesContainer = document.createElement('div');
                badgesContainer.className = 'badges-container';
                calidadBadgesData.forEach(badgeText => {
                    const badge = document.createElement('span');
                    badge.className = 'badge badge-calidad';
                    badge.textContent = badgeText;
                    badgesContainer.appendChild(badge);
                });
                cardHeader.appendChild(badgesContainer);
            }
            card.appendChild(cardHeader);

            // --- Card Body ---
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            const infoList = document.createElement('ul');
            infoList.className = 'info-list';

            // Fecha
            let fechaText = item.fecha.formateada || item.fecha.original || 'Fecha desconocida';
            const fechaItem = document.createElement('li');
            fechaItem.className = 'info-item';
            const fechaLabel = document.createElement('span');
            fechaLabel.className = 'info-label';
            fechaLabel.textContent = 'Fecha:';
            const fechaValue = document.createElement('span');
            fechaValue.className = 'info-value';
            fechaValue.textContent = fechaText;
            fechaItem.appendChild(fechaLabel);
            fechaItem.appendChild(fechaValue);
            infoList.appendChild(fechaItem);

            // Tamaño
            const tamanoItem = document.createElement('li');
            tamanoItem.className = 'info-item';
            const tamanoLabel = document.createElement('span');
            tamanoLabel.className = 'info-label';
            tamanoLabel.textContent = 'Tamaño:';
            const tamanoValue = document.createElement('span');
            tamanoValue.className = 'info-value';
            tamanoValue.textContent = item.tamano || 'No disponible';
            tamanoItem.appendChild(tamanoLabel);
            tamanoItem.appendChild(tamanoValue);
            infoList.appendChild(tamanoItem);

            // Subtítulos
            const subtitulos = item.subtitulos || { texto: 'No disponible', tipo: '' };
            if (subtitulos.texto || subtitulos.tipo) {
                const subtitulosItem = document.createElement('li');
                subtitulosItem.className = 'info-item';
                const subtitulosLabel = document.createElement('span');
                subtitulosLabel.className = 'info-label';
                subtitulosLabel.textContent = 'Subtítulos:';
                const subtitulosValue = document.createElement('span');
                subtitulosValue.className = 'info-value';
                subtitulosValue.textContent = subtitulos.texto || 'No disponible';
                if (subtitulos.tipo) {
                    const tipoSpan = document.createElement('span');
                    tipoSpan.className = 'subtitulos-tipo';
                    tipoSpan.textContent = ` (${subtitulos.tipo})`;
                    subtitulosValue.appendChild(tipoSpan);
                }
                subtitulosItem.appendChild(subtitulosLabel);
                subtitulosItem.appendChild(subtitulosValue);
                infoList.appendChild(subtitulosItem);
            }

            // Episodio en cuerpo
            if (episodeNumber !== null) {
                const episodioItem = document.createElement('li');
                episodioItem.className = 'info-item';
                const episodioLabel = document.createElement('span');
                episodioLabel.className = 'info-label';
                episodioLabel.textContent = 'Episodio:';
                const episodioValue = document.createElement('span');
                episodioValue.className = 'info-value episode-number';
                episodioValue.textContent = episodeNumber;
                episodioItem.appendChild(episodioLabel);
                episodioItem.appendChild(episodioValue);
                infoList.appendChild(episodioItem);
            }
            cardBody.appendChild(infoList);

            // Stats
            const statsDiv = document.createElement('div');
            statsDiv.className = 'stats';
            ['seeders', 'leechers', 'downloads'].forEach(statName => {
                const statContainer = document.createElement('div');
                statContainer.className = 'stat';
                const statValue = document.createElement('span');
                statValue.className = `stat-value ${statName}`;
                statValue.textContent = item[statName] || 0;
                const statLabel = document.createElement('span');
                statLabel.className = 'stat-label';
                statLabel.textContent = statName.charAt(0).toUpperCase() + statName.slice(1);
                statContainer.appendChild(statValue);
                statContainer.appendChild(statLabel);
                statsDiv.appendChild(statContainer);
            });
            cardBody.appendChild(statsDiv);
            card.appendChild(cardBody);

            // --- Card Footer ---
            const cardFooter = document.createElement('div');
            cardFooter.className = 'card-footer';

            // Download Actions
            const downloadActions = document.createElement('div');
            downloadActions.className = 'download-actions';
            const downloadBtn = document.createElement('a');
            downloadBtn.href = item.enlaceMagnet;
            downloadBtn.className = 'download-btn';
            const downloadBtnSpan = document.createElement('span');
            downloadBtnSpan.textContent = 'Descargar torrent';
            downloadBtn.appendChild(downloadBtnSpan);
            downloadActions.appendChild(downloadBtn);

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.setAttribute('data-magnet', item.enlaceMagnet);
            copyBtn.title = 'Copiar enlace magnet';

            // Original Copy Icon
            const copyIconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            copyIconSvg.setAttribute('class', 'copy-icon'); // Will be styled by CSS
            copyIconSvg.setAttribute('viewBox', '0 0 24 24');
            const copyIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            copyIconPath.setAttribute('d', 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z');
            copyIconSvg.appendChild(copyIconPath);
            copyBtn.appendChild(copyIconSvg);

            // New Checkmark Icon (hidden by default via CSS)
            const checkIconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            checkIconSvg.setAttribute('class', 'check-icon'); // Will be styled by CSS (display:none initially)
            checkIconSvg.setAttribute('viewBox', '0 0 24 24');
            // Path for checkmark icon
            const checkIconPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            checkIconPath1.setAttribute('d', 'M0 0h24v24H0z');
            checkIconPath1.setAttribute('fill', 'none');
            const checkIconPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            checkIconPath2.setAttribute('d', 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z');
            checkIconSvg.appendChild(checkIconPath1);
            checkIconSvg.appendChild(checkIconPath2);
            copyBtn.appendChild(checkIconSvg);

            downloadActions.appendChild(copyBtn);
            cardFooter.appendChild(downloadActions);

            // Stremio Actions
            const stremioActions = document.createElement('div');
            stremioActions.className = 'stremio-actions';

            const stremioWebBtn = document.createElement('button');
            stremioWebBtn.className = 'stremio-web-btn';
            stremioWebBtn.setAttribute('data-magnet', item.enlaceMagnet);
            stremioWebBtn.title = 'Ver en Stremio Web';
            const stremioWebIconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            stremioWebIconSvg.setAttribute('class', 'stremio-icon');
            stremioWebIconSvg.setAttribute('viewBox', '0 0 24 24');
            const stremioWebIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            stremioWebIconPath.setAttribute('d', 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l5-3-5-3v6z');
            stremioWebIconSvg.appendChild(stremioWebIconPath);
            stremioWebBtn.appendChild(stremioWebIconSvg);
            const stremioWebBtnSpan = document.createElement('span');
            stremioWebBtnSpan.textContent = 'Ver en Web';
            stremioWebBtn.appendChild(stremioWebBtnSpan);
            stremioActions.appendChild(stremioWebBtn);

            const stremioDesktopBtn = document.createElement('button');
            stremioDesktopBtn.className = 'stremio-desktop-btn';
            stremioDesktopBtn.setAttribute('data-magnet', item.enlaceMagnet);
            stremioDesktopBtn.title = 'Ver en Stremio Escritorio';
            const stremioDesktopIconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            stremioDesktopIconSvg.setAttribute('class', 'stremio-icon');
            stremioDesktopIconSvg.setAttribute('viewBox', '0 0 24 24');
            const stremioDesktopIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            stremioDesktopIconPath.setAttribute('d', 'M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L22 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z');
            stremioDesktopIconSvg.appendChild(stremioDesktopIconPath);
            stremioDesktopBtn.appendChild(stremioDesktopIconSvg);
            const stremioDesktopBtnSpan = document.createElement('span');
            stremioDesktopBtnSpan.textContent = 'Abrir App';
            stremioDesktopBtn.appendChild(stremioDesktopBtnSpan);
            stremioActions.appendChild(stremioDesktopBtn);
            cardFooter.appendChild(stremioActions);

            card.appendChild(cardFooter);
            
            return card;
        },
        
        // Private method to open in Stremio
        _openInStremio: function(magnetLink, version) {
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
        },

        // Initialize event listeners on the results grid
        init: function(resultsGridElement) {
            resultsGridElement.addEventListener('click', (event) => {
                const target = event.target;
                const card = target.closest('.result-card');
                if (!card) return;

                const magnetLink = target.getAttribute('data-magnet') || (target.closest('[data-magnet]') ? target.closest('[data-magnet]').getAttribute('data-magnet') : null);

                if (target.matches('.download-btn, .download-btn *')) {
                    event.preventDefault();
                    const downloadLink = card.querySelector('.download-btn').href;
                    if (downloadLink) {
                        window.location.href = downloadLink;
                    }
                } else if (target.matches('.copy-btn, .copy-btn *')) {
                    const copyButtonElement = target.closest('.copy-btn');
                    if (magnetLink && copyButtonElement) {
                        const originalTitle = copyButtonElement.title; // Save original title
                        Utils.copyToClipboard(magnetLink)
                            .then(success => {
                                if (success) {
                                    copyButtonElement.classList.add('copied');
                                    copyButtonElement.title = 'Copied!'; // Optional: change title
                                    setTimeout(() => {
                                        copyButtonElement.classList.remove('copied');
                                        copyButtonElement.title = originalTitle; // Restore original title
                                    }, 2000);
                                }
                            })
                            .catch(err => {
                                // Error already logged by copyToClipboard, could add specific UI feedback here if needed
                                console.error('Copy operation failed for this button:', err);
                            });
                    }
                } else if (target.matches('.stremio-web-btn, .stremio-web-btn *')) {
                    if (magnetLink) {
                        this._openInStremio(magnetLink, 'web');
                    }
                } else if (target.matches('.stremio-desktop-btn, .stremio-desktop-btn *')) {
                    if (magnetLink) {
                        this._openInStremio(magnetLink, 'desktop');
                    }
                }
            });
        }
    };
})();