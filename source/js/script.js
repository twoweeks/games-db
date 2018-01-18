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

		gameImage.dataset.src = `${CDN.imgs}/${game.image}`
		//gameImage.setAttribute('src', `${CDN.imgs}/${game.image}`)

		//gameImageBoxСrutch.appendChild(gameImage)
		gameImageBox.appendChild(gameImage)
		gameBox.appendChild(gameImageBox)
	} else {
		gameBox.classList.add('_game--no-image')
	}

	let gameInfoBox = $create.elem('div', '', '_game__info')

	gameBox.appendChild(gameInfoBox)

	return gameBox
}

$create.db = {
	icon: icon => `<i class="material-icons">${icon}</i>`,
	textBlocks: text => `<span>${text.replace(/\n/g, '</span><span>')}</span>`,
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
		compsContainer = $make.qs('.comps-list'),
		gamesContainer = $make.qs('.comps')

	fetch(`${CDN.data}/${file}.json`).then(response => {
		if (response.ok) {
			compsContainer.textContent = ''
			gamesContainer.textContent = ''
			return response.json()
		} else { throw 42 }
	}).then(result => {
		let compsList = $create.elem('ul')

		result.forEach(comp => {
			let
				compsListItem =        $create.elem('li'),
				compsListItemButton =  $create.elem('button', `Конкурс №${comp.meta.num}`, 'btn btn__comp')

			let isCompHaveEdition = (comp.meta.edition && comp.meta.edition != '') ? true : false

			compsListItem.appendChild(compsListItemButton)
			compsList.appendChild(compsListItem)

			let compBox = $create.elem('div', '', 'comp')

			compBox.dataset.num = comp.meta.num

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

					themesListItem.appendChild($create.elem('p', `${$create.db.icon('label')} <span>${theme.name}</span>`))
					if (theme.description) { themesListItem.appendChild($create.elem('p', $create.db.textBlocks(theme.description))) }

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
					compBoxAhievements = $create.elem('details', '<summary class="btn btn--nfw"></summary>', 'comp__header--ach'),
					compBoxAchList = $create.elem('ul')

				comp.achievements.forEach(ach => {
					let achListItem = $create.elem('li')

					achListItem.appendChild($create.elem('p', `${$create.db.icon('star')} <span>${ach.name}</span>`))
					if (ach.description) { achListItem.appendChild($create.elem('p', $create.db.textBlocks(ach.description))) }

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
					if (game.status == 'disqualified' && i + 2 < comp.games.length) {
						comp.games.push(game); return
					}

					let gameBox = parseGame({ game: game, CDN: CDN })
					compBoxGames.appendChild(gameBox)
				})
			}

			compBox.appendChild(compBoxGames)

			gamesContainer.appendChild(compBox)

			if (isCompHaveEdition) {
				compBox.dataset.edition = comp.meta.edition

				let compsListItemEdtitonElem = $create.elem('p', `${comp.meta.edition} Edition`, 'btn__comp--edition')

				compsListItemButton.appendChild(compsListItemEdtitonElem)
			}

			compsListItemButton.addEventListener('click', e => {
				$make.qs(`.comps .comp[data-num='${comp.meta.num}']${isCompHaveEdition ? '[data-edition=' + comp.meta.edition + ']' : ''}`).scrollIntoView({
					behavior: 'smooth',
					block: 'start',
					inline: 'start'
				})
			})
		})

		compsContainer.appendChild(compsList)

		new LazyLoad({ elements_selector: '._game__image img' })
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
