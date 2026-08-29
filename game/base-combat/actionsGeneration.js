/* actionsGeneration macro conversion */
/* global DefaultActions combatButtonAdjustments */

Macro.add("generateCombatAction", {
	handler() {
		// object containing possible actions in format: { visibleName: action }
		const optionsTable = this.args[0];
		// type of action. possible values: "leftaction", "rightaction", "feetaction", "mouthaction", "penisaction", "vaginaaction", "anusaction", "chestaction", "thighaction"
		const actionType = this.args[1];
		// type of combat. possible values: undefined, "Self", "Struggle", "Swarm", "Vore", "Machine", "Tentacle"
		const combatType = this.args[2] || "";
		// type of controls. possible values: "radio", "lists", "columnRadio", "limitedLists"
		const controls = V.options.combatControls;
		// stuff to be displayed
		const frag = document.createDocumentFragment();
		// shortcut to create new elements to display
		const el = val => document.createElement(val);

		// main sequence
		if (["lists", "limitedLists"].includes(controls)) {
			const actions = Object.values(optionsTable);
			const listSpan = el("span");
			listSpan.id = `${actionType}Select`;
			const textColor = combatListColor(actionType, actions.includes(V[actionType]) ? V[actionType] : actions[0]);
			listSpan.className = `${textColor}List flavorText ${T.reducedWidths ? "reducedWidth" : ""}`;
			T[`${actionType}options`] = optionsTable; // listbox is quirky like that
			const listBox = Wikifier.wikifyEval(`<<listbox "$${actionType}" autoselect>><<optionsfrom _${actionType}options>><</listbox>>`);
			listSpan.append(listBox);
			frag.append(listSpan);
		} else {
			// assume radio buttons
			if (!combatType && controls !== "columnRadio") frag.append(el("br"));
			const optionNames = Object.keys(optionsTable);
			for (let n = 0; n < optionNames.length; n++) {
				const name = optionNames[n];
				const action = optionsTable[name];
				const label = el("label");
				const radioButton = Wikifier.wikifyEval(`<<radiobutton "$${actionType}" "${action}" autocheck>>`);
				const nameSpan = el("span");
				if (action === "ask") {
					nameSpan.id = "askLabel";
					nameSpan.className = V.askActionColour;
				} else {
					nameSpan.className = combatListColor(false, action, combatType);
				}
				nameSpan.innerText = ` ${name} `;
				const difficultyText = Wikifier.wikifyEval(`<<${actionType}Difficulty${combatType} ${action}>>`);
				if (controls === "radio" && n < optionNames.length - 1) difficultyText.append(" |\xa0");
				label.append(radioButton, nameSpan, difficultyText);
				frag.append(label);
			}
			if (!combatType && controls !== "columnRadio") frag.append(el("br"), el("br"));
		}
		this.output.append(frag);

		/* Changes the color of the list border when the option is changed */
		if (["lists", "limitedLists"].includes(controls)) combatButtonAdjustments(actionType, combatType);
	},
});

Macro.add("assignCombatDefaults", {
	handler() {
		const actionType = `${this.args[0]}action`;
		const defaultActionType = `${actionType}default`;
		const alwaysRun = this.args[1];
		const actions = Object.values(T[actionType]);
		if (actions.length > 0) {
			if (actions.length > 1 && (!actions.includes(V[defaultActionType]) || alwaysRun)) {
				// update default action with an appropriate override, but only if there's more than one choice
				const actionsSet = DefaultActions.get(V.defaultsCombatType, V.defaultsType, actionType);
				const defaultAction = actionsSet.find(action => actions.includes(action));
				V[defaultActionType] = defaultAction || actions[0];
			}
			// use default action if available
			if (actions.includes(V[defaultActionType])) V[actionType] = V[defaultActionType];
			// if not - just pick whatever is first on the list
			else V[actionType] = actions[0];
		}
	},
});
