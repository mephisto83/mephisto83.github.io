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
        }
    }
});