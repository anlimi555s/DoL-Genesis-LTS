Weather.Renderer.Effects.add({
	name: "lightning",
	defaultParameters: {
		enableLightning: true,
		lightningFrequency: null, // average strikes per minute
		lightningDelay: 0, // seconds before lightning can begin
		boltFadeDuration: 0.5, // sec fade-out after complete
		spawnPadding: -5, // px outside canvas on X
		size: 1.1, // pixel scale
		boltStartAlpha: 0.1, // starting alpha (0–1)
		boltAlphaRampPx: 10, // pixels until alpha reaches 1.0

		// branching
		branchChance: 0.015, // per pixel of main bolt
		maxBranches: 3, // total per bolt
		branchLengthMin: 0.1, // of main bolt length
		branchLengthMax: 0.5, // of main bolt length
		branchAngleOff: Math.PI / 6, // from parent
		branchAngleRange: Math.PI / 3, // total
		branchScale: 0.66, // size multiplier

		// jitter on trunk
		jitterBase: Math.PI / 8, // per step
		jitterRange: Math.PI / 4, // per step

		// speed
		boltStepsPerFrame: 25, // how many pixels to draw per animation frame

		// hold bright on completion
		flashHoldDuration: 0.1, // sec

		// optional manual endpoint - don't set this here
		boltTargetX: null,
		boltTargetY: null,
		boltStartOffsetX: null,
		boltStartOffsetY: null,
		boltStartY: null,

		// Unused code for lightningImpact effect
		// generateImpact: false,
		// impactType: "regular", // "regular" or "water"
	},

	init() {
		const rate = this.parentLayer.animationGroup.updateRate;
		const ticker = new Weather.Renderer.Animation({
			image: new BaseCanvas(1, 1).element,
			canvas: this.canvas,
			numFrames: 1,
			frameDelay: rate,
			offset: 0,
			alwaysDisplay: false,
		});
		this.parentLayer.animationGroup.add(`${this.id}_ticker`, ticker);
		ticker.enable();

		this.activeBolts = [];
		this.renderInstance.lightningPulses = this.renderInstance.lightningPulses || [];

		this.genMainTrunk = (x0, y0, endX, endY, length) => {
			const dx = endX - x0;
			const dy = endY - y0;
			const dirFwd = Math.atan2(-dy, dx);
			let dir = dirFwd + Math.PI;
			let x = endX;
			let y = endY;
			let rem = Math.floor(length);
			const back = [];

			while (rem-- > 0) {
				back.push({ x: Math.floor(x), y: Math.floor(y), dirBack: dir });
				// jitter
				dir += -this.jitterBase + Math.random() * this.jitterRange;
				dir = ((dir % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
				if (dir < Math.PI) dir += Math.PI;
				x -= Math.cos(dir);
				y += Math.sin(dir);
			}
			// reverse & convert to forward segments
			return back.reverse().map((s, i) => ({
				x: s.x,
				y: s.y,
				size: this.size,
				isMain: true,
				isMainEnd: i === back.length - 1,
				dir: s.dirBack + Math.PI,
				recursion: 0,
				dist: i, // distance in pixels from start. Used to determine alpha.
			}));
		};

		this.genBranch = (bx, by, dir, length, recursion, endY) => {
			const branchSize = this.size * this.branchScale;
			let rem = Math.floor(length);
			let x = bx;
			let y = by;
			const segs = [
				{
					x: bx,
					y: by,
					size: branchSize,
					isMain: false,
					isBranchStart: true,
					dir,
					recursion,
				},
			];

			while (rem-- > 0) {
				// angle wander
				dir += -this.branchAngleOff + Math.random() * this.branchAngleRange;
				dir = ((dir % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
				if (dir < Math.PI) dir += Math.PI;

				x += Math.cos(dir);
				y -= Math.sin(dir);
				if (y > endY) break; // never go below target
				segs.push({ x: Math.floor(x), y: Math.floor(y), size: branchSize, isMain: false, isBranchStart: false, dir, recursion });
			}
			return segs;
		};
	},

	draw() {
		if (!this.enableLightning) return;
		const dt = this.parentLayer.animationGroup.updateRate / 1000;

		// spawn new bolt
		if (this.lightningDelay > 0) {
			this.lightningDelay = Math.max(0, this.lightningDelay - dt);
		} else {
			const strikesPerSecond = this.lightningFrequency / 60;
			const strikeProbability = strikesPerSecond * dt;

			if (Math.random() < strikeProbability) {
				const viewWidth = this.canvas.element.width;
				const viewHeight = this.canvas.element.height;

				const x0 = -this.spawnPadding + Math.random() * (viewWidth + 2 * this.spawnPadding);

				let y0;
				if (this.boltStartY != null) {
					y0 = this.boltStartY + (Math.random() * 2 - 1) * this.boltStartOffsetY;
				} else if (this.boltTargetY != null) {
					y0 = this.boltTargetY * 0.1;
				} else {
					y0 = 5 + (Math.random() * viewHeight) / 3;
				}

				const endX = this.boltTargetX != null ? this.boltTargetX : x0;
				const endY = this.boltTargetY != null ? this.boltTargetY : viewHeight - 20;

				const dx = endX - x0;
				const dy = endY - y0;
				const boltLength = Math.sqrt(dx * dx + dy * dy);

				const off = new BaseCanvas(viewWidth, viewHeight);
				const oc = off.ctx;

				oc.shadowColor = "#ffffffb3";
				oc.shadowBlur = 10;

				// build just the trunk
				const trunk = this.genMainTrunk(x0, y0, endX, endY, boltLength);

				this.activeBolts.push({
					canvas: off,
					ctx: oc,
					trunk,
					trunkPos: 0,
					branches: [],
					endY,
					done: false,
					mainLength: boltLength,
					flashHold: this.flashHoldDuration,
					fade: this.boltFadeDuration,
					branchCount: 0,
				});
			}
		}

		if (!this.activeBolts.length) return;
		const ctx = this.canvas.ctx;

		// animate each bolt
		for (let bi = this.activeBolts.length - 1; bi >= 0; bi--) {
			const B = this.activeBolts[bi];

			// advance the trunk
			for (let st = 0; st < Math.ceil(this.boltStepsPerFrame) && B.trunkPos < B.trunk.length; st++, B.trunkPos++) {
				const seg = B.trunk[B.trunkPos];

				// Calculates the opacity of the pixels, which increases as the bolt grows.
				const boltAlphaRampPx = this.boltAlphaRampPx;
				const boltStartAlpha = this.boltStartAlpha;

				let boltPxAlpha;
				if (seg.dist >= boltAlphaRampPx) {
					boltPxAlpha = 1;
				} else {
					boltPxAlpha = boltStartAlpha + (1 - boltStartAlpha) * (seg.dist / boltAlphaRampPx);
				}

				// main bolt pixel
				B.ctx.fillStyle = `rgba(255,255,255,${boltPxAlpha})`;
				B.ctx.fillRect(seg.x, seg.y, seg.size, seg.size);

				// maybe spawn a branch
				if (!B.done && Math.random() < this.branchChance && B.branchCount < this.maxBranches) {
					const blen = B.mainLength * (this.branchLengthMin + Math.random() * (this.branchLengthMax - this.branchLengthMin));
					const bdir = seg.dir + (-this.branchAngleOff + Math.random() * this.branchAngleRange);
					const brSegs = this.genBranch(seg.x, seg.y, bdir, blen, 1, B.endY);
					B.branches.push({ segments: brSegs, pos: 0 });
					B.branchCount++;

					// pulse for the branch
					const last = brSegs[brSegs.length - 1];
					this.renderInstance.lightningPulses.push({
						startX: seg.x,
						startY: seg.y,
						endX: last.x,
						endY: last.y,
						time: 0,
						length: brSegs.length,
						strength: 0.7,
					});
				}

				// when we hit final segment
				if (seg.isMainEnd) {
					B.done = true;
				}

				// Unused code for lightningImpact effect
				// if (seg.isMainEnd && this.generateImpact) {
				// 	const bucket = this.impactType === "water" ? "waterImpacts" : "regularImpacts";
				// 	this.renderInstance[bucket] = this.renderInstance[bucket] || [];
				// 	this.renderInstance[bucket].push({ x: seg.x, y: seg.y, time: 0 });
				// }
			}

			// advance branches
			const branchSteps = Math.ceil(this.boltStepsPerFrame);
			for (const br of B.branches) {
				for (let st = 0; st < branchSteps && br.pos < br.segments.length; st++, br.pos++) {
					const s = br.segments[br.pos];
					B.ctx.fillStyle = "#fff";
					B.ctx.fillRect(s.x, s.y, s.size, s.size);
				}
			}
			B.branches = B.branches.filter(br => br.pos < br.segments.length);

			if (!B.done) {
				ctx.drawImage(B.canvas.element, 0, 0);
			} else if (B.flashHold > 0) {
				B.flashHold = Math.max(0, B.flashHold - dt);
				ctx.drawImage(B.canvas.element, 0, 0);
			} else {
				B.fade -= dt;
				const alpha = Math.max(0, B.fade / this.boltFadeDuration);
				if (alpha > 0) {
					ctx.save();
					ctx.globalAlpha = alpha;
					ctx.drawImage(B.canvas.element, 0, 0);
					ctx.restore();
				} else {
					this.activeBolts.splice(bi, 1);
				}
			}
		}
	},
});

Weather.Renderer.Effects.add({
	name: "lightningPulse",
	defaultParameters: {
		duration: 0.3, // seconds
		blur: 40, // px
		color: "#ffffff",
		maxWidth: null,
	},

	init() {
		const rate = this.parentLayer.animationGroup.updateRate;
		const ticker = new Weather.Renderer.Animation({
			image: new BaseCanvas(1, 1).element,
			canvas: this.canvas,
			numFrames: 1,
			frameDelay: rate,
			offset: 0,
			alwaysDisplay: false,
		});
		this.parentLayer.animationGroup.add(`${this.id}_ticker`, ticker);
		ticker.enable();
	},

	draw() {
		const pulses = this.renderInstance.lightningPulses || [];
		if (!pulses.length) return;

		const ctx = this.canvas.ctx;
		const dt = this.parentLayer.animationGroup.updateRate / 1000;
		const config = this;

		ctx.save();
		ctx.filter = `blur(${config.blur}px)`;
		ctx.fillStyle = config.color;

		for (let i = pulses.length - 1; i >= 0; i--) {
			const pulse = pulses[i];
			pulse.time = Math.min(pulse.time + dt, config.duration);

			const timeFraction = pulse.time / config.duration;
			if (timeFraction >= 1) {
				pulses.splice(i, 1);
				continue;
			}

			const alpha = (pulse.strength ?? 1) * (1 - timeFraction);

			const deltaX = pulse.endX - pulse.startX;
			const deltaY = pulse.endY - pulse.startY;
			const theta = Math.atan2(deltaY, deltaX);
			const boltLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			const midX = pulse.startX + deltaX * timeFraction;
			const midY = pulse.startY + deltaY * timeFraction;
			const minorRadius = this.maxWidth ?? 2 * boltLength;

			ctx.globalAlpha = alpha;
			ctx.translate(midX, midY);
			ctx.rotate(theta);
			ctx.beginPath();
			ctx.ellipse(0, 0, boltLength / 2, minorRadius, 0, 0, 2 * Math.PI);
			ctx.fill();
			ctx.resetTransform();
		}

		ctx.restore();
	},
});

// Unused lightningImpact effect
//
// Weather.Renderer.Effects.add({
// 	name: "lightningImpact",
// 	defaultParameters: {
// 		waterColor: "#8479c280",
// 		waterDuration: 1, // sec
// 		// water splashes
// 		splashLifetime: 0.5, // sec
// 		splashMaxRadius: 15,
// 		splashLineWidth: 2,

// 		// regular sparks
// 		sparkColor: "#dee6c3ff",
// 		sparkGravity: 20, // px/sec²

// 		sparkCount: 10, // how many sparks per impact
// 		sparkSize: 1, // px radius
// 		sparkSpeedMin: 6, // px/sec
// 		sparkSpeedMax: 17, // px/sec
// 		sparkDuration: 1.2, // sec total life
// 		sparkFadeDurationMin: 0.2, // sec minimum individual fade
// 		sparkFadeDurationMax: 0.7,
// 		sparkBaseAngle: (3 * Math.PI) / 4, // central angle (upwards)
// 		sparkAngleVariance: Math.PI / 4, // ± range around base

// 		lingerColor: "#f3a255",
// 		lingerDuration: 3,
// 	},

// 	init() {
// 		// ticker so draw() runs every tick
// 		const rate = this.parentLayer.animationGroup.updateRate;
// 		const ticker = new Weather.Renderer.Animation({
// 			image: new BaseCanvas(1, 1).element,
// 			canvas: this.canvas,
// 			numFrames: 1,
// 			frameDelay: rate,
// 			offset: 0,
// 			alwaysDisplay: false,
// 		});
// 		this.parentLayer.animationGroup.add(`${this.id}_ticker`, ticker);
// 		ticker.enable();
// 	},

// 	draw() {
// 		const ctx = this.canvas.ctx;
// 		const canvasHeight = this.canvas.element.height;
// 		const dt = this.parentLayer.animationGroup.updateRate / 1000;
// 		const config = this;

// 		const waterQueue = this.renderInstance.waterImpacts || [];
// 		const regularQueue = this.renderInstance.regularImpacts || [];

// 		// water impact
// 		const waterBand = 20;
// 		for (let i = waterQueue.length - 1; i >= 0; --i) {
// 			const impact = waterQueue[i];
// 			impact.time = (impact.time || 0) + dt;
// 			if (impact.time >= config.waterDuration) {
// 				waterQueue.splice(i, 1);
// 				continue;
// 			}

// 			const tFrac = impact.time / config.waterDuration;
// 			const rawLen = tFrac * config.splashMaxRadius;
// 			const alpha = 1 - tFrac;
// 			const splashDepth = canvasHeight - impact.y;
// 			const depthF = Math.max(0, Math.min((waterBand - splashDepth) / waterBand, 1));
// 			const len = rawLen * depthF * 1.2;

// 			ctx.save();
// 			ctx.strokeStyle = config.waterColor;
// 			ctx.globalAlpha = alpha;
// 			ctx.lineWidth = config.splashLineWidth;
// 			ctx.beginPath();
// 			ctx.moveTo(impact.x - len, impact.y);
// 			ctx.lineTo(impact.x + len, impact.y);
// 			ctx.stroke();
// 			ctx.restore();

// 			const count = Math.max(1, 3 - Math.floor(splashDepth / (waterBand / 3)));
// 			for (let k = 0; k < count; k++) {
// 				const px = (Math.random() * 0.4 - 0.2) * len;
// 				const py = -len * 0.4;
// 				ctx.save();
// 				ctx.fillStyle = config.waterColor;
// 				ctx.globalAlpha = alpha * 0.3;
// 				ctx.fillRect(impact.x + px, impact.y + py, 1, 1);
// 				ctx.restore();
// 			}
// 		}

// 		for (let i = regularQueue.length - 1; i >= 0; i--) {
// 			const impact = regularQueue[i];

// 			if (!impact.initialized) {
// 				impact.initialized = true;
// 				impact.time = 0;
// 				impact.particles = [];
// 				for (let j = 0; j < config.sparkCount; j++) {
// 					const angle = config.sparkBaseAngle + (Math.random() * 2 - 1) * config.sparkAngleVariance;
// 					const speed = config.sparkSpeedMin + Math.random() * (config.sparkSpeedMax - config.sparkSpeedMin);
// 					const fadeDuration = config.sparkFadeDurationMin + Math.random() * (config.sparkFadeDurationMax - config.sparkFadeDurationMin);
// 					impact.particles.push({
// 						x: impact.x,
// 						y: impact.y,
// 						vx: Math.cos(angle) * speed,
// 						vy: Math.sin(angle) * speed,
// 						t: 0,
// 						size: config.sparkSize,
// 						fadeDuration,
// 					});
// 				}
// 			}

// 			impact.time += dt;
// 			impact.centerTime = (impact.centerTime || 0) + dt;

// 			// lingering pixel
// 			if (impact.centerTime <= config.lingerDuration) {
// 				const lingerAlpha = 1 - impact.centerTime / config.lingerDuration;
// 				ctx.save();
// 				ctx.fillStyle = config.sparkColor;
// 				ctx.globalAlpha = lingerAlpha;
// 				ctx.shadowColor = config.sparkColor;
// 				ctx.shadowBlur = 6;
// 				ctx.fillRect(impact.x - 1, impact.y - 1, 2, 2);
// 				ctx.restore();
// 			}

// 			if (impact.time >= config.sparkDuration && impact.centerTime >= config.lingerDuration) {
// 				regularQueue.splice(i, 1);
// 			}

// 			for (let j = impact.particles.length - 1; j >= 0; j--) {
// 				const particle = impact.particles[j];
// 				particle.t += dt;
// 				if (particle.t >= config.sparkDuration) {
// 					impact.particles.splice(j, 1);
// 					continue;
// 				}

// 				// physics
// 				particle.vy += config.sparkGravity * dt;
// 				particle.x += particle.vx * dt;
// 				particle.y += particle.vy * dt;

// 				let alpha = 1;
// 				const fadeStart = config.sparkDuration - particle.fadeDuration;
// 				if (particle.t > fadeStart) {
// 					alpha = 1 - (particle.t - fadeStart) / particle.fadeDuration;
// 				}

// 				ctx.save();
// 				ctx.fillStyle = config.sparkColor;
// 				ctx.shadowColor = config.sparkColor;
// 				ctx.shadowBlur = 4;
// 				ctx.globalAlpha = alpha;
// 				ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
// 				ctx.restore();
// 			}
// 		}
// 	},
// });
