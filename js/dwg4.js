//seedPrng("Hello!");
const cookieName = "dwg4data";

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

function checkCookie() {
	const cookieString = document.cookie;

	if (cookieString.length == 0) return;

	const cookieValue = cookieString
		.split("; ")
		.find((row) => row.startsWith(cookieName + "="))
		?.split("=")[1];

	if (cookieValue.length == 0) return;

	const data = JSON.parse(cookieValue);

	if (data["seed"] == prng_seed) {
		tiles = data["tiles"];
		spaces = data["spaces"];
		tilePlacement = data["tilePlacement"];
		updateTiles();
	}
}

const reverse = x => Array.from(x).map((x,i,a)=>a.at(-1-i)).reduce(sum,"");

const tile_count = 9;

let c6 = common.filter(x=>x.length == 6);
let tris_flat = c6.map(x=>([0,1,2,3].map(n=>x.slice(n,n+3)))).flat();
let tris_set = new Set(tris_flat);

// Sort the tris by frequency
let trif = {};
tris_set.forEach(x=>trif[x]=0);
tris_flat.forEach(x=>trif[x]+=1);
trif = Object.entries(trif).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
let trib = trif.map(reverse);
let tris = trif.map((x,i)=>[x,trib[i]]).flat();
tris = trif;

let tris_epic = M.floor(tris.length / 6);
let tris_rare = M.floor(tris.length / 3);
let tris_uncommon = (-1) * M.floor(tris.length / 3);
let tris_common = (-1) * M.floor(tris.length / 6);

let base;
let base_axis;
let base_index;
let off_axis;

let first_cross_index;
let first_cross;
let second_cross_index;
let second_cross;
let third_cross_index;
let third_options;

let big_panic = 20;
do {
	big_panic -= 1;
	
	let off_axes = [0,1,2]
	base = popt(tris.slice(tris_epic));
	base_axis = popt(['r','c']);
	base_index = ppick(off_axes);
	off_axis = (base_axis == 'r') ? 'c' : 'r';

	let indices = [0,1,2];
	first_cross_index = ppick(indices);
	second_cross_index = ppick(indices);
	third_cross_index = indices[0];
	
	let first_options = tris.slice(tris_common).filter(x=>x[base_index] == base[first_cross_index]);
	if (first_options.length == 0)
		first_options = tris.slice(tris_uncommon).filter(x=>x[base_index] == base[first_cross_index]);
	if (first_options.length == 0)
		first_options = tris.filter(x=>x[base_index] == base[first_cross_index]);
	if (first_options.length == 0) continue;
	first_cross = ppick(first_options);
	
	LOG('---');
	LOG(base_axis + base_index + ' ' + base);
	LOG(first_cross);
	LOG(first_cross_index + ' ' + second_cross_index + ' ' + third_cross_index);
	
	let off_set_1;
	let off_set_2;
	
	let panic = 100;
	do {
		panic -= 1;
		
		let second_options = tris.slice(tris_uncommon).filter(x=>x[base_index] == base[second_cross_index]);
		if (second_options.length == 0)
			second_options = tris.filter(x=>x[base_index] == base[second_cross_index]);
		if (second_options.length == 0) {
			panic = -1;
			break;
		}
		second_cross = popt(second_options);
		LOG(second_cross);
		
		off_set_1 = tris.filter(x=>x[first_cross_index] == first_cross[off_axes[0]]);
		off_set_1 = off_set_1.filter(x=>x[second_cross_index] == second_cross[off_axes[0]]);
		
		off_set_2 = tris.filter(x=>x[first_cross_index] == first_cross[off_axes[1]]);
		off_set_2 = off_set_2.filter(x=>x[second_cross_index] == second_cross[off_axes[1]]);
		
	} while (panic > 0 && (off_set_1.length == 0 || off_set_2.length == 0));
	
	if (panic < 0) continue;
	
	LOG(off_set_1);
	LOG(off_set_2);
	
	let third_set_1 = off_set_1.map(x=>x[third_cross_index]);
	let third_set_2 = off_set_2.map(x=>x[third_cross_index]);
	
	third_options = tris.filter(x=>x[base_index] == base[third_cross_index]);
	third_options = third_options.filter(x=>third_set_1.includes(x[off_axes[0]]));
	third_options = third_options.filter(x=>third_set_2.includes(x[off_axes[1]]));
} while (big_panic > 0 && third_options.length == 0);

let third_cross = ppick(third_options);

let rows = [];
rows[first_cross_index] = first_cross;
rows[second_cross_index] = second_cross;
rows[third_cross_index] = third_cross;
if (base_axis == 'r') rows = transpose(rows);

rows = rows.map(x=>Array.from(x).reduce(sum));
let cols = transpose(rows).map(x=>Array.from(x).reduce(sum));

LOG(rows);
LOG(cols);


let all = [...rows, ...cols];
let all_words = all.map(t=>c6.filter(x=>x.includes(t)));
let all_tris = all_words.map((y,i)=>y.map(x=>x.slice(0,x.indexOf(all[i]))+x.slice(x.indexOf(all[i])+3)));
LOG(all_words);
let tiles = all_words.map(x=>popt(x));

LOG(tiles);

while (tiles.length < tile_count) {
	let new_word = popt(c6);
	while (new_word in tiles) new_word = popt(c6);
	tiles.push(new_word);
}

pshuffle(tiles);
LOG(tiles);

tiles.forEach((x,i)=>Xnew(["div",{"id":"tile"+i,"class":"tile","onClick":"clickTile("+i+");"}, ...Array.from(x).map(y=>["div",{"class":"letter"},y])],"#tiles"));

let tilePlacement = tiles.map(x=>[-1,-1]); // [space_index, position]
let spaces = range(12).map(x=>[-1,-1]); // [tile_index, position]
const spacePairs = [6,7,8,9,10,11,0,1,2,3,4,5];
const backSpaces = [false,false,false,false,false,false,true,true,true,true,true,true];
let activeTile = -1;
let space_square_ids = [
	["inner-top-left","inner-top-center","inner-top-right"],
	["inner-mid-left","inner-mid-center","inner-mid-right"],
	["inner-bot-left","inner-bot-center","inner-bot-right"],
	["inner-top-left","inner-mid-left","inner-bot-left"],
	["inner-top-center","inner-mid-center","inner-bot-center"],
	["inner-top-right","inner-mid-right","inner-bot-right"],
	["inner-top-left","inner-top-center","inner-top-right"],
	["inner-mid-left","inner-mid-center","inner-mid-right"],
	["inner-bot-left","inner-bot-center","inner-bot-right"],
	["inner-top-left","inner-mid-left","inner-bot-left"],
	["inner-top-center","inner-mid-center","inner-bot-center"],
	["inner-top-right","inner-mid-right","inner-bot-right"]
];
let crosses = [ [3,4,5], [3,4,5], [3,4,5], [0,1,2], [0,1,2], [0,1,2], [3,4,5], [3,4,5], [3,4,5], [0,1,2], [0,1,2], [0,1,2] ];

function updatePairs() {
	for (i of [0,1,2,3,4,5]) {
		spaces[spacePairs[i]][0] = -1 //spaces[i][0]
		spaces[spacePairs[i]][1] = 3 - spaces[i][1]
	}
}

function push(verticle, backwards) {
	let push_axis = [3,4,5];
	let slide_axis = [0,1,2];
	if (verticle) push_axis = [0,1,2];
	if (verticle) slide_axis = [3,4,5];
	if (!backwards) push_axis.reverse();
	let d = 1;
	if (backwards) d = -1;
	let slide_limit = 0;
	if (!backwards) slide_limit = 3;

	let old_spaces = range(12).map(x=>[spaces[x][0],spaces[x][1]]);
	for (const i of push_axis) {
		let s = old_spaces[i];
		if (s[0] > -1) {
			if (i == push_axis[0]) {
				spaces[i][0] = -1;
				spaces[i][1] = -1;
				tilePlacement[s[0]][0] = -1;
				tilePlacement[s[0]][1] = -1;
			} else {
				spaces[i][0] = -1;
				spaces[i][1] = -1;
				spaces[i+d][0] = s[0];
				spaces[i+d][1] = s[1];
				tilePlacement[s[0]][0] = i+d;
			}
		}
	}
	for (const i of slide_axis) {
		let s = old_spaces[i];
		if (s[0] > -1) {
			if (s[1] == slide_limit) {
				spaces[i][0] = -1;
				spaces[i][1] = -1;
				tilePlacement[s[0]][0] = -1;
				tilePlacement[s[0]][1] = -1;
			} else {
				spaces[i][1] += d;
				tilePlacement[s[0]][1] += d;
			}
		}
	}
	updatePairs();
	updateTiles();
}

function pushUp() {push(true, true)}
function pushDown() {push(true, false)}
function pushLeft() {push(false, true)}
function pushRight() {push(false, false)}

///////////////////////////////////////////////////////////////////////////////
/* UI Functions                                                              */
///////////////////////////////////////////////////////////////////////////////

function clickTile(i) {
	if (tilePlacement[i][0] < 0) {
		if (activeTile == i) {
			activeTile = -1;
		} else {
			activeTile = i;
		}
		updateTiles();
	}
}

function clickSpace(n) {
	//if (activeTile < 0) {
		if (spaces[n][0] >= 0) {
			spaces[n][1] += 1;
			tilePlacement[spaces[n][0]][1] += 1;
			if (spaces[n][1] > 3) {
				tilePlacement[spaces[n][0]] = [-1,-1];
				spaces[n] = [-1,-1];
			}
		}
		if (spaces[spacePairs[n]][0] >= 0) {
			spaces[spacePairs[n]][1] -= 1;
			tilePlacement[spaces[spacePairs[n]][0]][1] -= 1;
			if (spaces[spacePairs[n]][1] < 0 ) {
				tilePlacement[spaces[spacePairs[n]][0]] = [-1,-1];
				spaces[spacePairs[n]] = [-1,-1];
			}
		}
	//} else {
	if (activeTile >= 0) {
		if (backSpaces[n]) {
			if (spaces[n][0] < 0 && spaces[spacePairs[n]][0] < 0) {
				tilePlacement[activeTile] = [spacePairs[n],3];
				spaces[spacePairs[n]] = [activeTile, 3];
				activeTile = -1;
			}
		} else {
			if (spaces[n][0] < 0 && spaces[spacePairs[n]][0] < 0) {
				tilePlacement[activeTile] = [n,0];
				spaces[n] = [activeTile, 0];
				activeTile = -1;
			}
		}
	}
	updateTiles();
}

function drawTiles(tiles) {
	let e = Xid("tiles");
	e.innerHTML = "";
	tiles.forEach((t,i) => Xnew(
		["div",
			{"class":"tile","onClick":"clickTile("+i+");"},
			...t.map(x => ["span",{"class":"subtile"},x])
		], e));
}

function updateCookie() {
	let data = {
		"seed": prng_seed,
		"tiles": tiles,
		"spaces": spaces,
		"tilePlacement": tilePlacement
	};
	document.cookie = cookieName + "=" + JSON.stringify(data) + "; max-age=" + String(60*60*24) + "; SameSite=Lax;";
}

function updateTiles() {
	if (activeTile >= 0) {
		Xid("puzzle")?.classList.add("tile-selected");
	} else {
		Xid("puzzle")?.classList.remove("tile-selected");
	}
	let e = document.getElementById("tiles");
	for (const i of tiles.keys()) {
		let tile = Xid("tile"+i);
		if (activeTile == i) {
			tile.classList.add("selected");
		} else {
			tile.classList.remove("selected");
		}
		if (tilePlacement[i][0] >= 0) {
			tile.classList.add("fade");
		} else {
			tile.classList.remove("fade");
		}
	}
	for (const i of spaces.keys()) {
		let tile = spaces[i][0];
		let pair = spaces[spacePairs[i]][0];
		let pos = spaces[i][1];
		let spaceDiv = Xq("#space"+i);
		let tileDiv = Xq("#space"+i+" > div.tile");
		if (tile < 0) {
			tileDiv.innerHTML = "";
			tileDiv.classList.add("hide");
			if (pair >= 0) {
				spaceDiv?.classList.remove("open");
				let pair_pos = spaces[spacePairs[i]][1];
				let subTile = Array.from(tiles[pair]).slice(6-pair_pos);
				subTile.forEach(x=>Xnew(["div",{"class":"letter"},x], tileDiv));
				tileDiv.classList.remove("hide");
			} else {
				spaceDiv.classList.add("open");
			}

			if (!backSpaces[i]) {
				for (const j of [0,1,2]) {
					if (spaces[crosses[i][j]][0] < 0) {
						Xid(space_square_ids[i][j]).innerHTML = "";
					}
				}
			}
		} else {
			tileDiv.innerHTML = "";
			spaceDiv?.classList.remove("open");
			let subTile = Array.from(tiles[tile]).slice(0,3-pos);
			subTile.forEach(x=>Xnew(["div",{"class":"letter"},x], tileDiv));
			tileDiv.classList.remove("hide");

			if (!backSpaces[i]) {
				for (const j of [0,1,2]) {
					let letter = tiles[tile][3+j-pos];
					let cross_tile_id = spaces[crosses[i][j]][0];
					let square_element_id = space_square_ids[i][j];
					let square_element = Xid(square_element_id);

					if (cross_tile_id < 0) {
						square_element.innerHTML = letter;
						square_element.classList.remove("right");
						square_element.classList.remove("wrong");
					} else {
						let cross_pos = tilePlacement[cross_tile_id][1];
						let cross_letter = tiles[cross_tile_id][3 + (i % 3) - cross_pos];

						if (cross_letter == letter) {
							square_element.innerHTML = letter;
							square_element.classList.remove("wrong");
							square_element.classList.add("right");
						} else {
							square_element.innerHTML = "×";
							square_element.classList.remove("right");
							square_element.classList.add("wrong");
						}
					}
				}
			}
		}
	}
	updateCookie();
	if (checkSuccess()) {
		Xid("share").setAttribute("href", "?"+prng_seed);
		Xid("retry").setAttribute("href", "?"+rnd(4294967296));
		Xid("puzzle").classList.add("success");
		Xid("tiles").classList.add("success");
		Xid("score-layer").classList.remove("hide");
		Array.from(Xcs("tile")).forEach(x=>x.setAttribute("onclick", ""));
		Array.from(Xcs("space")).forEach(x=>x.setAttribute("onclick", ""));
	}
}

function checkSuccess() {
	return [0,1,2,3,4,5].every(i=>{
		let t = spaces[i][0];
		let p = spaces[i][1];
		if (t < 0) return false;
		for (const j of [0,1,2]) {
			let letter = tiles[t][3+j-p];
			let cross_tile_id = spaces[crosses[i][j]][0];
			if (cross_tile_id < 0) return false;
			let cross_pos = tilePlacement[cross_tile_id][1];
			let cross_letter = tiles[cross_tile_id][3 + (i % 3) - cross_pos];
			if (letter != cross_letter) return false;
		}
		return true;
	})
}

function stopProp(e) {
	if (typeof e !== "undefined") e?.stopPropagation();
}
function hideHelpLayer(e) {
	if (typeof e !== "undefined") e?.stopPropagation();
	Xid('help-layer').classList.add('hide-layer');
	Xid('help-button').classList.remove('hide-layer');
}
function toggleHelpLayer(e) {
	if (typeof e !== "undefined") e?.stopPropagation();
	Xid('help-layer').classList.toggle('hide-layer');
	Xid('help-button').classList.toggle('hide-layer');
}

function toggleHelpPageLeft() {
	let pages = Array.from($.class('left-page'));
	let activePage = 0;
	let maxPage = pages.length;
	for (p of pages.keys()) {
		if (pages[p].classList.contains('show-page-'+(p+1).toString())) {
			activePage = M.max(p,1);
		}
	}
	for (page of pages) {
		for (p of pages.keys()) {
			page.classList.remove('show-page-'+(p+1).toString());
		}
		page.classList.add('show-page-'+(activePage).toString());
	}
	if (activePage <= 1) Xid('side-mask-l').classList.remove('active');
	if (activePage < maxPage) Xid('side-mask-r').classList.add('active');
}
function toggleHelpPageRight() {
	let pages = Array.from($.class('left-page'));
	let activePage = 0;
	let maxPage = pages.length;
	for (p of pages.keys()) {
		if (pages[p].classList.contains('show-page-'+(p+1).toString())) {
			activePage = M.min(p+2,maxPage);
		}
	}
	for (page of pages) {
		for (p of pages.keys()) {
			page.classList.remove('show-page-'+(p+1).toString());
		}
		page.classList.add('show-page-'+(activePage).toString());
	}
	if (activePage > 1) Xid('side-mask-l').classList.add('active');
	if (activePage >= maxPage) Xid('side-mask-r').classList.remove('active');
}

//drawTiles(tiles);
checkCookie();

Xid("inner-bot-center").addEventListener("click", pushUp);
Xid("inner-top-center").addEventListener("click", pushDown);
Xid("inner-mid-right").addEventListener("click", pushLeft);
Xid("inner-mid-left").addEventListener("click", pushRight);

X.body.addEventListener("click", hideHelpLayer);
Xid("help-button").addEventListener("click", toggleHelpLayer);
Xid("help-layer").addEventListener("click", stopProp);
Xid("help-close-button").addEventListener("click", toggleHelpLayer);
Xid("help-close-button").addEventListener("click", toggleHelpLayer);
Xid("side-mask-l").addEventListener("click", toggleHelpPageLeft);
Xid("side-mask-r").addEventListener("click", toggleHelpPageRight);
Xid("game-panel").classList.remove("hide-layer");
setTimeout(()=>Xid("help-button").classList.remove("hide-layer"), 200);
