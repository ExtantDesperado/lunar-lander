(function(game) {

	let zoomSpeed = 0.001;

	function zoomIn(elapsedTime) {
		if (game.pixelsPerMeter < 50.0) {
			game.pixelsPerMeter += zoomSpeed * elapsedTime * game.pixelsPerMeter;
		}
	}

	function zoomOut(elapsedTime) {
		if (game.pixelsPerMeter > 1.0) {
			game.pixelsPerMeter -= zoomSpeed * elapsedTime * game.pixelsPerMeter;
		}
	}

	function toggleVectors(elapsedTime) {
		game.showVectors = !game.showVectors;
	}

	// All customizable key bindings.
	const commandTypes = {
		THRUST: 'thrust',
		ROTATE_CLOCKWISE: 'rotateClockwise',
		ROTATE_COUNTERCLOCKWISE: 'rotateCounterclockwise',
		ZOOM_IN: 'zoomIn',
		ZOOM_OUT: 'zoomOut',
		TOGGLE_VECTORS: 'toggleVectors'
	};

	// Buttons for changing command key bindings.
	let controlChangeButtons = {
		[commandTypes.THRUST]: document.getElementById('thrustControl'),
		[commandTypes.ROTATE_CLOCKWISE]: document.getElementById('clockwiseControl'),
		[commandTypes.ROTATE_COUNTERCLOCKWISE]: document.getElementById('counterclockwiseControl'),
		[commandTypes.ZOOM_IN]: document.getElementById('zoomInControl'),
		[commandTypes.ZOOM_OUT]: document.getElementById('zoomOutControl'),
		[commandTypes.TOGGLE_VECTORS]: document.getElementById('vectorControl')
	};

	// Functions to be called for each command.
	let commandFunctions = {
		[commandTypes.THRUST]: game.lander.engageThrust,
		[commandTypes.ROTATE_CLOCKWISE]: game.lander.rotateClockwise,
		[commandTypes.ROTATE_COUNTERCLOCKWISE]: game.lander.rotateCounterclockwise,
		[commandTypes.ZOOM_IN]: zoomIn,
		[commandTypes.ZOOM_OUT]: zoomOut,
		[commandTypes.TOGGLE_VECTORS]: toggleVectors
	};

	game.initializeControls = function() {
		game.keyBindings = {};
		let savedKeyBindings = localStorage.getItem('LunarLander.keyBindings');
		if (savedKeyBindings !== null) {
			game.keyBindings = JSON.parse(savedKeyBindings);
		} else {
			// Key bindings for each customizable command.
			game.keyBindings = {
				[commandTypes.THRUST]: 'ArrowUp',
				[commandTypes.ROTATE_CLOCKWISE]: 'ArrowRight',
				[commandTypes.ROTATE_COUNTERCLOCKWISE]: 'ArrowLeft',
				[commandTypes.ZOOM_IN]: 'w',
				[commandTypes.ZOOM_OUT]: 'q',
				[commandTypes.TOGGLE_VECTORS]: 'v'
			};
		}

		for (const commandType of Object.keys(controlChangeButtons)) {
			if (game.keyBindings[commandType] === ' ') {
				controlChangeButtons[commandType].innerHTML = 'Space';
			} else {
				controlChangeButtons[commandType].innerHTML = game.keyBindings[commandType];
			}
			controlChangeButtons[commandType].onclick = () => waitForControlChange(commandType);
		}

		game.keyboard.registerContinuous(game.keyBindings[commandTypes.THRUST], commandFunctions[commandTypes.THRUST]);
		game.keyboard.registerContinuous(game.keyBindings[commandTypes.ROTATE_CLOCKWISE], commandFunctions[commandTypes.ROTATE_CLOCKWISE]);
		game.keyboard.registerContinuous(game.keyBindings[commandTypes.ROTATE_COUNTERCLOCKWISE], commandFunctions[commandTypes.ROTATE_COUNTERCLOCKWISE]);

		game.keyboard.registerContinuous(game.keyBindings[commandTypes.ZOOM_IN], commandFunctions[commandTypes.ZOOM_IN]);
		game.keyboard.registerContinuous(game.keyBindings[commandTypes.ZOOM_OUT], commandFunctions[commandTypes.ZOOM_OUT]);

		game.keyboard.registerSingular(game.keyBindings[commandTypes.TOGGLE_VECTORS], commandFunctions[commandTypes.TOGGLE_VECTORS]);
	};

	let waitingForInput = false;
	let selectedCommand = null;

	function setButtonsDisabled(isDisabled) {
		for (const commandType of Object.keys(controlChangeButtons)) {
			controlChangeButtons[commandType].disabled = isDisabled;
		}
	}

	function changeKeyBinding(e) {
		for (const commandType of Object.keys(game.keyBindings)) {
			if (e.key === game.keyBindings[commandType] && commandType != selectedCommand) {
				return;
			}
		}

		waitingForInput = false;

		game.keyboard.unregister(game.keyBindings[selectedCommand]);

		game.keyBindings[selectedCommand] = e.key;

		if (e.key === ' ') {
			controlChangeButtons[selectedCommand].innerHTML = 'Space';
		} else {
			controlChangeButtons[selectedCommand].innerHTML = e.key;
		}

		if (selectedCommand === commandTypes.TOGGLE_VECTORS) {
			game.keyboard.registerSingular(game.keyBindings[selectedCommand], commandFunctions[selectedCommand]);
		} else {
			game.keyboard.registerContinuous(game.keyBindings[selectedCommand], commandFunctions[selectedCommand]);
		}

		localStorage['LunarLander.keyBindings'] = JSON.stringify(game.keyBindings);

		setButtonsDisabled(false);

		window.removeEventListener('keydown', changeKeyBinding);
	}

	function waitForControlChange(commandType) {
		if (waitingForInput) {
			// Remove any existing listeners.
			window.removeEventListener('keydown', changeKeyBinding);
		} else {
			waitingForInput = true;
		}
		selectedCommand = commandType;

		// Disable buttons so that they aren't clicked when user presses space or enter.
		setButtonsDisabled(true);

		// Wait for user to press a key to assign key binding.
		window.addEventListener('keydown', changeKeyBinding);
	}

})(LunarLander.game);