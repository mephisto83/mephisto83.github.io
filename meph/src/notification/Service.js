/**
 * @class MEPH.overlay.Service
 *   
 */
MEPH.define('MEPH.notification.Service', {
    requires: ['MEPH.notification.Notification'],
    properties: {
        messages: null,
        timeout: 5000
    },
    initialize: function (config) {
        var me = this;
        me.messages = [];
        me.div = document.createElement('div');
        if (config) {
            me.timeout = config.timeout || me.timeout;
        }
        me.$queue = Promise.resolve();
    },
    notify: function (options) {
        var me = this, el;
        me.messages.push(options);
        if (me.messages.length === 1) {
            var notif = function () {
                me.$queue = me.$queue.then(function () {
                    return new Promise(function (resolve, fail) {
                        var template = MEPH.getTemplate('MEPH.notification.Notification');

                        var options = me.messages.shift();
                        var html = MEPH.util.Template.bindTemplate(template.template, options);
                        me.div.innerHTML = html;
                        el = me.div.firstElementChild;
                        document.body.appendChild(el);
                        setTimeout(function (el) {
                            el.classList.add('remove-notification');
                            setTimeout(function () {
                                if (el.parentNode) {
                                    el.parentNode.removeChild(el);
                                }
                                resolve();
                            }, 300);
                            if (me.messages.length) {
                                notif();
                            }
                        }.bind(me, el), me.timeout);
                    })
                });
            };
            notif();
        }
    }
});