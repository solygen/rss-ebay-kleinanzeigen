define('de.solygen/rss-ebay-kleinanzeigen/factories/view',
       ['de.solygen/rss-ebay-kleinanzeigen/config'], function (config) {

    'use strict';

    return function (crawler) {

        var self = {}, list = [], filtered = {}, counter = 0, counts, node, list = [],
                content = $(document.body).find('#content');

        var updateToolbar = function () {
            counts = _.groupBy(list, function(item) {
                return item.hidden;
            });
            counts = $.extend({false: [], true: []}, counts);
            $(document.body).find('#displayed').removeClass('hidden').find('span').text(counts.false.length + ' of ' + (counts.true.length + counts.false.length));
        }

        var sort = function() {
            list = _.sortBy(list, function(item) {
                return item.id * (-1)
            });
        }
        var insertFilterBlock = function () {
            var $filter = $('<div class="alert alert-info" style="float: left"><button type="button" class="close" data-dismiss="alert">&times;</button><h4>Filtered</h4><span></span></div><div style="clear: left"></div>');
            //output filtercount
            filtered = _.map(filtered, function (item, key) {
                return key + ': ' + item;
            });
            filtered = _.sortBy(filtered, function (line) {
                return (-1) * line.split(':')[1];
            });
            filtered = _.map(filtered, function (item) {
                var node = $('<div class="btn btn-small btn-info" style="margin: 3px" data-action="toggle">' + item + '</div>');
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
            content.find('#tags').append($filter);
            $filter.find('span').append(filtered);

        }


        var insertSettings = function () {
            var con = $('<textarea cols="80" rows="8" id="urls" class="span12">').val(config.getUrl().join('\n'));
            content.find('#settings').append(con);
        }


        var getNode = function () {
            return $('<div class="media" style="width: 480px;float:left; margin-right: 20px; padding: 14px; box-shadow: 0px 2px 30px 0px #cccccc"><a class="pull-left" href="#"><div class="image"><h3><span></span></h3></div></a><div class="media-body"><h4 class="media-heading"></h4></div></div>');
        };

        var getList = function (data) {
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
            return list;
        }

        var draw = function (list) {
            var $collector = $('<div>').on('click', function (e) {
                var id = $(e.target).attr('id');
                crawler.ignore(id);
                $(this).find('#' + id).hide().data('class', 'ignored');
                e.stopPropagation();
            });
            _.each(list, function (item) {
                    counter++;
                    var node = getNode()
                                .addClass(item.class)
                                .attr('id', item.id);

                    node.find('a')
                        .attr('href', item.link);
                    node.find('.image')
                        .css('backgroundImage', 'url("' + item.image + '")');
                    node.find('span')
                        .text(item.price);
                    node.find('h4')
                        .append('<i class="icon-remove icon-large" data-action="delete" style="position:relative; bottom:0;right:right:0; z-index:2" id="' +  item.id + '"></i>')
                        .append(' | ' + item.title);
                    node.find('.media-body')
                        .append(item.text)
                        .append('<br>')
                        .append(item.city);
                    $collector.append(node);
                //hidem items
                if (item.hidden) {
                    node.hide()
                        .css('backgroundColor', '#2f96b4');
                }
            });
            content.find('#items').append($collector)
        }


        self.displayfeed = function (data) {
            self = {}; list = []; filtered = {}; counter = 0; counts; node; list = [];
            //clear
            content.find('#tags').empty();
            content.find('#settings').empty();
            content.find('#items').empty();

            //process
            list = getList(data);
            insertFilterBlock();
            insertSettings();
            updateToolbar();
            sort();
            draw(list);
        };

        return self;
    }
});