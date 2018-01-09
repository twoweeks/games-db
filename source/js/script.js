'use strict'

let localCompsData = [
	{ name: 'Two Weeks Game', file: 'twg' },
	{ name: 'Two-Two Weeks Game', file: 'ttwg' },
	{ name: 'One Week Game', altNames: ['Two/Two Weeks Game'], file: 'owg' },
	{ name: 'Three Days Game', file: 'three-dg' },
	{ name: 'Two Days Game', file: 'two-dg' }
]

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

let getCompData = file => {
	let CDN = {
		data: 'https://raw.githubusercontent.com/twoweeks/db/master/json/min',
		imgs: 'https://gd-imgs.cojam.ru'
	}

	let
		compsContainer = $make.qs('.comps'),
		gamesContainer = $make.qs('.games')

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

			if (comp.meta.edition && comp.meta.edition != '') {
				let compsListItemEdtitonElem = $create.elem('p', `${comp.meta.edition} Edition`, 'btn__comp--edition')

				compsListItemButton.appendChild(compsListItemEdtitonElem)
			}

			compsListItem.appendChild(compsListItemButton)
			compsList.appendChild(compsListItem)

			let gamesBox = $create.elem('div')

			let
				gamesBoxHeader =  $create.elem('div'),
				gamesBoxMain =    $create.elem('div')

			let gamesBoxHeaderH = $create.elem('h2', `Конкурс №${comp.meta.num}`)

			gamesBoxHeader.appendChild(gamesBoxHeaderH)

			gamesBox.appendChild(gamesBoxHeader)

			gamesBox.appendChild(gamesBoxMain)

			gamesContainer.appendChild(gamesBox)
		})

		compsContainer.appendChild(compsList)
	}).catch(e => { console.log(e) })
}

document.addEventListener('DOMContentLoaded', () => {
	parseLocalComps(localCompsData)

	let compFromURL = $check.get('get')
	getCompData(
		compFromURL && compFromURL != ''
		? compFromURL
		: 'twg'
	)
})
