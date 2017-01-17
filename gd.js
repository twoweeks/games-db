function postlinks(el, obj, addtext) {
	if(!obj) return;
	addtext = $(addtext).addClass('fa-space');
	if(obj.yadisk) el.append('<a href="https://yadi.sk/d/'+obj.yadisk+'" target="_blank" class="mui-btn mui-btn--raised dl-link"></a>');
	if(obj.gdrive) el.append('<a href="https://docs.google.com/uc?id='+obj.gdrive+'&export=download" target="_blank" class="mui-btn mui-btn--raised dl-link"></a>');
	if(obj.web) el.append('<a href="'+obj.web+'" target="_blank" class="mui-btn mui-btn--raised"><i class="fa fa-share fa-2x download-icon"/></a>');
	if(obj.github) el.append('<a href="https://github.com/'+obj.github+'" target="_blank" class="mui-btn mui-btn--raised"><i class="fa fa-github fa-2x download-icon"/></a>');
	if(obj.gplay) el.append('<a href="https://play.google.com/store/apps/details?id='+obj.gplay+'" target="_blank" class="mui-btn mui-btn--raised"><i class="fa fa-google fa-2x download-icon"/></a>');
	if(obj.itunes) el.append('<a href="itunes.apple.com/app/id'+obj.itunes+'" target="_blank" class="mui-btn mui-btn--raised"><i class="fa fa-apple fa-2x download-icon"/></a>');
	if(obj.yadisk || obj.gdrive || obj.web || obj.github || obj.gplay || obj.itunes) el.append(addtext);
}
moment.locale('ru');
getComps('twg.json');
function getComps(comp){
	$.getJSON('https://cdn.rawgit.com/twoweeks/db/master/'+comp, function(result){
		$('#sidedrawer ul').eq(0).html('');
		$('.comps-container').html('');
		var reskeys = Object.keys(result);
		var b = $('#sidedrawer ul').eq(0);
		for(var i = 0; i<reskeys.length; i++){
			var res = Object.create(result[reskeys[i]]);
			if(res.coalition){
				reskeys[i] += '-1';
				reskeys.splice(i+1, 0, i+1+'-2');
				result[reskeys[i+1]] = res.glowstick;
				result[reskeys[i]] = res.coalition;
				result[reskeys[i]].note = res.note;
			}
			var name = 'Конкурс №'+reskeys[i];
			b.append('<li><a class="mui-btn mui-btn--raised" href="#comp'+reskeys[i]+'">'+name+'</a></li>');
		}
		b = $('.comps-container');
		for(var i = 0; i<reskeys.length; i++){
			var twg = result[reskeys[i]];
			b.append('<h1 id="comp'+reskeys[i]+'" class="comp-number">Конкурс №'+reskeys[i]+'</h1>');
			var compEl = $('<div class="mui-panel comp-header"></div>').appendTo(b);;
			if(twg.themes){
				for(var j = 0; j<twg.themes.same.length; j++){
					compEl.append('<h1><i class="fa fa-tag" aria-hidden="true"></i> '+twg.themes.same[j]+'</h1>');
					if(twg.themes.descriptions) compEl.append(twg.themes.descriptions[j] == '' ? '<p>Описания нет.</p>' : '<p class="game-text">'+twg.themes.descriptions[j]+'</p>');
				}
			} else compEl.append('<h1><i class="fa fa-tag" aria-hidden="true"></i> '+twg.theme+'</h1>');
			compEl.append(twg.description+'<br>');
			if(twg.achievements){
				var achievements = $('<details><summary class="mui-btn mui-btn--raised">Ачивки</summary></details>').appendTo(compEl);
				achievements = $('<div class="mui--z1 game-achievements"></div>').appendTo(achievements);
				for(var j = 0; j<twg.achievements.same.length; j++){
					achievements.append('<h4><i class="fa fa-star" aria-hidden="true"></i> '+twg.achievements.same[j]+'</h4>');
					if(twg.achievements.descriptions) achievements.append(twg.achievements.descriptions[j] == '' ? '<p>Описания нет</p>' : '<p class="game-text">'+twg.achievements.descriptions[j]+'</p>');
				}
			}
			if(twg.note) compEl.append('<pre>Примечание: '+twg.note+'</pre><br>');
			compEl.append('<pre>Начало конкурса: '+new moment(twg.start, 'X').format('LLL')+'<br>Конец конкурса: '+new moment(twg.end, 'X').format('LLL')+'</pre><br>');
			postlinks(compEl, twg.archive);
			b.append('<div class="mui--z1 comp-games"></div>');
			for(var j = 0; j<twg.games.length; j++){
				var game = twg.games[j];
				if(game.status == 'disqualified' && j+2<twg.games.length){
					twg.games.push(game);
					continue;
				}
				var gameEl = $('<div class="mui-panel"></div>').appendTo(b.children().last());
				var gameBodyEl = $('<div class="game-body"></div>');
				if(game.image) gameEl.append('<img src="https://113217.selcdn.ru/gd/'+game.image+'" class="game-img" onerror="$(this).next().addClass(\'game-body-full\'); $(this).remove();" onclick="window.open(this.src)">')
				else gameBodyEl.addClass('game-body-full');
				gameBodyEl.appendTo(gameEl);
				if(game.status != 'disqualified')gameBodyEl.append('<i class="fa fa-trophy fa-2x mui--pull-right game-status-'+game.status+'" aria-hidden="true"></i>');
				else gameBodyEl.append('<i class="fa fa-ban fa-2x mui--pull-right game-status-'+game.status+'" aria-hidden="true"></i>')
				gameBodyEl.append('<h2 class="game-header"><i class="fa fa-gamepad" aria-hidden="true"></i> '+game.name+'</h2>');
				if(game.genre) gameBodyEl.append('<br><pre class="game-text">Жанр: '+game.genre+'</pre>');
				gameBodyEl.append(game.description === undefined ? '<p>Описания нет.</p>' : '<p class="game-text">'+game.description+'</p>');
				if(game.note) gameBodyEl.append('<pre>Примечание: '+game.note+'</pre><br>');
				var downloads = $('<div class="game-downloads"></div>').appendTo(gameBodyEl);
				if(game.other_links){
					if(game.other_links.repo){
						postlinks(downloads, game.other_links.repo);
						downloads.append('<div class="mui-divider"></div>');
					}
					if(game.other_links.updated){
						postlinks(downloads, game.other_links.updated, '<i class="fa fa-check fa-2x" aria-hidden="true"></i><i class="fa fa-arrow-circle-up fa-2x" aria-hidden="true"/><br>');
						downloads.append('<div class="mui-divider"></div>');
					}
				}
				postlinks(downloads, game.links, '<i class="fa fa-check fa-2x" aria-hidden="true"></i><br>');
				if(game.other_links){
					if(game.other_links.final_multi){
						downloads.append('<div class="mui-divider"></div>');
						postlinks(downloads, game.other_links.final_multi.win, '<i class="fa fa-windows fa-2x" aria-hidden="true"></i><br>');
						postlinks(downloads, game.other_links.final_multi.win_x64, '<i class="fa fa-windows fa-2x" aria-hidden="true">64</i><br>');
						postlinks(downloads, game.other_links.final_multi.linux, '<i class="fa fa-linux fa-2x" aria-hidden="true"></i><br>');
						postlinks(downloads, game.other_links.final_multi.mac, '<i class="fa fa-apple fa-2x" aria-hidden="true"></i><i class="fa fa-desktop fa-2x" aria-hidden="true"></i><br>');
						postlinks(downloads, game.other_links.final_multi.android, '<i class="fa fa-android fa-2x" aria-hidden="true"></i><br>');
					}
					if(game.other_links.store){
						downloads.append('<div class="mui-divider"></div>');
						postlinks(downloads, game.other_links.store, '<i class="fa fa-mobile fa-2x"></i><br>');
					}
					if(game.other_links.demo_multi){
						downloads.append('<div class="mui-divider"></div>');
						postlinks(downloads, game.other_links.demo_multi.win, '<i class="fa fa-bug fa-2x" aria-hidden="true"></i><i class="fa fa-windows fa-2x" aria-hidden="true"></i><br>');
						postlinks(downloads, game.other_links.demo_multi.win_x64, '<i class="fa fa-bug fa-2x" aria-hidden="true"></i><i class="fa fa-windows fa-2x" aria-hidden="true">64</i><br>');
						postlinks(downloads, game.other_links.demo_multi.linux, '<i class="fa fa-bug fa-2x" aria-hidden="true"></i><i class="fa fa-linux fa-2x" aria-hidden="true"></i><br>');
						postlinks(downloads, game.other_links.demo_multi.mac, '<i class="fa fa-bug fa-2x" aria-hidden="true"></i><i class="fa fa-apple fa-2x" aria-hidden="true"></i><i class="fa fa-desktop fa-2x" aria-hidden="true"></i><br>');
						postlinks(downloads, game.other_links.demo_multi.android, '<i class="fa fa-bug fa-2x" aria-hidden="true"></i><i class="fa fa-android fa-2x" aria-hidden="true"></i><br>');
					}
					if(game.other_links.demo_updated){
						downloads.append('<div class="mui-divider"></div>');
						postlinks(downloads, game.other_links.demo_updated, '<i class="fa fa-bug fa-2x" aria-hidden="true"></i> <i class="fa fa-arrow-circle-up fa-2x" aria-hidden="true"/><br>');
					}
					if(game.other_links.demo){
						downloads.append('<div class="mui-divider"></div>');
						postlinks(downloads, game.other_links.demo, '<i class="fa fa-bug fa-2x" aria-hidden="true"></i><br>');
					}
				}
			}
		}
	});
}