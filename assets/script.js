'use strict';

function genFa(a, b, c, d) {
	let type = !a ? 'question' : a,	content = !b ? '' : b,	cls = !c ? '' : ' ' + c, check2x = (!d && d !== !1) ? ' fa-2x' : '';
	return '<i class="fa fa-' + type + check2x + cls + '" aria-hidden="true">' + content + '</i>';
}

function postlinks(el, obj, addtext) {
	if (!obj) return;
	addtext = parseHTML(addtext);
	if(addtext[0]) addtext[0].classList.add("fa-space");
	if (obj.yadisk) el.innerHTML += '<a href="https://yadi.sk/d/' + obj.yadisk + '" target="_blank" class="mui-btn mui-btn--raised dl-link"></a>';
	if (obj.gdrive) el.innerHTML += '<a href="https://docs.google.com/uc?id=' + obj.gdrive + '&export=download" target="_blank" class="mui-btn mui-btn--raised dl-link"></a>';
	if (obj.web) el.innerHTML += '<a href="' + obj.web + '" target="_blank" class="mui-btn mui-btn--raised" rel="nofollow noopener">' + genFa('share', '', 'download-icon') + '</a>';
	if (obj.github) el.innerHTML += '<a href="https://github.com/' + obj.github + '" target="_blank" class="mui-btn mui-btn--raised">' + genFa('github', '', 'download-icon') + '</a>';
	if (obj.gplay) el.innerHTML += '<a href="https://play.google.com/store/apps/details?id=' + obj.gplay + '" target="_blank" class="mui-btn mui-btn--raised">' + genFa('google', '', 'download-icon') + '</a>';
	if (obj.itunes) el.innerHTML += '<a href="https://itunes.apple.com/app/id' + obj.itunes + '" target="_blank" class="mui-btn mui-btn--raised">' + genFa('apple', '', 'download-icon') + '</a>';
	if ((obj.yadisk || obj.gdrive || obj.web || obj.github || obj.gplay || obj.itunes) && addtext) for(let i of addtext) el.innerHTML += i.outerHTML;
}

const infoCDN = 'https://cdn.rawgit.com/twoweeks/db/master/', imgCDN = 'https://113217.selcdn.ru/gd/';

document.addEventListener('DOMContentLoaded', ()=>{
	let compBtn = document.querySelectorAll('.getCompBtn');

	for (let i = 0; i < compBtn.length; i++) {
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
		offset: 0,
		updateURL: false
	});
});

function getComps(comp){
	let request = new XMLHttpRequest();
	request.open('GET', infoCDN+comp, true);

	fetch(infoCDN+comp).then((response)=>{
		return response.json();
	}).then((result)=>{
		let reskeys = Object.keys(result),
			compsList = document.querySelector('#sidedrawer .comps-list'),
			compsContainer = document.querySelector('.comps-container');

		compsList.innerHTML = '';
		compsContainer.innerHTML = '';

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

		let b = $('.comps-container');//TODO: vanilla here, pls

		for (let i = 0; i < reskeys.length; i++){
			let twg = result[reskeys[i]];
			b.append('<h1 id="comp' + reskeys[i] + '" class="comp-number">Конкурс №' + reskeys[i] + '</h1>');

			let compEl = $('<div class="mui-panel comp-header"></div>').appendTo(b);

			if (twg.themes) {
				for (let i = 1; i < twg.themes.same.length; i++) {
					compEl.append('<h1><i class="fa fa-tag" aria-hidden="true"></i> ' + twg.themes.same[i] + '</h1>');
					if (twg.themes.descriptions) compEl.append(twg.themes.descriptions[i] == '' ? '<p>Описания нет.</p>' : '<p class="game-text">' + twg.themes.descriptions[i] + '</p>');
				}
			} else compEl.append('<h1><i class="fa fa-tag" aria-hidden="true"></i> ' + twg.theme + '</h1>');

			if (twg.description) compEl.append(twg.description + '<br>');

			if (twg.achievements) {
				let achievements = $('<details><summary class="mui-btn mui-btn--raised">Ачивки</summary></details>').appendTo(compEl);
				achievements = $('<div class="mui--z1 game-achievements"></div>').appendTo(achievements);

				for (let i = 0; i < twg.achievements.same.length; i++) {
					achievements.append('<h4><i class="fa fa-star" aria-hidden="true"></i> ' + twg.achievements.same[i] + '</h4>');
					if (twg.achievements.descriptions) achievements.append(twg.achievements.descriptions[i] == '' ? '<p>Описания нет.</p>' : '<p class="game-text">' + twg.achievements.descriptions[i] + '</p>');
				}
			}

			if (twg.note) compEl.append('<pre>Примечание: ' + twg.note + '</pre><br>');

			compEl.append('<br><pre>Начало конкурса: ' + new moment(twg.start, 'X').format('LLL') + '<br>Конец конкурса: ' + new moment(twg.end, 'X').format('LLL') + '</pre><br>');

			postlinks(compEl, twg.archive);

			b.append('<div class="mui--z1 comp-games"></div>');

			for (let i = 0; i < twg.games.length; i++) {
				let game = twg.games[i];

				if (game.status == 'disqualified' && i + 2 < twg.games.length) {
					twg.games.push(game);
					continue;
				}

				let gameEl = $('<div class="mui-panel"></div>').appendTo(b.children().last()), gameBodyEl = $('<div class="game-body"></div>');

				if (game.image) gameEl.append('<img src="' + imgCDN + game.image + '" class="game-img" onerror="$(this).next().addClass("game-body-full"); $(this).remove();" onclick="window.open(this.src)">')
				else gameBodyEl.addClass('game-body-full');

				gameBodyEl.appendTo(gameEl);

				if (game.status != 'disqualified') gameBodyEl.append(genFa('trophy', '', 'mui--pull-right game-status-' + game.status));
				else gameBodyEl.append(genFa('ban', '', 'mui--pull-right game-status-' + game.status))
				gameBodyEl.append('<h2 class="game-header">' + genFa('gamepad', '', '', !1) + ' ' + game.name + '</h2>');

				if (game.genre) gameBodyEl.append('<br><pre class="game-text">Жанр: ' + game.genre + '</pre>');
				gameBodyEl.append(game.description === undefined ? '<p>Описания нет.</p>' : '<p class="game-text">' + game.description + '</p>');

				if (game.note) gameBodyEl.append('<pre>Примечание: ' + game.note + '</pre><br>');

				gameBodyEl[0].innerHTML += '<div class="game-downloads"></div>';
				let downloads = gameBodyEl[0].querySelector('.game-downloads');

				if (game.other_links) {
					if (game.other_links.repo) {
						postlinks(downloads, game.other_links.repo);
						downloads.innerHTML += '<div class="mui-divider"></div>';
					}
					if (game.other_links.updated) {
						postlinks(downloads, game.other_links.updated, genFa('check') + genFa('arrow-circle-up') + '<br>');
						downloads.innerHTML += '<div class="mui-divider"></div>';
					}
				}

				postlinks(downloads, game.links, genFa('check') + '<br>');

				if (game.other_links) {
					if (game.other_links.final_multi) {
						downloads.innerHTML += '<div class="mui-divider"></div>';
						postlinks(downloads, game.other_links.final_multi.win, genFa('windows') + '<br>');
						postlinks(downloads, game.other_links.final_multi.win_x64, genFa('windows', '64') + '<br>');
						postlinks(downloads, game.other_links.final_multi.linux, genFa('linux') + '<br>');
						postlinks(downloads, game.other_links.final_multi.mac, genFa('apple') + genFa('desktop') + '<br>');
						postlinks(downloads, game.other_links.final_multi.android, genFa('android') + '<br>');
					}
					if (game.other_links.store) {
						downloads.innerHTML += '<div class="mui-divider"></div>';
						postlinks(downloads, game.other_links.store, genFa('mobile') + '<br>');
					}
					if (game.other_links.demo_multi) {
						downloads.innerHTML += '<div class="mui-divider"></div>';
						postlinks(downloads, game.other_links.demo_multi.win, genFa('bug') + genFa('windows') + '<br>');
						postlinks(downloads, game.other_links.demo_multi.win_x64, genFa('bug') + genFa('windows') + '<br>');
						postlinks(downloads, game.other_links.demo_multi.linux, genFa('bug') + genFa('linux') + '<br>');
						postlinks(downloads, game.other_links.demo_multi.mac, genFa('bug') + genFa('apple') + genFa('desktop') + '<br>');
						postlinks(downloads, game.other_links.demo_multi.android, genFa('bug') + genFa('android') + '<br>');
					}
					if (game.other_links.demo_updated) {
						downloads.innerHTML += '<div class="mui-divider"></div>';
						postlinks(downloads, game.other_links.demo_updated, genFa('bug') + genFa('arrow-circle-up') + '<br>');
					}
					if (game.other_links.demo) {
						downloads.innerHTML += '<div class="mui-divider"></div>';
						postlinks(downloads, game.other_links.demo, genFa('bug') + '<br>');
					}
				}
			}
		}
	});
}
function parseHTML(str) {
  let tmp = document.implementation.createHTMLDocument();
  tmp.body.innerHTML = str;
  return tmp.body.children;
};
