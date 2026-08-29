/* eslint-disable no-new */
/* eslint-disable jsdoc/require-description-complete-sentence */
function setfemininitymultiplierfromgender(gender) {
	if (gender === "f") {
		T.femininity_multiplier = 1;
	} else if (gender === "m") {
		T.femininity_multiplier = -1;
	} else {
		T.femininity_multiplier = 0;
	}
}
DefineMacro("setfemininitymultiplierfromgender", setfemininitymultiplierfromgender);

function addfemininityfromfactor(femininityBoost, factorDescription, noOverwearCheck) {
	if (noOverwearCheck) {
		T.gender_appearance_factors_noow.push({
			femininity: femininityBoost,
			factor: factorDescription,
		});
		T.apparent_femininity_noow += femininityBoost;
	} else {
		T.apparent_femininity += femininityBoost;
		T.gender_appearance_factors.push({
			femininity: femininityBoost,
			factor: factorDescription,
		});
	}
}
DefineMacro("addfemininityfromfactor", addfemininityfromfactor);

function addfemininityofclothingarticle(slot, clothingArticle, noOverwearCheck) {
	if (setup.clothes[slot][clothesIndex(slot, clothingArticle)].femininity) {
		addfemininityfromfactor(
			setup.clothes[slot][clothesIndex(slot, clothingArticle)].femininity,
			setup.clothes[slot][clothesIndex(slot, clothingArticle)].name_cap,
			noOverwearCheck
		);
	}
}
DefineMacro("addfemininityofclothingarticle", addfemininityofclothingarticle);

const hairStyleCap = {
	hairtype: {
		"flat ponytail": 300,
		messy: 200,
		pigtails: 300,
		ponytail: 300,
		short: 100,
		shaved: 100,
	},
	fringetype: {
		default: 100,
		"thin flaps": 300,
		"wide flaps": 300,
		hime: 300,
		loose: 300,
		messy: 200,
		overgrown: 200,
		ringlets: 300,
		split: 300,
		straight: 300,
		"swept left": 200,
		back: 100,
		parted: 100,
		flat: 100,
		quiff: 100,
		"straight curl": 200,
		"ringlet curl": 300,
		curtain: 200,
		trident: 200,
		buzzcut: 100,
		mohawk: 100,
	},
};

function calculatePenisBulge() {
	if (V.worn.under_lower.type.includes("strap-on")) return (V.worn.under_lower.size || 0) * 3;
	const compressed = V.player.penisExist && V.worn.genitals.type.includes("hidden");
	if (!V.player.penisExist || compressed) return 0;

	if (V.worn.genitals.type.includes("cage")) {
		return Math.clamp(V.player.penissize, 0, Infinity);
	}
	// Mentioned in combat about npcs `trying to force an erection`, when below the specific arousal checks
	if ((V.arousal > 9000 && V.player.penissize === 1) || (V.arousal > 9500 && V.player.penissize === 0)) return 1;

	let erectionState = 1;
	if (V.arousal >= 8000) {
		erectionState = 3;
	} else if (V.arousal >= 6000) {
		erectionState = 2;
	}
	return Math.clamp((V.player.penissize - 1) * erectionState, 0, Infinity);
}
window.calculatePenisBulge = calculatePenisBulge;

/* Calculate the player's gender appearance if their genitals and chest are exposed  */
function nudeGenderAppearance() {
	if (V.settings.nudeGenderPerception === 2 && !playerChastity("hidden")) return V.player.sex;

	genderappearancecheck();
	T.apparent_femininity_nude += (V.player.breastsize - 0.5) * 100;
	T.apparent_femininity_nude += Math.trunc(V.player.bottomsize * 50);
	if (playerChastity("hidden")) {
		T.apparent_femininity_nude += setup.clothes.genitals[clothesIndex("genitals", V.worn.genitals)].femininity;
	} else if (V.settings.nudeGenderPerception === 1) {
		if (V.player.penisExist) T.apparent_femininity_nude += (-V.player.penissize - 0.5) * 150;
		if (V.player.vaginaExist) T.apparent_femininity_nude += 450;
	}
	if (!(V.sexStats === undefined || !playerBellyVisible() || V.settings.nudeGenderPerception === 0)) {
		if (V.settings.nudeGenderPerception === 1)
			T.apparent_femininity_nude += Math.clamp((playerBellySize() - 7) * (V.settings.nudeGenderPerception === 1 ? 90 : 70), 0, Infinity);
		else if (playerBellySize() >= 18) T.apparent_femininity_nude += Math.clamp(10000, 0, Infinity);
		else if (playerBellySize() >= 8) T.apparent_femininity_nude += Math.clamp((playerBellySize() - 7) * 250, 0, Infinity);
	}
	Object.keys(V.skin).forEach(label => {
		if (["m", "f"].includes(V.skin[label].gender)) {
			const multiplier = V.skin[label].gender === "m" ? -1 : 1;
			T.apparent_femininity_nude += 50 * (V.skin[label].pen !== "pen" ? 2 : 1) * multiplier;
		}
	});
	return T.apparent_femininity_nude > 0 ? "f" : "m";
}
window.nudeGenderAppearance = nudeGenderAppearance;

/** Calculate the player's gender appearance */
function genderappearancecheck() {
	/* Calculate bulge size */
	T.bulge_size = calculatePenisBulge();
	/* T.penis_compressed = V.player.penisExist && V.worn.genitals.type.includes("hidden");
	if (V.worn.genitals.type.includes("cage")) {
		T.bulge_size = Math.clamp(V.player.penissize, 0, Infinity);
	} else {
		if (!V.player.penisExist) {
			T.erection_state = 0;
		} else if (T.penis_compressed) {
			T.erection_state = 0;
		} else if (V.arousal < 6000) {
			T.erection_state = 0;
		} else if (V.arousal < 8000) {
			T.erection_state = 1;
		} else {
			T.erection_state = 2;
		}
		T.bulge_size = Math.clamp(V.player.penissize * T.erection_state, 0, Infinity);
	} */
	/* Determine how visible the player's bottom is */
	if (
		(setup.clothes.lower[clothesIndex("lower", V.worn.lower)].skirt === 1 && V.worn.lower.skirt_down === 1 && V.worn.lower.state === "waist") ||
		(setup.clothes.over_lower[clothesIndex("over_lower", V.worn.over_lower)].skirt === 1 &&
			V.worn.over_lower.skirt_down === 1 &&
			V.worn.over_lower.state === "waist")
	) {
		T.bottom_visibility = 0;
	} else {
		T.bottom_visibility = 1;
	}
	/* Gender appearance factors */
	T.gender_appearance_factors = [];
	T.apparent_femininity = 0;
	T.breast_indicator = 0;
	/* Head clothing */
	addfemininityofclothingarticle("over_head", V.worn.over_head);
	addfemininityofclothingarticle("head", V.worn.head);
	/* Always visible clothing */
	addfemininityofclothingarticle("face", V.worn.face);
	addfemininityofclothingarticle("neck", V.worn.neck);
	addfemininityofclothingarticle("legs", V.worn.legs);
	addfemininityofclothingarticle("handheld", V.worn.handheld);
	addfemininityofclothingarticle("feet", V.worn.feet);
	/* Hair length */
	if (V.worn.over_head.hood !== 1 && V.worn.head.hood !== 1) {
		let lengthCap;
		/* Set Hair Style cap */
		if (hairStyleCap.hairtype[V.hairtype] && hairStyleCap.fringetype[V.fringetype]) {
			lengthCap = Math.max(hairStyleCap.hairtype[V.hairtype], hairStyleCap.fringetype[V.fringetype]);
		}
		const femininityfactor = Math.trunc((V.hairlength - 200) / 2);
		if (lengthCap && femininityfactor >= lengthCap) {
			addfemininityfromfactor(lengthCap, "Hair length (capped due to hair style)");
		} else {
			addfemininityfromfactor(femininityfactor, "Hair length");
		}
	}
	/* Makeup */
	addfemininityfromfactor(V.makeup.lipstick ? 50 : 0, "Lipstick");
	addfemininityfromfactor(V.makeup.eyeshadow ? 50 : 0, "Eyeshadow");
	addfemininityfromfactor(V.makeup.mascara ? 50 : 0, "Mascara");
	addfemininityfromfactor(V.makeup.blusher ? 50 : 0, "Blusher");
	/* Body structure */
	setfemininitymultiplierfromgender(V.player.gender_body);
	addfemininityfromfactor(T.femininity_multiplier * 200, "Body appearance");
	addfemininityfromfactor(Math.trunc(((V.physique + V.physiquesize / 2) / V.physiquesize) * -100), "Toned muscles");
	/* Behaviour */
	setfemininitymultiplierfromgender(V.player.gender_posture);
	const actingMultiplier = V.englishtrait + 1;
	addfemininityfromfactor(T.femininity_multiplier * 100 * actingMultiplier, "Posture (x" + actingMultiplier + " effectiveness due to English skill)");
	/* Special handling for calculating topless gender */
	T.over_lower_protected = V.worn.over_lower.exposed < 2;
	T.lower_protected = V.worn.lower.exposed < 2;
	T.under_lower_protected = !V.worn.under_lower.exposed;
	T.apparent_femininity_noow = T.apparent_femininity;
	T.gender_appearance_factors_noow = clone(T.gender_appearance_factors);
	/* Calculate gender appearance with no clothes on */
	T.apparent_femininity_nude = T.apparent_femininity;

	T.over_lower_femininity = setup.clothes.over_lower[clothesIndex("over_lower", V.worn.over_lower)].femininity
		? setup.clothes.over_lower[clothesIndex("over_lower", V.worn.over_lower)].femininity
		: 0;
	T.lower_femininity = setup.clothes.lower[clothesIndex("lower", V.worn.lower)].femininity
		? setup.clothes.lower[clothesIndex("lower", V.worn.lower)].femininity
		: 0;
	T.under_lower_femininity = setup.clothes.under_lower[clothesIndex("under_lower", V.worn.under_lower)].femininity
		? setup.clothes.under_lower[clothesIndex("under_lower", V.worn.under_lower)].femininity
		: 0;
	/* find maximum possible femininity of the last lower piece you can strip down to, and add it to the counter */
	addfemininityfromfactor(Math.max(T.over_lower_femininity, T.lower_femininity, T.under_lower_femininity), "Lower clothes", "noow");
	/* bulge and genitals checks for topless gender */
	if (T.under_lower_protected && V.settings.nudeGenderPerception > 0) {
		addfemininityfromfactor(T.bulge_size * -60, "Bulge visible through underwear", "noow");
	} else if ((T.over_lower_protected || T.lower_protected) && V.settings.nudeGenderPerception > 0) {
		addfemininityfromfactor(-Math.clamp((T.bulge_size - 6) * 60, 0, Infinity), "Bulge visible through clothing", "noow");
	} else if (V.worn.genitals.exposed && V.settings.nudeGenderPerception === 1) {
		if (V.player.penisExist) {
			addfemininityfromfactor((V.player.penissize + 0.5) * -150, "Penis exposed", "noow");
		}
		if (V.player.vaginaExist) {
			addfemininityfromfactor(450, "Vagina exposed", "noow");
		}
	} else if (V.worn.genitals.exposed && V.settings.nudeGenderPerception === 2) {
		addfemininityfromfactor(V.player.vaginaExist * 100000 - V.player.penisExist * 100000, "Genitals exposed", "noow");
	}
	/* plain breasts factor */
	addfemininityfromfactor((V.player.perceived_breastsize - 0.5) * 100, "Exposed breasts", "noow");
	/* Lower clothing, bulge, and genitals */
	addfemininityofclothingarticle("over_lower", V.worn.over_lower);
	if (!T.over_lower_protected) {
		addfemininityofclothingarticle("lower", V.worn.lower);
	}
	if (!T.over_lower_protected && !T.lower_protected) {
		/* Lower underwear is visible */
		addfemininityofclothingarticle("under_lower", V.worn.under_lower);
		if (!T.under_lower_protected) {
			/* Genitals slot is visible */
			addfemininityofclothingarticle("genitals", V.worn.genitals);
			if (V.worn.genitals.exposed) {
				/* Bare genitals are visible */
				if (V.settings.nudeGenderPerception === 1) {
					if (V.player.penisExist) {
						addfemininityfromfactor((-V.player.penissize - 0.5) * 150, "Penis visible");
					}
					if (V.player.vaginaExist) {
						addfemininityfromfactor(450, "Vagina visible");
					}
				} else if (V.settings.nudeGenderPerception === 2) {
					if (V.player.penisExist) {
						addfemininityfromfactor(-100000, "Penis visible");
					}
					if (V.player.vaginaExist) {
						addfemininityfromfactor(100000, "Vagina visible");
					}
				}
			}
		} else {
			/* Bottom visible through underwear */
			T.bottom_visibility *= 0.75;
			/* Bulge visible through underwear */
			if (V.settings.nudeGenderPerception > 0) {
				addfemininityfromfactor(T.bulge_size * -60, "Bulge visible through underwear");
			}
		}
	} else {
		/* Bottom covered by lower clothes */
		T.bottom_visibility *= 0.75;
		/* Bulge covered by lower clothes */
		if (V.settings.nudeGenderPerception > 0) {
			addfemininityfromfactor(-Math.clamp((T.bulge_size - 6) * 60, 0, Infinity), "Bulge visible through clothing");
		}
	}
	/* Upper clothing and breasts */
	addfemininityofclothingarticle("over_upper", V.worn.over_upper);
	if (V.worn.over_upper.exposed >= 2) {
		addfemininityofclothingarticle("upper", V.worn.upper);
	}
	if (
		V.worn.over_upper.exposed >= 2 &&
		V.worn.upper.exposed >= 2 &&
		(!V.worn.lower.type.includes("overalls") || V.worn.lower.exposed >= 2 || V.lowerwetstage >= 3)
	) {
		/* Upper underwear is visible */
		addfemininityofclothingarticle("under_upper", V.worn.under_upper);
		if (V.worn.under_upper.exposed >= 1) {
			/* Exposed breasts */
			T.breast_indicator = 1;
			addfemininityfromfactor((V.player.perceived_breastsize - 0.5) * 100, V.player.perceived_breastsize > 0 ? "Exposed breasts" : "Exposed flat chest");
		} else {
			/* Breasts covered by only underwear */
			addfemininityfromfactor(Math.clamp((V.player.perceived_breastsize - 2) * 100, 0, Infinity), "Breast size visible through underwear");
		}
	} else {
		/* Breast fully covered */
		addfemininityfromfactor(Math.clamp((V.player.perceived_breastsize - 4) * 100, 0, Infinity), "Breast size visible through clothing");
	}
	/* Bottom */
	addfemininityfromfactor(Math.trunc(V.player.bottomsize * T.bottom_visibility * 50), "Bottom size (" + Math.trunc(T.bottom_visibility * 100) + "% visible)");
	/* Pregnant Belly */
	if (V.sexStats === undefined || !playerBellyVisible() || V.settings.nudeGenderPerception === 0) {
		// do glorious nothing
	} else if (V.settings.nudeGenderPerception === 1) {
		addfemininityfromfactor(
			Math.clamp((playerBellySize() - 7) * (V.settings.nudeGenderPerception === 1 ? 90 : 70), 0, Infinity),
			playerAwareTheyArePregnant() ? "Pregnant Belly" : "Pregnant Looking Belly"
		);
	} else if (playerBellySize() >= 18) {
		addfemininityfromfactor(Math.clamp(10000, 0, Infinity), playerAwareTheyArePregnant() ? "Pregnant Belly" : "Pregnant Looking Belly");
	} else if (playerBellySize() >= 8) {
		addfemininityfromfactor(
			Math.clamp((playerBellySize() - 7) * 250, 0, Infinity),
			playerAwareTheyArePregnant() ? "Pregnant Belly" : "Pregnant Looking Belly"
		);
	}
	/* Body writing */
	bodywritingExposureCheck(true);
	T.skinValue = 0;
	T.skinValue_noow = 0;
	Object.keys(V.skin).forEach(label => {
		const value = V.skin[label];
		if (T.skin_array.includes(label)) {
			if (value.gender === "m") {
				T.skinValue -= 50 * (value.pen !== "pen" ? 2 : 1);
			} else if (value.gender === "f") {
				T.skinValue += 50 * (value.pen !== "pen" ? 2 : 1);
			}
		} else {
			if (value.gender === "m") {
				T.skinValue_noow -= 50 * (value.pen !== "pen" ? 2 : 1);
			} else if (V.skin.breasts.gender === "f") {
				T.skinValue_noow += 50 * (value.pen !== "pen" ? 2 : 1);
			}
		}
	});
	addfemininityfromfactor(T.skinValue, "Visible skin markings");
	addfemininityfromfactor(T.skinValue + T.skinValue_noow, "Visible skin markings", "noow");
	if (T.apparent_femininity > 0) {
		T.gender_appearance = "f";
	} else if (T.apparent_femininity < 0) {
		T.gender_appearance = "m";
	} else if (V.player.sex === "h") {
		// if herm pc and perfect 0 apparent_femininity
		T.gender_appearance = genderAppearanceHermTiebreak();
	} else {
		T.gender_appearance = V.player.sex;
	}
	if (T.apparent_femininity_noow > 0) {
		T.gender_appearance_noow = "f";
	} else if (T.apparent_femininity_noow < 0) {
		T.gender_appearance_noow = "m";
	} else if (V.player.sex === "h") {
		T.gender_appearance_noow = genderAppearanceHermTiebreak();
	} else {
		T.gender_appearance_noow = V.player.sex;
	}
}

function genderAppearanceHermTiebreak() {
	// Reminder: this is only if the player has an *exactly* 0 femininity score. This should be nearly impossible to reach, but we still need to handle it.

	// The general principle here is that these factors are things that indicate which gender is the player's preference for this character.
	// We rely on as many manually-chosen details as possible to break the tie in a way that favours the player's preference.

	if (["m", "f"].includes(V.player.gender_body)) {
		return V.player.gender_body; // break the tie with body type, if player has masculine or feminine features.
	} else if (["m", "f"].includes(V.player.gender_posture)) {
		return V.player.gender_posture; // break the tie with gender posture, if gender posture is "m" or "f"
	} else {
		return "f"; // you've done it. you've broken me. default to "f".
	}
}

function apparentbreastsizecheck() {
	T.tempbreast = V.player.breastsize;
	if (clothingData("upper", V.worn.upper, "bustresize") != null) {
		T.tempbreast += clothingData("upper", V.worn.upper, "bustresize");
	}
	if (clothingData("under_upper", V.worn.under_upper, "bustresize") != null) {
		T.tempbreast += clothingData("under_upper", V.worn.under_upper, "bustresize");
	}
	if (clothingData("over_upper", V.worn.over_upper, "bustresize") != null) {
		T.tempbreast += clothingData("over_upper", V.worn.over_upper, "bustresize");
	}
	// using the default values of $breastsizemin and $breastsizemax, to avoid issues with the values changing during the game
	V.player.perceived_breastsize = Math.clamp(T.tempbreast, 0, setup.breastsizes.length - 1);
}
window.apparentbreastsizecheck = apparentbreastsizecheck;

function apparentbottomsizecheck() {
	T.tempbutt = V.player.bottomsize;
	if (V.worn.lower.rearresize != null) {
		T.tempbutt += V.worn.lower.rearresize;
	}
	if (V.worn.under_lower.rearresize != null) {
		T.tempbutt += V.worn.under_lower.rearresize;
	}
	if (V.worn.lower.rearresize != null) {
		T.tempbutt += V.worn.over_lower.rearresize;
	}
	// using the default values of $bottomsizemin and $bottomsizemax, to avoid issues with the values changing during the game
	V.player.perceived_bottomsize = Math.clamp(T.tempbutt, 0, 8);
}

function exposedcheck(alwaysRun) {
	if (!V.combat || alwaysRun) {
		apparentbreastsizecheck();
		apparentbottomsizecheck();
		genderappearancecheck();

		V.player.gender_appearance = T.gender_appearance;
		T.gender_appearance_factors.sort((a, b) => a.femininity > b.femininity);
		V.player.gender_appearance_factors = T.gender_appearance_factors;
		V.player.femininity = T.apparent_femininity;

		V.player.gender_appearance_without_overwear = T.gender_appearance_noow;
		T.gender_appearance_factors_noow.sort((a, b) => a.femininity > b.femininity);
		V.player.gender_appearance_without_overwear_factors = T.gender_appearance_factors_noow;
		V.player.femininity_without_overwear = T.apparent_femininity_noow;

		V.breastindicator = T.breast_indicator;
	}
}
DefineMacro("exposedcheck", exposedcheck);

/* Checks if bodywriting or tattoos are visible to NPCs. */
function bodywritingExposureCheck(overwrite, skipRng) {
	window.outfitChecks();
	if (!T.skin_array || overwrite) {
		T.visible_areas = ["forehead"];
		T.bodywriting_exposed = 0;

		if (!V.worn.face.type.includes("mask")) T.visible_areas.push("left_cheek", "right_cheek");
		if (
			(V.worn.over_upper.exposed >= 1 || V.worn.over_upper.open === 1) &&
			(V.worn.upper.exposed >= 1 || V.worn.upper.open === 1) &&
			(V.worn.under_upper.exposed >= 1 || V.worn.under_upper.open === 1)
		) {
			T.visible_areas.push("left_shoulder", "right_shoulder");
		}
		if (V.worn.over_upper.exposed >= 1 && V.worn.upper.exposed >= 1 && V.worn.under_upper.exposed >= 1) {
			T.visible_areas.push("breasts");
		}
		if (
			(V.worn.over_upper.exposed >= 1 || V.worn.over_upper.state !== "waist") &&
			(V.worn.upper.exposed >= 1 || V.worn.upper.state !== "waist") &&
			(V.worn.under_upper.exposed >= 1 || V.worn.under_upper.state !== "waist")
		) {
			T.visible_areas.push("back");
		}
		if (
			(V.worn.over_lower.exposed >= 1 || V.worn.over_lower.anus_exposed >= 1) &&
			(V.worn.lower.exposed >= 1 || V.worn.lower.anus_exposed >= 1) &&
			(V.worn.under_lower.exposed >= 1 || !V.worn.under_lower.type.includes("lower_covering"))
		) {
			T.visible_areas.push("left_bottom", "right_bottom");
		}
		if (
			V.worn.over_lower.exposed >= 1 &&
			V.worn.lower.exposed >= 1 &&
			!T.underOutfit &&
			(V.worn.under_lower.exposed >= 1 || !V.worn.under_lower.type.includes("lower_covering"))
		) {
			T.visible_areas.push("pubic");
		}
		if (V.worn.over_lower.vagina_exposed >= 1 && V.worn.lower.vagina_exposed >= 1 && !V.worn.under_lower.type.includes("lower_covering")) {
			T.visible_areas.push("left_thigh", "right_thigh");
		}

		// second: filter out every area where there is no writing and store it in _skin_array
		T.skin_array = T.visible_areas.filter(loc => V.skin[loc].writing);

		// third: make an array of all the special properties of the visible bodywriting
		T.skin_array_special = T.skin_array.map(loc => V.skin[loc].special);

		if (T.skin_array.length >= 1) T.bodywriting_exposed = 1;
	}
	if (!skipRng) T.bodypart = T.skin_array.random();
}
DefineMacro("bodywritingExposureCheck", bodywritingExposureCheck);

/* Checks if PC has bodywriting or tattoos that are not visible to NPCs. */
function bodywritingHiddenCheck(overwrite, skipRng) {
	if (!T.hidden || overwrite) {
		bodywritingExposureCheck(true);
		T.bodywriting_hidden = 0;

		T.hidden_writing = Object.keys(V.skin).filter(loc => V.skin[loc].writing && !T.skin_array.includes(loc));

		if (T.hidden_writing.length >= 1) T.bodywriting_hidden = 1;
	}
	if (!skipRng) T.bodypart = T.hidden_writing.random();
}
DefineMacro("bodywritingHiddenCheck", bodywritingHiddenCheck);

/**
 * Turns an array into a formatted list for printing.
 *
 * @param {any[]} arr An Array, ie ["a","b","c","d"]
 * @param {string} conjunction ("and") - A conjunction for the formatted list
 * @param {boolean} useOxfordComma (false) - A boolean deciding whether to prepend a separator before conjunction
 * @param {string} separator (", ") - A separator between elements of the formatted list
 * @returns {string} A formatted list, ie "a, b, c and d"
 */
function formatList(arr, conjunction = "and", useOxfordComma = false, separator = ", ") {
	if (!(Array.isArray(arr) && arr.length > 0)) {
		Errors.report("Error in formatList: Missing or invalid array argument", { Stacktrace: Utils.GetStack(), arguments });
		return "";
	}
	/*
	conjunction += " ";
	if (arr.length <= 2) return arr.join(" " + conjunction);
	const oxConj = (useOxfordComma ? separator : " ") + conjunction;
	return arr.slice(0,-1).join(separator) + oxConj + arr.at(-1);
	*/
	return arr.formatList({ conjunction, useOxfordComma, separator });
}
window.formatList = formatList;
DefineMacroS("formatList", formatList);

function liquidcount(liquid, parts) {
	if (!setup.bodyliquid.liquidtype.includes(liquid)) return Errors.report("liquidcount error: wrong type", liquid);
	let count = 0;
	for (const part of parts) {
		count += V.player.bodyliquid[part][liquid];
	}
	return count;
}

function liquidclamp() {
	for (const bodypart of setup.bodyliquid.bodyparts) {
		for (const liquid of ["goo", "semen", "nectar"]) {
			V.player.bodyliquid[bodypart][liquid] = Math.clamp(V.player.bodyliquid[bodypart][liquid], 0, 5);
		}
	}
}

function goocount() {
	liquidclamp();
	const outer = setup.bodyliquid.outerbodyparts;
	const goooutsidecount = liquidcount("goo", outer);
	const semenoutsidecount = liquidcount("semen", outer);
	const nectaroutsidecount = liquidcount("nectar", outer);
	const liquidoutsidecount = goooutsidecount + semenoutsidecount + nectaroutsidecount;

	const inner = setup.bodyliquid.innerbodyparts;
	const gooinsidecount = liquidcount("goo", inner) * 3;
	const semeninsidecount = liquidcount("semen", inner) * 3;
	const nectarinsidecount = liquidcount("nectar", inner) * 3;
	const liquidinsidecount = gooinsidecount + semeninsidecount + nectarinsidecount;

	V.goooutsidecount = goooutsidecount;
	V.semenoutsidecount = semenoutsidecount;
	V.nectaroutsidecount = nectaroutsidecount;
	V.liquidoutsidecount = liquidoutsidecount;
	V.goocount = gooinsidecount + goooutsidecount;
	V.semencount = semeninsidecount + semenoutsidecount;
	V.nectarcount = nectarinsidecount + nectaroutsidecount;
	V.liquidcount = liquidinsidecount + liquidoutsidecount;
}
DefineMacro("goocount", goocount);

/* set $allure to allure, set $attractiveness to attractiveness */
function calculateallure() {
	/* attractiveness calcs */
	let attractiveness;
	/* baseline, reused later for allure danger mods */
	let baseattractiveness = V.beauty / 3 + V.hairlength / 4;
	if (!V.worn.over_upper.type.includes("naked")) {
		baseattractiveness += V.worn.over_upper.reveal;
	} else {
		const topmult = V.worn.lower.type.includes("overalls") ? 0.5 : 1;
		baseattractiveness += V.worn.upper.reveal * topmult;
		if (V.worn.upper.type.includes("naked")) baseattractiveness += V.worn.under_upper.reveal * topmult;
	}
	if (!V.worn.over_lower.type.includes("naked")) {
		baseattractiveness += V.worn.over_lower.reveal;
	} else {
		baseattractiveness += V.worn.lower.reveal;
		if (V.worn.lower.type.includes("naked")) baseattractiveness += V.worn.under_lower.reveal;
	}
	attractiveness = baseattractiveness;
	/* extra attractiveness from accessories */
	for (const slot of ["head", "face", "neck", "legs", "feet", "handheld", "hands"]) attractiveness += V.worn[slot].reveal || 0;
	/* tf bonuses */
	const partsHidden = (tf, parts) => parts.filter(part => V.transformationParts[tf][part] === "hidden").length;
	if (V.demon >= 6) attractiveness += 500 - 100 * partsHidden("demon", ["horns", "tail", "wings"]);
	if (V.angel >= 6) attractiveness += 500 - 150 * partsHidden("angel", ["halo", "wings"]);
	if (V.fallenangel >= 2) attractiveness += 500 - 150 * partsHidden("fallenAngel", ["halo", "wings"]);
	if (V.wolfgirl >= 6) attractiveness += 500 - 100 * partsHidden("wolf", ["tail", "ears", "cheeks"]);
	if (V.cat >= 6) attractiveness += 500 - 150 * partsHidden("cat", ["tail", "ears"]);
	if (V.cow >= 6) attractiveness += 500 - 100 * partsHidden("cow", ["ears", "horns", "tail"]);
	if (V.harpy >= 6) attractiveness += 500 - 60 * partsHidden("bird", ["tail", "eyes", "wings", "malar", "plumage"]);
	if (V.fox >= 6) attractiveness += 750 - 175 * partsHidden("fox", ["ears", "tail", "cheeks"]);
	/* makeup */
	for (const makeup of ["lipstick", "mascara", "eyeshadow", "blusher"]) {
		if (V.makeup[makeup]) attractiveness += 100;
	}
	V.attractiveness = Math.floor(attractiveness);

	/* allure calcs */
	let allure = attractiveness;
	/* night and exposed mods to base attractiveness. minus one, because it's already included into attractiveness above */
	const nightMod = Weather.dayState === "night" ? 1.5 : 1;
	const exposedMod = 1 + V.exposed / 5;
	allure += baseattractiveness * (nightMod * exposedMod - 1);
	/* bodyliquid danger */
	goocount();
	allure += V.liquidcount * 50;
	/* ear slime */
	if (V.earSlime.growth > 50) allure += (V.earSlime.growth - 50) * 10;
	/* fame mods */
	if (!["island"].includes(V.location)) {
		for (const badfame of ["sex", "prostitution", "rape", "bestiality", "exhibitionism", "pregnancy", "impreg"]) allure += V.fame[badfame] / 10;
		for (const goodfame of ["good", "scrap", "business", "social", "model", "pimp"]) allure -= V.fame[goodfame] / 2;
	}
	/* bloodmoon */
	if (Time.isBloodMoon()) allure += 2000;
	/* Elk-scarred trait */
	if (V.auriga_scar) allure += V.auriga_scar * 500;
	allure = Math.clamp(allure, 0, 8000);
	V.baseAllure = allure;
	/* extra modifiers */
	allure *= V.settings.allureModifier;
	if (V.moorLuck > 0) allure *= 1 - V.moorLuck / 100;

	V.allure = Math.floor(allure);
}
DefineMacro("calculateallure", calculateallure);

// check exposure, tags, and wetness
function itemExposure(slot) {
	const item = V.worn[slot];
	// if you're looking to delete $overupperwetstage, $upperwetstage, $underupperwetstage, $overlowerwetstage, $lowerwetstage, or $underlowerwetstage - look here, too
	if (item.type.includes("naked") || V[slot.replace("_", "") + "wetstage"] >= 3) return 2;
	return item.exposed;
}

function exposure() {
	exposedcheck();

	V.exposed = 0;
	V.exposedRaw = 0;
	T.exposedUpper = false;
	T.exposedLower = false;

	// wraith cares not of your exposure
	if (V.possessed) {
		return;
	}

	// calculate libertine factors.
	const safeLocations = ["Bedroom", "Sleep", "Bird Tower", "Bird Hunt", "Spa Tan Underwear", "Spa Tan Curtains", "Spa Tan Naked", "Mirror"];
	if (
		// the check for safe locations might be too generous with included passage names, but seems to be working as of 0.5.4.9
		// wardrobes should not be safe locations though, as they must show what clothes are appropriate outside. if you wanna stop pc from covering themselves - use "don't cover yourself" link in the wardrobes instead of altering the libertine score.
		safeLocations.some(location => V.passage.includes(location)) &&
		V.NPCList.every(npc => !npc.fullDescription || Object.values(V.loveInterest).includes(npc.fullDescription)) &&
		!V.audiencepresent
	) {
		// alone (or with a li) in safe locations - anything goes
		V.libertine = 2;
	} else if (
		["beach", "pool", "sea", "lake", "lake_ruin"].includes(V.location) ||
		(V.location === "dance_studio" && V.worn.under_lower.type.includes("dance") && V.worn.under_upper.type.includes("dance"))
	) {
		// some places don't care about pc sporting underwear
		V.libertine = 1;
	} else {
		V.libertine = 0;
	}

	/*
		is bra or breasts visible?
	*/
	// "covered" is a strange beast and might need splitting into separate tags
	// when applied to lower - it covers under_upper. when applied to under_upper - it makes it okay to be seen. when applied to face - it doesn't cover under_upper and doesn't make face okay to be seen...
	// If under_upper is not covering or exposing/displaced exposed should be 1 because either it's underwear or PCs breasts are visible
	if (
		["over_upper", "upper"].every(slot => itemExposure(slot) >= 1) &&
		(!V.worn.lower.type.includes("overalls") || itemExposure("lower") >= 2) &&
		(!V.worn.under_upper.type.includes("torso_covering") || itemExposure("under_upper") >= 1)
	) {
		// the answer is yes
		// Only non-male appearing PCs should be exposed from underwear/breasts
		if (V.player.gender_appearance !== "m" || V.player.perceived_breastsize > 2) {
			V.exposed = 1;
			T.exposedUpper = itemExposure("under_upper") >= 1 ? 2 : 1;
		}
	}

	/*
		panties
	*/
	if (
		["over_lower", "lower"].every(slot => itemExposure(slot) >= 1) &&
		(!V.worn.under_lower.type.includes("lower_covering") || itemExposure("under_lower") >= 1)
	) {
		V.exposed = 1;
		T.exposedLower = 1;
	}

	/*
		genitals
	*/
	if (["over_lower", "lower"].every(slot => itemExposure(slot) >= 2) && itemExposure("under_lower") >= 1) {
		V.exposed = 2;
		T.exposedLower = 2;
	}

	V.exposedRaw = V.exposed;
	if (V.libertine >= V.exposed) V.exposed = 0;
	if (V.libertine >= T.exposedUpper) T.exposedUpper = 0;
	if (V.libertine >= T.exposedLower) T.exposedLower = 0;
}
DefineMacro("exposure", exposure);

/**
 * Primarily for checks in events involving children
 *
 * @param {Array <"clothes" | "bodywriting" | "fluids" | "drugs" | "all">} check / Which types to check, defaults to "all"
 * @returns {true | false} / If player's current state is inappropriate
 */
function inappropriatePlayerState(check = ["all"]) {
	if (["all", "clothes"].includesAny(check)) {
		if (V.exposed > 0 || V.exposedRaw > 0) return true;
		if (!V.worn.lower.type.includes("overalls")) {
			if (["slut shirt", "prison shirt", "prison jumpsuit", "unbound straightjacket"].includes(V.worn.upper.name)) {
				return true;
			} else if (
				!V.worn.under_upper.type.includes("torso_covering") ||
				V.worn.under_upper.reveal >= 700 ||
				integrityKeyword(V.worn.under_upper, "under_upper") === "tattered" ||
				["leotard", "unitard", "skimpy leotard", "turtleneck leotard"].includes(V.worn.under_upper.name)
			) {
				if (
					["naked", "fetish"].includes(V.worn.upper.type) ||
					V.worn.upper.reveal >= 700 ||
					integrityKeyword(V.worn.upper, "upper") === "tattered" ||
					["large towel", "towel top", "catsuit"].includes(V.worn.upper.name)
				)
					return true;
			}
		}
		if (["prison trousers", "prison jumpsuit trousers", "unbound straightjacket bottom"].includes(V.worn.lower.name)) return true;
		if (
			!V.worn.under_lower.type.includes("lower_covering") ||
			V.worn.under_lower.reveal >= 700 ||
			integrityKeyword(V.worn.under_lower, "under_lower") === "tattered" ||
			["leotard bottom", "unitard bottom", "skimpy leotard bottom", "turtleneck leotard bottom"].includes(V.worn.under_lower.name)
		) {
			if (
				["naked", "fetish"].includes(V.worn.lower.type) ||
				V.worn.lower.reveal >= 700 ||
				integrityKeyword(V.worn.lower, "lower") === "tattered" ||
				[
					"large towel bottom",
					"towel skirt",
					"bathrobe bottom",
					"catsuit bottoms",
					"oversized button-down bottom",
					"oversized sweater bottom",
				].includes(V.worn.lower.name)
			)
				return true;
		}
		if (V.worn.face.type.includes("gag")) return true;
	}
	if (["all", "bodywriting"].includesAny(check)) {
		// May not catch every single instance of inappropriate writing, but it should catch most
		T.lewd_bodywriting_visible = false;
		bodywritingExposureCheck(true);
		Object.keys(V.skin).forEach(label => {
			if (T.skin_array.includes(label)) {
				if (
					(!["none", "Robin", "Whitney", "Kylar", "Sydney", "Avery", "Eden", "Gwylan", "Black Wolf", "Alex", "Great Hawk"].includes(
						V.skin[label].special
					) &&
						V.skin[label].lewd === 1) ||
					["slut", "bitch", "whore", "sex", "fuck", "rape", "cock", "cum", "size queen"].some(text =>
						V.skin[label].writing.toLowerCase().includes(text)
					)
				)
					T.lewd_bodywriting_visible = true;
			}
		});
		return T.lewd_bodywriting_visible;
	}
	if (["all", "fluids"].includesAny(check)) {
		if (V.liquidcount >= 1) return true;
	}
	if (["all", "drugs"].includesAny(check)) {
		if (V.drunk >= 240 || V.drugged >= 200) return true;
	}
	return false;
}
window.inappropriatePlayerState = inappropriatePlayerState;

/**
 * Fetches some or all of the PC's visible transformation parts into an array, depending on input
 *
 * @param {Array <"ears" | "wings" | "tail" | "halo" | "horns" | "plumage" | "malar" | "cheeks" | "eyes" | "heterochromia" | "pubes" | "pits">} parts / Which types to check, defaults to all
 * @returns {Array | false} / Parts that match the criteria
 */
function getTransformParts(parts = []) {
	const tfs = ["wolf", "cat", "fox", "bird", "cow", "demon", "fallenAngel", "angel"];
	const tfPartsToCheck = ["ears", "wings", "tail", "halo", "horns", "plumage", "malar", "cheeks", "eyes", "heterochromia", "pubes", "pits"];
	const tfParts = [];
	for (let i = 0; i < tfs.length; i++) {
		for (let i2 = 0; i2 < tfPartsToCheck.length; i2++) {
			if (
				(parts.includesAny(tfPartsToCheck[i2]) || !parts[0]) &&
				![undefined, "hidden", "disabled"].includes(V.transformationParts[tfs[i]][tfPartsToCheck[i2]])
			)
				tfParts.pushUnique(tfPartsToCheck[i2]);
		}
	}
	if (tfParts.length) return tfParts;
	else return false;
}
window.getTransformParts = getTransformParts;
