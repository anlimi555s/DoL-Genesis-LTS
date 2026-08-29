Weather.Renderer.Layers.add({
	name: "precipitation",
	zIndex: 10,
	animation: { updateRate: 30 },
	effects: [
		{
			effect: "particleRain",
			drawCondition() {
				return Weather.precipitation === "rain" && !this.renderInstance.sidebarSkyDisabled;
			},
			params: {
				sunTint: "#97a9e8aa",
				moonTint: "#000412dd",
				dawnDuskTint: "#7a511895",
				groundDayTint: "#ffffffbb",
				groundNightTint: "#6c86b19d",
				groundDawnDuskTint: "#97836e",
				groundTownColor: "#f6e3ff",

				baseAlpha: 1,
				windStrength: 1,
				windAngle: 0.2,
				splashTriggerTop: 20,
				splashTriggerBottom: 0,
			},
			bindings: {
				dropCount() {
					return Weather.precipitationIntensity * 140 - 120;
				},
				dropLength() {
					return Weather.current.rain?.dropLength ?? 0;
				},
				dropWidth() {
					return Weather.current.rain?.dropWidth ?? 0;
				},
				dropSpeed() {
					return Weather.current.rain?.dropSpeed ?? 0;
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
				bottomColor() {
					const sunF = this.renderInstance.orbitals.sun.factor;
					const moonF = this.renderInstance.orbitals.moon.factor;
					const nightPhase = ColourUtils.interpolateColor("#000000", this.groundNightTint, moonF);
					return ColourUtils.interpolateTripleColor(nightPhase, this.groundDawnDuskTint, this.groundDayTint, sunF);
				},
				backgroundLight() {
					if (Weather.bloodMoon || !(Time.hour >= setup.SkySettings.lightsTime.on || Time.hour < setup.SkySettings.lightsTime.off)) {
						return false;
					}
					const locations = [
						"alley",
						"brothel",
						"canal",
						"compound",
						"dance_studio",
						"dilapitaded_shop",
						"estate",
						"factory",
						"home",
						"hospital",
						"kylar_manor",
						"landfill",
						"market",
						"museum",
						"office",
						"park",
						"police_station",
						"pool",
						"pub",
						"school",
						"sewers",
						"shopping_centre",
						"spa",
						"studio",
						"strip_club",
						"temple",
						"town",
					];
					return locations.includes(V.location);
				},
				backgroundTint() {
					return Weather.bloodMoon ? "#eb3b2fee" : "#f7d088aa";
				},
				// Override based on per-location config
				enableSplashes() {
					return setup.LocationImages[setup.Locations.get()].weather.rainSplashEnabled;
				},
				splashTriggerTop() {
					return setup.LocationImages[setup.Locations.get()].weather.groundBounds.splashes.top;
				},
				splashTriggerBottom() {
					return setup.LocationImages[setup.Locations.get()].weather.groundBounds.splashes.bottom - 1;
				},
				splashIntensity() {
					const splashBounds = setup.LocationImages[setup.Locations.get()]?.weather?.groundBounds?.splashes;
					const bandSize = Math.max(0, splashBounds?.top - splashBounds?.bottom);
					if (bandSize >= 15) return 1;
					return lerp(Math.clamp(bandSize / 15, 0.5, 1), 0.5, 1);
				},
			},
		},
		{
			effect: "colorOverlay",
			drawCondition() {
				return Weather.precipitation === "rain" && Weather.current.darkenFactor.precipitation > 0;
			},
			compositeOperation: "source-atop",
			params: {
				darkenTarget: "#181327",
			},
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
				windAngle: 0.1,
				dropSize: 0.6,
				baseAlpha: 0.9,
				dropSpeed: 8,

				pileTriggerTop: 1,
				pileTriggerBottom: 0,

				wobbleAmplitude: 0.2,
				wobbleFrequency: 0.5,

				pixelFadeTime: 0.7,
			},
			bindings: {
				dropCount() {
					return Weather.precipitationIntensity * 60 - 35;
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
				pileTriggerTop() {
					return setup.LocationImages[setup.Locations.get()].weather.groundBounds.splashes.top;
				},
				pileTriggerBottom() {
					return setup.LocationImages[setup.Locations.get()].weather.groundBounds.splashes.bottom;
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
				dropSpeed: 11,

				pileTriggerTop: 20,
				pileTriggerBottom: 1,

				wobbleAmplitude: 0.3,
				wobbleFrequency: 0.7,

				pixelFadeTime: 0.7,
			},
			bindings: {
				dropCount() {
					return Weather.precipitationIntensity * 60 - 35;
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
				// Override based on per-location config
				pileTriggerTop() {
					return setup.LocationImages[setup.Locations.get()].weather.groundBounds.splashes.top;
				},
				pileTriggerBottom() {
					return setup.LocationImages[setup.Locations.get()].weather.groundBounds.splashes.bottom;
				},
			},
		},
		{
			effect: "imageOverlay",
			drawCondition() {
				return (
					!this.renderInstance.sidebarSkyDisabled && Weather.precipitationIntensity >= 1.3 // precipitationIntensity for lightPrecipitation
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
		{
			effect: "debugBounds",
			drawCondition() {
				return V.debug && V.debugWeatherBandBounds;
			},
			params: {},
			bindings: {
				splashTop() {
					return setup.LocationImages[setup.Locations.get()].weather.groundBounds.splashes.top;
				},
				fogTop() {
					return setup.LocationImages[setup.Locations.get()].weather.groundBounds.fog.top;
				},
			},
		},
	],
});
