/**
 * @class MEPH.dom.ControlReader
 * Reads controls from the dom which should be created, and associated with there js objects.
 * 
 *      The control ready will receive the "div meph-app" as input and return the meph_input and fieldForceView
 *      as the dom elements that will be matched with the appropriate classes.
 *              <div meph-app>
 *                  <meph_input data-bind='value: v$.someValue' />
 *                  <fieldForceView />
 *              </div>
 *
 **/
MEPH.define('MEPH.dom.ControlReader', {
    initialize: function () {
        var me = this;
    },
    /**
     * Gets the control that will be rendered and link to the js code-behind objects.
     */
    getViewObjects: function (dom) {
        var me = this,
            results = [],
            aliases = MEPH.getAllAliases();
        aliases.foreach(function (x) {
            results = results.concat(MEPH.util.Array.convert(dom.querySelectorAll(x)));
        });

        return MEPH.util.Array.create(results);
    },
    getChildViewObjects: function (dom) {
        var me = this,
            results = [],
            aliases = MEPH.getAllAliases();
        MEPH.util.Array.convert(dom.childNodes).foreach(function (node) {
            var alias = aliases.first(function (x) { return x === node.nodeName.toLowerCase(); });
            if (alias) {
                results.push({
                    node: node,
                    alias: alias
                });
            }
        });
        return MEPH.util.Array.create(results);
    }
});