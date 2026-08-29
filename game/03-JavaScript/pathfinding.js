/**
 * @param {Array} start The coordinates of the starting point
 * @param {Array} end The coordinates of the destination
 * @param {Array} obstacles An array of arrays, featuring all coordinates that contain obstacles
 * @param {Array} grid a 2D array of the grid being used
 * @returns {Array} An array featuring a path to navigate around obstacles from the starting point to the ending point, one step at a time
 */
function aStarMovement(start, end, obstacles, grid) {
	const path = aStar(start, end, obstacles, grid);

	if (path === null) return null;

	const movement = [];
	for (let i = 0; i < path.length - 1; i++) {
		movement.push(applyArrays(path[i + 1], path[i], "subtraction"));
	}

	return movement;
}
window.aStarMovement = aStarMovement;

/**
 * @param {Array} start The coordinates of the starting point
 * @param {Array} end The coordinates of the destination
 * @param {Array} obstacles An array of arrays, featuring all coordinates that contain obstacles
 * @param {Array} grid a 2D array of the grid being used
 * @returns {Array} An array featuring a path to navigate around obstacles from the starting point to the ending point, as a list of coordinates
 */
function aStar(start, end, obstacles, grid) {
	// Exception for lines that can pass through obstacles
	if (aStarPathIntersectsObstacle(start, end, obstacles, true) === 0) {
		const trueLine = aStarGetPath(start, end, true);
		aStarConsoleLine(trueLine, grid);
		return trueLine;
	}

	// Create an empty data structure to store the explored paths
	let explored = [];

	// Create a data structure to store the paths that are being explored
	const frontier = [
		{
			state: start,
			cost: 0,
			estimate: aStarHeuristic(start, end, obstacles),
		},
	];

	// While there are paths being explored
	while (frontier.length > 0) {
		// Sort the paths in the frontier by cost, with the lowest-cost paths first
		frontier.sort(function (a, b) {
			return a.estimate - b.estimate;
		});

		// Choose the lowest-cost path from the frontier
		const node = frontier.shift();

		// Add this node to the explored paths
		explored.push(node);
		// If this node reaches the goal, return thenode
		if (doArraysMatch(node.state, end)) {
			for (let e = explored.length - 1; e > 0; e--) {
				if (Math.abs(explored[e].state[0] - explored[e - 1].state[0]) + Math.abs(explored[e].state[1] - explored[e - 1].state[1]) > 1) {
					explored.deleteAt(e - 1);
				}
			}
			explored = explored.map(m => m.state);
			aStarConsoleLine(explored, grid);
			return explored;
		}

		// Generate the possible next steps from this node's state
		const next = aStarGenerateNextSteps(node.state, obstacles, grid);

		// For each possible next step
		for (let i = 0; i < next.length; i++) {
			// Calculate the cost of the next step by adding the step's cost to the node's cost
			const step = next[i];
			const cost = step.cost + node.cost;

			// Check if this step has already been explored
			const isExplored = explored.find(e => {
				return doArraysMatch(e.state, step.state);
			});

			// avoid repeated nodes during the calculation of neighbours
			const isFrontier = frontier.find(e => {
				return doArraysMatch(e.state, step.state);
			});

			// If this step has not been explored
			if (!isExplored && !isFrontier) {
				// Add the step to the frontier, using the cost and the heuristic function to estimate the total cost to reach the goal
				frontier.push({
					state: step.state,
					cost,
					estimate: cost + aStarHeuristic(step.state, end, obstacles),
				});
			}
		}
	}

	// If there are no paths left to explore, return null to indicate that the goal cannot be reached
	return null;
}
window.aStar = aStar;

/**
 * Outputs a grid in the browser console displaying the path chosen
 *
 * @param {Array} explored An array featuring a path to navigate around obstacles from the starting point to the ending point, as a list of coordinates
 * @param {Array} grid a 2D array of the grid being used
 */
function aStarConsoleLine(explored, grid) {
	if (!T.gridConsoleDisable && V.gridConsoleEnable) {
		const lineConsole = [];
		let pad = " x ";
		for (let x = 0; x < grid.length; x++) {
			lineConsole.push([]);
			for (let y = 0; y < grid.length; y++) {
				// Hardcoded for shop hunt
				pad = shopHuntIsHole([x, y]) ? "x_x" : "x x";
				if (countMatchesInArray(explored, [x, y]) > 0) {
					lineConsole[x].push(
						grid[x][y]
							.split(/(?=[A-Z])/)[0]
							.substring(0, 3)
							.padStart(3, pad)
							.toUpperCase()
					);
				} else {
					lineConsole[x].push(
						grid[x][y]
							.split(/(?=[A-Z])/)[0]
							.substring(0, 3)
							.padStart(3, pad)
					);
				}
			}
			console.log(lineConsole[x]);
		}
		console.log("----------------");
	}
}
window.aStarConsoleLine = aStarConsoleLine;

/**
 * @param {Array} start The coordinates of the starting point
 * @param {Array} obstacles An array of arrays, featuring all coordinates that contain obstacles
 * @param {Array} grid a 2D array of the grid being used
 * @returns {Array} An array of possible directions to go in from the current starting position, omitting directions blocked by obstacles
 */
function aStarGenerateNextSteps(start, obstacles, grid) {
	const next = [];

	const height = grid.length;
	const width = grid[0].length;

	if (start[0] > 0) {
		if (!aStarIsObstacle(obstacles, [start[0] - 1, start[1]])) {
			next.push({
				state: [start[0] - 1, start[1]],
				cost: 1,
			});
		}
	}
	if (start[0] < width - 1) {
		if (!aStarIsObstacle(obstacles, [start[0] + 1, start[1]])) {
			next.push({
				state: [start[0] + 1, start[1]],
				cost: 1,
			});
		}
	}
	if (start[1] > 0) {
		if (!aStarIsObstacle(obstacles, [start[0], start[1] - 1])) {
			next.push({
				state: [start[0], start[1] - 1],
				cost: 1,
			});
		}
	}
	if (start[1] < height - 1) {
		if (!aStarIsObstacle(obstacles, [start[0], start[1] + 1])) {
			next.push({
				state: [start[0], start[1] + 1],
				cost: 1,
			});
		}
	}
	return next;
}
window.aStarGenerateNextSteps = aStarGenerateNextSteps;

/**
 * @param {Array} start The coordinates of the starting point
 * @param {Array} end The coordinates of the destination
 * @param {Array} obstacles An array of arrays, featuring all coordinates that contain obstacles
 * @param {boolean} noPenalty Whether to ignore all obstacles when calculating distance or not. Defaults to false
 * @returns {number} A number calculating the distance from one tile in a 2D array to another, applying penalties for all obstacles the line passes through
 */
function aStarHeuristic(start, end, obstacles, noPenalty = false) {
	const dx = Math.abs(start[0] - end[0]);
	const dy = Math.abs(start[1] - end[1]);
	const penalty = noPenalty ? 0 : aStarPathIntersectsObstacle(start, end, obstacles) * 10;

	return Math.sqrt(dx ** 2 + dy ** 2) + penalty;
}
window.aStarHeuristic = aStarHeuristic;

/**
 * @param {Array} start The coordinates of the starting point
 * @param {Array} end The coordinates of the destination
 * @param {Array} obstacles An array of arrays, featuring all coordinates that contain obstacles
 * @param {boolean} full Whether to draw a full line, including steps up and down inclines, or to skip steps. Defaults to false to skip
 * @returns {Array} An array featuring all obstacles that would be within a path to navigate from one point to another
 */
function aStarPathIntersectsObstacle(start, end, obstacles, full = false) {
	const path = aStarGetPath(start, end, full);
	const instersections = countMatchesInNestedArray(path, obstacles);
	return instersections;
}
window.aStarPathIntersectsObstacle = aStarPathIntersectsObstacle;

/**
 * @param {Array} start The coordinates of the starting point
 * @param {Array} end The coordinates of the destination
 * @param {boolean} full Whether to draw a full line, including steps up and down inclines, or to skip steps. Defaults to false to skip
 * @returns {Array} An array featuring a path from the starting point to the ending point, as a list of coordinates
 */
function aStarGetPath(start, end, full = false) {
	let [x1, y1] = start;
	let [x2, y2] = end;

	let path = [];

	const isSteep = Math.abs(y2 - y1) > Math.abs(x2 - x1);
	if (isSteep) {
		[x1, y1] = [y1, x1];
		[x2, y2] = [y2, x2];
	}

	const isReversed = x1 > x2;
	if (isReversed) {
		[x1, x2] = [x2, x1];
		[y1, y2] = [y2, y1];
	}

	const deltax = x2 - x1;
	let error = Math.floor(deltax / 2);

	let y = y1;

	for (let x = x1; x <= x2; x++) {
		if (isSteep) {
			path.push([y, x]);
		} else {
			path.push([x, y]);
		}
		error -= Math.abs(y2 - y1);
		if (error < 0) {
			y += y1 < y2 ? 1 : -1;
			error += deltax;
			if (full) {
				if (isSteep) {
					path.push([y, x]);
				} else {
					path.push([x, y]);
				}
			}
		}
	}

	if (isReversed) {
		path = path.reverse();
	}

	for (let i = 0; i < path.length; i++) {
		if (!doArraysMatch(start, path[i])) {
			path.deleteAt(i);
			i--;
			continue;
		}
		break;
	}
	for (let i = path.length - 1; i >= 0; i--) {
		if (!doArraysMatch(end, path[i])) {
			path.deleteAt(i);
			continue;
		}
		break;
	}

	return path;
}
window.aStarGetPath = aStarGetPath;

/**
 * @param {*} obstacleList Where to generate obstacles from
 * @param {number} value The value at which obstacles are "passed through" or ignored. Defaults to 0, meaning no obstacles are ignored
 * @returns {Array} An array of arrays, featuring all coordinates that contain obstacles
 */
function aStarGetObstacles(obstacleList, value = 0) {
	// This is messy and hardcoded, I'm afraid. I only needed it to work for this specific thing, so that's all I made it work for
	if (typeof obstacleList === "string") {
		switch (obstacleList) {
			case "shopHunt":
				return shopHuntObstacles(value);
			default:
				return [];
		}
	} else {
		return [];
	}
}
window.aStarGetObstacles = aStarGetObstacles;

/**
 * @param {Array} coords The coordinates in a 2D array to check
 * @param {Array} obstacles An array of arrays, featuring all coordinates that contain obstacles
 * @returns {boolean} Whether the specified coordinate is an obstacle or not
 */
function aStarIsObstacle(coords, obstacles) {
	return countMatchesInArray(coords, obstacles) > 0;
}
window.aStarIsObstacle = aStarIsObstacle;
