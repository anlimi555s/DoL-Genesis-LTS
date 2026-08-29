/**
 * Interpolates between two objects, obj1 and obj2, based on a given factor
 * If a property is a number and exists in both objects, it interpolates the values
 * The result includes all properties from both objects
 * Non-numeric properties and properties not shared between objects are copied as is
 *
 * @param {object} obj1 The first object
 * @param {object} obj2 The second object
 * @param {number} factor The interpolation factor (0 to 1).
 * @returns {object} A new object with interpolated number values and other properties from both obj1 and obj2
 */
function interpolateObject(obj1, obj2, factor) {
	const result = {};

	for (const key in obj1) {
		if (Object.hasOwn(obj1, key)) {
			if (typeof obj1[key] === "number" && Object.hasOwn(obj2, key) && typeof obj2[key] === "number") {
				result[key] = interpolate(obj1[key], obj2[key], factor);
			} else if (typeof obj1[key] === "object" && Object.hasOwn(obj2, key) && typeof obj2[key] === "object") {
				result[key] = interpolateObject(obj1[key], obj2[key], factor);
			} else {
				result[key] = obj1[key];
			}
		}
	}

	for (const key in obj2) {
		if (Object.hasOwn(obj2, key) && !Object.hasOwn(result, key)) {
			result[key] = obj2[key];
		}
	}
	return result;
}

window.interpolateObject = interpolateObject;

/**
 * Sigmoid function curve
 * https://www.desmos.com/calculator/pey4n8sm52
 *
 * @param {number} z Shifts the curve upward
 * @param {number} k Elongates the curve along the y axis
 * @param {number} b Signifies the severity of the curve or line (at 0)
 * @param {number} a Shifts the curve along the x axis
 * @param {number} x Input value
 */
function sigmoid(z, k, b, a, x) {
	const exp = a + b * x;
	const modifier = 1 + Math.E ** exp;
	const curve = k / modifier;
	return curve + z;
}
window.sigmoid = sigmoid;

/**
 * Linearly interpolates between two values based on a given factor
 *
 * @param {number} value1
 * @param {number} value2
 * @param {number} factor Interpolation factor (0 to 1)
 * @returns {number}
 */
function interpolate(value1, value2, factor) {
	return value1 + (value2 - value1) * factor;
}
window.interpolate = interpolate;

function lerp(percent, start, end) {
	return Math.clamp(start + (end - start) * percent, start, end);
}
window.lerp = lerp;

function inverseLerp(value, start, end) {
	return Math.clamp((value - start) / (end - start), 0, 1);
}
window.inverseLerp = inverseLerp;

function formatDecimals(value, decimalPlaces) {
	return Number(Math.round(parseFloat(value + "e" + decimalPlaces)) + "e-" + decimalPlaces);
}
window.formatDecimals = formatDecimals;

function nCr(n, r) {
	// https://stackoverflow.com/questions/11809502/which-is-better-way-to-calculate-ncr
	if (r > n - r) {
		// because C(n, r) == C(n, n - r)
		r = n - r;
	}

	let ans = 1;
	for (let i = 1; i <= r; ++i) {
		ans *= n - r + i;
		ans /= i;
	}

	return ans;
}
window.nCr = nCr;

/**
 * Checks if x is equal or higher than min and lower or equal to max
 *
 * @param {number} x
 * @param {any} min
 * @param {any} max
 * @param {boolean} notEquals defaults to false
 * @returns {boolean}
 */
function between(x, min, max, notEquals = false) {
	if (notEquals) return typeof x === "number" && x > min && x < max;
	return typeof x === "number" && x >= min && x <= max;
}
window.between = between;

/**
 * This function takes a value and weights it by exponential curve.
 *
 * Value should be between 0.0 and 1.0 (use normalise to get a percentage of a max).
 *
 * An exponent of 1.0 returns 1 every time.
 *
 * Exponents between 1.0 and 2.0 return a curve favouring higher results (closer to 1)
 *
 * An exponent of 2.0 will return a flat line distribution and is identical to random()
 *
 * Exponents greater than 2.0 return a curve favouring lower results (closer to 0), reaching to 0 at infinity.
 *
 * For example, see:
 * https://www.desmos.com/calculator/87hhrjfixi
 *
 * @param {number} value Value to be weighted
 * @param {number} exp Exponent used to generate the curve
 * @returns {number} value weighted against exponential curve
 */
function expCurve(value, exp) {
	return value ** exp / value;
}
window.expCurve = expCurve;

/**
 * This function creates a random float 0.0-1.0, weighted by exponential curve.
 *
 * A value of 1.0 returns 1 every time.
 *
 * Values between 1.0 and 2.0 return a curve favouring higher results (closer to 1)
 *
 * A value of 2.0 will return a flat line distribution and is identical to random()
 *
 * Values greater than 2.0 return a curve favouring lower results (closer to 0), reaching to 0 at infinity.
 *
 * For example, see:
 * https://www.desmos.com/calculator/87hhrjfixi
 *
 * @param {number} exp Exponent used to generate the curve
 * @returns {number} random number weighted against exponential curve
 */
function randomExp(exp) {
	return expCurve(State.random(), exp);
}
window.randomExp = randomExp;

/**
 * Normalises value to a decimal number 0.0-1.0, a percentage of the range specified in min and max.
 *
 * @param {number} value The value to be normalised
 * @param {number} max The highest value of the range
 * @param {number} min The lowest value of the range, default 0
 * @returns {number} Normalised value
 */
function normalise(value, max, min = 0) {
	const denominator = max - min;
	if (denominator === 0) {
		Errors.report("[normalise]: min and max params must be different.", { value, max, min });
		return 0;
	}
	if (denominator < 0) {
		Errors.report("[normalise]: max param must be greater than min param.", { value, max, min });
		return 0;
	}
	return Math.clamp((value - min) / denominator, 0, 1);
}
window.normalise = normalise;

/**
 * Returns a rounded number, with number of decimals based on the second parameter
 *
 * @param {number} number
 * @param {number} decimals
 * @returns {number} new number
 */
function round(number, decimals) {
	const multiplier = 10 ** decimals;
	return Math.round(number * multiplier) / multiplier;
}
window.round = round;

/**
 * Categorises a value into a specified number of categories based on its position within a given range.
 * The function automatically handles both ascending (min < max) and descending (min > max) ranges.
 *
 * @param {number} value The value to be categorized.
 * @param {number} min The start of the range.
 * @param {number} max The end of the range.
 * @param {number} parts The number of categories into which the range should be divided.
 * @returns {number} Returns the category index, ranging from 0 to parts-1.
 * Examples:
 *  categorise(15, 10, 20, 4);
 *  Result: 2
 *  Divides the range 10-20 into 4 parts, and 15 falls into the third part. (First part is 0)
 *
 *  categorise(15, 20, 10, 4);
 *  Result: 1
 *  Divides the range 20-10 into 4 parts, and 15 falls into the second part.
 *
 *  categorise(5, 0, 10, 5);
 *  Result: 0
 *  Divides the range 0-10 into 5 parts, and 5 falls right on the border of the first and second part but is rounded down.
 *
 *  categorise(18, 20, 10, 5);
 *  Result: 3
 *  Divides the range 20-10 into 5 parts, and 18 falls into the fourth part.
 */
function categorise(value, min, max, parts) {
	const normalised = normalise(value, Math.max(min, max), Math.min(min, max));
	const category = Math.floor(normalised * parts);
	return Math.clamp(min > max ? parts - 1 - category : category, 0, parts - 1);
}
window.categorise = categorise;

/**
 * Generates a random number within a specified range around a given base number.
 *
 * @param {number} num The base number.
 * @param {number} min The minimum offset subtracted from the base number.
 * @param {number} max The maximum offset added to the base number.
 * @param {PRNG} rngInstance RNG instance (new PRNG(seed)) to use instead of the default. Useful if you want to avoid advancing the global PRNG state, or have more control over the generated numbers.
 * @returns {number} A random number between `num - min` and `num + max`.
 */
function boundedRandom(num, min, max = min, rngInstance) {
	const result = rngInstance ? rngInstance.randomFloat(num - min, num + max) : randomFloat(num - min, num + max);
	return round(result, 2);
}
window.boundedRandom = boundedRandom;

/**
 * Generates a random integer based on chance and max value
 *
 * @param {number} chance Value between 0 and 1
 * @param {number} max Integer
 */
function calculateBinomial(chance, max) {
	let result = 0;
	for (let i = 0; i < max; i++) {
		if (State.random() < chance) {
			result++;
		}
	}
	return result;
}
window.calculateBinomial = calculateBinomial;

/**
 * Converts degrees to radians
 *
 * @param {number} deg Degrees
 */
function degToRad(deg) {
	return deg * (Math.PI / 100);
}
window.degToRad = degToRad;

/**
 * Normalise an angle (radians) into range 0..2PI.
 *
 * @param {number} angle
 * @returns {number}
 */
function normAngle(angle) {
	return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}
window.normAngle = normAngle;

/**
 * Smallest signed difference from current angle to target angle (target - current) in range -PI..PI.
 *
 * @param {number} target
 * @param {number} current
 * @returns {number}
 */
function shortestDelta(target, current) {
	let d = target - current;
	d = (d + Math.PI) % (2 * Math.PI);
	if (d < 0) d += 2 * Math.PI;
	return d - Math.PI;
}
window.shortestDelta = shortestDelta;

/**
 * Gets a random subset of items from an object
 *
 * @param {object} obj Object to copy from
 * @param {number} count Integer, how many random items to get
 */
function getRandomSubset(obj, count) {
	const copy = { ...obj };
	const keys = Object.keys(copy);
	let remaining = keys.length;

	for (let i = 0; remaining > count; i++) {
		const randIndex = random(i, keys.length - 1);
		delete copy[keys[randIndex]];
		[keys[i], keys[randIndex]] = [keys[randIndex], keys[i]]; // Swap
		remaining--;
	}

	return copy;
}
window.getRandomSubset = getRandomSubset;

/**
 * Compares two arrays to determine if they're equal, since comparing them directly doesn't work
 *
 * @param {Array} a first array to be compared
 * @param {Array} b second array to be compared
 */
function doArraysMatch(a, b) {
	if (!(a instanceof Array && b instanceof Array)) return false;
	if (a.length !== b.length) return false;

	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}

	return true;
}
window.doArraysMatch = doArraysMatch;

/**
 * Compares two arrays to determine how many matches are between them
 *
 * @param {Array} a first array to be compared
 * @param {any} b either second array to be compared or item to be compared
 */
function countMatchesInArray(a, b) {
	let match = 0;
	if (!(b instanceof Array)) {
		match += a.count(b);
	} else {
		for (let i = 0; i < a.length; i++) {
			if (b[0] instanceof Array) {
				match += b.count(a[i]);
			} else {
				match += doArraysMatch(a[i], b) ? 1 : 0;
			}
		}
	}
	return match;
}
window.countMatchesInArray = countMatchesInArray;

/**
 * @param {Array} a first array to be compared
 * @param {Array} b second array to be compared
 * @param {number} base whether to check one array, the other or both. `0` checks both arrays, `1` uses the first array as a base, `2` uses the second array as a base
 * @param {boolean} exclude whether to check inclusions or exclusions. `true` checks for exclusions
 * @returns {Array} an array containing either every element shared between arrays, or every element NOT shared between arrays
 */
function arrayIntersect(a, b, base = 0, exclude = false) {
	if (base === 1) {
		if (exclude) return [...new Set(a.filter(value => !b.includes(value)))];
		return [...new Set(a.filter(value => b.includes(value)))];
	} else if (base === 2) {
		if (exclude) return [...new Set(b.filter(value => !a.includes(value)))];
		return [...new Set(b.filter(value => a.includes(value)))];
	} else {
		if (exclude) return [...new Set(a.filter(value => !b.includes(value)).concat(b.filter(value => !a.includes(value))))];
		return [...new Set(a.filter(value => b.includes(value)).concat(b.filter(value => a.includes(value))))];
	}
}
window.arrayIntersect = arrayIntersect;

/**
 * Compares two arrays to determine how many nested arrays within them are identical
 *
 * @param {Array} a first array of arrays to be compared
 * @param {Array} b second array of arrays to be compared
 * @returns {number} the number of arrays that match between the two given arrays
 */
function countMatchesInNestedArray(a, b) {
	let match = 0;
	for (let i = 0; i < a.length; i++) {
		for (let o = 0; o < b.length; o++) {
			match += doArraysMatch(a[i], b[o]) ? 1 : 0;
		}
	}
	return match;
}
window.countMatchesInNestedArray = countMatchesInNestedArray;

/**
 * Performs math with all numbers of two arrays together
 *
 * @param {Array} a base array
 * @param {Array} b array to apply numbers to
 * @param {string} math type of math to do with each array
 */
function applyArrays(a, b, math = "addition") {
	if (!(a instanceof Array && b instanceof Array)) return null;
	if (a.length !== b.length || a.filter(x => typeof x !== "number").length || b.filter(x => typeof x !== "number").length) return null;
	const base = clone(a);
	for (let i = 0; i < a.length; i++) {
		switch (math) {
			case "addition":
				base[i] += b[i];
				break;
			case "subtraction":
				base[i] -= b[i];
				break;
			case "multiplication":
				base[i] *= b[i];
				break;
			case "division":
				base[i] /= b[i];
				break;
			case "remainder":
				base[i] %= b[i];
		}
	}
	return base;
}
window.applyArrays = applyArrays;

function bubbleSort(array, order = "descending") {
	let done = false;

	if (order === "ascending") {
		while (!done) {
			done = true;
			for (let i = 1; i < array.length; i++) {
				if (array[i - 1][1] > array[i][1]) {
					done = false;
					const tmp = array[i - 1];
					array[i - 1] = array[i];
					array[i] = tmp;
				}
			}
		}
	} else {
		while (!done) {
			done = true;
			for (let i = array.length - 1; i > 0; i--) {
				if (array[i - 1][1] < array[i][1]) {
					done = false;
					const tmp = array[i - 1];
					array[i - 1] = array[i];
					array[i] = tmp;
				}
			}
		}
	}

	return array;
}
window.bubbleSort = bubbleSort;

/**
 * Clamps all values in an array. Leaves non-number elements in arrays untouched
 *
 * @param {Array} array The array to clamp the values of
 * @param {number} lower The lower bound to clamp
 * @param {number} upper The higher bound to clamp
 * @returns {Array} The array with all values clamped
 */
function arrayClamp(array, lower, upper) {
	if (!(array instanceof Array)) return false;
	const output = [];
	for (let i = 0; i < array.length; i++) {
		if (typeof array[i] !== "number") output.push(array[i]);
		output.push(Math.clamp(array[i], lower, upper));
	}
	return output;
}
window.arrayClamp = arrayClamp;

/**
 * Returns an array with all elements converted to a specific variable type. For example, converting `["1", "2"]` into `[1, 2]` or vice versa. Does not mutate the original array
 *
 * @param {Array} a The array to convert
 * @param {string} convert The type of variable to convert the elements into
 * @returns {Array} an array with all variables changed to certain types
 */
function arrayConvert(a, convert) {
	const array = clone(a);
	for (let i = 0; i < array.length; i++) {
		switch (convert) {
			case "number":
				array[i] = Number(array[i]);
				break;
			case "string":
				array[i] = String(array[i]);
				break;
		}
	}
	return array;
}
window.arrayConvert = arrayConvert;
