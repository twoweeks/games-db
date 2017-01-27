'use strict';

function genFa(a, b, c, d) {
	let type = !a ? 'question' : a,	content = !b ? '' : b,	cls = !c ? '' : ' ' + c, check2x = (!d && d !== !1) ? ' fa-2x' : '';
	return '<i class="fa fa-' + type + check2x + cls + '" aria-hidden="true">' + content + '</i>';
}

function genDlLink(a, b, c) {
	let link = !a ? 'javascript:void(0);' : a,	content = !b ? '' : b,	cls = !c ? '' : ' ' + c;
	return '<a href="' + link + '" target="_blank" class="mui-btn mui-btn--raised ' + cls + '" rel="nofollow noopener">' + content + '</a>';
}

function genElem(a, b) {
	let elem = document.createElement(a);
	if (b) elem.setAttribute('class', b);
	return elem;
}

function parseHTML(str) {
  let tmp = document.implementation.createHTMLDocument();
  tmp.body.innerHTML = str;
  return tmp.body.children;
};

function postLinks(el, obj, addtext) {
	if (!obj) return;
	addtext = parseHTML(addtext);
	if (addtext[0]) addtext[0].classList.add("fa-space");
	if (obj.yadisk) el.innerHTML += genDlLink('https://yadi.sk/d/' + obj.yadisk, '', 'dl-link');
	if (obj.gdrive) el.innerHTML += genDlLink('https://docs.google.com/uc?id=' + obj.gdrive, '', 'dl-link');
	if (obj.web) el.innerHTML += genDlLink(obj.web, genFa('share', '', 'download-icon'));
	if (obj.github) el.innerHTML += genDlLink('https://github.com/' + obj.github, genFa('github', '', 'download-icon'));
	if (obj.gplay) el.innerHTML += genDlLink('https://play.google.com/store/apps/details?id=' + obj.gplay, genFa('google', '', 'download-icon'));
	if (obj.itunes) el.innerHTML += genDlLink('https://itunes.apple.com/app/id' + obj.itunes, genFa('apple', '', 'download-icon'));;
	if ((obj.yadisk || obj.gdrive || obj.web || obj.github || obj.gplay || obj.itunes) && addtext) for (let i of addtext) el.innerHTML += i.outerHTML;
}

const infoCDN = 'https://raw.githubusercontent.com/twoweeks/db/master/', imgCDN = 'https://113217.selcdn.ru/gd/';

document.addEventListener('DOMContentLoaded', () => {
	let compBtn = document.querySelectorAll('.getCompBtn');

	for (let i = 0; i < compBtn.length; i++) {
		compBtn[i].setAttribute('href', 'javascript:void(0);');
		compBtn[i].addEventListener('click', function(e) {
			e.preventDefault();
			getComps(this.dataset.comp);
		});
	}

	getComps('twg.json');

	smoothScroll.init({
		selector: '[data-scroll]',
		speed: 1000,
		easing: 'easeInOutCubic',
		offset: 0
	});
});

function getComps(comp) {
	history.pushState('', document.title, window.location.pathname);

	let compsList = document.querySelector('.comps-list'), compsContainer = document.querySelector('.comps-container');

	compsList.innerHTML = '';
	compsContainer.innerHTML = '';

	fetch(infoCDN + comp).then((response) => {
		return response.json();
	}).then((result) => {
		let reskeys = Object.keys(result);

		for (let i = 0; i < reskeys.length; i++) {
			let res = Object.create(result[reskeys[i]]);

			if (res.coalition) {
				reskeys[i] += '-1';
				reskeys.splice(i + 1, 0, i + 1 + '-2');
				result[reskeys[i + 1]] = res.glowstick;
				result[reskeys[i]] = res.coalition;
				result[reskeys[i]].note = res.note;
			}

			let name = 'Конкурс №' + reskeys[i];
			compsList.innerHTML += '<li><a class="mui-btn mui-btn--raised" href="#comp' + reskeys[i] + '" data-scroll>' + name + ' </a></li>';
		}

		let b = $('.comps-container'); // @TODO vanilla here, pls

		for (let i = 0; i < reskeys.length; i++) {
			let twg = result[reskeys[i]];
			b.append('<h1 id="comp' + reskeys[i] + '" class="comp-number">Конкурс №' + reskeys[i] + '</h1>');

			let compEl = $('<div class="mui-panel comp-header"></div>').appendTo(b);

			if (twg.themes) {
				for (let i = 0; i < twg.themes.same.length; i++) {
					compEl.append('<h1>' + genFa('tag', '', '', !1) + ' ' + twg.themes.same[i] + '</h1>');
					if (twg.themes.descriptions) compEl.append(twg.themes.descriptions[i] == '' ? '<p>Описания нет.</p>' : '<p class="game-text">' + twg.themes.descriptions[i] + '</p>');
				}
			} else compEl.append('<h1>' + genFa('tag', '', '', !1) + ' ' + twg.theme + '</h1>');

			if (twg.description) compEl.append(twg.description + '<br>');

			if (twg.achievements) {
				let achievements = $('<details><summary class="mui-btn mui-btn--raised">Ачивки</summary></details>').appendTo(compEl);
				achievements = $('<div class="mui--z1 game-achievements"></div>').appendTo(achievements);

				for (let i = 0; i < twg.achievements.same.length; i++) {
					achievements.append('<h4>' + genFa('star', '', '', !1) + ' ' + twg.achievements.same[i] + '</h4>');
					if (twg.achievements.descriptions) achievements.append(twg.achievements.descriptions[i] == '' ? '<p>Описания нет.</p>' : '<p class="game-text">' + twg.achievements.descriptions[i] + '</p>');
				}
			}

			if (twg.note) compEl.append('<pre>Примечание: ' + twg.note + '</pre><br>');

			compEl.append('<br><pre>Начало конкурса: ' + new moment(twg.start, 'X').format('LLL') + '<br>Конец конкурса: ' + new moment(twg.end, 'X').format('LLL') + '</pre><br>');

			postLinks(compEl, twg.archive);

			b.append('<div class="mui--z1 comp-games"></div>');

			for (let i = 0; i < twg.games.length; i++) {
				let game = twg.games[i];

				if (game.status == 'disqualified' && i + 2 < twg.games.length) {
					twg.games.push(game);
					continue;
				}

				let gameEl = $('<div class="mui-panel"></div>').appendTo(b.children().last()), gameBodyEl = $('<div class="game-body"></div>'), gameImage = genElem('img', 'game-img'), gameStatus;

				switch (game.image) {
					case '':
					case undefined:
						gameBodyEl.addClass('game-body-full');
						break;
					default:
						gameImage.setAttribute('src', imgCDN + game.image);
						gameImage.addEventListener('click', function() { window.open(this.src) });
						gameEl.append(gameImage);
				}

				gameBodyEl.appendTo(gameEl);

				switch (game.status) {
					case 'disqualified':
						gameStatus = 'Дисквалификация';
						gameBodyEl.append('<span title="' + gameStatus + '">' + genFa('ban', '', 'mui--pull-right game-status-' + game.status) + '</span>')
						break;
					case 'win':
					case '1':
						gameStatus = 'Победитель';
						break;
					case 'final':
						gameStatus = 'Финалист';
						break;
					case 'demo':
						gameStatus = 'Демо-версия';
						break;
					default:
						gameStatus = game.status + ' место';
				}

				if (game.status != 'disqualified') gameBodyEl.append('<span title="' + gameStatus + '">' + genFa('trophy', '', 'mui--pull-right game-status-' + game.status) + '</span>');
				gameBodyEl.append('<h2 class="game-header">' + genFa('gamepad', '', '', !1) + ' ' + game.name + '</h2>');

				if (game.genre) gameBodyEl.append('<br><pre class="game-text">Жанр: ' + game.genre + '</pre>');
				gameBodyEl.append(game.description === undefined ? '<p>Описания нет.</p>' : '<p class="game-text">' + game.description.replace(/\n/g, "<br>") + '</p>');

				if (game.note) gameBodyEl.append('<pre>Примечание: ' + game.note + '</pre><br>');

				gameBodyEl[0].innerHTML += '<div class="game-downloads"></div>';
				let downloads = gameBodyEl[0].querySelector('.game-downloads');

				if (game.other_links) {
					if (game.other_links.repo) {
						postLinks(downloads, game.other_links.repo);
						downloads.innerHTML += '<div class="mui-divider"></div>';
					}
					if (game.other_links.gamejolt) {
						downloads.innerHTML += genDlLink('http://gamejolt.com/games/' + game.other_links.gamejolt, '', 'dl-link') + genFa('desktop', '', 'fa-space');
						downloads.innerHTML += '<div class="mui-divider"></div>';
					}
					if (game.other_links.updated) {
						postLinks(downloads, game.other_links.updated, genFa('check') + genFa('arrow-circle-up') + '<br>');
						downloads.innerHTML += '<div class="mui-divider"></div>';
					}
				}

				postLinks(downloads, game.links, genFa('check') + '<br>');

				if (game.other_links) {
					if (game.other_links.final_multi) {
						downloads.innerHTML += '<div class="mui-divider"></div>';
						postLinks(downloads, game.other_links.final_multi.win, genFa('windows') + '<br>');
						postLinks(downloads, game.other_links.final_multi.win_x64, genFa('windows', '64') + '<br>');
						postLinks(downloads, game.other_links.final_multi.linux, genFa('linux') + '<br>');
						postLinks(downloads, game.other_links.final_multi.mac, genFa('apple') + genFa('desktop') + '<br>');
						postLinks(downloads, game.other_links.final_multi.android, genFa('android') + '<br>');
					}
					if (game.other_links.store) {
						downloads.innerHTML += '<div class="mui-divider"></div>';
						postLinks(downloads, game.other_links.store, genFa('mobile') + '<br>');
					}
					if (game.other_links.demo_multi) {
						downloads.innerHTML += '<div class="mui-divider"></div>';
						postLinks(downloads, game.other_links.demo_multi.win, genFa('bug') + genFa('windows') + '<br>');
						postLinks(downloads, game.other_links.demo_multi.win_x64, genFa('bug') + genFa('windows') + '<br>');
						postLinks(downloads, game.other_links.demo_multi.linux, genFa('bug') + genFa('linux') + '<br>');
						postLinks(downloads, game.other_links.demo_multi.mac, genFa('bug') + genFa('apple') + genFa('desktop') + '<br>');
						postLinks(downloads, game.other_links.demo_multi.android, genFa('bug') + genFa('android') + '<br>');
					}
					if (game.other_links.demo_updated) {
						downloads.innerHTML += '<div class="mui-divider"></div>';
						postLinks(downloads, game.other_links.demo_updated, genFa('bug') + genFa('arrow-circle-up') + '<br>');
					}
					if (game.other_links.demo) {
						downloads.innerHTML += '<div class="mui-divider"></div>';
						postLinks(downloads, game.other_links.demo, genFa('bug') + '<br>');
					}
				}
			}
		}
	}).catch((e) => {
		let loadingElem = document.querySelector('.loading');

		if (!loadingElem) {
			loadingElem = genElem('p', 'loading');
			compsContainer.appendChild(loadingElem);
		}

		loadingElem.textContent = 'Сервер GitHub сейчас недоступен.';
	});
}
