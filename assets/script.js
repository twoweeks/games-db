'use strict'

var $gen = {
	elem: (a, b) => {
		let elem = document.createElement(a)
		if (b) elem.setAttribute('class', b)
		return elem
	},
	fa: (a, b, c, d) => {
		let
			type = !a ? 'question' : a,
			content = !b ? '' : b,
			cls = !c ? '' : ' ' + c,
			check2x = (!d && d !== !1) ? ' fa-2x' : ''

		return `<i class="fa fa-${type}${check2x}${cls}">${content}</i>`
	},
	dlLink: (a, b, c) => {
		let
			link = !a ? 'javascript:void(0)' : a,
			content = !b ? '' : b,
			cls = !c ? '' : ' ' + c

		return `<a href="${link}" class="mui-btn mui-btn--raised ${cls}" target="_blank" rel="nofollow noopener">${content}</a>`
	},
	postLinks: (el, obj, addtext) => {
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
	html: (str) => {
		let tmp = document.implementation.createHTMLDocument()
		tmp.body.innerHTML = str
		return tmp.body.children
	}
}

var $check = {
	get: (value) => {
		let params = new URLSearchParams(location.search)
		return (params.get(value) == '') ? '' : params.get(value)
	}
}

const
	infoCDN = 'https://raw.githubusercontent.com/twoweeks/db/ed069a3ec300ac07179fd3ecc7406b4f60c93b74/json/min/',
	imgCDN = 'https://gd-imgs.cojam.ru/'

document.addEventListener('DOMContentLoaded', () => {
	let compBtn = document.querySelectorAll('.getCompBtn')
	Array.from(compBtn).forEach(btn => {
		btn.setAttribute('href', 'javascript:void(0)')
		btn.onclick = (e => {
			e.preventDefault()
			getComp(e.target.dataset.comp)
		})
	})

	let compFromURL = $check.get('get')
	if (compFromURL && compFromURL != '')
		getComp(compFromURL)
		else getComp('twg')
})

function getComp(comp) {
	history.pushState('', document.title, `${window.location.pathname}?get=${comp}`)

	let
		compsList = document.querySelector('.comps-list'),
		compsContainer = document.querySelector('.comps-container')

	compsList.textContent = ''
	compsContainer.textContent = ''

	fetch(`${infoCDN}${comp}.json`).then(response => response.json()).then(result => {
		let b = $('.comps-container') // @TODO vanilla here, pls

		Object.keys(result).forEach(key => {
			let name = `Конкурс №${key}`
			compsList.innerHTML += `<li><a class="mui-btn mui-btn--raised" href="#comp${key}">${name}</a></li>`

			let comp = result[key]
			b.append(`<h1 id="comp${key}" class="comp-number">${key}</h1>`)

			let compEl = $('<div class="mui-panel comp-header"></div>').appendTo(b)

			if (comp.themes) {
				comp.themes.forEach(theme => {
					compEl.append(`<h1>${$gen.fa('tag', '', '', !1)} ${theme.name}</h1>`)
					if (theme.description) compEl.append(`<p class="p-text">${theme.description ? theme.description : ''}</p>`)
				})
			} else compEl.append(`<h1>${$gen.fa('tag', '', '', !1)} ${comp.theme}</h1>`)

			if (comp.description) compEl.append(comp.description.replace(/\n/g, '<br>') + '<br>')

			if (comp.achievements) {
				let
					achievements = $('<details><summary class="mui-btn mui-btn--raised">Ачивки</summary></details>').appendTo(compEl),
					achievementsBody = $('<div class="mui--z1 game-achievements"></div>').appendTo(achievements),
					achievementBody = ''

				comp.achievements.forEach(achievement => {
					let achievementBody = $('<div class="ach-description"></div>').appendTo(achievementsBody)
					achievementBody.append(`<h4>${$gen.fa('star', '', '', !1)} ${achievement.name}</h4>`)

					if (achievement.description) achievementBody.append(`<p class="p-text">${achievement.description ? achievement.description : ''}</p>`)
					if (achievement.gift) achievementBody.append(`<p class="p-text ach-gift">${achievement.gift ? achievement.gift : ''}</p>`)
					if (achievement.win) achievementBody.append(`<p class="p-text ach-win">${achievement.win ? achievement.win : ''}</p>`)
				})
			}

			if (comp.note) compEl.append(`<pre class="p-note">${comp.note}</pre>`)

			compEl.append(`<br><pre class="comp-date-start">${new moment(comp.start, 'X').format('LLL')}</pre><pre class="comp-date-end">${new moment(comp.end, 'X').format('LLL')}</pre>`)

			$gen.postLinks(compEl, comp.archive)

			if (comp.games && comp.games.length != 0) b.append('<div class="mui--z1 comp-games"></div>')

			comp.games.forEach((game, i) => {
				if (game.status == 'disqualified' && i + 2 < comp.games.length) {
					comp.games.push(game); return
				}

				let
					gameEl = $('<div class="mui-panel"></div>').appendTo(b.children().last()),
					gameBodyEl = $('<div class="game-body"></div>'),
					gameImage = $gen.elem('img', 'game-img'),
					gameStatus = ''

				switch (game.image) {
					case '':
					case undefined:
						gameBodyEl.addClass('game-body-full'); break
					default:
						gameImage.setAttribute('src', imgCDN + game.image)
						gameImage.onclick = function() { window.open(this.src) }
						gameEl.append(gameImage)
				}

				gameBodyEl.appendTo(gameEl)

				switch (game.status) {
					case 'disqualified':
						gameStatus = 'Дисквалификация'; break
					case 'win':
					case '1':
						gameStatus = 'Победитель'
						break
					case '2': case '3': case '4': // ???
						gameStatus = `${game.status} место`; break
					case 'final':
						gameStatus = 'Финалист'; break
					case 'demo':
						gameStatus = 'Демо-версия'; break
					case 'updated':
						gameStatus = 'Обновлённая версия'; break
					default:
						console.info(`Неправильный статус ${game.status} у ${game.name}`)
				}

				if (game.status !== 'disqualified')
					gameBodyEl.append(`<span title="${gameStatus}">${$gen.fa('trophy', '', `mui--pull-right game-status-${game.status}`)}</span>`)
					else gameBodyEl.append(`<span title="${gameStatus}">${$gen.fa('ban', '', 'mui--pull-right game-status-' + game.status)}</span>`)

				gameBodyEl.append(`<h2 class="game-header">${$gen.fa('gamepad', '', '', !1)} ${game.name}</h2>`)

				if (game.genre) gameBodyEl.append(`<pre class="game-genre">${game.genre}</pre>`)

				gameBodyEl.append(`<p class="p-text">${game.description ? game.description.replace(/\n/g, '<br>') : ''}</p>`)

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
			})
		})
	}).catch(e => {
		let loadingElem = document.querySelector('.loading')

		if (!loadingElem) {
			loadingElem = $gen.elem('p', 'loading')
			compsContainer.appendChild(loadingElem)
		}

		loadingElem.textContent = 'Ошибка загрузки.'
	})
}
