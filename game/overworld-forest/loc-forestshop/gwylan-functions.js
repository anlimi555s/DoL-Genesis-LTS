/**
 * @param {string | Array | null} override forced event or custom weighted random pool
 */
function gwylanRequest(override = null) {
	if (!V.gwylan?.request) return null; // If erroneously called before Gwylan init
	if (V.gwylan.request?.event) return V.gwylan.request; // Don't generate new request if one is active. Use <<gwylanRequestEnd "skip">> first if a new request is needed without completing the current one.

	if (V.gwylan.requestSeed === undefined) V.gwylan.requestSeed = randomFloat(0.25, 0.9);
	const seedrng = new PRNG(V.gwylan.requestSeed);

	if (override && Array.isArray(override)) {
		/* Accepts an array of weighted randoms as an override if you want a specific service to have its own custom pool of requests, or with custom weights
		* Example usage in sugarcube:
		<<set _customRequestPool to []>>
		<<set _customRequestPool.push(["clothing", 1])>>
		<<if $gwylanTalked.includes("bird")>>
			<<set _customRequestPool.push(["preen", 4])>>
		<</if>>
		<<run gwylanRequest(_customRequestPool)>>
		* This would make this function choose the clothing or preen (if available) events only, with a heavy bias towards preen.
		* If a request requires a specific event(s), have it check V.gwylan.requestLast?.event or V.gwylan.timer matching the required event(s) instead of V.gwylan.requestDone
		*/
		if (override.some(entry => typeof entry[0] !== "string" || typeof entry[1] !== "number")) {
			Errors.report(`[gwylanRequest]: Invalid override array provided! The argument was cleared and a normal request was generated.`, {
				Stacktrace: Utils.GetStack(),
				override,
			});
			override = null;
		} else {
			override = weightedRandom(...override, seedrng);
		}
	} else if (override && typeof override !== "string") {
		Errors.report(`[gwylanRequest]: Invalid override type provided! The argument was cleared and a normal request was generated.`, {
			Stacktrace: Utils.GetStack(),
			override,
		});
		override = null;
	}

	const allPossibleRequests = [];
	// Base events
	allPossibleRequests.push(["clothing", 1]);
	allPossibleRequests.push(["ingredients", 1]);

	// One-time event modifiers and custom modifiers for base events
	if (!V.gwylanSeen.includes("request_gas_mask") && V.gwylanTalked?.length >= 5) allPossibleRequests.push(["clothingGasMask", 3]);
	if (!V.gwylanSeen.includes("request_gold_accessories") && V.adultshopunlocked && C.npc.Gwylan.love >= 30) allPossibleRequests.push(["clothingGold", 3]);
	if (window.npcIsPregnant("Gwylan") && V.farm?.woodland >= 2) allPossibleRequests.push(["plums", 5]);

	// Unlockable events
	if (V.gwylanSeen?.includes("ritual_beast") && (!V.gwylan.timer.sample || Time.date.dayDifference(new DateTime(V.gwylan.timer.sample)) < 7))
		allPossibleRequests.push(["sample", 1]); // Lewd fluid sample
	/* ToDo: Gwylan - Asking for a sample of the player's fluids
	if (V.gwylanSeen.includes("cafe_chef_truth") && (!V.gwylan.timer.samplePlayer || V.gwylan.timer.samplePlayer < Time.date.timeStamp))
		allPossibleRequests.push(["samplePlayer", 3]); // Player fluid sample
	*/
	if (
		V.gwylanTalked.includes("bird") &&
		!V.plucked &&
		(!V.gwylan.timer.preen || V.gwylan.timer.preen < Time.date.timeStamp) &&
		((V.harpy >= 6 && V.birdFly >= 1) || V.gwylan.requestCount >= 10)
	) {
		if (V.harpy >= 6 && V.birdFly >= 1) {
			allPossibleRequests.push(["preen", 2]); // Preen player's wings
		} else if (!V.avery_mansion || V.avery_fate) {
			allPossibleRequests.push(["preen", 1]); // Feathers from GH, more rare since it's harder without TF. Do not request this if Avery's mansion is unlocked but before the end of the skyscraper questline to avoid missing dinner, dates, or parties
		}
	}
	if (
		T.gwylanStatus.includesAny("dom", "lust") &&
		V.gwylan.requestCount >= 5 &&
		(V.gwylanSeen.includesAny("cream_lick", "cafe_chef_truth", "nectar_lick") || V.cat >= 6) &&
		(!V.gwylan.timer.cream || V.gwylan.timer.cream < Time.date.timeStamp)
	)
		allPossibleRequests.push(["cream", 1]); // Lewd event
	// ToDo: Gwylan: Bringing Robin back to the forest shop to try clothes
	// if (V.gwylan.robin >= 5) && C.npc.Robin.state === "active" && (!V.gwylan.timer.robin || V.gwylan.timer.robin < Time.date.timeStamp)) allPossibleRequests.push(["robin", 1]);

	// Prevent events from happening twice in a row if possible
	const filteredRequests =
		allPossibleRequests.length > 1 ? allPossibleRequests.filter(request => request[0] !== V.gwylan.requestLast?.event) : allPossibleRequests[0][0];

	// grab event from weighted random
	const selectedEvent = override || weightedRandom(...filteredRequests, seedrng);

	/* Parameter Guide:
	 * event: name of the event for checking requirements
	 * special: misc controller
	 * items: list of required items. Clothes worn, tending items held, or samples collected.
	 * timer: how long the player has before they start incurring trauma for not completing the request if they are hypnotised by Gwylan
	 * command: will prevent request from being reroll-able, as well as determining whether Gwylan made the request as a command
	 */

	switch (selectedEvent) {
		// Scripted story events
		case "tutorial":
			// Should always be the first request
			V.gwylan.request.event = "ingredients";
			V.gwylan.request.special = "tutorial";
			V.gwylan.request.items = [{ category: "tending", name: "wolfshroom", type: "mushroom", need: 3, root: true }];
			V.gwylanTutorialShrooms = 0;
			V.gwylan.request.timer = null;
			V.gwylan.request.command = true;
			return V.gwylan.request;
		case "meetAtShop":
			V.gwylan.request.event = "meetAtShop";
			V.gwylan.request.timer = new DateTime(Time.date).addDays(1).timeStamp;
			V.gwylan.request.command = true;
			return V.gwylan.request;
		case "meetAtCafe":
			V.gwylan.request.event = "meetAtCafe";
			V.gwylan.request.timer = new DateTime(Time.date).addDays(6).timeStamp;
			V.gwylan.request.command = true;
			return V.gwylan.request;
		case "yearning":
			V.gwylan.request.event = "yearning";
			V.gwylan.request.command = true;
			return V.gwylan.request;

		// Normal events
		case "clothing":
			// Random costume request
			V.gwylan.request.event = "clothing";
			return gwylanRequestClothes();
		case "clothingGasMask":
			// One-time gas mask request
			V.gwylan.request.event = "clothing";
			V.gwylan.request.special = "gas mask";
			return gwylanRequestClothes("gas mask");
		case "clothingGold":
			// One-time gold accessories request
			V.gwylan.request.event = "clothing";
			V.gwylan.request.special = "gold accessories";
			return gwylanRequestClothes("gold accessories");
		case "ingredients":
			// Random ingredients request
			V.gwylan.request.event = "ingredients";
			return gwylanRequestIngredients();
		case "plums":
			V.gwylan.request.event = "ingredients";
			V.gwylan.request.special = "plums";
			return gwylanRequestIngredients();

		// Unlockable events
		case "sample":
			// fluid sample from random species
			V.gwylan.request.event = "sample";
			return gwylanRequestSample();
		case "samplePlayer":
			V.gwylan.request.event = "samplePlayer";
			V.gwylan.request.timer = new DateTime(Time.date).addDays(1).timeStamp;
			return V.gwylan.request;
		case "preen":
			V.gwylan.request.event = "preen";
			V.gwylan.request.items = [{ category: "other", name: "feathers", need: seedrng.randomInt(3, 6) }];
			V.gwylan.request.timer =
				V.harpy >= 6 && V.birdFly >= 1 ? new DateTime(Time.date).addDays(1).timeStamp : new DateTime(Time.date).addDays(10).timeStamp; // 10 day timer if no bird tf
			V.gwylan.request.special = V.harpy >= 6 ? "harpy" : "feathers";
			return V.gwylan.request;
		case "cream":
			V.gwylan.request.event = "cream";
			V.gwylan.request.timer = new DateTime(Time.date).addDays(1).timeStamp;
			return V.gwylan.request;
		case "robin":
			V.gwylan.request.event = "robin";
			V.gwylan.request.timer = new DateTime(Time.date).addDays(7).timeStamp;
			return V.gwylan.request;

		// Custom/mixed recipe events will go here. "Items" list can be mixed, e.g., a potion could require a lewd fluid sample, and some ingredients.
		// Could read ingredient list directly from plant setup too when possible.
		case "wolfbrew":
			V.gwylan.request.event = "recipe";
			V.gwylan.request.special = "wolfbrew";
			V.gwylan.request.items = [
				{ category: "tending", name: "wolfshroom", type: "mushroom", need: 1 },
				{ category: "tending", name: "red_wine", type: "ingredient", need: 1 },
				{ category: "tending", name: "strange_flower", type: "flower", need: 1 },
				{ category: "sample", name: "wolf", type: "any", need: 1, have: 0 },
			];
			V.gwylan.request.timer = new DateTime(Time.date).addDays(3).timeStamp;
			return V.gwylan.request;
		case "ghostbrew":
			V.gwylan.request.event = "recipe";
			V.gwylan.request.special = "ghostbrew";
			V.gwylan.request.items = [
				{ category: "tending", name: "ghostshroom", type: "mushroom", need: 1 },
				{ category: "tending", name: "white_wine", type: "ingredient", need: 1 },
				{ category: "tending", name: "strange_flower", type: "flower", need: 1 },
			];
			V.gwylan.request.timer = new DateTime(Time.date).addDays(3).timeStamp;
			return V.gwylan.request;

		case "chastity":
			V.gwylan.request.event = "chastity";
			V.gwylan.request.special = "chastity";
			if (V.worn.genitals.name === "gold chastity belt") {
				V.gwylan.request.items = [
					{ category: "tending", name: "salt", type: "ingredient", need: 500 },
					{ category: "tending", name: "sugar", type: "ingredient", need: 250 },
					{ category: "tending", name: "white_wine", type: "ingredient", need: 3 },
					{ category: "tending", name: "clam", type: "ingredient", need: 2 },
					{ category: "tending", name: "lemon", type: "fruit", need: 20 },
					{ category: "tending", name: "chicken", type: "meat", need: 1 },
				];
				gwylanRequestClothes("goldChain");
				V.gwylan.request.details.gold = true;
			}
			V.gwylan.request.timer = null;
			return V.gwylan.request;
		case "chastityIngredients":
			V.gwylan.request.event = "recipe";
			V.gwylan.request.special = "chastity";
			V.gwylan.request.items = [
				{ category: "tending", name: "salt", type: "ingredient", need: 500 },
				{ category: "tending", name: "sugar", type: "ingredient", need: 250 },
				{ category: "tending", name: "white_wine", type: "ingredient", need: 3 },
				{ category: "tending", name: "clam", type: "ingredient", need: 2 },
				{ category: "tending", name: "lemon", type: "fruit", need: 20 },
				{ category: "tending", name: "chicken", type: "meat", need: 1 },
			];
			gwylanRequestClothes("goldChain");
			V.gwylan.request.details.gold = true;
			V.gwylan.request.timer = null;
			return V.gwylan.request;

		// Error case
		default:
			Errors.report(`[gwylanRequest]: Invalid event!`, {
				Stacktrace: Utils.GetStack(),
				override,
				selectedEvent,
			});
			return null;
	}
}
window.gwylanRequest = gwylanRequest;

function gwylanRequestClothes(override) {
	const seedrng = new PRNG(V.gwylan.requestSeed);
	V.gwylan.request.items ||= [];
	V.gwylan.request.details ||= {
		outfit: false,
		shops: [],
		replacements: "n/a",
		difficulty: 0,
	};

	// Request difficulty
	let complexity = seedrng.randomInt(1, 4);
	if (V.gwylan.requestCount >= 3) complexity += 1;
	if (V.gwylan.requestCount >= 8) complexity += 1;
	if (V.gwylan.requestCount >= 15) complexity += 1;
	V.gwylan.request.timer = new DateTime(Time.date).addDays(Math.ceil(complexity / 3)).timeStamp;
	V.gwylan.request.details.difficulty = complexity;
	const extraItems = complexity >= seedrng.randomInt(2, 5);
	const requireColours = complexity >= seedrng.randomInt(1, 3);
	const requireColoursAdv = requireColours && complexity >= seedrng.randomInt(4, 6);
	const requireIntegrity = complexity >= seedrng.randomInt(5, 7);
	const requirePattern = complexity >= seedrng.randomInt(1, 5);
	const allowReplacements = complexity <= seedrng.randomInt(3, 4);
	const ignoreNeck = V.worn.neck.name === "familiar collar" && V.worn.neck.cursed === 1;

	function grcCreate(clothingName, clothingSlot) {
		const baseItem = {
			category: "clothing",
			name: "none",
			slot: "none",
			word: "a",
			gender: "n",
			colour_requirement: "any",
			acc_colour_requirement: "any",
			integrity_max: 0,
			integrity_requirement: "any",
			integrity_word: "any",
			pattern_requirement: "any",
			reveal: 0,
		};
		const newItem = clone(baseItem);
		const setupItem = clone(setup.clothes[clothingSlot].find(item => item.name === clothingName));
		if (!setupItem) {
			Errors.report(`[gwylanRequestClothes]: Invalid clothing item requested!`, {
				Stacktrace: Utils.GetStack(),
				clothingName,
				clothingSlot,
			});
			return;
		}

		function grcAssign(clothes, target) {
			for (const key in clothes) {
				clothes[key] = target[key] || clothes[key];
			}
			return clothes;
		}

		grcAssign(newItem, setupItem);

		if (!V.gwylan.request.items.some(thing => thing.root)) newItem.root = true;
		const masterItem = newItem.root ? null : V.gwylan.request.items.find(thing => thing.root);

		if (requireColours) {
			if ((masterItem && requireColoursAdv) || masterItem === null) {
				newItem.colour_requirement = setupItem.colour_options.length ? setupItem.colour_options.filter(op => op !== "custom").random() : "any";
				newItem.acc_colour_requirement = setupItem.accessory_colour_options.length
					? setupItem.accessory_colour_options.filter(op => op !== "custom").random()
					: "any";
			} else {
				newItem.colour_requirement = setupItem.colour_options?.includes(masterItem.colour_requirement) ? masterItem.colour_requirement : "any";
				newItem.acc_colour_requirement = setupItem.accessory_colour_options?.includes(masterItem.acc_colour_requirement)
					? masterItem.acc_colour_requirement
					: "any";
			}
		}
		if (requirePattern && setupItem.pattern_options?.length >= 1) {
			newItem.pattern_requirement = setupItem.pattern_options.random();
		}
		if (requireIntegrity && ["upper", "lower", "under_upper", "under_lower"].includes(clothingSlot)) {
			const possibleInt = [];
			if (complexity <= 4) possibleInt.push("full");
			if (complexity >= 4) possibleInt.push("frayed");
			if (complexity >= 5) possibleInt.push("torn");
			if (complexity >= 6) possibleInt.push("tattered");
			newItem.integrity_word = possibleInt.pluck();
			switch (newItem.integrity_word) {
				case "full":
					newItem.integrity_requirement = newItem.integrity_max;
					break;
				case "frayed":
					newItem.integrity_requirement = newItem.integrity_max * 0.9;
					break;
				case "torn":
					newItem.integrity_requirement = newItem.integrity_max * 0.5;
					break;
				case "tattered":
					newItem.integrity_requirement = newItem.integrity_max * 0.2;
					break;
			}
		}

		// Push item
		V.gwylan.request.items.push(newItem);

		// Push outfit parts too
		function grcPushOutfitPart(base, toCheck) {
			if (toCheck.outfitPrimary?.lower || toCheck.outfitPrimary?.under_lower) {
				const targetSlot = Object.keys(toCheck.outfitPrimary)[0];
				const outfitPart = clone(setup.clothes[targetSlot].find(outfit => outfit.outfitSecondary?.includesAll(clothingSlot, toCheck.name)));
				const outfitSecondary = clone(baseItem);
				grcAssign(outfitSecondary, outfitPart);
				outfitSecondary.colour_requirement = base.colour_requirement;
				outfitSecondary.acc_colour_requirement = base.acc_colour_requirement;
				outfitSecondary.integrity_requirement = "any";
				outfitSecondary.integrity_word = "any";
				outfitSecondary.pattern_requirement = "any";
				outfitSecondary.skip = true;
				outfitSecondary.root = false;
				V.gwylan.request.items.push(outfitSecondary);
			}
		}
		grcPushOutfitPart(newItem, setupItem);

		// Push anything that shares a shop group unless task difficulty prevents it
		if (setupItem.shopGroup) {
			if (!allowReplacements) {
				V.gwylan.request.details.replacements = "blocked";
			} else {
				V.gwylan.request.details.replacements = "allowed";
				setup.clothes[clothingSlot]
					.filter(alt => alt.shopGroup === setupItem.shopGroup && alt.name !== setupItem.name)
					.forEach(altSetup => {
						const altItem = clone(newItem);
						grcAssign(altItem, altSetup);
						altItem.alt = true;
						altItem.root = false;
						V.gwylan.request.items.push(altItem);
						grcPushOutfitPart(altItem, altSetup);
					});
			}
		}
	}

	// Scripted one-time events
	if (V.gwylan.request.special === "gas mask" || override === "gas mask") {
		grcCreate("gas mask", "face");
		V.gwylan.request.details.shops = ["clothing"];
		V.gwylan.request.items[0].colour_requirement = "black";
		V.gwylan.request.items[0].acc_colour_requirement = "white";
		return V.gwylan.request;
	}
	if (V.gwylan.request.special === "gold accessories" || override === "gold accessories") {
		grcCreate("gold choker", "neck");
		grcCreate("gold bracelets", "hands");
		grcCreate("gold anklets", "legs");
		V.gwylan.request.details.outfit = true;
		V.gwylan.request.details.shops = ["adult"];
		return V.gwylan.request;
	}
	if (override === "goldChain") {
		grcCreate("gold chain", "neck");
		V.gwylan.request.details.outfit = false;
		V.gwylan.request.details.shops = ["clothing", "adult"];
		return V.gwylan.request;
	}

	// Normal
	const availableShops = ["clothing"];
	if (V.adultshopunlocked) availableShops.push("adult");

	const availableSlots = ["upper", "lower"];
	if (C.npc.Gwylan.lust >= 30) availableSlots.push("under_upper");
	if (!requireIntegrity) availableSlots.push("head");

	const blockedItems = ["gas mask", "gold choker", "gold bracelets", "gold anklets"];
	if (C.npc.Gwylan.lust < 30) blockedItems.push("bunny ears", "kitty ears");

	const availableGenders = V.settings.forcedCrossdressingEnabled && C.npc.Gwylan.lust >= 30 ? ["n", "m", "f"] : ["n", V.player.gender_appearance];

	const possibleClothes = setup.clothes.all.filter(
		clothes =>
			availableSlots.includes(clothes.slot) &&
			availableShops.includesAny(clothes.shop) &&
			clothes.type.includes("costume") &&
			availableGenders.includes(clothes.gender) &&
			!clothes.type.includes("naked") &&
			!clothes.shop.includes("forest") &&
			!clothes.outfitPrimary?.head &&
			!clothes.outfitSecondary &&
			V.worn[clothes.slot].name !== clothes.name &&
			!blockedItems.includes(clothes.name) &&
			(!requireColoursAdv || (requireColoursAdv && clothes.colour_options.length)) &&
			!(C.npc.Gwylan.lust >= 50 && clothes.reveal < 300)
	);
	const roll = clone(possibleClothes.pluck());
	V.gwylan.request.details.shops = roll.shop.filter(shops => availableShops.includes(shops));

	switch (roll.name) {
		// Full sets
		case "maid dress":
		case "maid band":
			grcCreate("maid dress", "upper");
			grcCreate("maid band", "head");
			if (extraItems) grcCreate("feather duster", "handheld");
			V.gwylan.request.details.outfit = true;
			V.gwylan.request.special = "maid";
			break;
		case "traditional maid dress":
		case "traditional maid band":
			grcCreate("traditional maid dress", "upper");
			grcCreate("traditional maid band", "head");
			if (extraItems) grcCreate("feather duster", "handheld");
			V.gwylan.request.details.outfit = true;
			V.gwylan.request.special = "maid";
			break;
		case "Victorian maid dress":
		case "Victorian maid cap":
			grcCreate("Victorian maid dress", "upper");
			grcCreate("Victorian maid cap", "head");
			if (extraItems) grcCreate("feather duster", "handheld");
			V.gwylan.request.details.outfit = true;
			V.gwylan.request.special = "maid";
			break;
		case "waiter's shirt":
		case "waiter's trousers":
			grcCreate("waiter's shirt", "upper");
			grcCreate("waiter's trousers", "lower");
			V.gwylan.request.details.outfit = true;
			V.gwylan.request.special = "waiter";
			break;
		case "waitress uniform":
			grcCreate("waitress uniform", "upper");
			V.gwylan.request.details.outfit = true;
			V.gwylan.request.special = "waitress";
			break;
		case "nurse dress":
		case "nurse hat":
			grcCreate("nurse dress", "upper");
			grcCreate("nurse hat", "head");
			if (extraItems) grcCreate("nurse socks", "legs");
			V.gwylan.request.details.outfit = true;
			V.gwylan.request.special = "nurse";
			break;
		case "plastic nurse dress":
		case "plastic nurse hat":
			grcCreate("plastic nurse dress", "upper");
			grcCreate("plastic nurse hat", "head");
			if (extraItems) grcCreate("nurse socks", "legs");
			V.gwylan.request.details.outfit = true;
			V.gwylan.request.special = "plastic nurse";
			break;
		case "gothic jacket":
		case "gothic trousers":
		case "top hat":
			grcCreate("gothic jacket", "upper");
			grcCreate("gothic trousers", "lower");
			if (extraItems) grcCreate("top hat", "head");
			V.gwylan.request.details.outfit = true;
			V.gwylan.request.special = "gothic";
			break;
		case "gothic gown":
		case "classic gothic gown":
		case "gothic crown":
			grcCreate("gothic gown", "upper");
			if (extraItems) grcCreate("gothic crown", "head");
			V.gwylan.request.details.outfit = true;
			V.gwylan.request.special = "gothic";
			break;
		case "karate jacket":
		case "karate trousers":
			grcCreate("karate jacket", "upper");
			grcCreate("karate trousers", "lower");
			if (extraItems) grcCreate("zori", "feet");
			V.gwylan.request.details.outfit = true;
			V.gwylan.request.special = "karate";
			break;
		case "sailor shirt":
		case "sailor trousers":
		case "large sailor's hat":
			grcCreate("sailor shirt", "upper");
			grcCreate("sailor trousers", "lower");
			grcCreate("large sailor's hat", "head");
			V.gwylan.request.details.outfit = true;
			V.gwylan.request.special = "sailor";
			break;
		case "short sailor shirt":
		case "sailor shorts":
		case "small sailor's hat":
			grcCreate("short sailor shirt", "upper");
			grcCreate("sailor shorts", "lower");
			grcCreate("small sailor's hat", "head");
			V.gwylan.request.details.outfit = true;
			V.gwylan.request.special = "short sailor";
			break;
		case "foreign football shirt":
		case "foreign football shorts":
		case "foreign football helmet":
			grcCreate("foreign football shirt", "upper");
			grcCreate("foreign football shorts", "lower");
			grcCreate("foreign football helmet", "head");
			V.gwylan.request.details.outfit = true;
			V.gwylan.request.special = "football";
			break;
		case "cheerleading top":
		case "cheerleading skirt":
			grcCreate("cheerleading top", "upper");
			grcCreate("cheerleading skirt", "lower");
			if (extraItems) {
				grcCreate("cheerleader gloves", "hands");
				grcCreate("pom poms", "handheld");
			}
			V.gwylan.request.details.outfit = true;
			V.gwylan.request.special = "cheerleader";
			break;
		case "cowboy hat":
		case "cow print chaps":
			grcCreate("cow print chaps", "lower");
			grcCreate("cowboy hat", "head");
			V.gwylan.request.details.outfit = true;
			V.gwylan.request.special = "cowboy";
			break;
		case "bunny leotard":
		case "bunny ears":
			grcCreate("bunny leotard", "under_upper");
			grcCreate("bunny ears", "head");
			if (extraItems && !ignoreNeck) grcCreate("bunny collar", "neck");
			V.gwylan.request.details.outfit = true;
			V.gwylan.request.special = "bunny";
			// bnuuy
			break;
		case "catgirl bra":
		case "catgirl panties":
		case "kitty ears":
			grcCreate("catgirl bra", "under_upper");
			grcCreate("catgirl panties", "under_lower");
			grcCreate("kitty ears", "head");
			if (extraItems && !ignoreNeck) grcCreate("cat bell collar", "neck");
			V.gwylan.request.details.outfit = true;
			V.gwylan.request.special = "kitty";
			// ctuuy
			break;
		default:
			// Individual items
			grcCreate(roll.name, roll.slot);
			break;
	}
	return V.gwylan.request;
}

function gwylanRequestIngredients() {
	const seedrng = new PRNG(V.gwylan.requestSeed);
	V.gwylan.request.items ||= [];
	V.gwylan.request.details = {
		replacements: "n/a",
		difficulty: 0,
	};

	// Request difficulty
	let requestComplexity = seedrng.randomInt(1, 4);
	if (V.gwylan.requestCount >= 3) requestComplexity += 1;
	if (V.gwylan.requestCount >= 8) requestComplexity += 1;
	if (V.gwylan.requestCount >= 15) requestComplexity += 1;
	V.gwylan.request.timer = new DateTime(Time.date).addDays(requestComplexity).timeStamp;
	V.gwylan.request.details.difficulty = requestComplexity;
	const ingredientSlotCount = Math.ceil(1 + requestComplexity / 2);
	const ingredientBaseAmount = seedrng.randomInt(requestComplexity, requestComplexity + 3);

	// Scripted
	if (V.gwylan.request.special === "plums") {
		const plumsNeeded = ingredientBaseAmount * seedrng.randomInt(3, 5);
		V.gwylan.request.items.push({
			category: "tending",
			name: "plum",
			type: setup.foodstuff.plum.category,
			need: plumsNeeded,
			root: true,
		});
		return V.gwylan.request;
	}

	// Normal
	const canRequestSupermarketItems = requestComplexity < 6;

	const allowedForageDifficulties = [1];
	if (requestComplexity > 2) allowedForageDifficulties.push(2);
	if (requestComplexity > 4) allowedForageDifficulties.push(3);
	if (requestComplexity > 6) allowedForageDifficulties.push(4);

	const isSeasonEnding = [2, 5, 8, 11].includes(Time.month) && Time.monthDay > Time.lastDayOfMonth - 22;
	const nextSeason = Time.month > 11 || Time.month < 3 ? "spring" : Time.month > 8 ? "winter" : Time.month > 5 ? "autumn" : "summer";

	const ingredientWhitelist = [
		{ key: "apple", difficulty: 1 },
		{ key: "banana", difficulty: 1 },
		{ key: "bird_egg", difficulty: 1 },
		{ key: "blackberry", difficulty: 1 },
		{ key: "blood_lemon", difficulty: 2 },
		{ key: "carnation", difficulty: 1 },
		{ key: "cherry", difficulty: 1 },
		{ key: "daisy", difficulty: 1 },
		{ key: "date", difficulty: 1 },
		{ key: "ghostshroom", difficulty: 1 },
		{ key: "lemon", difficulty: 1 },
		{ key: "lily", difficulty: 1 },
		{ key: "lime", difficulty: 1 },
		{ key: "lotus", difficulty: 2 },
		{ key: "mushroom", difficulty: 1 },
		{ key: "orchid", difficulty: 2 },
		{ key: "peach", difficulty: 1 },
		{ key: "pear", difficulty: 1 },
		{ key: "plum", difficulty: 1 },
		{ key: "plumeria", difficulty: 1 },
		{ key: "poppy", difficulty: 2 },
		{ key: "red_rose", difficulty: 1 },
		{ key: "red_wine", difficulty: 1 },
		{ key: "salt", difficulty: 1 },
		{ key: "strange_flower", difficulty: 3 },
		{ key: "strawberry", difficulty: 1 },
		{ key: "sugar", difficulty: 1 },
		{ key: "truffle", difficulty: 4 },
		{ key: "tulip", difficulty: 1 },
		{ key: "vegetable_oil", difficulty: 1 },
		{ key: "white_rose", difficulty: 1 },
		{ key: "white_wine", difficulty: 1 },
		{ key: "wild_honeycomb", difficulty: 3 },
		{ key: "wolfshroom", difficulty: 1 },
	];
	const requiresSeeds = ["carnation", "daisy", "lotus", "plumeria", "poppy", "strange_flower", "white_rose"]; // items that can only be asked for if the player has their seeds due to remote location or no wild harvest

	const removeIngredient = ingredientKey => {
		const index = eligibleIngredientKeys.indexOf(ingredientKey);
		if (index !== -1) eligibleIngredientKeys.splice(index, 1);
	};

	// Remove ingredients that are too difficult
	const eligibleIngredientKeys = ingredientWhitelist.filter(entry => allowedForageDifficulties.includes(entry.difficulty)).map(entry => entry.key);

	// Remove ghostshrooms until the you are bffs with kylar
	if (!V.syndromekylar) {
		removeIngredient("ghostshroom");
	}

	// Let blood lemon get selected only within a week of the end of the month, and only on high-complexity requests.
	if (requestComplexity < 7 || Time.monthDay < Time.lastDayOfMonth - 7) {
		removeIngredient("blood_lemon");
	}

	// Remove woodland ingredients until the woodland upgrade is unlocked.
	if (!V.farm?.woodland || V.farm?.woodland < 2) {
		removeIngredient("strawberry");
		removeIngredient("plum");
		removeIngredient("peach");
		removeIngredient("truffle");
	}

	// Remove blackberry until the thicket project is complete.
	if (!V.town_projects?.thicket || V.town_projects?.thicket < 4) {
		removeIngredient("blackberry");
	}

	// Remove lotus until Mason's pond is fully unlocked.
	if (!V.mason_pond || V.mason_pond < 5) {
		removeIngredient("lotus");
	}

	// Remove honeycomb unless bees are enabled.
	if (V.tending < 800 || !(V.settings.bestialityEnabled && V.settings.beesEnabled)) {
		removeIngredient("wild_honeycomb");
	}

	if (V.tending < 300) {
		removeIngredient("orchid");
		removeIngredient("wolfshroom");
	}

	for (const ingredientKey of [...eligibleIngredientKeys]) {
		// PC must have the seeds for these plants
		if (requiresSeeds.includes(ingredientKey) && !V.plants_known.includes(ingredientKey)) {
			removeIngredient(ingredientKey);
			continue;
		}

		// Seed-only items must be in-season. If there is no season, then that means it can't be grown, but is still able to be found throuougt the world regardless of season.
		if (
			requiresSeeds.includes(ingredientKey) &&
			setup.foodstuff[ingredientKey].tending?.seasons &&
			!setup.foodstuff[ingredientKey].tending.seasons.includes(Time.season)
		) {
			removeIngredient(ingredientKey);
			continue;
		}

		// Near season end, seed-only items must also be available next season
		if (
			requiresSeeds.includes(ingredientKey) &&
			isSeasonEnding &&
			setup.foodstuff[ingredientKey].tending?.seasons &&
			!setup.foodstuff[ingredientKey].tending.seasons.includes(nextSeason)
		) {
			removeIngredient(ingredientKey);
			continue;
		}

		// Supermarket items are only available on lower-complexity requests
		if (setup.foodstuff[ingredientKey].shop?.available_in?.includes("supermarket") && !canRequestSupermarketItems) {
			removeIngredient(ingredientKey);
			continue;
		}
	}

	for (let ingredientIndex = 0; ingredientIndex < ingredientSlotCount; ingredientIndex++) {
		const ingredientKey = eligibleIngredientKeys.pluck();
		const setupItem = clone(setup.foodstuff[ingredientKey]);
		if (!eligibleIngredientKeys.length) {
			if (!V.gwylan.request.items.length) {
				Errors.report(`[gwylanRequestClothes]: No available tending items found for request!! Defaulting to wolfshrooms.`, {
					Stacktrace: Utils.GetStack(),
					roll: ingredientKey,
				});
				V.gwylan.request.items.push({ category: "tending", name: "wolfshroom", type: "mushroom", need: 3, root: true });
			}
			break;
		}

		const requestItem = {
			category: "tending",
			name: ingredientKey,
			type: setupItem.category,
			need: 1,
		};
		if (setupItem.shop.available_in?.includes("supermarket")) {
			const supermarketMaxNeed = Math.trunc(3000 / setup.foodstuff[ingredientKey].shop.sell_price); // supermarket items are set to this every week, so ensure it can't take more than 1 week to complete request
			const yieldMultiplier = setupItem.tending?.yield_multiplier ?? 1;
			requestItem.need = Math.clamp(Math.ceil(ingredientBaseAmount * random(yieldMultiplier, yieldMultiplier + 2)), 1, supermarketMaxNeed);
		} else if (setupItem.name === "wild honeycomb") {
			requestItem.need = Math.min(requestItem.need, 3);
		} else if (setupItem.name === "blood lemon") {
			requestItem.need = Math.min(requestItem.need, 6); // Ensure that it only takes one succesfull pick to complete the blood lemon request. The 6 comes from the min number of blood lemons you can harvest in one succesful attempt.
		} else {
			const yieldMultiplier = setupItem.tending?.yield_multiplier ?? 1;
			requestItem.need = ingredientBaseAmount * random(yieldMultiplier, yieldMultiplier + 2);
		}
		if (!V.gwylan.request.items.some(thing => thing.root)) requestItem.root = true;
		V.gwylan.request.items.push(requestItem);
	}
}
window.gwylanRequestIngredients = gwylanRequestIngredients;

function gwylanRequestSample(override) {
	const seedrng = new PRNG(V.gwylan.requestSeed);
	V.gwylan.request.items ||= [];
	V.gwylan.request.details = {
		replacements: "n/a",
		difficulty: 0,
	};

	// request difficulty
	let complexity = seedrng.randomInt(1, 3);
	if (V.gwylan.requestCount >= 3) complexity += 1;
	if (V.gwylan.requestCount >= 8) complexity += 1;
	if (V.gwylan.requestCount >= 15) complexity += 1;
	if (V.gwylan.requestCount >= 30) complexity += 1;
	if (!V.settings.bestialityEnabled && V.settings.monsterHallucinationsOnly) complexity += 3;
	if (!V.settings.plantsEnabled) complexity += 3;
	V.gwylan.request.timer = new DateTime(Time.date).addDays(complexity).timeStamp;
	V.gwylan.request.details.difficulty = complexity;
	const sampleCount = complexity;

	for (let samples = 0; samples < sampleCount; samples++) {
		const availableSpecies = [["human", 2]];
		if (V.settings.bestialityEnabled && complexity > 3) {
			availableSpecies.push(["wolf", 2], ["fox", 2], ["cat", 1], ["lizard", 1], ["dog", 1]);
			if (complexity > 4) availableSpecies.push(["dolphin", 1]);
			if (complexity > 5) availableSpecies.push(["boar", 1]);
			if (complexity > 6) availableSpecies.push(["bear", 1]);
		}
		if (V.settings.plantsEnabled && complexity > 6) availableSpecies.push(["plant", 3]);

		availableSpecies.forEach(chance => {
			if (["human", "wolf", "fox", "cat", "dog"].includes(chance[0])) {
				// bias towards repetition, but less as complexity increases
				chance[1] += V.gwylan.request.items.find(item => item.name === chance[0])?.need * (20 - complexity) || 0;
			} else if (["plant"].includes(chance[0]) && V.settings.tentaclesEnabled) {
				// heavy repetition bias. if chosen first, very likely to be single group
				chance[1] += V.gwylan.request.items.find(item => item.name === chance[0])?.need * 60 || 0;
			} else if (["bear", "boar", "lizard"].includes(chance[0])) {
				// bias against repetition
				chance[1] -= V.gwylan.request.items.find(item => item.name === chance[0])?.need || 0;
			}
		});

		let chosenSpecies = override || weightedRandom(...availableSpecies, seedrng);
		if (!availableSpecies.some(species => species[0] === chosenSpecies)) {
			Errors.report(`[gwylanRequestSample]: Invalid species selected! Defaulting to human.`, {
				Stacktrace: Utils.GetStack(),
				chosenSpecies,
			});
			chosenSpecies = "human";
		}

		if (V.gwylan.request.items.some(item => item.name === chosenSpecies)) {
			V.gwylan.request.items.find(item => item.name === chosenSpecies).need++;
		} else {
			V.gwylan.request.items.push({ category: "sample", name: chosenSpecies, type: "any", need: 1, have: 0 });
		}
	}
}

function canCollectSamples() {
	// Check broadly if sample collection is possible
	if (!V.gwylan?.request?.event) return false;
	if (!V.gwylan.request.items?.some(item => item.category === "sample")) return false;
	if (V.statFreeze) return false;
	if (pcAreArmsBound("both")) {
		return "bound";
	}
	return true;
}
window.canCollectSamples = canCollectSamples;

/**
 * @param {string} species enemy type to collect sample from
 * @param {string | null} modifier check
 */
function canCollectSampleSingle(species, modifier = null) {
	// Check individual type to see if they have a matching sample type needed for event
	if (!V.gwylan?.request?.event) return false;
	if (!V.gwylan.request.items?.some(item => item.category === "sample")) return false;

	// IMPORTANT: For any non-standard beast type monsterperson names, like "harpy", special case needed.
	// 'wolfboy', 'foxgirl', etc work fine as-is
	let speciesCorrected = clone(species);
	if (species === "harpy") speciesCorrected = "hawk";
	if (species === "human" && V.npc.includes("Ivory Wraith")) return false; // no bustin

	if (!speciesCorrected) {
		Errors.report(`[canCollectSampleSingle]: speciesCorrected is undefined! Defaulting to human.`, {
			Stacktrace: Utils.GetStack(),
			speciesCorrected,
		});
		speciesCorrected = "human";
	}
	const hasNeededSample = V.gwylan.request.items?.some(item => item.category === "sample" && speciesCorrected.includes(item.name));

	return hasNeededSample;
}
window.canCollectSampleSingle = canCollectSampleSingle;

/**
 * @param {string} species enemy type to collect sample from
 * @param {number} amount
 */
function collectSample(species, amount = 1) {
	if (!species) return;
	if (!V.gwylan?.request.event) return;
	if (typeof amount !== "number") return;

	// IMPORTANT: For any non-standard beast type monsterperson names, like "harpy", special case needed.
	// 'wolfboy', 'foxgirl', etc work fine as-is
	let speciesCorrected = clone(species);
	if (species === "harpy") speciesCorrected = "hawk";
	const sample = V.gwylan.request.items?.find(item => item.category === "sample" && speciesCorrected.includes(item.name));
	if (!sample || sample.have >= sample.need) return;
	const amountCorrected = sample.have + amount > sample.need ? sample.need - sample.have : amount;
	sample.have += amountCorrected;
	return amountCorrected;
}
window.collectSample = collectSample;

function gwylanRequestClothingSlotCheck(slot) {
	if (!V.gwylan?.request.event || !slot) return false;

	if (slot === "neck" && V.worn.neck.name === "familiar collar" && V.worn.neck.cursed === 1) return true;

	return V.gwylan.request.items.some(
		thing =>
			thing.category === "clothing" &&
			V.worn[slot].name === thing.name &&
			(thing.slot !== "upper" || (V.worn[slot].one_piece === 1 && V.worn.lower.name !== "naked") || V.worn[slot].one_piece === 0) &&
			(thing.colour_requirement === "any" ||
				V.worn[slot].colour === thing.colour_requirement ||
				window.clothesColour(V.worn[slot]) === thing.colour_requirement) &&
			(thing.acc_colour_requirement === "any" || V.worn[slot].accessory_colour === thing.acc_colour_requirement) &&
			(thing.pattern_requirement === "any" || V.worn[slot].pattern === thing.pattern_requirement) &&
			(thing.integrity_requirement === "any" ||
				(thing.integrity_word === "full" && V.worn[slot].integrity >= thing.integrity_max * 0.9) ||
				(thing.integrity_word === "frayed" && between(V.worn[slot].integrity, thing.integrity_max * 0.5, thing.integrity_max * 0.9)) ||
				(thing.integrity_word === "torn" && between(V.worn[slot].integrity, thing.integrity_max * 0.2, thing.integrity_max * 0.5)) ||
				(thing.integrity_word === "tattered" && V.worn[slot].integrity <= thing.integrity_max * 0.2))
	);
}
window.gwylanRequestClothingSlotCheck = gwylanRequestClothingSlotCheck;

function gwylanRequestMet() {
	if (!V.gwylan?.request.event) return false;

	switch (V.gwylan.request.event) {
		case "clothing":
			return V.gwylan.request.items?.every(item => gwylanRequestClothingSlotCheck(item.slot));
		case "ingredients":
			return V.gwylan.request.items?.every(item => V.foodstuff[item.name]?.amount >= item.need);
		case "sample":
			return V.gwylan.request.items?.every(item => item.have >= item.need);
		case "recipe":
			return V.gwylan.request.items?.every(
				item =>
					(item.category === "clothing" && gwylanRequestClothingSlotCheck(item.slot)) ||
					(item.category === "tending" && V.foodstuff[item.name]?.amount >= item.need) ||
					(item.category === "sample" && item.have >= item.need)
			);
		case "chastity":
			return (
				!playerChastity() ||
				V.gwylan.request.items?.every(
					item =>
						(item.category === "clothing" && gwylanRequestClothingSlotCheck(item.slot)) ||
						(item.category === "tending" && V.foodstuff[item.name]?.amount >= item.need)
				)
			);
		default:
			return false;
	}
}
window.gwylanRequestMet = gwylanRequestMet;

/**
 * @param {"beast" | "sex" | "any"} ritual which event to check requirements for
 */
function gwylanCanForceRitual(ritual = "any") {
	if (ritual === "beast") return !Time.isBloodMoon() && Time.hour > 8 && (V.settings.bestialityEnabled || V.settings.monsterChance >= 100);
	return false;
}
window.gwylanCanForceRitual = gwylanCanForceRitual;

function gwylanCanRescueFromWraith() {
	if (V.gwylanRescue?.seen?.includes("Wraith")) {
		return (
			C.npc.Gwylan.init === 1 &&
			C.npc.Gwylan.state === "active" &&
			(V.gwylanSeen?.includes("partners") || (V.gwylanSeen?.includes("yearning") && C.npc.Gwylan.dom >= 50))
		);
	} else {
		return (
			C.npc.Gwylan.init === 1 &&
			C.npc.Gwylan.state === "active" &&
			V.gwylanSeen?.includes("ritual_sex") &&
			V.wraith?.seen >= 1 &&
			V.wraith?.possessCount >= 1
		);
	}
}
window.gwylanCanRescueFromWraith = gwylanCanRescueFromWraith;

function isGwylanAbsent() {
	if (V.gwylan?.timer?.nobody >= Time.date.timeStamp) return "nobody";
	if (!["active", "scorned"].includes(C.npc.Gwylan.state)) return "absent";
	return false;
}
window.isGwylanAbsent = isGwylanAbsent;

function gwylanHypnoMax(param = "trait", level = V.hypnosis_traits.devotion) {
	if (param === "value") {
		switch (level) {
			case 1:
				return 15;
			case 2:
				return 35;
			case 3:
				return 55;
			case 4:
				return 75;
			case 5:
				return 95;
			case 6:
				return 100;
			default:
				return 0;
		}
	} else if (param === "level") {
		if (level <= 15) return 1;
		if (level <= 35) return 2;
		if (level <= 55) return 3;
		if (level <= 75) return 4;
		if (level <= 95) return 5;
		return 6;
	} else {
		if (V.gwylanSeen.includes("forever")) return 6;
		if (V.gwylanSeen.includes("hypnosis_deepest")) return 5;
		if (V.gwylanSeen.includes("yearning")) return 4;
		if (V.gwylanSeen.includes("ritual_beast")) return 3;
		return 2;
	}
}
window.gwylanHypnoMax = gwylanHypnoMax;

function gwylanForestRescueRange() {
	if (!V.gwylanSeen?.includes("ritual_sex")) return 25;
	if (V.worn.neck.name === "familiar collar" && V.worn.neck.cursed === 1) return 100;
	if (V.fox >= 6) return 50;
	return 25;
}
window.gwylanForestRescueRange = gwylanForestRescueRange;
