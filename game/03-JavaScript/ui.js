/* eslint-disable eqeqeq */
/* eslint-disable jsdoc/require-description-complete-sentence */
/* globals hasSexStat, sexStatNameMapper, heatRutSexStatModifier, drunkSexStatModifier */

function overlayShowHide(elementId) {
	const div = document.getElementById(elementId);
	if (div != null) {
		div.classList.toggle("hidden");
		if (elementId === "debugOverlay") {
			V.debugMenu[0] = !V.debugMenu[0];
		}
	}
	window.cacheDebugDiv();
}
window.overlayShowHide = overlayShowHide;

function overlayMenu(elementId, type) {
	if (type === "debug") {
		window.toggleClassDebug(elementId + "Button", "bg-color");
		V.debugMenu[1] = elementId;
		if (document.getElementById(elementId) != null) {
			if (V.debugMenu[2].length > 0) window.toggleClassDebug(elementId, "hideWhileSearching");
			else window.toggleClassDebug(elementId, "classicHide");
		}
		if ((elementId === "debugFavourites" || elementId === "debugAdd") && V.debugMenu[2] != null && V.debugMenu[2].length > 0) {
			V.debugMenu[2] = "";
			document.getElementById("searchEvents").value = "";
			window.researchEvents("");
		}
		if (elementId === "debugFavourites") {
			window.patchDebugMenu();
		}
	}
	window.cacheDebugDiv();
}
window.overlayMenu = overlayMenu;

// Links.disableNumberifyInVisibleElements.push("#passage-testing-room");

$(document).on(":passagerender", function (ev) {
	if (passage() === "GiveBirth") {
		$(ev.content)
			.find("[type=checkbox]")
			.on("propertychange change", function () {
				Wikifier.wikifyEval("<<resetPregButtons>>");
				Links.generateLinkNumbers(ev.content);
			});
	}
});

function ensureIsArray(x, check = false) {
	if (check) x = x != null ? x : [];
	if (Array.isArray(x)) return x;
	return [x];
}
window.ensureIsArray = ensureIsArray;

// feats related widgets
// This needs updating, it's poorly designed.
function closeFeats(id) {
	const div1 = document.getElementById("feat-" + id);
	const div2 = document.getElementById("closeFeat-" + id);
	div1.style.display = "none";
	div2.style.display = "none";
	let otherFeatDisplay;
	let elementId = id + 1;
	let newId = parseInt(div1.classList.value.replace("feat feat", ""));
	do {
		otherFeatDisplay = document.getElementById("feat-" + elementId);
		if (otherFeatDisplay) {
			if (otherFeatDisplay.style.display !== "none" && !isNaN(newId)) {
				otherFeatDisplay.removeAttribute("class");
				otherFeatDisplay.classList.add("feat");
				otherFeatDisplay.classList.add("feat" + newId);
				otherFeatDisplay.classList.add("feat-overlay");
				if (newId >= 3) {
					otherFeatDisplay.classList.add("hiddenFeat");
				}
				newId++;
			}
			elementId++;
		}
	} while (otherFeatDisplay);
}
window.closeFeats = closeFeats;

function getTimeNumber(t) {
	const time = new Date(t);
	const result = time.getTime();
	if (isNaN(result)) {
		return 999999999999999;
	}
	return result;
}
window.getTimeNumber = getTimeNumber;

function extendStats() {
	V.extendedStats = !V.extendedStats;
	const $captionDiv = $("#storyCaptionDiv");
	if ($captionDiv.length === 0) return;

	$captionDiv.toggleClass("statsExtended", V.extendedStats);
	Wikifier.wikifyEval("<<replace #stats>><<statsCaption>><</replace>>");
}
window.extendStats = extendStats;

function customColour(color, saturation, brightness, contrast, sepia) {
	return (
		// eslint-disable-next-line prettier/prettier
		"filter: hue-rotate(" + color + "deg) saturate(" + saturation + ") brightness(" + brightness + ") contrast(" + contrast + ") sepia(" + sepia + ")"
	);
}
window.customColour = customColour;

function zoom(value) {
	const slider = $("[name$='" + Util.slugify("options.zoom") + "']");
	value = Math.clamp(value || slider?.val() || 0, 50, 200);

	$("body").css("zoom", value + "%");
	const zoomScale = value / 100;
	// SVG map
	$(".zoomable").each(function () {
		const $image = $(this);
		const originalWidth = $image.data("original-width") || this.width.baseVal.value;
		const originalHeight = $image.data("original-height") || this.height.baseVal.value;

		$image
			.data({ "original-width": originalWidth, "original-height": originalHeight })
			.attr({ width: originalWidth * zoomScale, height: originalHeight * zoomScale });
	});

	if (slider.length && slider.val() != value) slider.val(value).trigger("change");
}

window.zoom = zoom;

function beastTogglesCheck() {
	T.beastVars = [
		"bestialityEnabled",
		"swarmsEnabled",
		"parasitesEnabled",
		"parasitePregnancyEnabled",
		"tentaclesEnabled",
		"slimesEnabled",
		"voreEnabled",
		"spidersEnabled",
		"slugsEnabled",
		"waspsEnabled",
		"beesEnabled",
		"lurkersEnabled",
		"horsesEnabled",
		"plantsEnabled",
	];
	T.anyBeastOn = T.beastVars.some(x => V.settings[x] === true);
}
window.beastTogglesCheck = beastTogglesCheck;

// Checks current settings page for data attributes
// Run only when settings tab is changed (probably in "displaySettings" widget)
// data-target is the target element that needs to be clicked for the value to be updated
// data-disabledif is the conditional statement (e.g. data-disabledif="V.per_npc[T.pNPCId].gender==='f'")

function settingsDisableElement() {
	$(() => {
		$("[data-disabledif]").each(function () {
			const updateButtonsActive = () => {
				$(() => {
					try {
						const evalStr = "'use strict'; return " + disabledif;
						// eslint-disable-next-line no-new-func
						const cond = Function(evalStr)();
						const style = cond ? "var(--500)" : "";
						orig.css("color", style).children().css("color", style);
						orig.find("input").prop("disabled", cond);
						$(document).trigger("rangeslider::update");
					} catch (e) {
						console.log(e);
					}
				});
			};
			const orig = $(this);
			const disabledif = orig.data("disabledif");
			[orig.data("target")].flat().forEach(e => $("[name$='" + Util.slugify(e) + "']").on("click", updateButtonsActive));
			if (disabledif) {
				updateButtonsActive();
			}
		});
	});
}
window.settingsDisableElement = settingsDisableElement;

// Adds event listeners to input on current page
// mainly used for options overlay
function onInputChanged(func) {
	if (!func || typeof func !== "function") return;
	$(() => {
		$("input, select").on("change", function () {
			func();
		});
	});
}
window.onInputChanged = onInputChanged;

function closeOverlay() {
	wikifier("journalNotesTextareaSave");
	updateOptions();
	T.buttons.reset();
	$("#customOverlay").addClass("hidden").parent().addClass("hidden");
	$.event.trigger(":oncloseoverlay", [T.currentOverlay]);
	delete T.currentOverlay;
	delete V.tempDisable;
}
window.closeOverlay = closeOverlay;

function journalNotesReplacer(name) {
	return name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5' _-]+/g, "");
}
window.journalNotesReplacer = journalNotesReplacer;

function updatehistorycontrols() {
	// if undefined, initiate new variable based on engine config
	if (V.options.maxStates === undefined) V.options.maxStates = Config.history.maxStates;
	else Config.history.maxStates = V.options.maxStates; // update engine config

	// enable fast rng re-roll on "keypad *" for debug and testing
	if (V.debug || V.cheatsEnabled === true || V.testing) Links.disableRNGReload = false;
	else Links.disableRNGReload = true;

	// option to still record history without showing the controls, for better debugging
	if (V.options.maxStates === 1 || !V.options.historyControls || V.ironmanmode) {
		// hide nav panel when it's useless or set to not be displayed
		Config.history.controls = false;
		jQuery("#ui-bar-history").hide();
	} else if (Config.history.maxStates > 1) {
		// or unhide it otherwise, if config allows
		Config.history.controls = true;
		jQuery("#ui-bar-history").show();
	}
}
window.updatehistorycontrols = updatehistorycontrols;
DefineMacro("updatehistorycontrols", updatehistorycontrols);

/*
	Refreshes the game when exiting options menu - applying the options object after State has been restored.
	It is done this way to prevent exploits by re-rendering the same passage
*/
function updateOptions() {
	if (T.currentOverlay === "options" && T.optionsRefresh && V.passage !== "Start") {
		updatehistorycontrols();
		const optionsData = clone(V.options);
		const tmpButtons = T.buttons;
		const tmpKey = T.key;

		if (!State.restore(true)) return; // don't do anything if state couldn't be restored
		V.options = optionsData;
		State.show();

		T.key = tmpKey;
		T.buttons = tmpButtons;
		T.buttons.setupTabs();
		if (T.key !== "options") {
			T.buttons.setActive(T.buttons.activeTab);
		}
		Weather.Observables.checkForUpdate();
	}
}
window.updateOptions = updateOptions;

$(document).on("click", "#cbtToggleMenu .cbtToggle", function (e) {
	$("#cbtToggleMenu").toggleClass("visible");
});

function elementExists(selector) {
	return document.querySelector(selector) !== null;
}
window.elementExists = elementExists;

window.getCharacterViewerDate = () => {
	const textArea = document.getElementById("characterViewerDataInput");
	textArea.value = JSON.stringify(V.characterViewer);
};

window.loadCharacterViewerDate = () => {
	const textArea = document.getElementById("characterViewerDataInput");
	let data;
	try {
		data = JSON.parse(textArea.value);
	} catch (e) {
		textArea.value = "Invalid JSON";
	}
	const original = clone(V.characterViewer);

	if (typeof data === "object" && !Array.isArray(data) && data !== null) {
		V.characterViewer = {
			...original,
			...data.clothesEquipped,
			...data.clothesIntegrity,
			...data.bodyState,
			...data.colours,
			...data.skinColour,
			...data.controls,
		};
		State.display(V.passage);
	} else {
		textArea.value = "Invalid Import";
	}
};

function updateCaptionTooltip() {
	const elementId = "#characterTooltip";
	const element = $(elementId);
	const content = $("<div>");
	const canvas = $("#img canvas");
	const fragment = document.createDocumentFragment();
	const updateTooltip = () => {
		if (V.intro) return;
		fragment.append(wikifier("clothingCaptionText"));
		content.append(fragment);
		element.tooltip({
			message: content,
			delay: 200,
			position: "cursor",
		});
	};

	let isMouseOverElement = false;

	// Workaround for trickle-through on the canvas
	// So that the contextmenu works while having tooltips in an element below it (to define the area where tooltip shows up)
	const checkMousePosition = e => {
		if (!e || typeof e.clientX !== "number" || typeof e.clientY !== "number") {
			return;
		}

		// Prevent recursion by ignoring events triggered by the tooltip itself
		if ($(e.target).is("#characterTooltip")) {
			return;
		}

		const isCurrentlyOverElement = $(document.elementsFromPoint(e.clientX, e.clientY)).is("#characterTooltip");

		// Only trigger events if the status has changed
		if (isCurrentlyOverElement && !isMouseOverElement) {
			element.trigger("mouseenter");
			canvas.css("cursor", "help");
			isMouseOverElement = true;
		} else if (!isCurrentlyOverElement && isMouseOverElement) {
			element.trigger("mouseleave");
			$(".tooltip-popup").remove();
			canvas.css("cursor", "");
			isMouseOverElement = false;
		}

		// If the mouse is currently over the element, trigger mousemove as well
		if (isCurrentlyOverElement) {
			element.trigger({
				type: "mousemove",
				clientX: e.clientX,
				clientY: e.clientY,
			});
		}
	};

	updateTooltip();
	$(document).off(":passageend", updateCaptionTooltip);
	$(document).on(":passageend", updateCaptionTooltip);
	// Add event listeners only when the mouse is over the canvas
	canvas.on("mouseenter", () => {
		$(document).on("mousemove", checkMousePosition);
	});

	canvas.on("mouseleave", () => {
		$(document).off("mousemove", checkMousePosition);
		if (isMouseOverElement) {
			// Cleanup if mouse leaves the canvas while over the tooltip element
			element.trigger("mouseleave");
			$(".tooltip-popup").remove();
			canvas.css("cursor", "");
			isMouseOverElement = false;
		}
	});
}
$(() => updateCaptionTooltip());
window.updateCaptionTooltip = updateCaptionTooltip;

function returnTimeFormat() {
	return V?.options?.dateFormat ?? "en-GB";
}
window.returnTimeFormat = returnTimeFormat;

/* Temporary until npc rework */
function sensitivityString(value) {
	if (value >= 3.5) return "sensitive";
	if (value >= 2.5) return "tender";
	if (value >= 1.5) return "receptive";
	return "normal";
}

window.sensitivityString = sensitivityString;

function moneyStatsProcess(stats) {
	const keys = [];
	Object.entries(stats).forEach(([type, value]) => {
		if (!T.moneyStatsDetailed) {
			let compressTo;
			if (type.includes("DanceTip")) {
				compressTo = "danceTips";
			} else if (type.includes("DanceJob")) {
				compressTo = "danceJobs";
			} else if (type.includes("Prostitution")) {
				compressTo = "prostitution";
			} else {
				switch (type) {
					case "libraryBooks":
					case "schoolProject":
					case "schoolCondoms":
					case "schoolStimulant":
					case "schoolPoolParty":
						compressTo = "school";
						break;
					case "bus":
						compressTo = "town";
						break;
					case "avery":
					case "bailey":
					case "baileyRent":
					case "robin":
					case "sydney":
					case "whitney":
					case "gwylan":
						compressTo = "peopleOfInterest";
						break;
					case "hairdressers":
					case "tailor":
					case "clothes":
					case "sexToys":
					case "tattoo":
					case "furniture":
					case "cosmetics":
					case "supermarket":
						compressTo = "shopping";
						break;
					case "flatsCanal":
					case "flatsCleaning":
					case "flatsHookah":
						compressTo = "flats";
						break;
					case "cafeWaiter":
					case "cafeChef":
					case "cafeBuns":
						compressTo = "cafe";
						break;
					case "brothelShow":
					case "brothelVendingMachine":
					case "brothelCondoms":
						compressTo = "brothel";
						break;
					case "hospitalPaternityTest":
					case "hospitalPenisReduction":
					case "hospitalPenisEnlargement":
					case "hospitalBreastReduction":
					case "hospitalBreastEnlargement":
					case "hospitalParasiteRemoval":
					case "hospitalParasitesSold":
						compressTo = "hospital";
						break;
					case "pharmacyCondoms":
					case "pharmacyCream":
					case "pharmacyPills":
					case "pharmacyPregnancyTest":
					case "pharmacyBreastPump":
					case "pharmacyAfterPill":
						compressTo = "pharmacy";
						break;
					case "museumAntique":
						compressTo = "museum";
						break;
					case "pubAlcohol":
						compressTo = "pub";
						break;
					case "docksWage":
						compressTo = "docks";
						break;
					case "stripClubBartender":
					case "stripClubDancer":
						compressTo = "stripClub";
						break;
				}
			}

			if (compressTo) {
				if (!stats[compressTo]) {
					stats[compressTo] = { earned: 0, earnedCount: 0, spent: 0, spentCount: 0 };
				}
				if (value.earned) {
					stats[compressTo].earned = (stats[compressTo].earned || 0) + value.earned;
					stats[compressTo].earnedCount = (stats[compressTo].earnedCount || 0) + value.earnedCount;
					stats[compressTo].earnedTimeStamp = Math.max(0, stats[compressTo].earnedTimeStamp || 0, value.earnedTimeStamp || 0);
				}
				if (value.spent) {
					stats[compressTo].spent = (stats[compressTo].spent || 0) + value.spent;
					stats[compressTo].spentCount = (stats[compressTo].spentCount || 0) + value.spentCount;
					stats[compressTo].spentTimeStamp = Math.max(0, stats[compressTo].spentTimeStamp || 0, value.spentTimeStamp || 0);
				}
				delete stats[type];
				keys.pushUnique(compressTo);
				return;
			}
		}
		keys.pushUnique(type);
	});
	const total = { earned: 0, earnedCount: 0, spent: 0, spentCount: 0 };
	Object.values(stats).forEach(stat => {
		if (stat.earned) total.earned += stat.earned;
		if (stat.earnedCount) total.earnedCount += stat.earnedCount;
		if (stat.spent) total.spent += stat.spent;
		if (stat.spentCount) total.spentCount += stat.spentCount;

		if (stat.earnedTimeStamp) total.earnedTimeStamp = Math.max(stat.earnedTimeStamp, total.earnedTimeStamp || 0);
		if (stat.spentTimeStamp) total.spentTimeStamp = Math.max(stat.spentTimeStamp, total.spentTimeStamp || 0);
	});

	return [keys, stats, total];
}
window.moneyStatsProcess = moneyStatsProcess;

/**
 * If hasSexStat() modifiers are allowing the player to see an aditional option, return the css class for the largest individual modifier.
 * If the modifiers are not high enough to show a new option, don't return a class.
 * Passing in 0 or nothing for requiredLevel returns the classes for the largest modifier regardless of if the player is being shown an aditional option.
 *
 * Returns the sexStat Modifer CSS classes drunk-text / jitter-text and the level of the effect (drunk-1, jitter-2...)
 *
 * When text animations are turned off, this will only return drunk-text or jitter-text without the animation level.
 *
 * @param {string} input
 * @param {number} requiredLevel
 */
function getLargestSexStatModifierCssClasses(input, requiredLevel = 0) {
	const statName = sexStatNameMapper(input);
	// check if stat name is valid.
	if (statName == null) {
		Errors.report(`[getLargestSexStatModifierCssClasses]: input '${statName}' null.`, {
			Stacktrace: Utils.GetStack(),
			statName,
		});
		return "";
	}

	const drunkSexStatModifierValue = drunkSexStatModifier(V[statName]);
	const heatRutSexStatModifierValue = heatRutSexStatModifier(statName);

	// If there is a modifier and either requiredLevel is 0 or the modifiers put the player up a level of the sexStat.
	if (
		drunkSexStatModifierValue + heatRutSexStatModifierValue > 0 &&
		(requiredLevel === 0 || (!hasSexStat(statName, requiredLevel, false) && hasSexStat(statName, requiredLevel, true)))
	) {
		const modifiers = [
			{ value: drunkSexStatModifierValue, class: "drunk" },
			{ value: heatRutSexStatModifierValue, class: "jitter" },
		];

		// Gets the largest modifier.
		const largestModifier = modifiers.reduce((max, current) => (current.value > max.value ? current : max), modifiers[0]);

		// Gets the base class for effect.
		let modifierClasses = `${largestModifier.class}-text`;

		if (
			V.options.textAnimsAll &&
			((largestModifier.class === "jitter" && V.options.textAnimsHeat) || (largestModifier.class === "drunk" && V.options.textAnimsDrunk))
		) {
			// Sets the animation based on how large the modifier is.
			if (largestModifier.value > 20) {
				modifierClasses += ` ${largestModifier.class}-3`;
			} else if (largestModifier.value > 10) {
				modifierClasses += ` ${largestModifier.class}-2`;
			} else {
				modifierClasses += ` ${largestModifier.class}-1`;
			}

			modifierClasses += ` animation-offset-${Math.floor(Math.random() * 10)}`;
		}

		return modifierClasses;
	} else {
		return "";
	}
}
window.getLargestSexStatModifierCssClasses = getLargestSexStatModifierCssClasses;

/**
 * Used to display the drunk text, with animations if enabled, otherwise just the glow effect.
 *
 * @returns {string}
 */
function basicDrunkCss() {
	return V.options.textAnimsAll && V.options.textAnimsDrunk ? "drunk-text drunk-1" : "drunk-text";
}
window.basicDrunkCss = basicDrunkCss;

/**
 * Used to display the jitter text, with animations if enabled, otherwise just the glow effect.
 *
 * @returns {string}
 */
function basicJitterCss() {
	return V.options.textAnimsAll && V.options.textAnimsHeat ? "jitter-text jitter-1" : "jitter-text";
}
window.basicJitterCss = basicJitterCss;

/**
 * Used to display the hypnosis text, with animations if enabled, otherwise just the gradient.
 *
 * @returns {string}
 */
function basicHypnoCss() {
	return V.options.textAnimsAll && V.options.textAnimsHypno ? "hypno-text hypno" : "hypno-text";
}
window.basicHypnoCss = basicHypnoCss;
