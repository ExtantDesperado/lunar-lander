(function(game) {
	
	const inputTypes = {
		CONTINUOUS: 'continuous',
		SINGULAR: 'singular'
	};

	let input = (function() {
		function Keyboard() {
			let that = {
				keys: {},
				handlers: {}
			};

			function keyPress(e) {
				that.keys[e.key] = e.timeStamp;
			}

			function keyRelease(e) {
				delete that.keys[e.key];
				if (that.handlers.hasOwnProperty(e.key)) {
					if (that.handlers[e.key].type === inputTypes.SINGULAR && that.handlers[e.key].hasOwnProperty('hasRun')) {
						that.handlers[e.key].hasRun = false;
					}
				}
			}

			window.addEventListener('keydown', keyPress);
			window.addEventListener('keyup', keyRelease);

			that.registerContinuous = function(key, handler) {
				that.handlers[key] = {
					type: inputTypes.CONTINUOUS,
					run: handler
				};
			};

			that.registerSingular = function(key, handler) {
				that.handlers[key] = {
					type: inputTypes.SINGULAR,
					run: handler,
					hasRun: false
				};
			};

			that.unregister = function(key) {
				delete that.handlers[key];
			};

			that.update = function(elapsedTime) {
				Object.keys(that.keys).forEach(key => {
					if (that.handlers.hasOwnProperty(key)) {
						switch (that.handlers[key].type) {
							case inputTypes.CONTINUOUS:
								that.handlers[key].run(elapsedTime);
								break;
							case inputTypes.SINGULAR:
								if (that.handlers[key].hasOwnProperty('hasRun') && !that.handlers[key].hasRun) {
									that.handlers[key].run(elapsedTime);
									that.handlers[key].hasRun = true;
								}
								break;
							default:;
						}
					}
				});
			};

			return that;
		}

		return {
			Keyboard: Keyboard
		};
	})();

	game.keyboard = input.Keyboard();

})(LunarLander.game);