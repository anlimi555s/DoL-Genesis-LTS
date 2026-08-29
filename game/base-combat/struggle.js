function struggleSoftlockPrevent() {
	if (V.cheatClothes && pcAreArmsBound("any")) {
		Object.keys(V.struggle.enemy).forEach(enemy => {
			if (V.struggle.enemy[enemy].health <= 0 && V.struggle.enemy[enemy].location !== "fled") {
				V.struggle.enemy[enemy].location = "fleeing";
			} else {
				V.struggle.enemy[enemy].health -= 1;
			}
		});
	}

	return "";
}

Macro.add("struggle_softlock_prevent", {
	handler() {
		const fragment = struggleSoftlockPrevent();
		this.output.append(fragment);
	},
});
