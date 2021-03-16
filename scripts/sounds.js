(function(game) {

	let sounds = {
		thrust: {
			source: './audio/qubodup__rocket-boost-engine-loop.wav',
			soundType: game.audioManager.soundTypes.LOOP
		},
		crash: {
			source: './audio/cydon__explosion-001.mp3',
			soundType: game.audioManager.soundTypes.SINGLE
		},
		safeLanding: {
			source: './audio/337049__shinephoenixstormcrow__320655-rhodesmas-level-up-01.mp3',
			soundType: game.audioManager.soundTypes.SINGLE
		}
	};

	for (const soundName of Object.keys(sounds)) {
		game.audioManager.registerSound(soundName, sounds[soundName]);
	}

})(LunarLander.game);