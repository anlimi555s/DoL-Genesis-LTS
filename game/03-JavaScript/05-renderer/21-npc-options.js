// @ts-check
/* globals CombatRenderer, CharacterTypes, AnimationSpeed, PenetratorTypes, CombatPositions, CombatRendererBeastStateSetup, CombatRendererBeastSetup, BeastStates, BestialTypes, Partial, Dict */

/**
 * @typedef NpcOptions
 * @property {number} index
 * @property {"img/sex"} root
 * @property {string} src Typically "img/sex/missionary"
 * @property {Dict<Partial<CompositeLayerSpec>>} filters
 * @property {CombatPositions} position
 * @property {"shadow" | "beast"} category
 * @property {CharacterTypes} type
 * @property {boolean} isBlackWolf Don't want to manipulate type, so using this flag instead
 * @property {Penetrator[]} penetrators
 * @property {Balls} balls
 * @property {Drool} drool
 * @property {Tongue} tongue
 * @property {boolean} show
 * @property {string?} state
 * @property {Colour} colour
 * @property {AnimationSpeed} speed
 * @property {string} animKey
 * @property {string} animKeyStill
 */

/**
 * @typedef Balls
 * @property {boolean} show
 * @property {string=} type
 * @property {number=} size
 */

/**
 * @typedef Drool
 * @property {boolean} show
 * @property {number} amount
 */

/**
 * @typedef Tongue
 * @property {boolean} show
 * @property {string?} position
 */

/**
 * @typedef Ejaculate
 * @property {"sperm" | "pee" | "girlcum" | "sriracha"} type
 */

/**
 * @typedef Colour
 * @property {string} hex
 */

const beastModels = ["bear", "boar", "cat", "creature", "dog", "dolphin", "fox", "hawk", "horse", "centaur", "lizard", "pig", "wolf"];

class NpcCombatMapper {
	/** @returns {NpcOptions} */
	static generateOptions() {
		return {
			position: "missionary",
			root: "img/sex",
			src: "img/sex/missionary",
			animKey: "sex-2f-idle",
			animKeyStill: "sex-2f-idle",
			speed: "idle",
			index: 0,
			type: "human",
			category: "shadow",
			show: false,
			state: null,
			drool: {
				show: false,
				amount: 0,
			},
			tongue: {
				show: false,
				position: null,
			},
			penetrators: [],
			balls: {
				show: false,
			},
			colour: {
				hex: "#ffffff",
			},
			isBlackWolf: false,
			filters: {},
		};
	}

	/**
	 *
	 * @param {number} index
	 * @param {NpcOptions} options
	 * @returns {NpcOptions}
	 */
	static mapNpcToOptions(index, options) {
		// Set position
		options.position = CombatRenderer.getPosition(V.position);

		// Set directory for images
		options.root = "img/sex";
		options.src = `${options.root}/${options.position}`;

		// Configure state
		// Maybe use active_enemy? const index = V.active_enemy.
		const npc = V.NPCList[index];
		options.category = beastModels.includes(npc.type) ? "beast" : "shadow";
		options.type = CombatRenderer.getUnderlyingNpcType(npc);
		if (npc.fullDescription === "Black Wolf") {
			options.isBlackWolf = true;
		}
		options.state = null;
		options.show = false;

		options.balls = {
			show: ["pig", "boar"].includes(npc.type) && npc.penis !== "none", // Assuming balls have to be paired with penises?
		};

		options.drool = {
			show: false,
			amount: V.enemyarousal >= (V.enemyarousalmax / 5) * 3 ? 2 : 1,
		};

		options.tongue.show =
			typeof npc.mouth === "string" &&
			[
				"mouth",
				"kiss",
				"kissentrance",
				"kissimminent",
				"anus",
				"anusentrance",
				"anusimminent",
				"vagina",
				"vaginaentrance",
				"vaginaimminent",
				"penis",
				"penisentrance",
				"penisimminent",
			].includes(npc.mouth);

		if (
			typeof npc.mouth === "string" &&
			["penis", "penisentrance", "penisimminent"].includes(npc.mouth) &&
			(!combat.isPcGenitalsExposed() || CombatRenderer.getClothingBySlot("genitals").name !== "naked")
		) {
			options.tongue.show = false;
		}

		options.tongue.position = typeof npc.mouth === "string" ? npc.mouth : null;
		options.penetrators = options.penetrators = [];

		options.filters.skin = NpcCombatMapper.getNpcSkinFilter(npc);

		options.penetrators = NpcCombatMapper.getPenetrators(index, npc, options);

		NpcCombatMapper.mapNpcTypeToOptions(options, index, npc);

		// Set animation speed
		options.animKey = NpcCombatMapper.getNpcAnimation();
		options.animKeyStill = NpcCombatMapper.getNpcIdleAnimation();
		options.speed = NpcCombatMapper.getNpcAnimationSpeed();

		// Prevent showing if state is not set.
		if (options.state == null) {
			options.show = false;
		}
		return options;
	}

	/**
	 * @returns {string}
	 */
	static getNpcAnimation() {
		const speed = NpcCombatMapper.getNpcAnimationSpeed();
		const frames = NpcCombatMapper.getNpcAnimationFrameCount();
		return `sex-${frames}f-${speed}`;
	}

	/**
	 * @returns {string}
	 */
	static getNpcIdleAnimation() {
		return `sex-2f-idle`;
	}

	/**
	 * @returns {number}
	 */
	static getNpcAnimationFrameCount() {
		if (T.crOverrides?.animFrames) {
			return T.crOverrides.animFrames;
		}
		if (combat.isActive()) {
			return 4;
		}
		return 2;
	}

	/**
	 * @returns {AnimationSpeed}
	 */
	static getNpcAnimationSpeed() {
		if (T.crOverrides?.animSpeed) {
			return T.crOverrides.animSpeed;
		}
		if (combat.isRapid()) {
			return "vfast";
		}
		if (combat.isActive()) {
			if (V.enemytype === "machine") {
				switch (V.machine?.speed) {
					case 1:
						return "slow";
					case 2:
						return "fast";
					default:
						return "vfast";
				}
			}
			if (T.knotted || T.knotted_short) {
				return "mid";
			}
			if (V.enemyarousal >= (V.enemyarousalmax / 5) * 4) {
				return "vfast";
			}
			if (V.enemyarousal >= (V.enemyarousalmax / 5) * 3) {
				return "fast";
			}
			if (V.enemyarousal >= (V.enemyarousalmax / 5) * 1) {
				return "mid";
			}
			return "slow";
		}
		return "idle";
	}

	/**
	 * Encapsulates getPenetrator for now. If NPCs ever support more than one penetrator at a time,
	 * this could return more than just [getPenetrator()]
	 *
	 * @param {number} index
	 * @param {Npc} npc
	 * @param {NpcOptions} options
	 * @returns {Penetrator[]}
	 */
	static getPenetrators(index, npc, options) {
		const penetrators = [];
		const penetrator = NpcCombatMapper.getPenetrator(index, npc, options);
		if (penetrator != null) {
			penetrators.push(penetrator);
		}
		return penetrators;
	}

	/**
	 * Constructs a penetrator object
	 *
	 * @param {number} index
	 * @param {Npc} npc
	 * @param {NpcOptions} options
	 * @returns {Penetrator?}
	 */
	static getPenetrator(index, npc, options) {
		/** @type {Penetrator} */
		const penetrator = {
			show: false,
			type: NpcCombatMapper.getPenetratorType(npc),
			colour: npc.skincolour,
			target: combat.target.pc,
			isEjaculating: combat.isNpcPenetratorEjaculating(index, npc),
			ejaculate: {
				type: "sperm",
			},
			size: 0,
			position: null,
			state: null,
			condom: CombatRenderer.getCondomOptions(npc.condom),
		};

		Object.assign(penetrator, combat.getNpcPenetratorState(npc));

		options.filters.penetrator = NpcCombatMapper.getNpcPenetratorFilter(npc);
		options.filters.condom = penetrator.condom.colour;

		if (options.category === "shadow") {
			// Calculate DP state from positions, if position is >= 2, add double at least, triple P not sure what to do.
			if (combat.penetratorCountBefore(index, penetrator.position) >= 2) {
				penetrator.state += "-double";
			}

			return penetrator;
		}

		// Only beasts below

		if (["horse", "centaur"].includes(npc.type)) {
			if (options.position === "missionary") {
				return null;
			}
			penetrator.show = npc.penis !== "none";
			penetrator.state = [V.anusstate, V.vaginastate].includes("penetrated") ? "penetrating" : "entrance";
			return penetrator;
		}

		return penetrator;
	}

	/**
	 * @param {Npc} npc
	 * @param {Penetrator?} penetrator
	 * @returns {boolean}
	 */
	static isBeastOverPositioned(npc, penetrator) {
		if (["horse", "centaur"].includes(npc.type)) {
			return true;
		}
		if (penetrator?.position && ["vagina", "butt", "anus", "thighs"].includes(penetrator.position)) {
			return true;
		}
		if (penetrator?.position && ["feet", "leftarm", "rightarm"].includes(penetrator.position)) {
			return false;
		}
		if (npc.stance === "top") {
			return true;
		}
		return false;
	}

	/**
	 * @param {number} index
	 * @param {Npc} npc
	 * @returns {boolean}
	 */
	static isBeastUnderPositioned(index, npc) {
		if (V.penisuse === "othervagina" && V.penistarget === index) {
			return true;
		}
		if (V.penisuse === "otheranus" && V.penistarget === index) {
			return true;
		}
		return false;
	}

	/**
	 * @param {Npc} npc
	 * @param {Penetrator?} penetrator
	 * @returns {boolean}
	 */
	static isBeastFrontPositioned(npc, penetrator) {
		if (npc.stance === "topface") {
			return true;
		}
		if (penetrator?.position && ["mouth"].includes(penetrator.position)) {
			return true;
		}
		return false;
	}

	/**
	 * @param {NpcOptions} options
	 * @param {number} index
	 * @param {Npc} npc
	 * @returns {NpcOptions}
	 */
	static mapNpcTypeToOptions(options, index, npc) {
		const penetrator = options.penetrators[0];
		if (options.category === "shadow") {
			options.show = penetrator?.position != null && ["thighs", "vagina", "anus", "mouth"].includes(penetrator.position);
			options.state = penetrator?.position ?? null;

			// Figure out whether the NPC is riding the PC, prepare for combat retardation
			if (V.penisuse === "otheranus" && V.penistarget === index) {
				options.show = true;
				options.state = "penis";
			}
			if (V.penisuse === "otherpenis" && V.penistarget === index) {
				options.show = false;
				options.state = "frotting"; // ? (Not in use)
			}
			if (V.penisuse === "othervagina" && V.penistarget === index) {
				options.show = true;
				options.state = "penis";
			}

			// Since no penetrator exists on the NPC, check for their other states
			// WHY IS ANAL LIKE THIS
			if (typeof npc.penis === "string" && ["otheranusfrot", "otheranusentrance", "otheranusimminent", "otheranus"].includes(npc.penis)) {
				// options.state = options.category === "shadow" ? "default" : "under-default";
				options.show = true;
				return options;
			}

			if (npc.vagina === "penis") {
				options.state = "penis";
				options.show = true;
			}

			// Primary for being pinned:
			if (npc.stance === "top" && options.state == null) {
				// options.state = options.category === "shadow" ? "default" : "over-default";
				options.state = "vagina";
				options.show = true;
				return options;
			}

			return options;
		}

		// Beast

		/** @type {CombatRendererBeastSetup} */
		const configuration = setup.renderer.npc.beast[npc.type];

		options.show = false;
		options.state = "over";

		// Explicitly false intended. If not specified, or true, show beast.
		if (configuration.show === false) {
			return options;
		}

		/** @type {BestialTypes} */
		// @ts-ignore Just for type inferrence for isBeastStateEnabled, if we had a proper TypeScript setup, this wouldn't be needed.
		const beastType = npc.type;

		if (penetrator?.position && ["leftarm", "rightarm"].includes(penetrator.position)) {
			return options;
		}

		const isBeastUnderPositioned = NpcCombatMapper.isBeastUnderPositioned(index, npc);
		if (isBeastUnderPositioned) {
			options.show = NpcCombatMapper.isBeastStateEnabled(beastType, options.position, "under");
			options.drool.show = NpcCombatMapper.isBeastDroolEnabled(beastType, options.position, "under");
			options.balls.show = NpcCombatMapper.isBeastBallsEnabled(beastType, options.position, "under");
			options.state = "under";
			return options;
		}

		const isBeastOverPositioned = NpcCombatMapper.isBeastOverPositioned(npc, penetrator);
		if (isBeastOverPositioned) {
			options.show = NpcCombatMapper.isBeastStateEnabled(beastType, options.position, "over");
			options.drool.show = NpcCombatMapper.isBeastDroolEnabled(beastType, options.position, "over");
			options.balls.show = NpcCombatMapper.isBeastBallsEnabled(beastType, options.position, "over");
			options.state = ["horse", "centaur"].includes(npc.type) && penetrator?.state === "penetrating" ? "over-penetrated" : "over";
			return options;
		}

		const isBeastFrontPositioned = NpcCombatMapper.isBeastFrontPositioned(npc, penetrator);
		if (isBeastFrontPositioned) {
			options.show = NpcCombatMapper.isBeastStateEnabled(beastType, options.position, "front");
			options.drool.show = NpcCombatMapper.isBeastDroolEnabled(beastType, options.position, "front");
			options.balls.show = NpcCombatMapper.isBeastBallsEnabled(beastType, options.position, "front");
			options.state = "front";
			return options;
		}

		return options;
	}

	/**
	 * @param {BestialTypes} type
	 * @param {CombatPositions} position
	 * @param {BeastStates} state
	 */
	static isBeastStateEnabled(type, position, state) {
		return NpcCombatMapper.isBeastPropertyEnabled(type, position, state, config => !!config.show);
	}

	/**
	 * @param {BestialTypes} type
	 * @param {CombatPositions} position
	 * @param {BeastStates} state
	 */
	static isBeastBallsEnabled(type, position, state) {
		return NpcCombatMapper.isBeastPropertyEnabled(type, position, state, config => !!config.balls);
	}

	/**
	 * @param {BestialTypes} type
	 * @param {CombatPositions} position
	 * @param {BeastStates} state
	 */
	static isBeastDroolEnabled(type, position, state) {
		return NpcCombatMapper.isBeastPropertyEnabled(type, position, state, config => !!config.drool);
	}

	/**
	 * @param {BestialTypes} type
	 * @param {CombatPositions} position
	 * @param {BeastStates} state
	 * @param {function(CombatRendererBeastStateSetup): boolean} predicate
	 * @returns {boolean}
	 */
	static isBeastPropertyEnabled(type, position, state, predicate) {
		const config = setup.renderer.npc.beast[type];
		if (!config) {
			return false;
		}
		if (config.reference) {
			return NpcCombatMapper.isBeastPropertyEnabled(config.reference, position, state, predicate);
		}
		// Check global show
		if (config.show) {
			return true;
		}
		// Check the state's show
		if (config.states && config.states[state]) {
			const result = predicate(config.states[state]);
			if (result) {
				return result;
			}
		}
		// Check the position global show
		if (config.positions && config.positions[position]) {
			const result = predicate(config.positions[position]);
			if (result) {
				return result;
			}
		}
		// Check the position's state's show
		if (config.positions && config.positions[position]?.states && config.positions[position].states[state]) {
			const result = predicate(config.positions[position].states[state]);
			if (result) {
				return result;
			}
		}
		// By this point, none of the show properties were set. Likely has no sprites.
		return false;
	}

	/**
	 * @param {Npc} npc
	 * @returns {Partial<CompositeLayerSpec>}
	 */
	static getNpcSkinFilter(npc) {
		return setup.colours.getSkinFilter(npc?.skincolour === "ghost" ? "ghost" : npc?.skincolour === "white" ? "light" : "dark", 0);
	}

	/**
	 * @param {Npc} npc
	 * @returns {Partial<CompositeLayerSpec>}
	 */
	static getNpcPenetratorFilter(npc) {
		// Get any special colours, strapon, etc.
		if (npc?.strapon) {
			// Figure out a filter for each strapon colour:
			switch (npc.strapon.color) {
				case "fleshy":
					return NpcCombatMapper.getNpcSkinFilter(npc);
				case "black":
					return {
						blend: "#504949",
						blendMode: "multiply",
						desaturate: true,
					};
				case "blue":
					return {
						blend: "#3973ac",
						blendMode: "multiply",
						desaturate: true,
					};
				case "green":
					return {
						blend: "#007400",
						blendMode: "multiply",
						desaturate: true,
					};
				case "pink":
					return {
						blend: "#ff80aa",
						blendMode: "multiply",
						desaturate: true,
					};
				case "purple":
					return {
						blend: "#ab66ff",
						blendMode: "multiply",
						desaturate: true,
					};
				case "red":
					return {
						blend: "#f53d43",
						blendMode: "multiply",
						desaturate: true,
					};
				case "dark red":
					return {
						blend: "#b50202",
						blendMode: "multiply",
						desaturate: true,
					};
			}
		}
		return NpcCombatMapper.getNpcSkinFilter(npc);
	}

	/**
	 * @param {Npc} npc
	 * @returns {PenetratorTypes}
	 */
	static getPenetratorType(npc) {
		if (["dog", "doggirl", "dogboy", "wolf", "wolfgirl", "wolfboy", "fox", "foxgirl", "foxboy", "bear", "beargirl", "bearboy"].includes(npc.type)) {
			return "knotted";
		}
		if (["lizard", "lizardboy", "lizardgirl"].includes(npc.type)) {
			return "knotted";
		}
		if (["horse", "centaur"].includes(npc.type)) {
			return "equine";
		}
		// Previously called 'pointed'
		if (["cat", "catgirl", "catboy", "hawk", "harpy", "dolphin", "dolphinboy", "dolphingirl"].includes(npc.type)) {
			return "feline";
		}
		if (["pig", "piggirl", "pigboy", "boar", "boargirl", "boarboy"].includes(npc.type)) {
			return "sus";
		}
		return "human";
	}
}
window.NpcCombatMapper = NpcCombatMapper;
