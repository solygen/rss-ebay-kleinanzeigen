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