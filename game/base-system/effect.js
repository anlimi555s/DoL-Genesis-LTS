function effectsWater(waterType = "liquid") {
	const fragment = document.createDocumentFragment();

	const sWikifier = text => {
		fragment.append(Wikifier.wikifyEval(text + " "));
	};
	const span = (text, colour) => {
		const element = document.createElement("span");
		if (colour) element.classList.add(colour);
		element.textContent = text + " ";
		fragment.append(element);
	};
	const br = () => fragment.append(document.createElement("br"));

	let wetIntro = 0;
	let squidArousal = 0;

	switch (V.squidcount) {
		case 1:
			sWikifier('<span class="purple">You feel the squid tease your <<genitals>>.</span> <<garousal>><<arousal 100 "genitals">>');
			break;
		case 2:
			sWikifier(
				'<span class="purple">You feel the squids tease your <<genitals>> and chest.</span> <<garousal>><<arousal 100 "breasts">><<arousal 100 "genitals">>'
			);
			break;
		case 3:
			sWikifier(
				'<span class="purple">You feel the squids tease your <<genitals>> and <<breasts>>.</span> <<garousal>><<arousal 200 "breasts">><<arousal 100 "genitals">>'
			);
			break;
		case 4:
			sWikifier(
				'<span class="purple">You feel the squids tease your <<genitals>>, <<breasts>>, and <<bottom>>.</span> <<garousal>><<arousal 200 "breasts">><<arousal 100 "genitals">><<arousal 100 "bottom">>'
			);
			break;
		default:
			if (V.squidcount >= 5) {
				squidArousal = V.squidcount * 30;
				sWikifier(`<span class="purple">You feel ${V.squidcount} squids tease your <<genitals>>, <<breasts>>, <<bottom>>, and other parts of your body.</span>
				<<garousal>><<arousal ${squidArousal} "breasts">><<arousal ${squidArousal} "genitals">><<arousal ${squidArousal} "bottom">>`);
			}
			break;
	}
	if (!V.worn.upper.type.includes("naked") && !waterproofCheck(V.worn.upper)) {
		if (V.upperwet >= 100 && V.upperwetstage < 3) {
			V.upperwetstage = 3;
			wetIntro = 2;
			sWikifier(`<span class="lewd">${waterType.toUpperFirst()} soaks through your ${V.worn.upper.name}, exposing your <<undertop>>.</span>`);
		} else if (V.upperwet < 90 && V.upperwetstage >= 3) {
			V.upperwetstage = 2;
			sWikifier(`<span class="green">Your ${V.worn.upper.name} <<upperhas>> dried, concealing your <<undertop>>. </span>`);
		} else if (V.upperwet >= 80 && V.upperwetstage < 2) {
			V.upperwetstage = 2;
			wetIntro = 1;
			sWikifier(`<span class="purple">Your ${V.worn.upper.name} <<upperplural>> wet.</span>`);
		} else if (V.upperwet < 70 && V.upperwetstage >= 2) {
			V.upperwetstage = 1;
			sWikifier(`<span class="green">Your ${V.worn.upper.name} <<upperplural>> drying out.</span>`);
		} else if (V.upperwet >= 50 && V.upperwetstage < 1) {
			V.upperwetstage = 1;
			sWikifier(`<span class="blue">Your ${V.worn.upper.name} <<upperplural>> damp.</span>`);
		} else if (V.upperwet < 40 && V.upperwetstage >= 1) {
			V.upperwetstage = 0;
			sWikifier(`<span class="green">Your ${V.worn.upper.name} <<upperplural>> dry.</span>`);
		}
	}

	if (!V.worn.lower.type.includes("naked") && !waterproofCheck(V.worn.lower)) {
		if (V.lowerwet >= 100 && V.lowerwetstage < 3) {
			V.lowerwetstage = 3;
			wetIntro = 2;
			sWikifier(`<span class="lewd">${waterType.toUpperFirst()} soaks through your ${V.worn.lower.name}, exposing your <<undies>>.</span>`);
		} else if (V.lowerwet < 90 && V.lowerwetstage >= 3) {
			V.lowerwetstage = 2;
			sWikifier(`<span class="green">Your ${V.worn.lower.name} <<lowerhas>> dried, concealing your <<undies>>. </span>`);
		} else if (V.lowerwet >= 80 && V.lowerwetstage < 2) {
			V.lowerwetstage = 2;
			wetIntro = 1;
			sWikifier(`<span class="purple">Your ${V.worn.lower.name} <<lowerplural>> wet.</span>`);
		} else if (V.lowerwet < 70 && V.lowerwetstage >= 2) {
			V.lowerwetstage = 1;
			sWikifier(`<span class="green">Your ${V.worn.lower.name} <<lowerplural>> drying out.</span>`);
		} else if (V.lowerwet >= 50 && V.lowerwetstage < 1) {
			V.lowerwetstage = 1;
			sWikifier(`<span class="blue">Your ${V.worn.lower.name} <<lowerplural>> damp.</span>`);
		} else if (V.lowerwet < 40 && V.lowerwetstage >= 1) {
			V.lowerwetstage = 0;
			sWikifier(`<span class="green">Your ${V.worn.lower.name} <<lowerplural>> dry.</span>`);
		}
	}

	if (!V.worn.under_lower.type.includes("naked") && !waterproofCheck(V.worn.under_lower)) {
		if (V.underlowerwet >= 100 && V.underlowerwetstage < 3 && V.pantiesSoaked) {
			V.underlowerwetstage = 3;
			if (V.lowerwetstage === 3 || V.worn.lower.type.includes("naked")) {
				// If clothing above underwear is also wet, or missing
				wetIntro = 2;
				sWikifier(`<span class="lewd">Your bodily fluids soak through your ${V.worn.under_lower.name}, exposing your <<genitals>>.</span>`);
			} else if (setup.clothes.lower[clothesIndex("lower", V.worn.lower)].skirt === 1) {
				sWikifier(
					`<span class="lewd">Your bodily fluids soak through your ${V.worn.under_lower.name}, exposing your <<genitals>> to the air under your $worn.lower.name.</span>`
				);
			} else {
				span(`Your bodily fluids soak through your ${V.worn.under_lower.name}.`, "lewd");
			}
		} else if (V.underlowerwet >= 100 && V.underlowerwetstage < 3) {
			V.underlowerwetstage = 3;
			wetIntro = 2;
			sWikifier(`<span class="lewd">${waterType.toUpperFirst()} soaks through your ${V.worn.under_lower.name}, exposing your <<genitals>>.</span>`);
		} else if (V.underlowerwet < 90 && V.underlowerwetstage >= 3) {
			V.underlowerwetstage = 2;
			sWikifier(`<span class="green">Your ${V.worn.under_lower.name} <<underlowerhas>> dried, concealing your <<genitals>>. </span>`);
		} else if (V.underlowerwet >= 80 && V.underlowerwetstage < 2) {
			V.underlowerwetstage = 2;
			wetIntro = 1;
			sWikifier(`<span class="purple">Your ${V.worn.under_lower.name} <<underlowerplural>> wet.</span>`);
		} else if (V.underlowerwet < 70 && V.underlowerwetstage >= 2) {
			V.underlowerwetstage = 1;
			sWikifier(`<span class="green">Your ${V.worn.under_lower.name} <<underlowerplural>> drying out.</span>`);
		} else if (V.underlowerwet >= 50 && V.underlowerwetstage < 1) {
			V.underlowerwetstage = 1;
			sWikifier(`<span class="blue">Your ${V.worn.under_lower.name} <<underlowerplural>> damp.</span>`);
		} else if (V.underlowerwet < 40 && V.underlowerwetstage >= 1) {
			V.underlowerwetstage = 0;
			sWikifier(`<span class="green">Your ${V.worn.under_lower.name} <<underlowerplural>> dry.</span>`);
		}
	}

	if (!V.worn.under_upper.type.includes("naked") && !V.worn.under_upper.type.includes("chastity") && !waterproofCheck(V.worn.under_upper)) {
		if (V.underupperwet >= 100 && V.underupperwetstage < 3) {
			V.underupperwetstage = 3;
			wetIntro = 2;
			sWikifier(`<span class="lewd">${waterType.toUpperFirst()} soaks through your ${V.worn.under_upper.name}, exposing your <<breasts>>.</span>`);
		} else if (V.underupperwet < 90 && V.underupperwetstage >= 3) {
			V.underupperwetstage = 2;
			sWikifier(`<span class="green">Your ${V.worn.under_upper.name} <<underupperhas>> dried, concealing your <<breasts>>. </span>`);
		} else if (V.underupperwet >= 80 && V.underupperwetstage < 2) {
			V.underupperwetstage = 2;
			wetIntro = 1;
			sWikifier(`<span class="purple">Your ${V.worn.under_upper.name} <<underupperplural>> wet.</span>`);
		} else if (V.underupperwet < 70 && V.underupperwetstage >= 2) {
			V.underupperwetstage = 1;
			sWikifier(`<span class="green">Your ${V.worn.under_upper.name} <<underupperplural>> drying out.</span>`);
		} else if (V.underupperwet >= 50 && V.underupperwetstage < 1) {
			V.underupperwetstage = 1;
			sWikifier(`<span class="blue">Your ${V.worn.under_upper.name} <<underupperplural>> damp.</span>`);
		} else if (V.underupperwet < 40 && V.underupperwetstage >= 1) {
			V.underupperwetstage = 0;
			sWikifier(`<span class="green">Your ${V.worn.under_upper.name} <<underupperplural>> dry.</span>`);
		}
	}

	if (!V.possessed) {
		if (wetIntro >= 2) {
			sWikifier("<<exposure>>");
			if (V.exhibitionism >= 55) {
				span(
					!V.worn.face.type.includes("blindfold")
						? "You feel a lewd thrill as you look down and see your clothes clinging tight to your body, completely transparent."
						: "You feel a lewd thrill as your clothes cling tight to your body, completely transparent."
				);
			} else {
				span(
					!V.worn.face.type.includes("blindfold")
						? "You look down in horror at your clothes, which cling tight to your body and are completely transparent."
						: "Horror takes over you as you feel your clothes, which cling tight to your body and are completely transparent."
				);
			}
			sWikifier("<<covered>>");
			br();
			if (V.makeupWashed) br();
		} else if (wetIntro >= 1) {
			if (V.exhibitionism >= 35) {
				span(
					!V.worn.face.type.includes("blindfold")
						? "You feel a lewd thrill as you look down and see your clothes clinging tight to your body, giving a hint of transparency."
						: "You feel a lewd thrill as your clothes cling tight to your body, giving a hint of transparency."
				);
			} else {
				span(
					!V.worn.face.type.includes("blindfold")
						? "You look down anxiously at your clothes, now clinging tightly to your body and giving a hint of transparency."
						: "You feel your clothes, now clinging tightly to your body and giving a hint of transparency."
				);
			}
			br();
			if (V.makeupWashed) br();
		}
	}
	return fragment;
}

Macro.add("effectswater", {
	handler() {
		const fragment = effectsWater(this.args[0]);
		if (fragment) this.output.append(fragment);
	},
});

function effectsMakeup() {
	const fragment = document.createDocumentFragment();

	const span = (text, colour) => {
		const element = document.createElement("span");
		if (colour) element.classList.add(colour);
		element.textContent = text + " ";
		fragment.append(element);
	};

	if (V.makeupWashed) {
		delete V.makeupWashed;
		span(`Your makeup is washed away${V.beauty >= (V.beautymax / 7) * 4 ? ", revealing your natural beauty" : ""}.`, "teal");
		fragment.append(document.createElement("br"));
	}

	if (V.makeup.mascara && V.makeup.mascara_running < painToTearsLvl(V.pain) && !V.makeup.mascara.includes("waterproof")) {
		V.makeup.mascara_running = painToTearsLvl(V.pain);
	}

	return fragment;
}

function effects() {
	const fragment = document.createDocumentFragment();

	const sWikifier = text => {
		fragment.append(Wikifier.wikifyEval(text + " "));
	};
	const element = (element, text, colour) => {
		const result = document.createElement(element);
		if (colour) result.classList.add(colour);
		result.textContent = text + " ";
		fragment.append(result);
	};
	const br = () => fragment.append(document.createElement("br"));

	// Depricated as of current
	// if (V.newVersionData) sWikifier("<<newversionnotification>>");

	sWikifier("<<autoTakePillCheck>>");
	fragment.append(effectsWater());
	fragment.append(effectsMakeup());

	V.speechcycle++;
	if (V.speechcycle >= 7) V.speechcycle = 0;

	if (Weather.bodyTemperature < setup.WeatherTemperature.minTemperature + 1 && !Weather.BodyTemperature.isIncreasing()) {
		element("span", `You're very cold and about to get hypothermia!`, "red");
		br();
	} else if (Weather.bodyTemperature > setup.WeatherTemperature.maxTemperature - 1 && !Weather.BodyTemperature.isDecreasing()) {
		element("span", `You're extremely hot and about to get heatstroke!`, "red");
		br();
	}

	if (!T.inWater && V.squidcount) {
		element("span", `The squid${V.squidcount > 1 ? "s" : ""} drop${V.squidcount > 1 ? "" : "s"} off you, seeking water.`, "blue");
		V.squidcount = 0;
	}

	if (V.scienceproject === "ongoing" && V.scienceprojectdays === 0 && !V.scienceprojectwarning) {
		V.scienceprojectwarning = 1;
		element("span", `The science fair is being held in the town hall on Cliff Street today from ${ampm(9, 0)} until ${ampm(18, 0)}.`, "gold");
	}

	if (V.mathsproject === "ongoing" && V.mathsprojectdays === 0 && !V.mathsprojectwarning) {
		V.mathsprojectwarning = 1;
		element("span", `The maths competition is being held in the town hall on Cliff Street today from ${ampm(9, 0)} until ${ampm(18, 0)}.`, "gold");
	}

	if (V.englishPlay === "ongoing" && V.englishPlayDays === 0 && !V.englishPlayWarning) {
		V.englishPlayWarning = 1;
		element("span", `The school plays are being held on Cliff Street tonight from ${ampm(17, 0)} until ${ampm(21, 0)}.`, "gold");
	}

	if (V.studyBooks?.rented !== "none" && V.book_rent_timer === 0 && !V.studyBookDueWarning && Time.schoolTerm) {
		V.studyBookDueWarning = 1;
		element("span", `You have a library book due today.`, "gold");
	}

	if (V.innocencemessage === "start") {
		delete V.innocencemessage;
		element("span", "A profound sense of peace falls on your mind. You were upset a moment ago, but you can't remember why.", "red");
		element("i", "Your trauma has been replaced with innocence. Trauma will continue to accumulate and will return should you run out of innocence.");
	} else if (V.innocencemessage === "end") {
		delete V.innocencemessage;
		element("span", "You have a terrible epiphany. The abuse you've endured can be ignored no longer.", "red");
		element("i", "Your innocence has been replaced by trauma.");
	}

	if (V.eventskipoverrule) V.eventskipoverrule = 0;

	if (V.underwatercheck > 0) {
		V.underwatercheck--;
	} else if (V.underwater === 1) {
		V.underwater = 0;
		V.oxygen = Math.clamp(V.oxygen, 0, V.oxygenmax);
		if (V.oxygen < V.oxygenmax) {
			V.oxygenRecovery = true;
		}
	}
	if (V.oxygenRecovery && V.underwater === 0 && V.combat === 0) {
		sWikifier(
			`<span class="lblue">Air (recovering):</span>
			<<dynamicblock id=oxygen-caption>>
				<<oxygencaption>>
			<</dynamicblock>>`
		);
	}

	sWikifier("<<updateHallucinations>>");

	if (V.controlled === 0 && V.flashbacks >= 1) {
		switch (V.location) {
			case "town":
				if (V.flashbacktownready === 1) {
					delete V.flashbacktownready;
					sWikifier("<<flashbacktown>>");
				}
				break;
			case "home":
				if (V.flashbackhomeready === 1) {
					delete V.flashbackhomeready;
					sWikifier("<<flashbackhome>>");
				}
				break;
			case "beach":
				if (V.flashbackbeachready === 1) {
					delete V.flashbackbeachready;
					sWikifier("<<flashbackbeach>>");
				}
				break;
			case "underground":
				if (V.flashbackundergroundready === 1) {
					delete V.flashbackundergroundready;
					sWikifier("<<flashbackunderground>>");
				}
				break;
			case "school":
				if (V.flashbackschoolready === 1) {
					delete V.flashbackschoolready;
					sWikifier("<<flashbackschool>>");
				}
				break;
		}
	}

	// eslint-disable-next-line no-undef
	if (isPregnancyEnding()) {
		sWikifier(
			`<span class="red">Your waters have broken.</span> ${
				["asylum", "prison", "hospital"].includes(V.location) ? "You need to find help, fast!" : "You need to head to the hospital, fast!"
			} <<ggstress>>`
		);
		br();
	}

	if (V.effectsmessage && !V.statFreeze && !V.silenceNotifications) {
		delete V.effectsmessage;

		if (V.recovered_from_pregnancy) {
			delete V.recovered_from_pregnancy;
			element("span", "You feel a familiar emptiness return in your womb.", "green");
		}

		if (V.skulduggerymessage) {
			const grade = ["S", "A+", "A", "B+", "B", "C+", "C", "D+", "D", "F+"];
			const colour = ["green", "teal", "teal", "lblue", "lblue", "blue", "blue", "purple", "purple", "pink"];
			element("span", "Your skulduggery has improved to", "gold");
			element("span", `${grade[V.skulduggerymessage - 1]}.`, colour[V.skulduggerymessage - 1]);
			delete V.skulduggerymessage;
			V.skulduggeryday = V.skulduggery;
		}

		if (V.hypnosis_deviancy_message) {
			delete V.hypnosis_deviancy_message;
			sWikifier(
				`<<hypnosisText "You weren't very deviant yesterday.">> ${
					V.hypnosis_traits.deviancy < 5 ? "The thought fills you with " : "The thought sends your mind "
				}`
			);
			switch (V.hypnosis_traits.deviancy) {
				case 1:
					element("span", "shame.", "lblue");
					break;
				case 2:
					element("span", "regret.", "blue");
					break;
				case 3:
					element("span", "guilt.", "purple");
					break;
				case 4:
					element("span", "intense guilt.", "pink");
					break;
				case 5:
					element("span", "whirring with guilt and anxiety.", "red");
					break;
			}
			sWikifier("<<gggtrauma>>");
		}

		if (V.hypnosis_devotion_message) {
			switch (V.hypnosis_devotion_message) {
				case "ritual":
					sWikifier(`<<hypnosisText "You didn't meet with Gwylan to help with <<nnpc_his 'Gwylan'>> ritual this week.">> `);
					break;
				case "request":
					if (V.gwylan.request.missed) {
						sWikifier(`<<hypnosisText "You still haven't completed Gwylan's request.">> `);
					} else {
						sWikifier(`<<hypnosisText "You didn't complete Gwylan's request yesterday.">> `);
					}
					break;
				case "meetAtShop":
					if (V.gwylan.request.missed) {
						sWikifier(`<<hypnosisText "You still haven't met with Gwylan at the shop.">> `);
					} else {
						sWikifier(`<<hypnosisText "You didn't meet with Gwylan at the shop yesterday.">> `);
					}
					break;
				case "meetAtCafe":
					if (V.gwylan.request.missed) {
						sWikifier(`<<hypnosisText "You still haven't met with Gwylan at the cafe.">> `);
					} else {
						sWikifier(`<<hypnosisText "You didn't meet with Gwylan at the cafe yesterday.">> `);
					}
					break;
				default:
					if (V.gwylan.request.missed) {
						sWikifier(`<<hypnosisText "You still haven't fulfilled Gwylan's request.">> `);
					} else {
						sWikifier(`<<hypnosisText "You didn't fulfil Gwylan's request yesterday.">> `);
					}
					break;
			}
			sWikifier(`${V.hypnosis_traits.devotion < 5 ? "The thought fills you with " : "The thought sends your mind "}`);
			switch (V.hypnosis_traits.devotion) {
				case 1:
					element("span", "shame.", "lblue");
					sWikifier(`<<gtrauma>><<ghallucinogens>>`);
					break;
				case 2:
					element("span", "regret.", "blue");
					sWikifier(`<<ggtrauma>><<ghallucinogens>>`);
					break;
				case 3:
					element("span", "guilt.", "purple");
					sWikifier(`<<ggtrauma>><<gghallucinogens>>`);
					break;
				case 4:
					element("span", "intense guilt.", "pink");
					sWikifier(`<<gggtrauma>><<gghallucinogens>>`);
					break;
				case 5:
					element("span", "whirring with guilt and anxiety.", "red");
					sWikifier(`<<gggtrauma>><<ggghallucinogens>>`);
					break;
			}
			delete V.hypnosis_devotion_message;
		}

		if (V.hypnosis_timer_messages?.length) {
			V.hypnosis_timer_messages.forEach(trait => {
				switch (trait) {
					case "devotion":
						sWikifier("<<gwylanHypnosis 'devotion' -1>>");
						break;
					case "peace":
						sWikifier('<span class="purple">A familiar uncertainty fills your being. Your Hypnotic Peace has faded.</span>');
						delete V.hypnosis_traits[trait];
						delete V.hypnosisTimers[trait];
						break;
					case "silence":
						sWikifier(
							`${
								numberOfEarSlime()
									? "<span class='purple'>Familiar whispers fill your ears. Your Hypnotic Silence has faded.</span>"
									: "<span class='purple'>Your Hypnotic Silence has faded.</span>"
							}`
						);
						delete V.hypnosis_traits[trait];
						delete V.hypnosisTimers[trait];
						break;
					default:
						sWikifier(`<span class="purple">Your Hypnotic ${trait.toUpperFirst()} has faded.</span>`);
						delete V.hypnosis_traits[trait];
						delete V.hypnosisTimers[trait];
						break;
				}
			});
			delete V.hypnosis_timer_messages;
		}

		// expects the use of $science_up_message, $maths_up_message, $english_up_message, $history_up_message, $science_down_message, $maths_down_message, $english_down_message, $history_down_message
		["science", "maths", "english", "history"].forEach(subject => {
			if (V[`${subject}_up_message`]) {
				delete V[`${subject}_up_message`];
				sWikifier(`You feel more confident at ${subject}. <<${subject}_skill_up_text>>`);
				br();
			} else if (V[`${subject}_down_message`]) {
				delete V[`${subject}_down_message`];
				element("span", `The ${subject} curriculum has outpaced your understanding${V[`${subject}trait`] > 0 ? ", weakening your trait" : ""}.`, "red");
				br();
			}
		});

		if (V.lactationmessage) {
			delete V.lactationmessage;
			if (V.lactating) {
				sWikifier('<span class="purple">Your <<breasts>> feel heavy and sensitive.</span>');
			} else {
				sWikifier('<span class="lblue">Your <<breasts>> feel light. They are no longer so sensitive.</span>');
			}
		}

		if (V.penisgrowthmessage !== undefined) {
			switch (V.penisgrowthmessage) {
				case 6:
					element("span", "Your penis has grown to a prodigious size.", "purple");
					break;
				case 5:
					element("span", "Your penis has grown larger.", "purple");
					break;
				case 4:
					element("span", "Your penis has grown to an unremarkable size.", "purple");
					break;
				case 3:
					element("span", "Your penis has grown, though it's still small.", "purple");
					break;
				case 2:
					element("span", "Your penis looks like it's recovering.", "purple");
					break;
				case 1:
					element("span", "Your penis looks like it's been given another chance.", "purple");
					break;
			}
			delete V.penisgrowthmessage;
		}

		if (V.penisshrinkmessage !== undefined) {
			if (V.worn.genitals.name === "chastity parasite") {
				switch (V.penisshrinkmessage) {
					case 5:
						element("span", "Your chastity parasite has shrunk, though it still hints at an impressive penis size.", "purple");
						break;
					case 4:
						element("span", "Your chastity parasite has shrunk to an unremarkable size.", "purple");
						break;
					case 3:
						element("span", "Your chastity parasite has become smaller.", "purple");
						break;
					case 2:
						element("span", "Your chastity parasite has become tiny.", "purple");
						break;
					case 1:
						element("span", "Your chastity parasite looks like it may shrivel up.", "purple");
						break;
					case 0:
						element("span", "Your chastity parasite looks like it's barely concealing anything.", "purple");
						break;
				}
			} else {
				switch (V.penisshrinkmessage) {
					case 5:
						element("span", "Your penis has shrunk, though it's still of an impressive size.", "purple");
						break;
					case 4:
						element("span", "Your penis has shrunk to an unremarkable size.", "purple");
						break;
					case 3:
						element("span", "Your penis has become smaller.", "purple");
						break;
					case 2:
						element("span", "Your penis has become tiny.", "purple");
						break;
					case 1:
						element("span", "Your penis looks like it may shrivel up.", "purple");
						break;
					case 0:
						element("span", "Your penis looks like it may never be used properly again.", "purple");
						break;
				}
			}
			delete V.penisshrinkmessage;
		}

		if (V.breastgrowthmessage !== undefined) {
			switch (V.breastgrowthmessage) {
				case 12:
					element("span", "Your large breasts feel heavy and might get in the way.", "purple");
					break;
				case 11:
					element("span", "Your large breasts feel heavy and impressive.", "purple");
					break;
				case 10:
				case 9:
					element("span", "Your breasts feel heavy.", "purple");
					break;
				case 8:
				case 7:
					element("span", "Your breasts feel a little heavier.", "purple");
					break;
				case 6:
				case 5:
					element("span", "Your small breasts will be obvious to those around you.", "purple");
					break;
				case 4:
				case 3:
					element("span", "Your small breasts might be obvious to others.", "purple");
					break;
				case 2:
				case 1:
					element("span", "Your chest feels odd; it might be growing.", "purple");
					break;
			}
			delete V.breastgrowthmessage;
		}

		if (V.milkFullPainMessage) {
			if (V.milkFullPain >= 275) {
				sWikifier(`<span class="red">You haven't been milked enough in some time. Your <<breasts>> throb painfully from being so full.</span>`);
			} else if (V.milkFullPain >= 250) {
				sWikifier(`<span class="red">You haven't been milked enough in a while. Your <<breasts>> are sore from being so full.</span>`);
			} else {
				sWikifier(`<span class="red">You haven't been milked enough recently. Your <<breasts>> feel a little sore from being so full.</span>`);
			}
			V.daily.milkFullPainMessage = true;
			delete V.milkFullPainMessage;
		}

		if (V.breastshrinkmessage !== undefined) {
			switch (V.breastshrinkmessage) {
				case 11:
					element("span", "Your large breasts feel lighter, but are still very large.", "purple");
					break;
				case 10:
				case 9:
					element("span", "Your breasts feel light and are looking less impressive.", "purple");
					break;
				case 8:
				case 7:
					element("span", "Your breasts feel lighter.", "purple");
					break;
				case 6:
				case 5:
					element("span", "Your small breasts feel a little lighter.", "purple");
					break;
				case 4:
				case 3:
					element("span", "Your small breasts look less obvious.", "purple");
					break;
				case 2:
				case 1:
					element("span", "Your chest looks flatter.", "purple");
					break;
				case 0:
					element("span", "Your chest looks flat.", "purple");
					break;
			}
			delete V.breastshrinkmessage;
		}

		if (V.bottomgrowthmessage !== undefined) {
			switch (V.bottomgrowthmessage) {
				case 8:
					element("span", "Your large butt has become even larger.", "purple");
					break;
				case 7:
					element("span", "Your butt feels heavy.", "purple");
					break;
				case 6:
					element("span", "Your butt feels plump.", "purple");
					break;
				case 5:
					element("span", "Your butt feels round.", "purple");
					break;
				case 4:
					element("span", "Your butt feels plush.", "purple");
					break;
				case 3:
					element("span", "Your butt has gained a little weight.", "purple");
					break;
				case 2:
					element("span", "Your small butt sticks out more than you remember.", "purple");
					break;
				case 1:
					element("span", "Your butt doesn't feel so small any more.", "purple");
					break;
			}
			delete V.bottomgrowthmessage;
		}

		if (V.bottomshrinkmessage) {
			switch (V.bottomshrinkmessage) {
				case 7:
					element("span", "Your large butt feels a bit lighter.", "purple");
					break;
				case 6:
					element("span", "Your butt feels lighter.", "purple");
					break;
				case 5:
					element("span", "Your butt isn't quite as cushioned as before.", "purple");
					break;
				case 4:
					element("span", "Your butt has lost weight.", "purple");
					break;
				case 3:
					element("span", "Your butt feels a lot sleeker.", "purple");
					break;
				case 2:
				case 1:
					element("span", "Your butt feels small.", "purple");
					break;
				case 0:
					element("span", "Your butt feels tiny.", "purple");
					break;
			}
			delete V.bottomshrinkmessage;
		}

		if (V.speech_attitude_bratty_message) {
			delete V.speech_attitude_bratty_message;
			element("span", "You've become too submissive to adopt a bratty demeanour in conversation.", "purple");
		}

		if (V.speech_attitude_meek_message) {
			delete V.speech_attitude_meek_message;
			element("span", "You've become too defiant to adopt a meek demeanour in conversation.", "purple");
		}

		if (V.sunscreenAutoApplied) {
			element("span", `You apply sunscreen to your skin${Skin.Sunscreen.usesLeft <= 0 ? "," : "."}`, "purple");
			if (Skin.Sunscreen.usesLeft <= 0) element("span", "using the last of it.", "red");
			delete V.sunscreenAutoApplied;
		}

		if (V.pillsTaken) {
			element("span", "You take your daily pills.", "purple");
			if (V.pillsTakenLast) element("span", "You have run out of some of them.", "red");
			delete V.pillsTaken;
			delete V.pillsTakenLast;
		}

		if (V.hairGrowthApplied) {
			element("span", `You apply growth formula to your hair${V.hairGrowthAppliedLast ? "," : "."}`, "purple");
			if (V.hairGrowthAppliedLast) element("span", "but used the last of it.", "red");
			delete V.hairGrowthApplied;
			delete V.hairGrowthAppliedLast;
		}

		if (V.exhibitionism_message) {
			sWikifier(
				`<span class="lblue">You've spent time in public with no underwear on. You wonder if people can tell and shiver at the thought.</span> <<exhibitionism1>>`
			);
			delete V.exhibitionism_message;
		}

		if (V.rebuy_success.length) {
			const rebuyMessage = {};
			V.rebuy_success.forEach(([item, location]) => {
				if (!rebuyMessage[location]) rebuyMessage[location] = [];
				rebuyMessage[location].push(item);
			});
			Object.entries(rebuyMessage).forEach(([location, items]) => {
				element(
					"span",
					`Your ${formatList(items, "and", true)} signal${items.length > 1 ? "" : "s"} for a replacement${
						V.wardrobes[location]
							? ` to the ${V.wardrobes[location].name}`
							: `. (Likely One-off update error, no need to report unless seen multiple times in the same save) ${
									Array.isArray(V.rebuy_success) ? JSON.stringify(V.rebuy_success) : ""
							  }`
					}.
				`,
					"lblue"
				);
			});
			V.rebuy_success = [];
		}

		if (V.rebuy_failure.length) {
			element(
				"span",
				`Your ${formatList(V.rebuy_failure, "and", true)} signal${
					V.rebuy_failure.length > 1 ? "" : "s"
				} for a replacement, but you don't have enough money.`,
				"purple"
			);
			V.rebuy_failure = [];
		}

		if (V.masochism_message) {
			switch (V.masochism_message) {
				case "up 1":
					element("span", "Your thoughts wander over the attacks you've suffered. You shiver.", "blue");
					element("i", "You've become a guilty masochist.", "blue");
					break;
				case "up 2":
					element("span", "Your thoughts turn to the attacks you've suffered. A thrill follows, unbeckoned.", "purple");
					element("i", "You've become a normal masochist.", "purple");
					break;
				case "up 3":
					element("span", "Your body yearns for more abuse.", "pink");
					element("i", "You've become a hardened masochist.", "pink");
					break;
				case "up 4":
					element("span", "Your body craves more abuse.", "red");
					element("i", "You've become a drooling masochist.", "red");
					break;
				case "down 0":
					element("i", "You are no longer a masochist.", "lblue");
					break;
				case "down 1":
					element("span", "You are no longer so masochistic and can only be considered a", "blue");
					element("i", "guilty masochist.", "blue");
					break;
				case "down 2":
					element("span", "You are no longer so masochistic and can only be considered a", "purple");
					element("i", "normal masochist.", "purple");
					break;
				case "down 3":
					element("span", "You are no longer so masochistic and can only be considered a", "pink");
					element("i", "hardened masochist.", "pink");
					break;
			}
			delete V.masochism_message;
		}

		if (V.sadism_message) {
			switch (V.sadism_message) {
				case "up 1":
					element("span", "Your thoughts turn to the pain you've inflicted. You shiver.", "blue");
					element("i", "You've become a guilty sadist.", "blue");
					break;
				case "up 2":
					element("span", "Your thoughts turn to the pain you've inflicted. A thrill follows, unbeckoned.", "purple");
					element("i", "You've become a normal sadist.", "purple");
					break;
				case "up 3":
					element("span", "You yearn to hurt others.", "pink");
					element("i", "You've become a hardened sadist.", "pink");
					break;
				case "up 4":
					element("span", "If they want to play rough, so be it.", "red");
					element("i", "You've become a vengeful sadist.", "red");
					break;
				case "down 0":
					element("i", "You are no longer a sadist.", "lblue");
					break;
				case "down 1":
					element("span", "You are no longer so sadistic and can only be considered a", "blue");
					element("i", "guilty sadist.", "blue");
					break;
				case "down 2":
					element("span", "You are no longer so sadistic and can only be considered a", "purple");
					element("i", "normal sadist.", "purple");
					break;
				case "down 3":
					element("span", "You are no longer so sadistic and can only be considered a", "pink");
					element("i", "hardened sadist.", "pink");
					break;
			}
			delete V.sadism_message;
		}

		if (V.school_crossdress_message) {
			const crossdressing = V.player.gender !== V.player.sex ? "presumed crossdressing" : "crossdressing";
			const knows = V.player.gender !== V.player.sex ? "believes it to be true" : "knows";
			switch (V.school_crossdress_message) {
				case 5:
					element("span", `Your ${crossdressing} has become common knowledge at school. Everyone ${knows}, including the teachers.`, "red");
					break;
				case 4:
					element("span", `Rumours of your ${crossdressing} are spreading throughout the school.`, "pink");
					break;
				case 3:
					element("span", `Rumours of your ${crossdressing} are spreading and have become a popular topic of conversation at school.`, "purple");
					break;
				case 2:
					element("span", `Whispers of your ${crossdressing} are spreading through the school.`, "blue");
					break;
				case 1:
					element("span", `A few cliques at school have begun whispering of your ${crossdressing}.`, "lblue");
					break;
			}
			delete V.school_crossdress_message;
		}

		if (V.school_herm_message) {
			switch (V.school_herm_message) {
				case 5:
					element("span", "Everyone at school has heard of your unique genitalia, including the teachers.", "red");
					break;
				case 4:
					element("span", "Rumours of your unique genitalia have spread throughout the school.", "pink");
					break;
				case 3:
					element(
						"span",
						"It sounds far-fetched to many, but the school is rife with gossip about a student with both boy and girl parts.",
						"purple"
					);
					break;
				case 2:
					element("span", "Rumours of a student with both boy and girl parts are spreading through the school.", "blue");
					break;
				case 1:
					element("span", "A few cliques at school have begun whispering about a student with both boy and girl parts.", "lblue");
					break;
			}
			delete V.school_herm_message;
		}

		// expects the use of $orgasm_trait_message, $molest_trait_message, $rape_trait_message, $bestiality_trait_message, $tentacle_trait_message, $vore_trait_message, $milk_trait_message and $cum_trait_message
		[
			["orgasm", "Hedonist", "Orgasm Addict"],
			["molest", "Graceful", "Plaything"],
			["rape", "Survivor", "Fucktoy"],
			["bestiality", "Tamer", "Bitch"],
			["tentacle", "Witch", "Prey"],
			["vore", "Daredevil", "Tasty"],
			["milk", "Milk Enthusiast", "Milk Addict"],
			["cum", "Cumoisseur", "Cum Dump"],
		].forEach(([variable, defiantName, submissiveName]) => {
			if (V[`${variable}_trait_message`]) {
				element("span", `You've gained the "${V.submissive <= 850 ? defiantName : submissiveName}" trait.`, "gold");
				delete V[`${variable}_trait_message`];
			}
		});

		if (V.nectarmessage) {
			switch (V.nectarmessage) {
				case "traitGain":
					element(
						"span",
						`You find yourself craving more sweet nectar. You've gained the "${V.submissive <= 850 ? "Dendrophile" : "Plant Lover"}" and`,
						"purple"
					);
					element("span", '"Nectar Addict"', "red");
					element("span", "traits.", "purple");
					break;
				case "traitLost":
					element(
						"span",
						`The cravings for nectar finally subside. You've lost the "${V.submissive <= 850 ? "Dendrophile" : "Plant Lover"}" and`,
						"lblue"
					);
					element("span", '"Nectar Addict"', "red");
					element("span", "traits.", "lblue");
					break;
				case "withdrawals":
					sWikifier(
						'<span class="red">Your body craves nectar and has begun to suffer from withdrawals.</span> <<stress 12>><<ggstress>><<trauma 12>><<ggtrauma>><<physique_loss 4>><<lphysique>>'
					);
					br();
					break;
			}
			delete V.nectarmessage;
		}

		if (V.hiddenTransformMessage) {
			element(
				"span",
				V.hiddenTransformMessage === 1
					? "Your mental state is too fragile to continue hiding your inner self."
					: "Hiding your inner self takes a toll on your mental state.",
				"red"
			);
			delete V.hiddenTransformMessage;
		}

		if (V.prof_spray_message) {
			element("span", "Your spray was accurate. You didn't need to use a full cartridge, saving ammo.", "green");
			delete V.prof_spray_message;
		}

		if (V.community_message === "missed") {
			sWikifier('<span class="red">You missed community service. The police have taken note.</span><<crime "obstruction">>');
			delete V.community_message;
		}

		if (V.toy_message) {
			element("span", "Sex toys are becoming more popular throughout town.", "purple");
			delete V.toy_message;
		}

		if (V.loveInterest_message === 1) {
			element("i", "You feel that having multiple lovers is wrong. You can no longer choose more than one love interest.", "blue");
			delete V.loveInterest_message;
			delete V.loveInterestAwareMessage;
		} else if (V.loveInterest_message === 2 && !V.loveInterestAwareMessage) {
			element("i", "Your mind is open to the possibility of another lover. You may now choose a second love interest.", "pink");
			delete V.loveInterest_message;
			V.loveInterestAwareMessage = 1;
		} else if (V.loveInterest_message === 3 && V.loveInterestAwareMessage === 2) {
			element("i", "You feel that it's wrong to have so many lovers. You can no longer choose more than two love interests.", "blue");
			delete V.loveInterest_message;
			V.loveInterestAwareMessage = 1;
		} else if (V.loveInterest_message === 4 && V.loveInterestAwareMessage === 1) {
			element("i", "Your mind is open to the possibility of multiple lovers. You may now choose a third love interest.", "pink");
			delete V.loveInterest_message;
			V.loveInterestAwareMessage = 2;
		}

		if (V.fallenangelmessage) {
			sWikifier('<span class="red">You feel a dark presence clawing at your skin.</span> <<gstress>>');
			V.stress += V.stressmax;
			delete V.fallenangelmessage;
		}

		if (V.demonmessage) {
			sWikifier('<span class="red">You feel a terrible light sear through you.</span> <<gstress>>');
			V.stress += V.stressmax;
			delete V.demonmessage;
		}

		if (V.foxCrimeMessage) {
			element(
				"span",
				V.blackmoney >= 100
					? "You feel an animalistic satisfaction towards your growing collection of stolen goods."
					: "You feel an animalistic satisfaction as you commit such crimes.",
				"gold"
			);
			delete V.foxCrimeMessage;
		}

		if (V.bookoverduemessage) {
			if (V.bookoverduemessage === 1) {
				sWikifier(`<<crimeUp 5 "thievery">><<delinquency ${5 / 4}>>`);
				element("span", "You have a book severely overdue, and the police have been informed.", "red");
			} else {
				sWikifier(`<<delinquency ${3 / 4}>>`);
				element("span", "You have a book overdue and have incurred delinquency.", "red");
			}
			delete V.bookoverduemessage;
		}

		if (V.wraithcompoundmessage) {
			element("span", "A fell mist hangs over Elk Street.", "red");
			delete V.wraithcompoundmessage;
		}

		if (V.halloweenClothesMessage) {
			sWikifier(`<<specialClothesUnlock "set" "halloween">>`);
			delete V.halloweenClothesMessage;
		}

		if (V.christmasClothesMessage) {
			sWikifier(`<<specialClothesUnlock "set" "christmas">>`);
			delete V.christmasClothesMessage;
		}

		if (V.valentinesClothesMessage) {
			sWikifier(`<<specialClothesUnlock "set" "valentines">>`);
			delete V.valentinesClothesMessage;
		}

		if (V.earSlimebreastsParasite || V.earSlimePenisParasite || V.earSlimeClitParasite) {
			const parasiteCount = (V.earSlimebreastsParasite ? 1 : 0) + (V.earSlimePenisParasite ? 1 : 0) + (V.earSlimeClitParasite ? 1 : 0);
			let parasiteMessage = "";
			if (V.earSlimebreastsParasite) parasiteMessage += `A new parasite forms around your ${V.player.breastsize >= 1 ? "breasts" : "chest"}`;

			if (V.earSlimePenisParasite) {
				parasiteMessage += parasiteMessage ? " and the base of your penis" : "A new parasite forms around the base of your penis";
			}

			if (V.earSlimeClitParasite && V.player.vaginaExist) {
				if (V.earSlime.focus === "pregnancy") {
					parasiteMessage += parasiteMessage ? " and <<pussy>>" : "A new parasite forms around your <<pussy>>";
				} else {
					const looks = playerChastity("vagina") ? "feels" : "looks";
					parasiteMessage += parasiteMessage
						? ` and clit. It ${looks} like you have your own penis now`
						: `A new parasite forms around the base of your clit, it ${looks} similar to a penis`;
				}
			}
			if (parasiteMessage) {
				sWikifier(`<span class="blue">A satisfied warmth fills you. ${parasiteMessage}.</span>`);
				element("span", `You can tell that ${parasiteCount > 1 ? "they are" : "it's"} from the slimes in your ears.`);
				if (V.earSlimePenisParasite && V.earSlimePenisParasite !== 1) {
					element("span", `The previous ${V.earSlimePenisParasite} falls off shortly after it finishes growing.`, "red");
				}
				if (V.earSlimeClitParasite && V.earSlimeClitParasite !== 1) {
					element("span", `The previous ${V.earSlimeClitParasite} falls off shortly after it finishes growing.`, "red");
				}
			}
			delete V.earSlimebreastsParasite;
			delete V.earSlimePenisParasite;
			delete V.earSlimeClitParasite;
		}

		if (V.penisslimebrokenchastitymessage) {
			element(
				"span",
				`The parasite at the base of your genitals frees you from the ${V.penisslimebrokenchastitymessage}${
					V.penisslimecagemessage === 1 ? ", and almost just as quickly, a new chastity parasite forms around your penis" : ""
				}.`,
				"purple"
			);
			delete V.penisslimecagemessage;
			delete V.penisslimebrokenchastitymessage;
		}

		if (V.penisslimecagemessage) {
			element(
				"span",
				V.penisslimecagemessage === 1 ? "A new chastity parasite forms around your penis." : "Your chastity parasite looks brand new again.",
				"purple"
			);
			delete V.penisslimecagemessage;
		}

		if (V.pregnancyDailyEvent) {
			sWikifier("<<pregnancyDailyEvent>>");
			delete V.pregnancyDailyEvent;
		}

		// Check if any parasites are present before running events. If not, clear events.
		// TODO: Clear event messages in the case of "staggered" births where some parasites remain in that category. Otherwise, all events will continue to play until the daily reset, even if some parasites have already been birthed.
		if (V.daily.parasiteEvent) {
			if (V.sexStats.vagina.pregnancy.type === "parasite") {
				for (let i = 0; i < maxParasites("vagina"); i++) {
					if (V.sexStats.vagina.pregnancy.fetus[i] !== undefined) {
						T.hasVaginaParasiteForEvent = true;
						break;
					}
				}
			}
			if (V.sexStats.anus.pregnancy.type === "parasite") {
				for (let i = 0; i < maxParasites("anus"); i++) {
					if (V.sexStats.anus.pregnancy.fetus[i] !== undefined) {
						T.hasAnusParasiteForEvent = true;
						break;
					}
				}
			}
			if (!T.hasVaginaParasiteForEvent) {
				V.daily.parasiteEvent = V.daily.parasiteEvent.filter(function (event) {
					return !event.includes("vagina");
				});
			}
			if (!T.hasAnusParasiteForEvent) {
				V.daily.parasiteEvent = V.daily.parasiteEvent.filter(function (event) {
					return !event.includes("anus");
				});
			}
		}

		if (V.daily.parasiteEvent) {
			let minDaysLeft;
			if (V.sexStats.vagina.pregnancy.type === "parasite") {
				minDaysLeft = V.sexStats.vagina.pregnancy.fetus.reduce((prev, curr) => (prev.daysLeft < curr.daysLeft ? prev.daysLeft : curr.daysLeft), 30);
			}
			if (V.sexStats.anus.pregnancy.type === "parasite") {
				minDaysLeft = V.sexStats.anus.pregnancy.fetus.reduce(
					(prev, curr) => (prev.daysLeft < curr.daysLeft ? prev.daysLeft : curr.daysLeft),
					minDaysLeft || 30
				);
			}
			const stressMulti = Math.clamp(2 - V.sexStats.anus.pregnancy.motherStatus + V.sexStats.vagina.pregnancy.motherStatus, 0, 2);
			const arousalMulti = Math.clamp(1 + V.sexStats.anus.pregnancy.motherStatus + V.sexStats.vagina.pregnancy.motherStatus, 1, 3);
			let arousalGain = 0;
			if (V.daily.parasiteEvent.includes("anus3") && V.daily.parasiteEvent.includes("vagina3")) V.daily.parasiteEvent.delete("vagina3");

			V.daily.parasiteEvent.forEach(event => {
				switch (event) {
					case "anus0":
					case "vagina0":
						if (V.pregnancyStats.parasiteDoctorEvents >= 4) {
							sWikifier(
								`You feel ${V.pregnancyStats.namesParasitesChild ? "your grown child" : "the grown parasite"} in your ${
									event === "anus0" ? "stomach" : "uterus"
								}. <<ggarousal>>`
							);
						} else {
							sWikifier(
								`You feel something large move around in your ${
									event === "anus0" ? "stomach" : "uterus"
								}. Might be best to go to the hospital again. <<ggarousal>>`
							);
						}
						arousalGain += 2000;
						break;
					case "anus1":
					case "vagina1":
						if (V.pregnancyStats.parasiteDoctorEvents >= 2) {
							sWikifier(
								`You feel one of ${V.pregnancyStats.namesParasitesChild ? "your children" : "the parasites"} move around in your ${
									event === "anus1" ? "stomach" : "uterus"
								}. <<ggarousal>>${stressMulti ? "<<gstress>>" : ""}`
							);
						} else {
							sWikifier(`You feel something move around in your ${event === "anus1" ? "stomach" : "uterus"}. Might be best to go to the hospital.
							<<ggarousal>>${stressMulti ? "<<gstress>>" : ""}`);
						}
						arousalGain += (arousalMulti * 500) / (minDaysLeft + 1);
						V.stress += 300 * stressMulti;
						break;
					case "anus2":
					case "vagina2":
						sWikifier(
							`Your ${
								event === "anus2" ? "stomach" : "uterus"
							} rumbles a little. You hope the noise hasn't attracted any attention. <<garousal>>${stressMulti ? "<<gstress>>" : ""}`
						);
						arousalGain += (arousalMulti * 250) / (minDaysLeft + 1);
						V.stress += 200 * stressMulti;
						break;
					case "anus3":
					case "vagina3":
						sWikifier(`You feel a little lightheaded for a moment.${stressMulti ? "<<gstress>>" : ""}`);
						V.stress += 100 * stressMulti;
						break;
				}
			});
			if (arousalGain) sWikifier(`<<arousal ${Math.clamp(arousalGain, 0, 10000)}>>`);
			br();
			delete V.daily.parasiteEvent;
		}
	}

	if (numberOfEarSlime() && V.earSlime.event && !V.statFreeze) {
		if (V.earSlime.event.includes("get sperm into your") && V.earSlime.event.includes("completed") && V.earSlime.eventTimer <= 2) {
			element(
				"span",
				`The slime in your ear is pleased that you completed its task of getting sperm into your ${V.player.vaginaExist ? "vagina" : "anus"}.`,
				"green"
			);
			sWikifier(`<<pain -4>><<stress -6>><<trauma -12>><<lpain>><<lltrauma>><<lstress>>`);
			br();
			V.earSlime.event = "";
		} else if (V.earSlime.event.includes("get your own sperm into your") && V.earSlime.event.includes("completed") && V.earSlime.eventTimer <= 2) {
			element(
				"span",
				`The slime in your ear is pleased that you completed its task of getting your own sperm into your ${V.player.vaginaExist ? "vagina" : "anus"}.`,
				"green"
			);
			sWikifier(`<<pain -4>><<stress -6>><<trauma -12>><<lpain>><<lltrauma>><<lstress>>`);
			if (V.earSlime.growth >= 100 && V.earSlime.focus === "pregnancy" && V.worn.genitals.name === "naked") {
				sWikifier(`<span class="purple">A new chastity parasite forms around your penis.</span> <<genitalswear 8>>`);
				V.worn.genitals.origin = "ear slime";
			}
			br();
			V.earSlime.event = "";
		} else if (V.earSlime.eventTimer <= 2 || (V.earSlime.noSleep && Time.dayState !== "night")) {
			if (V.earSlime.startedThreats) {
				element("span", "The slime in your ear punishes you for failing to complete your task.", "red");
				sWikifier(`<<ggpain>><<ggtrauma>><<ggstress>><<pain 16>><<stress 12>><<trauma 12>>`);
				V.earSlime.defyCooldown += 4;
			} else {
				element("span", "The slime in your ear is upset you were unable to complete what you said you would do.", "cyan");
			}
			br();
			V.earSlime.event = "";
			V.earSlime.noSleep = false;
		}
	}

	if (V.cheatClothes) {
		const slots = ["upper", "lower", "under_upper", "under_lower", "over_upper", "over_lower", "genitals"];
		if (V.worn.face.type.includesAny("face_covering", "gag", "mask")) {
			slots.push("face");
		}
		slots.forEach(slot => {
			if (V.worn[slot].name === "naked") return;
			V.worn[slot].integrity = clothingData(slot, V.worn[slot], "integrity_max");
			cheatsUpdateSlider(`#numberslider-input-worn${slot.replace("_", "-")}integrity`, V.worn[slot].integrity);
		});
	}

	if (Array.isArray(V.timeMessages) && V.timeMessages.length) {
		/*
			Calls to <<earnFeat "x">> here and within earnHourlyFeats are intended to show feats to the user.
			Be aware that the earnFeat widget is also used in passages such as 'Forest Blood Lemon Pick' and feats earned this way should still be displayed on that very passage and not the next one.
		*/
		const errors = [];
		V.timeMessages.forEach(messageKey => {
			let display;
			switch (messageKey) {
				case "feats":
					display = earnHourlyFeats();
					if (display) fragment.append(display);
					break;
				// Transformations
				case "fallenAngelFeathers":
					element("span", "Your wings have grown some new feathers.", "gold");
					break;
				case "fallenAngelWings":
					element("span", "The familiar feeling of soft feathers fills you with hope.", "gold");
					break;
				case "fallenAngelDescend":
					element(
						"span",
						"Your blackened wings turn blacker still. Your shattered halo fades. Horns sprout from your scalp and a tail sprouts from your lower back. Your sense of loss is replaced with a desire for revenge.",
						"gold"
					);
					fragment.append(wikifier("garousal"));
					fragment.append(wikifier("specialClothesUnlock", "'set'", "'succubus'"));
					fragment.append(wikifier("earnFeat", "'Demon'"));
					break;
				case "angelUp1":
					sWikifier('<span class="gold">Despite everything, you have managed to remain a pure <<pcGender>>. The thought makes you happy.</span>');
					break;
				case "angelUp2":
					element("span", "You are pure and feel determined to keep it that way.", "gold");
					break;
				case "angelUp3":
					element("span", "You feel a weight lift from your shoulders.", "gold");
					break;
				case "angelUp4":
					element("span", "A golden light shines down on you.", "gold");
					break;
				case "angelUp5":
					element("span", "You feel a soothing warmth in your back.", "gold");
					break;
				case "angelUp6":
					element("span", "You feel lighter. Your new wings caress your face.", "gold");
					fragment.append(wikifier("earnFeat", "'Angel'"));
					break;
				case "angelDown0":
					element("span", "You feel soiled.", "gold");
					break;
				case "angelDown1":
					element("span", "You feel dirty.", "gold");
					break;
				case "angelDown2":
					element("span", "You feel a weight bear down on you.", "gold");
					break;
				case "angelDown3":
					element("span", "The light above you fades.", "gold");
					break;
				case "angelDown4":
					element("span", "The soothing warmth in your back fades.", "gold");
					break;
				case "angelDown5":
					element("span", "Your wings fade away.", "gold");
					break;
				case "demonUp1":
					sWikifier('<span class="gold">Your scalp itches.</span><<garousal>>');
					break;
				case "demonUp2":
					sWikifier('<span class="gold">Horns sprout from your scalp.</span><<garousal>>');
					break;
				case "demonUp3":
					sWikifier('<span class="gold">Your <<bottom>> itches.</span><<garousal>>');
					break;
				case "demonUp4":
					sWikifier('<span class="gold">A tail sprouts from your lower back.</span><<garousal>>');
					break;
				case "demonUp5":
					sWikifier('<span class="gold">You feel a burning sensation in your back.</span><<garousal>>');
					break;
				case "demonUp6":
					sWikifier(
						'<span class="gold">You feel lighter. Your new wings caress your face.</span><<garousal>><<earnFeat "Demon">><<specialClothesUnlock "set" "succubus">>'
					);
					break;
				case "demonDown0":
					element("span", "You feel an invisible light burn away your impurity.", "gold");
					if (V.demonFeat) {
						fragment.append(wikifier("earnFeat", "'The Path to Redemption'"));
						delete V.demonFeat;
					}
					break;
				case "demonDown1":
					element("span", "Your horns recede.", "gold");
					break;
				case "demonDown2":
					sWikifier('<span class="gold">The itching in your <<bottom>> stops.</span>');
					break;
				case "demonDown3":
					element("span", "Your tail recedes.", "gold");
					break;
				case "demonDown4":
					element("span", "The burning in your back ceases.", "gold");
					break;
				case "demonDown5":
					element("span", "Your wings recede.", "gold");
					break;
				case "wolfUp1":
					element("span", "You have a strange toothache.", "gold");
					break;
				case "wolfUp2":
					element("span", "Your mouth feels different. You explore your mouth and wince as your tongue presses against your new fangs.", "gold");
					break;
				case "wolfUp3":
					element("span", `Your scalp ${V.settings.pubicHairEnabled === true ? "and pubic area itch" : "itches"}.`, "gold");
					break;
				case "wolfUp4":
					element("span", "You feel something on your head. You reach up and tug, but it hurts. You have a new pair of wolf ears.", "gold");
					if (V.settings.pubicHairEnabled === true) element("span", "You also notice long and fluffy hair has grown in your pubic area.");
					break;
				case "wolfUp5":
					element("span", "Your lower back itches.", "gold");
					break;
				case "wolfUp6":
					element("span", "Your bottom feels heavier than usual. You reach behind you and feel your new wolf tail.", "gold");
					fragment.append(wikifier("earnFeat", "'Wolf'"));
					break;
				case "wolfDown0":
					element("span", "Your toothache has stopped.", "gold");
					break;
				case "wolfDown1":
					element("span", "Your fangs have turned into regular teeth.", "gold");
					break;
				case "wolfDown2":
					element("span", `Your scalp ${V.settings.pubicHairEnabled === true ? "and pubic area no longer itch" : "no longer itches"}.`, "gold");
					break;
				case "wolfDown3":
					element("span", `Your wolf ears ${V.settings.pubicHairEnabled === true ? "and extra body hair " : ""}have disappeared.`, "gold");
					break;
				case "wolfDown4":
					element("span", "Your lower back has stopped itching.", "gold");
					break;
				case "wolfDown5":
					element("span", "Your balance feels different. Your wolf tail has disappeared.", "gold");
					break;
				case "catUp1":
					element("span", "You have a strange toothache. A beetle crawls by. You resist the urge to pounce.", "gold");
					break;
				case "catUp2":
					element("span", "Your mouth feels different. You explore your mouth and wince as your tongue presses against your new fangs.", "gold");
					break;
				case "catUp3":
					element("span", "Your scalp itches.", "gold");
					break;
				case "catUp4":
					element("span", "Your scalp twitches. You reach up and feel your new pair of cat ears.", "gold");
					break;
				case "catUp5":
					element("span", "Your lower back itches.", "gold");
					break;
				case "catUp6":
					element("span", "Your bottom feels weighty, yet perfectly balanced. You reach behind and feel your new cat tail.", "gold");
					fragment.append(wikifier("earnFeat", "'Neko'"));
					break;
				case "catUp7":
					element("span", "Your eyes itch.", "gold");
					break;
				case "catUp8":
					element("span", "Your eyes water from a burning sensation around the pupil.", "gold");
					break;
				case "catUp9":
					element("span", "Your eyes burn, likely due to some sort of allergy. You can barely keep them open.", "gold");
					break;
				case "catUp10":
					element(
						"span",
						"Your eyes no longer burn. Despite the darkness of the early morning, you are able to pick up every detail of the scenery around you.",
						"gold"
					);
					break;
				case "catDown0":
					element("span", "Your toothache has stopped.", "gold");
					break;
				case "catDown1":
					element("span", "Your fangs have turned into regular teeth.", "gold");
					break;
				case "catDown2":
					element("span", "Your scalp no longer itches.", "gold");
					break;
				case "catDown3":
					element("span", "Your cat ears have disappeared.", "gold");
					break;
				case "catDown4":
					element("span", "The itching in your lower back stops.", "gold");
					break;
				case "catDown5":
					element("span", "Your cat tail disappears.", "gold");
					break;
				case "catDown6":
					element("span", "Your eyes no longer itch; it must have been an allergy.", "gold");
					break;
				case "catDown7":
					element("span", "Your eyes sense less detail of your surroundings.", "gold");
					break;
				case "catDown9":
					element("span", "Your surroundings appear darker than before.", "gold");
					break;
				case "cowUp1":
					element("span", "You have a strange urge to munch grass.", "gold");
					break;
				case "cowUp2":
					element("span", "Your scalp itches. You reach up and find that a pair of small horns have sprouted.", "gold");
					break;
				case "cowUp3":
					element("span", "Your ears tingle.", "gold");
					break;
				case "cowUp4":
					element(
						"span",
						"Your ears itch. You reach up to scratch them and find them much bigger than you expected. You've grown a pair of cow ears.",
						"gold"
					);
					break;
				case "cowUp5":
					element("span", "Your lower back tingles.", "gold");
					break;
				case "cowUp6":
					element(
						"span",
						"Your bottom feels heavier than usual. You reach behind you and feel your new cow tail. You suppress the urge to moo.",
						"gold"
					);
					fragment.append(wikifier("earnFeat", "'Cattle'"));
					break;
				case "cowDown0":
					element("span", "Grass no longer looks so tasty.", "gold");
					break;
				case "cowDown1":
					element("span", "Your small horns have disappeared.", "gold");
					break;
				case "cowDown2":
					element("span", "Your ears no longer tingle.", "gold");
					break;
				case "cowDown3":
					element("span", "Your cow ears have disappeared.", "gold");
					break;
				case "cowDown4":
					element("span", "Your lower back has stopped tingling.", "gold");
					break;
				case "cowDown5":
					element("span", "Your balance feels different. Your cow tail has disappeared.", "gold");
					break;
				case "harpyUp1":
					element("span", "Your vision feels sharper.", "gold");
					break;
				case "harpyUp2":
					element("span", "Your eyes feel strange. Your vision has improved.", "gold");
					break;
				case "harpyUp3":
					element(
						"span",
						`Your lower back and neck itch. ${
							V.loveInterest.primary !== "None"
								? `Your thoughts turn to ${
										["Black Wolf", "Great Hawk"].includes(V.loveInterest.primary)
											? `the ${V.loveInterest.primary},`
											: `${V.loveInterest.primary},`
								  } and you have a primal, almost animalistic, urge to be with ${C.npc[V.loveInterest.primary].pronouns.him}.`
								: "You suddenly crave a true partner to be with."
						}`,
						"gold"
					);
					break;
				case "harpyUp4":
					element("span", "Your bottom feels lighter. You reach behind you and grasp a feathered tail. Small feathers cover your neck.", "gold");
					break;
				case "harpyUp5":
					element("span", `Your back ${V.settings.pubicHairEnabled === true ? "and pubic area itch" : "itches"}.`, "gold");
					break;
				case "harpyUp6":
					element(
						"span",
						`You feel light as a feather. Wings caress your face.${
							V.settings.pubicHairEnabled === true ? " You also notice that short, feathery hair has grown in your pubic area." : ""
						}`,
						"gold"
					);
					fragment.append(wikifier("earnFeat", "'Harpy'"));
					break;
				case "harpyDown0":
					element("span", "Your vision has returned to normal.", "gold");
					break;
				case "harpyDown1":
					element("span", "Your vision is no longer so sharp.", "gold");
					break;
				case "harpyDown2":
					element("span", "The itching in your lower back and neck both stop, and you no longer crave a partner so feverishly.", "gold");
					break;
				case "harpyDown3":
					element("span", "Your feathered tail has disappeared, along with the feathers on your neck.", "gold");
					break;
				case "harpyDown4":
					element("span", `You feel heavier${V.settings.pubicHairEnabled === true ? ", and your pubic area no longer itches" : ""}.`, "gold");
					break;
				case "harpyDown5":
					element(
						"span",
						`You feel heavier. Your feathered wings${V.settings.pubicHairEnabled === true ? " and feathery pubes" : ""} have disappeared.`,
						"gold"
					);
					break;
				case "foxUp1":
					element("span", "You have a strange toothache, and your eyes feel a little sharper. You have the urge to steal something.", "gold");
					break;
				case "foxUp2":
					element(
						"span",
						"Your mouth and eyes feel different. You explore your mouth and yip as your tongue presses against your new fangs.",
						"gold"
					);
					break;
				case "foxUp3":
					element(
						"span",
						`Your scalp itches. ${
							V.loveInterest.primary !== "None"
								? `Your thoughts turn to ${
										["Black Wolf", "Great Hawk"].includes(V.loveInterest.primary)
											? `the ${V.loveInterest.primary},`
											: `${V.loveInterest.primary},`
								  } and you have a primal, almost animalistic, urge to be with ${C.npc[V.loveInterest.primary].pronouns.him}.`
								: "You suddenly crave a true partner to be with."
						}`,
						"gold"
					);
					break;
				case "foxUp4":
					element("span", "You feel something on your head. You reach up and touch your new pair of fox ears, and they wiggle in response.", "gold");
					break;
				case "foxUp5":
					element(
						"span",
						"Your lower back itches. You have the urge to let someone scratch it. You also notice strange discolouration around your eyes.",
						"gold"
					);
					break;
				case "foxUp6":
					element(
						"span",
						"Your bottom feels heavier than usual. You give it a wiggle and feel your new fox tail. It's extremely comforting to touch.",
						"gold"
					);
					fragment.append(wikifier("specialClothesUnlock", "'set'", "'shrine'"));
					fragment.append(wikifier("earnFeat", "'Fox'"));
					break;
				case "foxDown0":
					element("span", "Your toothache has stopped.", "gold");
					break;
				case "foxDown1":
					element("span", "Your fangs have turned into regular teeth, and your eyesight feels dull.", "gold");
					break;
				case "foxDown2":
					element("span", "Your scalp no longer itches, and you no longer crave a partner so feverishly.", "gold");
					break;
				case "foxDown3":
					element("span", "Your fox ears have disappeared.", "gold");
					break;
				case "foxDown4":
					element("span", "Your lower back has stopped itching, and the discolouration around your eyes has vanished.", "gold");
					break;
				case "foxDown5":
					element("span", "Your balance feels different. Your fox tail has disappeared.", "gold");
					break;
				// Clothes
				case "bimboMessage1":
					element(
						"span",
						`You feel different, but you're not sure how or why.${
							V.worn.upper.type.includesAny("bimbo", "pimp") ||
							V.worn.lower.type.includesAny("bimbo", "pimp") ||
							V.worn.feet.type.includes("bimbo") ||
							V.worn.head.type.includes("pimp")
								? " Your clothing seems to cling to you."
								: ""
						}`,
						"lewd"
					);
					break;
				case "pimpMessage1":
					element(
						"span",
						`You feel different, but you're not sure how or why.${
							V.worn.upper.type.includes("pimp") || V.worn.lower.type.includes("pimp") || V.worn.head.type.includes("pimp")
								? " Your clothing feels warm to the touch."
								: ""
						}`,
						"lewd"
					);
					break;
				case "bimboMessage2":
					element(
						"span",
						`You feel different yet again. This time you're more sure about it: something is making you look more feminine. Your thoughts turn to the outfit you${
							V.worn.upper.type.includes("bimbo") || V.worn.lower.type.includes("bimbo") || V.worn.feet.type.includes("bimbo")
								? "'re wearing."
								: " had on earlier."
						}`,
						"lewd"
					);
					break;
				case "pimpMessage2":
					element(
						"span",
						`You feel different yet again. This time you're more sure about it: something is making you look more masculine. Your thoughts turn to the outfit you${
							V.worn.upper.type.includes("pimp") || V.worn.lower.type.includes("pimp") || V.worn.head.type.includes("pimp")
								? "'re wearing."
								: " had on earlier."
						}`,
						"lewd"
					);
					break;
				case "bimboMessage3":
					element(
						"span",
						"You feel an odd sense of yearning grow within you, and you are filled with a deep desire. An unbearable lust soon takes hold.",
						"lewd"
					);
					break;
				// Feats
				case "heroicVictory":
					fragment.append(wikifier("earnFeat", "'Heroic Victory'"));
					break;
				case "dawnToDusk":
					fragment.append(wikifier("earnFeat", "'Dawn to Dusk'"));
					break;
				case "adultShopContribution":
					if (V.adultshopcontribution) fragment.append(wikifier("earnFeat", "'Opened Pandoras Box'"));
					if (V.adultshopcontribution >= 12) fragment.append(wikifier("earnFeat", "'Opened Pandoras Cocks'"));
					break;
				case "valentinesTomorrow":
					sWikifier(
						`<span class="gold">Tomorrow is Valentine's Day. You find yourself looking forward to spending quality time with someone special.</span> <<stress -6>><<lstress>><<trauma -6>><<ltrauma>>`
					);
					br();
					break;
				case "valentinesToday":
					sWikifier(
						`<span class="gold">Today is Valentine's Day. You look forward to spending quality time with someone special today. You sense that doing so will be extra rewarding.</span> <<stress -6>><<lstress>><<trauma -6>><<ltrauma>>`
					);
					br();
					break;
				default:
					// Report error
					errors.pushUnique(messageKey);
					break;
			}
		});
		if (errors.length) Errors.report("Not fully implemented or incorrect time message keys found", errors);
		V.timeMessages = [];
	}

	sWikifier("<<integritycheck>>");

	V.orgasmdown -= 1;

	if (V.timer >= 1) V.timer--;
	// V.turnCount++;

	sWikifier("<<bindings>>");

	if (V.worn.genitals.cursed === 1 && V.worn.genitals.integrity <= 0) V.worn.genitals.type.push("broken");

	sWikifier("<<exposure>>");

	if (V.combat) sWikifier("<<pass 10 seconds>>");

	if (fragment.children.length) br();

	V.menu = 0;

	if (V.combat === 0 && V.ironmanmode === true) IronMan.scheduledSaves();

	return fragment;
}

Macro.add("effects", {
	handler() {
		const fragment = effects();
		this.output.append(fragment);
	},
});
