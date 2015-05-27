
MEPH.define('MEPH.graph.renderer.CanvasRenderer', {
    requires: ['MEPH.util.Renderer'],
    properties: {
    },
    statics: {
        defaultKey: 'default',
        $canvasCache: null,
        defaultOptions: {
            canvas: {
                attributes: {
                    height: 300,
                    width: 400
                }
            }
        }//,
        //cacheDomBag: document.body
    },
    initialize: function () {
        var me = this;
        MEPH.graph.renderer.CanvasRenderer.$canvasCache = MEPH.graph.renderer.CanvasRenderer.$canvasCache ||
            MEPH.util.Observable.observable([]);
        me.$canvasCache = MEPH.graph.renderer.CanvasRenderer.$canvasCache;
        me.renderer = new MEPH.util.Renderer();
    },
    setCanvas: function (canvas) {
        var me = this;
        me.$canvas = canvas;
        me.renderer.setCanvas(canvas);
    },
    drawToCache: function (key, options) {
        key = key || MEPH.graph.renderer.CanvasRenderer.defaultKey;
        var me = this,
            renderer = me.clearCache(key);
        if (!renderer) {
            renderer = me.createCache(key);
        }
        renderer.draw(options);
    },
    drawCached: function (options, key) {
        key = key || MEPH.graph.renderer.CanvasRenderer.defaultKey;
        options = options || {};
        var me = this;
        var cache = me.getCached(key);
        options.shape = pgx.Renderer.shapes.canvas;
        options.canvas = cache.renderer.getCanvas();
        if (cache.renderer) {
            me.renderer.draw(options);
        }
    },
    getCached: function (key) {
        var me = this;
        key = key || MEPH.graph.renderer.CanvasRenderer.defaultKey;
        return me.$canvasCache.first(function (x) { return x.key === key });
    },
    createCache: function (key, renderer, options) {
        var me = this;
        var cacheValues = {
            key: key,
            options: options || me.getDefaultOptions(),
            renderer: renderer || me.getRenderer(),
        }
        me.$canvasCache.push(cacheValues);
        return cacheValues.renderer;
    },
    getDefaultOptions: function () {
        return MEPH.graph.renderer.CanvasRenderer.defaultOptions;
    },
    getRenderer: function () {
        var me = this;
        var renderer = new MEPH.util.Renderer();
        var canvas = me.getCanvas();
        renderer.setCanvas(canvas);
        return renderer;
    },
    getCanvas: function () {
        MEPH.graph.renderer.CanvasRenderer.cacheDomBag = MEPH.graph.renderer.CanvasRenderer.cacheDomBag || document.body;
        var me = this,
            canvas = document.createElement('canvas');
        MEPH.graph.renderer.CanvasRenderer.cacheDomBag.appendChild(canvas);
        me.applyCanvasOptions(canvas);
        return canvas;
    },
    applyCanvasOptions: function (canvas, options) {
        options = options || MEPH.graph.renderer.CanvasRenderer.defaultOptions.canvas.attributes;
        for (var i in options) {
            canvas.setAttribute(i, options[i]);
        }
    },
    clearCache: function (key) {
        var me = this;
        var result = false;
        me.$canvasCache.where(function (x) {
            result = x.renderer;
            return x.key === key;
        }).foreach(function (x) {
            x.renderer.clear();
        });
        return result;
    },
    purgeCache: function () {
        MEPH.graph.renderer.CanvasRenderer.$canvasCache.removeWhere(function (x) {
            x.renderer.destroy(true);
            return true;
        });
    },
    destroy: function (deep) {
        var me = this;
        if (deep) {
            me.purgeCache();
        }
        me.renderer.destroy(deep);
    },
    destroyCache: function (key) {
        MEPH.graph.renderer.CanvasRenderer.$canvasCache.removeWhere(function (x) {
            if (x.key === key) {
                x.renderer.destroy(true);
                return true;
            }
            return false;
        });
    },
    renderNode: function (node, canvas) {
        throw 'not implemented';
    },
    setOptions: function (options) {
        var me = this;
        me.$options = options;
    },
    getOptions: function () {
        var me = this;
        return me.$options;
    },
    render: function () {
        var me = this;
        me.draw(me.getOptions());
    },
    draw: function (options) {
        throw 'must implement this function';
    }
}).then(function () {
    if (window.document && document.body)
        MEPH.graph.renderer.CanvasRenderer.cacheDomBag = document.body;
});