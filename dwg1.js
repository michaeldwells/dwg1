const letterRanks = {
'A':6, 'B':17,'C':11,'D':10,'E':1,
'F':18,'G':12,'H':16,'I':2, 'J':26,
'K':22,'L':9, 'M':15,'N':4, 'O':8,
'P':14,'Q':25,'R':5, 'S':3, 'T':7,
'U':13,'V':20,'W':21,'X':24,'Y':19,'Z':23,'Qu':25};

const wordlist = new Array();
const SCORING_WORDS = 3;
const SCORE_CUT = 3;
var minAnswer = 2;
const maxAnswer = 8;
const TRIPLES_RANGE = 200;
const TRIPLES_BIAS = 2;

class Cell {
	constructor(l,e) {
		this.letter = l;
		this.element = e;
		this.used = false;
		this.reuseable = false;
		this.update();
	}
	activate() {
		this.used = false;
		this.update();
	}
	update() {
		this.element.classList.toggle("used", this.used);
	}
	onClick() {
		if (!this.used) {
			guess.append(this, this.letter);
			this.used = true;
			this.update();
		}
	}
}

class Grid {
	constructor() {
		this.center = 12;
		this.grid = new Array(25);
		for (let i of this.grid.keys()) {
			$.new( ["button", {"id":"cell"+i.toString(), "onClick":"grid.onClick("+i.toString()+");"}," "] , "#grid");
		}
		$.id("guess").value = "".padEnd(minAnswer, "_");

		let word1 = this.randomWord(8);
		let word2 = this.randomWord(7, true);
		let word3 = this.randomWord(9 + [...word1, ...word2].filter(x=>x=="Q").length);
		while ([...word3].filter(x=>x=="Q").length > 0)
			word3 = this.randomWord(9 + [...word1, ...word2].filter(x=>x=="Q").length);
		LOG(word1);
		LOG(word2);
		LOG(word3);
		
		this.letters = [...word1, ...word2, ...word3];
		for (let i of this.letters.keys())
			if (this.letters[i]=="Q" && this.letters[i+1]=="U") this.letters.splice(i, 2, "Qu");
		this.letters = [...this.letters, ...this.randomWord(24 - this.letters.length)];
		this.letters.sort((a,b) => letterRanks[a]-letterRanks[b]);

		let easy = [2,10,14,22,6,8,16,18,7,11,13,17];
		let mid = [1,3,5,9,15,19,21,23];
		let hard = [0,4,20,24];
		for (let points of [[easy,12],[mid,4],[hard,0]]) {
			for (let cell of points[0]) {
				let range = this.letters.length - points[1];
				let letter = this.letters.splice(rnd(range),1)[0];
				this.grid[cell] = new Cell(letter, $.id("cell"+cell.toString()));
			}
		}

		this.grid[this.center] = new Cell(tris[rndw(TRIPLES_RANGE, TRIPLES_BIAS)], $.id("cell"+this.center.toString()));
		this.grid[this.center].reuseable = true;
		
		for (let i of this.grid.keys()) {
			$.id("cell"+i.toString()).innerHTML = this.grid[i].letter;
		}
	}
	onClick(cellId) {
		this.grid[cellId].onClick();
	}
	randomWord(l, x=false) {
		if (l == 0) return "";
		if (x) {
			return zxqj[l][rnd(zxqj[l].length)];
		}
		if (l > 5 && l < 10) {
			return uniquesByLength[l][rnd(uniquesByLength[l].length)];
		} else {
			return commonLengths[l][rnd(commonLengths[l].length)];
		}
	}
	isClear() {
		let cells = this.grid.slice(0,this.center).concat(this.grid.slice(this.center+1));
		if (cells.map((x)=>x.used).reduce((x,v)=>x && v)) {
			cells.forEach((x)=>x.activate());
			return true;
		} else {
			return false;
		}
	}
	isDone() {
		let tiles = this.grid.filter(x => !x.used).map(x => x.letter);
		if (tiles.reduce((a,v) => a+v, "").length < minAnswer) return true;
		
		if (typeof dictionaryEpic === "undefined") return false;
		
		if (tiles.length < 8) {
			let used = answers.rounds.flat();
			tiles.sort((a,b) => {
				if (a === b) return 0;
				if (a.length < b.length) return -1;
				if (a.length > b.length) return 1;
				let i = 0;
				while (a[i] === b[i]) i++;
				return (letterRanks[a[i]] - letterRanks[b[i]]);
			});
			let tsets = subsets(tiles);
			tsets.sort((a,b) => a.length - b.length);
			for (let tset of tsets) {
				if (tset.reduce((a,v) => a+v, "").length >= minAnswer) {
					for (let w of permutations(tset)) {
						let word = w.reduce((a,v) => a+v, "");
						if (!used.includes(word)) {
							if (dictionary.has(word)) return false;
							if (dictionaryEpic?.has(word)) return false;
						}
					}
				}
			}
			return true;
		}
		return false;
	}
}

class Guess {
	constructor(e) {
		this.word = "";
		this.parts = [];
		this.cells = [];
		this.element = e;
	}
	append(cell, part) {
		this.cells[this.parts.length] = cell;
		this.parts[this.parts.length] = part;
		this.updateDisplay();
	}
	remove() {
		if (this.parts.pop()) {
			this.updateDisplay();
			let cell = this.cells.pop();
			cell.used = false;
			cell.update();
		}
	}
	updateDisplay() {
		this.word = this.parts.reduce((t,x) => {return t+x}, "").toUpperCase();
		this.element.value = this.word;
		$.q(".footer")[0].classList.toggle("ready", !answers.words.has(this.word) && this.lookup());
		let g = $.id("guess").value;
		$.id("guess").value = $.id("guess").value.padEnd(minAnswer, "_");
		$.id("guess").classList.toggle("short", g.length < minAnswer);
	}
	lookup() {
		let found = this.word.length >= minAnswer;
		found &&= dictionary.has(this.word);
		/*
		if ((this.word.length > 4) && (typeof dictionaryEpic !== "undefined"))
			found ||= dictionaryEpic.has(this.word);
		*/
		found ||= Boolean(dictionaryEpic?.has(this.word));
		return found;
	}
	submit(answers) {
		if (this.lookup()) {
			if (answers.add(this.word)) {
				this.cells = [];
				this.parts = [];
				this.updateDisplay();
			}
		}
	}
}

function score(w) {
	let x = M.max(w.length-1, 0);
	let a = M.floor(x / SCORE_CUT);
	let b = M.max(a - 1, 0);
	let c = (b*(b+1)/2);
	let d = (x % SCORE_CUT) + 1;
	return c*SCORE_CUT + a*d;
}
class Answers {
	constructor() {
		this.words = new Set();
		this.rounds = [[]];
		this.usedWords = [];
		this.score = 0;
	}
	scoring(r=0) {return this.rounds[r].map(score).filter((x)=>x>0).sort((a,b)=>b-a);}
	roundScore(r,i) {
		let bonus = this.rounds.length - i + 1;
		return (r[0] || 0)*r.slice(1).reduce((x,y) => x+y, bonus);
	}
	updateScore() {
		let s = this.rounds.map((x,i)=>this.scoring(i));
		this.score = s.map((x,i)=>this.roundScore(x,i)).reduce((a,v)=>a+v,0);
		$.id("score").innerHTML = this.score.toString();
		$.id("score").classList.toggle("hide", this.score < 1);
		$.id("subtotal").innerHTML = s.slice(1).map((x,i)=>this.roundScore(x,i+1)).reduce((a,v)=>a+v,0).toString();
		$.id("subtotalline").classList.toggle("hide", (this.rounds.length < 2) || (this.rounds[0].length == 0));
	}
	add(word) {
		if (this.words.has(word)) return false;
		this.words.add(word);
		this.rounds[0].push(word);
		for (let cell of grid.grid) if (cell.reuseable) {cell.used = false; cell.update();}
		this.updateScore();
		let s = score(word);
		if (s > 0) {
			if (this.scoring().length == 1) {
				$.new(["tr",{"class":"answerline bonusline", "id":"bonusline"},
						   ["td",{"class":"word"},"(bonus)"],
						   ["td",{"class":"score"},(this.rounds.length + 1).toString()]
					  ], "#wordlist > tbody");
			}
			let a = $.new(["tr",{"class":"answerline"},
					   ["td",{"class":"word"},word],
					   ["td",{"class":"score"},s.toString()]
				  ]);
			$.id("bonusline").before(a);
		}
		if (grid.isClear()) {
			this.usedWords = this.rounds.flat();
			this.rounds.unshift([]);
			this.updateScore();
			$.q("#wordlist > tbody")[0].replaceChildren();
			minAnswer += 1;
			if (minAnswer > maxAnswer) minAnswer = maxAnswer;
		}
		this.updateDisplay();
		return true;
	}
	updateDisplay() {
		let words = Array.from(this.rounds[0]);
		words.sort((a,b) => b.length - a.length);
		$.id("shortwords").innerHTML = "";
		for (let i of words.keys()) {
			let s = score(words[i]);
			if (s > 0) {
				let e = $.q("#wordlist tbody tr:nth-child("+(i+1).toString()+")")[0];
				e.querySelector("td:first-child").innerHTML = words[i];
				e.querySelector("td:last-child").innerHTML = s.toString();
				if (i == 0) {
					$.q("#bonusline td:last-child").innerHTML = (this.rounds.length + 1).toString();
				}
			} else {
				$.new(["div", words[i]], "#shortwords");
			}
		}
		for (let w of this.usedWords) {
			$.new(["div", w], "#shortwords");
		}
		$.id("wordlist").classList.toggle("sum", words.length > 0);
		
		if (grid.isDone()) {
			this.showScore();
		}
	}
	showScore() {
		$.id("finalsum").innerHTML = "";
		$.id("finalscore").innerHTML = "";
		$.id("finalwords").innerHTML = "";
		let e0 = $.new(["table"],"#finalsum");
		for (let i0 of [...this.rounds.keys()].reverse()) {
			let r = this.scoring(i0);
			let e1 = $.new(["tr"], e0);
			let e2;
			for (let i1 of r.keys()) {
				if (i1 == 0) {
					e2 = $.new(["td",r[i1].toString() + " x ( "], e1);
				} else {
					e2.innerHTML += r[i1].toString() + " + ";
				}
			}
			if (typeof(e2) !== "undefined")
				e2.innerHTML += (this.rounds.length-i0+1).toString() + " ) = " + this.roundScore(r,i0).toString();
		}
		$.id("finalscore").innerHTML = "Score: "+this.score.toString();
		this.rounds.flat().forEach(x => $.new(["span",x], "#finalwords"));
		$.id("scorelayer").classList.remove("hide");
	}
	hideScore() {
		$.id("scorelayer").classList.add("hide");
	}
}

function toggleHelpLayer() {
	$.class('leftside')[0].classList.toggle('hidelayer');
	$.id('helpbutton').classList.toggle('hidelayer');
}

const grid = new Grid();
const guess = new Guess($.id("guess"));
const answers = new Answers();
$.id("delete").setAttribute("onClick", "guess.remove()");
$.id("enter").setAttribute("onClick", "guess.submit(answers)");
$.id("score").setAttribute("onClick", "answers.showScore()");
$.id("scorelayer").setAttribute("onClick", "answers.hideScore()");
$.class("leftside")[0].setAttribute("onClick", "toggleHelpLayer();");
$.id("helpbutton").setAttribute("onClick", "toggleHelpLayer();");
$.class("middle")[0].classList.remove("hidelayer");
setTimeout(()=>$.class("leftside")[0].classList.remove("hidelayer"), 200);
