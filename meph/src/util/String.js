
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

if (!String.prototype.splitAddLast) {
    Object.defineProperty(String.prototype, 'splitAddLast', {
        enumerable: false,
        writable: true,
        configurable: true,
        value: function (_str, add) {
            var str = this;
            var index = str.lastIndexOf(_str);
            if (index !== -1)
                return str.substr(0, index + 1) + add + str.substr(index + 1, str.length - index);
            return add + str;
        }
    });
}

if (!String.prototype.trim)
    String.prototype.trim = function () { return this.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); };

if (!String.prototype.ltrim)
    String.prototype.ltrim = function () { return this.replace(/^\s+/, ''); };

if (!String.prototype.rtrim)
    String.prototype.rtrim = function () { return this.replace(/\s+$/, ''); };

if (!String.prototype.fulltrim)
    String.prototype.fulltrim = function () { return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' '); };

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
/**
 * @method nodename
 * @returns {String} returns a string appropriate for a node.
 **/
if (!String.prototype.nodename) {
    Object.defineProperty(String.prototype, 'nodename', {
        enumerable: false,
        writable: true,
        configurable: true,
        value: function (suffix) {
            return this.split(' ').join('_').replace(new RegExp("-", 'g'), '_');
        }
    });
}


if (!Array.prototype.parseInt)
    Array.prototype.parseInt = function (base) {
        var result = [];
        for (var i = 0; i < this.length; i++) {
            result.push(parseInt(this[i], base));
        }
        return result;
    }
if (!Array.prototype.chordInversion)
    Array.prototype.chordInversion = function (shiftamount) {
        var result = [];
        for (var i = 0; i < this.length; i++) {
            result.push(this[i]);
        }
        for (var i = 0 ; i < shiftamount ; i++) {
            var value = result.shift();
            result.push(value);
        }
        return result;

    }
if (!Array.prototype.chordNormalize)
    Array.prototype.chordNormalize = function (base) {
        var changeamount = this[0];
        var result = [];
        for (var i = 0 ; i < this.length; i++) {
            var _i = (this[i] - changeamount);
            if (_i < 0) {
                _i += base;
            }
            while (result[result.length - 1] > _i) {
                _i += base;
            }
            result.push(_i);
        }

        return result;
    }
if (!Array.prototype.isVoiceInScale)
    Array.prototype.isVoiceInScale = function (array) {
        for (var i = 0 ; i < this.length; i++) {
            if (array.indexOf(parseInt(this[i]) % 12) == -1) {
                return false;
            }
        }
        return true;
    }
if (!Array.prototype.convertToVVoice) {
    Array.prototype.convertToVVoice = function () {
        var result = "V";
        for (var i = 0 ; i < this.length; i++) {
            result += this[i].toString(12);
        }
        return result.toUpperCase();
    }
}
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    }
}

if (!String.prototype.splice)
    String.prototype.splice = function (index, howManyToDelete, stringToInsert /* [, ... N-1, N] */) {
        var characterArray = this.split("");
        Array.prototype.splice.apply(
        characterArray,
        arguments
        );
        return (
        characterArray.join("")
        );

    };

if (!String.prototype.parseAndSlice)
    String.prototype.parseAndSlice = function () {
        return this.split("").parseInt(12);
    }
if (!String.prototype.parseAndSliceDouble)
    String.prototype.parseAndSliceDouble = function () {
        var spit = this.trim().split("");
        spit.shift();
        var result = [];
        for (var i = 0 ; i < spit.length; i = i + 2) {
            result.push((spit[i] + "" + spit[i + 1]));
        }
        return result;
    }
if (!String.prototype.nth)
    String.prototype.nth = function (j) {
        if (j == 1) {
            return "1st";
        }
        if (j == 2)
            return "2nd";
        if (j == 3)
            return "3rd";
        if (j == 0)
            return "";
        return j + "th";
    }


MEPH.define('MEPH.util.String', {});