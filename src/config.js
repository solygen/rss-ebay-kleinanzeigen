define('de.solygen/rss-ebay-kleinanzeigen/config',
        function () {

    'use strict';

    return {
        url: 'http://kleinanzeigen.ebay.de/anzeigen/s-feed.rss?adType=OFFER&categoryId=17&locationId=1528&radius=20.0',
        blacklist: ['garnitur', 'schrankwand', 'anbauwand', 'sofa', 'couch', 'schaukelstuhl', 'glastisch', 'wohnzimmertisch', 'fernseh', 'wohnzimmerschrank', 'sitzgruppe', 'bistrotisch', 'schuhschrank', 'wandspiegel', 'teewagen', 'vitrinentür', 'beistelltisch', 'wohnzimmer tisch', 'tischstehlampe', 'kaminbesteck', 'parkett', 'polsterecke', 'ledergarnitur', 'sessel', 'tv-rack', 'wohnwand', 'nussbaum', 'sitzecke', 'marmor', 'rollcontainer', 'garderobenständer', 'teppich', 'kleiderständer', 'tv-bank', 'hifi', 'bioethanol', 'ferhnsehschrank', 'sitzsack', 'glasvitrine', 'phonoschrank', 'schlafliege', 'cd-', 'hängeschrank', 'rattan', 'dvd', 'wetterstation', 'vorwerk', 'phono', 'tv ', 'tv-', 'kissen', 'cd-regal', 'marmor', 'hocker', 'gardine', 'sitzer', 'kamin', 'ofen', 'esstisch', 'bild', 'telefontisch', 'bett', 'brennholz', 'schuh', 'sandale', 'Lauflern', 'rutsche', 'stiefel', 'Schleich', 'playmobil', 'Maxicosi',
            'hose', 'kleid', 'jacke', 'SchlafAnzug', 'pulli', 'rock', 'body', 'short', 'Shirt', 'jeans', 'kappe', 'mütze', 'Maxi Cosi', 'kinderwagen', 'buggy', 'Hochstuhl', 'stubenwagen', 'Babyschaukel', 'Maxi- Cosi', 'Sportwagen', 'Maxi-Cosi', 'Kindersitz', 'babyschale', 'lego'],
        categories: {
            kleidung: ['hose', 'kleid', 'jacke', 'schuhe', 'schlafanzug']
        },
        tags: {
            'maxicosi': 'Maxi- Cosi,maxicosi,maxi cosi',
            'kinderwagen': 'kinderwagen,buggy,sportwagen'
        },
        storage: {

        }
    }
});