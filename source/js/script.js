'use strict'

let parseLocalComps = comps => {
	let
		namesContainer = $make.qs('.names'),
		namesList = $create.elem('ul')

	comps.forEach(comp => {
		let
			nameListItem =  $create.elem('li'),
			nameButton =    $create.elem('button', comp.name, 'btn btn__name')

		if (comp.altNames && comp.altNames.length != 0) {
			let altNamesList = $create.elem('ul', '', 'btn__name--alt-names-list')

			comp.altNames.forEach(name => {
				let altNamesListItem = $create.elem('li', name)
				altNamesList.appendChild(altNamesListItem)
			})

			nameButton.appendChild(altNamesList)
		}

		nameButton.addEventListener('click', e => {
			getCompData(comp.file)
		})

		nameListItem.appendChild(nameButton)
		namesList.appendChild(nameListItem)
	})

	namesContainer.appendChild(namesList)
}

let parseGame = data => {
	let gameBox = $create.elem('div', '', 'comp_games--game _game')

	if (!data) { return }

	let game = data.game, CDN = data.CDN

	if (game.image && game.image != '') {
		let
			gameImageBox =       $create.elem('div', '', '_game__image'),
			gameImageBoxСrutch = $create.elem('picture'),
			gameImage =          $create.elem('img')

		//gameImage.dataset.src = `${CDN.imgs}/${game.image}`
		gameImage.setAttribute('src', `${CDN.imgs}/${game.image}`)

		//gameImageBoxСrutch.appendChild(gameImage)
		gameImageBox.appendChild(gameImage)
		gameBox.appendChild(gameImageBox)
	} else {
		gameBox.classList.add('_game--no-image')
	}

	let gameInfoBox = $create.elem('div', '', '_game__info')

	let gameInfoName = $create.elem('h2', $create.db.icon('videogame_asset'), '_game__info--name _middle')

	gameInfoName.appendChild($create.elem('span', (game.name && game.name != '') ? game.name : 'Названия нет'))

	gameInfoBox.appendChild(gameInfoName)

	if (game.genre && game.genre != '') {
		gameInfoBox.appendChild($create.elem('p', `Жанр: ${game.genre}`))
	}

	gameInfoBox.appendChild($create.elem('div', game.description ? $create.db.textBlocks(game.description) : 'Описания нет.', '_game__info--description'))

	if (game.tools && game.tools != '') {
		gameInfoBox.appendChild($create.elem('p', `Инструменты: ${game.tools}`))
	}

	if (game.dependencies && game.dependencies != '') {
		gameInfoBox.appendChild($create.elem('p', `Зависимости: ${game.dependencies}`))
	}

	if (game.note && game.note != '') {
		gameInfoBox.appendChild($create.elem('p', `Примечание: ${game.note}`))
	}

	let gameInfoStatusName = ''

	switch (game.status) {
		case 'win': case '1':
			gameInfoStatusName = 'Победитель'; break
		case '2': case '3':
		case '4': // ???
			gameInfoStatusName = `${game.status} место`; break
		case 'final':
			gameInfoStatusName = 'Финалист'; break
		case 'demo':
			gameInfoStatusName = 'Демоверсия'; break
		case 'updated':
			gameInfoStatusName = 'Обновлённая версия'; break
		case 'disqualified':
			gameInfoStatusName = 'Дисквалификация'; break
		default:
			console.info(`Неизвестный статус ${game.status} у ${game.name}`)
	}

	/* @TODO дождаться, когда в пак иконок введут кубок, и заменить им звёздочку */

	let gameInfoStatus = $create.elem('div', $create.db.icon((game.status != 'disqualified') ? 'star' : 'close'), `_game__info--status _status _status--${(game.status && game.status != '') ? game.status : 'empty'}`)
	gameInfoStatus.firstChild.setAttribute('title', gameInfoStatusName)

	gameInfoBox.appendChild(gameInfoStatus)

	gameBox.appendChild(gameInfoBox)

	return gameBox
}

$create.db = {
	icon: icon => `<i class="material-icons">${icon}</i>`,
	textBlocks: text => `<span class="_tb">${text.replace(/\n/g, '</span><span class="_tb">')}</span>`,
	time: timestamp => {
		let formatter = new Intl.DateTimeFormat('ru', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric'
		})

		return formatter.format(new Date(timestamp * 1000))
	}
}

let getCompData = file => {
	if (!file) { file = 'twg' }

	let CDN = {
		data: 'https://raw.githubusercontent.com/twoweeks/db/master/json/min',
		imgs: 'https://gd-imgs.cojam.ru'
	}

	let
		compsListContainer = $make.qs('.comps-list'),
		compsContainer = $make.qs('.comps')

	let selectComp = comp => {
		let elems = [
			...$make.qsf('button.btn__comp', compsListContainer, ['a']),
			...$make.qsf('.comp', compsContainer, ['a'])
		]

		elems.forEach(elem => {
			let elemData = elem.dataset

			if ('selected' in elemData) {
				delete elemData.selected
			}

			/* @TODO fix this pls */

			if ('edition' in comp) {
				if (elemData.num == comp.num && elemData.edition == comp.edition) {
					elemData.selected = ''
				}
			} else {
				if (elemData.num == comp.num) {
					elemData.selected = ''
				}
			}
		})
	}

	fetch(`${CDN.data}/${file}.json`).then(response => {
		if (response.ok) {
			compsListContainer.textContent = ''
			compsContainer.textContent = ''
			return response.json()
		} else { throw 42 }
	}).then(result => {
		let compsList = $create.elem('ul')

		result.forEach((comp, i) => {
			let
				compsListItem =        $create.elem('li'),
				compsListItemButton =  $create.elem('button', '', 'btn btn__comp')

			compsListItemButton.appendChild($create.elem('span', `Конкурс №${comp.meta.num}`))

			let isCompHaveEdition = (comp.meta.edition && comp.meta.edition != '') ? true : false

			compsListItem.appendChild(compsListItemButton)
			compsList.appendChild(compsListItem)

			let compBox = $create.elem('div', '', 'comp')

			compBox.dataset.num = comp.meta.num
			compsListItemButton.dataset.num = comp.meta.num

			let
				compBoxHeader =  $create.elem('div', '', 'comp__header'),
				compBoxGames =   $create.elem('div', '', 'comp__games')

			let compBoxHeaderTitle = $create.elem('h2', `<span>Конкурс №${comp.meta.num}</span>`, 'comp__header--title')

			if (comp.site && comp.site != '') {
				let compSiteLink = $create.link(comp.site, $create.db.icon('home'), '', ['e'])
				compSiteLink.setAttribute('title', 'Сайт конкурса')
				compBoxHeaderTitle.appendChild(compSiteLink)
			}

			if (isCompHaveEdition) {
				let compEdition = $create.elem('small', `${comp.meta.edition} Edition`)
				compBoxHeaderTitle.appendChild(compEdition)
			}

			compBoxHeader.appendChild(compBoxHeaderTitle)

			if (comp.themes && comp.themes.length != 0) {
				let compBoxHeaderThemes = $create.elem('ul', '', 'comp__header--themes')

				comp.themes.forEach(theme => {
					let themesListItem = $create.elem('li')

					themesListItem.appendChild($create.elem('p', `${$create.db.icon('label')}<span>${theme.name}</span>`, '_middle'))

					if (theme.description) {
						themesListItem.appendChild($create.elem('p', $create.db.textBlocks(theme.description)))
					}

					compBoxHeaderThemes.appendChild(themesListItem)
				})

				compBoxHeader.appendChild(compBoxHeaderThemes)
			}

			if (comp.note && comp.note != '') {
				let compBoxHeaderNote = $create.elem('div', $create.elem('p', `Примечание: ${$create.db.textBlocks(comp.note)}`, '', ['html']), 'comp__header--note')

				compBoxHeader.appendChild(compBoxHeaderNote)
			}

			if (comp.achievements && comp.achievements != '') {
				let
					compBoxAhievements = $create.elem('details', '', 'comp__header--ach'),
					compBoxAchList = $create.elem('ul')

				compBoxAhievements.appendChild($create.elem('summary', '', 'btn btn--nfw'))

				comp.achievements.forEach(ach => {
					let achListItem = $create.elem('li')

					achListItem.appendChild($create.elem('p', `${$create.db.icon('place')}<span>${ach.name}</span>`, 'comp__header--ach _middle'))

					if (ach.description && ach.description != '') {
						achListItem.appendChild($create.elem('p', $create.db.textBlocks(`<b>Описание</b>: ${ach.description}`), 'comp__header--ach'))
					}

					if (ach.gift && ach.gift != '') {
						achListItem.appendChild($create.elem('p', $create.db.textBlocks(`<b>Приз</b>: ${ach.description}`)))
					}

					if (ach.win && ach.win != '') {
						achListItem.appendChild($create.elem('p', $create.db.textBlocks(`<b>Победитель</b>: ${ach.description}`)))
					}

					compBoxAchList.appendChild(achListItem)
				})

				compBoxAhievements.appendChild(compBoxAchList)
				compBoxHeader.appendChild(compBoxAhievements)
			}

			if (comp.fund && comp.fund != '') {
				let compBoxHeaderFund = $create.elem('div', $create.elem('p', `Призовой фонд: ${comp.fund}`, '', ['html']), 'comp__header--fund')

				compBoxHeader.appendChild(compBoxHeaderFund)
			}

			if (comp.dates) {
				let compBoxHeaderDates = $create.elem('div', '', 'comp__header--dates')

				if (comp.dates.start) { compBoxHeaderDates.appendChild($create.elem('p', `Начало конкурса: ${$create.db.time(comp.dates.start)}`)) }
				if (comp.dates.end) { compBoxHeaderDates.appendChild($create.elem('p', `Конец конкурса: ${$create.db.time(comp.dates.end)}`)) }

				compBoxHeader.appendChild(compBoxHeaderDates)
			}

			compBox.appendChild(compBoxHeader)

			if (comp.games && comp.games.length != 0) {
				comp.games.forEach((game, i) => {
					if (game.status == 'disqualified') {
						delete comp.games[i]
						comp.games.push(game)
					}
				})

				comp.games.forEach(game => {
					let gameBox = parseGame({ game: game, CDN: CDN })
					compBoxGames.appendChild(gameBox)
				})
			}

			compBox.appendChild(compBoxGames)

			compsContainer.appendChild(compBox)

			let compData = { num: comp.meta.num }

			if (isCompHaveEdition) {
				compsListItemButton.dataset.edition = comp.meta.edition
				compBox.dataset.edition = comp.meta.edition

				compData.edition = comp.meta.edition

				let compsListItemEdtitonElem = $create.elem('p', `${comp.meta.edition} Edition`, 'btn__comp--edition')

				compsListItemButton.appendChild(compsListItemEdtitonElem)
			}

			if (i == 0) {
				sessionStorage.setItem('db_firstCompInFile', JSON.stringify(compData))
			}

			compsListItemButton.addEventListener('click', e => {
				selectComp(compData)
			})
		})

		compsListContainer.appendChild(compsList)

		selectComp(JSON.parse(sessionStorage.getItem('db_firstCompInFile')))
	}).catch(e => { console.log(e) })
}

document.addEventListener('DOMContentLoaded', () => {
	parseLocalComps([
		{ name: 'Two Weeks Game', file: 'twg' },
		{ name: 'Two-Two Weeks Game', file: 'ttwg' },
		{ name: 'One Week Game', altNames: ['Two/Two Weeks Game'], file: 'owg' },
		{ name: 'Three Days Game', file: 'three-dg' },
		{ name: 'Two Days Game', file: 'two-dg' }
	])

	let compFromURL = $check.get('get') || 'twg'
	getCompData(compFromURL)
})
