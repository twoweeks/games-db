'use strict'

var $gen = {
	elem: function(a, b) {
		let elem = document.createElement(a)
		if (b) elem.setAttribute('class', b);
		return elem
	},
	fa: function(a, b, c, d) {
		let
			type = !a ? 'question' : a,
			content = !b ? '' : b,
			cls = !c ? '' : ' ' + c,
			check2x = (!d && d !== !1) ? ' fa-2x' : ''

		return `<i class="fa fa-${type}${check2x}${cls}" aria-hidden="true">${content}</i>`
	},
	dlLink: function(a, b, c) {
		let
			link = !a ? 'javascript:void(0);' : a,
			content = !b ? '' : b,
			cls = !c ? '' : ' ' + c

		return `<a href="${link}" target="_blank" class="mui-btn mui-btn--raised ${cls}" rel="nofollow noopener">${content}</a>`
	},
	postLinks: function(el, obj, addtext) {
		if (!obj) return;

		addtext = $gen.html(addtext)

		if (addtext[0]) addtext[0].classList.add('fa-space')
		if (obj.yadisk) el.innerHTML += $gen.dlLink(`https://yadi.sk/d/${obj.yadisk}`, '', 'dl-link')
		if (obj.gdrive) el.innerHTML += $gen.dlLink(`https://docs.google.com/uc?id=${obj.gdrive}`, '', 'dl-link')
		if (obj.web) el.innerHTML += $gen.dlLink(obj.web, $gen.fa('share', '', 'download-icon'))
		if (obj.github) el.innerHTML += $gen.dlLink(`https://github.com/${obj.github}`, $gen.fa('github', '', 'download-icon'))
		if (obj.gplay) el.innerHTML += $gen.dlLink(`https://play.google.com/store/apps/details?id=${obj.gplay}`, $gen.fa('google', '', 'download-icon'))
		if (obj.itunes) el.innerHTML += $gen.dlLink(`https://itunes.apple.com/app/id${obj.itunes}`, $gen.fa('apple', '', 'download-icon'))
		if ((obj.yadisk || obj.gdrive || obj.web || obj.github || obj.gplay || obj.itunes) && addtext) for (let i of addtext) el.innerHTML += i.outerHTML
	},
	html: function(str) {
		let tmp = document.implementation.createHTMLDocument()
		tmp.body.innerHTML = str
		return tmp.body.children
	}
}



const
	infoCDN = 'https://raw.githubusercontent.com/twoweeks/db/master/',
	imgCDN = 'https://113217.selcdn.ru/gd/'

document.addEventListener('DOMContentLoaded', () => {
	let compBtn = document.querySelectorAll('.getCompBtn')

	for (let i = 0; i < compBtn.length; i++) {
		compBtn[i].setAttribute('href', 'javascript:void(0);')
		compBtn[i].addEventListener('click', function(e) {
			e.preventDefault()
			getComps(this.dataset.comp)
		})
	}

	getComps('twg')

	smoothScroll.init({
		selector: '[data-scroll]',
		speed: 1000,
		easing: 'easeInOutCubic',
		offset: 0
	})
})

function getComps(comp) {
	history.pushState('', document.title, window.location.pathname)

	let
		compsList = document.querySelector('.comps-list'),
		compsContainer = document.querySelector('.comps-container')

	compsList.innerHTML = ''
	compsContainer.innerHTML = ''

	fetch(infoCDN + comp + '.json').then((response) => {
		return response.json()
	}).then((result) => {
		let reskeys = Object.keys(result)

		for (let i = 0; i < reskeys.length; i++) {
			let res = Object.create(result[reskeys[i]])

			if (res.coalition) {
				reskeys[i] += '-1'
				reskeys.splice(i + 1, 0, i + 1 + '-2')
				result[reskeys[i + 1]] = res.glowstick
				result[reskeys[i]] = res.coalition
				result[reskeys[i]].note = res.note
			}

			let name = `Конкурс №${reskeys[i]}`
			compsList.innerHTML += `<li><a class="mui-btn mui-btn--raised" href="#comp${reskeys[i]}" data-scroll>${name}</a></li>`
		}

		let b = $('.comps-container') // @TODO vanilla here, pls

		for (let i = 0; i < reskeys.length; i++) {
			let twg = result[reskeys[i]]
			b.append(`<h1 id="comp${reskeys[i]}" class="comp-number">${reskeys[i]}</h1>`)

			let compEl = $('<div class="mui-panel comp-header"></div>').appendTo(b)

			if (twg.themes) {
				for (let i = 0; i < twg.themes.same.length; i++) {
					compEl.append(`<h1>${$gen.fa('tag', '', '', !1)} ${twg.themes.same[i]}</h1>`)
					if (twg.themes.descriptions) compEl.append(twg.themes.descriptions[i] ? `<p class="p-text">${twg.themes.descriptions[i].replace(/\n/g, '<br>')}</p>` : '<p class="p-text"></p>')
				}
			} else compEl.append(`<h1>${$gen.fa('tag', '', '', !1)} ${twg.theme}</h1>`)

			if (twg.description) compEl.append(twg.description.replace(/\n/g, '<br>') + '<br>')

			if (twg.achievements) {
				let
					achievements = $('<details><summary class="mui-btn mui-btn--raised">Ачивки</summary></details>').appendTo(compEl),
					achievementsBody = $('<div class="mui--z1 game-achievements"></div>').appendTo(achievements),
					achievementBody = ''

				for (let i = 0; i < twg.achievements.same.length; i++) {
					let achievementBody = $('<div class="ach-description"></div>').appendTo(achievementsBody)
					achievementBody.append(`<h4>${$gen.fa('star', '', '', !1)} ${twg.achievements.same[i]}</h4>`)
					if (twg.achievements.descriptions) achievementBody.append(twg.achievements.descriptions[i] ? `<p class="p-text">${twg.achievements.descriptions[i]}</p>` : '<p class="p-text"></p>')
					if (twg.achievements.gifts) achievementBody.append(twg.achievements.gifts[i] ? `<p class="ach-gift">${twg.achievements.gifts[i]}</p>` : '<p class="ach-gift"></p>')
					if (twg.achievements.win) achievementBody.append(twg.achievements.win[i] ? `<p class="ach-win">${twg.achievements.win[i]}</p>` : '<p class="ach-win"></p>')
				}
			}

			if (twg.note) compEl.append(`<pre class="p-note">${twg.note}</pre>`)

			compEl.append(`<br><pre class="comp-date-start">${new moment(twg.start, 'X').format('LLL')}</pre><pre class="comp-date-end">${new moment(twg.end, 'X').format('LLL')}</pre>`)

			$gen.postLinks(compEl, twg.archive)

			b.append('<div class="mui--z1 comp-games"></div>')

			for (let i = 0; i < twg.games.length; i++) {
				let game = twg.games[i]

				if (game.status === 'disqualified' && i + 2 < twg.games.length) {
					twg.games.push(game)
					continue
				}

				let
					gameEl = $('<div class="mui-panel"></div>').appendTo(b.children().last()),
					gameBodyEl = $('<div class="game-body"></div>'),
					gameImage = $gen.elem('img', 'game-img'),
					gameStatus = ''

				switch (game.image) {
					case '':
					case undefined:
						gameBodyEl.addClass('game-body-full')
						break
					default:
						gameImage.setAttribute('src', imgCDN + game.image)
						gameImage.addEventListener('click', function() { window.open(this.src) })
						gameEl.append(gameImage)
				}

				gameBodyEl.appendTo(gameEl)

				switch (game.status) {
					case 'disqualified':
						gameStatus = 'Дисквалификация'
						break
					case 'win':
					case '1':
						gameStatus = 'Победитель'
						break
					case '2': case '3': case '4': // ???
						gameStatus = `${game.status} место`
						break
					case 'final':
						gameStatus = 'Финалист'
						break
					case 'demo':
						gameStatus = 'Демо-версия'
						break
					case 'updated':
						gameStatus = 'Обновлённая версия'
						break
					default:
						console.info('Неправильный статус ' + game.status + ' у ' + game.name)
				}

				if (game.status !== 'disqualified')
					gameBodyEl.append(`<span title="${gameStatus}">${$gen.fa('trophy', '', `mui--pull-right game-status-${game.status}`)}</span>`)
					else gameBodyEl.append(`<span title="${gameStatus}">${$gen.fa('ban', '', 'mui--pull-right game-status-' + game.status)}</span>`)

				gameBodyEl.append(`<h2 class="game-header">${$gen.fa('gamepad', '', '', !1)} ${game.name}</h2>`)

				if (game.genre) gameBodyEl.append(`<pre class="game-genre">${game.genre}</pre>`)

				gameBodyEl.append(game.description ? `<p class="p-text">${game.description.replace(/\n/g, '<br>')}</p>` : '<p class="p-text"></p>')

				if (game.tools) gameBodyEl.append(`<pre class="game-tools">${game.tools}</pre>`)

				if (game.note) gameBodyEl.append(`<pre class="p-note">${game.note}</pre>`)

				gameBodyEl[0].innerHTML += '<div class="game-downloads"></div>'
				let downloads = gameBodyEl[0].querySelector('.game-downloads')

				if (game.other_links) {
					if (game.other_links.repo) {
						$gen.postLinks(downloads, game.other_links.repo)
						downloads.innerHTML += '<div class="mui-divider"></div>'
					}
					if (game.other_links.gamejolt) {
						downloads.innerHTML += $gen.dlLink(`http://gamejolt.com/games/${game.other_links.gamejolt}`, '', 'dl-link') + $gen.fa('desktop', '', 'fa-space')
						downloads.innerHTML += '<div class="mui-divider"></div>'
					}
					if (game.other_links.updated) {
						$gen.postLinks(downloads, game.other_links.updated, `${$gen.fa('check')}${$gen.fa('arrow-circle-up')}<br>`)
						downloads.innerHTML += '<div class="mui-divider"></div>'
					}
				}

				$gen.postLinks(downloads, game.links, $gen.fa('check') + '<br>')

				if (game.other_links) {
					if (game.other_links.final_multi) {
						downloads.innerHTML += '<div class="mui-divider"></div>'
						$gen.postLinks(downloads, game.other_links.final_multi.win, $gen.fa('windows') + '<br>')
						$gen.postLinks(downloads, game.other_links.final_multi.win_x64, $gen.fa('windows', '<span>64</span>') + '<br>')
						$gen.postLinks(downloads, game.other_links.final_multi.linux, $gen.fa('linux') + '<br>')
						$gen.postLinks(downloads, game.other_links.final_multi.mac, $gen.fa('apple') + $gen.fa('desktop') + '<br>')
						$gen.postLinks(downloads, game.other_links.final_multi.android, $gen.fa('android') + '<br>')
					}
					if (game.other_links.store) {
						downloads.innerHTML += '<div class="mui-divider"></div>'
						$gen.postLinks(downloads, game.other_links.store, $gen.fa('mobile') + '<br>')
					}
					if (game.other_links.demo_multi) {
						downloads.innerHTML += '<div class="mui-divider"></div>'
						$gen.postLinks(downloads, game.other_links.demo_multi.win, $gen.fa('bug') + $gen.fa('windows') + '<br>')
						$gen.postLinks(downloads, game.other_links.demo_multi.win_x64, $gen.fa('bug') + $gen.fa('windows') + '<br>')
						$gen.postLinks(downloads, game.other_links.demo_multi.linux, $gen.fa('bug') + $gen.fa('linux') + '<br>')
						$gen.postLinks(downloads, game.other_links.demo_multi.mac, $gen.fa('bug') + $gen.fa('apple') + $gen.fa('desktop') + '<br>')
						$gen.postLinks(downloads, game.other_links.demo_multi.android, $gen.fa('bug') + $gen.fa('android') + '<br>')
					}
					if (game.other_links.demo_updated) {
						downloads.innerHTML += '<div class="mui-divider"></div>'
						$gen.postLinks(downloads, game.other_links.demo_updated, $gen.fa('bug') + $gen.fa('arrow-circle-up') + '<br>')
					}
					if (game.other_links.demo) {
						downloads.innerHTML += '<div class="mui-divider"></div>'
						$gen.postLinks(downloads, game.other_links.demo, $gen.fa('bug') + '<br>')
					}
				}
			}
		}
	}).catch((e) => {
		let loadingElem = document.querySelector('.loading')

		if (!loadingElem) {
			loadingElem = $gen.elem('p', 'loading')
			compsContainer.appendChild(loadingElem)
		}

		loadingElem.textContent = 'Ошибка загрузки.'
	})
}
