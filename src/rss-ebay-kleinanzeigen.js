
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
    app = de.solygen['rss-ebay-kleinanzeigen'];

app.util = {

    //split url string
    split: function (url) {
        var base = url.split('?'),
            params = base[1].split('&'),
            data = { params: {} };

        data.base = base[0];
        _.each(params, function (param) {
            var tmp = param.split('=');
            data.params[tmp[0]] = tmp[1];
        })

        data.toString = function () {
            debugger;
        }

        return data;
    }

};

//factories
app.factories = {
    //wraper for google loader: /https://developers.google.com/feed/
    api: function () {

        'use strict';

        //vars
        var self = {},
            api = {},
            feed,
            url = '',
            span = '';

        //asynchron, deferred
        var getApi = function () {
            var def = new $.Deferred();
            if (api.feed) {
                def.resolve(api);
            }
            else {
                google.load('feeds','1', {
                    callback: function () {
                            api = google;
                            def.resolve(api);
                        }
                    });
            }
            return def.promise();
        };

        //asynchron, deferred
        var getFeed = function () {
            var def = new $.Deferred();
            if (feed) {
                def.resolve(feed);
            }
            else {
                getApi().then(function (api) {
                    feed = new api.feeds.Feed(self.getUrl());
                    feed.setNumEntries(50);
                    console.log(self.getUrl());
                    def.resolve(feed);
                });
            }
            return def.promise();
        };

        //init
        return (function (url) {

            //set property
            self.setUrl = function (value) {
                //add timestamp to force refresh
                url = value + '&timestamp=' + Math.round(new Date().getTime() / 1000);
                self.resetFeed();
                return self;
            };

            //set span property
            self.setPriceSpan = function (min, max) {
                min = min || 0;
                max = max || 100;
                span = '&minPrice=' + min + '&maxPrice=' + max;
                self.resetFeed();
                return self;
            };

            //force refresh feed
            self.resetFeed = function () {
                feed = undefined;
                return self;
            };

            //get property
            self.getUrl = function() {
                return url + span;
            };

            //load data
            self.load = function () {
                var def = new $.Deferred(),
                    cont = function(result) {
                        if (!result.error)
                            def.resolve(app.parser.parse(result.feed.entries));
                        else
                            def.resolve([]);
                            //def.reject(result.error);
                    };
                getFeed().then(function (feed) {
                    feed.load(cont);
                });
                return def.promise();
            };

            self.setUrl(url || 'http://kleinanzeigen.ebay.de/anzeigen/s-feed.rss?adType=OFFER&categoryId=88&locationId=1528&radius=50.0');

            return self;
        })();
    },


    parser: function () {
        var self = {},
            hash = {},
            ignored = {};


            self.parse = function (data) {
                _.each(data, function (item) {
                    var content = $(item.content);
                    item.text = $(content.find('td')[1]).last().text().trim();
                    item.price = content.find('[color="#ff8300"]').text().replace('Preis', '').trim();
                    item.city = content.find('td').last().text().trim();
                    item.image = content.find('img')
                                 .attr('src')
                                 .replace('http://kleinanzeigen.ebay.de/static/img/imageplaceholder.png', '')
                                 .replace('48_14', '48_72');
                    item.article = _.last(item.link.split('/')).split('-')[0];
                    item.id = /*Math.round(new Date(item.publishedDate).getTime() / 1000)* +*/ item.article;
                });
                return data
            };



        return self;
    },

    crawler: function () {
        var self = {},
            pmin,
            pmax,
            pstep,
            data,
            ignored;

        var getChunk = function (span) {
                var api = app.factories.api();
                api.setPriceSpan(span.min, span.max);
                return api.load().then(function (parsed) {
                    return parsed;
                },
                function (parsed) {
                    return parsed;
                });
            },
            next = function () {
                var max = pmin + pstep;
                pmin = max;
                return max <= pmax ? {min: pmin, max: max } : false;
            },
            crawl = function () {
                var defs = [];
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
        return (function (min, max, step) {
            // set vars
            pmin = min || 0;
            pmax = max || 100;
            pstep = pstep || 1;
            data = JSON.parse(localStorage.getItem('data') || JSON.stringify([]));


            self.empty = function () {
                data = [];
                localStorage.setItem('data', JSON.stringify([]));
                localStorage.removeItem('data');
                localStorage.setItem('ignored', JSON.stringify({}));
                localStorage.removeItem('ignored');
            };

            self.reset = function () {
                pmin = min || 0;
                pmax = max || 2;
                pstep = pstep || 1;
                self.empty();
            };

            self.getData = function () {
                self.restoreData();
                //return data.length === 0 ? crawl() : $.Deferred().resolve(data);
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

            return self;
        })();;
    },

    view: function () {
        var self = {},
            list = [],
            blacklist = ['garnitur', 'Schrankwand', 'Anbauwand', 'sofa', 'couch', 'Schaukelstuhl', 'Tv Schrank', 'Tv reck', 'Glastisch', 'Wohnzimmertisch', 'Fernseh', 'TV Bank', 'Wohnzimmerschrank', 'SITZGRUPPE', 'Bistrotisch', 'Schuhschrank', 'Wandspiegel', 'teewagen', 'Vitrinentür', 'Beistelltisch', 'TV Tisch', 'Wohnzimmer Tisch', 'Tischstehlampe', 'Kaminbesteck', 'parkett', 'Polsterecke', 'Ledergarnitur', 'sessel', 'TV-Rack', 'Wohnwand', 'Nussbaum', 'Sitzecke', 'Marmor', 'rollcontainer', 'Garderobenständer', 'Teppich', 'Kleiderständer', 'TV-Bank', 'hifi', 'TV-schrank', 'bioethanol', 'ferhnsehschrank', 'Sitzsack', 'Glasvitrine', 'Phonoschrank', 'Schlafliege', 'CD-Ständer', 'Hängeschrank', 'Rattan', 'dvd', 'Wetterstation', 'Vorwerk', 'Phono', 'TV ', 'TV-', 'kissen', 'CD-Regal',
                'marmor'];

        self.getNode = function () {
            return $('<div class="media"><a class="pull-left" href="#" style="width: 128px; height: 128px;"><div class="image"><h3><span></span></h3></div></a><div class="media-body"><h4 class="media-heading"></h4></div></div>');
        };

        self.displayfeed = function (data) {
            var counter = 0, counts;
            var list = [];
            //disable blacklist
            //blacklist = [];


            //update hidden/blacklist flag
            _.each(data, function (item) {
                item.hidden = app.crawler.isIgnored(item.id) || false;
                _.each(blacklist, function (word) {
                    if (item.title.toLowerCase().indexOf(word.toLowerCase()) >= 0) {
                        item.hidden = true;
                    }
                })
                list.push(item);
            });

            //statistics
            var counts = _.groupBy(list, function(item) {
                return item.hidden;
            });

            $(document.body).empty();
            $(document.body).append('<h2>ebay Kleinanzeigen: ' + counts.false.length + ' (' + (counts.false.length + counts.true.length) + ')' + '</h2>');

            //sort
            list = _.sortBy(list, function(item) {
                return item.article * (-1)
            });


            //draw
            _.each(list, function (item) {
                if (!item.hidden) {
                    counter++;
                    var node = app.view.getNode();

                    node.find('a').attr('href', item.link);
                    node.find('.image').prepend('<img src="' + item.image +  '">');

                    node.find('span').text(item.price);
                    node.find('h4').text(counter + ' | ' + item.title);
                    var del = $('<div>XXXXX</div>')
                                .click( function (e) {
                                    app.crawler.ignore(item.id);
                                    $(this).parent().parent().hide();
                                    e.stopPropagation();
                                });
                    node.find('.media-body')
                        .append(item.text)
                        .append('<br>')
                        .append(item.city)
                        .append(del);
                    node.attr('id', item.id)
                    $(document.body).append(node);
                }
            });
        };

        return self;
    }
}

//init modules
$.extend(
    app,
    {
        view: app.factories.view(),
        crawler: app.factories.crawler(),
        parser: app.factories.parser()

    }
);


(function init() {

    var prices = [{min: 0, max: 5}],
        SECOND = 1000,
        MINUTE = SECOND * 60;

    window.onload = function() {
        var MINUTE = 60000,
            counter = prices.length -1;

        //app.crawler.empty();

        app.crawler.getData().done(function(data) {
            app.view.displayfeed(data);
        });

        //call every minute
        setInterval(function () {
            app.crawler.getData().done(function(data) {
                app.view.displayfeed(data);
            });
        }, MINUTE/4);
    }
})();
