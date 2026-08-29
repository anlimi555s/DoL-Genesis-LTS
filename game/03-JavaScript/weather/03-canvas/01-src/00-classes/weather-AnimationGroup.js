Weather.Renderer.AnimationGroup = class AnimationGroup {
	constructor(options, onUpdate) {
		this.lastUpdateTime = 0;
		this.updateRate = options.updateRate;
		this.animations = new Map();
		this.animationFrameId = null;
		this.onUpdate = onUpdate;
	}

	/**
	 * Add child-animations if eligible
	 */
	init() {
		this.animations.forEach(animation => {
			const parent = this.animations.get(animation.parentAnimation);
			parent?.childAnimations.push(animation);
		});
	}

	reset() {
		this.animations.clear();
	}

	add(key, animation) {
		if (!(animation instanceof Weather.Renderer.Animation)) {
			console.error("Error adding animation to group: Expected Animation instance as argument, but received ", animation);
			return;
		}

		this.animations.set(key, animation);
	}

	start() {
		const frame = time => {
			if (!this.lastUpdateTime || time - this.lastUpdateTime >= this.updateRate) {
				this.updateAnimations(time - this.lastUpdateTime);
				this.lastUpdateTime = time;
			}
			this.animationFrameId = requestAnimationFrame(frame);
		};
		this.animationFrameId = requestAnimationFrame(frame);
	}

	updateAnimations(deltaTime) {
		if (!V.weatherObj) return;

		deltaTime = Math.min(deltaTime, this.updateRate);
		// LTS 修复：无动画时不再触发 onUpdate（原实现空转时每帧全画布重合成，
		// 移动端白白占用 CPU。所有动态效果均通过 animationGroup.add 驱动，
		// 静态层的空 tick 无可见收益）。回退：恢复下方 onUpdate() 调用即可。
		if (this.animations.size < 1) {
			return;
		}
		const updatedEffects = new Set();
		this.animations.forEach((animation, key) => {
			if (!animation.parentAnimation) {
				if (animation.canUpdate(this) && animation.update(deltaTime)) {
					updatedEffects.add(key);
				}
			}
		});

		if (updatedEffects.size > 0) {
			this.onUpdate();
		}
	}

	isAnimationRunning(key) {
		const animation = this.animations.get(key);
		return animation && animation.inCycle;
	}

	stop() {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}
};
