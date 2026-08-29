// @ts-check
/* globals CombatRenderer, CloseCombatMapper, CloseOptions */

/**
 * @type {CanvasModelOptions<CloseOptions>}
 */
const combatCloseMouth = {
	name: "combatCloseMouth",
	width: 64,
	height: 64,
	scale: true,
	frames: 6,
	generatedOptions() {
		return [];
	},
	defaultOptions() {
		return { ...CloseCombatMapper.generateOptions(), ...this.metadata };
	},
	preprocess(options) {
		CloseCombatMapper.mapCloseOptions(options);
		if (V.debug) {
			// Save options for easy lookup
			CombatRenderer.options[this.name] = options;
		}
	},
	layers: {
		mouth: {
			srcfn(options) {
				return `${options.src}mouth/${options.mouth.state}-base.png`;
			},
			showfn(options) {
				return !!options.showMouth;
			},
			animationfn(options) {
				return options.animKeyMouth;
			},
			filters: ["body"],
			z: CombatRenderer.indices.closeBase,
		},

		tongue: {
			srcfn(options) {
				return `${options.src}mouth/${options.mouth.state}-tongue.png`;
			},
			showfn(options) {
				return !!options.showMouth;
			},
			animationfn(options) {
				return options.animKeyMouth;
			},
			z: CombatRenderer.indices.closeNpc - 2,
		},

		saliva: {
			srcfn(options) {
				return `${options.src}mouth/${options.mouth.state}-saliva.png`;
			},
			showfn(options) {
				return !!options.showMouth;
			},
			animationfn(options) {
				return options.animKeyMouth;
			},
			z: CombatRenderer.indices.closeNpc - 1,
		},
		npcPenetrator: mouthPenetrator("npc"),
		npcPenetrator2: mouthPenetrator("npc2"),
	},
};

/**
 *
 * @param {string} npc
 * @param {CanvasModelLayers<CloseOptions>} overrideOptions
 * @returns {CanvasModelLayers<CloseOptions>}
 */
function mouthPenetrator(npc, overrideOptions = {}) {
	/**
	 * @type {CanvasModelLayers<CloseOptions>}
	 */
	const defaults = {
		srcfn(options) {
			return `${options.src}mouth/npc/${options.mouth[npc]}-${options.mouth.state}.png`;
		},
		showfn(options) {
			return !!options.showMouth && !!options.mouth[npc];
		},
		animationfn(options) {
			return options.animKeyMouth;
		},
		filtersfn(options) {
			const filter = npc === "npc2" ? ["mouthNpc2"] : ["mouthNpc"];
			return options.mouth[npc] === "tentacle" ? ["mouthTentacle"] : filter;
		},
		alphafn(options) {
			const isWraith = options.mouth[npc] === "tentacle" && ["tentacles-wraith", "tentacles-wraith-penetrated"].includes(V.tentacleColour);
			return isWraith ? (V.tentacleColour === "tentacles-wraith" ? 0.4 : 0.8) : 1;
		},
		z: CombatRenderer.indices.closeNpc,
	};
	return Object.assign(defaults, overrideOptions);
}

Renderer.CanvasModels.combatCloseMouth = combatCloseMouth;
