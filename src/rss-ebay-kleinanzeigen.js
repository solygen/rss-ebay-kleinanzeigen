
/* app*/

require(['de.solygen/rss-ebay-kleinanzeigen/config',
         'de.solygen/rss-ebay-kleinanzeigen/factories/crawler',
         'de.solygen/rss-ebay-kleinanzeigen/factories/view'], function (config, crawlerFactory, viewFactory) {

    //register namespace
    var de = $.extend(
            de || {},
            {
                solygen: {
                    'rss-ebay-kleinanzeigen': {
                        id: 'de.solygen.rss-ebay-kleinanzeigen'
                    }
                }
            }
        ),
        app = de.solygen['rss-ebay-kleinanzeigen'] = {
            config: config
        };

    app.crawler = crawlerFactory();
    app.view = viewFactory(app.crawler);

    //init timer
    (function init() {

        'use strict';

        var SECOND = 1000,
            MINUTE = SECOND * 60;

        window.onload = function() {
            var MINUTE = 60000;

            app.crawler.empty();

            app.crawler.getData().done(function(data) {
                app.view.displayfeed(data);
            });

            //call every minute
            setInterval(function () {
                app.crawler.getData().done(function(data) {
                    app.view.displayfeed(data);
                });
            }, MINUTE/1);
        }


        var navigate = function () {
            if (location.hash.substr(0, 1) === '#' && location.hash.length > 1) {
                var parts = location.hash.substr(1).split('&'), args = {};

                _.each(parts, function (part) {
                    var list = part.split('=');
                    args[list[0]] = decodeURI(list[1]);

                });


                var action = {
                    data: {
                        refresh: function () {
                            console.log('refresh');
                            //fresh crawler
                            app.crawler = crawlerFactory();
                            app.crawler.getData().done(function(data) {
                                app.view.displayfeed(data);
                            });

                        },
                        clear: function () {
                            console.log('empty');
                            app.crawler.empty();
                        }
                    },
                    url: {
                        set: function () {
                            console.log('set');
                            //fresh crawler
                            var url = encodeURI($(document.body).find('#url').val());
                            app.crawler = crawlerFactory();
                            app.crawler.empty();
                            app.config.url = url;
                            app.crawler.getData().done(function(data) {
                                app.view.displayfeed(data);
                            });
                            location.hash = '#url=done';
                        }

                    }

                };
                _.each(args, function (value, key) {
                    if (_.isFunction(action[key][value]))
                        action[key][value]();
                    else if (_.isFunction(action[key]))
                        action[key](value);
                });
            }
        };
        window.onhashchange = navigate;


    })();
});
