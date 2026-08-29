declare module "twine-sugarcube" {
	export interface SugarCubeStoryVariables {
		options: DolSettingsOptions;

		settings: {
			analEnabled: true | false;
			analingusGivingEnabled: true | false;
			analingusReceivingEnabled: true | false;
			transformAnimalEnabled: true | false;
			beastMaleChanceSplit: true | false;
			beesEnabled: true | false;
			bestialityEnabled: true | false;
			blindStatsEnabled: true | false;
			breastFeedingEnabled: true | false;
			cheatsEnabledToggle: true | false;
			underwearCostModifier: true | false;
			tendingYieldModifier: true | false;
			toyDildoEnabled: true | false;
			transformDivineEnabled: true | false;
			analDoubleEnabled: true | false;
			vaginalDoubleEnabled: true | false;
			facesitEnabled: true | false;
			pregnancySpeechEnabled: true | false;
			footFetishEnabled: true | false;
			forcedCrossdressingEnabled: true | false;
			horsesEnabled: true | false;
			hypnosisEnabled: true | false;
			lurkersEnabled: true | false;
			fertilityCycleEnabled: true | false;
			toyMultiplePenetrationEnabled: true | false;
			multipleWardrobes: "all" | "isolated" | false;
			maleChanceSplit: true | false;
			npcPregnancyEnabled: true | false;
			monsterHallucinationsOnly: true | false;
			parasitePregnancyEnabled: true | false;
			parasitesEnabled: true | false;
			beastMaleChance: true | false;
			plantsEnabled: true | false;
			playerPregnancyEggLayingEnabled: true | false;
			playerPregnancyBeastEnabled: true | false;
			playerPregnancyHumanEnabled: true | false;
			pregnancyType: "realistic" | "fetish" | "silly";
			pubicHairEnabled: true | false;
			ruinedOrgasmEnabled: true | false;
			skillCheckStyle: "percentage" | "words" | "skillname";
			slimesEnabled: true | false;
			slugsEnabled: true | false;
			spidersEnabled: true | false;
			swarmsEnabled: true | false;
			tentaclesEnabled: true | false;
			voreEnabled: true | false;
			waspsEnabled: true | false;
			watersportsEnabled: true | false;
			toyWhipEnabled: true | false;
			asphyxiaLevel: 0 | 1 | 2 | 3 | 4;
			baseNpcPregnancyChance: number;
			basePlayerPregnancyChance: number;
			bodyWritingLevel: 0 | 1 | 2 | 3;
			clothingCostModifier: number;
			condomChance: number;
			condomLevel: number;
			condomUseChanceConsensual: number;
			condomUseChanceRape: number;
			furnitureCostModifier: number;
			humanPregnancyMonths: number;
			lewdClothingCostModifier: number;
			nudeGenderPerception: 0 | 1 | 2;
			rentCostModifier: number;
			schoolClothingCostModifier: number;
			tendingYieldModifier: number;
			underwearCostModifier: number;
		};

		breastsizemin: "Flat" | "Budding" | "Tiny" | "Small" | "Pert";
		breastsizemax: "Flat" | "Budding" | "Tiny" | "Small" | "Pert" | "Modest" | "Full" | "Large" | "Ample" | "Massive" | "Huge" | "Gigantic" | "Enormous";
		bottomsizemin: "Slender" | "Slim" | "Modest" | "Cushioned";
		bottomsizemax: "Slender" | "Slim" | "Modest" | "Cushioned" | "Soft" | "Round" | "Plump" | "Large" | "Huge";
		penissizemin: "Micro" | "Mini" | "Tiny";
		penissizemax: "Micro" | "Mini" | "Tiny" | "Small" | "Normal" | "Large" | "Enormous";
	}
}

declare global {
	export interface DolSettingsOptions {
		debugdisable: "f" | "t";
		silhouetteEnabled: boolean;
		bodywritingImages: boolean;
		combatAnimations: boolean;
		topdownBreastjob: boolean;
		showDebugRenderer: boolean;
		showCombatTools: boolean;
		reflections: boolean;
	}
}

export {};
