/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Smart Find.
 *
 * The Initial Developer of the Original Code is
 * Roberto Oliveira dos Santos <betito.oliveira@gmail.com>.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): Antonio Gomes <tonikitoo@gmail.com>
 *                 Tomaz Noleto <tnoleto@gmail.com>
 *                 André Pedralho <apedralho@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */


/************************
 * Levenshtein Distance *
 ************************/

function LevDistance(tofind, anyterm)
{
    this.toFind = tofind;
    this.anyTerm = anyterm;
    this.toFindLen = tofind.length;
    this.anyTermLen = anyterm.length;
}

LevDistance.prototype.minValue = function(a, b, c)
{
    var mi = parseInt(a);
    if (parseInt(b) < mi) {
        mi = parseInt(b);
    }
    if (parseInt(c) < mi) {
        mi = parseInt(c);
    }
    return mi;
}

LevDistance.prototype.distance = function()
{
    var n; // length of toFind
    var m; // length of anyTerm
    var i; // iterates through toFind
    var j; // iterates through anyTerm
    var s_i; // ith character of toFind
    var t_j; // jth character of anyTerm
    var cost; // cost do edit
    var s = this.toFind;
    var t = this.anyTerm;

    // Step 1
    var n = this.toFindLen;
    var m = this.anyTermLen;

    var d = new Array(n+1);

    if (n == 0) { return m; }
    if (m == 0) { return n; }

    for(i = 0; i < n+1; i++) {
        var tmp = new Array(m+1);
        d[i] = tmp;
    }

    for (i = 0; i <= n; i++) {
        for (j = 0; j <= m; j++) {
            d[i][j] = 0;
            d[0][j] = j;
        }
        d[i][0] = i;
    }

   for (i = 1; i <= n; i++) {
        var s_i = s.charAt(i - 1);

        for (j = 1; j <= m; j++) {
            var t_j = t.charAt(j - 1);
            cost = 1
            if (s_i == t_j) {
                cost = 0;
            }

            d[i][j] = this.minValue(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1] + cost);
        }
    }

    return d[n][m];
}

LevDistance.prototype.similarity = function()
{
    var most;
    var score;

    if(this.toFindLen > this.anyTerm) {
        most = this.toFindLen;
    } else {
        most = this.anyTermLen;
    }

    score = parseFloat(parseInt(this.distance(this.toFind, this.anyTerm))/most);

    return (1-score);
}


// create a list of terms to test the score
function TermScore(term, score)
{
    this.term = term;
    this.score = score;
}

TermScore.prototype.setTermScore = function(term, score)
{
    this.term = term;
    this.score = score;
}

TermScore.prototype.getScore = function()
{
    return this.score;
}

TermScore.prototype.getTerm = function()
{
    return this.term;
}

TermScore.prototype.getTermScore = function()
{
    return this;
}

function getMostSimilarTerm(termList)
{
    var i;
    var mostSimilarTem = termList[0];

    for(i = 1; i < termList.length; i++) {
        if (termList[i].getScore() > mostSimilarTem.getScore())
            mostSimilarTem = termList[i];
    }

    return mostSimilarTem.getTerm();
}

function extractTextFromPage(doc)
{
    var textStr = "";
    var dictionary = new Array();
    var retWords = new Array();

    //var textNodes = doc.evaluate("//body//text()",
    var textNodes = doc.evaluate("//text()",
                                 doc, null,
                                 XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

    for (var i = 0; i < textNodes.snapshotLength; i++) {
        var node = textNodes.snapshotItem(i);
        textStr += node.data
    }

    //var tmpWords = textStr.split(/\s+/);
    var tmpWords = textStr.split(/[\s|\&|!|@|\*|\(|\)|\{|\}|\,|\.|\"|\'|:|;|\?|\[|\]|\/|\#|/\n]+/);

    for (var i = 0; i < tmpWords.length; i += 1) {

        // Remove unwanted characters from our "text string". That is the big list:
        // ^&!@*(){},."':;?[]#%+-=<>`_~

        //FIXME: Currently, we are removing the characteres in tree steps: first, from the begin,
        // second from the end and at least from the middle. In the first two, we replace by "",
        // and later replaces it by " ". Could all that be handled at once.

        // removing from the end
        tmpWords[i] = tmpWords[i].replace(/[\&|!|@|\*|\(|\)|\{|\}|\,|\.|\"|\'|:|;|\?|\[|\]|\#|\/]+$/, "");

        // removing from the begining
        tmpWords[i] = tmpWords[i].replace(/^[\&|!|@|\*|\(|\)|\{|\}|\,|\.|\"|'|:|;|\?|\[|\]|\#|\/]+/, "");

        // removing from the middle
        // textSplitList[i] = tmpWords[i].replace(/[\&|!|@|\*|\(|\)|\{|\}|\,|\.|\"|\'|:|;|\?|\[|\]]+/, " ");

        dictionary[tmpWords[i].toLowerCase()] = 1;
    }

    for (var i in dictionary) {
        retWords.push(i);
    }

    return retWords;
}

function getSimilarTerms(doc, q, t)
{
    var scoreTmp = 0.0, mostSimilarScr = 0.0, mostSimilarStr = "";
    var termList = new Array();
    var textSplitList = extractTextFromPage(doc);
    var treshold = parseFloat(parseInt(t)/100);
    var i, levDistance;
    var smallwords = 0;

    for (i = 0; i < textSplitList.length; i++) {
        // TBD: move the regexp to the split phrase.
        if (textSplitList[i].length < 3)
            continue;

        levDistance = new LevDistance(q, textSplitList[i]);
        scoreTmp = levDistance.similarity();

        if (scoreTmp >= treshold) {
            var x = new TermScore(textSplitList[i], scoreTmp);
            termList.push(x);
            if (scoreTmp > mostSimilarScr) {
                mostSimilarStr = textSplitList[i];
                mostSimilarScr = scoreTmp;
            }
        }
    }

    return mostSimilarStr;
}
