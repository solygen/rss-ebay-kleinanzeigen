//wraper for google loader: /https://developers.google.com/feed/
define('de.solygen/rss-ebay-kleinanzeigen/factories/api',
        function () {

    'use strict';

    return function (url, min, max) {

        //vars
        var self = {},
            instance = {
                api: $.Deferred(),
                feed: $.Deferred(),
                url: ''
            };

        var parse = function (data) {
                _.each(data, function (item) {
                    var content = $(item.content);
                    item.class = 'default';
                    item.id = _.last(item.link.split('/')).split('-')[0];
                    item.text = $(content.find('td')[1]).last().text().trim();
                    item.price = content.find('[color="#ff8300"]').text().replace('Preis', '').trim();
                    item.city = content.find('td').last().text().trim();
                    item.image = content.find('img')
                                 .attr('src')
                                 .replace('http://kleinanzeigen.ebay.de/static/img/imageplaceholder.png', '')
                                 .replace('48_14', '48_55');
                    if (item.image === '') {
                        item.image = 'http://sektundbrezel.de/wp-content/themes/suburbia/images/default-thumbnail.jpg';
                    }
                    delete item.content;
                });
                return data;
            },

            //asynchron, deferred
            initApi = function () {
                window.google.load('feeds', '1', {
                    callback: function () {
                            instance.api.resolve(google);
                        }
                    });
            },

            //asynchron, deferred
            initFeed = function (value, min, max) {
                min = min ? '&minPrice=' + min : '';
                max = max ? '&maxPrice=' + max : '';
                var url = value + min + max + '&timestamp=' + Math.round(new Date().getTime() / 1000);
                instance.api.then(function (api) {
                    var f = new api.feeds.Feed(url);
                    f.setNumEntries(50);
                    instance.feed.resolve(f);
                });
            },

            init = function (url, min, max) {
                initApi();
                initFeed(url || app.config.url, min, max);

                //get property
                self.getUrl = function() {
                    return instance.url;
                };

                //get property
                self.getId = function() {
                    return id;
                };

                //load data
                self.load = function () {
                    var def = new $.Deferred(),
                        cont = function(result) {
                            if (!result.error) {
                                def.resolve(parse(result.feed.entries));

                            }
                            else
                                def.resolve([]);
                                //def.reject(result.error);
                        };
                    instance.feed.then(function (f) {
                        f.load(cont);
                    });
                    return def.promise();
                };
            };

        init(url, min, max);
        return self;
    }
});