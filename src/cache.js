define('de.solygen/rss-ebay-kleinanzeigen/cache',
        function () {

    'use strict';

    return {

        set: function (key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },

        get: function (key) {
            return JSON.parse(localStorage.getItem(key));
        },

        remove: function (key) {
            localStorage.removeItem(key);
        },

        clear: function () {
            localStorage.clear();
        },

        keys: function () {
            var keys = [];
            for (i=0; i<=localStorage.length-1; i++) {
                keys.push(localStorage.key(i));
            }
            return keys;
        }
    }
});