// The fog effect is always trying to reach a specified number of particles, spawning new ones as
//  needed and decreasing by having the particles leave the canvas, rather than redrawing when
//  the number of particles changes. This is done so that we can have a persistent fog effect across
//  multiple locations. Other particle effects are busy enough so that when all of the particles
//  are redrawn, you don't notice. However, this isn't the case with fog, it's very obvious when
//  the fog gets redrawn. By keeping a persistent fog effect and not redrawing it constantly, we
//  avoid this issue.

Weather.Renderer.Effects.add({
	name: "particleFog",

	defaultParameters: {
		maxParticleCount: 150,

		minVel: 2, // px/sec
		maxVel: 4, // px/sec
		opacity: 1,

		scale: 4, // sprite width in px
		scaleVariance: 1,

		fogDistributionCurve: 1, // Biases the fog spawns and density within the band. 1 = equal distribution.
		top: 40, // Px above bottom
		bottom: 0, // Px above bottom

		fadeInSeconds: 2, // Time it takes for a particle to fade in
	},

	init() {
		// Particles get culled when at 0 alpha
		const MIN_ALPHA = 0.001;

		const canvasWidth = this.canvas.element.width;
		const canvasHeight = this.canvas.element.height;

		const fogImage = this.images.fog;
		const aspect = fogImage.height / fogImage.width;

		const getMaxFogParticles = bandHeight => {
			if (bandHeight <= 10) return Constants.weather.fogParticles.globalLocationCapMin;
			if (bandHeight >= 25) return Constants.weather.fogParticles.globalLocationCapMax;
			const ratio = (bandHeight - 10) / 15;
			const curve = Math.max(0.01, this.fogDistributionCurve);
			const adjustedRatio = Math.pow(ratio, 1 / curve);

			return (
				Constants.weather.fogParticles.globalLocationCapMin +
				adjustedRatio * (Constants.weather.fogParticles.globalLocationCapMax - Constants.weather.fogParticles.globalLocationCapMin)
			);
		};

		this.getTargetParticleCount = () => {
			const bandHeight = this.top - this.bottom;

			const maxFogParticles = getMaxFogParticles(bandHeight);
			const scale = maxFogParticles / Constants.weather.fogParticles.globalLocationCapMax;
			return Math.round(this.maxParticleCount * scale);
		};

		const targetParticleCount = this.getTargetParticleCount();

		// Spread fog spawns along X to reduce visible clumping during prewarm.
		this.fogSpawnIndex = 0;

		this.particleEmitter = new Weather.Renderer.ParticleEmitter(this.canvas.ctx, {
			origin: { x: 0, y: 0 },
			maxParticles: targetParticleCount,
			spawnRate: 1,

			preWarm: true,
			autoDestroy: false,

			initialSettings: {
				shape: "image",
				image: fogImage,
				size: { w: this.scale, h: this.scale * aspect },
				alpha: MIN_ALPHA,
				gravity: 0,
				fade: false,
				lifetime: Number.POSITIVE_INFINITY,
			},

			generator: () => {
				const w = Math.max(1, this.scale + (Math.random() * 2 - 1) * this.scaleVariance);
				const h = w * aspect;

				const speed = this.minVel + Math.random() * (this.maxVel - this.minVel);

				const x = (((this.fogSpawnIndex++ % this.particleEmitter.maxParticles) + Math.random()) / this.particleEmitter.maxParticles) * canvasWidth;
				const dir = Math.round(Math.random()) * 2 - 1;

				const bandTopY = canvasHeight - this.top;
				const bandBottomY = canvasHeight - this.bottom;
				const bandHeight = Math.max(0, bandBottomY - bandTopY);
				const t = Math.pow(Math.random(), 1 / this.fogDistributionCurve);
				const y = bandTopY + t * bandHeight;

				return {
					position: { x, y },
					velocity: { x: dir * speed, y: 0 },
					size: { w, h },
				};
			},

			onUpdate: p => {
				if (!p.isPrewarmed) {
					const t = Math.min(1, p.age / this.fadeInSeconds);
					p.alpha = MIN_ALPHA + (this.opacity - MIN_ALPHA) * t;
				} else {
					p.alpha = this.opacity;
				}

				const bandTopY = canvasHeight - this.top;
				const bandBottomY = canvasHeight - this.bottom;
				const outOfBounds = p.position.y < bandTopY || p.position.y > bandBottomY;
				if (outOfBounds) {
					p.lifetime = 0;
				}

				// Cull when fully offscreen
				if (p.velocity.x > 0) {
					if (p.position.x - p.size.w / 2 > canvasWidth) p.lifetime = 0;
				} else {
					if (p.position.x + p.size.w / 2 < 0) p.lifetime = 0;
				}

				// Cull if there should be no fog particles
				if (this.getTargetParticleCount() === 0) p.lifetime = 0;
			},

			animationGroup: this.parentLayer.animationGroup,
		});

		this.particleEmitter.enable();
	},
	draw() {
		const em = this.particleEmitter;
		if (!em) return;

		em.ctx = this.canvas.ctx;
		const currentCount = em.particles.length;

		const targetParticleCount = this.getTargetParticleCount();
		this.targetParticleCount = targetParticleCount;
		if (em.maxParticles !== targetParticleCount) {
			em.maxParticles = targetParticleCount;
		}
		const missing = Math.max(0, targetParticleCount - currentCount);
		const rate = missing > 0 ? 1 : 0;

		// console.log("targetFogParticles: " + targetParticleCount + " currentFogParticles: " + currentCount);

		em.spawnRate = rate;

		em.draw();
	},
});
