
/**
 * @class MEPH.util.String
 * String
 */

/**
 * @method capitaliseFirstLetter
 * Capitalises the first character of a string.
 **/
if (!String.prototype.capitaliseFirstLetter) {
    Object.defineProperty(String.prototype, 'capitaliseFirstLetter', {
        enumerable: false,
        writable: true,
        configurable: true,
        value: function () {
            var string = this;
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    });
}

/**
 * @method startsWith
 * @returns {Boolean} true if string starts with false if otherwise.
 **/
if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        writable: true,
        configurable: true,
        value: function (suffix) {
            return this.indexOf(suffix, 0) === 0;
        }
    });
}

/**
 * @method after
 * @param {String} suffix
 * @returns {String} gets the string after the first instance of the suffix or null.
 **/
if (!String.prototype.after) {
    Object.defineProperty(String.prototype, 'after', {
        enumerable: false,
        writable: true,
        configurable: true,
        value: function (suffix) {
            var start = this.indexOf(suffix, 0);
            if (start !== -1) {
                return this.substr(start + suffix.length, this.length - (start + suffix.length));
            }
            return null;
        }
    });
}