// eslint-disable-next-line no-unused-vars
function lustfulUpdate() {
	// if no progress is made - nothing to update
	if (!V.specialClothesEffects.bimbo.progress && !V.specialClothesEffects.pimp.progress) return;

	let type;
	if (V.specialClothesEffects.bimbo.progress > 0 && V.specialClothesEffects.pimp.progress > 0) {
		// if there's progress in both, resolve it through gender appearance
		type = V.player.gender_appearance === "f" ? "bimbo" : "pimp";
	} else {
		type = V.specialClothesEffects.bimbo.progress > 0 ? "bimbo" : "pimp";
	}
	const effectsRef = V.specialClothesEffects[type];
	if (!effectsRef) return; // this check might not be needed

	// speed up or slow down growth timers
	const mult = type === "bimbo" ? 1 : -1;
	const progress = effectsRef.progress;
	V.breastgrowthtimer -= progress * 5 * mult;
	V.bottomgrowthtimer -= progress * 5 * mult;
	if (V.player.penisExist) V.penisgrowthtimer += progress * 5 * mult;

	effectsRef.total += progress;
	V.specialClothesEffects.bimbo.progress = 0;
	V.specialClothesEffects.pimp.progress = 0;

	if (effectsRef.total >= 400 && effectsRef.message === 0) {
		// stage 1, move body type to androgynous
		effectsRef.message = 1;
		T.skipEvent = true;
		if ((type === "bimbo" && V.player.gender_body === "m") || (type === "pimp" && V.player.gender_body === "f")) {
			V.player.gender_body = "a";
		}
		V.timeMessages.pushUnique(type === "bimbo" ? "bimboMessage1" : "pimpMessage1");
	} else if (effectsRef.total < 400 && effectsRef.message === 1) {
		effectsRef.message = 0;
	}

	if (effectsRef.total >= 800 && effectsRef.message === 1 && T.skipEvent !== true) {
		// stage 2, further change body type
		effectsRef.message = 2;
		T.skipEvent = true;
		if (type === "bimbo" && V.player.gender_body !== "f") V.player.gender_body = "f";
		else if (type === "pimp" && V.player.gender_body !== "m") V.player.gender_body = "m";
		V.timeMessages.pushUnique(type === "bimbo" ? "bimboMessage2" : "pimpMessage2");
	} else if (effectsRef.total < 800 && effectsRef.message === 2) {
		effectsRef.message = 1;
	}

	if (effectsRef.total >= 1200 && effectsRef.message === 2 && T.skipEvent !== true) {
		// stage 3, add lustful trait
		effectsRef.message = 3;
		V.backgroundTraits.pushUnique("lustful");
		V.arousal = V.arousalmax;
		V.timeMessages.pushUnique("bimboMessage3");
	} else if (effectsRef.total < 1200 && effectsRef.message === 3) {
		effectsRef.message = 2;
	}
}
