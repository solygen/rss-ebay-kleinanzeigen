define('de.solygen/rss-ebay-kleinanzeigen/navigation',
        function () {

    return function (crawler, view) {
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
                        crawler = crawlerFactory();
                        crawler.getData().done(function(data) {
                            view.displayfeed(data);
                        });

                    },
                    clear: function () {
                        console.log('empty');
                        crawler.empty();
                    }
                },
                url: {
                    set: function () {
                        console.log('set');
                        //fresh crawler
                        var url = encodeURI($(document.body).find('#url').val());
                        crawler = crawlerFactory();
                        crawler.empty();
                        config.url = url;
                        crawler.getData().done(function(data) {
                            view.displayfeed(data);
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
});