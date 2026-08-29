class ClothesItem {
	/* Index of Clothing | REQUIRED | MUST BE UNIQUE TO SLOT | INT */
	index;

	/* Clothing Slot | REQUIRED | STRING */
	slot;

	/* Lowercase name of clothing | REQUIRED | STRING */
	name;

	/* Capitalized name of clothing | AUTOFILL | STRING */
	name_cap;

	/* Clothing name for variable purpose | REQUIRED | MUST BE UNIQUE | STRING */
	variable;

	/* Integrity of clothing | INT */
	integrity = 100;

	/* Maximum Integrity of clothing | SHOULD BE THE SAME AS INTEGRITY | INT */
	integrity_max = 100;

	/* Currently not used much | INT */
	fabric_strength = 25;

	/* */
	reveal;

	/* */
	bustresize;

	/* */
	word;

	/* Does clothing have multiple parts? | AUTOFILL | INT */
	one_piece = 0;

	/* */
	strap;

	/* */
	open;

	/* */
	state;

	/* */
	state_base;

	/* */
	state_top;

	/* */
	state_top_base;

	/* */
	plural;

	/* Filter storage, always 0 | REQUIRED | AUTOFILL | INT */
	colour = 0;

	/* Filter options | REQUIRED | AUTOFILL | ARRAY */
	colour_options = [];

	/* */
	exposed = 0;

	/* */
	exposed_base = 0;

	/* */
	type;

	/* Clothing set | AUTOFILL | STRING */
	set;

	/* Gender of the clothing | REQUIRED | STRING */
	gender = "n";

	/* Warmth value of clothing | INT */
	warmth = 0;

	/* Clothing cost | INT */
	cost = 10000;

	/* Clothing description | REQUIRED | STRING */
	description;

	/* */
	shop;

	/* Whether have acc | REQUIRED | INT */
	accessory = 0;

	/* Acc filter storage, always 0 | REQUIRED | AUTOFILL | INT */
	accessory_colour = 0;

	/* Acc filter options | REQUIRED | ARRAY */
	accessory_colour_options = [];

	/* */
	sleeve_img;

	/* */
	breast_img;

	/* Is the clothing cursed? | INT */
	cursed = 0;

	/* Closet location storage, always 0 | REQUIRED | INT */
	location = 0;

	/* */
	iconFile;

	/* */
	accIcon = 0;

	/* */
	mainImage;

	/* */
	notuck;

	/* */
	pregType;

	/* */
	combat;

	/* Whether main image is recolourable | AUTOFILL | INT */
	colour_sidebar;

	/* */
	femininity;

	/* */
	shopGroup;

	/* */
	outfitPrimary;

	/* */
	outfitSecondary;

	/* */
	mask_img;

	/* */
	accessory_colour_combat;

	/* Whether acc is recolourable | AUTOFILL | INT */
	accessory_colour_sidebar;

	/* */
	colour_combat;

	/* */
	formfitting;

	/* Pattern choice storage | AUTOFILL | INT */
	pattern;

	/* */
	pattern_options;

	/* */
	pattern_layer;

	/* */
	accessory_integrity_img;

	/* */
	accessory_layer_under;

	/* */
	altposition;

	/* */
	altdisabled;

	/* */
	breast_combat;

	/* */
	breast_acc_img;

	/* */
	altsleeve;

	/* */
	has_collar;

	/* */
	pattern_caption;

	/* */
	sleeve_colour;

	/* */
	sleeve_acc_img;

	/* */
	detailIcon;

	/* */
	hoodposition;

	/* */
	breast_pattern;

	/* */
	zIndex;

	/* */
	back_img;

	/* */
	holdPosition;

	/* */
	back_img_colour;

	/* */
	back_integrity_img;

	/* */
	rearresize;

	/* */
	skirt;

	/* */
	skirt_down;

	/* */
	short;

	/* */
	vagina_exposed;

	/* */
	vagina_exposed_base;

	/* */
	anus_exposed;

	/* */
	anus_exposed_base;

	/* */
	high_img;

	/* */
	back_img_acc;

	/* */
	back_img_acc_colour;

	/* */
	oldVariable;

	/* */
	accImage;

	/* */
	name_simple;

	/* */
	anal_shield;

	/* */
	penis_img;

	/* */
	no_aside;

	/* */
	penis_acc_img;

	/* */
	hideUnderLower;

	/* */
	size;

	/* */
	mask_img_ponytail;

	/* */
	head_type;

	/* */
	hood;

	/* */
	collared;

	/* */
	leftImage;

	/* */
	rightImage;

	/* */
	coverBackImage;

	/* */
	altDamage;

	/* */
	penisSize;

	constructor(props) {
		/* parses passed object and populates class properties */
		Object.keys(props).forEach(prop => {
			this[prop] = props[prop];
		});

		/* pattern autofill */
		if (this.pattern_options) this.pattern = this.pattern_options.length ? 0 : undefined;

		/* cleans up unused properties */
		Object.keys(this).forEach(key => {
			if (this[key] === undefined) delete this[key];
		});

		/* autofill properties */
		if (this.name && !this.name_cap) this.name_cap = this.name.substring(0, 1).toUpperCase() + this.name.slice(1);
		if (this.slot && this.name && !this.set) this.set = this.outfitPrimary || this.outfitSecondary ? this.name : this.slot;
		if (!this.one_piece) this.one_piece = this.outfitPrimary || this.outfitSecondary ? 1 : 0;
		if (this.colour_options) this.colour_sidebar = this.colour_options.length ? 1 : 0;
		if (this.accessory_colour_options) this.accessory_colour_sidebar = this.accessory_colour_options.length ? 1 : 0;

		/* slot specific defaults */
		if (this.slot.includes("upper")) {
			this.exposed ??= 0;
			this.exposed_base ??= 0;
			this.state ??= "waist";
			this.state_base ??= "waist";
			this.state_top ??= "chest";
			this.state_top_base ??= "chest";
		}
		if (this.slot.includes("lower")) {
			this.exposed ??= 0;
			this.exposed_base ??= 0;
			this.vagina_exposed ??= 0;
			this.vagina_exposed_base ??= 0;
			this.anus_exposed ??= 0;
			this.anus_exposed_base ??= 0;
			this.state ??= "waist";
			this.state_base ??= "waist";
		}
	}
}

window.ClothesItem = ClothesItem;
