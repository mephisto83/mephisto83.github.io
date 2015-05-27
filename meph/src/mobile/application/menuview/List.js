/**
 * @class MEPH.mobile.application.menuview.List
 */
MEPH.define('MEPH.mobile.application.menuview.List', {
    extend: 'MEPH.list.List',
    requires: ['MEPH.util.Dom'],
    templates: true,
    alias: 'menuview_list',
    /**
     * Removes an item visually.
     * @returns {Promise}
     **/
    removeItem: function (item) {
        var me = this;
        return Promise.resolve().then(function () {
            promises = me.getDomElements(item).where(MEPH.util.Dom.isElement).select(function (item) {
                return Promise.resolve().then(function () {
                    return new Promise(function (resolve) {
                        if (item.addEventListener) {
                            var transitionhandler = function () {
                                resolve(item);
                            };
                            item.addEventListener('transitionend', transitionhandler);
                            item.addEventListener('webkitTransitionEnd', transitionhandler);
                            if (item.classList) {
                                item.classList.add('meph-item-removal');
                            }
                        }
                        else {
                            resolve(item);
                        }
                        setTimeout(function () {
                            resolve(item);
                        }, 2000);
                    });
                });
            });
            return Promise.all(promises).then(function () {
                return item;
            });
        });
    }
});