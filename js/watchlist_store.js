const WatchlistStore = (function() {
    const WATCHLIST_KEY = 'animeWatchlist';

    // Helper to get the watchlist from LocalStorage
    function getWatchlistInternal() {
        const watchlistJSON = localStorage.getItem(WATCHLIST_KEY);
        return watchlistJSON ? JSON.parse(watchlistJSON) : [];
    }

    // Helper to save the watchlist to LocalStorage
    function saveWatchlistInternal(watchlist) {
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    }

    return {
        /**
         * Retrieves the entire watchlist.
         * @returns {Array<Object>} An array of watchlist item objects.
         */
        getWatchlist: function() {
            return getWatchlistInternal();
        },

        /**
         * Adds an item to the watchlist.
         * Checks for duplicates based on item.id before adding.
         * @param {Object} itemObject - The item to add. Must have an 'id' property.
         * @returns {boolean} True if added, false if it was already there.
         */
        addItem: function(itemObject) {
            if (!itemObject || typeof itemObject.id === 'undefined') {
                console.error('Item object must have an id to be added to watchlist.');
                return false;
            }
            const watchlist = getWatchlistInternal();
            if (!watchlist.some(item => item.id === itemObject.id)) {
                watchlist.push(itemObject);
                saveWatchlistInternal(watchlist);
                return true;
            }
            return false; // Already exists
        },

        /**
         * Removes an item from the watchlist by its id.
         * @param {string} itemId - The id of the item to remove.
         * @returns {boolean} True if removed, false if not found.
         */
        removeItem: function(itemId) {
            let watchlist = getWatchlistInternal();
            const initialLength = watchlist.length;
            watchlist = watchlist.filter(item => item.id !== itemId);
            if (watchlist.length < initialLength) {
                saveWatchlistInternal(watchlist);
                return true;
            }
            return false; // Not found
        },

        /**
         * Checks if an item is already in the watchlist by its id.
         * @param {string} itemId - The id of the item to check.
         * @returns {boolean} True if the item is in the watchlist, false otherwise.
         */
        isInWatchlist: function(itemId) {
            const watchlist = getWatchlistInternal();
            return watchlist.some(item => item.id === itemId);
        },

        /**
         * Toggles an item's presence in the watchlist.
         * If it exists, it's removed. If it doesn't, it's added.
         * @param {Object} itemObject - The item to toggle. Must have an 'id' property.
         * @returns {string} 'added' or 'removed' or 'error'.
         */
        toggleItem: function(itemObject) {
            if (!itemObject || typeof itemObject.id === 'undefined') {
                console.error('Item object must have an id to be toggled in watchlist.');
                return 'error';
            }
            if (this.isInWatchlist(itemObject.id)) {
                this.removeItem(itemObject.id);
                return 'removed';
            } else {
                this.addItem(itemObject);
                return 'added';
            }
        }
    };
})();
