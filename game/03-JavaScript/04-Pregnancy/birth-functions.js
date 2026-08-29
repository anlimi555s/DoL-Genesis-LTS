/* eslint-disable no-undef */

/* birth-functions.js — shared helpers for the player birth scenes. */

/*
	How long labour lasts, in minutes: a base time for the birth, plus a bit more
	per extra baby (so twins/triplets take longer). Returns minutes; use it with
	<<pass>>, and getTimeString() for the "Next (H:MM)" link. Numbers below are
	just tuning values.
*/
window.birthLaborTime = function birthLaborTime() {
	const babies = getPregnancyObject().fetus.length;

	const BASE_MIN = 60; // a single birth, in minutes
	const BASE_MAX = 180;
	const PER_EXTRA_MIN = 30; // added per extra baby
	const PER_EXTRA_MAX = 90;

	return random(BASE_MIN, BASE_MAX) + random(PER_EXTRA_MIN, PER_EXTRA_MAX) * Math.max(0, babies - 1);
};

/* Note (safe to delete once the old pregnancy code is gone): this replaces the
   old inlined labour-time. Dropped the "experienced mothers labour faster" tier
   (players never saw it) and fixed litter scaling: the old 1 + floor(litter*0.2)
   was always 1 for 1-4 babies, so twins/triplets used to take the same time as a
   single. So labour times differ from before, on purpose. */
