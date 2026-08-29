/* globals orphanagePlotsPlanted orphanagePlotsWatered */
/* Time namespace
	Use Time prefix when accessing any getters or functions (e.g. Time.second, Time.schoolDay, or Time.getLastDayOfMonth(), etc.)
	Getters: (Most of these are being used in one way or another)

	Time.date - Returns Date object of current date.

	Time.holidayMonths - Returns array of all months that are considered holidays.

	Time.second - Returns current number of seconds since last whole minute.

	Time.minute - Returns current number of minutes since last whole hour.

	Time.hour - Returns current hour of the day.

	Time.weekDay - previously $weekday - Returns day of the week (1 being sunday, 7 being saturday)

	Time.weekDayName - Returns the day of the week, with first letter in uppercase. (e.g. Monday)

	Time.monthDay - Returns current date - (e.g. 12 if its the 12th)

	Time.month - previously $month - Returns current month of the year (1 being january, 12 being december)

	Time.monthName - Returns name of the current month, with first letter in uppercase. (e.g. January)

	Time.year - Returns current year

	Time.days - Returns total number of days since game start. (starts at 0)

	Time.season - Previously $season - Returns string of current season (e.g. "winter")

	Time.startDate - Returns Date object of start date

	Time.tomorrow - Returns Date object of day after today

	Time.yesterday - Returns Date object of day before today

	Time.schoolTerm - Returns true if current day is during a school term and false if a holiday.

	Time.schoolDay - Returns true if current day is a school day and false otherwise

	Time.schoolTime - Returns true if current time is between 8-15 and is a school day

	Time.dayState - previously $daystate - Returns string of day state (e.g. "dawn", or "day")

	Time.nextSchoolTermStartDate - Returns date object of the day when the next school term starts

	Time.nextSchoolTermEndDate - Returns date object of the day when the current school term ends

*/

const Time = (() => {
	const moonPhases = {
		new: {
			start: 0,
			end: 0.03,
			endAlt: 1,
			description: "New Moon",
		},
		waxingCrescent: {
			start: 0.03,
			end: 0.22,
			description: "Waxing Crescent",
		},
		firstQuarter: {
			start: 0.22,
			end: 0.28,
			description: "First Quarter",
		},
		waxingGibbous: {
			start: 0.28,
			end: 0.47,
			description: "Waxing Gibbous",
		},
		full: {
			start: 0.47,
			end: 0.53,
			description: "Full Moon",
		},
		waningGibbous: {
			start: 0.53,
			end: 0.72,
			description: "Waning Gibbous",
		},
		lastQuarter: {
			start: 0.72,
			end: 0.78,
			description: "Last Quarter",
		},
		waningCrescent: {
			start: 0.78,
			end: 0.97,
			description: "Waning Crescent",
		},
	};
	const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	const holidayMonths = [4, 7, 8, 12];

	/* Oxygen recovery duration in seconds. TODO: Move this constant when player stats are refactored */
	const oxygenResaturationDuration = 480;

	let currentDate = {};

	function set(time = V.timeStamp) {
		V.startDate ??= new DateTime(2022, 9, 4, 7).timeStamp;

		if (time instanceof DateTime) {
			currentDate = time;
			V.timeStamp = time.timeStamp - V.startDate;
		} else {
			currentDate = new DateTime(V.startDate + time);
			V.timeStamp = time;
		}
	}
	/*
	 * Changes date without "passing time"
	 *
	 * Consider using the timeTravel() function instead if you are making a large (1 month+) change to the date to prevent
	 * too many weather / fog keypoints from generating due to the large gap in time.
	 */
	function setDate(date) {
		set(date.timeStamp - V.startDate);
	}

	function setTime(hour, minute) {
		setDate(new DateTime(currentDate.year, currentDate.month, currentDate.day, hour || 0, minute || 0));
	}

	function setTimeRelative(hour, minute) {
		setDate(new DateTime(currentDate.year, currentDate.month, currentDate.day, currentDate.hour + (hour || 0), currentDate.minute + (minute || 0)));
	}

	/**
	 *
	 * Pass X amount of seconds, executing code after reaching certain thresholds.
	 * Checks for: year, week, day, hour, minute, dawn, noon.
	 *
	 * @param {number} seconds
	 */
	function pass(seconds) {
		if (seconds < 0) return;

		V.timeMessages ||= [];

		const prevDate = new DateTime(currentDate);
		const minutes = Math.floor((prevDate.second + seconds) / 60);
		const hours = Math.floor((prevDate.minute + minutes) / 60);
		const days = Math.floor((prevDate.hour + hours) / 24);

		try {
			// it is safe to let secondPassed handle all seconds at once
			secondPassed(seconds);

			// the pyramid. pass minutes until next hour, then next hour might affect some stats affecting things in minutePassed, so pass hours until next day, then pass the day, then pass the rest of the hours, then minutes
			const minsToNextHour = 60 - prevDate.minute;
			if (minutes < minsToNextHour) {
				minutePassed(minutes);
			} else {
				minutePassed(minsToNextHour);
				// temporarily update Time with just enough accuracy to be useful in hourPassed
				set(V.timeStamp + minsToNextHour * 60);
				const hoursToNextDay = 24 - prevDate.hour;
				if (hours < hoursToNextDay) {
					hourPassed(hours);
				} else {
					hourPassed(hoursToNextDay);
					// todo: maybe do it in a better order than week -> day -> year
					for (let day = 0; day < days; ++day) {
						if (day !== 0) {
							// we're here for a long haul, give pc some rest
							statChange.tiredness(-120);
							hourPassed(24);
							statChange.tiredness(-120);
						}
						if (prevDate.weekDay === 7 && currentDate.weekDay === 1) weekPassed();
						dayPassed(days);
						if (prevDate.month === currentDate.month - 1) monthPassed();
						if (prevDate.yearDay < Time.startDate.yearDay && currentDate.yearDay >= Time.startDate.yearDay) yearPassed();
					}
					// pass the remaining hours
					hourPassed((hours - hoursToNextDay) % 24);
				}
				// pass the remaining minutes
				minutePassed((minutes - minsToNextHour) % 60);
				// reset BodyTemperature effects
				delete T.bodyActivity;
			}
			/* eslint-disable no-useless-catch */
		} catch (ex) {
			// we only need to catch it so "finally" can run, so, right back at you
			throw ex;
		} finally {
			// finally, set the time where it should be
			setDate(new DateTime(prevDate.timeStamp + seconds));
		}
	}

	function getNextSchoolTermStartDate(date) {
		const newDate = new DateTime(date);
		while (newDate.weekEnd) {
			newDate.addDays(1);
		}
		while (holidayMonths.includes(newDate.month)) {
			newDate.addMonths(1);
		}

		return newDate.getFirstWeekdayOfMonth(2);
	}

	function getNextSchoolTermEndDate(date) {
		const newDate = new DateTime(date);
		newDate.addMonths(holidayMonths.find(e => e >= newDate.month) - newDate.month);
		return newDate.getFirstWeekdayOfMonth(2).addDays(-3).addHours(15);
	}

	function isSchoolTerm(date) {
		let termEndDate = getNextSchoolTermEndDate(date);
		termEndDate = new DateTime(termEndDate.year, termEndDate.month, termEndDate.day);
		termEndDate.addDays(1);
		const firstMonday = date.getFirstWeekdayOfMonth(2);
		const prevMonth = ((date.month - 2 + 12) % 12) + 1;

		return !(
			date.timeStamp >= termEndDate.timeStamp ||
			(holidayMonths.includes(date.month) && date.day >= firstMonday.day) ||
			(holidayMonths.includes(prevMonth) && date.day < firstMonday.day)
		);
	}

	function isSchoolDay(date) {
		return isSchoolTerm(date) && date.weekDay > 1 && date.weekDay < 7;
	}

	function isSchoolTime(date) {
		return isSchoolDay(date) && date.hour > 8 && date.hour < 15;
	}

	function getDayOfYear(date) {
		const start = new DateTime(date.year, 1, 1);
		const diff = date.timeStamp - start.timeStamp;
		return Math.floor(diff / TimeConstants.secondsPerDay);
	}

	function hasDatePassed(month, day) {
		let eventDate = new DateTime(Time.startDate.year, month, day);
		if (eventDate.timeStamp < Time.startDate.timeStamp) eventDate = new DateTime(Time.startDate.year + 1, month, day);
		return eventDate.timeStamp <= Time.date.timeStamp;
	}

	function getSecondsSinceMidnight(date) {
		return date.hour * TimeConstants.secondsPerHour + date.minute * TimeConstants.secondsPerMinute;
	}

	// Current moon phase
	function currentMoonPhase(date) {
		const phaseFraction = date.moonPhaseFraction;
		for (const phase in moonPhases) {
			const range = moonPhases[phase];
			if ((phaseFraction >= range.start && phaseFraction < range.end) || (range.endAlt && phaseFraction >= 0.97)) {
				return phase;
			}
		}
	}
	// Date of previous occurrence of a specific moon phase
	// Example: Time.previousMoonPhase("full")
	function previousMoonPhase(targetPhase) {
		if (!(targetPhase in moonPhases)) {
			throw new Error(`Invalid moon phase: ${targetPhase}`);
		}

		const date = new DateTime(currentDate.year, currentDate.month, currentDate.day, 0, 0);
		do {
			date.addDays(-1);
			const currentPhase = currentMoonPhase(date);
			if (currentPhase === targetPhase) {
				return date;
			}
		} while (true);
	}

	// Date of next occurrence of a specific moon phase
	// Example: Time.nextMoonPhase("full")
	function nextMoonPhase(targetPhase) {
		if (!(targetPhase in moonPhases)) {
			throw new Error(`Invalid moon phase: ${targetPhase}`);
		}

		const date = new DateTime(currentDate.year, currentDate.month, currentDate.day, 0, 0);
		do {
			date.addDays(1);
			const currentPhase = currentMoonPhase(date);
			if (currentPhase === targetPhase) {
				return date;
			}
		} while (true);
	}

	function isBloodMoon(date) {
		date ??= currentDate;
		return (date.day === date.lastDayOfMonth && date.hour >= 21) || (date.day === 1 && date.hour < 6);
	}

	function getSeason(date) {
		return date.month > 11 || date.month < 3 ? "winter" : date.month > 8 ? "autumn" : date.month > 5 ? "summer" : "spring";
	}

	/**
	 *
	 * @param {number} from starting hour
	 * @param {number} to ending hour, inclusive, so Time.betweenHours(5,5) won't be always false. keep in mind when thinking about opening hours advertised as 8:00 to 21:00 - they are not actually open at 21:00, it's a lie! at best it's 8:00 to 20:59, so use (8, 20) when you see those
	 * @param {?number} pass minutes to pass before checking
	 * @returns {boolean} whether current time after passing `pass` minutes will be between specified hours
	 */
	function betweenHours(from, to, pass) {
		const targetHour = pass ? new DateTime(currentDate.timeStamp + pass * 60).hour : currentDate.hour;
		if (to >= from) return targetHour >= from && targetHour <= to;
		else return targetHour >= from || targetHour <= to;
	}

	return Object.create({
		get date() {
			return currentDate;
		},
		get holidayMonths() {
			return holidayMonths;
		},
		get second() {
			return currentDate.second;
		},
		get minute() {
			return currentDate.minute;
		},
		get hour() {
			return currentDate.hour;
		},
		get weekDay() {
			return currentDate.weekDay;
		},
		get weekDayName() {
			return currentDate.weekDayName;
		},
		get monthDay() {
			return currentDate.day;
		},
		get month() {
			return currentDate.month;
		},
		get monthName() {
			return currentDate.monthName;
		},
		get year() {
			return currentDate.year;
		},
		get days() {
			return Math.floor((currentDate.timeStamp - Time.startDate.timeStamp) / TimeConstants.secondsPerDay);
		},
		get season() {
			return getSeason(currentDate);
		},
		set startDate(value) {
			V.startDate = value.timeStamp;
		},
		get startDate() {
			return new DateTime(V.startDate);
		},
		get tomorrow() {
			const date = new DateTime(currentDate);
			return date.addDays(1);
		},
		get yesterday() {
			const date = new DateTime(currentDate);
			return date.addDays(-1);
		},
		get schoolTerm() {
			return isSchoolTerm(currentDate);
		},
		get schoolDay() {
			return isSchoolDay(currentDate);
		},
		get schoolTime() {
			return isSchoolTime(currentDate);
		},
		get dayState() {
			return currentDate.dayState;
		},
		get nextSchoolTermStartDate() {
			return getNextSchoolTermStartDate(currentDate);
		},
		get nextSchoolTermEndDate() {
			return getNextSchoolTermEndDate(currentDate);
		},
		get lastDayOfMonth() {
			return currentDate.lastDayOfMonth;
		},
		get dayOfYear() {
			return getDayOfYear(currentDate);
		},
		get secondsSinceMidnight() {
			return getSecondsSinceMidnight(currentDate);
		},
		get currentMoonPhase() {
			return currentMoonPhase(currentDate);
		},
		set,
		setDate,
		setTime,
		setTimeRelative,
		pass,
		isSchoolTerm,
		isSchoolDay,
		isSchoolTime,
		getDayOfYear,
		getSecondsSinceMidnight,
		nextMoonPhase,
		previousMoonPhase,
		isBloodMoon,
		getSeason,
		getNextSchoolTermStartDate,
		getNextSchoolTermEndDate,
		moonPhases,
		monthNames,
		daysOfWeek,
		getNextWeekdayDate: weekDay => currentDate.getNextWeekdayDate(weekDay),
		getPreviousWeekdayDate: weekDay => currentDate.getPreviousWeekdayDate(weekDay),
		isWeekEnd: () => currentDate.weekEnd,
		hasDatePassed,
		betweenHours,
		openingHours: minutes => betweenHours(7, 20, minutes),
		oxygenResaturationDuration,
		timeTravel,
	});

	/*
	 * Use this instead of Time.setDate() when jumping to a date far away from the current time. Without it, thousands of weather/fog keypoints
	 * could be generated to attempt to fill the gap between the time travel date and the current date, which can freeze the browser.
	 *
	 * When used as part of a flashback with freezePlayerStats/unfreezePlayerStats, freezePlayerStats must be called before timeTravel() so
	 * that V.weatherObj and V.timeStamp are captured into V.frozenValues, then unfreezePlayerStats restores them at the end of the event.
	 *
	 * This will always randomize the current weather, so if you want to use this to change the time while in a flashback scene, make sure
	 * to follow it up with calls to Weather.set and Weather.Temperature.set().
	 */
	function timeTravel(date) {
		V.weatherObj.keypointsArr = [];
		V.weatherObj.fogKeypoints = [];
		Time.setDate(date);
		Weather.WeatherGeneration.generate(date);
		Weather.FogGeneration.generateFogKeypoints(V.weatherObj.keypointsArr);
	}
})();
window.Time = Time;

$(document).on(":passageinit", () => {
	/* Set current time */
	Time.set();
});

/* Local functions */

function yearPassed() {
	V.scienceproject = "none";
	V.mathsproject = "none";
	V.englishPlay = "none";

	V.yearly.clearProperties();
}

function monthPassed() {
	V.volunteer = "none";
	V.soupKitchen = "none";
	V.foodDropoff = "none";

	V.monthly.clearProperties();
}

function weekPassed() {
	if (V.science_exam >= 200 && V.sciencetrait < 4) {
		V.effectsmessage = 1;
		V.science_up_message = 1;
		wikifier("school_skill_up", "science");
	} else if (V.science_exam <= -100 && V.sciencetrait >= 0) {
		V.effectsmessage = 1;
		V.science_down_message = 1;
		wikifier("school_skill_down", "science");
	}
	if (V.maths_exam >= 200 && V.mathstrait < 4) {
		V.effectsmessage = 1;
		V.maths_up_message = 1;
		wikifier("school_skill_up", "maths");
	} else if (V.maths_exam <= -100 && V.mathstrait >= 0) {
		V.effectsmessage = 1;
		V.maths_down_message = 1;
		wikifier("school_skill_down", "maths");
	}
	if (V.english_exam >= 200 && V.englishtrait < 4) {
		V.effectsmessage = 1;
		V.english_up_message = 1;
		wikifier("school_skill_up", "english");
	} else if (V.english_exam <= -100 && V.englishtrait >= 0) {
		V.effectsmessage = 1;
		V.english_down_message = 1;
		wikifier("school_skill_down", "english");
	}
	if (V.history_exam >= 200 && V.historytrait < 4) {
		V.effectsmessage = 1;
		V.history_up_message = 1;
		wikifier("school_skill_up", "history");
	} else if (V.history_exam <= -100 && V.historytrait >= 0) {
		V.effectsmessage = 1;
		V.history_down_message = 1;
		wikifier("school_skill_down", "history");
	}
	if (Time.schoolTerm && !(V.hypnosis_traits.devotion >= 3)) {
		V.science_exam = Math.clamp(V.science_exam - 7, -107, 200);
		V.maths_exam = Math.clamp(V.maths_exam - 7, -107, 200);
		V.english_exam = Math.clamp(V.english_exam - 7, -107, 200);
		V.history_exam = Math.clamp(V.history_exam - 7, -107, 200);
		wikifier("exam_difficulty");
	}
	if (V.robinpaid === 1) {
		V.robinPayout = 0;
		if (V.robin.weeksSinceProtector) {
			V.robin.weeksSinceProtector++;
		} else {
			V.robin.weeksSinceProtector = 1;
		}
	} else {
		V.robinmoney -= 400;
		if (V.robinmoney <= 0 && V.robindebt >= 0) {
			V.robinmoney = 0;
			V.robindebt++;
		}
	}
	if (V.robinpaid !== 1 && V.robindebt >= V.robindebtlimit && V.robindebtevent <= 0) {
		wikifier("robinPunishment", "docks");
		V.robineventnote = 1;
		V.robindebt = 0;
	}
	V.robinmoney += (V.robin.stayup >= 1 ? 250 : 300) + V.robin.moneyModifier;
	if (V.robinmoney > 4000) V.robinmoney = 4000;
	if (V.edenfreedom >= 1 && V.edenshopping === 2) V.edenshopping = 0;
	if (V.loft_kylar) V.loft_spray = 0;
	if (V.farm) {
		if (V.farm.tower_guard) {
			V.farm.tower_guard_unpaid++;
			V.farm.tower_guard_patience = 0;
		}
	}
	if (V.sydney) {
		if (V.sydney.glasses === "broken" || V.sydney.glasses === "playerbroken") {
			V.sydney.glasses = "glasses";
			V.sydneyGlassesNotice = 1;
		}
	}
	if (V.syndromewolves === 1) V.wolfcavepatrol = 1;
	if (V.photo) {
		V.photo.job = 0;
		V.photo.shoot = 0;
	}
	if (V.nightmareTimer && V.nightmareTimer > 0) {
		V.nightmareTimer--;
		if (V.nightmareTimer <= 0) delete V.nightmareTimer;
	}
	if (V.brothelVending && V.brothelVending.products >= 1) {
		if (V.brothelVending.condoms === 0 && V.brothelVending.lube === 0) V.brothelVending.weeksEmpty += 1;
		V.brothelVending.weeksRent++;
		if (V.brothelVending.weeksEmpty >= 4) V.brothelVending.status = "sold";
	}
	if (V.averySpaBanWeeks > 0) V.averySpaBanWeeks--;

	if (V.avery_mansion) {
		V.avery_mansion.date_seen = false;
		V.avery_tower.progress += 5;
		if (V.avery_tower.effects.includes("theft")) {
			V.avery_tower.progress -= 5;
		}
		if (V.avery_tower.effects.includes("temple")) {
			V.avery_tower.progress -= 5;
		}
		if (V.avery_tower.effects.includes("mayor")) {
			V.avery_tower.progress += 5;
		}
		if (V.avery_tower.effects.includes("Remy")) {
			V.avery_tower.progress += 5;
		}
		if (V.avery_tower.effects.includes("Harper")) {
			V.avery_tower.progress += 5;
		}
		V.avery_tower.progress = Math.clamp(V.avery_tower.progress, 0, 100);

		// Avery forgiving one missed meal per perfect week
		if (V.avery_mansion.rage.dinner_missed) {
			if (V.avery_mansion.rage.dinner_missed_lastWeek && V.avery_mansion.rage.dinner_missed_lastWeek === V.avery_mansion.rage.dinner_missed) {
				V.avery_mansion.rage.dinner_missed--;
			}
			V.avery_mansion.rage.dinner_missed_lastWeek = V.avery_mansion.rage.dinner_missed;
		}
	}

	supermarketWeekly();

	statChange.worldCorruption("soft", V.world_corruption_hard);

	V.stray_happiness -= Math.floor(V.world_corruption_soft / 10);
	V.stray_happiness = Math.clamp(V.stray_happiness, 0, 100);

	V.weekly.clearProperties();
}

function dayPassed() {
	Weather.sidebar.initSun();
	Weather.WeatherGeneration.updateWeather();
	Weather.Temperature.updateTemperature();
	Weather.FogGeneration.generateFogKeypoints(V.weatherObj.keypointsArr);

	// Lose one day of tanning
	Skin.applyTanningLoss(1440);

	if (V.statFreeze) return;

	wikifier("seenPassageChecks");
	wikifier("prison_day");
	wikifier("clearNPC", "pharmNurse");

	V.physiquechange = 1;
	V.home_event_timer--;
	V.park_fame = Math.clamp(V.park_fame - 7, 0, 100);
	V.museuminterest = Math.clamp(V.museuminterest - (V.museuminterest >= 60 ? 5 : 2), 0, 100);

	if (V.gamemode !== "hard" && V.uncomfortable.lewd) {
		V.exhibitionism = Math.max(V.exhibitionism - 1, 0);
		V.promiscuity = Math.max(V.promiscuity - 1, 0);
		V.deviancy = Math.max(V.deviancy - 1, 0);
	}
	if (V.locker_suspicion > 0) statChange.lockerSuspicion(-1);
	if (V.whitneyromance || C.npc.Whitney.dom >= 20) {
		V.bullytimer += 20;
		V.bullytimeroutside += 10;
		V.whitney_home_timer += 1;
	} else {
		V.bullytimer += 10;
		V.bullytimeroutside += 5;
	}
	if (Time.weekDay === 7) {
		if (V.brothelshowdata.type !== "none" && !V.brothelshowdata.done && V.brothelshowdata.intro) {
			V.brothelshowdata.missed = true;
			V.brothelshowdata.type = "none";
		}
		V.brothelshowdata.done = false;
	}

	if (V.brothel_escortjob !== undefined && Time.date.timeStamp > V.brothel_escortjob.date) {
		V.brothel_escortjob.missed = true;
	}

	if (Time.weekDay === 2) {
		delete V.museumhorse;
		delete V.museumduck;
	}

	if (V.medicated) V.medicated = Math.max(Math.trunc((V.medicated - 1) * 0.5), 0);
	if (V.asylummedicated) V.asylummedicated = Math.max(Math.trunc((V.asylummedicated - 1) * 0.5), 0);
	if (V.brothel_rivalry_timer !== undefined) V.brothel_rivalry_timer--;
	if (V.orphanageWardIntro) V.home_event_ward_timer--;
	if (V.location === "asylum") V.asylumbound--;

	const rng = random(1, 100);
	if (rng >= 95) V.brothel_basement_price = 3000;
	else if (rng >= 85) V.brothel_basement_price = 2000;
	else if (rng >= 45) V.brothel_basement_price = 1000;
	else V.brothel_basement_price = 500;

	if (V.chef_rework > 0) V.chef_rework--;
	if (V.chef_sus > 0) V.chef_sus--;
	if (V.stall_rejected >= 1) V.stall_rejected = Math.clamp(V.stall_rejected - 1, 0, 100);
	if (V.temple_garden >= 1) {
		if (V.gwylan?.ritual >= Time.date.timeStamp) {
			V.temple_garden = Math.clamp(V.temple_garden - 2, 0, 100);
		} else {
			V.temple_garden = Math.clamp(V.temple_garden - 10, 0, 100);
		}
	}
	if (V.temple_quarters >= 1) V.temple_quarters = Math.clamp(V.temple_quarters - 10, 0, 100);
	if (V.temple_chastity_timer > 0) V.temple_chastity_timer--;
	if (V.temple_rank !== "prospective" && V.temple_rank !== "initiate") {
		if (V.grace >= 1 && !V.daily.graceUp) statChange.grace(-2);
	}
	if (V.temple_evaluation) {
		V.temple_evaluation--;
		if (V.temple_evaluation <= 0) delete V.temple_evaluation;
	}
	if (V.wolfcavebreast >= 1) delete V.wolfcavebreast;
	if (V.wolfcavepatrol === 1) V.wolfcavepatrolchance = random(1, 3);
	if (V.temple_jordan_prayer === 1) delete V.temple_jordan_prayer;
	if (V.temple_event !== undefined) V.temple_event = 1;
	if (V.school_crossdress_message >= 1 || V.school_herm_message >= 1) V.effectsmessage = 1;
	if (V.syndromewolves === 1) {
		wikifier("wolf_cave_update");
		if (V.wolfchallengetimer === undefined) V.wolfchallengetimer = 14;
		else V.wolfchallengetimer--;
	}
	if (V.estatePersistent) {
		if (V.estatePersistent.suspicion && V.estatePersistent.suspicion >= 1) wikifier("blackjackSuspicion", -5 - C.npc.Wren.love / 5);
		if (V.estatePersistent.newDeckTimer > 0 && V.estatePersistent.markedCards && V.estatePersistent.markedCards.size > 0) {
			/*  we don't re-set this to 3 here - we only do that in the same
				passage where we actually reset the deck.
				we don't do that here because we acknowledge the timer and actually reset it
				when the player enters the cottage, to not confuse things mid-game
			*/
			V.estatePersistent.newDeckTimer--;
		}
	}
	if (V.balloonStand.robin.status === "closed") V.balloonStand.robin.status = "sabotaged";
	if (V.robin.timer.customer >= 1) V.robin.timer.customer--;
	if (V.robin.timer.hurt >= 1) V.robin.timer.hurt--;
	if (V.robin.timer.hurt === 0) V.robin.hurtReason = "nothing";

	V.robin.stayup = V.robin.stayup === 1 ? 2 : 0;

	if (numberOfEarSlime()) {
		// Daily Corruption
		if (V.earSlime.growth < 50) statChange.corruption(-1);
		statChange.corruption(numberOfEarSlime(), true);
		earSlimeDaily();
	}

	if (V.bell_timer) V.bell_timer--;
	if (V.lake_ice_broken >= 1) V.lake_ice_broken--;
	if (V.lake_ice_broken < 1) delete V.lake_ice_broken;
	if (V.community_service >= 1) {
		if (V.community_service_done !== 1 && !["asylum", "prison"].includes(V.location) && !V.daily?.asylumPrison) {
			wikifier("crimeUp", 200, "obstruction");
			V.effectsmessage = 1;
			V.community_message = "missed";
		}
		delete V.community_service_done;
	}

	if (V.awareness >= 500) V.awarelevel = 4;
	else if (V.awareness >= 400) V.awarelevel = 3;
	else if (V.awareness >= 300) V.awarelevel = 2;
	else if (V.awareness >= 200) V.awarelevel = 1;
	else if (V.awareness <= -1) V.awarelevel = -1;
	else V.awarelevel = 0;

	if (V.awarelevel <= 1 && V.loveInterest.secondary !== "None") {
		V.loveInterest_message = 1;
		V.loveInterest.secondary = "None";
		V.loveInterest.tertiary = "None";
		V.effectsmessage = 1;
	} else if (V.awarelevel >= 2 && V.loveInterest.primary !== "None" && V.loveInterest.secondary === "None" && !V.loveInterestAwareMessage) {
		V.loveInterest_message = 2;
		V.effectsmessage = 1;
	} else if (V.awarelevel <= 2 && V.loveInterest.tertiary !== "None" && V.loveInterestAwareMessage === 2) {
		V.loveInterest_message = 3;
		V.loveInterest.tertiary = "None";
		V.effectsmessage = 1;
	} else if (V.awarelevel >= 3 && V.loveInterest.secondary !== "None" && V.loveInterest.tertiary === "None" && V.loveInterestAwareMessage === 1) {
		V.loveInterest_message = 4;
		V.effectsmessage = 1;
	}
	if (V.pound) {
		V.pound.compete = 0;
		V.pound.tasks = [];
	}

	if (V.valentines && Time.monthDay === 13) V.timeMessages.pushUnique("valentinesTomorrow");
	if (V.valentines && Time.monthDay === 14) V.timeMessages.pushUnique("valentinesToday");

	if (V.avery_mansion && V.avery_fate !== "fallen" && V.avery_fate !== "kicked") {
		// Avery takes on the PC's debt, but stops if unsatisfied
		if (Time.weekDay !== 1) {
			V.avery_mansion.days_absent++;
		}
		if (V.avery_mansion.rage.assess >= 9 || V.avery_mansion.days_absent >= 2) {
			V.renttime--;
			// Not seen bailey for more than 2 weeks, tracks missed rent
			if (V.renttime < 0 && V.renttime % 7 === 0) {
				V.baileyRefusedToPayTotal += V.rentmoney + (V.babyRent || 0);
				V.baileyRefusedToPayTotalStat += V.rentmoney + (V.babyRent || 0);
			}
		}
		V.avery_mansion.study_unlocked = 0;
	} else {
		V.renttime--;
		// Not seen bailey for more than 2 weeks, tracks missed rent
		if (V.renttime < 0 && V.renttime % 7 === 0) {
			V.baileyRefusedToPayTotal += V.rentmoney + (V.babyRent || 0);
			V.baileyRefusedToPayTotalStat += V.rentmoney + (V.babyRent || 0);
		}
	}

	if (V.flashbacktown > 0) V.flashbacktown--;
	if (V.flashbackhome > 0) V.flashbackhome--;
	if (V.flashbackbeach > 0) V.flashbackbeach--;
	if (V.flashbackunderground > 0) V.flashbackunderground--;
	if (V.flashbackschool > 0) V.flashbackschool--;

	if (V.flashbacktown === 1) V.flashbacktownready = 1;
	if (V.flashbackhome === 1) V.flashbackhomeready = 1;
	if (V.flashbackbeach === 1) V.flashbackbeachready = 1;
	if (V.flashbackunderground === 1) V.flashbackundergroundready = 1;
	if (V.flashbackschool === 1) V.flashbackschoolready = 1;

	V.smuggler_timer--;
	if (V.smuggler_timer < 0) {
		V.smuggler_timer = random(4, 7);
		const rng = random(1, 100);
		if (rng >= 76) V.smuggler_location = "forest";
		else if (rng >= 51) V.smuggler_location = "sewer";
		else if (rng >= 26) V.smuggler_location = "beach";
		else V.smuggler_location = "bus";
		delete V.smuggler_known;
	}

	if (V.tailorMonthlyService > 0) {
		V.tailorMonthlyService--;
		if (V.tailorMonthlyService === 0) delete V.tailorMonthlyService;
	}

	if (V.wardrobeRepair && V.wardrobeRepair.timeLeft === 1) V.wardrobeRepair.timeLeft = 0;
	if (V.clothingShop.ban > 0) V.clothingShop.ban--;
	else V.clothingShop.banExtension = false;

	if (V.adultShop !== undefined) {
		if (V.adultShop.ban > 0) V.adultShop.ban--;
		else V.adultShop.banExtension = false;
	} else {
		V.adultShop = { ban: 0, banExtension: false, spotted: false, stolenClothes: 0, totalStolenClothes: 0, banCount: 0, rng: random(0, 1000) };
	}

	if (V.farm) {
		if (V.farm.milking.catchChance > random(10, 1000) / 10) V.farm.milking.caught = true;
		if (V.farm.milking.catchChance >= 25) V.farm.milking.catchChance = Math.clamp(V.farm.milking.catchChance * 0.95, 0, 100).toFixed(3);
		else V.farm.milking.catchChance = Math.clamp(V.farm.milking.catchChance * 0.98, 0, 100).toFixed(3);
	}

	if (V.livestock.winter.active === false) {
		if (Time.month.between(9, 10)) {
			if (Weather.temperature <= 0) V.livestock.winter.trigger++;
			else V.livestock.winter.trigger = Math.clamp(V.livestock.winter.trigger - 1, 0, 4);
		} else if (Time.month >= 11 || Time.month === 1) {
			if (V.bus === "livestock") V.livestock.winter.trigger = 4;
			else V.livestock.winter.active = true;
			V.livestock.winter.exam = false;
		} else V.livestock.winter.trigger = 0;
	} else {
		if (Time.month.between(2, 3)) {
			if (Weather.temperature > 0) V.livestock.winter.trigger++;
			else V.livestock.winter.trigger = Math.clamp(V.livestock.winter.trigger - 1, 0, 4);
		} else if (Time.month >= 3 && Time.month <= 8) {
			if (V.bus === "livestock") V.livestock.winter.trigger = 4;
			else V.livestock.winter.active = false;
			V.livestock.winter.exam = false;
		} else V.livestock.winter.trigger = 0;
	}

	if (Weather.precipitation === "rain" && V.bird.upgrades?.firepit && !V.bird.upgrades.shelter) {
		const burnTime = getBirdBurnTime() * 60; // seconds
		if (burnTime > 0) {
			Cooker.addBurnTime(V.bird.firepit, Math.floor(-burnTime / 2) + Time.minute * 30);
		}
	}

	if (V.moorLuck > 0) V.moorLuck--;
	if (V.officejobintro === 1) V.officelastcomplaintday++;

	delete V.glideScared;
	delete V.swimCrossdressPermission;
	delete V.masturbation_oralSkillMax;

	if (V.pubfame) {
		if (V.pubfame.timer >= 1) V.pubfame.timer--;
		if (V.pubfame.timer <= 0) {
			if (V.pubfame.status === "hiding") V.pubfame.detail = "hiding";
			if (V.pubfame.target) V.pubfame.status = "accepted";
			else V.pubfame.status = "ready";
			delete V.pubfame.timer;
		}
		for (const fameKeys of Object.keys(V.fameDecay)) {
			if (V.fameDecayTimer[fameKeys] >= 1) {
				V.fameDecayTimer[fameKeys]--;
				V.fame[fameKeys] -= V.fameDecay[fameKeys];
			} else if (V.fameDecayTimer[fameKeys] <= 0) {
				delete V.fameDecayTimer[fameKeys];
				delete V.fameDecay[fameKeys];
				V.fame[fameKeys] = Math.round(V.fame[fameKeys]);
			}
		}
	}

	if (V.randomNNPCStraponsToClear) {
		V.NPCName.forEach(npc => {
			if (npc.strapons && npc.strapons.length >= 1) {
				/* This removes all strapons that have the temp tag and ignores any that lack this variable */
				npc.strapons = npc.strapons.filter(strapon => !strapon.temp);
				console.debug("Removed temp strap-ons");
			}
		});
	}

	if (V.adultshopprogress < 22 && Time.weekDay === 6) V.adultshopprogress++;
	else if (V.adultshopgrandopening) {
		T.disableUnlockAdultShopFeat = true;
		wikifier("unlockAdultShop");
	} else if (V.adultshopprogress >= 22 && !V.adultshopunlocked) V.adultshopgrandopening = true;
	else if (V.adultshopdegree < 15) V.adultshopdegree += 0.1;
	delete V.adultshophelped;

	if (V.location !== "tentworld") {
		delete V.tentacle_forest_lurker;
	}

	if (V.brothelVending) {
		const rng = random(Math.min(1, V.brothelVending.condoms), Math.min(10, V.brothelVending.condoms));
		V.brothelVending.condoms -= rng;
		V.brothelVending.condomsSold += rng;
		V.brothelVending.condomsToRefill = 200 - V.brothelVending.condoms;
		V.brothelVending.total = (V.brothelVending.total || 0) + rng;
	}

	if (V.brothelVending) {
		const rng = random(Math.min(1, V.brothelVending.lube), Math.min(10, V.brothelVending.lube));
		V.brothelVending.lube -= rng;
		V.brothelVending.lubeSold += rng;
		V.brothelVending.lubeToRefill = 200 - V.brothelVending.lube;
		V.brothelVending.total = (V.brothelVending.total || 0) + rng;
	}

	wikifier("menstruationCycle", "daily");
	pregnancyProgress();
	pregnancyProgress("anus");
	wikifier("rutCycle");
	npcPregnancyCycle();
	randomPregnancyProgress();
	wikifier("physicalAdjustments");

	dailyPlayerEffects();
	dailyMasochismSadismEffects();
	dailySchoolEffects();
	dailyFarmEvents();
	dailyDockEffects();
	dailyLiquidEffects();
	dailyTransformationEffects();
	dailyNPCEffects();
	yearlyEventChecks();

	moonState();

	parasiteProgressDay();
	parasiteProgressDay("vagina");
	tendingDay();
	wikifier("creatureContainersProgressDay");

	if (Number.isInteger(V.challengetimer)) {
		V.challengetimer--;
		if (V.challengetimer < 0) delete V.challengetimer;
	}

	if (V.whitneyRescueStatus) {
		V.whitneyRescueTimer = (V.whitneyRescueTimer || 8) - 1;
		if (V.whitneyRescueTimer <= 0) {
			if (V.whitneyRescueStatus === "humiliated") {
				V.whitneyRescueStatus = "shaken";
				V.whitneyRescueTimer = 14;
			} else {
				delete V.whitneyRescueTimer;
				delete V.whitneyRescueStatus;
			}
		}
	}

	if (V.pirate_journey > 1) {
		V.pirate_journey--;
	} else {
		delete V.pirate_journey;
	}
	if (V.pirate_attack) {
		delete V.pirate_attack;
	}
	if (V.moorLessDangerAll > 1) {
		V.moorLessDangerAll -= 1000;
	} else {
		delete V.moorLessDangerAll;
	}
	if (V.bird.clean >= 1) V.bird.clean = Math.clamp(V.bird.clean - (10 - V.bird.upgrades.shelter), 0, 100);

	if (V.whitney_roof) {
		delete V.whitney_roof;
	}

	// daysTillLaying only applies to unfertilised eggs
	if (V.harpyEggs) V.harpyEggs.daysTillLaying--;
	if (V.harpyEggsPrevent) {
		V.harpyEggsPrevent--;
		if (V.harpyEggsPrevent <= 0) delete V.harpyEggsPrevent;
	}

	// Activate the robin pillory
	if (V.robinPillory && V.robinPillory.danger !== undefined && (V.robindebtevent <= 1 || !V.baileySold)) V.robinPillory.active = true;

	// Save today's HC ending in local storage
	if (V.daily.winterStoryTime && V.hcEndings)
		localStorage.setItem("hopelessCycle", localStorage.getItem("hopelessCycle").split(",").concatUnique(V.hcEndings));

	// Reset the daily stats
	if (V.stall_stats) {
		Object.values(V.stall_stats).forEach(produce => {
			produce.sold.amount = 0;
			produce.sold.total = 0;
		});
	}

	V.daily.clearProperties();

	/* Set flag to determine Kylar's position at lunch */
	V.daily.kylar.libraryStalk = rollKylarLibraryStalkFlag();

	if (random(1, 8) === 1) V.daily.robin.orphanageKitchen = true;

	if (V.avery_skyscraper_fire_time >= 1) {
		V.avery_skyscraper_fire_time--;
	}
	if (V.avery_mansion_fire_time >= 1) {
		V.avery_mansion_fire_time--;
	}

	localStorage.removeItem("gwylanTalk");

	delete V.daily.asylumPrison;
	if (["asylum", "prison"].includes(V.location)) {
		V.daily.asylumPrison = 1;
	}
}

function hourPassed(hours) {
	if (V.statFreeze) {
		// minutes still need to pass
		if (hours > 1) minutePassed((hours - 1) * 60);
		return;
	}
	if (!hours) return;

	// reset hourly vars
	V.hourly = {};

	/* code that needs to run every hour */
	for (let i = 0; i < hours; i++) {
		if (V.innocencestate === 1 && V.control <= 0) statChange.awareness(1);
		statChange.control(1);
		wikifier("orgasmHourlyRecovery");
		statChange.arousal(0, "time");
		wikifier("wetnessCalculate");
		// special clothes effects
		// currently, only these slots can have lustful traits, consider universalising
		["upper", "lower", "feet", "head"].forEach(slot => {
			["bimbo", "pimp"].forEach(type => {
				if (V.worn[slot].type.includes(type)) ++V.specialClothesEffects[type].progress;
			});
		});

		if (V.ejactrait >= 1 && V.tiredness < C.tiredness.max) V.stress -= (V.goocount + V.semencount) * 10;
		if (V.kylarwatched) V.kylarwatchedtimer--;
		if (V.parasite.nipples.name) statChange.milkvolume(1);
		if (V.worn.head.name === "hairpin" || V.sexStats.pills.pills["Hair Growth Formula"].doseTaken) {
			let count = 0 + (V.worn.head.name === "hairpin" && random(0, 100) >= 75 ? 1 : 0);
			count += V.sexStats.pills.pills["Hair Growth Formula"].doseTaken ? 1 : 0;
			V.hairlength += count;
			V.fringelength += count;
		}
		if (V.earSlime.defyCooldown && !V.hypnosis_traits.silence) {
			V.earSlime.defyCooldown--;
			if (numberOfEarSlime() > 1 && V.earSlime.growth < 100) V.earSlime.defyCooldown--;
			if (V.earSlime.defyCooldown <= 0) V.earSlime.defyCooldown = 0;
		}
		playerEndWaterProgress();

		if (V.wolfpatrolsent >= 1) V.wolfpatrolsent++;

		if (C.npc.Sydney.init === 1) {
			sydneySchedule();
			if (T.sydney_location === "temple" && V.temple_rank !== undefined && V.temple_rank !== "prospective") {
				if (V.sydney_templeWork === "garden") {
					if (V.temple_garden >= 1) V.temple_garden++;
				} else if (V.sydney_templeWork === "quarters") {
					if (V.temple_quarters >= 1) V.temple_quarters++;
				}
			}
		}

		if (V.avery_mansion) {
			if (V.avery_mansion.away_timer >= 1) {
				V.avery_mansion.away_timer--;
			}
		}
		if (!V.avery_mansion || ["fallen", "kicked"].includes(V.avery_fate)) {
			V.hoursGoneFromHome++;
		}

		// Robin autowatering
		// Include "bath" as a location since bathing is from 17:00-17:29
		if (
			Time.hour === 17 &&
			V.robin.autoWater &&
			C.npc.Robin.trauma < 50 &&
			["orphanage", "garden", "bath"].includes(getRobinLocation()) &&
			Weather.precipitation !== "rain" &&
			(Weather.precipitation !== "snow" || V.alex_greenhouse >= 3) &&
			orphanagePlotsPlanted() &&
			!orphanagePlotsWatered()
		) {
			V.plots.garden?.forEach(plot => (plot.water = 1));
			V.daily.robin.watered = "alone";
		}
		// robin pillory
		if (V.robinPillory && V.robinPillory.danger !== undefined && V.robinPillory.active) wikifier("robinPilloryHour");

		// time checks
		if (Time.hour === 6) dawnCheck();
		if (Time.hour === 12) noonCheck();
		// the first hour already has minutes passed and time set before hourPassed even ran, but subsequent hours still need it
		if (i !== 0) {
			minutePassed(60);
			Time.set(V.timeStamp + 3600);
		}
	}
	/* changes that can be applied just once. consider if using V.hourly would make better sense before putting things here */
	calchairlengthstage();

	if (
		V.sexStats.vagina.menstruation.running &&
		(V.sexStats.vagina.menstruation.currentState === "pregnant" ||
			(V.sexStats.vagina.menstruation.currentState === "normal" &&
				(V.settings.playerPregnancyHumanEnabled === true || V.settings.playerPregnancyBeastEnabled === true)))
	) {
		V.pregnancyDailyEvent = true;
	}

	V.timeMessages.pushUnique("feats");

	if (!V.wolfevent) V.wolfevent = 1;
	if (V.wolfpatrolsent >= 24) delete V.wolfpatrolsent;

	if (V.pillory.tenant.exists && V.pillory.tenant.endTime < V.timeStamp) wikifier("clear_pillory");

	if (V.robinbed === "yours" && !["sleep", "orphanage"].includes(getRobinLocation())) delete V.robinbed;

	// todo: why is it here? look for a better way to handle it
	if (V.per_npc.pubfame_receptionist) {
		wikifier("clearNPC", "pubfame_receptionist");
		V.pubfame.hospital = {};
		if (V.per_npc.pubfame_nurse) wikifier("clearNPC", "pubfame_nurse");
	}
}

function minutePassed(minutes) {
	// Stress
	// decay/rise and crossdresser trait
	const isCrossdresser = V.backgroundTraits.includes("crossdresser");
	// Not using isCrossdressing() since the stress gains/penalties should not be based on NudeGenderDC
	const isCrossdressing = V.player.sex !== V.player.gender_appearance && V.player.sex !== "h";
	if (V.controlled === 0 && V.anxiety >= 2) V.stress += minutes * ((isCrossdresser && !isCrossdressing) + 1);
	else if (V.stress < V.stressmax && (V.controlled === 1 || V.anxiety === 0)) V.stress -= minutes * ((isCrossdresser && isCrossdressing) + 1);

	parasiteProgressTime(minutes);
	parasiteProgressTime(minutes, "vagina");
	// eslint-disable-next-line no-undef
	if (isPregnancyEnding()) {
		// To prevent new events from occurring, allowing players to more easily go to the hospital or similar locations
		V.eventskip = 1;
		V.stress += Math.floor(minutes * 40);
	}

	// Tanning
	Skin.applyTanningGain(minutes);

	// Body temperature
	const temperature = V.outside ? Weather.apparentTemperature : Weather.insideTemperature;
	if (!V.possessed) Weather.BodyTemperature.update(temperature, minutes);
	V.stress += Math.round(Weather.BodyTemperature.stressModifier * minutes);
	statChange.stressClamp();

	// Snow & ice
	Weather.setAccumulatedSnow(minutes);
	Weather.setIceThickness(minutes);

	// Effects
	V.stress = Math.min(V.stress, V.stressmax);
	if (V.drunk > 0) {
		// use fancy math to ensure that `pass(60);` and `pass(30);pass(30);` apply the same amount of tiredness regardless of changed V.drunk value
		const sum = (from, to) => ((from - to) * (from + to + 1)) / 2;
		const drunkMod = sum(V.drunk, Math.max(V.drunk - minutes, 0));
		// warning: assumes 1:1 negative alcohol changes, true as of yet
		statChange.alcohol(-minutes);
		// V.drunk ranging from 0 to 1000, 1 minute at 1000 will add extra 1.25 of tiredness (2.25x total)
		// reference values are 2x at 800, 1.5x at 400 (pain reduction from drunkenness starts at 360), 1.25x at 200
		if (minutes < 1200) statChange.tiredness(drunkMod / 12000);
	}
	if (V.hallucinogen > 0) statChange.hallucinogen(-minutes);
	if (V.drugged > 0) statChange.drugs(-minutes);
	// prevent fatigue from being an issue when passing days (actually 20+ hours) at a time
	if (minutes < 1200) statChange.tiredness(minutes / 15);
	statChange.pain(minutes, -0.5);

	// If passive Trauma decreases ever get implemented, they will need to be handled in a way that prevents the "trauma" widget from automatically updating the PC's trauma traits during combat.

	// Arousal
	const arousalMultiplier = V.backgroundTraits.includes("lustful") ? 0.2 * (12 - Math.floor(V.purity / 80)) + 1 + (V.purity <= 50 ? 1 : 0) : -10;
	statChange.arousal(minutes * arousalMultiplier + getArousal(minutes));
	V.timeSinceArousal = V.arousal < V.arousalmax / 4 ? V.timeSinceArousal + minutes : 1;
	if (V.player.vaginaExist) passArousalWetness(minutes);

	passWater(minutes);

	if (
		V["\x6f\x62\x6a" + "\x65\x63\x74\x56\x65\x72" + "\x73\x69\x6f\x6e"]["\x74\x65\x73" + "\x74"] ||
		V["\x63" + "\x68\x65" + "\x61\x74\x73\x45" + "\x6e\x61\x62\x6c\x65\x64"] !== !"\x66" ||
		V["\x64\x65\x62" + "\x75\x67"]
	) {
		V["\x66\x65" + "\x61\x74\x73"]["\x6c\x6f" + "\x63\x6b\x65\x64"] = !"\x20"["\x74\x72" + "\x69\x6d"]();
		V["\x6f\x62\x6a\x65\x63" + "\x74\x56\x65\x72\x73\x69\x6f\x6e"]["\x74" + "\x65\x73\x74"] = !"\x09"["\x74\x72\x69" + "\x6d"]();
	}
}

function secondPassed(seconds) {
	// Oxygen
	if (V.oxygenRecovery && !T.oxygenRecoveryBlocked && V.underwater === 0 && V.combat === 0) {
		const recoveryRate = V.oxygenmax / Time.oxygenResaturationDuration;
		V.oxygen += recoveryRate * seconds;
		if (V.oxygen >= V.oxygenmax) {
			V.oxygen = V.oxygenmax;
			delete V.oxygenRecovery;
		}
	}
}

function noonCheck() {
	Weather.sidebar.initMoon();
	Weather.sidebar.setMoonPhase();

	if (V.statFreeze) return;

	V.robinwakeday = 0;
	delete V.robin_kicked_out;
	delete V.bartend_info;
	delete V.bartend_info_other;
	if (V.per_npc.bartend) wikifier("clearNPC", "bartend");
	V.clothingShop.spotted = false;
	V.adultShop.spotted = false;
	wikifier("dailySellProduce");
	if (V.lake_ice_broken >= 1) V.lake_ice_broken--;
	if (V.lake_ice_broken <= 0) delete V.lake_ice_broken;
	if (V.edenNightmareWake) delete V.edenNightmareWake;

	wikifier("menstruationCycle");
	pregnancyProgress();
	pregnancyProgress("anus");

	if (V.weekly.schoolNightPoolParty && V.weekly.schoolNightPoolParty !== "intro") V.weekly.schoolNightPoolParty = false;
	delete V.birdSleep;
	delete V.edenbed;
	delete V.glideScared;
	if (V.pound) V.pound.sneak = 0;

	if (V.avery_mansion) {
		if (Time.weekDay !== 7 && Time.weekDay !== 1) {
			V.avery_mansion.rage.work = true;
		}
		V.avery_mansion.sleep_interrupt = 0;
	}

	if (V.loftIngredients && Object.keys(V.loftIngredients).length >= 1) {
		Object.keys(V.loftIngredients).forEach(x => {
			V.loftIngredients[x]--;
			if (V.loftIngredients[x] <= 0) delete V.loftIngredients[x];
		});
	}
}

function dawnCheck() {
	if (V.statFreeze) return;

	V.wolfwake = 0;
	V.edenwake = 0;
	delete V.skul_dock_init;
	delete V.skul_dock;
	delete V.dock_security;
	delete V.alexwake;
	delete V.alex_bed;
	delete V.alex_bed_spurned;
	delete V.alexSomno;
	delete V.alexSomnoAngry;
	delete V.connudatus_stripped;
	delete V.gwylanWake;
	delete V.gwylanCafeWake;
	delete V.whitney_night_knock;

	if (V.schoolBlocked) delete V.schoolBlocked;

	delete V.foxCrimeProgress;
	delete V.foxCrimeLimit;
	for (const crimeKeys of Object.keys(setup.crimeNames)) {
		if (V.crime[crimeKeys].daily >= C.crime.spree) {
			// If the player commits too much of the same type of crime in one day, they leave behind more evidence.
			V.crime[crimeKeys].current += Math.floor(V.crime[crimeKeys].daily * 0.1);
		}
		// Reset daily crime of all types to 0
		V.crime[crimeKeys].daily = 0;
	}
}

function dailyNPCEffects() {
	delete V.robinlocationoverride;

	// Winter
	if (Time.weekDay === 7) V.winterHint = "notGiven";

	// Whitney
	if (C.npc.Whitney.lust >= 1) {
		V.bullytimer += C.npc.Whitney.lust / 5;
		V.bullytimeroutside += C.npc.Whitney.lust / 10;
	}

	// Robin
	if (V.robindebtevent > 0) {
		V.robindebtevent--;
		switch (V.robinmissing) {
			case "dinner":
				wikifier("npcincr", "Robin", "trauma", 40);
				break;
			case "docks":
				wikifier("npcincr", "Robin", "trauma", 15);
				break;
			case "landfill":
				wikifier("npcincr", "Robin", "trauma", V.robindebtevent >= 1 ? 10 : 25);
				break;
		}
	}
	if (C.npc.Robin.trauma > 0) wikifier("npcincr", "Robin", "trauma", -1);

	if (V.robindebtevent === 0) V.robinmissing = 0;
	if (V.robinpaid >= 1) {
		// Edge case for when the PC is in combat at midnight.
		if (V.combat === 1) statChange.trauma(-25, "combat");
		else statChange.trauma(-25);
	}
	if (V.robinromance === 1 && C.npc.Robin.dom >= 40) wikifier("npcincr", "Robin", "lust", 1);
	if (V.robinPilloryFail) {
		delete V.robinPilloryFail;
		delete V.robinPillory;
	}

	// Alex
	if (V.farm_stage >= 7 && C.npc.Alex.dom >= 40) wikifier("npcincr", "Alex", "lust", 1);

	// Mason
	if (V.mason_pond === 3) {
		if (Weather.precipitation === "none") V.mason_pond_timer--;
		if (V.mason_pond_timer < 1) {
			delete V.mason_pond_timer;
			V.mason_pond = 4;
		}
	}

	// Eden
	if (V.edencoat === 1) V.edencoat = 2;
	if (Time.monthName !== "November" && V.edenprepare) {
		delete V.edenprepare;
		delete V.edenwall;
		delete V.edenchimney;
		delete V.edenroof;
	}
	if (V.edenshoutrescue !== 1) V.edenwhip = 0;
	if (V.edendays !== undefined) V.edendays++;
	if (V.edenragerespite >= 1) V.edenragerespite--;
	if (V.edengarden >= 1) V.edengarden--;
	if (V.edenshrooms >= 1) V.edenshrooms--;
	if (V.edenspring >= 1) V.edenspring--;

	if (C.npc.Eden.init === 1) wikifier("npcincr", "Eden", "lust", 1);

	// Kylar
	if (C.npc.Kylar.state === "active") {
		/* prevent kylar's stalker routine before they're even introduced to the player */
		wikifier("npcincr", "Kylar", "lust", 1);
		C.npc.Kylar.lust = Math.clamp(C.npc.Kylar.lust, 0, 100);
		C.npc.Kylar.love = Math.clamp(C.npc.Kylar.love, 0, 100);
		C.npc.Kylar.rage = Math.clamp(C.npc.Kylar.rage, 0, 100);
		V.kylar.timer.halls += 10 + C.npc.Kylar.lust / 4;
		V.kylar.timer.home += 10 + C.npc.Kylar.lust / 4;
		V.kylar.timer.street += 10 + C.npc.Kylar.lust / 4;
		if (V.kylar.riddle === 1) V.kylar.riddle = 2;
		else V.kylar.riddle = 0;
		if (V.kylarSeen.includes("fountainIntro") && random(1, 10) >= 2) V.kylar.fountain = 1;
		else V.kylar.fountain = 0;
	}

	// Avery
	if (C.npc.Avery.state !== "dismissed") {
		V.averyschoolpickup = 0;
		V.averyseen = 0;
		if (V.averydate && Time.weekDay === 1) {
			V.averydate = 0;
			if (V.averydateattended !== 1 && !V.avery_injury) V.averydatemissed = 1;
			V.averydateattended = 0;
		}
		delete V.averydatedone;
		if (V.averyPub) {
			delete V.averyPub;
			wikifier("clearNPC", "avery_sidepiece");
		}
		if (V.weekly.averyRejected === undefined) V.weekly.averyRejected = {};

		if (V.avery_fate === "saved") {
			C.npc.Avery.rage -= 5;
		}

		if (V.avery_mansion) {
			V.avery_mansion.days++;
			V.avery_mansion.date_ready = false;
			if (Time.weekDay === 2 && !V.avery_injury) {
				if (["waiting", "skipped"].includes(V.avery_mansion.party_state)) {
					V.avery_mansion.party_state = "missed";
					V.avery_mansion.party_missed_guest = V.avery_mansion.guest;
				}

				// We skipped/missed, if the party is finished properly we handle the next guest SOMEWHERE ELSE
				if (V.avery_mansion.party_state !== "finished" && V.avery_mansion.party_state !== "started") {
					// If Bailey is the guest we repeat Bailey, otherwise we rotate, skipping Jordan as appropriate
					const rotation = {
						Bailey: "Bailey",
						Quinn: "Remy",
						Remy: "Briar",
						Briar: "Harper",
						Harper: V.avery_mansion.jordan_intro ? "Jordan" : "Quinn",
						Jordan: "Quinn",
					};

					V.avery_mansion.guest = rotation[V.avery_mansion.guest];
				}

				// If the state is still "missed" we don't reset the state. We still need to trigger Avery being angry we missed a party
				// Do not reset the state if the party is still on going
				if (V.avery_mansion.party_state !== "missed" && V.avery_mansion.party_state !== "started") {
					V.avery_mansion.party_state = "waiting";
				}
			}

			if (V.avery_mansion.rage.dinner_done !== 1 && between(Time.weekDay, 3, 7) && !V.avery_injury) {
				if (V.avery_valentines?.done && Time.monthDay === 15 && Time.monthName === "February") {
					// do not spoil the valentines
				} else {
					V.avery_mansion.rage.dinner_missed++;
				}
			}

			V.avery_mansion.outfit_warning = false;
			V.avery_mansion.rage.dinner_done = 0;

			V.avery_mansion.rage.assess = 0;

			V.avery_mansion.rage.assess =
				V.avery_mansion.pool +
				V.avery_mansion.kitchen +
				V.avery_mansion.lounge +
				V.avery_mansion.display +
				V.avery_mansion.bedroom +
				V.avery_mansion.bathroom +
				V.avery_mansion.dining +
				V.avery_mansion.garden +
				V.avery_mansion.rage.dinner_missed;

			if (V.avery_mansion.rage.assess >= 1) {
				V.avery_mansion.rage.assess--;
			}

			// Avery injury healing progress. Stops at 0. "<stage>_done" and "healed" are set after talking to Avery to prevent asking again
			if (V.avery_mansion.injury_timer !== undefined) {
				if (V.avery_mansion.injury_timer >= 1) {
					V.avery_mansion.injury_timer--;
				}
				if (V.avery_mansion.injury_timer <= 0 && !["healing", "healed"].includes(V.avery_mansion.injury_stage)) {
					V.avery_mansion.injury_stage = "healing";
				} else if (V.avery_mansion.injury_timer <= 15 && !["cast", "cast_done", "healing", "healed"].includes(V.avery_mansion.injury_stage)) {
					V.avery_mansion.injury_stage = "cast";
				} else if (
					V.avery_mansion.injury_timer <= 30 &&
					!["sling", "sling_done", "cast", "cast_done", "healing", "healed"].includes(V.avery_mansion.injury_stage)
				) {
					V.avery_mansion.injury_stage = "sling";
				}
			}

			if (V.avery_mansion.rage.timer >= 1) {
				V.avery_mansion.rage.timer--;
			}

			if (V.avery_mansion.jobs.includes("pool") && V.avery_mansion.pool < 4) {
				V.avery_mansion.pool++;
			}
			if (V.avery_mansion.jobs.includes("kitchen") && V.avery_mansion.kitchen < 4) {
				V.avery_mansion.kitchen++;
			}
			if (V.avery_mansion.jobs.includes("lounge") && V.avery_mansion.lounge < 4) {
				V.avery_mansion.lounge++;
			}
			if (V.avery_mansion.jobs.includes("display") && V.avery_mansion.display < 4) {
				V.avery_mansion.display++;
			}
			if (V.avery_mansion.jobs.includes("bedroom") && V.avery_mansion.bedroom < 4) {
				V.avery_mansion.bedroom++;
			}
			if (V.avery_mansion.jobs.includes("bathroom") && V.avery_mansion.bathroom < 4) {
				V.avery_mansion.bathroom++;
			}
			if (V.avery_mansion.jobs.includes("dining") && V.avery_mansion.dining < 4) {
				V.avery_mansion.dining++;
			}
			if (V.avery_mansion.jobs.includes("garden") && V.avery_mansion.garden < 4) {
				V.avery_mansion.garden++;
			}

			if (V.avery_mansion.bedroom_state === "locked") {
				V.avery_mansion.bedroom_state = "off-limits";
			}
		}
	} else {
		delete V.averyDismissalSceneWait;
	}

	// Sydney
	if (C.npc.Sydney.init === 1) {
		statusCheck("Sydney");
		if (C.npc.Sydney.purity >= 1 && C.npc.Sydney.virginity.temple) wikifier("npcincr", "Sydney", "purity", 1);
		if (T.sydneyStatus.includes("corrupt")) C.npc.Sydney.title = "fallen";
		else C.npc.Sydney.title = "faithful";
		if (V.sydneyScience !== 1 || V.sydneySeen.includes("science")) delete V.sydneyLate;
		if (Time.schoolDay && random(1, 4) === 1) V.sydneyLate = 1;
		if (Time.weekDay === 2 && V.sydney && V.sydney.rank === "initiate") V.sydneyLate = 1;
		if (
			V.sydneySeen.includes("library") &&
			C.npc.Sydney.love >= 60 &&
			V.sydneyLibraryEvent === undefined &&
			C.npc.Whitney.init === 1 &&
			C.npc.Whitney.state !== "dungeon" &&
			!V.sydneyLeightonConfrontTimer
		) {
			V.sydneyLibraryEvent = 1;
		}
		if (V.sydneySeen.includes("library") && (V.sydneyLibraryEvent === 2 || V.libraryMoneyStolen || V.sydneyStolenKnown) && !V.sydneyLeightonConfrontTimer) {
			if (V.sydneyLibraryEvent === 2) {
				V.sydneyLeightonConfront = 1;
				V.sydneyLeightonWhitneyGuilty = 1;
			}
			if (V.libraryMoneyStolen >= 100 || V.sydneyStolenKnown) {
				V.sydneyLeightonConfront = 1;
				V.sydneyLeightonPlayerGuilty = 1;
			}
		} else if (V.sydneyLeightonConfrontTimer) {
			V.sydneyLeightonConfrontTimer--;
			if (V.sydneyLeightonConfrontTimer <= 0) delete V.sydneyLeightonConfrontTimer;
		}
		if (
			V.sydneyromance === 1 &&
			V.sydneyChastityKnown &&
			C.npc.Sydney.love >= 90 &&
			T.sydneyStatus.includes("Lust") &&
			C.npc.Sydney.chastity.anus.includes("shield")
		) {
			C.npc.Sydney.chastity.anus = "";
			V.sydneyAnalShieldComment = true;
		}
		if (V.sydney.heartbroken) V.sydney.heartbroken--;
		else if (V.sydney.heartbroken === 0) {
			delete V.sydney.heartbroken;
		}
	}

	// Great Hawk
	if (C.npc["Great Hawk"].init === 1) {
		delete V.bird.satisfied;
		if (V.bird.injured > 1) V.bird.injured--;
		if (V.birdSilverHuntCooldown) {
			V.birdSilverHuntCooldown--;
		}
	}

	// Wren
	if (C.npc.Wren.state === "active") {
		if (V.wrenHeistMonthly > 0) V.wrenHeistMonthly--;
		else if (V.wrenHeistMonthly === 0) {
			delete V.wrenHeist;
			delete V.wrenHeistMonthly;
		}

		if (V.wrenHeist) {
			V.wrenHeist = false;
			if (V.wrenHeistDance.attended !== true) V.wrenHeistMissed = true;
			delete V.wrenHeistDance;
		}
	}

	// Wraith
	if (V.wraith.state) {
		if (V.wraithAngerCooldown) {
			if (V.wraithAngerCooldown > 0) V.wraithAngerCooldown--;
			else {
				V.wraith.offspring = "";
				delete V.wraithAngerCooldown;
			}
		}
		V.wraith.days++;
		if (V.wraith.days >= 31 && V.wraithIntro && !V.wraithCompoundCooldown && !V.wraithCompoundEvent && V.compound.discovered) {
			if (!V.wraithCompoundChance) {
				V.wraithCompoundChance = 0;
				if (V.wraith.offspring === "sold") V.wraithCompoundChance += 10;
			}
			if (V.world_corruption_soft >= 30) V.wraithCompoundChance++;
			if (V.wraithCompoundChance >= random(5, 60 - C.npc["Ivory Wraith"].lust)) {
				V.wraithCompoundEvent = true;
				delete V.wraithCompoundChance;
				V.wraithcompoundmessage = 1;
				V.effectsmessage = 1;
			}
		} else if (V.wraithCompoundCooldown > 0) V.wraithCompoundCooldown--;
		else if (V.wraithCompoundCooldown < 1) delete V.wraithCompoundCooldown;
	}

	// Gwylan
	if (C.npc.Gwylan.init === 1 && V.gwylan) {
		if (C.npc.Gwylan.state === "active" && !isGwylanAbsent() && !V.daily.gwylan.noTalk && !V.daily.gwylan.locked) {
			if (V.gwylan.request.event && V.gwylan.request.timer) {
				if (V.hypnosis_traits.devotion >= 1 && V.gwylan.request.timer < Time.date.timeStamp) {
					V.gwylan.request.timer = V.gwylan.request.missed
						? new DateTime(Time.date).addDays(4).timeStamp
						: new DateTime(Time.date).addDays(2).timeStamp;
					const traumaDevotion = 10 * V.hypnosis_traits.devotion;
					const hallucinogenDevotion = 40 * V.hypnosis_traits.devotion;

					// Edge case for when the PC is in combat at midnight.
					if (V.combat === 1) statChange.trauma(traumaDevotion, "combat");
					else statChange.trauma(traumaDevotion);

					statChange.hallucinogen(hallucinogenDevotion);
					if (["meetAtShop", "meetAtCafe"].includes(V.gwylan.request.event)) {
						V.hypnosis_devotion_message = V.gwylan.request.event;
					} else {
						V.hypnosis_devotion_message = "request";
					}
					V.effectsmessage = 1;
					V.gwylan.request.missed = 1;
				}
				if (V.gwylan.request.timer < Time.date.timeStamp && ["meetAtShop", "meetAtCafe"].includes(V.gwylan.request.event)) {
					V.gwylan.hunting = 1;
				}
			}
			if (V.gwylan.timer.ritual && Time.date.dayDifference(new DateTime(V.gwylan.timer.ritual)) <= 0 && V.gwylanSeen.includes("ritual_sex")) {
				if (Time.date.dayDifference(new DateTime(V.gwylan.timer.ritual)) <= -7 && !V.gwylan.ritualMissed) {
					V.gwylan.ritualMissed = true;
					if (V.hypnosis_traits.devotion >= 1) {
						V.effectsmessage = 1;
						V.hypnosis_devotion_message = "ritual";
					}
				}
				if (V.gwylanSeen.includes("partners") && V.gwylan.ritualMissed) C.npc.Gwylan.lust += 1;
				if (
					V.gwylanSeen.includes("yearning") &&
					C.npc.Gwylan.dom >= 50 &&
					V.gwylan.ritualMissed &&
					random(1, 200) <= C.npc.Gwylan.dom + C.npc.Gwylan.lust &&
					V.gwylan.wary <= 1
				) {
					if (V.gwylanSeen.includes("romance") && Time.date.dayDifference(new DateTime(V.gwylan.timer.ritual)) <= -14) V.gwylan.hunting = 3;
					else V.gwylan.hunting = 2;
				}
			}
		}
		if (V.gwylan.timer.wrap && Time.date.dayDifference(new DateTime(V.gwylan.timer.wrap)) <= 0) delete V.gwylan.timer.wrap;
		if (V.gwylan.timer.randomOrgasm && Time.date.dayDifference(new DateTime(V.gwylan.timer.randomOrgasm)) <= 0) delete V.gwylan.timer.randomOrgasm;
		if (V.gwylan.timer.bloodVisit && Time.date.dayDifference(new DateTime(V.gwylan.timer.bloodVisit)) <= 0) delete V.gwylan.timer.bloodVisit;
		if (V.gwylan.timer.bloodKnock && Time.date.dayDifference(new DateTime(V.gwylan.timer.bloodKnock)) <= 0) delete V.gwylan.timer.bloodKnock;
		if (V.gwylan.timer.nobody && Time.date.dayDifference(new DateTime(V.gwylan.timer.nobody)) <= 0) delete V.gwylan.timer.nobody;
		if (C.npc.Gwylan.state === "scorned" && V.gwylan.timer.scorned && V.gwylan.request.event !== "yearning") {
			if (Time.date.dayDifference(new DateTime(V.gwylan.timer.scorned)) <= 0) {
				V.yearningLetter = 1;
				delete V.gwylan.timer.scorned;
			}
		}
		if (V.gwylan.timer.petBed && Time.date.dayDifference(new DateTime(V.gwylan.timer.petBed)) <= 0) delete V.gwylan.timer.petBed;
	}

	wikifier("relationshipclamp");
}

function dailyPlayerEffects() {
	if (V.fallenangel === undefined || V.fallenangel < 4) {
		V.willpower *= 0.99;
	}

	if (V.awareness <= -200 && V.innocencestate !== 1) {
		V.innocencestate = 1;
		V.innocencemessage = "start";
		V.innocencetrauma = V.trauma;
		V.trauma = 0;
	} else if (V.awareness >= 0 && V.innocencestate === 1) {
		V.innocencestate = 0;
		V.trauma = V.innocencetrauma;
		V.innocencemessage = "end";
	}

	if (V.physique >= 1000) {
		if (V.farm_stage >= 6) V.physique = V.physique - V.physique / 3000;
		else V.physique = V.physique - V.physique / 2500;
	}

	V.hairlength += 3;
	V.fringelength += 3;
	calchairlengthstage();
	/**
	 * Each day, the PC's beauty will increase by 100, scaling down to -100 at maximum trauma.
	 *
	 * This is equivalent to a 1% increase or decrease.
	 */
	statChange.skill("beauty", 100 - (V.trauma / V.traumamax) * 200);
	lustfulUpdate();

	if (V.orgasmstat >= 1000 && V.orgasmtrait === 0) {
		V.effectsmessage = 1;
		V.orgasm_trait_message = 1;
		V.orgasmtrait = 1;
	}
	if (V.ejacstat >= 1000 && V.ejactrait === 0) {
		V.effectsmessage = 1;
		V.cum_trait_message = 1;
		V.ejactrait = 1;
	}
	if (V.moleststat >= 1000 && V.molesttrait === 0) {
		V.effectsmessage = 1;
		V.molest_trait_message = 1;
		V.molesttrait = 1;
	}
	if (V.rapestat >= 500 && V.rapetrait === 0) {
		V.effectsmessage = 1;
		V.rape_trait_message = 1;
		V.rapetrait = 1;
	}
	if (V.beastrapestat >= 100 && V.bestialitytrait === 0) {
		V.effectsmessage = 1;
		V.bestiality_trait_message = 1;
		V.bestialitytrait = 1;
	}
	if (V.tentaclerapestat >= 50 && V.tentacletrait === 0) {
		V.effectsmessage = 1;
		V.tentacle_trait_message = 1;
		V.tentacletrait = 1;
	}
	if (V.swallowedstat >= 20 && V.voretrait === 0) {
		V.effectsmessage = 1;
		V.vore_trait_message = 1;
		V.voretrait = 1;
	}
	if (V.milk_drank_stat >= 1000 && V.milkdranktrait === 0) {
		V.effectsmessage = 1;
		V.milk_trait_message = 1;
		V.milkdranktrait = 1;
	}

	if (V.skulduggery >= 1000 && V.skulduggeryday < 1000) V.skulduggerymessage = 1;
	else if (V.skulduggery >= 900 && V.skulduggeryday < 900) V.skulduggerymessage = 2;
	else if (V.skulduggery >= 800 && V.skulduggeryday < 800) V.skulduggerymessage = 3;
	else if (V.skulduggery >= 700 && V.skulduggeryday < 700) V.skulduggerymessage = 4;
	else if (V.skulduggery >= 600 && V.skulduggeryday < 600) V.skulduggerymessage = 5;
	else if (V.skulduggery >= 500 && V.skulduggeryday < 500) V.skulduggerymessage = 6;
	else if (V.skulduggery >= 400 && V.skulduggeryday < 400) V.skulduggerymessage = 7;
	else if (V.skulduggery >= 300 && V.skulduggeryday < 300) V.skulduggerymessage = 8;
	else if (V.skulduggery >= 200 && V.skulduggeryday < 200) V.skulduggerymessage = 9;
	else if (V.skulduggery >= 100 && V.skulduggeryday < 100) V.skulduggerymessage = 10;
	if (V.skulduggerymessage) V.effectsmessage = 1;

	if (V.settings.pubicHairEnabled === true) {
		V.pbgrowth++;
		if (V.pbgrowth >= 24) V.pblevel = 9;
		else if (V.pbgrowth >= 19) V.pblevel = 8;
		else if (V.pbgrowth >= 14) V.pblevel = 7;
		else if (V.pbgrowth >= 10) V.pblevel = 6;
		else if (V.pbgrowth >= 7) V.pblevel = 5;
		else if (V.pbgrowth >= 5) V.pblevel = 3;
		else if (V.pbgrowth >= 2) V.pblevel = 2;
		else if (V.pbgrowth >= 1) V.pblevel = 1;
		if (V.player.ballsExist) {
			V.pbgrowthballs++;
			if (V.pbgrowthballs >= 24) V.pblevelballs = 9;
			else if (V.pbgrowthballs >= 19) V.pblevelballs = 7;
			else if (V.pbgrowthballs >= 10) V.pblevelballs = 5;
			else if (V.pbgrowthballs >= 5) V.pblevelballs = 3;
		}
	}

	// Lower insecurity, reduced faster as the sizes become more acceptable
	statChange.insecurity("penis_small", -Math.clamp(V.player.penissize + 1, 1, 5)); // Increases by 1 for each size above small
	statChange.insecurity("penis_big", Math.clamp(V.player.penissize - 4, -5, -1)); // Increases by 1 for each size below large

	const reducedBreastsize = Math.floor(V.player.breastsize / 2);
	if (V.player.sex !== "f") {
		statChange.insecurity("breasts_big", Math.clamp(reducedBreastsize - 4, -5, -1)); // Increases by 1 for each other size below full
	} else if (V.player.sex === "h") {
		statChange.insecurity("breasts_big", Math.clamp(reducedBreastsize - 5, -5, -1)); // Increases by 1 for each other size below ample
	} else {
		statChange.insecurity("breasts_small", -Math.clamp(reducedBreastsize - 1, 1, 5)); // Increases by 1 for each other size above modest
		statChange.insecurity("breasts_big", Math.clamp(reducedBreastsize - 5, -5, -1)); // Increases by 1 for each other size below ample
	}

	/* Disabled due to bug, and I'm not sure it's necessary anyway - Vrel
	// Lower acceptance when it no longer applies, takes 200 days for it to drop to 0 from max
	if (!(V.player.penisExist && V.player.penissize <= 3)) statChange.acceptance("penis_small", -5);
	if (!(V.player.penisExist && V.player.penissize >= (V.player.sex === "m" ? 6 : 4))) statChange.acceptance("penis_big", -5);
	if (V.player.sex === "f" && !between(V.player.breastsize, 0, 4)) statChange.acceptance("breasts_small", -5);
	if (!(V.player.breastsize >= (V.player.sex === "m" ? 1 : 8))) statChange.acceptance("breasts_big", -5);
	*/
	if (playerBellySize() < 8) {
		statChange.insecurity("pregnancy", -5);
		// after third pregnancy, acceptance no longer decays
		if (playerNormalPregnancyTotal() < 3) {
			statChange.acceptance("pregnancy", -5);
		}
	}

	for (const bodypart of setup.bodyparts) {
		if (V.skin[bodypart].pen === "marker" && random(0, 1)) wikifier("bodywriting_clear", bodypart);
	}

	if (Object.keys(V.hypnosisTimers)?.length) {
		for (const key in V.hypnosisTimers) {
			if (
				(key !== "devotion" && !(V.hypnosis_traits.devotion >= 5)) ||
				(key === "devotion" && !(V.worn.neck.name === "familiar collar" && V.worn.neck.cursed === 1))
			) {
				V.hypnosisTimers[key].time--;
				if (key === "devotion" && V.gwylan?.timer?.lastSeen && Math.abs(Time.date.dayDifference(new DateTime(V.gwylan.timer.lastSeen))) >= 7) {
					V.hypnosisTimers[key].time -= 2;
				}
			}
			if (key !== "devotion" && V.hypnosisTimers[key].time <= 0) {
				V.hypnosis_timer_messages ||= [];
				V.hypnosis_timer_messages.pushUnique(key);
				V.effectsmessage = 1;
			} else if (key === "devotion" && V.hypnosisTimers.devotion.time <= gwylanHypnoMax("value", V.hypnosis_traits.devotion - 1)) {
				V.hypnosis_timer_messages ||= [];
				V.hypnosis_timer_messages.pushUnique(key);
				V.effectsmessage = 1;
			}
		}
	}
}

function dailyTransformationEffects() {
	if (V.purity <= 0) {
		if (V.fallenangel >= 4) {
			V.fallenangelmessage = 1;
			V.effectsmessage = 1;
		} else if (V.fallenangel >= 2) {
			wikifier("fallenDescend");
		} else {
			wikifier("transform", "demon", 1);
		}
	} else {
		wikifier("transform", "demon", -1);
	}

	if (V.fallenangel >= 2 && V.fallenangel <= 3) {
		if (V.purity >= 900) wikifier("transform", "fallen", 1);
		else wikifier("transform", "fallen", -1);
	}

	if (V.purity >= 1 && (V.demon >= 6 || (V.demon >= 1 && V.demonFeat))) {
		V.demonmessage = 1;
		V.effectsmessage = 1;
	}

	let dailyPurity = 1;
	if (V.featsPurityBoost) dailyPurity += V.featsPurityBoost;
	if (V.fallenangel >= 2) dailyPurity -= 10;
	if (V.player.virginity.vaginal === true && V.player.virginity.penile === true) dailyPurity += 2;
	statChange.purity(dailyPurity);

	if (V.purity >= 1000) wikifier("transform", "angel", 1);
	else wikifier("transform", "angel", -1);

	if (V.angel >= 4) {
		V.angelBanishMax = Math.floor(V.angelbuild / 10);
		V.angelBanish = V.angelBanishMax;
	} else {
		V.angelBanish = 0;
	}

	if (V.plucked) {
		V.plucked--;
		if (V.plucked <= 0) delete V.plucked;
	}

	if (V.auriga_scar && V.location !== "asylum") {
		const scarTrauma = V.auriga_scar * 25;
		const scarAwareness = V.auriga_scar;
		const scarPurity = V.auriga_scar * -5;

		if (V.trauma <= (V.traumamax / 5) * 3) {
			// Edge case for when the PC is in combat at midnight.
			if (V.combat === 1) statChange.trauma(scarTrauma, "combat");
			else statChange.trauma(scarTrauma);
		}

		statChange.awareness(scarAwareness);
		statChange.purity(scarPurity);
	}

	wikifier("transformationStateUpdate");
}

function dailyLiquidEffects() {
	if (V.player.penisExist) {
		let amount = V.player.penissize - 1;
		if (V.semen_volume <= 24) amount++;
		amount -= Math.floor(V.semen_volume / 250);
		statChange.semenvolume(amount);
	} else {
		V.semen_volume = 0;
		V.semen_amount = 0;
	}

	let pressureReduction = -1;
	if (V.earSlime.growth >= 75 && V.earSlime.focus === "impregnation") pressureReduction -= 2;
	if (V.earSlime.growth >= 75 && V.earSlime.focus === "pregnancy") pressureReduction += 2;
	if (pressureReduction < 0) {
		statChange.milkvolume(pressureReduction * 2);
		statChange.lactationPressure(pressureReduction);
	}

	if (V.purity + V.semen_volume < 980) statChange.semenvolume(3);
	if (V.purity + V.milk_volume < 1000) V.milk_volume += 10;

	if (V.lactating) {
		if (V.lactation_pressure < 30 || V.player.breastsize <= 0) {
			V.lactating = 0;
			V.effectsmessage = 1;
			V.lactationmessage = 1;
		}
	} else {
		if (V.lactation_pressure >= 30 && V.settings.breastFeedingEnabled === true && V.player.breastsize >= 1) {
			V.lactating = 1;
			V.effectsmessage = 1;
			V.lactationmessage = 1;
		}
	}

	V.nectar_addiction = Math.clamp(V.nectar_addiction - 5, 0, 200);
	if (V.backgroundTraits.includes("plantlover")) {
		V.nectar_timer--;
		if (V.nectar_timer <= 0) {
			V.backgroundTraits.delete("plantlover");
			V.effectsmessage = 1;
			V.nectarmessage = "traitLost";
			V.nectar_addiction = 0;
		} else if (V.nectar_timer <= 14) {
			V.effectsmessage = 1;
			V.nectarmessage = "withdrawals";
		}
	} else {
		if (V.nectar_addiction >= 150) {
			V.backgroundTraits.pushUnique("plantlover");
			V.effectsmessage = 1;
			V.nectarmessage = "traitGain";
			V.nectar_timer = 21;
		}
	}
}

function yearlyEventChecks() {
	// Valentines
	if (Time.monthName === "February" && Time.monthDay >= 6 && Time.monthDay <= 14) {
		V.valentines = 1;
		V.valentinesClothesMessage = 1;
	} else if (V.valentines) {
		delete V.valentines;
		delete V.valentines_eden;
		delete V.valentines_eden_bought;
		delete V.valentines_eden_bath;
		delete V.valentines_eden_breakfast;
		delete V.valentines_supermarket;
	}

	if (Time.monthName === "February" && Time.monthDay <= 14 && !V.avery_valentines && V.avery_mansion) {
		V.avery_valentines = {};

		V.avery_valentines.intro = false;
		V.avery_valentines.invite = false;
		V.avery_valentines.ready = false;
		V.avery_valentines.done = false;
		V.avery_valentines.reservation = false;
		V.avery_valentines.chocolate = false;
		V.avery_valentines.chocolate_asked = false;
		V.avery_valentines.opinion = "none";
		V.avery_valentines.confess = false;
		V.avery_valentines.food = "none";
		V.avery_valentines.soften = false;
		V.avery_valentines.talk = false;
		V.avery_valentines.talk_count = 0;
		V.avery_valentines.sex = "none";
		V.avery_valentines.end = "none";
		V.avery_valentines.end_talk = false;
		V.avery_valentines.missed_approach = false;
	} else if (V.avery_valentines && Time.monthName === "February" && Time.monthDay === 15) {
		if (V.avery_valentines.invite === true && !V.avery_valentines.done && !V.avery_valentines.missed_approach) {
			V.avery_valentines_missed = true;
		}
	} else if (V.avery_valentines && Time.monthName === "January") {
		delete V.avery_valentines;
	}

	// Halloween
	if (Time.monthName === "October" && Time.monthDay >= 21) {
		V.halloween = 1;
		V.halloweenClothesMessage = 1;
	} else if (V.halloween) {
		if (V.halloween_robin_costume && C.npc.Robin.outfits && C.npc.Robin.outfits.includes(V.halloween_robin_costume))
			wikifier("removeNNPCOutfit", "Robin", V.halloween_robin_costume);
		delete V.halloween;
		delete V.halloween_whitney;
		delete V.halloween_whitney_proposed;
		delete V.halloween_robin;
		delete V.halloween_robin_scare;
		delete V.halloween_robin_costume;
		delete V.halloween_winter_key;
		delete V.halloween_eden;
		delete V.halloween_eden_bought;
		delete V.halloween_eden_candy_given;
		delete V.halloween_trick_NPC;
	}
	if (Time.monthName === "November" && Time.monthDay >= 2) {
		delete V.halloween_kylar;
		delete V.halloween_kylar_proposed;
		delete V.halloween_kylar_whitney;
		delete V.halloween_lake;
		delete V.halloweenWolves;
	}

	// Christmas
	if (Time.monthName === "December" && Time.monthDay >= 18 && Time.monthDay <= 25) {
		V.christmas = 1;
		V.christmasClothesMessage = 1;
	} else if (V.christmas) {
		delete V.christmas;
		delete V.christmas_event;
		delete V.christmas_event_2;
		delete V.christmas_gift;
		delete V.christmas_gift_robin;
		delete V.christmas_wrap;
		delete V.christmas_gift_robin_wrapped;
		delete V.christmas_robin_lewd;
		delete V.christmas_robin_gift_received;
		delete V.christmas_gift_robin_given;
		delete V.christmas_gift_eden;
		delete V.christmas_gift_eden_given;
		delete V.christmas_kylar;
		delete V.christmas_whitney;
		delete V.edenmeal;
		delete V.eden_christmas_dinner;
		delete V.christmas_wraith;
	}
}

function moonState() {
	if (Time.monthDay === Time.lastDayOfMonth) {
		V.moonstate = "evening";
		V.moonEvent = true;
		wikifier("checkWraith", true);
	} else if (Time.monthDay === 1) {
		V.moonstate = "morning";
		wikifier("checkWraith", true);
	} else if (V.moonstate !== 0) {
		V.moonstate = 0;
		delete V.moonEvent;
		wikifier("clearWraith");
		delete V.noEarSlime;
	}
}
window.moonState = moonState;

function dailySchoolEffects() {
	V.schooleventtimer--;
	if (V.scienceproject === "ongoing") {
		V.scienceprojectdays--;
		if (V.scienceprojectdays < 0) {
			V.scienceproject = "done";
			wikifier("scienceprojectfinish");
		}
	}
	if (V.mathsproject === "ongoing") {
		V.mathsprojectdays--;
		if (V.mathsprojectdays < 0) {
			V.mathsproject = "done";
			wikifier("mathsprojectfinish");
		}
		V.mathslibrarystudent = 0;
	}
	if (V.englishPlay === "ongoing") {
		V.englishPlayDays--;
		if (V.englishPlayLate) {
			V.englishPlayLate--;
			if (V.englishPlayLate < 0) {
				delete V.englishPlayLate;
				V.englishPlayRoles.Sydney = "Cass";
			}
		}
		if (V.englishPlayDays < 0) {
			wikifier("englishplayfinish");
			V.englishPlay = "missed";
		}
	}
	let schoolTrauma = -5;
	if (V.schooltrait >= 4) schoolTrauma = -25;
	else if (V.schooltrait >= 3) schoolTrauma = -20;
	else if (V.schooltrait >= 2) schoolTrauma = -15;
	else if (V.schooltrait >= 1) schoolTrauma = -10;

	// Edge case for when the PC is in combat at midnight.
	if (V.combat === 1) statChange.trauma(schoolTrauma, "combat");
	else statChange.trauma(schoolTrauma);

	if (Time.isSchoolDay(Time.yesterday) && V.location !== "prison") {
		const attended = Object.keys(V.daily.school.attended).length;
		V.schoolLessonsMissed.science += !Number(V.daily.school.attended.science);
		if ([4, 6].includes(Time.weekDay)) {
			// Housekeeping classes take over days 3 and 5, added one to both since this occurs on the next day
			V.schoolLessonsMissed.housekeeping += !Number(V.daily.school.attended.housekeeping);
		} else {
			V.schoolLessonsMissed.maths += !Number(V.daily.school.attended.maths);
		}
		V.schoolLessonsMissed.english += !Number(V.daily.school.attended.english);
		V.schoolLessonsMissed.history += !Number(V.daily.school.attended.history);
		V.schoolLessonsMissed.swimming += !Number(V.daily.school.attended.swimming);
		V.lessonmissed += 5 - attended * 2; // Reduce lessonmissed if lessons are attended
		V.lessonmissed = Math.max(0, V.lessonmissed);
		V.lessonmissedtext = 5 - attended;
	}

	// Reset inspections before every term
	if (!Time.schoolTerm && V.schoolevent > 0) {
		V.schoolevent = 0;
		V.schooleventtimer = 10;
	}

	wikifier("schoolclothesreset");

	if (Time.schoolTerm && Time.weekDay > 2) {
		let delinquencyDecay = 1;
		if (C.npc.Leighton.love >= V.npclovehigh) delinquencyDecay++;
		if (C.npc.Sirris.love >= V.npclovehigh) delinquencyDecay++;
		if (C.npc.River.love >= V.npclovehigh) delinquencyDecay++;
		if (C.npc.Doren.love >= V.npclovehigh) delinquencyDecay++;
		if (C.npc.Winter.love >= V.npclovehigh) delinquencyDecay++;
		if (C.npc.Mason.love >= V.npclovehigh) delinquencyDecay++;
		if (V.lessonmissedtext) delinquencyDecay = Math.floor(delinquencyDecay / 2);
		statChange.delinquency(-delinquencyDecay / 4);
		if (V.schoolfameblackmail !== undefined) V.schoolfameblackmail++;
	}

	if (V.science_star >= 1) {
		wikifier("scienceskill", Math.clamp(V.science_star, 0, 3));
		V.science_star = 0;
	}
	if (V.maths_star >= 1) {
		wikifier("mathsskill", Math.clamp(V.maths_star, 0, 3));
		V.maths_star = 0;
	}
	if (V.english_star >= 1) {
		wikifier("englishskill", Math.clamp(V.english_star, 0, 3));
		V.english_star = 0;
	}
	if (V.history_star >= 1) {
		wikifier("historyskill", Math.clamp(V.history_star, 0, 3));
		V.history_star = 0;
	}

	V.school = V.science + V.english + V.maths + V.history;
	V.schooltrait = V.school >= 2800 ? 4 : V.school >= 2000 ? 3 : V.school >= 1600 ? 2 : V.school >= 1200 ? 1 : 0;

	if (V.studyBooks) {
		wikifier("passiveStudy");
		if (V.studyBooks.rented !== "none" && Time.schoolTerm) {
			if (V.book_rent_timer >= 0) {
				V.book_rent_timer--;
			} else if (V.book_rent_timer < 0) {
				if (V.bookOverdue === undefined) V.bookOverdue = 0;
				V.bookOverdue++;
				if (V.bookOverdue >= 7) {
					V.bookoverduemessage = 1;
					V.effectsmessage = 1;
				} else {
					V.bookoverduemessage = 2;
					V.effectsmessage = 1;
				}
			}
		}
		if (V.studyBooks.stolen !== "none" && Time.schoolTerm) wikifier("crimeUp", 1, "thievery");
		if (V.recentReturnTimer) {
			V.recentReturnTimer--;
			if (V.recentReturnTimer <= 0) delete V.recentReturnTimer;
		}
	}
	if (V.bookStolen === 1) {
		delete V.bookStolen;
		if (V.bookStolenKnown === undefined) V.bookStolenKnown = 1;
		if (V.libraryMoneyStolen === undefined) V.libraryMoneyStolen = 0;
		V.libraryMoneyStolen += 20;
		wikifier("crimeUp", 20, "thievery");
	}

	if (V.island !== undefined) {
		if (V.island.walnut >= 1) {
			const rng = random(0, V.island.walnut);
			V.island.walnut -= rng;
			V.island.walnut_dried += rng;
		}
	}

	if (V.temple_initiate_days !== undefined) {
		V.temple_initiate_days += 1;
	}
	if (V.temple_monk_days !== undefined) {
		V.temple_monk_days += 1;
	}
	if (V.temple_spar !== undefined) {
		delete V.temple_spar;
	}

	if (V.weekly.schoolNightPoolParty === "intro") V.weekly.schoolNightPoolParty = false;
}

function dailyMasochismSadismEffects() {
	const effects = (level, stat) => {
		switch (level) {
			case 0:
				if (stat >= 100) return { level: 1, message: "up 1" };
				break;
			case 1:
				if (stat >= 300) return { level: 2, message: "up 2" };
				else if (stat <= 50) return { level: 0, message: "down 0" };
				break;
			case 2:
				if (stat >= 500) return { level: 3, message: "up 3" };
				else if (stat <= 200) return { level: 1, message: "down 1" };
				break;
			case 3:
				if (stat >= 800) return { level: 4, message: "up 4" };
				else if (stat <= 400) return { level: 2, message: "down 2" };
				break;
			case 4:
				if (stat <= 700) return { level: 3, message: "down 3" };
				break;
		}
		return false;
	};

	V.masochism *= 0.985;
	const masochism = effects(V.masochism_level, V.masochism);
	if (masochism) {
		V.masochism_level = masochism.level;
		V.masochism_message = masochism.message;
		V.effectsmessage = 1;
	}
	V.sadism *= 0.985;
	const sadism = effects(V.sadism_level, V.sadism);
	if (sadism) {
		V.sadism_level = sadism.level;
		V.sadism_message = sadism.message;
		V.effectsmessage = 1;
	}
}

function dailyFarmEvents() {
	if (V.alex_greenhouse === 1) {
		if (Weather.precipitation === "none") V.alex_greenhouse_timer--;
		if (V.alex_greenhouse_timer < 1) {
			delete V.alex_greenhouse_timer;
			V.alex_greenhouse = 2;
		}
	}
	if (V.farm_stage >= 2) {
		T.disableFarmWorkFeat = true;
		wikifier("farm_work_update", "midnight");
	}
	if (V.farm_stage >= 5) {
		if (V.bailey_encroach >= 1) wikifier("farm_aggro", 15);
		if (V.bailey_encroach >= 2) wikifier("farm_aggro", V.bailey_encroach * 3);
		if (V.farm_stage >= 7) wikifier("farm_aggro", 5);
		wikifier("farm_aggro", 5);
	}
	if (V.farm_stage >= 7) {
		V.farm_attack_timer--;
		if (V.farm_attack_timer < 0) wikifier("farm_attack_auto");
		if (V.farm.stock) {
			/**
			 * Alex's Cottage can store up to 10 days of food, or up to £2,169 when sold in a Market Stall.
			 *
			 * The food should realistically expire at different rates, but doing so would make the mechanic more
			 * complex without providing a meaningful improvement to gameplay.
			 */
			V.farm.stock.truffles = Math.trunc(V.farm.stock.truffles * 0.9);
			V.farm.stock.milk = Math.trunc(V.farm.stock.milk * 0.9);
			V.farm.stock.eggs = Math.trunc(V.farm.stock.eggs * 0.9);
			V.farm.stock.cream = Math.trunc(V.farm.stock.cream * 0.9);
		}
		if (V.farm.woodland >= 3) {
			// Truffles sell for £8.00 on the market.
			// This generates £8.00 * 16.5 = £132.00 each day
			wikifier("farm_stock", "truffles", 9, 24);
			wikifier("farm_pigs", -1);
		} else if (V.farm.woodland >= 1) {
			// This generates £8.00 * 4.5 = £36.00 each day
			wikifier("farm_stock", "truffles", 3, 6);
			wikifier("farm_pigs", -0.5);
		}
		if (V.farm.barn >= 2) {
			// Milk and Cream each sell for £1.00 on the market.
			// This generates £1.00 * (37.5 + 27) = £64.50 each day
			wikifier("farm_stock", "milk", 27, 48);
			wikifier("farm_stock", "cream", 18, 36);
		} else if (V.farm.barn >= 1) {
			// This generates £1.00 * (10.5 + 7.5) = £18.00 each day
			wikifier("farm_stock", "milk", 9, 12);
			wikifier("farm_stock", "cream", 6, 9);
		}
		if (V.farm.coop >= 2) {
			// Eggs sell for £0.40 on the market.
			// This generates £0.40 * (51) = £20.40 each day
			wikifier("farm_stock", "eggs", 30, 72);
		} else if (V.farm.coop >= 1) {
			// This generates £0.40 * (18) = £7.20 each day
			wikifier("farm_stock", "eggs", 12, 24);
		}
		if (V.farm.kennel >= 1) {
			/**
			 * I think it would be very funny if the Kennel also gave -1 Horse Respect per day. That way, if the player returns to the farm with every animal at -30 respect, there will be an Animal Farm easter egg saying stuff like, "The animals are plotting." or "You hear singing in the barn +Stress" after midnight.
			 *
			 * Probably too political for DOL, though.
			 */
			wikifier("farm_dogs", -1);
			wikifier("farm_cattle", -1);
		}
		wikifier("farm_build_day");
	}
	if (V.farm_stage >= 9) {
		if (V.lurkers_stored >= 1) {
			V.farm.still_timer--;
			if (V.farm.still_timer < 1) {
				V.lurkers_stored--;
				V.phials_stored++;
				V.farm.still_timer = 7;
			}
		}
	}
	if (V.farm_countdown >= 1) V.farm_countdown--;
	if (V.farm_yield !== undefined) {
		if (!V.farm_yield_alex) V.farm_yield_alex = 0;
		V.farm_yield_alex += V.farm_yield;
		delete V.farm_yield;
	}
	if (V.alex_countdown >= 1) V.alex_countdown--;

	delete V.farm_count;
	if (V.farm_stage < 7) delete V.farm_naked;
	delete V.farm_work;
	delete V.farm_event;
	delete V.farm_end;
	delete V.alex_breakfast;
	delete V.alex_tea;
	delete V.alex_to_bed;
}

function dailyDockEffects() {
	if (typeof V.docks.pub.cooldown !== "undefined" && V.docks.pub.cooldown >= 1) {
		V.docks.pub.cooldown--;
	}
}

function passWater(passMinutes) {
	/* To be reworked */
	/* Tie wetness to clothing items - can dry differently depending on their warmth
	   dryingFactor, sun/no sun, temperature
	   change wetness to 0-1 (0-100%)
	*/
	if (!V.outside || (V.outside && Weather.precipitation === "none")) {
		const temperature = V.outside ? Weather.temperature : Weather.insideTemperature;
		const dryingFactor = 0.1 + (temperature / 25) * ((1 + Weather.sunIntensity) * 2);
		if (V.upperwet) statChange.wet("upper", -passMinutes * dryingFactor);
		if (V.lowerwet) statChange.wet("lower", -passMinutes * dryingFactor);
		if (V.underlowerwet) statChange.wet("under_lower", -passMinutes * (V.worn.lower.type.includes("naked") ? dryingFactor : dryingFactor * 0.5));
		if (V.underupperwet) statChange.wet("under_upper", -passMinutes * (V.worn.upper.type.includes("naked") ? dryingFactor : dryingFactor * 0.5));
	} else if (V.outside && Weather.precipitation === "rain" && !V.worn.head.type.includes("rainproof") && !V.worn.handheld.type.includes("rainproof")) {
		passMinutes *= Weather.precipitationIntensity;
		if (!V.worn.upper.type.includes("naked") && !waterproofCheck(V.worn.upper) && !waterproofCheck(V.worn.over_upper)) {
			statChange.wet("upper", passMinutes);
		}
		if (!V.worn.lower.type.includes("naked") && !waterproofCheck(V.worn.lower) && !waterproofCheck(V.worn.over_lower)) {
			statChange.wet("lower", passMinutes);
		}
		// eslint-disable-next-line prettier/prettier
		if (!V.worn.under_lower.type.includes("naked") && !waterproofCheck(V.worn.under_lower) && !waterproofCheck(V.worn.lower) && !waterproofCheck(V.worn.over_lower)) {
			statChange.wet("under_lower", passMinutes);
		}
		// eslint-disable-next-line prettier/prettier
		if (!V.worn.under_upper.type.includes("naked") && !waterproofCheck(V.worn.under_upper) && !waterproofCheck(V.worn.upper) && !waterproofCheck(V.worn.over_upper)) {
			statChange.wet("under_upper", passMinutes);
		}
	}
}

// (Directly converted from passArousalWetness widget - included comments)
function passArousalWetness(passMinutes) {
	let wetnessChange = 0;
	const arousalPercent = Math.clamp(V.arousal / V.arousalmax, 0, 1);

	// Vaginal lube is produced at a fairly linear rate, between 1-3 per minute based on arousal.
	if (V.arousal >= V.arousalmax * (2 / 5)) {
		wetnessChange = 1 + arousalPercent * 2;
		// It also gets harder to build up the closer you get to full wetness
		const wetnessPercent = Math.clamp(V.vaginaArousalWetness / 100, 0, 1);
		wetnessChange = Math.floor(wetnessChange * 2 * (1 - wetnessPercent));
	}

	// It dries up at a gradually increasing rate, starting at 0.1 per minute, but increasing the longer it's been since last arousal.
	// It also dries slower at high arousal, in an inverse relationship.
	wetnessChange -= 0.1 * V.timeSinceArousal * (1 - arousalPercent);

	// If wetnessChange would go negative and arousal is high enough, wetness instead does not change.
	if (V.arousal >= V.arousalmax * (3 / 5) && wetnessChange < 0) wetnessChange = 0;
	V.vaginaArousalWetness += Math.round(wetnessChange * passMinutes);

	// Arbitrarily, we'll say that the player's vagina holds up to 60 units of lube, and it begins to leak out above 60.
	if (V.vaginaArousalWetness >= 60) {
		V.vaginaArousalWetness = Math.floor(120 - 3600 / V.vaginaArousalWetness);

		// Clothing dries at a rate of -1 * passMinutes. To offset that, it needs to be wet by at least 1 * passMinutes. -->
		// Expected rate: between 1 and 2.61, usually around 1.8
		const change = Math.clamp(1 + Math.log10(V.vaginaArousalWetness - 59), 1, 3);
		if (!V.worn.under_lower.type.includes("naked") && !V.worn.under_lower.type.includes("swim")) {
			statChange.wet("under_lower", Math.round(change * passMinutes));
			statChange.wet("under_lower", Math.clamp(V.underlowerwet, 0, 100 + passMinutes));
			V.pantiesSoaked = V.underlowerwet >= 100;
		}
	}
	if (V.earSlime.focus === "pregnancy" && V.earSlime.growth >= 75) {
		// Prevent it from dropping below 30 or 60 when the ear slime has fully grown with a focus on pregnancy
		V.vaginaArousalWetness = Math.clamp(V.vaginaArousalWetness, V.earSlime.growth >= 100 ? 60 : 30, 100);
	} else {
		V.vaginaArousalWetness = Math.clamp(V.vaginaArousalWetness, 0, 100);
	}
	wikifier("vaginaWetnessCalculate");
}

function getArousal(passMinutes) {
	const minuteMultiplier = passMinutes * 10;
	let addedArousal = 0;

	if (V.penilechastityparasite) addedArousal += minuteMultiplier * V.genitalsensitivity;
	if (V.vaginalchastityparasite) addedArousal += minuteMultiplier * V.genitalsensitivity;
	if (V.parasite.nipples.name) addedArousal += minuteMultiplier * V.breastsensitivity;
	if (V.parasite.penis.name && V.parasite.penis.name !== "parasite") addedArousal += minuteMultiplier * V.genitalsensitivity;
	if (V.parasite.clit.name && V.parasite.clit.name !== "parasite") addedArousal += minuteMultiplier * V.genitalsensitivity;
	if (V.parasite.tummy.name) addedArousal += minuteMultiplier / 4;
	if (V.parasite.bottom.name) addedArousal += minuteMultiplier * V.bottomsensitivity;
	if (V.analchastityparasite) addedArousal += minuteMultiplier;
	if (V.parasite.tummy.name) addedArousal += minuteMultiplier;
	if (V.parasite.left_arm.name) addedArousal += minuteMultiplier;
	if (V.parasite.right_arm.name) addedArousal += minuteMultiplier;
	if (V.parasite.left_thigh.name) addedArousal += minuteMultiplier;
	if (V.parasite.right_thigh.name) addedArousal += minuteMultiplier;
	if (V.drugged > 1) addedArousal += minuteMultiplier;
	if (playerHasButtPlug()) addedArousal += minuteMultiplier;
	if (numberOfEarSlime()) {
		if (V.parasite.left_ear.name === "slime" && random(1, 10) >= 9) statChange.drugs(Math.min(60, passMinutes));
		if (V.parasite.right_ear.name === "slime" && random(1, 10) >= 9) statChange.drugs(Math.min(60, passMinutes));
	}
	if (V.earSlime.growth > 100 && random(1, 10) >= 9) statChange.drugs(Math.min(60, passMinutes));

	if (
		!V.hypnosis_traits.silence &&
		(V.worn.genitals.name === "chastity parasite" ||
			(V.parasite.penis.name && V.parasite.penis.name === "parasite") ||
			(V.parasite.clit.name && V.parasite.clit.name === "parasite"))
	) {
		if (!V.masturbating) {
			if (V.earSlime.corruption >= 100 && !V.earSlime.defyCooldown && !V.earSlime.vibration && !V.earSlime.event) {
				V.earSlime.lastVibration += passMinutes;
				if (V.earSlime.lastVibration > random(240, 720)) {
					V.earSlime.vibration = random(60, 120);
					V.earSlime.lastVibration = 0;
				}
			}
			if (V.earSlime.defyCooldown) {
				if (V.pain < 25) V.pain += Math.clamp(passMinutes, 0, 20 - Math.floor(V.pain));
				if (V.worn.genitals.name === "chastity parasite") {
					// Helps to reduce the penis size
					V.penisgrowthtimer += Math.floor(Math.clamp(passMinutes / 8, 0, (passMinutes * 60) / V.earSlime.defyCooldown));
				}
			} else if (V.earSlime.vibration > 0) {
				addedArousal += Math.clamp(minuteMultiplier * 4, 0, V.earSlime.vibration * 40) * V.genitalsensitivity;
				V.earSlime.vibration -= Math.clamp(passMinutes, 0, V.earSlime.vibration);
				V.earSlime.lastVibration = Math.clamp(passMinutes - V.earSlime.vibration, 0, Infinity);
			}
		}
	} else {
		V.earSlime.vibration = 0;
		V.earSlime.lastVibration = 0;
	}

	return addedArousal;
}

function earSlimeDaily(passageEffects = false) {
	if (!passageEffects) {
		// Stats
		V.earSlimeDaysStat++;
		V.earSlime.days++;
		if (V.earSlime.days > V.earSlimePassiveDaysStat && !V.earSlime.startedThreats) V.earSlimePassiveDaysStat = V.earSlime.days;

		// Daily Events
		if (V.earSlime.eventTimer > -10) V.earSlime.eventTimer--;
		if (V.earSlime.event === "") V.earSlime.eventTimer -= Math.ceil(V.earSlime.corruption / 40);
		if (V.earSlime.eventTimer < 1) V.earSlime.event = "";
		V.earSlime.eventTimer = Math.clamp(V.earSlime.eventTimer, V.earSlime.corruption / -5 - 5, 10);

		// Daily Growth
		if (V.earSlime.corruption >= 60 && V.earSlime.corruption > V.earSlime.growth / 2) {
			if (numberOfEarSlime() > 1) V.earSlime.growth += 2;
			else if (V.earSlime.growth < 50) V.earSlime.growth++;
		} else if (V.earSlime.corruption < 30 && V.earSlime.growth <= 50) {
			// Reduce the growth variable only if below or equal to 50
			V.earSlime.growth--;
		}
	}
	V.earSlime.growth = Math.clamp(V.earSlime.growth, 0, V.earSlime.focus === "none" ? 50 : 200);

	// Growth Changes
	if (V.earSlime.growth >= 75 && V.parasite.breasts.name !== "parasite") {
		wikifier("parasite", "breasts", "parasite", "noSuck");
		V.effectsmessage = 1;
		V.earSlimebreastsParasite = 1;
	}

	if (V.earSlime.growth >= 100) {
		if (
			(V.earSlime.growth >= 100 && V.player.sex !== "f" && V.parasite.penis.name !== "parasite") ||
			(V.earSlime.growth >= 100 && V.player.sex === "f" && V.parasite.clit.name !== "parasite")
		) {
			if (V.player.sex !== "f") {
				V.effectsmessage = 1;
				V.earSlimePenisParasite = 1;
				if (V.parasite.penis.name && V.parasite.penis.name !== "parasite") {
					V.earSlimePenisParasite = V.parasite.penis.name;
					wikifier("removeparasite", "penis");
				}
				wikifier("parasite", "penis", "parasite", "noSuck");
			} else {
				V.effectsmessage = 1;
				V.earSlimeClitParasite = 1;
				if (V.parasite.clit.name && V.parasite.clit.name !== "parasite") {
					V.earSlimeClitParasite = V.parasite.clit.name;
					wikifier("removeparasite", "clit");
				}
				wikifier("parasite", "clit", "parasite", "noSuck");
				if (["mixed", "impregnation"].includes(V.earSlime.focus) && V.player.sex === "f") V.player.penisExist = true;
			}
		}

		// Breaks chastity gear over time, attempts to equip a chastity parasite if it applies
		if (!["naked", "chastity parasite"].includes(V.worn.genitals.name) && playerChastity()) {
			V.worn.genitals.integrity -= 500;
			if (V.worn.genitals.integrity <= 0) {
				V.effectsmessage = 1;
				V.penisslimebrokenchastitymessage = V.worn.genitals.name;
				V.worn.genitals.type.push("broken");
				wikifier("genitalsruined");
			}
		}

		if (V.earSlime.focus === "pregnancy" && V.player.penisExist) {
			if (V.worn.genitals.name === "naked" && !V.masturbating) {
				// Equips a chastity parasite
				V.effectsmessage = 1;
				V.penisslimecagemessage = 1;
				wikifier("genitalswear", 8);
				V.worn.genitals.origin = "ear slime";
			} else if (V.worn.genitals.name === "chastity parasite" && V.worn.genitals.integrity < clothingData("genitals", V.worn.genitals, "integrity_max")) {
				// Repairs the chastity parasite
				if (integrityKeyword(V.worn.genitals, "genitals") !== "full") {
					V.effectsmessage = 1;
					V.penisslimecagemessage = 2;
				}
				V.worn.genitals.integrity = clothingData("genitals", V.worn.genitals, "integrity_max");
			}
		}
		if (V.earSlime.forcedDressing && V.earSlime.forcedDressing.days > 0) {
			V.earSlime.forcedDressing.days--;
		}
	}

	if (V.earSlime.forcedCommando && V.earSlime.forcedCommando > 0) {
		V.earSlime.forcedCommando--;
	}
}
DefineMacro("earSlimeDaily", earSlimeDaily);

/**
 * Overloads:
 *
 * 	 (minutes)
 * 	getTimeString(hours, minutes)
 * Examples:
 *
 * 	getTimeString(20) returns "0:20"
 * 	getTimeString(1,5) returns "1:05".
 *
 * @param {...any} args
 */
function getTimeString(...args) {
	if (args[0] == null) return;
	const hours = args[1] != null ? args[0] : 0;
	const minutes = Math.max(args[1] != null ? args[1] : args[0], 0) + hours * 60;
	return Math.trunc(minutes / 60) + ":" + ("0" + Math.trunc(minutes % 60)).slice(-2);
}
window.getTimeString = getTimeString;

/* Returns a date formatted for the user's dateFormat
 * getFormattedDate() returns a long date with optional weekday (e.g. [Sunday ]the 4th of September)
 * getShortFormattedDate() returns an abbreviated date (e.g. 4th Sep)
 */
window.getFormattedDate = function (date, includeWeekday = false) {
	switch (V.options.dateFormat) {
		case "en-US": {
			const formattedDate = date.monthName + " " + ordinalSuffixOf(date.day);
			return includeWeekday ? date.weekDayName + ", " + formattedDate : formattedDate;
		}
		case "zh-CN": // Fallthrough to en-GB
		case "en-GB": {
			const formattedDate = "the " + ordinalSuffixOf(date.day) + " of " + date.monthName;
			return includeWeekday ? date.weekDayName + " " + formattedDate : formattedDate;
		}
		default:
			throw new Error(`Invalid date format: ${V.options.dateFormat}`);
	}
};

window.getShortFormattedDate = function (date) {
	switch (V.options.dateFormat) {
		case "en-US":
			return date.monthName.slice(0, 3) + " " + ordinalSuffixOf(date.day);
		case "zh-CN":
		case "en-GB":
			return ordinalSuffixOf(date.day) + " " + date.monthName.slice(0, 3);
		default:
			throw new Error(`Invalid date format: ${V.options.dateFormat}`);
	}
};

/* Determines and replenishes stock at supermarket */
function supermarketWeekly() {
	Object.keys(setup.foodstuff).forEach(key => {
		if (setup.foodstuff[key].shop.available_in?.includes("supermarket"))
			V.foodstuff[key].supermarket = Math.trunc(3000 / setup.foodstuff[key].shop.sell_price);
	});
}
DefineMacro("supermarketWeekly", supermarketWeekly);
