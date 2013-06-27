define('de.solygen/rss-ebay-kleinanzeigen/navigation',
        ['de.solygen/rss-ebay-kleinanzeigen/config'],
        function (config) {

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
                        crawler.getData().done(function(data) {
                            view.displayfeed(data);
                            location.hash = '#data=refresh-done';
                        });

                    },
                    clear: function () {
                        console.log('empty');
                        cache.clear();
                        crawler.empty();
                        location.hash = '#data=clear-done'
                    }
                },
                url: {
                    set: function () {
                        console.log('set');
                        var urls = $(document.body).find('#urls').val() || '';
                        if (urls.length > 10)
                            config.setUrl(urls.split('\n'));
                        location.hash = '#url=set-done';
                        location.hash = '#data=refresh';
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