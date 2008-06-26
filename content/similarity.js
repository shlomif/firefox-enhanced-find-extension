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


//*****************************
// Levenshtein Distance
//*****************************

function Lev(tofind, anyterm)
{
    this.toFind = tofind.toLowerCase();
    this.anyTerm = anyterm.toLowerCase();
    this.toFind_len = tofind.length;
    this.anyTerm_len = anyterm.length;
}

Lev.prototype.minValue = function(a, b, c)
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

Lev.prototype.distance = function()
{
    var n; // length of s
    var m; // length of t
    var i; // iterates through s
    var j; // iterates through t
    var s_i; // ith character of s
    var t_j; // jth character of t
    var cost; // cost
    var s = this.toFind;
    var t = this.anyTerm;

    // Step 1
    var n = this.toFind_len;
    var m = this.anyTerm_len;

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
        }
    }

    for (i = 0; i <= n; i++) {
        d[i][0] = i;
    }

    for (j = 0; j <= m; j++) {
        d[0][j] = j;
    }

    for (i = 1; i <= n; i++) {
        var s_i = s.charAt(i - 1);

        for (j = 1; j <= m; j++) {
            var t_j = t.charAt(j - 1);

            if (s_i == t_j) {
                cost = 0;
            } else {
                cost = 1;
            }

            d[i][j] = this.minValue(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1] + cost);
        }
    }

    return d[n][m];
}

Lev.prototype.similarity = function()
{
    var most;
    var score;

    if(this.toFind_len > this.anyTerm) {
        most = this.toFind_len;
    } else {
        most = this.anyTerm_len;
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

function bubbleSort(tl)
{
    var i, j;
    var term_list = tl;
    for (i = 0; i < term_list.length; i++) {
        var x = term_list[i];
        for (j = i; j < term_list.length; j++) {
            var y = term_list[j];
            if(x.getScore() < y.getScore()) {
                var tmp = x;
                x = y;
                y = tmp;
                term_list[i] = x;
                term_list[j] = y;
            }
        }
    }

    return term_list;
}

function extractTextFromPage(doc)
{
    var str_accum = "";
    var textnodes = doc.evaluate("//body//text()",
                                 doc, null,
                                 XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

    for (var i = 0; i < textnodes.snapshotLength; i++) {
        var node = textnodes.snapshotItem(i);
        str_accum += node.data;
    }

    return str_accum.split(/\W+/);
}

function getSimilarTerms(doc, q, t)
{
    var score_tmp = 0.0;
    var term_list = new Array();
    var text_split = extractTextFromPage(doc);
    var terms_to_find = new Array();
    var treshold = parseFloat(parseInt(t)/100);
    var i, j, lev, sort_term_list, actual;

    for (i = 0; i < text_split.length; i++) {
        lev = new Lev(q, text_split[i]);
        score_tmp = lev.similarity();
        if (score_tmp >= treshold) {
            var x = new TermScore(text_split[i], score_tmp);
            term_list.push(x);
        }
    }

    // WTF: why bubble ? :-)
    sort_term_list = bubbleSort(term_list);
    for (i = 0; i < sort_term_list.length; i++)
    {
        terms_to_find.push(sort_term_list[i].getTerm());
    }

    // this code is used to remove duplucated strings
    var output_list = new Array();
    if(sort_term_list.length > 1) {
        actual = sort_term_list[0].getTerm();
        for (i = 1; i < sort_term_list.length; i++) {
            if(actual != sort_term_list[i].getTerm()) {
                output_list.push(actual);
                actual = sort_term_list[i].getTerm();
            }
        }
        output_list.push(sort_term_list[sort_term_list.length - 1].getTerm());
    } else {
        return sort_term_list[0].getTerm();
    }
    // until here

    var output_str = "";
    // let this line while not finished :-)
    for (i = 0; i < output_list.length; i++)
        output_str += output_list[i] + " ";

    dump("\nFound " + output_list.length + " similar word(s): " + output_str + "\n\n");

    return output_list[0];
}
