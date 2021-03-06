﻿/**
 * @class MEPH.util.FileReader
 * Reads files.
 **/
MEPH.define('MEPH.util.FileReader', {
    statics: {
        /**
         * Gets all the views in the application.
         * @param {Object} fileList
         * @param {Object} options
         * @return {Promise}
         **/
        readFileList: function (fileList, options) {
            var me = this;
            options = options || {};
            var promises = [];

            for (var i = 0 ; i < fileList.length; i++) {
                promises.push(Promise.resolve().then(function (file) {
                    var newprom = new Promise(function (r, s) {

                        var reader = new FileReader();
                        reader.onload = function (event) {

                            r({
                                file: file,
                                res: event.target.result
                            });
                        };
                        console.log(file);
                        switch (options.readas) {
                            case 'ArrayBuffer':
                                reader.readAsArrayBuffer(file);
                                break;
                            case 'BinaryString':
                                reader.readAsBinaryString(file);
                                break;
                            case 'String':
                                reader.readAsText(file);
                                break;
                            default:
                                reader.readAsDataURL(file);
                                break;
                        }

                    });
                    return newprom;
                }.bind(me, fileList[i])))

            }
            return Promise.all(promises);
        }
    }
});