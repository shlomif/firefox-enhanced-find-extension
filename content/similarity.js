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

/***************
 * Levenshtein *
 ***************/

function LevDistance(tofind, anyterm)
{
    this.toFind = tofind;
    this.anyTerm = anyterm;
    this.toFindLen = tofind.length;
    this.anyTermLen = anyterm.length;
}

LevDistance.prototype = {
    minValue : function(a, b, c)
    {
        a = parseInt(a);
        b = parseInt(b);
        c = parseInt(c);
        return a < b ? (a < c ? a : c) : (b < c ? b : c);
    },

    distance : function()
    {
        var s = this.toFind;
        var t = this.anyTerm;
        var n = this.toFindLen;
        var m = this.anyTermLen;

        if(n == 0) return m;
        if(m == 0) return n;

        var d;
        for(var i = 0; i <= n; ++i) {
	    if (i == 0) d = new Array(n+1);
            for(var j = 0; j <= m; ++j) {
	        if (j == 0) d[i] = new Array(m+1);
                d[i][j] = 0;
                d[0][j] = j;
            }
            d[i][0] = i;
        }

       for(var i = 1; i <= n; ++i) {
            var s_i = s.charAt(i - 1);

            for(var j = 1; j <= m; ++j) {
                var t_j = t.charAt(j - 1);
                var cost = 1
                if(s_i == t_j)
                    cost = 0;

                d[i][j] = this.minValue(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1] + cost);
            }
        }

        return d[n][m];
    },

    similarity : function()
    {
        var most = (this.toFindLen > this.anyTerm) ? this.toFindLen : this.anyTermLen;
        var score = parseFloat(parseInt(this.distance(this.toFind, this.anyTerm))/most);
        return (1-score);
    }
};

// create a list of terms to test the score
function TermScore(term, score)
{
    this.term = term;
    this.score = score;
}

TermScore.prototype = {
    setTermScore : function(term, score)
    {
        this.term = term;
        this.score = score;
    },

    getScore : function()
    {
        return this.score;
    },

    getTerm : function()
    {
        return this.term;
    },

    getTermScore : function()
    {
        return this;
    }
};


function getMostSimilarTerm(termList)
{
    var mostSimilarTerm = termList[0];

    for(var i = 1; i < termList.length; ++i) {
        if(termList[i].getScore() > mostSimilarTerm.getScore())
            mostSimilarTerm = termList[i];
    }

    return mostSimilarTerm.getTerm();
}

function doExtract(doc) {

    // FIXME: This filter is still problematic when we have something like:
    // <script>
    //      <dammit>
    //              any crappy text.
    //      </dammit>
    // </script>
    var filter = {
        acceptNode : function acceptNode(node) {
            if(node.parentNode.nodeName.toLowerCase() != 'script' &&
            node.parentNode.nodeName.toLowerCase() != 'style'  &&
            node.parentNode.nodeName.toLowerCase() != 'meta'   &&
            node.parentNode.nodeName.toLowerCase() != 'object' &&
            node.parentNode.nodeName.toLowerCase() != 'embed'  &&
            node.parentNode.nodeName.toLowerCase() != 'noscript') {
                // verify if our #text if made only by white spaces
                var tmpStr = node.data.replace(/(^\s*)|(\s*$)/g, "");
                if(tmpStr != "\n" && tmpStr != "") {
                    accumStr += tmpStr + " ";
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_REJECT;
        }
    };

    var accumStr = "";
    var walker = doc.createTreeWalker(doc.documentElement,
                                      NodeFilter.SHOW_TEXT,
                                      filter,
                                      false);
    while (walker.nextNode()) { }

    return accumStr;
}

function extractTermsFromPage(doc)
{
    var textStr = "";
    var dictionary = new Array();
    var retWords = new Array();

    // DEBUG
    // var start = Date.now();

    textStr += doExtract(doc);

    for(var i = 0; i < doc.defaultView.frames.length; i++) {
        var docFrame = doc.defaultView.frames[i].document;
        textStr += doExtract(docFrame);
    }

    // DEBUG
    // var end = Date.now();
    // var elapsed = end - start; // time in milliseconds
    // dump("extracting text:" + elapsed/1000 + "secs\n\n");

    var tmpWords = textStr.split(/[\s|\&|!|@|\*|\(|\)|\{|\}|\,|\.|\"|\'|:|;|\?|\[|\]|\/|\#|/\n]+/);

    for(var i = 0; i < tmpWords.length; i++) {

        // Remove unwanted characters from our "text string". That is the big list:
        // ^&!@*(){},."':;?[]#%+-=<>`_~

        // |trim| the string according to the list above.
        tmpWords[i] = tmpWords[i].replace(/[\&|!|@|\*|\(|\)|\{|\}|\,|\.|\"|'|:|;|\?|\[|\]|\#|\/]+\b/, "");

        dictionary[tmpWords[i].toLowerCase()] = 1;
    }

    // FIXME: And then adding to dic ... gotta optimize this.
    for(var i in dictionary) {
        retWords.push(i);
    }

    return retWords;
}

function sortByScore(a, b){
    return (a.score < b.score);
}

function getSimilarTerms(doc, query, similarityLevel)
{
    var mostSimilarScore = 0.0;
    var mostSimilarTerm = "";
    var terms = extractTermsFromPage(doc);
    var treshold = parseFloat(parseInt(similarityLevel)/100);
    var termList = new Array();

    for(var i = 0; i < terms.length; i++) {

	// TBD: move the regexp to the split phrase.
	// For terms whose length is smaller than 3, bail !
        if(terms[i].length < 3)
            continue;

        var levDistance = new LevDistance(query, terms[i]);
        var currentScore = levDistance.similarity();

        if(currentScore >= treshold) {
	    // NOTE: termList is being unused !!!
            var x = new TermScore(terms[i], currentScore);
            termList.push(x);
            if(currentScore > mostSimilarScore) {
                mostSimilarTerm = terms[i];
                mostSimilarScore = currentScore;
            }
        }
    }

    return mostSimilarTerm;
}

function getListOfSimilarTerms(doc, query, similarityLevel)
{
    var mostSimilarScore = 0.0;
    var mostSimilarTerm = "";
    var terms = extractTermsFromPage(doc);
    var treshold = parseFloat(parseInt(similarityLevel)/100);
    var termList = new Array();

    for(var i = 0; i < terms.length; i++) {

	// TBD: move the regexp to the split phrase.
	// For terms whose length is smaller than 3, bail !
        if(terms[i].length < 3)
            continue;

        var levDistance = new LevDistance(query, terms[i]);
        var currentScore = levDistance.similarity();

        if(currentScore >= treshold) {
	    // NOTE: termList is being unused !!!
            var x = new TermScore(terms[i], currentScore);
            termList.push(x);
        }
		
		// sort in desc order by score
		termList.sort(sortByScore);
    }
	
	var onlyTerms = new Array();
	
	for (i = 0; i < termList.length; i++) {
		onlyTerms.push(termList[i].term);
    }

    return onlyTerms;
}
