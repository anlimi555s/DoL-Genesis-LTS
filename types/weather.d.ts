interface ImageLocation {
	folder: string;
	base?: ImageSetting | { [key: string]: ImageSetting };
	emissive?: EmissiveSetting | { [key: string]: EmissiveSetting };
	reflective?: ReflectiveSetting;
	layerTop?: ImageSetting | { [key: string]: ImageSetting };
	weather?: WeatherLocationSettings;
	particles?: {};
}

interface AnimationSetting {
	frameDelay: number | (() => number);
	cycleDelay?: number | (() => number);
	startDelay?: number | (() => number);
	startFrame?: number | (() => number);
	slider?: boolean | (() => boolean);
	frames?: number | (() => number);
}

interface ImageSetting {
	image: string;
	condition?: boolean | (() => boolean);
	waitForAnimation?: string;
	alwaysDisplay?: boolean;
	animation?: string | AnimationSetting;
	frame?: number | (() => number);
}

interface EmissiveSetting {
	image: string;
	condition?: boolean | (() => boolean);
	waitForAnimation?: string;
	alwaysDisplay?: boolean;
	animation?: string | AnimationSetting;
	color?: string;
	size?: number;
	blur?: number;
	strength?: number;
	intensity?: number | (() => number);
}

interface ReflectiveSetting {
	mask?: MaskSetting;
	[key: string]: ReflectiveProperty;
}

interface MaskSetting {
	image: string;
	alpha?: number | (() => number);
	horizon?: number | (() => number);
	waveShiftFactor?: number | (() => number);
	animationCondition?: boolean | (() => boolean);
	verticalDirection?: number | (() => number);
	verticalFactor?: number | (() => number);
	verticalSpeed?: number | (() => number);
	amplitude?: number | (() => number);
	frequency?: number | (() => number);
	verticalFactor?: number | (() => number);
}

interface ReflectiveProperty {
	image: string;
	condition?: boolean | (() => boolean);
	alpha?: number | (() => number);
	gradientMask?: boolean | (() => boolean);
	alwaysDisplay?: boolean | (() => boolean);
	compositeOperation?: string | (() => string);
	animation?: string | AnimationSetting;
	verticalFactor?: number | (() => number);
	amplitude?: number | (() => number);
	verticalSpeed?: number | (() => number);
}

interface BoundsBand {
	top?: number | (() => number);
	bottom?: number | (() => number);
}

interface GroundBounds {
	splashes: BoundsBand;
	fog: BoundsBand;
}

interface WeatherLocationSettings {
	fogDistributionCurve?: number | (() => number);
	rainSplashEnabled?: boolean;
	fogEnabled?: boolean;
	fogOpacity?: number | (() => number);
	groundBounds?: GroundBounds;
}

interface WeatherType {
	name: string;
	iconType: string | (() => string);
	value: number;
	probability: {
		summer: number;
		winter: number;
		spring: number;
		autumn: number;
	};
	cloudCount: {
		small: () => number;
		medium: () => number;
		large: () => number;
	};
	tanningModifier: number | (() => number);
	overcast: number | (() => number);
	precipitationIntensity: number | (() => number);
	rain?: {
		dropLength: number;
		dropSpeed: number;
		dropWidth: number;
	};
	cloudAlpha: number;
	darkenFactor: {
		sky: number;
		sun: number;
		moon: number;
		clouds: number;
		cirrusClouds: number;
		overcastClouds: number;
		precipitation: number;
		fog: number;
		location: number;
	};
	fogChangeRate: number;
	lightningFrequency?: number | (() => number);
}

declare global {
	export interface LocationImages {
		[locationKey: string]: ImageLocation;
	}
}

export {};
