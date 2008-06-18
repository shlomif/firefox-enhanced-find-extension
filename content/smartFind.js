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
        this.similarity = document.getElementById("smartFind_similarity");
        this.browserFind.searchString = str;
        this.browserFind.findBackwards = true;
        var result = this.browserFind.findNext();
    },

    findNext: function() {
        var str = document.getElementById("smartFind_FindString").value;
        this.similarity = document.getElementById("smartFind_similarity");
        this.browserFind.searchString = str;
        this.browserFind.findBackwards = false;
        var result = this.browserFind.findNext();
    }
}

function marcartermosindependentes(expres, palavras){
    var fontforte = "<b><font color=\"red\">";
    var endfontforte = "</font></b>";

    var i, j;
    var ntex = new Array(palavras.length);

    for(i = 0; i < ntex.length; i++){
        ntex[i] = palavras[i];
    }

    //for(i = 0; i < expres.length; i++){escrever(":: " + expres[i] + "<br/>");}


    for(i = 0; i < expres.length; i++){
        for(j = 0; j < ntex.length; j++){
            if(expres[i].toUpperCase() == ntex[j].toUpperCase()){
                ntex[j] = fontforte + ntex[j] + endfontforte;
            }
        }
    }

    // soh p debug
    for(i = 0; i < ntex.length; i++){
        escrever("[" + ntex[i] + "]");
        if((i % 10)==0){
            document.writeln("<br/>");
        }
    }
    document.writeln("<br/><br/>");

    return ntex;

}

function marcarexpressao(expres, texto){



}

function combinarrankingtermos(rankingtermos){

    var tamv = rankingtermos.length;

    for(var i = 0; i < rankingtermos.length; i++){
        for(var j = 0; j < rankingtermos.length; j++){
        }
    }
}

function retornaroffset(texto){
}

function fazerSplit(texto){

    var palavras = texto.split(/\s+/);
    return palavras;
}


function listatermosprovaveis(LIMIAR, s, palavras){

    //filtrar e pegar soh os que termos que têm
    var validos = filtrar(s, palavras, LIMIAR);

    var scores = probtermos(s, palavras, LIMIAR);

    var validosordenados = ordenar(scores);

    //for(var cont = 0; cont < validosordenados.length; cont++){document.writeln("<br/>" + validosordenados[cont]);}

    var termosmarcados = marcartermos (palavras, validosordenados);

    return validosordenados;

}

function marcartermos(texto, pal){
    var fontforte = "<b><font color=";
    var endfontforte = "</font></b>";

    var cores = new Array("\"red\">", "\"blue\">", "\"orange\">", "\"yellow\">");
    //var ntexto = texto;
    var palavras = retirarreplicas(pal);


    //for(var i = 0; i < palavras.length; i++){escrever(palavras[i]+"<br/>");}

    for(var i = 0; i < palavras.length; i++){
        var ntexto = new Array();
        for(var c = 0; c < texto.length; c++){
            ntexto[c] = texto[c];
        }

        for(var j = 0; j < ntexto.length; j++){
            if(canonic(palavras[i]) == canonic(ntexto[j])){
                ntexto[j] = fontforte + cores[i] + ntexto[j] + endfontforte;
            }
        }


    /*
        // verificar a marcacao da font para cada palavras de palunicas
        document.writeln("---------------------------<br/>");
        for(var cont = 0; cont < ntexto.length; cont++){
            escrever("[" + ntexto[cont] + "]");
            if((cont % 10)==0){
                document.writeln("<br/>");
            }
        }
        document.writeln("<br/><br/>");
*/
    }

    return ntexto;

}

function retirarreplicas(palavras){
    var unicas = new Array();

    var anterior = "";
    var cont = 0;
    for(var j = 0; j < palavras.length; j++){
        if(palavras[j] != anterior){
            unicas[cont++] = palavras[j];
            anterior = palavras[j];
        }
    }

    return unicas;

}

function filtrar (s, palavras, limiar){
    var validos = new Array();
    var prob = 0;
    var posv = 0
    for(var cont = 0; cont < palavras.length; cont++){
        prob = probabilidadetermos(s, canonic(palavras[cont]));
        if(prob >= limiar){
            validos[posv++] = palavras[cont];
        }
    }

    return validos;
}

function probtermos (s, palavras, limiar){
    var validos = new Array();
    var posv = 0;
    for(var cont = 0; cont < palavras.length; cont++){
        validos[posv++] = probabilidadetermos(s, canonic(palavras[cont]));

    }

    return validos;

}

function ordenar(vetor){
    var i, j, x;
    var aux = new Array(vetor.length);
    var cvetor = new Array(vetor.length);
    var palavrasord = new Array(vetor.length);

    for(i = 0; i < vetor.length; i++){
        aux[i] = vetor[i];
        cvetor[i] = vetor[i];
    }

    for(i = 0; i < vetor.length; i++){
        for(j = i; j < vetor.length; j++){
            if(aux[i] < aux[j]){
                x = aux[i];
                aux[i] = aux[j];
                aux[j] = x;
            }
        }
    }


    for(i = 0; i < cvetor.length; i++){
        var ok = 1;
        for(j = 0; j < cvetor.length && ok; j++){
            if(cvetor[j] != -1){
                if(cvetor[j] == aux[i]){
                    //palavrasord[i] = palavras[j];
                    palavrasord[i] = j;
                    cvetor[j] = -1;
                    ok = 0;
                }
            }
        }
    }

    var tam = 0;
    for(var f = 0; f < palavras.length; f++){
        if(typeof(palavrasord[f]) != "undefined"){
            tam++;
        }
    }


    var auxsaidapal = new Array();
    for(var f = 0; f < tam; f++){
        if(vetor[palavrasord[f]] >= this.LIMIAR){
            auxsaidapal[f] = palavras[palavrasord[f]];
        }
    }

    return auxsaidapal;

}

function canonic(termo){
    var haletrasnumeros = /[a-z|0-9]/i;
    if(termo.match(haletrasnumeros)){
        var tirar = /[\(|\),|\.]/g;
        var tmp = termo.replace(tirar, "");
        return tmp;
    }
    return termo;

}



function minimo(a, b, c){
    var mi = parseInt(a);
    if (parseInt(b) < mi){
        mi = parseInt(b);}
    if (parseInt(c) < mi){
        mi = parseInt(c);}
    return mi;
}

//*****************************
// Computar Distancia de Levenshtein
//*****************************
function distancia(s, t){

    //Array d = new Array(10); // matrix
    var n; // length of s
    var m; // length of t
    var i; // iterates through s
    var j; // iterates through t
    var s_i; // ith character of s
    var t_j; // jth character of t
    var cost; // cost

    // Step 1
    var n = parseInt(s.length);
    var m = parseInt(t.length);

    if (n == 0){
        return m;}
    if (m == 0){
        return n;}
    var d = new Array(n+1);
    for(i = 0; i < n+1; i++){
        var tmp = new Array(m+1);
        d[i] = tmp;
    }

    // Step 2
    for (i = 0; i <= n; i++){
        for (j = 0; j <= m; j++){
            d[i][j] = 0;
        }
    }

    for (i = 0; i <= n; i++){
        d[i][0] = i;}
    for (j = 0; j <= m; j++){
        d[0][j] = j;}

    // Step 3


    for (i = 1; i <= n; i++)
    {
        var s_i = s.charAt(i - 1);

        // Step 4
        for (j = 1; j <= m; j++)
        {
            var t_j = t.charAt(j - 1);

            // Step 5
            if (s_i == t_j){
                cost = 0;
            }else{
                cost = 1;
            }

            // Step 6
            d[i][j] = minimo(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1] + cost);
        }
    }

    // Step 7
    return d[n][m];
}

function probabilidadetermos(alvo, dest){
    var maior;
    var prob;

    if(alvo.length > dest.length){
        maior = alvo.length;
    }else{
        maior = dest.length;
    }

    prob = parseFloat(parseInt(distancia(alvo, dest))/maior);

    return (1-prob);
}

    /*

// text == 3, \n \t \s == 1
function extrairTexto(xmlNode, identacao){
    var arvoreTxt=""; //esta var armazenara o conteudo


    for(var i=0;i<xmlNode.childNodes.length;i++){//percorrendo os filhos do nó
            if(xmlNode.childNodes[i].nodeType != 1 && xmlNode.childNodes[i].nodeName != "SCRIPT"){//ignorar espaços em branco
            //pegando o nome do nó
            arvoreTxt = arvoreTxt + identacao;
            if(xmlNode.childNodes[i].childNodes.length==0){
                //se não tiver filhos eu já pego o nodevalue
                arvoreTxt = arvoreTxt + xmlNode.childNodes[i].nodeValue;
            //
                for(var z=0;z<xmlNode.childNodes[i].attributes.length;z++){
                    var atrib = xmlNode.childNodes[i].attributes[z];
                    //arvoreTxt = arvoreTxt + " (" + atrib.nodeName + " = " + atrib.nodeValue + ")";
                    arvoreTxt = arvoreTxt + " *** " + atrib.nodeValue + " *** ";
                }
                arvoreTxt = arvoreTxt + "<br />\n";

            }else if(xmlNode.childNodes[i].childNodes.length>0){
                    //se tiver filhos eu tenho que pegar o valor pegando o valor do primeiro filho
                    arvoreTxt = arvoreTxt + xmlNode.childNodes[i].firstChild.nodeValue;
                    for(var z=0;z<xmlNode.childNodes[i].attributes.length;z++){
                        var atrib = xmlNode.childNodes[i].attributes[z];
                        arvoreTxt = arvoreTxt + " " + atrib.nodeValue;
                    }

                    //recursividade para carregas os filhos dos filhos
                    arvoreTxt = arvoreTxt + " " + extrairTexto(xmlNode.childNodes[i],identacao + " ");
                }

            }

        }
}
        */

function extrairTexto(xmlNode, identacao){
    var arvoreTxt=""; //esta var armazenara o conteudo


    //document.writeln(xmlNode.childNodes.length+"<br>");
    //for(var i=0;i<xmlNode.childNodes.length;i++){//percorrendo os filhos do nó
        for(var i = 0; i < xmlNode.childNodes.length; i++){
            var ocorpo = xmlNode.childNodes[i].attributes;
            document.writeln("<br> texto = " + ocorpo.nodeValue);
        }

    //}

}

function escrever(texto){
    document.writeln(texto);
}


function escrevervetor(texto){
    for(var i = 0; i < texto.length; i++){
        escrever("["+texto[i]+"]");
    }
}
