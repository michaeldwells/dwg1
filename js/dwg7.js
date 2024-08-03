const maxGuess = 30;

const load_time = new Date(Date.now());

const daily_seed = getDailySeed(load_time);
seedPrng(daily_seed);

const tridata = createTriData();

const [word, tri1, tri2] = getPuzzleWord();
LOG(tri1, tri2, word);

function hashTri(t) {return  676 * (t.charCodeAt(0)-65) + 26 * (t.charCodeAt(1)-65) + (t.charCodeAt(2)-65)}

function createTriData() {
	const common = new Array(17576);
	const rare = new Array(17576);

	let s55i = 0;
	let s80i = 0;

	const ranges = range(100).map((_,i) => range(i));

	while (s80i < scowl80.length) {
		const w = scowl80[s80i];
		const commonWord = scowl55[s55i] == w;

		s80i += 1;
		if (commonWord) s55i += 1;

		if (w.length < 8) continue;

		for (const i in ranges[w.length - 2]) {
			const t = w.slice(i, i + 3);
			const th = 676 * (t.charCodeAt(0)-65) + 26 * (t.charCodeAt(1)-65) + (t.charCodeAt(2)-65);

			if (rare[th]) {rare[th].splice(rare[th].length, 0, w);} else {rare[th] = [w];}
			if (commonWord) {
				if (common[th]) {common[th].splice(common[th].length, 0, w);} else {common[th] = [w];}
			}
		}
	}

	const cDict = {};
	const rDict = {};

	const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
	for (const l1 of abc)
		for (const l2 of abc)
			for (const l3 of abc) {
				const t = l1+l2+l3;
				const th = 676 * (t.charCodeAt(0)-65) + 26 * (t.charCodeAt(1)-65) + (t.charCodeAt(2)-65);
				if (common[th]) cDict[t] = common[th];
				if (rare[th]) rDict[t] = rare[th];
			}

	return {"common":cDict, "rare":rDict};
}

function getDailySeed(load_time) {
	const load_day = load_time.getUTCDate().toString();
	const load_month = load_time.getUTCMonth().toString();
	const load_year = load_time.getUTCFullYear().toString();
	const query_string = window.location.search.substring(1);
	const query_number = parseInt(query_string);
		
	if (query_string === "random") {
		window.location.replace("?"+hash(Date.now().toString()));
		throw new Error("Page load abandoned. Forwarding.");
	}

	if (!isNaN(query_number)) return query_number;

	return hash(load_day + load_month + load_year);
}

function getPuzzleWord() {
	let t1;
	let t2 = "";
	let w;

	const rare_tris = Object.keys(tridata["common"]).filter(x => x.length < 40).filter(x => tridata["common"][x].filter(y => y.length > 8).length > 0);

	while (t2 == "") {
		t1 = popt(rare_tris);
		LOG(t1);

		const possible_words = tridata["common"][t1].filter(x => x.length > 8);
		if (possible_words.length == 0) continue;

		w = popt(possible_words);
		LOG(w);

		similars = [
			w, 
			w.slice(0,-1), 
			w.slice(0,-2), 
			w+"S", 
			w.slice(0,-1)+"IES", 
			w+"ED", 
			w+w[-1]+"ED", 
			w.slice(0,-1)+"ED", 
			w.slice(0,-2)+"ED", 
			w+"ING", 
			w+w[-1]+"ING", 
			w.slice(0,-1)+"ING", 
			w.slice(0,-2)+"ING"
		];

		others = w.split(t1).filter(x => len(x) > 2);
		LOG(others);
		other_tris = others.map(x => x.split("").map((y,i) => x.slice(i,i+3))).flat().filter(x => x.length == 3);
		LOG(other_tris);

		const matches = other_tris.map(x => [x, tridata["rare"][x]]);
		LOG(matches);
		const shared_matches = matches.map(x => [x[0], x[1].filter((y) => y.includes(t1)).filter(y => similars.reduce((acc,i) => acc && y!==i, true))]);
		LOG(shared_matches);

		solos = shared_matches.filter(x => x[1].length == 0).map(x => x[0]);
		LOG(solos);

		if (solos.length > 0) t2 = popt(solos);
	}

	if (popt([true, false])) [t1, t2] = [t2, t1];

	return [w, t1, t2];
}

function normalizedGuess() {
	return Xid("game-guess-text").value.replace(/[^a-z]/gi, '').toUpperCase();
}

function checkAnswer(guess, t1, t2) {
	return (
		guess.includes(t1) &&
		guess.includes(t2) &&
		binarySearch(scowl80, guess) >= 0
	);
}

function typeCallback(event) {
	const guess = normalizedGuess();

	Xid("game-guess-text").value = guess;

	if (guess.includes(tri1)) 
		Xid("clue-1").classList.add("found");
	else
		Xid("clue-1").classList.remove("found");

	if (guess.includes(tri2)) 
		Xid("clue-2").classList.add("found");
	else
		Xid("clue-2").classList.remove("found");
}

function submitCallback(event) {
	event.preventDefault();
	if (checkAnswer(normalizedGuess(), tri1, tri2)) win();
}

function win() {
	Xid("game-guess-text").disabled = true;
	X.body.classList.add("win");
	Xid("new-game-link").href = "?random";
}

function drawGameBoard(parent, t1, t2) {
	const clue = [
		"div", {"id":"game-clue"}, 
		["p", {"id":"clue-1","class":"clue-string"}, t1], 
		["p", {"id":"clue-2","class":"clue-string"}, t2]
	];
	const guess = [
		"form", 
		{"id":"game-guess", "action":"", "method":"post"}, 
		[
			"input", 
			{
				"id":"game-guess-text",
				"type":"text", 
				"name":"guess", 
				"size":"20", 
				"maxlength":maxGuess.toString(), 
				"autocomplete":"off",
				"autocapitalize":"characters", 
				"enterkeyhint":"enter"
			}
		],
		[
			"input",{"id":"game-guess-button","type":"submit","value":"›››"}
		]
	];
	const board = ["div", {"id":"game-board"}, clue, guess];

	Xnew(board, parent);
}

drawGameBoard(Xid("game-panel"), tri1, tri2);
Xnew(["a", {"id": "new-game-link"}, "try another puzzle"], "#game-panel");

Xid("game-guess").addEventListener("submit", submitCallback);
Xid("game-guess-text").addEventListener("input", typeCallback);
