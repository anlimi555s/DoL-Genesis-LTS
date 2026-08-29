/* overcast.js */
Weather.Overcast = (() => {
	// Overcast reaches the goal overcast of the upcoming weather 75% of the way to the next keypoint, allowing overcast to be an
	// indicator of the upcoming weather. This can cause the overcast to snap from one level to another, but I think that's ok,
	// since weather snaps anyway.
	function interpolateOvercast(date) {
		if (!V.weatherObj.keypointsArr?.length) {
			return 0;
		}

		const currentTimeStamp = date.timeStamp;

		let currentKeyPoint = null;
		let nextKeyPoint = null;

		for (const keyPoint of V.weatherObj.keypointsArr) {
			if (keyPoint.timestamp <= currentTimeStamp) {
				currentKeyPoint = keyPoint;
			}
			if (keyPoint.timestamp > currentTimeStamp && !nextKeyPoint) {
				nextKeyPoint = keyPoint;
			}
		}

		if (!currentKeyPoint && nextKeyPoint) {
			currentKeyPoint = { timestamp: currentTimeStamp, value: nextKeyPoint.value };
		}

		if (!currentKeyPoint || !nextKeyPoint || nextKeyPoint.timestamp === currentKeyPoint.timestamp) {
			const weatherNow = Weather.WeatherGeneration.getWeather(date);
			if (!weatherNow) return 0;

			const overcastNow = weatherNow.overcast;
			const scaledNow = Time.isBloodMoon(date) ? overcastNow * 0.85 : overcastNow;
			return round(Math.clamp(scaledNow, 0, 1), 2);
		}

		const current = Weather.genSettings.weatherTypes[currentKeyPoint.value];
		const next = Weather.genSettings.weatherTypes[nextKeyPoint.value];
		const overcastNow = current.overcast;
		const overcastNext = next.overcast;

		const fraction = Math.clamp((currentTimeStamp - currentKeyPoint.timestamp) / (nextKeyPoint.timestamp - currentKeyPoint.timestamp), 0, 1);

		const increasing = overcastNext > overcastNow;
		// Reach the overcast goal 75% of the way to the upcoming weather keypoint, if the amount of overcast is increasing
		const adjustedFraction = increasing ? Math.min(1, fraction / 0.75) : fraction;

		let overcastGoal = overcastNow + (overcastNext - overcastNow) * adjustedFraction;

		// Clamp so we never go below the active weather's target overcast
		const activeWeather = Weather.WeatherGeneration.getWeather(date);
		const activeGoal = activeWeather.overcast;
		overcastGoal = Math.max(overcastGoal, activeGoal);

		const scaledOvercast = Time.isBloodMoon(date) ? overcastGoal * 0.85 : overcastGoal;
		return round(Math.clamp(scaledOvercast, 0, 1), 2);
	}

	function getOvercast(date) {
		if (date) {
			const lastKeyPoint = V.weatherObj.keypointsArr[V.weatherObj.keypointsArr.length - 1];
			const lastKeyPointTimestamp = lastKeyPoint?.timestamp || 0;

			if (date.timeStamp > lastKeyPointTimestamp) {
				console.warn(`getOvercast: Provided date is after the last key point timestamp.`);
				return null;
			}

			if (date.timeStamp < Time.date.timeStamp) {
				console.warn(`getOvercast: Provided date is before the current timestamp. Returning the current overcast.`);
				return interpolateOvercast(new DateTime(Time.date));
			}
		}

		return interpolateOvercast(new DateTime(Time.date));
	}

	return Object.create({
		getOvercast,
	});
})();
