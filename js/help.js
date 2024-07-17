function stopProp(e) {
	if (typeof e !== "undefined") e?.stopPropagation();
}
function hideHelpLayer(e) {
	if (typeof e !== "undefined") e?.stopPropagation();
	Xid('help-layer').classList.add('hide');
	Xid('help-button').classList.remove('hide');
}
function toggleHelpLayer(e) {
	if (typeof e !== "undefined") e?.stopPropagation();
	Xid('help-layer').classList.toggle('hide');
	Xid('help-button').classList.toggle('hide');
}

function toggleHelpPageLeft() {
	let pages = Array.from(Xcs('help-page'));
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
	let pages = Array.from(Xcs('help-page'));
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

X.body.addEventListener("click", hideHelpLayer);
Xid("help-button").addEventListener("click", toggleHelpLayer);
Xid("help-layer").addEventListener("click", stopProp);
Xid("help-close-button").addEventListener("click", toggleHelpLayer);
Xid("help-close-button").addEventListener("click", toggleHelpLayer);
Xid("side-mask-l").addEventListener("click", toggleHelpPageLeft);
Xid("side-mask-r").addEventListener("click", toggleHelpPageRight);
setTimeout(()=>Xid("help-button").classList.remove("hide"), 200);
