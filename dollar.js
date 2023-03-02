'use strict';

const LOG = console.log;
function LOGS(x) {return LOG(x.toString());}

const M = Math;
function rnd(max) {return M.floor(M.random() * M.floor(max));}
function rndw(max, weight) {return M.floor((M.random() ** weight) * M.floor(max));}
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
function subsets(l) {
	if (l.length == 0) return [];
	if (l.length == 1) return [[l[0]]];
	return range(l.length).map(n => [[l[n]], ...subsets(l.slice(n+1)).map(x => [l[n], ...x])]).reduce((a,v) => [...a, ...v]);
}
function dec(x) {return parseInt(x,10);}
function hex(x) {return parseInt(x,16);}
function range(size, startAt = 0) {return [...Array(size).keys()].map(i => i + startAt);}
/*
const range = (start, stop, step) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);
*/

const sum = (a,b) => a+b;
const len = (x) => x.length;

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
    return (-1)*end;
}

///////////////////////////////////////////////////////////////////////////////
// TRIE Data Structure                                                       //
///////////////////////////////////////////////////////////////////////////////
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


const $ = document;

Object.defineProperty($, 'width', { get: function() { return this.documentElement.clientWidth; } } );
Object.defineProperty($, 'height', { get: function() { return this.documentElement.clientHeight; } } );

$.id = document.getElementById;
$.tag = document.getElementsByTagName;
$.class = document.getElementsByClassName;
$.q = document.querySelectorAll;

$.new = function(x,parentNode=null) { // x: "Hello" or ["tag",{attribute:"value"},child0,child1....]
    let result=null;
    if (Array.isArray(x)) {
        let newNode=document.createElement(x.shift());
        while (x.length>0) {
            let x0=x.shift();
            // attribute object is optional, may be anywhere in list after tag, need not be unique
            if (typeof(x0)=="object" && !Array.isArray(x0)) {
                for (let key in x0) newNode.setAttribute(key,x0[key]);
            } else {
                newNode.appendChild($.new(x0));
            }
        }
        result=newNode;
    } else {
        result=document.createTextNode(x);
    }
    if (parentNode!=null) { // if parentNode is omitted, new node is not added anywhere
        if (typeof(parentNode)=="string") { // if parentNode is a string, treat it as a CSS query
            parentNode=$.q(parentNode);
        }
        // if parentNode is a list, append a copy of the new node to every item in the list
        if (typeof(parentNode.length)=="number") {
            for (let i=1;i<parentNode.length;i++) {
                parentNode[i].appendChild(result.cloneNode(true));
            }
            parentNode[0].appendChild(result);
        } else {
            parentNode.appendChild(result);
        }
    }
    return result;
}
