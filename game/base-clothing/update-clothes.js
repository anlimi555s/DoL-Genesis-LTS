/**
 * Used for making clothes colour customisable.
 * Structured in such a way that primary and accessory colours
 * can be updated separately without affecting the other, if applicable.
 * This function should be updated whenever a new clothing item
 * is made colour customisable with the clothing item in question.
 * Colours should be specifically chosen based on whatever best matches the original.
 *
 * @param {object} item clothes item object
 * @param {object} itemRef item prototype from setup
 */
function updateClothingColours(item, itemRef) {
	switch (item.name) {
		case "swimming goggles":
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "white";
			break;
		case "winter jacket":
			if (item.colour === 0) item.colour = "black";
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "tan";
			break;
		// eslint-disable-next-line no-fallthrough
		case "long leather gloves":
		case "leather dress":
		case "round shades":
		case "witch shoes":
		case "mesh shirt":
		case "fishnet stockings":
		case "fishnet tights":
		case "combat boots":
			if (!item.colour || item.colour === 0) item.colour = "black";
			break;
		case "square shades":
		case "shield shades":
		case "punk shades":
			if (!item.colour || item.colour === 0) item.colour = "black";
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "black";
			break;
		case "aviators":
			if (!item.colour || item.colour === 0) item.colour = "grey";
			if (!item.accessory_colour || item.accessory_colour === 0 || item.accessory_colour === "original") item.accessory_colour = "black";
			break;
		case "glasses":
			if (!item.colour || item.colour === 0) item.colour = "silver";
			break;
		case "checkered shirt":
			if (!item.colour || item.colour === 0) item.colour = "russet";
			break;
		case "lace choker":
			if (!item.colour || item.colour === 0) item.colour = "black";
			break;
		case "school shirt":
			if (!item.accessory_colour || item.accessory_colour === 0) {
				item.accessory_colour = "light blue";
				item.accessory_colour_combat = "light blue";
			}
			break;
		case "brown leather jacket":
			if (!item.colour || item.colour === 0) item.colour = "brown";
			break;
		case "love locket":
			if (!item.colour || item.colour === 0) item.colour = "bronze";
			break;
		case "black leather jacket":
			if (!item.colour || item.colour === 0) item.colour = "black";
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "silver";
			break;
		case "overall bottoms":
		case "overalls":
			if (!item.colour || item.colour === 0 || item.colour === "original") item.colour = "denim";
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "gold";
			break;
		case "jean miniskirt":
		case "booty jorts":
		case "denim shorts":
		case "jeans":
			if (!item.colour || item.colour === 0 || item.colour === "original") item.colour = "denim";
			break;
		case "loose socks":
			if (!item.colour || item.colour === 0) item.colour = "white";
			break;
		case "cowboy hat":
			if (item.colour === 0) item.colour = "sand";
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "black";
			break;
		case "ballgown":
		case "ballgown skirt":
		case "short ballgown":
		case "short ballgown skirt":
		case "school swim shorts":
		case "futuristic bodysuit":
		case "argyle sweater vest":
		case "diving suit":
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = item.colour;
			if (item.colourCustom) item.accessory_colourCustom = item.colourCustom;
			break;
		case "karate jacket":
			if (!item.colour || item.colour === 0) item.colour = "white";
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "red";
			break;
		case "karate trousers":
			if (!item.colour || item.colour === 0) item.colour = "white";
			break;
		case "gingham dress":
		case "gingham skirt":
		case "patterned dress":
		case "patterned skirt":
			if (!item.pattern || item.pattern === 0) item.pattern = "gingham";
			if (!item.accessory_colour || item.accessory_colour === 0) {
				item.accessory_colour = item.colour;
				item.colour = "white";
			}
			break;
		case "animal slippers":
		case "bunny slippers":
			if (!item.pattern || item.pattern === 0) item.pattern = "bunny";
			break;
		case "plastic nurse skirt":
		case "plastic nurse dress":
		case "plastic nurse hat":
		case "pink nurse skirt":
		case "pink nurse dress":
		case "pink nurse hat":
		case "nurse skirt":
		case "nurse dress":
		case "nurse hat":
		case "nurse socks":
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "red";
			if (!item.colour || item.colour === 0) item.colour = item.name === "nurse socks" ? "red" : "hospital pink";
			if ((!item.pattern || item.pattern === 0) && ["upper", "lower"].includes(itemRef.slot)) item.pattern = "zipper";
			break;
		case "witch hat":
			if (!item.pattern || item.pattern === 0) item.pattern = "buckle";
			break;
		case "evening gown":
		case "evening gown skirt":
			if (!item.pattern || item.pattern === 0) item.pattern = "ombre";
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = item.colour;
			break;
		case "bunny collar":
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "red";
			if (!item.colour || item.colour === 0) item.colour = "white";
			break;
		case "cat bell collar":
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "gold";
			if (!item.colour || item.colour === 0) item.colour = "black";
			break;
		case "cow bell":
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "gold";
			if (!item.colour || item.colour === 0) item.colour = "black";
			break;
		case "cow onesie":
		case "cow onesie hood":
		case "cow onesie bottoms":
		case "cow sleeves":
		case "cow socks":
		case "cow panties":
		case "cow bra":
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "black";
			break;
		case "heart choker":
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "red";
			if (!item.colour || item.colour === 0) item.colour = "black";
			break;
		case "sexy nun's ornate veil":
		case "cargo pants":
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "silver";
			break;
		case "racing helmet":
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = item.colour;
			if (!item.pattern || item.pattern === 0) item.pattern = "goggles";
			break;
		case "riding helmet":
			if (!item.colour || item.colour === 0) item.colour = "black";
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "black";
			if (!item.pattern || item.pattern === 0) item.pattern = "strap";
			break;
		case "classic gothic gown":
		case "classic gothic skirt":
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = item.colour;
			break;
		case "shadbelly coat":
			if (!item.colour || item.colour === 0) item.colour = "black";
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "yellow";
			if (!item.pattern || item.pattern === 0) item.pattern = "shirt";
			break;
		case "cheerleading top":
		case "cheerleading skirt":
		case "gym bloomers":
		case "cheerleader gloves":
		case "pom poms":
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "white";
			break;
		case "tam o' shanter":
			if (!item.colour || item.colour === 0) item.colour = "green";
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "red";
			if (!item.pattern || item.pattern === 0) item.pattern = "pompom";
			break;
		case "cowboy chaps":
		case "cowboy print chaps":
			if (!item.colour || item.colour === 0) item.colour = "denim";
			break;
		case "hairpin":
			if (!item.colour || item.colour === 0) item.colour = "white";
			if (!item.accessory_colour || item.accessory_colour === 0) item.accessory_colour = "white";
			break;
		default:
			if ((item.colour === 0 || !item.colour) && itemRef.colour_options?.length) item.colour = itemRef.colour_options[0];
			if ((item.pattern === 0 || !item.pattern) && itemRef.pattern_options?.length) item.pattern = itemRef.pattern_options[0];
			if ((item.accessory_colour === 0 || !item.accessory_colour) && itemRef.accessory_colour_options?.length)
				item.accessory_colour = itemRef.accessory_colour_options[0];
	}
}

// these constants should be available within the scope of these next 2 functions
const skip = [
	"integrity",
	"integrity_max",
	"colour",
	"accessory_colour",
	"pattern",
	"exposed",
	"vagina_exposed",
	"anus_exposed",
	"anal_shield",
	"one_piece",
	"skirt_down",
	"state",
	"state_top",
	"name_cap",
	"iconFile",
	"accIcon",
	"notuck",
	"skirt",
	"description",
	"colour_options",
	"accessory_colour_options",
	"pattern_options",
	"fabric_strength",
	"integrity_max",
	"bustresize",
	"sleeve_img",
	"breast_img",
	"exposed_base",
	"vagina_exposed_base",
	"anus_exposed_base",
	"state_top_base",
	"state_base",
	"word",
	"femininity",
	"strap",
	"cost",
	"shop",
	"cursed",
	"collared",
	"location",
];
const remapColours = {
	"light-pink": "light pink",
	"blue-steel": "blue steel",
};
// .variable must be the same across all outfit pieces, correct wrongly assigned props here
const remapVariables = {
	vintageskirt: "vintageskirtsuit",
	vintagepants: "vintagepantsuit",
	"chain tunic skirt": "chain tunic",
};

/**
 * Updates a single clothes object
 *
 * @param {string} slot equip slot
 * @param {object} item clothes item object
 * @param {boolean} debug print old and new object to the console
 */
function updateClothesItem(slot, item, debug) {
	if (!item) return; // might be old save that didn't have a new slot
	if (item.temp) return; // temp items are not meant to be proper clothes
	if (Object.keys(remapVariables).includes(item.variable)) item.variable = remapVariables[item.variable];
	const itemOld = clone(item);
	// transfer new properties from itemRef to the item
	const itemRef = setup.clothes[slot][clothesIndex(slot, item)];
	for (const key in itemRef) {
		// don't clone skipped keys onto the item
		if (skip.includes(key)) continue;
		// migrate some properties only if they are not already on the item
		if (["hoodposition", "altposition"].includes(key) && item[key]) continue;
		if (key === "outfitPrimary") {
			if (itemRef.outfitPrimary !== undefined) {
				if (item.outfitPrimary === undefined) item.outfitPrimary = clone(itemRef.outfitPrimary);
				for (const k in itemRef.outfitPrimary) {
					// if one_piece is broken, everything is broken
					if (item.one_piece === "broken" || item.one_piece === "split") item.outfitPrimary[k] = item.one_piece;
					else if (k === "head" && item.hoodposition === "down") delete item.outfitPrimary[k];
					// if an item is still in one piece, it's safe to regenerate it's value from itemRef
					else if (item.outfitPrimary[k] !== "broken" && item.outfitPrimary[k] !== "split") item.outfitPrimary[k] = clone(itemRef.outfitPrimary[k]);
				}
			}
			continue;
		}
		if (key === "outfitSecondary") {
			if (itemRef[key] !== undefined) {
				if (item[key] === undefined) item[key] = clone(itemRef[key]);
				if (item.one_piece === "broken" || item.one_piece === "split") item[key][1] = item.one_piece;
				// Fix both items in outfitSecondary array being "split" or "broken" when key index 0 should still be the slot of the matched item
				if (["broken", "split"].includes(item[key][0]) && item[key][0] === item[key][1]) item[key][0] = clone(itemRef[key][0]);
			}
			continue;
		}
		if (item.variable === "schoolcardigan" && item.name !== itemRef.name) {
			const colour = item.colour;
			item.name = itemRef.name;
			item.name_cap = itemRef.name_cap;
			item.colour = item.accessory_colour;
			item.accessory_colour = colour;
		}
		item[key] = clone(itemRef[key]);
	}
	item.index = itemRef.index;
	item.colour = remapColours[item.colour] || item.colour;
	item.accessory_colour = remapColours[item.accessory_colour] || item.accessory_colour;
	item.pattern = remapColours[item.pattern] || item.pattern;
	if (
		((!item.colour || item.colour === 0 || item.colour === "original") && itemRef.colour_options.length > 0) ||
		((!item.accessory_colour || item.accessory_colour === 0) && itemRef.accessory_colour_options?.length > 0) ||
		((!item.pattern || item.pattern === 0) && itemRef.pattern_options?.length > 0)
	) {
		updateClothingColours(item, itemRef);
	}

	// one_piece fix for items that shouldn't have it set
	if (["school pinafore", "plaid school pinafore"].includes(item.name) && item.one_piece === 1) item.one_piece = 0;

	// one_piece fix for items that should have it set
	if ((item.outfitPrimary || item.outfitSecondary) && item.one_piece === 0) item.one_piece = 1;

	// Clothing warmth
	if (item.warmth !== itemRef.warmth) item.warmth = itemRef.warmth;

	// Fix for 0.2.21.x issue
	if (item.colour_combat !== undefined && itemRef.colour_options.length === 0) item.colour = 0;
	if (item.accessory_colour_combat !== undefined && itemRef.colour_options.length === 0) item.accessory_colour = 0;
	// end of fix
	if (slot === "genitals") return;

	// put renamed clothes and updated types here
	if (item.type.includes("covered")) {
		switch (item.slot) {
			case "under_upper":
				item.type.splice(item.type.indexOf("covered"), 1, "torso_covering");
				break;
			case "under_lower":
				item.type.splice(item.type.indexOf("covered"), 1, "lower_covering");
				break;
			case "lower":
				item.type.splice(item.type.indexOf("covered"), 1, "overalls");
				break;
			case "face":
				item.type.splice(item.type.indexOf("covered"), 1, "face_covering");
				break;
		}
	}

	switch (item.name) {
		case "Crop top":
			item.name = "crop top";
			break;
		case "overalls":
			if (slot === "lower") item.name = "overall bottoms";
			else if (item.outfitPrimary.lower === "overalls") item.outfitPrimary.lower = "overall bottoms";
			break;
		case "sleeveless jingle-bell dress":
			if (item.outfitPrimary.lower === "jingle-bell skirt") item.outfitPrimary.lower = "sleeveless jingle-bell skirt";
			break;
		case "Rib-knit ankle socks":
			item.name = "rib-knit ankle socks";
			break;
		case "Striped kneehighs":
			item.name = "striped kneehighs";
			break;
		case "brown leather jacket":
			item.name = "leather jacket";
			item.name_cap = "Leather jacket";
			break;
		case "black leather jacket":
			item.name = "punk leather jacket";
			item.name_cap = "Punk leather jacket";
			break;
		case "swim shirt":
			item.type = ["swim", "school", "chest_bind", "constricting", "torso_covering"];
			break;
		case "undershirt":
		case "long johns":
			item.type = ["normal", "lower_covering"];
			break;
		case "unitard bottom":
		case "leotard bottom":
		case "unitard":
		case "leotard":
		case "turtleneck leotard":
		case "skimpy leotard":
			item.type = ["dance", "torso_covering"];
			break;
		case "turtleneck leotard bottom":
		case "skimpy leotard bottom":
			item.type = ["dance"];
			break;
		case "sports bra":
			item.type = ["normal", "athletic", "torso_covering"];
			break;
		case "witch dress":
		case "scarecrow shirt":
		case "rag skirt":
		case "skeleton outfit":
		case "pom poms":
		case "futuristic bodysuit":
		case "witch skirt":
		case "scarecrow skirt":
		case "futuristic bodysuit pants":
		case "skeleton bottoms":
		case "cheerleader gloves":
			item.type = ["costume"];
			break;
		case "rag top":
		case "vampire jacket":
			item.type = ["costume", "bellyShow"];
			break;
		case "classy vampire jacket":
			item.type = ["costume", "formal"];
			break;
		case "skeleton mask":
			item.type = ["costume", "mask"];
			break;
		case "riding helmet":
		case "racing helmet":
			item.type = ["costume", "riding"];
			break;
		case "scout shorts":
		case "baseball cap":
			item.type = ["normal"];
			break;
		case "purse":
		case "backpack":
		case "messenger bag":
		case "heart purse":
			item.type = ["school", "bookbag"];
			break;
		case "boy's gym socks":
		case "girl's gym socks":
			item.type = ["school", "athletic"];
			break;
		case "padded football shirt":
			item.name = "foreign football shirt";
			item.name_cap = "Foreign football shirt";
			break;
		case "football shorts":
			item.name = item.index === 53 ? "foreign football shorts" : "football shorts";
			item.name_cap = item.index === 53 ? "Foreign football shorts" : "Football shorts";
			break;
		case "football helmet":
			item.name = "foreign football helmet";
			item.name_cap = "Foreign football helmet";
			item.type = ["costume"];
			break;
		case "soccer shorts":
			item.name = "football shorts";
			item.name_cap = "Football shorts";
			break;
		case "soccer shirt":
			item.name = "football shirt";
			item.name_cap = "Football shirt";
			break;
		case "kittycat hat":
			item.name_cap = "Kittycat hat";
			break;
		case "doggy muzzle":
			item.name_cap = "Doggy muzzle";
			break;
		case "gingham dress":
			item.name = "patterned dress";
			item.name_cap = "Patterned dress";
			break;
		case "gingham skirt":
			item.name = "patterned skirt";
			item.name_cap = "Patterned skirt";
			break;
		case "sarong":
			item.type = ["naked"];
			break;
		case "pencil skirt":
			item.name = "pencil miniskirt";
			item.name_cap = "Pencil miniskirt";
			break;
		case "bunny slippers":
			item.name = "animal slippers";
			item.name_cap = "Animal slippers";
			break;
		case "pink nurse dress":
			item.name = "nurse dress";
			item.name_cap = "Nurse dress";
			break;
		case "pink nurse skirt":
			item.name = "nurse skirt";
			item.name_cap = "Nurse skirt";
			break;
		case "pink nurse hat":
			item.name = "nurse hat";
			item.name_cap = "Nurse hat";
			break;
		case "leather miniskirt":
			item.one_piece = 0;
			item.type.pushUnique("waterproof");
			break;
		case "school skirt":
			if (item.variable === "schoolskirt2") {
				item.name = "simple school skirt";
				item.name_cap = "Simple school skirt";
			}
			break;
		case "catsuit":
		case "catsuit bottoms":
		case "cropped leather jacket":
		case "leather crop top":
		case "leather dress":
		case "leather jacket":
		case "leather leggings":
		case "leather pants":
		case "leather shorts":
		case "leather skirt":
		case "leather top":
		case "lederhosen bottoms":
		case "plastic nurse dress":
		case "plastic nurse skirt":
		case "puffer jacket":
		case "punk leather jacket":
		case "zipped leather crop top":
		case "zipped leather top":
			item.type.pushUnique("waterproof");
			break;
		case "starry witch hat":
			item.accessory = 0;
			break;
		case "slacks":
			item.type = ["formal", "school"];
	}

	if (debug) console.log("updateClothesItem:", slot, itemOld, clone(item));
}

function updateClothes() {
	for (const slot of setup.clothes_all_slots) {
		/* === $worn section === */
		const worn = V.worn[slot];
		updateClothesItem(slot, worn);

		/* === $carried section === */
		const carried = V.carried[slot];
		updateClothesItem(slot, carried);

		/* === $wardrobes section === */

		// Check for empty wardrobe items - and remove them
		Object.keys(V.wardrobe).forEach(key => {
			if (Array.isArray(V.wardrobe[key])) {
				V.wardrobe[key] = V.wardrobe[key].filter(item => item !== undefined && item !== null && item !== "");
			}
		});

		if (V.wardrobe[slot]) {
			for (const item of V.wardrobe[slot]) updateClothesItem(slot, item);
		}
		if (V.wardrobes !== undefined) {
			for (const wardrobe in V.wardrobes) {
				if (wardrobe === "wardrobe" || wardrobe === "shopReturn" || !V.wardrobes[wardrobe][slot]) continue;
				for (const item of V.wardrobes[wardrobe][slot]) updateClothesItem(slot, item);
			}
		}

		/* === $store section === */
		if (V.store !== undefined && V.store[slot]) {
			for (const item of V.store[slot]) updateClothesItem(slot, item);
		}

		/* === $outfit section === */
		for (const outfit of V.outfit) {
			switch (outfit[slot]) {
				case "Crop top":
					outfit[slot] = "crop top";
					break;
				case "overalls":
					if (slot === "lower") outfit[slot] = "overall bottoms";
					break;
				case "sleeveless jingle-bell dress":
					if (slot === "lower") outfit[slot] = "sleeveless jingle-bell skirt";
					break;
				case "pink nurse hat":
					outfit[slot] = "nurse hat";
					break;
			}
		}
	}
}
DefineMacro("updateClothes", updateClothes);

function wardrobesUpdate() {
	/* default wardrobe object */
	const defWardrobe = {
		face: [],
		feet: [],
		hands: [],
		handheld: [],
		head: [],
		legs: [],
		lower: [],
		neck: [],
		over_head: [],
		over_lower: [],
		over_upper: [],
		genitals: [],
		under_lower: [],
		under_upper: [],
		upper: [],
		unlocked: false,
		shopSend: false, // whether to allow sending or transferring clothes to location. the wardrobe MUST be isolated!!
		transfer: true, // whether to allow transfering clothes from location
		isolated: false, // whether the wardrobe has separate inventory from the default wardrobe
		locationRequirement: [],
		space: 5,
	};
	/* initialise multiple wardrobes. works for both old saves and new games */
	if (V.wardrobes === undefined) {
		V.wardrobes = {
			shopReturn: "wardrobe",
			wardrobe: {
				NOTE: "DO NOT USE THIS OBJECT TO STORE CLOTHES",
				unlocked: true,
				shopSend: true,
				transfer: true,
				name: "Orphanage",
			},
			changingRoom: clone(defWardrobe),
			edensCabin: clone(defWardrobe),
			asylum: clone(defWardrobe),
			alexFarm: clone(defWardrobe),
			stripClub: clone(defWardrobe),
			brothel: clone(defWardrobe),
			schoolBoys: clone(defWardrobe),
			schoolGirls: clone(defWardrobe),
			prison: clone(defWardrobe),
			avery_mansion: clone(defWardrobe),
		};
		/* beach */
		V.wardrobes.changingRoom.name = "Beach changing room";
		V.wardrobes.changingRoom.unlocked = true;
		/* eden's */
		V.wardrobes.edensCabin.name = "Eden's Cabin";
		V.wardrobes.edensCabin.isolated = true;
		V.wardrobes.edensCabin.space = 10;
		// allow sending clothes to the cabin when pc can leave for a day
		V.wardrobes.edensCabin.shopSend = V.edenfreedom >= 1;
		// allow transferring clothes from the cabin when pc can leave for a week
		V.wardrobes.edensCabin.transfer = V.edenfreedom >= 2;
		if (V.syndromeeden) V.wardrobes.edensCabin.unlocked = true;
		/* asylum */
		V.wardrobes.asylum.locationRequirement.push("asylum");
		V.wardrobes.asylum.name = "Asylum";
		V.wardrobes.asylum.transfer = false;
		V.wardrobes.asylum.isolated = true;
		/* alex's */
		V.wardrobes.alexFarm.name = "Alex's Farm";
		V.wardrobes.alexFarm.shopSend = true;
		V.wardrobes.alexFarm.isolated = true;
		V.wardrobes.alexFarm.space = 40;
		if (V.farm_stage >= 7) V.wardrobes.alexFarm.unlocked = true;
		/* strip club */
		V.wardrobes.stripClub.name = "Strip Club";
		V.wardrobes.stripClub.space = 10;
		if (V.stripclubdancingintro) V.wardrobes.stripClub.unlocked = true;
		/* brothel */
		V.wardrobes.brothel.name = "Brothel";
		V.wardrobes.brothel.space = 10;
		if (V.brotheljob) V.wardrobes.brothel.unlocked = true;
		/* school pool boys */
		V.wardrobes.schoolBoys.name = "Schools boy's locker";
		V.wardrobes.schoolBoys.unlocked = true;
		V.wardrobes.schoolBoys.under_lower.push(clone(setup.clothes.under_lower[7]));
		V.wardrobes.schoolBoys.under_lower.last().colour = "blue";
		/* school pool girls */
		V.wardrobes.schoolGirls.name = "Schools girl's locker";
		V.wardrobes.schoolGirls.unlocked = true;
		V.wardrobes.schoolGirls.under_lower.push(clone(setup.clothes.under_lower[6]));
		V.wardrobes.schoolGirls.under_lower.last().colour = "blue";
		V.wardrobes.schoolGirls.under_upper.push(clone(setup.clothes.under_upper[2]));
		V.wardrobes.schoolGirls.under_upper.last().colour = "blue";
		/* prison */
		V.wardrobes.prison.name = "Prison locker";
		V.wardrobes.prison.transfer = false;
		V.wardrobes.prison.isolated = true;
		/* mansion */
		V.wardrobes.avery_mansion.name = "Mansion Wardrobe";
		V.wardrobes.avery_mansion.transfer = true;
		V.wardrobes.avery_mansion.isolated = true;
		V.wardrobes.avery_mansion.shopSend = true;
		V.wardrobes.avery_mansion.space = 80;
		if (V.avery_mansion) V.wardrobes.avery_mansion.unlocked = true;
		V.wardrobes.avery_mansion.locationRequirement.push("avery_mansion", "alley");
		/* add .lastTaken prop to everything */
		if (V.worn !== undefined) Object.keys(V.worn).forEach(s => (V.worn[s].lastTaken = "wardrobe"));
		if (V.carried !== undefined) Object.keys(V.carried).forEach(s => (V.carried[s].lastTaken = "wardrobe"));
		if (V.store !== undefined) Object.keys(V.store).forEach(s => V.store[s].forEach(i => (i.lastTaken = "wardrobe")));
	}
	/* fix prison wardrobe name */
	if (V.wardrobes.prison.name === "Prison Locker") V.wardrobes.prison.name = "Prison locker";
	/* very old saves */
	if (V.objectVersion.wardrobes < 2) {
		for (const slot in setup.clothes_all_slots) {
			/* skip slots that didn't exist in old saves */
			if (V.wardrobe[slot] === undefined) continue;
			/* remove all temporary items */
			for (let j = V.wardrobe[slot].length - 1; j >= 0; j--) {
				if (V.wardrobe[slot][j].temp) V.wardrobe[slot].deleteAt(j);
			}
			for (let j = V.wardrobes.prison[slot].length - 1; j >= 0; j--) {
				if (V.wardrobes.prison[slot][j].temp) V.wardrobes.prison[slot].deleteAt(j);
			}
			for (let j = V.wardrobes.asylum[slot].length - 1; j >= 0; j--) {
				if (V.wardrobes.asylum[slot][j].temp) V.wardrobes.asylum[slot].deleteAt(j);
			}
		}
	}
	/* less old saves */
	if (V.objectVersion.wardrobes < 4) {
		/* remove unnecessary vars */
		window.clothesDataTrimmerLoop();
		/* add a slot for genitals to all wardrobes */
		if (V.wardrobe.genitals === undefined) V.wardrobe.genitals = [];
		for (const w in V.wardrobes) {
			if (w !== "wardrobe" && V.wardrobes[w].unlocked !== undefined && V.wardrobes[w].genitals === undefined) V.wardrobes[w].genitals = [];
		}
	}
	if (!V.wardrobes.temple) {
		V.wardrobes.temple = clone(defWardrobe);
		V.wardrobes.temple.unlocked = V.temple_rank === "monk";
		V.wardrobes.temple.space = 20;
	}
	if (!V.wardrobes.temple.name) {
		V.wardrobes.temple.name = "Temple";
	}
	if (!V.wardrobes.pirate) {
		V.wardrobes.pirate = clone(defWardrobe);
		V.wardrobes.pirate.unlocked = V.pirate_rank >= 0;
		V.wardrobes.pirate.space = 5;
	}
	if (!V.wardrobes.pirate.name) {
		V.wardrobes.pirate.name = "Pirate Ship";
	}
	if (V.objectVersion.wardrobes < 7) {
		Object.values(V.wardrobes).forEach(wardrobe => {
			if (wardrobe && Array.isArray(wardrobe.upper) && !wardrobe.handheld) wardrobe.handheld = [];
		});
	}

	if (!V.wardrobes.officeBuilding) {
		V.wardrobes.officeBuilding = clone(defWardrobe);
		V.wardrobes.officeBuilding.name = "Office agency changing room";
		V.wardrobes.officeBuilding.unlocked = V.officejobintro === 1;
		V.wardrobes.officeBuilding.space = 5;
	}

	if (!V.wardrobes.birdTower) {
		/* Great Hawk's tower */
		V.wardrobes.birdTower = clone(defWardrobe);
		V.wardrobes.birdTower.name = "Great Hawk's Tower";
		V.wardrobes.birdTower.unlocked = false;
		V.wardrobes.birdTower.isolated = true;
		V.wardrobes.birdTower.space = 15;
	}
	if (!V.wardrobes.birdTower.locationRequirement?.length) {
		V.wardrobes.birdTower.locationRequirement = ["tower", "moor"];
	}

	if (!V.wardrobes.prison.locationRequirement?.length) {
		V.wardrobes.prison.locationRequirement = ["prison"];
	}

	if (!V.wardrobes.avery_mansion) {
		V.wardrobes.avery_mansion = clone(defWardrobe);
		V.wardrobes.avery_mansion.name = "Mansion Wardrobe";
		V.wardrobes.avery_mansion.transfer = true;
		V.wardrobes.avery_mansion.isolated = true;
		V.wardrobes.avery_mansion.shopSend = true;
		V.wardrobes.avery_mansion.space = 80;
		V.wardrobes.avery_mansion.locationRequirement.push("avery_mansion");
	}
	if (V.avery_mansion) V.wardrobes.avery_mansion.unlocked = true;
	if (V.objectVersion.wardrobes < 16) {
		V.wardrobes.alexFarm.isolated = true;
		V.wardrobes.edensCabin.isolated = true;
		V.wardrobes.edensCabin.shopSend = V.edenfreedom >= 1;
		V.wardrobes.edensCabin.transfer = V.edenfreedom >= 2;
		V.wardrobes.wardrobe.transfer = true;
	}
	if (V.objectVersion.wardrobes < 17) {
		V.wardrobes.avery_mansion.locationRequirement.pushUnique("alley");
		/* remove broken temporary clothes creeped into main wardrobe */
		V.wardrobe.lower = V.wardrobe.lower.filter(s => !s.temp);
	}
}
DefineMacro("wardrobesUpdate", wardrobesUpdate);
