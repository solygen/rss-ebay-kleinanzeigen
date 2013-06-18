define( 'de.solygen/rss-ebay-kleinanzeigen/factories/crawler',
       ['de.solygen/rss-ebay-kleinanzeigen/factories/api',
        'de.solygen/rss-ebay-kleinanzeigen/config'], function (apiFactory, config) {

    return function (min, max, step) {

            'use strict';

            var self = {},
                pmin,
                pmax,
                pstep,
                data,
                ignored;

            var getChunk = function (span) {
                    var api = apiFactory(config.url, span.min, span.max);
                    return api.load().then(function (parsed) {
                            return parsed;
                        },
                        function (parsed) {
                            console.error('ERROR 01')
                            return parsed;
                        }
                    );
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
                pmin = min || 0;
                pmax = max || 60;
                pstep = pstep || 1;
                data = JSON.parse(localStorage.getItem('data') || JSON.stringify([]));


                self.empty = function () {
                    data = [];
                    localStorage.setItem('data', JSON.stringify([]));
                    localStorage.removeItem('data');
                    //localStorage.setItem('ignored', JSON.stringify({}));
                    //localStorage.removeItem('ignored');
                };

                self.reset = function () {
                    pmin = min || 0;
                    pmax = max || 2;
                    pstep = pstep || 1;
                    self.empty();
                };

                self.getData = function () {
                    self.restoreData();
                    return crawl();
                }

                self.storeData = function () {
                    localStorage.setItem('data', JSON.stringify(data));
                    localStorage.setItem('ignored', JSON.stringify(ignored));
                }

                self.restoreData = function () {
                    //remove duplicates with hash
                    data = JSON.parse(localStorage.getItem('data') || JSON.stringify([]));
                    ignored = JSON.parse(localStorage.getItem('ignored') || JSON.stringify({}));
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
