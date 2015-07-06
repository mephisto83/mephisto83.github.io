/**
 * @class MEPH.overlay.Service
 *   
 */
MEPH.define('MEPH.dialog.Service', {
    requires: ['MEPH.dialog.Dialog',
        'MEPH.util.Template',
        'MEPH.dialog.DialogChoice'],
    properties: {
        templates: null
    },
    initialize: function () {
        var me = this;
        me.templates = [];
        me.div = document.createElement('div');
        MEPH.Events(me);
    },
    choice: function (options) {
        var me = this;
        if (options && options.title && options.message && options.choices && Array.isArray(options.choices)) {
            return new Promise(function (resolve, fail) {
                var template = MEPH.getTemplate('MEPH.dialog.DialogChoice');
                var html = MEPH.util.Template.bindTemplate(template.template, options);
                me.div.innerHTML = html;

                var el = me.div.firstElementChild;
                document.body.appendChild(el);

                MEPH.util.Template.templateEventHandler(el, 'click', function (type, value) {
                    var done = false;
                    switch (type) {
                        case 'dialog-choice-selection':
                            done = true;
                            resolve(value);
                            break;
                        case 'dialog-choice-cancel':
                            done = true;
                            fail();
                            break;
                    }
                    if (done) {
                        if (el.parentNode)
                            el.parentNode.removeChild(el);
                    }
                });


                el.setAttribute('scope', options.message);
                me.templates.push({ template: el, options: options });
            });
        }
        else {
            return Promise.resolve(null);
        }
    },
    confirm: function (options) {
        var me = this;
        if (options && options.message) {
            options.yes = options.yes || 'Yes';
            options.no = options.no || 'No';
            return new Promise(function (resolve, fail) {
                var template = MEPH.getTemplate('MEPH.dialog.Dialog');
                var html = MEPH.util.Template.bindTemplate(template.template, options);
                me.div.innerHTML = html;

                me.don('click', me.div.querySelector('[confirm]'), function () {
                    if (el.parentNode)
                        el.parentNode.removeChild(el);
                    resolve();
                });

                me.don('click', me.div.querySelector('[reject]'), function () {
                    if (el.parentNode)
                        el.parentNode.removeChild(el);
                    fail();
                });

                var el = me.div.firstElementChild;
                document.body.appendChild(el);
                el.setAttribute('scope', options.message);
                me.templates.push({ template: el, options: options });
            });
        }
        else {
            return Promise.resolve();
        }
    },
});