(function(game) {

	game.gameStates = {
		RUNNING: 'running',
		COUNTDOWN: 'countdown',
		NEXT_LEVEL: 'next_level',
		DONE: 'done',
		QUIT: 'quit'
	};

	let previousTime = null;

	game.running = false;
	game.state = game.gameStates.DONE;

	game.canvas = document.getElementById('canvas');
	let ctx = game.canvas.getContext('2d');

	game.startGame = function() {
		previousTime = null;
		game.running = true;
		game.state = game.gameStates.RUNNING;
		game.initializeLevel(0);
		requestAnimationFrame(gameLoop);
	};

	let backgroundImage = new Image();
	backgroundImage.isReady = false;
	backgroundImage.onload = function() {
	    this.isReady = true;
	};
	backgroundImage.src = 'images/orion.jpg';

	function processInput(elapsedTime) {
		game.keyboard.update(elapsedTime);
	}

	function update(elapsedTime) {
		switch (game.state) {
			case game.gameStates.RUNNING:
				game.lander.update(elapsedTime);
				game.particleHandler.update(elapsedTime);
				game.audioManager.update();

				if (game.lander.landed || game.lander.destroyed) {
					game.finishLevel();
				}

				break;
			case game.gameStates.COUNTDOWN:
				game.countdown -= elapsedTime / 1000;
				if (game.countdown <= 0) {
					game.state = game.gameStates.RUNNING;
				}

				break;
			case game.gameStates.NEXT_LEVEL:
				game.nextLevelCountdown -= elapsedTime / 1000;
				if (game.nextLevelCountdown <= 0) {
					game.initializeLevel(game.currentLevel + 1);
				}
				break;
			case game.gameStates.DONE:
				game.lander.update(elapsedTime);
				game.particleHandler.update(elapsedTime);
				game.audioManager.update();
				break;
			default:;
		}
	}

	function render(elapsedTime) {
		ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);

		if (backgroundImage.isReady) {
			ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
		}

		ctx.save();
		ctx.translate(-(game.lander.position.x * game.pixelsPerMeter - game.canvas.width / 2),
					  -(game.lander.position.y * game.pixelsPerMeter - game.canvas.height / 2));
		game.particleHandler.render(ctx);
		game.renderCircularTerrain(ctx);
		game.lander.render(ctx);

		ctx.restore();

		ctx.save();

		if (game.showVectors) {
			game.renderVectors(ctx);
		}

		ctx.font = '20px arial';
		ctx.textBaseline = 'top';
		ctx.fillStyle = 'white';
		ctx.fillText('Speed: ' + Math.floor(game.lander.speed) + ' m/s', 0, 0);
		ctx.fillText('Angle: ' + Math.ceil(game.lander.angle * 180 / Math.PI) + ' degrees', 0, ctx.measureText('M').width);
		// ctx.fillText('Angle: ' + Math.floor(game.lander.angle * 180 / Math.PI) + ' degrees', 0, ctx.measureText('M').width);
		ctx.fillText('Fuel:  ' + game.lander.fuel.toFixed(2) + ' s', 0, 2 * ctx.measureText('M').width);

		let text = game.timer.toFixed(2) + ' s';
		ctx.fillText(text, game.canvas.width - ctx.measureText(text).width, 0);

		ctx.restore();

		if (game.state === game.gameStates.COUNTDOWN) {
			game.renderCountdown(ctx);
		} else if (game.state === game.gameStates.NEXT_LEVEL) {
			game.renderNextLevelCountdown(ctx);
		} else if (game.state === game.gameStates.DONE) {
			game.renderDoneMessage(ctx);
		}
	}

	function gameLoop(curTime) {
		if (previousTime == null) {				// Using performance.now() gives a negative elapsed time on first frame,
			previousTime = curTime;				// so I'm doing this instead.
		}
		elapsedTime = curTime - previousTime;
		previousTime = curTime;

		processInput(elapsedTime);
		update(elapsedTime);
		render(elapsedTime);

		if (game.state !== game.gameStates.QUIT) {
			requestAnimationFrame(gameLoop);
		}
	};

})(LunarLander.game);