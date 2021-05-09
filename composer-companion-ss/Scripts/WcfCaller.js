typeof (Wcf) == "undefined" ? Wcf = {} : {};
Wcf.Caller = function (type, url, contenttype, datatype, processdata, loader) {
    this.type = type;
    this.url = url;
    this.contenttype = contenttype;
    this.datatype = datatype;
    this.processdata = processdata;
    this.loader = loader;
    this._onsucessfuncs = [];
    this._onerrorfuncs = [];
    this.clearOnSuccess = false;
}
Wcf.Caller.prototype = {
    callService: function (data, message) {
        if (message)
            this.loader.message(message);
        $.ajax({
            type: this.type, //GET or POST or PUT or DELETE verb
            url: this.url, // Location of the service
            data: data, //Data sent to server
            contentType: this.contenttype, // content type sent to server
            dataType: this.dataType, //Expected data format from server
            processdata: this.processData, //True or False
            success: (function (msg) {//On Successfull service call 
                var results = JSON.parse(msg.d);
                //HandleServiceResults(results); 
                for (var i = 0 ; i < this._onsucessfuncs.length; i++) {
                    this._onsucessfuncs[i](results);
                }
                if (this.clearOnSuccess) { this._onsucessfuncs = [] }
                this.loader.stop();
            }).bind(this),
            error: (function (e) {
                this.loader.stop();
                for (var i = 0 ; i < this._onerrorfuncs.length; i++) {
                    this._onerrorfuncs[i](results);
                }
            }).bind(this)
        });
    },
    add_onsuccess: function (func) {
        this._onsucessfuncs.push(func);
    },
    add_onerror: function (func) {
        this._onerrorfuncs.push(func);
    }
}