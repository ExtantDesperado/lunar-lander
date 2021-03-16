(function(game) {

	game.audioManager = {};

	game.audioManager.soundTypes = {
		LOOP: 'loop',
		SINGLE: 'single'
	};

	game.audioManager.sounds = {};

	game.audioManager.registerSound = function(name, sound) {
		game.audioManager.sounds[name] = sound;
		sound.audio = new Audio();
		sound.audio.isReady = false;

		sound.audio.addEventListener('canplay', function() {
			sound.audio.isReady = true;
		});

		if (sound.soundType === game.audioManager.soundTypes.LOOP) {
			sound.audio.isPlaying = false;
			// Add looping to make a continuous sound.
			// Use a buffer to create an audio loop with no gap.
			// src: https://stackoverflow.com/questions/7330023/gapless-looping-audio-html5
			sound.audio.addEventListener('timeupdate', function() {
				var buffer = 0.5;
			    if (this.currentTime > this.duration - buffer){
			        this.currentTime = 0;
			    }
			});

			sound.play = function() {
				sound.audio.isPlaying = true;
			};

		} else if (sound.soundType === game.audioManager.soundTypes.SINGLE) {
			sound.play = function() {
				if (sound.audio.isReady) {
					sound.audio.play();
				}
			};
		}

		sound.pause = function() {
			sound.audio.pause();
		}

		sound.audio.src = sound.source;
	};

	// game.audioManager.playThrustSound = function() {
	// 	sounds.thrust.audio.isPlaying = true;
	// };

	// game.audioManager.playCrashSound = function() {
	// 	if (sounds.crash.audio.isReady) {
	// 		sounds.crash.audio.play();
	// 	}
	// };

	// game.audioManager.playSafeLandingSound = function() {
	// 	if (sounds.safeLanding.audio.isReady) {
	// 		sounds.safeLanding.audio.play();
	// 	}
	// };

	game.audioManager.update = function() {
		for (const sound of Object.values(game.audioManager.sounds)) {
			if (sound.soundType === game.audioManager.soundTypes.LOOP) {
				if (sound.audio.isPlaying) {
					sound.audio.play();
					// Must be set to true for each frame the audio should be playing.
					sound.audio.isPlaying = false;
				} else {
					sound.audio.pause();
				}
			}
		}
	}

})(LunarLander.game);