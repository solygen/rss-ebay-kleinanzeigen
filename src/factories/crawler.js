define( 'de.solygen/rss-ebay-kleinanzeigen/factories/crawler',
       ['de.solygen/rss-ebay-kleinanzeigen/factories/api',
        'de.solygen/rss-ebay-kleinanzeigen/cache',
        'de.solygen/rss-ebay-kleinanzeigen/config'], function (apiFactory, cache, config) {

    'use strict';

    return function (min, max, step) {


        var self = {},
            pmin,
            pmax,
            pstep,
            data,
            ignored;

        var getChunk = function (span) {
                var api,
                    defs = _.map([].concat(config.getUrl()), function (url) {
                        api = apiFactory(url, span.min, span.max);
                        return api.load().then(function (parsed) {
                                return parsed;
                            },
                            function (parsed) {
                                console.error('ERROR 01')
                                return parsed;
                            }
                        );
                    });
                return $.when.apply(null, defs);
            },

            next = function () {
                var max = pmin + pstep;
                pmin = max;
                return max <= pmax ? {min: pmin, max: max } : false;
            },

            crawl = function () {
                var defs = [], span;
                //add def for each called price span
                while (span = next()) {
                    defs.push(getChunk(span));
                }
                //reset span
                self.resetSpan();
                //when all finished set data
                return $.when.apply(null, defs).then(function () {
                    var hash = {}, tmp = [];

                    //union
                    data = (data || []).concat(_.flatten(arguments));

                    _.each(data, function (item) {
                        if (!hash[item.id]) {
                            tmp.push(item);
                            hash[item.id] = true;
                        }
                    });
                    data = tmp;
                    self.storeData();
                    return data;
                });
            };

        //init
        var init = function (min, max, step) {
            // set vars
            pmin = min = min || 0;
            pmax = max = max || 60;
            pstep = pstep || 1;
            data = cache.get('data') || [];


            self.empty = function () {
                data = [];
                cache.set('data', []);
                cache.remove('data');
            };

            self.reset = function () {
                self.resetSpan();
                pstep = pstep || 1;
                self.empty();
            };

            self.resetSpan = function () {
                pmin = min;
                pmax = max;
            };

            self.getData = function () {
                self.restoreData();
                return crawl();
            }

            self.storeData = function () {
                cache.set('data', data);
                cache.set('ignored', ignored);
            }

            self.restoreData = function () {
                //remove duplicates with hash
                data = cache.get('data') || [];
                ignored = cache.get('ignored') || {};
            }

            self.ignore = function (id) {
                ignored = ignored || {};
                ignored[id] = true;
                self.storeData();
            }

            self.isIgnored = function (id) {
                return ignored[id] || false;
            }
        };

        init(min, max, step);
        return self;
    };
});