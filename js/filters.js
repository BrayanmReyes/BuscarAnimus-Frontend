/*filters.js - Gestión de filtros para los resultados*/
const FiltersManager = (function() {
    // Elementos del DOM
    const toggleFiltersBtn = document.getElementById('toggle-filters');
    const filtersContent = document.getElementById('filters-content');
    const resolutionFilter = document.getElementById('resolution-filter');
    const formatFilter = document.getElementById('format-filter');
    const submitterFilter = document.getElementById('submitter-filter');
    const sortByFilter = document.getElementById('sort-by');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    
    // Datos originales y filtrados
    let originalData = [];
    let filteredData = [];
    
    return {
        // Inicializar los filtros
        init: function() {
            // Asegurarse de que los filtros estén ocultos al inicio (solo el contenido)
            if (filtersContent) {
                filtersContent.classList.remove('show');
            }
            
            // Asegurarse de que el texto del botón sea correcto al inicio
            if (toggleFiltersBtn) {
                const toggleText = toggleFiltersBtn.querySelector('.toggle-text');
                if (toggleText) {
                    toggleText.textContent = 'Mostrar filtros';
                }
            }
            
            this.setupEventListeners();
        },
        
        // Configurar los listeners de eventos
        setupEventListeners: function() {
            // Toggle para mostrar/ocultar filtros
            if (toggleFiltersBtn && filtersContent) {
                toggleFiltersBtn.addEventListener('click', function() {
                    // Solo alternar la clase show en el contenido de los filtros
                    filtersContent.classList.toggle('show');
                    
                    // Actualizar el texto del botón
                    const toggleText = toggleFiltersBtn.querySelector('.toggle-text');
                    if (toggleText) {
                        if (filtersContent.classList.contains('show')) {
                            toggleText.textContent = 'Ocultar filtros';
                        } else {
                            toggleText.textContent = 'Mostrar filtros';
                        }
                    }
                });
            }
            
            // Botón aplicar filtros
            applyFiltersBtn.addEventListener('click', () => {
                this.applyFilters();
            });
            
            // Botón resetear filtros
            resetFiltersBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        },
        
        // Guardar datos originales y extraer grupos/submitters únicos
        setOriginalData: function(data) {
            originalData = data;
            this.extractSubmitters(data);
            // Mostrar datos originales inicialmente
            filteredData = [...originalData];
        },
        
        // Extraer submitters únicos de los datos
        extractSubmitters: function(data) {
            // Verificar que el elemento existe
            if (!submitterFilter) return;
                        
            // Limpiar opciones anteriores excepto la primera
            while (submitterFilter.options.length > 1) {
                submitterFilter.remove(1);
            }
            
            // Crear un conjunto para tener submitters únicos
            const submitters = new Set();
            
            data.forEach(item => {
                const submitterRegex = /\[(.*?)\]/;
                const submitterMatch = submitterRegex.exec(item.nombre);
                if (submitterMatch && submitterMatch[1]) {
                    submitters.add(submitterMatch[1]);
                }
            });
            
            // Agregar submitters como opciones al select
            submitters.forEach(submitter => {
                const option = document.createElement('option');
                option.value = submitter;
                option.textContent = submitter;
                submitterFilter.appendChild(option);
            });
        },
        
        // Aplicar los filtros seleccionados
        applyFilters: function() {
            const resolution = resolutionFilter.value;
            const format = formatFilter.value;
            const submitter = submitterFilter.value;
            const sortBy = sortByFilter.value;
            
            // Filtrar datos
            filteredData = originalData.filter(item => {
                let passesFilter = true;
                
                // Filtrar por resolución
                if (resolution && (!item.calidad || !item.calidad.resolucion || !item.calidad.resolucion.includes(resolution))) {
                    passesFilter = false;
                }
                
                // Filtrar por formato
                if (format && (!item.nombre || !item.nombre.toLowerCase().includes(`.${format.toLowerCase()}`))) {
                    passesFilter = false;
                }
                
                // Filtrar por submitter
                if (submitter) {
                    const submitterRegex = new RegExp(`\\[${submitter}\\]`, 'i');
                    if (!submitterRegex.test(item.nombre)) {
                        passesFilter = false;
                    }
                }
                
                return passesFilter;
            });
            
            // Ordenar resultados
            this.sortResults(filteredData, sortBy);
            
            // Actualizar UI con resultados filtrados
            UI.showResults(filteredData);
        },
        
        // Ordenar resultados según criterio
        sortResults: function(data, sortBy) {
            switch (sortBy) {
                case 'seeders':
                    data.sort((a, b) => (b.seeders || 0) - (a.seeders || 0));
                    break;
                case 'leechers':
                    data.sort((a, b) => (b.leechers || 0) - (a.leechers || 0));
                    break;
                case 'downloads':
                    data.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
                    break;
                case 'size':
                    // Convertir tamaño a bytes para comparar
                    data.sort((a, b) => {
                        return this.sizeToBytes(b.tamano || '0 B') - this.sizeToBytes(a.tamano || '0 B');
                    });
                    break;
                case 'date':
                    // Convertir fecha a timestamp para comparar
                    data.sort((a, b) => {
                        const dateA = a.fecha.original ? new Date(a.fecha.original).getTime() : 0;
                        const dateB = b.fecha.original ? new Date(b.fecha.original).getTime() : 0;
                        return dateB - dateA;
                    });
                    break;
            }
        },
        
        // Convertir tamaño en texto a bytes para poder comparar
        sizeToBytes: function(sizeStr) {
            const units = {
                'B': 1,
                'KB': 1024,
                'MB': 1024 * 1024,
                'GB': 1024 * 1024 * 1024,
                'TB': 1024 * 1024 * 1024 * 1024
            };
            
            const regex = /^(\d+(?:\.\d+)?)\s*([KMGT]?B)$/i;
            const match = sizeStr.match(regex);
            
            if (match) {
                const size = parseFloat(match[1]);
                const unit = match[2].toUpperCase();
                
                if (units[unit]) {
                    return size * units[unit];
                }
            }
            
            return 0;
        },
        
        // Resetear filtros a valores por defecto
        resetFilters: function() {
            resolutionFilter.selectedIndex = 0;
            formatFilter.selectedIndex = 0;
            submitterFilter.selectedIndex = 0;
            sortByFilter.selectedIndex = 0;
            
            // Mostrar todos los datos originales
            filteredData = [...originalData];
            UI.showResults(filteredData);
        },
        
        // Obtener los datos filtrados actuales
        getFilteredData: function() {
            return filteredData;
        }
    };
})();

// Inicializar el gestor de filtros cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    FiltersManager.init();
});
