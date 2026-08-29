/* eslint-disable no-undef */
/*
	Key points
	series: "seriesName", //Will only show the first locked feat in a series to the player
	softLockable: true, //Will disable the unlocking of the feat if softmode is enabled
	pregnancyLockable: true, //Will disable the unlocking of the feat if certain pregnancy settings are too low
	hidden: true, //Will hide the feat at all times unless unlocked, best for feats for unreleased content
	alt: "altTitle", //Alternate title to display if the feat is unlocked and altCond is met
	altCond: "conditional" //Conditional evaluated to decide whether or not to display the altTitle (the feat must be owned in the current save for this to happen, regardless of the conditional)
*/
setup.feats = {
	"Pocket Change": {
		title: "Pocket Change",
		desc: "Have £1,000.",
		difficulty: 1,
		series: "money",
		filter: ["All", "General"],
		softLockable: true,
	},
	"Money Maker": {
		title: "Money Maker",
		desc: "Have £10,000.",
		difficulty: 1,
		series: "money",
		filter: ["All", "General"],
		softLockable: true,
	},
	Tycoon: {
		title: "Tycoon",
		desc: "Have £100,000.",
		difficulty: 2,
		series: "money",
		filter: ["All", "General"],
		softLockable: true,
	},
	Millionaire: {
		title: "Millionaire",
		desc: "Have £1,000,000.",
		difficulty: 3,
		series: "money",
		filter: ["All", "General"],
		softLockable: true,
	},
	"It Belongs in a Museum": {
		title: "It Belongs in a Museum!",
		desc: "Find all the artefacts.",
		difficulty: 3,
		series: "",
		filter: ["All", "General"],
		softLockable: true,
	},
	"Fully Covered": {
		title: "Fully Covered",
		desc: "Drenched in something other than water.",
		difficulty: 3,
		series: "",
		filter: ["All", "General"],
	},
	"Being a Boy": {
		title: "Being a Boy",
		desc: "Get to day 50 as a boy.",
		difficulty: 1,
		series: "",
		filter: ["All", "General"],
		softLockable: true,
	},
	"Being a Girl": {
		title: "Being a Girl",
		desc: "Get to day 50 as a girl.",
		difficulty: 1,
		series: "",
		filter: ["All", "General"],
		softLockable: true,
	},
	"Being a Hermaphrodite": {
		title: "Being a Hermaphrodite",
		desc: "Get to day 50 as a hermaphrodite.",
		difficulty: 1,
		series: "",
		filter: ["All", "General"],
		softLockable: true,
	},
	"Being an Orphan": {
		title: "Being an Orphan",
		desc: "Get to day 150.",
		difficulty: 2,
		series: "",
		filter: ["All", "General"],
		softLockable: true,
	},
	"Stressful Challenge": {
		title: "Stressful Challenge",
		desc: "Get to day 50 without passing out.",
		difficulty: 2,
		series: "challenge",
		filter: ["All", "General"],
		softLockable: true,
	},
	"Long Stressful Challenge": {
		title: "Long Stressful Challenge",
		desc: "Get to day 150 without passing out.",
		difficulty: 3,
		series: "challenge",
		filter: ["All", "General"],
		softLockable: true,
	},
	Billboard: {
		title: "Billboard",
		desc: "Wear an advert and have it pay off.",
		difficulty: 1,
		series: "",
		filter: ["All", "General"],
	},
	"A Living Canvas": {
		title: "A Living Canvas",
		desc: "Ink on every part.",
		difficulty: 1,
		series: "",
		filter: ["All", "General"],
	},
	Farmhand: {
		title: "Farmhand",
		desc: "Help Alex expand the farm.",
		difficulty: 2,
		series: "alex",
		filter: ["All", "General"],
	},
	Farmer: {
		title: "Farmer",
		desc: "Return the farm to its former glory.",
		difficulty: 3,
		series: "alex",
		filter: ["All", "General"],
	},
	Cultivator: {
		title: "Cultivator",
		desc: "Claim every field at Alex's farm.",
		difficulty: 3,
		series: "alex",
		filter: ["All", "General"],
	},
	"The Rival Farm": {
		title: "The Rival Farm",
		desc: "Fully upgrade a farm expansion.",
		difficulty: 2,
		series: "farm",
		filter: ["All", "General"],
	},
	"The Rival Estate": {
		title: "The Rival Estate",
		desc: "Build all the farm expansions.",
		difficulty: 3,
		series: "farm",
		filter: ["All", "General"],
	},
	"Heroic Victory": {
		title: "Heroic Victory",
		desc: "Defend nine fields from Remy, lose none.",
		difficulty: 3,
		series: "",
		filter: ["All", "General"],
	},
	"Five in a Row": {
		title: "Five in a Row",
		desc: "Win five games of blackjack in a row.",
		difficulty: 1,
		series: "",
		filter: ["All", "General"],
	},
	Distinction: {
		title: "Distinction",
		desc: "Win a distinction on a school exam.",
		difficulty: 1,
		series: "distinction",
		filter: ["All", "General"],
	},
	Distinctive: {
		title: "Distinctive",
		desc: "Win 5 distinctions on school exams.",
		difficulty: 2,
		series: "distinction",
		filter: ["All", "General"],
	},
	Distinguished: {
		title: "Distinguished",
		desc: "Win 15 distinctions on school exams.",
		difficulty: 3,
		series: "distinction",
		filter: ["All", "General"],
	},
	"Chef de Tournant": {
		title: "Chef de Tournant",
		desc: "Learn 5 recipes.",
		difficulty: 1,
		series: "chef",
		filter: ["All", "General"],
	},
	"Chef de Partie": {
		title: "Chef de Partie",
		desc: "Learn 20 recipes.",
		difficulty: 2,
		series: "chef",
		filter: ["All", "General"],
	},
	"Sous Chef": {
		title: "Sous Chef",
		desc: "Learn 50 recipes.",
		difficulty: 3,
		series: "chef",
		filter: ["All", "General"],
	},
	"Science Fair Winner": {
		title: "Science Fair Winner",
		desc: "Blind them with science.",
		difficulty: 2,
		series: "scienceFair",
		filter: ["All", "General"],
		softLockable: true,
	},
	"Thesis Offence": {
		title: "Thesis Offence",
		desc: "You maintained your scientific integrity by force.",
		difficulty: 3,
		series: "scienceFair",
		filter: ["All", "General"],
		hint: "Hint: Blind them with something not-quite-scientific.",
		softLockable: true,
	},
	"Maths Competition Winner": {
		title: "Maths Competition Winner",
		desc: "Sordid advantage or no.",
		difficulty: 2,
		series: "",
		filter: ["All", "General"],
		softLockable: true,
	},
	"Rich Hearts": {
		title: "Rich Hearts",
		desc: "Perform well during the English class stage play.",
		difficulty: 2,
		series: "",
		filter: ["All", "General"],
		softLockable: true,
	},
	"50 Shades of Tan": {
		title: "50 Shades of Tan",
		desc: "Achieved 5 distinct tan lines at once.",
		difficulty: 2,
		series: "",
		filter: ["All", "Special"],
		hint: "Hint: Spend some time in the sun.",
	},
	"Most Aware": {
		title: "Most Aware",
		desc: "You see things others don't.",
		difficulty: 1,
		series: "",
		filter: ["All", "Stats"],
	},
	"Most Innocent": {
		title: "Most Innocent",
		desc: "Everything is fine.",
		difficulty: 1,
		series: "",
		filter: ["All", "Stats"],
	},
	"No More Control": {
		title: "No More Control",
		desc: "You don't know how to get lewder!",
		difficulty: 2,
		series: "",
		filter: ["All", "Stats"],
	},
	Thief: {
		title: "Thief",
		desc: "You know how to acquire things.",
		difficulty: 2,
		series: "",
		filter: ["All", "Stats"],
	},
	"May I have this Dance?": {
		title: "May I Have This Dance?",
		desc: "No one can resist your moves.",
		difficulty: 1,
		series: "",
		filter: ["All", "Stats"],
	},
	Aquanaut: {
		title: "Aquanaut",
		desc: "For those treasure hunters.",
		difficulty: 1,
		series: "",
		filter: ["All", "Stats"],
	},
	Seductress: {
		title: "Seductress",
		desc: "Be in control.",
		difficulty: 1,
		series: "",
		filter: ["All", "Stats"],
	},
	"Green Fingered": {
		title: "Green Fingered",
		desc: "You can get a lot done on your knees.",
		difficulty: 1,
		series: "",
		filter: ["All", "Stats"],
	},
	Majordomo: {
		title: "Majordomo",
		desc: "No filth escapes your notice.",
		difficulty: 1,
		series: "",
		filter: ["All", "Stats"],
	},
	Swift: {
		title: "Swift",
		desc: "Like the Wind.",
		difficulty: 1,
		series: "",
		filter: ["All", "Stats"],
	},
	Alluring: {
		title: "Alluring",
		desc: "Attracting attention is easy.",
		difficulty: 2,
		series: "",
		filter: ["All", "Stats"],
		softLockable: true,
	},
	"Sex Specialist": {
		title: "Sex Specialist",
		desc: "You excel at making others cum.",
		difficulty: 3,
		series: "",
		filter: ["All", "Stats"],
		alt: "Degree in Lewdity",
		altCond: "random(100) is 100",
	},
	"Perfect Record": {
		title: "Perfect Record",
		desc: "You excel at studying.",
		difficulty: 2,
		series: "",
		filter: ["All", "Stats"],
	},
	"Perfect Sub": {
		title: "Perfect Sub",
		desc: "The pinnacle of submission.",
		difficulty: 2,
		series: "",
		filter: ["All", "Stats"],
	},
	"Defying the Odds": {
		title: "Defying the Odds",
		desc: "The pinnacle of defiance.",
		difficulty: 2,
		series: "",
		filter: ["All", "Stats"],
	},
	Hawker: {
		title: "Hawker",
		desc: "Profit from the earth.",
		difficulty: 1,
		series: "market",
		filter: ["All", "Stats"],
	},
	Vendor: {
		title: "Vendor",
		desc: "Prove your sales chops.",
		difficulty: 2,
		series: "market",
		filter: ["All", "Stats"],
	},
	Merchant: {
		title: "Merchant",
		desc: "Dominate the market.",
		difficulty: 2,
		series: "market",
		filter: ["All", "Stats"],
	},
	"Twisted Desire": {
		title: "Twisted Desire",
		desc: "Suffering is optional.",
		difficulty: 2,
		series: "",
		filter: ["All", "Stats"],
	},
	"Served Hot": {
		title: "Served Hot",
		desc: "You'll hurt them. And you'll like it.",
		difficulty: 2,
		series: "",
		filter: ["All", "Stats"],
	},
	Sadomasochist: {
		title: "Sadomasochist",
		desc: "You want to hurt.",
		difficulty: 3,
		series: "",
		filter: ["All", "Stats"],
	},
	"Shining Reputation": {
		title: "Shining Reputation",
		desc: "Famous, but only in the right ways.",
		difficulty: 3,
		series: "",
		filter: ["All", "Stats"],
	},
	"Social Butterfly": {
		title: "Social Butterfly",
		desc: "You are the centre of attention.",
		difficulty: 1,
		series: "",
		filter: ["All", "Social"],
	},
	"Anti-Social Moth": {
		title: "Unsocial Moth",
		desc: "Who needs friends?",
		difficulty: 1,
		series: "",
		filter: ["All", "Social"],
	},
	"Teachers Pet": {
		title: "Teacher's Pet",
		desc: "You are the best in class.",
		difficulty: 1,
		series: "",
		filter: ["All", "Social"],
	},
	"Teachers Nightmare": {
		title: "Teacher's Nightmare",
		desc: "You are a terror!",
		difficulty: 1,
		series: "",
		filter: ["All", "Social"],
	},
	"Robin the Lover": {
		title: "Robin the Lover",
		desc: "You gave your virginity to them.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Hungry Orphan": {
		title: "Hungry Orphan",
		desc: "You gifted Robin a favourite food.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Robin's Song": {
		title: "Robin's Song",
		desc: "Helped Robin feel comfortable crossdressing.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Whitney the Tsundere": {
		title: "Whitney the Bully",
		desc: "You gave your virginity to them.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"The Bully's Tithe": {
		title: "The Bully's Tithe",
		desc: "You gifted Whitney a favourite food.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Delinquent Antics": {
		title: "Delinquent Antics",
		desc: "Made Whitney cum during class.",
		difficulty: 1,
		series: "",
		filter: ["All", "Social"],
	},
	"Giddy Up": {
		title: "Giddy Up",
		desc: "Throw Whitney into a pool.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Whitney's Secret": {
		title: "Whitney's Secret",
		desc: "Discover Whitney's collection.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Kylar the Obsessed": {
		title: "Kylar the Obsessed",
		desc: "You gave your virginity to them.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Not for Rats": {
		title: "Not for Rats",
		desc: "You gifted Kylar a favourite food.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Eden the Lonely": {
		title: "Eden the Lonely",
		desc: "You gave your virginity to them.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Sweet and Tender": {
		title: "Sweet and Tender",
		desc: "You gifted Eden a favourite food.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Avery the Moneybags": {
		title: "Avery the Moneybags",
		desc: "You gave your virginity to them.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	Kept: {
		title: "Kept",
		desc: "Accessed Avery's mansion.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
		hint: "Hint: Find a wealthy patron.",
	},
	"What Goes Around": {
		title: "What Goes Around",
		desc: "Bound Avery in their dungeon.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
		hint: "Hint: Turn the tables on a wealthy patron.",
	},
	"Most Exclusive": {
		title: "Most Exclusive",
		desc: "Ate at a restaurant with a year-long waiting list.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
		hint: "Hint: Go on a Valentine's date with a wealthy patron.",
	},
	"Pride Cometh": {
		title: "Pride Cometh",
		desc: "Finished Avery's tower.",
		difficulty: 3,
		series: "",
		filter: ["All", "Social"],
		hint: "Hint: Help a wealthy patron.",
	},
	"Haute Cuisine": {
		title: "Haute Cuisine",
		desc: "You gifted Avery a favourite food.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Leighton the Shady": {
		title: "Leighton the Shady",
		desc: "You gave your virginity to them.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Alex the Robust": {
		title: "Alex the Robust",
		desc: "You gave your virginity to them.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Home Cooking": {
		title: "Home Cooking",
		desc: "You gifted Alex a favourite food.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Great Hawk the Terror": {
		title: "Great Hawk the Terror",
		desc: "You'll make an excellent spouse.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Return the Favour": {
		title: "Return the Favour",
		desc: "You gifted the Great Hawk a favourite food.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Feather Trick": {
		title: "Feather Trick",
		desc: "Catch three lurkers in a single dive while hunting with the Great Hawk.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Wren the Sly": {
		title: "Wren the Sly",
		desc: "You gave your virginity to them.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Great Wolf the Alpha": {
		title: "Black Wolf the Alpha",
		desc: "You gave your virginity to them.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Encroaching Civilisation": {
		title: "Encroaching Civilisation",
		desc: "You gifted the Black Wolf a favourite food.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Sydney the Pure Hearted": {
		title: "Sydney the Pure-Hearted",
		desc: "They gave their virginity to you.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	Communion: {
		title: "Communion",
		desc: "You gifted Sydney a favourite food.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Harper the Hypnotist": {
		title: "Harper the Hypnotist",
		desc: "You gave your virginity to them.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Morgan the Lost": {
		title: "Morgan the Lost",
		desc: "You gave your virginity to them.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Gwylan the Bewitching": {
		title: "Gwylan the Bewitching",
		desc: "You gave your virginity to them.",
		difficulty: 2,
		series: "gwylanVirginity",
		hint: "Hint: Curiosity killed the virgin.",
		filter: ["All", "Social"],
	},
	"Coven Comforts": {
		title: "Coven Comforts",
		desc: "You gifted Gwylan a favourite food.",
		difficulty: 2,
		series: "",
		hint: "Hint: Food for the wicked.",
		filter: ["All", "Social"],
		hidden: true,
	},
	"Love Triangles": {
		title: "Love Triangles",
		desc: "You don't know who to choose.",
		difficulty: 2,
		series: "love triangles",
		filter: ["All", "Social"],
	},
	"Love Trapezoids": {
		title: "Love Trapezoids",
		desc: "Three wasn't enough for you.",
		difficulty: 3,
		series: "love triangles",
		filter: ["All", "Social"],
	},
	"Be My Valentine": {
		title: "Be My Valentine",
		desc: "Gifted valentines chocolate at the right time.",
		difficulty: 1,
		filter: ["All", "Social"],
	},
	"Ballroom Show-off": {
		title: "Ballroom Show-off",
		desc: "Won a competition with Avery.",
		difficulty: 1,
		series: "",
		filter: ["All", "Social"],
	},
	"Under the Table": {
		title: "Under the Table",
		desc: "Proved your mettle in a drinking contest.",
		difficulty: 1,
		series: "",
		filter: ["All", "Social"],
	},
	"Pub Crawl Victors": {
		title: "Pub Crawl Victors",
		desc: "Won a competition with your work colleagues.",
		difficulty: 1,
		series: "",
		filter: ["All", "Social"],
	},
	"Mason's Secret": {
		title: "Mason's Secret",
		desc: "Convince Mason to share something they'd rather not.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Mason's Shame": {
		title: "Mason's Shame",
		desc: "Bring Mason to orgasm inside a locker.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"Animal Tender": {
		title: "Animal Tender",
		desc: "Earn the respect of all animals at Alex's farm.",
		difficulty: 2,
		series: "",
		filter: ["All", "Social"],
	},
	"I Spy": {
		title: "I Spy",
		desc: "Peek on Alex in the shower.",
		difficulty: 1,
		series: "",
		filter: ["All", "Social"],
	},
	"First Kiss": {
		title: "First Kiss",
		desc: "Give your first kiss to a love interest.",
		difficulty: 1,
		series: "",
		filter: ["All", "Social"],
	},
	"A Crime Most Foul": {
		title: "A Crime Most Foul",
		desc: "Once late, forever shamed.",
		difficulty: 2,
		series: "",
		hint: "Hint: Make a written punishment permanent.",
		filter: ["All", "Social"],
	},
	Longing: {
		title: "Longing",
		desc: "Escaped Kylar's home.",
		difficulty: 3,
		series: "",
		hint: "Hint: Drive Kylar to restrained madness.",
		filter: ["All", "Social"],
	},
	"Pagan Rite": {
		title: "Pagan Rite",
		desc: "Learned about Kylar's parents.",
		difficulty: 1,
		series: "",
		hint: "Hint: Discover the secret of Kylar's manor.",
		filter: ["All", "Social"],
	},
	"Warmest Winter": {
		title: "Warmest Winter",
		desc: "Heard Winter's most personal tale.",
		difficulty: 2,
		series: "",
		hint: "Hint: Help an old fossil remember.",
		filter: ["All", "Social"],
	},
	"Trials of Faith": {
		title: "Trials of Faith",
		desc: "Heard all endings of the 'Hopeless Cycle' story.",
		difficulty: 4,
		series: "",
		hint: "Hint: A truth buried behind many lies.",
		filter: ["All", "Social"],
	},
	"First Verse": {
		title: "First Verse",
		desc: "Helped Gwylan purge a denizen of the forest.",
		difficulty: 1,
		series: "gwylanPurge",
		hint: "Hint: Learn a shopkeeper's secrets, and join in.",
		filter: ["All", "Social"],
	},
	Wildsong: {
		title: "Wildsong",
		desc: "Helped Gwylan purge the forest through intimate union.",
		difficulty: 2,
		series: "gwylanPurge",
		hint: "Hint: Delve deeper into Gwylan's secrets.",
		filter: ["All", "Social"],
	},
	Foxbane: {
		title: "Foxbane",
		desc: "Witnessed Eden's worst nightmare.",
		difficulty: 2,
		series: "",
		hint: "Hint: Have a friend help you escape a hunter.",
		filter: ["All", "Social"],
	},
	Neko: {
		title: "Purrfect",
		desc: "Purring for attention.",
		difficulty: 1,
		series: "",
		filter: ["All", "Transformation"],
	},
	Wolf: {
		title: "Howl at the Moon",
		desc: "Looking to be part of a pack.",
		difficulty: 1,
		series: "",
		filter: ["All", "Transformation"],
	},
	Cattle: {
		title: "Mess With the Bull...",
		desc: "Ready for milking.",
		difficulty: 1,
		series: "",
		filter: ["All", "Transformation"],
	},
	Harpy: {
		title: "Fly Like an Eagle",
		desc: "Casting a great shadow.",
		difficulty: 1,
		series: "",
		filter: ["All", "Transformation"],
	},
	Fox: {
		title: "You Sly Fox",
		desc: "Thieving little rascal.",
		difficulty: 1,
		series: "",
		filter: ["All", "Transformation"],
	},
	Angel: {
		title: "Walk Like an Angel",
		desc: "Try not to fall.",
		difficulty: 1,
		series: "",
		filter: ["All", "Transformation"],
	},
	"Fallen Angel": {
		title: "Falling, Falling, Falling...",
		desc: "Cruel defilement.",
		difficulty: 1,
		series: "",
		filter: ["All", "Transformation"],
	},
	Demon: {
		title: "Devilish Looks",
		desc: "A cause of great lewdity.",
		difficulty: 1,
		series: "",
		filter: ["All", "Transformation"],
	},
	"A Special Trait": {
		title: "A Special Trait",
		desc: "Gain a special trait.",
		difficulty: 2,
		series: "special trait",
		hint: "Hint: Something special.",
		filter: ["All", "Special"],
	},
	"A Special Trait Collector": {
		title: "A Special Trait Collector",
		desc: "Gain all the special traits.",
		difficulty: 3,
		hint: "Hint: Something extra special.",
		series: "special trait",
		filter: ["All", "Special"],
	},
	"Broodmother Host": {
		title: "Broodmother Host",
		desc: "Host to an endless number of little critters.",
		difficulty: 2,
		series: "",
		filter: ["All", "Pregnancy"],
		hint: "Hint: Something left behind.",
	},
	"Top Broodmother Host": {
		title: "Top Broodmother Host",
		desc: "Host to a perfect critter.",
		difficulty: 3,
		series: "",
		filter: ["All", "Pregnancy"],
		hint: "Hint: Something amazing left behind.",
	},
	"Broodmother Zoologist": {
		title: "Broodmother Zoologist",
		desc: "Filled out the parasite notebook.",
		difficulty: 3,
		series: "",
		filter: ["All", "Pregnancy"],
		hint: "Hint: Everything left behind, carefully detailed.",
	},
	"Miracle of Life": {
		title: "Miracle of Life",
		desc: "Gave birth to your first child.",
		difficulty: 2,
		series: "",
		filter: ["All", "Pregnancy"],
		pregnancyLockable: true,
	},
	"First Fatherhood": {
		title: "First Fatherhood",
		desc: "Became a father to your first child.",
		difficulty: 2,
		series: "",
		filter: ["All", "Pregnancy"],
	},
	"Hail Mary": {
		title: "Hail Mary",
		desc: "Gave birth as a virgin.",
		difficulty: 4,
		series: "",
		filter: ["All", "Pregnancy"],
		hint: "Hint: Gained something but not at the cost of something else.",
		pregnancyLockable: true,
		pregnancySillyLockable: true,
	},
	"Bicycle Mother": {
		title: "Bicycle Mother",
		desc: "Gave birth without knowing who the father is.",
		difficulty: 2,
		series: "",
		filter: ["All", "Pregnancy"],
		hint: "Hint: Do you know who did it?",
	},
	"Life Comes in Threes": {
		title: "Life Comes in Threes",
		desc: "Gave birth to triplets.",
		difficulty: 2,
		series: "",
		filter: ["All", "Pregnancy"],
		hint: "Hint: Three of a kind.",
		pregnancyLockable: true,
	},
	"Life begins when you least expect": {
		title: "Life begins when you least expect",
		desc: "Gave birth to children as a male.",
		difficulty: 2,
		series: "",
		filter: ["All", "Pregnancy"],
		hint: "Hint: The Magic that helps create that what should not be.",
	},
	"Diversity of Life": {
		title: "Diversity of Life",
		desc: "Gave birth to children of many different species.",
		difficulty: 4,
		series: "",
		filter: ["All", "Pregnancy"],
		hint: "Hint: Many forms of existence.",
		pregnancyLockable: true,
	},
	/* "Broken Dam":{ //Not in the code right now
		title: "Broken Dam",
		desc: "Get impregnated thanks to a broken condom.",
		difficulty: 2,
		series: "",
		filter: ["All", "Pregnancy"],
		hint: "Hint: ."
	}, */
	/* "Seed Spreader":{  ToDo: Pregnancy: uncomment once you can impregnate more that 3 named npc's
		title: "Seed Spreader",
		desc: "Impregnate three NPCs in a single day.",
		difficulty: 1,
		series: "",
		filter: ["All", "Pregnancy"],
		hint: "Hint: ."
	}, */
	"Producer of Lewd Fluids": {
		title: "Producer of Lewd Fluids",
		desc: "Those tentacles know who's boss.",
		difficulty: 1,
		series: "lewd fluids",
		filter: ["All", "Special"],
		hint: "Hint: The tentacles envy you.",
	},
	"Literally Buckets": {
		title: "Literally Buckets",
		desc: "A tentacle god.",
		difficulty: 2,
		series: "lewd fluids",
		filter: ["All", "Special"],
		hint: "Hint: A tub full of [Redacted].",
	},
	"Feeling Full": {
		title: "Feeling Full",
		desc: "Full of lewd fluid.",
		difficulty: 1,
		series: "",
		filter: ["All", "Special"],
		hint: "Hint: After a large meal.",
	},
	"Head Chief": {
		title: "Head Chef",
		desc: "They just love your buns.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Baking for others.",
	},
	"Locked In Gold": {
		title: "Locked In Gold",
		desc: "Won't protect you from frustration.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Better to lock it away than lose it.",
	},
	"Bailey's Trouble Maker": {
		title: "Bailey's Trouble Maker",
		desc: "Made them cum.",
		difficulty: 3,
		series: "",
		filter: ["All", "Special"],
		hint: "Hint: Trouble at home.",
	},
	"Leighton's Nightmare": {
		title: "Leighton's Nightmare",
		desc: "Made them cum.",
		difficulty: 3,
		series: "",
		filter: ["All", "Special"],
		hint: "Hint: Trouble at school.",
	},
	"Alex's Partner": {
		title: "Alex's Partner",
		desc: "Made them cum.",
		difficulty: 3,
		series: "",
		filter: ["All", "Special"],
		hint: "Hint: A field of fun.",
	},
	"Harper's Bane": {
		title: "Harper's Bane",
		desc: "Made Harper drink their serum.",
		difficulty: 3,
		series: "",
		filter: ["All", "Special"],
		hint: "Hint: A taste of their own medicine.",
	},
	Laughingstock: {
		title: "Laughingstock",
		desc: "Sent someone to the pillory.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Humiliate them.",
	},
	"You're the Laughingstock": {
		title: "You're the Laughingstock",
		desc: "Got sent to the pillory.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Seen as a criminal.",
	},
	"The Endless Deep": {
		title: "The Endless Deep",
		desc: "Kept swimming out to sea.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: To the edge of the world.",
	},
	"Wet and Ruined": {
		title: "Wet and Ruined",
		desc: "Discovered the ruined castle.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Lost in the mire.",
	},
	"Terror's Equal": {
		title: "Terror's Equal",
		desc: "Filled the tower with impressive hunting trophies.",
		difficulty: 3,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Vanity befitting a terror of the skies.",
		softLockable: true,
	},
	"Birds of a Feather": {
		title: "Birds of a Feather...",
		desc: "...flock together.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Rescue an orphan of another species.",
	},
	"Head of the Pack": {
		title: "Head of the Pack",
		desc: "Be the leader of wolves.",
		difficulty: 2,
		series: "wolves",
		filter: ["All", "Special"],
		hint: "Hint: Being a leader.",
	},
	"Top of the Food Chain": {
		title: "Top of the Food Chain",
		desc: "All fear the terrible howls.",
		difficulty: 2,
		series: "wolves",
		filter: ["All", "Special"],
		hint: "Hint: Prove your leadership.",
	},
	"Illicit Science": {
		title: "Illicit Science",
		desc: "Discovered the compound.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Secrets hidden from the law-abiding.",
	},
	"Mouth Sealed Shut": {
		title: "Mouth Sealed Shut",
		desc: "Survived an interrogation.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Don't spill the beans.",
	},
	"Neck Deep": {
		title: "Neck Deep",
		desc: "Survived being submerged in aphrodisiac.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Resist a most lewd substance.",
	},
	Seedy: {
		title: "Seedy",
		desc: "Found half of the seeds.",
		difficulty: 1,
		series: "seeds",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Harvest nature's secrets.",
		softLockable: true,
	},
	Breedy: {
		title: "Breedy",
		desc: "Seeds are little things, but they can't hide from you.",
		difficulty: 2,
		series: "seeds",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Harvest all of nature's secrets.",
		softLockable: true,
	},
	"Pride of the Farm": {
		title: "Pride of the Farm",
		desc: "Out-produced all others.",
		difficulty: 2,
		series: "",
		filter: ["All", "Special"],
		hint: "Hint: Supreme yield.",
	},
	"Dawn to Dusk": {
		title: "Dawn to Dusk",
		desc: "Worked all day on the farm.",
		difficulty: 1,
		series: "",
		filter: ["All", "Special"],
		hint: "Hint: Honest agrarian labour.",
	},
	"Runaway Cattle": {
		title: "Runaway Cattle",
		desc: "Escaped Remy's farm.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: No pen can hold you.",
		softLockable: true,
	},
	"Equine Rescue": {
		title: "Equine Rescue",
		desc: "Rescued by your equine friends.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Collapse in a field, but dodge the consequences.",
	},
	"A Thunderous Response": {
		title: "A Thunderous Response",
		desc: "Caused a brawl on High Street.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Cause a schism in a crowd.",
	},
	"A Lewd Adventure": {
		title: "A Lewd Adventure",
		desc: "Made an exposed journey through town.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Make a daring journey.",
		softLockable: true,
	},
	"Sour Dealing": {
		title: "Sour Dealing",
		desc: "Rescued from a gang who got in too deep.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Make some unscrupulous acquaintances.",
		softLockable: true,
	},
	"Rear Passenger": {
		title: "Rear Passenger",
		desc: "Almost crashed a car with your butt.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Break road safety laws.",
	},
	"Cornered Rogue": {
		title: "Cornered Rogue",
		desc: "Recovered your clothes from a mischievous fox.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Outfox a mischievous rogue.",
		softLockable: true,
	},
	"Pain Rider": {
		title: "Pain Rider",
		desc: "Demonstrated Winter's wooden horse to completion.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Ride a wooden horse to completion.",
		softLockable: true,
	},
	Submerged: {
		title: "Submerged",
		desc: "Demonstrated Winter's ducking stool to completion.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Be ducked to completion.",
		softLockable: true,
	},
	"Farm Protector": {
		title: "Farm Protector",
		desc: "Defended the fields from a rival's thugs.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Trespassers will be kicked.",
		softLockable: true,
	},
	"A Knot to Remember": {
		title: "A Knot to Remember",
		desc: "Knotted in the field with people nearby.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: A most deviant display.",
	},
	"Wrong Size": {
		title: "Wrong Size",
		desc: "Swapped the boys' and girls' clothes.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Drown the rumours.",
	},
	"Idle Hands": {
		title: "Idle Hands",
		desc: "Robbed a client while working as a masseur.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Skilled hands have many uses.",
	},
	"Stolen Technology": {
		title: "Stolen Technology",
		desc: "Repaired the brothel sex machine.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Briar has something for everyone.",
		softLockable: true,
	},
	Spelunking: {
		title: "Spelunking",
		desc: "Found the old smuggler's cave near the beach.",
		difficulty: 1,
		series: "beach cave",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Find the old smuggler route.",
		softLockable: true,
	},
	"X Marks the Spot": {
		title: "X Marks the Spot",
		desc: "Found a treasure map in the smuggler's cave.",
		difficulty: 2,
		series: "beach cave",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Hidden deep.",
		softLockable: true,
	},
	"Buried Treasure": {
		title: "Buried Treasure",
		desc: "Followed the treasure map and made a discovery.",
		difficulty: 3,
		series: "beach cave",
		filter: ["All", "Discoveries-Town"] /* unsure if this should be in both town and other */,
		hint: "Hint: Follow the map.",
		softLockable: true,
	},
	"Abnormal Mollusc": {
		title: "Abnormal Mollusc",
		desc: "Escaped the giant slug.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Lurking below the surf.",
		softLockable: true,
	},
	Leverage: {
		title: "Leverage",
		desc: "Threatened your way from the smuggler's den.",
		difficulty: 3,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Defy the rogues.",
		softLockable: true,
	},
	Flurry: {
		title: "Flurry",
		desc: "Protected Robin's stand from snowball-wielding delinquents.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Win a snowball fight.",
	},
	"Under the Ice": {
		title: "Under the Ice",
		desc: "Escaped the frozen lake.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Break free.",
		softLockable: true,
	},
	"A Festive Home": {
		title: "A Festive Home",
		desc: "Gave gifts to the orphans.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Bring wintry cheer to the orphans.",
	},
	"In Red Light": {
		title: "In Red Light",
		desc: "Harvested wild blood lemons.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Strange fruit grows in strange light.",
		softLockable: true,
	},
	"Oh Bother": {
		title: "Oh Bother",
		desc: "Harvested wild honeycomb.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Sweet and sticky.",
		softLockable: true,
	},
	"Employee Benefits": {
		title: "Employee Benefits",
		desc: "Discovered a shipment of gold by day and took it by night.",
		difficulty: 3,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Find gold. Steal it later.",
		softLockable: true,
	},
	"Not Like the Movies": {
		title: "Not Like the Movies",
		desc: "Gained knowledge of quicksand.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Sunken moor wisdom.",
		softLockable: true,
	},
	Slippery: {
		title: "Slippery",
		desc: "Escaped Remy's goons.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Escape Remy's goons.",
		softLockable: true,
	},
	"High Reflection": {
		title: "High Reflection",
		desc: "Returned the mirror to the top of the castle ruin.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Blind and in ruin.",
		softLockable: true,
	},
	Schism: {
		title: "Schism",
		desc: "Witnessed a drowned history.",
		difficulty: 3,
		series: "",
		hint: "Hint: Witness a history washed away.",
		filter: ["All", "Discoveries-Other"],
		softLockable: true,
	},
	"Catch the Wind": {
		title: "Catch the Wind",
		desc: "Learned how to fly.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Learn to fly.",
		softLockable: true,
	},
	"Trading Dignity": {
		title: "Trading Dignity",
		desc: "Orally satisfied a pack of Remy's goons.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Make a one-sided trade.",
		softLockable: true,
	},
	"Playing with Fire": {
		title: "Playing with Fire",
		desc: "Made Wren cum before you.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Endure a gambler's demands.",
		softLockable: true,
	},
	Firestarter: {
		title: "Firestarter",
		desc: "Convinced Wren to start a fire.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Win a destructive prize.",
		softLockable: true,
	},
	Dealing: {
		title: "Dealing",
		desc: "Sold produce to an unscrupulous company.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Sell Alex's strange produce.",
		softLockable: true,
	},
	"To Watch the Fields": {
		title: "To Watch the Fields",
		desc: "Hired security for your farm.",
		difficulty: 1,
		series: "farm guard",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Hire help.",
		softLockable: true,
	},
	"Reliable Employer": {
		title: "Reliable Employer",
		desc: "Employed an S-ranked guard.",
		difficulty: 2,
		series: "farm guard",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Help an employee reach their potential.",
		softLockable: true,
	},
	"Into the Sunset": {
		title: "Into the Sunset",
		desc: "Escaped Remy's goons on horseback.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Escape mounted pursuers.",
		softLockable: true,
	},
	"Bent Copper": {
		title: "Bent Copper",
		desc: "Interrupted a corrupt exchange.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Keep your eyes open while helping the community.",
		softLockable: true,
	},
	"Social Contract": {
		title: "Social Contract",
		desc: "Finished community service.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Pay your debt to society.",
		softLockable: true,
	},
	Institutionalised: {
		title: "Institutionalised",
		desc: "Released from prison after serving your sentence.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Do your time.",
		softLockable: true,
	},
	Breaker: {
		title: "Breaker",
		desc: "Disabled the prison shock collars.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Rebellious sabotage.",
		softLockable: true,
	},
	"Time and Pressure": {
		title: "Time and Pressure",
		desc: "Dug through the prison wall.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: No walls are thick enough.",
		softLockable: true,
	},
	"More than a Number": {
		title: "More than a Number",
		desc: "Learned five names in prison.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Make friends from behind bars.",
		softLockable: true,
	},
	"Friends in the Sky": {
		title: "Friends in the Sky",
		desc: "Befriended the watchers.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Recover that which was lost.",
		softLockable: true,
	},
	"Not Meant to be Caged": {
		title: "Not Meant to be Caged",
		desc: "Broke out of prison.",
		difficulty: 3,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Cut your sentence short.",
		softLockable: true,
	},
	"Slip Through the Backdoor": {
		title: "Slip Through the Backdoor",
		desc: "Wiped Bailey's list and evaded punishment.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Wiped clean and got away with it.",
	},
	"Life of the Party": {
		title: "Life of the Party",
		desc: "Impressed a party with your dance.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Impress Charlie's friends.",
		softLockable: true,
	},
	"Belle of the Ball": {
		title: "Belle of the Ball",
		desc: "Impressed an aristocratic party with your dance.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Impress high society.",
		softLockable: true,
	},
	"Breaking the Stone": {
		title: "Breaking the Stone",
		desc: "Stopped the ritual beneath a Danube manor.",
		difficulty: 3,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Use your dance connections to access and end a ritual.",
		softLockable: true,
	},
	"Pound Alpha": {
		title: "Pound Alpha",
		desc: "Reached maximum status at the dog pound.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Show those dogs who's boss.",
		softLockable: true,
	},
	"Pound Runt": {
		title: "Pound Runt",
		desc: "Reached minimum status at the dog pound.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Submit to the dogs.",
		softLockable: true,
	},
	"Pounded Pound": {
		title: "Pounded Pound",
		desc: "Informed Bailey of the dog pound's activities.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Find dirt on the dog pound.",
		softLockable: true,
	},
	"Pound Liberator": {
		title: "Pound Liberator",
		desc: "Rescued the black dog.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Release a special prisoner.",
		softLockable: true,
	},
	"The Value of Pain": {
		title: "The Value of Pain",
		desc: "Rescued an orphan while preying as a demon.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Do a good deed, demonically.",
		softLockable: true,
	},
	"Free Booze": {
		title: "Free Booze",
		desc: "Drank all the youths' booze, but resisted rape.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Drink a lot on the moor.",
		softLockable: true,
	},
	"Bewitching Echoes": {
		title: "Bewitching Echoes",
		desc: "Caused a mad frenzy during the bukkake show.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Ruin a demonic show in the best way.",
		softLockable: true,
	},
	"Dark Delvings": {
		title: "Dark Delvings",
		desc: "Retrieved the white crystal.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Break into an ancient site.",
		softLockable: true,
	},
	"Lurker Beyond": {
		title: "Lurker Beyond",
		desc: "Defeated the lurker in the tentacle forest.",
		difficulty: 3,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Defeat a monster in another world.",
		softLockable: true,
	},
	"Down Below": {
		title: "Down Below",
		desc: "Escaped slavery in the mines.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Escape an old industry.",
		softLockable: true,
	},
	"Bridging the Past": {
		title: "Bridging the Past",
		desc: "Built a bridge over the canal.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Restore a bridge.",
		softLockable: true,
	},
	"Safe Trail": {
		title: "Safe Trail",
		desc: "Restored the road through the forest.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Restore a road.",
		softLockable: true,
	},
	"Field Work": {
		title: "Field Work",
		desc: "Built an archaeological field office at the lake.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Build Winter's wish.",
		softLockable: true,
	},
	"Concrete Woodland": {
		title: "Concrete Woodland",
		desc: "Restored the residential thicket.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Restore a thicket.",
		softLockable: true,
	},
	"School Green": {
		title: "School Green",
		desc: "Restored the school green.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Restore a green.",
		softLockable: true,
	},
	"Hookah Master": {
		title: "Hookah Master",
		desc: "Inherited the hookah parlour.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Delve into hookah smoke.",
		softLockable: true,
	},
	"Sins of the Past": {
		title: "Sins of the Past",
		desc: "Discovered the mayor's secret.",
		difficulty: 3,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Access the mayor's computer.",
		softLockable: true,
	},
	"Panic Room": {
		title: "Panic Room",
		desc: "Escaped a security system in the flats.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Discover intense security on Barb Street.",
		softLockable: true,
	},
	"Lost World": {
		title: "Lost World",
		desc: "Discovered an island lost to history.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: A mist-shrouded island waits.",
		softLockable: true,
	},
	"Prehistoric Landscape": {
		title: "Prehistoric Landscape",
		desc: "Discovered all the areas on the island.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Explore a mist-shrouded island.",
		softLockable: true,
	},
	"Face of a Guardian": {
		title: "Face of a Guardian",
		desc: "Built an islander mask of your own.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Practise wilderness woodwork.",
		softLockable: true,
	},
	"Wild Monarch": {
		title: "Wild Monarch",
		desc: "Built a throne.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Practise vain wilderness woodwork.",
		softLockable: true,
	},
	Naturalised: {
		title: "Naturalised",
		desc: "Infiltrated the islander castle, without being captured.",
		difficulty: 3,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Disguise yourself and enter a foreign stronghold.",
		softLockable: true,
	},
	"Gilded Spear": {
		title: "Gilded Spear",
		desc: "Retrieved the gilded spear.",
		difficulty: 3,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: At the root of an island, waiting.",
		softLockable: true,
	},
	"Defy the Night": {
		title: "Defy the Night",
		desc: "Endured the Trial of Anguish to completion.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Climb the temple hierarchy.",
		softLockable: true,
	},
	"Withering Truth": {
		title: "Withering Truth",
		desc: "Met the bishop.",
		difficulty: 3,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Through confession, revelation.",
		softLockable: true,
	},
	"Lost Heirloom": {
		title: "Lost Heirloom",
		desc: "Retrieved the gold compass.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Other"],
		hint: "Hint: Stolen abroad.",
		softLockable: true,
	},
	"Backroom Deals": {
		title: "Backroom Deals",
		desc: "Witnessed a game between high level players.",
		difficulty: 1,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Date your way into the town's upper echelons.",
		softLockable: true,
	},
	"Stomping Down The Street": {
		title: "Stomping Down The Street",
		desc: "Handed out lots of flyers on the High Street.",
		difficulty: 1,
		series: "Flyers",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Work with Niki.",
		softLockable: true,
	},
	"Hear Me Roar": {
		title: "Hear Me Roar",
		desc: "Handed out even more flyers on the High Street.",
		difficulty: 2,
		series: "Flyers",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Work with Niki.",
		softLockable: true,
	},
	"Max Those Shots": {
		title: "Max Those Shots",
		desc: "Holding a lot of pepper spray.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Town"] /* unsure if this should be in both town and other */,
		hint: "Hint: The best defence is a good offence.",
		softLockable: true,
	},
	"Opened Pandoras Box": {
		title: "Opened Pandora's Box",
		desc: "Helped with rebuilding the Adult Shop.",
		difficulty: 1,
		series: "Adult Shop",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Is it worth opening the toybox?",
	},
	"Opened Pandoras Cocks": {
		title: "Opened Pandora's Cocks",
		desc: "The Adult Shop couldn't have done it without you.",
		difficulty: 3,
		series: "Adult Shop",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Was it worth opening the toybox so fast?",
	},
	"Brothel Provider": {
		title: "Brothel Provider",
		desc: "Installed a vending machine to sell products at a profit.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Convince Briar to do business.",
	},
	"Player of the Match": {
		title: "Player of the Match",
		desc: "Stole the cricket ball from Wren.",
		difficulty: 2,
		series: "",
		filter: ["All", "Discoveries-Town"],
		hint: "Hint: Double-cross your partner in crime.",
	},
	"Ear Slime Lover": {
		title: "Ear Slime Lover",
		desc: "It is your best friend.",
		difficulty: 3,
		series: "",
		filter: ["All", "Special"],
		hint: "Hint: Whispers in your ear.",
	},
	"Ear Slime Amalgam": {
		title: "Ear Slime Amalgam",
		desc: "You became one with your best friend.",
		difficulty: 3,
		series: "",
		filter: ["All", "Special"],
		hint: "Hint: Given time and love to bloom.",
	},
	"The Path to Redemption": {
		title: "The Path to Redemption",
		desc: "Recover your humanity from the demon within.",
		difficulty: 3,
		series: "",
		filter: ["All", "Special"],
		hint: "Hint: Recover what you lost.",
		softLockable: true,
	},
	"A New Life": {
		title: "A New Life",
		desc: "Start with a boost.",
		difficulty: 1,
		series: "",
		filter: ["All", "Special"],
		hint: "Hint: Starting off fast.",
	},
	Negotiator: {
		title: "Negotiator",
		desc: "Made over £500 from a single tip.",
		difficulty: 3,
		series: "",
		filter: ["All", "Special"],
		hint: "Hint: Rake it in.",
	},
	"Curious Attire": {
		title: "Curious Attire",
		desc: "Unlocked half of the forest shop's clothing sets.",
		difficulty: 2,
		series: "specialClothes",
		filter: ["All", "Special"],
		hint: "Hint: Half of the rewards for triumph and trouble alike.",
		softLockable: true,
	},
	"Wicked Wardrobe": {
		title: "Wicked Wardrobe",
		desc: "Unlocked all of the forest shop's clothing sets.",
		difficulty: 3,
		series: "specialClothes",
		filter: ["All", "Special"],
		hint: "Hint: All rewards for triumph and trouble alike.",
		softLockable: true,
	},
	"My Collection of Feats": {
		title: "My Collection of Feats",
		desc: "Too many to count.",
		difficulty: 3,
		series: "collection",
		filter: ["All", "Special"],
		hint: "Hint: A collection of something.",
	},
	"My Timeless Collection of Feats": {
		title: "My Timeless Collection of Feats",
		desc: "Feats being worth more than time itself.",
		difficulty: 5,
		series: "collection",
		filter: ["All", "Special"],
		hint: "Hint: Time and effort.",
	},
};

async function featsMergePre() {
	// Replace getting the count with a better method that gets included with the sugarcube format
	T.saveDataImportCount = 0;
	const localStorageSaves = DoLSave.getSaves();

	const result = () => {
		if (!T.saveDataImportCount) {
			$("#featsBeginText").html(`0 saves detected, did you make a local save before trying this?`);
		} else if ((T.saveDataImportCount >= 10 && Browser.isMobile.any()) || T.saveDataImportCount >= 25) {
			$("#featsBeginText").html(`${T.saveDataImportCount} saves detected, this might take some time on a slower device.`);
		} else {
			$("#featsBeginText").html(`Only ${T.saveDataImportCount} ${pluralise(T.saveDataImportCount, "save")} detected, this shouldn't take too long.`);
		}
		$("#featsBeginLoadingText").addClass("hidden");
		$("#featsBeginButton").removeClass("hidden");
	};

	// Count the local storage saves
	if (localStorageSaves.autosave) T.saveDataImportCount++;
	if (localStorageSaves.slots) {
		localStorageSaves.slots.forEach(slot => {
			if (slot) T.saveDataImportCount++;
		});
	}

	// Count the index db saves
	try {
		// eslint-disable-next-line no-undef
		idb.getSaveDetails()
			.then(saveDataDetails => {
				T.saveDataImportCount += saveDataDetails.length;
			})
			.finally(() => {
				result();
			});
	} catch {
		result();
	}
}
DefineMacro("featsMergePre", featsMergePre);

function featsMerge() {
	if (window.featsMerge) return;
	window.featsMerge = true;

	const savesToLoad = T.saveDataImportCount;
	const loadingBar = $("#featsLoadingMeter .greenbar");
	const loadingText = $("#featsLoadingText");
	let featData = localStorage.getItem("dolFeats");
	if (featData) {
		featData = JSON.parse(featData);
	} else {
		featData = {};
	}

	if (!featData.specialClothes) featData.specialClothes = [];
	// eslint-disable-next-line prettier/prettier
	if (!Array.isArray(featData.specialClothes)) featData.specialClothes = getUnlockedSpecialSets(updateSpecialClothesNames(featData.specialClothes)).filter(set => setup.specialClothesSets[set].feat);
	const loadFeats = (data = {}) => {
		Object.entries(data).forEach(([key, date]) => {
			if (key === "specialClothes") {
				const clothes = Array.isArray(date)
					? date
					: getUnlockedSpecialSets(updateSpecialClothesNames(date)).filter(set => setup.specialClothesSets[set].feat);
				clothes.forEach(a => featData.specialClothes.pushUnique(a));
				return;
			}
			if (!featData[key] || new Date(date).getTime() < new Date(featData[key]).getTime()) {
				featData[key] = date;
			}
		});
	};

	const result = () => {
		let points = 0;
		Object.keys(featData).forEach(key => {
			if (setup.feats[key]) points += setup.feats[key].difficulty;
		});
		featData.points = points;

		V.feats.allSaves = featData;
		localStorage.setItem("dolFeats", JSON.stringify(featData));

		loadingBar.css("width", "100%");
		loadingText.html("All feat data imported.");
		$("#featsFinishButton").removeClass("hidden");

		delete window.featsMerge;
	};

	// Read the local storage saves
	let localSavesChecked = 0;
	const localStorageSaves = clone(DoLSave.getSaves());
	if (localStorageSaves) {
		if (localStorageSaves.autosave) {
			localStorageSaves.autosave.state.history = State.deltaDecode(localStorageSaves.autosave.state.delta);
			try {
				DoLSave.decompressIfNeeded(localStorageSaves.autosave);
			} catch (e) {
				// a save that cannot be decompressed has no feats to read, skip it
				console.warn("Couldn't decompress a save while loading feats, skipping it.", e);
			}

			if (localStorageSaves.autosave.state?.history?.[localStorageSaves.autosave.state.index]?.variables) {
				const variables = localStorageSaves.autosave.state.history[localStorageSaves.autosave.state.index].variables;
				if (variables.feats) {
					loadFeats(variables.feats.allSaves);
					loadFeats(variables.feats.currentSave);
				}
			}
			localSavesChecked++;
			loadingBar.css("width", `${(localSavesChecked / savesToLoad) * 100}%`);
		}
		if (localStorageSaves.slots) {
			localStorageSaves.slots.forEach(slot => {
				if (slot) {
					slot.state.history = State.deltaDecode(slot.state.delta);
					try {
						DoLSave.decompressIfNeeded(slot);
					} catch (e) {
						// a save that cannot be decompressed has no feats to read, skip it
						console.warn("Couldn't decompress a save while loading feats, skipping it.", e);
					}
					if (slot.state.history?.[slot.state.index]?.variables) {
						const variables = slot.state.history[slot.state.index].variables;
						if (variables.feats) {
							loadFeats(variables.feats.allSaves);
							loadFeats(variables.feats.currentSave);
						}
					}
					localSavesChecked++;
					loadingBar.css("width", `${(localSavesChecked / savesToLoad) * 100}%`);
				}
			});
		}
	}

	// Read the index db saves
	try {
		// eslint-disable-next-line no-undef
		idb.getAllSaves()
			.then(saves =>
				saves.forEach((slot, index) => {
					// auto-detect between uncompressed and compressed saves
					const history = slot.data.history || State.deltaDecode(slot.data.delta);
					const saveData = history[slot.data.index].variables;
					if (saveData.feats) {
						loadFeats(saveData.feats.allSaves);
						loadFeats(saveData.feats.currentSave);
					}
					loadingBar.css("width", `${((localSavesChecked + index + 1) / savesToLoad) * 100}%`);
					loadingText.html(`${index + 1} out of ${savesToLoad} saves checked.`);
				})
			)
			.finally(() => {
				result();
			});
	} catch {
		result();
	}
}
DefineMacro("featsMerge", featsMerge);

function earnFeat(featName) {
	if (!featName || V.feats.locked || V.cheatsEnabled === true || V.debug || V.gamemode === "soft" || V.settings?.allureModifier < 1 || V.statFreeze) return;

	if (
		V.feats.currentSave[featName] !== undefined ||
		(V.feats.soft && setup.feats[featName].softLockable) ||
		(V.feats.pregnancyLocked && setup.feats[featName].pregnancyLockable) ||
		(V.feats.pregnancySillyLocked && setup.feats[featName].pregnancySillyLockable)
	)
		return;

	V.feats.currentSave[featName] = new Date();
	displayFeat(featName);
}
DefineMacro("earnFeat", earnFeat);

function displayFeat(featName) {
	const feat = setup.feats[featName];
	if (!feat) return;

	$(() => {
		const passages = $("#passages");

		const featsCount = passages.find(".feat").length;
		const hidden = featsCount >= 3 ? " hiddenFeat" : "";

		const wrapper = $("<div>", {
			id: `feat-${featsCount}`,
			class: `feat feat${featsCount}${hidden} feat-overlay`,
		});

		const coin = $("<img>", { class: "featCoin" });
		switch (feat.difficulty) {
			case 1:
				coin.attr("src", "img/ui/coin-copper.gif");
				break;
			case 2:
				coin.attr("src", "img/ui/coin-silver.gif");
				break;
			case 3:
				coin.attr("src", "img/ui/coin-gold.gif");
				break;
			case 4:
				coin.attr("src", "img/ui/coin-platinum.gif");
				break;
			case 5:
				coin.attr("src", "img/ui/coin-jeweled.gif");
				break;
		}

		const featImage = $("<div>", { class: "featImage" }).append(coin);

		const featText = $("<div>", { class: "featText" })
			.append($("<span>", { class: "title" }).text(feat.title))
			.append($("<span>", { class: "text" }).text(feat.desc));

		const close = $("<div>", {
			id: `closeFeat-${featsCount}`,
			class: "closeFeat",
			on: {
				click: () => closeFeats(featsCount),
			},
		});

		wrapper.append(featImage, featText, close);
		passages.append(wrapper);
	});
}
DefineMacro("displayFeat", displayFeat);

// eslint-disable-next-line no-unused-vars
function earnHourlyFeats() {
	if (V.feats.locked || V.cheatsEnabled === true || V.debug || V.gamemode === "soft" || V.settings.allureModifier < 1 || V.replayScene) return false;

	const fragment = document.createDocumentFragment();

	const earnFeat = featName => {
		if (!V.feats.currentSave[featName]) fragment.append(wikifier("earnFeat", `"${featName}"`));
	};

	// Feats that can only be earned after 50 days
	if (Time.days >= 50) {
		switch (V.player.sex) {
			case "m":
				earnFeat("Being a Boy");
				break;
			case "f":
				earnFeat("Being a Girl");
				break;
			case "h":
				earnFeat("Being a Hermaphrodite");
				break;
		}

		if (Time.days >= 150) earnFeat("Being an Orphan");

		if (!V.passoutstat) {
			earnFeat("Stressful Challenge");
			if (Time.days >= 150) earnFeat("Long Stressful Challenge");
		}
	}

	if (V.awareness >= 500) earnFeat("Most Aware");
	if (V.awareness <= -199) earnFeat("Most Innocent");
	if (V.promiscuity >= 100 && V.deviancy >= 100 && V.exhibitionism >= 100) earnFeat("No More Control");

	if (
		(!V.player.vaginaExist || V.vaginalskill >= 1000) &&
		(!V.player.penisExist || V.penileskill >= 1000) &&
		V.oralskill >= 1000 &&
		(V.analskill >= 1000 || V.settings.analEnabled === false) &&
		V.handskill >= 1000 &&
		V.feetskill >= 1000 &&
		V.bottomskill >= 1000 &&
		V.thighskill >= 1000 &&
		V.chestskill >= 1000
	) {
		earnFeat("Sex Specialist");
	}

	if (V.submissive >= 2000) earnFeat("Perfect Sub");
	if (V.submissive <= 0) earnFeat("Defying the Odds");
	if (V.museumAntiques.museumCount === V.museumAntiques.maxCount) earnFeat("It Belongs in a Museum");

	// LI Romance
	const loveCount = (V.robinromance ? 1 : 0) + (V.whitneyromance ? 1 : 0) + (V.kylarenglish ? 1 : 0) + (V.sydneyromance ? 1 : 0);
	if (loveCount >= 3) earnFeat("Love Triangles");
	if (loveCount >= 4) earnFeat("Love Trapezoids");

	if (V.cat >= 6) earnFeat("Neko");
	if (V.wolfgirl >= 6) earnFeat("Wolf");
	if (V.angel >= 6) earnFeat("Angel");
	if (V.fallenangel >= 2) earnFeat("Fallen Angel");
	if (V.demon >= 6) earnFeat("Demon");
	if (V.cow >= 6) earnFeat("Cattle");
	if (V.harpy >= 6) earnFeat("Harpy");
	if (V.fox >= 6) earnFeat("Fox");

	const specialTraits =
		(V.orgasmtrait >= 1 ? 1 : 0) +
		(V.ejactrait >= 1 ? 1 : 0) +
		(V.molesttrait >= 1 ? 1 : 0) +
		(V.rapetrait >= 1 ? 1 : 0) +
		(V.bestialitytrait >= 1 ? 1 : 0) +
		(V.tentacletrait >= 1 ? 1 : 0) +
		(V.voretrait >= 1 ? 1 : 0) +
		(V.milkdranktrait >= 1 ? 1 : 0) +
		(V.choketrait >= 1 ? 1 : 0);
	if (specialTraits >= 1) earnFeat("A Special Trait");
	if (specialTraits >= 9) earnFeat("A Special Trait Collector");

	if (
		V.pregnancyStats.parasiteTypesSeen &&
		V.pregnancyStats.parasiteTypesSeen.length >= 14 &&
		V.pregnancyStats.parasiteVariantsSeen.length >= 2 &&
		V.pregnancyStats.parasiteBook === 3
	) {
		// typesSeen: fish, snake, slime, spider, maggot, worm, eel, wasp, bee, lurker, squid, slug, tentacle, vine
		// variantsSeen: pale, metal
		earnFeat("Broodmother Zoologist");
	}

	if (V.spraymax >= 8) earnFeat("Max Those Shots");
	if (V.spraymax > 8) console.warn("pepper spray count above 8! does feat threshold need to be increased?");
	if ((V.semen_volume >= 2000 && V.semen_amount >= V.semen_volume) || (V.milk_volume >= 2000 && V.milk_amount >= V.milk_volume)) earnFeat("Feeling Full");
	if (V.cool >= 400) earnFeat("Social Butterfly");
	if (V.cool <= 2 && !V.backgroundTraits.includes("nerd")) earnFeat("Anti-Social Moth");
	if (V.delinquency <= 0) earnFeat("Teachers Pet");
	if (V.delinquency >= 1000) earnFeat("Teachers Nightmare");

	if (
		V.skin.forehead.writing &&
		V.skin.left_cheek.writing &&
		V.skin.right_cheek.writing &&
		V.skin.left_shoulder.writing &&
		V.skin.right_shoulder.writing &&
		V.skin.breasts.writing &&
		V.skin.back.writing &&
		V.skin.pubic.writing &&
		V.skin.left_thigh.writing &&
		V.skin.right_thigh.writing
	) {
		earnFeat("A Living Canvas");
	}

	if (V.produce_sold >= 100) earnFeat("Hawker");
	if (V.produce_sold >= 1000) earnFeat("Vendor");
	if (V.produce_sold >= 5000) earnFeat("Merchant");
	const totalSeeds = Object.values(setup.foodstuff).filter(plant => plant.tending?.has_seeds).length;
	if (V.plants_known.length >= totalSeeds / 2) earnFeat("Seedy");
	if (V.plants_known.length >= totalSeeds) earnFeat("Breedy");
	if (V.daily.ex.road === 1 && V.daily.ex.cream === 1 && V.daily.ex.flyover === 1) earnFeat("A Lewd Adventure");
	if (V.athletics >= 1000) earnFeat("Swift");

	if (V.farm_stage >= 2 && V.farm.beasts.horses >= 20 && V.farm.beasts.cattle >= 20 && V.farm.beasts.dogs >= 20 && V.farm.beasts.pigs >= 20) {
		earnFeat("Animal Tender");
	}

	if (V.masochism_level >= 4 && V.sadism_level >= 4) earnFeat("Sadomasochist");
	if (V.masochism_level >= 4) earnFeat("Twisted Desire");
	if (V.sadism_level >= 4) earnFeat("Served Hot");

	// V.fame.pimp has been excluded, should be added back in if enabled
	if (
		V.fame.sex <= 29 &&
		V.fame.prostitution <= 29 &&
		V.fame.rape <= 29 &&
		V.fame.bestiality <= 29 &&
		V.fame.exhibitionism <= 29 &&
		V.fame.pregnancy <= 29 &&
		V.fame.impreg <= 29 &&
		V.fame.scrap >= 1000 &&
		V.fame.good >= 1000 &&
		V.fame.business >= 1000 &&
		V.fame.social >= 1000 &&
		V.fame.model >= 1000
	) {
		earnFeat("Shining Reputation");
	}

	if (
		Object.values(V.children).reduce((prev, curr) => {
			if (curr.mother === "pc") prev.pushUnique(curr.type);
			return prev;
		}, []).length >= Object.keys(pregnancyGenerator).filter(type => setup.pregnancy.typesEnabled.includes(type)).length
	) {
		earnFeat("Diversity of Life");
	}

	if (V.money >= 100000) earnFeat("Pocket Change");
	if (V.money >= 1000000) earnFeat("Money Maker");
	if (V.money >= 10000000) earnFeat("Tycoon");
	if (V.money >= 100000000) earnFeat("Millionaire");

	if (
		V.liquidoutsidecount >= 100 &&
		(V.settings.analEnabled === false || setup.bodyliquid.combined("anus") >= 5) &&
		(!V.player.vaginaExist || setup.bodyliquid.combined("vagina") >= 5) &&
		setup.bodyliquid.combined("mouth") >= 5
	) {
		earnFeat("Fully Covered");
	}

	if (V.skulduggery >= 1000) earnFeat("Thief");
	if (V.danceskill >= 1000) earnFeat("May I have this Dance?");
	if (V.swimmingskill >= 1000) earnFeat("Aquanaut");
	if (V.seductionskill >= 1000) earnFeat("Seductress");
	if (V.tending >= 1000) earnFeat("Green Fingered");
	if (V.housekeeping >= 1000) earnFeat("Majordomo");
	if (V.baseAllure >= 7000 && V.outside === 1 && !Time.isBloodMoon()) earnFeat("Alluring");
	if (V.science >= 1000 && V.maths >= 1000 && V.english >= 1000 && V.history >= 1000) earnFeat("Perfect Record");
	if (V.earSlime.corruption >= 100) earnFeat("Ear Slime Lover");
	if (V.earSlime.corruption >= 100 && V.earSlime.growth >= 200) earnFeat("Ear Slime Amalgam");

	if (V.options.tanLines) {
		const validLayers = Skin.tanningLayers.filter(layer => {
			return layer.layers.length && layer.value >= 10;
		});
		if (validLayers.length >= 5) earnFeat("50 Shades of Tan");
	}

	// Should be last
	const currentMax = Object.values(setup.feats).reduce((sum, feat) => sum + feat.difficulty, 0);
	if (V.feats.allSaves.points >= Math.floor(currentMax * 0.5)) earnFeat("My Collection of Feats");
	if (V.feats.allSaves.points >= Math.floor(currentMax * 0.95)) earnFeat("My Timeless Collection of Feats");

	// Bugged in saves that used the "Show them the stolen card" link in many older versions
	if (V.compound.discovered) earnFeat("Illicit Science");

	return fragment;
}

function updateFeats() {
	let coins = 0;
	let writeFlag = false;
	// some entries within the feats object are not actually feats
	const notFeats = ["points", "specialClothes"];
	// at the game start, V.feats is not yet imported
	const allFeats = (passage() === "Start" ? JSON.parse(localStorage.getItem("dolFeats")) : V.feats.allSaves) || {};
	const curFeats = V.feats.currentSave;
	// make sure feats from all saves contain the ones from current one
	Object.keys(curFeats).forEach(feat => {
		// skip unknown/modded/future/not feats
		if (notFeats.includes(feat) || !(feat in setup.feats)) return;
		if (!(curFeats[feat] instanceof Date)) {
			if (isJsonString(curFeats[feat])) curFeats[feat] = JSON.parse(curFeats[feat]);
			else curFeats[feat] = new Date(curFeats[feat]);
			// somehow new date is neither json nor a date string. reset it and mark as ancient
			if (!curFeats[feat]?.valueOf()) curFeats[feat] = new Date(1);
		}
		// if feat was unlocked earlier, do nothing
		if (allFeats[feat] && getTimeNumber(allFeats[feat] <= getTimeNumber(curFeats[feat]))) return;
		// else update allFeats and capture the flag
		allFeats[feat] = clone(curFeats[feat]);
		writeFlag = true;
	});
	// tally the points
	Object.keys(allFeats).forEach(feat => {
		if (notFeats.includes(feat) || !(feat in setup.feats)) return;
		// fix bad dates while we're at it
		if (!(allFeats[feat] instanceof Date)) {
			let newDate;
			if (isJsonString(allFeats[feat])) newDate = JSON.parse(allFeats[feat]);
			else newDate = new Date(allFeats[feat]);
			if (!newDate?.valueOf()) {
				Errors.report(`updateFeats "${feat}": Invalid date "${allFeats[feat]}"`);
				newDate = new Date(1);
			}
			allFeats[feat] = newDate;
			writeFlag = true;
		}
		coins += setup.feats[feat].difficulty;
	});
	allFeats.points = coins;

	// update old specialClothes to new system
	let specialClothes = allFeats.specialClothes || [];
	if (!Array.isArray(specialClothes)) {
		specialClothes = getUnlockedSpecialSets(updateSpecialClothesNames(specialClothes)).filter(set => setup.specialClothesSets[set].feat);
		writeFlag = true;
	}

	// check specialClothes
	if (V.specialClothes && !V.feats.locked && !V.cheatsEnabled) {
		const unlockedSets = getUnlockedSpecialSets().filter(set => setup.specialClothesSets[set].feat);
		// merge unlockedSets into specialClothes
		unlockedSets.forEach(set => {
			if (!specialClothes.includes(set)) {
				specialClothes.push(set);
				writeFlag = true;
			}
		});
	}
	allFeats.specialClothes = specialClothes;
	V.feats.allSaves = allFeats;

	// update permanent feat storage
	if (writeFlag) localStorage.setItem("dolFeats", JSON.stringify(allFeats));
}
DefineMacro("updateFeats", updateFeats);
window.updateFeats = updateFeats;

// setup feat boosts
function setupFeatBoosts(force) {
	if (V.featsBoosts && !force) return;

	V.featsBoosts = {
		upgrades: {}, // coins spent on upgrades
		upgradeDetails: {}, // junk data
		purchased: {}, // amount of upgrades purchased
		missing: {}, // ugh
		name: {}, // why
		pointsUsed: 0, // hatred and also suffering
		clothingGender: "Either",
		clothingCustomColors: false,
		hidden: { greenThumb: true },
		tattoos: {
			1: { bodypart: "Random", tattoo: "Random", pen: "Tattoo" },
			2: { bodypart: "Random", tattoo: "Random", pen: "Tattoo" },
			3: { bodypart: "Random", tattoo: "Random", pen: "Tattoo" },
			4: { bodypart: "Random", tattoo: "Random", pen: "Tattoo" },
			5: { bodypart: "Random", tattoo: "Random", pen: "Tattoo" },
		},
		sexToys: [{}, {}, {}, {}, {}, {}],
		specialClothesSets: {},
		earSlimeType: "immaturePassive",
	};

	const boostData = {
		money: {
			name: "Starting Money",
			required: ["Pocket Change", "Money Maker", "Tycoon", "Millionaire"],
			cost: 5,
			maxMultiplier: 2,
			missing: "Unlock this boost by obtaining the 'Pocket Change' feat",
		},
		grades: {
			name: "School Grades",
			required: ["Perfect Record"],
			cost: 15,
			max: 2,
			missing: "Unlock this boost by obtaining the 'Perfect Record' feat",
		},
		skulduggery: {
			name: "Skulduggery Grade",
			required: ["Thief"],
			cost: 5,
			max: 4,
			missing: "Unlock this boost by obtaining the 'Thief' feat",
		},
		dancing: {
			name: "Dancing Grade",
			required: ["May I have this Dance?"],
			cost: 5,
			max: 4,
			missing: "Unlock this boost by obtaining the 'May I have this Dance?' feat",
		},
		swimming: {
			name: "Swimming Grade",
			required: ["Aquanaut"],
			cost: 5,
			max: 4,
			missing: "Unlock this boost by obtaining the 'Aquanaut' feat",
		},
		athletics: {
			name: "Athletics Grade",
			required: ["Swift"],
			cost: 5,
			max: 4,
			missing: "Unlock this boost by obtaining the 'Swift' feat",
		},
		tending: {
			name: "Tending Grade",
			required: ["Green Fingered"],
			cost: 5,
			max: 4,
			missing: "Unlock this boost by obtaining the 'Green Fingered' feat",
		},
		greenThumb: {
			name: "Green Thumb Trait",
			required: ["Green Fingered"],
			cost: 40,
			max: 1,
			missing: "Unlock this boost by obtaining the 'Green Fingered' feat",
		},
		housekeeping: {
			name: "Housekeeping Grade",
			required: ["Majordomo"],
			cost: 5,
			max: 4,
			missing: "Unlock this boost by obtaining the 'Majordomo' feat",
		},
		seduction: {
			name: "Seduction Grade",
			required: ["Seductress"],
			cost: 5,
			max: 4,
			missing: "Unlock this boost by obtaining the 'Seductress' feat",
		},
		purity: {
			name: "Daily Purity Boost",
			required: ["Angel", "Fallen Angel"],
			cost: 20,
			max: 5,
			exclusive: "impurity",
			missing: "Unlock this boost by obtaining the 'Walk Like an Angel' and 'Falling, Falling, Falling...' feats",
		},
		impurity: {
			name: "Daily Impurity Boost",
			required: ["Demon"],
			cost: 20,
			max: 5,
			exclusive: "purity",
			missing: "Unlock this boost by obtaining the 'Devilish Looks' feat",
		},
		newLife: {
			name: "A New Life",
			required: ["Broodmother Host", "Top Broodmother Host"],
			cost: 20,
			missing: "Unlock this boost by obtaining a hidden feat (" + setup.feats["Broodmother Host"].hint + ")",
		},
		aNewBestFriend: {
			name: "A New Best Friend",
			required: ["Ear Slime Lover", "Ear Slime Amalgam"],
			cost: 10,
			missing: "Unlock this boost by obtaining a hidden feat (" + setup.feats["Ear Slime Lover"].hint + ")",
		},
		tattoos: {
			name: "Starting Tattoos",
			required: ["A Living Canvas", "Billboard"],
			cost: 5,
			max: 5,
			missing: "Unlock this boost by obtaining the 'Billboard' and 'A Living Canvas' feats",
		},
		randomClothing: {
			name: "Random Clothing",
			required: [],
			cost: 1,
			max: 20,
			missing: "",
		},
		specialClothing: {
			name: "Special Clothing",
			required: ["Curious Attire", "Wicked Wardrobe"],
			cost: 0,
			missing: "Unlock this boost by obtaining a hidden feat (" + setup.feats["Curious Attire"].hint + ")",
		},
		sexToys: {
			name: "Sex Toys",
			required: ["Opened Pandoras Box", "Opened Pandoras Cocks"],
			cost: 30,
			missing: "Unlock this boost by obtaining a hidden feat (" + setup.feats["Opened Pandoras Box"].hint + ")",
		},
	};

	const earnedFeats = Object.keys(V.feats.allSaves);
	Object.entries(boostData).forEach(([k, f]) => {
		const maxEarned = !f.required.length ? 1 : f.required.filter(x => earnedFeats.includes(x)).length;
		const max = !maxEarned ? 0 : f.max ?? (f.maxMultiplier * maxEarned || maxEarned);

		V.featsBoosts.upgrades[k] = 0;
		V.featsBoosts.upgradeDetails[k] = { cost: f.cost, max, purchased: 0, ...(f.exclusive ? { exclusive: f.exclusive } : {}) };
		V.featsBoosts.missing[k] = f.missing;
		V.featsBoosts.name[k] = max > 0 ? f.name : "?????";
	});
}
DefineMacro("setupFeatBoosts", setupFeatBoosts);

function applyFeatBoosts() {
	const upgrades = V.featsBoosts.upgrades;
	const details = V.featsBoosts.upgradeDetails;

	// reincarnated into the same nightmare
	if (V.featsBoosts.pointsUsed > 0) earnFeat("A New Life");

	// starting money
	if (upgrades.money > 0) statChange.money(details.money.purchased * details.money.max * 2500, "startingMoney");

	const gain = (skill, mult = 1) => (upgrades[skill] / details[skill].cost) * mult;

	// starting grades
	if (upgrades.grades) {
		["science", "english", "maths", "history"].forEach(subject => {
			V[subject + "trait"] += gain("grades", 1);
			V[subject] = [100, 200, 400, 700, 1000][Math.clamp(V[subject + "trait"], 0, 4) || 0];
		});
	}
	// skills
	if (upgrades.skulduggery) {
		V.skulduggery = gain("skulduggery", 100);
		V.skulduggeryday = V.skulduggery;
	}
	if (upgrades.dancing) V.danceskill = gain("dancing", 100);
	if (upgrades.tending) V.tending += gain("tending", 100);
	if (upgrades.swimming) V.swimmingskill += gain("swimming", 100);
	if (upgrades.athletics) V.athletics += gain("athletics", 100);
	if (upgrades.seduction) V.seductionskill = gain("seduction", 100);
	if (upgrades.housekeeping) V.housekeeping = gain("housekeeping", 100);

	// daily (im)purity
	if (upgrades.purity) V.featsPurityBoost = gain("purity", 1);
	if (upgrades.impurity) V.featsPurityBoost = gain("impurity", -1);

	// green thumb
	if (upgrades.greenThumb) {
		V.backgroundTraits.pushUnique("greenthumb");
		if (V.fertiliser) ++V.fertiliser.current;
	}

	// parasitic pregnancy
	if (upgrades.newLife) {
		// you bought it - you pay for it
		if (!V.settings.parasitePregnancyEnabled) V.settings.parasitePregnancyEnabled = true;
		// get pregnant
		wikifier("impregnateParasite", "tentacle", 400);
		wikifier("fertiliseParasites");
		V.pregnancyStats.parasiteDoctorEvents = 2;
		V.sexStats.anus.pregnancy.motherStatus = 2;
		// adjust stats
		const para = V.sexStats.anus.pregnancy.fetus[0].stats;
		para.gender = "Hermaphrodite";
		if (upgrades.newLife === 40) {
			para.growth = 7;
			para.speed = 54;
		}
		para.lastEgg = Math.floor(para.growth / 3);
	}

	// ear slime
	if (upgrades.aNewBestFriend) {
		wikifier("parasite", "left_ear", "slime");
		if (upgrades.aNewBestFriend > 10) wikifier("parasite", "right_ear", "slime");
		switch (V.featsBoosts.earSlimeType) {
			case "grownAggressive":
				V.earSlime.corruption = 100;
				V.earSlime.growth = 25;
				V.earSlime.startedThreats = true;
				V.earSlime.exhibitionism = 2;
				V.earSlime.deviancy = 2;
				V.earSlime.promiscuity = 2;
				break;
			case "immatureAggressive":
				V.earSlime.corruption = 20;
				V.earSlime.growth = 0;
				V.earSlime.startedThreats = true;
				V.earSlime.exhibitionism = 2;
				V.earSlime.deviancy = 2;
				V.earSlime.promiscuity = 2;
				break;
			default:
				V.earSlime.corruption = 0;
		}
	} else {
		delete V.featsBoosts.earSlimeType;
	}

	// random clothes
	if (upgrades.randomClothing) {
		const clothingItems = upgrades.randomClothing * 3;
		const equip = clone(setup.clothingLayer.body);
		const options = {};
		equip.forEach(slot => {
			options[slot] = setup.clothes[slot].filter(c => {
				if (V.featsBoosts.clothingGender === "Female" && c.gender === "m") return false;
				if (V.featsBoosts.clothingGender === "Male" && c.gender === "f") return false;
				if (c.outfitSecondary) return false;
				if (!c.shop.includes("clothing")) return false;
				return true;
			});
		});

		// make normal clothes and underwear more likely to appear than accessories
		equip.push("upper", "upper", "upper", "upper", "lower", "lower", "lower", "lower", "under_upper", "under_upper", "under_lower", "under_lower");
		for (let i = 0; i < clothingItems; ++i) {
			// pick random item from weighted slot list
			const item = clone(options[equip.random()].random());
			// make sure there's enough space in our wardrobe
			if (item.outfitPrimary && Object.keys(item.outfitPrimary).length + 1 > clothingItems - i) {
				--i;
				continue;
			}
			// pick the color if available
			if (item.colour_options?.length) {
				const colors = clone(item.colour_options);
				if (colors.includes("custom") && V.featsBoosts.clothingCustomColors) {
					item.colour = "custom";
					item.colourCustom = customColour(random(0, 360), random(0, 20) / 10, random(5, 40) / 10, random(0, 20) / 10, random(0, 100) / 100);
				} else {
					colors.delete("custom");
					item.colour = colors.random();
				}
			}
			// pick accessory color
			if (item.accessory_colour_options?.length) {
				const colors = clone(item.accessory_colour_options);
				if (colors.includes("custom") && V.featsBoosts.clothingCustomColors) {
					item.accessory_colour = "custom";
					item.accessory_colourCustom = customColour(
						random(0, 360),
						random(0, 20) / 10,
						random(5, 40) / 10,
						random(0, 20) / 10,
						random(0, 100) / 100
					);
				} else {
					colors.delete("custom");
					item.accessory_colour = colors.random();
				}
			}
			// pick the pattern
			if (item.pattern_options?.length) item.pattern = clone(item.pattern_options.random());

			// oh no. the outfits.
			if (item.outfitPrimary) {
				Object.keys(item.outfitPrimary).forEach(slot => {
					const item2 = clone(setup.clothes[slot].find(c => c.name === item.outfitPrimary[slot]));
					// transfer colors and patterns
					["colour", "colourCustom", "accessory_colour", "accessory_colourCustom", "pattern"].forEach(p => {
						if (item[p]) item2[p] = clone(item[p]);
					});
					V.wardrobe[item2.slot].push(item2);
				});
			}
			V.wardrobe[item.slot].push(item);
		}
	}

	// special clothes
	if (upgrades.specialClothing) {
		const unlocked = V.feats.allSaves.specialClothes;
		specialClothesUpdate();
		const level = details.specialClothing.purchased;
		// old notes on the level:
		/* Level 1 upgrade - unlock previously unlocked special clothing sets by selection. */
		/* Level 2 upgrade - unlock all special clothes unlocked in any other save. */
		/* Level 3 upgrade - everything is remembered. */
		unlocked.forEach(c => {
			if (V.featsBoosts.specialClothesSets[c] === true) specialClothesUnlock("set", c, Math.clamp(level, 2, 3));
		});
	}

	// tattoos
	if (upgrades.tattoos) {
		// number of tattoos to apply
		const totalTattoos = gain("tattoos", 1);
		// list of all available tattoos
		const featsTattooAll = Object.values(setup.bodywriting)
			.filter(t => !t.featSkip)
			.map(m => m.writing);
		// list of all available bodyparts
		const bodyparts = clone(setup.bodyparts);
		// boost options
		const boostObj = V.featsBoosts.tattoos;

		// remove non-random claimed locations from the pool
		// slots do not start at 0, they go 1-5!!!
		for (let i = 1; i <= totalTattoos; ++i) {
			const location = boostObj[i].bodypart;
			if (location !== "Random") bodyparts.delete(location.toLowerCase().replaceAll(" ", "_"));
		}

		// apply tattoos
		for (let i = 1; i <= totalTattoos; ++i) {
			const location = boostObj[i].bodypart === "Random" ? bodyparts.pluck() : boostObj[i].bodypart.toLowerCase().replaceAll(" ", "_");
			const tattooWriting = boostObj[i].tattoo === "Random" ? featsTattooAll.random() : boostObj[i].tattoo;
			const tattoo = Object.keys(setup.bodywriting).find(k => setup.bodywriting[k].writing === tattooWriting);
			const pen = boostObj[i].pen.toLowerCase();
			wikifier("add_bodywriting", location, tattoo, pen);
		}
		wikifier("bodywritingExposureCheck", true);
	}

	// sex toys
	if (upgrades.sexToys) {
		const totalToys = gain("sexToys", 3);
		// stupid code uses stupid indexes, arrrr
		const toyIndexes = setup.sextoys.filter(t => !t.shop.includes("forest")).map(m => m.index);
		const boostObj = V.featsBoosts.sexToys;
		// remove claimed non-random toys from the pool
		for (let i = 0; i < totalToys; ++i) {
			if (toyIndexes.includes(boostObj[i].index)) toyIndexes.delete(boostObj[i].index);
		}
		for (let i = 0; i < totalToys; ++i) {
			// index
			let index = boostObj[i].index;
			if (index == null || index === -1) index = toyIndexes.pluck();
			// color
			let color = boostObj[i].colour;
			if (color == null || color === -1) color = setup.sextoys[index].colour_options.random();

			sexShopOnBuyClick(index, false, color, false);
		}
	}

	// cleanup
	["name", "missing", "clothingCustomColors", "clothingGender", "upgradeDetails", "tattoos", "sexToys", "hidden", "purchased", "specialClothesSets"].forEach(
		k => delete V.featsBoosts[k]
	);
}
DefineMacro("applyFeatBoosts", applyFeatBoosts);

/*
Paste in the console to get the total number of vrelcoins
Object.values(setup.feats).reduce((num, feat) => num + feat.difficulty, 0)
*/
