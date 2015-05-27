/**
 * @class MEPH.overlay.Service
 *   
 */
MEPH.define('MEPH.overlay.Service', {
    requires: ['MEPH.overlay.Overlay'],
    properties: {
        templates: null
    },
    initialize: function () {
        var me = this;
        me.templates = [];
        me.div = document.createElement('div');
    },
    open: function (scope) {
        var me = this;
        var template = me.templates.first(function (x) { return x.scope === scope; });
        if (!template && scope) {

            var template = MEPH.getTemplate('MEPH.overlay.Overlay');
            me.div.innerHTML = template.template;
            var el = me.div.firstElementChild;
            document.body.appendChild(el);
            el.setAttribute('scope', scope);
            me.templates.push({ template: el, scope: scope });
        }
    },
    relegate: function (scope) {
        var me = this;
        var template = me.templates.first(function (x) { return x.scope === scope; });
        if (template && template.template) {
            template.template.classList.add('relegated');
        }
    },
    close: function (scope) {
        var me = this;
        var template = me.templates.first(function (x) { return x.scope === scope; });
        if (template && template.template) {
            template.template.classList.add('removed');
            me.templates.removeWhere(function (x) { return x.scope === scope; });
            setTimeout(function () {
                template.template.parentNode.removeChild(template.template);
            }, 500);
        }
    }
});