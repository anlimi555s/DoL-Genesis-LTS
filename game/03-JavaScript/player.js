/**
 * Returns "herm" if player is a hermaphrodite; otherwise returns true if player's internal sense of gender doesn't match their given sex AND NPCs ignore genitals when considering sex.
 * Can be called in cases where the player's genitals do not align with their chosen gender, but they're not considered a crossdresser.
 *
 * @returns {"herm" | boolean}
 */
function isGenitalMismatch() {
	if (V.player.sex === "h") {
		return "herm";
	}
	if (V.player.sex !== V.player.gender && V.settings.nudeGenderPerception === 0) {
		return true;
	}
	return false;
}
window.isGenitalMismatch = isGenitalMismatch;

/**
 * Returns true if player is wearing gendered clothes that don't match their given sex, but does match their gender appearance.
 * Herms will not be considered as crossdressing.
 * Players whose genitals are different from their sex, but NPCs don't judge gender based on genitals so it's irrelevant, will not be considered as crossdressing.
 *
 * @returns {boolean}
 */
function isCrossdressing() {
	if (
		getVisibleClothesList().some(item => ["f", "m"].includes(item.gender) && item.gender !== V.player.sex && item.gender === V.player.gender_appearance) &&
		!isGenitalMismatch()
	) {
		return true;
	}
	return false;
}
window.isCrossdressing = isCrossdressing;

/**
 * Returns true if player is a herm or crossdresser
 * Should be called in cases where NPCs are judging the PC's genitals to be different from their gender, such as scenes where a crossdressing or hermaphrodite PC's genitals are exposed
 *
 * @returns {boolean}
 */
function isHermOrCrossdresser() {
	if (V.player.sex === "h") {
		return "herm";
	}
	if (isCrossdressing() || (V.player.sex !== V.player.gender_appearance && !isGenitalMismatch())) {
		return true;
	}
	return false;
}
window.isHermOrCrossdresser = isHermOrCrossdresser;
