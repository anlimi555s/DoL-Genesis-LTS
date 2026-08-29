/**
 * Temperature Explanation:
 * 	Temperature calculations work by setting a number of key-points per month.
 * 	Key-points represent specific days where the temperature is defined, and temperatures for other days are interpolated between these points.
 * 	The number of key-points is selected randomly within a specified range set below in 'months'.
 *
 * Weather Explanation:
 *	Determines the current weather condition based on a series of key-points, similar to temperature.
 *	Instead of several key points per month - it instead uses 1 to several key points per day. (set in settings below)
 *	This leads to a more realistic weather pattern. It interpolates between weather types realistically (e.g. to go from clear to heavy rain - it must first be cloudy)
 *  Every season has its own probability for each weather type, set in weatherTypes, below.
 *
 */
setup.WeatherGeneration = {
	forecast: {
		weather: {
			/* Will generate random number of key points between the min and max value */
			daysToGenerate: 20, // How many days of forecast to generate ahead of the current day. Do not set too low or it will generate new key points too often.
			minTimeApartKeyPoints: 140, // Minimum time between each keypoint, in minutes
			minKeyPointsPerDay: 1, // Minimum number of key points per day. Must be at least 1
			maxKeyPointsPerDay: 3, // Maximum number of key points per day.
		},
		temperature: {
			// Generates at least 1 month ahead, dynamically
			minTimeApartKeyPoints: 3, // Minimum time between each keypoint, in days
			minKeyPointsPerMonth: 4, // Minimum number of key points per month. Must be at least 1
			maxKeyPointsPerMonth: 6, // Maximum number of key points per month.
			extremeMaxKeyPointsPerMonth: 2,
		},
	},
	months: [
		{
			// Jan
			temperatureRange: {
				average: [-9, 7], // Range of temperature for a specific month. A range of [5, 15] means that it will generate temperatures between that range for that specific month.
				extreme: [-25, 11],
			},
			extremeChance: 0.3,
			sunIntensity: 0.1, // Modifies tanning changes from sun exposure
			fogIncreaseAllowed: 0.7, // Daily chance that the fog is allowed to increase on that day
			allDayFog: 0.09, // Daily chance that the fogGoal is maxed all day
		},
		{
			// Feb
			temperatureRange: {
				average: [-8, 8],
				extreme: [-21, 15],
			},
			extremeChance: 0.25,
			sunIntensity: 0.2,
			fogIncreaseAllowed: 0.65,
			allDayFog: 0.08,
		},
		{
			// Mar
			temperatureRange: {
				average: [-3, 11],
				extreme: [-18, 20],
			},
			extremeChance: 0.2,
			sunIntensity: 0.3,
			fogIncreaseAllowed: 0.55,
			allDayFog: 0.04,
		},
		{
			// Apr
			temperatureRange: {
				average: [0, 15],
				extreme: [-10, 28],
			},
			extremeChance: 0.25,
			sunIntensity: 0.5,
			fogIncreaseAllowed: 0.48,
			allDayFog: 0.02,
		},
		{
			// May
			temperatureRange: {
				average: [7, 19],
				extreme: [0, 32],
			},
			extremeChance: 0.3,
			sunIntensity: 0.7,
			fogIncreaseAllowed: 0.42,
			allDayFog: 0.015,
		},
		{
			// Jun
			temperatureRange: {
				average: [11, 23],
				extreme: [3, 36],
			},
			extremeChance: 0.35,
			sunIntensity: 1,
			fogIncreaseAllowed: 0.38,
			allDayFog: 0.015,
		},
		{
			// Jul
			temperatureRange: {
				average: [14, 27],
				extreme: [8, 40],
			},
			extremeChance: 0.4,
			sunIntensity: 1,
			fogIncreaseAllowed: 0.37,
			allDayFog: 0.01,
		},
		{
			// Aug
			temperatureRange: {
				average: [14, 24],
				extreme: [6, 38],
			},
			extremeChance: 0.35,
			sunIntensity: 0.8,
			fogIncreaseAllowed: 0.4,
			allDayFog: 0.01,
		},
		{
			// Sep
			temperatureRange: {
				average: [11, 20],
				extreme: [0, 32],
			},
			extremeChance: 0.3,
			sunIntensity: 0.7,
			fogIncreaseAllowed: 0.6,
			allDayFog: 0.015,
		},
		{
			// Oct
			temperatureRange: {
				average: [5, 16],
				extreme: [-5, 28],
			},
			extremeChance: 0.25,
			sunIntensity: 0.5,
			fogIncreaseAllowed: 0.62,
			allDayFog: 0.04,
		},
		{
			// Nov
			temperatureRange: {
				average: [-5, 10],
				extreme: [-10, 19],
			},
			extremeChance: 0.2,
			sunIntensity: 0.3,
			fogIncreaseAllowed: 0.72,
			allDayFog: 0.06,
		},
		{
			// Dec
			temperatureRange: {
				average: [-8, 6],
				extreme: [-20, 13],
			},
			extremeChance: 0.25,
			sunIntensity: 0.1,
			fogIncreaseAllowed: 0.75,
			allDayFog: 0.08,
		},
	],

	weatherTypes: [
		{
			name: "clear",
			iconType: "clear", // Determines which icon to use for the minimised sidebar
			value: 0, // Value determines how to interpolate between different weather types. It always interpolates to an adjacent value first.
			probability: {
				// Weighted probabilities per month - these are compared to the other weather types and not to the other seasons.
				summer: 0.7,
				winter: 0.3,
				spring: 0.5,
				autumn: 0.4,
			},
			cloudCount: {
				// Visual only - determines how many clouds spawn at once in the sidebar of each type
				small: () => random(0, 1, true),
				medium: () => 0,
				large: () => 0,
			},
			// Modifies the tanning factor, based on cloud coverage. A modifier of 1 has no penalties.
			tanningModifier: 1,
			// Determines how much opacity the overcast sprite should have. This layer is also darkened by the darkenFactor.
			overcast: 0,
			// Determines the intensity of the precipitation. A bigger value accumulates snow faster during winter.
			precipitationIntensity: 0,
			// Controls cloud layer alpha multipliers for the primary cloud effect.
			cloudAlpha: 1,
			// Factor of how much darkening is applied to each layer when this weather is active
			darkenFactor: {
				sky: 0,
				sun: 0,
				moon: 0,
				clouds: 0,
				cirrusClouds: 0,
				overcastClouds: 0,
				precipitation: 0,
				fog: 0,
				location: 0,
			},
			// Effect that this weather has on the amount of fog
			fogChangeRate: -0.03,
		},
		{
			name: "lightClouds",
			iconType: "clouds",
			value: 1,
			probability: {
				summer: 0.5,
				winter: 0.4,
				spring: 0.5,
				autumn: 0.4,
			},
			cloudCount: {
				small: () => random(1, 3, true),
				medium: () => random(1, 1, true),
				large: () => 0,
			},
			tanningModifier: 0.5,
			overcast: 0.15,
			precipitationIntensity: 0,
			cloudAlpha: 1,
			darkenFactor: {
				sky: 0,
				sun: 0,
				moon: 0,
				clouds: 0,
				cirrusClouds: 0,
				overcastClouds: 0,
				precipitation: 0,
				fog: 0,
				location: 0,
			},
			fogChangeRate: -0.02,
		},
		{
			name: "heavyClouds",
			iconType: "clouds",
			value: 2,
			probability: {
				summer: 0.1,
				winter: 0.4,
				spring: 0.2,
				autumn: 0.3,
			},
			cloudCount: {
				small: () => random(1, 2, true),
				medium: () => random(1, 4, true),
				large: () => random(1, 2, true),
			},
			tanningModifier: 0.2,
			overcast: 0.6,
			precipitationIntensity: 0,
			cloudAlpha: 1,
			darkenFactor: {
				sky: 0.1,
				sun: 0.1,
				moon: 0.1,
				clouds: 0.1,
				cirrusClouds: 0.1,
				overcastClouds: 0.1,
				precipitation: 0.1,
				fog: 0.1,
				location: 0.1,
			},
			fogChangeRate: -0.01,
		},
		{
			name: "lightPrecipitation",
			iconType: () => "light-" + Weather.precipitation,
			value: 3,
			probability: {
				summer: 0.05,
				winter: 0.1,
				spring: 0.05,
				autumn: 0.15,
			},
			cloudCount: {
				small: () => random(1, 2, true),
				medium: () => random(2, 4, true),
				large: () => random(1, 2, true),
			},
			tanningModifier: 0.2,
			overcast: 0.75,
			precipitationIntensity: 1.3,
			windAngle: 0.1,
			rain: {
				dropLength: 3.5,
				dropSpeed: 75,
				dropWidth: 0.4,
			},
			cloudAlpha: 1,
			darkenFactor: {
				sky: 0.4,
				sun: 0.3,
				moon: 0.3,
				clouds: 0.2,
				cirrusClouds: 0.2,
				overcastClouds: 0.3,
				precipitation: 0.2,
				fog: 0.2,
				location: 0.1,
			},
			fogChangeRate: -0.01,
		},
		{
			name: "heavyPrecipitation",
			iconType: () => "heavy-" + Weather.precipitation,
			value: 4,
			probability: {
				summer: 0.05,
				winter: 0.1,
				spring: 0.05,
				autumn: 0.1,
			},
			cloudCount: {
				small: () => random(1, 2, true),
				medium: () => random(2, 5, true),
				large: () => random(1, 3, true),
			},
			tanningModifier: 0.1,
			overcast: 0.8,
			precipitationIntensity: 1.6,
			windAngle: 0.2,
			rain: {
				dropLength: 5.5,
				dropSpeed: 90,
				dropWidth: 0.3,
			},
			cloudAlpha: 0.9,
			darkenFactor: {
				sky: 0.4,
				sun: 0.4,
				moon: 0.4,
				clouds: 0.4,
				cirrusClouds: 0.4,
				overcastClouds: 0.4,
				precipitation: 0.1,
				fog: 0.3,
				location: 0.2,
			},
			lightningFrequency: 0.1, // Average number of lightning strikes per minute
			fogChangeRate: -0.01,
		},
		{
			name: "storm",
			iconType: () => "storm-" + Weather.precipitation,
			value: 5,
			probability: {
				summer: 0.07,
				winter: 0.03,
				spring: 0.05,
				autumn: 0.04,
			},
			cloudCount: {
				small: () => 0,
				medium: () => random(2, 4, true),
				large: () => random(1, 2, true),
			},
			tanningModifier: 0,
			overcast: 1,
			precipitationIntensity: 2,
			windAngle: 0.3,
			rain: {
				dropLength: 9.5,
				dropSpeed: 120,
				dropWidth: 0.3,
			},
			cloudAlpha: 0.9,
			darkenFactor: {
				sky: 0.6,
				sun: 0.6,
				moon: 0.6,
				clouds: 0.5,
				cirrusClouds: 0.5,
				overcastClouds: 0.5,
				precipitation: 0.2,
				fog: 0.5,
				location: 0.3,
			},
			lightningFrequency: 2,
			fogChangeRate: -0.04,
		},
		{
			name: "thunderstorm",
			iconType: () => "thunderstorm-" + Weather.precipitation,
			value: 6,
			probability: {
				summer: 0.06,
				winter: 0.04,
				spring: 0.04,
				autumn: 0.03,
			},
			cloudCount: {
				small: () => 0,
				medium: () => random(2, 4, true),
				large: () => random(2, 3, true),
			},
			tanningModifier: 0,
			overcast: 1,
			precipitationIntensity: 3.5,
			windAngle: 0.35,
			rain: {
				dropLength: 9.5,
				dropSpeed: 120,
				dropWidth: 0.3,
			},
			cloudAlpha: 0.8,
			darkenFactor: {
				sky: 0.8,
				sun: 0.5,
				moon: 0.8,
				clouds: 0.6,
				cirrusClouds: 0.6,
				overcastClouds: 0.6,
				precipitation: 0.4,
				fog: 0.5,
				location: 0.4,
			},
			lightningFrequency: 10,
			fogChangeRate: -0.04,
		},
	],
};
