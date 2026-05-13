document.addEventListener('DOMContentLoaded', function() {
    const scheduleContainer = document.getElementById('schedule-container');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');

    // Initialize UI components from other scripts
    if (UI && typeof UI.initScrollToTopButton === 'function') {
        UI.initScrollToTopButton();
    }

    if (UI && typeof UI.initNavigationFeedback === 'function') {
        UI.initNavigationFeedback();
    }

    if (UI && typeof UI.initHamburgerMenu === 'function') {
        UI.initHamburgerMenu();
    }

    function showLoading() {
        loadingElement.style.display = 'block';
        scheduleContainer.style.display = 'none';
        errorElement.style.display = 'none';
    }

    function hideLoading() {
        loadingElement.style.display = 'none';
        scheduleContainer.style.display = 'grid';
    }

    function showError(message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        loadingElement.style.display = 'none';
        scheduleContainer.style.display = 'none';
    }

    function fetchTodaySchedule() {
        showLoading();

        // Get start and end of current day in seconds for AniList
        const startOfDay = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
        const endOfDay = Math.floor(new Date().setHours(23, 59, 59, 999) / 1000);

        const query = `
        query ($page: Int, $start: Int, $end: Int) {
          Page(page: $page, perPage: 50) {
            airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
              id
              episode
              airingAt
              media {
                title {
                  romaji
                  english
                }
                coverImage {
                  large
                }
              }
            }
          }
        }
        `;

        const variables = {
            page: 1,
            start: startOfDay,
            end: endOfDay
        };

        fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            const schedules = data.data.Page.airingSchedules;

            if (!schedules || schedules.length === 0) {
                showError("No anime episodes scheduled for today.");
                return;
            }

            renderScheduleCards(schedules);
        })
        .catch(error => {
            console.error('Error fetching schedule:', error);
            showError("Failed to fetch schedule data from AniList. Please try again later.");
        });
    }

    function renderScheduleCards(schedules) {
        scheduleContainer.innerHTML = '';

        schedules.forEach(schedule => {
            const media = schedule.media;
            const title = media.title.romaji || media.title.english || "Unknown Title";
            const imageUrl = media.coverImage.large;
            const episode = schedule.episode;

            const card = document.createElement('div');
            card.className = 'schedule-card';

            card.innerHTML = `
                <div class="schedule-img-container">
                    <img src="${imageUrl}" alt="${title}" loading="lazy">
                </div>
                <div class="schedule-info">
                    <div>
                        <div class="schedule-title" title="${title}">${title}</div>
                        <div class="schedule-episode">Episode ${episode}</div>
                    </div>
                    <button class="search-torrent-btn" data-title="${title}" data-episode="${episode}">
                        Search Torrents
                    </button>
                </div>
            `;

            scheduleContainer.appendChild(card);
        });

        // Add event listeners to buttons
        const searchBtns = document.querySelectorAll('.search-torrent-btn');
        searchBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const title = this.getAttribute('data-title');
                // Clean title if it contains numbers/season info to improve search or just pass title + ep
                // For better results often we might just want the title, maybe formatted differently.
                // We will just pass the title and episode number.
                const searchQuery = `${title} ${String(this.getAttribute('data-episode')).padStart(2, '0')}`;

                // Redirect to index with search query
                window.location.href = `index.html?search=${encodeURIComponent(searchQuery)}`;
            });
        });
    }

    // Initialize fetch
    fetchTodaySchedule();
});
