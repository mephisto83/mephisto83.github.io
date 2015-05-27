
MEPH.define('MEPH.qrcode.AlignmentPatternFinder', {
    requires: ['MEPH.qrcode.AlignmentPattern'],
    centerFromEnd: function (stateCount, end) {
        return (end - stateCount[2]) - stateCount[1] / 2.0;
    },
    foundPatternCross: function (stateCount) {
        var me = this;
        var moduleSize = me.moduleSize;
        var maxVariance = moduleSize / 2.0;
        for (var i = 0; i < 3; i++) {
            if (Math.abs(moduleSize - stateCount[i]) >= maxVariance) {
                return false;
            }
        }
        return true;
    },
    crossCheckVertical: function (startI, centerJ, maxCount, originalStateCountTotal) {
        var me = this;
        var qrcode = me.qrcode;
        var image = me.image;

        var maxI = qrcode.height;
        var stateCount = me.crossCheckStateCount;
        stateCount[0] = 0;
        stateCount[1] = 0;
        stateCount[2] = 0;

        // Start counting up from center
        var i = startI;
        while (i >= 0 && image[centerJ + i * qrcode.width] && stateCount[1] <= maxCount) {
            stateCount[1]++;
            i--;
        }
        // If already too many modules in this state or ran off the edge:
        if (i < 0 || stateCount[1] > maxCount) {
            return NaN;
        }
        while (i >= 0 && !image[centerJ + i * qrcode.width] && stateCount[0] <= maxCount) {
            stateCount[0]++;
            i--;
        }
        if (stateCount[0] > maxCount) {
            return NaN;
        }

        // Now also count down from center
        i = startI + 1;
        while (i < maxI && image[centerJ + i * qrcode.width] && stateCount[1] <= maxCount) {
            stateCount[1]++;
            i++;
        }
        if (i == maxI || stateCount[1] > maxCount) {
            return NaN;
        }
        while (i < maxI && !image[centerJ + i * qrcode.width] && stateCount[2] <= maxCount) {
            stateCount[2]++;
            i++;
        }
        if (stateCount[2] > maxCount) {
            return NaN;
        }

        var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
        if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
            return NaN;
        }

        return me.foundPatternCross(stateCount) ? me.centerFromEnd(stateCount, i) : NaN;
    },

    handlePossibleCenter: function (stateCount, i, j) {
        var me = this;
        var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
        var centerJ = me.centerFromEnd(stateCount, j);
        var centerI = me.crossCheckVertical(i, Math.floor(centerJ), 2 * stateCount[1], stateCountTotal);
        if (!isNaN(centerI)) {
            var estimatedModuleSize = (stateCount[0] + stateCount[1] + stateCount[2]) / 3.0;
            var max = me.possibleCenters.length;
            for (var index = 0; index < max; index++) {
                var center = me.possibleCenters[index];
                // Look for about the same center and module size:
                if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
                    return new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
                }
            }
            // Hadn't found this before; save it
            var point = new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
            me.possibleCenters.push(point);
            if (me.resultPointCallback != null) {
                me.resultPointCallback.foundPossibleResultPoint(point);
            }
        }
        return null;
    },
    find: function () {
        var me = this;
        var startX = me.startX;
        var qrcode = me.qrcode;
        var startY = me.startY;
        var image = me.image;
        var height = me.height;
        var maxJ = startX + me.width;
        var middleI = startY + (height >> 1);
        // We are looking for black/white/black modules in 1:1:1 ratio;
        // this tracks the number of black/white/black modules seen so far
        var stateCount = new Array(0, 0, 0);
        for (var iGen = 0; iGen < height; iGen++) {
            // Search from middle outwards
            var i = middleI + ((iGen & 0x01) == 0 ? ((iGen + 1) >> 1) : -((iGen + 1) >> 1));
            stateCount[0] = 0;
            stateCount[1] = 0;
            stateCount[2] = 0;
            var j = startX;
            // Burn off leading white pixels before anything else; if we start in the middle of
            // a white run, it doesn't make sense to count its length, since we don't know if the
            // white run continued to the left of the start point
            while (j < maxJ && !image[j + qrcode.width * i]) {
                j++;
            }
            var currentState = 0;
            while (j < maxJ) {
                if (image[j + i * qrcode.width]) {
                    // Black pixel
                    if (currentState == 1) {
                        // Counting black pixels
                        stateCount[currentState]++;
                    }
                    else {
                        // Counting white pixels
                        if (currentState == 2) {
                            // A winner?
                            if (me.foundPatternCross(stateCount)) {
                                // Yes
                                var confirmed = me.handlePossibleCenter(stateCount, i, j);
                                if (confirmed != null) {
                                    return confirmed;
                                }
                            }
                            stateCount[0] = stateCount[2];
                            stateCount[1] = 1;
                            stateCount[2] = 0;
                            currentState = 1;
                        }
                        else {
                            stateCount[++currentState]++;
                        }
                    }
                }
                else {
                    // White pixel
                    if (currentState == 1) {
                        // Counting black pixels
                        currentState++;
                    }
                    stateCount[currentState]++;
                }
                j++;
            }
            if (me.foundPatternCross(stateCount)) {
                var confirmed = me.handlePossibleCenter(stateCount, i, maxJ);
                if (confirmed != null) {
                    return confirmed;
                }
            }
        }

        // Hmm, nothing we saw was observed and confirmed twice. If we had
        // any guess at all, return it.
        if (!(me.possibleCenters.length == 0)) {
            return me.possibleCenters[0];
        }

        throw "Couldn't find enough alignment patterns";
    },

    initialize: function (qrcode, image, startX, startY, width, height, moduleSize, resultPointCallback) {
        var me = this;
        me.qrcode = qrcode;
        me.image = image;
        me.possibleCenters = new Array();
        me.startX = startX;
        me.startY = startY;
        me.width = width;
        me.height = height;
        me.moduleSize = moduleSize;
        me.crossCheckStateCount = new Array(0, 0, 0);
        me.resultPointCallback = resultPointCallback;


    }
});