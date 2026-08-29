Weather.Renderer.Layers.add({
	name: "fog",
	animation: { updateRate: 50 },
	zIndex: 15,
	compositeOperation: "source-over",
	effects: [
		{
			effect: "particleFog",
			drawCondition() {
				return !this.renderInstance.sidebarSkyDisabled && setup.LocationImages[setup.Locations.get()].weather.fogEnabled;
			},
			params: {
				scale: 30,
				scaleVariance: 10,
				minVel: 0.6, // px/sec
				maxVel: 1.2,
				images: {
					fog: "img/misc/sky/clouds/fog/1.png",
				},
			},
			bindings: {
				maxParticleCount() {
					return Weather.fog * Constants.weather.fogParticles.globalLocationCapMax;
				},
				fogDistributionCurve() {
					return setup.LocationImages[setup.Locations.get()].weather.fogDistributionCurve;
				},
				top() {
					return setup.LocationImages[setup.Locations.get()].weather.groundBounds.fog.top;
				},
				bottom() {
					return setup.LocationImages[setup.Locations.get()].weather.groundBounds.fog.bottom - 1;
				},
				opacity() {
					return setup.LocationImages[setup.Locations.get()].weather.fogOpacity ?? 1;
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
					nightDark: "#595971",
					nightBright: "#8d8da5",
					day: "#fffffc",
					dawnDusk: "#bb9776",
					bloodMoon: "#380101",
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
					return Weather.getWeatherDarkenFactor(Weather.current.darkenFactor.fog);
				},
			},
		},
	],
});
