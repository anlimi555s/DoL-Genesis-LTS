Weather.Renderer.Layers.add({
	name: "bannerSky",
	zIndex: 0,
	effects: [
		{
			/* Night sky */
			effect: "skyGradiant",
			drawCondition() {
				return !Weather.bloodMoon && !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				radius: 256,
			},
			bindings: {
				color() {
					// Make it brighter when moon is lit
					const colorCloseMin = ColourUtils.interpolateColor("#00001c00", "#1c1c6100", this.renderInstance.moonBrightnessFactor);
					const colorClose = ColourUtils.interpolateColor("#00001c", "#1c1c61", this.renderInstance.moonBrightnessFactor);
					return {
						colorMin: { close: colorCloseMin, far: "#00001c00" },
						colorMed: { close: colorClose, far: "#00001c" },
						colorMax: { close: colorClose, far: "#00001c" },
					};
				},
				position() {
					return this.renderInstance.orbitals.moon.position;
				},
				factor() {
					return this.renderInstance.orbitals.moon.factor;
				},
			},
		},
		{
			/* Blood sky */
			effect: "skyGradiant",
			drawCondition() {
				return Weather.bloodMoon && !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				color: {
					colorMin: { close: "#4d000000", far: "#21070700" },
					colorMed: { close: "#4d0000", far: "#210707" },
					colorMax: { close: "#4d0000", far: "#210707" },
				},
				radius: 256,
			},
			bindings: {
				position() {
					return this.renderInstance.orbitals.bloodMoon.position;
				},
				factor() {
					return this.renderInstance.orbitals.bloodMoon.factor;
				},
			},
		},
		{
			/* Day sky */
			effect: "skyGradiant",
			drawCondition() {
				return !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				color: {
					colorMin: { close: "#14145200", far: "#00001c00" },
					colorMed: { close: "#d47d12", far: "#6c6d94" },
					colorMax: { close: "#d4d7ff", far: "#4692d4" },
				},
				radius: 384,
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
		{
			effect: "colorOverlay",
			drawCondition() {
				return !this.renderInstance.sidebarSkyDisabled && Weather.current.darkenFactor.sky > 0;
			},
			compositeOperation: "source-atop",
			params: {
				darkenTarget: "#000000",
			},
			bindings: {
				darkenFactor() {
					return Weather.getWeatherDarkenFactor(Weather.current.darkenFactor.sky);
				},
			},
		},
	],
});

Weather.Renderer.Layers.add({
	name: "bannerStarField",
	zIndex: 1,
	blur: {
		max: 3,
		factor: () => normalise(Weather.overcast, 1, 0.4),
	},
	effects: [
		{
			effect: "skyStarField",
			drawCondition() {
				return this.renderInstance.orbitals.sun.factor < 0.75 && !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				area: 1000,
				starsConfig: {
					minDistance: 10, // Min distance between stars in pixels
					count: 850,
					colorRange: ["#8272cc", "#b872f2", "#5f98b3", "#ffffff"],
				},
				pivot: { x: 432, y: 128 },
				rotationClockwise: true, // Set false for anti-clockwise
				opacity: {
					night: 0.85,
					day: 0,
					bloodMoon: 0.5,
				},
				spriteOptions: {
					square: {
						weight: 10, // Chance of square non-sprite 2x2 stars
					},
					star0: {
						weight: 0.2,
						glowSize: 5,
					},
					star1: {
						weight: 0.2,
						glowSize: 5,
					},
					star2: {
						weight: 0.08,
						glowSize: 5,
					},
					star3: {
						weight: 0.015,
						glowSize: 7,
						glowColor: "#ffffff",
					},
					star4: {
						weight: 0.01,
						randomColor: false,
						glowSize: 6,
						glowColor: "#4a3da4aa",
					},
				},
				// Chance of these appearing is set in the weights above
				images: {
					star0: "img/misc/sky/stars/star-0.png",
					star1: "img/misc/sky/stars/star-1.png",
					star2: "img/misc/sky/stars/star-2.png",
					star3: "img/misc/sky/stars/star-3.png",
					star4: "img/misc/sky/stars/star-4.png",
				},
			},
			bindings: {
				alpha() {
					const factor = this.renderInstance.orbitals.sun.factor;
					const nightAlpha = Weather.bloodMoon ? this.opacity.bloodMoon : this.opacity.night;
					const dayFactor = Math.clamp(factor + 0.4, 0, 1);
					const baseAlpha = interpolate(nightAlpha, this.opacity.day, dayFactor);

					// Fade out stars as precipitation intensity increases, down to a min of 0.2
					const precipFactor = inverseLerp(Weather.precipitationIntensity, 1.5, 3.5);
					const precipFade = Math.clamp(interpolate(1, 0.2, precipFactor), 0.2, 1);
					return baseAlpha * precipFade;
				},
				rotation() {
					return Time.date.fractionOfDay * 360;
				},
				moonPosition() {
					return this.renderInstance.orbitals.moon.position;
				},
				moonDiameter() {
					return this.renderInstance.layers.get("moon").effects[0].images.orbital.width;
				},
			},
		},
	],
});

Weather.Renderer.Layers.add({
	name: "bannerSunGlow",
	zIndex: 12,
	effects: [
		{
			effect: "outerRadialGlow",
			drawCondition() {
				return this.renderInstance.orbitals.sun.factor > -0.7 && !Weather.isOvercast && !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				outerRadius: 82, // The radius of the outer glow
				colorInside: { dark: "#fd634d00", med: "#faff8710", bright: "#fbffdb70" },
				colorOutside: { dark: "#fd634d00", med: "#faff8700", bright: "#fbffdb00" },
				cutCenter: false,
				diameter: 32,
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

/* eslint-disable no-undef */
Weather.Renderer.Layers.add({
	name: "bannerClouds",
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
					cloud0: "img/misc/sky/clouds/7.png",
					cloud1: "img/misc/sky/clouds/8.png",
					cloud2: "img/misc/sky/clouds/9.png",
					cloud3: "img/misc/sky/clouds/6.png",
					cloud4: "img/misc/sky/clouds/7.png",
					cloud5: "img/misc/sky/clouds/8.png",
					cloud6: "img/misc/sky/clouds/9.png",
					cloud7: "img/misc/sky/clouds/10.png",
					cloud25: "img/misc/sky/clouds/25.png",
					cloud26: "img/misc/sky/clouds/26.png",
					cloud27: "img/misc/sky/clouds/27.png",
					cloud28: "img/misc/sky/clouds/28.png",
					cloud29: "img/misc/sky/clouds/29.png",
					cloud30: "img/misc/sky/clouds/30.png",
					cloud31: "img/misc/sky/clouds/31.png",
				},
				types: {
					small: ["cloud25", "cloud26", "cloud4", "cloud5"],
					medium: ["cloud25", "cloud26", "cloud27", "cloud28", "cloud29", "cloud30", "cloud31"],
					large: ["cloud4", "cloud5", "cloud6", "cloud7"],
				},
				bottomY: 216, // Don't generate clouds below this point (horizon)
				layers: [
					{
						speedFactor: 1,
						color: "#ffffff00",
						alpha: 1,
						height: {
							min: 48,
							max: 102,
						},
					},
					{
						speedFactor: 1.3,
						color: "#8190c777",
						alpha: 1,
						height: {
							min: 56,
							max: 116,
						},
					},
					{
						speedFactor: 1.6,
						color: "#7686c2aa",
						alpha: 1,
						height: {
							min: 64,
							max: 132,
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
				return !this.renderInstance.sidebarSkyDisabled && Weather.current.darkenFactor.clouds > 0;
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
	],
});

Weather.Renderer.Layers.add({
	name: "bannerOvercastClouds",
	animation: { updateRate: 50 },
	zIndex: 5,
	effects: [
		{
			effect: "overcast",
			drawCondition() {
				return !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				images: {
					overcast: "img/misc/sky/clouds/overcast/1.png",
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
		{
			effect: "lightningPulse",
			compositeOperation: "source-atop",
			drawCondition() {
				return true;
			},
			params: {
				duration: 1, // seconds
				blur: 20, // px
				color: "#ffffffaa",
				maxWidth: 35, // px
			},
		},
	],
});

Weather.Renderer.Layers.add({
	name: "bannerCirrusClouds",
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
					max: 64,
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
	],
});

Weather.Renderer.Layers.add({
	name: "bannerPrecipitation",
	zIndex: 10,
	animation: { updateRate: 30 },
	effects: [
		{
			effect: "particleRain",
			drawCondition() {
				return Weather.precipitation === "rain";
			},
			params: {
				sunTint: "#97a9e8aa",
				moonTint: "#000412dd",
				dawnDuskTint: "#7a511895",
				groundDayTint: "#ffffffbb",
				groundNightTint: "#38517a",
				groundDawnDuskTint: "#a08160",
				groundTownColor: "#f6e3ff",

				dropLength: 2.5,
				dropWidth: 0.3,
				baseAlpha: 1,
				windStrength: 1,
				windAngle: 0.2,

				splashTriggerTop: 20,
				splashTriggerBottom: 10,
			},
			bindings: {
				// dynamically drive intensity, speed, tint, etc.
				dropCount() {
					return Weather.precipitationIntensity * 250;
				},
				dropLength() {
					return Weather.current.rain?.dropLength ?? 0;
				},
				dropWidth() {
					return Weather.current.rain?.dropWidth ?? 0;
				},
				dropSpeed() {
					return Weather.current.rain?.dropSpeed * 1.2;
				},
				windAngle() {
					return Weather.current.windAngle ?? 0;
				},
				topColor() {
					const sunF = this.renderInstance.orbitals.sun.factor;
					const moonF = this.renderInstance.orbitals.moon.factor;

					const nightPhase = ColourUtils.interpolateColor("#000000", this.moonTint, moonF);
					return ColourUtils.interpolateTripleColor(nightPhase, this.dawnDuskTint, this.sunTint, sunF);
				},
				backgroundLight() {
					if (Weather.bloodMoon || !(Time.hour >= setup.SkySettings.lightsTime.on || Time.hour < setup.SkySettings.lightsTime.off)) {
						return false;
					}
					return true;
				},
				bottomColor() {
					if (this.backgroundLight) return this.groundTownColor;

					const sunF = this.renderInstance.orbitals.sun.factor;
					const moonF = this.renderInstance.orbitals.moon.factor;

					const nightPhase = ColourUtils.interpolateColor("#000000", this.groundNightTint, moonF);
					return ColourUtils.interpolateTripleColor(nightPhase, this.groundDawnDuskTint, this.groundDayTint, sunF);
				},
			},
		},
		{
			effect: "particleRain",
			drawCondition() {
				return Weather.precipitation === "rain";
			},
			params: {
				sunTint: "#97a9e8aa",
				moonTint: "#000412dd",
				dawnDuskTint: "#7a511895",
				groundDayTint: "#ffffffbb",
				groundNightTint: "#38517a",
				groundDawnDuskTint: "#b39b82",
				groundTownColor: "#f6e3ff",

				dropLength: 4.5,
				dropWidth: 0.5,
				baseAlpha: 1,
				windStrength: 1,
				windAngle: 0.15,

				splashTriggerTop: 10,
				splashTriggerBottom: 0,
			},
			bindings: {
				// dynamically drive intensity, speed, tint, etc.
				dropCount() {
					return Weather.precipitationIntensity * 100;
				},
				dropLength() {
					return Weather.current.rain?.dropLength ?? 0;
				},
				dropWidth() {
					return Weather.current.rain?.dropWidth ?? 0;
				},
				dropSpeed() {
					return Weather.current.rain?.dropSpeed * 1.2;
				},
				windAngle() {
					return Weather.current.windAngle ?? 0;
				},
				topColor() {
					const sunF = this.renderInstance.orbitals.sun.factor;
					const moonF = this.renderInstance.orbitals.moon.factor;

					const nightPhase = ColourUtils.interpolateColor("#000000", this.moonTint, moonF);
					return ColourUtils.interpolateTripleColor(nightPhase, this.dawnDuskTint, this.sunTint, sunF);
				},
				backgroundLight() {
					if (Weather.bloodMoon || !(Time.hour >= setup.SkySettings.lightsTime.on || Time.hour < setup.SkySettings.lightsTime.off)) {
						return false;
					}
					return true;
				},
				bottomColor() {
					if (this.backgroundLight) return this.groundTownColor;
					const sunF = this.renderInstance.orbitals.sun.factor;
					const moonF = this.renderInstance.orbitals.moon.factor;

					const nightPhase = ColourUtils.interpolateColor("#000000", this.groundNightTint, moonF);
					return ColourUtils.interpolateTripleColor(nightPhase, this.groundDawnDuskTint, this.groundDayTint, sunF);
				},
			},
		},
		{
			effect: "colorOverlay",
			drawCondition() {
				return Weather.precipitation === "rain" && Weather.current.darkenFactor.precipitation > 0;
			},
			compositeOperation: "source-atop",
			bindings: {
				darkenFactor() {
					return Weather.getWeatherDarkenFactor(Weather.current.darkenFactor.precipitation);
				},
			},
		},
		{
			effect: "particleSnow",
			drawCondition() {
				return Weather.precipitation === "snow" && !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				sunTint: "#ffffff",
				moonTint: "#7895c4bb",
				dawnDuskTint: "#dbb695bb",
				groundDayTint: "#ffffff",
				groundNightTint: "#7895c4bb",
				groundDawnDuskTint: "#dbb695bb",
				groundTownColor: "#ffd27fbb",
				windStrength: 0.4,
				windAngle: 0,
				dropSize: 0.66,
				baseAlpha: 0.9,
				dropSpeed: 8,

				pileTriggerTop: 20,
				pileTriggerBottom: 10,

				wobbleAmplitude: 0.3,
				wobbleFrequency: 0.8,

				pixelFadeTime: 0.7,
			},
			bindings: {
				dropCount() {
					return Weather.precipitationIntensity * 80 - 55;
				},
				topColor() {
					const sunF = this.renderInstance.orbitals.sun.factor;
					const moonF = this.renderInstance.orbitals.moon.factor;

					const nightPhase = ColourUtils.interpolateColor("#000000", this.moonTint, moonF);
					return ColourUtils.interpolateTripleColor(nightPhase, this.dawnDuskTint, this.sunTint, sunF);
				},
				backgroundLight() {
					if (Weather.bloodMoon || !(Time.hour >= setup.SkySettings.lightsTime.on || Time.hour < setup.SkySettings.lightsTime.off)) {
						return false;
					}
					return true;
				},
				bottomColor() {
					if (this.backgroundLight) return this.groundTownColor;

					const sunF = this.renderInstance.orbitals.sun.factor;
					const moonF = this.renderInstance.orbitals.moon.factor;

					const nightPhase = ColourUtils.interpolateColor("#000000", this.groundNightTint, moonF);
					return ColourUtils.interpolateTripleColor(nightPhase, this.groundDawnDuskTint, this.groundDayTint, sunF);
				},
			},
		},
		{
			effect: "particleSnow",
			drawCondition() {
				return Weather.precipitation === "snow" && !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				sunTint: "#ffffff",
				moonTint: "#7895c4bb",
				dawnDuskTint: "#dbb695bb",
				groundDayTint: "#ffffff",
				groundNightTint: "#7895c4bb",
				groundDawnDuskTint: "#dbb695bb",
				groundTownColor: "#ffd27fbb",
				windStrength: 0.4,
				windAngle: 0.1,
				dropSize: 1,
				baseAlpha: 1,
				dropSpeed: 13,

				pileTriggerTop: 10,
				pileTriggerBottom: 0,

				wobbleAmplitude: 0.3,
				wobbleFrequency: 0.8,

				pixelFadeTime: 1,
				snowGlare: true,
			},
			bindings: {
				dropCount() {
					return Weather.precipitationIntensity * 80 - 55;
				},
				topColor() {
					const sunF = this.renderInstance.orbitals.sun.factor;
					const moonF = this.renderInstance.orbitals.moon.factor;

					const nightPhase = ColourUtils.interpolateColor("#000000", this.moonTint, moonF);
					return ColourUtils.interpolateTripleColor(nightPhase, this.dawnDuskTint, this.sunTint, sunF);
				},
				backgroundLight() {
					if (Weather.bloodMoon || !(Time.hour >= setup.SkySettings.lightsTime.on || Time.hour < setup.SkySettings.lightsTime.off)) {
						return false;
					}
					return true;
				},
				bottomColor() {
					if (this.backgroundLight) return this.groundTownColor;

					const sunF = this.renderInstance.orbitals.sun.factor;
					const moonF = this.renderInstance.orbitals.moon.factor;

					const nightPhase = ColourUtils.interpolateColor("#000000", this.groundNightTint, moonF);
					return ColourUtils.interpolateTripleColor(nightPhase, this.groundDawnDuskTint, this.groundDayTint, sunF);
				},
			},
		},
		{
			effect: "imageOverlay",
			drawCondition() {
				return (
					!this.renderInstance.sidebarSkyDisabled && Weather.overcast > 0.5 && Weather.precipitationIntensity >= 1 && Weather.precipitation === "snow"
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
				baseAlpha: 0.95,
			},
		},
	],
});

Weather.Renderer.Layers.add({
	name: "fogOverlay",
	animation: { updateRate: 50 },
	zIndex: 15,
	compositeOperation: "source-over",
	effects: [
		{
			effect: "particleFog",
			drawCondition() {
				return !this.renderInstance.sidebarSkyDisabled && Weather.fog > 0.2;
			},
			params: {
				scale: 150,
				scaleVariance: 50,
				minVel: 0.5,
				maxVel: 1.2,
				fogDistributionCurve: 1,

				images: {
					fog: "img/misc/locations/banner/fog.png",
				},
			},
			bindings: {
				maxParticleCount() {
					return 80 * Weather.fog;
				},
			},
		},
		{
			effect: "colorOverlay",
			drawCondition() {
				return !this.renderInstance.sidebarSkyDisabled && Weather.fog > 0.2 && Weather.current.darkenFactor.fog > 0;
			},
			compositeOperation: "source-atop",
			params: {
				dayStateColors: {
					nightDark: "#595971",
					nightBright: "#8d8da5",
					day: "#fffffc",
					dawnDusk: "#bb9776",
					bloodMoon: "#380101",
				},
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
					return Weather.getWeatherDarkenFactor(Weather.current.darkenFactor.fog);
				},
			},
		},
	],
});

Weather.Renderer.Layers.add({
	name: "rainbow",
	zIndex: 5.5,
	blur: null,
	effects: [
		{
			effect: "rainbow",
			drawCondition() {
				return (
					!this.renderInstance.sidebarSkyDisabled &&
					!Weather.bloodMoon &&
					this.renderInstance.orbitals.sun.factor > 0.6 &&
					this.renderInstance.orbitals.sun.factor < 0.85 &&
					Weather.overcast < 1 &&
					Weather.precipitationIntensity <= 1.3 && // precipitationIntensity for lightPrecipitation
					Weather.precipitation === "rain" &&
					Weather.fog > 0.2
				);
			},
			params: {
				baseOpacity: 0.4,
				thickness: 20,
				innerRadius: 150,
				blur: 2,
				colors: ["#8B00FF", "#0000FF", "#00FF00", "#FFFF00", "#FF7F00", "#FF0000"],
				offsetX: 160,
				offsetY: 0,
			},
			bindings: {
				direction() {
					return this.renderInstance.orbitals.sun.position.x * 2 < this.canvas.element.width / 2 ? "left" : "right";
				},
				arcDegrees() {
					return Time.date.timeStamp % 4 ? 90 : 180;
				},
			},
		},
		{
			effect: "imageOverlay",
			drawCondition() {
				return (
					!this.renderInstance.sidebarSkyDisabled &&
					!Weather.bloodMoon &&
					this.renderInstance.orbitals.sun.factor > 0.7 &&
					this.renderInstance.orbitals.sun.factor < 0.85 &&
					Weather.overcast < 1 &&
					(Weather.precipitation === "rain" || Weather.fog > 0.4)
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
	],
});

Weather.Renderer.Layers.add({
	name: "lightning",
	animation: { updateRate: 50 },
	zIndex: 9,
	effects: [
		{
			effect: "lightning",
			drawCondition: () => Weather.enableLightning,
			params: {},
			bindings: {
				lightningFrequency() {
					return Weather.lightningFrequency;
				},
			},
		},
	],
});
