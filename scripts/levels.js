(function(game) {

	const countdownStart = 3;
	const nextLevelCountdownStart = 5;

	savedLevels = localStorage.getItem('LunarLander.levels');

	if (savedLevels !== null) {
		game.levels = JSON.parse(savedLevels);
	} else {
		game.levels = [
			{
				planets: [
					{
						numPoints: 100,
						center: {
							x: -100,
							y: 0
						},
						minHeight: 25,
						maxHeight: 50,
						g: 2278,
						landingZoneWidth: 10
					},
					{
						numPoints: 100,
						center: {
							x: 100,
							y: 0
						},
						minHeight: 35,
						maxHeight: 50,
						g: 2278,
						landingZoneWidth: 10
					}
				],
				initialLanderValues: {
					position: {
						x: 0,
						y: 0
					},
					angle: 0,
					fuel: 20
				},
				highScores: []
			},
			{
				planets: [
					{
						numPoints: 200,
						center: {
							x: 0,
							y: 250
						},
						minHeight: 100,
						maxHeight: 200,
						g: 36450,
						landingZoneWidth: 5
					}
				],
				initialLanderValues: {
					position: {
						x: 0,
						y: 0
					},
					angle: 180,
					fuel: 20
				},
				highScores: []
			},
			{
				planets: [
					{
						numPoints: 100,
						center: {
							x: 0,
							y: 25
						},
						minHeight: 5,
						maxHeight: 15,
						g: 250,
						landingZoneWidth: 20
					},
					{
						numPoints: 100,
						center: {
							x: 25,
							y: 7
						},
						minHeight: 5,
						maxHeight: 15,
						g: 250,
						landingZoneWidth: 20
					},
					{
						numPoints: 100,
						center: {
							x: -20,
							y: -10
						},
						minHeight: 5,
						maxHeight: 15,
						g: 250,
						landingZoneWidth: 20
					},
					{
						numPoints: 100,
						center: {
							x: -30,
							y: 15
						},
						minHeight: 5,
						maxHeight: 15,
						g: 250,
						landingZoneWidth: 20
					}
				],
				initialLanderValues: {
					position: {
						x: 0,
						y: 0
					},
					angle: 0,
					fuel: 20
				},
				highScores: []
			},
		];

		// Save levels if not already saved in this browser.
		localStorage['LunarLander.levels'] = JSON.stringify(game.levels);
	}

	// Number of high scores to keep track of per level.
	const MAX_HIGH_SCORES = 5;

	game.countdown = 0;

	game.initializeLevel = function(level) {
		// game.currentLevel holds 0-based index value.
		game.currentLevel = level;

		if (level < 0 || level >= game.levels.length) {
			console.log('ERROR: Invalid level number.');
			return;
		}

		game.planets = [];
		for (const planet of game.levels[level].planets) {
			game.generatePlanet(planet);
		}

		game.lander.setInitialValues(game.levels[level].initialLanderValues);

		game.state = game.gameStates.COUNTDOWN;
		game.countdown = countdownStart;

		game.timer = 0;
	};

	game.finishLevel = function() {
		if (game.lander.landed) {
			game.levels[game.currentLevel].highScores.push(game.timer);
			game.levels[game.currentLevel].highScores.sort();
			if (game.levels[game.currentLevel].highScores.length > MAX_HIGH_SCORES) {
				game.levels[game.currentLevel].highScores.pop();
			}

			localStorage['LunarLander.levels'] = JSON.stringify(game.levels);

			if (game.currentLevel < game.levels.length - 1) {
				game.nextLevelCountdown = nextLevelCountdownStart;
				game.state = game.gameStates.NEXT_LEVEL;
			} else {
				game.state = game.gameStates.DONE;
			}

			game.audioManager.sounds.thrust.pause();
		} else if (game.lander.destroyed) {
			game.state = game.gameStates.DONE;
		}
	};

	game.renderCountdown = function(ctx) {
		ctx.save();

		ctx.font = '100px arial';
		ctx.textBaseline = 'top';
		ctx.fillStyle = 'white';
		let levelText = 'Level ' + (game.currentLevel + 1);
		let countdownText = Math.ceil(game.countdown);
		ctx.fillText(countdownText, (game.canvas.width - ctx.measureText(countdownText).width) / 2, (game.canvas.height - ctx.measureText('M').width) / 2);
		ctx.font = '50px arial';
		ctx.fillText(levelText, (game.canvas.width - ctx.measureText(levelText).width) / 2, 0);

		ctx.restore();
	};

	game.renderNextLevelCountdown = function(ctx) {
		ctx.save();

		let end = (1 - (game.nextLevelCountdown / nextLevelCountdownStart)) * game.canvas.width;

		ctx.fillStyle = 'rgb(0, 255, 0)';
		ctx.fillRect(0, game.canvas.height - 40, end, 40);
		ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
		ctx.fillRect(end, game.canvas.height - 40, game.canvas.width - end, 40);

		ctx.font = '30px arial';
		ctx.textBaseline = 'top';
		ctx.fillStyle = 'white';
		ctx.fillText('Next Level', (game.canvas.width - ctx.measureText('Next Level').width) / 2, game.canvas.height - 20 - ctx.measureText('M').width / 2);

		ctx.restore();
	};

	game.renderDoneMessage = function(ctx) {
		ctx.save();

		let text = '';
		if (game.lander.landed) {
			text = 'You Win!';
		} else {
			text = 'Game Over';
		}
		ctx.font = '30px arial';
		ctx.textBaseline = 'top';
		ctx.fillStyle = 'white';
		ctx.fillText(text, (game.canvas.width - ctx.measureText(text).width) / 2, (game.canvas.height - ctx.measureText('M').width) / 2);

		ctx.restore();
	};

})(LunarLander.game);