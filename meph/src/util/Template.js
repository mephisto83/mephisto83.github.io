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
                return MEPH.getPathValue(x.trim());
            }).where();
        },
        getIntialPath: function (str) {
            return (str || '').split('|')[0];
        },
        bindTemplate: function (templateString, data) {
            var $Template = MEPH.util.Template,
                val;
            var regex = new RegExp('({{)[A-Za-z0-9_. \|]*(}})', 'g');
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
                    if (intialPath === '') {
                        val = data;
                    }
                    else {
                        val = MEPH.getPathValue(intialPath, data);
                    }
                    if ($Template.hasCommands(t)) {
                        var commands = $Template.getCommands(t);
                        commands.forEach(function (command) {
                            val = command(val);
                        });
                    }
                    else {
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