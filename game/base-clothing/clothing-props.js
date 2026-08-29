// @ts-check
/* globals PropSetup normaliseKey normaliseFileName */

/* additional, optional properties
	colour: string[], // array of colour options
	hasAccessory: boolean, // true if the prop has an acc image
	accColour: string[], // array of acc colour options, if the prop has an acc image

	zIndex: string, // layer the prop should use, from ZIndices. defaults to layering under the hold arm. larger sprites that cover the shoulder should use the "handheld_over_sleeve" zIndex.
	overUnderSplit: boolean, // true if the prop should have part of the image layering above the arm and part layering underneath it. typically used for large "clutch" items where the upper half needs to layer over the shoulders but the under half needs to layer under baggy sleeves
	overUnderAccSplit: boolean, // true if the prop should have part of the acc image layering above the arm and part layering underneath it.

	hasCoverImg: boolean, // true if the prop has a right_cover image, allowing the player to cover their nudity with the prop. most props do not need a cover sprite
	hasLevels: boolean, // for more complex props that change state depending on specific conditions (e.g. the fire of the torch prop changing in intensity based on V.catacombs_torch). add conditions to propLevels().
*/

/**
 * @param {string} prop
 */
function propLevels(prop) {
	switch (prop) {
		case "cards":
			// @ts-ignore
			return V.blackjack ? Math.clamp(V.blackjack.playersCards.length, 1, 5) : 0;
		case "torch":
			// @ts-ignore
			return [100, 80, 60, 40, 20, 1, 0].findIndex(x => V.catacombs_torch >= x) + 1 || 1;
		case "fabric_rope":
			// @ts-ignore
			return T.ropeLength || [7, 6, 4, 2, 1].findIndex(x => V.bird.rope >= x) + 1 || 1;
		default:
			Errors.report(`[prop]: No levels provided in propLevels()`);
	}
}
window.propLevels = propLevels;

/* primary prop colour may be specified in _args[1], secondary in _args[2]. if the item has colour or accColour options provided in setup, but no colour is specified, one will be randomised. otherwise, prop is assumed to be non-recolourable. */
function wearProp(prop, colour, accColour) {
	const key = normaliseKey(removeDiacritics(prop));
	const tendingItem = key.replace("_gift", "").replace("_basket", "");
	const tending = setup.foodstuff[tendingItem];
	const propErties = setup.props[key] ?? {};
	T.prop = Object.assign({}, setup.propDefaults, propErties, {
		name: normaliseFileName(key),
		colour: colour ?? (propErties.colour?.length ? propErties.colour.random() : false),
		accColour: accColour ?? (propErties.accColour?.length ? propErties.accColour.random() : false),
	});

	if (T.prop.hasLevels) T.prop.name += propLevels(key);

	if (key.startsWith("antique")) {
		T.prop.name = T.prop.name.replace(/^antique[_-]?/, "").trim();
		T.prop.folder = "antique";
	} else if (tending && !propErties.folder) {
		T.prop.folder = tending.prop_folder;
		if (["food", "drink"].includes(T.prop.folder)) T.prop.zIndex = "handheld_over_sleeve";
	}
	if (T.prop.overUnderSplit || T.prop.overUnderAccSplit) T.prop.zIndex = "handheld_over_sleeve";
	return T.prop;
}
window.wearProp = wearProp;
DefineMacro("wearProp", wearProp);

function initProps() {
	/** @type {PropSetup} */
	/* props only need to be added to setup if they differ from propDefaults (i.e. it belongs in a different folder, doesn't use the "right hold" arm position, or has a unique animation) or requires additional properties. */
	setup.propDefaults = {
		folder: "general",
		armPosition: "right_hold",
		animation: "idle",
		zIndex: "handheld",
	};

	/* antiques and tending objects are automatically assigned to the antique, food, and tending folders within <<wearProp>> */
	setup.props = {
		notebook_pen: {
			folder: "book",
			armPosition: "clutch",
		},
		clipboard_pen: {
			folder: "book",
			armPosition: "clutch",
		},
		english: {
			folder: "book",
		},
		history: {
			folder: "book",
		},
		maths: {
			folder: "book",
		},
		notebook: {
			folder: "book",
		},
		olive: {
			folder: "book",
		},
		open_english: {
			folder: "book",
		},
		open_history: {
			folder: "book",
		},
		open_maths: {
			folder: "book",
		},
		open_olive: {
			folder: "book",
		},
		open_scarlet: {
			folder: "book",
		},
		open_science: {
			folder: "book",
		},
		open_storybook: {
			folder: "book",
		},
		bible: {
			folder: "book",
		},
		open_bible: {
			folder: "book",
		},
		pamphlet: {
			folder: "book",
		},
		scarlet: {
			folder: "book",
		},
		science: {
			folder: "book",
		},
		baby_doll: {
			folder: "child toy",
		},
		car: {
			folder: "child toy",
		},
		chewy_ball: {
			folder: "child toy",
		},
		chewy_bone: {
			folder: "child toy",
			colour: ["white"],
		},
		chewy_rope: {
			folder: "child toy",
		},
		squeaky_chicken: {
			folder: "child toy",
		},
		squeaky_sheep: {
			folder: "child toy",
		},
		clown: {
			folder: "child toy",
		},
		dummy: {
			folder: "child toy",
		},
		mrs_teddy: {
			folder: "child toy",
		},
		mr_teddy: {
			folder: "child toy",
		},
		rattle: {
			folder: "child toy",
		},
		robot: {
			folder: "child toy",
			colour: ["green", "red"],
			hasAccessory: true,
		},
		teddy: {
			folder: "child toy",
		},
		advocaat: {
			folder: "drink",
		},
		autumn_ale: {
			folder: "drink",
		},
		beer_bottle: {
			folder: "drink",
		},
		beer_mug: {
			folder: "drink",
		},
		bourbon: {
			folder: "drink",
		},
		bottle_bag: {
			folder: "drink",
		},
		brandy: {
			folder: "drink",
		},
		champagne: {
			folder: "drink",
		},
		coconut: {
			folder: "drink",
		},
		drink_tray: {
			folder: "drink",
			zIndex: "handheld_over_sleeve",
		},
		fizzy_drink: {
			folder: "drink",
		},
		travel_cup_cider: {
			folder: "drink",
		},
		travel_cup: {
			folder: "drink",
		},
		coffee: {
			folder: "drink",
		},
		flask: {
			folder: "drink",
		},
		fruity_ale: {
			folder: "drink",
		},
		gin: {
			folder: "drink",
		},
		hot_cider: {
			folder: "drink",
		},
		hot_cocoa: {
			folder: "drink",
		},
		juice: {
			folder: "drink",
			colour: ["tangerine", "red", "wine", "white", "pale tangerine", "gold"],
			hasAccessory: true,
		},
		lemonade: {
			folder: "drink",
		},
		milkshake: {
			folder: "drink",
		},
		red_wine: {
			folder: "drink",
		},
		absinthe: {
			folder: "drink",
		},
		cider: {
			folder: "drink",
		},
		scotch: {
			folder: "drink",
		},
		white_wine: {
			folder: "drink",
		},
		mug: {
			folder: "drink",
		},
		purple_haze: {
			folder: "drink",
		},
		shandy: {
			folder: "drink",
		},
		shot: {
			folder: "drink",
		},
		soft_drink: {
			folder: "drink",
			colour: ["red", "blue"],
			hasAccessory: true,
		},
		solo_cup: {
			folder: "drink",
		},
		strawberry_lemonade: {
			folder: "drink",
		},
		strawberry_cocktail: {
			folder: "drink",
		},
		tea: {
			folder: "drink",
		},
		thermos_closed: {
			folder: "drink",
		},
		thermos_hot: {
			folder: "drink",
		},
		thermos_open: {
			folder: "drink",
		},
		water_bottle: {
			folder: "drink",
		},
		water_bottle_open: {
			folder: "drink",
		},
		whisky: {
			folder: "drink",
		},
		white_wine_bottle: {
			folder: "drink",
		},
		white_wine_bottle_open: {
			folder: "drink",
		},
		wine_bottle: {
			folder: "drink",
		},
		wine_bottle_open: {
			folder: "drink",
		},
		winter_ale: {
			folder: "drink",
		},
		bean_tin: {
			folder: "food",
		},
		apple_slice: {
			folder: "food",
		},
		choco_donut: {
			folder: "food",
		},
		chocolate_bar: {
			folder: "food",
		},
		cream_buns: {
			folder: "food",
		},
		crisps: {
			folder: "food",
			colour: ["yellow", "red", "blue"],
			hasAccessory: true,
		},
		custard_tin: {
			folder: "food",
		},
		gingerbread: {
			folder: "food",
		},
		ham_sandwich: {
			folder: "food",
		},
		nuts: {
			folder: "food",
		},
		omelette_cursed: {
			folder: "food",
			zIndex: "handheld_over_sleeve",
		},
		omelette_heart: {
			folder: "food",
			zIndex: "handheld_over_sleeve",
		},
		omelette_plain: {
			folder: "food",
			zIndex: "handheld_over_sleeve",
		},
		pancake_fork: {
			folder: "food",
		},
		pasta_fork: {
			folder: "food",
		},
		pasty: {
			folder: "food",
		},
		popcorn: {
			folder: "food",
		},
		questionable_sandwich: {
			folder: "food",
		},
		salad_fork: {
			folder: "food",
		},
		soup_bowl: {
			folder: "food",
			zIndex: "handheld_over_sleeve",
		},
		sprinkle_donut: {
			folder: "food",
		},
		tenta_fruit: {
			folder: "food",
		},
		toast_buttered: {
			folder: "food",
		},
		toast_raw: {
			folder: "food",
		},
		tuna_tin: {
			folder: "food",
		},
		lollipop_big: {
			folder: "food",
		},
		lollipop_small: {
			folder: "food",
		},
		mints: {
			folder: "food",
		},
		inedible_burnt: {
			folder: "food",
		},
		inedible_slop: {
			folder: "food",
		},
		inedible_tentaslop: {
			folder: "food",
		},
		rice: {
			folder: "ingredient",
			armPosition: "clutch",
			overUnderSplit: true,
		},
		flour: {
			armPosition: "clutch",
		},
		sugar: {
			armPosition: "clutch",
		},
		fertiliser: {
			armPosition: "clutch",
		},
		berry_basket: {
			folder: "tending",
		},
		farm_basket: {
			folder: "tending",
		},
		pinkshroom: {
			folder: "tending",
		},
		hawk_egg_1: {
			folder: "tending",
		},
		hawk_egg_2: {
			folder: "tending",
			armPosition: "clutch",
		},
		hawk_egg_3: {
			folder: "tending",
			armPosition: "clutch",
		},
		plant_pot: {
			folder: "furniture",
			armPosition: "clutch",
		},
		poster: {
			folder: "furniture",
		},
		large_teddy_bear: {
			folder: "furniture",
			armPosition: "clutch",
			colour: ["light brown"],
			accColour: ["khaki"],
			hasAccessory: true,
			overUnderAccSplit: true,
			overUnderSplit: true,
		},
		pillow: {
			folder: "furniture",
			armPosition: "clutch",
			hasCoverImg: true,
			overUnderSplit: true,
		},
		yes_pillow: {
			folder: "furniture",
			armPosition: "clutch",
			hasCoverImg: true,
			overUnderSplit: true,
		},
		no_pillow: {
			folder: "furniture",
			armPosition: "clutch",
			hasCoverImg: true,
			overUnderSplit: true,
		},
		candy_pillow: {
			folder: "furniture",
			armPosition: "clutch",
			hasCoverImg: true,
			overUnderSplit: true,
		},
		penguin_plushie: {
			folder: "furniture",
			armPosition: "clutch",
			overUnderSplit: true,
		},
		kylar_owl: {
			folder: "furniture",
			armPosition: "clutch",
			overUnderSplit: true,
		},
		rolled_poster: {
			folder: "furniture",
			colour: ["white"],
			overUnderSplit: true,
		},
		anal_beads: {
			folder: "sex toy",
		},
		breast_pump: {
			colour: ["pink", "purple", "blue", "light pink", "yellow"],
			folder: "sex toy",
			hasAccessory: true,
		},
		butt_plug: {
			colour: ["black", "blue", "teal", "lime", "light pink", "purple", "tan", "brown", "red", "fleshy"],
			folder: "sex toy",
		},
		dildo: {
			folder: "sex toy",
			colour: ["black", "blue", "green", "pink", "purple", "red", "white", "yellow", "tan", "brown", "fleshy"],
			zIndex: "handheld_over_sleeve",
		},
		small_dildo: {
			folder: "sex toy",
			colour: ["black", "blue", "green", "pink", "purple", "red", "white", "yellow", "tan", "brown", "fleshy"],
			zIndex: "handheld_over_sleeve",
		},
		stroker: {
			folder: "sex toy",
			colour: ["black", "blue", "teal", "lime", "light pink", "purple", "tan", "brown", "red", "fleshy"],
			zIndex: "handheld_over_sleeve",
		},
		lube: {
			folder: "sex toy",
			hasAccessory: true,
		},
		bullet_vibe: {
			folder: "sex toy",
		},
		crop: {
			folder: "sex toy",
		},
		wooden_paddle: {
			folder: "sex toy",
			armPosition: "right_cover",
		},
		whip: {
			folder: "sex toy",
			colour: ["brown", "black", "khaki", "sand"],
		},
		keycard: {
			colour: ["black", "blue", "green", "silver", "tangerine", "gold"],
			hasAccessory: true,
		},
		lipstick: {
			colour: ["red", "blue", "green", "purple", "orange", "pink", "lime", "light pink", "black"],
			hasAccessory: true,
		},
		science_flask: {
			colour: ["green", "pink", "purple", "yellow", "neon blue"],
			hasAccessory: true,
		},
		scissors: {
			colour: ["red", "black", "silver"],
			hasAccessory: true,
		},
		toothbrush: {
			colour: ["pink", "purple", "blue"],
			hasAccessory: true,
		},
		cigarette: {
			hasCoverImg: true,
		},
		antique_cane: {
			armPosition: "right_cover",
		},
		antique_sword_cane: {
			armPosition: "right_cover",
		},
		antique_silver_coin: {
			animation: "coinFlip",
		},
		antique_copper_coin: {
			animation: "coinFlip",
		},
		antique_gold_coin: {
			animation: "coinFlip",
		},
		antique_cutlass: {
			zIndex: "handheld_over_sleeve",
		},
		antique_rusted_cutlass: {
			zIndex: "handheld_over_sleeve",
		},
		antique_silver_dagger: {
			zIndex: "handheld_over_sleeve",
		},
		badminton_racquet: {
			armPosition: "right_cover",
		},
		bucket: {
			armPosition: "right_cover",
		},
		toolbox: {
			armPosition: "right_cover",
		},
		first_aid: {
			armPosition: "right_cover",
		},
		fish_basket: {
			armPosition: "right_cover",
		},
		piano: {
			armPosition: "right_cover",
			zIndex: "tailPenisCoverOverlay",
		},
		box: {
			armPosition: "clutch",
			overUnderSplit: true,
		},
		box_creature: {
			armPosition: "clutch",
			overUnderSplit: true,
		},
		box_open: {
			armPosition: "clutch",
			overUnderSplit: true,
		},
		box_aphrodisiac: {
			armPosition: "clutch",
			overUnderSplit: true,
		},
		box_potato: {
			armPosition: "clutch",
			overUnderSplit: true,
		},
		box_panty: {
			armPosition: "clutch",
			overUnderSplit: true,
		},
		box_porn: {
			armPosition: "clutch",
			overUnderSplit: true,
		},
		laundry: {
			armPosition: "clutch",
			zIndex: "handheld_over_sleeve",
		},
		laundry_basket: {
			armPosition: "clutch",
			overUnderSplit: true,
		},
		log: {
			armPosition: "clutch",
		},
		giftbox: {
			armPosition: "clutch",
		},
		chainsaw: {
			armPosition: "cover_both",
		},
		torch: {
			hasLevels: true,
		},
		cards: {
			hasAccessory: true,
			hasLevels: true,
		},
		dog_leash: {
			colour: ["red"],
			hasAccessory: true,
			hasCoverImg: true,
		},
		fabric_rope: {
			colour: ["white"],
			hasLevels: true,
		},
		fabric_rope_climb: {
			colour: ["white"],
			armPosition: "cover_both",
		},
		rope_climb: {
			armPosition: "cover_both",
		},
		mop: {
			armPosition: "cover_both",
		},
		broom: {
			armPosition: "cover_both",
		},
		net: {
			colour: ["tan"],
		},
		feather: {
			colour: ["hair", "hawk"],
		},
		rag: {
			colour: ["white", "grey", "khaki", "pale white"],
		},
		love_locket: {
			colour: ["bronze", "gold", "rose gold", "silver"],
		},
		key: {
			colour: ["black", "steel", "bronze", "gold", "rose gold", "silver", "white", "blue steel"],
		},
		lichen: {
			colour: ["light pink", "purple", "white", "violet"],
		},
		used_condom: {
			colour: ["red", "blue", "light blue", "green", "lime", "purple", "tangerine", "pink", "pale white"],
		},
		necklace: {
			colour: ["steel", "blue steel", "bronze", "gold", "rose gold", "silver", "black", "light pink"],
		},
		stolen_purse: {
			colour: ["light pink", "lilac", "black", "brown", "sand", "pink", "red", "white"],
		},
		rubber: {
			colour: ["light pink"],
		},
		bouquet: {
			colour: ["light pink", "red", "pink", "white"],
			hasAccessory: true,
		},
		hammer: {
			zIndex: "handheld_over_sleeve",
		},
		trolley: {
			hasAccessory: true,
			accColour: ["violet"],
			zIndex: "handheld_over_sleeve",
		},
		box_outfit: {
			armPosition: "handsfree",
		},
		hedge_shears: {
			armPosition: "right_cover",
		},
		tarnished_spear: {
			overUnderSplit: true,
		},
		restored_spear: {
			overUnderSplit: true,
		},
		flyers: {
			zIndex: "handheld_over_sleeve",
		},
	};

	/*
		Modders may add their own props to this array. This should be empty in the base game at all times. Please include a `modder` property with your name. Modders may wish to keep their props in their own folder as well.
		e.g.
		setup.moddedProps = {
			cum_jar: {
				folder: "modded sprites",
				modder: "your name",
			}
		};
	*/
	setup.moddedProps = {};
	Object.assign(setup.props, setup.moddedProps);
}
window.initProps = initProps;
