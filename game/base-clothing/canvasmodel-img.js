/* eslint-disable no-undef */
/* eslint-disable eqeqeq */
DefineMacro("modelprepare-player-body", function () {
	T.disabled = ["disabled", "hidden"];
	T.modeloptions.skin_type = Skin.color.natural;
	T.modeloptions.skin_tone = Skin.color.tan;

	if (V.makeup.eyeshadow != 0) {
		T.modeloptions.eyeshadow_colour = V.makeup.eyeshadow;
	}
	if (V.makeup.mascara != 0) {
		T.modeloptions.mascara_colour = V.makeup.mascara;
	}
	if (V.makeup.mascara_running != 0) {
		T.modeloptions.mascara_running = V.makeup.mascara_running;
	}
	if (V.makeup.lipstick != 0) {
		T.modeloptions.lipstick_colour = V.makeup.lipstick;
	}
	if (V.makeup.blusher != 0) {
		T.modeloptions.blusher_colour = V.makeup.blusher;
	}

	if (V.possessed) {
		T.modeloptions.left_eye = ["haunt", "despair"].includes(V.wraith.state) ? "red possessed" : "blue possessed";
		T.modeloptions.right_eye = ["haunt", "despair"].includes(V.wraith.state) ? "red possessed" : "blue possessed";
	} else {
		T.modeloptions.left_eye = V.makeup.eyelenses.left != 0 ? V.makeup.eyelenses.left : V.leftEyeColour;
		T.modeloptions.right_eye = V.makeup.eyelenses.right != 0 ? V.makeup.eyelenses.right : V.rightEyeColour;
	}

	T.modeloptions.hair_colour = V.haircolour.replace(" ", "");
	T.modeloptions.hair_fringe_colour = V.hairfringecolour.replace(" ", "");
	T.modeloptions.hair_colour_gradient = V.hairColourGradient;
	T.modeloptions.hair_fringe_colour_gradient = V.hairFringeColourGradient;
	T.modeloptions.hair_colour_style = V.hairColourStyle;
	T.modeloptions.hair_fringe_colour_style = V.hairFringeColourStyle;

	T.modeloptions.brows_colour = (V.makeup.browscolour != 0 ? V.makeup.browscolour : V.naturalhaircolour).replace(" ", "");
	T.modeloptions.pbhair_colour = (V.makeup.pbcolour != 0 ? V.makeup.pbcolour : V.naturalhaircolour).replace(" ", "");

	/*
			██████   █████  ███████ ███████
			██   ██ ██   ██ ██      ██
			██████  ███████ ███████ █████
			██   ██ ██   ██      ██ ██
			██████  ██   ██ ███████ ███████
		*/

	T.modeloptions.body_type = V.player.bodyshape || { a: "slender", f: "curvy" }[V.player.gender_body] || "classic";

	apparentbreastsizecheck();
	const breastSizeMap = {
		12: 6,
		8: 5,
		9: 5,
		10: 5,
		11: 5,
		6: 4,
		7: 4,
		4: 3,
		5: 3,
		3: 2,
		1: 1,
		2: 1,
	};

	T.modeloptions.breast_size = breastSizeMap[V.player.perceived_breastsize] || 0;
	T.modeloptions.breasts = "default";

	if (V.sexStats) {
		const bellySize = playerBellySize() || V.bellySizeDebug;
		T.modeloptions.belly = bellySize;
		T.bellySize = bellySize;
	}

	if (V.wraithSkin) {
		T.modeloptions.skin_type = "wraith";
		T.modeloptions.filters = {
			tan: {
				blend: "#ffffff",
				blendMode: "multiply",
				desaturate: true,
			},
		};
		T.modeloptions.tanningEnabled = false;
	}

	T.modeloptions.tummy_parasite = V.parasite.tummy.name;

	/*
			██   ██  █████  ██ ██████
			██   ██ ██   ██ ██ ██   ██
			███████ ███████ ██ ██████
			██   ██ ██   ██ ██ ██   ██
			██   ██ ██   ██ ██ ██   ██
		*/

	T.modeloptions.hair_sides_length = V.hairlengthstage;
	const hairstyle = setup.hairstyles.sides.find(hs => hs.variable === V.hairtype);

	if (hairstyle.alt_head_type && hairstyle.alt_head_type.includes(setup.clothes.head[clothesIndex("head", V.worn.head)].head_type)) {
		T.modeloptions.hair_sides_type = hairstyle.alt;
	} else {
		T.modeloptions.hair_sides_type = V.hairtype;
	}

	T.modeloptions.hair_sides_position = V.hairposition;
	T.modeloptions.hair_fringe_length = V.fringelengthstage;
	T.modeloptions.hair_fringe_type = V.fringetype;

	/*
			█████  ██████  ███    ███ ███████
			██   ██ ██   ██ ████  ████ ██
			███████ ██████  ██ ████ ██ ███████
			██   ██ ██   ██ ██  ██  ██      ██
			██   ██ ██   ██ ██      ██ ███████
			*/
	const wings = ["demon", "angel", "fallenAngel", "bird"].some(tf => !["hidden", "disabled"].includes(V.transformationParts[tf].wings));
	const coverBreasts = !V.dontHide && ((V.uncomfortable.nude && T.exposedUpper >= 2) || (V.uncomfortable.underwear && T.exposedUpper >= 1));
	const coverCrotch = !V.dontHide && ((V.uncomfortable.nude && T.exposedLower >= 2) || (V.uncomfortable.underwear && T.exposedLower >= 1));

	T.modeloptions.arm_left = armPosition("left");
	T.modeloptions.arm_right = armPosition("right");

	if (coverBreasts) {
		if (wings) {
			if (
				!T.disabled.includes(V.transformationParts.demon.wings) &&
				!(isChimeraEnabled("demonharpy", "wings") && isPartEnabled(T.modeloptions.bird_wings_type))
			) {
				T.modeloptions.demon_wings_state = V.transformationParts.traits.flaunting === "default" ? "flaunt" : "cover";
			} else if (!T.disabled.includes(V.transformationParts.angel.wings)) {
				T.modeloptions.angel_wing_right = "cover";
				T.modeloptions.bird_wing_right = "cover";
			} else if (!T.disabled.includes(V.transformationParts.fallenAngel.wings)) {
				T.modeloptions.fallen_wing_right = "cover";
				T.modeloptions.bird_wing_right = "cover";
			} else if (!T.disabled.includes(V.transformationParts.bird.wings)) {
				T.modeloptions.bird_wing_right = "cover";
			}
		} else {
			T.coverBreastsWithArm = true;
		}
	}

	if (coverCrotch && wings) {
		if (!T.disabled.includes(V.transformationParts.demon.tail)) {
			T.modeloptions.demon_tail_state = V.transformationParts.traits.flaunting === "default" ? "flaunt" : "cover";
			if (!T.disabled.includes(V.transformationParts.cat.tail)) T.modeloptions.cat_tail_state = "cover";
		} else if (!T.disabled.includes(V.transformationParts.angel.wings)) {
			T.modeloptions.angel_wing_left = "cover";
			T.modeloptions.bird_wing_left = "cover";
		} else if (!T.disabled.includes(V.transformationParts.fallenAngel.wings)) {
			T.modeloptions.fallen_wing_left = "cover";
			T.modeloptions.bird_wing_left = "cover";
		} else if (!T.disabled.includes(V.transformationParts.bird.wings)) {
			T.modeloptions.bird_wing_left = "cover";
		}
	}

	if (T.prop) {
		T.modeloptions.prop = {};
		T.modeloptions.prop = Object.assign({}, T.prop);
		T.modeloptions.prop.show =
			(T.modeloptions.arm_left !== "none" && T.modeloptions.arm_right !== "none") || T.modeloptions.prop.armPosition === "handsfree";
		if (coverCrotch && T.prop.hasCoverImg && !wings) T.modeloptions.prop.name += "-cover";
	}

	function armPosition(arm) {
		if (["grappled", "bound"].includes(V[arm + "arm"])) return "none";

		if (T.prop) {
			if (propCoversNudity(arm)) return "cover";

			if (T.prop.armPosition === "clutch") return arm === "right" ? "hold" : "cover";
			if (T.prop.armPosition === `${arm}_cover` || T.prop.armPosition === "cover_both") return "cover";
			if (T.prop.armPosition === `${arm}_hold`) return "hold";
		}

		if (useCover(arm)) return "cover";
		if (useHold(arm)) return "hold";

		return "idle";
	}

	function propCoversNudity(arm) {
		if (wings || !T.prop.hasCoverImg) return false;

		if (arm === "right" && coverCrotch && !T.prop.armPosition.includes("left")) return true;
		if (arm === "left" && coverBreasts && (T.prop.armPosition.includes("left") || T.prop.armPosition === "idle_both")) return true;
		return false;
	}

	function useCover(arm) {
		const leftCoverClothes = setup.clothes_all_slots.some(slot => ["left_cover", "clutch", "cover_both"].includes(V.worn[slot]?.holdPosition));
		const rightCoverClothes = setup.clothes_all_slots.some(slot => ["right_cover", "cover_both"].includes(V.worn[slot]?.holdPosition));

		if ((arm === "left" && leftCoverClothes) || (arm === "right" && rightCoverClothes)) return true;
		if (!wings && ((arm === "left" && coverBreasts) || (arm === "right" && coverCrotch))) return true;
		return false;
	}

	function useHold(arm) {
		const rightHoldClothes =
			setup.clothes_all_slots.some(slot => ["right_hold", "clutch"].includes(V.worn[slot]?.holdPosition)) ||
			(V.worn.handheld.name !== "naked" && !["left_cover", "left_idle", "idle_both"].includes(V.worn.handheld?.holdPosition));
		const leftHoldClothes = setup.clothes_all_slots.some(slot => V.worn[slot]?.holdPosition === "left_hold");

		if ((arm === "right" && rightHoldClothes) || (arm === "left" && leftHoldClothes)) return true;
		return false;
	}

	/*
			██     ██ ██████  ██ ████████ ██ ███    ██  ██████  ███████
			██     ██ ██   ██ ██    ██    ██ ████   ██ ██       ██
			██  █  ██ ██████  ██    ██    ██ ██ ██  ██ ██   ███ ███████
			██ ███ ██ ██   ██ ██    ██    ██ ██  ██ ██ ██    ██      ██
			 ███ ███  ██   ██ ██    ██    ██ ██   ████  ██████  ███████
		*/

	if (V.options.bodywritingImages === true) {
		for (const [label, value] of Object.entries(V.skin)) {
			if (value.writing) {
				T.modeloptions["writing_" + label] = setup.bodywriting_namebyindex[value.index];
			}
		}
	}

	/*
			███████  █████   ██████ ███████
			██      ██   ██ ██      ██
			█████   ███████ ██      █████
			██      ██   ██ ██      ██
			██      ██   ██  ██████ ███████
		*/

	T.modeloptions.facestyle = V.facestyle || "default";
	T.modeloptions.facevariant = V.facevariant || "default";
	T.modeloptions.freckles = V.player.freckles === true && V.makeup.concealer !== 1;
	T.modeloptions.ears_position = V.earsposition;
	T.modeloptions.toast = T.toast === true;
	T.modeloptions.scars = false;

	// Eyes
	if (V.possessed) {
		T.modeloptions.trauma = V.possessed;
	} else {
		T.modeloptions.trauma = V.trauma >= V.traumamax * 0.9;
	}
	T.modeloptions.blink = V.options.blinkingEnabled;
	T.modeloptions.eyes_bloodshot = (V.pain >= 100 && V.willpowerpain === 0) || V.tiredness >= C.tiredness.max;
	T.modeloptions.eyes_half =
		(V.options.halfClosedEnabled &&
			(V.arousal >= (V.arousalmax / 5) * 4 || V.orgasmdown >= 1) &&
			V.trauma < V.traumamax * 0.9 &&
			V.pain < 60 &&
			V.eyelidTEST === true) ||
		V.possessed ||
		V.tiredness >= C.tiredness.max * 0.75;

	// Brows
	if (V.trauma >= V.traumamax || V.possessed) {
		T.modeloptions.brows = "top";
	} else if (V.pain >= 60) {
		T.modeloptions.brows = "low";
	} else if (V.arousal >= (V.arousalmax / 5) * 4 || V.orgasmdown >= 1) {
		T.modeloptions.brows = "orgasm";
	} else if (V.pain >= 20) {
		T.modeloptions.brows = "mid";
	} else {
		T.modeloptions.brows = "top";
	}
	T.modeloptions.brows_position = V.browsposition;

	// Mouth
	if (V.underwater === 1 || (T.tempEffects?.underwater && T.tempEffects.underwater !== "noMouth")) {
		T.modeloptions.mouth = "chew";
	} else if (V.trauma >= V.traumamax) {
		T.modeloptions.mouth = "neutral";
	} else if (V.pain >= 60 || V.orgasmdown >= 1 || V.possessed) {
		T.modeloptions.mouth = "cry";
	} else if ((V.exposed === 2 && V.uncomfortable.nude === true && V.dontHide === false && V.libertine !== 2) || V.pain >= 20) {
		T.modeloptions.mouth = "frown";
	} else if (V.pain >= 1 || (V.exposed === 1 && V.uncomfortable.underwear === true) || (V.combat === 1 && V.consensual !== 1)) {
		T.modeloptions.mouth = "neutral";
	} else if (V.stress >= (V.stressmax / 5) * 3 || !(V.control >= (V.controlmax / 5) * 1)) {
		T.modeloptions.mouth = "neutral";
	} else {
		T.modeloptions.mouth = "smile";
	}
	if (T.prop?.folder === "food" && !T.prop.name.includes("gift")) {
		const foodKey = T.prop.name
			.replace(/-/g, "_")
			.normalize("NFKD")
			.replace(/[\u0300-\u036f]/g, "");
		const category = setup.foodstuff[foodKey]?.category;
		const shouldChew = (category ? category !== "dish" : true) && !T.prop.name.includes("inedible");
		if (shouldChew) T.modeloptions.mouth = "chew";
	}

	// Blush
	T.modeloptions.blush = Math.min(5, Math.floor(V.arousal / 2000) + 1);
	if (T.modeloptions.blush < 2 && V.exposed >= 2) {
		T.modeloptions.blush = 2;
	} else if (V.arousal < 100 && V.exposed < 1) {
		T.modeloptions.blush = 0;
	}
	if (
		T.modeloptions.blush < 2 &&
		!V.worn.over_upper.type.includes("naked") &&
		!V.worn.over_lower.type.includes("naked") &&
		V.worn.upper.type.includes("naked") &&
		V.worn.lower.type.includes("naked") &&
		V.worn.under_upper.type.includes("naked") &&
		V.worn.under_lower.type.includes("naked")
	) {
		T.modeloptions.blush = 2;
	}

	// Tears
	T.modeloptions.tears = painToTearsLvl(V.pain);

	/*
		 ████████ ███████ ███████
			██    ██      ██
			██    █████   ███████
			██    ██           ██
			██    ██      ███████
		*/

	// Wing and tail idle/cover/flaunt state is configured in the arms section above

	T.modeloptions.angel_wings_type = V.transformationParts.angel.wings;
	T.modeloptions.angel_wings_layer = V.wingslayer;
	T.modeloptions.angel_halo_type = V.transformationParts.angel.halo;

	T.modeloptions.fallen_wings_type = V.transformationParts.fallenAngel.wings;
	T.modeloptions.fallen_wings_layer = V.wingslayer;
	T.modeloptions.fallen_halo_type = V.transformationParts.fallenAngel.halo;

	T.modeloptions.demon_wings_type = V.transformationParts.demon.wings;
	T.modeloptions.demon_wings_layer = V.wingslayer;
	T.modeloptions.demon_tail_type = V.transformationParts.demon.tail;
	T.modeloptions.demon_tail_layer = V.taillayer;
	T.modeloptions.demon_horns_type = V.transformationParts.demon.horns;
	T.modeloptions.demon_horns_layer = V.hornslayer;

	T.modeloptions.wolf_tail_type = V.transformationParts.wolf.tail;
	T.modeloptions.wolf_tail_layer = V.taillayer;
	T.modeloptions.wolf_ears_type = V.transformationParts.wolf.ears;
	T.modeloptions.wolf_pits_type = V.transformationParts.wolf.pits;
	T.modeloptions.wolf_pubes_type = V.transformationParts.wolf.pubes;
	T.modeloptions.wolf_cheeks_type = V.transformationParts.wolf.cheeks;

	T.modeloptions.cat_tail_type = V.transformationParts.cat.tail;
	T.modeloptions.cat_tail_layer = V.taillayer;
	T.modeloptions.cat_ears_type = V.transformationParts.cat.ears;

	T.modeloptions.cow_horns_type = V.transformationParts.cow.horns;
	T.modeloptions.cow_horns_layer = V.hornslayer;
	T.modeloptions.cow_tail_type = V.transformationParts.cow.tail.replace(/ /g, "-");
	T.modeloptions.cow_tail_layer = V.taillayer;
	T.modeloptions.cow_ears_type = V.transformationParts.cow.ears.replace(/ /g, "-");

	T.modeloptions.bird_wings_type = V.transformationParts.bird.wings;
	T.modeloptions.bird_wings_layer = V.wingslayer;
	T.modeloptions.bird_tail_type = V.transformationParts.bird.tail;
	T.modeloptions.bird_tail_layer = V.taillayer;
	T.modeloptions.bird_eyes_type = V.transformationParts.bird.eyes;
	T.modeloptions.bird_malar_type = V.transformationParts.bird.malar;
	T.modeloptions.bird_plumage_type = V.transformationParts.bird.plumage;
	T.modeloptions.bird_pubes_type = V.transformationParts.bird.pubes;

	T.modeloptions.fox_tail_type = V.transformationParts.fox.tail;
	T.modeloptions.fox_tail_layer = V.taillayer;
	T.modeloptions.fox_ears_type = V.transformationParts.fox.ears;
	T.modeloptions.fox_cheeks_type = V.transformationParts.fox.cheeks;

	T.modeloptions.tf_ears_layer = V.tfearslayer;

	/*
			██████ ██   ██ ██ ███    ███ ███████ ██████   █████
			██      ██   ██ ██ ████  ████ ██      ██   ██ ██   ██
			██      ███████ ██ ██ ████ ██ █████   ██████  ███████
			██      ██   ██ ██ ██  ██  ██ ██      ██   ██ ██   ██
			██████ ██   ██ ██ ██      ██ ███████ ██   ██ ██   ██
		*/

	// Demon-cat tail
	if (isPartEnabled(T.modeloptions.cat_tail_type) && isPartEnabled(T.modeloptions.demon_tail_type) && isChimeraEnabled("demoncat", "tail")) {
		T.modeloptions.demon_tail_type = "default-cat";
		T.modeloptions.demon_tail_layer = "cover";
	}
	// Demon-harpy wings
	if (isPartEnabled(T.modeloptions.demon_wings_type) && isPartEnabled(T.modeloptions.bird_wings_type) && isChimeraEnabled("demonharpy", "wings")) {
		T.modeloptions.bird_wings_type = "default-demon";
		T.modeloptions.demon_wings_type = "hidden";
	}
	// Angel-harpy wings
	if (isPartEnabled(T.modeloptions.angel_wings_type) && isPartEnabled(T.modeloptions.bird_wings_type) && isChimeraEnabled("angelharpy", "wings")) {
		T.modeloptions.bird_wings_type = "default-angel";
		T.modeloptions.angel_wings_type = "harpy-default";
	}
	// Fallen angel-harpy wings
	if (isPartEnabled(T.modeloptions.fallen_wings_type) && isPartEnabled(T.modeloptions.bird_wings_type) && isChimeraEnabled("fallenharpy", "wings")) {
		T.modeloptions.bird_wings_type = V.transformationParts.fallenAngel.wings.includes("fallenplus") ? "default-angel" : "default-fallen";
		T.modeloptions.fallen_wings_type = T.modeloptions.fallen_wings_type.includes("fallenplus") ? "harpy-fallenplus" : "harpy-default";
	}
	// Demon-cow horns
	if (isPartEnabled(T.modeloptions.cow_horns_type) && isPartEnabled(T.modeloptions.demon_horns_type) && isChimeraEnabled("demoncow", "horns")) {
		if (!["default", "succubus"].includes(T.modeloptions.demon_horns_type)) {
			// Force default horns if the PC has unsupported horn styles (e.g. Classic)
			T.modeloptions.demon_horns_type = "default";
		}
		T.modeloptions.cow_horns_type = T.modeloptions.demon_horns_type === "succubus" ? "succubus-demon" : "default-demon";
	}
	// Demon-cow tail
	if (isPartEnabled(T.modeloptions.cow_tail_type) && isPartEnabled(T.modeloptions.demon_tail_type) && isChimeraEnabled("demoncow", "tail")) {
		T.modeloptions.demon_tail_type = "default-cow";
		T.modeloptions.cow_tail_type = T.modeloptions.cow_tail_type + "-demon";
	}
	// Demon-wolf tail
	if (isPartEnabled(T.modeloptions.wolf_tail_type) && isPartEnabled(T.modeloptions.demon_tail_type) && isChimeraEnabled("demonwolf", "tail")) {
		T.modeloptions.demon_tail_type = T.modeloptions.wolf_tail_type === "feral" ? "default-feral" : "default-wolf";
		T.modeloptions.wolf_tail_type = T.modeloptions.wolf_tail_type === "feral" ? "demon-feral" : "demon-default";
	}
	// Demon-fox tail
	if (isPartEnabled(T.modeloptions.fox_tail_type) && isPartEnabled(T.modeloptions.demon_tail_type) && isChimeraEnabled("demonfox", "tail")) {
		T.modeloptions.fox_tail_type = "default-demon";
		T.modeloptions.demon_tail_type = "hidden";
	}
	// Demon-fox ears
	if (isPartEnabled(T.modeloptions.fox_ears_type) && V.demon >= 6 && isChimeraEnabled("demonfox", "ears")) {
		T.modeloptions.fox_ears_type = "default-demon";
	}

	/*
			██████ ██████   ██████  ████████  ██████ ██   ██
			██      ██   ██ ██    ██    ██    ██      ██   ██
			██      ██████  ██    ██    ██    ██      ███████
			██      ██   ██ ██    ██    ██    ██      ██   ██
			██████ ██   ██  ██████     ██     ██████ ██   ██
		*/

	T.modeloptions.crotch_visible = true;

	if (V.settings.pubicHairEnabled === true) {
		T.modeloptions.pbhair_level = V.pblevel;
		T.modeloptions.pbhair_strip = V.pbstrip;
		T.modeloptions.pbhair_balls = V.pblevelballs;
	}

	if (V.player.penisExist) {
		T.modeloptions.penis_size = Math.clamp(V.player.penissize, 0, 6);
		T.modeloptions.balls = V.player.ballsExist;
		T.modeloptions.penis_condom = V.player.condom.type;
		T.modeloptions.condom_colour = V.player.condom.colour;
		const flaccid = V.arousal < 6000 ? "soft" : "hard";
		const virgin = V.player.virginity.penile === true ? "-virgin-" : "-";
		T.modeloptions.penis = flaccid + virgin + T.modeloptions.penis_size;

		if (V.parasite.penis.name || V.parasite.clit.name === "parasite") {
			/* ear-slime */
			if (V.parasite.penis.name === "parasite" || V.parasite.clit.name === "parasite") {
				T.modeloptions.ear_slime_size = V.player.penissize;
				if (V.worn.genitals.name === "chastity parasite") {
					switch (V.player.penissize) {
						case 2:
							T.modeloptions.ear_slime_size = 1;
							break;
						case 3:
						case 4:
							T.modeloptions.ear_slime_size = 2;
							break;
						case 5:
						case 6:
							T.modeloptions.ear_slime_size = 3;
							break;
						default:
							T.modeloptions.ear_slime_size = 0;
							break;
					}
				}
				T.modeloptions.penis_parasite = `ear-slime-${T.modeloptions.ear_slime_size}`;
			} else {
				/* slime, urchin */
				T.modeloptions.penis_parasite = V.parasite.penis.name;
				if (playerChastity("cage")) {
					/* slime-cage.png, urchin-cage.png */
					T.modeloptions.penis_parasite += "-cage";
					if (V.worn.genitals.name !== "chastity cage") {
						/* slime-cage-fetish.png, slime-cage-small.png, slime-cage-flat.png, etc. */
						const cageType = V.worn.genitals.name.replace(" chastity cage", "");
						T.modeloptions.penis_parasite += `-${cageType}`;
					}
				} else {
					/* slime-hard-3.png, urchin-hard-2.png, etc. */
					T.modeloptions.penis_parasite += `-${flaccid}-${V.player.penissize}`;
				}
			}
		}
	}

	if (V.player.vaginaExist && V.parasite.penis.name && V.parasite.penis.name !== "parasite") {
		/* slime-clit.png, urchin-clit.png */
		T.modeloptions.clit_parasite = V.parasite.clit.name;
	}

	/* ear slime parasite */
	if (V.parasite.penis.name === "parasite" || V.parasite.clit.name === "parasite") {
		if (V.earSlime.focus === "impregnation") {
			T.modeloptions.ear_slime_panties = "ear-slime-shorts";
		} else {
			T.modeloptions.ear_slime_panties = "ear-slime-panties";
		}

		// Ensure it's always displayed
		if (V.worn.genitals.name === "chastity parasite") {
			T.modeloptions.worn = T.modeloptions.worn || {};
			T.modeloptions.worn.genitals = {
				index: clothesIndex("genitals", V.worn.genitals),
				integrity: integrityKeyword(V.worn.genitals, "genitals"),
				colour: V.worn.genitals.colour,
			};
		}
	}

	// Dripping Speeds
	const dripspeeds = ["", "start", "very-slow", "slow", "fast", "very-fast"];

	// Vagina
	let _liquidamt = Math.clamp(setup.bodyliquid.combined("vagina"), 0, 5);
	T.modeloptions.drip_vaginal = dripspeeds[_liquidamt];

	// Anus
	_liquidamt = Math.clamp(setup.bodyliquid.combined("anus"), 0, 5);
	T.modeloptions.drip_anal = dripspeeds[_liquidamt];

	// Mouth
	_liquidamt = Math.clamp(setup.bodyliquid.combined("mouth"), 0, 5);
	T.modeloptions.drip_mouth = dripspeeds[_liquidamt];

	let _chestVisible = false;
	if (V.worn.upper.exposed >= 2 && V.worn.under_upper.exposed >= 1) {
		_chestVisible = true;
	} else if ((V.upperwetstage > 0 || V.worn.upper.type.includes("naked")) && (V.underupperwetstage > 0 || V.worn.under_upper.type.includes("naked"))) {
		_chestVisible = true;
	}

	if (_chestVisible) {
		T.modeloptions.nipples_parasite = V.parasite.nipples.name;
		T.modeloptions.breasts_parasite = V.parasite.breasts.name;
	}

	/*
			███████ ██      ██    ██ ██ ██████  ███████
			██      ██      ██    ██ ██ ██   ██ ██
			█████   ██      ██    ██ ██ ██   ██ ███████
			██      ██      ██    ██ ██ ██   ██      ██
			██      ███████  ██████  ██ ██████  ███████
		*/

	const cumsprite = {
		chest: [null, "1", "2", "3", "4", "4"],
		face: [null, "1", "1", "2", "2", "3"],
		feet: [null, null, "1", "1", "2", "2"],
		leftarm: [null, "1", "1", "1", "2", "2"],
		rightarm: [null, "1", "1", "1", "2", "2"],
		neck: [null, "1", "1", "2", "2", "3"],
		thigh: [null, "1", "2", "3", "4", "5"],
		tummy: [null, "1", "2", "3", "4", "5"],
	};
	const bodyparts = ["chest", "face", "feet", "leftarm", "rightarm", "neck", "thigh", "tummy"];
	bodyparts.forEach(bodypart => {
		const liquidamt = Math.clamp(setup.bodyliquid.combined(bodypart), 0, 5);
		T.modeloptions["cum_" + bodypart] = cumsprite[bodypart].select(liquidamt);
	});

	/***
	 *    ███████  ██████  ██      ██       ██████  ██     ██ ███████ ██████
	 *    ██      ██    ██ ██      ██      ██    ██ ██     ██ ██      ██   ██
	 *    █████   ██    ██ ██      ██      ██    ██ ██  █  ██ █████   ██████
	 *    ██      ██    ██ ██      ██      ██    ██ ██ ███ ██ ██      ██   ██
	 *    ██       ██████  ███████ ███████  ██████   ███ ███  ███████ ██   ██
	 */

	if (V.follower) {
		T.modeloptions.follower = V.follower;
	}

	/**
	 *     ██████  █████  ███    ██ ██    ██  █████  ███████
	 *    ██      ██   ██ ████   ██ ██    ██ ██   ██ ██
	 *    ██      ███████ ██ ██  ██ ██    ██ ███████ ███████
	 *    ██      ██   ██ ██  ██ ██  ██  ██  ██   ██      ██
	 *     ██████ ██   ██ ██   ████   ████   ██   ██ ███████
	 *
	 *    ███████ ███████ ███████ ███████  ██████ ████████ ███████
	 *    ██      ██      ██      ██      ██         ██    ██
	 *    █████   █████   █████   █████   ██         ██    ███████
	 *    ██      ██      ██      ██      ██         ██         ██
	 *    ███████ ██      ██      ███████  ██████    ██    ███████
	 */

	T.modeloptions.precipitation =
		V.options.showSidebarEffects && Weather.precipitation !== "none" && Weather.overcast > 0.25 && V.outside === 1 && !V.underwater;
	T.modeloptions.wraithFlash = V.options.showSidebarEffects;
	T.modeloptions.water = V.options.showSidebarEffects && (V.underwater === 1 || T.tempEffects?.underwater);
	T.modeloptions.waterBreath = V.options.showSidebarEffects && T.modeloptions.water && T.tempEffects?.underwater !== "noMouth";
	T.modeloptions.fire = V.options.showSidebarEffects && (V.fire || T.tempEffects?.fire || (V.farm_assault && V.fields_damaged.includes(V.bus)));
	T.modeloptions.fireFront = V.options.showSidebarEffects && (T.tempEffects?.fireFront || (V.farm_assault && V.fields_damaged.length >= 1));
	T.modeloptions.temperature = V.options.showSidebarEffects && !T.modeloptions.fire && !T.modeloptions.water && V.outside === 1 && Weather.temperature <= 5;
	T.modeloptions.temperature = V.options.showSidebarEffects && !T.modeloptions.fire && !T.modeloptions.water && V.outside === 1 && Weather.temperature <= 5;
	T.modeloptions.petals = V.options.showSidebarEffects && T.tempEffects?.petals;
	if (T.modeloptions.petals) T.modeloptions.petalColour = V.sexRitual && V.gwylanSeen?.includes("romance") ? "pink" : "red-white";
	T.modeloptions.vines = T.tempEffects?.vines;
});

DefineMacro("modelprepare-player-clothes", function () {
	T.modeloptions.breasts =
		!V.worn.upper.type.includes("naked") || !V.worn.under_upper.type.includes("naked") || T.coverBreastsWithArm ? "cleavage" : "default";

	if (V.worn.under_upper.type.includes("chest_bind")) {
		T.modeloptions.breast_size = 1;
	}

	if (V.worn.lower.exposed >= 2 && V.worn.under_lower.exposed >= 1 && !V.worn.legs.name.includes("tights")) {
		T.modeloptions.crotch_visible = true;
		T.modeloptions.crotch_exposed = true;
	} else if ((V.lowerwetstage > 0 || V.worn.lower.type.includes("naked")) && (V.underlowerwetstage > 0 || V.worn.under_lower.type.includes("naked"))) {
		T.modeloptions.crotch_visible = true;
		T.modeloptions.crotch_exposed = false;
	} else {
		T.modeloptions.crotch_visible = false;
	}

	T.modeloptions.hood_down = V.worn.upper.hoodposition === "down";

	if (
		((V.worn.over_head.hood === 1 && V.worn.over_head.mask_img !== 1) || (V.worn.head.hood === 1 && V.worn.head.mask_img !== 1)) &&
		V.worn.upper.hoodposition === "down"
	) {
		T.modeloptions.hair_sides_length = "short";
		T.modeloptions.hair_fringe_length = "short";
	}

	T.modeloptions.facewear_layer = V.facelayer;
	T.modeloptions.upper_tucked = V.upperTucked && !setup.clothes.upper[clothesIndex("upper", V.worn.upper)].notuck && V.worn.upper.outfitPrimary === undefined;
	T.modeloptions.lower_tucked = !V.worn.feet.notuck && !V.worn.lower.notuck && V.lowerTucked;
	T.modeloptions.belly_tucked =
		V.bellyTucked === 1 &&
		V.player.bodyshape === "soft" &&
		V.worn.lower.name !== "naked" &&
		(!setup.clothes.lower[clothesIndex("lower", V.worn.lower)].outfitSecondary ||
			setup.clothes.lower[clothesIndex("lower", V.worn.lower)]?.outfitSecondary[1] !== V.worn.upper.name);

	Object.assign(T.modeloptions, getClothingOptions());
	const overrides = V.modeloptionsOverride;
	if (Object.keys(overrides).length > 0) {
		for (const [key, value] of Object.entries(overrides)) {
			T.modeloptions[key] = value;
		}
	}
});
