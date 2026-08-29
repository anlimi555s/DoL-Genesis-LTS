/* global isPossibleLoveInterest */

/* Read this if you plan on modifying setup.sextoys
 * wearable should be set to 1 if item can be worn. Otherwise, set it to 1 (You can't wear a dildo, but you can wear a strapon.)
 * category is used to know which item cannot be worn together. If two items have same category, wearing one will unwear the other.
 * **Do not** change the indexes, and do not move any objects in setup.sextoys array
 * If you need to add new items, add them at the end of the list, and set their index equal to their place in the array. First item has index 0, second item index 1 etc.
 * to be completed.
 */

setup.sextoyFunctions = {
	notExists: name => V.player.inventory.sextoys[name] === undefined,
	owned(name) {
		if (setup.sextoyFunctions.notExists(name)) return 0;
		return V.player.inventory.sextoys[name].length();
	},
	isCarried(name) {
		if (setup.sextoyFunctions.notExists(name)) return false;
		return V.player.inventory.sextoys[name].some(item => item.carried);
	},
	isWorn(name) {
		if (setup.sextoyFunctions.notExists(name)) return false;
		if (V.player.inventory.sextoys[name].type.includes("strap-on")) {
			return V.worn.under_lower.type.includes("strap-on");
		} else {
			return V.player.inventory.sextoys[name].some(item => item.worn);
		}
	},
	unWear(name) {
		if (setup.sextoyFunctions.notExists(name)) return;
		V.player.inventory.sextoys[name].forEach(item => (item.worn = 0));
	},
	unCarry(name) {
		if (setup.sextoyFunctions.notExists(name)) return;
		V.player.inventory.sextoys[name].forEach(item => {
			item.worn = 0;
			item.carried = 0;
		});
	},
};

setup.sextoys = [
	{
		index: 0,
		name: "dildo",
		namecap: "Dildo",
		name_underscore: "dildo",
		description: "A six inch dildo.",
		cost: 5000,
		category: "dildo",
		wearable: 0,
		size: 2,
		type: ["dildo"],
		icon: "sex-toys/dildo.png",
		colour: 1,
		colour_options: ["black", "blue", "teal", "lime-green", "light-pink", "purple", "tan", "brown", "red", "fleshy"],
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["adult"],
		display_condition: () => V.shopName === "adult",
	},
	{
		index: 1,
		name: "small dildo",
		namecap: "Small dildo",
		name_underscore: "small_dildo",
		description: "A good starter toy.",
		cost: 4000,
		category: "dildo",
		wearable: 0,
		size: 1,
		type: ["dildo"],
		icon: "sex-toys/dildo-small.png",
		colour: 1,
		colour_options: ["black", "blue", "teal", "lime-green", "light-pink", "purple", "tan", "brown", "red", "fleshy"],
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["adult"],
		display_condition: () => V.shopName === "adult",
	},
	{
		index: 2,
		name: "anal beads",
		namecap: "Anal beads",
		name_underscore: "anal_beads",
		description: "For anal play. This item can be worn in your bottom or played with.",
		cost: 8000,
		type: ["dildo", "anal"],
		category: "butt_plug",
		wearable: 1,
		size: 2,
		icon: "sex-toys/anal-beads.png",
		colour: 1,
		colour_options: ["black", "blue", "teal", "lime-green", "light-pink", "purple", "tan", "brown", "red", "fleshy"],
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["adult"],
		display_condition: () => V.shopName === "adult",
	},
	{
		index: 3,
		name: "bullet vibe",
		namecap: "Bullet vibe",
		name_underscore: "bullet_vibe",
		description: "The vibrations produced from this item give powerful orgasms. Good for people new to sex toys.",
		cost: 12000,
		wearable: 0,
		size: 0,
		category: "vibrator",
		type: ["dildo", "vibrator"],
		icon: "sex-toys/bullet-vibe.png",
		colour: 0,
		colour_options: [],
		default_colour: "pink",
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["adult"],
		display_condition: () => V.shopName === "adult",
	},
	{
		index: 4,
		name: "butt plug",
		namecap: "Butt plug",
		name_underscore: "butt_plug",
		description: "For anal play. This item can be worn in your bottom or played with.",
		cost: 8000,
		wearable: 1,
		size: 2,
		category: "butt_plug",
		type: ["dildo", "anal"],
		icon: "sex-toys/buttplug.png",
		colour: 1,
		colour_options: ["black", "blue", "teal", "lime-green", "light-pink", "purple", "tan", "brown", "red", "fleshy"],
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["adult"],
		display_condition: () => V.shopName === "adult",
	},
	{
		index: 5,
		name: "strap-on",
		namecap: "Strap-on",
		name_underscore: "strap-on",
		clothes_index: 33,
		description: "Worn on your hips. Used for penetrative sex.",
		cost: 8000,
		wearable: 1,
		size: 2,
		category: "strap-on",
		type: ["strap-on", "fetish"],
		icon: "sex-toys/strap-on.png",
		iconFront: "sex-toys/strap-on-front.png",
		colour: 1,
		shape: "cock",
		colour_options: ["black", "blue", "green", "pink", "purple", "red", "white", "yellow", "tan", "brown", "fleshy"],
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["adult"],
		display_condition: () => V.shopName === "adult",
	},
	{
		index: 6,
		name: "strap-on horse cock",
		namecap: "Strap-on horse cock",
		name_underscore: "strap-on_horse_cock",
		clothes_index: 34,
		description: "Novelty equine phallus. Worn on your hips. Used for penetrative sex.",
		cost: 8000,
		wearable: 1,
		size: 4,
		category: "strap-on",
		type: ["strap-on", "fetish"],
		icon: "sex-toys/strap-on-horse-cock.png",
		iconFront: "sex-toys/strap-on-horse-cock-front.png",
		colour: 1,
		shape: "horse cock",
		colour_options: ["black", "blue", "green", "pink", "purple", "red", "white", "yellow", "tan", "brown", "fleshy"],
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["adult"],
		display_condition: () => V.shopName === "adult",
	},
	{
		index: 7,
		name: "strap-on knotted cock",
		namecap: "Strap-on knotted cock",
		name_underscore: "strap-on_knotted_cock",
		clothes_index: 35,
		description: "Novelty canine phallus. Worn on your hips. Used for penetrative sex.",
		cost: 8000,
		wearable: 1,
		size: 3,
		category: "strap-on",
		type: ["strap-on", "fetish"],
		icon: "sex-toys/strap-on-knotted-cock.png",
		iconFront: "sex-toys/strap-on-knotted-cock-front.png",
		colour: 1,
		colour_options: ["black", "blue", "green", "pink", "purple", "red", "white", "yellow", "tan", "brown", "fleshy"],
		shape: "knotted cock",
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["adult"],
		display_condition: () => V.shopName === "adult",
	},
	{
		index: 8,
		name: "lube",
		namecap: "Lube",
		name_underscore: "lube",
		description: "Lubricant suitable for sexual purposes. 3 uses per bottle.",
		cost: 2000,
		wearable: 0,
		size: 3,
		category: "lube",
		type: ["lube"],
		icon: "sex-toys/lube.png",
		iconFront: "sex-toys/lube-front.png",
		colour: 1,
		uses: 3,
		colour_options: ["pink"],
		default_colour: "pink",
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["adult"],
		display_condition: () => V.shopName === "adult",
	},
	{
		index: 9,
		name: "stroker",
		namecap: "Stroker",
		name_underscore: "stroker",
		description: "A penile masturbator sleeve. Made with a material with a flesh-like feel.",
		cost: 8000,
		wearable: 0,
		category: "stroker",
		type: ["stroker"],
		icon: "sex-toys/onahole.png",
		colour: 1,
		colour_options: ["black", "blue", "teal", "lime-green", "light-pink", "purple", "tan", "brown", "red", "fleshy"],
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["adult"],
		display_condition: () => V.shopName === "adult",
	},
	{
		index: 10,
		name: "aphrodisiac pills",
		namecap: "Aphrodisiac pills",
		name_underscore: "aphrodisiac_pills",
		description: "A pack of three aphrodisiac pills. The instructions say to take 'a suitable number' before sex for an enhanced experience.",
		cost: 4000,
		wearable: 0,
		size: 3,
		category: "aphrodisiacpill",
		type: ["aphrodisiacpill"],
		icon: "sex-toys/pill-aphrodisiac.png",
		colour: 0,
		uses: 3,
		colour_options: ["pink"],
		default_colour: "pink",
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["adult"],
		display_condition: () => V.shopName === "adult",
	},
	{
		index: 11,
		name: "breast pump",
		namecap: "Breast pump",
		name_underscore: "breast_pump",
		description: "A hand-held breast pump.",
		cost: 5000,
		wearable: 0,
		size: 3,
		category: "breastpump",
		type: ["breastpump"],
		icon: "sex-toys/handheld-pump.png",
		colour: 1,
		colour_options: ["pink", "purple", "blue", "light-pink", "yellow", "fleshy"],
		default_colour: ["pink", "purple", "blue", "light-pink", "yellow", "fleshy"],
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["adult"],
		display_condition: () => V.shopName === "adult",
	},
	{
		index: 12,
		name: "strap-on dolphin cock",
		namecap: "Strap-on dolphin cock",
		name_underscore: "strap-on-dolphin-cock",
		clothes_index: 48,
		description: "Novelty dolphin phallus. Worn on your hips. Used for penetrative sex.",
		cost: 8000,
		wearable: 1,
		size: 3,
		category: "strap-on",
		type: ["strap-on", "fetish"],
		icon: "sex-toys/strap-on-dolphin-cock.png",
		iconFront: "sex-toys/strap-on-dolphin-cock-front.png",
		colour: 1,
		colour_options: ["black", "blue", "green", "pink", "purple", "red", "white", "yellow", "tan", "brown", "fleshy", "blue steel", "grey", "pale white"],
		shape: "dolphin cock",
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["forest"],
		display_condition: () => V.shopName === "forest",
	},
	{
		index: 13,
		name: "strap-on tentacle",
		namecap: "Strap-on tentacle",
		name_underscore: "strap-on_tentacle",
		clothes_index: 49,
		description: "Novelty phallus. Worn on your hips. Used for penetrative sex.",
		cost: 8000,
		wearable: 1,
		size: 3,
		category: "strap-on",
		type: ["strap-on", "fetish"],
		icon: "sex-toys/strap-on-tentacle.png",
		iconFront: "sex-toys/strap-on-tentacle-front.png",
		colour: 1,
		colour_options: ["black", "blue", "green", "pink", "purple", "red", "white", "yellow", "tan", "brown", "fleshy"],
		shape: "tentacle",
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["forest"],
		display_condition: () => V.shopName === "forest",
	},
	{
		index: 14,
		name: "wand vibe",
		namecap: "Wand vibe",
		name_underscore: "wand_vibe",
		description: "The vibrations produced from this item give intense orgasms. For external use only.",
		cost: 12000,
		wearable: 0,
		size: 0,
		category: "vibrator",
		type: ["vibrator"],
		icon: "sex-toys/wand-vibe.png",
		colour: 1,
		colour_options: ["black", "blue", "green", "pink", "purple", "red", "white", "yellow", "tan", "brown", "fleshy"],
		default_colour: "black",
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["forest"],
		display_condition: () => V.shopName === "forest",
	},
	{
		index: 15,
		name: "fantasy stroker",
		namecap: "Fantasy stroker",
		name_underscore: "fantasy_stroker",
		description: "A penile masturbator sleeve with an alien design. Made with a material with a flesh-like feel.",
		cost: 8000,
		wearable: 0,
		category: "stroker",
		type: ["stroker"],
		icon: "sex-toys/fantasy-onahole.png",
		colour: 0,
		colour_options: [],
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["forest"],
		display_condition: () => V.shopName === "forest",
	},

	{
		index: 16,
		name: "horse dildo",
		namecap: "Horse dildo",
		name_underscore: "horse_dildo",
		description: "Novelty equine phallus.",
		cost: 5000,
		category: "dildo",
		wearable: 0,
		size: 4,
		type: ["dildo"],
		icon: "sex-toys/dildo-horse.png",
		colour: 1,
		colour_options: ["black", "blue", "teal", "lime-green", "light-pink", "purple", "tan", "brown", "red", "fleshy"],
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["forest"],
		display_condition: () => V.shopName === "forest",
	},
	{
		index: 17,
		name: "knotted dildo",
		namecap: "Knotted dildo",
		name_underscore: "knotted_dildo",
		description: "Novelty canine phallus.",
		cost: 5000,
		category: "dildo",
		wearable: 0,
		size: 3,
		type: ["dildo"],
		icon: "sex-toys/dildo-knotted.png",
		colour: 1,
		colour_options: ["black", "blue", "teal", "lime-green", "light-pink", "purple", "tan", "brown", "red", "fleshy"],
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["forest"],
		display_condition: () => V.shopName === "forest",
	},
	{
		index: 18,
		name: "dolphin dildo",
		namecap: "Dolphin dildo",
		name_underscore: "dolphin_dildo",
		description: "Novelty dolphin phallus.",
		cost: 5000,
		category: "dildo",
		wearable: 0,
		size: 3,
		type: ["dildo"],
		icon: "sex-toys/dildo-dolphin.png",
		colour: 1,
		colour_options: ["black", "blue", "green", "pink", "purple", "red", "white", "yellow", "tan", "brown", "fleshy", "blue steel", "grey", "pale white"],
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["forest"],
		display_condition: () => V.shopName === "forest",
	},
	{
		index: 19,
		name: "tentacle dildo",
		namecap: "Tentacle dildo",
		name_underscore: "tentacle_dildo",
		description: "Novelty phallus shaped like a tentacle.",
		cost: 5000,
		category: "dildo",
		wearable: 0,
		size: 3,
		type: ["dildo"],
		icon: "sex-toys/dildo-tentacle.png",
		colour: 1,
		colour_options: ["black", "blue", "teal", "lime-green", "light-pink", "purple", "tan", "brown", "red", "fleshy"],
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["forest"],
		display_condition: () => V.shopName === "forest",
	},
	{
		index: 20,
		name: "jeweled butt plug",
		namecap: "Jeweled butt plug",
		name_underscore: "jeweled_butt_plug",
		description: "For anal play. This item can be worn in your bottom or played with.",
		cost: 8000,
		wearable: 1,
		size: 2,
		category: "butt_plug",
		type: ["dildo", "anal"],
		icon: "sex-toys/buttplug-jewel.png",
		iconFront: "sex-toys/buttplug-jeweled.png",
		colour: 1,
		colour_options: ["black", "blue", "teal", "lime-green", "light-pink", "purple", "neon blue", "pink", "red"],
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["forest"],
		display_condition: () => V.shopName === "forest",
	},
	{
		index: 21,
		name: "fox tail butt plug",
		namecap: "Fox tail butt plug",
		name_underscore: "fox_tail_butt_plug",
		description: "For anal play. This item can be worn in your bottom or played with.",
		cost: 8000,
		wearable: 1,
		size: 2,
		category: "butt_plug",
		type: ["dildo", "anal"],
		icon: "sex-toys/buttplug-fox.png",
		colour: 0,
		colour_options: [],
		owned: setup.sextoyFunctions.owned,
		isCarried: setup.sextoyFunctions.isCarried,
		isWorn: setup.sextoyFunctions.isWorn,
		unWear: setup.sextoyFunctions.unWear,
		unCarry: setup.sextoyFunctions.unCarry,
		shop: ["forest"],
		display_condition: () => V.shopName === "forest",
	},
];

function sexShopGridInit() {
	$(function () {
		for (const item of setup.sextoys) {
			if (item.display_condition()) window.sexShopGridAddItemBox(item);
		}
	});
}
window.sexShopGridInit = sexShopGridInit;

function sexShopIcon(item, colour, desc = false) {
	// container for main + front icons
	const itemIcon = $("<span>", { class: "ssm_icon_wrapper" })[0];

	// main icon
	const id = desc ? `ssm_desc_icon_${item.name_underscore}` : `ssm_item_icon_${item.name_underscore}`;
	const mainSpan = $("<span>", { class: `ssm_icon icon ${colour.replace(/\s/g, "-")}`, id })[0];
	// eslint-disable-next-line no-new
	new Wikifier(mainSpan, `<<icon "${item.icon}">>`);
	itemIcon.append(mainSpan);

	// nonrecolourable parts in front
	if (item.iconFront) {
		const frontSpan = $("<span>", {
			class: "ssm_icon icon infront",
			id: `ssm_item_icon_front_${item.name_underscore}`,
		})[0];
		// eslint-disable-next-line no-new
		new Wikifier(frontSpan, `<<icon "${item.iconFront}">>`);
		itemIcon.prepend(frontSpan);
	}

	return itemIcon;
}
window.sexShopIcon = sexShopIcon;

function sexShopGridAddItemBox(item) {
	$(() => {
		const container = $("#sexShopMenuContainer");

		// main item
		const ssmItem = $("<div>", {
			class: "ssm_item",
			id: `ssm_item_${item.name_underscore}`,
		}).on("click", () => sexShopOnItemClick(item.index));

		const colour = item.colour === 1 ? `clothes-${item.colour_options.random()}` : "";
		ssmItem.append(sexShopIcon(item, colour));

		// details container
		const details = $("<div>", { class: "ssm_details" });
		details.append($("<div>", { class: "ssm_item_name", text: item.namecap }));

		if (item.owned() > 0) {
			const ownedDiv = $("<div>", { class: "ssm_already_owned" });
			ownedDiv.append($("<span>", { class: "ssm_owned_text", text: "owned" }));
			details.append(ownedDiv);
		}

		ssmItem.append(details);
		container.append(ssmItem);
	});
}
window.sexShopGridAddItemBox = sexShopGridAddItemBox;

function sexShopOnColourClick(colour) {
	document.querySelectorAll("#ssm_colour_panel .colour-button.div-link").forEach(elem => elem.classList.remove("active"));
	document.querySelector(`#ssm_colour_panel .colour-button[colour-name="${colour}"]`)?.classList.add("active");
	const icon = document.querySelector("#ssm_descContainer .ssm_icon.icon:not(.infront)");
	icon.className = icon.className.replace(/\bclothes-\S+/g, "");
	icon.classList.add("clothes-" + colour);
}
window.sexShopOnColourClick = sexShopOnColourClick;

function removeClassNameAt(id) {
	const elements = document.getElementsByClassName(id);
	for (const element of elements) {
		element.classList.remove(id);
	}
}

function sexShopOnCloseDesc(id) {
	const element = document.getElementById(id);
	if (element == null) {
		// TODO: Log
		return;
	}
	element.style.display = "none";

	/* grid item box class changes */
	removeClassNameAt("ssm_selected_a");
	removeClassNameAt("ssm_selected_b");
	removeClassNameAt("ssm_selected_c");
}
window.sexShopOnCloseDesc = sexShopOnCloseDesc;

function sexShopOnItemClick(index) {
	const item = setup.sextoys[index];

	// clear "Bought!/Buy it" fade in setTimeout from window.sexShopOnBuyClick
	["sexShopOnGiftClick", "sexShopOnBuyClick"].forEach(fn => {
		if (window[fn]?.counter !== undefined && window[fn].counter !== "off") {
			clearTimeout(window[fn].counter);
			window[fn].counter = "off";
		}
	});

	// Update selected classes
	removeClassNameAt("ssm_selected_a");
	removeClassNameAt("ssm_selected_b");
	removeClassNameAt("ssm_selected_c");

	$(`#ssm_item_${item.name_underscore}`).addClass("ssm_selected_a");
	$(`#ssm_item_${item.name_underscore} > .ssm_details > .ssm_item_name`).addClass("ssm_selected_b");
	$(`#ssm_item_${item.name_underscore} > .ssm_details > .ssm_already_owned`).addClass("ssm_selected_c");

	// Container reset
	const container = $("#ssm_descContainer").empty();

	// Icon (reusing sexShopIcon)
	const colourClass = item.colour === 1 ? `clothes-${item.colour_options.random()}` : "";
	const imgWrap = $("<div>").append(sexShopIcon(item, colourClass, true));

	// Description container
	const borderDiv = document.createElement("div");
	borderDiv.className = "ssm_desc_border";
	borderDiv.innerHTML = `
		<div id="ssm_desc">
			<div class="ssm_closeContainer">
				<div class="ssm_close" id="ssm_close1" title="close"
					onclick="window.sexShopOnCloseDesc('ssmDescPillContainer')">x</div>
			</div>
			<span style="color: #bcbcbc">${item.description}</span>
			<div id="ssm_desc_action"></div>
		</div>`;

	const actionDiv = borderDiv.querySelector("#ssm_desc_action");

	// Colour options
	if (item.colour_options?.length) {
		actionDiv.insertAdjacentHTML(
			"beforeend",
			`
			<hr>
			<span style="color: #e0e0e0">Colours to choose from: </span>
			<div id="ssm_colour_panel" class="colour-options-div">
				${item.colour_options
					.map(
						colour => `
					<div colour-name="${colour.replace(/\s/g, "-")}" onclick="window.sexShopOnColourClick('${colour.replace(/\s/g, "-")}')" class="colour-button div-link">
						<div class="bg-${colour.replace(/\s/g, "-")}">
							<span class="capitalize colour-name-span">${colour}</span>
							<a tabindex="0"></a>
						</div>
					</div>`
					)
					.join("")}
			</div>
		`
		);
	}

	// Price / Buy
	const canAfford = V.money >= item.cost;
	actionDiv.insertAdjacentHTML(
		"beforeend",
		`
		<div style="text-align: center;">
			<br>
			${
				canAfford
					? `<a id="ssmBuyButton" onclick="window.sexShopOnBuyClick(${item.index})" class="ssm_buy_button">Buy it</a> (<span class="gold">£${(
							item.cost / 100
					  ).toFixed(2)}</span>)`
					: `<span class="ssm_not_enough_money">Not enough money</span> (<span class="gold">£${(item.cost / 100).toFixed(2)}</span>)`
			}
			${item.type.includes("strap-on") ? determineRecipient(item.index) : ""}
		</div>
	`
	);

	container.append(imgWrap, borderDiv);
	document.getElementById("ssmDescPillContainer").style.display = "";
}

window.sexShopOnItemClick = sexShopOnItemClick;

// conditions for gifting items to people
function determineRecipient(index) {
	const item = setup.sextoys[index];
	let optionBuilder = "";

	const giftBr = document.getElementById("giftBr");
	if (giftBr != null) giftBr.remove();

	// Add 15$ for gifting paperwrap
	if (V.money < item.cost + 15 * 100) return "";

	for (const li of ["Alex", "Eden", "Kylar", "Robin", "Sydney"]) {
		if (isPossibleLoveInterest(li)) {
			optionBuilder += `<option value="${li}">${li}</option>`;
		}
	}
	if (V.gwylanSeen?.includes("yearning")) {
		optionBuilder += `<option value="${"Gwylan"}">${"Gwylan"}</option>`;
	}

	// if no possible recipient, return.
	if (optionBuilder === "") return "";
	const builder = `<br id="giftBr"><a id="ssmGiftButton" onclick="window.sexShopOnGiftClick(${item.index})" class="ssm_gift_button">
	Make a gift for :  </a><select name="recipient" id="recipientList">${optionBuilder}</select>
	<div id="spanGift">(<span class="gold">£${item.cost / 100 + 15}</span>)</div>`;
	return builder;
}
window.determineRecipient = determineRecipient;

function sexShopOnGiftClick(index) {
	const item = setup.sextoys[index];
	const icon = document.querySelector("#ssm_descContainer .ssm_icon.icon:not(.infront)");
	const iconClassName = icon.className;

	// get the recipient
	let recipient = document.getElementById("recipientList").value.toLowerCase();
	recipient = window.findIndexInNPCNameVar(recipient);
	if (recipient === undefined) return;

	sexShopOnGiftClick.counter = sexShopOnGiftClick.counter || "off";

	/* add item to NPC's inventory */
	if (V.NPCName[recipient].sextoys == null) V.NPCName[recipient].sextoys = {};
	if (V.NPCName[recipient].sextoys[item.name] == null) V.NPCName[recipient].sextoys[item.name] = [];

	const obj = {
		index: item.index,
		name: item.name,
		namecap: item.namecap,
		colour: (iconClassName.match(/\bclothes-([^\s]+)/) || [])[1] || item.default_colour,
		worn: false,
		size: item.size,
		carried: false,
		state: "worn",
		state_base: "worn",
		gift_state: "held",
		uses: item.uses ? item.uses : undefined,
		shape: item.shape ? item.shape : undefined,
	};

	if (Array.isArray(obj.colour)) obj.colour = obj.colour[random(0, obj.colour.length)];

	V.NPCName[recipient].sextoys[item.name].push(obj);

	/* withdraw money from player */
	statChange.money(-(item.cost + 15 * 100), "sexToys");

	/* update sidebar money */
	updateSideBarMoney();

	/* fade in/out bought green text indicator */
	if (document.getElementById("ssmGiftButton")) {
		document.getElementById(
			"ssmGiftButton"
		).outerHTML = `<span class="ssm_gift_button ssm_fade_in" id="ssmGiftButton" style="color:#97de97">Bought!</span>`;
	}

	document.getElementById("recipientList").remove();
	document.getElementById("spanGift").remove();

	if (sexShopOnGiftClick.counter === "off") {
		sexShopOnGiftClick.counter = setTimeout(function () {
			if (document.getElementById("ssmGiftButton")) {
				document.getElementById("ssmGiftButton").outerHTML = determineRecipient(index);
			}
			sexShopOnGiftClick.counter = "off";
		}, 1400);
	}
}

window.sexShopOnGiftClick = sexShopOnGiftClick;

function sexShopOnBuyClick(index, inSexShop = true, colour, costsMoney = true) {
	const item = setup.sextoys[index];
	const icon = document.querySelector("#ssm_descContainer .ssm_icon.icon:not(.infront)");
	sexShopOnBuyClick.counter = sexShopOnBuyClick.counter || "off";

	// add item to player inventory
	if (!V.player.inventory.sextoys[item.name]) V.player.inventory.sextoys[item.name] = [];

	const obj = {
		index: item.index,
		colour: icon?.className.match(/\bclothes-(\S+)/)?.[1].replace(/-/g, " ") || item.default_colour,
		name: item.name,
		namecap: item.namecap,
		worn: false,
		type: item.type,
		size: item.size,
		carried: false,
		state: "removed",
		state_base: "worn",
		shape: item.shape || undefined,
		uses: item.uses || undefined,
	};

	// override colour if explicitly provided
	if (colour && item.colour_options?.includes(colour)) obj.colour = colour;
	if (Array.isArray(obj.colour)) obj.colour = obj.colour[random(0, obj.colour.length)];

	V.player.inventory.sextoys[item.name].push(obj);

	// withdraw money
	if (costsMoney) statChange.money(-item.cost, "sexToys");

	if (inSexShop) {
		// update sidebar money
		updateSideBarMoney();

		// fade in "owned" indicator on the grid item
		const ownedElem = document.getElementById("ssm_item_" + item.name_underscore)?.getElementsByClassName("ssm_already_owned")[0];
		if (ownedElem) {
			ownedElem.innerHTML = `<span class="ssm_owned_text ssm_fade_in">owned</span>`;
		}

		// fade in/out Buy button text
		const buyBtn = document.getElementById("ssmBuyButton");
		if (buyBtn) {
			buyBtn.outerHTML = `<span class="ssm_buy_button ssm_fade_in" id="ssmBuyButton" style="color:#97de97">Bought!</span>`;
		}

		// reset Buy button after short delay
		if (sexShopOnBuyClick.counter === "off") {
			sexShopOnBuyClick.counter = setTimeout(function () {
				const buyBtnReset = document.getElementById("ssmBuyButton");
				if (buyBtnReset) {
					buyBtnReset.outerHTML =
						V.money >= item.cost
							? `<a id="ssmBuyButton" onclick="window.sexShopOnBuyClick(${index})" class="ssm_buy_button ssm_fade_in_fast">Buy it</a>`
							: `<span class="ssm_not_enough_money">Not enough money</span>`;
				}
				sexShopOnBuyClick.counter = "off";
			}, 1400);
		}
	}
}
window.sexShopOnBuyClick = sexShopOnBuyClick;

// create Inventory object if it doesn't exist
function createInventoryObject() {
	let recipient;
	if (V.player.inventory == null) V.player.inventory = {};
	if (V.player.inventory.sextoys == null) V.player.inventory.sextoys = {};
	if (V.player.inventory.condoms == null) V.player.inventory.condoms = {};
	for (const li of ["alex", "eden", "kylar", "robin", "sydney", "gwylan"]) {
		recipient = window.findIndexInNPCNameVar(li);
		if (V.NPCName[recipient].sextoys == null) V.NPCName[recipient].sextoys = {};
	}
}
window.createInventoryObject = createInventoryObject;

function updateSideBarMoney() {
	Wikifier.wikifyEval("<<updatesidebarmoney>>");
}
window.updateSideBarMoney = updateSideBarMoney;
