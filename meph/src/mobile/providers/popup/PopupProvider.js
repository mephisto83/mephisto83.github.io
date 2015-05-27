/**
 * @class MEPH.mobile.providers.identity.FacebookProvider
 * A base class for identity providers.
 */
MEPH.define('MEPH.mobile.providers.popup.PopupProvider', {
    alternateNames: [],
    requires: ['MEPH.util.Template',
        'MEPH.mobile.providers.popup.template.OAuthIdentityLaunchTemplate'],
    properties: {
    },
    getTemplate: function () {
        var me = this;
        var temp = MEPH.getTemplate('MEPH.mobile.providers.popup.template.OAuthIdentityLaunchTemplate');
        if (temp) {
            return temp.template;
        }
        return null;
    },
    open: function (provider, link) {
        var me = this;

        switch (provider) {
            case 'linkedin':
                info = { type: 'linkedin', name: 'LinkedIn', iconclass: 'linkedin' };
                break;
        }
        info.target = '_blank';
        info.link = link;
        var template = me.getTemplate();
        var html = MEPH.util.Template.bindTemplate(template, info);
        var div = document.createElement('div');
        div.innerHTML = html;
        var btn = div.firstElementChild;
        document.body.appendChild(div.firstElementChild);
        return new Promise(function (resolve) {
            btn.addEventListener('click', function () {
                var w = window.open(link, '_blank', 'location=yes,toolbar=yes,width=200,height=200');
                if (btn.parentNode) {
                    btn.parentNode.removeChild(btn);
                }
                resolve(w);
            });
        })
    }
});