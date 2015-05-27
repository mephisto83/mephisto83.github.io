/**
 * @class MEPH.field.FormField
 * @extends MEPH.control.Control
 * Standard form for a input field.
 **/
MEPH.define('MEPH.gpu.Context', {
    statics: {
        Commands: {
            select: 'select'
        }
    },
    properties: {
        functions: null
    },
    initialize: function () {
        var me = this;
        me.functions = [];
    },
    /**
     * Selects fom the passed argument.             
     * @param {Object} args { prop: 'float' }
     * @returns {Object}
     */
    select: function (args) {
        var commandObject = {};
        commandObject.command = MEPH.gpu.Context.Commands.select;
        var arguments = [];
        for (var i in args) {
            arguments.push({ name: i, type: args[i] || null });
        }
        commandObject.arguments = arguments;
        return commandObject;
    },
    command: function (commandObject, arg) {
        return {
            command: commandObject,
            jsInputs: MEPH.Array(arguments).subset(1)
        };

    },
    'function': function (name, parameters) {
        var me = this;  
        if (!me.functions.contains(function (x) { return x.name === name; })) {
            me.functions.push({ name: name, parameters: Array.isArray(parameters) ? parameters : [parameters] });
        }
        return me;
    },
    getFunction: function (name) {
        var me = this;
        
        return me.functions.first(function (x) { return x.name === name; });
    }
});