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

    function initDaysNav() {
        const daysNav = document.getElementById('days-nav');
        if (!daysNav) return;

        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date();
        const currentDayIndex = today.getDay(); // 0 is Sunday, 1 is Monday...

        // Find the most recent Monday as start of the week
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (currentDayIndex === 0 ? 6 : currentDayIndex - 1));

        daysNav.innerHTML = ''; // Clear existing

        for (let i = 0; i < 7; i++) {
            const dateForDay = new Date(startOfWeek);
            dateForDay.setDate(startOfWeek.getDate() + i);

            const btn = document.createElement('button');
            btn.className = 'day-btn';

            // Highlight today
            if (dateForDay.toDateString() === today.toDateString()) {
                btn.classList.add('active');
            }

            const dayName = daysOfWeek[dateForDay.getDay()];
            btn.textContent = dayName;

            btn.addEventListener('click', function() {
                // Remove active class from all
                document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
                // Add active to clicked
                this.classList.add('active');

                fetchScheduleForDate(dateForDay);
            });

            daysNav.appendChild(btn);
        }
    }

    function fetchScheduleForDate(targetDate) {
        showLoading();

        // Update subtitle to reflect selected day
        const subtitle = document.querySelector('.subtitle');
        if (subtitle) {
            const isToday = targetDate.toDateString() === new Date().toDateString();
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            subtitle.textContent = isToday ? "Anime episodes airing today" : `Anime episodes airing on ${daysOfWeek[targetDate.getDay()]}`;
        }

        // Get start and end of target day in seconds for AniList
        const startOfDay = Math.floor(new Date(targetDate).setHours(0, 0, 0, 0) / 1000);
        const endOfDay = Math.floor(new Date(targetDate).setHours(23, 59, 59, 999) / 1000);

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
                showError("No anime episodes scheduled for this day.");
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
                const episode = this.getAttribute('data-episode');

                // Improve search for long titles by removing special chars and taking only the first 3 words
                // 1. Remove special characters that often mess up torrent searches
                let cleanTitle = title.replace(/[:\-.,!?()\[\]]/g, ' ').trim();
                // 2. Replace multiple spaces with a single space
                cleanTitle = cleanTitle.replace(/\s+/g, ' ');
                // 3. Take up to the first 3 words
                const words = cleanTitle.split(' ');
                if (words.length > 3) {
                    cleanTitle = words.slice(0, 3).join(' ');
                }

                const formattedEpisode = String(episode).padStart(2, '0');
                const searchQuery = `${cleanTitle} ${formattedEpisode}`;

                // Redirect to index with search query
                window.location.href = `index.html?search=${encodeURIComponent(searchQuery)}`;
            });
        });
    }

    // Initialize days nav and initial fetch
    initDaysNav();
    fetchScheduleForDate(new Date()); // Default to today
});
