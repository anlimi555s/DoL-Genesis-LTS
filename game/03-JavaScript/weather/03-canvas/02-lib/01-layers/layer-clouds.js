Weather.Renderer.Layers.add({
	name: "clouds",
	zIndex: 6,
	blur: 1.5,
	effects: [
		{
			effect: "clouds",
			drawCondition() {
				return !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				images: {
					cloud0: "img/misc/sky/clouds/0.png",
					cloud1: "img/misc/sky/clouds/1.png",
					cloud2: "img/misc/sky/clouds/2.png",
					cloud3: "img/misc/sky/clouds/3.png",
					cloud4: "img/misc/sky/clouds/4.png",
					cloud5: "img/misc/sky/clouds/5.png",
					cloud6: "img/misc/sky/clouds/6.png",
					cloud11: "img/misc/sky/clouds/11.png",
					cloud12: "img/misc/sky/clouds/12.png",
					cloud13: "img/misc/sky/clouds/13.png",
					cloud14: "img/misc/sky/clouds/14.png",
					cloud15: "img/misc/sky/clouds/15.png",
					cloud16: "img/misc/sky/clouds/16.png",
					cloud17: "img/misc/sky/clouds/17.png",
					cloud18: "img/misc/sky/clouds/18.png",
					cloud19: "img/misc/sky/clouds/19.png",
					cloud20: "img/misc/sky/clouds/20.png",
					cloud21: "img/misc/sky/clouds/21.png",
					cloud22: "img/misc/sky/clouds/22.png",
					cloud23: "img/misc/sky/clouds/23.png",
					cloud24: "img/misc/sky/clouds/24.png",
					cloud25: "img/misc/sky/clouds/25.png",
					cloud26: "img/misc/sky/clouds/26.png",
					cloud27: "img/misc/sky/clouds/27.png",
					cloud28: "img/misc/sky/clouds/28.png",
					cloud29: "img/misc/sky/clouds/29.png",
				},
				types: {
					small: ["cloud0", "cloud1", "cloud2", "cloud13", "cloud14", "cloud15", "cloud16", "cloud17"],
					medium: ["cloud3", "cloud4", "cloud5", "cloud6", "cloud11", "cloud12", "cloud18", "cloud19", "cloud20", "cloud21", "cloud22"],
					large: ["cloud23", "cloud24", "cloud25", "cloud26", "cloud27", "cloud28", "cloud29"],
				},
				bottomY: 152, // Don't generate clouds below this point (horizon)
				layers: [
					{
						speedFactor: 1,
						color: "#ffffff00",
						alpha: 1,
						height: {
							min: 48,
							max: 82,
						},
					},
					{
						speedFactor: 1.3,
						color: "#8190c777",
						alpha: 1,
						height: {
							min: 56,
							max: 96,
						},
					},
					{
						speedFactor: 1.6,
						color: "#7686c2aa",
						alpha: 1,
						height: {
							min: 64,
							max: 112,
						},
					},
				],
				movement: {
					baseSpeed: 0.5,
					leaveSpeed: 1,
				},
			},
			bindings: {
				weather() {
					return Weather.current;
				},
				weatherType() {
					return Weather.current;
				},
				cloudAlpha() {
					return Weather.current.cloudAlpha;
				},
			},
		},
		{
			effect: "colorOverlay",
			drawCondition() {
				return !this.renderInstance.sidebarSkyDisabled;
			},
			compositeOperation: "source-atop",
			params: {
				dayStateColors: {
					nightDark: "#00001cea",
					nightBright: "#0d0d26da",
					day: "#00000000",
					dawnDusk: "#a36d22a5",
					bloodMoon: "#380101e5",
				},
				darkenTarget: "#000000",
			},
			bindings: {
				sunFactor() {
					return this.renderInstance.orbitals.sun.factor;
				},
				moonFactor() {
					return this.renderInstance.moonBrightnessFactor;
				},
				bloodMoon() {
					return Weather.bloodMoon;
				},
				darkenFactor() {
					return Weather.getWeatherDarkenFactor(Weather.current.darkenFactor.clouds);
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
				maxDesaturate: 0.2,
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
	name: "overcastClouds",
	zIndex: 5,
	effects: [
		{
			effect: "overcast",
			drawCondition() {
				return !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				images: {
					overcast: "img/misc/sky/clouds/overcast/0.png",
				},
				movement: {
					speed: 0.2,
				},
				baseAlpha: 1,
			},
			bindings: {
				overcastFactor() {
					return Weather.overcast;
				},
				weather() {
					return Weather.current;
				},
			},
		},
		{
			effect: "colorOverlay",
			drawCondition() {
				return !this.renderInstance.sidebarSkyDisabled;
			},
			compositeOperation: "source-atop",
			params: {
				dayStateColors: {
					nightDark: "#000412ee",
					nightBright: "#000412dd",
					day: "#97a9e8aa",
					dawnDusk: "#7a511895",
					bloodMoon: "#380101e5",
				},
				darkenTarget: "#000000",
			},
			bindings: {
				sunFactor() {
					return this.renderInstance.orbitals.sun.factor * interpolate(1, 0.8, Math.max(0, normalise(this.renderInstance.orbitals.sun.factor, 1, 0)));
				},
				moonFactor() {
					return this.renderInstance.moonBrightnessFactor;
				},
				bloodMoon() {
					return Weather.bloodMoon;
				},
				darkenFactor() {
					return Weather.getWeatherDarkenFactor(Weather.current.darkenFactor.overcastClouds);
				},
			},
		},
	],
});

Weather.Renderer.Layers.add({
	name: "cirrusClouds",
	zIndex: 4,
	blur: {
		max: 2,
		factor: () => Weather.overcast,
	},
	effects: [
		{
			effect: "cirrus",
			drawCondition() {
				return !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				images: {
					cloud0: "img/misc/sky/clouds/cirrus/0.png",
					cloud1: "img/misc/sky/clouds/cirrus/1.png",
					cloud2: "img/misc/sky/clouds/cirrus/2.png",
				},
				height: {
					min: -12,
					max: 42,
				},
				count: {
					min: 1,
					max: 3,
				},
				movement: {
					speed: 0.2,
				},
				minAlpha: 0.25,
				baseAlpha: 0.8,
			},
			bindings: {
				weather() {
					return Weather.current;
				},
				weatherType() {
					return Weather.current;
				},
				factor() {
					return interpolate(this.minAlpha, 1, normalise(Math.min(this.renderInstance.orbitals.sun.factor, 0), 0, -1));
				},
			},
		},
		{
			effect: "colorOverlay",
			drawCondition() {
				return !this.renderInstance.sidebarSkyDisabled && Weather.current.darkenFactor.cirrusClouds > 0;
			},
			compositeOperation: "source-atop",
			params: {
				dayStateColors: {
					nightDark: "#00001ce6",
					nightBright: "#000412cc",
					day: "#ffe9d300",
					dawnDusk: "#a36d22a5",
					bloodMoon: "#380101e5",
				},
				darkenTarget: "#000000",
			},
			bindings: {
				sunFactor() {
					return this.renderInstance.orbitals.sun.factor;
				},
				moonFactor() {
					return this.renderInstance.moonBrightnessFactor;
				},
				bloodMoon() {
					return Weather.bloodMoon;
				},
				darkenFactor() {
					return Weather.getWeatherDarkenFactor(Weather.current.darkenFactor.cirrusClouds);
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
				maxDesaturate: 0.7,
			},
			bindings: {
				factor() {
					const isDaytime = Time.dayState === "dawn" || Time.dayState === "day" || Time.dayState === "dusk";
					return isDaytime ? Weather.fog : 0;
				},
			},
		},
	],
});
