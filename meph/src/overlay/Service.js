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
    open: function (scope, options) {
        var me = this, html;
        options = options || {};
        MEPH.applyIf({ template: 'MEPH.overlay.Overlay' }, options);
        var template = me.templates.first(function (x) { return x.scope === scope; });
        if (!template && scope) {
            var template = MEPH.getTemplate(options.template);
            if (options.bindTo) {
                html = MEPH.util.Template.bindTemplate(template.template, options.bindTo);
            }
            else {
                html = template.template;
            }
            me.div.innerHTML = html;
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