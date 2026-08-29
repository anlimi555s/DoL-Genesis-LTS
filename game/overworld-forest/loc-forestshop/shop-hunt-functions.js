/**
 * Returns an array of coordinates of the specified location
 *
 * @param {string} loc Location to check the position of
 * @param {?string} direction Whether to check the location's offset coordinates or not. Defaults to no
 */
function shopHuntCoords(loc, direction = "here") {
	for (let x = 0; x < V.shopHuntMap.length; x++) {
		for (let y = 0; y < V.shopHuntMap.length; y++) {
			if (V.shopHuntMap[x][y] === loc) return applyArrays([x, y], shopHuntDirectionApply(direction), "addition");
		}
	}
}
window.shopHuntCoords = shopHuntCoords;

/**
 * Returns the location at the specified coordinates
 *
 * @param {Array} coords Two-length array, coordinates on the grid
 */
function shopHuntLoc(coords) {
	return V.shopHuntMap[coords[0]][coords[1]];
}
window.shopHuntLoc = shopHuntLoc;

/**
 * Returns whether the coordinates point a "hole", or a blank spot within the primary map border
 *
 * @param {Array} coords Two-length array, coordinates on the grid
 */
function shopHuntIsHole(coords) {
	return (
		V.shopHuntMap[coords[0]][coords[1]] === "" &&
		between(coords[0], V.shopHunt.borders.x[0], V.shopHunt.borders.x[1], true) &&
		between(coords[1], V.shopHunt.borders.y[0], V.shopHunt.borders.y[1], true)
	);
}
window.shopHuntIsHole = shopHuntIsHole;

/**
 * Returns an object of all locations the specified coordinates are bordering
 *
 * @param {string|Array} start The location to check the value of, either as an area name or as coordinates
 * @param {?string} special Whether to track holes/walls/the door
 */
function shopHuntBordering(start, special = false) {
	let coords = start;
	if (!(coords instanceof Array)) {
		if (!V.shopLocs.includes(coords)) coords = shopHuntFind(coords);
		coords = shopHuntCoords(coords);
	}
	const bordering = {};
	if (coords[0] !== 0 || special === "wall") {
		if (special === "wall" && (coords[0] === 0 || V.shopHuntMap[coords[0] - 1][coords[1]] === "")) {
			bordering.north = "wall";
		} else if (special === "noDoor" && V.shopHuntMap[coords[0] - 1][coords[1]] === V.shopHunt.shop.door.position) {
			// Do nothing
		} else if (special === "hole" && shopHuntIsHole([coords[0] - 1, coords[1]])) {
			bordering.north = "hole";
		} else if (V.shopHuntMap[coords[0] - 1][coords[1]] !== "" && (special !== "seen" || V.shopHunt.player.map[coords[0] - 1][coords[1]].seen === 2)) {
			bordering.north = V.shopHuntMap[coords[0] - 1][coords[1]];
		}
	}

	if (coords[0] !== V.shopHuntMap.length - 1 || special === "wall") {
		if (special === "wall" && (coords[0] === V.shopHuntMap.length - 1 || V.shopHuntMap[coords[0] + 1][coords[1]] === "")) {
			bordering.south = "wall";
		} else if (special === "noDoor" && V.shopHuntMap[coords[0] + 1][coords[1]] === V.shopHunt.shop.door.position) {
			// Do nothing
		} else if (special === "hole" && shopHuntIsHole([coords[0] + 1, coords[1]])) {
			bordering.south = "hole";
		} else if (V.shopHuntMap[coords[0] + 1][coords[1]] !== "" && (special !== "seen" || V.shopHunt.player.map[coords[0] + 1][coords[1]].seen === 2)) {
			bordering.south = V.shopHuntMap[coords[0] + 1][coords[1]];
		}
	}

	if (coords[1] !== 0 || special === "wall") {
		if (special === "wall" && (coords[1] === 0 || V.shopHuntMap[coords[0]][coords[1] - 1] === "")) {
			bordering.west = "wall";
		} else if (special === "noDoor" && V.shopHuntMap[coords[0]][coords[1] - 1] === V.shopHunt.shop.door.position) {
			// Do nothing
		} else if (special === "hole" && shopHuntIsHole([coords[0], coords[1] - 1])) {
			bordering.west = "hole";
		} else if (V.shopHuntMap[coords[0]][coords[1] - 1] !== "" && (special !== "seen" || V.shopHunt.player.map[coords[0]][coords[1] - 1].seen === 2)) {
			bordering.west = V.shopHuntMap[coords[0]][coords[1] - 1];
		}
	}

	if (coords[1] !== V.shopHuntMap.length - 1 || special === "wall") {
		if (special === "wall" && (coords[1] === V.shopHuntMap.length - 1 || V.shopHuntMap[coords[0]][coords[1] + 1] === "")) {
			bordering.east = "wall";
		} else if (special === "noDoor" && V.shopHuntMap[coords[0]][coords[1] + 1] === V.shopHunt.shop.door.position) {
			// Do nothing
		} else if (special === "hole" && shopHuntIsHole([coords[0], coords[1] + 1])) {
			bordering.east = "hole";
		} else if (V.shopHuntMap[coords[0]][coords[1] + 1] !== "" && (special !== "seen" || V.shopHunt.player.map[coords[0]][coords[1] + 1].seen === 2)) {
			bordering.east = V.shopHuntMap[coords[0]][coords[1] + 1];
		}
	}

	return bordering;
}
window.shopHuntBordering = shopHuntBordering;

/**
 * Returns the location of the specified target
 *
 * @param {string|number} toFind Participant to find the location of
 */
function shopHuntFind(toFind) {
	if (typeof toFind === "number" && (!V.shopHunt.actors[toFind] || !V.shopHunt.actors[toFind].state)) return null;
	let focus = toFind;
	if (typeof focus === "number") return shopHuntLoc(V.shopHunt.actors[focus].position);
	if (typeof focus === "string") focus = focus.toLowerCase();
	switch (focus) {
		case "player":
			return shopHuntLoc(V.shopHunt.player.position);
		case "key":
		case "mirror":
			return V.shopHunt.item[focus];
		case "door":
			return V.shopHunt.shop.door.position;
		default:
			if (V.shopHunt.actors.map(x => x.type).includes(focus)) return shopHuntLoc(V.shopHunt.actors.find(x => x.type === focus).position);
			return null;
	}
}
window.shopHuntFind = shopHuntFind;

/**
 * Returns an array with every location populated by a mannequin
 *
 * @param {?string} state Optional argument to only count mannequins matching this state
 */
function shopHuntMannequinLocs(state = false) {
	const manLocs = [];
	const mannequins = V.shopHunt.actors.filter(x => x.type === "mannequin" && ((!state && !!x.state) || x.state === state));
	for (let i = 0; i < mannequins.length; i++) {
		manLocs[i] = shopHuntLoc(mannequins[i].position);
	}
	return manLocs;
}
window.shopHuntMannequinLocs = shopHuntMannequinLocs;

/**
 * Returns an array of every notable participant or element in the specified location
 *
 * @param {string} loc Location to check
 */
function shopHuntContains(loc) {
	const contains = [];
	const toCompare = shopHuntCoords(loc);
	if (doArraysMatch(toCompare, V.shopHunt.player.position)) contains.push("player");
	for (let i = 0; i < V.shopHunt.actors.length; i++) {
		if (doArraysMatch(toCompare, V.shopHunt.actors[i].position) && !!V.shopHunt.actors[i].state) contains.push(V.shopHunt.actors[i].id);
	}
	Object.keys(V.shopHunt.item).forEach(x => {
		if (loc === V.shopHunt.item[x]) contains.push(x);
	});
	if (loc === V.shopHunt.shop.door) contains.push("door");

	return contains;
}
window.shopHuntContains = shopHuntContains;

/**
 * Returns an array of every notable participant or element in the specified location
 *
 * @param {string} loc Location to check
 */
function shopHuntContainsDefeated(loc) {
	const contains = [];
	const toCompare = shopHuntCoords(loc);
	for (let i = 0; i < V.shopHunt.actors.length; i++) {
		if (doArraysMatch(toCompare, V.shopHunt.actors[i].position) && V.shopHunt.actors[i].state === null) contains.push(V.shopHunt.actors[i].id);
	}

	return contains;
}
window.shopHuntContainsDefeated = shopHuntContainsDefeated;

/**
 * Returns an array of all areas that are not occupied by the player, actors or special items
 */
function shopHuntEmpty() {
	const emptyLocs = [];
	for (let x = 0; x < V.shopHuntMap.length; x++) {
		for (let y = 0; y < V.shopHuntMap.length; y++) {
			if (V.shopHuntMap[x][y] !== "" && shopHuntContains(V.shopHuntMap[x][y]).length === 0) emptyLocs.push(V.shopHuntMap[x][y]);
		}
	}
	return emptyLocs;
}
window.shopHuntEmpty = shopHuntEmpty;

/**
 * Returns an array of all areas that are not bordered on all four sides, not counting holes as empty space
 *
 * @param {?boolean} empty Whether or not only empty
 */
function shopHuntWalls(empty = false) {
	const walls = [];
	for (let x = 0; x < V.shopHuntMap.length; x++) {
		for (let y = 0; y < V.shopHuntMap.length; y++) {
			if (
				V.shopHuntMap[x][y] !== "" &&
				Object.values(shopHuntBordering([x, y], "hole")).length < 4 &&
				(!empty || shopHuntContains(V.shopHuntMap[x][y]).length === 0)
			)
				walls.push(V.shopHuntMap[x][y]);
		}
	}
	return walls;
}
window.shopHuntWalls = shopHuntWalls;

/**
 * Returns a list of all obstacles
 *
 * @param {?number} value The category of obstacle, used for determining what actors can pass through them
 */
function shopHuntObstacles(value = 0) {
	const obstacles = [];
	for (let x = 0; x < V.shopHuntMap.length; x++) {
		for (let y = 0; y < V.shopHuntMap.length; y++) {
			if (V.shopHuntMap[x][y] === "" && value < -~!shopHuntIsHole([x, y])) {
				obstacles.push([x, y]);
			}
		}
	}
	return obstacles;
}
window.shopHuntObstacles = shopHuntObstacles;

/**
 * Returns a proper location name based on argument
 *
 * @param {string} loc Location to check
 * @param  {...any} args Variations
 * @returns {string} A word/name fit for prose
 */
function shopHuntLocName(loc, ...args) {
	let name = loc
		.split(/(?=[A-Z])/)
		.join(" ")
		.toLowerCase();

	if (V.shopHunt.locations[loc].state.includes("fallen")) name = ["fallen", ...name.split(" ").slice(1)].join(" ");

	if (args.includes("simple")) {
		name = name.split(" ").slice(1).join(" ");
	} else if (args.includes("sound")) {
		/* Below is only designed to work with "creaky cabinet" and "squeaky rotating rack". Update if other noisy locations are added */
		name = name.split(" ")[0].slice(0, -1);
	}

	if (args.includes("cap")) name = name.toUpperFirst();

	return name;
}
window.shopHuntLocName = shopHuntLocName;
DefineMacroS("shopHuntLocName", shopHuntLocName);

/**
 * Returns a capitalised location name based on argument
 * Required because some contexts don't allow for the "cap" argument, it needs to be an entirely separate function
 *
 * @param {string} loc Location to check
 * @returns {string} A capitalised name fit for prose
 */
function shopHuntLocNameCap(loc) {
	return shopHuntLocName(loc.split("_")[0], "cap");
}
window.shopHuntLocNameCap = shopHuntLocNameCap;

/**
 * Returns all items in the specified location
 *
 * @param {string} loc the location in the shop to check for items
 * @param {?boolean} list whether to output a formatting string or an array, defaults to array
 * @returns {string|Array}
 */
function shopHuntItemsPresent(loc, list = false) {
	const items = arrayIntersect(shopHuntContains(loc), Object.keys(V.shopHunt.item));
	if (list) return formatList(items, "and", true);
	return items;
}
window.shopHuntItemsPresent = shopHuntItemsPresent;
DefineMacroS("shopHuntItemsPresent", shopHuntItemsPresent);

/**
 * @returns {Array} every location the player has searched
 */
function shopHuntLocsSearched() {
	const searched = [];
	for (let x = 0; x < V.shopHuntMap.length; x++) {
		for (let y = 0; y < V.shopHuntMap.length; y++) {
			if (V.shopHunt.player.map[x][y].searched) {
				searched.push(shopHuntLoc([x, y]));
			}
		}
	}
	return searched;
}
window.shopHuntLocsSearched = shopHuntLocsSearched;

/**
 * Updates what areas of the map the player has seen based on location
 *
 * @param {string|Array} loc The area to update. Defaults to player location
 */
function shopHuntSeeLoc(loc = shopHuntFind("player")) {
	const coords = loc instanceof Array ? loc : shopHuntCoords(loc);
	V.shopHunt.player.map[coords[0]][coords[1]].seen = 2;
	if (coords[0] !== 0 && !V.shopHunt.player.map[coords[0] - 1][coords[1]].seen) {
		V.shopHunt.player.map[coords[0] - 1][coords[1]].seen = 1;
	}

	if (coords[0] !== V.shopHuntMap.length - 1 && !V.shopHunt.player.map[coords[0] + 1][coords[1]].seen) {
		V.shopHunt.player.map[coords[0] + 1][coords[1]].seen = 1;
	}

	if (coords[1] !== 0 && !V.shopHunt.player.map[coords[0]][coords[1] - 1].seen) {
		V.shopHunt.player.map[coords[0]][coords[1] - 1].seen = 1;
	}

	if (coords[1] !== V.shopHuntMap.length - 1 && !V.shopHunt.player.map[coords[0]][coords[1] + 1].seen) {
		V.shopHunt.player.map[coords[0]][coords[1] + 1].seen = 1;
	}
}
window.shopHuntSeeLoc = shopHuntSeeLoc;

/**
 * @param {?number} seen The value of `.seen` to check for, defaults to 1
 * @returns {Array} a grid of all the areas the player has seen, with either location name, "wall" or null
 */
function shopHuntPlayerKnownMap(seen = 1) {
	const map = { xBorder: [], yBorder: [], tiles: [] };

	for (let x = 0; x < V.shopHuntMap.length; x++) {
		if (V.shopHunt.player.map[x].map(i => i.seen >= seen).count(false) < V.shopHuntMap.length) map.xBorder.push(x);
		if (V.shopHunt.player.map.map(i => i[x].seen >= seen).count(false) < V.shopHuntMap.length) map.yBorder.push(x);
	}

	map.xBorder = [map.xBorder[0]].concat([map.xBorder[map.xBorder.length - 1]]);
	map.yBorder = [map.yBorder[0]].concat([map.yBorder[map.yBorder.length - 1]]);

	for (let x = 0; x <= Math.abs(map.xBorder[0] - Math.abs(map.xBorder[1])); x++) {
		map.tiles.push([]);
		for (let y = 0; y <= Math.abs(map.yBorder[0] - Math.abs(map.yBorder[1])); y++) {
			if (V.shopHunt.player.map[x + map.xBorder[0]][y + map.yBorder[0]].seen >= seen) {
				if (V.shopHuntMap[x + map.xBorder[0]][y + map.yBorder[0]] === "") {
					map.tiles[x].push("wall");
				} else {
					map.tiles[x].push(V.shopHuntMap[x + map.xBorder[0]][y + map.yBorder[0]]);
				}
			} else {
				map.tiles[x].push(null);
			}
		}
	}

	return map;
}
window.shopHuntPlayerKnownMap = shopHuntPlayerKnownMap;

/**
 * @param {string|Array} loc The location to check the value of, either as an area name or as coordinates
 * @param {string} direction Whether to check the seen value of a location offset to the first argument or not. Defaults to no
 * @returns {number} The `$shopHunt.player.map`[x][y]`.seen` value for the coordinates specified
 */
function shopHuntSeenValue(loc, direction = "here") {
	let coords = typeof loc === "string" ? shopHuntCoords(loc) : loc;
	coords = applyArrays(coords, shopHuntDirectionApply(direction), "addition");
	return V.shopHunt.player.map[coords[0]][coords[1]].seen;
}
window.shopHuntSeenValue = shopHuntSeenValue;

/**
 * Moves the player to the specified location. Intended to be used for the visual map
 *
 * @param {string} moveTo The area to move to
 */
function shopHuntMapMove(moveTo) {
	const bordering = shopHuntBordering(shopHuntCoords(shopHuntFind("player")));

	if (Object.values(bordering).includes(moveTo) || V.debug) {
		wikifier("shopHuntAction", "move", Object.keys(bordering)[Object.values(bordering).indexOf(moveTo)]);
		Engine.play(V.passage);
	}
}
window.shopHuntMapMove = shopHuntMapMove;

/**
 * @param {"here"|"north"|"south"|"west"|"east"|"northwest"|"northeast"|"southwest"|"southeast"} direction The cardinal direction to get the vector of
 * @returns {Array} an array with the movement vector for the specified direction
 */
function shopHuntDirectionApply(direction) {
	return [
		[0, 0],
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1],
		[-1, -1],
		[-1, 1],
		[1, -1],
		[1, 1],
	][["here", "north", "south", "west", "east", "northwest", "northeast", "southwest", "southeast"].indexOf(direction)];
}
window.shopHuntDirectionApply = shopHuntDirectionApply;

/**
 * @param {Array} movement The vector to get the cardinal direction of
 * @returns {string} the cardinal direction for the specified vector
 */
function shopHuntDirectionGet(movement) {
	return ["here", "north", "south", "west", "east", "northwest", "northeast", "southwest", "southeast"][
		["0,0", "-1,0", "1,0", "0,-1", "0,1", "-1,-1", "-1,1", "1,-1", "1,1"].indexOf(String(movement))
	];
}
window.shopHuntDirectionGet = shopHuntDirectionGet;

/**
 * @param {string|Array} coords The location to check the value of, either as an area name or as coordinates
 * @param {"north"|"south"|"west"|"east"|"northwest"|"northeast"|"southwest"|"southeast"} direction Direction for the line to go to
 * @param {?boolean} full Whether to return an array of all coordinates within the line or just the end coordinates, defaults to just the end coordinates
 * @returns {Array} Coordinates of the first wall in the direction specified
 */
function shopHuntUntilWall(coords, direction, full = false) {
	if (direction === "here") return null;
	let end = coords;
	if (!(end instanceof Array)) {
		if (!V.shopLocs.includes(end)) end = shopHuntFind(end);
		end = shopHuntCoords(end);
	}
	const apply = shopHuntDirectionApply(direction);
	const line = [end];

	while (shopHuntBordering(end, "wall")[direction] !== "wall") {
		end = applyArrays(end, apply);
		line.pushUnique(end);
	}

	if (full) return line;
	return end;
}
window.shopHuntUntilWall = shopHuntUntilWall;

/**
 * @param {?Array} focus List of attributes in the history to count
 * @returns {number} The number of turns the player has been 'camping' in the same area taking the same action
 */
function shopHuntCampingCount(focus = ["position", "action", "hide"]) {
	const history = V.shopHunt.player.history.map(x => [
		focus.includes("position") ? x.position.join() : null,
		focus.includes("action") ? x.action : null,
		focus.includes("hide") ? x.hide : null,
	]);

	for (let camp = 1; camp < history.length; camp++) {
		if (!doArraysMatch(history[camp], history[camp - 1])) return camp;
	}
	return history.length;
}
window.shopHuntCampingCount = shopHuntCampingCount;

/**
 * @param {string} start The specified location to get the distances from other locations of
 * @param {?string} sort Whether to sort by distance in turns necessary to get there, heuristic distance, or a combination of both. Defaults to both
 * @param {?string} order The order to sort in, ascending or descending. Defaults to descending
 * @param {?boolean} here Whether to include the specified location
 * @returns {Array} All locations sorted in distance to the specified location
 */
function shopHuntLocationsByDistance(start, sort = "both", order = "descending", here = false) {
	T.gridConsoleDisable = true;
	let loc = start;
	if (loc instanceof Array) {
		if (!V.shopLocs.includes(shopHuntLoc(loc))) throw new Error("shopHuntLocationsByDistance error: argument 0 is not array that points to valid location");
		loc = shopHuntLoc(loc);
	} else if (!V.shopLocs.includes(loc)) loc = shopHuntFind(loc);
	const locs = V.shopLocs.filter(x => x !== loc || here).shuffle();

	let list = [];

	if (sort === "steps") {
		for (let i = 0; i < locs.length; i++) {
			list.push([locs[i], aStar(shopHuntCoords(loc), shopHuntCoords(locs[i]), aStarGetObstacles("shopHunt"), V.shopHuntMap).length]);
		}
	} else if (sort === "heuristic") {
		for (let i = 0; i < locs.length; i++) {
			list.push([locs[i], aStarHeuristic(shopHuntCoords(loc), shopHuntCoords(locs[i]), aStarGetObstacles("shopHunt"), true)]);
		}
	} else {
		for (let i = 0; i < locs.length; i++) {
			list.push([
				locs[i],
				aStar(shopHuntCoords(loc), shopHuntCoords(locs[i]), aStarGetObstacles("shopHunt"), V.shopHuntMap).length +
					aStarHeuristic(shopHuntCoords(loc), shopHuntCoords(locs[i]), aStarGetObstacles("shopHunt"), true) * 0.1,
			]);
		}
	}

	list = bubbleSort(list, order);

	T.gridConsoleDisable = false;
	return list;
}
window.shopHuntLocationsByDistance = shopHuntLocationsByDistance;

/**
 * @param {string} property Whether to return a list of properties of the actors, rather than the entire objects
 * @param {?string} role The role to filter actors on. Defaults to all actors regardless of role
 * @param {?string} loc The location to check. Defaults to the player's current location
 * @returns {Array} a list of all actors, or the properties of all actors, in the location
 */
function shopHuntActorsPresent(property = false, role = "any", loc = shopHuntFind("player")) {
	let actors = V.shopHunt.actors.filter(x => doArraysMatch(x.position, shopHuntCoords(loc)) && x.type !== "nobody" && !!x.state);
	if (role !== "any") actors = actors.filter(x => x.role === role);
	if (property) {
		const filteredActors = actors.map(x => x[property]);
		if (property === "name") return [...new Set(filteredActors)];
		return filteredActors;
	}
	return actors;
}
window.shopHuntActorsPresent = shopHuntActorsPresent;

/**
 * @returns {object} An object of all footsteps the player heard, sorted by cardinal direction
 */
function shopHuntFootstepsHeard() {
	let range = 2;
	let closeRange = 2;
	if (V.shopHunt.actors.find(x => x.type === "gwylan")?.role === "enemy" && V.shopHunt.context !== "game") range -= 0.5;
	if (hasSharpSenses("hearing")) range++;
	if (V.shopHunt.player.hide === 4 && T.loc.special.includes("inside")) {
		range--;
		closeRange = 1.5;
	}

	const locs = shopHuntLocationsByDistance(shopHuntFind("player"), "heuristic", "ascending", closeRange === 1.5)
		.filter(x => x[1] <= range || x[0] === shopHuntFind(V.shopHunt.actors.find(y => y.type === "elkspawn")?.id))
		.map(x => x[0]);
	const locRanges = shopHuntLocationsByDistance(shopHuntFind("player"), "heuristic", "ascending", closeRange === 1.5)
		.filter(x => x[1] <= range || x[0] === shopHuntFind(V.shopHunt.actors.find(y => y.type === "elkspawn")?.id))
		.map(x => x[1]);

	const sound = {
		here: { close: [], distant: [] },
		north: { close: [], distant: [] },
		northwest: { close: [], distant: [] },
		northeast: { close: [], distant: [] },
		west: { close: [], distant: [] },
		east: { close: [], distant: [] },
		southwest: { close: [], distant: [] },
		southeast: { close: [], distant: [] },
		south: { close: [], distant: [] },
	};

	for (let i = 0; i < locs.length; i++) {
		const moved = [];
		Object.keys(T.actorMoved)
			.filter(x => !!shopHuntActorMakesFootsteps(Number(x)))
			.forEach(x => {
				moved.push(Number(x));
			});
		const footsteps = arrayIntersect(moved, shopHuntContains(locs[i]));
		if (footsteps.length >= 1) {
			const direction = shopHuntRelativeDirection(shopHuntFind("player"), locs[i]);
			sound[direction].close = sound[direction].close.concat(footsteps.filter(x => locRanges[locs.indexOf(shopHuntFind(x))] <= closeRange));
			if (closeRange === 2)
				sound[direction].distant = sound[direction].distant.concat(footsteps.filter(x => locRanges[locs.indexOf(shopHuntFind(x))] > closeRange));
		}
	}

	if (hasSharpSenses("instincts")) {
		const scentLocs = shopHuntLocationsByDistance(shopHuntFind("player"), "heuristic", "ascending")
			.filter(x => x[1] <= 2)
			.map(x => x[0]);
		if (T.gwylanStatus.includes("heat") && scentLocs.includes(shopHuntFind("gwylan")))
			T.shopHuntScent.gwylan = scentLocs.find(x => x === shopHuntFind("gwylan"));
		if (V.shopHunt.actors.find(x => x.type === "eden")?.role === "ally" && scentLocs.includes(shopHuntFind("eden")))
			T.shopHuntScent.eden = scentLocs.find(x => x === shopHuntFind("eden"));
	}

	return sound;
}
window.shopHuntFootstepsHeard = shopHuntFootstepsHeard;

/**
 * @param {number} id The actor to check the footsteps of
 * @returns {boolean|string} Whether a given actor makes footsteps, based on type and context. Special contexts will give special string outputs, but the output will remain truthy
 */
function shopHuntActorMakesFootsteps(id) {
	const actor = V.shopHunt.actors[id];
	const feet = actor.footsteps;

	if (feet === 0) return false;

	if (actor.state === "rush") return "rush";

	if (actor.type === "mannequin") return actor.role === "neutral" ? "vague" : true;
	if (actor.type === "eden") return actor.role === "enemy";

	if (feet === 2) return true;
	return false;
}
window.shopHuntActorMakesFootsteps = shopHuntActorMakesFootsteps;

/**
 * @param {string} start The starting location to check
 * @param {string} end The ending location to check
 * @returns {string} The cardinal direction that the ending location is relative to the starting location
 */
function shopHuntRelativeDirection(start, end) {
	const a = typeof end === "string" ? shopHuntCoords(end) : end;
	const b = typeof start === "string" ? shopHuntCoords(start) : start;
	return shopHuntDirectionGet(arrayClamp(applyArrays(a, b, "subtraction"), -1, 1));
}
window.shopHuntRelativeDirection = shopHuntRelativeDirection;

/**
 *
 * @param {Array|string} start The starting location to check, as either a string or an array of coordinates
 * @param {?boolean} diagonal Whether count tiles diagonally adjacent to the starting space
 * @returns {Array} An array of all locations, and relevant elements such as actors, items or the player, within "line of sight" of the starting location
 */
function shopHuntLineOfSight(start, diagonal = false) {
	let coords = start;
	if (!(coords instanceof Array)) {
		if (!V.shopLocs.includes(coords)) coords = shopHuntFind(coords);
		coords = shopHuntCoords(coords);
	}

	let vision = [];
	let seen = [];

	vision = vision.concat(shopHuntUntilWall(coords, "north", true));
	vision = vision.concat(shopHuntUntilWall(coords, "south", true));
	vision = vision.concat(shopHuntUntilWall(coords, "east", true));
	vision = vision.concat(shopHuntUntilWall(coords, "west", true));

	if (diagonal) {
		if (coords[0] !== 0 && coords[1] !== 0) vision.push([coords[0] - 1, coords[1] - 1]);
		if (coords[0] !== V.shopHuntMap.length - 1 && coords[1] !== 0) vision.push([coords[0] + 1, coords[1] - 1]);
		if (coords[0] !== 0 && coords[1] !== V.shopHuntMap.length - 1) vision.push([coords[0] - 1, coords[1] + 1]);
		if (coords[0] !== V.shopHuntMap.length - 1 && coords[1] !== V.shopHuntMap.length - 1) vision.push([coords[0] + 1, coords[1] + 1]);
	}

	for (let i = 0; i < vision.length; i++) {
		seen.pushUnique(shopHuntLoc(vision[i]));
		seen = seen.concatUnique(shopHuntContains(shopHuntLoc(vision[i])));
	}

	return seen;
}
window.shopHuntLineOfSight = shopHuntLineOfSight;

/**
 * Checks whether an actor can find/has found the player if they're hiding
 *
 * @param {number} id The actor id
 * @param {string} loc The location the actor is checking
 * @param {?boolean} result Whether to directly alter `$actorFound` or return a true/false. Defaults to altering `$actorFound`
 */
function shopHuntCheckHide(id, loc, result = false) {
	let foundPlayer = false;
	if (loc === T.locRaw) {
		if (shopHuntFind(id) === loc) {
			if (V.shopHunt.player.hide === 4) {
				if (
					T.loc.special.includes("hat") &&
					V.shopHunt.actors[id].seen.includes("hatHide") &&
					!["mannequin", "nobody"].includes(V.shopHunt.actors[id].type)
				)
					foundPlayer = true;
			} else {
				const hideChance = [0, 2, 5, 8][V.shopHunt.player.hide];
				if (random(1, 10) > hideChance) foundPlayer = true;
			}
		} else {
			if (V.shopHunt.player.hide === 0) foundPlayer = true;
		}
	}

	if (result) return foundPlayer;
	if (foundPlayer) V.actorFound[id][T.locRaw].pushUnique("player");
}
window.shopHuntCheckHide = shopHuntCheckHide;

/**
 * @param {number|string} focus What the player is looking for. Can be an actor's ID, an actor's type (won't work with mannequins) or a location
 * @returns {boolean} whether or not the player can see the location specified from where they are
 */
function shopHuntWithinPlayerSight(focus) {
	if (
		(V.shopHunt.player.hide === 4 && T.loc.special.includes("inside")) ||
		(typeof focus === "number" && (focus >= V.shopHunt.actors.length || !V.shopHunt.actors[focus].state))
	)
		return false;

	let target = clone(focus);
	if (typeof target === "number") target = shopHuntLoc(V.shopHunt.actors[focus].position);
	else if (!V.shopLocs.includes(target)) target = shopHuntFind(target);

	if (T.locRaw === target || Object.values(T.bordering).includes(target)) return true;
	return false;
}
window.shopHuntWithinPlayerSight = shopHuntWithinPlayerSight;

/**
 * @param {number} actor The actor id
 * @param {?boolean} flip Whether to flip the colors, so it returns green for enemies, etc. Defaults to false
 * @returns {string} an appropriate color for the actor specified, based on their role
 */
function shopHuntActorColor(actor, flip = false) {
	const colors = ["red", "blue", "green"];
	if (flip) colors.reverse();

	const index = ["enemy", "neutral", "ally"].indexOf(V.shopHunt.actors[actor].role);

	return colors[index];
}
window.shopHuntActorColor = shopHuntActorColor;
