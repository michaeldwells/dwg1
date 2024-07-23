const minAnswer = 7;
const maxAnswer = 12;
const maxGuess = 15;

const query_string = window.location.search.substring(1);
const load_time = new Date(Date.now());
seedPrng(hash(load_time.getUTCDate().toString() + load_time.getUTCMonth().toString() + load_time.getUTCFullYear().toString()));

var solution = getPuzzleWord();
LOGS(solution);
//Xid("win-answer").innerHTML = solution;

function getPuzzleWord() {
	let word = "";

	if (query_string === "random") {
		while (word.length < minAnswer || word.length > maxAnswer) word = opt(common);
	} else {
		while (word.length < minAnswer || word.length > maxAnswer) word = popt(common);
	}

	return word;
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

	return score;
}

function logScore(guess, score, run, equal) {
	let scoreString = M.round(score).toString() + "%";
	let runSymbol = "=";
	if (!equal) runSymbol = M.sign(run) > 0 ? "+" : "-";
	let runString = runSymbol.repeat(M.abs(run));

	if (M.abs(run) > 5) runString = runSymbol + M.abs(run);
//	if (M.abs(run) == 1) runString = "=";
	if (guess.length + run == 0) runString = "";
	if (guess.length == run) runString = "*".repeat(M.min(5, run));

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

	let i_c = binarySearch(common, guess);
	let i_r = ((typeof rare !== "undefined") && (binarySearch(rare, guess) >= 0));
	let i_e = ((typeof epic !== "undefined") && (binarySearch(epic, guess) >= 0));

	if (i_c < 0 && !i_r && !i_e) return;

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
