
MEPH.define('MEPH.qrcode.finder.FinderPatternFinder', {
    requires: ['MEPH.qrcode.finder.FinderPatternInfo',
                'MEPH.qrcode.finder.FinderPattern'],
    properties: {
        image: null
    },
    foundPatternCross: function (stateCount) {
        var totalModuleSize = 0;
        var me = this;
        for (var i = 0; i < 5; i++) {
            var count = stateCount[i];
            if (count == 0) {
                return false;
            }
            totalModuleSize += count;
        }
        if (totalModuleSize < 7) {
            return false;
        }
        var moduleSize = Math.floor((totalModuleSize << INTEGER_MATH_SHIFT) / 7);
        var maxVariance = Math.floor(moduleSize / 2);
        // Allow less than 50% variance from 1-1-3-1-1 proportions
        return Math.abs(moduleSize - (stateCount[0] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(moduleSize - (stateCount[1] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(3 * moduleSize - (stateCount[2] << INTEGER_MATH_SHIFT)) < 3 * maxVariance && Math.abs(moduleSize - (stateCount[3] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(moduleSize - (stateCount[4] << INTEGER_MATH_SHIFT)) < maxVariance;
    },
    centerFromEnd: function (stateCount, end) {
        return (end - stateCount[4] - stateCount[3]) - stateCount[2] / 2.0;
    },
    crossCheckVertical: function (startI, centerJ, maxCount, originalStateCountTotal) {
        var me = this, qrcode = me.qrcode;
        var image = me.image;

        var maxI = qrcode.height;
        var stateCount = me.CrossCheckStateCount;

        // Start counting up from center
        var i = startI;
        while (i >= 0 && image[centerJ + i * qrcode.width]) {
            stateCount[2]++;
            i--;
        }
        if (i < 0) {
            return NaN;
        }
        while (i >= 0 && !image[centerJ + i * qrcode.width] && stateCount[1] <= maxCount) {
            stateCount[1]++;
            i--;
        }
        // If already too many modules in this state or ran off the edge:
        if (i < 0 || stateCount[1] > maxCount) {
            return NaN;
        }
        while (i >= 0 && image[centerJ + i * qrcode.width] && stateCount[0] <= maxCount) {
            stateCount[0]++;
            i--;
        }
        if (stateCount[0] > maxCount) {
            return NaN;
        }

        // Now also count down from center
        i = startI + 1;
        while (i < maxI && image[centerJ + i * qrcode.width]) {
            stateCount[2]++;
            i++;
        }
        if (i == maxI) {
            return NaN;
        }
        while (i < maxI && !image[centerJ + i * qrcode.width] && stateCount[3] < maxCount) {
            stateCount[3]++;
            i++;
        }
        if (i == maxI || stateCount[3] >= maxCount) {
            return NaN;
        }
        while (i < maxI && image[centerJ + i * qrcode.width] && stateCount[4] < maxCount) {
            stateCount[4]++;
            i++;
        }
        if (stateCount[4] >= maxCount) {
            return NaN;
        }

        // If we found a finder-pattern-like section, but its size is more than 40% different than
        // the original, assume it's a false positive
        var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
        if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
            return NaN;
        }

        return me.foundPatternCross(stateCount) ? me.centerFromEnd(stateCount, i) : NaN;
    },
    crossCheckHorizontal: function (startJ, centerI, maxCount, originalStateCountTotal) {
        var me = this, qrcode = me.qrcode;
        var image = me.image;

        var maxJ = qrcode.width;
        var stateCount = me.CrossCheckStateCount;

        var j = startJ;
        while (j >= 0 && image[j + centerI * qrcode.width]) {
            stateCount[2]++;
            j--;
        }
        if (j < 0) {
            return NaN;
        }
        while (j >= 0 && !image[j + centerI * qrcode.width] && stateCount[1] <= maxCount) {
            stateCount[1]++;
            j--;
        }
        if (j < 0 || stateCount[1] > maxCount) {
            return NaN;
        }
        while (j >= 0 && image[j + centerI * qrcode.width] && stateCount[0] <= maxCount) {
            stateCount[0]++;
            j--;
        }
        if (stateCount[0] > maxCount) {
            return NaN;
        }

        j = startJ + 1;
        while (j < maxJ && image[j + centerI * qrcode.width]) {
            stateCount[2]++;
            j++;
        }
        if (j == maxJ) {
            return NaN;
        }
        while (j < maxJ && !image[j + centerI * qrcode.width] && stateCount[3] < maxCount) {
            stateCount[3]++;
            j++;
        }
        if (j == maxJ || stateCount[3] >= maxCount) {
            return NaN;
        }
        while (j < maxJ && image[j + centerI * qrcode.width] && stateCount[4] < maxCount) {
            stateCount[4]++;
            j++;
        }
        if (stateCount[4] >= maxCount) {
            return NaN;
        }

        // If we found a finder-pattern-like section, but its size is significantly different than
        // the original, assume it's a false positive
        var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
        if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= originalStateCountTotal) {
            return NaN;
        }

        return me.foundPatternCross(stateCount) ? me.centerFromEnd(stateCount, j) : NaN;
    },
    handlePossibleCenter: function (stateCount, i, j) {
        var me = this;
        var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
        var centerJ = me.centerFromEnd(stateCount, j); //float
        var centerI = me.crossCheckVertical(i, Math.floor(centerJ), stateCount[2], stateCountTotal); //float
        if (!isNaN(centerI)) {
            // Re-cross check
            centerJ = me.crossCheckHorizontal(Math.floor(centerJ), Math.floor(centerI), stateCount[2], stateCountTotal);
            if (!isNaN(centerJ)) {
                var estimatedModuleSize = stateCountTotal / 7.0;
                var found = false;
                var max = me.possibleCenters.length;
                for (var index = 0; index < max; index++) {
                    var center = me.possibleCenters[index];
                    // Look for about the same center and module size:
                    if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
                        center.incrementCount();
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    var point = new FinderPattern(centerJ, centerI, estimatedModuleSize);
                    me.possibleCenters.push(point);
                    if (me.resultPointCallback != null) {
                        me.resultPointCallback.foundPossibleResultPoint(point);
                    }
                }
                return true;
            }
        }
        return false;
    },
    selectBestPatterns: function () {
        var me = this;
        var startSize = me.possibleCenters.length;
        if (startSize < 3) {
            // Couldn't find enough finder patterns
            throw "Couldn't find enough finder patterns";
        }

        // Filter outlier possibilities whose module size is too different
        if (startSize > 3) {
            // But we can only afford to do so if we have at least 4 possibilities to choose from
            var totalModuleSize = 0.0;
            var square = 0.0;
            for (var i = 0; i < startSize; i++) {
                //totalModuleSize +=  me.possibleCenters[i].EstimatedModuleSize;
                var centerValue = me.possibleCenters[i].EstimatedModuleSize;
                totalModuleSize += centerValue;
                square += (centerValue * centerValue);
            }
            var average = totalModuleSize / startSize;
            me.possibleCenters.sort(function (center1, center2) {
                var dA = Math.abs(center2.EstimatedModuleSize - average);
                var dB = Math.abs(center1.EstimatedModuleSize - average);
                if (dA < dB) {
                    return (-1);
                } else if (dA == dB) {
                    return 0;
                } else {
                    return 1;
                }
            });

            var stdDev = Math.sqrt(square / startSize - average * average);
            var limit = Math.max(0.2 * average, stdDev);
            for (var i = 0; i < me.possibleCenters.length && me.possibleCenters.length > 3; i++) {
                var pattern = me.possibleCenters[i];
                //if (Math.abs(pattern.EstimatedModuleSize - average) > 0.2 * average)
                if (Math.abs(pattern.EstimatedModuleSize - average) > limit) {
                    me.possibleCenters.remove(i);
                    i--;
                }
            }
        }

        if (me.possibleCenters.length > 3) {
            // Throw away all but those first size candidate points we found.
            me.possibleCenters.sort(function (a, b) {
                if (a.count > b.count) { return -1; }
                if (a.count < b.count) { return 1; }
                return 0;
            });
        }

        return new Array(me.possibleCenters[0], me.possibleCenters[1], me.possibleCenters[2]);
    },

    findRowSkip: function () {
        var me = this;
        var max = me.possibleCenters.length;
        if (max <= 1) {
            return 0;
        }
        var firstConfirmedCenter = null;
        for (var i = 0; i < max; i++) {
            var center = me.possibleCenters[i];
            if (center.Count >= CENTER_QUORUM) {
                if (firstConfirmedCenter == null) {
                    firstConfirmedCenter = center;
                }
                else {
                    // We have two confirmed centers
                    // How far down can we skip before resuming looking for the next
                    // pattern? In the worst case, only the difference between the
                    // difference in the x / y coordinates of the two centers.
                    // This is the case where you find top left last.
                    me.hasSkipped = true;
                    return Math.floor((Math.abs(firstConfirmedCenter.X - center.X) - Math.abs(firstConfirmedCenter.Y - center.Y)) / 2);
                }
            }
        }
        return 0;
    },
    haveMultiplyConfirmedCenters: function () {
        var me = this;
        var confirmedCount = 0;
        var totalModuleSize = 0.0;
        var max = me.possibleCenters.length;
        for (var i = 0; i < max; i++) {
            var pattern = me.possibleCenters[i];
            if (pattern.Count >= CENTER_QUORUM) {
                confirmedCount++;
                totalModuleSize += pattern.EstimatedModuleSize;
            }
        }
        if (confirmedCount < 3) {
            return false;
        }
        // OK, we have at least 3 confirmed centers, but, it's possible that one is a "false positive"
        // and that we need to keep looking. We detect this by asking if the estimated module sizes
        // vary too much. We arbitrarily say that when the total deviation from average exceeds
        // 5% of the total module size estimates, it's too much.
        var average = totalModuleSize / max;
        var totalDeviation = 0.0;
        for (var i = 0; i < max; i++) {
            pattern = me.possibleCenters[i];
            totalDeviation += Math.abs(pattern.EstimatedModuleSize - average);
        }
        return totalDeviation <= 0.05 * totalModuleSize;
    },
    findFinderPattern: function (image) {
        var me = this, qrcode;
        qrcode = me.qrcode;
        var tryHarder = false;
        me.image = image;
        var maxI = qrcode.height;
        var maxJ = qrcode.width;
        var iSkip = Math.floor((3 * maxI) / (4 * MAX_MODULES));
        if (iSkip < MIN_SKIP || tryHarder) {
            iSkip = MIN_SKIP;
        }

        var done = false;
        var stateCount = new Array(5);
        for (var i = iSkip - 1; i < maxI && !done; i += iSkip) {
            // Get a row of black/white values
            stateCount[0] = 0;
            stateCount[1] = 0;
            stateCount[2] = 0;
            stateCount[3] = 0;
            stateCount[4] = 0;
            var currentState = 0;
            for (var j = 0; j < maxJ; j++) {
                if (image[j + i * qrcode.width]) {
                    // Black pixel
                    if ((currentState & 1) == 1) {
                        // Counting white pixels
                        currentState++;
                    }
                    stateCount[currentState]++;
                }
                else {
                    // White pixel
                    if ((currentState & 1) == 0) {
                        // Counting black pixels
                        if (currentState == 4) {
                            // A winner?
                            if (me.foundPatternCross(stateCount)) {
                                // Yes
                                var confirmed = me.handlePossibleCenter(stateCount, i, j);
                                if (confirmed) {
                                    // Start examining every other line. Checking each line turned out to be too
                                    // expensive and didn't improve performance.
                                    iSkip = 2;
                                    if (me.hasSkipped) {
                                        done = me.haveMultiplyConfirmedCenters();
                                    }
                                    else {
                                        var rowSkip = me.findRowSkip();
                                        if (rowSkip > stateCount[2]) {
                                            // Skip rows between row of lower confirmed center
                                            // and top of presumed third confirmed center
                                            // but back up a bit to get a full chance of detecting
                                            // it, entire width of center of finder pattern

                                            // Skip by rowSkip, but back off by stateCount[2] (size of last center
                                            // of pattern we saw) to be conservative, and also back off by iSkip which
                                            // is about to be re-added
                                            i += rowSkip - stateCount[2] - iSkip;
                                            j = maxJ - 1;
                                        }
                                    }
                                }
                                else {
                                    // Advance to next black pixel
                                    do {
                                        j++;
                                    }
                                    while (j < maxJ && !image[j + i * qrcode.width]);
                                    j--; // back up to that last white pixel
                                }
                                // Clear state to start looking again
                                currentState = 0;
                                stateCount[0] = 0;
                                stateCount[1] = 0;
                                stateCount[2] = 0;
                                stateCount[3] = 0;
                                stateCount[4] = 0;
                            }
                            else {
                                // No, shift counts back by two
                                stateCount[0] = stateCount[2];
                                stateCount[1] = stateCount[3];
                                stateCount[2] = stateCount[4];
                                stateCount[3] = 1;
                                stateCount[4] = 0;
                                currentState = 3;
                            }
                        }
                        else {
                            stateCount[++currentState]++;
                        }
                    }
                    else {
                        // Counting white pixels
                        stateCount[currentState]++;
                    }
                }
            }
            if (me.foundPatternCross(stateCount)) {
                var confirmed = me.handlePossibleCenter(stateCount, i, maxJ);
                if (confirmed) {
                    iSkip = stateCount[0];
                    if (me.hasSkipped) {
                        // Found a third one
                        done = haveMultiplyConfirmedCenters();
                    }
                }
            }
        }

        var patternInfo = me.selectBestPatterns();
        qrcode.orderBestPatterns(patternInfo);

        return new MEPH.qrcode.finder.FinderPatternInfo(patternInfo);
    },
    initialize: function (qrcode) {
        var me = this;
        me.image = null;
        me.possibleCenters = [];
        me.hasSkipped = false;
        me.crossCheckStateCount = new Array(0, 0, 0, 0, 0);
        me.resultPointCallback = null;
        me.qrcode = qrcode;
        Object.defineProperty(me, 'CrossCheckStateCount', {
            get: function () {
                me.crossCheckStateCount[0] = 0;
                me.crossCheckStateCount[1] = 0;
                me.crossCheckStateCount[2] = 0;
                me.crossCheckStateCount[3] = 0;
                me.crossCheckStateCount[4] = 0;
                return me.crossCheckStateCount;
            }
        });



    }
});