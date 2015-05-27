/*global MEPH*/

/**
* @class MEPH.iconfont.enums.Size
*
* This enumeration is a convenient way of defining an icon font size selector when using the U4.iconfont.IconFont#color selector syntax.
* In the U4UX Sass library, a default size variable is defined for font icons, and a predefined set of size selectors are included.
* This class can be used to apply these size selectors. #D4 = default font size divided by four. #X10 = default font size multiplied with ten.
*/
MEPH.define('MEPH.iconfont.enums.Size', {
    alternateNames: 'MEPH.iconfont.Size',
    statics: {
        getPrefix: function () {
            return 'meph-size';
        },
        /**
        * @property
        * Smallest size [defualt size / 4].
        */
        D4: '-d4',

        /**
        * @property
        */
        D3: '-d3',

        /**
        * @property
        */
        D2: '-d2',

        /**
        * @property
        */
        X1: '-x1',

        /**
        * @property
        */
        X2: '-x2',

        /**
        * @property
        */
        X3: '-x3',

        /**
        * @property
        */
        X4: '-x4',

        /**
        * @property
        */
        X5: '-x5',

        /**
        * @property
        */
        X6: '-x6',

        /**
        * @property
        */
        X7: '-x7',

        /**
        * @property
        */
        X8: '-x8',

        /**
        * @property
        */
        X9: '-x9',

        /**
        * @property
        * Largest size [default size * 10].
        */
        X10: '-x10'
    }
});
