define('de.solygen/rss-ebay-kleinanzeigen/config',
        function () {

    return {
        url: 'http://kleinanzeigen.ebay.de/anzeigen/s-feed.rss?adType=OFFER&categoryId=17&locationId=1528&radius=20.0',
        blacklist: ['garnitur', 'schrankwand', 'anbauwand', 'sofa', 'couch', 'schaukelstuhl', 'glastisch', 'wohnzimmertisch', 'fernseh', 'wohnzimmerschrank', 'sitzgruppe', 'bistrotisch', 'schuhschrank', 'wandspiegel', 'teewagen', 'vitrinentür', 'beistelltisch', 'wohnzimmer tisch', 'tischstehlampe', 'kaminbesteck', 'parkett', 'polsterecke', 'ledergarnitur', 'sessel', 'tv-rack', 'wohnwand', 'nussbaum', 'sitzecke', 'marmor', 'rollcontainer', 'garderobenständer', 'teppich', 'kleiderständer', 'tv-bank', 'hifi', 'bioethanol', 'ferhnsehschrank', 'sitzsack', 'glasvitrine', 'phonoschrank', 'schlafliege', 'cd-', 'hängeschrank', 'rattan', 'dvd', 'wetterstation', 'vorwerk', 'phono', 'tv ', 'tv-', 'kissen', 'cd-regal', 'marmor', 'hocker', 'gardine', 'sitzer', 'kamin', 'ofen', 'esstisch', 'bild', 'telefontisch', 'bett', 'brennholz', 'schuh', 'sandale', 'Lauflern', 'rutsche', 'stiefel', 'Schleich', 'playmobil', 'Maxicosi',
            'hose', 'kleid', 'jacke', 'SchlafAnzug', 'pulli', 'rock', 'body', 'short', 'Shirt', 'jeans', 'kappe', 'mütze', 'Maxi Cosi', 'kinderwagen', 'buggy', 'Hochstuhl', 'stubenwagen', 'Babyschaukel', 'Maxi- Cosi', 'Sportwagen', 'Maxi-Cosi', 'Kindersitz', 'babyschale'],
        categories: {
            kleidung: ['hose', 'kleid', 'jacke', 'schuhe', 'schlafanzug']
        },
        tags: {
            'maxicosi': 'Maxi- Cosi,maxicosi,maxi cosi',
            'kinderwagen': 'kinderwagen,buggy,sportwagen'
        }
    }
});

//wraper for google loader: /https://developers.google.com/feed/
define('de.solygen/rss-ebay-kleinanzeigen/factories/api',
        function () {

    return function (url, min, max) {

        'use strict';

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

define('de.solygen/rss-ebay-kleinanzeigen/factories/view',
       ['de.solygen/rss-ebay-kleinanzeigen/config'], function (config) {

    return function (crawler) {

        'use strict';

        var self = {},
            list = [];

        self.getNode = function () {
            return $('<div class="media" style="width: 480px;float:left; margin-right: 20px; padding: 14px; box-shadow: 0px 2px 30px 0px #cccccc"><a class="pull-left" href="#"><div class="image"><h3><span></span></h3></div></a><div class="media-body"><h4 class="media-heading"></h4></div></div>');
        };

        self.displayfeed = function (data) {
            var counter = 0, counts, node, list = [], filtered = {},
                content = $(document.body).find('#content').empty();

            //update hidden/blacklist flag
            _.each(data, function (item) {
                item.hidden = crawler.isIgnored(item.id) || false;
                if (item.hidden) {
                    filtered.ignored = filtered.ignored + 1 || 1;
                    item.class = 'ignored'
                } else {
                    //filter via blacklist
                    _.each(config.blacklist || [], function (word) {
                        if (item.title.toLowerCase().indexOf(word.toLowerCase()) >= 0) {
                            filtered[word.toLowerCase()] = filtered[word.toLowerCase()] + 1 || 1;
                            item.hidden = true;
                            item.class = word.toLowerCase();
                        }
                    })
                    if (!item.hidden) {
                        filtered.default = filtered.default + 1 || 1;
                        item.class = 'default';
                    }


                }
                list.push(item);
            });

            //output filtercount
            var filtered = _.map(filtered, function (item, key) {
                return key + ': ' + item;
            });
            filtered = _.sortBy(filtered, function (line) {
                return (-1) * line.split(':')[1];
            });
            filtered = _.map(filtered, function (item) {
                var node = $('<div class="btn btn-small btn-info" style="margin: 3px">' + item + '</div>');
                node.click(function (e) {
                    var label = $(this).data('class');
                    $(document.body).find('.' + label)
                        .toggle();
                    $(this).toggleClass('active');
                })
                node.data('class', item.split(':')[0]);
                if (item.split(':')[0] === 'default')
                    node.addClass('active');
                return node;
            });
            var alert = $('<div class="alert alert-info" style="float: left"><button type="button" class="close" data-dismiss="alert">&times;</button><h4>Filtered</h4><span></span></div><div style="clear: left"></div>');

            alert.find('span').append(filtered);
            content.prepend(alert);


            //statistics
            var counts = _.groupBy(list, function(item) {
                return item.hidden;
            });
            counts = $.extend({false: [], true: []}, counts);
            $(document.body).find('#displayed').removeClass('hidden').find('span').text(counts.false.length + ' of ' + (counts.true.length + counts.false.length));
            $(document.body).find('#filter').removeClass('hidden').find('span').text(counts.false.length + ' of ' + (counts.true.length + counts.false.length));


            //sort
            list = _.sortBy(list, function(item) {
                return item.id * (-1)
            });


            //draw
            _.each(list, function (item) {
                    counter++;
                    var node = self.getNode();
                    node.addClass(item.class);

                    node.find('a').attr('href', item.link);
                    //node.find('.image').css('background-image', item.image);
                    node.find('.image').css('backgroundImage', 'url("' + item.image + '")');

                    node.find('span').text(item.price);
                    node.find('h4').text(counter + ' | ' + item.title);
                    var del = $('<div>XXXXX</div>')
                                .click( function (e) {
                                    crawler.ignore(item.id);
                                    $(this).parent().parent().hide().data('class', 'ignored');

                                    e.stopPropagation();
                                });
                    node.find('.media-body')
                        .append(item.text)
                        .append('<br>')
                        .append(item.city)
                        .append(del);
                    node.attr('id', item.id)
                    content.append(node);
                if (item.hidden) {
                    node.hide()
                        .css('backgroundColor', '#2f96b4');
                }
            });
        };

        return self;
    }
});

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


/* app*/

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
        refresh = function () {
            debugger;
            crawler.getData().done(function(data) {
                view.displayfeed(data);
            });
        };

    //register navigation
    window.onhashchange = navigation(crawler, view);

    window.onload = function() {
        //do not save
        crawler.empty();
        //initial
        refresh()
        //call every minute
        setInterval(refresh, MINUTE/15);
    }
});