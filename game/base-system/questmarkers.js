const events = [
	{
		// event name for debugging and logging failures
		name: "school day",
		// conditions for the reminder to show up
		// must be specific enough to no longer trigger once the event is actually attended. mandatory.
		condition() {
			return Time.schoolDay && (Object.keys(V.daily.school.attended).length < 5 || Time.hour < 15);
		},
		// arriving at any time during this hour brings no penalties to the event
		starthour: 8,
		// the last hour during which the event can still be attended. puts event in top priority tier during that hour. shows a failure message after that hour if condition() is still true.
		endhour: 14,
		// bigger number === higher chance of it being pulled. default is 1.
		priority: 5, // prioritise avoiding truancy
		// text shown in twine markup while event is scheduled
		text: "<<schoolday>>",
		// text shown if condition() is still met, but it's past the time to attend
		failuretext:
			"You have missed <<print Object.keys(V.daily.school.attended).length === 4 ? 'a lesson' : `<<number ${5 - Object.keys(V.daily.school.attended).length}>>` + ' lessons'>> today.",
	},
	{
		// example of a lazy event that will still work
		name: "tomorrow",
		condition() {
			return Time.isSchoolDay(Time.tomorrow) && (!Time.schoolDay || Time.hour > 14);
		},
		text: "You have school tomorrow.",
	},
	{
		// fallback event when no others are available
		name: "no school",
		condition() {
			// other school-related events have higher priority anyway
			return true;
		},
		text: "There's no school tomorrow.",
		priority: 0,
	},
	{
		name: "avery date",
		condition() {
			return V.avery_mansion?.schedule !== "away" && V.averydate === 1 && V.averydatedone !== 1 && V.averydateattended !== 1 && Time.weekDay === 7;
		},
		starthour: 20,
		endhour: 20,
		priority: 4,
		text: "You have a date with Avery <<print $avery_mansion ? 'in the mansion garage': 'on Domus Street'>> <<if Time.hour is 20>><span class='gold'>right now</span>.<<else>>at <<ampm 20 00>>.<</if>>",
		failuretext: "You didn't show up for your date with Avery.",
	},
	{
		name: "avery valentines date",
		condition() {
			return V.avery_valentines?.invite && !V.avery_valentines.done && Time.month === 2 && Time.monthDay === 14;
		},
		get starthour() {
			return V.avery_mansion ? 21 : 20;
		},
		endhour: 24,
		priority: 4,
		text: "You have a <span class='pink'>Valentine's date</span> with Avery <<if $avery_mansion>>in the mansion garage from <<ampm 21 00>><<elseif Time.hour lt 20>>on Domus Street from <<ampm 20 00>><</if>>.",
		failuretext: "You have missed your Valentine's date with Avery.",
	},
	{
		name: "community service",
		condition() {
			return V.community_service >= 1 && V.community_service_done !== 1;
		},
		starthour: 6,
		endhour: 20,
		priority: 1,
		text: "The police station on Barb Street expects you for community service.",
		failuretext: "You didn't attend your community service today.",
	},
	{
		name: "harper appointment",
		condition() {
			return (V.harper_appointments.enabled || V.schoolPsych === 1) && Time.weekDay === 6 && V.daily.harperVisit !== 1;
		},
		priority: 2,
		text: "You <<print $harper_appointments.enabled ? 'have an' : 'may get an'>> appointment with Doctor Harper at the hospital today.",
		failuretext: "You have missed <<print $harper_appointments.enabled ? 'an' : 'a chance to get an'>> appointment with Doctor Harper.",
	},
	{
		name: "brothel show",
		condition() {
			return V.brothelshowdata.type !== "none" && V.brothelshowdata.intro && Time.weekDay === 6 && !V.brothelshowdata.done;
		},
		priority: 3,
		text: "You're expected to perform a <<print $brothelshowdata.type>> show at the brothel today.",
	},
	{
		name: "escort job",
		condition() {
			const job = V.brothel_escortjob;
			if (!job) return;
			if (job.done || job.escape || job.missed || !job.accept) return;
			return Time.monthDay === new DateTime(job.date).day;
		},
		get starthour() {
			return new DateTime(V.brothel_escortjob.date).hour;
		},
		get endhour() {
			return this.starthour;
		},
		priority: 6,
		text: "You have an escort job at <<ampm `new DateTime(V.brothel_escortjob.date).hour`>>.",
		failuretext: "You missed your escort job.",
	},
	{
		name: "wren heist",
		condition() {
			return V.wrenHeist === true && V.wrenHeistDance.attended !== true;
		},
		starthour: 19,
		endhour: 20,
		priority: 3,
		text: "Wren waits for you between <<ampm 19 00>> and <<ampm 21 00>> on Danube Street.",
	},
	{
		name: "smugglers",
		condition() {
			return V.smuggler_known === 1 && V.smuggler_timer === 0;
		},
		starthour: 21,
		endhour: 24,
		priority: 5,
		text: "You heard that smugglers are moving their goods <<switch $smuggler_location>><<case 'forest'>>through the forest<<case 'sewer'>>through the old sewers<<case 'beach'>>at the rocks near the beach<<case 'bus'>>on a bus<<default>><</switch>> tonight, before midnight.",
	},
	{
		name: "remy attacc",
		condition() {
			return V.farm_stage >= 7 && V.farm_attack_timer === 0;
		},
		starthour: 21,
		endhour: 24,
		priority: 3,
		text: "Remy will attack the farm tonight between <<ampm 21 00>> and midnight.",
	},
	{
		name: "adult shop help",
		condition() {
			return (
				V.adultshopprogress < 22 &&
				V.adultshopintro === 1 &&
				V.adultshopunlocked === undefined &&
				!V.daily.dilapidatedShopHelp &&
				Time.weekDay === 6 &&
				(Time.hour <= 15 || V.adultshopstate === "sydney")
			);
		},
		starthour: 16,
		endhour: 19,
		priority: 6,
		text: "The adult shop on Elk Street is undergoing renovations after <<ampm 16>> today.",
		failuretext: "You didn't help <<if C.npc.Sydney.init>>Sydney<</if>> at the adult shop today.",
	},
	{
		name: "science fair",
		condition() {
			return V.scienceproject === "ongoing" && V.scienceprojectdays === 0;
		},
		starthour: 9,
		endhour: 18,
		priority: 5,
		text: "The science fair is being held at Cliff Street from <<ampm 9 00>> until <<ampm 18 00>>.",
		failuretext: "The science fair has ended. You didn't attend.",
	},
	{
		name: "science fair tomorrow",
		condition() {
			return V.scienceprojectdays === 1;
		},
		priority: 2,
		text: "The science fair is being held at Cliff Street tomorrow.",
	},
	{
		name: "maths competition",
		condition() {
			return V.mathsprojectdays === 0 && V.mathsproject === "ongoing";
		},
		starthour: 9,
		endhour: 18,
		priority: 5,
		text: "The maths competition is being held at Cliff Street from <<ampm 9 00>> until <<ampm 18 00>>.",
		failuretext: "The maths competition has ended. You didn't attend.",
	},
	{
		name: "maths competition tomorrow",
		condition() {
			return V.mathsprojectdays === 1;
		},
		priority: 2,
		text: "The maths competition is being held at Cliff Street tomorrow.",
	},
	{
		name: "english play",
		condition() {
			return V.englishPlayDays === 0 && V.englishPlay === "ongoing";
		},
		starthour: 17,
		endhour: 21,
		priority: 5,
		text: "The school plays are being held today at Cliff Street from <<ampm 17 00>> until <<ampm 21 00>>.",
		failuretext: "The last of the school plays has finished by now. You didn't attend.",
	},
	{
		name: "english play tomorrow",
		condition() {
			return V.englishPlayDays === 1;
		},
		priority: 2,
		text: "The school plays are being held at Cliff Street tomorrow.",
	},
];
setup.events = events;

Macro.add("questmarker", {
	handler() {
		const br = () => this.output.append(document.createElement("br"));
		// silence notifications in hopeless cycle and bad ends
		if (V.hc || ["prison", "asylum"].includes(V.location) || V.statFreeze) return;
		const qualifiedEvents = events.filter(ev => ev.condition());
		// display failure messages for missed events
		qualifiedEvents.forEach(ev => {
			if (!ev.failuretext || Time.hour <= (ev.endhour || 24)) return;
			const failvar = ev.name + "fail";
			if (V.daily[failvar]) return;
			V.daily[failvar] = 1;
			const div = document.createElement("div");
			div.classList.add("purple");
			div.append(Wikifier.wikifyEval(ev.failuretext));
			this.output.append(div);
			br();
		});

		let importants = [];
		// find the most important notification
		// first go events about to expire
		importants = qualifiedEvents.filter(ev => ev.endhour === Time.hour);
		// second go events underway (unless they are all-day events that don't have starthour)
		if (!importants.length) importants = qualifiedEvents.filter(ev => between(Time.hour, ev.starthour, ev.endhour == null ? 24 : ev.endhour));
		// third go upcoming and all day events
		if (!importants.length) importants = qualifiedEvents.filter(ev => Time.hour <= (ev.endhour == null ? 24 : ev.endhour));
		if (!importants.length) return;
		// find the highest priority of available events
		let topprio = 0;
		importants.forEach(ev => {
			// make sure priority exists for filtering later
			if (ev.priority == null) ev.priority = 1;
			if (ev.priority > topprio) topprio = ev.priority;
		});
		// pick a random event from highest priority ones
		const pick = importants.filter(ev => ev.priority === topprio).random();
		const div = document.createElement("div");
		div.append(Wikifier.wikifyEval(pick.text));
		this.output.append(div);
		br();

		/* alternatively, here goes the code to display all active events at once rather than the top one. can end up cluttering the sidebar.
		let counter = 0;
		qualifiedEvents.forEach(ev => {
			const div = document.createElement("div");
			if (Time.hour <= (ev.endhour || 24)) {
				div.append(Wikifier.wikifyEval(ev.text));
				this.output.append(div);
				br();
				counter++;
			}
		});
		if (counter > 0) this.output.append(br);
		*/
	},
});
