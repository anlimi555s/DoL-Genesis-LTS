/**
 * A single particle that can be reused.
 *
 * Usage:
 *   const p = new Particle({ x:10, y:20, velocity:{x:0,y:-50}, lifetime:2 });
 *   // then each frame:
 *   p.update(dt);
 *   if (p.isAlive) p.draw(ctx);
 *
 * Options (all optional):
 *
 * @property {number} x                      	start X position (px)
 * @property {number} y                     	start Y position (px)
 * @property {{x:number,y:number}} position     initial position
 * @property {{x:number,y:number}} velocity     initial velocity (px/s)
 * @property {number} gravity               	vertical acceleration (px/s^2)
 * @property {number} curve                   	horizontal acceleration (px/s^2)
 * @property {"line"|"rect"} shape       		render shape
 * @property {{w:number,h:number}} size        	dimensions in px
 * @property {string} color         			Hex color string
 * @property {number} alpha                   	starting opacity (0–1)
 * @property {number} lifetime               	total life before death (seconds)
 * @property {boolean} fade              		whether to fade out
 * @property {number} fadeStart            		seconds before fade begins
 * @property {number} fadeTime					fade duration (seconds)
 * @property {number} wobbleAmplitude			wobble amplitude (for e.g. snow)
 * @property {number} wobbleFrequency			wobble cycles per second
 * @property {boolean} horizontalWobble         allow wobble on X axis
 * @property {boolean} verticalWobble           allow wobble on Y axis
 * @property {number} initialWobblePhase 		phase offset for wobble (rad)
 * @property {number} sinDriftAmplitude 		px of horizontal drift (Sine wave based on distance)
 * @property {number} sinDriftWavelength 		vertical px per sine cycle
 */
Weather.Renderer.Particle = class Particle {
	#gravity;
	#curve;
	#wobbleAmplitude;
	#wobbleFrequency;
	#wobblePhase;
	#sinDriftAmplitude;
	#sinDriftWavelength;
	#fadeStart = 0;
	#fadeRate = 0;
	#shrinkStart = Infinity;
	#shrinkDuration = 0;
	#rotation = { angle: 0, speed: 0 };

	// Cache
	#cos = 1;
	#sin = 1;
	image = null;

	constructor(options = {}) {
		this.reset(options);
	}

	reset({
		position = { x: 0, y: 0 },
		velocity = { x: 0, y: 0 },
		rotation = { angle: 0, speed: 0 },
		size = { w: 1, h: 1 },
		gravity = 0,
		curve = 0,
		shape = "rect",
		image = null,
		color = null,
		alpha = 1,
		lifetime = 1,
		fade = true,
		fadeStart = 0,
		fadeTime = 1,
		wobbleAmplitude = 0,
		wobbleFrequency = 0,
		horizontalWobble = true,
		verticalWobble = true,
		initialWobblePhase = Math.random() * Math.PI * 2,
		sinDriftAmplitude = 0,
		sinDriftWavelength = 100,
		collisionTime = Infinity,
		shrinkDuration = 0,
		isPrewarmed = false,
	} = {}) {
		this.position = { ...position };
		this.velocity = { ...velocity };
		this.size = { ...size };
		this.length = size.w;
		this.#gravity = gravity;
		this.#curve = curve;
		this.shape = shape;
		this.image = image;
		this.color = color;
		this.alpha = alpha;
		this.age = 0;
		this.lifetime = lifetime;
		this.fade = fade;
		this.collisionTime = collisionTime;
		this.#fadeStart = fadeStart;
		this.#fadeRate = fadeTime > 0 ? alpha / fadeTime : 0;
		this.#rotation = { angle: (rotation.angle * Math.PI) / 180, speed: rotation.speed };
		this.#wobbleAmplitude = wobbleAmplitude;
		this.#wobbleFrequency = wobbleFrequency;
		this.horizontalWobble = horizontalWobble;
		this.verticalWobble = verticalWobble;
		this.#wobblePhase = initialWobblePhase;
		this.#sinDriftAmplitude = sinDriftAmplitude;
		this.#sinDriftWavelength = sinDriftWavelength;
		this.#shrinkDuration = shrinkDuration;
		this.#shrinkStart = this.shape === "line" && shrinkDuration > 0 ? this.lifetime - shrinkDuration : Infinity;
		this.isPrewarmed = isPrewarmed;

		this.updateRotation();
	}

	/**
	 * @param {number} time  seconds since last update
	 */
	update(time) {
		this.velocity.x += this.#curve * time;
		this.velocity.y += this.#gravity * time;
		this.position.x += this.velocity.x * time;
		this.position.y += this.velocity.y * time;

		this.#rotation.angle = (this.#rotation.angle + this.#rotation.speed * time) % (Math.PI * 2);

		// Wobble
		if (this.#wobbleAmplitude && this.#wobbleFrequency && (this.horizontalWobble || this.verticalWobble)) {
			const wobble = Math.sin(this.age * this.#wobbleFrequency + this.#wobblePhase) * this.#wobbleAmplitude;
			const magSqr = this.velocity.y * this.velocity.y + this.velocity.x * this.velocity.x;
			const invMag = magSqr > 0 ? 1 / Math.sqrt(magSqr) : 1;
			const wobbleX = -this.velocity.y * invMag * wobble;
			const wobbleY = this.velocity.x * invMag * wobble;
			if (this.horizontalWobble) this.position.x += wobbleX;
			if (this.verticalWobble) this.position.y += wobbleY;
		}

		// Fade
		this.age += time;
		if (this.fade && this.age >= this.#fadeStart) {
			this.alpha = Math.max(0, this.alpha - this.#fadeRate * time);
		}
	}

	updateRotation() {
		// Cache the rotation
		const ang = Math.atan2(this.velocity.y, this.velocity.x);
		this.#cos = Math.cos(ang);
		this.#sin = Math.sin(ang);
	}

	draw(ctx) {
		const driftX =
			this.#sinDriftAmplitude && this.#sinDriftWavelength
				? this.#sinDriftAmplitude * Math.sin((this.position.y / this.#sinDriftWavelength) * 2 * Math.PI)
				: 0;

		ctx.save();

		if (this.shape === "image" && (!(this.image instanceof Image) || !this.image.complete)) this.shape = "rect";

		switch (this.shape) {
			case "image": {
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.translate(this.position.x + driftX, this.position.y);
				ctx.rotate(this.#rotation.angle);
				ctx.globalAlpha = this.alpha;
				ctx.drawImage(this.image, -this.size.w / 2, -this.size.h / 2, this.size.w, this.size.h);

				// Color overlay
				if (!this.color) break;
				ctx.fillStyle = this.color;
				ctx.globalCompositeOperation = "source-atop";
				ctx.fillRect(-this.size.w / 2, -this.size.h / 2, this.size.w, this.size.h);
				break;
			}

			case "line":
				ctx.setTransform(this.#cos, this.#sin, -this.#sin, this.#cos, this.position.x + driftX, this.position.y);
				ctx.rotate(this.#rotation.angle);
				ctx.globalAlpha = this.alpha;
				ctx.strokeStyle = this.color ?? "#fff";
				{
					let w = this.size.w;
					if (this.age >= this.#shrinkStart) {
						const t = this.age - this.#shrinkStart;
						const frac = Math.max(0, 1 - t / this.#shrinkDuration);
						w = this.size.w * frac;
					}
					ctx.lineWidth = this.size.h;
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(w, 0);
					ctx.stroke();
				}
				break;

			case "circle":
				ctx.setTransform(this.#cos, this.#sin, -this.#sin, this.#cos, this.position.x + driftX, this.position.y);
				ctx.globalAlpha = this.alpha;
				ctx.fillStyle = this.color ?? "#fff";
				ctx.beginPath();
				ctx.arc(0, 0, this.size.w / 2, 0, 2 * Math.PI);
				ctx.fill();
				break;

			case "rect":
			default:
				ctx.setTransform(this.#cos, this.#sin, -this.#sin, this.#cos, this.position.x + driftX, this.position.y);
				ctx.globalAlpha = this.alpha;
				ctx.fillStyle = this.color ?? "#fff";
				ctx.fillRect(-this.size.w / 2, -this.size.h / 2, this.size.w, this.size.h);
		}

		ctx.restore();
	}

	get isAlive() {
		return this.age < this.lifetime && this.alpha > 0;
	}
};
