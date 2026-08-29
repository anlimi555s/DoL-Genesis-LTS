// @ts-check
/* globals CombatRendererNpcSetup CombatRendererPlayerSetup */

// @ts-ignore
setup.renderer ||= {};

/** @type {CombatRendererPlayerSetup} */
setup.renderer.player = {
	bodywriting: {
		types: ["butterfly", "cross", "flame", "flower", "heart", "paw print", "skull", "star", "text", "unicorn"],
	},
};

/** @type {CombatRendererNpcSetup} */
setup.renderer.npc = {
	beast: {
		bear: {
			states: {
				over: {
					show: true,
				},
			},
			positions: {
				doggy: {
					states: {
						front: {
							show: true,
						},
						under: {
							show: true,
						},
					},
				},
			},
		},
		blackwolf: {
			positions: {
				doggy: {
					show: true,
				},
				missionary: {
					states: {
						over: {
							show: true,
						},
					},
				},
			},
		},
		boar: {
			states: {
				over: {
					show: true,
					balls: true,
					drool: true,
				},
			},
			positions: {
				doggy: {
					states: {
						front: {
							show: true,
							balls: true,
						},
					},
				},
			},
		},
		bull: {
			show: false,
		},
		cat: {
			states: {
				over: {
					show: true,
				},
				under: {
					show: true,
				},
			},
		},
		centaur: {
			reference: "horse",
		},
		cow: {
			show: false,
		},
		creature: {
			states: {
				over: {
					show: true,
				},
			},
			positions: {
				doggy: {
					states: {
						front: {
							show: true,
						},
						under: {
							show: true,
						},
					},
				},
			},
		},
		dog: {
			states: {
				over: {
					show: true,
				},
			},
			positions: {
				doggy: {
					states: {
						front: {
							show: true,
						},
						under: {
							show: true,
						},
					},
				},
			},
		},
		dolphin: {
			states: {
				over: {
					show: true,
				},
			},
			positions: {
				doggy: {
					states: {
						front: {
							show: true,
						},
						under: {
							show: true,
						},
					},
				},
			},
		},
		fox: {
			states: {
				over: {
					show: true,
				},
			},
			positions: {
				doggy: {
					states: {
						front: {
							show: true,
						},
						under: {
							show: true,
						},
					},
				},
			},
		},
		harpy: {
			show: false,
		},
		hawk: {
			positions: {
				doggy: {
					states: {
						over: {
							show: true,
						},
					},
				},
			},
		},
		horse: {
			states: {
				over: {
					show: true,
				},
				under: {
					show: true,
				},
			},
		},
		lizard: {
			states: {
				over: {
					show: true,
				},
			},
			positions: {
				doggy: {
					states: {
						front: {
							show: true,
						},
						under: {
							show: true,
						},
					},
				},
			},
		},
		pig: {
			states: {
				over: {
					show: true,
					balls: true,
					drool: true,
				},
			},
			positions: {
				doggy: {
					states: {
						front: {
							show: true,
							balls: true,
						},
					},
				},
			},
		},
		spider: {
			show: false,
		},
		wolf: {
			states: {
				over: {
					show: true,
				},
			},
			positions: {
				doggy: {
					states: {
						front: {
							show: true,
						},
						under: {
							show: true,
						},
					},
				},
			},
		},
	},
};
