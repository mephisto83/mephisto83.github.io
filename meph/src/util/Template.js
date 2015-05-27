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
        bindTemplate: function (templateString, data) {
            var regex = new RegExp('({{)[A-Za-z0-9_.]*(}})', 'g');
            var hasTemplate = regex.test(templateString);
            if (hasTemplate) {
                var res = templateString.match(regex);
                var paths = res.unique().select(function (x) {
                    return x.split('').subset(2, x.length - 2).join('');
                });
                res.unique().select(function (x) {
                    return x.split('').subset(2, x.length - 2).join('');
                }).foreach(function (t) {
                    var val = MEPH.getPathValue(t, data);
                    subregex = new RegExp('({{)' + t + '(}})', 'g');
                    templateString = templateString.replace(subregex, val === null || val === undefined ? '' : val);
                });
            }
            return templateString;

        }
    }
});