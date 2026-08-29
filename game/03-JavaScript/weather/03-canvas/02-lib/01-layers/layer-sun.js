Weather.Renderer.Layers.add({
	name: "sun",
	zIndex: 2,
	blur: {
		max: 5,
		factor: () => normalise(Weather.overcast, 1, 0.1),
	},
	effects: [
		{
			effect: "skyOrbital",
			drawCondition() {
				return this.renderInstance.orbitals.sun.factor > -0.5 && !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				images: { orbital: "img/misc/sky/sun.png" },
			},
			bindings: {
				position() {
					return this.renderInstance.orbitals.sun.position;
				},
			},
		},
		{
			effect: "colorOverlay",
			drawCondition() {
				return !this.renderInstance.sidebarSkyDisabled && Weather.current.darkenFactor.sun > 0;
			},
			compositeOperation: "source-atop",
			params: {
				darkenTarget: "#000000",
			},
			bindings: {
				darkenFactor() {
					return Weather.getWeatherDarkenFactor(Weather.current.darkenFactor.sun);
				},
			},
		},
		{
			effect: "outerRadialGlow",
			drawCondition() {
				return this.renderInstance.orbitals.sun.factor > -0.5 && !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				outerRadius: 24, // The radius of the outer glow
				colorInside: { dark: "#f07218ee", med: "#f07218ee", bright: "#f2fad766" },
				colorOutside: { dark: "#f0721800", med: "#f0721800", bright: "#f2fad700" },
			},
			bindings: {
				position() {
					return this.renderInstance.orbitals.sun.position;
				},
				factor() {
					return this.renderInstance.orbitals.sun.factor;
				},
				diameter() {
					const sunLayer = this.renderInstance.layers.get("sun");
					const orbitalEffect = sunLayer.effects.find(effect => effect.effectName === "skyOrbital");
					return orbitalEffect.images.orbital.width;
				},
			},
		},
		{
			effect: "desaturate",
			drawCondition() {
				return !this.renderInstance.sidebarSkyDisabled;
			},
			compositeOperation: "copy",
			params: {
				maxDesaturate: 0.4,
			},
			bindings: {
				factor() {
					return Time.dayState === "day" || Time.dayState === "dawn" ? Weather.fog : 0;
				},
			},
		},
	],
});

Weather.Renderer.Layers.add({
	name: "sunGlow",
	zIndex: 12,
	effects: [
		{
			effect: "outerRadialGlow",
			drawCondition() {
				return this.renderInstance.orbitals.sun.factor > -0.7 && !Weather.isOvercast && !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				outerRadius: 64, // The radius of the outer glow
				colorInside: { dark: "#fd634d00", med: "#faff8710", bright: "#fbffdb55" },
				colorOutside: { dark: "#fd634d00", med: "#faff8700", bright: "#fbffdb00" },
				cutCenter: false,
				diameter: 28,
			},
			bindings: {
				position() {
					return this.renderInstance.orbitals.sun.position;
				},
				factor() {
					return this.renderInstance.orbitals.sun.factor;
				},
			},
		},
	],
});
