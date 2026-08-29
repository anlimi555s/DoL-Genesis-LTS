Weather.Renderer.Layers.add({
	name: "lightningExtra",
	animation: { updateRate: 50 },
	zIndex: 10,
	blur: null,
	effects: [
		{
			effect: "imageOverlay",
			drawCondition() {
				return (
					true ||
					(!this.renderInstance.sidebarSkyDisabled &&
						!Weather.bloodMoon &&
						this.renderInstance.orbitals.sun.factor > 0.7 &&
						this.renderInstance.orbitals.sun.factor < 0.85 &&
						Weather.overcast < 1 &&
						(Weather.precipitation === "rain" || Weather.fog > 0.4))
				);
			},
			compositeOperation: "destination-out",
			params: {
				images: {
					overlay: "img/misc/sky/effects/masks/4.png",
				},
				movement: {
					speed: 0.5,
				},
				baseAlpha: 1,
			},
		},
		{
			effect: "lightningPulse",
			drawCondition() {
				return true;
			},
			params: {
				duration: 1, // seconds
				blur: 20, // px
				color: "#ffffff",
				maxWidth: 35, // px
			},
		},
	],
});

// Lightning layers positioned relative to clouds/overcast/location images.
Weather.Renderer.Layers.add({
	name: "lightningFar",
	animation: { updateRate: 50 },
	zIndex: 4.5,
	blur: null,
	effects: [
		{
			effect: "lightning",
			drawCondition: () => Weather.enableLightning,
			params: {},
			bindings: {
				lightningFrequency() {
					return Weather.lightningFrequency / 4;
				},
			},
		},
	],
});

Weather.Renderer.Layers.add({
	name: "lightningMid",
	animation: { updateRate: 50 },
	zIndex: 5.5,
	blur: null,
	effects: [
		{
			effect: "lightning",
			drawCondition: () => Weather.enableLightning,
			params: {},
			bindings: {
				lightningFrequency() {
					return Weather.lightningFrequency / 4;
				},
			},
		},
	],
});

Weather.Renderer.Layers.add({
	name: "lightningNear",
	animation: { updateRate: 50 },
	zIndex: 6.5,
	blur: null,
	effects: [
		{
			effect: "lightning",
			drawCondition: () => Weather.enableLightning,
			params: {},
			bindings: {
				lightningFrequency() {
					return Weather.lightningFrequency / 2;
				},
			},
		},
	],
});
