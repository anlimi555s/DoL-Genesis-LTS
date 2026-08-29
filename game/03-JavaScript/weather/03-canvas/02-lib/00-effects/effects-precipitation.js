Weather.Renderer.Effects.add({
	name: "particleRain",

	defaultParameters: {
		sunTint: "#ffffffbb",
		moonTint: "#3b5580",
		dawnDuskTint: "#dbb695",
		groundDayTint: "#ffffffbb",
		groundNightTint: "#7895c4",
		groundDawnDuskTint: "#a08160",
		baseAlpha: 1,

		// Scales splash size and alpha. Used to make narrower splash bands not have such dense splashes
		splashIntensity: 1,

		dropCount: 100, // number of drops
		dropSpeed: 1, // px/s
		windStrength: 1, // 0–1 multiplier
		windAngle: 0, // Radians
		dropLength: 3, // px
		dropWidth: 1, // px

		// Splash settings
		enableSplashes: true,
		splashTriggerTop: 20, // px above bottom before splash
		splashTriggerBottom: 0, // bottom border of splash
		splashMaxRadius: 4, // px
		splashLineWidth: 0.5, // px
		splashParticleCount: 2, // how many tiny particles per splash
		splashParticleSpeed: 6, // max initial speed
		splashParticleGravity: 2, // gravity pulling them down
		splashParticleFadeTime: 0.7, // seconds to fade out

		// Misc
		splashMinScale: 0.1, // minimum scale of splashes based on distance from the bottom (hardcoded to 25px to be minimum)
	},

	async init() {
		// Clean up
		if (this.particleEmitter) {
			this.particleEmitter.destroy?.();
			this.particleEmitter = null;
		}
		const { width, height } = this.canvas.element;
		this.splashes = [];
		this.splashEmitters = [];

		// base velocities and spawn bounds so particles drift into view
		const baseVy = this.dropSpeed * Math.cos(this.windAngle);
		const baseVx = this.dropSpeed * this.windStrength * Math.sin(this.windAngle);
		const lifeDist = height + this.dropLength;
		const drift = Math.abs((baseVx / baseVy) * lifeDist);

		const minX = -drift;
		const maxX = width + drift;
		const spawnWidth = Math.max(1, maxX - minX);
		const spawnScale = spawnWidth / Math.max(1, width);
		const scaledDropCount = Math.ceil(this.dropCount * spawnScale);

		this.particleEmitter = new Weather.Renderer.ParticleEmitter(this.canvas.ctx, {
			origin: { x: 0, y: -this.dropLength },
			maxParticles: scaledDropCount,
			spawnRate: scaledDropCount,
			preWarm: true,
			curve: 0,
			initialSettings: {
				shape: "line",
				size: { w: this.dropLength, h: this.dropWidth },
				color: this.topColor,
				alpha: this.baseAlpha,
				lifetime: lifeDist / baseVy,
				gravity: 0,
				fade: false,
			},
			generator: () => {
				const spawnX = Math.random() * (maxX - minX) + minX;
				const spawnVy = baseVy + (Math.random() * 0.2 - 0.1);
				const spawnVx = baseVx + (Math.random() * 0.2 - 0.1);

				// pick a random collision offset
				const bandRange = this.splashTriggerTop - this.splashTriggerBottom;
				const offset = this.splashTriggerBottom + Math.random() * bandRange;

				const collisionY = this.canvas.element.height - offset;
				const collisionTime = collisionY / spawnVy;
				const shrinkDuration = this.dropLength / Math.hypot(spawnVx, spawnVy);
				const totalLifetime = collisionTime + shrinkDuration;

				return {
					position: { x: spawnX, y: -this.dropLength },
					velocity: { x: spawnVx, y: spawnVy },
					lifetime: totalLifetime,
					shrinkDuration,
					collisionTime,
				};
			},

			onCollision: p => {
				const vel = p.velocity;
				const mag = Math.hypot(vel.x, vel.y) || 1;
				const normX = vel.x / mag;
				const normY = vel.y / mag;
				const overshoot = Math.max(0, p.age - p.collisionTime);
				const impactX = p.position.x - vel.x * overshoot;
				const impactY = p.position.y - vel.y * overshoot;
				const headX = impactX + normX * p.length;
				const headY = impactY + normY * p.length;

				if (!this.enableSplashes) return;

				// add a line ripple at the particle position
				this.splashes.push({ x: headX, y: headY, frame: 0 });

				const dist = height - p.position.y;
				const frac = Math.min(Math.max(dist / 25, 0), 1);
				const scale = 1 - frac * (1 - this.splashMinScale);

				// small splash particles
				const splashEmitter = new Weather.Renderer.ParticleEmitter(this.canvas.ctx, {
					origin: { x: headX, y: headY },
					maxParticles: this.splashParticleCount,
					spawnRate: null,
					spawnInterval: 0.01,
					preWarm: false,
					autoDestroy: true,
					initialSettings: {
						shape: "rect",
						size: { w: scale * this.splashIntensity, h: scale * this.splashIntensity },
						color: this.bottomColor,
						alpha: this.splashIntensity,
						fade: true,
						fadeTime: this.splashParticleFadeTime,
						gravity: this.splashParticleGravity,
					},
					generator: () => ({
						velocity: {
							x: (Math.random() * 2 - 1) * this.splashParticleSpeed * scale * this.splashIntensity,
							y: -Math.random() * this.splashParticleSpeed * scale * this.splashIntensity,
						},
						lifetime: this.splashParticleFadeTime * 1.1,
					}),
					animationGroup: this.parentLayer.animationGroup,
				});

				this.splashEmitters.push(splashEmitter);
			},
			animationGroup: this.parentLayer.animationGroup,
		});
	},

	onEnable() {
		// For race conditions when changing weather type
		if (!this.particleEmitter) {
			const initialized = this.init?.();
			if (initialized && typeof initialized.then === "function") {
				initialized.then(() => this.particleEmitter?.enable?.());
				return;
			}
		}
		this.particleEmitter?.enable?.();
	},

	onDisable() {
		this.particleEmitter.destroy?.();
		this.particleEmitter = null;
	},

	draw() {
		const ctx = this.canvas?.ctx;
		const height = this.canvas?.element?.height ?? 0;
		const { topColor, bottomColor, splashMinScale, splashMaxRadius, splashLineWidth, baseAlpha } = this;

		if (!this.particleEmitter) {
			this.canvas?.clear?.();
			return;
		}

		this.particleEmitter.initialSettings.color = topColor;

		for (const p of this.particleEmitter.particles) {
			const yFactor = Math.min(Math.max(p.position.y / height, 0), 1);
			p.color = ColourUtils.interpolateColor(topColor, bottomColor, yFactor);
		}
		this.canvas.clear();

		// Drops
		this.particleEmitter.draw();

		// Line-ripples
		for (let i = this.splashes.length - 1; i >= 0; i--) {
			const s = this.splashes[i];
			s.frame++;
			const splashMaxRadiusScaled = splashMaxRadius * this.splashIntensity;
			const raw = Math.min(s.frame * 0.5, splashMaxRadiusScaled);
			// scale
			const dist = height - s.y;
			const frac = Math.min(dist / 25, 1);
			const scale = 1 - frac * (1 - splashMinScale);

			const len = raw * scale;
			const lineWidth = splashLineWidth * scale * this.splashIntensity;
			const alpha = (1 - raw / splashMaxRadiusScaled) * baseAlpha * this.splashIntensity;

			ctx.save();
			ctx.strokeStyle = this.bottomColor;
			ctx.lineWidth = lineWidth;
			ctx.globalAlpha = alpha;
			ctx.beginPath();
			ctx.moveTo(s.x - len, s.y);
			ctx.lineTo(s.x + len, s.y);
			ctx.stroke();
			ctx.restore();

			if (raw >= splashMaxRadiusScaled) this.splashes.splice(i, 1);
		}

		// Splash-particles
		for (let i = this.splashEmitters.length - 1; i >= 0; i--) {
			const sys = this.splashEmitters[i];
			sys.draw();
			if (sys.particles.length === 0) {
				this.splashEmitters.splice(i, 1);
			}
		}
	},
});

Weather.Renderer.Effects.add({
	name: "particleSnow",

	defaultParameters: {
		sunTint: "#ffffffbb",
		moonTint: "#3b5580",
		dawnDuskTint: "#dbb695",
		groundDayTint: "#ffffffbb",
		groundNightTint: "#7895c4",
		groundDawnDuskTint: "#a08160",

		dropCount: 200, // flakes per second
		dropSpeed: 0.5, // slower fall
		windStrength: 0.3, // 0–1 multiplier
		windAngle: 0, // 0 = straight down (radians)
		dropSize: 1, // px
		baseAlpha: 1, // opacity

		// Wobble
		wobbleAmplitude: 0.5, // px side‑to‑side
		wobbleFrequency: 1, // cycles/sec

		// Pile / collision triggers
		pileTriggerTop: 20, // max px above bottom that can pile
		pileTriggerBottom: 0, // min px above bottom

		// Fade before disappearing
		pixelFadeTime: 1.5, // seconds to fade

		// Snow glare (optional)
		snowGlare: false,
		glareInterval: 50, // avg secs between glints
		glareDuration: 0.5, // secs each glint lasts
		glareAlpha: 1, // opacity of the halo
		glareColor: "#ffffff",
	},

	async init() {
		if (this.particleEmitter) {
			this.particleEmitter.destroy?.();
			this.particleEmitter = null;
		}
		const { width, height } = this.canvas.element;
		this.staticPixels = [];

		this.deltaTime = this.parentLayer.animationGroup.updateRate / 1000;

		// How strongly the wind moves flakes sideways
		const windCurve = this.windStrength * this.dropSpeed * Math.sin(this.windAngle);

		// Worst-case vertical speed (slowest fall = longest time in the air)
		const minVy = Math.max(0.001, this.dropSpeed - 0.1);

		// Worst-case time a particle can be airborne before it "lands"
		const tMax = (height - this.pileTriggerBottom) / minVy;

		const drift = Math.abs(windCurve) * tMax + this.wobbleAmplitude * 2;

		const spawnMinX = windCurve > 0 ? -drift : 0;
		const spawnMaxX = windCurve < 0 ? width + drift : width;

		// single shared emitter for flakes
		this.particleEmitter = new Weather.Renderer.ParticleEmitter(this.canvas.ctx, {
			origin: { x: 0, y: -this.dropSize },
			maxParticles: this.dropCount,
			spawnRate: this.dropCount,
			preWarm: true,
			curve: 0,
			initialSettings: {
				shape: "rect",
				size: { w: this.dropSize, h: this.dropSize },
				color: this.topColor,
				alpha: this.baseAlpha,
				fade: false,
				wobbleAmplitude: this.wobbleAmplitude,
				wobbleFrequency: this.wobbleFrequency,
				horizontalWobble: true,
				verticalWobble: false,
				lifetime: (height + this.dropSize) / this.dropSpeed,
			},
			generator: () => {
				const spawnX = Math.random() * (spawnMaxX - spawnMinX) + spawnMinX;
				// vertical speed
				const spawnVy = this.dropSpeed + (Math.random() * 0.2 - 0.1);
				const spawnVx = windCurve + (Math.random() * 0.1 - 0.05);

				// pick a random pile band between bottom & top triggers
				const range = this.pileTriggerTop - this.pileTriggerBottom;
				const offset = this.pileTriggerBottom + Math.random() * range;
				const collisionY = height - offset;

				// time to collision = distance / vertical speed
				const collisionTime = (collisionY + this.dropSize) / spawnVy;

				return {
					position: { x: spawnX, y: -this.dropSize },
					velocity: { x: spawnVx, y: spawnVy },
					lifetime: collisionTime,
					collisionTime,
				};
			},

			onCollision: p => {
				// record one static‐pixel at the point of collision
				this.staticPixels.push({
					x: p.position.x,
					y: p.position.y,
					age: 0,
				});
			},
			animationGroup: this.parentLayer.animationGroup,
		});
		this.glareState = new WeakMap();
	},

	onEnable() {
		if (!this.particleEmitter) {
			const initialized = this.init?.();
			if (initialized && typeof initialized.then === "function") {
				initialized.then(() => this.particleEmitter?.enable?.());
				return;
			}
		}
		this.particleEmitter?.enable?.();
	},
	onDisable() {
		this.particleEmitter.destroy?.();
		this.particleEmitter = null;
	},

	draw() {
		const ctx = this.canvas?.ctx;
		const { topColor, bottomColor, pixelFadeTime, dropSize, snowGlare, glareInterval, glareDuration, glareAlpha, glareColor } = this;

		if (!this.particleEmitter) {
			this.canvas?.clear?.();
			return;
		}

		this.canvas.clear();
		this.particleEmitter.draw();

		// snow glare
		if (snowGlare) {
			ctx.save();

			const halfDur = glareDuration / 2;

			for (const p of this.particleEmitter.particles) {
				let st = this.glareState.get(p);
				if (!st) {
					st = { time: null, next: Math.random() * glareInterval };
					this.glareState.set(p, st);
				}

				if (st.time != null) {
					// in a glare
					st.time += this.deltaTime;
					if (st.time < glareDuration) {
						// fade in/out
						const frac = st.time < halfDur ? st.time / halfDur : (glareDuration - st.time) / halfDur;
						ctx.globalAlpha = frac * glareAlpha;
						ctx.fillStyle = glareColor;
						ctx.shadowColor = glareColor;
						ctx.shadowBlur = dropSize * 2.4;
						ctx.shadowOffsetX = 0;
						ctx.shadowOffsetY = 0;

						ctx.beginPath();
						ctx.arc(p.position.x, p.position.y, dropSize, 0, 2 * Math.PI);
						ctx.fill();
					} else {
						st.time = null;
						st.next = Math.random() * glareInterval;
					}
				} else {
					st.next -= this.deltaTime;
					if (st.next <= 0) {
						st.time = 0;
					}
				}
			}

			ctx.restore();
		}

		// Tint
		for (const p of this.particleEmitter.particles) {
			const yf = Math.max(0, Math.min(1, p.position.y / this.canvas.element.height));
			p.color = ColourUtils.interpolateColor(topColor, bottomColor, yf);
		}

		// Fadeout
		for (let i = this.staticPixels.length - 1; i >= 0; i--) {
			const px = this.staticPixels[i];
			px.age += this.deltaTime;
			const alpha = 1 - px.age / pixelFadeTime;
			if (alpha <= 0) {
				this.staticPixels.splice(i, 1);
				continue;
			}
			const yf = Math.max(0, Math.min(1, px.y / this.canvas.element.height));
			const col = ColourUtils.interpolateColor(topColor, bottomColor, yf);
			ctx.save();
			ctx.globalAlpha = alpha;
			ctx.fillStyle = col;
			ctx.fillRect(px.x, px.y, dropSize, dropSize);
			ctx.restore();
		}
	},
});

Weather.Renderer.Effects.add({
	name: "debugBounds",
	defaultParameters: {
		splashTop: null,
		fogTop: null,
		lineWidth: 1,
		splashColor: "#2b6cff",
		fogColor: "#ff2b2b",
	},
	draw() {
		const ctx = this.canvas?.ctx;
		const height = this.canvas?.element?.height ?? 0;
		if (!ctx || height <= 0) return;

		const drawLine = (top, color) => {
			const y = height - top;
			ctx.save();
			ctx.strokeStyle = color;
			ctx.lineWidth = this.lineWidth;
			ctx.beginPath();
			ctx.moveTo(0, Math.round(y) + 0.5);
			ctx.lineTo(this.canvas.element.width, Math.round(y) + 0.5);
			ctx.stroke();
			ctx.restore();
		};

		drawLine(this.splashTop, this.splashColor);
		drawLine(this.fogTop, this.fogColor);
	},
});
