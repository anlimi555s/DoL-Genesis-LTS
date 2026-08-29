/* globals traverse, traversePair */

const DoLSave = ((Story, Save) => {
	"use strict";

	const DEFAULT_DETAILS = Object.freeze({
		id: Story.domId,
		autosave: null,
		slots: [null, null, null, null, null, null, null, null],
	});
	const KEY_DETAILS = "dolSaveDetails";

	// Compressed saves are indicated by {jsoncompressed:1} in their metadata
	// The '1' can act as a compression algorithm id.

	// see game/00-framework-tools/03-compression/dictionaries.js
	const COMPRESSOR_DICTIONARIES = DoLCompressorDictionaries;
	// id of the dictionary to use for saving
	const COMPRESSOR_CURRENT_DICTIONARY_ID = "v3";
	/**
	 * When saving, decompress and compare with the original.
	 * If results differ, report an error and save the uncompressed version instead.
	 */
	function shouldVerifyCompression() {
		return true;
	}

	/* Place somewhere to expose globally. */
	function isObject(obj) {
		return typeof obj === "object" && obj != null;
	}

	/* Can also call from backcomp in the future? */
	function getSaveVersion(variables) {
		if (isObject(variables)) {
			if (!variables.saveVersions) {
				return -1;
			}
			return variables.saveVersions.last();
		}
		return -2;
	}

	function marshalVersion(version) {
		return typeof version === "string"
			? version
					.replace(/[^0-9.]+/g, "")
					.split(".")
					.map(v => parseInt(v))
			: [0, 0, 0, 0];
	}

	function parseVersion(version) {
		version = marshalVersion(version);
		return version ? version[0] * 1000000 + version[1] * 10000 + version[2] * 100 + version[3] * 1 : 0;
	}

	/**
	 * The handler which the load button should call.
	 * Contains checks to determine whether the save loads or pops up a confirmation window.
	 *
	 * @param {any} slot The slot ID to get the save from. 0 to 9, or 'auto'.
	 * @param {boolean} confirm Bypass the load confirmation.
	 * @returns {void}
	 */
	function loadHandler(slot, confirm) {
		if (V.ironmanmode === true && V.passage !== "Start") {
			Wikifier.wikifyEval(`<<loadIronmanSafetyCancel ${slot}>>`);
			return;
		}
		if (V.confirmLoad === true && confirm === undefined) {
			Wikifier.wikifyEval(`<<loadConfirm ${slot}>>`);
			return;
		}
		const save = slot === "auto" ? Save.autosave.get() : Save.slots.get(slot);
		// an empty slot gives back null, which is not the same as an empty save. JavaScript treats null as an object.
		// so checking the type alone would let an empty slot through and crash - isObject rules out null
		if (!isObject(save)) {
			Errors.report("Could not find a valid save at that slot.", {});
			return;
		}
		const currVersion = parseVersion(StartConfig.version);
		/* Assume the save->variables is valid if an object. */
		const saveVersion = parseVersion(getSaveVersion(save.state.delta[0].variables));
		if (currVersion < saveVersion) {
			Wikifier.wikifyEval(`<<loadconfirmcompat ${slot}>>`);
			return;
		}
		load(slot, save);
	}

	/**
	 * Loads the given saveobj, or the save from the given slot.
	 *
	 * @param {number|string} slot The slot ID to get the save from. 0 to 9, or 'auto'.
	 * @param {object} saveObj The save object if already possessed by the callee.
	 * @param {boolean} overrides
	 * @returns {void}
	 */
	function load(slot, saveObj, overrides) {
		const save = saveObj == null ? (slot === "auto" ? Save.autosave.get() : Save.slots.get(slot)) : saveObj;
		// the details record can be missing (storage cleared) or lack this slot's row, so default to safe empties and don't crash
		const saveDetails = JSON.parse(localStorage.getItem(KEY_DETAILS)) ?? { autosave: null, slots: [] };
		const details = slot === "auto" ? saveDetails.autosave : saveDetails.slots[slot];
		const metadata = details?.metadata ?? {};
		/* Check if metadata for save matches the save's computed md5 hash. If it matches, the ironman save was not tampered with.
			Bypass this check if on a mobile, because they are notoriously difficult to grab saves from in the event of issues. */
		if (metadata.ironman && !Browser.isMobile.any()) {
			IronMan.update(save, metadata);
			// (if ironman mode enabled) following checks md5 signature of the save to see if the variables have been modified
			if (!IronMan.compare(metadata, save)) {
				Wikifier.wikifyEval(`<<loadIronmanCheater ${slot}>>`);
				return;
			}
		}
		const loaded = slot === "auto" ? Save.autosave.load() : Save.slots.load(slot);
		// if the load failed, stop here so ironman mode doesn't delete the player's other saves for nothing
		if (!loaded) return;
		if (V.ironmanmode) {
			// (ironman) remove all saves(except auto-save) with the same saveId than loaded save
			[0, 1, 2, 3, 4, 5, 6, 7].forEach(id => {
				const saveDetail = saveDetails.slots[id];
				if (saveDetail == null) return;
				if (saveDetail.metadata.saveId === metadata.saveId) {
					Save.slots.delete(id);
					deleteSaveDetails(id);
				}
			});
		}
	}

	function save(saveSlot, confirm, saveId, saveName) {
		if (saveId == null) {
			Wikifier.wikifyEval(`<<saveConfirm ${saveSlot}>>`);
		} else if ((V.confirmSave === true && confirm !== true) || (V.saveId !== saveId && saveId != null)) {
			Wikifier.wikifyEval(`<<saveConfirm ${saveSlot}>>`);
		} else {
			if (saveSlot != null) {
				const success = Save.slots.save(saveSlot, null, {
					saveId,
					saveName,
					ironman: V.ironmanmode,
				});
				if (success) {
					const save = Save.slots.get(saveSlot);
					// Copy save metadata (it includes the jsoncompressed indicator)
					const metadata = { ...save.metadata, saveId, saveName };
					if (V.ironmanmode) {
						Object.assign(metadata, {
							ironman: V.ironmanmode,
							signature: V.ironmanmode ? IronMan.getSignature(save) : false,
							schema: IronMan.schema,
						});
					}
					setSaveDetail(saveSlot, metadata);
					delete T.currentOverlay;
					// todo: find a better solution
					closeOverlay();
					if (V.ironmanmode === true) Engine.restart();
				}
			}
		}
	}

	function deleteSave(saveSlot, confirm) {
		if (saveSlot === "all") {
			if (confirm === undefined) {
				Wikifier.wikifyEval("<<clearSaveMenu>>");
				return;
			} else if (confirm === true) {
				Save.clear();
				deleteAllSaveDetails();
			}
		} else if (saveSlot === "auto") {
			if (V.confirmDelete === true && confirm === undefined) {
				Wikifier.wikifyEval(`<<deleteConfirm ${saveSlot}>>`);
				return;
			} else {
				Save.autosave.delete();
				deleteSaveDetails("autosave");
			}
		} else {
			if (V.confirmDelete === true && confirm === undefined) {
				Wikifier.wikifyEval(`<<deleteConfirm ${saveSlot}>>`);
				return;
			} else {
				Save.slots.delete(saveSlot);
				deleteSaveDetails(saveSlot);
			}
		}
		Wikifier.wikifyEval("<<resetSaveMenu>>");
	}

	function importSave(saveFile) {
		if (!window.FileReader) return; // Browser is not compatible

		const reader = new FileReader();

		reader.onloadend = function () {
			DeserializeGame(this.result);
		};

		reader.readAsText(saveFile[0]);
	}

	function prepareSaveDetails(forceRun) {
		const saveDetails = getSaveDetails();
		if (saveDetails == null || saveDetails.id !== Story.domId || forceRun) {
			const scSaveDetails = Save.get();
			// clone so we don't fill in the shared template and leave ghost saves
			const dolSaveDetails = clone(DEFAULT_DETAILS);
			/* Search SugarCube's autosave property, if it exists, reflect this in the save details. */
			if (scSaveDetails.autosave != null) {
				dolSaveDetails.autosave = {
					title: scSaveDetails.autosave.title,
					date: scSaveDetails.autosave.date,
					metadata: scSaveDetails.autosave.metadata,
				};
				if (dolSaveDetails.autosave.metadata === undefined) {
					dolSaveDetails.autosave.metadata = { saveName: "" };
				}
				if (dolSaveDetails.autosave.metadata.saveName === undefined) {
					dolSaveDetails.autosave.metadata.saveName = "";
				}
			}
			/* Check whether SugarCube's save slots exist and populate save details with them. */
			for (let i = 0; i < scSaveDetails.slots.length; i++) {
				if (scSaveDetails.slots[i] !== null) {
					dolSaveDetails.slots[i] = {
						title: scSaveDetails.slots[i].title,
						date: scSaveDetails.slots[i].date,
						metadata: scSaveDetails.slots[i].metadata,
					};
					if (dolSaveDetails.slots[i].metadata === undefined) {
						dolSaveDetails.slots[i].metadata = { saveName: "old save", saveId: 0 };
					}
					if (dolSaveDetails.slots[i].metadata.saveName === undefined) {
						dolSaveDetails.slots[i].metadata.saveName = "old save";
					}
				} else {
					dolSaveDetails.slots[i] = null;
				}
			}

			localStorage.setItem(KEY_DETAILS, JSON.stringify(dolSaveDetails));
			return true;
		}
		return false;
	}

	function setSaveDetail(saveSlot, metadata, story) {
		const saveDetails = JSON.parse(localStorage.getItem(KEY_DETAILS));
		if (saveSlot === "autosave") {
			saveDetails.autosave = {
				id: Story.domId,
				title: Story.get(V.passage).description(),
				date: Date.now(),
				metadata,
			};
		} else {
			const slot = parseInt(saveSlot);
			saveDetails.slots[slot] = {
				id: Story.domId,
				title: Story.get(V.passage).description(),
				date: Date.now(),
				metadata,
			};
		}
		localStorage.setItem(KEY_DETAILS, JSON.stringify(saveDetails));
	}

	function getSaveDetails(saveSlot) {
		if (Object.hasOwn(localStorage, KEY_DETAILS)) {
			const saveDetails = JSON.parse(localStorage.getItem(KEY_DETAILS));
			if (typeof saveSlot === "number") {
				if (saveDetails != null) {
					return saveDetails.slots[saveSlot];
				}
			} else {
				return saveDetails;
			}
		}
		return null;
	}

	function deleteSaveDetails(saveSlot) {
		const saveDetails = JSON.parse(localStorage.getItem(KEY_DETAILS));
		if (saveSlot === "autosave") {
			saveDetails.autosave = null;
		} else {
			const slot = parseInt(saveSlot);
			saveDetails.slots[slot] = null;
		}
		localStorage.setItem(KEY_DETAILS, JSON.stringify(saveDetails));
	}

	function deleteAllSaveDetails() {
		localStorage.setItem(KEY_DETAILS, JSON.stringify(DEFAULT_DETAILS));
	}

	function returnSaveData() {
		return Save.get();
	}

	function resetSaveMenu() {
		Wikifier.wikifyEval("<<resetSaveMenu>>");
	}

	function ironmanAutoSave() {
		const saveSlot = 8;
		const success = Save.slots.save(saveSlot, null, {
			saveId: V.saveId,
			saveName: V.saveName,
			ironman: V.ironmanmode,
		});
		if (success) {
			const save = Save.slots.get(saveSlot);
			const metadata = { saveId: V.saveId, saveName: V.saveName };
			if (V.ironmanmode) {
				Object.assign(metadata, {
					ironman: V.ironmanmode,
					signature: V.ironmanmode ? IronMan.getSignature(save) : false,
					schema: IronMan.schema,
				});
			}
			setSaveDetail(saveSlot, metadata);
		}
	}

	Macro.add("incrementautosave", {
		handler() {
			if (!V.ironmanmode) V.saveDetails.auto.count++;
		},
	});

	/**
	 * Compress a game state (not delta-encoded: {title, variables, prng, pull}) using most recent dictionary.
	 * Can throw an error.
	 *
	 * @param {object} state
	 */
	function compressState(state) {
		const dictionary = COMPRESSOR_DICTIONARIES[COMPRESSOR_CURRENT_DICTIONARY_ID];
		const compressor = new JsonCompressor(dictionary);
		const zstate = compressor.compress(state);
		zstate.dictionary = COMPRESSOR_CURRENT_DICTIONARY_ID;
		zstate.title =
			"This save is compressed and is not compatible with old versions of Degrees of Lewdity. If you want to load this save in an older game build, use exporting.";
		zstate.variables = {};
		if (shouldVerifyCompression()) {
			// Sanity check
			const uzstate = decompressState(zstate);
			if (JSON.stringify(state) !== JSON.stringify(uzstate)) {
				throw new Error("Decompression check failed");
			}
		}
		return zstate;
	}

	/**
	 * Decompress the saved state using the dictionary it was compressed with.
	 * Can throw an error.
	 *
	 * @param {object} zstate
	 */
	function decompressState(zstate) {
		if (!("dictionary" in zstate)) throw new Error("Unable to load - compressed save has no dictionary");
		const dicid = zstate.dictionary;
		if (!(dicid in COMPRESSOR_DICTIONARIES))
			throw new Error(
				"Unable to decompress the save - the dictionary " +
					JSON.stringify(dicid) +
					" is unknown to this game version (trying to load newer save from older game?)"
			);
		const dictionary = COMPRESSOR_DICTIONARIES[dicid];
		const decompressor = new JsonDecompressor(dictionary);
		return decompressor.decompress(zstate);
	}
	function enableCompression() {
		V.compressSave = true;
	}
	function disableCompression() {
		V.compressSave = false;
	}
	function isCompressionEnabled() {
		// for now, save compressor and delta-encoder work against each other, leading to bigger saves when both are active
		// todo: make them friends?
		return V.compressSave && State.history.length === 1;
	}

	/**
	 * Compress a SaveObject (the one with metadata and delta-encoded history), if the compression is enabled.
	 * If compression fails, report and error and do nothing.
	 * This function returns nothing, it modifies the saveObj parameter.
	 *
	 * @param {object} saveObj
	 */
	function compressIfNeeded(saveObj) {
		if (!saveObj.metadata) saveObj.metadata = {};
		saveObj.metadata.jsoncompressed = 0;
		if (!isCompressionEnabled()) return;
		try {
			saveObj.state.history = saveObj.state.history.map(state => compressState(state));
			saveObj.metadata.jsoncompressed = 1;
		} catch (e) {
			DOL.Errors.report("Unable to compress - " + e);
			console.error(e);
			// Just return, the saveObj won't be modified
		}
	}
	function looksLikeCompressedSave(state) {
		return state.compressed === 1 && Array.isArray(state.values) && typeof state.values === "object" && typeof state.dictionary === "string";
	}
	/**
	 * Decompress a SaveObject (the one with metadata and delta-encoded history), if it is compressed.
	 *
	 * @param {object} saveObj
	 */
	function decompressIfNeeded(saveObj) {
		const isCompressed = (saveObj.metadata && saveObj.metadata.jsoncompressed === 1) || looksLikeCompressedSave(saveObj.state.history[0]);
		if (!isCompressed) return;
		let dictOverride = saveObj.state.history[0].dictionary;
		saveObj.state.history = saveObj.state.history.map(state => {
			state.dictionary = dictOverride;
			if (JsonDecompressor.isCompressed(state)) {
				// decompressing with the wrong dictionary can throw or produce nonsense, treat both as a failed attempt
				const tryDecompress = () => {
					try {
						const result = decompressState(state);
						return result.variables && result.variables.saveVersions ? result : null;
					} catch {
						return null;
					}
				};
				let decompressed = tryDecompress();
				// if that failed, the dictionary might be mislabeled, so try the others until one works
				const otherDicts = Object.keys(COMPRESSOR_DICTIONARIES).filter(d => d !== dictOverride);
				for (let k = 0; k < otherDicts.length && !decompressed; k++) {
					state.dictionary = otherDicts[k];
					decompressed = tryDecompress();
					if (decompressed) dictOverride = otherDicts[k];
				}
				if (!decompressed)
					throw new Error("Unable to decompress the save with any of the game's dictionaries (save is labeled " + JSON.stringify(dictOverride) + ")");
				return decompressed;
			} else return state;
		});
	}

	return Object.freeze({
		save,
		load,
		delete: deleteSave,
		import: importSave,
		getSaves: returnSaveData,
		resetMenu: resetSaveMenu,
		getVersion: getSaveVersion,
		loadHandler,
		enableCompression,
		disableCompression,
		isCompressionEnabled,
		compressState,
		decompressState,
		compressIfNeeded,
		decompressIfNeeded,
		SaveDetails: Object.freeze({
			prepare: prepareSaveDetails,
			set: setSaveDetail,
			get: getSaveDetails,
			delete: deleteSaveDetails,
			deleteAll: deleteAllSaveDetails,
		}),
		IronMan: Object.freeze({
			autoSave: ironmanAutoSave,
		}),
		Utils: Object.freeze({
			parseVer: parseVersion,
		}),
	});
})(Story, Save);
window.DoLSave = DoLSave;

/* Legacy references, references to the global namespace should be avoided, and thus this is considered deprecated usage. */
window.prepareSaveDetails = DoLSave.SaveDetails.prepare;
window.setSaveDetail = DoLSave.SaveDetails.set;
window.getSaveDetails = DoLSave.SaveDetails.get;
window.deleteSaveDetails = DoLSave.SaveDetails.delete;
window.deleteAllSaveDetails = DoLSave.SaveDetails.deleteAll;
window.returnSaveDetails = DoLSave.getSaves;
window.resetSaveMenu = DoLSave.resetMenu;
window.ironmanAutoSave = DoLSave.IronMan.autoSave;
window.loadSave = DoLSave.load;
window.save = DoLSave.save;
window.deleteSave = DoLSave.delete;
window.importSave = DoLSave.import;
window.SerializeGame = Save.serialize;
window.DeserializeGame = Save.deserialize;

window.getSaveData = function () {
	const compressionWasEnabled = DoLSave.isCompressionEnabled();
	DoLSave.disableCompression();
	const input = document.getElementById("saveDataInput");
	input.value = Save.serialize();
	if (compressionWasEnabled) DoLSave.enableCompression();
};

window.loadSaveData = function () {
	const input = document.getElementById("saveDataInput");
	const result = Save.deserialize(input.value);
	if (result === null) {
		input.value = "Invalid Save.";
	}
};

window.clearTextBox = function (id) {
	document.getElementById(id).value = "";
};

window.topTextArea = function (id) {
	const textArea = document.getElementById(id);
	textArea.scroll(0, 0);
};

window.bottomTextArea = function (id) {
	const textArea = document.getElementById(id);
	textArea.scroll(0, textArea.scrollHeight);
};

window.copySavedata = function (id) {
	const saveData = document.getElementById(id);
	saveData.focus();
	saveData.select();

	try {
		document.execCommand("copy");
	} catch (err) {
		const copyTextArea = document.getElementById("CopyTextArea");
		copyTextArea.value = "Copying Error";
		console.log("Unable to copy: ", err);
	}
};

window.importSettings = function (data, type) {
	let reader;
	switch (type) {
		case "text":
			V.importString = compatibilityConversion(document.getElementById("settingsDataInput")?.value);
			Wikifier.wikifyEval('<<displaySettings "importConfirmDetails">>');
			break;
		case "file":
			reader = new FileReader();
			reader.addEventListener("load", function (e) {
				// eslint-disable-next-line no-undef
				V.importString = compatibilityConversion(e.target?.result);
				Wikifier.wikifyEval('<<displaySettings "importConfirmDetails">>');
			});
			reader.readAsBinaryString(data[0]);
			break;
		case "function":
			importSettingsData(data);
			break;
	}
};

function compatibilityConversion(rawData) {
	let processed;

	try {
		processed = JSON.parse(rawData);
	} catch {
		return rawData;
	}
	if (!processed || typeof processed !== "object") return rawData;

	const map = {
		alluremod: { key: "allureModifier", invert: false },
		analdisable: { key: "analEnabled", invert: true },
		analdoubledisable: { key: "analDoubleEnabled", invert: true },
		analingusdisablegiving: { key: "analingusGivingEnabled", invert: true },
		analingusdisablereceiving: { key: "analingusReceivingEnabled", invert: true },
		asphyxiaLvl: { key: "asphyxiaLevel", invert: false },
		baseNpcPregnancyChance: { key: "baseNpcPregnancyChance", invert: false },
		basePlayerPregnancyChance: { key: "basePlayerPregnancyChance", invert: false },
		beastmalechance: { key: "beastMaleChance", invert: false },
		beastMaleChanceFemale: { key: "beastMaleChanceFemale", invert: false },
		beastMaleChanceMale: { key: "beastMaleChanceMale", invert: false },
		beastMaleChanceSplit: { key: "beastMaleChanceSplit", invert: false },
		beedisable: { key: "beesEnabled", invert: true },
		bestialitydisable: { key: "bestialityEnabled", invert: true },
		blackchance: { key: "darkSkinChance", invert: false },
		bodywritingLvl: { key: "bodyWritingLevel", invert: false },
		breast_mod: { key: "breastModifier", invert: false },
		breastfeedingdisable: { key: "breastFeedingEnabled", invert: true },
		cbchance: { key: "maleNPCVaginaChance", invert: false },
		cheatdisabletoggle: { key: "cheatsEnabledToggle", invert: true },
		checkstyle: { key: "skillCheckStyle", invert: false },
		clothesPrice: { key: "clothingCostModifier", invert: false },
		clothesPriceLewd: { key: "lewdClothingCostModifier", invert: false },
		clothesPriceSchool: { key: "schoolClothingCostModifier", invert: false },
		clothesPriceUnderwear: { key: "underwearCostModifier", invert: false },
		condomChance: { key: "condomChance", invert: false },
		condomLvl: { key: "condomLevel", invert: false },
		condomUseChanceCon: { key: "condomUseChanceConsensual", invert: false },
		condomUseChanceRape: { key: "condomUseChanceRape", invert: false },
		cycledisable: { key: "fertilityCycleEnabled", invert: true },
		dgchance: { key: "femaleNPCPenisChance", invert: false },
		facesitdisable: { key: "facesitEnabled", invert: true },
		footdisable: { key: "footFetishEnabled", invert: true },
		forcedcrossdressingdisable: { key: "forcedCrossdressingEnabled", invert: true },
		furniturePriceFactor: { key: "furnitureCostModifier", invert: false },
		horsedisable: { key: "horsesEnabled", invert: true },
		humanPregnancyMonths: { key: "humanPregnancyMonths", invert: false },
		hypnosisdisable: { key: "hypnosisEnabled", invert: true },
		incompletePregnancyDisable: { key: "incompletePregnancyEnabled", invert: true },
		lurkerdisable: { key: "lurkersEnabled", invert: true },
		malechance: { key: "maleChance", invert: false },
		maleChanceFemale: { key: "maleChanceFemale", invert: false },
		maleChanceMale: { key: "maleChanceMale", invert: false },
		maleChanceSplit: { key: "maleChanceSplit", invert: false },
		malevictimchance: { key: "maleVictimChance", invert: false },
		monsterchance: { key: "monsterChance", invert: false },
		monsterhallucinations: { key: "monsterHallucinationsOnly", invert: false },
		multipleWardrobes: { key: "multipleWardrobes", invert: false },
		npcPregnancyDisable: { key: "npcPregnancyEnabled", invert: true },
		npcVirginityChance: { key: "npcVirginChanceStudent", invert: false },
		npcVirginityChanceAdult: { key: "npcVirginChanceAdult", invert: false },
		NudeGenderDC: { key: "nudeGenderPerception", invert: false },
		parasitedisable: { key: "parasitesEnabled", invert: true },
		parasitepregdisable: { key: "parasitePregnancyEnabled", invert: true },
		pbdisable: { key: "pubicHairEnabled", invert: true },
		penis_mod: { key: "penisModifier", invert: false },
		plantdisable: { key: "plantsEnabled", invert: true },
		playerPregnancyBeastDisable: { key: "playerPregnancyBeastEnabled", invert: true },
		playerPregnancyEggLayingDisable: { key: "playerPregnancyEggLayingEnabled", invert: true },
		playerPregnancyHumanDisable: { key: "playerPregnancyHumanEnabled", invert: true },
		pregnancyspeechdisable: { key: "pregnancySpeechEnabled", invert: true },
		pregnancytype: { key: "pregnancyType", invert: false },
		rentmod: { key: "rentCostModifier", invert: false },
		ruinedorgasmdisable: { key: "ruinedOrgasmEnabled", invert: true },
		slimedisable: { key: "slimesEnabled", invert: true },
		slugdisable: { key: "slugsEnabled", invert: true },
		spiderdisable: { key: "spidersEnabled", invert: true },
		statdisable: { key: "blindStatsEnabled", invert: false },
		straponchance: { key: "straponChance", invert: false },
		swarmdisable: { key: "swarmsEnabled", invert: true },
		tending_yield_factor: { key: "tendingYieldModifier", invert: false },
		tentacledisable: { key: "tentaclesEnabled", invert: true },
		toydildodisable: { key: "toyDildoEnabled", invert: true },
		toymultiplepenetration: { key: "toyMultiplePenetrationEnabled", invert: true },
		toywhipdisable: { key: "toyWhipEnabled", invert: true },
		transformdisable: { key: "transformAnimalEnabled", invert: true },
		transformdisabledivine: { key: "transformDivineEnabled", invert: true },
		vaginaldoubledisable: { key: "vaginalDoubleEnabled", invert: true },
		voredisable: { key: "voreEnabled", invert: true },
		waspdisable: { key: "waspsEnabled", invert: true },
		watersportsdisable: { key: "watersportsEnabled", invert: true },
		wolfPregnancyWeeks: { key: "wolfPregnancyWeeks", invert: false },
	};

	processed.general.settings ??= {};

	for (const legacyKey in map) {
		if (!(legacyKey in processed.general)) continue;
		const { key, invert } = map[legacyKey];
		const legacyValue = processed.general[legacyKey];

		if (typeof legacyValue === "boolean" && invert) {
			processed.general.settings[key] ??= !legacyValue;
		} else {
			processed.general.settings[key] ??= legacyValue;
		}
		delete processed.general[legacyKey];
	}
	return JSON.stringify(processed);
}

/**
 * Using the incoming configuration object, replace all active variables (V | $ | State.variables)
 *
 * @param {string} data
 */
function importSettingsData(data) {
	if (data == null) {
		return;
	}
	let overrides;
	// console.log("json",JSON.parse(result));
	if (V.importString) {
		overrides = JSON.parse(V.importString);
		delete V.importString;
	} else {
		overrides = JSON.parse(data);
	}
	if (V.passage === "Start" && overrides.starting != null) {
		overrides.starting = settingsConvert(false, "starting", overrides.starting);
	}
	if (overrides.general != null) {
		overrides.general = settingsConvert(false, "general", overrides.general);
	}

	/**
	 * @param {object} source
	 * @param {object} target
	 * @param {string} key
	 * @returns {any?}
	 */
	const validateAndSet = (source, target, key) => {
		if (!validateValue(source[key], target[key])) {
			console.debug(`Validation fail - Key ${key} Source`, source, "Target", target);
			return null;
		}
		return target[key];
	};

	/**
	 * @param {object} source
	 * @param {object} target
	 * @param {string} key
	 * @returns {any?}
	 */
	const setValue = (source, target, key) => {
		target[key] = source[key];
		return target[key];
	};

	if (V.passage === "Start" && overrides.starting != null) {
		const startingConfig = settingsObjects("starting");

		traversePair(startingConfig, overrides.starting, "root", settingContainers, validateAndSet);
		traversePair(overrides.starting, V, "root", settingContainers, setValue);
	}

	if (overrides.general != null) {
		const listObject = settingsObjects("general");
		const listKey = Object.keys(listObject);
		const namedObjects = ["map", "shopDefaults", "settings", "options", "wardrobeDefaults"];
		// correct swapped min/max values
		if (overrides.general.breastsizemin > overrides.general.breastsizemax) {
			const temp = overrides.general.breastsizemin;
			overrides.general.breastsizemin = overrides.general.breastsizemax;
			overrides.general.breastsizemax = temp;
		}
		if (overrides.general.penissizemin > overrides.general.penissizemax) {
			const temp = overrides.general.penissizemin;
			overrides.general.penissizemin = overrides.general.penissizemax;
			overrides.general.penissizemax = temp;
		}
		for (let i = 0; i < listKey.length; i++) {
			if (namedObjects.includes(listKey[i]) && overrides.general[listKey[i]] != null) {
				const itemKey = Object.keys(listObject[listKey[i]]);
				for (let j = 0; j < itemKey.length; j++) {
					if (V[listKey[i]][itemKey[j]] != null && overrides.general[listKey[i]][itemKey[j]] != null) {
						if (validateValue(listObject[listKey[i]][itemKey[j]], overrides.general[listKey[i]][itemKey[j]])) {
							V[listKey[i]][itemKey[j]] = overrides.general[listKey[i]][itemKey[j]];
						}
					}
				}
			} else if (!namedObjects.includes(listKey[i])) {
				if (V[listKey[i]] != null && overrides.general[listKey[i]] != null) {
					if (validateValue(listObject[listKey[i]], overrides.general[listKey[i]])) {
						V[listKey[i]] = overrides.general[listKey[i]];
					}
				}
			}
		}
	}

	if (overrides.npc != null) {
		const listObject = settingsObjects("npc");
		// eslint-disable-next-line no-var
		const listKey = Object.keys(listObject);
		// eslint-disable-next-line no-var
		for (let i = 0; i < V.NPCNameList.length; i++) {
			if (overrides.npc[V.NPCNameList[i]] != null) {
				// eslint-disable-next-line no-var
				for (let j = 0; j < listKey.length; j++) {
					// Overwrite to allow for "none" default value in the start passage to allow for rng to decide
					if (
						V.passage === "Start" &&
						["pronoun", "gender", "skincolour"].includes(listKey[j]) &&
						overrides.npc[V.NPCNameList[i]][listKey[j]] === "none"
					) {
						V.NPCName[i][listKey[j]] = overrides.npc[V.NPCNameList[i]][listKey[j]];
					} else if (validateValue(listObject[listKey[j]], overrides.npc[V.NPCNameList[i]][listKey[j]])) {
						V.NPCName[i][listKey[j]] = overrides.npc[V.NPCNameList[i]][listKey[j]];
					}
					// Prevent the changing of gender with pregnant npc's
					if (V.NPCName[i].pregnancy.type) {
						V.NPCName[i].gender = "f";
					}
				}
			}
		}
	}
}
window.importSettingsData = importSettingsData;

/**
 * @param {object} configuration
 * @param {object} value
 * @returns {boolean}
 */
function validateValue(configuration, value) {
	// console.log("validateValue", keys, value);
	const keyArray = Object.keys(configuration);
	let valid = false;
	if (keyArray.length === 0) {
		valid = true;
	}
	if (keyArray.includes("min")) {
		if (configuration.min <= value && configuration.max >= value) {
			valid = true;
		}
	}
	if (keyArray.includes("decimals") && value != null) {
		// eslint-disable-next-line eqeqeq
		if (value.toFixed(configuration.decimals) != value) {
			valid = false;
		}
	}
	if (keyArray.includes("bool")) {
		if (value === true || value === false) {
			valid = true;
		}
	}
	if (keyArray.includes("boolLetter")) {
		if (value === "t" || value === "f") {
			valid = true;
		}
	}
	if (keyArray.includes("strings") && value != null) {
		if (configuration.strings.includes(value)) {
			valid = true;
		}
	}
	return valid;
}
window.validateValue = validateValue;

function exportSettings(data, type) {
	const output = {
		general: {
			map: {},
			shopDefaults: {},
			options: {},
			settings: {},
			wardrobeDefaults: {},
		},
		npc: {},
	};
	let listObject;
	let listKey;
	if (V.passage === "Start") {
		const startingConfig = settingsObjects("starting");
		const startingOutput = traversePair(startingConfig, V, "root", settingContainers, (source, target, key) => {
			console.debug(source, target, key);
			if (!validateValue(source[key], target[key])) {
				console.debug(`Target ${key} does not contain a valid value:`, target[key], "configuration:", source[key]);
				return null;
			}
			return target[key];
		});

		output.starting = startingOutput;
	}

	listObject = settingsObjects("general");
	listKey = Object.keys(listObject);
	const namedObjects = ["map", "shopDefaults", "settings", "options", "wardrobeDefaults"];

	for (let i = 0; i < listKey.length; i++) {
		if (namedObjects.includes(listKey[i]) && V[listKey[i]] != null) {
			const itemKey = Object.keys(listObject[listKey[i]]);
			for (let j = 0; j < itemKey.length; j++) {
				if (V[listKey[i]][itemKey[j]] != null) {
					if (validateValue(listObject[listKey[i]][itemKey[j]], V[listKey[i]][itemKey[j]])) {
						output.general[listKey[i]][itemKey[j]] = V[listKey[i]][itemKey[j]];
					}
				}
			}
		} else if (!namedObjects.includes(listKey[i])) {
			if (V[listKey[i]] != null) {
				if (validateValue(listObject[listKey[i]], V[listKey[i]])) {
					output.general[listKey[i]] = V[listKey[i]];
				}
			}
		}
	}
	listObject = settingsObjects("npc");
	listKey = Object.keys(listObject);
	for (let i = 0; i < V.NPCNameList.length; i++) {
		output.npc[V.NPCNameList[i]] = {};
		for (let j = 0; j < listKey.length; j++) {
			// Overwrite to allow for "none" default value in the start passage to allow for rng to decide
			if (V.passage === "Start" && ["pronoun", "gender", "skincolour"].includes(listKey[j]) && V.NPCName[i][listKey[j]] === "none") {
				output.npc[V.NPCNameList[i]][listKey[j]] = V.NPCName[i][listKey[j]];
			} else if (validateValue(listObject[listKey[j]], V.NPCName[i][listKey[j]])) {
				output.npc[V.NPCNameList[i]][listKey[j]] = V.NPCName[i][listKey[j]];
			}
		}
	}

	if (V.passage === "Start") {
		output.starting = settingsConvert(true, "starting", output.starting);
	}
	output.general = settingsConvert(true, "general", output.general);

	// console.log(S);
	const result = JSON.stringify(output);
	if (type === "text") {
		const textArea = document.getElementById("settingsDataInput");
		textArea.value = result;
	} else if (type === "file") {
		const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
		saveAs(blob, "DolSettingsExport.txt");
	}
}
window.exportSettings = exportSettings;

const settingContainers = ["player", "skin", "settings"];

function settingsObjects(type) {
	let result;
	/* boolLetter type also requires the bool type aswell */
	switch (type) {
		case "starting":
			result = {
				bodysize: {
					min: 0,
					max: 3,
					decimals: 0,
					displayName: "Body size:",
					textMap: { 0: "Tiny", 1: "Small", 2: "Normal", 3: "Large" },
					randomize: "characterAppearance",
				},
				facevariant: {
					strings: ["default", "catty", "aloof", "sweet", "foxy", "gloomy"],
					displayName: "Demeanour:",
					textMap: { default: "Default", catty: "Catty", aloof: "Aloof", sweet: "Sweet", foxy: "Foxy", gloomy: "Gloomy" },
					randomize: "characterAppearance",
				},
				breastsensitivity: {
					min: 1,
					max: 3,
					displayName: "Breast sensitivity:",
					decimals: 0,
					textMap: { 1: "Normal", 2: "Sensitive", 3: "Very Sensitive" },
					randomize: "characterTrait",
				},
				genitalsensitivity: {
					min: 1,
					max: 3,
					displayName: "Genital sensitivity:",
					decimals: 0,
					textMap: { 1: "Normal", 2: "Sensitive", 3: "Very Sensitive" },
					randomize: "characterTrait",
				},
				mouthsensitivity: {
					min: 1,
					max: 3,
					decimals: 0,
					displayName: "Mouth sensitivity:",
					textMap: { 1: "Normal", 2: "Sensitive", 3: "Very Sensitive" },
					randomize: "characterTrait",
				},
				bottomsensitivity: {
					min: 1,
					max: 3,
					decimals: 0,
					displayName: "Bottom sensitivity:",
					textMap: { 1: "Normal", 2: "Sensitive", 3: "Very Sensitive" },
					randomize: "characterTrait",
				},
				alcoholMod: {
					min: 0.5,
					max: 1.5,
					decimals: 1,
					displayName: "Alcohol tolerance:",
					textMap: { 0.5: "Heavyweight", 1: "Normal", 1.5: "Lightweight" },
					randomize: "characterTrait",
				},
				eyeselect: {
					strings: [
						"purple",
						"dark blue",
						"light blue",
						"amber",
						"hazel",
						"brown",
						"green",
						"lime green",
						"red",
						"pink",
						"black",
						"grey",
						"light grey",
						"random",
					],
					randomize: "characterAppearance",
					displayName: "Eye colour:",
				},
				hairselect: {
					strings: [
						"red",
						"jetblack",
						"black",
						"darkbrown",
						"brown",
						"softbrown",
						"lightbrown",
						"burntorange",
						"blond",
						"softblond",
						"platinumblond",
						"ashyblond",
						"strawberryblond",
						"ginger",
						"random",
					],
					displayName: "Hair colour:",
					randomize: "characterAppearance",
				},
				hairlength: { min: 0, max: 400, decimals: 0, displayName: "Hair length:", randomize: "characterAppearance" },
				awareselect: {
					strings: ["innocent", "knowledgeable"],
					displayName: "Awareness:",
					randomize: "characterTrait",
				},
				background: {
					strings: [
						"waif",
						"nerd",
						"athlete",
						"delinquent",
						"promiscuous",
						"exhibitionist",
						"deviant",
						"beautiful",
						"crossdresser",
						"lustful",
						"plantlover",
					],
					displayName: "Background:",
					randomize: "characterTrait",
				},
				startingseason: {
					strings: ["spring", "summer", "autumn", "winter", "random"],
					displayName: "Starting season:",
				},
				gamemode: { strings: ["normal", "soft", "hard"], displayName: "Game difficulty:" },
				ironmanmode: { bool: false, displayName: "Ironman mode:" },
				player: {
					gender: {
						strings: ["m", "f", "n"],
						displayName: "Gender:",
						textMap: { m: "Male", f: "Female", n: "Neither" },
						randomize: "characterAppearance",
					},
					sex: {
						strings: ["m", "f", "h"],
						displayName: "Genitals:",
						textMap: { m: "Penis", f: "Vagina", h: "Hermaphrodite" },
						randomize: "characterAppearance",
					},
					gender_body: {
						strings: ["m", "f", "a"],
						displayName: "Body type:",
						textMap: { m: "Masculine", f: "Feminine", a: "Androgynous" },
					},
					bodyshape: {
						strings: ["classic", "slender", "curvy", "soft"],
						textMap: { classic: "Classic", slender: "Slender", curvy: "Curvy", soft: "Soft" },
						displayName: "Body shape:",
						randomize: "characterAppearance",
					},
					skin: {
						color: {
							strings: [
								"light",
								"medium",
								"dark",
								"gyaru",
								"rlight",
								"rmedium",
								"rdark",
								"rgyaru",
								"ylight",
								"ymedium",
								"ydark",
								"ygyaru",
								"glight",
								"gmedium",
								"gdark",
								"ggyaru",
								"blight",
								"bmedium",
								"bdark",
								"bgyaru",
							],
							randomize: "characterAppearance",
							displayName: "Natural Skintone:",
						},
					},
					ballsExist: { bool: true, displayName: "Balls:", textMap: { true: "Existent", false: "Nonexistent" }, randomize: "characterAppearance" },
					freckles: {
						bool: true,
						displayName: "Freckles:",
						textMap: { true: "Existent", false: "Nonexistent" },
						strings: ["random"],
						randomize: "characterAppearance",
					},
					breastsize: {
						min: 0,
						max: 4,
						decimals: 0,
						displayName: "Breast size:",
						textMap: { 0: "Flat", 1: "Budding", 2: "Tiny", 3: "Small", 4: "Pert" },
						randomize: "characterAppearance",
					},
					penissize: {
						min: 0,
						max: 2,
						decimals: 0,
						displayName: "Penis size:",
						textMap: { 0: "Tiny", 1: "Small", 2: "Normal" },
						randomize: "characterAppearance",
					},
					bottomsize: {
						min: 0,
						max: 3,
						decimals: 0,
						displayName: "Bottom size:",
						textMap: { 0: "Slender", 1: "Slim", 2: "Modest", 3: "Cushioned" },
						randomize: "characterAppearance",
					},
				},
			};
			break;
		case "general":
			result = {
				settings: {
					analEnabled: { bool: true, displayName: "Anal:" },
					analingusGivingEnabled: { bool: true, displayName: "Analingus (Giving):" },
					analingusReceivingEnabled: { bool: true, displayName: "Analingus (Receiving):" },
					transformAnimalEnabled: { bool: true, displayName: "Animal Transformations:" },
					asphyxiaLevel: {
						min: 0,
						max: 4,
						decimals: 0,
						displayName: "Asphyxiation:",
						textMap: {
							0: "NPCs will not touch your neck",
							1: "NPCs may grab you by the neck without impeding breathing",
							2: "NPCs may try to choke you during consensual encounters",
							3: "NPCs may try to strangle you during non-consensual encounters",
						},
					},
					penisModifier: { min: -8, max: 8, decimals: 0, displayName: "Average size of NPC penises:", randomize: "encounter" },
					breastModifier: { min: -12, max: 12, decimals: 0, displayName: "Average size of women's breasts:", randomize: "encounter" },
					rentCostModifier: { min: 0.1, max: 3, decimals: 1, displayName: "Bailey's rent:", randomize: "gameplay" },
					baseNpcPregnancyChance: { min: 0, max: 16, decimals: 0, displayName: "Base NPC pregnancy chance:", randomize: "gameplay" },
					basePlayerPregnancyChance: { min: 0, max: 96, decimals: 0, displayName: "Base player pregnancy chance:", randomize: "gameplay" },
					beastMaleChanceSplit: { bool: true, displayName: "Beast attraction split by gender appearance:" },
					beastMaleChanceMale: { min: 0, max: 100, decimals: 0, displayName: "Beasts who are attracted to men:", randomize: "encounter" },
					beastMaleChanceFemale: { min: 0, max: 100, decimals: 0, displayName: "Beasts who are attracted to women:", randomize: "encounter" },
					beesEnabled: { bool: true, displayName: "Bees:" },
					bestialityEnabled: { bool: true, displayName: "Bestiality:" },
					blindStatsEnabled: { bool: true, displayName: "Blind stats mode:" },
					bodyWritingLevel: {
						min: 0,
						max: 3,
						decimals: 0,
						displayName: "Bodywriting:",
						textMap: {
							0: "NPCs will not write on you",
							1: "NPCs may ask to write on you",
							2: "NPCs may forcibly write on you",
							3: "NPCs may forcibly write on and tattoo you",
						},
					},
					breastFeedingEnabled: { bool: true, displayName: "Breastfeeding:" },
					cheatsEnabledToggle: { bool: true, displayName: "Cheat mode:" },
					condomLevel: {
						min: 0,
						max: 3,
						decimals: 0,
						displayName: "Condoms:",
						textMap: {
							0: "Everyone is allergic to latex and safe sex",
							1: "Only you may use condoms, but you may give NPCs condoms",
							2: "NPCs will only have condoms if pregnancy between them and the player is possible",
							3: "NPCs may have and use condoms whenever they please",
						},
						randomize: "gameplay",
					},
					clothingCostModifier: { min: 1, max: 10, decimals: 1, displayName: "Cost of clothing:", randomize: "gameplay" },
					furnitureCostModifier: { min: 0.6, max: 5, decimals: 1, displayName: "Cost of furniture:", randomize: "gameplay" },
					lewdClothingCostModifier: { min: 0.1, max: 2, decimals: 1, displayName: "Cost of lewd clothes:", randomize: "gameplay" },
					schoolClothingCostModifier: { min: 1, max: 2, decimals: 1, displayName: "Cost of school clothes:", randomize: "gameplay" },
					underwearCostModifier: { min: 1, max: 2, decimals: 1, displayName: "Cost of underwear:", randomize: "gameplay" },
					tendingYieldModifier: { min: 1, max: 10, decimals: 1, displayName: "Crop yield:", randomize: "gameplay" },
					toyDildoEnabled: { bool: true, displayName: "Dildos:" },
					transformDivineEnabled: { bool: true, displayName: "Divine Transformations:" },
					analDoubleEnabled: { bool: true, displayName: "Double Anal:" },
					vaginalDoubleEnabled: { bool: true, displayName: "Double Vaginal:" },
					allureModifier: { min: 0.2, max: 2, decimals: 1, displayName: "Encounter rate:", randomize: "gameplay" },
					facesitEnabled: { bool: true, displayName: "Facesitting:" },
					pregnancySpeechEnabled: { bool: true, displayName: "Fertility references:" },
					footFetishEnabled: { bool: true, displayName: "Foot fetish:" },
					forcedCrossdressingEnabled: { bool: true, displayName: "Forced crossdressing:" },
					horsesEnabled: { bool: true, displayName: "Horses:" },
					humanPregnancyMonths: { min: 1, max: 9, decimals: 0, displayName: "Human pregnancy length:" },
					hypnosisEnabled: { bool: true, displayName: "Hypnosis:" },
					npcVirginChanceAdult: { min: 0, max: 100, decimals: 0, displayName: "Likelihood of adults being virgins:", randomize: "encounter" },
					npcVirginChanceStudent: { min: 0, max: 100, decimals: 0, displayName: "Likelihood of young adults being virgins:", randomize: "encounter" },
					darkSkinChance: { min: 0, max: 100, decimals: 0, displayName: "Likelihood that NPCs have dark skin:", randomize: "encounter" },
					lurkersEnabled: { bool: true, displayName: "Lurkers:" },
					fertilityCycleEnabled: { bool: true, displayName: "Menstrual cycle:" },
					toyMultiplePenetrationEnabled: { bool: true, displayName: "Multiple penetration with sex toys:" },
					multipleWardrobes: { strings: [false, "isolated"], displayName: "Multiple wardrobes:" }, //, "all"
					maleChanceSplit: { bool: true, displayName: "NPC attraction split by gender appearance:" },
					npcPregnancyEnabled: { bool: true, displayName: "NPC pregnancy:" },
					maleChanceMale: { min: 0, max: 100, decimals: 0, displayName: "NPCs who are attracted to men:", randomize: "encounter" },
					maleChanceFemale: { min: 0, max: 100, decimals: 0, displayName: "NPCs who are attracted to women:", randomize: "encounter" },
					nudeGenderPerception: {
						min: 0,
						max: 2,
						decimals: 0,
						displayName: "Nude gender appearance:",
						textMap: {
							"-1": "NPCs will ignore genitals when perceiving gender, and crossdressing warnings will not be displayed",
							0: "NPCs will ignore genitals when perceiving gender",
							1: "NPCs will consider your genitals when perceiving your gender",
							2: "NPCs will judge your gender based on your genitals",
						},
					},
					monsterHallucinationsOnly: {
						bool: true,
						displayName: "Only replace beasts with monsters while hallucinating:",
						randomize: "encounter",
					},
					parasitePregnancyEnabled: { bool: true, displayName: "Parasite pregnancy:" },
					parasitesEnabled: { bool: true, displayName: "Parasites:" },
					beastMaleChance: {
						min: 0,
						max: 100,
						decimals: 0,
						displayName: "Percentage of beasts attracted to you that are male:",
						randomize: "encounter",
					},
					monsterChance: {
						min: 0,
						max: 100,
						decimals: 0,
						displayName: "Percentage of beasts that are replaced with monster girls or boys:",
						randomize: "encounter",
					},
					maleNPCVaginaChance: { min: 0, max: 100, decimals: 0, displayName: "Percentage of men that have vaginas:", randomize: "encounter" },
					maleVictimChance: { min: 0, max: 100, decimals: 0, displayName: "Percentage of other victims that are male:", randomize: "encounter" },
					maleChance: { min: 0, max: 100, decimals: 0, displayName: "Percentage of people attracted to you that are male:", randomize: "encounter" },
					femaleNPCPenisChance: { min: 0, max: 100, decimals: 0, displayName: "Percentage of women that have penises:", randomize: "encounter" },
					straponChance: { min: 0, max: 100, decimals: 0, displayName: "Percentage of women that have strap-on penises:", randomize: "encounter" },
					plantsEnabled: { bool: true, displayName: "Plantpeople:" },
					playerPregnancyEggLayingEnabled: { bool: true, displayName: "Player egg laying:" },
					playerPregnancyBeastEnabled: { bool: true, displayName: "Player pregnancy with beasts:" },
					playerPregnancyHumanEnabled: { bool: true, displayName: "Player pregnancy with humans:" },
					pregnancyType: { strings: ["realistic", "fetish", "silly"], displayName: "Pregnancy mode:" },
					pubicHairEnabled: { bool: true, displayName: "Pubic hair:" },
					ruinedOrgasmEnabled: { bool: true, displayName: "Ruined orgasms:" },
					skillCheckStyle: { strings: ["percentage", "words", "skillname"], randomize: "gameplay", displayName: "Skill check display:" },
					slimesEnabled: { bool: true, displayName: "Slimes:" },
					slugsEnabled: { bool: true, displayName: "Slugs:" },
					spidersEnabled: { bool: true, displayName: "Spiders:" },
					swarmsEnabled: { bool: true, displayName: "Swarms:" },
					tentaclesEnabled: { bool: true, displayName: "Tentacles:" },
					voreEnabled: { bool: true, displayName: "Vore:" },
					waspsEnabled: { bool: true, displayName: "Wasps:" },
					watersportsEnabled: { bool: true, displayName: "Watersports:" },
					toyWhipEnabled: { bool: true, displayName: "Whips:" },
					wolfPregnancyWeeks: { min: 2, max: 12, decimals: 0, displayName: "Wolf pregnancy length:" },
				},
				blackwolfmonster: {
					min: 0,
					max: 2,
					decimals: 0,
					displayName: "Black Wolf beast type:",
					textMap: { 0: "Always a beast", 1: "Monster girl or boy when requirements met", 2: "Always a monster girl or boy" },
					randomize: "encounter",
				},
				greathawkmonster: {
					min: 0,
					max: 2,
					decimals: 0,
					displayName: "Great Hawk beast type:",
					textMap: { 0: "Always a beast", 1: "Monster girl or boy when requirements met", 2: "Always a monster girl or boy" },
					randomize: "encounter",
				},
				nightmonstermonster: {
					min: 0,
					max: 2,
					decimals: 0,
					displayName: "Night Monster beast type:",
					textMap: { 0: "Always a beast", 1: "Monster girl or boy when requirements met", 2: "Always a monster girl or boy" },
					randomize: "encounter",
				},
				breastsizemin: {
					min: 0,
					max: 4,
					decimals: 0,
					displayName: "Minimum breast size:",
					textMap: { 0: "Flat", 1: "Budding", 2: "Tiny", 3: "Small", 4: "Pert" },
				},
				breastsizemax: {
					min: 0,
					max: 12,
					decimals: 0,
					displayName: "Maximum breast size:",
					textMap: {
						0: "Flat",
						1: "Budding",
						2: "Tiny",
						3: "Small",
						4: "Pert",
						5: "Modest",
						6: "Full",
						7: "Large",
						8: "Ample",
						9: "Massive",
						10: "Huge",
						11: "Gigantic",
						12: "Enormous",
					},
				},
				bottomsizemin: {
					min: 0,
					max: 2,
					decimals: 0,
					displayName: "Minimum bottom size:",
					textMap: { 0: "Slender", 1: "Slim", 2: "Modest", 3: "Cushioned" },
				},
				bottomsizemax: {
					min: 0,
					max: 8,
					decimals: 0,
					displayName: "Maximum bottom size:",
					textMap: { 0: "Slender", 1: "Slim", 2: "Modest", 3: "Cushioned", 4: "Soft", 5: "Round", 6: "Plump", 7: "Large", 8: "Huge" },
				},
				penissizemin: { min: -2, max: 0, decimals: 0, displayName: "Minimum penis size:", textMap: { 0: "Micro", 1: "Mini", 2: "Tiny" } },
				penissizemax: {
					min: 0,
					max: 6,
					decimals: 0,
					displayName: "Maximum penis size:",
					textMap: { 0: "Micro", 1: "Mini", 2: "Tiny", 3: "Small", 4: "Normal", 5: "Large", 6: "Enormous" },
				},
				confirmSave: { bool: true, displayName: "Require confirmation on save:" },
				confirmLoad: { bool: true, displayName: "Require confirmation on load:" },
				confirmDelete: { bool: true, displayName: "Require confirmation on delete:" },
				reducedLineHeight: { bool: true, displayName: "Reduced line height:" },
				outfitEditorPerPage: { min: 5, max: 20, decimals: 0, displayName: "Items per page:" }, //, "all"
				options: {
					neverNudeMenus: { bool: true, displayName: "Hide player nudity in menus:" },
					showCaptionText: { bool: true, displayName: "Show caption text in sidebar:" },
					clothingCaption: { bool: true, displayName: "Show clothing description in sidebar:" },
					clothingReplacementWarning: { bool: true, displayName: "Enable clothing replacement warning:" },
					sidebarStats: { strings: ["disabled", "limited", "all"], displayName: "Closed sidebar stats:" },
					sidebarTime: { strings: ["disabled", "top", "bottom"], displayName: "Closed sidebar time:" },
					combatControls: { strings: ["radio", "columnRadio", "lists", "limitedLists"], displayName: "Combat controls:" },
					mapMovement: { bool: true, displayName: "Enable movement by clicking on map:" },
					mapTop: { bool: true, displayName: "Move the map above the map links:" },
					mapMarkers: { bool: true, displayName: "Show clickable areas on maps:" },
					images: { min: 0, max: 1, decimals: 0, displayName: "Images:" },
					combatImages: { min: 0, max: 1, decimals: 0, displayName: "Combat images:" },
					bodywritingImages: { bool: true, displayName: "Bodywriting images:" },
					silhouetteEnabled: { bool: true, displayName: "NPC silhouettes:" },
					sidebarAnimations: { bool: true, displayName: "Sidebar images:" },
					blinkingEnabled: { bool: true, displayName: "Animated blinking:" },
					combatAnimations: { bool: true, displayName: "Combat animations:" },
					halfClosedEnabled: { bool: true, displayName: "Half-closed eyes:" },
					characterLightEnabled: { bool: true, displayName: "Character lighting:" },
					lightSpotlight: { min: 0, max: 1, decimals: 2, displayName: "Spotlight:" },
					lightGradient: { min: 0, max: 1, decimals: 2, displayName: "Gradient:" },
					lightGlow: { min: 0, max: 1, decimals: 2, displayName: "Glow:" },
					lightFlat: { min: 0, max: 1, decimals: 2, displayName: "Flat light:" },
					lightTFColor: { min: 0, max: 1, decimals: 2, displayName: "Angel/Devil TF colour components:" },
					combatLightEnabled: { bool: true, displayName: "Character lighting:" },
					combatLightOffsetY: { min: 0, max: 128, decimals: 0, displayName: "Y offset:" },
					combatLightSpotlight: { min: 0, max: 1, decimals: 2, displayName: "Spotlight:" },
					combatLightSpotlightX: { min: 0, max: 128, decimals: 0, displayName: "Spotlight width:" },
					combatLightSpotlightY: { min: 0, max: 48, decimals: 0, displayName: "Spotlight height:" },
					combatLightGradient: { min: 0, max: 1, decimals: 2, displayName: "Gradient:" },
					combatLightGlow: { min: 0, max: 1, decimals: 2, displayName: "Glow:" },
					combatLightFlat: { min: 0, max: 1, decimals: 2, displayName: "Flat light:" },
					combatLightTFColor: { min: 0, max: 1, decimals: 2, displayName: "Angel/Devil TF colour components:" },
					maxStates: { min: 1, max: 20, decimals: 0, displayName: "History depth:" },
					historyControls: { bool: true, displayName: "Show history controls:" },
					useNarrowMarket: { bool: true, displayName: "Use 'narrow screen' version of market inventory:" },
					skipStatisticsConfirmation: { bool: true, displayName: "Skip confirmation when viewing extra stats:" },
					passageCount: { strings: ["disabled", "changes", "total"], displayName: "Display passage count:" },
					playtime: { bool: true, displayName: "Display play time:" },
					numberify_enabled: { min: 0, max: 1, decimals: 0, displayName: "Enable numbered link navigation:" },
					timestyle: { strings: ["military", "ampm"], displayName: "Time style:" },
					tipdisable: { boolLetter: true, bool: true, displayName: "Sidebar Tips:" },
					pepperSprayDisplay: { strings: ["none", "sprays", "compact"], displayName: "Pepper spray display:" },
					condomsDisplay: { strings: ["none", "standard"], displayName: "Condom display:" },
					closeButtonMobile: { bool: true, displayName: "Items per page:" },
					showDebugRenderer: { bool: true, displayName: "Enable renderer debugger:" },
					showCombatTools: { bool: true, displayName: "Enable combat tools:" },
					numpad: { bool: true, displayName: "Enable numpad:" },
					traitOverlayFormat: { strings: ["table", "reducedTable", "list"], displayName: "Display traits:" },
					font: {
						strings: ["", "Arial", "Verdana", "TimesNewRoman", "Georgia", "Garamond", "CourierNew", "LucidaConsole", "Monaco", "ComicSans"],
						displayName: "Font:",
					},
					passageLineHeight: { strings: [0, 1, 1.25, 1.5, 1.75, 2], displayName: "Passage line height:" },
					overlayLineHeight: { strings: [0, 1, 1.25, 1.5, 1.75, 2], displayName: "Overlay line height:" },
					sidebarLineHeight: { strings: [0, 1, 1.25, 1.5, 1.75, 2], displayName: "Sidebar line height:" },
					passageFontSize: { strings: [0, 10, 12, 14, 16, 18, 20], displayName: "Passage font size:" },
					overlayFontSize: { strings: [0, 10, 12, 14, 16, 18, 20], displayName: "Overlay font size:" },
					sidebarFontSize: { strings: [0, 12, 14, 16, 18, 20], displayName: "Sidebar font size:" },
					genderBody: { strings: ["default", "m", "a", "f"], displayName: "Body type displayed:" },
					notesAutoSave: { bool: true, displayName: "Notes auto saving:" },
					dateFormat: { strings: ["en-GB", "en-US", "zh-CN"], displayName: "Date format:" },
				},
				shopDefaults: {
					alwaysBackToShopButton: { bool: true },
					color: {
						strings: ["black", "blue", "brown", "green", "pink", "purple", "red", "tangerine", "teal", "white", "yellow", "custom", "random"],
					},
					colourItems: { strings: ["disable", "random", "default"] },
					compactMode: { bool: true },
					disableReturn: { bool: true },
					highContrast: { bool: true },
					mannequinGender: { strings: ["same", "opposite", "male", "female"] },
					mannequinGenderFromClothes: { bool: true },
					noHelp: { bool: true },
					noTraits: { bool: true },
					secColor: {
						strings: ["black", "blue", "brown", "green", "pink", "purple", "red", "tangerine", "teal", "white", "yellow", "custom", "random"],
					},
				},
				wardrobeDefaults: {
					showTraits: { bool: false },
					extraInfo: { bool: false },
				},
			};
			break;
		case "npc":
			result = {
				pronoun: { strings: ["m", "f"], displayName: "Pronoun: ", textMap: { none: "N/A", m: "Male", f: "Female" } },
				gender: { strings: ["m", "f"], displayName: "Genitalia: ", textMap: { none: "N/A", m: "Penis", f: "Vagina" } },
				skincolour: {
					strings: ["white", "black", "ghost"],
					displayName: "Skin colour: ",
					textMap: { none: "N/A", white: "Pale", black: "Dark", ghost: "Ghostly Pale" },
				},
				penissize: { min: 0, max: 4, decimals: 0, displayName: "Penis size: ", textMap: { 0: "N/A", 1: "Tiny", 2: "Average", 3: "Thick", 4: "Huge" } },
				breastsize: {
					min: 0,
					max: 12,
					decimals: 0,
					displayName: "Breast size: ",
					textMap: {
						none: "N/A",
						0: "Flat",
						1: "Budding",
						2: "Tiny",
						3: "Small",
						4: "Pert",
						5: "Modest",
						6: "Full",
						7: "Large",
						8: "Ample",
						9: "Massive",
						10: "Huge",
						11: "Gigantic",
						12: "Enormous",
					},
				},
			};
			break;
	}
	return result;
}
window.settingsObjects = settingsObjects;

/* Converts specific settings to so they don't look so chaotic to players */
function settingsConvert(exportType, type, settings) {
	const listObject = settingsObjects(type);
	const result = settings;
	const keys = Object.keys(listObject);
	for (let i = 0; i < keys.length; i++) {
		if (result[keys[i]] === undefined) continue;
		if (["map", "player", "shopDefaults", "options", "wardrobeDefaults"].includes(keys[i])) {
			const itemKey = Object.keys(listObject[keys[i]]);
			for (let j = 0; j < itemKey.length; j++) {
				if (result[keys[i]][itemKey[j]] === undefined) continue;
				const keyArray = Object.keys(listObject[keys[i]][itemKey[j]]);
				if (exportType) {
					if (keyArray.includes("boolLetter") && keyArray.includes("bool")) {
						if (result[keys[i]][itemKey[j]] === "t") {
							result[keys[i]][itemKey[j]] = true;
						} else if (result[keys[i]][itemKey[j]] === "f") {
							result[keys[i]][itemKey[j]] = false;
						}
					}
				} else {
					if (keyArray.includes("boolLetter") && keyArray.includes("bool")) {
						if (result[keys[i]][itemKey[j]] === true) {
							result[keys[i]][itemKey[j]] = "t";
						} else if (result[keys[i]][itemKey[j]] === false) {
							result[keys[i]][itemKey[j]] = "f";
						}
					}
				}
			}
		} else {
			const keyArray = Object.keys(listObject[keys[i]]);
			if (exportType) {
				if (keyArray.includes("boolLetter") && keyArray.includes("bool")) {
					if (result[keys[i]] === "t") {
						result[keys[i]] = true;
					} else if (result[keys[i]] === "f") {
						result[keys[i]] = false;
					}
				}
			} else {
				if (keyArray.includes("boolLetter") && keyArray.includes("bool")) {
					if (result[keys[i]] === true) {
						result[keys[i]] = "t";
					} else if (result[keys[i]] === false) {
						result[keys[i]] = "f";
					}
				}
			}
		}
	}
	return result;
}
window.settingsConvert = settingsConvert;

window.loadExternalExportFile = function () {
	importScripts("DolSettingsExport.json")
		.then(function () {
			const textArea = document.getElementById("settingsDataInput");
			textArea.value = JSON.stringify(DolSettingsExport);
		})
		.catch(function () {
			// console.log(err);
			const button = document.getElementById("LoadExternalExportFile");
			button.value = "Error Loading";
		});
};

/**
 * @param {string} filter
 * @returns {string}
 */
function randomizeSettings(filter) {
	const result = {};

	/**
	 * @param {object} source
	 * @param {string} key
	 * @returns {any?}
	 */
	const setRandomValue = (source, key) => {
		const value = source[key];
		if ((!filter && value.randomize) || (filter && filter === value.randomize)) {
			return randomizeSettingSet(value);
		}
		return null;
	};

	if (V.passage === "Start") {
		const startingConfig = settingsObjects("starting");
		const starting = traverse(startingConfig, "root", settingContainers, setRandomValue);
		result.starting = starting;
	}

	const generalConfig = settingsObjects("general");
	const general = traverse(generalConfig, "root", settingContainers, setRandomValue);
	result.general = general;

	return JSON.stringify(result);
}
window.randomizeSettings = randomizeSettings;

const randomNumber = function (min, max, decimals = 0) {
	const decimalsMult = Math.pow(10, decimals);
	const minMult = min * decimalsMult;
	const maxMult = (max + 1) * decimalsMult;
	const rn = Math.floor(Math.random() * (maxMult - minMult)) / decimalsMult + min;
	return parseFloat(rn.toFixed(decimals));
};

const randomizeSettingSet = function (setting) {
	let result;
	const keys = Object.keys(setting);
	if (keys.includes("min")) {
		result = randomNumber(setting.min, setting.max, setting.decimals);
	}
	if (keys.includes("strings")) {
		result = setting.strings.pluck();
	}
	if (keys.includes("boolLetter")) {
		result = ["t", "f"].pluck();
	}
	if (keys.includes("bool")) {
		result = [true, false].pluck();
	}
	return result;
};

/**
 * instantly moves changes made in the passage into save data without changing the passage
 * WARNING: the game __will__ re-apply passage effects after reload, be sure to account for that or avoid using it
 */
function updateMoment() {
	State.history[State.activeIndex].variables = JSON.parse(JSON.stringify(V));
}
window.updateMoment = updateMoment;

window.isJsonString = function (s) {
	try {
		JSON.parse(s);
	} catch (e) {
		return false;
	}
	return true;
};

/**
 * Recursively traverses an object, reporting an error for any NaN values or null objects or functions\
 * Example: `let result = recurseNaN(a, "a");`.
 *
 * @param {object} obj The head of the object tree.
 * @param {string} path A string to indicate the path, put the object name in quotes.
 * @param {object} result An object to store the results in. - leave blank.
 * @param {Set} hist A set used for Cycle history. - leave blank.
 */

function recurseNaN(obj, path, result = null, hist = null) {
	result = Object.assign({ nulls: [], nan: [], functions: [], cycle: [] }, result);
	if (hist == null) hist = new Set([obj]);
	/* let result = {"nulls" : [], "nan" : [], "cycle" : []}; */
	for (const [key, val] of Object.entries(obj)) {
		const newPath = `${path}.${key}`;
		if (Number.isNaN(val)) {
			result.nan.push(newPath);
			continue;
		}
		if (typeof val === "function") result.functions.push(newPath);
		if (typeof val === "object") {
			if (val === null) {
				result.nulls.push(newPath);
				continue;
			}
		} else {
			continue;
		}
		if (hist.has(val)) {
			result.cycle.push(newPath);
			continue;
		}
		hist.add(val);
		recurseNaN(val, `${newPath}`, result, hist);
	}
	return result;
}
window.recurseNaN = recurseNaN;

/**
 * Recursively traverse target object, finding and returning an object containing all the NaN vars inside.
 *
 * Use with nukeNaNs to re-assign 0 to all bad NaN'd vars.	Use with caution.
 *
 * @param {object} target The object to traverse.	Defaults to V ($).
 * @returns {object} An object containing all the properties/sub-props that were NaN.
 */
function scanNaNs(target = V) {
	// If this gets set to true during function, a NaN was hit within scope.
	let isMutated = false;
	const current = Object.create({});
	// Loop through all properties of the target for NaNs and objects to scan.
	for (const [key, value] of Object.entries(target)) {
		// If value is an object, scan that property.
		if (value && typeof value === "object") {
			const resp = scanNaNs(value);
			// If scanNaNs returns a non-null object, there was a NaN somewhere, so make sure to update current obj.
			if (resp && typeof resp === "object") {
				current[key] = resp;
				isMutated = true;
			}
		} else if (typeof value === "number") {
			// Does what it says on the tin, make sure you only test numbers.
			if (isNaN(value)) {
				// Set property to a default value, likely zero.
				current[key] = 0;
				isMutated = true;
			}
		}
	}
	// Return a fully realised object, indicating there were NaNs, or null, which can be ignored.
	// isMutated controls whether we have encountered NaNs, remember to update where necessary.
	return isMutated ? current : null;
}
window.scanNaNs = scanNaNs;

function nukeNaNs(target = V) {
	for (const key in target) {
		const value = target[key];
		if (typeof value === "object" && value !== null) nukeNaNs(value);
		else if (Number.isNaN(value)) target[key] = 0;
	}
}
window.nukeNaNs = nukeNaNs;
