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

    var defaults = {
         url: ['http://kleinanzeigen.ebay.de/anzeigen/s-feed.rss?adType=OFFER&categoryId=17&locationId=1528&radius=21.0',
              'http://kleinanzeigen.ebay.de/anzeigen/s-feed.rss?keywords=sekret%C3%A4r&locationId=1529&radius=50.0',
              'http://kleinanzeigen.ebay.de/anzeigen/s-feed.rss?keywords=eintracht%20frankfurt%20trikot',
              'http://kleinanzeigen.ebay.de/anzeigen/s-feed.rss?categoryId=89&locationId=1529&radius=10.0'],
        blacklist: ['garnitur', 'schrankwand', 'anbauwand', 'sofa', 'couch', 'schaukelstuhl', 'glastisch', 'wohnzimmertisch', 'fernseh', 'wohnzimmerschrank', 'sitzgruppe', 'bistrotisch', 'schuhschrank', 'wandspiegel', 'teewagen', 'vitrinentür', 'beistelltisch', 'wohnzimmer tisch', 'tischstehlampe', 'kaminbesteck', 'parkett', 'polsterecke', 'ledergarnitur', 'sessel', 'tv-rack', 'wohnwand', 'nussbaum', 'sitzecke', 'marmor', 'rollcontainer', 'garderobenständer', 'teppich', 'kleiderständer', 'tv-bank', 'hifi', 'bioethanol', 'ferhnsehschrank', 'sitzsack', 'glasvitrine', 'phonoschrank', 'schlafliege', 'cd-', 'hängeschrank', 'rattan', 'dvd', 'wetterstation', 'vorwerk', 'phono', 'tv ', 'tv-', 'kissen', 'cd-regal', 'marmor', 'hocker', 'gardine', 'sitzer', 'kamin', 'ofen', 'esstisch', 'bild', 'telefontisch', 'bett', 'brennholz', 'schuh', 'sandale', 'lauflern', 'rutsche', 'stiefel', 'schleich', 'playmobil', 'maxicosi', 'hose', 'kleid', 'jacke', 'schlafanzug', 'pulli', 'rock', 'body', 'short', 'shirt', 'jeans', 'kappe', 'mütze', 'maxi cosi', 'kinderwagen', 'buggy', 'hochstuhl', 'stubenwagen', 'babyschaukel', 'maxi- cosi', 'sportwagen', 'maxi-cosi', 'kindersitz', 'babyschale', 'lego', 'pullover', 'fahrradsitz', 'bluse', 'bodies', 'mantel', 'hemd', 'weste', 'strampler', 'bodie']
    };


    //use default if nothing is defined
    instance = $.extend(defaults, instance);

    return self
});