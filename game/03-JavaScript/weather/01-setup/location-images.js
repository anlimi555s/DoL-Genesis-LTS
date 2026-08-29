// @ts-check

/*
	Temporary until we have a better system for locations
	Exceptions are defined here
	Otherwise locations will match the folder name
*/
setup.Locations = {
	alex_farm: () => (V.bus === "woodland" ? "forest" : V.bus === "farm_fields" ? "fields" : "alex_farm"),
	alley: () => {
		if (V.bus === "industrial") return "ind_alley";
		if (V.bus === "residential") return "res_alley";
		return "com_alley";
	},
	beach: () => {
		if (V.sublocation === "changingroom" && V.bus === "clothingshop") return "shopping_centre";
		if (V.sublocation === "changingroom" && V.bus === "forestshop") return "forest_shop";
		return "beach";
	},
	cafe: () => {
		if (V.chef_state >= 9) return "cafe_renovated";
		if (V.chef_state >= 7) return "cafe_construction";
		return "cafe";
	},
	castle: () => {
		return "tower";
	},
	hotel: () => {
		return "town";
	},
	estate: () => (V.bus === "estate_cottage" ? "estate_cottage" : "estate"),
	farm: () => (["farmroad6", "farm"].includes(V.bus) ? "farm" : "underground_farm"),
	get() {
		if (typeof this[V.location] === "function") {
			return this[V.location]();
		}
		if (setup.LocationImages && Object.hasOwn(setup.LocationImages, V.location)) {
			return V.location;
		}
		return "home";
	},
};

/**
	NOTE: When adding animation frameDelay - use multiples of 50 millseconds only
	(such as 50, 100, 150, 200, 1000, 5000, etc.)
	If we want smoother animations (than 20 fps):
		- Change the updateRate in layer-location.js
 */

setup.LocationImages = {
	adult_shop: {
		folder: "adult-shop",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			windows: {
				condition: () => V.adultshopstate !== "closed" && (Time.dayState === "dusk" || Time.dayState === "night"),
				image: "emissive-windows.png",
				color: "#cf51ca",
				size: 2,
				intensity: 1.5,
			},
			heart: {
				condition: () => V.adultshopstate !== "closed" && (Time.dayState === "dusk" || Time.dayState === "night"),
				image: "emissive-heart.png",
				color: "#ff4fd6",
				animation: {
					frameDelay: 800,
					cycleDelay: () => 600,
				},
				size: 1,
			},
			red: {
				condition: () => V.adultshopstate !== "closed" && (Time.dayState === "dusk" || Time.dayState === "night"),
				image: "emissive-red.png",
				color: "#ff1d2f",
				size: 1,
			},
		},
		weather: {
			fogDistributionCurve: 1.5,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 7,
					bottom: 0,
				},
				fog: {
					top: 11,
					bottom: 0,
				},
			},
		},
	},
	alex_cottage: {
		folder: "alex-cottage",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
		},
		weather: {
			fogDistributionCurve: 1.2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 6,
					bottom: 0,
				},
				fog: {
					top: 12,
					bottom: 0,
				},
			},
		},
	},
	alex_farm: {
		folder: "alex-farm",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
			color: "#deae66",
			strength: 2,
		},
		weather: {
			fogDistributionCurve: 1.5,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 9,
					bottom: 0,
				},
				fog: {
					top: 16,
					bottom: 0,
				},
			},
		},
	},
	arcade: {
		folder: "arcade",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			red: {
				image: "emissive-red.png",
				color: "#e36c59",
				size: 5,
			},
			yellow: {
				image: "emissive-yellow.png",
				condition: () => Weather.lightsOn,
				color: "#dcdb99cc",
				size: 5,
			},
			green: {
				image: "emissive-green.png",
				condition: () => Weather.lightsOn,
				color: "#4bc248",
				size: 5,
			},
			orange: {
				image: "emissive-orange.png",
				condition: () => Weather.lightsOn,
				color: "#f59442",
				size: 5,
			},
			purple: {
				image: "emissive-purple.png",
				condition: () => Weather.lightsOn,
				color: "#cf51ca",
				size: 5,
			},
			blue: {
				image: "emissive-blue.png",
				condition: () => Weather.lightsOn,
				color: "#4f6edb",
				size: 5,
			},
		},
		reflective: {
			mask: {
				image: "reflective.png",
				verticalFactor: 3.5,
				amplitude: 35,
				verticalSpeed: 0.05,
			},
			overlay: {
				image: "water.png",
				compositeOperation: "overlay",
				alpha: 0.4,
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 6,
					bottom: 0,
				},
				fog: {
					top: 8,
					bottom: 0,
				},
			},
		},
	},
	asylum: {
		folder: "asylum",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			clockMinute: {
				condition: () => V.hallucinations < 1,
				image: "clock-1.png",
				frame: () => {
					const numFrames = 8;
					const segmentSize = 60 / numFrames;
					return Math.floor(((Time.minute + segmentSize / 2) / segmentSize) % numFrames);
				},
			},
			clockHour: {
				condition: () => V.hallucinations < 1,
				image: "clock-2.png",
				frame: () => {
					const numFrames = 8;
					const segmentSize = 12 / numFrames;
					return Math.floor((((Time.hour % 12) + segmentSize / 2) / segmentSize) % numFrames);
				},
			},
			clockHallucinationMinute: {
				condition: () => V.hallucinations >= 1,
				image: "clock-1.png",
				animation: {
					frameDelay: 100,
					cycleDelay: () => 0,
				},
			},
			clockHallucinationHour: {
				condition: () => V.hallucinations >= 1,
				image: "clock-2.png",
				animation: {
					frameDelay: 1000,
					cycleDelay: () => 0,
				},
			},
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: false,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 6,
					bottom: 0,
				},
			},
		},
	},
	avery_mansion: {
		folder: "avery-mansion",
		base: {
			default: {
				image: "base.png",
				condition: () => V.avery_fate !== "fallen" && V.avery_fate !== "kicked",
			},
			pool: {
				image: "pool.png",
				condition: () => V.avery_fate !== "fallen" && V.avery_fate !== "kicked",
			},
			fire: {
				image: "base-fire.png",
				condition: () => V.avery_mansion_fire_time > 0,
				animation: {
					frameDelay: 150,
				},
			},
			ruin: {
				image: "base-burnt.png",
				condition: () => !V.avery_mansion_fire_time && (V.avery_fate === "fallen" || V.avery_fate === "kicked"),
			},
		},
		emissive: {
			white: {
				image: "emissive-white.png",
				condition: () => V.avery_fate !== "fallen" && V.avery_fate !== "kicked",
				color: "#ffffff",
				size: 5,
			},
			yellow: {
				image: "emissive-yellow.png",
				condition: () => Weather.lightsOn && V.avery_fate !== "fallen" && V.avery_fate !== "kicked",
				size: 5,
			},
			fire: {
				image: "fire-particle.png",
				condition: () => V.avery_mansion_fire_time > 0,
				animation: {
					frameDelay: 150,
				},
				color: "#e6502eff",
				strength: 1,
			},
			dust: {
				image: "fire-particle-dust.png",
				condition: () => V.avery_mansion_fire_time > 0,
				color: "#46221bff",
				animation: {
					frameDelay: 150,
					cycleDelay: () => random(0, 4, true) * 1000,
				},
				strength: 0.1,
			},
		},
		reflective: {
			mask: {
				image: "pool-fire.png",
				condition: () => V.avery_mansion_fire_time > 0,
				verticalFactor: 3.5,
				amplitude: 6,
				verticalSpeed: 0.1,
				horizon: 30,
			},
		},
		weather: {
			fogDistributionCurve: 0,
			rainSplashEnabled: false,
			fogEnabled: false,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 0,
					bottom: 0,
				},
			},
		},
	},
	avery_skyscraper: {
		folder: "avery-skyscraper",
		base: {
			default: {
				image: "base.png",
				condition: () => V.avery_tower.progress >= 80,
			},
			default_mid: {
				image: "base-mid.png",
				animation: {
					frameDelay: 300,
					cycleDelay: () => 1200,
				},
				condition: () => V.avery_tower.progress >= 40 && V.avery_tower.progress < 80,
			},
			default_low: {
				image: "base-low.png",
				condition: () => V.avery_tower.progress < 40,
			},
			base_fire: {
				image: "base-fire.png",
				condition: () => V.avery_skyscraper_fire_time > 1,
			},
			burnt: {
				image: "base-burnt.png",
				condition: () => (V.avery_fate === "saved" || V.avery_fate === "fallen" || V.avery_fate === "kicked") && !V.avery_skyscraper_fire_time,
			},
			winter: {
				image: "winter.png",
				condition: () => Time.season === "winter" && V.avery_tower.progress >= 80,
			},
			mid_winter: {
				image: "mid-winter.png",
				condition: () => Time.season === "winter" && V.avery_tower.progress >= 40 && V.avery_tower.progress < 80,
			},
		},
		emissive: {
			lights: {
				image: "lights.png",
				condition: () =>
					Time.dayState === "night" &&
					V.avery_tower.progress >= 100 &&
					V.avery_fate !== "saved" &&
					V.avery_fate !== "fallen" &&
					V.avery_fate !== "kicked",
				color: "#deae66",
				size: 5,
			},
			mid_lights: {
				image: "mid-lights.png",
				condition: () => Time.dayState === "night" && V.avery_tower.progress < 80,
				color: "#deae66",
				size: 5,
			},
			fire: {
				image: "fire.png",
				condition: () => V.avery_skyscraper_fire_time > 0,
				animation: {
					frameDelay: 150,
				},
				color: "#e6502eff",
				strength: 1,
			},
		},
		weather: {
			fogDistributionCurve: 5,
			rainSplashEnabled: false,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 12,
					bottom: 0,
				},
			},
		},
	},
	banner: {
		folder: "banner",
		base: {
			default: {
				condition: () => !Weather.bloodMoon && !(Number(localStorage.getItem("worldCorruption")) > 24),
				image: "banner-tentacles-1.png",
			},
			bloodmoon: {
				condition: () => Weather.bloodMoon && !(Number(localStorage.getItem("worldCorruption")) > 24),
				image: "banner-tentacles-blood-moon-1.png",
			},
			tentacles2: {
				condition: () =>
					!Weather.bloodMoon && Number(localStorage.getItem("worldCorruption")) >= 25 && Number(localStorage.getItem("worldCorruption")) < 50,
				image: "banner-tentacles-2.png",
			},
			bloodmoonTentacles2: {
				condition: () =>
					Weather.bloodMoon && Number(localStorage.getItem("worldCorruption")) >= 25 && Number(localStorage.getItem("worldCorruption")) < 50,
				image: "banner-tentacles-blood-moon-2.png",
			},
			tentacles3: {
				condition: () =>
					!Weather.bloodMoon && Number(localStorage.getItem("worldCorruption")) >= 50 && Number(localStorage.getItem("worldCorruption")) < 75,
				image: "banner-tentacles-3.png",
			},
			bloodmoonTentacles3: {
				condition: () =>
					Weather.bloodMoon && Number(localStorage.getItem("worldCorruption")) >= 50 && Number(localStorage.getItem("worldCorruption")) < 75,
				image: "banner-tentacles-blood-moon-3.png",
			},
			tentacles4: {
				condition: () =>
					!Weather.bloodMoon && Number(localStorage.getItem("worldCorruption")) >= 75 && Number(localStorage.getItem("worldCorruption")) < 100,
				image: "banner-tentacles-4.png",
			},
			bloodmoonTentacles4: {
				condition: () =>
					Weather.bloodMoon && Number(localStorage.getItem("worldCorruption")) >= 75 && Number(localStorage.getItem("worldCorruption")) < 100,
				image: "banner-tentacles-blood-moon-4.png",
			},
			tentacles5: {
				condition: () => !Weather.bloodMoon && Number(localStorage.getItem("worldCorruption")) >= 100,
				image: "banner-tentacles-5.png",
			},
			bloodmoonTentacles5: {
				condition: () => Weather.bloodMoon && Number(localStorage.getItem("worldCorruption")) >= 100,
				image: "banner-tentacles-blood-moon-5.png",
			},
		},
		emissive: {
			default: {
				image: "banner-tentacles-1.png",
				condition: () =>
					!Weather.bloodMoon && (Weather.banner?.orbitals.sun.factor ?? 1) < 0 && !(Number(localStorage.getItem("worldCorruption")) > 24),
				color: "#ffffff40",
				size: 0,
				blur: 0,
				intensity: 0.6,
			},
			bloodmoon: {
				image: "banner-tentacles-blood-moon-1.png",
				condition: () => Weather.bloodMoon && (Weather.banner?.orbitals.sun.factor ?? 1) < 0 && !(Number(localStorage.getItem("worldCorruption")) > 24),
				color: "#ffffff40",
				size: 0,
				blur: 0,
				intensity: 0.4,
			},
			tentacles2: {
				image: "banner-tentacles-2.png",
				condition: () =>
					!Weather.bloodMoon &&
					(Weather.banner?.orbitals.sun.factor ?? 1) < 0 &&
					Number(localStorage.getItem("worldCorruption")) >= 25 &&
					Number(localStorage.getItem("worldCorruption")) < 50,
				color: "#ffffff40",
				size: 0,
				blur: 0,
				intensity: 0.6,
			},
			bloodmoonTentacles2: {
				image: "banner-tentacles-blood-moon-2.png",
				condition: () =>
					Weather.bloodMoon &&
					(Weather.banner?.orbitals.sun.factor ?? 1) < 0 &&
					Number(localStorage.getItem("worldCorruption")) >= 25 &&
					Number(localStorage.getItem("worldCorruption")) < 50,
				color: "#ffffff40",
				size: 0,
				blur: 0,
				intensity: 0.4,
			},
			tentacles3: {
				image: "banner-tentacles-3.png",
				condition: () =>
					!Weather.bloodMoon &&
					(Weather.banner?.orbitals.sun.factor ?? 1) < 0 &&
					Number(localStorage.getItem("worldCorruption")) >= 50 &&
					Number(localStorage.getItem("worldCorruption")) < 75,
				color: "#ffffff40",
				size: 0,
				blur: 0,
				intensity: 0.6,
			},
			bloodmoonTentacles3: {
				image: "banner-tentacles-blood-moon-3.png",
				condition: () =>
					Weather.bloodMoon &&
					(Weather.banner?.orbitals.sun.factor ?? 1) < 0 &&
					Number(localStorage.getItem("worldCorruption")) >= 50 &&
					Number(localStorage.getItem("worldCorruption")) < 75,
				color: "#ffffff40",
				size: 0,
				blur: 0,
				intensity: 0.4,
			},
			tentacles4: {
				image: "banner-tentacles-4.png",
				condition: () =>
					!Weather.bloodMoon &&
					(Weather.banner?.orbitals.sun.factor ?? 1) < 0 &&
					Number(localStorage.getItem("worldCorruption")) >= 75 &&
					Number(localStorage.getItem("worldCorruption")) < 100,
				color: "#ffffff40",
				size: 0,
				blur: 0,
				intensity: 0.6,
			},
			bloodmoonTentacles4: {
				image: "banner-tentacles-blood-moon-4.png",
				condition: () =>
					Weather.bloodMoon &&
					(Weather.banner?.orbitals.sun.factor ?? 1) < 0 &&
					Number(localStorage.getItem("worldCorruption")) >= 75 &&
					Number(localStorage.getItem("worldCorruption")) < 100,
				color: "#ffffff40",
				size: 0,
				blur: 0,
				intensity: 0.4,
			},
			tentacles5: {
				image: "banner-tentacles-5.png",
				condition: () => !Weather.bloodMoon && (Weather.banner?.orbitals.sun.factor ?? 1) < 0 && Number(localStorage.getItem("worldCorruption")) >= 100,
				color: "#ffffff40",
				size: 0,
				blur: 0,
				intensity: 0.6,
			},
			bloodmoonTentacles5: {
				image: "banner-tentacles-blood-moon-5.png",
				condition: () => Weather.bloodMoon && (Weather.banner?.orbitals.sun.factor ?? 1) < 0 && Number(localStorage.getItem("worldCorruption")) >= 100,
				color: "#ffffff40",
				size: 0,
				blur: 0,
				intensity: 0.4,
			},
		},
		reflective: {
			mask: {
				image: "reflective.png",
			},
			ice: {
				condition: () => Weather.isSnow,
				image: "ice.png",
				alpha: 0.8,
			},
			overlay: {
				image: "water.png",
				compositeOperation: () => (Weather.isSnow ? "screen" : "overlay"),
				alpha: () => (V.weatherObj.snow > 450 ? 0.5 : 0.4),
			},
		},
		layerTop: {
			snow: {
				condition: () => V.weatherObj.snow > 450 && !(Number(localStorage.getItem("worldCorruption")) >= 25),
				image: "snow.png",
			},
			snowTentacle: {
				condition: () => V.weatherObj.snow > 450 && Number(localStorage.getItem("worldCorruption")) >= 25,
				image: "snow.png",
			},
		},
		weather: {
			fogDistributionCurve: 3,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 50,
					bottom: 0,
				},
			},
		},
	},
	beach: {
		folder: "beach",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			foam: {
				image: "waves.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => 1000,
				},
			},
		},
		reflective: {
			mask: {
				image: "reflective.png",
				verticalFactor: 3.5,
				amplitude: 35,
			},
			waves: {
				image: "waves.png",
				alpha: 0.5,
				alwaysDisplay: false,
				compositeOperation: "overlay",
				animation: "foam",
			},
			overlay: {
				image: "water.png",
				compositeOperation: "overlay",
				alpha: 0.4,
			},
		},
		layerTop: {
			tree: {
				image: "tree.png",
				animation: {
					frameDelay: 350,
					cycleDelay: () => 3250,
				},
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 12,
					bottom: 0,
				},
				fog: {
					top: 14,
					bottom: 0,
				},
			},
		},
	},
	blitz: {
		folder: "blitz",
		base: {
			default: {
				condition: () => ["home", "manor", "winter"].includes(V.bus),
				image: "base.png",
			},
			street: {
				condition: () => !["home", "manor", "winter"].includes(V.bus),
				image: "base-street.png",
			},
			smoke: {
				condition: () => ["home", "manor", "winter"].includes(V.bus) && !T.smokeOff,
				image: "smoke.png",
				animation: {
					frameDelay: 200,
					cycleDelay: 0,
				},
			},
			smoke_street: {
				condition: () => !["home", "manor", "winter"].includes(V.bus),
				image: "smoke-street.png",
				animation: {
					frameDelay: 220,
					cycleDelay: 0,
				},
			},
		},
		weather: {
			fogDistributionCurve: 1.2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 19,
					bottom: 0,
				},
				fog: {
					top: 24,
					bottom: 0,
				},
			},
		},
	},
	bog: {
		folder: "bog",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
				animation: {
					frameDelay: 2000,
					cycleDelay: () => 1000,
				},
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
				animation: {
					frameDelay: 2000,
					cycleDelay: () => 1000,
				},
			},
		},
		emissive: {
			bloodmoon: {
				condition: () => Weather.bloodMoon,
				image: "emissive-blood.png",
				color: "#e63e3e66",
				size: 15,
			},
			lights: {
				image: "emissive.png",
				condition: () => !Weather.bloodMoon && Time.dayState === "night" && Time.season !== "autumn" && Time.season !== "winter",
				color: "#deae66",
				size: 4,
				animation: {
					frameDelay: 250,
				},
			},
		},
		weather: {
			fogDistributionCurve: 1.2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 12,
					bottom: 0,
				},
				fog: {
					top: 16,
					bottom: 0,
				},
			},
		},
	},
	brothel: {
		folder: "brothel",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
			color: "#deae66",
			size: 5,
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 2,
					bottom: 0,
				},
				fog: {
					top: 7,
					bottom: 0,
				},
			},
		},
	},
	cabin: {
		folder: "cabin",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			snowroof: {
				condition: () => Weather.isSnow,
				image: "snowroof.png",
				animation: {
					frameDelay: 250,
					cycleDelay: () => random(3, 7, true) * 1000,
				},
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
			color: "#deae66",
			strength: 2,
		},
		weather: {
			fogDistributionCurve: 1.5,
			rainSplashEnabled: false,
			fogEnabled: true,
			fogOpacity: 0.5,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 20,
					bottom: 0,
				},
			},
		},
		particles: [
			{
				condition: () => Weather.isSnow || (!Weather.isSnow && Weather.lightsOn),
				type: "smoke",
				shape: "image",
				image: "img/misc/sky/clouds/fog/2.png",
				origin: [30, 60],
				rate: 3,
				size: 4,
				riseSpeed: 3,
				spread: 2,
				alpha: 0.2,
				color: "rgba(195, 195, 195, 0.43)",
				windSpeed: 1,
				windDirection: 1,
				minFadeDistance: 5,
				maxFadeDistance: 10,
				fadeTime: 4,
				driftAmplitude: 1,
				driftWavelength: 10,
			},
		],
	},
	cafe: {
		folder: "cafe",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
			color: "#deae66",
			strength: 2,
		},
		reflective: {
			mask: {
				image: "reflective.png",
				verticalFactor: 3.5,
				amplitude: 35,
			},
			overlay: {
				image: "water.png",
				compositeOperation: "overlay",
				alpha: 0.5,
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 5,
					bottom: 0,
				},
				fog: {
					top: 8,
					bottom: 0,
				},
			},
		},
	},
	cafe_construction: {
		folder: "cafe-construction",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
			color: "#deae66",
			strength: 2,
		},
		reflective: {
			mask: {
				image: "reflective.png",
				verticalFactor: 3.5,
				amplitude: 35,
			},
			overlay: {
				image: "water.png",
				compositeOperation: "overlay",
				alpha: 0.5,
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 5,
					bottom: 0,
				},
				fog: {
					top: 10,
					bottom: 0,
				},
			},
		},
	},
	cafe_renovated: {
		folder: "cafe-renovated",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		reflective: {
			mask: {
				image: "reflective.png",
				verticalFactor: 3.5,
				amplitude: 35,
			},
			overlay: {
				image: "water.png",
				compositeOperation: "overlay",
				alpha: 0.5,
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 5,
					bottom: 0,
				},
				fog: {
					top: 10,
					bottom: 0,
				},
			},
		},
	},
	canal: {
		folder: "canal",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			drip: {
				condition: () => Weather.isSnow,
				image: "drip.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => random(5, 15, true) * 1000,
				},
			},
		},
		reflective: {
			mask: {
				image: "reflective.png",
				verticalSpeed: 0.1,
				verticalFactor: 3,
				amplitude: 6,
			},
			overlay: {
				image: "water.png",
				condition: () => !Weather.isSnow,
				compositeOperation: "overlay",
				alpha: 0.5,
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
				alpha: 0.9,
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: false,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 25,
					bottom: 0,
				},
			},
		},
	},
	chalets: {
		folder: "chalets",
		base: {
			default: {
				image: "base.png",
			},
			foam: {
				image: "waves.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => 1000,
				},
			},
		},
		reflective: {
			mask: {
				image: "reflective.png",
				verticalFactor: 3.5,
				amplitude: 35,
			},
			waves: {
				image: "waves.png",
				alpha: 0.5,
				alwaysDisplay: false,
				compositeOperation: "overlay",
				animation: "foam",
			},
		},
		layerTop: {
			tree: {
				image: "tree.png",
				animation: {
					frameDelay: 350,
					cycleDelay: () => 3250,
				},
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			image: "emissive.png",
			color: "#c26802",
			size: 1,
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 14,
					bottom: 0,
				},
				fog: {
					top: 16,
					bottom: 0,
				},
			},
		},
	},
	churchyard: {
		folder: "churchyard",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			image: "emissive.png",
			color: "#a8b5ff",
			size: 2,
		},
		weather: {
			fogDistributionCurve: 1.2,
			rainSplashEnabled: false,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 27,
					bottom: 0,
				},
			},
		},
	},
	coastpath: {
		folder: "coastal-path",
		base: {
			default: {
				image: "base.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => random(5, 15, true) * 1000,
				},
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => random(5, 15, true) * 1000,
				},
			},
			flower: {
				condition: () => !Weather.isSnow,
				image: "flower.png",
				animation: {
					frameDelay: 500,
					cycleDelay: () => random(5, 30, true) * 1000,
				},
			},
			bunny: {
				condition: () => Time.dayState !== "night",
				image: "bunny.png",
				animation: {
					frameDelay: 150,
					cycleDelay: () => random(10, 40, true) * 1000,
				},
			},
		},
		reflective: {
			mask: {
				image: "reflective.png",
				compositeOperation: "overlay",
				verticalFactor: 4,
				amplitude: 20,
				frequency: 15,
			},
			overlay: {
				image: "water.png",
				compositeOperation: "overlay",
				animation: {
					frameDelay: 250,
					cycleDelay: () => 0,
				},
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 13,
					bottom: 0,
				},
				fog: {
					top: 15,
					bottom: 0,
				},
			},
		},
	},
	com_alley: {
		folder: "com-alley",
		base: {
			default: {
				condition: () => !Weather.bloodMoon && !Weather.isSnow,
				image: "base.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => random(5, 30, true) * 1000,
				},
			},
			blood: {
				condition: () => Weather.bloodMoon && !Weather.isSnow,
				image: "blood-moon.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => random(10, 60, true) * 1000,
				},
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
			color: "#deae66",
			strength: 2,
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: false,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 22,
					bottom: 0,
				},
			},
		},
	},
	compound: {
		folder: "compound",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			smoke: {
				condition: () => !Weather.bloodMoon,
				image: "smoke.png",
				animation: {
					frameDelay: 300,
					cycleDelay: 0,
				},
			},
		},
		weather: {
			fogDistributionCurve: 4,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 4,
					bottom: 0,
				},
				fog: {
					top: 13,
					bottom: 0,
				},
			},
		},
	},
	dance_studio: {
		folder: "dance-studio",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		weather: {
			fogDistributionCurve: 3,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 4,
					bottom: 0,
				},
				fog: {
					top: 10,
					bottom: 0,
				},
			},
		},
	},
	dilapidated_shop: {
		folder: "dilapidated-shop",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		weather: {
			fogDistributionCurve: 3,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 7,
					bottom: 0,
				},
				fog: {
					top: 14,
					bottom: 0,
				},
			},
		},
	},
	docks: {
		folder: "docks",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			boat: {
				// Not at same time as cruiser
				waitForAnimation: "cruiser",
				image: "boat.png",
				animation: {
					frameDelay: 6000,
					cycleDelay: () => random(2, 20, true) * 1000,
					startFrame: () => random(1, 24, true),
				},
			},
			cruiser: {
				condition: () => Time.dayState !== "night",
				// Not at same time as boat
				waitForAnimation: "boat",
				image: "cruiser.png",
				animation: {
					frameDelay: 9000,
					cycleDelay: () => random(2, 20, true) * 1000,
					startFrame: () => (random(0, 1, true) ? random(0, 24, true) : 0),
				},
			},
		},
		reflective: {
			mask: {
				image: "reflective.png",
				verticalFactor: 4,
				amplitude: 20,
				frequency: 15,
			},
			overlay: {
				image: "water.png",
				compositeOperation: "overlay",
				alpha: 0.4,
			},
			waves: {
				condition: () => Weather.value >= 3, // light precipitation or above
				image: "waves.png",
				alpha: 0.8,
				alwaysDisplay: false,
				compositeOperation: "overlay",
				animation: {
					frameDelay: 200,
					cycleDelay: () => 1000,
				},
			},
			waves2: {
				image: "waves.png",
				condition: () => Weather.value >= 4, // heavy precipitation or above
				alpha: 0.8,
				alwaysDisplay: false,
				compositeOperation: "overlay",
				animation: {
					startDelay: 3000,
					frameDelay: 200,
					cycleDelay: () => 1000,
				},
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 3,
					bottom: 0,
				},
				fog: {
					top: 20,
					bottom: 0,
				},
			},
		},
	},
	drain: {
		folder: "drain",
		base: {
			default: {
				image: "base.png",
			},
			drain: {
				condition: () => !Weather.isFreezing,
				image: "drain.png",
				animation: {
					frameDelay: 300,
					cycleDelay: () => 0,
				},
			},
			water: {
				image: "water.png",
				animation: {
					frameDelay: 1000,
					cycleDelay: () => 2000,
				},
			},
		},
		// reflective: {
		// 	mask: {
		// 		image: "reflective.png",
		// 	},
		// 	water: {
		// 		image: "water.png",
		// 		animation: {
		// 			frameDelay: 1000,
		// 			cycleDelay: () => 2000,
		// 		},
		// 	},
		// },

		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 20,
					bottom: 0,
				},
				fog: {
					top: 26,
					bottom: 0,
				},
			},
		},
	},
	estate: {
		folder: "estate",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			condition: () => Weather.lightsOn,
			image: "emissive.png",
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 6,
					bottom: 0,
				},
				fog: {
					top: 17,
					bottom: 0,
				},
			},
		},
	},
	factory: {
		folder: "factory",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			lorry_back: {
				condition: () => Time.dayState !== "night" && Time.dayState !== "day",
				image: "lorry-back.png",
			},
			lorry_front: {
				condition: () => Time.dayState !== "night",
				image: "lorry-front.png",
			},
			gate: {
				condition: () => Time.dayState !== "night",
				image: "gate.png",
			},
			inside: {
				condition: () => Time.dayState !== "night",
				image: "inside.png",
				waitForAnimation: "lorry-moving",
				animation: {
					frameDelay: 150,
					cycleDelay: () => random(5, 15, true) * 1000,
				},
			},
			lorry_moving: {
				condition: () => Time.dayState !== "night",
				image: "lorry-moving.png",
				waitForAnimation: "inside",
				animation: {
					frameDelay: 150,
					cycleDelay: () => random(10, 30, true) * 1000,
				},
			},
		},
		emissive: {
			lights: {
				image: "emissive.png",
				condition: () => Weather.lightsOn,
				size: 3,
				color: "#e7eb81",
			},
			stop_lights: {
				image: "lights-emissive.png",
				alwaysDisplay: true,
				animation: "lorry-moving",
				size: 5,
				color: "#e34d4d",
			},
			lorry_lights: {
				image: "lorry-emissive.png",
				condition: () => Weather.lightsOn,
				alwaysDisplay: false,
				animation: "lorry-moving",
				size: 10,
				color: "#f7e092",
			},
			lorry_back_lights: {
				image: "lorry-back-emissive.png",
				alwaysDisplay: false,
				animation: "lorry-moving",
				size: 4,
				color: "#e34d4d",
			},
			inside_lights: {
				image: "inside-emissive.png",
				condition: () => Weather.lightsOn,
				alwaysDisplay: false,
				animation: "inside",
				color: "#e6cc77",
			},
		},
		weather: {
			fogDistributionCurve: 1.2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 10,
					bottom: 0,
				},
				fog: {
					top: 13,
					bottom: 0,
				},
			},
		},
	},
	farm: {
		folder: "farm",
		base: {
			default: {
				condition: () => !Weather.isSnow && Time.season !== "winter",
				image: "base.png",
			},
			winter: {
				condition: () => !Weather.isSnow && Time.season === "winter",
				image: "winter.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			wind_base: {
				condition: () => !Weather.isSnow && Time.season !== "winter",
				image: "wind-base.png",
				animation: {
					frameDelay: 1000,
				},
			},
			wind_winter: {
				condition: () => !Weather.isSnow && Time.season === "winter",
				image: "wind-winter.png",
				animation: {
					frameDelay: 1000,
				},
			},
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 15,
					bottom: 0,
				},
				fog: {
					top: 19,
					bottom: 0,
				},
			},
		},
	},
	farm_manors: {
		folder: "farm-manors",
		base: {
			default: {
				condition: () => Time.season !== "winter",
				image: "base.png",
			},
			winter: {
				condition: () => Time.season === "winter",
				image: "base-winter.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: false,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 28,
					bottom: 0,
				},
			},
		},
	},
	fields: {
		folder: "fields",
		base: {
			watchtower: {
				condition: () => V.farm.tower >= 1,
				image: "watchtower.png",
			},
			spring: {
				condition: () => !Weather.isSnow && Time.season === "spring",
				image: "spring.png",
			},
			summer: {
				condition: () => !Weather.isSnow && Time.season === "summer",
				image: "summer.png",
			},
			autumn: {
				condition: () => !Weather.isSnow && Time.season === "autumn",
				image: "autumn.png",
			},
			winter: {
				condition: () => !Weather.isSnow && Time.season === "winter",
				image: "winter.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			wind: {
				image: "wind.png",
				animation: {
					frameDelay: 100,
					cycleDelay: () => 4000,
					startDelay: () => 150,
				},
			},
		},
		emissive: {
			condition: () => V.farm.tower >= 1 && Weather.lightsOn,
			image: "emissive.png",
			color: "#deae66",
			blur: 0,
			intensity: 0.8,
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 21,
					bottom: 0,
				},
				fog: {
					top: 23,
					bottom: 0,
				},
			},
		},
	},
	flats: {
		folder: "flats",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			water: {
				image: "sea.png",
			},
			power: {
				image: "power-lines.png",
			},
		},
		emissive: {
			lights: {
				image: "emissive.png",
				condition: () => Weather.lightsOn,
				alwaysDisplay: false,
				color: "#deae66",
				intensity: 0.8,
				size: 2,
			},
			streetLight: {
				condition: () => Weather.lightsOn,
				image: "street-light.png",
				color: "#e8d39d",
				size: 4,
			},
			streetGlow: {
				condition: () => Weather.lightsOn,
				image: "street-glow.png",
				intensity: 0.5,
				color: "#deae6655",
				size: 2,
			},
		},
		// reflective: {
		// 	image: "reflective.png",
		// },

		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 5,
					bottom: 0,
				},
				fog: {
					top: 7,
					bottom: 0,
				},
			},
		},
	},
	forest: {
		folder: "forest",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			birds_light: {
				condition: () => !Weather.bloodMoon,
				image: "birds-light.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => random(5, 15, true) * 1000,
				},
			},
			bloodmoon: {
				condition: () => Weather.bloodMoon,
				image: "blood-moon.png",
				animation: {
					frameDelay: 300,
					cycleDelay: () => random(2, 7, true) * 1000,
				},
			},
		},
		emissive: {
			blood0: {
				condition: () => Weather.bloodMoon,
				image: "emissive-blood-0.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => random(2, 7, true) * 1000,
				},
				color: "#e63e3e",
			},
			blood1: {
				condition: () => Weather.bloodMoon,
				image: "emissive-blood-1.png",
				animation: {
					frameDelay: 2000,
					cycleDelay: () => random(4, 10, true) * 1000,
				},
				color: "#e63e3e",
			},
			blood2: {
				condition: () => Weather.bloodMoon,
				image: "emissive-blood-2.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => random(4, 11, true) * 1000,
				},
				color: "#e63e3e",
			},
			blood3: {
				condition: () => Weather.bloodMoon,
				image: "emissive-blood-3.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => random(3, 12, true) * 1000,
				},
				color: "#e63e3e",
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: false,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 30,
					bottom: 0,
				},
			},
		},
	},
	forest_shop: {
		folder: "forest-shop",
		base: {
			spring: {
				condition: () => !Weather.isSnow && Time.season === "spring",
				image: "spring.png",
			},
			summer: {
				condition: () => !Weather.isSnow && Time.season === "summer",
				image: "summer.png",
			},
			autumn: {
				condition: () => !Weather.isSnow && Time.season === "autumn",
				image: "autumn.png",
			},
			winter: {
				condition: () => !Weather.isSnow && Time.season === "winter",
				image: "winter.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			front_spring: {
				condition: () => Time.season === "spring",
				image: "front-spring.png",
			},
			front_summer: {
				condition: () => Time.season === "summer",
				image: "front-summer.png",
			},
			front_autumn: {
				condition: () => Time.season === "autumn",
				image: "front-autumn.png",
			},
			front_winter: {
				condition: () => Time.season === "winter",
				image: "front-winter.png",
			},
			smoke: {
				condition: () => !Weather.bloodMoon && !Weather.lightsOn,
				image: "smoke.png",
				animation: {
					frameDelay: 200,
				},
			},
		},
		emissive: {
			lights: {
				image: "emissive.png",
				condition: () => Weather.lightsOn && !V.gwylan?.timer?.nobody && !V.yearningLetter,
			},
			tower: {
				image: "emissive-tower-only.png",
				condition: () => Weather.lightsOn && !V.gwylan?.timer?.nobody && V.yearningLetter,
			},
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 13,
					bottom: 0,
				},
				fog: {
					top: 17,
					bottom: 0,
				},
			},
		},
	},
	forest_shop_garden: {
		folder: "forest-shop-garden",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			smoke: {
				condition: () => !Weather.bloodMoon && !Weather.lightsOn,
				image: "smoke.png",
				animation: {
					frameDelay: 200,
				},
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn && !V.gwylan?.timer?.nobody,
			animation: {
				frameDelay: 190,
			},
			color: "#89CFF0",
			intensity: 1.2,
			size: 2,
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 21,
					bottom: 0,
				},
				fog: {
					top: 27,
					bottom: 0,
				},
			},
		},
	},
	home: {
		folder: "home",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
		},
		particles: [
			{
				condition: () => !Weather.bloodMoon,
				type: "smoke",
				shape: "image",
				image: "img/misc/sky/clouds/fog/2.png",
				origin: [3, 71.5], // Coordinates from the top left
				rate: 3, // Particles generated per second
				size: 4, // Size of the particle in px
				riseSpeed: 0.8,
				spread: 5,
				alpha: 1,
				color: "#4c4c4cff", // Last 2 numbers are the alpha (99 in hex means 60%)
				windSpeed: 2, // strength of the wind, will push the particles in a direction
				windDirection: 0, // degrees - A value of 0 is right (east)
				minFadeDistance: 1, // minimum fade time of the particles (in distance (px))
				maxFadeDistance: 35, // maximum fade time
				fadeTime: 1.2, // In seconds
				driftAmplitude: 0, // curve - mostly useful if we want the smoke to travel straight up (but in a wobbly curve)
				driftWavelength: 0, // wavelength of the curve
			},
			{
				condition: () => !Weather.bloodMoon,
				type: "smoke",
				shape: "image",
				image: "img/misc/sky/clouds/fog/2.png",
				origin: [20, 69],
				rate: 3,
				size: 4,
				riseSpeed: 0.8,
				spread: 7,
				alpha: 1,
				color: "#484848ff",
				windSpeed: 2,
				windDirection: 0,
				minFadeDistance: 1,
				maxFadeDistance: 30,
				fadeTime: 1.2,
				driftAmplitude: 0,
				driftWavelength: 0,
			},
		],

		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 2,
					bottom: 0,
				},
				fog: {
					top: 7,
					bottom: 0,
				},
			},
		},
	},
	hospital: {
		folder: "hospital",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 13,
					bottom: 0,
				},
				fog: {
					top: 18,
					bottom: 0,
				},
			},
		},
	},
	ind_alley: {
		folder: "ind-alley",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => random(4, 15, true) * 1000,
				},
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => random(4, 15, true) * 1000,
				},
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
			color: "#deae66",
			strength: 2,
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: false,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 18,
					bottom: 0,
				},
			},
		},
	},
	island: {
		folder: "island",
		base: {
			default: {
				image: "base.png",
			},
		},
		reflective: {
			mask: {
				image: "reflective.png",
				verticalDirection: 1,
			},
			overlay: {
				image: "water.png",
				animation: {
					frameDelay: 500,
				},
			},
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 16,
					bottom: 0,
				},
				fog: {
					top: 29,
					bottom: 0,
				},
			},
		},
	},
	kylar_manor: {
		folder: "kylar-manor",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
			color: "#fbff86dd",
			size: 4,
			intensity: 0.8,
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 4,
					bottom: 0,
				},
				fog: {
					top: 19,
					bottom: 0,
				},
			},
		},
	},
	kylarmanor_grounds: {
		folder: "kylar-manor-grounds",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
			color: "#9484d1",
			size: 2,
			intensity: 0.4,
		},
		weather: {
			fogDistributionCurve: 4,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 18,
					bottom: 0,
				},
				fog: {
					top: 30,
					bottom: 0,
				},
			},
		},
	},
	lake: {
		folder: "lake",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			deer: {
				condition: () => !Weather.isSnow && Time.dayState === "dawn",
				image: "deer.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => 12000,
				},
			},
		},
		emissive: {
			lights: {
				image: "emissive.png",
				condition: () => Weather.lightsOn && Time.season !== "winter" && Time.season !== "autumn",
				animation: {
					frameDelay: 300,
					cycleDelay: () => 0,
				},
				color: "#deae66",
				strength: 2,
			},
			blood0: {
				condition: () => Weather.bloodMoon,
				image: "blood-0.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => random(2, 7, true) * 1000,
				},
				color: "#e63e3e",
			},
			blood1: {
				condition: () => Weather.bloodMoon,
				image: "blood-1.png",
				animation: {
					frameDelay: 2000,
					cycleDelay: () => random(4, 10, true) * 1000,
				},
				color: "#e63e3e",
			},
			blood2: {
				condition: () => Weather.bloodMoon,
				image: "blood-2.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => random(4, 11, true) * 1000,
				},
				color: "#e63e3e",
			},
		},
		reflective: {
			mask: {
				animationCondition: () => !Weather.isFrozen("lake"),
				image: "reflective.png",
				horizon: 18,
				blur: 0.4,
				verticalDirection: 1,
			},
			water: {
				condition: () => !Weather.isFrozen("lake"),
				image: "water.png",
				alpha: () => (!Weather.isFrozen("lake") ? 0.35 : 0.8),
			},
			glimmer: {
				condition: () => V.options.reflections && !Weather.isFrozen("lake"),
				image: "glimmer.png",
				compositeOperation: "overlay",
				alpha: 0.5,
				gradientMask: true,
				animation: {
					slider: true,
					frames: 150,
					frameDelay: 150,
				},
			},
			ice: {
				condition: () => Weather.isFrozen("lake"),
				image: "ice.png",
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 9,
					bottom: 0,
				},
				fog: {
					top: 30,
					bottom: 0,
				},
			},
		},
	},
	lake_office: {
		folder: "lake-office",
		base: {
			default: {
				condition: () => Time.season !== "winter",
				image: "base.png",
			},
			waterbase: {
				image: "water.png",
			},
			snow: {
				condition: () => Time.season === "winter",
				image: "snow.png",
			},
			ice: {
				condition: () => Weather.isFrozen("lake"),
				image: "ice.png",
			},
		},
		emissive: {
			lights: {
				image: "emissive.png",
				condition: () => Weather.lightsOn && Time.season !== "winter" && Time.season !== "autumn",
				animation: {
					frameDelay: 300,
					cycleDelay: () => 0,
				},
				color: "#deae66",
				strength: 2,
			},
			heater: {
				image: "emissive-winter.png",
				condition: () => !Weather.lightsOn && Time.season === "winter",
				color: "#ff5724",
				strength: 1,
			},
			heaterdim: {
				image: "emissive-winter.png",
				condition: () => Weather.lightsOn && Time.season === "winter",
				color: "#360c01",
				strength: 1,
			},
		},
		reflective: {
			mask: {
				image: "reflective.png",
				horizon: 18,
				blur: 0.5,
				verticalDirection: () => (!Weather.isFrozen("lake") ? 1 : 0),
				alpha: () => (!Weather.isFrozen("lake") ? 0.6 : 0.15),
			},
		},
		weather: {
			fogDistributionCurve: 5,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 14,
					bottom: 0,
				},
				fog: {
					top: 34,
					bottom: 0,
				},
			},
		},
	},
	lake_ruin: {
		folder: "lake-ruin",
		base: {
			default: {
				condition: () => !Weather.bloodMoon && !Weather.isSnow,
				image: "base.png",
				animation: {
					frameDelay: 3000,
					cycleDelay: () => 5000,
				},
			},
			snow: {
				condition: () => !Weather.bloodMoon && Weather.isSnow,
				image: "snow.png",
				animation: {
					frameDelay: 3000,
					cycleDelay: () => 5000,
				},
			},
			bloodmoon: {
				condition: () => Weather.bloodMoon && Weather.isSnow,
				image: "blood-moon.png",
				animation: {
					frameDelay: 300,
					cycleDelay: () => 0,
				},
			},
			blood_moon_snow: {
				condition: () => Weather.bloodMoon && !Weather.isSnow,
				image: "blood-moon-snow.png",
				animation: {
					frameDelay: 300,
					cycleDelay: () => 0,
				},
			},
		},
		emissive: {
			blood: {
				condition: () => Weather.bloodMoon,
				image: "emissive-blood.png",
				animation: "bloodmoon",
				color: "#e63e3e",
			},
		},
		reflective: {
			mask: {
				condition: () => !Weather.bloodMoon,
				image: "reflective.png",
			},
			water: {
				condition: () => !Weather.bloodMoon,
				image: "water.png",
				alpha: 0.5,
				animation: {
					frameDelay: 1000,
					cycleDelay: () => 0,
				},
			},
		},
		// 	bloodMoon: {
		// 		condition: () => Weather.bloodMoon,
		// 		image: "reflective-blood.png",
		// 	},
		// 	horizon: 112,
		// },

		weather: {
			fogDistributionCurve: 0,
			rainSplashEnabled: false,
			fogEnabled: false,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 0,
					bottom: 0,
				},
			},
		},
	},
	landfill: {
		folder: "landfill",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 6,
					bottom: 0,
				},
				fog: {
					top: 16,
					bottom: 0,
				},
			},
		},
	},
	market: {
		folder: "market",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: false,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 17,
					bottom: 0,
				},
			},
		},
	},
	townhall: {
		folder: "town-hall",
		base: {
			default: {
				image: "base.png",
			},
			trees: {
				condition: () => Time.season !== "winter",
				image: "trees.png",
			},
			trees_winter: {
				condition: () => Time.season === "winter",
				image: "trees-winter.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
			color: "#deae66",
			strength: 2,
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 9,
					bottom: 0,
				},
				fog: {
					top: 15,
					bottom: 0,
				},
			},
		},
	},
	meadow: {
		folder: "meadow",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			wind: {
				image: "wind.png",
				animation: {
					frameDelay: 100,
					cycleDelay: () => random(5, 15, true) * 1000,
				},
			},
		},
		emissive: {
			lights: {
				image: "emissive.png",
				condition: () => !Weather.bloodMoon && Time.dayState === "night" && Time.season !== "autumn" && Time.season !== "winter",
				color: "#deae66",
				size: 4,
				animation: {
					frameDelay: 200,
				},
			},
		},
		weather: {
			fogDistributionCurve: 1.5,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 21,
					bottom: 0,
				},
				fog: {
					top: 26,
					bottom: 0,
				},
			},
		},
	},
	moor: {
		folder: "moor",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			grass: {
				image: "grass.png",
				animation: {
					frameDelay: 300,
					cycleDelay: () => random(1, 8, true) * 1000,
				},
			},
			wind: {
				image: "wind.png",
				animation: {
					frameDelay: 100,
					cycleDelay: () => random(5, 15, true) * 1000,
				},
			},
		},
		// reflective: {
		// 	image: "reflective.png",
		// 	horizon: 112,
		// },

		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 22,
					bottom: 0,
				},
				fog: {
					top: 24,
					bottom: 0,
				},
			},
		},
	},
	museum: {
		folder: "museum",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			grass: {
				condition: () => Time.season === "autumn",
				image: "grass-autumn.png",
			},
		},
		weather: {
			fogDistributionCurve: 1.5,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 10,
					bottom: 0,
				},
				fog: {
					top: 17,
					bottom: 0,
				},
			},
		},
	},
	night_monster_lair: {
		folder: "night-monster-lair",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			beast: {
				image: "beast.png",
				condition: () => Time.dayState === "dawn",
				animation: {
					frameDelay: 300,
					cycleDelay: () => random(1, 5, true) * 1000,
				},
			},
			drip: {
				image: "drip.png",
				animation: {
					frameDelay: 300,
					cycleDelay: () => 4000,
				},
			},
			flies: {
				image: "drip.png",
				condition: () => Time.dayState !== "dawn",
				animation: {
					frameDelay: 300,
					cycleDelay: () => 0,
				},
			},
			rat: {
				image: "rat.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => random(10, 30, true) * 1000,
				},
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: false,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 2,
					bottom: 0,
				},
			},
		},
	},
	oak: {
		folder: "oak",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		weather: {
			fogDistributionCurve: 2.5,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 7,
					bottom: 0,
				},
				fog: {
					top: 17,
					bottom: 0,
				},
			},
		},
	},
	office: {
		folder: "office",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			grass: {
				condition: () => Time.season === "autumn",
				image: "grass-autumn.png",
			},
		},
		emissive: {
			default: {
				condition: () => Weather.lightsOn,
				image: "emissive.png",
			},
			evening: {
				condition: () => Weather.lightsOn && Time.dayState === "dusk",
				image: "emissive-evening.png",
			},
			redBlinkingLight: {
				image: "red.png",
				color: "#ff5058",
				size: 3,
				animation: {
					frameDelay: 1000,
					cycleDelay: () => 1000,
				},
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 8,
					bottom: 0,
				},
				fog: {
					top: 11,
					bottom: 0,
				},
			},
		},
	},
	old_temple: {
		folder: "old-temple",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
			color: "#ff633f",
			size: 4,
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 13,
					bottom: 0,
				},
				fog: {
					top: 21,
					bottom: 0,
				},
			},
		},
	},
	park: {
		folder: "park",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			fountain: {
				image: "fountain.png",
				condition: () => !Weather.isFrozen("fountain"),
				animation: {
					frameDelay: 200,
					cycleDelay: () => 0,
				},
			},
			treebirds: {
				condition: () => !Weather.isSnow && Time.dayState !== "night",
				// Not at same time as flyingbird
				waitForAnimation: "flying-bird",
				image: "tree-birds.png",
				animation: {
					frameDelay: 300,
					cycleDelay: () => random(2, 10, true) * 1000,
				},
			},
			flyingbird: {
				condition: () => !Weather.isSnow && (Time.dayState === "dawn" || Time.dayState === "dusk"),
				// Not at same time as treebirds
				waitForAnimation: "tree-birds",
				image: "flying-bird.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => random(10, 30, true) * 1000,
				},
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
			color: "#deae66a5",
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 19,
					bottom: 0,
				},
				fog: {
					top: 23,
					bottom: 0,
				},
			},
		},
	},
	estate_cottage: {
		folder: "estate-cottage",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 11,
					bottom: 0,
				},
				fog: {
					top: 15,
					bottom: 0,
				},
			},
		},
		particles: [
			{
				condition: () => Weather.isSnow,
				type: "smoke",
				shape: "image",
				image: "img/misc/sky/clouds/fog/2.png",
				origin: [9, 63],
				rate: 1,
				size: 1,
				riseSpeed: 2,
				spread: 1,
				alpha: 0.5,
				color: "rgba(195, 195, 195, 0.43)",
				windSpeed: 1,
				windDirection: 1,
				minFadeDistance: 5,
				maxFadeDistance: 7,
				fadeTime: 2,
				driftAmplitude: 1,
				driftWavelength: 10,
			},
		],
	},
	police_station: {
		folder: "police-station",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			grass: {
				image: "grass-autumn.png",
				condition: () => !Weather.isSnow && Time.season === "autumn",
			},
			car: {
				image: "car.png",
				condition: () => Time.dayState === "night" || (Time.hour > 11 && Time.hour < 14),
			},
		},
		emissive: {
			image: "emissive.png",
			condition: () => Weather.lightsOn,
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 11,
					bottom: 0,
				},
				fog: {
					top: 15,
					bottom: 0,
				},
			},
		},
	},
	pool: {
		folder: "pool",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
				animation: {
					frameDelay: 300,
					cycleDelay: () => 0,
				},
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
				animation: {
					frameDelay: 300,
					cycleDelay: () => 0,
				},
			},
		},
		weather: {
			fogDistributionCurve: 0,
			rainSplashEnabled: false,
			fogEnabled: false,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 0,
					bottom: 0,
				},
			},
		},
	},
	pound: {
		folder: "pound",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			cage: {
				condition: () => !Weather.bloodMoon,
				image: "cage.png",
				animation: {
					frameDelay: 500,
					cycleDelay: () => random(3, 15, true) * 1000,
				},
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 5,
					bottom: 0,
				},
				fog: {
					top: 9,
					bottom: 0,
				},
			},
		},
	},
	prison: {
		folder: "prison",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			water: {
				image: "water.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => 0,
				},
			},
		},
		weather: {
			fogDistributionCurve: 4,
			rainSplashEnabled: false,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 23,
					bottom: 0,
				},
			},
		},
	},
	prison_beach: {
		folder: "beach",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			foam: {
				image: "waves.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => 1000,
				},
			},
		},
		reflective: {
			mask: {
				image: "reflective.png",
				verticalFactor: 3.5,
				amplitude: 35,
			},
			waves: {
				image: "waves.png",
				alpha: 0.5,
				alwaysDisplay: false,
				compositeOperation: "overlay",
				animation: "foam",
			},
			overlay: {
				image: "water.png",
				compositeOperation: "overlay",
				alpha: 0.4,
			},
		},
		layerTop: {
			tree: {
				image: "tree.png",
				animation: {
					frameDelay: 350,
					cycleDelay: () => 3250,
				},
			},
			prison_boat: {
				image: "prison-boat.png",
				condition: () => between(Time.hour, 12, 14) && Time.weekDay === 6,
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 11,
					bottom: 0,
				},
				fog: {
					top: 14,
					bottom: 0,
				},
			},
		},
	},
	promenade: {
		folder: "promenade",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => 5000,
				},
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => 5000,
				},
			},
		},
		emissive: {
			condition: () => Weather.lightsOn,
			image: "emissive.png",
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 18,
					bottom: 0,
				},
				fog: {
					top: 21,
					bottom: 0,
				},
			},
		},
	},
	pub: {
		folder: "pub",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			condition: () => Weather.lightsOn,
			image: "emissive.png",
			color: "#deae66",
			strength: 3,
		},
		weather: {
			fogDistributionCurve: 1.5,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 5,
					bottom: 0,
				},
				fog: {
					top: 9,
					bottom: 0,
				},
			},
		},
	},
	res_alley: {
		folder: "res-alley",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
				animation: {
					frameDelay: 1000,
					cycleDelay: () => random(4, 15, true) * 1000,
				},
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
				animation: {
					frameDelay: 1000,
					cycleDelay: () => random(4, 15, true) * 1000,
				},
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: false,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 21,
					bottom: 0,
				},
			},
		},
	},
	riding_school: {
		folder: "riding-school",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => 0,
				},
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => 0,
				},
			},
		},
		weather: {
			fogDistributionCurve: 1.2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 19,
					bottom: 0,
				},
				fog: {
					top: 22,
					bottom: 0,
				},
			},
		},
	},
	school: {
		folder: "school",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			autumn: {
				condition: () => !Weather.isSnow && Time.season === "autumn",
				image: "grass-autumn.png",
			},
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: false,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 19,
					bottom: 0,
				},
			},
		},
	},
	school_rear_courtyard: {
		folder: "school-rear-courtyard",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			summer: {
				image: "summer.png",
				condition: () => !Weather.isSnow && Time.season === "summer",
			},
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 12,
					bottom: 0,
				},
				fog: {
					top: 22,
					bottom: 0,
				},
			},
		},
	},
	sea: {
		folder: "sea",
		reflective: {
			mask: {
				image: "reflective.png",
				alpha: 1,
				compositeOperation: "overlay",
			},
			overlay: {
				image: "water.png",
				alpha: 0.4,
				animation: {
					slider: () => V.options.reflections,
					frames: 300,
					frameDelay: 300,
				},
			},
			glimmer: {
				condition: () => V.options.reflections,
				image: "glimmer.png",
				compositeOperation: "soft-light",
				alpha: 0.5,
				gradientMask: true,
				animation: {
					slider: true,
					frames: 150,
					frameDelay: 150,
				},
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: false,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 21,
					bottom: 0,
				},
			},
		},
	},
	sewers: {
		folder: "sewers",
		base: {
			default: {
				image: "base.png",
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 29,
					bottom: 29,
				},
				fog: {
					top: 29,
					bottom: 29,
				},
			},
		},
	},
	pirate_ship: {
		folder: "pirate-ship",
		base: {
			overlay: {
				image: "water.png",
			},
			waves: {
				image: "waves.png",
				animation: {
					frameDelay: 450,
				},
			},
		},
		reflective: {
			mask: {
				image: "reflective.png",
				alpha: 0.5,
			},
		},
		layerTop: {
			ship: {
				image: "ship.png",
				animation: {
					frameDelay: 750,
				},
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: false,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 40,
					bottom: 0,
				},
			},
		},
	},
	sepulchre: {
		folder: "sepulchre",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			eyes: {
				image: "eyes.png",
				condition: () => Weather.lightsOn,
				color: "#e15151",
			},
			gem: {
				image: "gem.png",
				color: "#5b6ee1",
			},
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 10,
					bottom: 0,
				},
			},
		},
	},
	shopping_centre: {
		folder: "shopping-centre",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		weather: {
			fogDistributionCurve: 3,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 6,
					bottom: 0,
				},
				fog: {
					top: 13,
					bottom: 0,
				},
			},
		},
	},
	spa: {
		folder: "spa",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => 0,
				},
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
				animation: {
					frameDelay: 200,
					cycleDelay: () => 0,
				},
			},
		},
		emissive: {
			emissive_dawn: {
				image: "emissive-dawn.png",
				condition: () => Time.dayState === "dawn",
				color: "#e6de57",
				size: 10,
			},
			light: {
				image: "emissive-lights.png",
				condition: () => Weather.lightsOn,
				color: "#e6de57dd",
				size: 20,
				animation: {
					frameDelay: 2000,
					cycleDelay: () => 2000,
				},
			},
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 12,
					bottom: 0,
				},
				fog: {
					top: 18,
					bottom: 0,
				},
			},
		},
	},
	strip_club: {
		folder: "strip-club",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			windows: {
				condition: () => Time.dayState === "dusk" || Time.dayState === "night",
				image: "emissive-windows.png",
				size: 2,
			},
			green: {
				condition: () => Time.dayState === "dusk" || Time.dayState === "night",
				image: "emissive-green.png",
				color: "#74ff9099",
				size: 2,
			},
			pink1: {
				condition: () => Time.dayState === "dusk" || Time.dayState === "night",
				image: "emissive-pink-1.png",
				color: "#ff4fd6",
				size: 0,
			},
			pink2: {
				condition: () => Time.dayState === "dusk" || Time.dayState === "night",
				image: "emissive-pink.png",
				color: "#fe99ff99",
				size: 4,
			},
			purple: {
				condition: () => Time.dayState === "dusk" || Time.dayState === "night",
				image: "emissive-purple.png",
				color: "#a91dff",
				size: 0,
			},
			red: {
				condition: () => Time.dayState === "dusk" || Time.dayState === "night",
				image: "emissive-red.png",
				color: "#ff1d2f",
				size: 0,
			},
			blue: {
				condition: () => Time.dayState === "dusk" || Time.dayState === "night",
				image: "emissive-blue.png",
				color: "#a6f8ff",
				size: 0,
			},
			lady: {
				condition: () => Time.dayState === "dusk" || Time.dayState === "night",
				image: "emissive-lady-pose.png",
				animation: {
					frameDelay: 1000,
					cycleDelay: () => 1000,
				},
				color: "#ff60a099",
				size: 3,
			},
			hair: {
				condition: () => Time.dayState === "dusk" || Time.dayState === "night",
				image: "emissive-lady-hair.png",
				color: "#d8294899",
				size: 3,
			},
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 7,
					bottom: 0,
				},
				fog: {
					top: 12,
					bottom: 0,
				},
			},
		},
	},
	studio: {
		folder: "studio",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			default: {
				image: "emissive.png",
				condition: () => Weather.lightsOn && between(Time.hour, 18, 23),
			},
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 10,
					bottom: 0,
				},
				fog: {
					top: 16,
					bottom: 0,
				},
			},
		},
	},
	temple: {
		folder: "temple",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		emissive: {
			window_blue: {
				image: "emissive-blue-window.png",
				condition: () => Weather.lightsOn,
				size: 0,
				intensity: 0.7,
			},
			window_orange: {
				image: "emissive-orange-window.png",
				condition: () => Weather.lightsOn,
				size: 0,
				intensity: 0.7,
			},
			orange: {
				image: "emissive-orange.png",
				condition: () => Weather.lightsOn,
				color: "#dfaf70ee",
				size: 4,
			},
			blue: {
				image: "emissive-blue.png",
				condition: () => Weather.lightsOn,
				color: "#7d98e9",
				size: 2,
			},
			grey: {
				image: "emissive-grey.png",
				condition: () => Weather.lightsOn,
				color: "#dbe4b9",
				size: 4,
			},
		},
		weather: {
			fogDistributionCurve: 3,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 7,
					bottom: 0,
				},
				fog: {
					top: 19,
					bottom: 0,
				},
			},
		},
	},
	tentworld: {
		folder: "tent-world",
		base: {
			default: {
				image: "base.png",
				animation: {
					frameDelay: 500,
					cycleDelay: () => 0,
				},
			},
			movingtent: {
				image: "moving-tentacle.png",
				animation: {
					frameDelay: 300,
					cycleDelay: () => random(1, 9, true) * 1000,
				},
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: false,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 0,
					bottom: 0,
				},
				fog: {
					top: 17,
					bottom: 0,
				},
			},
		},
	},
	tower: {
		folder: "tower",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			wind: {
				image: "wind.png",
				animation: {
					frameDelay: 100,
					cycleDelay: () => random(5, 15, true) * 1000,
				},
			},
		},
		emissive: {
			bonfire: {
				condition: () => getBirdBurnTime() > 0,
				image: "bonfire.png",
				animation: {
					frameDelay: 300,
					cycleDelay: () => random(0, 700, true),
				},
				color: "#deae66",
				size: 5,
				intensity: () => getBirdBurnTime() / 360,
			},
			emissive_blood: {
				condition: () => Weather.bloodMoon,
				image: "emissive-blood.png",
				color: "#e63e3e66",
				size: 5,
			},
		},
		weather: {
			fogDistributionCurve: 3,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 9,
					bottom: 0,
				},
				fog: {
					top: 20,
					bottom: 0,
				},
			},
		},
	},
	town: {
		folder: "town",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
			driving_car: {
				condition: () => !Weather.bloodMoon,
				image: "driving-car.png",
				waitForAnimation: "flickeringLights",
				alwaysDisplay: false,
				animation: {
					frameDelay: 150,
					cycleDelay: () => random(5, 15, true) * 1000,
				},
			},
			parked_car: {
				condition: () => !Weather.bloodMoon,
				image: "parked-car.png",
			},
			cat: {
				condition: () => Time.dayState === "night",
				image: "cat.png",
				animation: {
					frameDelay: 300,
					cycleDelay: () => random(3, 9, true) * 1000,
				},
			},
		},
		emissive: {
			lights: {
				image: "emissive.png",
				condition: () => Weather.lightsOn,
				alwaysDisplay: false,
				animation: "drivingCar",
				color: "#deae66",
				size: 4,
			},
			flickering_lights: {
				waitForAnimation: "drivingCar",
				condition: grp => {
					// Do not draw if car animation is running
					return Weather.lightsOn && !grp?.animations?.get("drivingCar")?.inCycle;
				},
				image: "emissive-flicker.png",
				color: "#deae66",
				size: 4,
				animation: {
					frameDelay: 250,
					cycleDelay: () => random(2, 20, true) * 1000,
				},
			},
		},
		weather: {
			fogDistributionCurve: 1.5,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 18,
					bottom: 0,
				},
				fog: {
					top: 23,
					bottom: 0,
				},
			},
		},
	},
	underground: {
		folder: "underground",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		weather: {
			fogDistributionCurve: 2,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 10,
					bottom: 0,
				},
				fog: {
					top: 18,
					bottom: 0,
				},
			},
		},
	},
	underground_farm: {
		folder: "underground-farm",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		weather: {
			fogDistributionCurve: 1,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 15,
					bottom: 0,
				},
				fog: {
					top: 17,
					bottom: 0,
				},
			},
		},
	},
	wolf_cave: {
		folder: "wolf-cave",
		base: {
			default: {
				condition: () => !Weather.isSnow,
				image: "base.png",
			},
			snow: {
				condition: () => Weather.isSnow,
				image: "snow.png",
			},
		},
		weather: {
			fogDistributionCurve: 2.5,
			rainSplashEnabled: true,
			fogEnabled: true,

			groundBounds: {
				splashes: {
					top: 16,
					bottom: 0,
				},
				fog: {
					top: 24,
					bottom: 0,
				},
			},
		},
	},
};
