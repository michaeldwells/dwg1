function drawKeyboard(parent) {
	let layout = ["qwertyuiop","asdfghjkl","zxcvbnm"];
	let kbElement = ["div", {"class":"keyboard", "id":"keyboard"}];

	for (let line of layout) {
		let lineDiv = ["div", {"class":"keyboard-row"}];

		for (let letter of line) {
			let properties = {};

			properties["class"]   = "keyboard-key";
			properties["id"]      = "key-" + letter;
			properties["onClick"] = "keyboardCallback(\"" + letter + "\");";

			append(lineDiv, [ "div", properties, ["span", {"class":"symbol"}, letter.toUpperCase()] ]);
		}

		kbElement = kbElement.concat([lineDiv]);
	}

	kbElement[2][1]["id"] = "keyboard-row-top";
	kbElement[3][1]["id"] = "keyboard-row-mid";
	kbElement[4][1]["id"] = "keyboard-row-bot";

	append(kbElement[4], ["div", {"class":"keyboard-key", "id":"key-del", "onclick":"keyboardDelCallback();"}, ["span", {"class":"symbol"}, "‹DEL"]]); //⌫
	kbElement[4].splice(2, 0, ["div", {"class":"keyboard-key", "id":"key-enter", "onclick":"keyboardEnterCallback();"}, ["span", {"class":"symbol"}, "ENTER›"]]); //↵

	Xnew(kbElement, parent);
}

document.addEventListener(
	"keydown",
	(event) => {
	  const keyName = event.key;

	  if (keyName.length == 1 && "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(keyName.toUpperCase()) >= 0) {
		keyboardCallback(keyName);
	  }

	  if (keyName === "Enter") {
		keyboardEnterCallback();
	  }
  
	  if (keyName === "Backspace" || keyName === "Delete") {
		keyboardDelCallback();
	  }
	},
	false,
  );
  