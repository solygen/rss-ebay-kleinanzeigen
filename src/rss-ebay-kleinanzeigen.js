require(['de.solygen/rss-ebay-kleinanzeigen/config',
         'de.solygen/rss-ebay-kleinanzeigen/factories/crawler',
         'de.solygen/rss-ebay-kleinanzeigen/factories/view',
         'de.solygen/rss-ebay-kleinanzeigen/navigation',
         'de.solygen/rss-ebay-kleinanzeigen/cache'
         ], function (config, crawlerFactory, viewFactory, navigation, cache) {

    'use strict';

    var crawler = crawlerFactory(),
        view = viewFactory(crawler),
        SECOND = 1000,
        MINUTE = SECOND * 60,
        //refresh data and update view
        refresh = function () {
            crawler.getData().done(function(data) {
                view.displayfeed(data);
            });
        };

    //register navigation
    $(function(){

      // Bind the event.
      $(window).on('hashchange', function() {
        // Alerts every time the hash changes!
        navigation(crawler, view);
        //alert( location.hash);
      });

      // Trigger the event (useful on page load).
      $(window).trigger('hashchange');

    });

    window.onload = function() {
        //initial
        crawler.empty();
        refresh()
        //call every minute
        setInterval(refresh, MINUTE/1);
    }
});