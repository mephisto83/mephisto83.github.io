MEPH.define('MEPH.chrome.extension.Connect', {
    properties: {
        timeout: 10000
    },
    listen: function () {
        var me = this;
        if (!window.chrome || !window.chrome.runtime || !window.chrome.runtime.onConnect)
            return;
        return (function () {
            var listener = {
                onPort: function (call) {
                    listener.callback = call;
                }
            };
            chrome.runtime.onConnect.addListener(function (port) {
                // console.assert(port.name == "knockknock");
                listener[port.name] = listener[port.name] || {
                    port: port,
                    post: function (msg) {
                        port.postMessage(msg);
                    }
                };
                port.onMessage.addListener(function (msg) {
                    if (listener[port.name].onMessage) {
                        listener[port.name].onMessage(port.name, msg);
                    }
                });
                port.onDisconnect.addListener(function () {
                    if (listener[port.name]) {
                        delete listener[port.name]
                    }
                })
                listener.callback(port.name);
            });

            return listener;
        })();
    },
    bus: function (contentpage) {
        var id = MEPH.GUID();
        var channel = MEPH.GUID();
        if (!window.chrome || !window.chrome.runtime || !window.chrome.runtime.onConnect)
            return;

        if (!channel) {
            throw new Error('No channel specified');
        }
        var me = this;
        if (me.called) return;
        me.called = true;

        return (function () {
            var context = {};
            var outchannel;
            context.callback = function (portname, context, port) {
                channel = portname;
                attachFuncs(channel, context, port);
            }
            context.post = function (message) {
                var ch = channel;
                var addport = false;
                if (context[ch]) {
                    try {
                        context[ch].postMessage(message);
                    } catch (e) {
                        try {
                            console.log(e);
                            context[ch].disconnect();
                        } catch (r) {
                            console.log('Couldnt disconnect without error.');
                        }
                        delete context[ch]
                        addport = true;
                    }
                }
                else { addport = true; }
                if (addport) {
                    attachPort(ch, context);
                }
            }
            var readycallback;
            context.ready = function (call) {
                readycallback = call;
            }
            var attachPort = function (ch, context) {
                channel = MEPH.GUID();
                var newport = chrome.runtime.connect({ name: channel });
                attachFuncs(channel, context, newport);
            }
            var attachFuncs = function (channel, context, port) {
                if (context[channel])
                    return;
                context[channel] = port;
                context[channel].onMessage.addListener(function (msg) {
                    if (msg.from !== id && context.onMessage)
                        context.onMessage(channel, msg);
                });
                context[channel].onDisconnect.addListener(function () {
                    if (context[channel]) {
                        delete context[channel];
                    }
                    console.log('a port was disconnected ' + port.name);
                });
            };
            context.connected = false;
            chrome.runtime.onConnect.addListener(function (_port) {
                channel = _port.name;
                context.callback(_port.name, context, _port);
                context.connected = true;
            });
            setTimeout(function () {
                if (!context.connected) {
                    if (!contentpage) {
                        chrome.tabs.query({ active: true, windowId: -2 }, function (tab) {
                            var port = chrome.tabs.connect(tab.first().id);
                            attachFuncs(channel, context, port);
                            if (readycallback) {
                                readycallback();
                            }
                        });
                    }
                    else {
                        var port = chrome.runtime.connect({ name: channel });
                        attachFuncs(channel, context, port);
                        if (readycallback) {
                            readycallback();
                        }
                    }
                }
            }, 1000);

            return context;
        })();
    },
    connect: function (channel) {
        if (!window.chrome || !window.chrome.runtime || !window.chrome.runtime.onConnect)
            return;

        if (!channel) {
            throw new Error('No channel specified');
        }
        var me = this;
        if (me.called) return;
        me.called = true;

        return (function () {
            var port = chrome.runtime.connect({ name: channel });
            var outchannel;
            port.onMessage.addListener(function (msg) {
                if (outchannel) {
                    outchannel(msg);
                }
            });
            port.onDisconnect.addListener(function () {
                port = false;
                outchannel = false;
            })
            return {
                post: function (message) {
                    if (port)
                        port.postMessage(message);
                },
                received: function (out) {
                    outchannel = out;
                }
            }
        })();
    },

    screenShot: function (options, windowId) {

        if (!window.chrome || !window.chrome.runtime || !window.chrome.runtime.onConnect) {
            return;
        }

        var me = this,
            ignoreFail;
        windowId = windowId || -2;
        options = options || { format: 'png' }
        return new Promise(function (resolve, fail) {
            ignoreFail = setTimeout(function () {
                fail(null);
            }, me.timeout);
            chrome.tabs.captureVisibleTab(windowId, options, function (dataUrl) {
                clearTimeout(ignoreFail);
                resolve(dataUrl);
            });
        });
    }
});
