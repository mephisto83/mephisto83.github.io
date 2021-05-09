ComposerCompanion.CompositeEntry = function (args) {
    this.source = args.entrysource;
    this.configuration = args.configuration;
    this.editSpaceSource = args.getEditSpaceFunc;
    this.listeners = [];
    this.internalId = args.internalId;

    this.exportVariables = ['internalId', 'configuration'];
}

ComposerCompanion.CompositeEntry.prototype = {
    getBanks: function () {
        return this.configuration.banks;
    },
    addBank: function (bank) {
        if (!this.getBanks().contains(function (x) { return x == bank })) {
            this.configuration.banks.push(bank);
        }
    },
    getBankIndex: function (id) {
        var result = this.configuration.banks.indexWhere(function (x) { return x == id; });
        if (result)
            return result[0];
        throw 'error getBankIndex';
    },
    getByIndex: function (index) {
        var result = this.configuration.banks[index];
        return $cc.runtime.getBankEntry(result);
    },
    getOffsetBanks: function () {
        return this.configuration.offsets;
    },
    getSubStartTime: function (index) {
        return this.configuration.offsets[index].startTime;
    },
    getSubStartTimeById: function (id) {
        var result = this.configuration.offsets.first(function (x) { return x.compositeId == id; });
        if (result)
            return result.startTime;
        throw 'error';
    },
    export: function () {
        var exportobject = {};
        for (var i = 0 ; i < this.exportVariables.length ; i++) {
            exportobject[this.exportVariables[i]] = this[this.exportVariables[i]];
        }
        return exportobject;
    },
    getName: function () {
        return this.entryname;
    },
    edit: function () {
        if (this.ganttaChart) {
            return;
        }
        var space = this.editSpaceSource();
        var ganttaChart = new Mephistowa.GanttChart({ handles: true });
        ganttchart.properties({
            minzoom: 1,
            maxzoom: 300,
            zoom: 10,
            minimumItemWidth: 0,
            timestart: 0,
            autoscroll: true,
            rightPadding: 0
        });
        ganttchart.setRenderSpace(($cc.spaces.tracks));

        var timerow = new Mephistowa.Gantt.DataRow({ view: 'Time', viewClass: 'timerowClass', canAddOnClick: false });
        for (var i = 0 ; i < 32; i++) {
            timerow.addItem(new Mephistowa.Gantt.DataItem({ start: i, duration: .1, itemCls: 'timedata' }));
        }
        ganttchart.addDataRow(timerow);
        //ganttchart.addlistener('ganttchartrefresh', $cc.runtime.renderTopLevelRecordingSessionControls);
        ganttchart.renderData();
        this.ganttaChart = ganttaChart;
    },
    addToGantt: function (ganttchart) {

    },
    getStartTime: function () {
        return this.configuration.startTime;
    },
    addListener: function (type, func) {
        this.listeners.push({ type: type, func: func });
    },
    raise: function (type, args) {
        this.listeners.where(function (x) { return x.type == type; }).forEach(function (x) {
            x.func(args);
        });
    },
    getDuration: function () {
        if (this.configuration.beats) {
            return this.configuration.beats;
        }
        var endtime = this.configuration.offsets.max(function (x) {
            return x.startTime + x.duration;
        });
        var starttime = this.getStartTime();
        return endtime - starttime;
    },
    getDivisions: function () {
        debugger

        return 16;
    },
    updated: function () {
        this.raise('updated', {});
    },
    getSelectedNotes: function () {//Returns positons selected for notegrid;
        var notes = this.configuration.offsets.select(function (x) {
            var bankentry = $cc.runtime.getBankEntry(x.internalId);
            var index = this.getBankIndex(x.internalId);
            return [parseFloat(index.toString()),
                    parseFloat(x.startTime.toString()),
                    bankentry.getDuration(),
                    x.internalId,
                    x.compositeId];
        }.bind(this));
        return notes;
    },
    closeBank: function () {
        if (this.internalCloseBank) {
            this.internalCloseBank();
        }
    },
    getBankEntries: function (delay) {
        delay = delay || 0;
        var melodylistentries = this.getOffsetBanks().orderBy(function (x, y) {
            return x.startTime - y.startTime;
        }).concatFluent(function (y, index) {
            var bankentry = $cc.runtime.getBankEntry(y.internalId);
            if (bankentry instanceof ComposerCompanion.CompositeEntry) {
                return bankentry.getBankEntries(y.startTime + delay);
            }
            else {
                return [{
                    beat: y.startTime + delay,
                    delay: y.startTime + delay,
                    composite: true,
                    bankentry: bankentry
                }];
            }
        });
        return melodylistentries;
    },
    getNotes: function (notes, delay, totalduration) {
        var totalduration = 0;
        delay = delay || 0;

        var notes = [];

        var entries = this.getBankEntries(delay);
        entries.forEach(function (x) {
            var bankentry = x.bankentry;
            var delay = x.delay;
            var lastnote = { lastoffset: 0 };
            notes = notes.concat($cc.runtime.getNotes(bankentry.melodylist, delay, {
                keystyle: bankentry.keyStyle,
                keyoffset: $cc.runtime.getKeyOffset(bankentry),
                selectedBeat: bankentry.getDuration(),
                selectedDivisions: bankentry.getDivisions(),
                tempo: $cc.runtime.getRecordingTempo(),
                appendedValues: {
                    boxDuration: 1,
                    beatOffset: delay
                },
                selectedNotes: bankentry.selectedNotes,
                masterOffset: 0
            }, lastnote));
        });
        var newnotes = []
        notes = notes.orderBy(function (x, y) {
            if (x[0].event.appendedValues.beatOffset == y[0].event.appendedValues.beatOffset) {
                if (y[0].event.subtype == "noteOff") {
                    return -1;
                }
                if (x[0].event.subtype == "noteOff") {
                    return 1;
                }
            }
            return x[0].event.appendedValues.beatOffset - y[0].event.appendedValues.beatOffset;
        });
        notes.forEach(function (x, index) {

            if (index > 0) {
                notes[index][1] = notes[index][0].event.appendedValues.beatOffset
                                - notes[index - 1][0].event.appendedValues.beatOffset;
            }
            else {
                notes[index][1] = delay || 1;
            }
        });
        return notes;
    }
}
ComposerCompanion.CompositeEntry.createEntryDom = function (args, x, index) {
    if (args.entry) {
        if (args.entry.internalId !== x.internalId) {
            return;
        }
    }
    var span = $("<div>", { style: 'display:inline-block;' });
    var nameid = Mephistowa.GUID();
    var label = $("<label>", { text: 'Name', for: nameid });
    var text = $("<input>", {
        id: nameid,
        name: nameid
    });
    var change = function () {
        this.entry.entryname = this.text.val();
    }.bind({ entry: x, text: text })
    text.val(x.entryname);
    text.change(change);
    var namecontrolgroup = $cc.runtime.createControlGroup();
    namecontrolgroup.append(label);
    namecontrolgroup.append(text);
    span.append(namecontrolgroup);
    namecontrolgroup.trigger('create');
    x.entryname = x.entryname ? x.entryname : $cc.runtime.generateBankName();
    var hideshowbtn = $cc.runtime.createButton('Show/Hide', function () {
        if (this.entry.isShowing) {
            table.table.hide();
        }
        else {
            table.table.show();
        }
        this.entry.isShowing = !this.entry.isShowing;
    }.bind({ entry: x }, {}));
    span.append(hideshowbtn);
    x.height = 275;
    x.width = 275;
    var table = $cc.runtime.createTable(3, 1);

    if (x.isShowing == undefined) {
        x.isShowing = true;
    }
    else {
        if (x.isShowing) {
            table.table.show();
        }
        else {
            table.table.hide();
        }
    }
    x.internalCloseBank = function () {
        table.table.hide();
    }
    var canvas = $cc.runtime.createCanvas();
    canvas.css({ display: 'inline' });

    var button = $cc.runtime.createButton("X", function () {
        $cc.runtime.removeBankEntry(this);
    }.bind(x), {
        'data-icon': 'delete',
        'data-iconpos': 'notext'
    })

    var playbutton = $cc.runtime.createButton("Play", function () {
        $cc.runtime.playChords({ bankEntries: [{ bankentry: this }] }, {});
    }.bind(x), {
        'data-icon': 'arrow-r',
        'data-iconpos': 'notext'
    })//

    var editbutton = $cc.runtime.createButton("", function () {
    }.bind(x), {
        'data-icon': 'edit',
        'data-iconpos': 'notext'
    });

    var controlgroup = $cc.runtime.createControlGroup();
    var addoncontrolgroup = $cc.runtime.createControlGroup();
    var noplaystyle = $cc.runtime.createPlayStyleSelect();
    var select = $cc.runtime.createKeySelect();

    select.change(function () {
        var entry = this.be;
        var value = select.val();
        entry.lockedKey = value;
    }.bind({
        be: x,
        select: select
    }));

    if (x.lockedKey) {
        select.val(x.lockedKey);

    }
    else {
        var firstavailablekey = $cc.runtime.getFirstAvailableKey();
        select.val(firstavailablekey);
        x.lockedKey = firstavailablekey;
    }
    var notegrid = $cc.runtime.createNoteGrid({
        cellX: 16,
        cellY: x.getBanks().length,
        noDurationChange: true,
        noBeatSelect: true
    });

    notegrid.notegrid.cellselected(function (args) {
        var selectedNotes = args.notegrid.getSelected();
        var selectedDivisions = args.notegrid.divisions();
        var selectedBeats = args.notegrid.beats();
        var newoffsets = selectedNotes.select(function (x) {
            var id;
            var duration;
            var compositeId = Mephistowa.GUID();
            if (x[3]) {
                id = x[3];
                var entry = $cc.runtime.getBankEntry(id)
                compositeId = x[4];
                duration = entry.getDuration();
            }
            else {
                var index = x[0];
                var entry = this.getByIndex(index);
                id = entry.internalId;
                duration = entry.getDuration();
            }
            var result = {
                startTime: parseFloat(x[1].toString()),
                duration: duration,
                internalId: id,
                compositeId: compositeId
            }
            return result;
        }.bind(this));
        this.configuration.offsets = newoffsets;
        this.configuration.beats = parseFloat(selectedDivisions.toString());
        ;
    }.bind(x));

    notegrid.notegrid.addListener('cellover', function (args) {
        if (!x.hoverItem) {
            x.hoverItem = $("<div>", { class: 'bankEntryHoverItem' });
            x.hoverItem.css({ "position": 'absolute', zIndex: 1000 });
            x.hoverItem.appendTo($("body"));
        }
        var cell = args.notegrid.getCell(args.x, args.y);
        var output = '';

        if (x.getByIndex(args.x))
            output += x.getByIndex(args.x).entryname
        x.hoverItem.html(output);
        x.hoverItem.css({ top: event.pageY + 20, left: event.pageX + 20 })
        if (x.hoverTimout) {
            clearTimeout(x.hoverTimout);
        }
        x.hoverTimout = setTimeout(function () {
            x.hoverItem.animate({ top: "-1000px" });
            clearTimeout(x.hoverTimout);
        }, 5000)
    }.bind(x));

    notegrid.notegrid.copyselected(function (args) {
        $($cc.spaces.compositeBankOptionsSpace).html('');
        var list = $cc.runtime.createList();
        var me = this;
        var otherentries = $cc.runtime.getBankEntries().where(function (x) {
            return x.internalId != me.internalId && !me.getBanks().contains(function (y) {
                return y == x.internalId
            })
        });
        if (otherentries.length == 0)
            return;
        $($cc.popup.compositeBankOptions).popup("open");
        otherentries.forEach(function (x, index) {
            var li = $("<li>");
            var ahref = $("<a>", {
                href: '#',
                text: x.getName(),
                click: function () {
                    $($cc.popup.compositeBankOptions).popup("close");
                    me.addBank(x.internalId);
                    me.notegrid.setHeight(me.getBanks().length);
                    me.notegrid.refresh();
                }
            });
            li.append(ahref)
            list.append(li)
        });
        $($cc.spaces.compositeBankOptionsSpace).append(list);
        list.listview();
    }.bind(x));

    controlgroup.append(select);
    controlgroup.append(playbutton);
    controlgroup.append(editbutton);
    controlgroup.append(button);
    controlgroup.css({ width: 260, display: 'inline' });
    table.logicalrows[0][0].css({ position: 'relative' });

    table.logicalrows[1][0].append(controlgroup);
    table.logicalrows[2][0].append(notegrid.div);
    span.append((table.table));
    if (args.entry && args.entry.span) {
        span.insertBefore(args.entry.span);
        args.entry.span.remove();
    }
    else {
        $($cc.spaces.bankspace).append(span);
    }
    notegrid.notegrid.render();
    x.notegrid = notegrid.notegrid;
    span.trigger("create");
    x.span = span;


    if (x.getSelectedNotes()) {
        notegrid.notegrid.selectNotes(x.getSelectedNotes(), true);
    }
}