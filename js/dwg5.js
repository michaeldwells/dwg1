const maxGuess = 15;
const maxAnswer = 6;

const load_time = new Date(Date.now());

const daily_seed = getDailySeed(load_time);
seedPrng(daily_seed);

const cookie_name = "dwg5data";
checkCookie();

const solution = getPuzzleWord();
LOGS(solution);

const guesses = [];

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

function checkCookie(cookieName) {
	const data = getJSONCookieData(cookieName);

	if (data && data["seed"] === prng_seed) {
		solution = data["solution"];
		guesses = data["guesses"];
		for (g of guesses) logScore(...g);
	}
}

function getPuzzleWord() {
	const query_string = window.location.search.substring(1);
	let word = "";

	while (word.length < 3 || word.length > maxAnswer) word = popt(scowl40);

	return word;
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

function logScore(guess, score) {
	Xnew(["div",{"class":"game-score-line"},["span",guess],["span",{"class":"score"},M.round(score).toString()+"%"]], "#game-answers");
	Xid("game-answers").scrollTo(0, Xid("game-answers").scrollHeight);

	if (score == 0) {
		for (l of guess) {
			let id = "key-" + l.toLowerCase();
			Xid(id).classList.add("absent");
		}
	}
	
	if (score === 100) {
		Xid("win-layer").classList.remove("hide");
		Xid("game-panel").classList.add("win");
		Xid("keyboard").classList.add("hide");
		Xid("game-guess").classList.add("hide");
	}
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

	let i_c = binarySearch(scowl40, guess);
	let i_r = ((typeof scowl80 !== "undefined") && (binarySearch(scowl80, guess) >= 0));

	if (i_c < 0 && !i_r) return;

	let score = scoreGuess(guess, solution);

	logScore(guess, score);

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
