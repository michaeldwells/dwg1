const ranges100 = range(100).map(x=>range(x));
const revA = x => Array.from(x).map((x,i,a)=>a.at(-1-i));
const reverse = x => Array.from(x).map((x,i,a)=>a.at(-1-i)).reduce(sum,"");

const tile_count = 12;

let c6 = common.filter(x=>x.length == 6);
let tris_flat = c6.map(x=>([0,1,2,3].map(n=>x.slice(n,n+3)))).flat();
let tris_set = new Set(tris_flat);
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
	base = opt(tris.slice(tris_epic));
	base_axis = opt(['r','c']);
	base_index = pick(off_axes);
	off_axis = (base_axis == 'r') ? 'c' : 'r';

	let indices = [0,1,2];
	first_cross_index = pick(indices);
	second_cross_index = pick(indices);
	third_cross_index = indices[0];
	
	let first_options = tris.slice(tris_common).filter(x=>x[base_index] == base[first_cross_index]);
	if (first_options.length == 0)
		first_options = tris.slice(tris_uncommon).filter(x=>x[base_index] == base[first_cross_index]);
	if (first_options.length == 0)
		first_options = tris.filter(x=>x[base_index] == base[first_cross_index]);
	if (first_options.length == 0) continue;
	first_cross = pick(first_options);
	
	LOG('---');
	LOG(base_axis + base_index + ' ' + base);
	LOG(first_cross);
	LOG(first_cross_index + ' ' + second_cross_index + ' ' + third_cross_index);
	
	//let off_axes = [0,1,2].filter(x=>x!=base_index);
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
		second_cross = opt(second_options);
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

let third_cross = pick(third_options);

let rows = [];
rows[first_cross_index] = first_cross;
rows[second_cross_index] = second_cross;
rows[third_cross_index] = third_cross;
if (base_axis == 'r') rows = transpose(rows);

rows = rows.map(x=>Array.from(x).reduce(sum));
let cols = transpose(rows).map(x=>Array.from(x).reduce(sum));

LOG(rows);
LOG(cols);


/*
let fore = [...rows, ...cols];
let back = fore.map(x=>reverse(x));
let all = [...fore, ...back];
//let forward_words = fore.map(t=>c6.filter(x=>x.includes(t)));
//let reverse_words = back.map(t=>c6.filter(x=>x.includes(t)));
//let all_words = ranges100[6].map((x,i)=>[...forward_words[i], ...reverse_words[i]]);
let all_words = all.map(t=>c6.filter(x=>x.includes(t)));
LOG(all_words);
LOG(ranges100[6].map(x=>[0,6].filter(y=>all_words[x+y].length > 0)));
let fb = ranges100[6].map(x=>opt([0,6].filter(y=>all_words[x+y].length > 0)));
let game_words = ranges100[6].map((x,i)=>opt(all_words.slice(fb[i],fb[i]+6)[i]));
let tiles = game_words.map((x,i)=>x.slice(0,x.indexOf(all[i+fb[i]]))+x.slice(x.indexOf(all[i+fb[i]])+3));
//LOG(reverse_words);
*/
let all = [...rows, ...cols];
let all_words = all.map(t=>c6.filter(x=>x.includes(t)));
let all_tris = all_words.map((y,i)=>y.map(x=>x.slice(0,x.indexOf(all[i]))+x.slice(x.indexOf(all[i])+3)));
let tiles;
let panic = 20;
do {panic -= 1;tiles = all_tris.map(x=>opt(x));} while (panic > 0 && new Set([...tiles,...tiles.map(reverse)]).size < tiles.length*2);
LOG(all_words);
//let game_words = all_words.map(x=>opt(x));
//let tiles = game_words.map((x,i)=>x.slice(0,x.indexOf(all[i]))+x.slice(x.indexOf(all[i])+3));
tiles = tiles.map(x=>opt([0,1])==0 ? x : reverse(x));

let mid_tris = [...rows, ...cols].map(x=>[x,reverse(x)]).flat();
let used_tris = new Set([...rows, ...cols, ...tiles].map(x=>[x,reverse(x)]).flat());

while (tiles.length < tile_count) {
	let next_word = opt(c6);
	let off_tris = [0,1,2,3].map(n=>[...next_word.slice(0,n), ...next_word.slice(n+3,6)].reduce(sum));
	shuffle(off_tris);
	let nex_tri;
	do {
		next_tri = off_tris.pop();
	} while (off_tris.length > 0 && used_tris.has(next_tri));
	if (used_tris.has(next_tri)) continue;
	if (mid_tris.every(x=>[0,1,2,3].every(n=>binarySearch(c6,[...next_tri.slice(0,n), ...x, ...next_tri.slice(n,4)].reduce(sum)) < 0) ) ) {
		tiles.push(next_tri);
		used_tris.add(next_tri);
	}
}

//LOG(game_words);
LOG(tiles);

Xid("inner-top-left").innerHTML   = rows[0][0];
Xid("inner-top-center").innerHTML = rows[0][1];
Xid("inner-top-right").innerHTML  = rows[0][2];
Xid("inner-mid-left").innerHTML   = rows[1][0];
Xid("inner-mid-center").innerHTML = rows[1][1];
Xid("inner-mid-right").innerHTML  = rows[1][2];
Xid("inner-bot-left").innerHTML   = rows[2][0];
Xid("inner-bot-center").innerHTML = rows[2][1];
Xid("inner-bot-right").innerHTML  = rows[2][2];

shuffle(tiles);
tiles.forEach((x,i)=>Xnew(["div",{"id":"tile"+i,"class":"tile","onClick":"clickTile("+i+");"}, ...Array.from(x).map(y=>["div",{"class":"letter"},y])],"#tiles"));

let tilePlacement = tiles.map(x=>[-1,-1]);
let spaces = ranges100[12].map(x=>[-1,-1]);
const spacePairs = [8,7,6,11,10,9,2,1,0,5,4,3];
const backSpaces = [false,false,false,true,true,true,true,true,true,false,false,false];
const mids = [...cols, ...rows, ...revA(cols), ...revA(rows)];
let activeTile = -1;

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
	if (activeTile < 0) {
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
	} else {
		if (spaces[n][0] < 0 && spaces[spacePairs[n]][0] < 0) {
			tilePlacement[activeTile] = [n,0];
			spaces[n] = [activeTile, 0];
			activeTile = -1;
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
		let pos = M.max(spaces[i][1], spaces[spacePairs[i]][1]);
		let spaceDiv = Xq("#space"+i);
		let tileDiv = Xq("#space"+i+" > div.tile");
		if (tile < 0) {
			tileDiv.innerHTML = "";
			tileDiv.classList.add("hide");
			if (pair >= 0) {
				spaceDiv?.classList.remove("open");
				let subTile = Array.from(tiles[pair]).slice(3-pos);
				if (backSpaces[spacePairs[i]]) subTile = subTile.reverse();
				subTile.forEach(x=>Xnew(["div",{"class":"letter"},x], tileDiv));
				tileDiv.classList.remove("hide");
			} else {
				spaceDiv.classList.add("open");
			}
		} else {
			tileDiv.innerHTML = "";
			spaceDiv?.classList.remove("open");
			let subTile = Array.from(tiles[tile]).slice(0,3-pos);
			if (backSpaces[i]) subTile = subTile.reverse();
			subTile.forEach(x=>Xnew(["div",{"class":"letter"},x], tileDiv));
			tileDiv.classList.remove("hide");
			
			let subTile2 = Array.from(tiles[tile]).slice(3-pos);
			let word;
			if (backSpaces[i]) {
				word = subTile2.reverse().reduce(sum,"") + mids[i] + subTile.reduce(sum,"");
			} else {
				word = subTile.reduce(sum,"") + mids[i] + subTile2.reduce(sum,"");
			}
			if (binarySearch(c6,word) >= 0) {
				tileDiv.classList.add("correct");
				Xq("#space"+spacePairs[i]+" > div.tile").classList.add("correct");
			} else {
				tileDiv.classList.remove("correct");
				Xq("#space"+spacePairs[i]+" > div.tile").classList.remove("correct");
			}
		}
	}
	if (checkSuccess()) {
		Xid("puzzle").classList.add("success");
		Xid("tiles").classList.add("success");
		Xid("score-layer").classList.remove("hide");
		Array.from(Xcs("tile")).forEach(x=>x.setAttribute("onclick", ""));
		Array.from(Xcs("space")).forEach(x=>x.setAttribute("onclick", ""));
	}
}

function checkSuccess() {
	return [0,1,2,3,4,5].every(i=>{
		let j = spacePairs[i];
		let p = M.max(spaces[i][1], spaces[j][1]);
		if (p < 0) return false;
		let w1, w2, w;
		if (spaces[i][0] >= 0) {
			if (backSpaces[i]) {
				w2 = reverse(tiles[spaces[i][0]].slice(0,3-p));
				w1 = reverse(tiles[spaces[i][0]].slice(3-p));
			} else {
				w2 = tiles[spaces[i][0]].slice(3-p);
				w1 = tiles[spaces[i][0]].slice(0,3-p);
			}
			let w = w1 + mids[i] + w2;
			if (binarySearch(c6,w) >= 0) return true;
			return false;
		}
		if (spaces[j][0] >= 0) {
			if (backSpaces[j]) {
				w2 = reverse(tiles[spaces[j][0]].slice(0,3-p));
				w1 = reverse(tiles[spaces[j][0]].slice(3-p));
			} else {
				w2 = tiles[spaces[j][0]].slice(3-p);
				w1 = tiles[spaces[j][0]].slice(0,3-p);
			}
			let w = w1 + mids[j] + w2;
			if (binarySearch(c6,w) >= 0) return true;
			return false;
		}
		return false;
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


X.body.addEventListener("click", hideHelpLayer);
Xid("help-button").addEventListener("click", toggleHelpLayer);
Xid("help-layer").addEventListener("click", stopProp);
Xid("help-close-button").addEventListener("click", toggleHelpLayer);
Xid("help-close-button").addEventListener("click", toggleHelpLayer);
Xid("side-mask-l").addEventListener("click", toggleHelpPageLeft);
Xid("side-mask-r").addEventListener("click", toggleHelpPageRight);
Xid("game-panel").classList.remove("hide-layer");
setTimeout(()=>Xid("help-button").classList.remove("hide-layer"), 200);
