/* global ClothesItem, ClothedSlots, paramError */

function mapMove(moveTo) {
	const currentPassage = V.passage;
	const destinationTable = [];
	for (let i = 1; i < V.link_table.length; i++) {
		const temp = V.link_table[i].split("|")[1];
		if (temp) {
			destinationTable.push(temp.split("]]")[0]);
		}
	}
	const available = V.map.available;

	// if(V.debug == 1 || available[currentPassage].includes(moveTo))
	if (V.debug === 1 || (available[currentPassage].includes(moveTo) && destinationTable.includes(moveTo))) {
		window.ironmanFlag = true;
		Wikifier.wikifyEval("<<pass 5>>");
		delete window.ironmanFlag;
		Engine.play(moveTo);
	}
}
window.mapMove = mapMove;

function shopClothingFilterToggleTrait(trait) {
	const traits = V.shopClothingFilter.traits;
	if (traits) {
		const index = traits.indexOf(trait);
		if (index === -1) {
			traits.push(trait);
		} else {
			traits.splice(index, 1);
		}
	}
}
window.shopClothingFilterToggleTrait = shopClothingFilterToggleTrait;

function toggleAllHairTraitsFilter() {
	const chboxes = $("#hairContainerTraits input:not(:checked)");
	if (chboxes.length > 0) chboxes.click();
	else $("#hairContainerTraits input:checked").click();
}
window.toggleAllHairTraitsFilter = toggleAllHairTraitsFilter;

// A wrapper for wikifyEval, only use for singular macro calls.
function wikifier(widget, ...args) {
	if (widget == null) return document.createDocumentFragment();
	return Wikifier.wikifyEval("<<" + widget + (args.length ? " " + args.join(" ") : "") + ">>");
}
window.wikifier = wikifier;

function actionsreplace(bodypart) {
	const check = bodypart + "target";
	if (V[check] === "tentacles") {
		Wikifier.wikifyEval("<<replace #" + bodypart + "action>><<" + bodypart + "ActionInitTentacle>><</replace>>");
	} else if (V[check] === "swarm") {
		Wikifier.wikifyEval("<<replace #" + bodypart + "action>><<" + bodypart + "ActionInitSwarm>><</replace>>");
	} else if (V[check] === "vore") {
		Wikifier.wikifyEval("<<replace #" + bodypart + "action>><<" + bodypart + "ActionInitVore>><</replace>>");
	} else if (V[check] === "struggle") {
		Wikifier.wikifyEval("<<replace #" + bodypart + "action>><<" + bodypart + "ActionInitStruggle>><</replace>>");
	} else if (V[check] === "machine") {
		Wikifier.wikifyEval("<<replace #" + bodypart + "action>><<" + bodypart + "ActionInitMachine>><</replace>>");
	} else if (V[check] === "self") {
		Wikifier.wikifyEval("<<replace #" + bodypart + "action>><<" + bodypart + "ActionInitSelf>><</replace>>");
	} else {
		Wikifier.wikifyEval("<<replace #" + bodypart + "action>><<" + bodypart + "ActionInit>><</replace>>");
	}
}
window.actionsreplace = actionsreplace;

// prettier-ignore
const combatActionColours = {
	Default: {
		brat: [
			/* leftaction or rightaction */
			"steal", "penwhack", "freeface", "leftcovervagina", "leftcoverpenis", "leftcoveranus", "rightcovervagina", "rightcoverpenis", "rightcoveranus", "leftunderpull", "leftskirtpull", "leftlowerpull", "leftupperpull", "rightunderpull", "rightskirtpull", "rightlowerpull", "rightupperpull", "rightUndressOther", "leftUndressOther", "stopchoke", "clench", "shacklewhack", "leftfold", "rightfold", "dildowhack", "hypnosiswhack", "leftstruggleweak", "rightstruggleweak", "handpullpenis", "handpullvagina", "handpullanus", "leftresistW", "rightresistW", "leftstillW", "rightstillW", "penisremovecondom", "npcremovecondom",
			/* feetaction */
			"run", "taunt", "hide", "feetresistW", "legLock", "legLocked", "feetHold",
			/* mouthaction */
			"pullaway", "ejacspit", "pullawayvagina", "finish", "novaginal", "nopenile", "noanal", "scream", "mock", "breastclosed", "breastpull", "pullawaykiss", "noupper", "analpull", "up", "stifleorgasm", "stifle", "mouthresistW", "handcloseW", "growl", "askPullOut", "disparage",
			/* penisaction */
			"othermouthescape", "escape", "otheranusescape", "fencingescape", "pullOut",
			/* vaginaaction */
			"tribescape",
			/* anusaction */
			"doubleescape",
		],
		def: [
			/* leftaction or rightaction */
			"spray", "lefthit", "righthit", "leftstruggle", "rightstruggle", "stopchokenoncon", "pursuit_grab",
			/* feetaction */
			"kick", "ambush",
			/* mouthaction */
			"confront", "bite", "demand", "breastbite", "handbite", "headbutt", "bitepussy",
		],
		meek: [
			/* leftaction or rightaction */
			"behind", "fold", "leftcovervaginameek", "leftcoverpenismeek", "leftcoveranusmeek", "rightcovervaginameek", "rightcoverpenismeek", "rightcoveranusmeek", "leftprotect", "rightprotect", "leftgrip", "rightgrip", "leftcurl", "rightcurl", "pickupSexToy", "leftcamerapose", "rightcamerapose", "peniscondom", "npcgivecondom",
			/* feetaction */
			"strut", "feetCurl",
			/* mouthaction */
			"grasp", "plead", "forgive", "down", "letout", "letoutorgasm", "noises", "pay",
			/* penisaction */
			"thighbay", "bay", "otheranusbay",
			/* vaginaaction */
			"penisthighs",
			/* anusaction */
			"bottombay", "penischeeks", "penispussy", "penispussydap", "penisanus", "bottomhandbay", "wiggle",
		],
		sub: [
			/* leftaction or rightaction */
			"leftplay", "leftgrab", "leftstroke", "leftchest", "rightplay", "rightgrab", "rightstroke", "rightchest", "leftchest", "rightchest", "leftwork", "rightwork", "leftclit", "rightclit", "handedge", "keepchoke", "leftmasturbatepussy", "rightmasturbatepussy", "leftmasturbateanus", "rightmasturbateanus", "leftmasturbatepenis", "rightmasturbatepenis", "lefthandholdkeep", "righthandholdkeep", "lefthandholdnew", "righthandholdnew", "handguide", "lubeanus", "lubepussy", "lubepenis", "removebuttplug", "dildoOtherPussyTease", "dildoOtherPussyFuck", "dildoOtherAnusTease", "dildoOtherAnusFuck", "strokerOtherPenisTease", "strokerOtherPenisFuck", "dildoSelfPussyEntrance", "dildoSelfAnusEntrance", "dildoSelfPussy", "dildoSelfAnus", "strokerSelfPenisEntrance", "strokerSelfPenis", "leftcovervaginalewd", "rightcovervaginalewd", "leftcoverpenislewd", "rightcoverpenislewd", "leftcoveranuslewd", "rightcoveranuslewd",
			/* feetaction */
			"grab", "vaginagrab", "grabrub", "vaginagrabrub", "rub",
			/* mouthaction */
			"peniskiss", "kisslips", "kissskin", "suck", "lick", "ejacswallow", "moan", "breastsuck", "breastlick", "swallow", "movetochest", "othervagina", "mouth", "kissback", "vaginalick", "oraledge", "askchoke", "anallick", "analkiss", "askrough", "condoms", "noCondoms",
			/* penisaction */
			"penistovagina", "penistoanus", "penisvaginafuck", "penisanusfuck", "othermouthtease", "othermouthrub", "othermouthcooperate", "tease", "cooperate", "otheranustease", "otheranusrub", "otheranuscooperate", "clitrub", "vaginaEdging", "otheranusEdging", "handtease", "handAnusRub", "handcooperate", "strokerCooperate",
			/* fencing */
			"otherpenisrub", "penistopenis", "penistopenisfuck", "fencingcooperate",
			/* vaginaaction */
			"vaginatopenis", "vaginapenisfuck", "othervaginarub", "vaginatovagina", "vaginatovaginafuck", "tribcooperate", "penisEdging", "tribedge", "vaginatopenisdouble", "vaginapenisdoublefuck", "penispussydouble", "penisanusdvp", "forceImpregnation",
			/* anusaction */
			"anustopenis", "anuspenisfuck", "penistease", "otherMouthAnusRub", "otherAnusRub", "penisEdging",
			/* doubleanusaction */
			"anustopenisdouble", "anuspenisdoublefuck", "penisdoubletease", "penisDoubleEdging", "doublecooperate", "penisanusdouble",
		],
		wraith: [
			/* leftaction or rightaction */
			"leftacceptW", "rightacceptW", "leftstruggleW", "rightstruggleW",
			/* feetaction */
			"feetacceptW",
			/* mouthaction */
			"mouthacceptW", "handbiteW",
		],
	},
	Tentacle: {
		def: [
			/* leftaction or rightaction */
			"lefthittentacle", "righthittentacle", "lefthit", "righthit", "leftbanish", "rightbanish",
			/* feetaction */
			"feethit",
			/* mouthaction */
			"mouthbitetentacle",
		],
		brat: [
			/* leftaction or rightaction */
			"leftfold", "rightfold", "leftstruggleweak", "rightstruggleweak",
			/* feetaction */
			"feetHold",
			/* mouthaction */
			"mouthpullawaytentacle", "stifleorgasm", "stifle", "mouthlulltentacle",
			/* penisaction */
			"penispullawaytentacle",
			/* vaginaaction */
			"vaginapullawaytentacle",
			/* anusaction */
			"anuspullawaytentacle",
		],
		sub: [
			/* leftaction or rightaction */
			"leftgrabtentacle", "rightgrabtentacle", "leftrubtentacle", "rightrubtentacle", "showbottomtentacle", "showthighstentacle", "showmouthtentacle", "showpenistentacle", "showvaginatentacle", "leftgrab", "rightgrab", "leftrub", "rightrub", "showbottom", "showthighs", "showmouth",
			/* feetaction */
			"feetgrab", "feetrubtentacle",
			/* mouthaction */
			"mouthlicktentacle", "mouthkisstentacle", "mouthcooperatetentacle",
			/* penisaction */
			"penisrubtentacle", "peniscooperatetentacle",
			/* vaginaaction */
			"vaginarubtentacle", "vaginacooperatetentacle",
			/* anusaction */
			"anusrubtentacle", "anuscooperatetentacle",
			/* bottomuse */
			"bottomrubtentacle",
			/* breastuse */
			"chestrubtentacle",
		],
		meek: [
			/* leftaction or rightaction */
			"leftprotect", "rightprotect", "leftgrip", "rightgrip", "leftcurl", "rightcurl",
			/* feetaction */
			"feetCurl",
			/* mouthaction */
			"letout", "letoutorgasm", "noises",
		],
	},
	Vore: {
		brat: [
			"leftescape", "rightescape", "lefthold", "righthold", "leftvorefree", "rightvorefree", "leftfold", "rightfold", "leftstruggleweak", "rightstruggleweak", "feetHold",
		],
		meek: [
			"leftprotect", "rightprotect", "leftgrip", "rightgrip", "leftcurl", "rightcurl", "feetCurl",
		],
	},
	Swarm: {
		brat: [
			"leftfree", "rightfree", "frontpurgeleft", "frontpurgeright", "frontclearleft", "frontclearright", "backpurgeleft", "backpurgeright", "backclearleft", "backclearright", "chestclearleft", "chestclearright", "leftfold", "rightfold", "leftstruggleweak", "rightstruggleweak", "feetHold",
		],
		meek: [
			"leftprotect", "rightprotect", "leftgrip", "rightgrip", "leftcurl", "rightcurl", "feetCurl",
		],
		teal: ["swim"],
	},
	Struggle: {
		brat: [
			/* leftaction or rightaction */
			"mouth_strengthen", "mouth_grasp", "vagina_strengthen", "vagina_grasp", "penis_strengthen", "penis_grasp", "anus_strengthen", "anus_grasp", "chest_strengthen", "chest_grasp", "leftfold", "rightfold", "leftstruggleweak", "rightstruggleweak",
			/* feetaction */
			"feetHold",
		],
		meek: [
			/* leftaction or rightaction */
			"leftprotect", "rightprotect", "leftgrip", "rightgrip", "leftcurl", "rightcurl", "rest",
			/* feetaction */
			"evade", "plant", "feetCurl",
		],
		def: [
			/* leftaction or rightaction */
			"capture", "mouth_pull", "mouth_spray", "vagina_pull", "vagina_spray", "guard", "penis_pull", "penis_spray", "anus_pull", "anus_spray", "chest_pull", "chest_spray",
			/* mouthaction */
			"bite",
		],
		sub: [
			/* leftaction or rightaction */
			"mouth_stroke", "vagina_stroke", "penis_stroke", "anus_stroke", "chest_stroke",
			/* mouthaction */
			"open", "suck",
		],
	},
	Machine: {
		brat: ["leftfold", "rightfold", "leftstruggleweak", "rightstruggleweak", "vaginal_push", "anal_push", "feetHold"],
		def: ["chain_struggle", "whack", "vaginal_whack", "anal_whack"],
		meek: ["leftprotect", "rightprotect", "leftgrip", "rightgrip", "leftcurl", "rightcurl", "feetCurl"],
	},
	Self: {
		brat: [
			/* leftaction or rightaction */
			"leftfree", "rightfree", "leftcovervagina", "leftcoverpenis", "leftcoveranus", "rightcovervagina", "rightcoverpenis", "rightcoveranus", "leftunderpull", "leftskirtpull", "leftlowerpull", "leftupperpull", "rightunderpull", "rightskirtpull", "rightlowerpull", "rightupperpull", "leftfold", "rightfold", "leftstruggleweak", "rightstruggleweak", "feetHold",
		],
		meek: [
			/* leftaction or rightaction */
			"leftprotect", "rightprotect", "leftgrip", "rightgrip", "leftcurl", "rightcurl", "behind", "pickupSexToy",
			/* feetaction */
			"evade", "plant", "feetCurl",
		],
		sub: [
			/* Masturbate */
			"leftmasturbatepenis", "rightmasturbatepenis", "leftmasturbatepussy", "rightmasturbatepussy", "leftmasturbateanus", "rightmasturbateanus", "dildoSelfPussyEntrance", "dildoSelfAnusEntrance", "strokerSelfPenisEntrance", "strokerSelfPenis", "lubepussy", "lubepenis", "lubeanus", "removebuttplug",
		],
		teal: ["swim"],
	},
};
window.combatActionColours = combatActionColours;

function combatListColor(name, value, type) {
	const action = (value || V[name]).replace(/\d+/g, "");
	const encounterType = type || "Default";
	for (const color in combatActionColours[encounterType]) {
		if (combatActionColours[encounterType][color].includes(action)) return color;
	}
	return "white";
}
window.combatListColor = combatListColor;
DefineMacroS("combatListColor", combatListColor);

function combatButtonAdjustments(name, extra) {
	jQuery(document).on("change", "#listbox-" + name, { name, extra }, function (e) {
		/* console.log(e.data); */
		Wikifier.wikifyEval("<<replace #" + e.data.name + "Difficulty>><<" + e.data.name + "Difficulty" + e.data.extra + ">><</replace>>");
		$("#" + e.data.name + "Select").removeClass("whiteList bratList meekList defList subList");
		$("#" + e.data.name + "Select").addClass(combatListColor(e.data.name, undefined, e.data.extra) + "List");
	});
	return "";
}
DefineMacroS("combatButtonAdjustments", combatButtonAdjustments);

function combatDefaults() {
	jQuery(document).on("change", "#listbox--defaultoption", function (e) {
		Wikifier.wikifyEval("<<replace #othersFeelings>><<othersFeelings " + this.value + ">><</replace>>");
	});
	return "";
}
DefineMacroS("combatDefaults", combatDefaults);

/*
 * Explanation for the actionsSuccessPerSkill() function:
 * The following formula shows the old skill chance calculation.
 * (1000 - ($rng * 10) - ($enemytrust * 10) - $skill + $enemyanger) lte (($enemyarousalmax / ($enemyarousal + 1)) * 100)
 * Rearranged to
 * $skill + ($enemytrust * 10) + (($enemyarousalmax / ($enemyarousal + 1)) * 100) + ($rng * 10) gte 1000 + $enemyanger
 * The first half of the formula must be higher than the second half. So the higher the left values, the easier the action. The higher the right values, the harder the action.
 * $skill is the skill being used. That could be $handskill, $vaginalskill, $seductionskill, etc.
 * ($enemytrust * 10) is simply how much the NPC trust the player. Since $enemytrust can be negative, a bad trust can result in an increase in difficulty.
 * (($enemyarousalmax / ($enemyarousal + 1)) * 100) is the relative NPC arousal. This value can never be 100, except on the last turn.
 * The current arousal being divided by the max arousal means the higher the arousal (and by consequence the arousal percentage) the more difficult the action becomes (since the value will be lower).
 * This also means actions are more likely to succeed during the start of the combat and get harder as the combat goes on.
 * ($rng * 10) is simply the random part of the equation, so the chance is not always locked into one result. This value varies between 0 and 1000, at a base 10 (so it can't be anything that's not a multiple of 10).
 * 1000 is the base difficulty. This rules how high the skill needs to be if all other values are 0. The higher the base difficulty, the harder the action. This is usually the main factor determining the success of the action.
 * $enemyanger is just like the trust part, but not multiplied. This means anger has 10x less impact in the action than trust, however $enemyanger cannot be negative and could be much higher than trust.
 *
 * Another form of the formula is written as
 * (700 - ($rng * 10) - ($enemytrust * 10) - $handskill + $enemyanger) lte (($enemyarousalmax / ($enemyarousal + 1)) * $_npc.clothes[$_clothesTarget].integrity)
 * This is the difficulty to undress an NPC. The base difficulty is lower, but the arousal multiplier is different. The 100 multiplier is replaced by the NPC's clothes' integrity, which is often higher than 100. The more tattered the clothes, the harder to succeed in the action (the arousal side becomes lower).
 *
 * The function uses the following formula:
 * skill + trust + (arousalfactor * multiplier) + rng >= basedifficulty + anger
 * Which is the same as the previous formula, just renamed.
 * trust will always be $enemytrust * 10
 * arousalfactor will always be $enemyarousalmax / ($enemyarousal + 1)
 * multiplier, if not passed as an argument, will always be 100 (to complement the ($enemyarousalmax / ($enemyarousal + 1) * 100 format).
 * rng will always be $rng * 100
 * basedifficulty, if not passed as an argument, will always be 1000
 * anger is simply $enemyanger, renamed to fit in the format.
 * skill will be the selected skill. The function uses a required string argument which is skillname, being "hand", "vaginal", "seduction", etc. Whichever string is passed will be added to "skill" to make the skill variable.
 * E.g. the function passes "anal" as the only argument (and thus skillname is "anal"). skill will become the value of $analskill used in calculation.
 * So skillname is a string, and skill is an integer. Why not simply pass the skill value as the argument? Because of possible future variants, such as moor luck, affecting some variable and not the other.
 * targetid is an optional value, that doesn't see use currently but can possibly be required in the future in case any of the "enemy" variables (such as $enemyarousal or $enemytrust) become individual values ("per NPC", as health currently is).
 *
 * The output is simply: true if the action is a success, false if the action fails.
 */
/**
 * Checks skill value against combat math to determine success of an action.
 *
 * @param {string} skillname Simple skill name, "anus" "hand" "feet" etc.
 * @param {number} targetid The targetted NPC's id.
 * @param {number} npc The chosen NPC's fullDescription, used solely for check that determine if encounters remain consensual
 * @param {number} basedifficulty Difficulty of the check, default 1000.
 * @param {number} multiplier Multiplier on enemy arousal, default 100.
 * @returns {boolean}
 */
function combatSkillCheck(skillname, targetid = 0, npc = "", basedifficulty = 1000, multiplier = 100) {
	const skill = currentSkillValue(skillname + "skill");
	const rng = V.rng * 10;
	const arousalfactor = V.enemyarousalmax / (V.enemyarousal + 1);
	const trust = V.enemytrust * 10;
	const anger = V.enemyanger;

	if (arousalfactor * multiplier + skill + trust + rng >= basedifficulty + anger) {
		return true;
	} else if (["Alex", "Robin"].includes(npc) || (npc === "Sydney" && !V.loveDrunk) || (npc === "Great Hawk" && V.syndromebird) || V.consensualGuaranteed) {
		return true;
	} else {
		return false;
	}
}
window.combatSkillCheck = combatSkillCheck;

function hairdressersReset() {
	$(() =>
		$("#hairDressers").on("change", ".macro-listbox, .macro-radiobutton, .macro-checkbox", function (e) {
			Wikifier.wikifyEval("<<replace #hairDressers>><<hairDressersOptions>><</replace>>");
			Wikifier.wikifyEval('<<replace #currentCost>>To pay: £<<print _currentCost / 100>><</replace>><<numberify "#passages > .passage">>');
		})
	);
}
DefineMacro("hairdressersReset", hairdressersReset);

function hairdressersResetAlt() {
	$(() =>
		$("#hairDressersSydney").on("click", ".macro-cycle", function (e) {
			Wikifier.wikifyEval("<<replace #hairDressersSydney>><<hairDressersOptionsSydney>><</replace>>");
			Wikifier.wikifyEval('<<replace #currentCost>>To pay: £<<print _currentCost / 100>><</replace>><<numberify "#passages > .passage">>');
		})
	);
}
DefineMacro("hairdressersResetAlt", hairdressersResetAlt);

function browsDyeReset() {
	$(() =>
		jQuery(document).on("change", "#listbox-browsdyeoption", function (e) {
			Wikifier.wikifyEval("<<replace #browsColourPreview>><<browsColourPreview>><</replace>>");
		})
	);
}
DefineMacro("browsDyeReset", browsDyeReset);

function NPCSettingsReset() {
	jQuery(".passage").on("change", "#listbox--npcid", function (e) {
		Wikifier.wikifyEval("<<replace #npcSettingsMenu>><<npcSettingsMenu>><</replace>>");
	});
}
DefineMacro("NPCSettingsReset", NPCSettingsReset);

function loveInterestFunction() {
	jQuery(document).on("change", "#listbox-loveinterestprimary", function (e) {
		Wikifier.wikifyEval("<<replace #loveInterest>><<loveInterest>><</replace>>");
	});
	jQuery(document).on("change", "#listbox-loveinterestsecondary", function (e) {
		Wikifier.wikifyEval("<<replace #loveInterest>><<loveInterest>><</replace>>");
	});
	jQuery(document).on("change", "#listbox-loveinteresttertiary", function (e) {
		Wikifier.wikifyEval("<<replace #loveInterest>><<loveInterest>><</replace>>");
	});
}
DefineMacro("loveInterestFunction", loveInterestFunction);

function cheatPregnancyNPCReset() {
	jQuery("#customOverlayContent").on("change", "#listbox--pregnantnpcid", function (e) {
		Wikifier.wikifyEval("<<replace #cheatPregnancyNPC>><<cheatPregnancyNPC _pregnantNPCId>><</replace>>");
	});
}
DefineMacro("cheatPregnancyNPCReset", cheatPregnancyNPCReset);

function featsPointsMenuReset() {
	jQuery(document).on("change", "#listbox--upgradenameid", () => {
		Wikifier.wikifyEval("<<updateFeatsPointsMenu>>");
	});
	return "";
}
DefineMacroS("featsPointsMenuReset", featsPointsMenuReset);

function startingPlayerImageReset() {
	jQuery(document).on("change", "#settingsDiv .macro-radiobutton,#settingsDiv ,#settingsDiv .macro-checkbox", () => {
		Wikifier.wikifyEval("<<startingPlayerImageUpdate>>");
	});
	return "";
}
DefineMacroS("startingPlayerImageReset", startingPlayerImageReset);

function deck() {
	const names = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
	const suits = ["Hearts", "Diamonds", "Spades", "Clubs"];
	const cards = [];

	for (let s = 0; s < suits.length; s++) {
		for (let n = 0; n < names.length; n++) {
			cards.push({ value: n + 2, name: names[n], suits: suits[s] });
		}
	}

	return cards;
}
window.deck = deck;

function ordinalSuffixOf(i) {
	const j = i % 10;
	const k = i % 100;
	if (j === 1 && k !== 11) {
		return i + "st";
	}
	if (j === 2 && k !== 12) {
		return i + "nd";
	}
	if (j === 3 && k !== 13) {
		return i + "rd";
	}
	return i + "th";
}
window.ordinalSuffixOf = ordinalSuffixOf;

function ordinalWritten(i) {
	const ordinals = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth"];
	if (i > 0 && i < 10) return ordinals[i];

	const j = i % 10;
	const k = i % 100;
	if (j === 1 && k !== 11) return i + "st";
	if (j === 2 && k !== 12) return i + "nd";
	if (j === 3 && k !== 13) return i + "rd";
	return i + "th";
}
window.ordinalWritten = ordinalWritten;

/**
 * Given there are {deckCount} cards in the deck and {markedCount} of them have been marked by the player,
 *   calculates the chance that the player will see at least {atLeast} number of marked cards (from the top of the deck),
 *   provided they can only see up to {depth} cards from the top.
 *
 * Use this debug function to calculate the probability to tweak the max depth and max count values for game balance, for the mark cards cheat feature.
 *
 * For example, if the deck is standard (52 cards), the player can see up to 3 cards from the top and the player has marked 8 cards,
 *   the chance that they will see at least 1 card at the start of a round is calculateMarkedChance(52, 8, 3, 1) = 0.4 (which means they'll see at least 1 marked card in 40% of their games,
 *   the first round at least).
 * If that's too high of a chance, we could, for example, decrease their depth by 1, or decrease the max marked count by 2.
 *   Thus, calculateMarkedChance(52, 8, 2, 1) = 0.28, so 28%, and calculateMarkedChance(52, 6, 3, 1) = 0.31, so 31%.
 *
 * Arguably, seeing what card is third from the top is also less useful than being able to more consistently see the top card or the dealer's hole card, so
 *   it's worth assuming the REAL depth is 1/2 even if the value is passed as 3 (so while debugging, always also calculate with depth=1 or depth=2 and see if the number still seems fair).
 *
 * Also, note that the dealer's hole card is included in the depth. This means that if the depth is 3, then it calculates the chance the player will either see one of the top 2 cards or the dealer's second card.
 *
 * @param {number} deckCount  The number of cards in the deck.
 * @param {number} markedCount  The number of cards the player has (or can) mark in a deck.
 * @param {number} depth  How many cards the player can see from the top of the deck (including the dealer's hole card) (to identify if they're marked or not).
 * @param {number} atLeast  At least how many cards the player will see (from <depth> cards from the top of the deck).
 * @param {boolean} doLog = false, if true - logs the steps of the solution.
 * @returns {number} Percentage chance.
 */
function calculateMarkedChance(deckCount, markedCount, depth, atLeast, doLog = false) {
	// we calculate how many possible ways we can pull DEPTH amount of cards from the deck (and put them in the front of the deck)
	const totalEvents = nCr(deckCount, depth);
	const logMessages = [];
	const log = m => {
		if (doLog) {
			logMessages.push(m);
		}
	};
	log(`DEPTH=${depth} cards can be placed in front of the deck from a deck of ${deckCount} cards in ${deckCount}c${depth} = ${totalEvents} ways.`);

	let favorableEvents = 0;

	// as per the algorithm, we go from how many marked cards we need at the very least, to either how many marked cards there are, or to how deep we can go (whichever is the limit)
	const possibleMarkedCardsVisibleLimit = Math.min(markedCount, depth);
	for (let nMarkedPicked = atLeast; nMarkedPicked <= possibleMarkedCardsVisibleLimit; ++nMarkedPicked) {
		// we calculate how many possible ways we can pull a valid number of marked cards from the deck
		//   by dividing the cards into a pool of
		//	* marked cards (and calculating how many ways we can pull the valid nMarkedPicked cards from the pool of markedCount marked cards), nCr(markedCount, nMarkedPicked)
		//	* unmarked cards (and calculating how many ways we can pull the remaining possibleMarkedCardsVisibleLimit-nMarkedPicked non-marked cards from the pool of deck-markedCount unmarked cards), ncr(deck-markedCount, possibleMarkedCardsVisibleLimit-nMarkedPicked)
		//   and then we multiply the mutually exclusive combinations to get all possible combinations (cross-joins) of the two (since for each way we can pull (say) 1 marked card, there's the second number of ways we can pull the remaining non marked ones)
		const markedPoolWays = nCr(markedCount, nMarkedPicked);
		const unmarkedPoolWays = nCr(deckCount - markedCount, possibleMarkedCardsVisibleLimit - nMarkedPicked);
		const totalWays = markedPoolWays * unmarkedPoolWays;
		favorableEvents += totalWays;
		// log(`One marked card can be picked from MARKED=1 cards in 1c1 = 1 ways, and the remaining three (which are not marked) can be picked from DECK=5-MARKED=1 = 4 cards in 4c3 = 4 ways.
		log(
			`${nMarkedPicked} marked cards can be picked from MARKED=${markedCount} cards in ${markedCount}c${nMarkedPicked} = ${markedPoolWays} ways,` +
				`and the remaining ${deckCount - markedCount} (which are not marked) can be picked from DECK=${deckCount}-MARKED=${markedCount} = ${
					deckCount - markedCount
				} cards in ${deckCount - markedCount}c${possibleMarkedCardsVisibleLimit - nMarkedPicked} = ${unmarkedPoolWays} ways.\n` +
				`${markedPoolWays}*${unmarkedPoolWays} = ${totalWays} ways.`
		);
	}

	console.log(logMessages.join("\n"));
	return favorableEvents / totalEvents;
}
window.calculateMarkedChance = calculateMarkedChance;

function shuffle(o) {
	// prettier-ignore
	for (
		let j, x, i = o.length;
		i;
		j = parseInt(State.random() * i), x = o[--i], o[i] = o[j], o[j] = x
	);
	return o;
}
window.shuffle = shuffle;

function updateAskColour() {
	jQuery(document).on("change", "#listbox-askaction", function (e) {
		Wikifier.wikifyEval("<<replaceAskColour>>");
	});
	return "";
}
DefineMacroS("updateAskColour", updateAskColour);

function bulkProduceValue(foodstuff, quantity = 250) {
	if (foodstuff != null) {
		const baseCost = (foodstuff.shop.sell_price * quantity) / 2;
		const seasonBoost = foodstuff.tending?.seasons && !foodstuff.tending.seasons.includes(Time.season) ? 1.1 : 1;
		return Math.floor(baseCost * seasonBoost);
	}
}
window.bulkProduceValue = bulkProduceValue;

function toTitleCase(str) {
	const exclude = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "if", "in", "of", "on", "or", "the", "to", "up", "yet"]);
	return str.toLowerCase().replace(/\b\w[\w']*\b/g, (word, i) => {
		return exclude.has(word) && i !== 0 ? word : word.toUpperFirst();
	});
}
window.toTitleCase = toTitleCase;

function camelCaseToTitle(str) {
	return str.replace(/([A-Z])/g, " $1").toUpperFirst();
}
window.camelCaseToTitle = camelCaseToTitle;

function toCamelCase(str) {
	return str
		.split(/[ _-]/g)
		.map((str, index) => {
			if (index) return str.toLocaleUpperFirst();
			return str;
		})
		.join("");
}
window.toCamelCase = toCamelCase;

function numbersBetween(start, end, step = 1) {
	return Array.from({ length: (end - start) / step + 1 }, (_, i) => start + i * step);
}
window.numbersBetween = numbersBetween;

function getRobinLocation() {
	if (C.npc.Robin.init !== 1) {
		return;
	} else if (V.robinlocationoverride && V.robinlocationoverride.during.includes(Time.hour)) {
		T.robin_location = V.robinlocationoverride.location;
	} else if (["docks", "landfill", "dinner", "pillory", "mansion"].includes(V.robinmissing)) {
		T.robin_location = V.robinmissing;
	} else if (!between(Time.hour, 7, 20)) {
		// if hour is 6 or lower, or 21 or higher.
		T.robin_location = "sleep";
	} else if (
		V.gwylanSeen?.includes("cafe_walk_robin") &&
		V.robin.timer.hurt === 0 &&
		V.daily.robin_in_cafe &&
		!between(V.chef_state, 7, 8) &&
		Time.schoolDay &&
		Time.hour === 8 &&
		Time.minute < 50
	) {
		// Disabled for the time being.
		// T.robin_location = "cafe";
	} else if (Time.schoolDay && between(Time.hour, 8, 15)) {
		T.robin_location = "school";
		// Start bathing time half an hour later if Robin has been asked to water the player's garden
		// Robin will only water if crops are planted, will not water in the rain at all, and will not water during snow before the greenhouse is built
	} else if (
		V.robin.autoWater &&
		C.npc.Robin.trauma < 50 &&
		Weather.precipitation !== "rain" &&
		(Weather.precipitation !== "snow" || V.alex_greenhouse >= 3) &&
		((Time.hour === 16 && between(Time.minute, 30, 59)) || (Time.hour === 17 && between(Time.minute, 0, 29))) &&
		orphanagePlotsPlanted()
	) {
		if (Time.hour === 16 && between(Time.minute, 30, 59) && !orphanagePlotsWatered()) {
			T.robin_location = "garden";
		} else if (!V.daily.robin.bath) {
			T.robin_location = "bath";
		} else {
			T.robin_location = "orphanage";
		}
	} else if (Time.hour === 16 && between(Time.minute, 30, 59)) {
		if (!V.daily.robin.bath) {
			T.robin_location = "bath";
		} else {
			T.robin_location = "orphanage";
		}
	} else if (V.halloween === 1 && between(Time.hour, 16, 18) && Time.monthDay === 31) {
		T.robin_location = "halloween";
	} else if (Time.isWeekEnd() && between(Time.hour, 9, 16) && Weather.precipitation !== "rain" && C.npc.Robin.trauma < 80) {
		T.robin_location = Time.season === "winter" ? "park" : "beach";
	} else if (V.englishPlay === "ongoing" && V.englishPlayDays === 0 && Time.hour >= 17 && Time.hour < 21) {
		T.robin_location = "englishPlay";
	} else {
		T.robin_location = "orphanage";
	}
	return T.robin_location;
}
window.getRobinLocation = getRobinLocation;

function setRobinLocationOverride(loc, hour) {
	const override = {
		location: loc,
		during: [],
	};
	if (Array.isArray(hour)) override.during = hour;
	else override.during = [hour];
	// note: overrides get reset at midnight (in the <<day>> widget)
	V.robinlocationoverride = override;
}
window.setRobinLocationOverride = setRobinLocationOverride;

function getRobinCrossdressingStatus(crossdressLevel) {
	// Note returns 2 if Robin is crossdressing or 0 if not comfortable enough at that location
	// Traumatised Robin will not crossdress.
	if (C.npc.Robin.init !== 1) {
		return;
	}
	T.robin_cd = 0;
	if (C.npc.Robin.trauma >= 40) {
		return;
	}
	switch (getRobinLocation()) {
		case "orphanage":
		case "sleep":
			if (crossdressLevel >= 2) T.robin_cd = 2;
			break;
		case "park":
		case "beach":
			if (crossdressLevel >= 4) T.robin_cd = 2;
			break;
		case "school":
			if (crossdressLevel >= 5) T.robin_cd = 2;
			break;
		case "missing":
			T.robin_cd = 0;
			break;
		default:
			T.robin_cd = 0;
	}
	return T.robin_cd;
}
window.getRobinCrossdressingStatus = getRobinCrossdressingStatus;

/*
	TEMPORARY - remove once obsolete
	Temporary function until location framework is in place - to detect if an NPC is in the park
	Uses same checks as other Park NPC checks
 */
function isInPark(name) {
	switch (name.toLowerCase()) {
		case "kylar":
			// prettier-ignore
			return C.npc.Kylar.state === "active"
				&& Weather.precipitation === "none"
				&& Time.dayState === "day" && !Time.schoolTime
				&& V.kylarwatched !== 1;
		case "robin":
			return getRobinLocation() === "park";
		case "whitney":
			// prettier-ignore
			return ["active", "rescued"].includes(C.npc.Whitney.state)
				&& C.npc.Whitney.init === 1 && Weather.precipitation !== "none"
				&& Time.dayState === "day" && !Time.schoolTime
				&& V.daily.whitney.park === undefined && V.pillory.tenant.special.name !== "Whitney";
		case "doren":
			// prettier-ignore
			return C.npc.Doren.init === 1
				&& Time.hour >= 9 && Time.hour <= 15
				&& Time.weekDay === 7;
		case "sam":
			// prettier-ignore
			return C.npc.Sam.init === 1
				&& (Time.hour >= 6 && Time.hour < 7 && Time.minute <= 55)
				&& Weather.precipitation === "none";
		default:
			return false;
	}
}
window.isInPark = isInPark;

window.DefaultActions = {
	create(isMinimal = false, preload = false) {
		let storage = {};
		setup.actionsTypes.combatTypes.forEach(type => {
			storage[type] = {};
			// Decides whether you create all permutations of the structure.
			// Usually set isMinimal if saving to file for reduced memory.
			if (!isMinimal) {
				setup.actionsTypes.personTypes.forEach(person => {
					storage[type][person] = {};
					setup.actionsTypes.actionTypes.forEach(part => {
						if (person === "Tentacles" && part === "askActions") {
							// Do not add askActions to tentacle enemies.
							return;
						} else if (person !== "Tentacles" && part === "regrab") {
							// Do not add regrab to non-tentacle enemies.
							return;
						}
						storage[type][person][part] = [];
					});
				});
			}
		});
		if (preload) {
			// Load old actions into new structure.
			storage = this.loadOld(V.actionDefaults, storage);
		}
		return storage;
	},
	check(storage) {
		if (storage === undefined) {
			return;
		}
		if (storage.consensual === undefined || storage.rape === undefined) {
			storage = this.create(true, true);
		}
		return storage;
	},
	setup(recreate = false) {
		if (recreate || V.actionDefaults === undefined) {
			return this.create(true);
		}
		return V.actionDefaults;
	},
	load(from = {}) {
		Object.keys(from).forEach(type => {
			Object.keys(from[type]).forEach(person => {
				Object.keys(from[type][person]).forEach(part => {
					const actions = this.get(type, person, part);
					if (Array.isArray(actions)) {
						actions.forEach(action => {
							from[type][person][part].pushUnique(action);
						});
					} else {
						if (part === "regrab") {
							const action = actions ? 1 : 0;
							from[type][person][part].pushUnique(action);
						}
					}
				});
			});
		});
		return from;
	},
	loadOld(from, to) {
		setup.actionsTypes.personTypes.forEach(person => {
			setup.actionsTypes.combatTypes.forEach(type => {
				setup.actionsTypes.actionTypes.forEach(part => {
					const actions = this.get(person, type, part, from);
					if (Array.isArray(actions)) {
						actions.forEach(action => {
							this.add(type, person, part, action, { value: to });
						});
					} else {
						if (part === "regrab") {
							const action = actions ? 1 : 0;
							this.add(type, person, part, action, { value: to });
						}
					}
				});
			});
		});
		return to;
	},
	save(from, callback = this.add) {
		if (from === undefined) {
			return;
		}
		V.actionDefaults = this.setup(true);
		// Assume the structure is valid.
		const defaultTypes = Object.keys(from);
		defaultTypes.forEach(type => {
			const defaultPeople = Object.keys(from[type]);
			defaultPeople.forEach(person => {
				const defaultParts = Object.keys(from[type][person]);
				defaultParts.forEach(part => {
					const actionSets = from[type][person][part];
					if (actionSets !== undefined) {
						actionSets.forEach(action => {
							if (part === "regrab") {
								action = action ? 1 : 0;
							}
							callback(type, person, part, action, { value: V.actionDefaults });
						});
					}
				});
			});
		});
	},
	add(type, person, part, action, to = { value: V.actionDefaults }) {
		if (action === "rest") {
			return;
		}
		if (to.value[type][person] === undefined) {
			to.value[type][person] = {};
		}
		if (to.value[type][person][part] === undefined) {
			to.value[type][person][part] = [];
		}
		to.value[type][person][part].pushUnique(action);
	},
	addMany(type, person, part, actions, to = { value: V.actionDefaults }) {
		// This function should take a list of actions, for a given type (rape/consensual)
		// and a given person (submissive, defiant, tentacles?)
		// and a given part (leftaction, rightaction, etc.. down to regrab?)
		// and add them to the actionDefaults.

		// This filters actions down to any actions that aren't "rest",
		// or where part is regrab -> truthy/falsy value of each action.
		const filteredActions = part === "regrab" ? actions.map(action => !!action) : actions.filter(action => action !== "rest");

		if (!filteredActions.length) {
			return;
		}
		if (to.value[type][person] === undefined) {
			to.value[type][person] = {};
		}
		if (to.value[type][person][part] === undefined) {
			to.value[type][person][part] = [];
		}
		filteredActions.forEach(action => {
			to.value[type][person][part].pushUnique(action);
		});
	},
	get(type, person, part, from = V.actionDefaults, defaultValue = "rest") {
		if (from[type] === undefined || from[type][person] === undefined || from[type][person][part] === undefined) {
			return [defaultValue];
		}
		return from[type][person][part];
	},
	setDefaults() {
		V.actionDefaults = this.create(true);
		let type = "rape";
		this.addMany(type, "Submissive", "leftaction", ["leftchest", "leftgrip", "leftprotect"]);
		this.addMany(type, "Submissive", "rightaction", ["rightchest", "rightgrip", "rightprotect"]);
		this.addMany(type, "Submissive", "mouthaction", ["plead", "suck", "breastsuck", "breastlick", "vaginalick", "letoutorgasm", "letout"]);
		this.addMany(type, "Submissive", "penisaction", ["tease", "cooperate"]);
		this.addMany(type, "Submissive", "vaginaaction", ["penistease", "cooperate"]);
		this.addMany(type, "Submissive", "anusaction", ["penistease", "cooperate"]);
		this.addMany(type, "Submissive", "feetaction", ["grabrub", "grabrub", "vaginagrabrub", "feetCurl"]);
		this.addMany(type, "Defiant", "leftaction", ["lefthit", "leftstruggle"]);
		this.addMany(type, "Defiant", "rightaction", ["penwhack", "righthit", "rightstruggle", "hypnosiswhack"]);
		this.addMany(type, "Defiant", "mouthaction", ["headbutt", "pullaway", "bite", "handbite", "breastbite", "bitepussy", "demand"]);
		this.addMany(type, "Defiant", "penisaction", ["escape", "otheranusescape", "othermouthescape"]);
		this.addMany(type, "Defiant", "vaginaaction", ["escape", "othermouthescape"]);
		this.addMany(type, "Defiant", "anusaction", ["escape", "othermouthescape"]);
		this.addMany(type, "Defiant", "feetaction", ["kick"]);
		this.addMany(type, "Tentacles", "regrab", [0]);
		type = "consensual";
		this.addMany(type, "Submissive", "leftaction", ["leftchest", "leftgrip", "leftprotect"]);
		this.addMany(type, "Submissive", "rightaction", ["rightchest", "rightgrip", "rightprotect"]);
		this.addMany(type, "Submissive", "mouthaction", ["kiss", "suck", "breastsuck", "breastlick", "vaginalick", "kissskin", "letoutorgasm", "letout"]);
		this.addMany(type, "Submissive", "penisaction", ["tease", "cooperate"]);
		this.addMany(type, "Submissive", "vaginaaction", ["penistease", "cooperate"]);
		this.addMany(type, "Submissive", "anusaction", ["penistease", "cooperate"]);
		this.addMany(type, "Submissive", "feetaction", ["feetCurl"]);
		this.addMany(type, "Defiant", "leftaction", [0]);
		this.addMany(type, "Defiant", "rightaction", ["penwhack"]);
		this.addMany(type, "Defiant", "mouthaction", ["breastpull", "breastclosed"]);
		this.addMany(type, "Defiant", "penisaction", ["escape", "otheranusescape", "othermouthescape"]);
		this.addMany(type, "Defiant", "vaginaaction", ["escape", "othermouthescape"]);
		this.addMany(type, "Defiant", "anusaction", ["escape", "othermouthescape"]);
		this.addMany(type, "Tentacles", "regrab", [0]);
		return V.actionDefaults;
	},
};

function selectWardrobe(targetLocation = V.wardrobe_location, type) {
	let wardrobe = V.wardrobes[targetLocation];
	if (type !== "return" && wardrobe?.locationRequirement?.length && !wardrobe.locationRequirement.includes(V.location)) {
		V.wardrobe_location = "wardrobe";
		wardrobe = V.wardrobe;
	}
	return !targetLocation || targetLocation === "wardrobe" || !V.wardrobes[targetLocation] ? V.wardrobe : wardrobe;
}
window.selectWardrobe = selectWardrobe;

function transferClothing(slot, index, newWardrobe) {
	let oldWardrobeObject;
	if (V.wardrobe_location === "wardrobe") {
		oldWardrobeObject = V.wardrobe;
	} else {
		oldWardrobeObject = V.wardrobes[V.wardrobe_location];
	}
	let newWardrobeObject;
	if (newWardrobe === "wardrobe") {
		newWardrobeObject = V.wardrobe;
	} else {
		newWardrobeObject = V.wardrobes[newWardrobe];
	}
	if (oldWardrobeObject && newWardrobeObject) {
		newWardrobeObject[slot].push(oldWardrobeObject[slot][index]);
		oldWardrobeObject[slot].deleteAt(index);
	}
}
window.transferClothing = transferClothing;

function clothingData(slot, item, data) {
	if (item[data] !== undefined) return item[data];
	return setup.clothes[slot][clothesIndex(slot, item)][data];
}
window.clothingData = clothingData;

/**
 * @param {ClothedSlots} slot
 * @param {ClothesItem} item
 * @returns {ClothesItem}
 */
function getSetupClothing(slot, item) {
	return setup.clothes[slot][clothesIndex(slot, item)];
}
window.getSetupClothing = getSetupClothing;

function clothesDataTrimmerLoop() {
	if (!V.passage || V.passage === "Start") return;
	const wardrobeKeys = Object.keys(V.wardrobes);
	setup.clothes_all_slots.forEach(slot => {
		clothesDataTrimmer(V.worn[slot]);
		clothesDataTrimmer(V.carried[slot]);
		if (Array.isArray(V.wardrobe[slot])) {
			V.wardrobe[slot].forEach(item => {
				clothesDataTrimmer(item);
			});
		}
		if (Array.isArray(V.store[slot])) {
			V.store[slot].forEach(item => {
				clothesDataTrimmer(item);
			});
		}

		for (let i = 0, l = wardrobeKeys.length; i < l; i++) {
			if (Array.isArray(V.wardrobes[wardrobeKeys[i]][slot])) {
				V.wardrobes[wardrobeKeys[i]][slot].forEach(item => {
					clothesDataTrimmer(item);
				});
			}
		}
		if (V.tryOn !== undefined) {
			if (V.tryOn.ownedStored !== undefined) {
				if (V.tryOn.ownedStored[slot] !== undefined && V.tryOn.ownedStored[slot] !== null) {
					clothesDataTrimmer(V.tryOn.ownedStored[slot]);
				}
			}
			if (V.tryOn.tryingOn !== undefined) {
				if (V.tryOn.tryingOn[slot] !== undefined && V.tryOn.tryingOn[slot] !== null) {
					clothesDataTrimmer(V.tryOn.tryingOn[slot]);
				}
			}
		}
	});
}
window.clothesDataTrimmerLoop = clothesDataTrimmerLoop;

/*
	Be aware, the shop is excluded from this, clothing items in every other situation requires one of the below methods
	Setup example - setup.clothes.upper[clothesIndex('upper',$worn.upper)].name_cap
	clothingData example - clothingData(_slot, $worn[_slot], "integrity_max")

	The `clothingData example`, allows you to add the variable back to override the setup variant, for example, if you want to increase `integrity_max`

	If any use the `Setup example` and you want to override variables like the `clothingData example`, every instance needs to be converted first, please update the comment below if you do
*/
function clothesDataTrimmer(item) {
	if (!item) return;
	const toDelete = [
		"name_cap", // use `Setup example`
		"iconFile", // use `Setup example`
		"accIcon", // use `Setup example`
		"notuck", // use `Setup example`
		"skirt", // use `Setup example`
		"description", // use `Setup example`
		"colour_options", // use `Setup example`
		"accessory_colour_options", // use `Setup example`
		"pattern_colour_options", // use `Setup example`
		"fabric_strength", // use `clothingData example`
		"integrity_max", // use `clothingData example`
		"bustresize", // use `clothingData example`
		"sleeve_img", // use `Setup example`
		"breast_img", // use `Setup example`
		"exposed_base", // use `Setup example`
		"vagina_exposed_base", // use `Setup example`
		"anus_exposed_base", // use `Setup example`
		"state_top_base", // use `Setup example`
		"state_base", // use `Setup example`
		"word", // use `Setup example`
		"femininity", // use `Setup example`
		"strap", // use `Setup example`
		"cost", // use `Setup example`
		"shop", // use `Setup example`, should never be added back on to clothing items due to being in `trimmerVersion`
		"short", // use `Setup example`, should never be added back on to clothing items due to being in `trimmerVersion`
		"oldVariable", // use `Setup example`, should never be added back on to clothing items due to being in `trimmerVersion`
		"altDamage", // use `Setup example`
		"hideUnderLower", // use `Setup example`, should never be added back on to clothing items due to being in `trimmerVersion`
		"combat", // use `Setup example`, safe to remove from here as long as also removed from `trimmerVersion`
		"shopGroup", // use `Setup example`, safe to remove from here as long as also removed from `trimmerVersion`
	];
	// To prevent it from running on variables multiple times, when updating toDelete, the last of the new additions should be added here
	const trimmerVersion = ["shop", "short", "oldVariable", "hideUnderLower", "combat", "shopGroup"];
	let version = 0;
	let indexToUpdateVersion = toDelete.indexOf(trimmerVersion[version]);
	toDelete.forEach((v, index) => {
		if (indexToUpdateVersion === -1) {
			// Do Nothing
		} else if (item[v] !== undefined && item[trimmerVersion[version]] !== undefined) {
			delete item[v];
		}
		if (indexToUpdateVersion === index) {
			version++;
			indexToUpdateVersion = toDelete.indexOf(trimmerVersion[version]);
		}
	});
}
window.clothesDataTrimmer = clothesDataTrimmer;

function clothesReturnLocation(item, type) {
	if (!V.settings.multipleWardrobes) return "wardrobe";
	const isolated = ["asylum", "prison"];
	let lastTaken = item.lastTaken;
	// prettier-ignore
	if (
		!lastTaken ||
		(V.settings.multipleWardrobes !== "all" && !isolated.includes(lastTaken)) ||
		!V.wardrobes[lastTaken] ||
		!V.wardrobes[lastTaken].unlocked
	) {
		lastTaken = "wardrobe";
	}
	switch (type) {
		case "rebuy":
			if (isolated.includes(V.location) && item.type.includes(V.location)) return V.location;
			break;
		default:
			if (isolated.includes(V.location)) return V.location;
	}
	if (!isolated.includes(lastTaken)) return lastTaken;
	return "wardrobe";
}
window.clothesReturnLocation = clothesReturnLocation;

function resetClothingState(slot) {
	if (!slot || slot === "genitals") return;
	const setupItem = setup.clothes[slot][clothesIndex(slot, V.worn[slot])];
	// Overwrite the following properties of $worn[slot], IF the corresponding properties are defined in the setupItem.
	// Note that no single item actually has ALL of these properties; It only changes the properties that DO exist on the item.
	V.worn[slot] = {
		...V.worn[slot],
		...Object.fromEntries(
			Object.entries({
				state: setupItem.state_base,
				state_top: setupItem.state_top_base,
				exposed: setupItem.exposed_base,
				skirt_down: setupItem.skirt_down,
				vagina_exposed: setupItem.vagina_exposed_base,
				anus_exposed: setupItem.anus_exposed_base,
			}).filter(([_, p]) => p != null)
		),
	};
}
window.resetClothingState = resetClothingState;

/* Returns array of clothing items that are stored in [loc] */
function clothingInStorage(loc) {
	if (loc == null) return;
	const clothing = [];
	for (const slot of setup.clothingLayer.all) {
		const item = V.store[slot].find(item => item.location === loc);
		if (item && !item.outfitSecondary) {
			item.slot = slot;
			clothing.push(item);
		}
	}
	return clothing;
}
window.clothingInStorage = clothingInStorage;

/* Returns name of the current worn outfit, or "none" if no matches are found */
function currentOutfit() {
	const compareOutfit = outfit => {
		for (const slot of setup.clothingLayer.all) {
			if (V.worn[slot].name !== (outfit[slot] || "naked")) return false;
		}
		return true;
	};
	for (const outfit of V.outfit) {
		if (compareOutfit(outfit)) return outfit.name;
	}
	return "none";
}
window.currentOutfit = currentOutfit;

function isConnectedToHood(slot) {
	// Note: this function currently only works on hoods in the "head" slot, NOT the "over_head" slot.

	// Return false if slot is undefined or not a valid clothing category
	if (!slot || !V.worn[slot]) return false;
	// Return true if this item IS a hood
	if (V.worn[slot].hood && V.worn[slot].outfitSecondary[1] !== "broken" && V.worn[slot].outfitSecondary[1] !== "split") return true;

	// Use the primary clothing slot for the next check if this item is connected to an outfit (and is not the primary item)
	if (V.worn[slot].outfitSecondary && V.worn[slot].outfitSecondary[1] !== "broken" && V.worn[slot].outfitSecondary[1] !== "split") {
		slot = V.worn[slot].outfitSecondary[0];
	}
	if (
		V.worn[slot].hoodposition &&
		(V.worn[slot].hoodposition === "down" ||
			(V.worn[slot].hoodposition === "up" &&
				V.worn[slot].outfitPrimary.head !== "broken" &&
				V.worn[slot].outfitPrimary.head !== "split" &&
				V.worn.head.hood === 1))
	) {
		return true;
	}
	return false;
}
window.isConnectedToHood = isConnectedToHood;

// the 'modder' variable is specifically for modders name, should be kept as a short string
function clothesIndex(slot, itemToIndex) {
	if (!slot || !itemToIndex || !itemToIndex.name || !itemToIndex.variable) {
		/* console.log(`clothesIndex - slot or valid object not provided`); */
		Errors.report(`[clothesIndex]: slot or valid object not provided`, {
			Stacktrace: Utils.GetStack(),
			slot,
			itemToIndex,
		});
		return 0;
	}
	const index = setup.clothes[slot].findIndex(item => item.variable === itemToIndex.variable && item.modder === itemToIndex.modder);
	if (index === -1) {
		console.log(`clothesIndex - ${slot} clothing item index not found for the '${itemToIndex.name}' with the modder set to '${itemToIndex.modder}'`);
		/* try and correct .modder mismatches */
		let oldVariable = false;
		let matches = setup.clothes[slot].filter(item => item.variable === itemToIndex.variable);
		if (matches.length === 0) {
			/* try to find and item that had its variable changed */
			matches = setup.clothes[slot].filter(
				item =>
					Array.isArray(item.oldVariable) &&
					item.oldVariable.find(oldVariableItem => oldVariableItem.name === itemToIndex.name && oldVariableItem.variable === itemToIndex.variable)
			);
			oldVariable = true;
		}
		if (matches.length === 1) {
			const recovery = matches[0];
			itemToIndex.index = recovery.index;
			itemToIndex.modder = recovery.modder;
			if (oldVariable) {
				itemToIndex.name = recovery.name;
				itemToIndex.name_cap = recovery.name_cap;
				itemToIndex.variable = recovery.variable;
				itemToIndex.set = recovery.set;
				itemToIndex.iconFile = recovery.iconFile;
				if (recovery.outfitPrimary) {
					Object.entries(recovery.outfitPrimary).forEach(([key, value]) => {
						if (itemToIndex.outfitPrimary && (itemToIndex.outfitPrimary[key] === "broken" || itemToIndex.outfitPrimary[key] === "split")) {
							// Do Nothing
						} else {
							itemToIndex.outfitPrimary[key] = value;
						}
					});
					itemToIndex.outfitPrimary = recovery.outfitPrimary;
				}
				if (recovery.outfitSecondary && itemToIndex.outfitSecondary[1] !== "broken" && itemToIndex.outfitSecondary[1] !== "split")
					itemToIndex.outfitSecondary[1] = recovery.outfitSecondary[1];
			}
			console.log(`attempting to recover the mismatch, new index is '${recovery.index}'`);
			return recovery.index;
		} else {
			console.log("recovery failed, matches: " + matches);
			return 0;
		}
	}
	return index;
}
window.clothesIndex = clothesIndex;

function currentSkillValue(skill, disableModifiers = 0) {
	let result = V[skill];
	if (!result && result !== 0) {
		/* console.log(`currentSkillValue - skill '${skill}' unknown`); */
		Errors.report(`[currentSkillValue]: skill '${skill}' unknown.`, {
			Stacktrace: Utils.GetStack(),
			skill,
		});
		return 0;
	}
	// Prevents infinite loops, any call to `currentSkillValue` in this function should be written like 'currentSkillValue("skillName", disableModifiers + 1)'
	if (disableModifiers >= 2) return result;
	if (
		// prettier-ignore
		[
			"skulduggery", "physique", "danceskill", "swimmingskill", "athletics", "willpower", "tending", "science", "maths", "english", "history", "housekeeping"
		].includes(skill) &&
		V.moorLuck > 0
	) {
		result = Math.floor(result * (1 + V.moorLuck / 100));
	}
	if (["physique", "danceskill", "swimmingskill", "athletics"].includes(skill) && playerBellySize() >= 10 && playerNormalPregnancyTotal() < 50) {
		switch (playerNormalPregnancyTotal()) {
			case 0:
				T.pregnancyModifier = 36;
				break;
			case 1:
				T.pregnancyModifier = 48;
				break;
			case 2:
				T.pregnancyModifier = 60;
				break;
			case 3:
			case 4:
			case 5:
				T.pregnancyModifier = 78;
				break;
			case 6:
			case 7:
				T.pregnancyModifier = 96;
				break;
			default:
				T.pregnancyModifier = 120;
				break;
		}
		result = Math.floor(result * (1 - playerBellySize() / T.pregnancyModifier));
	}
	switch (skill) {
		case "skulduggery":
			if (V.worn.hands.type.includes("sticky_fingers")) result = Math.floor(result * 1.05);
			if (V.transformationParts.traits.sharpEyes !== "disabled") result = Math.floor(result * 1.05);
			if (V.fox >= 6) result = Math.floor(result * 1.1);
			break;
		case "physique":
			if (["forest", "moor", "farm", "alex_farm"].includes(V.location)) {
				if (V.worn.feet.type.includes("heels")) {
					result = Math.floor(result * (1 - V.worn.feet.reveal / 5000));
				}
				if (V.worn.feet.type.includes("rugged")) {
					result = Math.floor(result * (1 + currentSkillValue("feetskill", disableModifiers + 1) / 10000));
				}
			}
			if (V.auriga_artefact === "pc") {
				result = Math.floor(result * 1.1);
			}
			break;
		case "danceskill":
			if (
				V.worn.under_upper.type.includesAny("dance", "naked") &&
				V.worn.under_lower.type.includesAny("dance", "naked") &&
				V.worn.upper.type.includesAny("dance", "naked") &&
				V.worn.lower.type.includesAny("dance", "naked")
			) {
				result = Math.floor(result * 1.05);
			}
			if (V.worn.feet.type.includes("shackle")) {
				result = Math.floor(result * 0.5);
			}
			if (V.worn.upper.type.includes("heavy") || V.worn.lower.type.includes("heavy")) {
				result *= V.physique / V.physiquesize / 3;
			}
			break;
		case "swimmingskill":
			if (
				V.worn.under_upper.type.includesAny("swim", "naked") &&
				V.worn.under_lower.type.includesAny("swim", "naked") &&
				V.worn.upper.type.includesAny("swim", "naked") &&
				V.worn.lower.type.includesAny("swim", "naked")
			) {
				result = Math.floor(result * 1.05);
			}
			if (V.worn.feet.type.includes("swim")) {
				result = Math.floor(result * (1 + currentSkillValue("feetskill", disableModifiers + 1) / 10000));
			} else if (V.worn.feet.type.includes("heels")) {
				result = Math.floor(result * (0.8 + currentSkillValue("feetskill", disableModifiers + 1) / 10000));
			} else if (!V.worn.feet.type.includes("naked")) {
				result = Math.floor(result * (0.9 + currentSkillValue("feetskill", disableModifiers + 1) / 10000));
			}
			if (V.worn.feet.type.includes("shackle")) {
				result = Math.floor(result * 0.5);
			}
			if (V.worn.upper.type.includes("heavy") || V.worn.lower.type.includes("heavy")) {
				result *= V.physique / V.physiquesize / 3;
			}
			break;
		case "athletics":
			if (["forest", "moor", "farm", "alex_farm"].includes(V.location)) {
				if (V.worn.feet.type.includes("heels")) {
					result = Math.floor(result * (1 - V.worn.feet.reveal / 5000));
				}
				if (V.worn.feet.type.includes("rugged")) {
					result = Math.floor(result * (1 + currentSkillValue("feetskill", disableModifiers + 1) / 10000));
				}
			}
			if (V.transformationParts.traits.chase !== "disabled") result = Math.floor(result * 1.1);
			if (V.worn.feet.type.includes("shackle")) result /= 10;
			if (V.worn.upper.type.includes("heavy") || V.worn.lower.type.includes("heavy")) {
				result *= V.physique / V.physiquesize / 1.5;
			}
			break;
		case "willpower":
			if (numberOfEarSlime() >= 2 && V.earSlime.growth > 50) {
				result = Math.floor(result * (0.9 - Math.clamp((V.earSlime.growth - 50) / 1000, 0, 0.1)));
			} else if (numberOfEarSlime() >= 2) {
				result = Math.floor(result * 0.9);
			}
			break;
		case "tending":
			if (V.backgroundTraits.includes("plantlover")) {
				result = Math.floor(result * (1 + V.trauma / (V.traumamax * 2)));
			}
			break;
		case "housekeeping":
			if (V.worn.upper.type.includes("maid")) {
				result = Math.floor(result * 1.05);
			}
			if (V.worn.lower.type.includes("maid")) {
				result = Math.floor(result * 1.05);
			}
			if (V.worn.head.type.includes("maid")) {
				result = Math.floor(result * 1.05);
			}
			if (V.worn.handheld.type.includes("maid")) {
				result = Math.floor(result * 1.05);
			}
			break;
		case "vaginalskill":
			if (V.earSlime.growth > 100) {
				if (V.earSlime.focus === "pregnancy") {
					result = Math.floor(result * (1 + (V.earSlime.growth - 100) / 500));
				} else if (V.earSlime.focus === "impregnation") {
					result = Math.floor(result * (1 - (V.earSlime.growth - 100) / 400));
				}
			}
			if (playerHeatMinArousal()) {
				result = Math.floor(result * (1 + Math.clamp(playerHeatMinArousal(), 0, 4000) / 20000));
			}
			break;
		case "penileskill":
			if (V.earSlime.growth > 100) {
				if (V.earSlime.focus === "impregnation") {
					result = Math.floor(result * (1 + (V.earSlime.growth - 100) / 500));
				} else if (V.earSlime.focus === "pregnancy") {
					result = Math.floor(result * (1 - (V.earSlime.growth - 100) / 400));
				}
			}
			if (playerRutMinArousal()) {
				result = Math.floor(result * (1 + Math.clamp(playerRutMinArousal(), 0, 4000) / 20000));
			}
			break;
		case "analskill":
			if (V.earSlime.growth > 100 && !V.player.vaginaExist && V.earSlime.focus === "pregnancy") {
				result = Math.floor(result * (1 + (V.earSlime.growth - 100) / 500));
			}
			if (playerHeatMinArousal() && canBeMPregnant()) {
				result = Math.floor(result * (1 + Math.clamp(playerHeatMinArousal(), 0, 4000) / 20000));
			}
			break;
		case "seductionskill":
			if (V.earSlime.growth > 50 && !V.earSlime.defyCooldown) {
				result = Math.floor(result * (1 + (V.earSlime.growth - 50) / 600));
			}
			break;
	}
	return result;
}
window.currentSkillValue = currentSkillValue;

/**
 * @param {string} input
 */
function sexStatNameMapper(input) {
	switch (input) {
		case "p":
		case "promiscuity":
		case "promiscuous":
			return "promiscuity";
		case "e":
		case "exhibitionism":
		case "exhibition":
		case "exhibitionist":
			return "exhibitionism";
		case "d":
		case "deviancy":
		case "deviant":
			return "deviancy";
	}
	return null;
}
window.sexStatNameMapper = sexStatNameMapper;

/**
 * @param {number} statValue
 */
function drunkSexStatModifier(statValue) {
	if (V.drunk === 0) return 0;

	const maxValue = 40; // The maximum value of the curve.
	const valueAdjust = Math.clamp(maxValue - Math.floor(statValue / 4), 0, maxValue); // The curve is less effective with higher base stat.
	const growthRate = 3; // How fast the curve grows as the drunk value increases.
	const midpoint = 500; // Needs to be half of the max drunk value.
	const shifter = 0.85; // Decreases this value to make lower drunk values give higher results and higher drunk values give lower results.
	const drunkMod = (V.drunk - midpoint) / 500; // Adjusts the drunk values to be scaled correctly with the equation and max stat value.
	const denominator = 1 + shifter * Math.E ** (-1 * growthRate * drunkMod);

	return Math.floor(valueAdjust / denominator);
}
window.drunkSexStatModifier = drunkSexStatModifier;

/**
 * Returns the modifier for a sexStat based on heat/rut/minArousal and the stat provided.
 *
 * @param {string} input
 * @returns {number}
 */
function heatRutSexStatModifier(input) {
	const maxMinArousal = 5000; // Maximum value for minArousal.
	const minArousal = Math.clamp(playerHeatMinArousal() + playerRutMinArousal(), 0, maxMinArousal);
	if (minArousal === 0) return 0;

	const statName = sexStatNameMapper(input);
	if (statName == null) {
		Errors.report(`[heatRutSexStatModifier]: input '${statName}' null.`, {
			Stacktrace: Utils.GetStack(),
			statName,
		});
		return 0;
	}

	if (statName === "exhibitionism") return 0;

	const maxHeatRutSexStatModifier = 40; // Maximum modifier for sexStat() from minArousal.
	const heatRutSexStatModifierExponent = 0.6; // Lower to raise the final modifier at lower levels of minArousal.
	const heatRutSexStatModifier = (maxHeatRutSexStatModifier / maxMinArousal ** heatRutSexStatModifierExponent) * minArousal ** heatRutSexStatModifierExponent;

	if (statName === "promiscuity") {
		return Math.floor(heatRutSexStatModifier * 0.75);
	} else {
		return Math.floor(heatRutSexStatModifier);
	}
}
window.heatRutSexStatModifier = heatRutSexStatModifier;

/**
 * @param {string} input
 * @param {number} required
 * @param {boolean} modifiers
 */
function hasSexStat(input, required, modifiers = true) {
	const statName = sexStatNameMapper(input);
	// check if stat name is valid.
	if (statName == null) {
		Errors.report(`[hasSexStat]: input '${statName}' null.`, {
			Stacktrace: Utils.GetStack(),
			statName,
		});
		return false;
	}
	let statValue = V[statName];
	// check if value of stat is valid.
	if (!Number.isFinite(statValue)) {
		Errors.report(`[hasSexStat]: sex stat '${statName}' unknown.`, {
			Stacktrace: Utils.GetStack(),
			statName,
		});
		return false;
	}
	if (modifiers) {
		// modify effective stat value based on inebriation.
		statValue += drunkSexStatModifier(statValue);

		// modify effective stat value based on heat/rut/minArousal.
		statValue += heatRutSexStatModifier(statName);
	}
	statValue = Math.clamp(statValue, 0, 100);

	switch (required) {
		case 6:
			/* self-destructive, extreme actions, like leglocking a rapist unprotected or provoking a group for no sane benefit. */
			return statValue >= 95;
		case 5:
			/* Extremely lewd actions, like full nude exposure and inciting gangbangs. */
			return statValue >= 75;
		case 4:
			/* Very lewd actions, like giving oral, using your body to get your way, and accepting lecherous propositions. */
			return statValue >= 55;
		case 3:
			/* Moderately lewd actions, like giving handjobs, more lewd exposure/flaunting, and most prostitution. */
			return statValue >= 35;
		case 2:
			/* Modestly lewd actions, like flashing underwear or light coercion. Many seduction checks fall under this level. */
			return statValue >= 15;
		case 1:
			/* Do not use for events or checks, only for checking if value is above level 0. Level 1 actions should always be available. */
			return statValue >= 1;
		default:
			Errors.report(`[hasSexStat]: sex stat requirement outside of possible value range: '${required}' (must be between 1 and 6!).`, {
				Stacktrace: Utils.GetStack(),
				statName,
				required,
			});
			return false;
	}
}
window.hasSexStat = hasSexStat;

function playerIsPenetrated() {
	return [V.mouthstate, V.vaginastate, V.anusstate].some(s => ["penetrated", "doublepenetrated", "tentacle", "tentacledeep"].includes(s));
}
window.playerIsPenetrated = playerIsPenetrated;

/**
 * @param {"left" | "right" | "any" | "both"} arm
 */
function pcAreArmsBound(arm = "any") {
	if (!["left", "right", "any", "both"].includes(arm)) {
		Errors.report(`[pcAreArmsBound]: invalid argument received: '${arm}'.`, {
			Stacktrace: Utils.GetStack(),
			arm,
		});
		return false;
	}
	switch (arm) {
		case "any":
			return V.leftarm === "bound" || V.rightarm === "bound";
		case "both":
			return V.leftarm === "bound" && V.rightarm === "bound";
		default:
			return V[arm + "arm"] === "bound";
	}
}
window.pcAreArmsBound = pcAreArmsBound;

/**
 * @returns {"none" | "left" | "right" | "both"}
 */
function pcGetArmsBound() {
	const outcome = (V.leftarm === "bound") + (V.rightarm === "bound") * 2;
	return ["none", "left", "right", "both"][outcome];
}
window.pcGetArmsBound = pcGetArmsBound;

function npcAssignClothesToSet(upper, lower) {
	return { upper: T.npcClothesItems.upper[upper], lower: T.npcClothesItems.lower[lower] };
}
window.npcAssignClothesToSet = npcAssignClothesToSet;

function npcMakeNaked(npc, slot) {
	if (slot === "upper") {
		npc.chest = 0;
	} else if (slot === "lower") {
		if (npc.penis !== "none") npc.penis = 0;
		if (npc.vagina !== "none") npc.vagina = 0;
	}
}
window.npcMakeNaked = npcMakeNaked;

function npcEquipSet(npc, set) {
	npc.clothes = { set: set.name };
	Object.entries(set.clothes).forEach(item => {
		if (item[1].name === "naked") {
			npcMakeNaked(npc, item[0]);
		}
		const itemData = setup.clothes[item[0]].find(c => c.name === item[1].name);
		if (!itemData) {
			npc.clothes[item[0]] = {
				name: item[1].name,
				integrity: item[1].integrity_max,
			};
		} else {
			npc.clothes[item[0]] = {
				name: itemData.name,
				integrity: itemData.integrity_max,
			};
		}
	});
}
window.npcEquipSet = npcEquipSet;

function npcSpecifiedClothes(npc, name) {
	const clothingItem = setup.npcClothesSets.filter(set => set.name === name);
	if (clothingItem.length > 0) {
		npcEquipSet(npc, clothingItem[0]);
	} else {
		console.log(`npcSpecifiedClothes - unable to find a clothing item with the name '${name}' for '${npc.fullDescription}'`);
	}
}
window.npcSpecifiedClothes = npcSpecifiedClothes;

/* npc.crossdressing: 0 - doesn't at all, 1 - sometimes, 2 - always */
function npcClothes(npc, type) {
	const crossdressing = npc.crossdressing || 0;
	const gender = ["n"];
	/* if you don't want those always crossdressing to wear neutral clothes
	let gender = [];
	if(crossdressing !== 2) gender.push('n');
	*/

	if (crossdressing < 2) gender.push(npc.pronoun);
	if (crossdressing > 0) gender.push(npc.pronoun === "m" ? "f" : "m");
	let clothingOptions = setup.npcClothesSets.filter(set => (set.type === type || !type) && gender.includes(set.gender));

	if (npc.outfits) {
		const namedNpcClothing = clothingOptions.filter(set => npc.outfits.includes(set.name));
		if (namedNpcClothing.length > 0) {
			clothingOptions = namedNpcClothing;
		}
	}
	if (clothingOptions.length > 0) {
		const clothesSet = clothingOptions.pluck();
		npcEquipSet(npc, clothesSet);
		// Allows you to record the clothing set selected
		return clothesSet.name;
	} else {
		console.log(`npcClothes - unable to find a clothing set with the options for '${npc.fullDescription}' with type '${type}'`);
	}
}
window.npcClothes = npcClothes;

function waterproofCheck(clothing) {
	return clothing.type.includesAny("swim", "stealthy", "rainproof", "waterproof");
}
window.waterproofCheck = waterproofCheck;

function isLoveInterest(name) {
	for (const l in V.loveInterest) if (V.loveInterest[l] === name) return true;
	return false;
}
window.isLoveInterest = isLoveInterest;

function isPossibleLoveInterest(name) {
	switch (name) {
		case "Robin":
			return V.robinromance === 1;
		case "Whitney":
			return V.whitneyromance === 1 && C.npc.Whitney.state !== "dungeon";
		case "Kylar":
			return V.kylarenglish >= 1 && C.npc.Kylar.state !== "prison";
		case "Sydney":
			return V.sydneyromance === 1;
		case "Eden":
			return V.syndromeeden === 1;
		case "Avery":
			return V.auriga_artefact && C.npc.Avery.state !== "dismissed";
		case "Black Wolf":
			return V.syndromewolves === 1 && hasSexStat("deviancy", 3);
		case "Great Hawk":
			return V.syndromebird === 1;
		case "Alex":
			return V.farm_stage >= 7 && V.alex_countdown === undefined;
		case "Gwylan":
			return V.gwylanSeen?.includes("partners") || V.gwylanSeen?.includes("romance");
		default:
			return false;
	}
}
window.isPossibleLoveInterest = isPossibleLoveInterest;

function isPossibleLoveInterestVirginity(taker) {
	if (typeof taker !== "string") return false;
	if (taker.includes(" and ")) {
		return taker.split(" and ").some(name => isPossibleLoveInterest(name.trim()));
	}
	return isPossibleLoveInterest(taker);
}
window.isPossibleLoveInterestVirginity = isPossibleLoveInterestVirginity;

function fameTotal() {
	let result = 0;
	for (const key in V.fame) {
		result += V.fame[key];
	}
	return result;
}
window.fameTotal = fameTotal;

function fameSum(...fameTypes) {
	let result = 0;
	fameTypes.forEach(fameType => (result += V.fame[fameType]));
	return result;
}
window.fameSum = fameSum;

function checkTFparts() {
	const tfParts = {};
	// Iterate over each transformation
	Object.entries(V.transformationParts).forEach(([tfName, tf]) =>
		Object.entries(tf).forEach(([pName, pStatus]) => {
			/* Iterate over each part of each transformation */
			if (pStatus !== "disabled" && pStatus !== "hidden") {
				/* Filter out the parts that the player doesn't have or is suppressing */
				tfParts[tfName + pName.toUpperFirst()] = true; /* Assign properties with camelCase names for each tf part that is visible */
			}
		})
	);
	return tfParts;
}
window.checkTFparts = checkTFparts;

/*
	Might be good to convert the whole TF mechanic, including `transformationStateUpdate` to something like below at some point.
	Part of the transformationParts is unused right now, but it's to account for this potential.
*/
function setupTransformations() {
	setup.transformations = [
		{
			/*
			name: tf name, used in V.transformationParts[name], <<tficon name>>, <<transform name>>, etc.
			level: transformation level getter,
			build: transformation points counter getter,
			type: "physicalTransform" or "specialTransform",
			parts: conditions for unlocking tf parts,
			traits: same but for traits
			*/
			name: "wolf",
			get level() {
				return V.wolfgirl;
			},
			get build() {
				return V.wolfbuild;
			},
			type: "physicalTransform",
			parts: [
				{ name: "ears", tfRequired: 4 },
				{
					name: "pubes",
					tfRequired: 4,
					get default() {
						return V.settings.pubicHairEnabled === true ? "default" : "hidden";
					},
				},
				{
					name: "pits",
					tfRequired: 4,
					get default() {
						return V.settings.pubicHairEnabled === true ? "default" : "hidden";
					},
				},
				{ name: "cheeks", tfRequired: 5, default: "feral" },
				{ name: "tail", tfRequired: 6 },
			],
			traits: [{ name: "fangs", tfRequired: 2 }],
		},
		{
			name: "cat",
			get level() {
				return V.cat;
			},
			get build() {
				return V.catbuild;
			},
			type: "physicalTransform",
			parts: [
				{ name: "ears", tfRequired: 4 },
				{ name: "tail", tfRequired: 6 },
				{ name: "heterochromia", tfRequired: 7 },
			],
			traits: [
				{ name: "fangs", tfRequired: 2 },
				{ name: "sharpEyes", tfRequired: 2 },
			],
		},
		{
			name: "cow",
			get level() {
				return V.cow;
			},
			get build() {
				return V.cowbuild;
			},
			type: "physicalTransform",
			parts: [
				{ name: "horns", tfRequired: 2 },
				{ name: "ears", tfRequired: 4 },
				{ name: "tail", tfRequired: 6 },
			],
			traits: [],
		},
		{
			name: "bird",
			get level() {
				return V.harpy;
			},
			get build() {
				return V.birdbuild;
			},
			type: "physicalTransform",
			parts: [
				{ name: "eyes", tfRequired: 2 },
				{ name: "malar", tfRequired: 2 },
				{ name: "tail", tfRequired: 4 },
				{ name: "plumage", tfRequired: 4 },
				{ name: "wings", tfRequired: 6 },
				{
					name: "pubes",
					tfRequired: 6,
					get default() {
						return V.settings.pubicHairEnabled === true ? "default" : "hidden";
					},
				},
			],
			traits: [
				{ name: "sharpEyes", tfRequired: 2 },
				{ name: "mateForLife", tfRequired: 3 },
			],
		},
		{
			name: "fox",
			get level() {
				return V.fox;
			},
			get build() {
				return V.foxbuild;
			},
			type: "physicalTransform",
			parts: [
				{ name: "ears", tfRequired: 4 },
				{ name: "cheeks", tfRequired: 5 },
				{ name: "tail", tfRequired: 6 },
			],
			traits: [
				{ name: "fangs", tfRequired: 2 },
				{ name: "sharpEyes", tfRequired: 2 },
				{ name: "mateForLife", tfRequired: 3 },
				{ name: "chase", tfRequired: 4 },
			],
		},
		{
			name: "angel",
			get level() {
				return V.angel;
			},
			get build() {
				return V.angelbuild;
			},
			type: "specialTransform",
			parts: [
				{ name: "halo", tfRequired: 4 },
				{ name: "wings", tfRequired: 6 },
			],
			traits: [],
		},
		{
			name: "fallenangel",
			get level() {
				return V.fallenangel;
			},
			get build() {
				return V.fallenbuild;
			},
			type: "specialTransform",
			parts: [
				{ name: "halo", tfRequired: 2 },
				{ name: "wings", tfRequired: 2 },
			],
			traits: [],
		},
		{
			name: "demon",
			get level() {
				return V.demon;
			},
			get build() {
				return V.demonbuild;
			},
			type: "specialTransform",
			parts: [
				{ name: "horns", tfRequired: 2 },
				{ name: "tail", tfRequired: 4 },
				{ name: "wings", tfRequired: 6 },
			],
			traits: [],
		},
	];
}
DefineMacro("setupTransformations", setupTransformations);

function validateTransformations() {
	const physTFs = setup.transformations.filter(tf => tf.type === "physicalTransform" && tf.level >= 1);
	if (physTFs.length >= 2)
		Errors.report(
			"Too many physical transformations!",
			physTFs.map(tf => tf.name)
		);
	if (V.physicalTransform === 1 && physTFs.length === 0) Errors.report("Couldn't find active physical transformation, modded save?");
	V.physicalTransform = Math.min(physTFs.length, 1);

	const specTFs = setup.transformations.filter(tf => tf.type === "specialTransform" && tf.level >= (tf.name === "fallenangel" ? 2 : 1));
	V.specialTransform = Math.min(specTFs.length, 1);

	const confirmedTraits = [];
	setup.transformations.forEach(tf => {
		const tfname = tf.name === "fallenangel" ? "fallenAngel" : tf.name;
		tf.parts.forEach(part => {
			if (tf.level >= part.tfRequired && V.transformationParts[tfname][part.name] === "disabled") {
				V.transformationParts[tfname][part.name] = part.default || "default";
			} else if (tf.level < part.tfRequired && V.transformationParts[tfname][part.name] !== "disabled") {
				V.transformationParts[tfname][part.name] = "disabled";
			}
		});
		tf.traits.forEach(trait => {
			if (tf.level >= trait.tfRequired) confirmedTraits.pushUnique(trait.name);
			if (tf.level >= trait.tfRequired && V.transformationParts.traits[trait.name] === "disabled") {
				V.transformationParts.traits[trait.name] = trait.default || "default";
			} else if (tf.level < trait.tfRequired && V.transformationParts.traits[trait.name] !== "disabled" && !confirmedTraits.includes(trait.name)) {
				V.transformationParts.traits[trait.name] = "disabled";
			}
		});
	});
}
DefineMacro("validateTransformations", validateTransformations);

// prettier-ignore
function getSexesFromRandomGroup() {
	if (maleChance() <= 0) { /* Only females. */
		if (V.settings.femaleNPCPenisChance <= 0) return SexTypes.ALL_FEMALES;		/* All females, no dickgirls. Always vaginal. */
		if (V.settings.femaleNPCPenisChance >= 100) return SexTypes.ALL_DICKGIRLS;	/* All females, all dickgirls. Always penises. */
	}
	if (maleChance() >= 100) { /* Only males. */
		if (V.settings.maleNPCVaginaChance <= 0) return SexTypes.ALL_MALES;			/* All males, no cuntboys. Always males. */
		if (V.settings.maleNPCVaginaChance >= 100) return SexTypes.ALL_CUNTBOYS;	/* All males, all cuntboys. Always vaginal. */
	}
	if (V.settings.maleNPCVaginaChance >= 100 && V.settings.femaleNPCPenisChance <= 0) return SexTypes.ALL_VAGINAS;	/* Both females and males, but all males are cuntboys, and there are no dickgirls. */
	if (V.settings.femaleNPCPenisChance >= 100 && V.settings.maleNPCVaginaChance <= 0) return SexTypes.ALL_DICKS;	/* Both females and males, but all females are dickgirls, and there are no cuntboys. */
	return SexTypes.BOTH;
}
window.getSexesFromRandomGroup = getSexesFromRandomGroup;

/**
 * Pick the right colour to use when colouring various things. Primarily sidebar stats.
 * When using this function, try to keep in mind what value of your input variable you want "red" to be at.
 *
 * Example: $drugged goes higher than 500, but we want the bar to become red at 500, so we call this function as getColourClassFromPercentage($drugged / 5).
 *
 * @param {number} percentage The percentage of the desired bar colour.
 * @param {string} stat Stat name, to determine whether or not the bar should use inverted colours (green for min, red for max).
 * @returns {string} Colour name to use.
 */
function getColourClassFromPercentage(percentage, stat) {
	const inverted = ![
		"pain",
		"arousal",
		"tiredness",
		"stress",
		"trauma",
		"drugged",
		"hallucinogen",
		"drunk",
		"awareness",
		"sex",
		"prostitution",
		"rape",
		"bestiality",
		"pregnancy",
		"impreg",
		"promiscuity",
		"exhibitionism",
		"delinquency",
		"deviancy",
		"corruption",
		"crime",
		"aggro",
		"rage",
	].includes(stat);
	if (percentage <= 0) return inverted ? "red" : "green";
	if (percentage < 20) return inverted ? "pink" : "teal";
	if (percentage < 40) return inverted ? "purple" : "lblue";
	if (percentage < 60) return "blue";
	if (percentage < 80) return inverted ? "lblue" : "purple";
	if (percentage < 100) return inverted ? "teal" : "pink";
	return inverted ? "green" : "red";
}
window.getColourClassFromPercentage = getColourClassFromPercentage;

function outfitHoodPosition(outfit) {
	/* This function is used to determine whether a hoodie in a given outfit set should have its hood up or down.
	 * It does this by comparing the upper and head slots to determine whether they're part of the same clothing item
	 */

	const hoodie = setup.clothes.upper.find(item => item.name === outfit.upper);
	if (hoodie.hoodposition === undefined) return "none";
	if (outfit.head !== hoodie.outfitPrimary.head) return "down";
	if (!outfit.colors) return "up";
	if (outfit.colors.head[0] !== outfit.colors.upper[0] || outfit.colors.head[1] !== outfit.colors.upper[1]) return "down";
	if (
		(outfit.colors.headcustom && outfit.colors.headcustom[0] !== outfit.colors.uppercustom[0]) ||
		(outfit.colors.headcustom && outfit.colors.headcustom[1] !== outfit.colors.uppercustom[1])
	)
		return "down";
	return "up";
}
window.outfitHoodPosition = outfitHoodPosition;

/**
 * For usage with tears calculation, converts pain stat [0..200] to 0..4 range (maxes out at pain = 80).
 *
 * @param {number} pain Pain value.
 * @returns {number} 0-4 range of tears amount.
 */
const painToTearsLvl = pain => Math.floor(Math.clamp(pain || V.pain, 0, 99) / 20);
window.painToTearsLvl = painToTearsLvl;

function isPubfameTaskAccepted(task, status) {
	return V.pubfame && V.pubfame.task === task && (V.pubfame.status === "accepted" || V.pubfame.status === status);
}
window.isPubfameTaskAccepted = isPubfameTaskAccepted;

function msToTime(s) {
	s = Math.floor(s / 1000);
	const secs = (s % 60).toString().padStart(2, "0");
	s = Math.floor(s / 60);
	const mins = (s % 60).toString().padStart(2, "0");
	const hrs = Math.floor(s / 60);

	return (hrs || 0) + ":" + mins + ":" + secs;
}
window.msToTime = msToTime;

function getHalloweenCostume() {
	const upper = V.worn.upper;
	const lower = V.worn.lower;
	const face = V.worn.face;
	const head = V.worn.head;

	T.tf = checkTFparts();

	// I'm really not sure if there's any better way to do this than going through each name. Please forgive my sins.
	// (Note: We could just add new types to clothes? ex: ["costume", "vampire"]. Update this function if you do.)
	if (upper.name.includes("vampire jacket")) {
		return "vampire";
	} else if (upper.name === "witch dress" && lower.name === "witch skirt") {
		return "witch";
	} else if (upper.name === "scarecrow shirt" && lower.name === "scarecrow skirt") {
		return "scarecrow";
	} else if (upper.name === "mummy top" && lower.name === "mummy skirt") {
		return "mummy";
	} else if (upper.name === "skeleton outfit" && lower.name === "skeleton bottoms") {
		return "skeleton";
	} else if (upper.name === "futuristic bodysuit" && lower.name === "futuristic bodysuit pants") {
		return "futuresuit";
	} else if (upper.name === "pumpkin dress" && lower.name === "pumpkin skirt") {
		return "pumpkin";
	} else if (upper.name.includes("gothic") && lower.name.includes("gothic")) {
		return "gothic";
	} else if (upper.name.includes("nun's habit") && lower.name.includes("nun's habit skirt")) {
		return "nun";
	} else if (upper.name === "monk's habit" && lower.name === "monk's habit skirt") {
		return "monk";
	} else if (upper.name === "initiate's robe" && lower.name === "initiate's robe skirt") {
		return "initiate";
	} else if (upper.name === "evangelist's uniform" && lower.name === "evangelist's bloomers") {
		return "evangelist";
	} else if (upper.name.includes("confessor's") && lower.name.includes("confessor's")) {
		return "confessor";
	} else if (upper.name.includes("exorcist's") && lower.name.includes("exorcist's")) {
		return "exorcist";
	} else if (
		(upper.name === "monk's sparring habit" && lower.name === "monk's sparring loincloth") ||
		(upper.name === "nun's sparring habit" && lower.name === "nun's sparring skirt")
	) {
		return "sparring";
	} else if (upper.type.includes("maid") && lower.type.includes("maid")) {
		return "maid";
	} else if (upper.name === "karate jacket" && lower.name === "karate trousers") {
		return "karate";
	} else if (upper.name.includes("christmas") && lower.name.includes("christmas")) {
		return "christmas";
	} else if (upper.name === "gift wrap top" && lower.name === "gift wrap bottom") {
		return "gift wrap";
	} else if (upper.name === "cheerleading top" && lower.name === "cheerleading skirt") {
		return "cheerleader";
	} else if (["football shirt", "foreign football shirt"].includes(upper.name) && ["football shorts", "foreign football shorts"].includes(lower.name)) {
		return "football";
	} else if (
		(upper.name === "belly dancer's top" && lower.name === "belly dancer's bottoms") ||
		(upper.name === "harem vest" && lower.name === "harem pants")
	) {
		return "belly dancer";
	} else if (V.worn.head.name === "cowboy hat" && lower.name === "cowboy chaps" && V.worn.feet.name === "cowboy boots") {
		return "cowboy";
	} else if (["costume", "riding"].every(type => V.worn.head.type.includes(type) && upper.type.includes(type))) {
		return "riding";
	} else if (upper.name === "cow onesie" && lower.name === "cow onesie bottoms") {
		return "cow onesie";
	} else if (upper.name.includes("prison") && lower.name.includes("prison")) {
		return "prison";
	} else if (upper.name === "unbound straightjacket" && lower.name === "unbound straightjacket bottom") {
		return "straightjacket";
	} else if (upper.name.includes("sailor") && lower.name.includes("sailor")) {
		return "sailor";
	} else if (upper.name.includes("nurse") && lower.name.includes("nurse")) {
		return "nurse";
	} else if (upper.name === "rag top" && lower.name === "rag skirt") {
		return "rags";
	} else if (
		(upper.name.includes("ballgown") || upper.name === "janet dress" || upper.name.includes("rose wedding dress")) &&
		(head.name.includes("rose wedding veil") || head.name === "gothic crown")
	) {
		return "bride";
	} else if (upper.name.includes("rose wedding suit") && lower.name.includes("rose wedding suit")) {
		return "groom";
	} else if (upper.name === "chef jacket" && head.name === "chef hat") {
		return "chef";
	} else if (upper.name === "swan lake dress" && lower.name === "swan lake skirt") {
		return "swan";
	} else if (upper.name === "butterfly dress" && lower.name === "butterfly dress skirt") {
		return "butterfly";
	} else if (upper.name === "succubus top" && lower.name === "succubus lower back wings") {
		return "succubus";
	} else if (
		(upper.name === "vintage pantsuit" && lower.name === "vintage pants") ||
		(upper.name === "vintage skirtsuit" && lower.name === "vintage skirt")
	) {
		return "vintage";
	} else if (upper.name === "chain tunic" && lower.name === "chain tunic skirt") {
		return "chain tunic";
	} else if (face.name === "eyepatch") {
		return "eyepatch";
	} else if (face.name === "medical eyepatch") {
		return "medical eyepatch";
	} else if (face.name === "gas mask") {
		return "gasmask";
	} else if (head.name === "military beret") {
		return "beret";

		/* Transformations */
	} else if (T.tf.angelHalo && T.tf.angelWings) {
		return "angel TF";
	} else if (T.tf.wolfEars && T.tf.wolfTail) {
		return "wolf TF";
	} else if (T.tf.fallenAngelHalo && T.tf.fallenAngelWings) {
		return "fallen angel TF";
	} else if (T.tf.demonHorns && T.tf.demonWings) {
		return "demon TF";
	} else if (T.tf.catEars && T.tf.catTail) {
		return "cat TF";
	} else if (T.tf.cowHorns && T.tf.cowTail) {
		return "cow TF";
	} else if (T.tf.birdWings && T.tf.birdEyes) {
		return "harpy TF";
	} else if (T.tf.foxEars && T.tf.foxTail) {
		return "fox TF";

		/* Misc outcomes */
	} else if (
		V.worn.upper.type.includes("costume") ||
		V.worn.lower.type.includes("costume") ||
		(V.worn.upper.type.includes("naked") && V.worn.under_upper.type.includes("costume")) ||
		(V.worn.lower.type.includes("naked") && V.worn.under_lower.type.includes("costume"))
	) {
		return "mixed";
	} else if (V.exposed >= 2) {
		return "fully naked";
	} else if (V.exposed >= 1) {
		return "exposed";
	} else {
		return "none";
	}
}
window.getHalloweenCostume = getHalloweenCostume;

function dailyConvert() {
	if (V.daily === undefined) {
		/* transfer old vars */
		V.daily = {
			school: {
				scienceInterrupted: V.scienceinterrupted,
				mathsInterrupted: V.mathsinterrupted,
				englishInterrupted: V.englishinterrupted,
				historyInterrupted: V.historyinterrupted,
				swimmingInterrupted: V.swimminginterrupted,
				headInterrupted: V.headinterrupted,
				lunchEaten: V.luncheaten,
				canteenApproach: V.canteenapproach,
				detentionAttended: V.detentionattended,
				boysRoomEntered: V.boysroomentered,
				girlRroomEntered: V.girlsroomentered,
				scienceExcused: V.scienceExcused,
				mathsExcused: V.mathsExcused,
				englishExcused: V.englishExcused,
				historyExcused: V.historyExcused,
				swimmingExcused: V.swimmingExcused,
				herm: V.school_herm_day,
				crossdress: V.school_crossdress_day,
			},
			whitney: {
				bullyGate: V.bullygate,
				toiletCheck: V.whitney_toilet_check,
				park: V.whitney_park,
				textTrigger: V.whitney_text_trigger,
				flirt: V.whitneyFlirt,
				chat: V.whitneyChat,
				ask: V.whitneyAsk,
				text: V.whitney_text,
			},
			robin: {
				walk: V.robinwalk,
				hugCry: V.robinhugcry,
				hugComplain: V.robinhugcomplain,
				blame: V.robinblame,
				persecute: V.robinpersecute,
				policeBody: V.robinpolicebody,
				policePay: V.robinpolicepay,
				tending: V.robin_tending,
				beachPolice: V.robinbeachpolice,
				parkSnow: V.robinparksnow,
				debtAsk: V.robinDebtAsk,
			},
			kylar: V.kylarDaily || {},
			morgan: {},
			eden: {
				breakfastLust: V.edenbreakfastlust,
				breakfast: V.edenbreakfast,
				bath: V.edenbath,
				walk: V.edenwalk,
				chopLust: V.edenchoplust,
				hunting: V.edenhunting,
				lunch: V.edenlunch,
				dinner: V.edendinner,
				distract: V.edendistract,
				asylumDisarm: V.edenasylumdisarm,
				asylumRescue: V.eden_asylum_rescue,
				sew: V.eden_sew,
				supplies: V.eden_supplies,
				sweep: V.eden_sweep,
				salve: V.eden_salve,
				soap: V.eden_soap,
				search: V.eden_search,
				exposed: V.edenexposed,
				springJoin: V.edenspringjoin,
				salveUse: V.salveuse,
				massage: V.edenmassage,
				huntCaught: V.edenhuntcaught,
				farmRescue: V.edenfarmrescue,
			},
			alex: V.alexDaily || {},
			sydney: {
				scienceWarn: V.sydneyScienceWarn,
				classWarn: V.sydneyClassWarn,
				scienceWalk: V.sydneyScienceWalk,
				punish: V.sydneyPunish,
				templeSkip: V.sydneyTempleSkip,
			},
			ex: {
				day: V.ex_day,
				club: V.ex_club,
				brothel: V.ex_brothel,
				studio: V.ex_studio,
				high: V.ex_high,
				connudatus: V.ex_connudatus,
				stall: V.ex_stall,
				mason: V.ex_mason,
				flyover: V.ex_flyover,
				cream: V.ex_cream,
				road: V.ex_road,
				fence: V.ex_fence,
				lorries: V.ex_lorries,
				fountain: V.ex_fountain,
			},
			pharm: V.pharmDaily || {},
			motherWake: V.motherwake,
			harperVisit: V.harpervisit,
			policeCollarSeduceAttempt: V.policecollarseduceattempt,
			tenyclusPlayed: V.tenyclusPlayed,
			beachStrip: V.beachstrip,
			compoundState: V.compoundstate,
			baileyVisit: V.baileyvisit,
			lakeCouple: V.lakecouple,
			museumGreenGemTouch: V.museumgreengemtouch,
			fenceClimb: V.fenceclimb,
			cafeEaten: V.cafeeaten,
			mirrorTentacles: V.mirrortentacles,
			massAttended: V.massattended,
			dockExhibitionism: V.dockexhibitionism,
			homeEvent: V.home_event,
			leightonDanceOffered: V.leightondanceoffered,
			wolfCaveDog: V.wolf_cave_dog,
			jordan_missing: V.jordan_missing,
			blackWolfMonsterRoll: V.blackWolfMonsterRoll,
			greatHawkMonsterRoll: V.greatHawkMonsterRoll,
			nightMonsterMonsterRoll: V.nightMonsterMonsterRoll,
			templePray: V.temple_pray,
			lakeMeditate: V.lake_meditate,
			masonSpoken: V.mason_spoken,
			stallRented: V.stall_rented,
			rocksPoolInvite: V.rocks_pool_invite,
			birdWash: V.bird_wash,
			birdDailyGreeting: V.birdDailyGreeting,
			estateBluffed: V.estate_bluffed,
			estateChaos: V.estate_chaos,
			spaEvent: V.spa_event,
			estateDone: V.estate_done,
			baileyWake: V.bailey_wake_day,
			manorForage: V.manor_forage,
			manorGarden: V.manor_garden,
			manorKitchen: V.manor_kitchen,
			manorParents: V.manor_parents,
			manorLab: V.manor_lab,
			promiscuityStress1: V.promiscuitystress1,
			promiscuityStress2: V.promiscuitystress2,
			promiscuityStress3: V.promiscuitystress3,
			promiscuityStress4: V.promiscuitystress4,
			promiscuityStress5: V.promiscuitystress5,
			exhibitionismStress1: V.exhibitionismstress1,
			exhibitionismStress2: V.exhibitionismstress2,
			exhibitionismStress3: V.exhibitionismstress3,
			exhibitionismStress4: V.exhibitionismstress4,
			exhibitionismStress5: V.exhibitionismstress5,
			deviancyStress1: V.deviancystress1,
			deviancyStress2: V.deviancystress2,
			deviancyStress3: V.deviancystress3,
			deviancyStress4: V.deviancystress4,
			deviancyStress5: V.deviancystress5,
			seenPets: V.seenPets,
			asylumFirstTreatment: V.asylumfirsttreatment,
			asylumSecondTreatment: V.asylumsecondtreatment,
			asylumAssessment: V.asylumassessment,
			asylumExercise: V.asylumexercise,
			slimeFarmNaked: V.slimeFarmNaked,
		};
		/* merge values from old daily objects */
		if (V.whitneyDaily) Object.keys(V.whitneyDaily).forEach(n => (V.daily.whitney[n] = V.whitneyDaily[n]));
		if (V.robinDaily) Object.keys(V.robinDaily).forEach(n => (V.daily.robin[n] = V.robinDaily[n]));
		if (V.sydneyDaily) Object.keys(V.sydneyDaily).forEach(n => (V.daily.sydney[n] = V.sydneyDaily[n]));
		/* $sewersDaily to $daily.morgan. somehow, it's an array */
		if (V.sewerssex === 1) V.daily.morgan.sex = 1;
		if (V.sewersfeeding === 1) V.daily.morgan.feeding = 1;
		if (V.sewersDaily) V.sewersDaily.forEach(n => (V.daily.morgan[n] = 1));
		/* `$compoundstate != undefined` is no longer used as an indicator of the access to compound,
		as it migrated to $daily.compoundState. $compound.discovered is used for that instead. */
		if (V.compoundstate !== undefined) V.compound.discovered = true;
		V.daily.pharm.impatient = V.left_before_nurse_returned;

		/* unset old vars */
		[
			// eslint-disable-next-line prettier/prettier
			/* school */ "scienceinterrupted", "mathsinterrupted", "englishinterrupted", "historyinterrupted", "swimminginterrupted", "headinterrupted", "luncheaten", "canteenapproach", "detentionattended", "boysroomentered", "girlsroomentered", "scienceExcused", "mathsExcused", "englishExcused", "historyExcused", "swimmingExcused", "school_herm_day", "school_crossdress_day",
			// eslint-disable-next-line prettier/prettier
			/* whitney */ "bullygate", "whitney_toilet_check", "whitney_park", "whitney_text_trigger", "whitneyFlirt", "whitneyChat", "whitneyAsk","whitney_text", "whitney_text_trigger", "whitneyDaily",
			// eslint-disable-next-line prettier/prettier
			/* robin */ "robinwalk", "robinhugcry", "robinhugcomplain", "robinblame", "robinpersecute", "robinpolicebody", "robinpolicepay", "robin_tending", "robinDaily", "robinbeachpolice", "robinparksnow", "robinDebtAsk",
			// eslint-disable-next-line prettier/prettier
			/* kylar */ "kylarDaily",
			// eslint-disable-next-line prettier/prettier
			/* morgan */ "sewerssex", "sewersfeeding", "sewersDaily",
			// eslint-disable-next-line prettier/prettier
			/* eden */ "edenbreakfastlust", "edenbreakfast", "edenbath", "edenwalk", "edenbath", "edenchoplust", "edenhunting", "edenlunch", "edendinner", "edendistract", "edenasylumdisarm", "eden_asylum_rescue", "eden_sew", "eden_supplies", "eden_sweep", "eden_salve", "eden_soap", "eden_search", "edenexposed", "edenspringjoin", "salveuse", "edenmassage", "edenhuntcaught", "edenfarmrescue",
			// eslint-disable-next-line prettier/prettier
			/* alex */ "alexDaily",
			// eslint-disable-next-line prettier/prettier
			/* sydney */ "sydneyScienceWarn", "sydneyClassWarn", "sydneyScienceWalk", "sydneyPunish", "sydneyTempleSkip", "sydneyDaily",
			// eslint-disable-next-line prettier/prettier
			/* ex */ "ex_day", "ex_club", "ex_brothel", "ex_studio", "ex_high", "ex_stall", "ex_mason", "ex_flyover", "ex_cream", "ex_road", "ex_fence", "ex_connudatus", "ex_lorries", "ex_fountain", "ex_high",
			// eslint-disable-next-line prettier/prettier
			/* pharm */ "left_before_nurse_returned", "pharmTriedSeduction", "pharmSexFinished", "pharmClosed", "pharmSeductionFailed", "pharmDaily",
			// eslint-disable-next-line prettier/prettier
			/* misc */ "comb", "motherwake", "harpervisit", "policecollarseduceattempt", "tenyclusPlayed", "beachstrip", "compoundstate", "baileyvisit", "lakecouple", "museumgreengemtouch", "fenceclimb", "cafeeaten", "mirrortentacles", "massattended", "dockexhibitionism", "home_event", "leightondanceoffered", "wolf_cave_dog", "jordan_missing", "blackWolfMonsterRoll", "greatHawkMonsterRoll", "nightMonsterMonsterRoll", "temple_pray", "lake_meditate", "mason_spoken", "stall_rented", "rocks_pool_invite", "bird_wash", "birdDailyGreeting", "estate_bluffed", "estate_chaos", "spa_event", "estate_done", "lewd_unlock", "bailey_wake_day", "manor_forage", "manor_garden", "manor_kitchen", "manor_parents", "manor_lab", "promiscuitystress1", "promiscuitystress2", "promiscuitystress3", "promiscuitystress4", "promiscuitystress5", "exhibitionismstress1", "exhibitionismstress2", "exhibitionismstress3", "exhibitionismstress4", "exhibitionismstress5", "deviancystress1", "deviancystress2", "deviancystress3", "deviancystress4", "deviancystress5", "seenPets", "asylumfirsttreatment", "asylumsecondtreatment", "asylumassessment", "asylumexercise", "slimeFarmNaked"
		].forEach(n => delete V[n]);
	}
}
window.dailyConvert = dailyConvert;

function convertHairLengthToStage(hair, length) {
	if (!hair || !length) throw new Error(`Hair AND Length must be provided to be converted: ${hair} / ${length}`);
	if (hair === "fringe") {
		if (length >= 900) return "feet";
		else if (length >= 700) return "thighs";
		else if (length >= 600) return "navel";
		else if (length >= 400) return "chest";
		else if (length >= 200) return "shoulder";
		else return "short";
	} else if (hair === "sides") {
		if (length >= 900) return "feet";
		else if (length >= 700) return "thighs";
		else if (length >= 600) return "navel";
		else if (length >= 400) return "chest";
		else if (length >= 200) return "shoulder";
		else return "short";
	}
}
window.convertHairLengthToStage = convertHairLengthToStage;

function calchairlengthstage() {
	const stages = ["short", "shoulder", "chest", "navel", "thighs", "feet"];

	V.hairlength = Math.clamp(V.hairlength, 0, 1000);
	V.hairlengthstage = stages[Math.trunc(V.hairlength / 200)];

	V.fringelength = Math.clamp(V.fringelength, 0, 1000);
	V.fringelengthstage = stages[Math.trunc(V.fringelength / 200)];
}
window.calchairlengthstage = calchairlengthstage;
DefineMacro("calchairlengthstage", calchairlengthstage);

function calculateSemenReleased() {
	if (T.deniedOrgasm) return 0;
	let released = 30;

	released += V.semen_volume / 30;

	if (V.femaleclimax === 1) released /= 30;
	if (V.orgasmtrait >= 1) released *= 1.5;
	if (V.cow >= 6) released *= 1.2;

	/* if the player doesn't have enough semen, set $_semen_released to whatever they have left */
	if (V.semen_amount < released) released = V.semen_amount;
	if (parseFloat(released.toFixed(1)) === 0 && V.semen_amount < 0.1) V.semen_amount = 0; // Prevents really low floating numbers

	return parseFloat(released.toFixed(1));
}
window.calculateSemenReleased = calculateSemenReleased;

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
window.lustfulUpdate = lustfulUpdate;

function npcSemenMod(penisSize) {
	switch (penisSize) {
		case 4:
			return "large";
		case 1:
			return "tiny";
		default:
			return "";
	}
}
window.npcSemenMod = npcSemenMod;

function maleChance(override) {
	if (V.settings.maleChanceSplit === false) return V.settings.maleChance;
	const appearance = override || V.player.gender_appearance;
	if (appearance === "m") return V.settings.maleChanceMale;
	if (appearance === "f") return V.settings.maleChanceFemale;
	return 50;
}
window.maleChance = maleChance;

// gender of the npc, rng (between 1 and 100) of their generation
function attractedToBothChance(gender, rng) {
	if (gender === "m") return maleChance("m") >= rng && maleChance("f") >= rng;
	return maleChance("m") < rng && maleChance("f") < rng;
}
window.attractedToBothChance = attractedToBothChance;

function beastMaleChance(override) {
	if (V.settings.beastMaleChanceSplit === false) return V.settings.beastMaleChance;
	const appearance = override || V.player.gender_appearance;
	if (appearance === "m") return V.settings.beastMaleChanceMale;
	if (appearance === "f") return V.settings.beastMaleChanceFemale;
	return 50;
}
window.beastMaleChance = beastMaleChance;

function penisNames(override) {
	const names = ["penis"];

	if (V.player.penissize < 2 && !override) return names;

	if ((V.awareness >= 100 && !override) || override >= 1) names.push("dick");
	if ((V.awareness >= 200 && V.purity < 900 && !override) || override >= 2) names.push("cock");

	return names;
}
window.penisNames = penisNames;

function pussyNames(override) {
	const names = ["vagina"];

	if ((V.awareness >= 100 && !override) || override >= 1) names.push("pussy");
	if ((V.awareness >= 200 && V.purity < 900 && !override) || override >= 2) names.push("quim");
	if ((V.awareness >= 300 && V.purity < 100 && !override) || override >= 3) names.push("slit");

	return names;
}
window.pussyNames = pussyNames;

const crimeSum = (prop, ...crimeTypes) => {
	if (crimeTypes.length === 0) {
		crimeTypes = Object.keys(setup.crimeNames);
	}

	return crimeTypes.reduce((result, crimeType) => result + V.crime[crimeType][prop], 0);
};

window.crimeSumCurrent = (...args) => crimeSum("current", ...args);
window.crimeSumHistory = (...args) => crimeSum("history", ...args);
window.crimeSumDaily = (...args) => crimeSum("daily", ...args);
window.crimeSumCount = (...args) => crimeSum("count", ...args);
window.crimeSumCountHistory = (...args) => crimeSum("countHistory", ...args);

/**
 * Event listener for the 'beforeunload' event. Will prompt a dialog box asking the player if he wants to leave.
 *
 * @param {object} event 'beforeunload' event
 * @returns {void}
 */
function onBrowserTabClose(event) {
	event.preventDefault();
	event.returnValue = "Are you sure you want to leave?"; // the string here isn't important, it's mostly not considered by the browser.
}

/**
 * Enable or disable the confirm dialog based on V.options.confirmDialogUponTabClose value evaluating to true or not
 *
 * @returns {void}
 */
function toggleConfirmDialogUponTabClose() {
	if (V.options.confirmDialogUponTabClose === true) {
		window.addEventListener("beforeunload", onBrowserTabClose);
	} else if (V.options.confirmDialogUponTabClose === false) {
		window.removeEventListener("beforeunload", onBrowserTabClose);
	}
}

window.toggleConfirmDialogUponTabClose = toggleConfirmDialogUponTabClose;

function numberOfEarSlime(ignoreHypnoticSilence = false) {
	let result = 0;
	if (!ignoreHypnoticSilence && V.hypnosis_traits.silence) return 0;
	if (V.parasite.left_ear.name === "slime") result++;
	if (V.parasite.right_ear.name === "slime") result++;
	return result;
}
window.numberOfEarSlime = numberOfEarSlime;

function earSlimeMakingMundaneRequests() {
	if (!numberOfEarSlime()) return false;
	// First rape requests
	if (V.earSlime.growth + V.earSlime.promiscuity * 10 >= 80) return false;
	return true;
}
window.earSlimeMakingMundaneRequests = earSlimeMakingMundaneRequests;

function earSlimeCorruptionClothes() {
	if (!numberOfEarSlime()) return 0;
	if (!V.daily.corruptionSlimeClothes) {
		const baseCorruption = V.earSlime.corruption + V.earSlime.growth;
		// Reduced from the original equivalent of *2.5 and *12.5, still want it to have SOME effect, but this should hopefully soften it enough
		V.daily.corruptionSlimeClothes = Math.clamp(random(baseCorruption, baseCorruption * 5) - currentSkillValue("willpower"), 0, 1000);
	}
	const cap = ["prison", "asylum"].includes(V.location) ? 1000 : 500;

	T.allowSchoolClothes =
		!!Time.schoolDay || (V.location === "brothel" && Time.weekDay === 6 && V.brothelshowdata?.type === "gangbang" && !V.brothelshowdata?.done);

	return Math.clamp(V.daily.corruptionSlimeClothes + (V.earSlime.growth >= 100 && V.earSlime.defyCooldown ? V.earSlime.defyCooldown * 25 : 0), 0, cap);
}
window.earSlimeCorruptionClothes = earSlimeCorruptionClothes;

function fixIntegrityUpdater() {
	Object.entries(V.worn).forEach(([slot, item]) => fixIntegrityMax(slot, item));
	Object.entries(V.store).forEach(([slot, items]) => items.forEach(item => fixIntegrityMax(slot, item)));
	setup.clothes_all_slots.forEach(slot => {
		const category = V.wardrobe[slot];
		if (!Array.isArray(category)) {
			console.warn("Category:", slot, "doesn't exist in wardrobe.");
			return;
		}
		category.forEach(item => fixIntegrityMax(slot, item));
	});
	const wardrobes = Object.entries(V.wardrobes).filter(([name, wardrobe]) => !["shopReturn", "wardrobe"].includes(name));
	if (Array.isArray(wardrobes)) {
		wardrobes.forEach(([name, wardrobe]) => {
			setup.clothes_all_slots.forEach(slot => {
				const category = wardrobe[slot];
				if (!Array.isArray(category)) {
					console.warn("Category:", slot, "doesn't exist in wardrobe:", name);
					return;
				}
				category.forEach(item => fixIntegrityMax(slot, item));
			});
		});
	}
	Object.entries(V.carried).forEach(([slot, item]) => fixIntegrityMax(slot, item));
}
window.fixIntegrityUpdater = fixIntegrityUpdater;

// Set plots to watered if it rains
// Temporary solution until a rework
$(document).on(":onWeatherChange", () => {
	if (!V.daily || V.daily?.plotsRain || Weather.precipitation !== "rain") return;
	V.daily.plotsRain = true;
	Object.entries(V.plots).forEach(([location, plots]) => {
		// Don't water greenhouse plants from rain - disabled for now
		// Alternate text about a rainwater harvester was added, so this may not be needed
		// if (location === "garden" && V.alex_greenhouse === 3) return;
		plots.forEach(plot => (plot.water = 1));
	});
});

// Returns true if one or more orphanage plots have been planted
// Used to determine whether Robin should automatically water them
function orphanagePlotsPlanted() {
	if (V.plots?.garden) {
		for (let i = 0; i < V.plots.garden.length; i++) {
			if (V.plots.garden[i].stage >= 1) {
				return true;
			}
		}
	}
	return false;
}
window.orphanagePlotsPlanted = orphanagePlotsPlanted;

// Returns true if all orphanage plots have been watered
// Used to determine whether Robin sshould automatically water them
function orphanagePlotsWatered() {
	if (V.plots?.garden) {
		for (let i = 0; i < V.plots.garden.length; i++) {
			if (V.plots.garden[i].water === 0) {
				return false;
			}
		}
		return true;
	}
	return false;
}
window.orphanagePlotsWatered = orphanagePlotsWatered;

// Temporary until a rework
// Apparently the sugarcube <<script>> parser don't parse the following correctly - so made it a function instead
function tendingDay() {
	Object.entries(V.plots).forEach(([location, plots]) => {
		let irrigation = location === "farm" ? V.farm.irrigation || 0 : 0;

		plots.forEach(plot => {
			// Growth check
			if (plot.stage >= 1 && (plot.water === 1 || plot.bed === "water")) {
				plot.days += 1;
				if (plot.days >= (setup.foodstuff[plot.plant].tending.growth_days * (plot.stage + 1)) / 5) {
					plot.stage += 1;
				}
			}

			// Rain check moved to event in ingame.js
			plot.water = irrigation >= 1 ? (irrigation--, 1) : 0;
		});
	});
}
window.tendingDay = tendingDay;

/**
 * @param {string} slot
 * @param {ClothesItem} value
 * @returns {void}
 */
function fixIntegrityMax(slot, value) {
	if (value.integrity_max !== 0) {
		return; // Integrity is fine
	}
	const setupClothing = getSetupClothing(slot, value);
	value.integrity_max = setupClothing.integrity_max;
}
window.fixIntegrityMax = fixIntegrityMax;

function formatMoney(amount) {
	const integerPart = Math.floor(amount / 100);
	let formattedAmount = Math.abs(integerPart).toLocaleString("en-GB");
	if (Math.abs(integerPart) <= 9999) {
		const decimalPart = amount % 100;
		if (decimalPart) {
			formattedAmount += "." + ("0" + Math.floor(Math.abs(decimalPart))).slice(-2);
		}
	}
	T.printmoney = (amount >= 0 ? "" : "-") + "£" + formattedAmount;
	return T.printmoney;
}
window.formatMoney = formatMoney;
DefineMacro("formatmoney", money => formatMoney(money));

function unableTakeVirginity(virginity) {
	if (!virginity) {
		if (V.player.penisExist && V.player.vaginaExist) {
			return unableTakeVirginity("penile") || unableTakeVirginity("vaginal");
		} else if (V.player.penisExist) {
			return unableTakeVirginity("penile");
		} else if (V.player.vaginaExist) {
			return unableTakeVirginity("vaginal");
		}
	}

	switch (virginity) {
		case "penile":
			return (
				V.settings.analEnabled === false &&
				((V.settings.maleNPCVaginaChance === 0 && V.settings.femaleNPCPenisChance === 100) ||
					(maleChance() === 100 && V.settings.maleNPCVaginaChance === 0) ||
					(maleChance() === 0 && V.settings.femaleNPCPenisChance === 100) ||
					(maleChance() === 100 && V.settings.maleNPCVaginaChance === 100 && V.settings.straponChance === 100) ||
					(maleChance() === 0 && V.settings.femaleNPCPenisChance === 0 && V.settings.straponChance === 100))
			);
		case "vaginal":
			return (
				V.settings.straponChance === 0 &&
				((V.settings.maleNPCVaginaChance === 100 && V.settings.femaleNPCPenisChance === 0) ||
					(maleChance() === 100 && V.settings.maleNPCVaginaChance === 100) ||
					(maleChance() === 0 && V.settings.femaleNPCPenisChance === 0))
			);
		default:
			return false;
	}
}
window.unableTakeVirginity = unableTakeVirginity;

function canGiftFood(npc) {
	let amount = 0;

	Object.entries(setup.foodstuff).forEach(([key, item]) => {
		if (item.category === "dish" && V.foodstuff[key]?.amount > 0) {
			amount++;
		}
	});

	return V.daily.giftedFood[npc] === undefined && amount > 0;
}
window.canGiftFood = canGiftFood;

function ingredientIsAllowed(providedKey) {
	const provided = T.ingredientsSupplied || [];
	const exceptions = T.ingredientsExceptions;
	const isAllowed = key => {
		if (provided.includes(key) || !exceptions || exceptions.includes(key)) return true;

		const setupObject = setup.foodstuff[key];
		if (setupObject.recipe?.ingredients.length) {
			return setupObject.recipe.ingredients.every(ingredient => {
				return isAllowed(ingredient);
			});
		}

		return false;
	};
	return isAllowed(providedKey);
}
window.ingredientIsAllowed = ingredientIsAllowed;

function ingredientAlternativesSetup(recipe) {
	const alternatives = {};
	const addAlternative = (ingredient, alternative) => {
		if (!alternatives[ingredient]) alternatives[ingredient] = [];
		alternatives[ingredient].pushUnique(alternative);
	};
	const lewdAllowed = V.chef_state >= 3 && T.allowLewdIngredients && (!V.options.ingredientsAutoManage || V.options.ingredientsAutoManageLewd);

	Object.entries(setup.foodstuff).forEach(([key, item]) => {
		const ingredientAlternatives = item?.ingredient_alternatives;
		if (!ingredientAlternatives) return;
		ingredientAlternatives.normal.forEach(alternative => addAlternative(key, alternative));
		if (lewdAllowed) ingredientAlternatives.lewd.forEach(alternative => addAlternative(key, alternative));
	});

	const recipeAlternatives = setup.foodstuff[recipe]?.recipe?.ingredient_alternatives;
	if (recipeAlternatives?.normal) {
		Object.entries(recipeAlternatives.normal).forEach(([ingredient, list]) => {
			list.forEach(alternative => addAlternative(ingredient, alternative));
		});
	}
	if (lewdAllowed && recipeAlternatives?.lewd) {
		Object.entries(recipeAlternatives.lewd).forEach(([ingredient, list]) => {
			list.forEach(alternative => addAlternative(ingredient, alternative));
		});
	}

	return alternatives;
}

function ingredientsProvided(mainIngredient, recipe) {
	if (!setup.foodstuff[mainIngredient] || !setup.foodstuff[recipe]) return false;
	const alternatives = ingredientAlternativesSetup(recipe);
	const options = [mainIngredient];

	if (alternatives[mainIngredient]) alternatives[mainIngredient].forEach(ingredient => options.pushUnique(ingredient));
	return options.find(ingredient => T.ingredientsSupplied?.includes(ingredient));
}
window.ingredientsProvided = ingredientsProvided;

function ingredientUsed(mainIngredient, recipe) {
	const alternatives = ingredientAlternativesSetup(recipe);

	// When auto management has been disabled
	if (!V.options.ingredientsAutoManage) {
		if (Array.isArray(alternatives[mainIngredient]) && alternatives[mainIngredient].includes(V.foodstuff[mainIngredient].alternative)) {
			return V.foodstuff[mainIngredient].alternative;
		}
		return mainIngredient;
	}

	// Check for any provided ingredients first
	if (ingredientsProvided(mainIngredient, recipe)) return ingredientsProvided(mainIngredient, recipe);

	// Check for alternatives if there is none of the normal ingredient
	if (alternatives[mainIngredient]?.length && V.foodstuff[mainIngredient]?.amount <= 0) {
		const alternative = alternatives[mainIngredient].find(ingredient => V.foodstuff[ingredient]?.amount > 0);
		if (alternative) return alternative;
	}
	return mainIngredient;
}
window.ingredientUsed = ingredientUsed;

function ingredientsTotal(mainIngredient, recipe, includeAlternatives) {
	if (!setup.foodstuff[mainIngredient]) return 0;
	const alternatives = ingredientAlternativesSetup(recipe);
	let count = V.foodstuff[mainIngredient].amount;
	if (includeAlternatives && alternatives[mainIngredient] && !T.ingredientsSupplied?.includes(mainIngredient)) {
		alternatives[mainIngredient].forEach(ingredient => {
			count += V.foodstuff[ingredient]?.amount || 0;
		});
	}
	return count;
}
window.ingredientsTotal = ingredientsTotal;

function ingredientsOptions(mainIngredient, recipe) {
	const alternatives = ingredientAlternativesSetup(recipe);
	const result = [mainIngredient];
	if (Array.isArray(alternatives[mainIngredient])) alternatives[mainIngredient].forEach(ingredient => result.pushUnique(ingredient));
	return result;
}
window.ingredientsOptions = ingredientsOptions;

function ingredientsNextAlternative(mainIngredient, recipe) {
	if (!V.foodstuff[mainIngredient]) return;
	const options = ingredientsOptions(mainIngredient, recipe);
	const currentAlt = V.foodstuff[mainIngredient].alternative || mainIngredient;
	const currentIndex = options.indexOf(currentAlt);
	const nextIndex = currentIndex === -1 || currentIndex + 1 >= options.length ? 0 : currentIndex + 1;
	V.foodstuff[mainIngredient].alternative = options[nextIndex];
}
window.ingredientsNextAlternative = ingredientsNextAlternative;

function kitchenFilter() {
	T.recipeKeys = [];
	T.recipesGroups = ["ingredients", "sweets", "savouries", "drinks"];
	const kitchenFilter = T.foodSearch ? T.foodSearch.split(/[_ ]/g) : false;

	let missingIngredients = false;
	let providedIngredients = false;
	let knownRestrictions = false;

	Object.keys(setup.foodstuff).forEach(recipe => {
		const item = setup.foodstuff[recipe];

		if (
			kitchenFilter &&
			!kitchenFilter.find(
				term =>
					(V.options.ingredientsSearch !== "ingredients" &&
						(item.name.includes(term) || item.category.includes(term) || item.plural?.includes(term) || item.singular?.includes(term))) ||
					(V.options.ingredientsSearch !== "recipes" &&
						item.recipe?.ingredients.find(ingredient => ingredient.includes(term) || ingredientUsed(ingredient)?.includes(term)))
			)
		) {
			return;
		}

		if (T.ingredientsSupplied?.includes(recipe)) {
			providedIngredients = true;
			if (!T.recipeKeys.some(recipe => recipe.key === recipe)) T.recipeKeys.push({ key: recipe, group: "Provided Ingredients" });
			return;
		}
		if (!V.foodstuff[recipe].knows_recipe || !item.recipe || !item.recipe.ingredients.length) return;
		let group;

		if (item.food?.tags.includes("sweet")) {
			group = "sweets";
		} else if (item.food?.tags.includes("drink")) {
			group = "drinks";
		} else if (item.category === "ingredient") {
			group = "ingredients";
		} else {
			group = "savouries";
		}

		let missingIngredientsFound = false;
		item.recipe.ingredients.forEach(ingredient => {
			if (ingredientsTotal(ingredient, recipe, true) <= 0 && !ingredientsProvided(ingredient, recipe)) missingIngredientsFound = true;
		});

		if (!ingredientIsAllowed(recipe)) {
			group = "Restricted Ingredients";
			knownRestrictions = true;
		} else if (missingIngredientsFound) {
			group = "Missing Ingredients";
			missingIngredients = true;
		}
		if (!T.recipeKeys.some(recipeObj => recipeObj.key === recipe)) T.recipeKeys.push({ key: recipe, group });
	});

	if (providedIngredients) T.recipesGroups.unshift("Provided Ingredients");
	if (missingIngredients) T.recipesGroups.push("Missing Ingredients");
	if (knownRestrictions) T.recipesGroups.push("Restricted Ingredients");
}
DefineMacro("kitchenFilter", kitchenFilter);

function marketFilter() {
	T.marketKeys = [];
	T.marketGroups = [];
	const marketFilter = T.marketSearch ? T.marketSearch.split(/[_ ]/g) : false;

	let missingItems = false;

	Object.keys(setup.foodstuff).forEach(product => {
		const item = setup.foodstuff[product];

		if (V.foodstuff[product].amount <= 0 && V.foodstuff[product].marketStall === undefined) return;

		// Defaults items to not be displayed in the market stall
		if (V.foodstuff[product].marketStall === undefined) V.foodstuff[product].marketStall = false;

		if (
			marketFilter &&
			!marketFilter.find(term => item.name.includes(term) || item.category.includes(term) || item.plural?.includes(term) || item.singular?.includes(term))
		) {
			return;
		}

		T.marketGroups.pushUnique(item.category);
		let group = item.category;
		if (V.foodstuff[product].amount <= 0) {
			missingItems = true;
			group = "No Stock";
		}
		if (!T.marketKeys.find(productObj => productObj.key === product)) T.marketKeys.push({ key: product, group });
	});

	if (missingItems) T.marketGroups.push("No Stock");
}
DefineMacro("marketFilter", marketFilter);

function teensPresentCheck(location) {
	let present = 0;

	if (V.daily.teensPresent === undefined) {
		if (Weather.temperature < 5 && !Weather.isFrozen("lake")) {
			V.daily.teensPresent = "arcade";
		} else {
			V.daily.teensPresent = "lake";
		}
	}

	if (V.daily.teensPresent === location) {
		if (["day", "dusk"].includes(Time.dayState) && ((Time.schoolDay && Time.hour >= 15) || !Time.schoolDay)) {
			if (location === "arcade" || (location === "lake" && Weather.precipitation === "none")) {
				present = 1;
			}
		}
	}

	return present;
}
window.teensPresentCheck = teensPresentCheck;

function insecurityExists(type) {
	const [possible, returnedType] = statChange.insecurityPossible(type);
	return possible && returnedType === type && V["insecurity_" + type] > 0;
}
window.insecurityExists = insecurityExists;

function isBeastSceneAllowed() {
	return V.settings.bestialityEnabled || ((!V.settings.monsterHallucinationsOnly || V.hallucinations > 0) && V.settings.monsterChance >= random(1, 100));
}
window.isBeastSceneAllowed = isBeastSceneAllowed;

/**
 * Check if an event is going to be dangerous based on rng and the player's Allure. Another target's Allure can
 * be substitued as needed.
 *
 * For consistency, danger rng is rolled once per passage, unless specified through the "reroll" parameter.
 *
 * Lowering the floor increases the player's flat probability of triggering an event. Changing the mod
 * increases / decreases the chance of triggering the event with increasing / decreasing Allure.
 *
 * For a guaranteed activation at 8,000 Allure, set a mod of 1.25, or a floor of 8,000.
 *
 * @param {number} mod allure multiplier
 * @param {number} floor how high of a bar rng(1,10000) needs to pass to qualify as dangerous with 0 allure. default is 9900 (1% chance of danger event)
 * @param {number} allure target allure, usually that of pc, which by default is capped at 8000, resulting in 81% chance of danger with default parameters and max allure
 * @param {boolean} reroll re-roll _danger if called more than once per passage
 * @returns {boolean} whether the roll is dangerous
 */
function dangerEvent(mod = 1, floor = 9900, allure = V.allure, reroll = false) {
	/**
	 * (mod = 1, floor = 8,000)
	 * 8,000 Allure:	100% pass chance
	 * 6,000 Allure:	80% pass chance
	 * 0 Allure:		20% pass chance
	 *
	 * (mod = 1.25, floor = 9,900)
	 * 8,000 Allure:	100% pass chance
	 * 6,000 Allure:	76% pass chance
	 * 0 Allure:		1% pass chance
	 */
	if (!T.danger || reroll) T.danger = random(1, 10000);
	return T.danger >= floor - allure * mod;
}
window.dangerEvent = dangerEvent;

/**
 * @param {"sight" | "hearing" | "instincts" | "any"} sense which sense is being checked
 * @returns {string | false} part as string
 */
function hasSharpSenses(sense = "any") {
	if (["any", "sight"].includes(sense)) {
		if (V.transformationParts.traits.sharpEyes !== "disabled") return "sharp eyes";
		if (currentSkillValue("skulduggery") >= 600) return "experienced eyes";
	}
	if (["any", "hearing"].includes(sense)) {
		if (V.transformationParts.wolf.ears !== "disabled" && V.transformationParts.wolf.ears !== "hidden") return "wolf ears";
		if (V.transformationParts.cat.ears !== "disabled" && V.transformationParts.cat.ears !== "hidden") return "cat ears";
		if (V.transformationParts.fox.ears !== "disabled" && V.transformationParts.fox.ears !== "hidden") return "fox ears";
		if (currentSkillValue("skulduggery") >= 600) return "experienced ears";
	}
	if (["instincts"].includes(sense)) {
		if (V.wolfgirl >= 6) return "wolf instincts";
		if (V.cat >= 6) return "cat instincts";
		if (V.fox >= 6) return "fox instincts";
		if (V.dryad >= 6 || currentSkillValue("tending") >= 900) return "nature-trained instincts";
	}
	return false;
}
window.hasSharpSenses = hasSharpSenses;

function displayDefiantOption(amount) {
	if (isNaN(amount)) paramError("displayDefiantOption", "amount", amount, "Expected a number.");
	amount = Number(amount);
	if (amount) {
		if (V.submissive <= amount || V.wolfgirl >= 6) {
			return true;
		}
		return false;
	}
}
window.displayDefiantOption = displayDefiantOption;

function breakableSoftBinding() {
	/* Allow unbinding any arm bindings, but limit unbinding legs to soft materials or bugged bound states with no clothing */
	if (
		pcAreArmsBound("any") ||
		((["ropes", "vines"].includes(V.worn.feet.name) || [V.feetuse, V.leftleg, V.rightleg].includes("bound")) &&
			!["ankle cuffs", "ball and chain"].includes(V.worn.feet.name))
	) {
		return true;
	}
	return false;
}

window.breakableSoftBinding = breakableSoftBinding;

function averageBunPrice(toSell = T.buns_sold) {
	/* Calculates the average price of a bun with diminishing returns */
	let totalRevenue = 0;
	let remaining = toSell;
	if (V.daily.buns_sold === undefined) {
		V.daily.buns_sold = 0;
	}
	let batch = 1;
	let harmonics = 1;

	/* Calculates the current divisor for buns */
	for (let soldToday = 20; soldToday <= V.daily.buns_sold; soldToday += 20) {
		if (batch === 1) {
			harmonics += 0.5;
		} else {
			harmonics += 1 / Math.max(batch / 20, 1);
		}
		batch++;
	}
	let doneToday = V.daily.buns_sold % 20;
	let pricePerBun = V.bun_value / harmonics;
	let bunsInBatch = 0;

	/* Sells the new buns */
	while (remaining > 0) {
		bunsInBatch = Math.min(20 - doneToday, remaining);
		doneToday = 0;

		totalRevenue += bunsInBatch * pricePerBun;
		remaining -= bunsInBatch;
		if (batch === 1) {
			harmonics += 0.5;
		} else {
			harmonics += 1 / Math.max(batch / 20, 1);
		}
		batch++;
		pricePerBun = V.bun_value / harmonics;
	}

	V.daily.buns_sold += T.buns_sold;

	return totalRevenue / toSell;
}
window.averageBunPrice = averageBunPrice;
