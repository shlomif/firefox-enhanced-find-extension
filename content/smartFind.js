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
 * Roberto Oliveira do Santos <betito.oliveira@gmail.com>.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): Tomaz Nolêto <tnoleto@gmail.com>
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

var smartFind =
{
    init: function() {
        // gets gBrowser passed to smartFindOverlay.openDialog()
        this.browser = window.arguments[0];
        this.browserFind = this.browser.selectedBrowser.webBrowserFind;
        this.browserFind.wrapFind = true;
    },

    findPrevious: function() {
        var str = document.getElementById("smartFind_FindString").value;
        this.similarity = document.getElementById("smartFind_similarity").value;
        this.browserFind.searchString = str;
        this.browserFind.findBackwards = true;
        var result = this.browserFind.findNext();
    },

    findNext: function() {
        var str = document.getElementById("smartFind_FindString").value;

        var similarity = document.getElementById("smartFind_similarity").value;
        // tipo from http://developer.mozilla.org/en/docs/Code_snippets:Tabbed_browser#Getting_document_of_currently_selected_tab
        var real_str = getSimilarTerms(window.opener.content.document, str, similarity);
        this.browserFind.searchString = real_str;
        this.browserFind.findBackwards = false;
        var result = this.browserFind.findNext();
    }
}
