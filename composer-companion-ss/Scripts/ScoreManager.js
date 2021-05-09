ScoreManager = function (div, prev_measure_score, next_measure_score, curentpage_score) {
    this._divclass = "#" + div;
    this._curentpage_score = curentpage_score;
    this._currentMeasure = 0;
    this._currentPart = "P1";
    var movepage = (function (direction) {
        this._currentMeasure += direction;
        if (this._currentMeasure < 0) {
            this._currentMeasure = this._reader.getLastMeasureIndex();
        }
        if (this._currentMeasure > this._reader.getLastMeasureIndex()) {
            this._currentMeasure = 0;
        }
    }).bind(this);
    $(prev_measure_score).click((function () {
        movepage(-1);
        this.draw();
    }).bind(this));
    $(next_measure_score).click((function () {
        movepage(1);
        this.draw();
    }).bind(this));
    ScoreManager.Instance = this;
    this._drawer = new Vex.Drawer(div);
};
ScoreManager.Instance = null;
ScoreManager.ExpandHeight = function (amount) {
    if (ScoreManager.Instance) {
        ScoreManager.Instance.Reload(amount);
    }
}
ScoreManager.prototype = {
    Reload: function (heightplus) {
        var height = $(this._divclass).height();
        $(this._divclass).html("");
        $(this._divclass).height(height + heightplus);
        this._list = ScoreLibrary.ScoreDiv.Load(this._divclass, this._info);

    },
    draw: function () {
        var result = this._reader.generateVexFlowText(this._currentMeasure, this._currentPart);
        var height = this._reader.get_staffcount() * 125;
        var width = $(this._curentpage_score).parent().width();
        this._drawer.draw(result, parseInt(width - 10), height);
        this.drawPagerInfo();
    },
    drawPagerInfo: function () {
        $(this._curentpage_score).html("<span>" + (this._currentMeasure + 1) + "/" + (this._reader.getLastMeasureIndex() + 1) + "</span>");
    },
    Manage: function (scorefileinfo) {
        $(this._divclass).html("");
        this._info = scorefileinfo;
        var filereader = new FileReader();
        var loader = this;
        var reader = new ChordMaster.MusicXmlReader();
        filereader.onload = (function (event) {
            reader.parse($.parseXML(event.target.result));
            var result = reader.generateVexFlowText(0, this._currentPart);
            this.drawPagerInfo();
            this._drawer.draw(result);
        }).bind(this);
        filereader.onerror = function (e) { };
        this._reader = reader;
        filereader.readAsBinaryString(scorefileinfo);
    }
}