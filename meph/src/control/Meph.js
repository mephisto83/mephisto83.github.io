/**
 * @class MEPH.button.Button
 * Buton
 */
MEPH.define('MEPH.control.Meph', {
	alias: 'meph',
	requires: ['MEPH.util.Dom'],
	templates: true,
	properties: {
		injectControls: {
			location: 'inside'
		},
		defaultCls: ''
	},
	extend: 'MEPH.control.Control',
	initialize: function () {
		var me = this;
		me.great();
		me.addTransferableAttribute('class', {
			selector: 'div'
		});
	},
	onLoaded: function () {
		var me = this;
		var item = me.getFirstElement();
		var text = item.innerText;
		me.targetItem = item;
		me.$startText = text;
		var paths = MEPH.util.Template.getTemplatePaths(text);
		me.on('altered', function (type, path, c) {
			var a = c;
			paths.forEach(function (_path) {
				var res = MEPH.getPathValue(_path, me);
				if (res && res.on) {
					res.un(null, me);
					res.on('changed', function () {
						throttledRender();
					})
				}
			});
			throttledRender();
		});
		item.innerHTML = '';
		var throttledRender = MEPH.throttle(function () { me.renderTemplate() }, 500, me);
		throttledRender();
	},
	renderTemplate: function () {
		var me = this;
		var newHTml = MEPH.util.Template.bindTemplate(me.$startText, me);
		me.targetItem.innerHTML = newHTml;
	}
});