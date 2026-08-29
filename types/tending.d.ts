declare module "twine-sugarcube" {
	export interface SugarCubeSetupObject {
		tending: {
			plot_base: Plot;
			plot_sizes: PlotSize[];
			wateringTimes: Record<PlotSize, number>;
		};
	}
}

declare global {
	export type PlotSize = "small" | "medium" | "large";

	export interface Plot {
		plant: string;
		stage: number;
		days: number;
		water: number;
		till: number;
	}
}

export {};
