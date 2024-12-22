"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fuzzyScore = fuzzyScore;
exports.isPatternInWord = isPatternInWord;
var _maxLen = 128;
function initTable() {
    var table = [];
    var row = [0];
    for (var i = 1; i <= _maxLen; i++) {
        row.push(-i);
    }
    for (var i = 0; i <= _maxLen; i++) {
        var thisRow = row.slice(0);
        thisRow[0] = -i;
        table.push(thisRow);
    }
    return table;
}
var _table = initTable();
var _scores = initTable();
var _arrows = initTable();
var _debug = false;
console.log(fuzzyScore('a', 'a', 0, 'a', 'a', 0, false));
console.log(fuzzyScore('a', 'a', 0, 'ABS()', 'abs()', 0, false));
console.log(fuzzyScore('a', 'a', 0, 'a', 'a', 0, true));
console.log(fuzzyScore('a', 'a', 0, 'ABS()', 'abs()', 0, true));
function fuzzyScore(pattern, patternLow, patternStart, word, wordLow, wordStart, firstMatchCanBeWeak) {
    var patternLen = pattern.length > _maxLen ? _maxLen : pattern.length;
    var wordLen = word.length > _maxLen ? _maxLen : word.length;
    if (patternStart >= patternLen || wordStart >= wordLen || (patternLen - patternStart) > (wordLen - wordStart)) {
        return undefined;
    }
    // Run a simple check if the characters of pattern occur
    // (in order) at all in word. If that isn't the case we
    // stop because no match will be possible
    if (!isPatternInWord(patternLow, patternStart, patternLen, wordLow, wordStart, wordLen)) {
        return undefined;
    }
    var row = 1;
    var column = 1;
    var patternPos = patternStart;
    var wordPos = wordStart;
    // There will be a match, fill in tables
    for (row = 1, patternPos = patternStart; patternPos < patternLen; row++, patternPos++) {
        for (column = 1, wordPos = wordStart; wordPos < wordLen; column++, wordPos++) {
            var score = _doScore(pattern, patternLow, patternPos, patternStart, word, wordLow, wordPos);
            _scores[row][column] = score;
            var diag = _table[row - 1][column - 1] + (score > 1 ? 1 : score);
            var top_1 = _table[row - 1][column] + -1;
            var left = _table[row][column - 1] + -1;
            if (left >= top_1) {
                // left or diag
                if (left > diag) {
                    _table[row][column] = left;
                    _arrows[row][column] = 4 /* Arrow.Left */;
                }
                else if (left === diag) {
                    _table[row][column] = left;
                    _arrows[row][column] = 4 /* Arrow.Left */ | 2 /* Arrow.Diag */;
                }
                else {
                    _table[row][column] = diag;
                    _arrows[row][column] = 2 /* Arrow.Diag */;
                }
            }
            else {
                // top or diag
                if (top_1 > diag) {
                    _table[row][column] = top_1;
                    _arrows[row][column] = 1 /* Arrow.Top */;
                }
                else if (top_1 === diag) {
                    _table[row][column] = top_1;
                    _arrows[row][column] = 1 /* Arrow.Top */ | 2 /* Arrow.Diag */;
                }
                else {
                    _table[row][column] = diag;
                    _arrows[row][column] = 2 /* Arrow.Diag */;
                }
            }
        }
    }
    if (_debug) {
        printTables(pattern, patternStart, word, wordStart);
    }
    _matchesCount = 0;
    _topScore = -100;
    _wordStart = wordStart;
    _firstMatchCanBeWeak = firstMatchCanBeWeak;
    _findAllMatches2(row - 1, column - 1, patternLen === wordLen ? 1 : 0, 0, false);
    if (_matchesCount === 0) {
        return undefined;
    }
    return [_topScore, _topMatch2, wordStart];
}
function _doScore(pattern, patternLow, patternPos, patternStart, word, wordLow, wordPos) {
    if (patternLow[patternPos] !== wordLow[wordPos]) {
        return -1;
    }
    if (wordPos === (patternPos - patternStart)) {
        // common prefix: `foobar <-> foobaz`
        //                            ^^^^^
        if (pattern[patternPos] === word[wordPos]) {
            return 7;
        }
        else {
            return 5;
        }
    }
    else if (isUpperCaseAtPos(wordPos, word, wordLow) && (wordPos === 0 || !isUpperCaseAtPos(wordPos - 1, word, wordLow))) {
        // hitting upper-case: `foo <-> forOthers`
        //                              ^^ ^
        if (pattern[patternPos] === word[wordPos]) {
            return 7;
        }
        else {
            return 5;
        }
    }
    else if (isSeparatorAtPos(wordLow, wordPos) && (wordPos === 0 || !isSeparatorAtPos(wordLow, wordPos - 1))) {
        // hitting a separator: `. <-> foo.bar`
        //                                ^
        return 5;
    }
    else if (isSeparatorAtPos(wordLow, wordPos - 1) || isWhitespaceAtPos(wordLow, wordPos - 1)) {
        // post separator: `foo <-> bar_foo`
        //                              ^^^
        return 5;
    }
    else {
        return 1;
    }
}
function isWhitespaceAtPos(value, index) {
    if (index < 0 || index >= value.length) {
        return false;
    }
    var code = value.charCodeAt(index);
    switch (code) {
        case 32 /* CharCode.Space */:
        case 9 /* CharCode.Tab */:
            return true;
        default:
            return false;
    }
}
function isSeparatorAtPos(value, index) {
    if (index < 0 || index >= value.length) {
        return false;
    }
    var code = value.charCodeAt(index);
    switch (code) {
        case 95 /* CharCode.Underline */:
        case 45 /* CharCode.Dash */:
        case 46 /* CharCode.Period */:
        case 32 /* CharCode.Space */:
        case 47 /* CharCode.Slash */:
        case 92 /* CharCode.Backslash */:
        case 39 /* CharCode.SingleQuote */:
        case 34 /* CharCode.DoubleQuote */:
        case 58 /* CharCode.Colon */:
        case 36 /* CharCode.DollarSign */:
            return true;
        default:
            return false;
    }
}
var _matchesCount = 0;
var _topMatch2 = 0;
var _topScore = 0;
var _wordStart = 0;
var _firstMatchCanBeWeak = false;
function isUpperCaseAtPos(pos, word, wordLow) {
    return word[pos] !== wordLow[pos];
}
function _findAllMatches2(row, column, total, matches, lastMatched) {
    if (_matchesCount >= 10 || total < -25) {
        // stop when having already 10 results, or
        // when a potential alignment as already 5 gaps
        return;
    }
    var simpleMatchCount = 0;
    while (row > 0 && column > 0) {
        var score = _scores[row][column];
        var arrow = _arrows[row][column];
        if (arrow === 4 /* Arrow.Left */) {
            // left -> no match, skip a word character
            column -= 1;
            if (lastMatched) {
                total -= 5; // new gap penalty
            }
            else if (matches !== 0) {
                total -= 1; // gap penalty after first match
            }
            lastMatched = false;
            simpleMatchCount = 0;
        }
        else if (arrow & 2 /* Arrow.Diag */) {
            if (arrow & 4 /* Arrow.Left */) {
                // left
                _findAllMatches2(row, column - 1, matches !== 0 ? total - 1 : total, // gap penalty after first match
                matches, lastMatched);
            }
            // diag
            total += score;
            row -= 1;
            column -= 1;
            lastMatched = true;
            // match -> set a 1 at the word pos
            matches += Math.pow(2, (column + _wordStart));
            // count simple matches and boost a row of
            // simple matches when they yield in a
            // strong match.
            if (score === 1) {
                simpleMatchCount += 1;
                if (row === 0 && !_firstMatchCanBeWeak) {
                    // when the first match is a weak
                    // match we discard it
                    return undefined;
                }
            }
            else {
                // boost
                total += 1 + (simpleMatchCount * (score - 1));
                simpleMatchCount = 0;
            }
        }
        else {
            return undefined;
        }
    }
    total -= column >= 3 ? 9 : column * 3; // late start penalty
    // dynamically keep track of the current top score
    // and insert the current best score at head, the rest at tail
    _matchesCount += 1;
    if (total > _topScore) {
        _topScore = total;
        _topMatch2 = matches;
    }
}
function isPatternInWord(patternLow, patternPos, patternLen, wordLow, wordPos, wordLen) {
    while (patternPos < patternLen && wordPos < wordLen) {
        if (patternLow[patternPos] === wordLow[wordPos]) {
            patternPos += 1;
        }
        wordPos += 1;
    }
    return patternPos === patternLen; // pattern must be exhausted
}
function printTables(pattern, patternStart, word, wordStart) {
    pattern = pattern.substr(patternStart);
    word = word.substr(wordStart);
    console.log(printTable(_table, pattern, pattern.length, word, word.length));
    console.log(printTable(_arrows, pattern, pattern.length, word, word.length));
    console.log(printTable(_scores, pattern, pattern.length, word, word.length));
}
function printTable(table, pattern, patternLen, word, wordLen) {
    function pad(s, n, pad) {
        if (pad === void 0) { pad = ' '; }
        while (s.length < n) {
            s = pad + s;
        }
        return s;
    }
    var ret = " |   |".concat(word.split('').map(function (c) { return pad(c, 3); }).join('|'), "\n");
    for (var i = 0; i <= patternLen; i++) {
        if (i === 0) {
            ret += ' |';
        }
        else {
            ret += "".concat(pattern[i - 1], "|");
        }
        ret += table[i].slice(0, wordLen + 1).map(function (n) { return pad(n.toString(), 3); }).join('|') + '\n';
    }
    return ret;
}
