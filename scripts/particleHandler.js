(function(game) {

	game.particleHandler = {};

	effects = {};

	effects.thrustSystems = {};

	effects.thrustSystems.wide = {
		color: 'rgba(255, 0, 0, 0.5)',
		particles: [],
		particlesPerFrame: 20,
		radiusMean: 0.2,
		radiusStdDev: 0.05,
		speedMean: 10,
		speedStdDev: 3,
		angleStdDev: 0.25,
		lifetime: 0.25
	};

	effects.thrustSystems.mid = {
		color: 'rgba(255, 127, 0, 0.5)',
		particles: [],
		particlesPerFrame: 15,
		radiusMean: 0.2,
		radiusStdDev: 0.05,
		speedMean: 10,
		speedStdDev: 3,
		angleStdDev: 0.15,
		lifetime: 0.25
	};

	effects.thrustSystems.narrow = {
		color: 'rgba(255, 255, 0, 0.5)',
		particles: [],
		particlesPerFrame: 10,
		radiusMean: 0.2,
		radiusStdDev: 0.05,
		speedMean: 10,
		speedStdDev: 3,
		angleStdDev: 0.05,
		lifetime: 0.25
	};

	effects.explosionSystems = {};

	effects.explosionSystems.large = {
		color: 'rgba(255, 0, 0, 0.5)',
		particles: [],
		particlesPerFrame: 100,
		radiusMean: 0.2,
		radiusStdDev: 0.05,
		speedMean: 10,
		speedStdDev: 3,
		lifetime: 0.75
	};

	effects.explosionSystems.med = {
		color: 'rgba(255, 127, 0, 0.5)',
		particles: [],
		particlesPerFrame: 50,
		radiusMean: 0.2,
		radiusStdDev: 0.05,
		speedMean: 10,
		speedStdDev: 3,
		lifetime: 0.75
	};

	effects.explosionSystems.small = {
		color: 'rgba(255, 255, 0, 0.5)',
		particles: [],
		particlesPerFrame: 20,
		radiusMean: 0.2,
		radiusStdDev: 0.05,
		speedMean: 10,
		speedStdDev: 3,
		lifetime: 0.75
	};

	game.particleHandler.shipThrust = function() {
		for (system in effects.thrustSystems) {
			if (effects.thrustSystems.hasOwnProperty(system)) {
				for (let i = 0; i < effects.thrustSystems[system].particlesPerFrame; i++) {
					let speed = Math.abs(Random.normalDist(effects.thrustSystems[system].speedMean, effects.thrustSystems[system].speedStdDev));
					let angle = Random.normalDist(game.lander.angle + Math.PI / 2, effects.thrustSystems[system].angleStdDev);
					effects.thrustSystems[system].particles.push({
						position: {
							x: game.lander.position.x,
							y: game.lander.position.y
						},
						velocity: {
							x: speed * Math.cos(angle) + game.lander.velocity.x,
							y: speed * Math.sin(angle) + game.lander.velocity.y
						},
						radius: Math.abs(Random.normalDist(effects.thrustSystems[system].radiusMean, effects.thrustSystems[system].radiusStdDev)),
						lifetime: effects.thrustSystems[system].lifetime
					});
				}
			}
		}
	};

	game.particleHandler.shipExplode = function() {
		for (system in effects.explosionSystems) {
			if (effects.explosionSystems.hasOwnProperty(system)) {
				for (let i = 0; i < effects.explosionSystems[system].particlesPerFrame; i++) {
					let speed = Math.abs(Random.normalDist(effects.explosionSystems[system].speedMean, effects.explosionSystems[system].speedStdDev));
					let angle = 2 * Math.PI * Math.random();
					effects.explosionSystems[system].particles.push({
						position: {
							x: game.lander.position.x,
							y: game.lander.position.y
						},
						velocity: {
							x: speed * Math.cos(angle),
							y: speed * Math.sin(angle)
						},
						radius: Math.abs(Random.normalDist(effects.explosionSystems[system].radiusMean, effects.explosionSystems[system].radiusStdDev)),
						lifetime: effects.explosionSystems[system].lifetime
					});
				}
			}
		}
	};

	game.particleHandler.update = function(elapsedTime) {
		for (effect in effects) {
			if (effects.hasOwnProperty(effect)) {
				for (system in effects[effect]) {
					if (effects[effect].hasOwnProperty(system)) {
						let keep = [];
						for (let i = 0; i < effects[effect][system].particles.length; i++) {
							effects[effect][system].particles[i].position.x += effects[effect][system].particles[i].velocity.x * elapsedTime / 1000;
							effects[effect][system].particles[i].position.y += effects[effect][system].particles[i].velocity.y * elapsedTime / 1000;
							effects[effect][system].particles[i].lifetime -= elapsedTime / 1000;
							if (effects[effect][system].particles[i].lifetime > 0) {
								keep.push(effects[effect][system].particles[i]);
							}
						}
						effects[effect][system].particles = keep;
					}
				}
			}
		}
	};

	game.particleHandler.render = function(ctx) {
		ctx.save();

		for (effect in effects) {
			if (effects.hasOwnProperty(effect)) {
				for (system in effects[effect]) {
					if (effects[effect].hasOwnProperty(system)) {
						ctx.fillStyle = effects[effect][system].color;
						for (let i = 0; i < effects[effect][system].particles.length; i++) {
							ctx.beginPath();
							ctx.arc(effects[effect][system].particles[i].position.x * game.pixelsPerMeter,
								effects[effect][system].particles[i].position.y * game.pixelsPerMeter,
								effects[effect][system].particles[i].radius * game.pixelsPerMeter,
								0, 2 * Math.PI);
							ctx.closePath();
							ctx.fill();
						}
					}
				}
			}
		}

		ctx.restore();
	};

})(LunarLander.game);