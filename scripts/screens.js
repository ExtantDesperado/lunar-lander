(function(game) {

	const screenNames = {
		HOME_SCREEN: 'homeScreen',
		GAME_SCREEN: 'gameScreen',
		HIGH_SCORES_SCREEN: 'highScoresScreen',
		CONTROLS_SCREEN: 'controlsScreen',
		CREDITS_SCREEN: 'creditsScreen'
	};

	LunarLander.changeScreen = function(newScreen) {
		let active = document.getElementsByClassName('active');
		for (let screen = 0; screen < active.length; screen++) {
			active[screen].classList.remove('active');
		}
		LunarLander.screens[newScreen].run();
		document.getElementById(newScreen).classList.add('active');
	};

	LunarLander.screens[screenNames.HOME_SCREEN] = (function() {

		function initialize() {
			newGameButton = document.getElementById('newGameButton');
			newGameButton.onclick = function() {
				LunarLander.changeScreen(screenNames.GAME_SCREEN);
			}

			highScoresButton = document.getElementById('highScoresButton');
			highScoresButton.onclick = function() {
				LunarLander.changeScreen(screenNames.HIGH_SCORES_SCREEN);
			}

			controlsButton = document.getElementById('controlsButton');
			controlsButton.onclick = function() {
				LunarLander.changeScreen(screenNames.CONTROLS_SCREEN);
			}

			creditsButton = document.getElementById('creditsButton');
			creditsButton.onclick = function() {
				LunarLander.changeScreen(screenNames.CREDITS_SCREEN);
			}
		}

		function run() {

		}

		return {
			initialize: initialize,
			run: run
		}
	})();


	LunarLander.screens[screenNames.GAME_SCREEN] = (function() {

		function initialize() {
			document.getElementById('gameToHomeButton').onclick = () => {
				game.state = game.gameStates.QUIT;
				LunarLander.changeScreen(screenNames.HOME_SCREEN);
			};
		}

		function run() {
			game.startGame();
		}

		return {
			initialize: initialize,
			run: run
		}
	})();


	LunarLander.screens[screenNames.HIGH_SCORES_SCREEN] = (function() {

		function initialize() {
			document.getElementById('highScoresToHomeButton').onclick = () => {
				LunarLander.changeScreen(screenNames.HOME_SCREEN);
			};
		}

		function run() {
			let html = '';
			html += '<tr>'
			for (let j = 0; j < game.levels.length; j++) {
				html += '<th>Level ' + (j + 1) + '</th>';
			}
			html += '</tr>'

			for (let i = 0; i < 5; i++) {
				html += '<tr>';
				for (const level of game.levels) {
					if (i < level.highScores.length) {
						html += '<td>' + level.highScores[i].toFixed(2) + ' s</td>';
					} else {
						html += '<td>-</td>';
					}
				}
				html += '</tr>';

			}
			document.getElementById('highScoresTable').innerHTML = html;
		}

		return {
			initialize: initialize,
			run: run
		}
	})();


	LunarLander.screens[screenNames.CONTROLS_SCREEN] = (function() {

		function initialize() {
			game.initializeControls();
			document.getElementById('controlsToHomeButton').onclick = () => {
				LunarLander.changeScreen(screenNames.HOME_SCREEN);
			};
		}

		function run() {

		}

		return {
			initialize: initialize,
			run: run
		}
	})();


	LunarLander.screens[screenNames.CREDITS_SCREEN] = (function() {

		function initialize() {
			document.getElementById('creditsToHomeButton').onclick = () => {
				LunarLander.changeScreen(screenNames.HOME_SCREEN);
			};
		}

		function run() {

		}

		return {
			initialize: initialize,
			run: run
		}
	})();


	for (const screen of Object.values(LunarLander.screens)) {
		screen.initialize();
	}

})(LunarLander.game);