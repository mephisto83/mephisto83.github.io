/**
* @class MEPH.graph.Node
*/
MEPH.define('MEPH.graph.Node', {
    requires: ['MEPH.math.J3DIVector3'],
    properties: {
    },
    isHidden: function () {
        var me = this;
        return me.$hidden;
    },
    appendData: function (data) {
        var me = this;
        me.$data = data;
        for (var i in data) {
            if (me['get' + i.capitaliseFirstLetter()] === undefined) {
                me['get' + i.capitaliseFirstLetter()] = function (i) {
                    return me.$data[i];
                }.bind(me, i);
            }
            if (me['set' + i.capitaliseFirstLetter()] === undefined) {
                me['set' + i.capitaliseFirstLetter()] = function (i, value) {
                    me.$data[i] = value;
                    me.fire('move', {});
                }.bind(me, i);
            }
        }
    },
    initialize: function (options) {
        var me = this;
        MEPH.Events(me);
        me.$hidden = false;
        me.maxDistanceToTarget = 1;
        me.$position = new MEPH.math.J3DIVector3(0, 0, 0);
        me.$speed = .5;
        me.$activezones = MEPH.util.Observable.observable([]);
        me.on('removed', me.clearConnections.bind(me));
        me.$connections = MEPH.util.Observable.observable([])
            .on('afterpush', me.handleNewConnection.bind(me))
            .on('beforepush', me.fire.bind(me, 'beforeconnectionadded'))
        .on('afterpush', me.fire.bind(me, 'afterconnectionadded'))
        .on('afterpush', me.fire.bind(me, 'connectionadded'))
        .on('afterpush', me.onConnectionAdded.bind(me))
        .on('onpush', me.fire.bind(me, 'changed'))
        .on('beforesplice', me.fire.bind(me, 'beforeconnectionremoved'))
        .on('aftersplice', me.fire.bind(me, 'afterconnectionremoved'))
        .on('aftersplice', me.handleConnectionRemoved.bind(me))
        .on('onremove', me.fire.bind(me, 'connectionremoved'))
        .on('onremove', me.fire.bind(me, 'changed'));
    },
    speed: function (newspeed) {
        var me = this;
        if (newspeed !== undefined) {
            me.$speed = newspeed;
        }
        return me.$speed;
    },
    copyoptions: function (obj) {
        var newobj = {};
        for (var i in obj) {
            newobj[i] = obj[i];
        }
        return newobj;
    },
    handleConnectionRemoved: function (type, args) {
        var me = this;

        var zones = args.removed.concatFluentReverse(function (x) { return x.getZones(); }).where(function (x) { return x.getNode() === me; });
        var zone = zones.first();
        if (zone) {
            if (zone.isEnumerable()) {
                var option = zone.getOptions().option;
                var clonedoption = me.copyoptions(zone.getOptions().option);
                clonedoption.id = GUID();
                if (me.isOutput(option)) {
                    me.getNodeOutputs().removeWhere(function (x) {
                        return x === option;
                    });
                    if (!me.getNodeOutputs().contains(function (x) {
                        return x.title === clonedoption.title;
                    })) {
                        me.getNodeOutputs().push(clonedoption)
                    }
                }
                else {
                    me.getNodeInputs().removeWhere(function (x) {
                        return x === option;
                    });
                    if (!me.getNodeInputs().contains(function (x) {
                        return x.title === clonedoption.title;
                    })) {
                        me.getNodeInputs().push(clonedoption)
                    }
                    if (zone.isMatching()) {
                        var removed = me.getNodeOutputs().removeWhere(function (x) {
                            return x.match === option.id;
                        });
                        removed.foreach(function (x) {
                            me.getZones().removeWhere(function (x) {
                                return x.getOptions().option === x;
                            }).foreach(function (x) {
                                x.destroy();
                            });
                        });
                    }
                }
                zone.destroy();
            }
        }
    },
    onConnectionAdded: function (type, args) {
        var me = this;

        var zones = args.added.concatFluentReverse(function (x) {
            return x.getZones();
        }).where(function (x) {
            return x.getNode() === me;
        });
        var zone = zones.first();
        if (zone) {
            if (zone.isEnumerable()) {
                var clonedoption = me.copyoptions(zone.getOptions().option);
                clonedoption.id = GUID();
                var add = false;
                if (me.isOutput(zone.getOptions().option)) {
                    if (me.getFreeZones().where(function (z) { return me.isOutput(z); }).length <= 1) {
                        me.getNodeOutputs().push(clonedoption);
                        add = true;
                    }
                }
                else {
                    if (me.getFreeZones().where(function (z) { return !me.isOutput(z); }).length <= 1) {
                        me.getNodeInputs().push(clonedoption);
                        add = true;
                    }
                }
                if (zone.isMatching() && add) {
                    var matchid = clonedoption.id;
                    var option = zone.getOptions().option;
                    var clonedoption = me.copyoptions(zone.getOptions().option);
                    clonedoption.id = GUID();
                    clonedoption.match = matchid;
                    clonedoption.matchingoutput = false;
                    clonedoption.enumerable = false;
                    clonedoption.languageType = option.matchingoutputtype || option.languageType;
                    if (me.isOutput(zone.getOptions().option)) {
                        me.getNodeInputs().push(clonedoption);
                    }
                    else {
                        me.getNodeOutputs().push(clonedoption);
                    }
                }
            }
        }
    },
    getFreeZones: function () {
        var me = this;
        return me.getZones().where(function (zone) {
            return !me.getConnections().contains(function (x) {
                return !x.getZones().contains(zone);
            });
        });

    },
    save: function () {
        var me = this,
            result = {};
        result.id = me.getId();
        var pos = me.getPosition();
        result.position = pos;
        var newdata = {
        }
        for (var i in me.$data) {
            if (i !== 'nodeInputs' && i !== 'nodeOutputs') {
                newdata[i] = me.$data[i];
            }
        }
        newdata.nodeInputs = me.$data.nodeInputs.select(function (z) {
            var newze = {};
            for (var t in z) {
                if (t !== 'node' && typeof z[t] !== 'function') {
                    newze[t] = z[t];
                }
            }
            return newze;
        });
        newdata.nodeOutputs = me.$data.nodeOutputs.select(function (z) {
            var newze = {};
            for (var t in z) {
                if (t !== 'node' && typeof z[t] !== 'function') {
                    newze[t] = z[t];
                }
            }
            return newze;
        });

        result.data = newdata;
        return result;
    },
    isOutput: function (option) {
        var me = this;
        return me.getNodeOutputs().contains(function (x) { return x === option; })
    },
    isOutputZone: function (zone) {
        var me = this;
        return me.isOutput(zone.getOptions().option);
    },
    addZone: function (zone) {
        var me = this;
        if (!me.$activezones.contains(zone)) {
            me.$activezones.push(zone);
            zone.on('click', me.onNodeClicked.bind(me, zone, me));
        }
        if (me.$ignoreMouse) {
            zone.ignoreMouse(me.$ignoreMouse);
        }
    },
    ignoreMouse: function (value) {
        var me = this;
        me.$ignoreMouse = true;
        me.getZones().foreach(function (zon) { return zon.ignoreMouse(value); });
    },
    onNodeClicked: function (activezone, node) {
        var me = this;
        me.fire('click', { zone: activezone, node: node });
    },
    hasZone: function (zone) {
        var me = this;
        return me.getZones().contains(function (x) {
            return x === zone;
        });
    },
    getZones: function () {
        var me = this;
        return me.$activezones;
    },
    clearZones: function () {
        var me = this;
        me.$activezones.removeWhere(function (x) {
            x.destroy();
        });
    },
    getConectionPosition: function (connection) {
        var me = this;

        var zones = connection.getZones();
        if (zones) {
            return zones.foreach(function (zone) { return zone.getPosition() });
        }
        return [me.getPosition()];
    },
    setPosition: function (x, y, z) {
        var me = this;
        if (me.isMoving(x, y, z)) {
            me.$position = new J3DIVector3(x, y, z);
            me.fire('move', { node: me });
        }
    },
    getTargetPosition: function () {
        var me = this;
        return me.$targetPosition;
    },
    setTargetPosition: function (x, y, z, callback) {
        var me = this;
        me.$targetPosition = pgx.Vector.Create({ x: x, y: y, z: z });
        if (me.movingToTarget) {
            return;
        }
        me.movingToTarget = true;
        if (me.requestedAnimationFrame !== undefined) {
            cancelAnimationFrame(me.requestedAnimationFrame)
        }
        var anim = function () {
            var pos = pgx.Vector.Create(me.$position);
            var nextpos = me.$targetPosition.subtract(pos).unit().multiply(me.$speed).add(pos);
            //pgx.Vector.Lerp2D(pos, me.$targetPosition, me.$speed);
            me.setPosition(nextpos.x, nextpos.y, nextpos.z);
            if (nextpos.distance(me.$targetPosition) < me.maxDistanceToTarget) {
                me.movingToTarget = false;
                if (callback) {
                    callback();
                }
                me.requestedAnimationFrame = undefined;
            }
            else {
                me.requestedAnimationFrame = requestAnimationFrame(anim);
            }
        }
        me.requestedAnimationFrame = requestAnimationFrame(anim)
    },
    isMoving: function (x, y, z) {
        var me = this, position = me.getPosition();
        if (position) {
            return !(position.x == x && position.y == y && position.z == z);
        }
        return true;
    },
    getPosition: function () {
        var me = this;
        if (me.$position) {
            return {
                x: me.$position[0],
                y: me.$position[1],
                z: me.$position[2]
            }
        }
        return null;
    },
    handleNewConnection: function (type, aconnections) {
        var me = this, connections = [];
        for (var i = 0 ; i < aconnections.added.length ; i++) {
            connections.push(aconnections.added[i]);
        }
        if (connections) {
            connections.foreach(function (connection) {
                if (!connection.getNode(me)) {
                    connection.addNode(me);
                }
                connection.on('removed', me.onConnectionRemoved.bind(me, connection));
            });
        }
    },
    onConnectionRemoved: function (connection) {
        var me = this;
        me.removeConnection(connection);
    },
    clearConnections: function () {
        var me = this;
        me.getConnections().removeWhere(function (x) {
            return true;
        });
    },
    getZoneConnectors: function () {
        var me = this;
        return me.getZones().where(function (x) {
            if (x.getOptions && typeof (x.getOptions) === 'function') {
                return x.getOptions().type === 'connector';
            }
            return false;
        })
    },
    getConnection: function (connection) {
        var me = this;
        return me.$connections.first(function (x) { return x === connection; });
    },
    getConnections: function () {
        var me = this;
        return me.$connections;
    },
    removeConnection: function (connection) {
        var me = this;
        me.$connections.removeWhere(function (x) { return x === connection; });
    },
    addConnection: function (connection) {
        var me = this;
        if (!me.getConnection(connection)) {
            me.$connections.push(connection);
        }
    },
    removed: function () {
        var me = this;
        me.clearZones();
        me.fire('removed', {});
    },
    setId: function (value) {
        var me = this;
        me.$id = value;
    },
    getId: function () {
        var me = this;
        return me.$id;
    }
});