'use strict';

const LOG = console.log;
const LOGS = (x) => LOG(String(x));

const M = Math;


///////////////////////////////////////////////////////////////////////////////
// Random Numbers                                                            //
///////////////////////////////////////////////////////////////////////////////

function rnd(max) {return M.floor(M.random() * M.floor(max));}
function rndw(max, weight) {return M.floor((M.random() ** weight) * M.floor(max));}
function opt(a) {return a.at(rnd(a.length));}
function pick(a) {return a.splice(rnd(a.length),1)[0];}
function pickw(a, weight) {return a.splice(rndw(a.length, weight),1)[0];}
function shuffle(a) {
	let counter = a.length;
	while (counter > 0) {
		let index = Math.floor(Math.random() * counter);
		counter--;
		let temp = a[counter];
		a[counter] = a[index];
		a[index] = temp;
	}
}

  //---------------------------------------------------------------------------
  // Hash functions
  //---------------------------------------------------------------------------

function cyrb128(str) { // 128-bit hash.
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

function hash(s) {return cyrb128(s)[0]}

  //---------------------------------------------------------------------------
  // Pseudo-random number generators
  //---------------------------------------------------------------------------

    // Pseudo-random number generator with 128-bit seed.
function sfc32(a, b, c, d) {return function() {a>>>=0;b>>>=0;c>>>=0;d>>>=0;var t=(a+b)|0;
	a=b^b>>>9;b=c+(c<<3)|0;c=(c<<21|c>>>11);d=d+1|0;t=t+d|0;c=c+t|0;return (t>>>0)/4294967296;}}
    // Pseudo-random number generator with 32-bit seed.
function mulberry32(a) {return function() {var t=a+=0x6D2B79F5;
	t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}}

function prgn_generator(a) {return mulberry32(a)}

var prng, prng_seed;
function seedPrng( s = hash(Date.now().toString()) ) { prng_seed = s; prng = prgn_generator(prng_seed); }

seedPrng();

  //---------------------------------------------------------------------------
  // Pseudo-random functions
  //---------------------------------------------------------------------------

function prnd(max) {return M.floor(prng() * M.floor(max));}
function prndw(max, weight) {return M.floor((prng() ** weight) * M.floor(max));}
function popt(a) {return a.at(prnd(a.length));}
function ppick(a) {return a.splice(prnd(a.length),1)[0];}
function ppickw(a, weight) {return a.splice(prndw(a.length, weight),1)[0];}
function pshuffle(a) {
	let counter = a.length;
	while (counter > 0) {
		let index = Math.floor(prng() * counter);
		counter--;
		let temp = a[counter];
		a[counter] = a[index];
		a[index] = temp;
	}
}


///////////////////////////////////////////////////////////////////////////////
// Combinatorics                                                             //
///////////////////////////////////////////////////////////////////////////////

function permutations(l) {
	if (l.length == 1) return [l];
	if (l.length == 0) return [];
	
	let results = [];
	for (let i of l.keys()) {
		for (let m of permutations([...l.slice(0,i), ...l.slice(i+1)])) {
			results.push([l[i], ...m]);
		}
	}
	return results;
}
function combinations(l, r) {
	if (l.length < r) return [];
	if (l.length == r) return permutations(l);
	if (r == 1) return l.map(x => [x]);
	if (r < 1) return [];
	
	let results = [];
	for (let i of l.keys()) {
		for (let m of combinations([...l.slice(0,i), ...l.slice(i+1)], r-1)) {
			results.push([l[i], ...m]);
		}
	}
	return results;
}
function allCombinations(l) {
	let results = [];
	for (let i of range(l.length+1)) {
		results = [...results, ...combinations(l,i)];
	}
	return results;
}


///////////////////////////////////////////////////////////////////////////////
// Set Theory                                                                //
///////////////////////////////////////////////////////////////////////////////

function subsets(l) {
	if (l.length == 0) return [];
	if (l.length == 1) return [[l[0]]];
	return range(l.length).
		map(n => [
			[l[n]], 
			...subsets(l.slice(n+1)).map(x => [l[n], ...x])
		]).
		reduce((a,v) => [...a, ...v]);
}

///////////////////////////////////////////////////////////////////////////////
// Misc. Math                                                                //
///////////////////////////////////////////////////////////////////////////////

function dec(x) {return parseInt(x,10);}
function hex(x) {return parseInt(x,16);}

const sum = (a,b) => a+b;
const len = (x) => x.length;
const trim = (x) => x.trim();

function range(size, startAt = 0) {return [...Array(size).keys()].map(i => i + startAt);}

// Matrix Transpoition
function transpose(m) {return Array.from(m[0]).map((c, i) => m.map(r => r[i]));}


///////////////////////////////////////////////////////////////////////////////
// Data Structures                                                           //
///////////////////////////////////////////////////////////////////////////////

  //---------------------------------------------------------------------------
  // Lists
  //---------------------------------------------------------------------------

function append(arr, val) { arr.splice(arr.length, 0, val); }
function prepend(arr, val) { arr.splice(0, 0, val); }

  //---------------------------------------------------------------------------
  // Binary Search
  //---------------------------------------------------------------------------

function binarySearch(sortedArray, key) {
    let start = 0;
    let end = sortedArray.length - 1;

    while (start <= end) {
        let middle = Math.floor((start + end) / 2);

        if (sortedArray[middle] === key) return middle;
        if (sortedArray[middle] < key) {
            start = middle + 1;
        } else {
            end = middle - 1;
        }
    }
	if (end < 0) return end;
    return (-1)*end;
}

  //---------------------------------------------------------------------------
  // TRIE Data Structure
  //---------------------------------------------------------------------------

class TrieNode {
	constructor(key) {
		this.key = key;
		this.parent = null;
		this.children = {};
		this.end = false;
	}
  
	getWord() {
		let output = [];
		let node = this;

		while (node !== null) {
			output.unshift(node.key);
			node = node.parent;
		}

		return output.join('');
	}
}

class Trie {
	constructor() {
		this.root = new TrieNode(null);
	}
  
	insert(word) {
		let node = this.root;
		for(let i = 0; i < word.length; i++) {
			if (!node.children[word[i]]) {
				node.children[word[i]] = new TrieNode(word[i]);
				node.children[word[i]].parent = node;
			}

			node = node.children[word[i]];

			if (i == word.length-1) {
				node.end = true;
			}
		}
	}
  
	// check if it contains a whole word.
	contains(word) {
		let node = this.root;
		for(let i = 0; i < word.length; i++) {
			if (node.children[word[i]]) {
				node = node.children[word[i]];
			} else {
				return false;
			}
		}

		return node.end;
	}
  
	// returns true if there is any word with the given prefix
	exists(prefix) {
		let node = this.root;
		let output = [];
		for(let i = 0; i < prefix.length; i++) {
			if (node.children[prefix[i]]) {
				node = node.children[prefix[i]];
			} else {
				return false;
			}
		}

		return true;
	}
  
	// returns every word with given prefix
	find(prefix) {
		let node = this.root;
		let output = [];
		for(let i = 0; i < prefix.length; i++) {
			if (node.children[prefix[i]]) {
				node = node.children[prefix[i]];
			} else {
				return output;
			}
		}

		Trie.findAllWords(node, output);

		return output;
	}

	// recursive function to find all words in the given node.
	static findAllWords(node, arr) {
		if (node.end) {
			arr.unshift(node.getWord());
		}

		for (let child in node.children) {
			Trie.findAllWords(node.children[child], arr);
		}
	}

	// removes a word from the trie.
	remove(word) {
		let root = this.root;

		if(!word) return;

		const removeWord = (node, word) => {
			if (node.end && node.getWord() === word) {
				let hasChildren = Object.keys(node.children).length > 0;
				if (hasChildren) {
					node.end = false;
				} else {
					node.parent.children = {};
				}

				return true;
			}
			for (let key in node.children) {
				removeWord(node.children[key], word)
			}

			return false
		};
		removeWord(root, word);
	}
}


///////////////////////////////////////////////////////////////////////////////
// DOM                                                                       //
///////////////////////////////////////////////////////////////////////////////

function getJSONCookieData(cookieName) {
	const cookieString = document.cookie;

	if (cookieString.length == 0) return false;

	const cookieValue = 
		cookieString.
		split(";").
		map(trim).
		find((row) => row.startsWith(cookieName + "="))?.
		split("=")[1];

	if (!cookieValue) return false;

	const data = JSON.parse(cookieValue);

	return data;
}

function setJSONCookie(cookieName, data) {
	document.cookie = cookieName + "=" + JSON.stringify(data) + "; max-age=" + String(60*60*24) + "; SameSite=Lax;";
}

var X = document;

const Xw = () => X.documentElement.clientWidth;
const Xh = () => X.documentElement.clientHeight;

const Xid = (x) => X.getElementById(x);
const Xts = (x) => X.getElementsByTagName(x);
const Xt = (x) => Xts(x)[0];
const Xcs = (x) => X.getElementsByClassName(x);
const Xc = (x) => Xcs(x)[0];
const Xq = (x) => X.querySelector(x);
const Xqs = (x) => X.querySelectorAll(x);

/*
document.w = document.documentElement.clientWidth;
document.h = document.documentElement.clientHeight;

document.id = document.getElementById;
document.ts = document.getElementsByTagName;
document.t = (x) => document.ts(x)[0];
document.cs = document.getElementsByClassName;
document.c = (x) => document.cs(x)[0];
document.q = document.querySelector;
document.qs = document.querySelectorAll;
*/

const Xnew = function(x,parentNode=null) { // x: "Hello" or ["tag",{attribute:"value"},child0,child1....]
    let result=null;
    if (Array.isArray(x)) {
        let newNode=document.createElement(x.shift());
        while (x.length>0) {
            let x0=x.shift();
            // attribute object is optional, may be anywhere in list after tag, need not be unique
            if (typeof(x0)=="object" && !Array.isArray(x0)) {
                for (let key in x0) newNode.setAttribute(key,x0[key]);
            } else {
                newNode.appendChild(Xnew(x0));
            }
        }
        result=newNode;
    } else {
        result=document.createTextNode(x);
    }
    if (parentNode!=null) { // if parentNode is omitted, new node is not added anywhere
        if (typeof(parentNode)=="string") { // if parentNode is a string, treat it as a CSS query
            parentNode=Xq(parentNode);
        }
        // if parentNode is an array, append a copy of the new node to every item in the array
        if (typeof(parentNode.length)=="number") {
            for (let i=1;i<parentNode.length;i++) {
                parentNode[i]?.appendChild(result.cloneNode(true));
            }
            parentNode[0]?.appendChild(result);
        } else { // otherwise assume parentNode is an element
            parentNode?.appendChild(result);
        }
    }
    return result;
}
