require(['de.solygen/rss-ebay-kleinanzeigen/config',
         'de.solygen/rss-ebay-kleinanzeigen/factories/crawler',
         'de.solygen/rss-ebay-kleinanzeigen/factories/view',
         'de.solygen/rss-ebay-kleinanzeigen/navigation'
         ], function (config, crawlerFactory, viewFactory, navigation) {

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
    window.onhashchange = navigation(crawler, view);

    window.onload = function() {
        //initial
        crawler.empty();
        refresh()
        //call every minute
        setInterval(refresh, MINUTE/1);
    }
});