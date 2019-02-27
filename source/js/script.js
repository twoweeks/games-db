'use strict'

const storageRepoItem = {
	name:       '_db_repo',
	byDefault:  'twoweeks/db'
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

let parseLocalNames = comps => {
	let
		namesContainer =  $make.qs('.names'),
		namesList =       $create.elem('ul')

	comps.forEach(comp => {
		let
			nameListItem =  $create.elem('li'),
			nameButton =    $create.elem('button', comp.name, 'btn btn__name')

		nameButton.dataset.name = comp.file

		if (comp.altNames && comp.altNames.length != 0) {
			let altNamesList = $create.elem('ul', '', 'btn__name--alt-names-list')

			comp.altNames.forEach(name => {
				let altNamesListItem = $create.elem('li', name)
				altNamesList.appendChild(altNamesListItem)
			})

			nameButton.appendChild(altNamesList)
		}

		nameButton.addEventListener('click', e => {
			selectName({ name: comp.file })
		})

		nameListItem.appendChild(nameButton)
		namesList.appendChild(nameListItem)
	})

	namesContainer.appendChild(namesList)
}

let parseGame = gameObject => {
	if (!gameObject) { return }

	let game = gameObject

	let gameBox = $create.elem('div', '', 'comp_games--game _game')

	let parseGameLinks = linksObject => {
		let linksElem = $create.elem('table', '', '_game__info--links')

		linksElem.appendChild($create.elem('caption', 'Ссылки:'))

		let linksArray = []

		let prepareLinksArray = _linksObject => {
			let tmpArray = []

			let pushToArray = _obj => tmpArray.push(_obj)

			let linkKeys = ['site', 'store', 'source', 'updated', 'final', 'dlc', 'demo_updated', 'demo', 'ost']

			for (let key of linkKeys) {
				if (key in _linksObject) {
					pushToArray({ type: key, content: _linksObject[key] })
				}
			}

			return tmpArray
		}

		linksArray = prepareLinksArray(linksObject)

		linksArray.forEach(link => {
			let tableRow = $create.elem('tr')

			let addToRow = (content, type) => {
				if (!type) { type = 'html' }

				tableRow.innerHTML = (type == 'html')
					? content
					: content()
			}

			let parseLinkContent = (content, type) => {
				if (!type) { type = 'standart' }

				let linksContentList = $create.elem('ul')

				let addLinkToContent = (link, text, _class) => linksContentList.appendChild($create.elem('li', $create.link(link, text, _class, ['e', 'html'])))

				switch (type) {
					case 'store':
						if ('steam' in content) {
							addLinkToContent(`https://store.steampowered.com/app/${content.steam}`, 'Steam')
						}

						if ('gplay' in content) {
							addLinkToContent(`https://play.google.com/store/apps/details?id=${content.gplay}`, 'Google Play')
						}

						if ('itunes' in content) {
							addLinkToContent(`https://itunes.apple.com/app/id${content.itunes}`, 'App Store')
						}

						if ('itch' in content) {
							addLinkToContent(`https://${content.itch.user}.itch.io/${content.itch.game}`, 'itch.io')
						}

						if ('gamejolt' in content) {
							addLinkToContent(`https://gamejolt.com/games/${content.gamejolt}`, 'Game Jolt')
						}

						break

					case 'standart':
						if ('yadisk' in content) {
							addLinkToContent(`https://yadi.sk/d/${content.yadisk}`, 'Яндекс.Диск')
						}

						if ('gdrive' in content) {
							addLinkToContent(`https://drive.google.com/open?id=${content.gdrive}`, 'Google Drive')
						}

						if ('web' in content) {
							addLinkToContent(content.web, 'Онлайн-версия')
						}

						break

					case 'source':
						if ('repo' in content) {
							if ('github' in content.repo) {
								addLinkToContent(`https://github.com/${content.repo.github}`, 'GitHub')
							}

							if ('bitbucket' in content.repo) {
								addLinkToContent(`https://bitbucket.com/${content.repo.bitbucket}`, 'BitBucket')
							}
						}
						if ('link' in content) {
							addLinkToContent(content.link, 'Ссылка')
						}
						break

					case 'ost':
						if ('soundcloud' in content) {
							addLinkToContent(`https://soundcloud.com/${content.soundcloud}`, 'SoundCloud')
						}

						break
				}

				return linksContentList.outerHTML
			}

			switch (link.type) {
				case 'site':
					addToRow(`<td>Сайт игры:</td><td>${$create.link(linksObject[link.type], linksObject[link.type].replace(/^(https?):\/\//, ''), '', ['e', 'html'])}</td>`); break

				case 'store':
					addToRow(`<td>Магазины</td><td>${parseLinkContent(link.content, link.type)}</td>`); break

				case 'updated':
					addToRow(`<td>Обновлённая финальная версия</td><td>${parseLinkContent(link.content)}</td>`); break

				case 'final':
					addToRow(`<td>Финальная версия</td><td>${parseLinkContent(link.content)}</td>`); break

				case 'dlc':
					addToRow(`<td>DLC</td><td>${parseLinkContent(link.content)}</td>`); break

				case 'demo_updated':
					addToRow(`<td>Обновлённая демоверсия</td><td>${parseLinkContent(link.content)}</td>`); break

				case 'demo':
					addToRow(`<td>Демоверсия</td><td>${parseLinkContent(link.content)}</td>`); break

				case 'source':
					addToRow(`<td>Исходный код</td><td>${parseLinkContent(link.content, link.type)}</td>`); break

				case 'ost':
					addToRow(`<td>Саундтрек</td><td>${parseLinkContent(link.content, link.type)}</td>`); break
			}

			linksElem.appendChild(tableRow)
		})

		return linksElem
	}

	if ('image' in game && game.image != '') {
		let
			gameImageBox =       $create.elem('picture', '', '_game__image'),
			gameImage =          $create.elem('img')

		gameImage.dataset.src = game.image

		gameImage.addEventListener('error', e => {
			gameBox.classList.add('_game--no-image')
			gameImageBox.remove()
			console.warn(`Ошибка загрузки картинки у игры "${game.name}".`)
		})

		gameImageBox.appendChild(gameImage)
		gameBox.appendChild(gameImageBox)
	} else {
		gameBox.classList.add('_game--no-image')
	}

	let gameInfoBox = $create.elem('div', '', '_game__info')

	let getGameStatusName = status => {
		let _status = 'Неизвестный статус'

		switch (status) {
			case 'win': case '1':
				_status = 'Победитель'; break
			case '2': case '3':
			case '4': // ???
				_status = `${game.status} место`; break
			case 'final':
				_status = 'Финалист'; break
			case 'demo':
				_status = 'Демоверсия'; break
			case 'updated':
				_status = 'Обновлённая версия'; break
			case 'disqualified':
				_status = 'Дисквалификация'; break
		}

		return _status
	}

	let gameInfoStatusName = getGameStatusName(game.status)

	if ('status' in game && game.status != '') {
		/* TODO: дождаться, когда в пак иконок введут кубок (github.com/google/material-design-icons/issues/136), и заменить звёздочку им */

		let gameInfoStatus = $create.elem(
			'div',
			$create.db.icon(
				(game.status != 'disqualified') ? 'star' : 'close'
			),
			`_game__info--status _status _status--${(game.status && game.status != '') ? game.status : 'empty'}`
		)

		gameInfoStatus.firstChild.setAttribute('title', gameInfoStatusName)

		gameInfoBox.appendChild(gameInfoStatus)
	} else {
		console.warn(`${gameInfoStatusName} у ${game.name}`)
	}

	let gameInfoName = $create.elem('h2', $create.db.icon('videogame_asset'), '_game__info--name _middle')

	gameInfoName.appendChild($create.elem('span', ('name' in game && game.name != '') ? game.name : 'Названия нет'))

	gameInfoBox.appendChild(gameInfoName)

	if ('genre' in game && game.genre != '') {
		gameInfoBox.appendChild($create.elem('p', `Жанр: ${game.genre}`))
	}

	gameInfoBox.appendChild($create.elem('div', game.description ? $create.db.textBlocks(game.description) : 'Описания нет.', '_game__info--description'))

	if ('tools' in game && game.tools != '') {
		gameInfoBox.appendChild($create.elem('p', `Инструменты: ${game.tools}`))
	}

	if ('dependencies' in game && game.dependencies != '') {
		gameInfoBox.appendChild($create.elem('p', `Зависимости: ${game.dependencies}`))
	}

	if ('note' in game && game.note != '') {
		gameInfoBox.appendChild($create.elem('p', `Примечание: ${game.note}`))
	}

	if ('links' in game && Object.keys(game.links) != 0) {
		let gameInfoLinks = parseGameLinks(game.links)
		gameInfoBox.appendChild(gameInfoLinks)
	}

	if ('repeat' in game && game.repeat != '') {
		let gameRepeatStatusName = getGameStatusName(game.repeat)

		gameInfoBox.appendChild(
			$create.elem('p',
			`<i>P.S. Эта игра также была отправлена в параллельно проходящий конкурс как ${gameRepeatStatusName}.</i>`,
			'_game__info--repeat'
			)
		)
	}

	gameBox.appendChild(gameInfoBox)

	return gameBox
}

let getCompData = options => {
	let file = ('file' in options && options.file != '')
		? options.file
		: 'twg'

	let repo = ('repo' in options && options.repo != '')
		? options.repo
		: storageRepoItem.byDefault

	let CDN = {
		data: `https://raw.githubusercontent.com/${repo}/master/json/min`,
		imgs: 'https://gd-cdn.blyat.science'
	}

	let
		compsListContainer = $make.qs('.comps-list'),
		compsContainer = $make.qs('.comps')

	let selectComp = comp => {
		let elems = [
			...$make.qsf('.btn__comp', compsListContainer, ['a']),
			...$make.qsf('.comp', compsContainer, ['a'])
		]

		if (!('edition' in comp)) {
			comp.edition = '_none'
		}

		let _trigger = false

		elems.forEach(elem => {
			let elemData = elem.dataset

			if ('selected' in elemData) {
				delete elemData.selected
			}

			if (elemData.num == comp.num && elemData.edition == comp.edition) {
				elemData.selected = ''
				_trigger = true

				let editonString = (comp.edition != '_none')
					? `&edition=${comp.edition}`
					: ''

				history.pushState('', document.title, `${window.location.pathname}?get=${file}&comp=${comp.num}${editonString}`)

				if (elem.classList.contains('btn')) {
					elem.scrollIntoView({
						inline: 'center',
						block: 'center',
						behavior: 'smooth'
					})
				}

				if (elem.classList.contains('comp')) {
					let compImages = $make.qsf('._game__image > img', elem, ['a'])

					compImages.forEach(image => {
						let imageData = image.dataset

						if ('src' in imageData && imageData.src != '') {
							image.setAttribute('src', `${CDN.imgs}/${imageData.src}`)
							delete imageData.src
						}
					})
				}
			}
		})

		if (!_trigger) {
			throw `Запрошенного конкурса ${file} под номером ${comp.num} (${comp.edition == '_none' ? 'без Edition' : `${comp.edition} Edition`}) нет в базе данных.`
		}
	}

	fetch(`${CDN.data}/${file}.json`).then(response => {
		if (response.ok) {
			compsListContainer.textContent = ''
			compsContainer.textContent = ''
			return response.json()
		} else { throw `Запрошенного конкурса "${file}" нет в базе данных.` }
	}).then(result => {
		let compsList = $create.elem('ul')

		result.forEach((comp, i) => {
			let
				compsListItem =        $create.elem('li'),
				compsListItemButton =  $create.elem('button', '', 'btn btn__comp')

			compsListItemButton.appendChild($create.elem('span', `Конкурс №${comp.meta.num}`))

			let isCompHaveEdition = ('edition' in comp.meta && comp.meta.edition != '') ? true : false

			compsListItem.appendChild(compsListItemButton)
			compsList.appendChild(compsListItem)

			let compBox = $create.elem('div', '', 'comp')

			compBox.dataset.num = comp.meta.num
			compsListItemButton.dataset.num = comp.meta.num

			let
				compBoxHeader =  $create.elem('div', '', 'comp__header'),
				compBoxGames =   $create.elem('div', '', 'comp__games')

			let compBoxHeaderTitle = $create.elem('h2', `<span>Конкурс №${comp.meta.num}</span>`, 'comp__header--title')

			if ('site' in comp && comp.site != '') {
				let compSiteLink = $create.link(comp.site, $create.db.icon('home'), '', ['e'])
				compSiteLink.setAttribute('title', 'Сайт конкурса')
				compBoxHeaderTitle.appendChild(compSiteLink)
			}

			if (isCompHaveEdition) {
				let compEdition = $create.elem('small', `${comp.meta.edition} Edition`)
				compBoxHeaderTitle.appendChild(compEdition)
			}

			compBoxHeader.appendChild(compBoxHeaderTitle)

			if ('themes' in comp && comp.themes.length != 0) {
				let compBoxHeaderThemes = $create.elem('ul', '', 'comp__header--themes')

				comp.themes.forEach(theme => {
					let themesListItem = $create.elem('li')

					themesListItem.appendChild($create.elem('p', `${$create.db.icon('label')}<span>${theme.name}</span>`, '_middle'))

					if ('description' in theme && theme.description != '') {
						themesListItem.appendChild($create.elem('p', $create.db.textBlocks(theme.description)))
					}

					compBoxHeaderThemes.appendChild(themesListItem)
				})

				compBoxHeader.appendChild(compBoxHeaderThemes)
			}

			if ('note' in comp && comp.note != '') {
				let compBoxHeaderNote = $create.elem('div', $create.elem('p', $create.db.textBlocks(`Примечание: ${comp.note}`), '', ['html']), 'comp__header--note')

				compBoxHeader.appendChild(compBoxHeaderNote)
			}

			if ('achievements' in comp && comp.achievements != '') {
				let
					compBoxAhievements = $create.elem('details', '', 'comp__header--ach'),
					compBoxAchList = $create.elem('ul')

				compBoxAhievements.appendChild($create.elem('summary', '', 'btn btn--nfw'))

				comp.achievements.forEach(ach => {
					let achListItem = $create.elem('li')

					achListItem.appendChild($create.elem('p', `${$create.db.icon('place')}<span>${ach.name}</span>`, 'comp__header--ach _middle'))

					if ('description' in ach && ach.description != '') {
						achListItem.appendChild($create.elem('p', $create.db.textBlocks(`<b>Описание</b>: ${ach.description}`), 'comp__header--ach'))
					}

					if ('gift' in ach && ach.gift != '') {
						achListItem.appendChild($create.elem('p', $create.db.textBlocks(`<b>Приз</b>: ${ach.gift}`)))
					}

					if ('winner' in ach && ach.winner != '') {
						achListItem.appendChild($create.elem('p', $create.db.textBlocks(`<b>Победитель</b>: ${ach.winner}`)))
					}

					compBoxAchList.appendChild(achListItem)
				})

				compBoxAhievements.appendChild(compBoxAchList)
				compBoxHeader.appendChild(compBoxAhievements)
			}

			if ('fund' in comp && comp.fund != '') {
				let compBoxHeaderFund = $create.elem('div', $create.elem('p', `Призовой фонд: ${comp.fund}`, '', ['html']), 'comp__header--fund')

				compBoxHeader.appendChild(compBoxHeaderFund)
			}

			if ('dates' in comp) {
				let compBoxHeaderDates = $create.elem('div', '', 'comp__header--dates')

				if ('start' in comp.dates) {
					compBoxHeaderDates.appendChild($create.elem('p', `Начало конкурса: ${$create.db.time(comp.dates.start)}`))
				}

				if ('end' in comp.dates) {
					compBoxHeaderDates.appendChild($create.elem('p', `Конец конкурса: ${$create.db.time(comp.dates.end)}`))
				}

				compBoxHeader.appendChild(compBoxHeaderDates)
			}

			compBox.appendChild(compBoxHeader)

			if ('games' in comp && comp.games.length != 0) {
				comp.games.forEach((game, i) => {
					if (game.status == 'disqualified') {
						delete comp.games[i]
						comp.games.push(game)
					}
				})

				comp.games.forEach(game => {
					let gameBox = parseGame(game)
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
			} else {
				compsListItemButton.dataset.edition = '_none'
				compBox.dataset.edition = '_none'

				compData.edition = '_none'
			}

			if (i == 0) {
				sessionStorage.setItem('db_firstCompInFile', JSON.stringify(compData))
			}

			compsListItemButton.addEventListener('click', e => {
				selectComp(compData)
			})
		})

		compsListContainer.appendChild(compsList)

		let neededComp = JSON.parse(sessionStorage.getItem('db_firstCompInFile'))

		let compFromURL = JSON.parse(sessionStorage.getItem('db_compFromURL'))

		if (compFromURL && Object.keys(compFromURL).includes('num')) {
			neededComp = compFromURL
			sessionStorage.removeItem('db_compFromURL')
		}

		selectComp(neededComp)
	}).catch(e => { alert(e) })
}

let selectName = options => {
	let name = ('name' in options && options.name != '')
		? options.name
		: 'twg'

	let repo = ('repo' in options && options.repo != '')
		? options.repo
		: $ls.get(storageRepoItem.name)

	let
		nameList = $make.qs('.names'),
		nameListBtns = $make.qsf('.btn__name', nameList, ['a'])

	let nameListData = nameList.dataset

	if (nameListData.selected == name) {
		return
	} else {
		getCompData({
			file: name,
			repo: repo
		})
	}

	nameListBtns.forEach(btn => {
		let btnData = btn.dataset

		if (nameListData.selected == name) {
			return
		}

		if ('selected' in btnData) {
			delete btnData.selected
		}

		if (btnData.name == name) {
			btn.scrollIntoView({
				inline: 'center',
				block: 'center',
				behavior: 'smooth'
			})
			btnData.selected = ''
		}
	})

	nameListData.selected = name
}

document.addEventListener('DOMContentLoaded', () => {
	let
		documentBody = document.body,
		containerBox = $make.qs('.container')

	documentBody.classList.remove('no-js')
	containerBox.innerHTML = ''

	new Array('names', 'comps-list', 'comps').forEach(_class => {
		containerBox.appendChild($create.elem('div', '', _class))
	})

	documentBody.insertBefore(containerBox, documentBody.firstChild)

	parseLocalNames([
		{ name: 'Two Weeks Game', file: 'twg' },
		{ name: 'Two-Two Weeks Game', file: 'ttwg' },
		{ name: 'One Week Game', altNames: ['Two/Two Weeks Game'], file: 'owg' },
		{ name: 'Three Days Game', file: 'three-dg' },
		{ name: 'Two Days Game', file: 'two-dg' },
		{ name: 'RUVN Contest', file: 'ruvn-contest' }
	])

	if (!$ls.get(storageRepoItem.name)) {
		$ls.set(storageRepoItem.name, storageRepoItem.byDefault)
	}

	let compFromURL = {}

	switch ($check.get('comp')) {
		case null:
		case true:
		case '':
			break
		default:
			compFromURL.num = $check.get('comp'); break
	}

	switch ($check.get('edition')) {
		case null:
		case true:
		case '':
		case '_none':
			break
		default:
			compFromURL.edition = $check.get('edition'); break
	}

	sessionStorage.setItem('db_compFromURL', JSON.stringify(compFromURL))

	let nameFromURL = ''

	switch ($check.get('get')) {
		case null:
		case true:
		case '':
			nameFromURL = 'twg'; break
		default:
			nameFromURL = $check.get('get')
	}

	selectName({
		name: nameFromURL,
		repo: $ls.get(storageRepoItem.name)
	})
})
