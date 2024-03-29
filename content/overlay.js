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
 * Tomaz Nolêto <tnoleto@gmail.com>.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *     Antonio Gomes <tonikitoo@gmail.com>
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

var smartFindOverlay =
{
    observe: function(subject, topic, data) {
        if (data == "enabled") {
            var enabled = this.mPrefs.getBoolPref(data);

            this.findSimilar.checked = enabled;
            this.findMatchCase.disabled = enabled;
            this.findMenuItem.disabled = !enabled;
        } else if (data == "similarity_level") {
            // FIXME: tomaz, do you agree with this method call ?
            gFindBar._setSimilarLevel(this.mPrefs.getIntPref(data));
        }
    },

    onLoad: function() {

        this.HIGH = 80;
        this.MEDIUM = 50;
        this.LOW = 30;

        this.strings = document.getElementById("smartfind-strings");

        this.findSimilar = gFindBar.getElement("find-similar");
        this.findRegex = gFindBar.getElement("find-regex");
        this.findMatchCase = gFindBar.getElement("find-case-sensitive");
        this.findMenuItem = document.getElementById("smartfind-menu");

        this.mPrefs = Components.classes["@mozilla.org/preferences-service;1"]
                .getService(Components.interfaces.nsIPrefService)
                .getBranch("extensions.smartfind.")
                .QueryInterface(Components.interfaces.nsIPrefBranch2);

        this.mRegexPrefs = Components.classes["@mozilla.org/preferences-service;1"]
                .getService(Components.interfaces.nsIPrefService)
                .getBranch("extensions.smartfind.regex.")
                .QueryInterface(Components.interfaces.nsIPrefBranch2);

        this.mPrefs.addObserver("", this, false);
        this.mRegexPrefs.addObserver("", this, false);
    },

    openFindBar: function() {
        var enabled = this.mPrefs.getBoolPref("enabled");

        this.findMatchCase.disabled = enabled;
        this.findSimilar.checked = enabled;

        var regex_enabled = this.mRegexPrefs.getBoolPref("enabled");
        this.findRegex.checked = regex_enabled;

        gFindBar.onFindCommand();
    },

    displaySimilarityMenu: function() {

        var level = this.mPrefs.getIntPref("similarity_level");

        if (level >= this.HIGH) // 80
            document.getElementById("smartfind-menu-high").setAttribute("checked", true);
        else if (level >= this.MEDIUM) // 50
            document.getElementById("smartfind-menu-medium").setAttribute("checked", true);
        else // 30
            document.getElementById("smartfind-menu-low").setAttribute("checked", true);
    },

    displaySimilarityMenuChange: function(value) {

        // FIXME: tomaz, do you agree with this method call ?
        this.mPrefs.setIntPref("similarity_level", value);

        gFindBar._setSimilarLevel(value);
    },

};

window.addEventListener("load", function(e) { smartFindOverlay.onLoad(e); }, false);
