MEPH.define('MEPH.mobile.pages.style.StyleOptions', {
    alias: 'meph_mobile_pages_style_options',
    templates: true,
    extend: 'MEPH.mobile.activity.container.Container',
    mixins: ['MEPH.mobile.mixins.Activity'],
    injections: ['storage'],
    requires: ['MEPH.input.Dropdown',
        'MEPH.util.Observable'],
    properties: {
        stylesource: null,
        palette: null,
        font: null,
        fontsource: null
    },
    onLoaded: function () {
        var me = this;
        me.great();
        me.stylesource = MEPH.util.Observable.observable([
        { name: 'secretkey', value: 'secretkey' },

        { name: 'scd', value: 'scd' }]);
        ['melonfree', 'gluepro', 'squarefactor', 'veloster', 'aromatespixels',
            'barnidesign', 'softwaremill', 'enterprise', 'likethereisnotomorrow',

            'rscollab', 'pawstudio', 'viximo', 'dcnaf', 'bogart',
            'spektrum', 'chevalblanc', 'nasaprospect', 'tvsafety', 'lerenzo',
            'gubbmackie', 'neilsonphoto', 'kikkfest', 'thesearethings',
            'theshihab', 'duplos', 'speedmotion', 'cuisinesschmidt',
            'dashag', 'sqd', 'meetinnov', 'mashastudio',
            'kavat', 'fernando', 'josefk', 'activatemedia',
            'heimplanet',
            'fitznaughty', 'eldisgno'].foreach(function (x) {
                me.stylesource.push({ name: x, value: x });
            })
        me.stylesource = me.stylesource.orderBy(function (x, y) {
            return x.name.localeCompare(y.name);
        });
        me.palette = me.stylesource.last();
        var
        fonts = [{ "family": "Glyphicons Halflings" }, { "family": "FontAwesome" }, { "family": "Oswald" }, { "family": "Actor" }, { "family": "Amaranth" }, { "family": "Arvo" }, { "family": "Average" }, { "family": "Bevan" }, { "family": "Crimson Text" }, { "family": "Droid Sans" }, { "family": "EB Garamond" }, { "family": "Fjord One" }, { "family": "Forum" }, { "family": "Gentium Basic" }, { "family": "Gravitas One" }, { "family": "Italiana" }, { "family": "Josefin Slab" }, { "family": "Jura" }, { "family": "Kreon" }, { "family": "Lato" }, { "family": "Ledger" }, { "family": "Old Standard TT" }, { "family": "Open Sans" }, { "family": "Open Sans Condensed" }, { "family": "Poly" }, { "family": "Roboto Slab" }, { "family": "Rosario" }, { "family": "Signika" }, { "family": "Ubuntu" }, { "family": "Vollkorn" }];
        //document.fonts.forEach(function (x) {
        //    fonts.push(x);
        //});
        fonts = fonts.unique(function (x) {
            return x.family;
        });


        me.font = fonts.first();
        me.fontsource = MEPH.util.Observable.observable(fonts);
        me.when.injected.then(function () {
            me.$inj.storage.get('style-option-font').then(function (t) {
                if (t) {
                    document.body.setAttribute('font-palette', t);

                    me.palette = t;

                }
            });;
            me.$inj.storage.get('style-option-palette').then(function (t) {
                if (t) {
                    document.body.setAttribute('color-palette', t);
                }
            });
        });
    },
    fontChanged: function (font) {
        var me = this;
        me.when.injected.then(function () {
            me.$inj.storage.set('style-option-font', font.family);
            me.palette = font.family;
        })
        document.body.setAttribute('font-palette', font.family);
    },
    paletteChanged: function (palette) {
        var me = this;
        me.when.injected.then(function () {
            me.$inj.storage.set('style-option-palette', palette.value);
        })
        document.body.setAttribute('color-palette', palette.value);
    }
});