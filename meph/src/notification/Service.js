/**
 * @class MEPH.overlay.Service
 *   
 */
MEPH.define('MEPH.notification.Service', {
    requires: ['MEPH.notification.Notification'],
    properties: {
        messages: null,
        timeout: 3000
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
        var me = this, e;

        if (options && options.message) {

            if (!me.messages.some(function (x) {
            return x.message === options.message;
            })) {
                if (!me.currentOption || me.currentOption.message !== options.message)
                    me.messages.push(options);
            }
        }
        else {
            if (!me.currentOption || me.currentOption.message !== options.message)
                me.messages.push(options);
        }

        //        if (me.messages.length === 1) {
        var notif = function () {
            me.$queue = me.$queue.then(function () {
                return new Promise(function (resolve, fail) {
                    var options = me.messages.shift();
                    me.currentOption = options || null;
                    if (options) {
                        var template = MEPH.getTemplate('MEPH.notification.Notification');

                        var html = MEPH.util.Template.bindTemplate(template.template, options);
                        me.div.innerHTML = html;
                        el = me.div.firstElementChild;
                        document.body.appendChild(el);
                        setTimeout(function (el) {
                            el.classList.add('remove-notification');
                            setTimeout(function () {
                                try {
                                    if (el.parentNode) {
                                        el.parentNode.removeChild(el);
                                    }
                                } catch (e) { }
                                resolve();
                            }, 300);
                            me.currentOption = null;
                            if (me.messages.length) {
                                notif();
                            }
                        }.bind(me, el), me.timeout);
                    }
                    else {
                        resolve();
                    }
                })
            });
        };
        notif();
        //      }
    }
});