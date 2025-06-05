document.addEventListener('DOMContentLoaded', function() {
    const loadingElement = document.getElementById('loading-trending');
    const errorElement = document.getElementById('error-trending');
    const trendingGrid = document.getElementById('trending-grid');

    function truncateSynopsis(text, maxLength) {
        if (!text) return 'No synopsis available.';
        if (text.length <= maxLength) {
            return text;
        }
        return text.substr(0, text.lastIndexOf(' ', maxLength)) + '...';
    }

    function createTrendingAnimeCard(animeData) {
        const card = document.createElement('div');
        // Reusing .result-card for base styling, adding .trending-anime-card for specifics
        card.className = 'result-card trending-anime-card';

        const imageUrl = animeData.images?.jpg?.large_image_url || animeData.images?.jpg?.image_url || 'placeholder.png'; // Fallback image

        // Card Header (Optional - for trending, title might be better in card-body directly)
        // For simplicity, putting all content within a card-body like structure

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = animeData.title || 'Anime Image';
        card.appendChild(img);

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body'; // Reusing .card-body for padding and flex properties

        const title = document.createElement('h3');
        title.textContent = animeData.title || 'Unknown Title';
        cardBody.appendChild(title);

        if (animeData.score) {
            const score = document.createElement('p');
            score.innerHTML = `<strong>Score:</strong> ${animeData.score} (${animeData.scored_by || 0} users)`;
            cardBody.appendChild(score);
        }

        if (animeData.type) {
            const typeRank = document.createElement('p');
            let rankText = animeData.rank ? ` | <strong>Rank:</strong> #${animeData.rank}` : '';
            typeRank.innerHTML = `<strong>Type:</strong> ${animeData.type}${rankText}`;
            cardBody.appendChild(typeRank);
        }


        const episodes = document.createElement('p');
        episodes.innerHTML = `<strong>Episodes:</strong> ${animeData.episodes || 'N/A'}`;
        cardBody.appendChild(episodes);

        if (animeData.synopsis) {
            const synopsis = document.createElement('p');
            synopsis.className = 'synopsis';
            synopsis.textContent = truncateSynopsis(animeData.synopsis, 150);
            cardBody.appendChild(synopsis);
        }

        const malLink = document.createElement('a');
        malLink.href = animeData.url || '#';
        malLink.target = '_blank';
        malLink.rel = 'noopener noreferrer';
        malLink.className = 'mal-link nav-button'; // Reusing .nav-button for styling
        malLink.textContent = 'View on MyAnimeList';
        cardBody.appendChild(malLink);

        card.appendChild(cardBody);
        return card;
    }

    function fetchTrendingAnime() {
        if (!loadingElement || !errorElement || !trendingGrid) {
            console.error('Required elements for trending anime not found.');
            return;
        }

        loadingElement.style.display = 'block';
        errorElement.style.display = 'none';
        trendingGrid.innerHTML = ''; // Clear previous results

        fetch('https://api.jikan.moe/v4/top/anime?limit=24')
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; }); // Throw error object from API if possible
                }
                return response.json();
            })
            .then(data => {
                loadingElement.style.display = 'none';
                if (data && data.data && data.data.length > 0) {
                    data.data.forEach(anime => {
                        const animeCard = createTrendingAnimeCard(anime);
                        trendingGrid.appendChild(animeCard);
                    });
                } else {
                    errorElement.textContent = 'No trending anime found or API error.';
                    errorElement.style.display = 'block';
                }
            })
            .catch(error => {
                loadingElement.style.display = 'none';
                console.error('Error fetching trending anime:', error);
                let errorMessage = 'Failed to fetch trending anime. Please try again later.';
                if (error && error.message) { // Jikan API often returns error messages
                    errorMessage = `API Error: ${error.message} (Status: ${error.status || 'N/A'})`;
                } else if (typeof error === 'string') {
                    errorMessage = error;
                }
                errorElement.textContent = errorMessage;
                errorElement.style.display = 'block';
            });
    }

    // Initial fetch
    fetchTrendingAnime();

    // Initialize UI components
    if (typeof UI !== 'undefined') {
        if (typeof UI.initScrollToTopButton === 'function') {
            UI.initScrollToTopButton();
        }
        if (typeof UI.initNavigationFeedback === 'function') {
            UI.initNavigationFeedback();
        }
    }
});
