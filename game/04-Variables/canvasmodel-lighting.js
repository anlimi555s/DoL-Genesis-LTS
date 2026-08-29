const LightingCategory = {
	sidebar: 0,
	combat: 1,
};

Renderer.CanvasModels.lighting = {
	name: "lighting",
	width: 256,
	height: 256,
	frames: 1,
	scale: false,
	generatedOptions() {
		return [];
	},
	defaultOptions() {
		return {
			category: LightingCategory.sidebar,
			lights: {
				yOffset: 59,
				xOffset: -7,
				enabled: V.options.characterLightEnabled,
				spotlight: {
					maxAlpha: 0.6,
					radiusX: 50,
					radiusY: 15,
					intensity: V.options.lightSpotlight,
				},
				glow: {
					maxAlpha: 0.6,
					radiusX: 55,
					radiusY: 100,
					yOffset: -82,
					intensity: V.options.lightGlow,
				},
				gradient: {
					enabled: true,
					height: 200,
					maxAlpha: 0.6,
					intensity: V.options.lightGradient,
				},
				flat: {
					enabled: true,
					maxAlpha: 0.6,
					intensity: V.options.lightFlat,
				},
				colors: {
					default: "#ffffff",
					angel: "#ffd700",
					demon: "#8B008B",
				},
			},
		};
	},
	preprocess(options) {
		if (options.category === LightingCategory.sidebar) {
			options.lights.enabled = V.options.characterLightEnabled;
			options.lights.spotlight.intensity = V.options.lightSpotlight;
			options.lights.glow.intensity = V.options.lightGlow;
			options.lights.gradient.intensity = V.options.lightGradient;
			options.lights.flat.intensity = V.options.lightFlat;
			return;
		}

		options.lights.enabled = V.options.combatLightEnabled;
		options.lights.yOffset = V.options.combatLightOffsetY;
		options.lights.spotlight.radiusX = V.options.combatLightSpotlightX;
		options.lights.spotlight.radiusY = V.options.combatLightSpotlightY;
		options.lights.spotlight.intensity = V.options.combatLightSpotlight;
		options.lights.glow.intensity = V.options.combatLightGlow;
		options.lights.gradient.intensity = V.options.combatLightGradient;
		options.lights.flat.intensity = V.options.combatLightFlat;
	},
	layers: {
		spotlight: {
			srcfn(options) {
				if (!options.lights) return "";
				const spotlightCanvas = new BaseCanvas(Renderer.CanvasModels.main.width, Renderer.CanvasModels.main.height, 1);

				const centerX = spotlightCanvas.element.width / 2;
				const centerY = spotlightCanvas.element.height / 2;

				drawRadialGradient(
					spotlightCanvas.ctx,
					centerX,
					centerY,
					options.lights.xOffset,
					options.lights.yOffset,
					options.lights.spotlight.radiusX,
					options.lights.spotlight.radiusY,
					options.lights.spotlight.maxAlpha,
					options.lights.spotlight.intensity
				);

				return spotlightCanvas.element;
			},
			blendfn(options) {
				return lightBlendColor(options);
			},
			blendMode: "screen",
			showfn(options) {
				return options.lights.enabled;
			},
			z: ZIndices.spotlight,
		},
		glow: {
			srcfn(options) {
				if (!options.lights) return "";
				const glowCanvas = new BaseCanvas(Renderer.CanvasModels.main.width, Renderer.CanvasModels.main.height, 1);

				const centerX = glowCanvas.element.width / 2;
				const centerY = glowCanvas.element.height / 2;

				drawRadialGradient(
					glowCanvas.ctx,
					centerX,
					centerY,
					options.lights.xOffset,
					options.lights.yOffset + options.lights.glow.yOffset,
					options.lights.glow.radiusX,
					options.lights.glow.radiusY,
					options.lights.glow.maxAlpha,
					options.lights.glow.intensity
				);

				return glowCanvas.element;
			},
			blendfn(options) {
				return lightBlendColor(options);
			},
			blendMode: "screen",
			showfn(options) {
				return options.lights.enabled;
			},
			z: ZIndices.glowlight,
		},
		linearGradient: {
			srcfn(options) {
				if (!options.lights) return "";
				const linearGradientCanvas = new BaseCanvas(Renderer.CanvasModels.main.width, Renderer.CanvasModels.main.height, 1);

				// Draw linear gradient
				drawLinearGradient(
					linearGradientCanvas.ctx,
					options.lights.gradient.maxAlpha,
					options.lights.gradient.intensity,
					options.lights.gradient.height
				);

				return linearGradientCanvas.element;
			},
			blendfn(options) {
				return lightBlendColor(options);
			},
			blendMode: "screen",
			showfn(options) {
				return options.lights.enabled && options.lights.gradient.enabled;
			},
			z: ZIndices.gradientlight,
		},
		flatColorOverlay: {
			srcfn(options) {
				if (!options.lights) return "";
				const flatColorCanvas = new BaseCanvas(Renderer.CanvasModels.main.width, Renderer.CanvasModels.main.height, 1);

				const flatColor = "#ffffff";

				// Draw flat color overlay
				drawColorOverlay(flatColorCanvas.ctx, flatColor, options.lights.flat.maxAlpha, options.lights.flat.intensity);

				return flatColorCanvas.element;
			},
			blendfn(options) {
				return lightBlendColor(options);
			},
			blendMode: "screen",
			showfn(options) {
				return options.lights.enabled && options.lights.flat.enabled;
			},
			z: ZIndices.flatlight,
		},
	},
};

// Utility functions

function drawRadialGradient(ctx, centerX, centerY, xOffset, yOffset, radiusX, radiusY, maxAlpha, intensity) {
	const alpha = intensity * maxAlpha;
	ctx.save();
	ctx.scale(radiusX / radiusY, 1);

	const gradient = ctx.createRadialGradient(
		(centerX + xOffset) * (radiusY / radiusX),
		centerY + yOffset,
		0,
		(centerX + xOffset) * (radiusY / radiusX),
		centerY + yOffset,
		radiusY
	);

	gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
	gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.33})`);
	gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
	ctx.fillStyle = gradient;
	ctx.filter = "blur(1px)";
	ctx.imageSmoothingEnabled = true;
	ctx.fillRect(0, 0, ctx.canvas.width * (radiusY / radiusX), ctx.canvas.height);
	ctx.restore();
}

function drawLinearGradient(ctx, maxAlpha, intensity, height) {
	const alpha = intensity * maxAlpha;
	const gradient = ctx.createLinearGradient(0, 0, 0, height);
	gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
	gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, ctx.canvas.width, height);
}

function drawColorOverlay(ctx, color, maxAlpha, intensity) {
	const alpha = Math.round(intensity * maxAlpha * 255)
		.toString(16)
		.padStart(2, "0");
	const rgbaColor = tinycolor(color + alpha).toRgbString();
	ctx.fillStyle = rgbaColor;
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function lightBlendColor(options) {
	if (!V.angel && !V.demon) return false;
	const baseColor = V.angel ? options.lights.colors.angel : options.lights.colors.demon;
	const factor = Math.abs((V.angel / 6 - V.demon / 6) * V.options.lightTFColor);
	return ColourUtils.interpolateColor("#ffffff", baseColor, factor);
}

Macro.add("configureCombatLighting", {
	handler() {
		T.modeloptions.category = LightingCategory.combat;
	},
});
