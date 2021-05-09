ComposerCompanion.BankEntry = function (args) {

    this.listeners = [];
    this.exportVariables = [];
    for (var i in args) {
        this[i] = args[i];
        this.exportVariables.push(i);
    }
    this.isCompositeEntry = false;
}

ComposerCompanion.BankEntry.prototype = {
    export: function () {
        var exportobject = {};
        for (var i = 0 ; i < this.exportVariables.length ; i++) {
            exportobject[this.exportVariables[i]] = this[this.exportVariables[i]];
        }
        return exportobject;
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
        if (this.keyStyle == $cc.keystyles.chord) {
            return this.selectedBeats || 4;
        }
        return parseFloat(this.selectedBeats || 1);
    },
    getDivisions: function () {
        return parseFloat(this.selectedDivisions) || 16
    },
    getName: function () {
        return this.entryname;
    },
    setStart: function (start) {
    },
    getStartTime: function () {

        return this.startTime;
    },
    setDuration: function (duration) {
        this.selectedBeats = (duration);
    },
    closeBank: function () {
        if (this.internalCloseBank)
            this.internalCloseBank();
    },
    updated: function () {
        this.raise('updated', {});
    }
};
ComposerCompanion.BankEntry.createEntryDom = function (args, x, index) {
    if (args.entry) {
        if (args.entry.internalId !== x.internalId) {
            return;
        }
    }
    var keyspan = $("<span>", { class: 'keyspan' });
    var span = $("<div>", { style: 'display:inline-block;' });
    span.append(keyspan);
    var nameid = Mephistowa.GUID();
    var label = $("<span>", { text: '', for: nameid });
    var text = $("<input>", {
        id: nameid,
        name: nameid
    });
    var nameset = function (args, x, index, label) {
        var scales = $cc.runtime.getSelectedScales();
        var match = $cc.variables.chordMaster.findExactMatch(x.v, scales);
        if (!match) return;
        var text = $cc.runtime.keyText(match, x.rootbase + x.accidentals);
        x.entryname = text;
        label.html(text);
    }.bind(this, args, x, index, label);
    nameset();
    $cc.variables.chordMaster.add_oncomplete(nameset);
    //var change = function () {
    //    this.entry.entryname = this.text.val();
    //}.bind({ entry: x, text: text })
    //text.val(x.entryname);
    //text.change(change); 
    span.append(label);
    x.entryname = x.entryname ? x.entryname : $cc.runtime.generateBankName();
    var hideshowbtn = $cc.runtime.createButton('Show/Hide', function () {
        if (this.entry.isShowing) {
            table.table.hide();
        }
        else {
            table.table.show();
        }
        this.entry.isShowing = !this.entry.isShowing;
    }.bind({ entry: x }), {
        'data-icon': 'arrow-r',
        'data-iconpos': 'notext'
    });

    var toggleControlGroups = function (show) {
        if (this.entry.isEditing) {
            controlgroup.hide();
            addoncontrolgroup.hide();
            addoncontrolgroup2.hide();
            addoncontrolgroup3.hide();
            addoncontrolgroup4.hide();
        }
        else {
            controlgroup.show();
            addoncontrolgroup.show();
            addoncontrolgroup2.show();
            addoncontrolgroup3.show();
            addoncontrolgroup4.show();
            showAll(true);
        }
        this.entry.isEditing = !this.entry.isEditing;
    }.bind({ entry: x });

    var editbutton = $cc.runtime.createButton('Edit', function () { toggleControlGroups(); }, {
        'data-icon': 'arrow-r',
        'data-iconpos': 'notext'
    });
    span.append(hideshowbtn);
    span.append(editbutton);
    x.height = 275;
    x.width = 275;
    var table = $cc.runtime.createTable(7, 1);

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
    var showAll = function (show) {
        if (show) {
            table.table.show();
        }
        else {
            table.table.hide();
            this.isEditing = false;
        }
        this.isShowing = show;
    }.bind(x);
    x.internalCloseBank = showAll.bind(false);
    var canvas = $cc.runtime.createCanvas();
    canvas.css({ display: 'inline' });

    var button = $cc.runtime.createButton("X", function () {
        $cc.runtime.removeBankEntry(this);
    }.bind(x), {
        'data-icon': 'delete',
        'data-iconpos': 'notext'
    })

    var playbutton = $cc.runtime.createButton("Play", function () {
        $cc.runtime.play(this);
    }.bind(x), {
        'data-icon': 'arrow-r',
        'data-iconpos': 'notext'
    })//

    var optionsbutton = $cc.runtime.createButton("", function () {
        $cc.runtime.optionButtons(x);
        $cc.runtime.showOptions();
    }.bind(x), {
        'data-icon': 'gear',
        'data-iconpos': 'notext'
    });

    var controlgroup = $cc.runtime.createControlGroup();
    var addoncontrolgroup = $cc.runtime.createControlGroup();
    var addoncontrolgroup2 = $cc.runtime.createControlGroup();
    var addoncontrolgroup3 = $cc.runtime.createControlGroup();
    var addoncontrolgroup4 = $cc.runtime.createControlGroup();
    var noplaystyle = $cc.runtime.createPlayStyleSelect();
    var select = $cc.runtime.createKeySelect();

    if (x.isEditing == undefined) {
        x.isEditing = true;
    }
    else {
        x.isEditing = !x.isEditing;
    }
    var notegrid = $cc.runtime.createNoteGrid({
        cellX: x.selectedDivisions || 16,
        cellY: x.melodylist.length
    });
    select.change(function () {
        var entry = this.be;
        var value = select.val();
        entry.lockedKey = value;
    }.bind({
        be: x,
        select: select
    }));
    noplaystyle.change(function () {
        var entry = this.be;
        var value = noplaystyle.val();
        if (value == $cc.keystyles.userdefined) {
            entry.notegriddiv.show()
        }
        else {
            entry.notegriddiv.hide()
        }
        entry.keyStyle = value;
    }.bind({
        be: x,
        select: noplaystyle
    }));
    if (x.lockedKey) {
        select.val(x.lockedKey);
        keyspan.html("Key : " + x.lockedKey);
    }
    else {
        var firstavailablekey = $cc.runtime.getFirstAvailableKey();
        select.val(firstavailablekey);
        x.lockedKey = firstavailablekey;
        keyspan.html("Key : " + x.lockedKey);
        select.change(function () {

            keyspan.html("Key : " + select.val());
        }.bind(select));
    }
    if (x.keyStyle) {
        noplaystyle.val(x.keyStyle);
    } else
        noplaystyle.val($cc.keystyles.chord);

    var invertbtn = $cc.runtime.createButton("", $cc.runtime.invertEntry.bind(x), {
        'data-icon': 'refresh',
        'data-iconpos': 'notext'
    });
    var stpupbtn = $cc.runtime.createButton("", $cc.runtime.stepUp.bind(x, +1), {
        'data-icon': 'arrow-u',
        'data-iconpos': 'notext'
    });
    var stpdownbtn = $cc.runtime.createButton("", $cc.runtime.stepUp.bind(x, -1), {
        'data-icon': 'arrow-d',
        'data-iconpos': 'notext'
    });


    var stpup2ndbtn = $cc.runtime.createButton("", $cc.runtime.stepUp.bind(x, +2), {
        'data-icon': 'arrow-u',
        text: '2nd'
    });
    var stpdown2ndbtn = $cc.runtime.createButton("", $cc.runtime.stepUp.bind(x, -2), {
        'data-icon': 'arrow-d',
        text: '2nd'
    });


    var stpdown3rdbtn = $cc.runtime.createButton("", $cc.runtime.stepUp.bind(x, 4), {
        'data-icon': 'arrow-u',
        text: '3rd'
    });
    var stpdownD3rdbtn = $cc.runtime.createButton("", $cc.runtime.stepUp.bind(x, -4), {
        'data-icon': 'arrow-d',
        text: '3rd'
    });

    var stpdown4thbtn = $cc.runtime.createButton("", $cc.runtime.stepUp.bind(x, 5), {
        'data-icon': 'arrow-u',
        text: '4th'
    });
    var stpdownD4thbtn = $cc.runtime.createButton("", $cc.runtime.stepUp.bind(x, -5), {
        'data-icon': 'arrow-d',
        text: '4th'
    });


    var stpdown5rdbtn = $cc.runtime.createButton("", $cc.runtime.stepUp.bind(x, 7), {
        'data-icon': 'arrow-u',
        text: '5th'
    });
    var stpdownD5rdbtn = $cc.runtime.createButton("", $cc.runtime.stepUp.bind(x, -7), {
        'data-icon': 'arrow-d',
        text: '5th'
    });

    var stpdown7thbtn = $cc.runtime.createButton("", $cc.runtime.stepUp.bind(x, 10), {
        'data-icon': 'arrow-u',
        text: '7th'
    });
    var stpdownD7thbtn = $cc.runtime.createButton("", $cc.runtime.stepUp.bind(x, -10), {
        'data-icon': 'arrow-d',
        text: '7th'
    });

    var stpdownOctavebtn = $cc.runtime.createButton("", $cc.runtime.stepUp.bind(x, 12), {
        'data-icon': 'arrow-u',
        text: '8ct'
    });
    var stpdownDOctavehbtn = $cc.runtime.createButton("", $cc.runtime.stepUp.bind(x, -12), {
        'data-icon': 'arrow-d',
        text: '8ct'
    });
    var rhythmBtn = $cc.runtime.createButton("Rhythm", $cc.runtime.openRhythmPanel.bind(x), {
        'data-icon': 'arrow-d',
        'data-iconpos': 'notext'
    });
    controlgroup.append(select);
    controlgroup.append(playbutton);
    controlgroup.append(optionsbutton);
    controlgroup.append(button);
    controlgroup.append(rhythmBtn);
    addoncontrolgroup.append(noplaystyle);
    addoncontrolgroup.append(invertbtn);
    addoncontrolgroup.append(stpupbtn);
    addoncontrolgroup.append(stpdownbtn);
    addoncontrolgroup2.append(stpup2ndbtn);
    addoncontrolgroup2.append(stpdown2ndbtn);
    addoncontrolgroup2.append(stpdown3rdbtn);
    addoncontrolgroup2.append(stpdownD3rdbtn);
    addoncontrolgroup3.append(stpdown4thbtn);
    addoncontrolgroup3.append(stpdownD4thbtn);
    addoncontrolgroup3.append(stpdown5rdbtn);
    addoncontrolgroup3.append(stpdownD5rdbtn);
    addoncontrolgroup4.append(stpdown7thbtn);
    addoncontrolgroup4.append(stpdownD7thbtn);
    addoncontrolgroup4.append(stpdownOctavebtn);
    addoncontrolgroup4.append(stpdownDOctavehbtn);


    controlgroup.css({ width: 260, display: 'inline' });
    table.logicalrows[0][0].css({ position: 'relative' });
    table.logicalrows[0][0].append(canvas);
    table.logicalrows[1][0].append(controlgroup);
    table.logicalrows[2][0].append(notegrid.div);
    notegrid.notegrid.cellselected(function (args) {
        this.selectedNotes = args.notegrid.getSelected();
        this.selectedDivisions = args.notegrid.divisions();
        this.selectedBeats = args.notegrid.beats();
    }.bind(x));
    notegrid.notegrid.addListener('cellover', function (args) {
        if (!x.hoverItem) {
            x.hoverItem = $("<div>", { class: 'bankEntryHoverItem' });
            x.hoverItem.css({ "position": 'absolute', zIndex: 1000 });
            x.hoverItem.appendTo($("body"));
        }
        var cell = args.notegrid.getCell(args.x, args.y);
        var output = '';
        if (cell.value) {
            var note = x.melodylist[cell.value[0]];
            output += note.key + note.accidental + "/" + note.octave;
        }
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
        $cc.runtime.addToRhythmBank(args.selected, {
            cellX: args.divisions,
            cellCss: 'smallcell',
            cellWidth: 10,
            rowCss: 'smallrow',
            args: args,
            cellY: x.melodylist.length
        });
    }.bind(x));
    x.notegriddiv = notegrid.div;
    x.notegrid = notegrid.notegrid;
    x.notegrid.addListener('cellselected', x.updated.bind(x));
    table.logicalrows[3][0].append(addoncontrolgroup);
    table.logicalrows[4][0].append(addoncontrolgroup2);
    table.logicalrows[5][0].append(addoncontrolgroup3);
    table.logicalrows[6][0].append(addoncontrolgroup4);

    span.append((table.table));
    span.addClass('bankentry');
    if (args.entry) {
        span.insertBefore(args.entry.span);
        args.entry.span.remove();
    }
    else {
        $($cc.spaces.bankspace).append(span);
    }
    span.trigger("create");
    x.span = span;
    var melodystaffcanvas = new Vex.Drawer(canvas[0].id);
    x.drawer = melodystaffcanvas;
    $cc.runtime.draw(x);
    notegrid.notegrid.render();
    if (x.selectedBeats) {
        notegrid.notegrid.beats(x.selectedBeats, true);
    }
    if (x.selectedDivisions) {
        notegrid.notegrid.divisions(x.selectedDivisions, true);
    }
    if (x.selectedNotes) {
        notegrid.notegrid.selectNotes(x.selectedNotes, true);
    }
    toggleControlGroups();
    notegrid.notegrid.requestOptions($cc.runtime.displayRhythmOptions.bind({ entry: x }));
    var value = noplaystyle.val();
    if (value == $cc.keystyles.userdefined) {
        x.notegriddiv.show()
    }
    else {
        x.notegriddiv.hide();
    }

}