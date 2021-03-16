(function(game) {

	let landerImage = new Image();
	landerImage.isReady = false;
	landerImage.onload = function() {
	    this.isReady = true;
	};
	landerImage.src = 'images/lander.png';


	game.lander = (function() {
		let that = {
			width: 5,						// meters
			height: 5,						// meters
			position: { x: 0, y: 0 },		// meters
			velocity: { x: 0, y: 0 },
			accel: { x: 0, y: 0 },
			speed: 0,
			angle: 0,						// Thrust pointing upward.
			angularVelocity: 0,				// Positive: clockwise. Measured in rad/ms.
			fuel: 20,						// Measured in seconds.
			thrustOn: false,
			destroyed: false,
			landed: false
		};

		that.setInitialValues = function(initialValues) {
			that.position.x = initialValues.position.x;
			that.position.y = initialValues.position.y;
			that.velocity.x = 0;
			that.velocity.y = 0;
			that.accel.x = 0;
			that.accel.y = 0;
			that.speed = 0;
			that.angle = initialValues.angle * Math.PI / 180;		// Convert to radians.
			that.angularVelocity = 0;
			that.fuel = initialValues.fuel;
			that.thrustOn = false;
			that.destroyed = false;
			that.landed = false;
		};

		let accelerationConstant = 5.0;					// m/s^2, thrust acceleration
		let angularAccelerationConstant = 2.0;				// rad/s^2, rotational acceleration

		that.rotateClockwise = function(elapsedTime) {
			if (game.state === game.gameStates.RUNNING && !that.destroyed && !that.landed) {
				that.angularVelocity += angularAccelerationConstant * elapsedTime / 1000;
			}
		};

		that.rotateCounterclockwise = function(elapsedTime) {
			if (game.state === game.gameStates.RUNNING && !that.destroyed && !that.landed) {
				that.angularVelocity -= angularAccelerationConstant * elapsedTime / 1000;
			}
		};

		that.engageThrust = function(elapsedTime) {
			if (game.state === game.gameStates.RUNNING && !that.destroyed && !that.landed && that.fuel > 0) {
				that.velocity.x += accelerationConstant * Math.sin(that.angle) * elapsedTime / 1000;
				that.velocity.y -= accelerationConstant * Math.cos(that.angle) * elapsedTime / 1000;
				that.fuel -= elapsedTime / 1000;
				game.particleHandler.shipThrust();
				// game.audioManager.playThrustSound();
				game.audioManager.sounds.thrust.play();
			}
		};

		that.render = function(ctx) {
			if (landerImage.isReady && !that.destroyed) {
				let pixelWidth = that.width * game.pixelsPerMeter;
				let pixelHeight = that.height * game.pixelsPerMeter;
				let pixelX = that.position.x * game.pixelsPerMeter;
				let pixelY = that.position.y * game.pixelsPerMeter;
				
				ctx.save();

				ctx.translate(pixelX, pixelY);
				ctx.rotate(that.angle);
				ctx.translate(-pixelX, -pixelY);

				ctx.drawImage(landerImage, pixelX - pixelWidth / 2, pixelY - pixelHeight / 2, pixelWidth, pixelHeight);

				ctx.translate(pixelX, pixelY);
				ctx.rotate(that.angle);
				ctx.translate(-pixelX, -pixelY);

				ctx.restore();
			}
		};

		that.update = function(elapsedTime) {
			if (!game.lander.destroyed && !game.lander.landed) {
				game.timer += elapsedTime / 1000;

				let intersection = game.collisionCheckCircular();
				if (intersection != null) {
					if (intersection.landedSuccessfully) {
						game.audioManager.sounds.safeLanding.play();
						game.lander.landed = true;
					} else {
						game.particleHandler.shipExplode();
						game.audioManager.sounds.crash.play();
						game.lander.destroyed = true;
					}
					game.lander.velocity.x = 0;
					game.lander.velocity.y = 0;
				} else {
					game.lander.accel.x = 0;
					game.lander.accel.y = 0;
					for (let i = 0; i < game.planets.length; i++) {
						let accel = game.planets[i].g / (Math.pow(game.planets[i].center.x - game.lander.position.x, 2) + Math.pow(game.planets[i].center.y - game.lander.position.y, 2));
						game.lander.accel.x += accel * Math.cos(Math.atan2(game.planets[i].center.y - game.lander.position.y, game.planets[i].center.x - game.lander.position.x));		// Acceleration due to gravity.
						game.lander.accel.y += accel * Math.sin(Math.atan2(game.planets[i].center.y - game.lander.position.y, game.planets[i].center.x - game.lander.position.x));		// Acceleration due to gravity.
					}

					game.lander.velocity.x += game.lander.accel.x * elapsedTime / 1000;
					game.lander.velocity.y += game.lander.accel.y * elapsedTime / 1000;
					game.lander.position.x += game.lander.velocity.x * elapsedTime / 1000;
					game.lander.position.y += game.lander.velocity.y * elapsedTime / 1000;
					game.lander.speed = Math.sqrt(Math.pow(game.lander.velocity.x, 2) + Math.pow(game.lander.velocity.y, 2));
					game.lander.angle += game.lander.angularVelocity * elapsedTime / 1000;

					// Adjust angle to be between -pi and pi.
					if (game.lander.angle > Math.PI) {
						game.lander.angle -= 2 * Math.PI;
					} else if (game.lander.angle <= -Math.PI) {
						game.lander.angle += 2 * Math.PI;
					}
				}
			}
		};

		return that;
	})();

	game.showVectors = true;

	game.renderVectors = function(ctx) {
		ctx.save();

		let pixelX = game.canvas.width / 2;
		let pixelY = game.canvas.height / 2;
		let scaling = 3.0;

		ctx.beginPath();
		ctx.moveTo(pixelX, pixelY);
		ctx.lineTo(pixelX + 100 * game.lander.accel.x, pixelY + 100 * game.lander.accel.y);
		ctx.strokeStyle = 'rgb(0, 255, 0)';
		ctx.lineWidth = 3;
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(pixelX, pixelY);
		ctx.lineTo(pixelX + 10 * game.lander.velocity.x, pixelY + 10 * game.lander.velocity.y);
		ctx.strokeStyle = 'rgb(255, 0, 0)';
		ctx.lineWidth = 3;
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(pixelX, pixelY);
		ctx.lineTo(pixelX + 100 * Math.sin(game.lander.angle), pixelY - 100 * Math.cos(game.lander.angle));
		ctx.strokeStyle = 'rgb(0, 0, 255)';
		ctx.lineWidth = 3;
		ctx.stroke();

		ctx.font = '20px arial';
		ctx.textBaseline = 'top';

		ctx.fillStyle = 'rgb(0, 255, 0)';
		ctx.fillRect(5, game.canvas.height - 15, 10, 10);
		ctx.fillText('Acceleration', 20, game.canvas.height - ctx.measureText('M').width);

		ctx.fillStyle = 'rgb(255, 0, 0)';
		ctx.fillRect(5, game.canvas.height - 35, 10, 10);
		ctx.fillText('Velocity', 20, game.canvas.height - 20 - ctx.measureText('M').width);

		ctx.fillStyle = 'rgb(0, 0, 255)';
		ctx.fillRect(5, game.canvas.height - 55, 10, 10);
		ctx.fillText('Orientation', 20, game.canvas.height - 40 - ctx.measureText('M').width);

		ctx.restore();
	};

})(LunarLander.game);