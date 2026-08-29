/* This file contains utility functions for named NPCs. */
/* globals random */

function statusCheck(name) {
	if (!V.NPCNameList.includes(name)) {
		Errors.report(`getNNPC received an invalid name ${name}.`);
		return;
	}

	const nnpc = C.npc[name];

	/* To remove later:
	 * When debugging, this temp var not being set will cause an error in scenes that use legacy temporary variables.
	 * These should be replaced with C.npc.Robin instead of _robin, for example.
	 */
	if (V.debug === 0) {
		T[name.toLowerCase()] = nnpc;
	}
	/* /To remove later */

	/* Assume this is successful, unless the game is severely unhinged. */
	if (nnpc.init === 1) {
		switch (nnpc.nam) {
			case "Robin":
				getRobinLocation();
				break;
			case "Kylar":
				kylarStatusCheck(nnpc);
				break;
			case "Sydney":
				sydneyStatusCheck();
				break;
			case "Gwylan":
				gwylanStatusCheck();
				break;
		}
	}
	return nnpc;
}
window.statusCheck = statusCheck;

function sydneyStatusCheck() {
	const sydney = C.npc.Sydney;

	if (sydney.purity >= 50 && sydney.lust >= 60) T.sydneyStatus = "pureLust";
	else if (sydney.corruption >= 10 && sydney.lust >= 20) T.sydneyStatus = "corruptLust";
	else if (sydney.purity >= 50) T.sydneyStatus = "pure";
	else if (sydney.corruption >= 10) T.sydneyStatus = "corrupt";
	else if (sydney.lust >= 40) T.sydneyStatus = "neutralLust";
	else T.sydneyStatus = "neutral";

	if (sydney.chastity.penis.includes("chastity") || sydney.chastity.vagina.includes("chastity")) T.sydneyChastity = 1;
	if (sydney.virginity.vaginal && sydney.virginity.penile) T.sydneyVirgin = 1;
}

function sydneySchedule() {
	if (V.sydney_location_override && V.replayScene) {
		T.sydney_location = V.sydney_location_override;
	} else if (V.daily.sydney.punish === 1) {
		T.sydney_location = "home";
		T.sydney_location_message = "home";
	} else if (V.englishPlay === "ongoing" && V.englishPlayDays === 0 && between(Time.hour, 17, 20)) {
		T.sydney_location = "englishPlay";
	} else if (Time.weekDay === 1) {
		T.sydney_location = "temple";
	} else if (Time.weekDay === 7) {
		if (V.adultshopopeningsydney === true && Time.hour < 21) {
			T.sydney_location = "shop";
		} else if (Time.hour >= 6) {
			T.sydney_location = "temple";
		} else {
			T.sydney_location = "home";
		}
	} else if (Time.weekDay === 6 && between(Time.hour, 16, 19)) {
		if (V.adultshophelped === 1) {
			T.sydney_location = "temple";
		} else {
			T.sydney_location = "shop";
		}
	} else if (V.sydneySeen !== undefined && V.adultshopunlocked && C.npc.Sydney.corruption > 10 && between(Time.hour, 16, 19)) {
		const corruption = C.npc.Sydney.corruption;
		if (V.adultshophelped === 1) {
			T.sydney_location = "temple";
		} else if (corruption > 10 && Time.weekDay === 4) {
			T.sydney_location = "shop";
			T.sydney_location_message = "shop";
		} else if (corruption > 20 && Time.weekDay === 5) {
			T.sydney_location = "shop";
			T.sydney_location_message = "shop";
		} else if (corruption > 30 && Time.weekDay === 3 && V.sydney.rank === "initiate") {
			T.sydney_location = "shop";
			T.sydney_location_message = "shop";
		} else if (corruption > 40 && Time.weekDay === 2 && V.sydney.rank === "initiate") {
			T.sydney_location = "shop";
			T.sydney_location_message = "shop";
		} else {
			T.sydney_location = "temple";
			T.sydney_location_message = "temple";
		}
	} else if (!Time.schoolTerm) {
		if (Time.hour >= 6 && Time.hour <= 22) {
			T.sydney_location = "temple";
		} else {
			T.sydney_location = "home";
		}
	} else if (Time.schoolDay) {
		wikifier("schooleffects");
		if (Time.hour <= 5) {
			T.sydney_location = "home";
		} else if (Time.hour >= 6 && Time.hour <= 9 && V.sydneyLate === 1) {
			T.sydney_location = "late";
		} else if (Time.hour === 6) {
			T.sydney_location = "temple";
		} else if (Time.hour === 7 || Time.hour === 8 || (Time.hour === 9 && V.sydneyScience !== 1)) {
			T.sydney_location = "library";
		} else if (Time.hour === 9) {
			T.sydney_location = "science";
		} else if (["second", "third"].includes(V.schoolstate)) {
			T.sydney_location = "class";
		} else if (V.schoolstate === "lunch" && V.daily.school.lunchEaten !== 1 && Time.minute <= 15) {
			T.sydney_location = "canteen";
		} else if (V.englishPlay === "ongoing" && V.schoolstate === "afternoon") {
			T.sydney_location_message = "rehearsal";
			T.sydney_location = "rehearsal";
		} else if (Time.hour <= 15 || (Time.hour === 16 && Time.minute <= 40)) {
			if (V.daily.sydney.templeSkip) {
				T.sydney_location = "temple";
			} else {
				T.sydney_location = "library";
			}
		} else if (Time.hour >= 16 && Time.hour <= 22) {
			T.sydney_location = "temple";
		} else {
			T.sydney_location = "home";
		}
	} else {
		T.sydney_location = "home";
	}
	if (T.sydney_location === "temple") {
		switch (Time.hour) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
				V.sydney_templeWork = Time.weekDay === 1 ? "sleep" : "pray";
				break;
			case 6:
				V.sydney_templeWork = "pray";
				break;
			case 7:
			case 8:
			case 9:
			case 10:
				V.sydney_templeWork = "garden";
				break;
			case 11:
			case 12:
				V.sydney_templeWork = Time.weekDay === 1 && V.daily.massAttended !== 1 ? "mass" : "pray";
				break;
			case 13:
			case 14:
			case 15:
			case 16:
				V.sydney_templeWork = "pray";
				break;
			case 17:
			case 18:
			case 19:
			case 20:
				V.sydney_templeWork = Time.weekDay === 1 && V.sydney && V.sydney.rank === "initiate" ? "anguish" : "quarters";
				break;
			case 21:
			case 22:
				V.sydney_templeWork = Time.weekDay === 1 && V.sydney && V.sydney.rank === "initiate" ? "anguish" : "pray";
				break;
			case 23:
			case 0:
				V.sydney_templeWork = Time.weekDay === 7 ? "sleep" : "pray";
				break;
			default:
				V.sydney_templeWork = "pray";
		}
	}
}
window.sydneySchedule = sydneySchedule;
DefineMacro("sydneySchedule", sydneySchedule);

function averySchedule() {
	/* ToDo: Divorce schedule from V.avery_mansion entirely */
	if (C.npc.Avery.init !== 1 || C.npc.Avery.state === "dismissed") return;

	/* PC is not allowed to work with Avery if they're injured. Avery works Sunday from 7am-4pm and Monday-Friday 7am-8pm */
	const workHours = Time.weekDay !== 7 && Time.hour > 6 && Time.hour <= (Time.weekDay === 1 ? 16 : 20);
	const workAvailable = V.averySeen?.includes("office") && !V.avery_injury;
	if (workHours && workAvailable) T.avery_available = "office";

	/* Office job can only be unlocked if Avery's not injured. If PC's never been on a date with Avery, they'll receive a note from the office manager at high enough love. If they have been on dates with Avery, Avery has the artefact, and their rage is low enough, they will be railroaded into unlocking the job when they enter the office at high enough office manager love. The times differ for each approach. We may want to revisit this when we do a full standardisation of NPC schedules. */
	const jobUnlock1 = V.dateCount.Avery === 0 && Time.hour >= 8 && Time.hour < 10;
	const jobUnlock2 = V.auriga_artefact && C.npc.Avery.rage <= 40 && Time.hour >= 8 && Time.hour < 15;
	if (!V.averySeen?.includes("office") && Time.weekDay !== 7 && !V.avery_injury) {
		if (jobUnlock1) T.avery_available = "office invite";
		if (jobUnlock2) T.avery_available = "office unlock";
	}

	/* Avery ignores regular schedule to pick up PC */
	const love = random(20, 100);
	const rng = random(1, 100);
	const schoolPickupChecks =
		C.npc.Avery.state === "active" && !V.avery_injury && Time.schoolDay && Time.hour === 15 && V.exposed <= 0 && !V.averyschoolpickup;
	const schoolPickupChance = (C.npc.Avery.love >= love && (rng >= 51 || Weather.precipitation !== "none")) || (C.npc.Avery.love >= 20 && Time.weekDay === 2);
	if (schoolPickupChecks && schoolPickupChance) T.avery_available = "pickup";

	/* NOTE: not sure if replacing || with && breaks anything, leaving this just in case */
	if (!V.avery_mansion && T.avery_available === "pickup") {
		/* Prior to unlocking mansion, Avery can only be found for school pickup, dates, or office job */
		if (V.averydate === 1 && Time.weekDay === 7 && Time.hour === 20) T.avery_available = "date";

		return T.avery_available;
	}

	if (!V.avery_mansion) return;

	if (V.avery_mansion.schedule === "away" && V.avery_skyscraper_fire_time <= 0 && V.avery_injury) V.avery_mansion.schedule = "return";
	else if (
		V.avery_mansion.schedule === "away" &&
		V.avery_mansion.away_timer >= 0 &&
		!V.avery_injury &&
		Time.hour >= 18 &&
		V.avery_mansion.party_state === "waiting" &&
		Time.weekDay === 1
	) {
		V.avery_mansion.schedule = "return";
		V.avery_mansion.away_timer = 0;
		V.avery_mansion.rage.apologetic = true;
		V.avery_mansion.rage.work = true;
	} else if (
		V.avery_mansion.schedule === "away" &&
		!V.avery_injury &&
		V.avery_mansion.away_timer <= 0 &&
		((Time.weekDay === 7 && Time.hour >= 4) || Time.hour >= 21 || Time.hour <= 6)
	) {
		V.avery_mansion.schedule = "return";
		V.avery_mansion.rage.apologetic = true;
		V.avery_mansion.rage.work = true;
	} else if (V.avery_mansion.schedule !== "away") {
		switch (Time.weekDay) {
			/* Sunday */
			case 1:
				if (Time.hour <= 4) V.avery_mansion.schedule = "sleep";
				else if (Time.hour <= 5 && V.daily.avery.morning_bath !== "done" && V.daily.avery.morning_bath !== "dressing")
					V.avery_mansion.schedule = "bath";
				else if (Time.hour <= 6 && V.timeStamp < V.daily.avery.dressing_timer && V.daily.avery.morning_bath === "dressing")
					V.avery_mansion.schedule = "dressing";
				else if (Time.hour <= 6) V.avery_mansion.schedule = "breakfast";
				else if (Time.hour <= 16) V.avery_mansion.schedule = "work";
				else if (Time.hour <= 17 && V.avery_mansion.rage.work === true) V.avery_mansion.schedule = "return";
				else if (Time.hour <= 17 && V.avery_mansion.party_state === "waiting" && !V.avery_valentines?.invite)
					V.avery_mansion.schedule = "party_prepare";
				else if (V.avery_mansion.party_state === "waiting") V.avery_mansion.schedule = "party";
				else V.avery_mansion.schedule = "drink";
				break;

			/* Monday */
			case 2:
				if (Time.hour <= 4) V.avery_mansion.schedule = "sleep";
				else if (Time.hour <= 5 && V.daily.avery.morning_bath !== "done" && V.daily.avery.morning_bath !== "dressing")
					V.avery_mansion.schedule = "bath";
				else if (Time.hour <= 6 && V.timeStamp < V.daily.avery.dressing_timer && V.daily.avery.morning_bath === "dressing")
					V.avery_mansion.schedule = "dressing";
				else if (Time.hour <= 6) V.avery_mansion.schedule = "breakfast";
				else if (Time.hour <= 20) V.avery_mansion.schedule = "work";
				else if (Time.hour <= 23 && V.avery_mansion.rage.work === true) V.avery_mansion.schedule = "return";
				else if (Time.hour <= 23 && !V.avery_mansion.rage.dinner_done) V.avery_mansion.schedule = "dinner";
				else V.avery_mansion.schedule = "study";
				break;

			/* Tuesday */
			case 3:
				if (Time.hour <= 4) V.avery_mansion.schedule = "sleep";
				else if (Time.hour <= 5 && V.daily.avery.morning_bath !== "done" && V.daily.avery.morning_bath !== "dressing")
					V.avery_mansion.schedule = "bath";
				else if (Time.hour <= 6 && V.timeStamp < V.daily.avery.dressing_timer && V.daily.avery.morning_bath === "dressing")
					V.avery_mansion.schedule = "dressing";
				else if (Time.hour <= 6) V.avery_mansion.schedule = "breakfast";
				else if (Time.hour <= 20) V.avery_mansion.schedule = "work";
				else if (Time.hour <= 23 && V.avery_mansion.rage.work === true) V.avery_mansion.schedule = "return";
				else if (Time.hour <= 23 && !V.avery_mansion.rage.dinner_done) V.avery_mansion.schedule = "dinner";
				else V.avery_mansion.schedule = "pool";
				break;

			/* Wednesday */
			case 4:
				if (Time.hour <= 4) V.avery_mansion.schedule = "sleep";
				else if (Time.hour <= 5 && V.daily.avery.morning_bath !== "done" && V.daily.avery.morning_bath !== "dressing")
					V.avery_mansion.schedule = "bath";
				else if (Time.hour <= 6 && V.timeStamp < V.daily.avery.dressing_timer && V.daily.avery.morning_bath === "dressing")
					V.avery_mansion.schedule = "dressing";
				else if (Time.hour <= 6) V.avery_mansion.schedule = "breakfast";
				else if (Time.hour <= 20) V.avery_mansion.schedule = "work";
				else if (Time.hour <= 23 && V.avery_mansion.rage.work === true) V.avery_mansion.schedule = "return";
				else if (Time.hour <= 23 && !V.avery_mansion.rage.dinner_done) V.avery_mansion.schedule = "dinner";
				else V.avery_mansion.schedule = "lounge";
				break;

			/* Thursday */
			case 5:
				if (Time.hour <= 4) V.avery_mansion.schedule = "sleep";
				else if (Time.hour <= 5 && V.daily.avery.morning_bath !== "done" && V.daily.avery.morning_bath !== "dressing")
					V.avery_mansion.schedule = "bath";
				else if (Time.hour <= 6 && V.timeStamp < V.daily.avery.dressing_timer && V.daily.avery.morning_bath === "dressing")
					V.avery_mansion.schedule = "dressing";
				else if (Time.hour <= 6) V.avery_mansion.schedule = "breakfast";
				else if (Time.hour <= 20) V.avery_mansion.schedule = "work";
				else if (Time.hour <= 23 && V.avery_mansion.rage.work === true) V.avery_mansion.schedule = "return";
				else if (Time.hour <= 23 && !V.avery_mansion.rage.dinner_done) V.avery_mansion.schedule = "dinner";
				else V.avery_mansion.schedule = "garden";
				break;

			/* Friday */
			case 6:
				if (Time.hour <= 4) V.avery_mansion.schedule = "sleep";
				else if (Time.hour <= 5 && V.daily.avery.morning_bath !== "done" && V.daily.avery.morning_bath !== "dressing")
					V.avery_mansion.schedule = "bath";
				else if (Time.hour <= 6 && V.timeStamp < V.daily.avery.dressing_timer && V.daily.avery.morning_bath === "dressing")
					V.avery_mansion.schedule = "dressing";
				else if (Time.hour <= 6) V.avery_mansion.schedule = "breakfast";
				else if (Time.hour <= 20) V.avery_mansion.schedule = "work";
				else if (Time.hour <= 23 && V.avery_mansion.rage.work === true) V.avery_mansion.schedule = "return";
				else if (Time.hour <= 23 && !V.avery_mansion.rage.dinner_done) V.avery_mansion.schedule = "dinner";
				else V.avery_mansion.schedule = "drink";
				break;

			/* Saturday */
			case 7:
				if (Time.hour <= 4) V.avery_mansion.schedule = "sleep";
				else if (Time.hour <= 5 && V.daily.avery.morning_bath !== "done" && V.daily.avery.morning_bath !== "dressing")
					V.avery_mansion.schedule = "bath";
				else if (Time.hour <= 6 && V.timeStamp < V.daily.avery.dressing_timer && V.daily.avery.morning_bath === "dressing")
					V.avery_mansion.schedule = "dressing";
				else if (Time.hour <= 6) V.avery_mansion.schedule = "breakfast";
				else if (Time.hour <= 9) V.avery_mansion.schedule = "garden";
				else if (Time.hour <= 12) V.avery_mansion.schedule = "pool";
				else if (Time.hour <= 15) V.avery_mansion.schedule = "study";
				else if (Time.hour <= 19) V.avery_mansion.schedule = "lounge";
				else if (Time.hour === 20) V.avery_mansion.schedule = "date";
				else V.avery_mansion.schedule = "drink";
				break;
		}
	}

	if (!["away", "date", "sleep", "work", "dressing"].includes(V.avery_mansion.schedule)) T.avery_available = "talk";
}
window.averySchedule = averySchedule;
DefineMacro("averySchedule", averySchedule);

function kylarStatusCheck(kylar) {
	const kylarStatus = [];
	// USAGE:
	// if Kylar's love is 50+:  <<if _kylarStatus.includes("Love")>>
	// if Kylar's love is 0-50: <<if !_kylarStatus.includes("Love")>>
	if (kylar.love >= 50) {
		kylarStatus.push("Love");
	}
	// USAGE:
	// if Kylar's lust is 60+:  <<if _kylarStatus.includes("Lust")>>
	// if Kylar's lust is 0-60: <<if !_kylarStatus.includes("Lust")>>
	if (kylar.lust >= 60) {
		kylarStatus.push("Lust");
	}
	// USAGE:
	// if Kylar's jealousy is 90+:   <<if _kylarStatus.includes("MaxRage")>>
	if (kylar.rage >= 90) {
		kylarStatus.push("MaxRage");
	}

	// USAGE:
	// if Kylar's jealousy is 60+:   <<if _kylarStatus.includes("Rage")>>. Not mutually exclusive with 90+
	// if Kylar's jealousy is 30-59: <<if _kylarStatus.includes("Sus")>>
	// if Kylar's jealousy is 0-30:  <<if _kylarStatus.includes("Calm")>>
	if (kylar.rage >= 60) {
		kylarStatus.push("Rage");
	} else if (kylar.rage >= 30) {
		kylarStatus.push("Sus");
	} else {
		kylarStatus.push("Calm");
	}
	return (T.kylarStatus = kylarStatus);
}

function understandsBirdBehaviour() {
	return V.harpy >= 6 || V.tending >= 600;
}
window.understandsBirdBehaviour = understandsBirdBehaviour;

function edenFreedomStatus() {
	if (V.edenfreedom >= 1 && V.edendays >= 0) {
		// if edenCagedEscape is true, the cage limit is 7 days regarless of $edenfreedom
		const daysCage = V.edenCagedEscape || V.edenfreedom === 1 ? 7 : 21;
		const daysFreedom = V.edenfreedom === 1 ? 2 : 7;

		if (V.syndromeeden && V.edendays > daysCage) return 2; // Cage if Eden hunts you down/finds you
		if (V.edendays > daysFreedom) return 1; // Recaptured if Eden finds you, angry if return on your own
		return 0; // Free as a bird, allowed to come and go as you please
	}
	return -1; // Player not allowed to leave (hasn't asked for freedom/pre-stockholm/hasn't met Eden)
}
window.edenFreedomStatus = edenFreedomStatus;

function gwylanStatusCheck() {
	const gwylanStatus = [];

	if (V.forest_shop_intro || V.gwylan_rescue || V.gwylan_cafe_intro || V.gwylan_hunt_intro) {
		gwylanStatus.push("met");
	}

	// return early if called before core vars are set
	if (!V.gwylanTalked || !V.gwylanSeen || !V.gwylan) return (T.gwylanStatus = gwylanStatus);

	if (V.gwylan?.timer?.lastSeen) T.gwylanLastSeenDays = Math.abs(Time.date.dayDifference(new DateTime(V.gwylan.timer.lastSeen)));

	const totalSets = getSpecialSets(sets => sets.shop.includes("forest"));
	const unlockedSets = getUnlockedSpecialSets(V.specialClothes.filter(c => c.unlocked >= 2).map(c => c.name)).filter(set =>
		setup.specialClothesSets[set].shop.includes("forest")
	);
	C.npc.Gwylan.love = Math.ceil(unlockedSets.length + V.gwylanTalked.filter(set => setup.specialClothesSets[set]?.shop.includes("forest")).length);
	if (V.gwylan.wary > 1 && ["active", "scorned"].includes(C.npc.Gwylan.state)) {
		/* If Gwylan is around, temporarily lower love if player has worked against them until amends are made */
		C.npc.Gwylan.love -= V.gwylan.wary * 2;
		gwylanStatus.push("cautious");
	}
	T.gwylanLovePercent = Math.ceil((C.npc.Gwylan.love / (totalSets.length * 2)) * 100);

	if (
		T.gwylanLovePercent >= 65 &&
		V.gwylanSeen.includes("ritual_sex") &&
		C.npc.Gwylan.dom >= 20 &&
		C.npc.Gwylan.lust >= 40 &&
		!gwylanStatus.includes("cautious")
	) {
		/* Gwylan allows themselves to become comfortable with the player before yearning unlock */
		if (!V.gwylanSeen.includes("yearning")) gwylanStatus.push("aroused");
		/* Gwylan is dominant over the player */
		if (C.npc.Gwylan.dom >= 100 || V.hypnosis_traits.devotion >= 3) gwylanStatus.push("dom");
	}

	if (
		T.gwylanLovePercent >= 75 &&
		V.gwylanSeen.includes("yearning") &&
		C.npc.Gwylan.dom >= 50 &&
		C.npc.Gwylan.lust >= 30 &&
		C.npc.Gwylan.dom + C.npc.Gwylan.lust >= 90 &&
		!gwylanStatus.includes("cautious")
	) {
		/* Gwylan allows themselves to become comfortable with the player again after 'breakup' */
		gwylanStatus.push("lust");
		if (V.gwylanSeen.includes("partners") && C.npc.Gwylan.dom >= 100 && C.npc.Gwylan.lust >= 40 && C.npc.Gwylan.dom + C.npc.Gwylan.lust >= 160)
			if (!V.weekly.gwylanNoHeat) {
				/* In heat/rut */
				gwylanStatus.push("heat");
			}
		if (
			T.gwylanLovePercent >= 90 &&
			C.npc.Gwylan.dom >= 140 &&
			gwylanStatus.includes("heat") &&
			// eslint-disable-next-line no-undef
			!npcIsPregnant("Gwylan") &&
			!playerIsPregnant()
		)
			/* Wants pregnancy with player */
			gwylanStatus.push("wantsPregnancy");
	}

	/* Event handlers */
	if (V.avery_fate === "ascended" && V.auriga_scar >= 1 && !V.gwylanSeen.includes("auriga_scar") && V.gwylanSeen.includes("ritual_sex")) {
		gwylanStatus.push("aurigaScarConfront");
	}
	if (
		V.badEndStats.last()?.source !== "Gwylan" &&
		V.badEndStats.last()?.trackedStart >= V.gwylan.timer.lastSeen &&
		T.gwylanLastSeenDays >= 14 &&
		V.gwylanSeen.includes("lights")
	) {
		gwylanStatus.push("reunion");
	}
	if (
		V.gwylanSeen.includes("romance") &&
		(gwylanStatus.includes("aurigaScarConfront") ||
			(C.npc.Gwylan.dom >= 125 &&
				V.hypnosis_traits.devotion &&
				!(V.avery_mansion && !V.avery_fate) &&
				(gwylanStatus.includes("reunion") || V.gwylan.hunting === 3)))
	) {
		gwylanStatus.push("badEndReady");
	}

	/* Transformation part visibility */
	T.gwylanTF = {
		ears: "hidden",
		tail: "hidden",
		fangs: "hidden",
		known: false,
	};
	if (V.settings?.transformAnimalEnabled) {
		if (V.gwylanSeen.includes("gwylan_tf_revealed")) {
			// No longer hiding it from the player
			if (V.hallucinations >= 1) {
				T.gwylanTF.ears = "revealed";
				T.gwylanTF.tail = "revealed";
				T.gwylanTF.fangs = "revealed";
			} else {
				T.gwylanTF.ears = "fake";
				T.gwylanTF.tail = "fake";
				T.gwylanTF.fangs = "fake";
			}
			T.gwylanTF.known = true;
		} else {
			if (
				V.awarelevel >= 4 ||
				(V.hallucinations >= 1 &&
					gwylanStatus.includesAny("aroused", "lust") &&
					(V.awarelevel >= 3 || (V.hypnosis_traits.insight >= 1 && V.awarelevel < 1)))
			) {
				T.gwylanTF.ears = "visible";
				T.gwylanTF.tail = "visible";
				T.gwylanTF.fangs = "visible";
			}
			if (V.gwylanSeen.includes("gwylan_ears")) T.gwylanTF.ears = V.hallucinations >= 1 ? "revealed" : "fake";
			if (V.gwylanSeen.includes("gwylan_tail")) T.gwylanTF.tail = V.hallucinations >= 1 ? "revealed" : "fake";
			if (V.gwylanSeen.includes("gwylan_fangs")) T.gwylanTF.fangs = V.hallucinations >= 1 ? "revealed" : "fake";
		}
	}

	if (V.brownFoxWoundedTimer && Time.date.dayDifference(new DateTime(V.brownFoxWoundedTimer)) > 0) gwylanStatus.push("wounded");
	if (V.brownFoxWounded) gwylanStatus.push("scarred");

	return (T.gwylanStatus = gwylanStatus);
}
window.gwylanStatusCheck = gwylanStatusCheck;

function gwylanSchedule() {
	if (V.gwylan?.timer?.nobody >= Time.date.timeStamp) {
		return "nowhere";
	} else if (C.npc.Gwylan.state === "scorned") {
		if (Time.hour >= 17 && Time.hour <= 23 && !V.gwylanSeen?.includes("yearning_pub") && !V.yearningLetter && !V.daily.gwylan.preventProgress) {
			return "pub";
		} else {
			return "sulking";
		}
	} else if (V.robin_in_forest_shop) {
		return "shop";
	} else if (Time.hour === 5 || (Time.hour === 6 && Time.minute < 45)) {
		return "garden"; // ToDo: Gwylan: watching Gwylan sleep or stretch in the garden during temperate weather
	} else if (!V.daily.gwylan.cafeSkip && Time.hour === 7 && Time.minute < 20 && !V.daily.gwylan.cafe) {
		if (between(V.chef_state, 7, 8) && V.chef_rework <= 30) {
			return "cliff";
		} else {
			return "walking_to_cafe";
		}
	} else if (
		!V.daily.gwylan.cafeSkip &&
		((Time.hour === 7 && (Time.minute >= 20 || V.daily.gwylan.cafe)) || Time.hour === 8 || (Time.hour === 9 && Time.minute <= 20))
	) {
		if (between(V.chef_state, 7, 8) && V.chef_rework <= 30) {
			return "cliff";
		} else {
			return "cafe";
		}
	} else if (!Time.isBloodMoon() && (Time.hour >= 23 || Time.hour <= 5) && (!V.gwylan?.hunting || V.location === "forest_shop")) {
		return "sleep";
	}
	return "shop";
}
window.gwylanSchedule = gwylanSchedule;

function averyMansionScore() {
	if (C.npc.Avery.love < 50) return 0; // 50 love is a hard requirement
	if (V.housekeeping < 400) return 0; // C housekeeping is a hard requirement
	if (Object.values(V.foodstuff).filter(food => food.knows_recipe).length < 6) return 0; // 6 recipes is a hard requirement
	if (V.dateCount.Avery < 6) return 0; // 6 dates is a hard requirement
	let score = 0;
	score += V.housekeeping / 20; // 1 point for every 20 housekeeping skill
	score += C.npc.Avery.love / 2; // 1 point for every 2 points of love
	score += Object.values(V.foodstuff).filter(food => food.knows_recipe).length * 2; // 2 points for each known recipe
	score += V.dateCount.Avery * 3; // 3 points per date
	return score;
}
window.averyMansionScore = averyMansionScore;

/**
 * @param {"Eden" | "Black Wolf" | "Ivory Wraith" | "Gwylan" | "forest trio"} npc which npc to check
 */
function npcCanHunt(npc) {
	switch (npc) {
		case "Eden":
			// Only hunts beyond forest outskirts.
			return V.forest > 20;
		case "Black Wolf":
			// Only hunts beyond forest outskirts.
			return V.forest > 20;
		case "Ivory Wraith":
			// Wraith events can't start at 5 AM. Would result in possession immediately ending.
			return Time.isBloodMoon() && Time.hour !== 5;
		case "Gwylan":
			statusCheck("Gwylan");
			// Hunts in the outskirts normally, but will go beyond if they are actively looking for the player
			return (
				V.forest > 0 &&
				(V.forest <= 25 || V.gwylan?.hunting || T.gwylanStatus?.includesAny("reunion", "heat")) &&
				!V.daily.gwylan.noHunt &&
				!V.weekly.gwylanNoHunt &&
				!V.daily.gwylan.noTalk &&
				!V.daily.gwylan.locked &&
				!T.gwylanStatus?.includes("wounded") &&
				["shop", "garden", "nowhere"].includes(gwylanSchedule()) &&
				(C.npc.Gwylan.init === 0 || (C.npc.Gwylan.state === "active" && V.gwylanSeen?.includes("talk_intro")))
			);
		case "forest trio":
			return npcCanHunt("Eden") || npcCanHunt("Black Wolf") || npcCanHunt("Gwylan");
		default:
			Errors.report(`npcCanHunt function received an invalid npc name ${npc}.`);
	}
}
window.npcCanHunt = npcCanHunt;

function wraithSleepEventCheck() {
	return V.wraith.state !== "" && V.wraith.nightmare === 1 && npcCanHunt("Ivory Wraith");
}
window.wraithSleepEventCheck = wraithSleepEventCheck;
