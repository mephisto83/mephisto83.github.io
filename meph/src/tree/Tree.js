/**
 * @class MEPH.tree.Tree
 * String
 */
MEPH.define('MEPH.tree.Tree', {
    alias: 'tree',
    extend: 'MEPH.list.List',
    requires: ['MEPH.util.Dom'],
    templates: true,
    properties: {
        treeSource: null,
        treeFunction: function (root) {
            return root.children || [];
        },
        $depthPathPrefixCls: 'meph-tree-depth-',
        $treeInfoSource: null
    },
    initialize: function () {
        var me = this;
        me.callParent.apply(me, arguments);
        me.on('change_treeSource', me.onTreeSourceChanged.bind(me));
    },
    onTreeSourceChanged: function () {
        var me = this;
        me.$treeInfoSource = me.convertObject(me.treeSource, me.treeFunction);
        me.source = me.$treeInfoSource.select(function (x) { return x.data });
    },
    /**
     * @private
     * Gets the soure information
     * @param {Object} data
     * @returns {Object}
     */
    getSourceInfo: function (data) {
        var me = this;
        if (me.$treeInfoSource) {
            return me.$treeInfoSource.first(function (x) { return x.data === data; });
        }
        return null;
    },
    /**
     * Converts an object in to a depth first array.
     * @param {Object} root
     * @param {Function} childFunction The functions is required to return an array of child instances.
     * @returns {Object}
     **/
    convertObject: function (root, childFunction) {
        var me = this, result;
        result = me.objectConverter(root, childFunction);
        if (result) {
            return MEPH.Array(result.result);
        }
        return null;
    },
    /**
     * Renders an item.
     * @protected
     * @param {Object} dataItem
     * @returns {Promise}
     */
    renderItem: function (dataItem) {
        var me = this,
            result,
            itemInfo,
            dataTemplate,
            Dom = MEPH.util.Dom,
            listspace;
        result = me.callParent.apply(me, arguments);
        itemInfo = me.getSourceInfo(dataItem);
        return result.then(function (result) {
            if (itemInfo) {
                var classInstance = result.first().classInstance;

                classInstance.getDomTemplate().foreach(function (x) {
                    if (x.nodeType === Dom.elementType) {
                        x.classList.add(me.$depthPathPrefixCls + itemInfo.depth);
                    }
                });
            }
            return result;
        });
        //me.renderControl(namespace.join('.'), listspace, me).then(function (result) {

        //    me.boundSource.push({ renderResult: result, dataItem: dataItem });
        //    return result;
        //}).then(function (result) {
        //    result.first().classInstance.data = dataItem;
        //    result.first().classInstance.fire('databound');
        //    return result;
        //});
    },
    /**
     * @private
     */
    objectConverter: function (root, childFunction, depth) {
        var result = [],
         children, childInfo,
         me = this;
        depth = depth || 0;
        children = MEPH.Array(childFunction(root));
        childInfo = {
            data: root,
            children: [],
            parent: null,
            depth: depth
        };
        result.push(childInfo);
        children.foreach(function (child) {
            var composite = me.objectConverter(child, childFunction, depth + 1);
            composite.childInfo.parent = childInfo;
            childInfo.children.push(composite.childInfo);
            result = result.concat(composite.result);
        });
        return {
            result: result,
            childInfo: childInfo
        };
    }
});