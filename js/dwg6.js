const minAnswer = 7;
const maxAnswer = 12;
const maxGuess = 15;

const load_time = new Date(Date.now());

const daily_seed = getDailySeed(load_time);
seedPrng(daily_seed);

const solution = getPuzzleWord();
LOGS(solution);

const guesses = [];

const cookie_name = "dwg6data";
const cookie_data = {
	"seed": daily_seed,
	"solution": solution,
	"guesses": guesses
};

function getDailySeed(load_time) {
	const load_day = load_time.getUTCDate().toString();
	const load_month = load_time.getUTCMonth().toString();
	const load_year = load_time.getUTCFullYear().toString();
	const query_string = window.location.search.substring(1);
	const query_number = parseInt(query_string);
		
	if (query_string === "random") 
		window.location.replace("?"+hash(Date.now().toString()));

	if (!isNaN(query_number)) return query_number;

	return hash(load_day + load_month + load_year);
}

function checkCookie() {
	const data = getJSONCookieData(cookie_name);

	if (data && data["seed"] === daily_seed) {
		solution = data["solution"];
		guesses = data["guesses"];
		for (g of guesses) logScore(...g);
	}
}

function getPuzzleWord() {
	let word = "";

	while (word.length < minAnswer || word.length > maxAnswer) word = popt(common);

	return word;
}

function getSubStrings(w) {
	return range(w.length).map( (l) => range(w.length - (l+1) + 1).map( (i) => w.slice(i, i + (l+1)) ) ).flat();
}

function longestSharedSubstring(word1, word2) {
	let subs1 = new Set(getSubStrings(word1));
	let subs2 = new Set(getSubStrings(word2));

	let l = 0;
	for (const s of subs1.intersection(subs2)) {
		if (s.length > l) l = s.length;
	}

	return l;
}

function longestRun(guess, answer) {
	let longRun = 0;
	let thisRun = 0;
	let thisRunMatched = false;
	let equalAndOpposite = false;

	for (l of guess) {
		let matched = false;

		for (l1 of answer) {
			if (l === l1) {
				matched = true;
				break;
			}
		}

		if (matched === thisRunMatched) {
			thisRun += (matched ? 1 : -1);
		} else {
			thisRunMatched = matched;
			thisRun = (matched ? 1 : -1);
		}

		if (thisRun == -longRun) {
			equalAndOpposite = true;
		}

		if (M.abs(thisRun) > M.abs(longRun)) {
			longRun = thisRun;
			equalAndOpposite = false;
		}
	}

	return {run: longRun, equal: equalAndOpposite};
}

function scoreGuess(guess, answer) {
	let matchFactor = 0.0;

	let missedAnswer = answer;
	for (let l of guess) {
		let i = missedAnswer.indexOf(l);
		if (i >= 0) missedAnswer = missedAnswer.substring(0,i) + missedAnswer.substring(i+1);
	}

	let missedGuess = guess;
	for (let l of answer) {
		let i = missedGuess.indexOf(l);
		if (i >= 0) missedGuess = missedGuess.substring(0,i) + missedGuess.substring(i+1);
	}

	let matches = guess.length - missedGuess.length;
	let score = matches * matchFactor;

	let maxLength = M.max(guess.length, answer.length);

	for (let x = 0; x < answer.length; x += 1) {
		for (let r = 0; r < maxLength; r += 1) {
			if ((x+r < guess.length) && guess[x + r] === answer[x]) {
				score += 1.0/(2 ** r); break;
			}
			if ((x-r >= 0) && guess[x - r] === answer[x]) {
				score += 1.0/(2 ** r); break;
			}
		}
		for (let r = 0; r < maxLength; r += 1) {
			if ((x+r < guess.length) && guess[guess.length-1-x-r] === answer[answer.length-1-x]) {
				score += 1.0/(2 ** r); break;
			}
			if ((x-r >= 0) && guess[guess.length-1-x+r] === answer[answer.length-1-x]) {
				score += 1.0/(2 ** r); break;
			}
		}
	}

	let maxScore = answer.length * (matchFactor + 2);

	score = 100.0 * score / maxScore;
	
	if (score > 0 && score < 1) score = 1;
	if (score > 99 && score < 100) score = 99;

	append(guesses, [guess, score]);

	setJSONCookie(cookie_name, cookie_data);

	return score;
}

function logScore(guess, score, run, equal) {
	let scoreString = M.round(score).toString() + "%";

	let runSymbol = "=";
	if (!equal) runSymbol = M.sign(run) > 0 ? "+" : "-";
	if (guess.length == run) runSymbol = "*"

	let runLength = M.abs(run);
	if (guess.length == run) runLength = longestSharedSubstring(guess, solution);
	if (guess.length + run == 0) runLength = 0;

	let runString = runSymbol.repeat(runLength);
	if (runLength > 5) runString = runSymbol + runLength.toString();

	Xnew(["span", guess], "#game-answers");
	Xnew(["span", {"class":"score"}, scoreString], "#game-answers");
	Xnew(["span", {"class":"run"}, runString], "#game-answers");
	Xid("game-answers").scrollTo(0, Xid("game-answers").scrollHeight);
}

function keyboardCallback(letter) {
	if (Xid("game-guess").innerHTML.length > maxGuess) return;

	Xid("game-guess").innerHTML += letter.toUpperCase();
}

function keyboardDelCallback() {
	let guess = Xid("game-guess").innerHTML;

	if (guess.length <= 0) return;
	
	Xid("game-guess").innerHTML = guess.substring(0, guess.length - 1);
}

function keyboardEnterCallback() {
	let guess = Xid("game-guess").innerHTML.toUpperCase();

	if (guess.length < 3) return;

	let found = binarySearch(common, guess) >= 0;
	found = found || ((typeof rare !== "undefined") && (binarySearch(rare, guess) >= 0));
	found = found || ((typeof epic !== "undefined") && (binarySearch(epic, guess) >= 0));

	if (!found) return;

	let score = scoreGuess(guess, solution);
	let {run, equal} = longestRun(guess, solution);

	logScore(guess, score, run, equal);

	if (score == 0) {
		for (l of guess) {
			let id = "key-" + l.toLowerCase();
			Xid(id).classList.add("absent");
		}
	}

	if (run === guess.length) {
		for (l of guess) {
			let id = "key-" + l.toLowerCase();
			Xid(id).classList.add("fixed");
		}
	}

	if (score === 100) {
		Xid("win-layer").classList.remove("hide");
		Xid("game-panel").classList.add("win");
		Xid("keyboard").classList.add("hide");
		Xid("game-guess").classList.add("hide");
	}

	if (score < 100) Xid("game-guess").innerHTML = "";
}

function drawGameBoard(parent) {
	let guess = ["div", {"id":"game-guess"}];
	let answers = ["div", {"id":"game-answers"}];
	let board = ["div", {"id":"game-board"}, guess, answers];

	Xnew(board, parent);
}

drawGameBoard(Xid("game-panel"));
drawKeyboard(Xid("game-panel"));

checkCookie();
