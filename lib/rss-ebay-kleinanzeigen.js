define('de.solygen/rss-ebay-kleinanzeigen/cache',
        function () {

    'use strict';

    return {

        set: function (key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },

        get: function (key) {
            return JSON.parse(localStorage.getItem(key));
        },

        remove: function (key) {
            localStorage.removeItem(key);
        },

        clear: function () {
            localStorage.clear();
        },

        keys: function () {
            var keys = [];
            for (i=0; i<=localStorage.length-1; i++) {
                keys.push(localStorage.key(i));
            }
            return keys;
        }
    }
});
define('de.solygen/rss-ebay-kleinanzeigen/config',
        ['de.solygen/rss-ebay-kleinanzeigen/cache'], function (cache) {

    'use strict';

    var self = {},
        instance = {
            url: cache.get('url') ||  undefined,
            blacklist: cache.get('blacklist') || undefined
        };

    self.getUrl = function () {
        return instance.url;
    };

    self.setUrl = function (value) {
        instance.url = value;
        cache.set('url', instance.url)
        return self;
    };

    self.getBlacklist = function () {
        return instance.blacklist;
    };

    self.setBlacklist = function (value) {
        instance.blacklist = value;
        cache.set('blacklist', instance.blacklist)
        return self;
    };

    // var defaults = {
    //      url: ['http://kleinanzeigen.ebay.de/anzeigen/s-feed.rss?adType=OFFER&categoryId=17&locationId=1528&radius=21.0',
    //           'http://kleinanzeigen.ebay.de/anzeigen/s-feed.rss?keywords=sekret%C3%A4r&locationId=1529&radius=50.0',
    //           'http://kleinanzeigen.ebay.de/anzeigen/s-feed.rss?keywords=eintracht%20frankfurt%20trikot',
    //           'http://kleinanzeigen.ebay.de/anzeigen/s-feed.rss?categoryId=89&locationId=1529&radius=10.0'],
    //     blacklist: ['Paket', 'V-tech', 'Laufstall', 'kommunion', 'taufanzug', 'Avent', 'Bobbicar', 'Kugelbahn', 'Vtech', 'Pullunder', 'Sandkasten', 'schaukelpferd', 'Laufgitter', 'oberteil', 'schrankwand', 'anbauwand', 'schaukelstuhl', 'glastisch', 'wohnzimmertisch', 'fernseh', 'wohnzimmerschrank', 'sitzgruppe', 'bistrotisch', 'schuhschrank', 'wandspiegel', 'teewagen', 'vitrinentür', 'beistelltisch', 'wohnzimmer tisch', 'tischstehlampe', 'kaminbesteck', 'parkett', 'polsterecke', 'sessel', 'tv-rack', 'wohnwand', 'nussbaum', 'sitzecke', 'marmor', 'rollcontainer', 'garderobenständer', 'teppich', 'kleiderständer', 'tv-bank', 'hifi', 'bioethanol', 'ferhnsehschrank', 'sitzsack', 'glasvitrine', 'phonoschrank', 'schlafliege', 'cd-', 'hängeschrank', 'rattan', 'dvd', 'wetterstation', 'vorwerk', 'phono', 'tv ', 'tv-', 'kissen', 'cd-regal', 'marmor', 'hocker', 'gardine', 'sitzer', 'kamin', 'ofen', 'esstisch', 'bild', 'telefontisch', 'bett', 'brennholz', 'schuh', 'sandale', 'lauflern', 'rutsche', 'stiefel', 'schleich', 'playmobil', 'maxicosi', 'hose', 'kleid', 'jacke', 'schlafanzug', 'pulli', 'rock', 'body', 'short', 'shirt', 'jeans', 'kappe', 'mütze', 'maxi cosi', 'kinderwagen', 'buggy', 'hochstuhl', 'stubenwagen', 'babyschaukel', 'maxi- cosi', 'sportwagen', 'maxi-cosi', 'kindersitz', 'babyschale', 'lego', 'pullover', 'fahrradsitz', 'bluse', 'bodies', 'mantel', 'hemd', 'weste', 'strampler', 'bodie', 'wickeltasche', 'wickeltisch', 'kindersitz', 'kinderautositz', 'Bobby Car', 'Dreirad', 'kettcar', 'wippe', 'rasenmäher', 'schreibtisch', 'Schneeanzug', 'roller', 'puzzle', 'rucksack']
    // };

    var defaults = {
         url: ['http://kleinanzeigen.ebay.de/anzeigen/s-feed.rss?keywords=sekret%C3%A4r&locationId=1529&radius=50.0'],
        blacklist: []
    };

    //use default if nothing is defined
    instance = $.extend(defaults, instance);

    return self
});
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
                initFeed(url, min, max);

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
define('de.solygen/rss-ebay-kleinanzeigen/factories/view',
       ['de.solygen/rss-ebay-kleinanzeigen/config'], function (config) {

    'use strict';

    var nodes = {
        content: $(document.body).find('#content'),
        tags: $(document.body).find('#content').find('#tags'),
        settings: $(document.body).find('#content').find('#settings'),
        items: $(document.body).find('#content').find('#items')
    };


    var templates = {

        getFilter: function() {
            return $('<div class="alert alert-info" style="float: left"><button type="button" class="close" data-dismiss="alert">&times;</button><h4>Filtered</h4><span></span></div><div style="clear: left"></div>');
        },

        getFilterNode: function (item) {
             return $('<div class="btn btn-small btn-info" style="margin: 3px" data-action="toggle">' + item + '</div>');
        },

        getSettings: function (value) {
             return $('<textarea cols="80" rows="8" id="urls" class="span12">')
                    .val(value);
        },

        getItem: function () {
             return $('<div class="media" style="width: 480px;float:left; margin-right: 20px; padding: 14px; box-shadow: 0px 2px 30px 0px #cccccc"><a class="pull-left" href="#"><div class="image"><h3><span></span></h3></div></a><div class="media-body"><h4 class="media-heading"></h4></div></div>');
        },

        getItemRemove: function (id) {
            return $('<i class="icon-remove icon-large" data-action="delete" style="position:relative; bottom:0;right:right:0; z-index:2" id="' +  id + '"></i>');
        }
    };

//TODO: http://tympanus.net/codrops/2013/07/02/loading-effects-for-grid-items-with-css-animations/?utm_source=html5weekly&utm_medium=email
//TODO: http://fabien-d.github.io/alertify.js/?utm_source=html5weekly&utm_medium=email

    var items = function () {

        var list = [],
            filtered = {},
            crawler;

        var normalise = function (data) {
            //update hidden/blacklist flag
            _.each(data, function (item) {
                item.hidden = crawler.isIgnored(item.id) || false;
                if (item.hidden) {
                    filtered.ignored = filtered.ignored + 1 || 1;
                    item.class = 'ignored'
                } else {
                    //filter via blacklist
                    _.each(config.getBlacklist() || [], function (word) {
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
        };

        var sort = function () {
            list = _.sortBy(list, function (item) {
                return item.id * (-1)
            });
        };

        var draw = function () {
            var $container = $('<div>').on('click', function (e) {
                    var id = $(e.target).attr('id');
                    e.stopPropagation();
                    crawler.ignore(id);
                    $(this).find('#' + id)
                            .hide()
                            .data('class', 'ignored');
                });

            _.each(list, function (item) {
                    var node = templates.getItem()
                               .addClass(item.class)
                               .attr('id', item.id);

                    node.find('a')
                        .attr('href', item.link);
                    node.find('.image')
                        .css('backgroundImage', 'url("' + item.image + '")');
                    node.find('span')
                        .text(item.price);
                    node.find('h4')
                        .append(templates.getItemRemove(item.id))
                        .append(' | ' + item.title);
                    node.find('.media-body')
                        .append(item.text)
                        .append('<br>')
                        .append(item.city);
                    $container.append(node);
                //hidem items
                if (item.hidden) {
                    node.hide()
                        .css('backgroundColor', '#2f96b4');
                }
            });
            nodes.items.append($container);
        }

        return {

            get: function () {
                return list;
            },

            getFiltered: function () {
                return filtered;
            },

            set:function (data, cra) {
                crawler = cra;
                normalise(data);
                sort();
                draw();
            }
        }
    };

    return function (crawler) {

        var drawToolbar = function (items) {
                var counts = _.groupBy(items.get(), function(item) {
                    return item.hidden;
                });
                counts = $.extend({false: [], true: []}, counts);
                $(document.body).find('#displayed')
                                .removeClass('hidden')
                                .find('span')
                                .text(counts.false.length + ' of ' + (counts.true.length + counts.false.length));
                window.document.title = '(' + counts.false.length + ') rss-ebay-kleinanzeigen'
            },

            drawFilter = function (items) {
                var $filter = templates.getFilter(),
                    filtered = items.getFiltered();
                //output filtercount
                filtered = _.map(filtered, function (item, key) {
                    return key + ': ' + item;
                });
                filtered = _.sortBy(filtered, function (line) {
                    return (-1) * line.split(':')[1];
                });
                filtered = _.map(filtered, function (item) {
                    var node = templates.getFilterNode(item);
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
                $filter.find('span').append(filtered);
                nodes.tags.append($filter);
            },

            drawSettings = function () {
                var value = config.getUrl().join('\n');
                templates.getSettings(value)
                         .appendTo(nodes.settings);
            },


            drawItems = function (it, data) {
                it.set(data, crawler)
            }

        return {
            displayfeed: function (data) {
                var it = items();

                //clear
                nodes.tags.empty();
                nodes.settings.empty();
                nodes.items.empty();

                //process (ordered)
                drawItems(it, data);
                drawFilter(it);
                drawToolbar(it);
                drawSettings();
            }
        }
    }
});
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