ComposerCompanion.RecordingSessionTrack = function (args) {

    this.bankEntries = [];
    this.exportVariables = [];
    for (var i in args) {
        this[i] = args[i];
        if (typeof (this[i]) != "function")
            this.exportVariables.push(i);
    }
    window.addListener("newintruments", this.updateAudioChannels.bind(this));
}

ComposerCompanion.RecordingSessionTrack.prototype = {
    updateAudioChannels: function (args) {
        var instruments = [{ text: window.naturalDefaultInstrument, value: window.naturalDefaultInstrument }];
        for (var i = 0; i < args.instruments.length ; i++) {
            instruments.push({ text: args.instruments[i], value: args.instruments[i] });
        }
        if (this.instrumentselect)
            $cc.runtime.updateSelect(this.instrumentselect, instruments);
    },
    export: function () {

        var exportobject = {
            bankEntries: this.bankEntries.select(function (x) {
                return {
                    dataitem: x.dataitem.export(),
                    beat: x.beat,
                    data: x.date,
                    bankentry: x.bankentry.export()
                }
            })
        }
        for (var i = 0 ; i < this.exportVariables.length; i++) {
            if (this[this.exportVariables[i]] && this[this.exportVariables[i]].export) {
                exportobject[this.exportVariables[i]] = this[this.exportVariables[i]].export();
            }
            else if (Array.isArray(this[this.exportVariables[i]])) {
                exportobject[this.exportVariables[i]] = this[this.exportVariables[i]].select(function (x) {
                    if (x.export) {
                        return x.export();
                    }
                    return x;
                })
            }
            else {
                exportobject[this.exportVariables[i]] = this[this.exportVariables[i]];
            }
        }
        return exportobject
    },
    addEntry: function (args) {
        this.bankEntries = this.bankEntries || [];
        var datarow = this.datarow;
        var item = datarow.addItem(new Mephistowa.Gantt.DataItem({
            start: this.beat,
            duration: 1
        }, "", {
            snap: 1 / 16
        }), {
            render: true
        });
        var startingBeat = (new Date().getTime() - this.start) / ($cc.runtime.beatsPerSecond());
        var entry = new ComposerCompanion.BankEntry({
            bankentry: args.bank,
            dataitem: item,
            beat: startingBeat,
            date: new Date().getTime() - this.start
        });

        entry.addListener('updated', function (bank) {
            this._data.duration = bank.getDuration();
            this.update();
        }.bind(item, args.bank));

        item.addListener("updated", $cc.runtime.itemUpdated.bind({
            item: item,
            entry: entry
        }));
        item._bank = args.bank;
        item.addListener("contextmenu", function (args) {
            $($cc.buttons.itemMenuCreateComposite).unbind();
            $($cc.buttons.itemMenuCreateComposite).click(function () {
                var selecteditems = $cc.variables.ganttchart.getItems().where(function (x) {
                    return (x.runtimeVariables && x.runtimeVariables.selected);
                });

                $cc.runtime.createCompositeBank(selecteditems.select(function (x) {
                    return x._bank;
                }), selecteditems, this.item.getRow())
            }.bind(this));
            $($cc.buttons.itemMenuRemove).unbind();
            $($cc.buttons.itemMenuRemove).click(function () {
                this.item.remove();
                this.session.remove(this.entry);
            }.bind({
                item: item,
                session: session,
                entry: entry
            }));
            $($cc.buttons.itemMenuSelect).unbind();
            var selectItem = function (item, select) {
                item.runtimeVariables = item.runtimeVariables || { selected: select };
                item.runtimeVariables.selected = select;
                if (select) {
                    item.getBox().addClass($cc.css.seletedItemCss);
                }
                else {
                    item.getBox().removeClass($cc.css.seletedItemCss);
                }
            };
            $($cc.buttons.itemMenuSelect).click(function () {
                this.item.runtimeVariables = this.item.runtimeVariables || { selected: false };
                this.item.runtimeVariables.selected = !this.item.runtimeVariables.selected;
                selectItem(this.item, this.item.runtimeVariables.selected)
            }.bind(this));
            $($cc.buttons.itemMenuSelectAll).unbind();
            $($cc.buttons.itemMenuSelectAll).click(function () {
                var selecteditems = this.item.getRow().getItems().where(function (x) {
                    return (x.runtimeVariables && x.runtimeVariables.selected);
                });
                this.item.getRow().getItems().forEach(function (x) {
                    selectItem(x, selecteditems.length == 0)
                });
            }.bind(this));
            $("#itemPopupMenu").popup("open");
        }.bind({
            item: item,
            entry: entry
        }));
        item.addListener('mouseout', function (args) {
        }.bind({
            item: item,
            entry: entry
        }))

        this.addBankEntry(entry);
    },
    remove: function (entry) {
        this.bankEntries.removeWhere(function (x) { return x == entry });
        if (this.onupdate) {
            this.onupdate(this);
        }
    },
    addBankEntry: function (entry) {
        this.bankEntries.push(entry);

        if (this.onupdate) {
            this.onupdate(this);
        }
    },
    update: function () {
        if (this.onupdate)
            this.onupdate(this);
    }
};
ComposerCompanion.RecordingSessionTrack.renderRecordingSessionControls = function (session) {
    var id = session.id;
    var space = $("." + id);
    space.html("");
    var controlgroup = $cc.runtime.createControlGroup({ 'data-mini': "true" });
    var ddcontrolgroup = $cc.runtime.createControlGroup({ 'data-mini': "true" });
    var button = $cc.runtime.createButton('Play', function () {
        $cc.runtime.playBackSession(this, 0);
    }.bind(session), {
        'data-icon': "arrow-r",
        'data-inline': true,
        'data-iconpos': 'notext'
    });
    var printbutton = $cc.runtime.createButton('Print', function () {
        $cc.runtime.printTrack(this, { instrument: session.instrument });
    }.bind(session), {
        'data-icon': "bars",
        'data-inline': true,
        'data-iconpos': 'notext'
    });
    var deleteSessionBtn = $cc.runtime.createButton('Delete', function () {
        $cc.runtime.removeSession(this);
    }.bind(session), {
        'data-icon': "delete",
        'data-inline': true,
        'data-iconpos': 'notext'
    });
    var options = [];
    for (var i = 0 ; i <= 50; i++) {
        options.push({ text: ((50 - i) / 50), value: (((50 - i) / 50)) * 5 - 2.5 });
    }
    var select = $cc.runtime.createSelect(options, {
        'data-mini': true,
        'data-inline': true,
        'data-iconpos': 'notext'
    });
    session.volume = 1;
    select.change(function () {
        session.volume = parseFloat(select.val());
    });
    select.val(100);
    var instruments = [];
    for (var i in window.MIDI.AudioBuffers) {
        instruments.push({ text: i, value: i });
    }
    var instrumentselect = $cc.runtime.createSelect(instruments, {
        'data-inline': true,
        'data-mini': true
    });
    instrumentselect.change(function () {
        session.instrument = instrumentselect.val();
    });
    session.instrumentselect = instrumentselect;
    controlgroup.append(button);
    ddcontrolgroup.append(select);
    ddcontrolgroup.append(instrumentselect);
    controlgroup.append(printbutton);
    controlgroup.append(deleteSessionBtn);
    space.append(controlgroup);
    space.append(ddcontrolgroup);
    button.button();
    space.trigger('create');
};