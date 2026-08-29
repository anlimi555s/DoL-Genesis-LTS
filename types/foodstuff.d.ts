declare module "twine-sugarcube" {
	export interface SugarCubeSetupObject {
		foodstuff: Dict<FoodstuffItem>;
	}
}

declare global {
	export type Season = "spring" | "summer" | "autumn" | "winter";

	export type FoodstuffCategory = "dish" | "flower" | "fruit" | "ingredient" | "meat" | "produce" | "seafood" | "mushroom" | "vegetable";

	export type FoodstuffKitchenItemTypeIcon =
		| "recipe-flower.png"
		| "recipe-food.png"
		| "recipe-fruit.png"
		| "recipe-ingredient.png"
		| "recipe-meat.png"
		| "recipe-produce.png"
		| "recipe-seafood.png"
		| "recipe-shroom.png"
		| "recipe-vegetable.png";

	export type FoodstuffPlantingBed = "earth" | "water";
	export type FoodstuffPropFolder = "food" | "drink" | "ingredient" | "tending";

	export interface FoodstuffTendingData {
		planting_bed?: FoodstuffPlantingBed; // The type of planting bed that this tending item is planted in. If not present, then the foodstuff cannot be planted or grown.
		growth_days?: number; // The number of days it takes for this tending item to grow.
		yield_multiplier?: number; // Multiplier for how much of this tending item the PC gets when they harvest it.
		has_seeds?: boolean; // Whether this item has discoverable seeds.
		seed_name?: string; // Name of the seed for this item when it has a special seed label.
		seasons?: Season[]; // The seasons that this item can be planted in.
		tags: string[]; // Any tending/planting related tags that would apply to this item.
		affected_by_tending_skill?: boolean; // If true, the number of items harvested gets increased by the tending skill. Does not apply when harvesting from plots.
	}

	export interface FoodstuffShopData {
		sell_price: number; // How much this item is sold for by the PC. The price for the PC to buy an item is this amount * 2.
		available_in?: string[]; // The list of shops that this item is available in (currently there is only the 1 supermarket).
		stall_size?: PlotSize; // The size of the item. Used for selling the item, specifically if you sell the item one at a time or not.
		bought_in_bulk?: number; // When buying this item, this is how many of the item get bought at once for the above buy price. If not present, the value is 1.
	}

	export interface FoodstuffRecipeData {
		recipe_name: string; // The name of the recipe.
		difficulty: number; // How difficult this recipe is to make. This number is arbitrary and not necessarily related to anything else about the dish.
		cook_minutes: number; // How long this dish takes to cook in minutes.
		servings: number; // How many foodstuff items produced when this recipe is made.
		ingredients: string[]; // The list of ingredients required to make this dish.
		ingredient_alternatives?: {
			// Some recipes have unique alternatives for specific ingredients, like being able to swap beef for chicken.
			normal: Record<string, string[]>; // Always available.
			lewd: Record<string, string[]>; // Available if chef_state >= 3 and if the current kitchen allows lewd ingredients.
		};
		tags: string[]; // Any recipe/cooking related tags related to the recipe, but not the foodstuff itself. If you want to put a tag about the item as a piece of food that can be eat, put it on the FoodstuffFoodData.tags. The dish might be spicy, but the recipe is not. The recipe might be messy, but the dish is not.
	}

	export interface FoodstuffFoodData {
		tags: string[]; // Tags for the item as a food that can be gifted or eaten.
		handheld_gift?: boolean; // true if separate image is used when gifting food (e.g. pizza-gift.png vs pizza.png since you are presumably not gifting an entire large pizza for your LI to immediately consume).
	}

	export interface FoodstuffItem {
		index: number; // Unique index for the foodstuff.
		name: string; // Name of the item.
		singular: string; // Singular form of the item.
		plural: string; // Plural form of the item.
		icon: string; // Filename of the item's icon without path, e.g. "apple.png". The folder is implied to be /tending/...
		category: FoodstuffCategory; // The high level category of the item.
		kitchen_item_type_icon: FoodstuffKitchenItemTypeIcon; // The icon used used in the kitchen for this item.
		prop_folder: FoodstuffPropFolder; // The folder within /props/ where this item's prop images are located. This should probably to be normalized.
		ingredient_alternatives?: {
			// Other foodstuff that can be globally used as an alternative to this foodstuff in any recipe.
			normal: string[]; // Always available.
			lewd: string[]; // Available if chef_state >= 3 and if the current kitchen allows lewd ingredients.
		};
		tending?: FoodstuffTendingData; // The data for this foodstuff related to tending.
		shop: FoodstuffShopData; // The data for this foodstuff related to shops and purchasing.
		recipe?: FoodstuffRecipeData; // The data for this foodstuff related to cooking and recipes. If not present, then this foodstuff cannot be used in recipes or cooked.
		food?: FoodstuffFoodData; // The data for this foodstuff related to being a food item that can be gifted and eaten. If present, then this foodstuff can be gifted, but technically the giftability of a foodstuff is determined by the category of the item.
	}
}

export {};
