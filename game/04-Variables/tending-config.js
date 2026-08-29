function initTendingConfig() {
	setup.tending = {
		plot_base: {
			plant: "none",
			stage: 0,
			days: 0,
			water: 0,
			till: 0,
		},
		plot_sizes: ["small", "medium", "large"],
		wateringTimes: {
			small: 5,
			medium: 15,
			large: 30,
		},
	};
}
window.initTendingConfig = initTendingConfig;
