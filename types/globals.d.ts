import { SugarCubeStoryVariables, SugarCubeTemporaryVariables } from "twine-sugarcube";

declare global {
	export type NpcNames =
		| "Avery"
		| "Bailey"
		| "Briar"
		| "Charlie"
		| "Darryl"
		| "Doren"
		| "Eden"
		| "Gwylan"
		| "Harper"
		| "Jordan"
		| "Kylar"
		| "Landry"
		| "Leighton"
		| "Mason"
		| "Morgan"
		| "River"
		| "Robin"
		| "Sam"
		| "Sirris"
		| "Whitney"
		| "Winter"
		| "Black Wolf"
		| "Niki"
		| "Quinn"
		| "Remy"
		| "Alex"
		| "Great Hawk"
		| "Wren"
		| "Sydney"
		| "Ivory Wraith"
		| "Zephyr"
		| "Night Monster";

	const V: SugarCubeStoryVariables;
	const T: SugarCubeTemporaryVariables;
	const C: {
		crime: any;
		npc: {
			[key in NpcNames]: Npc;
		};
		tiredness: {
			max: number;
		};
		
		stats: {
			// alcohol: {
			// 	max: number,
			// 	/**
			// 	 * How much the player's $drunk stat needs to increase to qualify for the next Alcohol description tier.
			// 	 * 
			// 	 * The description maxes out at 480 and above.
			// 	 */
			// 	threshold: number,
			// 	min: number,
			// },
			// arousal: {
			// 	max: number,
			// 	min: number,
			// },
			// control: {
			// 	max: number,
			// 	min: number,
			// },
			// /**
			//  * Variable name: "drugged"
			//  */
			// drugs: {
			// 	max: number,
			// 	min: number,
			// },
			// /**
			//  * Variable name: "tiredness"
			//  */
			// fatigue: {
			// 	max: number,
			// 	hourlyRate: number,
			// 	minuteRate: number,
			// 	min: number,
			// },
			// /**
			//  * Variable name: "hallucinogen"
			//  */
			// hallucinogens: {
			// 	max: number,
			// 	min: number,
			// },
			// pain: {
			// 	max: number,
			// 	min: number,
			// },
			// stress: {
			// 	max: number,
			// 	min: number,
			// },
			// trauma: {
			// 	max: number,
			// 	min: number,
			// },

			// // Core Characteristic Constants
			// /**
			//  * Awareness has a negative range where it turns into Innocence. "Base" will refer to 0 Awareness.
			//  */
			// awareness: {
			// 	max: number,
			// 	base: number,
			// 	min: number,
			// },
			// beauty: {
			// 	max: number,
			// 	min: number,
			// },
			// deviancy: {
			// 	max: number,
			// 	min: number,
			// },
			// exhibitionism: {
			// 	max: number,
			// 	min: number,
			// },
			// /**
			//  * The player's body can currently be 1 of 4 sizes:
			//  * 
			//  * Tiny, Small, Normal, and Large
			//  */
			// physique: {
			// 	absoluteMax: number,
			// 	largeMax: number,
			// 	normalMax: number,
			// 	smallMax: number,
			// 	tinyMax: number,
			// 	min: number,
			// },
			// promiscuity: {
			// 	max: number,
			// 	min: number,
			// },
			// purity: {
			// 	min: number,
			// 	nonVirginMax: number,
			// 	virginMax: number,
			// },
			// willpower: {
			// 	max: number,
			// 	min: number,
			// },

			// // Secondary Characteristic Constants
			// fringeLength: {
			// 	max: number,
			// 	min: number,
			// },
			// grace: {
			// 	max: number,
			// 	min: number,
			// },
			// hairLength: {
			// 	max: number,
			// 	min: number,
			// },
			// masochism: {
			// 	max: number,
			// 	min: number,
			// },
			// sadism: {
			// 	max: number,
			// 	min: number,
			// },
			// /**
			//  * Variable name: "submissive"
			//  */
			// submissiveness: {
			// 	max: number,
			// 	min: number,
			// },
			
			// // Fluid Production Constants
			// milkVolume: {
			// 	cowMax: number,
			// 	normalMax: number,
			// 	min: number,
			// },
			// semenVolume: {
			// 	cowMax: number,
			// 	normalMax: number,
			// 	min: number,
			// },
			// /**
			//  * It seems there's no upper limit on the amount of fluid a vagina can produce when it orgasms. May be added in
			//  * a future update.
			//  * 
			//  * See "game\base-system\orgasm.twee" for the code.
			//  */

			// // Core Skill Constants
			// athletics: {
			// 	max: number,
			// 	min: number,
			// },
			// /**
			//  * Variable name: "danceskill"
			//  */
			// dance: {
			// 	max: number,
			// 	min: number,
			// },
			// housekeeping: {
			// 	max: number,
			// 	min: number,
			// },
			// skulduggery: {
			// 	max: number,
			// 	min: number,
			// },
			// /**
			//  * Variable name: "swimmingskill"
			//  */
			// swimming: {
			// 	max: number,
			// 	min: number,
			// },
			// tending: {
			// 	max: number,
			// 	min: number,
			// },

			// // School Skill Constants
			// english: {
			// 	max: number,
			// 	min: number,
			// },
			// history: {
			// 	max: number,
			// 	min: number,
			// },
			// maths: {
			// 	max: number,
			// 	min: number,
			// },
			// science: {
			// 	max: number,
			// 	min: number,
			// },

			// // Sex Skill Constants
			// /**
			//  * Variable name: "analskill"
			//  */
			// anal: {
			// 	max: number,
			// 	min: number,
			// },
			// /**
			//  * Variable name: "bottomskill"
			//  */
			// buttocks: {
			// 	max: number,
			// 	min: number,
			// },
			// /**
			//  * Variable name: "chestskill"
			//  */
			// chest: {
			// 	max: number,
			// 	min: number,
			// },
			// /**
			//  * Variable name: "feetskill"
			//  */
			// feet: {
			// 	max: number,
			// 	min: number,
			// },
			// /**
			//  * Variable name: "handskill"
			//  */
			// hands: {
			// 	max: number,
			// 	min: number,
			// },
			// /**
			//  * Variable name: "oralskill"
			//  */
			// oral: {
			// 	max: number,
			// 	min: number,
			// },
			// /**
			//  * Variable name: "seductionskill"
			//  */
			// seduction: {
			// 	max: number,
			// 	min: number,
			// },
			// /**
			//  * Variable name: "thighskill"
			//  */
			// thighs: {
			// 	max: number,
			// 	min: number,
			// },
			// /**
			//  * Variable name: "vaginalskill"
			//  */
			// vaginal: {
			// 	max: number,
			// 	min: number,
			// },
		},

		fames: {
		// 	// Negative Fame Constants
		// 	bestiality: {
		// 		max: number,
		// 		min: number,
		// 	},
		// 	exhibitionism: {
		// 		max: number,
		// 		min: number,
		// 	},
		// 	/**
		// 	 * Variable name: "impreg"
		// 	 */
		// 	impregnation: {
		// 		max: number,
		// 		min: number,
		// 	},
		// 	pimp: {
		// 		max: number,
		// 		min: number,
		// 	},
		// 	pregnancy: {
		// 		max: number,
		// 		min: number,
		// 	},
		// 	prostitution: {
		// 		max: number,
		// 		min: number,
		// 	},
		// 	rape: {
		// 		max: number,
		// 		min: number,
		// 	},
		// 	sex: {
		// 		max: number,
		// 		min: number,
		// 	},

		// 	// Positive Fame Constants
		// 	business: {
		// 		max: number,
		// 		min: number,
		// 	},
		// 	/**
		// 	 * Variable name: "scrap"
		// 	 */
		// 	combat: {
		// 		max: number,
		// 		min: number,
		// 	},
		// 	/**
		// 	 * Variable name: "good"
		// 	 */
		// 	kindness: {
		// 		max: number,
		// 		min: number,
		// 	},
		// 	model: {
		// 		max: number,
		// 		min: number,
		// 	},
		// 	/**
		// 	 * Variable name: "social"
		// 	 */
		// 	socialite: {
		// 		max: number,
		// 		min: number,
		// 	},
		
		// // Crime Fame Constants
		// /**
		//  * Original values obtained from "game\03-JavaScript\alias2.js"
		//  */
		// crime: {
		// 	max: number,
		// 	min: number,
		// 	/**
		// 	 * If the player commits too much of the same type of crime in one day, they leave behind more evidence.
		// 	 * 
		// 	 * The dawnCheck() function in "game\03-JavaScript\time.js" will increase the player's crime by an additional
		// 	 * 10% if their daily crime stat is creater than "spree".
		// 	 */
		// 	spree: number,
		// },
		},
	};
	const ExecutionContext: {
		instance: {
			callStack: any;
		};
	};
	const EventSystem: EventData;

	const Browser: {
		isMobile: {
			any(): boolean;
		};
	};

	const L10n: any;

	/**
	 * Returns a pseudo-random whole number (integer) within the range of the given bounds (inclusive)—i.e. [min, max].
	 *
	 * NOTE: By default, it uses State.random() as its source of randomness, this is different than vanilla sc2
	 * @param min The lower bound of the random number (inclusive). If omitted, will default to 0.
	 * @param max The upper bound of the random number (inclusive).
	 * @param useMath Use Math.random instead of State.random.
	 * @since 2.0.0
	 * @example
	 * random(5) // Returns a number in the range 0–5
	 * random(1, 6) // Returns a number in the range 1–6
	 * random(1, 6, true) // Returns a number in the range 1–6 without affecting the State
	 */
	function random(minOrMax: number, max?: number, useMath?: boolean): number;

	let throwError: Function;

	let DefineMacro: Function;

	interface ObjectConstructor {
		hasOwn(object: any, property: any): boolean;
		deepMerge(objects: any): object;
		find(objects: any): object;
	}

	interface NumberConstructor {
		shuffle();
		select(index: number): any;
		except(): any;
		formatList(options: any): any;
	}

	interface ArrayConstructor {
		between(min: number, max: number): boolean;
	}
}

export {};
