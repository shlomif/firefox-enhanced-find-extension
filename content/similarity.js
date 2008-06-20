



//*****************************
// Levenshtein Distance
//*****************************
function min_value(a, b, c)
{
	var mi = parseInt(a);
	if (parseInt(b) < mi)
	{
		mi = parseInt(b);
	}
	if (parseInt(c) < mi)
	{
		mi = parseInt(c);
	}
	return mi;
}

function lev_distance(s, t)
{
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
	
	var d = new Array(n+1);
	
	if (n == 0){return m;}
	if (m == 0){return n;}

	for(i = 0; i < n+1; i++)
	{
		var tmp = new Array(m+1);
		d[i] = tmp;
	}

	for (i = 0; i <= n; i++)
	{
		for (j = 0; j <= m; j++)
		{
			d[i][j] = 0;
		}
	}
	
	for (i = 0; i <= n; i++)
	{
		d[i][0] = i;
	}

	for (j = 0; j <= m; j++)
	{
		d[0][j] = j;
	}
					
	for (i = 1; i <= n; i++)
	{
		var s_i = s.charAt(i - 1);

		for (j = 1; j <= m; j++)
		{
			var t_j = t.charAt(j - 1);

			if (s_i == t_j){
				cost = 0;
			}else{
				cost = 1;
			}

			d[i][j] = min_value(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1] + cost);
		}
	}

	return d[n][m];
}

function termScore(q, term)
{
	var most;
	var score;

	if(q.length > term.length)
	{
		most = q.length;
	}else
	{
		most = term.length;
	}	

	score = parseFloat(parseInt(lev_distance(q, term))/most);

	return (1-score);
}

// montar uma classe para armazenar (termo, score)
/*function termsSim()
{

}*/

// fazer uma lista de termos para testar o score
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


function bubble_sort(tl)
{
	var term_list = tl;
	for(i = 0; i < term_list.length; i++)
	{
		var x = term_list[i];
		for(j = i; j < term_list.length; j++){
			var y = term_list[j];
			if(x.getScore() < y.getScore()){
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


function extract_text_from_page()
{
var texto = "	pessas filipe de sá mesquita  antonio gomes de araujo netto roberto oliveira dos santos ";
	texto += "Introdução Os gregos criaram vários mitos para poder passar mensagens ";
	texto += "para as pessoas e também com o objetivo de preservar a memória histórica ";
	texto += " de seu povo. Há três mil anos, não havia explicações científicas para grande";
	texto += " parte dos fenômenos da (natureza) ou para os andre pedraho  acontecimentos históricos. ";
	texto += "Portanto, para buscar um significado para pesoas, também o objetvo os fatos políticos, econômicos e sociais, ";
	texto += "os gregos criaran uma série de histórias, de origem imaginativa, que eram transmitidas,";
	texto += "	principalmente, betiti san através tomaz noleto silva juntior da literatura oral.";

	document.write(texto);
	text_split = texto.split(/\s+/);
	return text_split;
}

//function get_similar_terms(dom, treshould)
function get_similar_terms()
{
var q = "pessoas";
var treshould = 0.7;
var score_tmp = 0.0;
var term_list = new Array();
var text_split = extract_text_from_page();
var terms_to_find = new Array();

	for (i = 0; i < text_split.length; i++){
		score_tmp = termScore(q, text_split[i]);
		if (score_tmp >= treshould)
		{
			var x = new TermScore(text_split[i], score_tmp);
			term_list.push(x);
		}
	}

	sort_term_list = bubble_sort(term_list);
	for (i = 0; i < sort_term_list.length; i++)
	{
		terms_to_find.push(sort_term_list[i].getTerm());
	}
	
	
	return terms_to_find;
}

