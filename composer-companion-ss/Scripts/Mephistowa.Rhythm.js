var Mephistowa = Mephistowa || {};
Mephistowa.Rhythm = function (options) {
    options = options || {};
    this.listeners = [];
    this.rhythms = [];
    for (var i in options) {
        this["set_" + i] = function (i, value) {
            this["_" + i] = value;
        }.bind(this, i);
        this["get_" + i] = function (i) {
            return this["_" + i];
        }.bind(this, i);
        this["set_" + i](options[i]);
    }
    this.addListener('updaterhythms', this.updateRhythms.bind(this))
}
Mephistowa.Rhythm.prototype = {
    raise: function (type, args) {
        this.listeners.where(function (x) { return x.type == type })
		.foreach(function (x, index) {
		    x.func(args)
		});
    },
    addListener: function (type, func) {
        this.listeners.push({ type: type, func: func });
    },
    getRhythms: function () {
        return this.rhythms;
    },
    setRhythms: function (rhythms) {
        this.rhythms = rhythms;
        this.raise('updaterhythms', {});
    },
    copyselectedBeat: function () {
        if (this.text.val()) {
            this.rhythms.push({
                name: this.text.val(),
                notegridinfo: this.notegrid.getInfo()
            });
            this.raise('updaterhythms', {});
        }
    },
    updateRhythms: function () {
        this.rhythmCountSpan.html("Rhythm # " + this.rhythms.length);
    },
    setNoteGrid: function (rhythm) {
        this.applySpaceSpan.html(rhythm.name);
        this.applyNoteGrid.divisions(rhythm.notegridinfo.divisions);
        this.applyNoteGrid.beats(rhythm.notegridinfo.beats);
        this.applyNoteGrid.selectNotes(rhythm.notegridinfo.selected);
    },
    createNoteGridApplySpace: function () {
        var space = $(this.get_rhythmApplySpace());
        var span = $("<span>");
        this.applySpaceSpan = span;
        space.append(span);

        var notegrid = $cc.runtime.createNoteGrid({
            cellX: 16,
            nocopy: true,
            cellY: 4
        });

        $(space).append(notegrid.div);
        notegrid.notegrid.setNoteEditable(true);
        notegrid.notegrid.render();
        this.applyNoteGrid = notegrid.notegrid;
        var temp = [].enumerate(1, 5, function (x) { return { text: x, value: x } });
        var select = $cc.runtime.createSelect(temp);
        var button = $cc.runtime.createButton("Apply", function () {
            var selectval = select.val();
            var entry = this.getEntry();
            entry.notegrid.beats(this.applyNoteGrid.beats());
            entry.notegrid.divisions(this.applyNoteGrid.divisions());
            var pattern = this.applyNoteGrid.getSelected().where(function (x) { return x[0] == (selectval - 1) });
            var result = [];
            pattern.foreach(function (x) {
                var r = [].enumerate(0, entry.v.length, function (y) {
                    var temp = x.clone();
                    temp[0] = y.toString();
                    return temp;
                });
                result = result.concat(r);
            }.bind(this));
            entry.notegrid.selectNotes(result);
            entry.notegrid.refresh();
        }.bind(this));
        space.append(select);
        space.append(button);
        space.trigger('create');
    },
    setEntry: function (entry) {
        this.entry = entry;
    },
    getEntry: function () {
        return this.entry;
    },
    init: function () {
        $(this.get_rhythmApplyPanel()).panel();
        var notegrid = $cc.runtime.createNoteGrid({
            cellX: 16,
            nocopy: false,
            cellY: 4
        });
        var result = $cc.runtime.createText("Name")
        var span = $("<span>");
        $(this.get_space()).append(span);
        this.rhythmCountSpan = span;
        $(this.get_space()).append(result.group);
        $(this.get_space()).append(notegrid.div);
        notegrid.notegrid.setNoteEditable(false);
        notegrid.notegrid.render();
        this.text = result.text;
        this.notegrid = notegrid.notegrid;
        notegrid.notegrid.addListener('copyselected', this.copyselectedBeat.bind(this));
        result.group.trigger("create");
        var me = this;
        this.createNoteGridApplySpace();
        $(this.get_rhythmSearch()).on("listviewbeforefilter", function (e, data) {
            var $ul = $(this),
                $input = $(data.input),
                value = $input.val(),
                html = "";
            $ul.html("");
            if (value && value.length > 0) {
                var results = me.getRhythms().where(function (x) { return x.name.toLowerCase().indexOf(value) != -1 })
                .foreach(function (x, index) {

                    $ul.append($("<li>").append($("<a>", {
                        href: '#',
                        text: x.name,
                        click: function (rhythm) {
                            $(me.get_rhythmApplyPanel()).panel("open");
                            me.setNoteGrid(rhythm);
                        }.bind(me, x)
                    })));
                });
            }
            // $ul.html(html);
            $ul.listview("refresh");
            $ul.trigger("updatelayout");
        });
    }
}