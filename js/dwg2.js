const query_string = window.location.search.substring(1);
const query_bool = query_string.length > 0;
const query_number = Number(query_string);
const load_time = new Date(Date.now());
seedPrng(hash(load_time.getUTCDate().toString() + load_time.getUTCMonth().toString() + load_time.getUTCFullYear().toString()));
if (query_bool) {
	LOG(query_string);
	if (query_number > 0) {
		seedPrng(query_number);
	} else {
		seedPrng();
	}
}

const range_selection = range(100).map(x=>range(x));

const splitsIndices = exported_data["split_indices"];
const substringFrequencies = exported_data["substring_frequencies"];
const wordlist = exported_data["wordlist"];

const word_trie = new Trie();
wordlist.forEach(w=>word_trie.insert(w));

const long_words = wordlist.filter(x=>x.length > 11);

var guess = [];
const guesses = [];
var score = 0;

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
	//LOG(blocks);
	let k = Array.from(blocks.keys());
	//LOG(k);
	let words = k.filter(x=>word_trie.exists(blocks[x])).map(x=>[x]);
	//LOGS(words.map(w=>w.map(x=>blocks[x]).reduce(sum)));
	if (words.length == 0) return ["",[]];
	//           [[4,2],[4]]  [4,2]   [1,2,3,4]       [1,3]         [[4,2,1],[4,2,3]]                             [4,2,3]  [b4,b2,b3]  b4+b2+b3
	let new_words = words.map( w => k.filter( x=>!w.includes(x) ).map( x=>[...w,x] ).filter( x=>word_trie.exists(x.map(i=>blocks[i]).reduce(sum)) ) ).flat();
	while (new_words.length > 0) {
		words = new_words;
		//LOGS(words.map(w=>w.map(x=>blocks[x]).reduce(sum)+" "+w.map(x=>blocks[x]).reduce(sum).length));
		new_words = words.map( w => k.filter( x=>!w.includes(x) ).map( x=>[...w,x] ).filter( x=>word_trie.exists(x.map(i=>blocks[i]).reduce(sum)) ) ).flat();
	}
	//LOGS(new_words.map(w=>w.map(x=>blocks[x]).reduce(sum)+" "+w.map(x=>blocks[x]).reduce(sum).length));
	let long_words = words.map((x,i)=>[x.map(y=>blocks[y]).reduce(sum),i]).filter(x=>x[0]!=answer_word).sort((a,b)=>b[0].length - a[0].length);
	//LOG(long_words.length);
	long_words = long_words.filter(x=>word_trie.contains(x[0]));
	//LOG(long_words);
	if (long_words.length == 0) return ["",[]];
	//LOG(words[long_words[0][1]].map(x=>blocks[x]));
	return [long_words[0][0], words[long_words[0][1]].map(x=>blocks[x])];
}

function get_shared_matches(word_split, word_list) {
	let split_set = new Set(word_split);
	let all_splits_set = new Set(get_splits_of_word(word_split.reduce(sum)).flat());
	let doubles = range_selection[word_split.length-1].map(i=>word_split[i]+word_split[i+1]);
	let	min_double = M.min(...doubles.map(len));
	let shared_matches = {};
	range_selection[word_split.length-1].forEach(i=>shared_matches[i]=[]); // {i:[] for i in [1..word_split.length-1]}
	for (const w of word_list) {
		if (w.length < min_double+3) break;
		for (const i of range_selection[w.length - min_double]) {
			let d_i = 0;
			while ((d_i < doubles.length) && (w.slice(i,i+doubles[d_i].length) != doubles[d_i])) d_i += 1;
			if (d_i < doubles.length) {
				let s = get_splits_of_word(w).filter(x=>x.length < 6);
				pshuffle(s);
				let j = 0;
				for (const jj of s.keys()) {
					j = jj;
					let matches = s[j].filter(x=>split_set.has(x));
					if (matches.length != 2) {
						j += 1;
						continue;
					}
					let match_sj_is = Array.from(s[j].keys()).filter(x=>matches.indexOf(s[j][x])>=0);
					let match_ans_is = Array.from(word_split.keys()).filter(x=>matches.indexOf(word_split[x])>=0);
					if (s[j][match_sj_is[0]] == word_split[match_ans_is[0]]) {
						break;
					}
					j += 1;
				}
				if (j < s.length) {
					let sj = s[j].filter(x=>word_split[d_i]!=x && word_split[d_i+1]!=x);
					if (sj.every(x=>!all_splits_set.has(x)))
						shared_matches[d_i].push(sj);
				}
			}
		}
	}
	return shared_matches;
}

function pad_out_blocks(answer_split, total_block_count) {
	let answer_word = answer_split.reduce(sum);
	let answer_length = answer_word.length;
	let result_blocks = new Set(answer_split);
//	let short_words = words.filter(x=>x.length < answer_length && x.length > (answer_length/2));
	let short_words = common.filter(x=>x.length < answer_length && x.length > (answer_length/2));
	pshuffle(short_words);
	
	let shared_matches = get_shared_matches(answer_split, short_words);
	let worst_case = M.min(...Object.values(shared_matches).map(len));
	LOGS(answer_split);
	LOGS("Min # of words sharing a pair of blocks: " + worst_case);
	
	Object.keys(shared_matches).forEach(i=>pshuffle(shared_matches[i]));
	while (result_blocks.size < total_block_count && Object.values(shared_matches).flat().length > 0) {
		let padding_words = [];
		
		for (n of Object.keys(shared_matches)) {
			if (shared_matches[n].length == 0) continue;
			let next_word = shared_matches[n].pop();
			padding_words.push(next_word);
		}
		
		let longest_word = longest_word_from_these_blocks([...result_blocks, ...padding_words.flat()], answer_word);
		while (longest_word[0].length >= answer_length) {
			let problem_blocks = new Set( longest_word[1].filter(x=>!answer_split.includes(x)) );
			padding_words = padding_words.filter(w=>w.every(x=>!problem_blocks.has(x)));
			longest_word = longest_word_from_these_blocks([...result_blocks, ...padding_words.flat()], answer_word);
		}
		
		LOGS(padding_words.map(x=>"("+String(x)+")"));
		//LOGS("r"+result_blocks.size+" + " + "p"+padding_words.flat().length + (result_blocks.size + padding_words.flat().length < total_block_count?" < ":" >= ") + total_block_count);
		
		if (result_blocks.size + padding_words.flat().length < total_block_count) {
			padding_words.flat().forEach(x=>result_blocks.add(x));
		} else {
			pshuffle(padding_words);
			while ((padding_words.length > 0) && ((result_blocks.size + padding_words[0].length) < total_block_count)) {
				let w = padding_words.shift();
				w.forEach(x=>result_blocks.add(x));
			}
			padding_words = padding_words.flat();
			pshuffle(padding_words);
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
	
	return [worst_case,result_blocks];
}



///////////////////////////////////////////////////////////////////////////////
/* UI Functions                                                              */
///////////////////////////////////////////////////////////////////////////////

function drawTiles(tiles) {
	let e = Xid("tiles");
	e.innerHTML = "";
	tiles.forEach((t,i) => Xnew(
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
	let e = Xid("working-answer");
	e.innerHTML = "";
	guess.forEach(i => Xnew(["div",{"class":"guess-tile","onClick":"clickTile("+i+");"},tiles[i].reduce(sum)], e));
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
	if (word_trie.contains(gWord) || ((typeof dictionaryEpic !== "undefined") && (binarySearch(epic,gWord) >= 0))) {
		expandTilesGroups(guess, word);
		guesses.push(gParts);
		guess = [];
		Xnew(["div",...gParts.map(x=>["span",{"class":"wa-tile"},x])], Xid("wrong-answers"));
		drawGuess(guess, tiles);
		updateTiles(tiles);
		if (gWord.length >= aWord.length) {
			Xid("finalword").innerHTML = gWord;
			//$.id("finalscore").innerHTML = "Score: "+score;
			Xid("scorelayer").classList.remove("hide");
		}
	}
}

function addToGuess(tileIndex) {
	if (guess.indexOf(tileIndex) < 0 && guess.map(x=>tiles[x]).flat().length < 10) {
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
	Xid('help-layer').classList.add('hidelayer');
	Xid('helpbutton').classList.remove('hidelayer');
}
function toggleHelpLayer(e) {
	if (typeof e !== "undefined") e?.stopPropagation();
	Xid('help-layer').classList.toggle('hidelayer');
	Xid('helpbutton').classList.toggle('hidelayer');
}

function toggleHelpPageLeft() {
	let pages = Array.from(Xcs("leftpage"));
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
	if (activePage <= 1) Xid('sidemaskl').classList.remove('active');
	if (activePage < maxPage) Xid('sidemaskr').classList.add('active');
}
function toggleHelpPageRight() {
	let pages = Array.from(Xcs("leftpage"));
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
	if (activePage > 1) Xid('sidemaskl').classList.add('active');
	if (activePage >= maxPage) Xid('sidemaskr').classList.remove('active');
}

var base_word = "";
var word_splits = [];
var word = [];
var tiles = [];

let fun = false;
let fallback = 10;
while (!fun && fallback > 0) {
	fallback -= 1;
	
	base_word = ppick(long_words);
	word_splits = get_splits_of_word(base_word);
	word = ppick( most_common_split( word_splits, 3 ) );

	[worst,tiles] = pad_out_blocks(word, 20);
	tiles = tiles.map(x=>[x]);
	tiles.sort().sort((x,y)=>x[0].length-y[0].length);
	tiles = [...tiles.filter((x,i)=>i%2==0), ...tiles.filter((x,i)=>i%2==1).reverse()];
	
	let tile_letters = tiles.flat().reduce(sum);
	let tile_letter_set = new Set(tile_letters);
	
	let ratio = tile_letter_set.size / tile_letters.length;
	let most_common = M.max(...Array.from(tile_letter_set.values()).map(x=>Array.from(tile_letters.matchAll(x)).length));

	LOG("# of different letters: " + tile_letter_set.size + ", Rarity of letters per tile: " + ratio.toPrecision(4) + ", # of most common letter: " + most_common);
	LOGS(" ");
	//LOG(most_common);

	//fun = (tile_letter_set.size / tile_letters.length) > 0.36;
	//fun = most_common < 7;
	//fun=worst>0;
	fun = (tiles.length > 10);
}

LOGS(word);
LOGS(word.reduce(sum));
LOGS(tiles);

drawTiles(tiles);


//$.id("scorelayer").setAttribute("onClick", "answers.hideScore()");
Xq("body").addEventListener("click", hideHelpLayer);
//$.id("helpbutton").setAttribute("onClick", "toggleHelpLayer();");
Xid("helpbutton").addEventListener("click", toggleHelpLayer);
Xid("help-layer").addEventListener("click", stopProp);
Xid("leftclosebutton").addEventListener("click", toggleHelpLayer);
Xid("leftclosebutton").addEventListener("click", toggleHelpLayer);
Xid("sidemaskl").addEventListener("click", toggleHelpPageLeft);
Xid("sidemaskr").addEventListener("click", toggleHelpPageRight);
Xc("middle").classList.remove("hidelayer");
setTimeout(()=>Xid("helpbutton").classList.remove("hidelayer"), 200);
