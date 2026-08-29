const Weather = (() => {
	/* Helper functions */
	function getSunIntensity(time) {
		time ??= Time.date;
		const sunIntensity = Weather.genSettings.months[time.month - 1].sunIntensity * Weather.activeRenderer?.orbitals.sun.getFactor(time);
		const weatherModifier = V.outside ? Weather.current.tanningModifier : 0;
		const locationModifier = V.location === "forest" ? 0.2 : 1;
		return V.outside ? Math.max(sunIntensity * weatherModifier * locationModifier, 0) : 0;
	}

	function setAccumulatedSnow(minutes) {
		const precipitationIntensity = resolveValue(Weather.current.precipitationIntensity);
		const temperature = Weather.temperature;
		const snowfallRate = Weather.tempSettings.snow.snowfallRate;
		const meltingRate = Weather.tempSettings.snow.meltingRate;
		const maxSnow = Weather.tempSettings.snow.maxAccumulation;

		let accumulatedSnow = V.weatherObj.snow || 0;

		if (Weather.isFreezing && precipitationIntensity > 0) {
			// Accumulate snow
			accumulatedSnow += minutes * snowfallRate * precipitationIntensity;
			accumulatedSnow = Math.min(accumulatedSnow, maxSnow);
		} else if (temperature > 0) {
			// Melt snow
			accumulatedSnow -= minutes * meltingRate * temperature;
			accumulatedSnow = Math.max(accumulatedSnow, 0);
		}

		V.weatherObj.snow = Math.round(accumulatedSnow);
	}

	function setIceThickness(minutes) {
		const temperature = Weather.temperature;
		const freezingRate = Weather.tempSettings.ice.freezingRate;
		const meltingRate = Weather.tempSettings.ice.meltingRate;
		const maxThickness = Weather.tempSettings.ice.maxThickness;
		for (const body of Object.keys(maxThickness)) {
			V.weatherObj.ice[body] = V.weatherObj.ice[body] || 0;
			if (Weather.isFreezing) {
				V.weatherObj.ice[body] += minutes * freezingRate * Math.abs(temperature);
				V.weatherObj.ice[body] = Math.min(V.weatherObj.ice[body], maxThickness[body]);
			} else if (temperature > 0) {
				V.weatherObj.ice[body] -= minutes * meltingRate * temperature;
				V.weatherObj.ice[body] = Math.max(V.weatherObj.ice[body], 0);
			}
			V.weatherObj.ice[body] = Math.round(V.weatherObj.ice[body]);
		}
	}

	function getBloodMoon(date = new DateTime(Time.date)) {
		const sunRise = Weather.activeRenderer?.orbitals.bloodMoon?.settings.riseTime - 1;
		const sunSet = Weather.activeRenderer?.orbitals.bloodMoon?.settings.setTime + 1;

		return (date.day === date.lastDayOfMonth && date.hour >= sunRise) || (date.day === 1 && date.hour < sunSet);
	}

	function getWeatherDarkenFactor(baseDarken) {
		const sunFactor = Weather.activeRenderer?.orbitals?.sun?.factor ?? 0;
		const moonBrightness = Weather.activeRenderer?.moonBrightnessFactor ?? 0;

		const dayness = Math.clamp((sunFactor + 1) / 2, 0, 1);
		const nightness = 1 - dayness;

		const dayDarkenReductionMax = 0.3;
		const moonNightReductionMax = 0.2;

		const timeFactor = Math.clamp(1 - dayness * dayDarkenReductionMax - moonBrightness * nightness * moonNightReductionMax, 0, 1);
		return baseDarken * timeFactor;
	}

	return {
		setAccumulatedSnow,
		setIceThickness,
		getSunIntensity,
		toFahrenheit: temperature => Weather.Temperature.toFahrenheit(temperature),
		toSelected: celsius => {
			return V.options.fahrenheit ? Weather.Temperature.toFahrenheit(celsius) : celsius;
		},
		toSelectedString: (celsius, decimals = 2) => {
			return V.options.fahrenheit ? `${round(Weather.Temperature.toFahrenheit(celsius), decimals)}°F` : `${round(celsius, decimals)}°C`;
		},
		setTemperature: temperature => Weather.Temperature.set(temperature),
		addTemperature: temperature => Weather.Temperature.add(temperature),
		set: (weatherType, instant, minutes) => Weather.WeatherGeneration.setWeather(weatherType, instant, minutes),
		get: date => Weather.WeatherGeneration.getWeather(date),
		is: weatherType => Weather.WeatherGeneration.isWeather(weatherType),
		isFrozen(key) {
			return V.weatherObj.ice[key] > Weather.tempSettings.ice.minThickness[key];
		},
		getBloodMoon,
		getWeatherDarkenFactor,
		index: date => {
			const w = Weather.WeatherGeneration.getWeather(date);
			if (w === null) return null;
			return setup.WeatherGeneration.weatherTypes.findIndex(type => type.name === w.name);
		},
		get genSettings() {
			return setup.WeatherGeneration;
		},
		get tempSettings() {
			return setup.WeatherTemperature;
		},
		get TooltipDescriptions() {
			return setup.WeatherDescriptions;
		},
		get weatherType() {
			if (Weather.bloodMoon) return "bloodMoon";
			return Weather.current;
		},
		get current() {
			return Weather.WeatherGeneration.getWeather();
		},
		get name() {
			return Weather.WeatherGeneration.getWeather().name;
		},
		get value() {
			return Weather.WeatherGeneration.getWeather().value;
		},
		get isOvercast() {
			return Weather.overcast > 0.5;
		},
		get overcast() {
			return Weather.Overcast.getOvercast();
		},
		get sunIntensity() {
			return getSunIntensity();
		},
		get precipitation() {
			if (Weather.WeatherGeneration.getWeather().precipitationIntensity === 0) return "none";
			return Weather.isFreezing ? "snow" : "rain";
		},
		get precipitationIntensity() {
			return resolveValue(Weather.WeatherGeneration.getWeather().precipitationIntensity);
		},
		get enableLightning() {
			return resolveValue(Weather.WeatherGeneration.getWeather().lightningFrequency) > 0 && Weather.precipitation !== "snow";
		},
		get lightningFrequency() {
			return resolveValue(Weather.WeatherGeneration.getWeather().lightningFrequency);
		},
		get temperature() {
			return Weather.Temperature.getCelsius();
		},
		get isFreezing() {
			return Weather.Temperature.isFreezing();
		},
		get isSnow() {
			return !Weather.skyDisabled && V.weatherObj.snow > setup.WeatherTemperature.snow.minAccumulation;
		},
		get apparentTemperature() {
			return T.temperatureOverride?.outsideApparent ?? this.temperature;
		},
		get insideTemperature() {
			return Weather.Temperature.getInsideTemperature();
		},
		get waterTemperature() {
			return Weather.Temperature.getWaterTemperature();
		},
		get bodyTemperature() {
			return Weather.BodyTemperature.get();
		},
		set bodyTemperature(value) {
			Weather.BodyTemperature.set(value);
		},
		get wetness() {
			return Weather.BodyTemperature.wetness;
		},
		get bloodMoon() {
			return getBloodMoon();
		},
		get dayState() {
			const sunRise = Weather.activeRenderer?.orbitals.sun.settings.riseTime;
			const sunSet = Weather.activeRenderer?.orbitals.sun.settings.setTime;
			const hour = Time.hour;
			return hour < sunRise - 0.75 || hour >= sunSet + 0.75 ? "night" : hour >= sunSet - 0.5 ? "dusk" : hour >= sunRise + 1 ? "day" : "dawn";
		},
		get skyState() {
			if (Weather.bloodMoon) return "bloodMoon";
			return this.dayState;
		},
		get fog() {
			return Weather.FogGeneration.getFog();
		},
		get previousWeatherIndex() {
			return V.weatherObj.previousWeatherIndex;
		},
		set previousWeatherIndex(value) {
			V.weatherObj.previousWeatherIndex = value;
		},
		get lightsOn() {
			return !Weather.bloodMoon && (Time.hour >= setup.SkySettings.lightsTime.on || Time.hour < setup.SkySettings.lightsTime.off);
		},
		get starSeed() {
			if (!V.weatherObj.starSeed) {
				V.weatherObj.starSeed = btoa(Math.round(Math.random() * 10000) + 1000);
			}
			return V.weatherObj.starSeed;
		},
		set starSeed(value) {
			V.weatherObj.starSeed = value;
		},
		get activeRenderer() {
			return this._activeRenderer;
		},
		set activeRenderer(value) {
			this._activeRenderer = value;
		},
		Renderer: {},
	};
})();
window.Weather = Weather;
