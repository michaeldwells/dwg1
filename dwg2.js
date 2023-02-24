function sum(a,b) {return a+b;}
function binarySearch(sortedArray, key){
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

// we start with the TrieNode
const TrieNode = function (key) {
  // the "key" value will be the character in sequence
  this.key = key;
  
  // we keep a reference to parent
  this.parent = null;
  
  // we have hash of children
  this.children = {};
  
  // check to see if the node is at the end
  this.end = false;
  
  this.getWord = function() {
    let output = [];
    let node = this;

    while (node !== null) {
      output.unshift(node.key);
      node = node.parent;
    }

    return output.join('');
  };
}

const Trie = function() {
  this.root = new TrieNode(null);
  
  // inserts a word into the trie.
  this.insert = function(word) {
    let node = this.root; // we start at the root

    // for every character in the word
    for(let i = 0; i < word.length; i++) {
      // check to see if character node exists in children.
      if (!node.children[word[i]]) {
        // if it doesn't exist, we then create it.
        node.children[word[i]] = new TrieNode(word[i]);

        // we also assign the parent to the child node.
        node.children[word[i]].parent = node;
      }

      // proceed to the next depth in the trie.
      node = node.children[word[i]];

      // finally, we check to see if it's the last word.
      if (i == word.length-1) {
        // if it is, we set the end flag to true.
        node.end = true;
      }
    }
  };
  
  // check if it contains a whole word.
  this.contains = function(word) {
    let node = this.root;

    // for every character in the word
    for(let i = 0; i < word.length; i++) {
      // check to see if character node exists in children.
      if (node.children[word[i]]) {
        // if it exists, proceed to the next depth of the trie.
        node = node.children[word[i]];
      } else {
        // doesn't exist, return false since it's not a valid word.
        return false;
      }
    }

    // we finished going through all the words, but is it a whole word?
    return node.end;
  };
  
  // returns true if there is any word with the given prefix
  this.exists = function(prefix) {
    let node = this.root;
    let output = [];

    // for every character in the prefix
    for(let i = 0; i < prefix.length; i++) {
      // make sure prefix actually has words
      if (node.children[prefix[i]]) {
        node = node.children[prefix[i]];
      } else {
        // there's none. just return it.
        return false;
      }
    }

    return true;
  };
  
  // returns every word with given prefix
  this.find = function(prefix) {
    let node = this.root;
    let output = [];

    // for every character in the prefix
    for(let i = 0; i < prefix.length; i++) {
      // make sure prefix actually has words
      if (node.children[prefix[i]]) {
        node = node.children[prefix[i]];
      } else {
        // there's none. just return it.
        return output;
      }
    }

    // recursively find all words in the node
    findAllWords(node, output);

    return output;
  };
  
  // recursive function to find all words in the given node.
  const findAllWords = (node, arr) => {
    // base case, if node is at a word, push to output
    if (node.end) {
      arr.unshift(node.getWord());
    }

    // iterate through each children, call recursive findAllWords
    for (let child in node.children) {
      findAllWords(node.children[child], arr);
    }
  }

  // removes a word from the trie.
  this.remove = function (word) {
      let root = this.root;

      if(!word) return;

      // recursively finds and removes a word
      const removeWord = (node, word) => {

          // check if current node contains the word
          if (node.end && node.getWord() === word) {

              // check and see if node has children
              let hasChildren = Object.keys(node.children).length > 0;

              // if has children we only want to un-flag the end node that marks the end of a word.
              // this way we do not remove words that contain/include supplied word
              if (hasChildren) {
                  node.end = false;
              } else {
                  // remove word by getting parent and setting children to empty dictionary
                  node.parent.children = {};
              }

              return true;
          }

          // recursively remove word from all children
          for (let key in node.children) {
              removeWord(node.children[key], word)
          }

          return false
      };

      // call remove word on root node
      removeWord(root, word);
  };
}

const range_selection = range(100).map(x=>range(x));

const splitsIndices = exported_data["split_indices"];
const substringFrequencies = exported_data["substring_frequencies"];
const wordlist = exported_data["wordlist"];

const word_trie = new Trie();
wordlist.forEach(w=>word_trie.insert(w));

const long_words = wordlist.filter(x=>x.length > 11);

var base_word = pick(long_words);
word_splits = get_splits_of_word(base_word);
word = pick( most_common_split( word_splits, 3 ) );

LOGS(word);
LOGS(word.reduce(sum));

var guess = [];
const guesses = [];
var score = 0;
var tiles = pad_out_blocks(word, 20).map(x=>[x]);
tiles.sort().sort((x,y)=>x[0].length-y[0].length);
tiles = [...tiles.filter((x,i)=>i%2==0), ...tiles.filter((x,i)=>i%2==1).reverse()];

LOGS(tiles);
drawTiles(tiles);

function get_splits_of_word(w) {
	return splitsIndices[w.length].map( x=>range_selection[x.length-1].map( i=>w.slice(x[i],x[i+1]) ) )
}
		
function rarity(block) {
	let f = substringFrequencies[block.length][block] || 0.0000001;
	return (-1)*M.log( f );
}

function split_rarity(blocks, sample_count=4) {
	let sub_split = blocks.map(x=>rarity(x)).sort().reverse().slice(0,sample_count);
	return sub_split.reduce(sum) / sub_split.length;
}

function split_filter(s) {
	for (let i of s.keys()) {
		if (s[i] == "S") return false;
		if (s[i] == "D") return false;
		if (s.slice(0,i).includes(s[i])) return false;
	}
	return true;
}

function most_common_split(splits, count=1, sample_count=4) {
	let rarities = splits.filter(split_filter).map(x=>[split_rarity(x, sample_count),x]);
	return rarities.sort().map(x=>x[1]).slice(0,count);
}

/*
Given a list of blocks, and an answer word that can be ignored, this function 
returns a pair consisting of a random longest word, and the list of blocks 
that form that word.
*/
function longest_word_from_these_blocks(blocks, answer_word) {
	let k = Array.from(blocks.keys());
	let words = k.filter(x=>word_trie.exists(blocks[x])).map(x=>[x]);
	if (words.length == 0) return ["",[]];
	//           [[4,2],[4]]  [4,2]   [1,2,3,4]       [1,3]         [[4,2,1],[4,2,3]]                             [4,2,3]  [b4,b2,b3]  b4+b2+b3
	let new_words = words.map( w => k.filter( x=>!w.includes(x) ).map( x=>[...w,x] ).filter( x=>word_trie.exists(x.map(i=>blocks[i]).reduce(sum)) ) ).flat();
	while (new_words.length > 0) {
		words = new_words;
		new_words = words.map( w => k.filter( x=>!w.includes(x) ).map( x=>[...w,x] ).filter( x=>word_trie.exists(x.map(i=>blocks[i]).reduce(sum)) ) ).flat();
	}
	let long_words = words.map((x,i)=>[x.map(y=>blocks[y]).reduce(sum),i]).filter(x=>x[0]!=answer_word).sort((a,b)=>b[0].length - a[0].length);
	long_words = long_words.filter(x=>word_trie.contains(x[0]));
	if (long_words.length == 0) return ["",[]];
	return [long_words[0][0], words[long_words[0][1]].map(x=>blocks[x])];
}

function pad_out_blocks(answer_split, total_block_count) {
	let answer_word = answer_split.reduce(sum);
	let answer_length = answer_word.length;
	let answer_set = new Set(answer_split);
	let answer_splits_set = new Set(get_splits_of_word(answer_word).flat());
	let result_blocks = new Set(answer_split);
	let short_words = wordlist.filter(x=>x.length < answer_length && x.length > (answer_length/2));
	shuffle(short_words);
	
	let doubles = range_selection[answer_split.length-1].map(i=>answer_split[i]+answer_split[i+1]);
	let	min_double = M.min(...doubles.map(x=>x.length));
	
	// This lot compiles a list of splits of words for each adjacent pair of 
	// blocks in the answer. Any blocks already in the answer are filtered out.
	let good_friends = {};
	range_selection[answer_split.length-1].forEach(i=>good_friends[i]=[]); // {i:[] for i in [1..answer_split.length-1]}
	for (const w of short_words) {
		if (w.length < min_double+3) break;
		for (const i of range_selection[w.length - min_double]) {
			let d_i = 0;
			while ((d_i < doubles.length) && (w.slice(i,i+doubles[d_i].length) != doubles[d_i])) d_i += 1;
			if (d_i < doubles.length) {
				let s = get_splits_of_word(w).filter(x=>x.length < 5);
				shuffle(s);
				let j = 0;
				while ((j < s.length) && (s[j].filter(x=>answer_set.has(x)).length < 2)) j += 1;
				if (j < s.length) {
					let sj = s[j].filter(x=>answer_split[d_i]!=x && answer_split[d_i+1]!=x);
					if (sj.every(x=>!answer_splits_set.has(x)))
						good_friends[d_i].push(sj);
				}
			}
		}
	}
	
	Object.keys(good_friends).forEach(i=>shuffle(good_friends[i]));
	while (result_blocks.size < total_block_count && Object.values(good_friends).flat().length > 0) {
		let padding_words = [];
		
		for (n of Object.keys(good_friends)) {
			if (good_friends[n].length == 0) continue;
			let next_word = good_friends[n].pop();
			padding_words.push(next_word);
		}
		
		let longest_word = longest_word_from_these_blocks([...result_blocks, ...padding_words.flat()], answer_word);
		while (longest_word[0].length >= answer_length) {
			let problem_blocks = new Set( longest_word[1].filter(x=>!answer_split.includes(x)) );
			padding_words = padding_words.filter(w=>w.every(x=>!problem_blocks.has(x)));
			longest_word = longest_word_from_these_blocks([...result_blocks, ...padding_words.flat()], answer_word);
		}
		
		if (result_blocks.size + padding_words.flat().length < total_block_count) {
			padding_words.flat().forEach(x=>result_blocks.add(x));
		} else {
			shuffle(padding_words);
			while ((padding_words.length > 0) && ((result_blocks.size + padding_words[0].length) < total_block_count)) {
				let w = padding_words.shift();
				w.forEach(x=>result_blocks.add(x));
			}
			padding_words = padding_words.flat();
			shuffle(padding_words);
			while (result_blocks.size < total_block_count && padding_words.length > 0) {
				result_blocks.add(padding_words.pop());
			}
		}
	}
	
	result_blocks = [...result_blocks];
	
	// This should be redundant but it costs nothing to keep it in.
	if (result_blocks.length > total_block_count) {
		optional_blocks = result_blocks.filter(x=>!answer_split.includes(x));
		rarities = optional_blocks.sort((a,b)=>rarity(b) - rarity(a));
		result_blocks = [...answer_split, ...rarities.slice(0,total_block_count - answer_split.length)];
	}
	
	return result_blocks;
}



///////////////////////////////////////////////////////////////////////////////
/* UI Functions                                                              */
///////////////////////////////////////////////////////////////////////////////

function drawTiles(tiles) {
	let e = $.id("tiles");
	e.innerHTML = "";
	tiles.forEach((t,i) => $.new(
		["div",
			{"class":"tile","onClick":"clickTile("+i+");"},
			...t.map(x => ["span",{"class":"subtile"},x])
		], e));
}

function updateTiles(tiles) {
	let e = document.getElementById("tiles");
	for (let i of tiles.keys()) {
		let tile = e.querySelector("div:nth-child("+(i+1)+")");
		if (guess.indexOf(i) >= 0) {
			tile.classList.add("selected");
		} else {
			tile.classList.remove("selected");
		}
	}
}

function drawGuess(guess, tiles) {
	let e = $.id("working-answer");
	e.innerHTML = "";
	guess.forEach(i => $.new(["div",{"class":"guess-tile","onClick":"clickTile("+i+");"},tiles[i].reduce(sum)], e));
}

/*
OK, so first, the "guess" in this case is an array of numbers that are the
indices of tiles in the "tiles" array, which in turn holds the actual
letters. So we decode that and store the result in "g"

The "word" is just an array of letter blocks that our guess is trying to
match.

The entries function gives us [index,value] pairs. We filter the entries
of "g" to find only those tiles in the guess that also appear somewhere in
the word.

Now we want to build a list of all possible multi-tile blocks in the guess
that match somewhere in the word. So we find where in the word each of our
tiles starts to match (there may be more than one) and work through both
the word and the guess together to see how long the match is. If it's 
longer than the tile we used to guess, then that's a candidate for a new 
long tile.
*/
function expandTilesGroups(guess, word) {
	let g = guess.map(x => tiles[x]);
	let matches = Array.from(g.entries()).filter(x=>word.indexOf(x[1][0]) > -1);
	if (matches.length == 0) return; // If there are no matches, we're done.
	let candidates = [];
	for (const m of matches) { // m: [index in "guess", [tile, tile,... ]]
		let starts = Array.from(word.entries()).filter(x=>x[1]==m[1][0]);
		for (const s of starts) { // s: [index in "word", [tile, tile,... ]]
			let restOfGuess = g.slice(m[0]).flat();
			let restOfWord = word.slice(s[0]).flat();
			let l = 0; // length of matching segment in base tiles
			/* This compares the text of tiles, one tile at a time. */
			while (
			  (l < restOfWord.length) && 
			  (l < restOfGuess.length) && 
			  (restOfWord[l] == restOfGuess[l])
			) l += 1;
			
			if (l > m[1].length) {
				/* The matching set is longer than the existing tile. */
				/* So we add tiles to a new candidate tileset until 
				the number of letters in the tile equals our matching string */
				candidates.unshift([ guess[m[0]] ]);
				let i = 1;
				while (candidates[0].map(x=>tiles[x]).flat().length < l) {
					candidates[0].push(guess[m[0]+i]);
					i += 1;
				}
			}
		}
	}
	if (candidates.length == 0) return;
	
	let newTiles = [];
	/* Some of our candidate matches may share tiles, and this wouldn't work.
	So we work through from longest to shortest, discarding any set that uses
	a tile we've seen before. */
	for (const c of candidates.sort((x,y)=>y.length-x.length)) {
		if (c.every(x => newTiles.flat().indexOf(x) < 0))
			newTiles.push([...c]);
	}
	// "newTiles" is now a list of lists of indices of tiles, representing tiles to be merged.
	let tileQueue = [];
	newTiles.forEach(t=>tileQueue.push(t.map(i => tiles[i]).flat()));
	newTiles.flat().sort((x,y)=>y-x).forEach(i=>tiles.splice(i,1));
	tiles = [...tiles, ...tileQueue];
	drawTiles(tiles);
}

function submitGuess() {
	let gParts = guess.map(x => tiles[x].reduce(sum));
	let gWord = gParts.reduce(sum);
	let aWord = word.reduce(sum);
	expandTilesGroups(guess, word);
	guesses.push(gParts);
	guess = [];
	$.new(["div",...gParts.map(x=>["span",{"class":"wa-tile"},x])], $.id("wrong-answers"));
	drawGuess(guess, tiles);
	updateTiles(tiles);
	if (gWord == aWord) {
		$.id("finalword").innerHTML = gWord;
		//$.id("finalscore").innerHTML = "Score: "+score;
		$.id("scorelayer").classList.remove("hide");
	}
}

function addToGuess(tileIndex) {
	if (guess.indexOf(tileIndex) < 0) {
		guess.push(tileIndex);
	}
}

function clickTile(i) {
	if (guess.indexOf(i) >= 0) {
		guess.splice(guess.indexOf(i), 1);
	} else {
		addToGuess(i);
	}
	drawGuess(guess, tiles);
	updateTiles(tiles);
}

function stopProp(e) {
	if (typeof e !== "undefined") e?.stopPropagation();
}
function hideHelpLayer(e) {
	if (typeof e !== "undefined") e?.stopPropagation();
	$.id('help-layer').classList.add('hidelayer');
	$.id('helpbutton').classList.remove('hidelayer');
}
function toggleHelpLayer(e) {
	if (typeof e !== "undefined") e?.stopPropagation();
	$.id('help-layer').classList.toggle('hidelayer');
	$.id('helpbutton').classList.toggle('hidelayer');
}

function toggleHelpPageLeft() {
	let pages = Array.from($.class("leftpage"));
	let activePage = 0;
	let maxPage = pages.length;
	for (p of pages.keys()) {
		if (pages[p].classList.contains('showpage'+(p+1).toString())) {
			activePage = M.max(p,1);
		}
	}
	for (page of pages) {
		for (p of pages.keys()) {
			page.classList.remove('showpage'+(p+1).toString());
		}
		page.classList.add('showpage'+(activePage).toString());
	}
	if (activePage <= 1) $.id('sidemaskl').classList.remove('active');
	if (activePage < maxPage) $.id('sidemaskr').classList.add('active');
}
function toggleHelpPageRight() {
	let pages = Array.from($.class("leftpage"));
	let activePage = 0;
	let maxPage = pages.length;
	for (p of pages.keys()) {
		if (pages[p].classList.contains('showpage'+(p+1).toString())) {
			activePage = M.min(p+2,maxPage);
		}
	}
	for (page of pages) {
		for (p of pages.keys()) {
			page.classList.remove('showpage'+(p+1).toString());
		}
		page.classList.add('showpage'+(activePage).toString());
	}
	if (activePage > 1) $.id('sidemaskl').classList.add('active');
	if (activePage >= maxPage) $.id('sidemaskr').classList.remove('active');
}

//$.id("scorelayer").setAttribute("onClick", "answers.hideScore()");
$.q("body")[0].addEventListener("click", hideHelpLayer);
//$.id("helpbutton").setAttribute("onClick", "toggleHelpLayer();");
$.id("helpbutton").addEventListener("click", toggleHelpLayer);
$.id("help-layer").addEventListener("click", stopProp);
$.id("leftclosebutton").addEventListener("click", toggleHelpLayer);
$.id("leftclosebutton").addEventListener("click", toggleHelpLayer);
$.id("sidemaskl").addEventListener("click", toggleHelpPageLeft);
$.id("sidemaskr").addEventListener("click", toggleHelpPageRight);
$.class("middle")[0].classList.remove("hidelayer");
setTimeout(()=>$.id("helpbutton").classList.remove("hidelayer"), 200);
