/* Initialise sky canvas on loading a save */
$(document).on(":onloadsave", () => {
	if (!Weather.sidebar?.loaded.value) return;
	Weather.activeRenderer = Weather.sidebar;
	Weather.sidebar.initialize();
});

/* Clear all layers on restart */
$(document).on(":enginerestart", () => {
	Weather.sidebar?.stopAll();
});

/* Initialise banner canvas on passageend in order to load Time and localStorage correctly */
$(document).on(":passageend", async () => {
	if (State.passage === "Start" && !Weather.banner?.loaded.value) {
		// Load localStorage weather object if it exists - then set the weatherObj
		// Otherwise set a default time state

		const timeData = localStorage.getItem("time");
		if (timeData) {
			Time.set(new DateTime(parseInt(timeData, 36)));
		} else {
			Time.set(new DateTime(2022, 8, 10, 23, 45));
		}

		const weatherData = localStorage.getItem("weather");
		if (weatherData) {
			Packer.unpackWeatherData(weatherData);
		}

		Weather.banner.initialize();
	}
});

/* Initialise sky canvas on page refresh */
$(document).on(":passagestart", () => {
	// Setup banner for start menu
	if (["Start", "Clothes Testing", "Renderer Test Page", "Tips"].includes(State.passage)) {
		if (State.passage === "Start") {
			// Set temporary weatherObj for Start menu
			V.weatherObj = {
				snow: 0,
				ice: {},
				monthlyTemperatures: [],
				keypointsArr: [],
				previousWeatherIndex: 0,
				fogKeypoints: [],
			};
			Time.set(0);
			// Setup banner canvas
			if (!Weather.banner?.loaded.value) {
				Weather.banner = new Weather.Renderer.Sky({
					id: "canvasBanner",
					setup: setup.SkySettings.canvas.banner,
					layers: [
						"bannerSky",
						"sun",
						"bannerSunGlow",
						"moon",
						"bannerCirrusClouds",
						"bannerOvercastClouds",
						"bannerClouds",
						"bannerStarField",
						"bloodGlow",
						"bannerPrecipitation",
						"location",
						"fogOverlay",
						"rainbow",
						"lightning",
						"lightningPulse",
					],
					resizable: true,
				});
			}
			Weather.activeRenderer = Weather.banner;
			return;
		}

		if (State.passage === "Clothes Testing" && Weather.banner) {
			Weather.banner.stopAll();
			return;
		}

		// Do nothing if still in start menu
		if (V.location === "banner") return;

		return;
	}

	// Do nothing if still in start menu
	if (["Start", "Clothes Testing", "Renderer Test Page", "Tips"].includes(State.passage) && V.location === "banner") return;

	// Remove banner canvas if no longer on start menu
	if (State.passage !== "Start" && Weather.banner) {
		Weather.banner.stopAll();
		delete Weather.banner;
	}

	// LTS 修复：天气开关关闭时停止画布循环（对齐 caption.twee 的 weatherUpdate/images 渲染条件）。
	// 原实现开关关闭后 rAF 循环照跑（离屏白烧）。stopAll + loaded=false 后，
	// 开关重开会走下方初始化路径自动恢复。回退：删除本段即可。
	if (!(V.options.weatherUpdate && V.options.images)) {
		Weather.sidebar?.stopAll();
		if (Weather.sidebar) Weather.sidebar.loaded.value = false;
		return;
	}

	// Return if sidebar has already been initialised
	if (!V.weatherObj || Weather.sidebar?.loaded.value) return;
	Weather.activeRenderer = Weather.sidebar;
	Weather.sidebar.initialize();
});

$(document).one(":passagerender", () => {
	if (!StartConfig.enableImages) return;
	Weather.Thermometer.load();
});
