Weather.Renderer.Layers.add({
	name: "moon",
	zIndex: 3, // zIndex value
	blur: {
		max: () => (Weather.bloodMoon ? 3 : 3),
		factor: () => normalise(Weather.overcast, 1, 0.4),
	},
	effects: [
		{
			/* Regular moon */
			effect: "moonWithPhases",
			drawCondition() {
				return !Weather.bloodMoon && !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				opacity: {
					// Defines the opacity of the whole moon (including shadow part)
					// min is when dayfactor is -1 while max is when factor is +1
					min: 0.98,
					max: 0.25,
				},
				glow: {
					colorDay: "#ffffff00",
					colorNight: "#ffffff75",
					size: 9,
				},
				shadow: {
					opacity: {
						// Defines if the opacity of the shadow part of the moon - if opacity is 0, the moon is completely invisible when not lit
						// min is when dayfactor is -1 while max is when factor is +1
						min: 0.04,
						max: 0.05,
					},
					// Angle of the moon shadow generation
					angle: 10,
				},
				images: { orbital: "img/misc/sky/moon.png" },
			},
			bindings: {
				position() {
					return this.renderInstance.orbitals.moon.position;
				},
				factor() {
					return this.renderInstance.orbitals.moon.factor;
				},
				dayFactor() {
					return this.renderInstance.orbitals.sun.factor;
				},
				moonPhaseFraction() {
					return Time.date.moonPhaseFraction;
				},
			},
		},
		{
			effect: "colorOverlay",
			drawCondition() {
				return !this.renderInstance.sidebarSkyDisabled && !Weather.bloodMoon && Weather.current.darkenFactor.moon > 0;
			},
			compositeOperation: "source-atop",
			params: {
				darkenTarget: "#000000",
			},
			bindings: {
				darkenFactor() {
					return Weather.getWeatherDarkenFactor(Weather.current.darkenFactor.moon);
				},
			},
		},
		{
			/* Blood moon */
			effect: "skyOrbital",
			drawCondition() {
				return Weather.bloodMoon && !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				images: { orbital: "img/misc/sky/blood-moon.png" },
			},
			bindings: {
				position() {
					return this.renderInstance.orbitals.bloodMoon.position;
				},
			},
		},
		{
			effect: "colorOverlay",
			drawCondition() {
				return !this.renderInstance.sidebarSkyDisabled && Weather.bloodMoon && Weather.current.darkenFactor.moon > 0;
			},
			compositeOperation: "source-atop",
			params: {
				darkenTarget: "#000000",
			},
			bindings: {
				darkenFactor() {
					return Weather.getWeatherDarkenFactor(Weather.current.darkenFactor.moon);
				},
			},
		},
		{
			effect: "innerRadialGlow",
			drawCondition() {
				return Weather.bloodMoon && !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				innerRadius: 7,
				colorInside: { min: "#fd634d00", max: "#fd634d00" },
				colorOutside: { min: "#fd634d44", max: "#fd634d44" },
				factor: 1,
			},
			bindings: {
				position() {
					return this.renderInstance.orbitals.bloodMoon.position;
				},
				diameter() {
					const moonLayer = this.renderInstance.layers.get("moon");
					const orbitalEffect = moonLayer.effects.find(effect => effect.effectName === "skyOrbital");
					return orbitalEffect?.images?.orbital?.width;
				},
			},
		},
		{
			effect: "outerRadialGlow",
			drawCondition() {
				return Weather.bloodMoon && !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				outerRadius: 45, // The radius of the outer glow
				colorInside: { dark: "#ad3a2133", med: "#ad3a2133", bright: "#ad3a2133" },
				colorOutside: { dark: "#ad3a2100", med: "#ad3a2100", bright: "#ad3a2100" },
			},
			bindings: {
				position() {
					return this.renderInstance.orbitals.bloodMoon.position;
				},
				factor() {
					return this.renderInstance.orbitals.bloodMoon.factor;
				},
				diameter() {
					const moonLayer = this.renderInstance.layers.get("moon");
					const orbitalEffect = moonLayer.effects.find(effect => effect.effectName === "skyOrbital");
					return orbitalEffect?.images?.orbital?.width;
				},
			},
		},
	],
});

Weather.Renderer.Layers.add({
	name: "bloodGlow",
	zIndex: 11,
	effects: [
		{
			effect: "outerRadialGlow",
			drawCondition() {
				return Weather.bloodMoon;
			},
			params: {
				outerRadius: 16, // The radius of the outer glow
				colorInside: { dark: "#b0131365", med: "#b0131365", bright: "#b0131365" },
				colorOutside: { dark: "#ad3a2100", med: "#ad3a2100", bright: "#ad3a2100" },
				diameter: 6,
			},
			bindings: {
				position() {
					return this.renderInstance.orbitals.bloodMoon.position;
				},
				factor() {
					return Math.min(Weather.overcast - (1 - this.renderInstance.orbitals.bloodMoon.factor), 0);
				},
			},
		},
	],
});
