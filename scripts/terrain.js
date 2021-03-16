(function(game) {

	game.terrain = [];
	game.maxTerrainHeight = 0;
	game.minTerrainHeight = 100;
	let delta = 0;

	game.planets = [];

	// [start, end)
	// function terrainRecursion(start, end) {
	// 	if (end > start + 2) {
	// 		let s = 0.3;
	// 		let mid = start + Math.floor((end - start) / 2);

	// 		let rand = Random.normalDist(0, s * Math.abs(start - end));

	// 		game.terrain[mid].y = (game.terrain[start].y + game.terrain[end - 1].y) / 2 + rand;

	// 		terrainRecursion(start, mid + 1);
	// 		terrainRecursion(mid, end);
	// 	}
	// }

	// game.generateTerrain = function(dist, start, end) {
	// 	let length = (end - start) / dist;
	// 	delta = dist;

	// 	game.terrain = [];
	// 	for (let i = 0; i < length; i++) {
	// 		game.terrain[i] = {
	// 			x: i * delta + start,
	// 			y: null
	// 		};
	// 	}
	// 	// game.terrain[0].y = Random.normalDist(15, 3);
	// 	// game.terrain[game.terrain.length - 1].y = Random.normalDist(15, 3);
	// 	game.terrain[0].y = Random.normalDist(0, 20);
	// 	game.terrain[game.terrain.length - 1].y = Random.normalDist(0, 20);
	// 	terrainRecursion(0, game.terrain.length);

	// 	let maxElevation = Infinity;
	// 	let minElevation = -Infinity;
	// 	for (let i = 0; i < length; i++) {
	// 		if (game.terrain[i].y < maxElevation) {
	// 			maxElevation = game.terrain[i].y;
	// 		}
	// 		if (game.terrain[i].y > minElevation) {
	// 			minElevation = game.terrain[i].y;
	// 		}
	// 	}

	// 	for (let i = 0; i < length; i++) {
	// 		// Map to range [0, 1]
	// 		game.terrain[i].y = (game.terrain[i].y - minElevation) / (maxElevation - minElevation);
	// 		// Map to range [game.minTerrainHeight, game.maxTerrainHeight]
	// 		game.terrain[i].y = game.terrain[i].y * (game.maxTerrainHeight - game.minTerrainHeight) + game.minTerrainHeight;
	// 	}
	// };

	function circularTerrainRecursion(start, end, radii) {
		if (end > start + 2) {
			let s = 0.3;
			let mid = start + Math.floor((end - start) / 2);

			let rand = Random.normalDist(0, s * Math.abs(start - end));

			radii[mid] = (radii[start] + radii[end - 1]) / 2 + rand;

			circularTerrainRecursion(start, mid + 1, radii);
			circularTerrainRecursion(mid, end, radii);
		}
	}

	game.generatePlanet = function(spec) {
		let d = 2 * Math.PI / spec.numPoints;

		spec.terrain = [];

		let radii = [];
		for (let i = 0; i < spec.numPoints; i++) {
			radii[i] = 0;
		}

		// Landing zone spans points [start, end] (inclusive).
		spec.landingZone = {};
		spec.landingZone.start = Math.floor(spec.numPoints * Math.random());
		spec.landingZone.end = (spec.landingZone.start + spec.landingZoneWidth) % spec.numPoints;

		radii[spec.landingZone.start] = Random.normalDist(0, 5);
		for (let i = 1; i <= spec.landingZoneWidth; i++) {
			radii[(spec.landingZone.start + i) % spec.numPoints] = radii[spec.landingZone.start];
		}

		if (spec.landingZone.start < spec.landingZone.end) {
			circularTerrainRecursion(0, spec.landingZone.start + 1, radii);
			circularTerrainRecursion(spec.landingZone.end + 1, spec.numPoints, radii);
		} else {
			circularTerrainRecursion(spec.landingZone.end + 1, spec.landingZone.start + 1, radii);
		}

		let maxElevation = -Infinity;
		let minElevation = Infinity;
		for (let i = 0; i < spec.numPoints; i++) {
			if (radii[i] > maxElevation) {
				maxElevation = radii[i];
			}
			if (radii[i] < minElevation) {
				minElevation = radii[i];
			}
		}

		for (let i = 0; i < spec.numPoints; i++) {
			// Map to range [0, 1]
			radii[i] = (radii[i] - minElevation) / (maxElevation - minElevation);
			// Map to range [minHeight, maxHeight]
			radii[i] = radii[i] * (spec.maxHeight - spec.minHeight) + spec.minHeight;
			spec.terrain[i] = {
				x: radii[i] * Math.cos(i * d) + spec.center.x,
				y: radii[i] * Math.sin(i * d) + spec.center.y
			};
		}

		game.planets.push(spec);
	};

	// game.renderTerrain = function(ctx) {
	// 	if (game.terrain.length > 0) {
	// 		ctx.save();

	// 		ctx.beginPath();
	// 		ctx.moveTo(game.terrain[0].x * game.pixelsPerMeter, game.terrain[0].y * game.pixelsPerMeter);

	// 		for (let i = 1; i < game.terrain.length; i++) {
	// 			ctx.lineTo(game.terrain[i].x * game.pixelsPerMeter, game.terrain[i].y * game.pixelsPerMeter);
	// 		}

	// 		ctx.closePath();			// For circular.

	// 		ctx.strokeStyle = 'white';
	// 		ctx.lineWidth = 0.25 * game.pixelsPerMeter;
	// 		ctx.stroke();

	// 		ctx.fillStyle = 'black';
	// 		ctx.fill();

	// 		ctx.restore();
	// 	}
	// };

	game.renderCircularTerrain = function(ctx) {
		ctx.save();

		ctx.strokeStyle = 'white';
		ctx.lineWidth = 0.25 * game.pixelsPerMeter;
		ctx.fillStyle = 'black';

		for (let i = 0; i < game.planets.length; i++) {
			ctx.beginPath();
			ctx.moveTo(game.planets[i].terrain[0].x * game.pixelsPerMeter, game.planets[i].terrain[0].y * game.pixelsPerMeter);

			for (let j = 1; j < game.planets[i].terrain.length; j++) {
				ctx.lineTo(game.planets[i].terrain[j].x * game.pixelsPerMeter, game.planets[i].terrain[j].y * game.pixelsPerMeter);
			}

			ctx.strokeStyle = 'white';
			ctx.closePath();

			ctx.stroke();
			ctx.fill();

			ctx.beginPath();
			ctx.moveTo(game.planets[i].terrain[game.planets[i].landingZone.start].x * game.pixelsPerMeter, game.planets[i].terrain[game.planets[i].landingZone.start].y * game.pixelsPerMeter);
			for (let j = 1; j <= game.planets[i].landingZoneWidth; j++) {
				ctx.lineTo(game.planets[i].terrain[(game.planets[i].landingZone.start + j) % game.planets[i].numPoints].x * game.pixelsPerMeter, game.planets[i].terrain[(game.planets[i].landingZone.start + j) % game.planets[i].numPoints].y * game.pixelsPerMeter);
			}
			ctx.strokeStyle = 'red';
			ctx.stroke();
		}
		
		ctx.restore();
	};

	// Reference: https://stackoverflow.com/questions/37224912/circle-line-segment-collision
	function lineCircleIntersection(pt1, pt2, circle) {
	    let v1 = { x: pt2.x - pt1.x, y: pt2.y - pt1.y };
	    let v2 = { x: pt1.x - circle.center.x, y: pt1.y - circle.center.y };
	    let b = -2 * (v1.x * v2.x + v1.y * v2.y);
	    let c =  2 * (v1.x * v1.x + v1.y * v1.y);
	    let d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
	    if (isNaN(d)) { // no intercept
	        return false;
	    }
	    // These represent the unit distance of point one and two on the line
	    let u1 = (b - d) / c;  
	    let u2 = (b + d) / c;
	    if (u1 <= 1 && u1 >= 0) {  // If point on the line segment
	        return true;
	    }
	    if (u2 <= 1 && u2 >= 0) {  // If point on the line segment
	        return true;
	    }
	    return false;
	}

	// game.collisionCheck = function() {
	// 	for (let i = 0; i < game.terrain.length - 1; i++) {
	// 		let circle = {
	// 			center: {
	// 				x: game.lander.position.x,
	// 				y: game.lander.position.y
	// 			},
	// 			radius: 2
	// 		};

	// 		if (lineCircleIntersection(game.terrain[i], game.terrain[i + 1], circle)) {
	// 			return true;
	// 		}
	// 	}

	// 	return false;
	// };

	function checkLanding(planet) {
		let landingAngle = Math.atan2(game.lander.position.x - game.planets[planet].center.x, game.planets[planet].center.y - game.lander.position.y);
		let angleThreshold = 10;
		let speedThreshold = 2;

		let angleDiff = landingAngle - game.lander.angle;
		if (angleDiff > Math.PI) {
			angleDiff -= 2 * Math.PI;
		} else if (angleDiff <= -Math.PI) {
			angleDiff += 2 * Math.PI;
		}

		if (Math.abs(angleDiff) * 180 / Math.PI <= angleThreshold && game.lander.speed <= speedThreshold) {
			return true;
		}
		return false;
	}

	game.collisionCheckCircular = function() {
		for (let i = 0; i < game.planets.length; i++) {
			for (let j = 0; j < game.planets[i].terrain.length - 1; j++) {
				circle = {
					center: {
						x: game.lander.position.x,
						y: game.lander.position.y
					},
					radius: 2
				};

				if (lineCircleIntersection(game.planets[i].terrain[j], game.planets[i].terrain[j + 1], circle)) {
					if (game.planets[i].landingZone.start < game.planets[i].landingZone.end) {
						if (j >= game.planets[i].landingZone.start && j < game.planets[i].landingZone.end) {
							return {
								planet: i,
								line: j,
								landedSuccessfully: checkLanding(i)
							};
						}
					} else {
						if (j >= game.planets[i].landingZone.start || j < game.planets[i].landingZone.end) {
							return {
								planet: i,
								line: j,
								landedSuccessfully: checkLanding(i)
							};
						}
					}
					return {
						planet: i,
						line: j,
						landedSuccessfully: false
					};
				}
			}

			if (lineCircleIntersection(game.planets[i].terrain[game.planets[i].terrain.length - 1], game.planets[i].terrain[0], circle)) {
				return {
					planet: i,
					line: game.planets[i].terrain.length - 1
				};
			}
		}

		return null;
	};

})(LunarLander.game);