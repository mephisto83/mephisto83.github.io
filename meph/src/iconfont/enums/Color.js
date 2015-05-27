/*global MEPH*/

/**
* @class MEPH.iconfont.enums.Color
*
* This enumeration is a convenient way of defining an icon font
* color css selector when using the MEPH.iconfont.IconFont#color selector syntax.
*/
MEPH.define('MEPH.iconfont.enums.Color', {
    alternateNames: ['MEPH.iconfont.Color', 'Color'],
    statics: {
        getPrefix: function () {
            return 'meph-color';
        },
        /**
        * @property
        */
        Black: '-black',

        /**
        * @property
        */
        Purple: '-purple',

        /**
        * @property
        */
        Red: '-red',

        /**
        * @property
        */
        Green: '-green',

        /**
        * @property
        */
        Blue: '-blue',

        /**
        * @property
        */
        White: '-white',

        /**
        * @property
        */
        Orange: '-orange',

        /**
        * @property
        */
        MistyRose: '-misty-rose',

        /**
        * @property
        */
        Grey: '-grey'
    }
});
