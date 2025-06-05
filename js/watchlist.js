document.addEventListener('DOMContentLoaded', function() {
    const watchlistGrid = document.getElementById('watchlist-grid');
    const watchlistEmptyState = document.getElementById('watchlist-empty-state');

    function displayWatchlistItems() {
        if (!watchlistGrid || !watchlistEmptyState) {
            console.error('Watchlist grid or empty state element not found.');
            return;
        }

        // Clear previous items
        watchlistGrid.innerHTML = '';

        const watchlist = WatchlistStore.getWatchlist();

        if (watchlist.length === 0) {
            watchlistEmptyState.style.display = 'flex'; // Or 'block' if CSS for empty-state-content is not flex
            // Ensure empty-state-content is used for flex layout if outer is block
            const emptyStateContent = watchlistEmptyState.querySelector('.empty-state-content');
            if(emptyStateContent) watchlistEmptyState.style.display = 'block'; // Show parent
            else watchlistEmptyState.style.display = 'flex';


        } else {
            watchlistEmptyState.style.display = 'none';
            watchlist.forEach(item => {
                // Ensure item has necessary fields for createResultCard, adapt if necessary
                // WatchlistStore saves the itemObject as created in cards.js event handler
                // which includes 'nombre' for title, 'enlaceMagnet' for id, etc.
                // The 'item.nombre' is used by createResultCard for title display and data-title.
                // 'item.enlaceMagnet' is used for data-id.
                const card = CardBuilder.createResultCard(item);
                watchlistGrid.appendChild(card);
            });

            // Initialize event listeners for the newly created cards (including watchlist toggle)
            // This is important if CardBuilder.init is where the .watchlist-btn logic is.
            if (typeof CardBuilder !== 'undefined' && typeof CardBuilder.init === 'function') {
                CardBuilder.init(watchlistGrid);
            }
        }
    }

    // Delegated event listener for items removed via the toggle button
    if (watchlistGrid) {
        watchlistGrid.addEventListener('click', function(event) {
            const target = event.target;
            const watchlistButton = target.closest('.watchlist-btn');

            if (watchlistButton) {
                // The button's own event handler (from CardBuilder.init) will toggle the store
                // We need to check its state *after* that toggle might have occurred
                // A slight delay to ensure the class has been updated by CardBuilder.init's logic
                setTimeout(() => {
                    if (!watchlistButton.classList.contains('in-watchlist')) {
                        // If it's no longer 'in-watchlist', it means it was removed
                        const cardToRemove = watchlistButton.closest('.result-card');
                        if (cardToRemove) {
                            cardToRemove.remove();
                            // Check if watchlist is now empty
                            if (WatchlistStore.getWatchlist().length === 0) {
                                watchlistEmptyState.style.display = 'flex'; // Or 'block'
                                const emptyStateContent = watchlistEmptyState.querySelector('.empty-state-content');
                                if(emptyStateContent) watchlistEmptyState.style.display = 'block';
                                else watchlistEmptyState.style.display = 'flex';
                            }
                        }
                    }
                }, 50); // Small delay to allow other event handler to finish
            }
        });
    }

    // Initial display
    if (typeof WatchlistStore !== 'undefined' && typeof CardBuilder !== 'undefined') {
        displayWatchlistItems();
    } else {
        console.error('WatchlistStore or CardBuilder is not available.');
    }

    // Initialize UI components like scroll-to-top, if UI module is loaded and function exists
    if (typeof UI !== 'undefined') {
        if (typeof UI.initScrollToTopButton === 'function') {
            UI.initScrollToTopButton();
        }
        if (typeof UI.initNavigationFeedback === 'function') {
            // This might need adjustment if the selectors in initNavigationFeedback are too specific
            // to index.html and anichart.html original button structures.
            // For now, calling it to see if it works or needs refinement.
            UI.initNavigationFeedback();
        }
    }
});
