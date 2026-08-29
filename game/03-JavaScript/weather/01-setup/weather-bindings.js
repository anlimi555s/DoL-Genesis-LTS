/*
	Bind a value to the sky canvas.
	If the value changes - it will update the specified layer(s)

*/
setup.WeatherBindings = {
	options: {
		variable: () => V.options.weatherUpdate,
		layers: ["all"],
	},
	save: {
		variable: () => T.saveLoaded,
		layers: [
			"all", // Redraw everything when a save is loaded
		],
	},
	time: {
		variable: () => Time.date.timeStamp,
		layers: [
			"all", // TODO: This seems inefficient and defeats the purpose of having all of these different bindings
		],
	},
	weather: {
		variable: () => Weather.name,
		layers: [
			"sky", // Uses Weather.current.darkenFactor.sky for the sky colour overlay, which changes with the weather
			"clouds", // Cloud counts/alpha and darken factor are informed by Weather.current
			"cirrusClouds", // Cirrus count/opacity and darken factor are informed by Weather.current
			"overcastClouds", // Overcast darken factor and opacity are informed by Weather.current
			"fog", // Fog darken factor is informed by Weather.current
			"precipitation", // Rain/snow settings, wind, and darken factor are informed by Weather.current
			"sun", // Sun darken overlay is informed by Weather.current.darkenFactor.sun
			"moon", // Moon darken overlay is informed by Weather.current.darkenFactor.moon
		],
	},
	overcast: {
		variable: () => Weather.overcast,
		layers: [
			"overcastClouds", // Overcast alpha is informed by Weather.overcast
			"sunGlow", // Glow visibility is informed by Weather.isOvercast
		],
	},
	precipitationIntensity: {
		variable: () => Weather.precipitationIntensity,
		layers: [
			"starField", // Star alpha fades with Weather.precipitationIntensity
		],
	},
	fog: {
		// Quantize to avoid tiny changes causing too frequent updates
		variable: () => Math.round(Weather.fog * 100) / 100,
		layers: [
			"sky", // Fog amount desaturates the sky layer
			"clouds", // Fog amount desaturates the main cloud layer
			"cirrusClouds", // Fog amount desaturates cirrus clouds during daytime
			"sun", // Fog amount desaturates the sun layer during daytime
		],
	},
	lightning: {
		variable: () => Weather.enableLightning,
		layers: [
			"lightningExtra", // Lightning pulse overlay is driven by pulses from lightning effects
			"lightningNear", // Draws lightning bolts only when Weather.enableLightning is true
			"lightningMid", // Draws lightning bolts only when Weather.enableLightning is true
			"lightningFar", // Draws lightning bolts only when Weather.enableLightning is true
		],
	},
	location: {
		variable: () => V.location,
		layers: [
			"location", // Location images change based on location, and are selected via setup.Locations.get() from V.location
			"precipitation", // Per-location splash enabled/bounds are informed by the current LocationImages
			"fog", // Per-location fog enabled/bounds/curve are informed by the current LocationImages
		],
	},
	tentworld: {
		variable: () => V.location === "tentworld",
		layers: ["all"],
	},
	bus: {
		variable: () => V.bus,
		layers: ["location"],
	},
	bloodmoon: {
		variable: () => Weather.bloodMoon,
		layers: [
			"location", // Locations have blood-moon variants
		],
	},
	snow: {
		variable: () => Weather.isSnow,
		layers: [
			"location", // Locations have snow variants
		],
	},
	dayState: {
		variable: () => Time.dayState,
		layers: [
			"sky", // Fog desaturates the sky based on Time.dayState and fog amount
			"clouds", // Fog desaturates the clouds based on Time.dayState and fog amount
			"cirrusClouds", // Fog desaturates the cirrusClouds based on Time.dayState and fog amount
			"sun", // Fog desaturates the sun based on Time.dayState and fog amount
			"location", // Locations have dawn/dusk/day/night variants
		],
	},
	lightsOn: {
		variable: () => Weather.lightsOn,
		layers: [
			"location", // Locations have variants for if the lights are on or off
		],
	},
	fireOn: {
		variable: () => {
			if (V.bird.firepit === undefined) return null;
			const step = V.bird.firepit.maxBurnTime / 60 / 5; // (max value / parts)
			return Math.round(getBirdBurnTime() / step) * step;
		},
		layers: ["location"],
	},
	locationSmoke: {
		variable: () => V.location,
		layers: [
			"locationSmoke", // Each location has different smoke emitter locations
		],
	},
};
