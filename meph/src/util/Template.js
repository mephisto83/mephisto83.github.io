MEPH.define('MEPH.util.Template', {
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
            if (templateStr && templateStr.template) {
                return data.select(function (x) {
                    return MEPH.util.Template.bindTemplate(templateStr.template, x);
                }).join('');
            }
            return '';
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
});