define('de.solygen/rss-ebay-kleinanzeigen/factories/view',
       ['de.solygen/rss-ebay-kleinanzeigen/config'], function (config) {

    'use strict';

    return function (crawler) {

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
                    var del = $('<i class="icon-remove icon-large" style="position:relative; bottom:0;right:right:0; z-index:2"></i>')
                                .click( function (e) {
                                    crawler.ignore(item.id);
                                    node.hide().data('class', 'ignored');
                                    e.stopPropagation();
                                });

                    node.find('span').text(item.price);
                    node.find('h4').append(del).append(' | ' + item.title);
                    node.find('.media-body')
                        .append(item.text)
                        .append('<br>')
                        .append(item.city);
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