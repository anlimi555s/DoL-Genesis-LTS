Renderer.Animations.idle = {
	frames: 2,
	duration: 1000,
};
// Example animations for testing
const demoRainbowColors = ["#FF0000", "#FF8000", "#FFFF00", "#80FF00", "#00FF00", "#00FF80", "#00FFFF", "#0080FF", "#0000FF", "#8000FF", "#FF00FF", "#FF0080"];
Renderer.Animations.idle_rainbow_gradient = {
	keyframes: demoRainbowColors.map((color, i) => ({
		frame: Math.floor((i * 2) / 12),
		duration: i % 6 === 0 ? 200 : 160, // 200 ms + 5 x 160 ms = 1000 ms
		blend: {
			gradient: "linear",
			values: [128, 0, 128, 256],
			colors: [...demoRainbowColors.slice(i), ...demoRainbowColors.slice(0, i)],
		},
	})),
};
Renderer.Animations.idle_rainbow = {
	keyframes: [
		{
			frame: 0,
			duration: 200, // 1x200 + 5x160 = 1000, to align with idle animation
			blend: "#ff0000",
		},
		{
			frame: 0,
			duration: 160,
			blend: "#ff8000",
		},
		{
			frame: 0,
			duration: 160,
			blend: "#ffff00",
		},
		{
			frame: 0,
			duration: 160,
			blend: "#80ff00",
		},
		{
			frame: 0,
			duration: 160,
			blend: "#00ff00",
		},
		{
			frame: 0,
			duration: 160,
			blend: "#00ff80",
		},
		{
			frame: 1,
			duration: 200,
			blend: "#00ffff",
		},
		{
			frame: 1,
			duration: 160,
			blend: "#0080ff",
		},
		{
			frame: 1,
			duration: 160,
			blend: "#0000ff",
		},
		{
			frame: 1,
			duration: 160,
			blend: "#8000ff",
		},
		{
			frame: 1,
			duration: 160,
			blend: "#ff00ff",
		},
		{
			frame: 1,
			duration: 160,
			blend: "#ff0080",
		},
	],
};
Renderer.Animations.blink = {
	keyframes: [
		{
			frame: 0,
			duration: 9000,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 14400,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 5400,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 1100,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 12500,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 23400,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 9000,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 1800,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 7200,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 10800,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 7200,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 7200,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 9000,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 12600,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 10800,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 5400,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 1800,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 900,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 9000,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 7200,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 10800,
		},
		{
			frame: 1,
			duration: 100,
		},
	],
};

Renderer.Animations["blink-trauma"] = {
	frameCount: 2,
	keyframes: [
		{
			frame: 0,
			duration: 5400,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 23400,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 7200,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 7200,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 10800,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 900,
		},
		{
			frame: 1,
			duration: 100,
		},
		{
			frame: 0,
			duration: 10800,
		},
		{
			frame: 1,
			duration: 100,
		},
	],
};

// cum drip animations generated using img/split2.bat ImageMagick script
// I believe their sizes could be reduced by keeping unique frames only
// (amount of keyframes does not matter; every different frame(subsprite) is re-rendered & cached

Renderer.Animations.AnalCumDripStart = {
	keyframes: [
		{ frame: 0, duration: 3000 },
		{ frame: 1, duration: 100 },
		{ frame: 2, duration: 100 },
		{ frame: 3, duration: 100 },
		{ frame: 4, duration: 100 },
	],
};
Renderer.Animations.AnalCumDripVerySlow = {
	keyframes: [
		{ frame: 0, duration: 2000 },
		{ frame: 1, duration: 200 },
		{ frame: 2, duration: 200 },
		{ frame: 3, duration: 200 },
		{ frame: 4, duration: 300 },
		{ frame: 5, duration: 200 },
		{ frame: 6, duration: 100 },
		{ frame: 7, duration: 100 },
		{ frame: 8, duration: 100 },
		{ frame: 9, duration: 2000 },
		{ frame: 10, duration: 100 },
		{ frame: 11, duration: 100 },
		{ frame: 12, duration: 100 },
		{ frame: 13, duration: 100 },
	],
};
Renderer.Animations.AnalCumDripSlow = {
	keyframes: [
		{ frame: 0, duration: 1000 },
		{ frame: 1, duration: 200 },
		{ frame: 2, duration: 200 },
		{ frame: 3, duration: 200 },
		{ frame: 4, duration: 300 },
		{ frame: 5, duration: 200 },
		{ frame: 6, duration: 100 },
		{ frame: 7, duration: 100 },
		{ frame: 8, duration: 100 },
		{ frame: 9, duration: 1000 },
		{ frame: 10, duration: 100 },
		{ frame: 11, duration: 100 },
		{ frame: 12, duration: 100 },
		{ frame: 13, duration: 100 },
	],
};
Renderer.Animations.AnalCumDripFast = {
	keyframes: [
		{ frame: 0, duration: 1000 },
		{ frame: 1, duration: 200 },
		{ frame: 2, duration: 200 },
		{ frame: 3, duration: 200 },
		{ frame: 4, duration: 300 },
		{ frame: 5, duration: 200 },
		{ frame: 6, duration: 100 },
		{ frame: 7, duration: 100 },
		{ frame: 8, duration: 100 },
		{ frame: 9, duration: 100 },
		{ frame: 10, duration: 100 },
		{ frame: 11, duration: 100 },
	],
};
Renderer.Animations.AnalCumDripVeryFast = {
	keyframes: [
		{ frame: 0, duration: 80 },
		{ frame: 1, duration: 80 },
		{ frame: 2, duration: 80 },
		{ frame: 3, duration: 80 },
		{ frame: 4, duration: 80 },
		{ frame: 5, duration: 80 },
		{ frame: 6, duration: 80 },
		{ frame: 7, duration: 80 },
		{ frame: 8, duration: 80 },
		{ frame: 9, duration: 80 },
		{ frame: 10, duration: 80 },
		{ frame: 11, duration: 80 },
		{ frame: 12, duration: 80 },
		{ frame: 13, duration: 80 },
		{ frame: 14, duration: 80 },
		{ frame: 15, duration: 80 },
		{ frame: 16, duration: 80 },
	],
};

Renderer.Animations.MouthCumDripStart = {
	keyframes: [{ frame: 0, duration: 0 }],
};
Renderer.Animations.MouthCumDripVerySlow = {
	keyframes: [
		{ frame: 0, duration: 1700 },
		{ frame: 1, duration: 170 },
		{ frame: 2, duration: 170 },
		{ frame: 3, duration: 170 },
		{ frame: 4, duration: 170 },
		{ frame: 5, duration: 170 },
		{ frame: 6, duration: 170 },
		{ frame: 7, duration: 170 },
	],
};
Renderer.Animations.MouthCumDripSlow = {
	keyframes: [
		{ frame: 0, duration: 170 },
		{ frame: 1, duration: 170 },
		{ frame: 2, duration: 170 },
		{ frame: 3, duration: 170 },
		{ frame: 4, duration: 170 },
		{ frame: 5, duration: 170 },
		{ frame: 6, duration: 170 },
		{ frame: 7, duration: 170 },
		{ frame: 8, duration: 170 },
		{ frame: 9, duration: 170 },
		{ frame: 10, duration: 170 },
		{ frame: 11, duration: 170 },
		{ frame: 12, duration: 170 },
		{ frame: 13, duration: 170 },
		{ frame: 14, duration: 170 },
		{ frame: 15, duration: 170 },
		{ frame: 16, duration: 170 },
		{ frame: 17, duration: 170 },
		{ frame: 18, duration: 170 },
		{ frame: 19, duration: 170 },
		{ frame: 20, duration: 170 },
		{ frame: 21, duration: 170 },
	],
};
Renderer.Animations.MouthCumDripFast = {
	keyframes: [
		{ frame: 0, duration: 170 },
		{ frame: 1, duration: 170 },
		{ frame: 2, duration: 170 },
		{ frame: 3, duration: 170 },
		{ frame: 4, duration: 170 },
		{ frame: 5, duration: 170 },
		{ frame: 6, duration: 170 },
		{ frame: 7, duration: 170 },
		{ frame: 8, duration: 170 },
		{ frame: 9, duration: 170 },
		{ frame: 10, duration: 170 },
		{ frame: 11, duration: 170 },
		{ frame: 12, duration: 170 },
	],
};
Renderer.Animations.MouthCumDripVeryFast = {
	keyframes: [
		{ frame: 0, duration: 100 },
		{ frame: 1, duration: 100 },
		{ frame: 2, duration: 100 },
		{ frame: 3, duration: 100 },
		{ frame: 4, duration: 100 },
		{ frame: 5, duration: 100 },
		{ frame: 6, duration: 100 },
		{ frame: 7, duration: 100 },
		{ frame: 8, duration: 100 },
		{ frame: 9, duration: 100 },
		{ frame: 10, duration: 100 },
		{ frame: 11, duration: 100 },
		{ frame: 12, duration: 100 },
		{ frame: 13, duration: 100 },
		{ frame: 14, duration: 100 },
		{ frame: 15, duration: 100 },
		{ frame: 16, duration: 100 },
		{ frame: 17, duration: 100 },
		{ frame: 18, duration: 100 },
		{ frame: 19, duration: 100 },
		{ frame: 20, duration: 100 },
		{ frame: 21, duration: 100 },
		{ frame: 22, duration: 100 },
		{ frame: 23, duration: 100 },
		{ frame: 24, duration: 100 },
		{ frame: 25, duration: 100 },
		{ frame: 26, duration: 100 },
		{ frame: 27, duration: 100 },
		{ frame: 28, duration: 100 },
		{ frame: 29, duration: 100 },
		{ frame: 30, duration: 100 },
		{ frame: 31, duration: 100 },
		{ frame: 32, duration: 100 },
		{ frame: 33, duration: 100 },
		{ frame: 34, duration: 100 },
		{ frame: 35, duration: 100 },
		{ frame: 36, duration: 100 },
		{ frame: 37, duration: 100 },
		{ frame: 38, duration: 100 },
		{ frame: 39, duration: 100 },
		{ frame: 40, duration: 100 },
		{ frame: 41, duration: 100 },
		{ frame: 42, duration: 100 },
		{ frame: 43, duration: 100 },
		{ frame: 44, duration: 100 },
		{ frame: 45, duration: 100 },
		{ frame: 46, duration: 100 },
		{ frame: 47, duration: 100 },
		{ frame: 48, duration: 100 },
		{ frame: 49, duration: 100 },
		{ frame: 50, duration: 100 },
		{ frame: 51, duration: 100 },
	],
};

Renderer.Animations.VaginalCumDripStart = {
	keyframes: [
		{ frame: 0, duration: 3000 },
		{ frame: 1, duration: 100 },
		{ frame: 2, duration: 100 },
		{ frame: 3, duration: 100 },
		{ frame: 4, duration: 100 },
		{ frame: 5, duration: 100 },
		{ frame: 6, duration: 100 },
	],
};
Renderer.Animations.VaginalCumDripVerySlow = {
	keyframes: [
		{ frame: 0, duration: 2500 },
		{ frame: 1, duration: 200 },
		{ frame: 2, duration: 200 },
		{ frame: 3, duration: 200 },
		{ frame: 4, duration: 200 },
		{ frame: 5, duration: 200 },
		{ frame: 6, duration: 200 },
		{ frame: 7, duration: 200 },
		{ frame: 8, duration: 200 },
		{ frame: 9, duration: 200 },
		{ frame: 10, duration: 200 },
		{ frame: 11, duration: 200 },
		{ frame: 12, duration: 200 },
		{ frame: 13, duration: 200 },
		{ frame: 14, duration: 200 },
	],
};
Renderer.Animations.VaginalCumDripSlow = {
	keyframes: [
		{ frame: 0, duration: 2000 },
		{ frame: 1, duration: 200 },
		{ frame: 2, duration: 200 },
		{ frame: 3, duration: 200 },
		{ frame: 4, duration: 200 },
		{ frame: 5, duration: 200 },
		{ frame: 6, duration: 200 },
		{ frame: 7, duration: 200 },
		{ frame: 8, duration: 200 },
		{ frame: 9, duration: 200 },
		{ frame: 10, duration: 200 },
		{ frame: 11, duration: 600 },
		{ frame: 12, duration: 100 },
		{ frame: 13, duration: 100 },
		{ frame: 14, duration: 100 },
		{ frame: 15, duration: 100 },
		{ frame: 16, duration: 100 },
		{ frame: 17, duration: 100 },
	],
};
Renderer.Animations.VaginalCumDripFast = {
	keyframes: [
		{ frame: 0, duration: 800 },
		{ frame: 1, duration: 150 },
		{ frame: 2, duration: 150 },
		{ frame: 3, duration: 150 },
		{ frame: 4, duration: 150 },
		{ frame: 5, duration: 150 },
		{ frame: 6, duration: 150 },
		{ frame: 7, duration: 150 },
		{ frame: 8, duration: 150 },
		{ frame: 9, duration: 150 },
		{ frame: 10, duration: 150 },
		{ frame: 11, duration: 150 },
	],
};
Renderer.Animations.VaginalCumDripVeryFast = {
	keyframes: [
		{ frame: 0, duration: 100 },
		{ frame: 1, duration: 100 },
		{ frame: 2, duration: 100 },
		{ frame: 3, duration: 100 },
		{ frame: 4, duration: 100 },
		{ frame: 5, duration: 100 },
		{ frame: 6, duration: 100 },
		{ frame: 7, duration: 100 },
		{ frame: 8, duration: 100 },
		{ frame: 9, duration: 100 },
		{ frame: 10, duration: 100 },
		{ frame: 11, duration: 100 },
	],
};
Renderer.Animations.coinFlip = {
	keyframes: [
		{ frame: 0, duration: 1000 },
		{ frame: 1, duration: 100 },
		{ frame: 2, duration: 100 },
		{ frame: 3, duration: 100 },
		{ frame: 4, duration: 100 },
		{ frame: 5, duration: 100 },
		{ frame: 6, duration: 500 },
	],
};
Renderer.Animations.handWarmer = {
	keyframes: [
		{ frame: 0, duration: 1000 },
		{ frame: 1, duration: 1000 },
		{ frame: 2, duration: 1000 },
		{ frame: 3, duration: 1000 },
		{ frame: 4, duration: 1000 },
		{ frame: 5, duration: 1000 },
		{ frame: 6, duration: 1000 },
		{ frame: 7, duration: 1000 },
	],
};
Renderer.Animations.looseFeathers = {
	keyframes: Array.from({ length: 25 }, (_, index) => ({
		frame: index,
		duration: index === 24 ? 1000 : 100,
	})),
};

// Both the red eye and blue eye versions use the same animation.
const wraithFlashGoalAlpha = 0.12;
const wraithFadeDelay = random(300, 700); // Rerolls only on game reload, not passage change, but that's fine.
Renderer.Animations.wraithFlash = {
	keyframes: (() => {
		const wraithFlashKeyframes = [];

		// Initial delay before fading in
		wraithFlashKeyframes.push({ frame: 0, alpha: 0, duration: wraithFadeDelay });

		// Fade in
		for (let i = 0; i < 10; i++) {
			const fadeInProgress = i / 9;
			const alpha = wraithFlashGoalAlpha * (1 / 6) * fadeInProgress;
			wraithFlashKeyframes.push({ frame: 0, alpha, duration: 11 });
		}

		for (let i = 0; i < 5; i++) {
			const fadeInProgress = i / 4;
			const alpha = wraithFlashGoalAlpha * (1 / 6 + (1 / 6) * fadeInProgress);
			wraithFlashKeyframes.push({ frame: 1, alpha, duration: 11 });
		}

		for (let i = 0; i < 5; i++) {
			const fadeInProgress = i / 4;
			const alpha = wraithFlashGoalAlpha * (1 / 3 + (1 / 6) * fadeInProgress);
			wraithFlashKeyframes.push({ frame: 2, alpha, duration: 11 });
		}

		// Fade out
		for (let i = 0; i < 20; i++) {
			const fadeInProgress = i / 19;
			const alpha = wraithFlashGoalAlpha * (1 / 2 + (1 / 2) * (1 - (1 - fadeInProgress) ** 3));
			wraithFlashKeyframes.push({ frame: 3, alpha, duration: 11 });
		}

		for (let i = 0; i < 40; i++) {
			const fadeOutProgress = i / 39;
			const alpha = wraithFlashGoalAlpha * (1 - fadeOutProgress ** 3);
			wraithFlashKeyframes.push({ frame: 3, alpha, duration: 11 });
		}

		wraithFlashKeyframes.push({ frame: 0, alpha: 0, duration: 0 });

		return wraithFlashKeyframes;
	})(),
};
// Red eye wraith has the eyes fade after the body fades away. Blue eye wraith has the necklace fade.
Renderer.Animations.wraithFlashAccent = {
	keyframes: (() => {
		const wraithFlashAccentKeyframes = [];

		// Wait for frame 3 to start in the wraithFlash animation ((10 + 5 + 5) * 11ms + wraithFadeDelay) before fading in the accent.
		wraithFlashAccentKeyframes.push({ frame: 4, alpha: 0, duration: wraithFadeDelay + 220 });

		// Fade in
		for (let i = 0; i < 20; i++) {
			const fadeInProgress = i / 19;
			const alpha = wraithFlashGoalAlpha * (0.5 + 0.5 * (1 - (1 - fadeInProgress) ** 3));
			wraithFlashAccentKeyframes.push({ frame: 4, alpha, duration: 11 });
		}

		// Hold
		wraithFlashAccentKeyframes.push({ frame: 4, alpha: wraithFlashGoalAlpha, duration: 500 });

		// Fade out
		for (let i = 0; i < 40; i++) {
			const fadeOutProgress = i / 39;
			const alpha = wraithFlashGoalAlpha * (1 - fadeOutProgress ** 3);
			wraithFlashAccentKeyframes.push({ frame: 4, alpha, duration: 11 });
		}

		wraithFlashAccentKeyframes.push({ frame: 0, alpha: 0, duration: 0 });
		return wraithFlashAccentKeyframes;
	})(),
};
// Animation that plays when the "A pale figure stands behind" text appears in the mirror, which animates for 2 seconds.
Renderer.Animations.wraithMirrorFade = {
	keyframes: (() => {
		const keyframes = [];

		// Fade in
		for (let i = 0; i < 20; i++) {
			const progress = i / 19;
			keyframes.push({ frame: 0, alpha: 0.15 * progress, duration: 25 });
		}

		// Hold
		keyframes.push({ frame: 0, alpha: 0.15, duration: 200 });

		// Fade out
		for (let i = 0; i < 52; i++) {
			const progress = i / 51;
			keyframes.push({ frame: 0, alpha: 0.15 * (1 - progress), duration: 25 });
		}

		keyframes.push({ frame: 0, alpha: 0, duration: 0 });
		return keyframes;
	})(),
};
Renderer.Animations.rain = {
	keyframes: [
		{ frame: 0, duration: 100 },
		{ frame: 1, duration: 100 },
		{ frame: 2, duration: 100 },
		{ frame: 3, duration: 100 },
		{ frame: 4, duration: 100 },
	],
};
Renderer.Animations.snowFront = {
	keyframes: [
		{ frame: 0, duration: 100 },
		{ frame: 1, duration: 100 },
		{ frame: 2, duration: 100 },
		{ frame: 3, duration: 100 },
		{ frame: 4, duration: 100 },
		{ frame: 5, duration: 100 },
		{ frame: 6, duration: 100 },
		{ frame: 7, duration: 100 },
		{ frame: 8, duration: 100 },
		{ frame: 9, duration: 100 },
		{ frame: 10, duration: 100 },
		{ frame: 11, duration: 100 },
		{ frame: 12, duration: 100 },
		{ frame: 13, duration: 100 },
		{ frame: 14, duration: 100 },
		{ frame: 15, duration: 100 },
		{ frame: 16, duration: 100 },
		{ frame: 17, duration: 100 },
		{ frame: 18, duration: 100 },
		{ frame: 19, duration: 100 },
	],
};
Renderer.Animations.snowBack = {
	keyframes: [
		{ frame: 0, duration: 100 },
		{ frame: 1, duration: 100 },
		{ frame: 2, duration: 100 },
		{ frame: 3, duration: 100 },
		{ frame: 4, duration: 100 },
		{ frame: 5, duration: 100 },
		{ frame: 6, duration: 100 },
		{ frame: 7, duration: 100 },
		{ frame: 8, duration: 100 },
		{ frame: 9, duration: 100 },
		{ frame: 10, duration: 100 },
		{ frame: 11, duration: 100 },
		{ frame: 12, duration: 100 },
		{ frame: 13, duration: 100 },
		{ frame: 14, duration: 100 },
		{ frame: 15, duration: 100 },
		{ frame: 16, duration: 100 },
		{ frame: 17, duration: 100 },
		{ frame: 18, duration: 100 },
		{ frame: 19, duration: 100 },
		{ frame: 20, duration: 100 },
		{ frame: 21, duration: 100 },
		{ frame: 22, duration: 100 },
		{ frame: 23, duration: 100 },
		{ frame: 24, duration: 100 },
		{ frame: 25, duration: 100 },
		{ frame: 26, duration: 100 },
		{ frame: 27, duration: 100 },
		{ frame: 28, duration: 100 },
		{ frame: 29, duration: 100 },
		{ frame: 30, duration: 100 },
		{ frame: 31, duration: 100 },
		{ frame: 32, duration: 100 },
		{ frame: 33, duration: 100 },
		{ frame: 34, duration: 100 },
		{ frame: 35, duration: 100 },
		{ frame: 36, duration: 100 },
		{ frame: 37, duration: 100 },
		{ frame: 38, duration: 100 },
		{ frame: 39, duration: 100 },
	],
};
Renderer.Animations.playerBreath = {
	keyframes: [
		{ frame: 3, duration: 2000 },
		{ frame: 0, duration: 200 },
		{ frame: 1, duration: 200 },
		{ frame: 2, duration: 200 },
		{ frame: 3, duration: 1400 },
	],
};
Renderer.Animations.playerBreathFast = {
	keyframes: [
		{ frame: 0, duration: 200 },
		{ frame: 1, duration: 200 },
		{ frame: 2, duration: 200 },
		{ frame: 3, duration: 1400 },
	],
};
Renderer.Animations.waterFront = {
	keyframes: [
		{ frame: 0, duration: 100 },
		{ frame: 1, duration: 100 },
		{ frame: 2, duration: 100 },
		{ frame: 3, duration: 100 },
		{ frame: 4, duration: 100 },
		{ frame: 5, duration: 100 },
		{ frame: 6, duration: 100 },
		{ frame: 7, duration: 100 },
		{ frame: 8, duration: 100 },
		{ frame: 9, duration: 100 },
		{ frame: 10, duration: 100 },
		{ frame: 11, duration: 100 },
		{ frame: 12, duration: 100 },
		{ frame: 13, duration: 100 },
		{ frame: 14, duration: 100 },
		{ frame: 15, duration: 100 },
		{ frame: 16, duration: 100 },
		{ frame: 17, duration: 100 },
		{ frame: 18, duration: 100 },
		{ frame: 19, duration: 100 },
		{ frame: 20, duration: 100 },
		{ frame: 21, duration: 100 },
		{ frame: 22, duration: 100 },
		{ frame: 23, duration: 100 },
		{ frame: 24, duration: 100 },
		{ frame: 25, duration: 100 },
		{ frame: 26, duration: 100 },
		{ frame: 27, duration: 100 },
		{ frame: 28, duration: 100 },
		{ frame: 29, duration: 100 },
		{ frame: 30, duration: 100 },
		{ frame: 31, duration: 100 },
	],
};
Renderer.Animations.waterBack = {
	keyframes: [
		{ frame: 0, duration: 800 },
		{ frame: 1, duration: 100 },
		{ frame: 2, duration: 100 },
		{ frame: 3, duration: 100 },
		{ frame: 4, duration: 100 },
		{ frame: 5, duration: 100 },
		{ frame: 6, duration: 100 },
		{ frame: 7, duration: 100 },
		{ frame: 8, duration: 100 },
		{ frame: 9, duration: 100 },
		{ frame: 10, duration: 100 },
		{ frame: 11, duration: 100 },
	],
};
Renderer.Animations.waterBreath = {
	keyframes: [
		{ frame: 0, duration: 2900 },
		{ frame: 1, duration: 100 },
		{ frame: 2, duration: 100 },
		{ frame: 3, duration: 100 },
		{ frame: 4, duration: 100 },
		{ frame: 5, duration: 100 },
		{ frame: 6, duration: 100 },
		{ frame: 7, duration: 100 },
		{ frame: 8, duration: 100 },
		{ frame: 9, duration: 100 },
		{ frame: 10, duration: 200 },
	],
};
Renderer.Animations.waterBreathFast = {
	keyframes: [
		{ frame: 0, duration: 900 },
		{ frame: 1, duration: 100 },
		{ frame: 2, duration: 100 },
		{ frame: 3, duration: 100 },
		{ frame: 4, duration: 100 },
		{ frame: 5, duration: 100 },
		{ frame: 6, duration: 100 },
		{ frame: 7, duration: 100 },
		{ frame: 8, duration: 100 },
		{ frame: 9, duration: 100 },
		{ frame: 10, duration: 200 },
	],
};
Renderer.Animations.fireFront = {
	keyframes: [
		{ frame: 0, duration: 100 },
		{ frame: 1, duration: 100 },
		{ frame: 2, duration: 100 },
		{ frame: 3, duration: 100 },
		{ frame: 4, duration: 100 },
		{ frame: 5, duration: 100 },
		{ frame: 6, duration: 100 },
		{ frame: 7, duration: 100 },
		{ frame: 8, duration: 100 },
		{ frame: 9, duration: 100 },
	],
};
Renderer.Animations.fireBack1 = {
	keyframes: [
		{ frame: 0, duration: 100 },
		{ frame: 1, duration: 100 },
		{ frame: 2, duration: 100 },
		{ frame: 3, duration: 100 },
		{ frame: 4, duration: 100 },
		{ frame: 5, duration: 100 },
		{ frame: 6, duration: 100 },
		{ frame: 7, duration: 100 },
	],
};
Renderer.Animations.fireBack2 = {
	keyframes: [
		{ frame: 0, duration: 100 },
		{ frame: 1, duration: 100 },
		{ frame: 2, duration: 100 },
		{ frame: 3, duration: 100 },
		{ frame: 4, duration: 100 },
		{ frame: 5, duration: 100 },
		{ frame: 6, duration: 100 },
		{ frame: 7, duration: 100 },
		{ frame: 8, duration: 100 },
		{ frame: 9, duration: 100 },
		{ frame: 10, duration: 100 },
		{ frame: 11, duration: 100 },
		{ frame: 12, duration: 100 },
		{ frame: 13, duration: 100 },
	],
};
Renderer.Animations.petalsFalling = {
	keyframes: [
		{ frame: 0, duration: 150 },
		{ frame: 1, duration: 150 },
		{ frame: 2, duration: 150 },
		{ frame: 3, duration: 150 },
		{ frame: 4, duration: 150 },
		{ frame: 5, duration: 150 },
		{ frame: 6, duration: 150 },
		{ frame: 7, duration: 150 },
		{ frame: 8, duration: 150 },
		{ frame: 9, duration: 150 },
		{ frame: 10, duration: 150 },
		{ frame: 11, duration: 150 },
		{ frame: 12, duration: 150 },
		{ frame: 13, duration: 150 },
		{ frame: 14, duration: 150 },
		{ frame: 15, duration: 150 },
		{ frame: 16, duration: 150 },
		{ frame: 17, duration: 150 },
	],
};

Renderer.Animations.petalsFloating = {
	keyframes: [
		{ frame: 17, duration: 100 },
		{ frame: 16, duration: 100 },
		{ frame: 15, duration: 100 },
		{ frame: 14, duration: 100 },
		{ frame: 13, duration: 100 },
		{ frame: 12, duration: 100 },
		{ frame: 11, duration: 100 },
		{ frame: 10, duration: 100 },
		{ frame: 9, duration: 100 },
		{ frame: 8, duration: 100 },
		{ frame: 7, duration: 100 },
		{ frame: 6, duration: 100 },
		{ frame: 5, duration: 100 },
		{ frame: 4, duration: 100 },
		{ frame: 3, duration: 100 },
		{ frame: 2, duration: 100 },
		{ frame: 1, duration: 100 },
		{ frame: 0, duration: 100 },
	],
};
