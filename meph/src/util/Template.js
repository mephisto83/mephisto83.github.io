MEPH.define('MEPH.util.Template', {
    requires: ['MEPH.util.Dom'],
    statics: {
        commentType: 8,
        getComments: function (element) {
            var result = [],
                dom = MEPH.util.Dom;
            if (!element) {
                return result;
            }
            if (element.nodeType === dom.commentType) {
                result.push(element);
            }
            for (i = 0; i < element.childNodes.length ; i++) {
                result = result.concat(dom.getComments(element.childNodes[i]));
            }
            return result;
        },
        hasCommands: function (str) {
            return (str || '').split('|').length > 1;
        },
        getCommands: function (str) {
            return (str || '').split('|').select(function (x) {
                var split = x.split(',');
                var c = split.first();
                var args = split.subset(1);
                return {
                    command: MEPH.getPathValue(c.trim()),
                    args: args.select(function (x) {
                        try {
                            return MEPH.getPathValue(x) || x
                        }
                        catch (e) {
                        }
                        return x;
                    })
                }
            }).where(function (t) {
                return t && t.command;
            });
        },
        getIntialPath: function (str) {
            return (str || '').split('|')[0];
        },
        bindArray: function (data, template) {
            template = template.split('').subset(1, template.length - 1).join('')
            var templateStr = MEPH.getTemplate(template);
            if (templateStr && templateStr.template && data && data.select) {
                return data.select(function (x) {
                    return MEPH.util.Template.bindTemplate(templateStr.template, x);
                }).join('');
            }
            return '';
        },
        templateEventHandler: function (dom, evntType, callback) {
            dom.addEventListener(evntType, function (evt) {
                var listItemEl = dom;
                var index = parseFloat(listItemEl.getAttribute('data-item-index'));
                var element = dom;

                if (!evt.path) {
                    MEPH.util.Dom.generatePath(evt);
                }
                var potentialEvent = MEPH.Array(evt.path).first(function (x) {
                    return x && x.getAttribute ? x.getAttribute('template-event') : null;
                });
                if (potentialEvent && element && MEPH.util.Dom.isDomDescendant(potentialEvent, element)) {
                    callback(potentialEvent.getAttribute('template-event'), potentialEvent.getAttribute('template-event-argument'), evt);
                }
            });
        },
        getTemplatePaths: function (templateString) {
            var $Template = MEPH.util.Template,
              val;
            var singularSymbol = '@';
            var regex = new RegExp('({{)[A-Za-z0-9_.' + singularSymbol + ' ,\'\|]*(}})', 'g');
            var hasTemplate = $Template.hasTemplate(templateString);
            if (hasTemplate) {
                var res = templateString.match(regex);
                return res.reverse().unique().select(function (x) {
                    return x.split('').subset(2, x.length - 2).join('');
                }).select(function (t) {
                    return $Template.getIntialPath(t).trim();
                });
            }
            return [];
        },
        hasTemplate: function (templateString) {
            var singularSymbol = '@';
            var regex = new RegExp('({{)[A-Za-z0-9_.' + singularSymbol + ' ,\'\|]*(}})', 'g');
            var hasTemplate = regex.test(templateString);
            return hasTemplate;
        },
        bindTemplate: function (templateString, data) {
            var $Template = MEPH.util.Template,
                val;
            var singularSymbol = '@';
            var regex = new RegExp('({{)[A-Za-z0-9_.' + singularSymbol + ' ,\'\|]*(}})', 'g');
            var hasTemplate = regex.test(templateString);
            if (hasTemplate) {
                var res = templateString.match(regex);
                //var paths = res.unique().select(function (x) {
                //    return x.split('').subset(2, x.length - 2).join('');
                //}); 
                res.reverse().unique().select(function (x) {
                    return x.split('').subset(2, x.length - 2).join('');
                }).foreach(function (t) {
                    var intialPath = $Template.getIntialPath(t, data).trim();
                    if (intialPath === '' || intialPath === singularSymbol) {
                        val = data;
                    }
                    else {
                        val = MEPH.getPathValue(intialPath, data);
                    }
                    if ($Template.hasCommands(t)) {
                        var commands = $Template.getCommands(t);
                        commands.forEach(function (commandObj) {
                            val = commandObj.command.apply(null, [val].concat(commandObj.args));
                        });
                    }
                    else if (intialPath !== singularSymbol) {
                        val = MEPH.getPathValue(intialPath, data);
                    }
                    t = t.split('|').join('\\|')
                    subregex = new RegExp('({{)' + t + '(}})', 'g');
                    templateString = templateString.replace(subregex, val === null || val === undefined ? '' : val);
                });
            }
            return templateString;

        }
    }
}).then(function () {
    window.mephT = MEPH.util.Template.templateEventHandler;

    var makeControl = function (obj) {
        obj.getConnectableTypes = function () {
            return MEPH.Array([MEPH.control.Control.connectables.control, 'view']);
        }
        obj.getConnection = function (type) {
            return obj;
        }
        obj.getReferenceConnections = function () {
            return [{ type: 'control', obj: obj }];
        }
    };

    var templateList = function (dom, array) {
        //listview
        var template = dom.querySelectorAll('template')[0];
        if (template) {
            dom.innerHTML = '';
            array.on('changed', function () {
                dom.innerHTML = '';
                var t = '';
                array.forEach(function (data) {
                    t += MEPH.util.Template.bindTemplate(template.innerHTML, data);
                });
                dom.innerHTML = t;
            });
        }
    };
    window.mephT.templateList = templateList;

    window.mephT.makeControl = makeControl;
});