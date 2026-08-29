/* eslint-disable no-undef */
Macro.add("rangeslider", {
	handler() {
		function snapToStep(rawValue) {
			const clampedValue = Math.max(minValue, Math.min(rawValue, maxValue));
			return minValue + Math.round((clampedValue - minValue) / stepValue) * stepValue;
		}

		function validateAndApply(isMin, newVal) {
			const clamp = isMin ? options.minClamp : options.maxClamp;
			const boundary = isMin ? Math.min(Wikifier.getValue(maxName), clamp ?? Infinity) : Math.max(Wikifier.getValue(minName), clamp ?? -Infinity);
			return snapToStep(isMin ? Math.min(newVal, boundary) : Math.max(newVal, boundary));
		}

		function checkDisabled() {
			if (typeof callbacks.condition !== "function") return;
			const conditionResult = callbacks.condition();
			disabled = conditionResult !== undefined && conditionResult !== false;

			// Apply disabled class and tooltip
			$container.toggleClass("disabled", disabled);
			$track.toggleClass("disabled", disabled);
			$trackHighlight.toggleClass("disabled", disabled);
			$thumbMin.toggleClass("disabled", disabled);
			$thumbMax.toggleClass("disabled", disabled);

			if (typeof conditionResult !== "string") return;

			if (disabled) {
				$container.tooltip({ message: conditionResult, delay: 0, position: "cursor", cursor: "not-allowed" });
			} else {
				$container.tooltip("disable");
			}
		}

		function handleEvent() {
			console.log("handle event");
			checkDisabled();
			render();
		}

		function render() {
			if (renderPending) return;
			renderPending = true;

			requestAnimationFrame(() => {
				renderPending = false;

				if (disabled) return;

				const trackWidth = $track.width();
				const handleWidth = $thumbMin.outerWidth();
				const rangeWidth = trackWidth - 2 * handleWidth;

				const leftEdgeMin = ((state.minVal - minValue) / (maxValue - minValue)) * rangeWidth;
				const leftEdgeMax = Math.max(leftEdgeMin + handleWidth, handleWidth + ((state.maxVal - minValue) / (maxValue - minValue)) * rangeWidth);

				// thumbs
				$thumbMin.css("left", `${leftEdgeMin}px`);
				$thumbMax.css("left", `${leftEdgeMax}px`);
				$trackHighlight.css({
					left: `${leftEdgeMin + handleWidth}px`,
					width: `${Math.max(0, leftEdgeMax - leftEdgeMin - handleWidth)}px`,
				});

				const minClampReached = options.minClamp !== undefined && state.minVal >= options.minClamp;
				$thumbMin.toggleClass("disabledThumb", minClampReached);
				if (options.minClampMessage) {
					if (minClampReached) {
						$thumbMin.tooltip({ message: options.minClampMessage, delay: 0, position: "cursor", cursor: "pointer" });
					} else {
						$thumbMin.tooltip("disable");
					}
				}

				const maxClampReached = options.maxClamp !== undefined && state.maxVal <= options.maxClamp;
				$thumbMax.toggleClass("disabledThumb", maxClampReached);
				if (options.maxClampMessage) {
					if (maxClampReached) {
						$thumbMax.tooltip({ message: options.maxClampMessage, delay: 0, position: "cursor", cursor: "pointer" });
					} else {
						$thumbMax.tooltip("disable");
					}
				}

				const text = callbacks.value ? callbacks.value(state.minVal, state.maxVal) : `[${state.minVal} - ${state.maxVal}]`;
				if ($display.html() !== text) $display.html(text);
			});
		}

		function handlePointerDown(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			if (disabled) return;

			isDragging = true;

			const isTouchEvent = ev.type.startsWith("touch");
			const clientX = isTouchEvent ? ev.touches[0].clientX : ev.clientX;

			const rect = $track[0].getBoundingClientRect();
			const clickX = clientX - rect.left;

			const thumbs = {
				min: { thumb: $thumbMin, stateKey: "minVal", clamp: options.minClamp, position: $thumbMin.position().left },
				max: { thumb: $thumbMax, stateKey: "maxVal", clamp: options.maxClamp, position: $thumbMax.position().left },
			};

			// Clicking on thumb directly
			if (ev.target === thumbs.min.thumb[0] || ev.target === thumbs.max.thumb[0]) {
				draggingThumbMin = ev.target === thumbs.min.thumb[0];
				cursorOffset = clickX - parseFloat($(ev.target).css("left"));

				$(document).on("mousemove touchmove", handlePointerMove);
				$(document).on("mouseup touchend", handlePointerUp);
				return;
			}

			const rawVal = minValue + (clickX / rect.width) * (maxValue - minValue);
			const minClampReached = thumbs.min.clamp !== undefined && state.minVal >= thumbs.min.clamp;
			const maxClampReached = thumbs.max.clamp !== undefined && state.maxVal <= thumbs.max.clamp;

			// Closest thumb, clamped
			draggingThumbMin =
				minClampReached && clickX > thumbs.min.position
					? false
					: maxClampReached && clickX < thumbs.max.position
					? true
					: Math.abs(state.minVal - state.maxVal) < 1e-9
					? clickX < thumbs.min.position
					: Math.abs(rawVal - state.minVal) < Math.abs(rawVal - state.maxVal);

			const thumb = draggingThumbMin ? thumbs.min : thumbs.max;
			const snappedVal = validateAndApply(draggingThumbMin, rawVal);

			if (snappedVal !== state[thumb.stateKey]) {
				state[thumb.stateKey] = snappedVal;
				Wikifier.setValue(thumb.stateKey === "minVal" ? minName : maxName, snappedVal);
			}

			render();
			$(document).on("mousemove touchmove", handlePointerMove);
			$(document).on("mouseup touchend", handlePointerUp);
		}

		function handlePointerMove(ev) {
			ev.stopPropagation();
			if (!isDragging || draggingThumbMin === null || disabled) return;

			const isTouchEvent = ev.type.startsWith("touch");
			const clientX = isTouchEvent ? ev.touches[0].clientX : ev.clientX;

			const rect = $track[0].getBoundingClientRect();
			const trackWidth = rect.width;
			const handleWidth = $thumbMin.outerWidth();
			const rangeWidth = trackWidth - 2 * handleWidth;
			let offsetX = clientX - rect.left - cursorOffset;

			const oppositeThumbPosition = draggingThumbMin ? $thumbMax.position().left - handleWidth : $thumbMin.position().left + handleWidth;

			offsetX = draggingThumbMin
				? Math.max(0, Math.min(offsetX, oppositeThumbPosition))
				: Math.min(trackWidth - handleWidth, Math.max(offsetX, oppositeThumbPosition));

			const ratio = draggingThumbMin ? offsetX / rangeWidth : (offsetX - handleWidth) / rangeWidth;
			const rawVal = minValue + ratio * (maxValue - minValue);
			const snappedVal = validateAndApply(draggingThumbMin, rawVal);

			// Update only if value changes
			const currentStateVal = draggingThumbMin ? state.minVal : state.maxVal;
			if (snappedVal !== currentStateVal) {
				if (draggingThumbMin) {
					state.minVal = snappedVal;
					Wikifier.setValue(minName, snappedVal);
				} else {
					state.maxVal = snappedVal;
					Wikifier.setValue(maxName, snappedVal);
				}

				render();
				throttledInput();
			}
		}

		function handlePointerUp() {
			if (!isDragging) return;
			isDragging = false;
			draggingThumbMin = null;
			$(document).off("mousemove touchmove", handlePointerMove);
			$(document).off("mouseup touchend", handlePointerUp);
			if (callbacks.onMouseUp) {
				callbacks.onMouseUp(state.minVal, state.maxVal);
			}
		}

		const throttledInput = $.throttle(200, () => {
			if (callbacks.onInputChange) {
				callbacks.onInputChange(state.minVal, state.maxVal);
			}
		});

		if (this.args.length < 7) {
			const errors = [];
			this.args.length < 1 && errors.push("variable min name");
			this.args.length < 2 && errors.push("variable max name");
			this.args.length < 3 && errors.push("minimum default value");
			this.args.length < 4 && errors.push("maximum default value");
			this.args.length < 5 && errors.push("min bound value");
			this.args.length < 6 && errors.push("max bound value");
			this.args.length < 7 && errors.push("step value");
			return this.error("No " + errors.join(" or ") + " specified.");
		}

		const minName = this.args[0].trim();
		const maxName = this.args[1].trim();
		const minValue = Number(this.args[4]);
		const maxValue = Number(this.args[5]);
		const minDefault = Number(this.args[2] ?? minValue);
		const maxDefault = Number(this.args[3] ?? maxValue);
		const stepValue = Number(this.args[6]);
		const optionsArg = typeof this.args[7] === "object" ? this.args[7] : null;
		const callbacks = typeof this.args[8] === "object" ? this.args[8] : typeof this.args[7] === "object" ? this.args[7] : {};
		const options = optionsArg || {};

		if (minName[0] !== "$" && minName[0] !== "_") return this.error(`Minimum variable name (${this.args[0]}) is missing its sigil ($ or _).`);
		if (maxName[0] !== "$" && maxName[0] !== "_") return this.error(`Maximum variable name (${this.args[1]}) is missing its sigil ($ or _).`);
		if (!Number.isFinite(minValue)) return this.error(`lowerBound (${this.args[4]}) is not a number.`);
		if (!Number.isFinite(maxValue)) return this.error(`upperBound (${this.args[5]}) is not a number.`);
		if (!Number.isFinite(stepValue) || stepValue <= 0) return this.error(`stepValue (${this.args[6]}) must be a number > 0.`);
		if (minDefault < minValue) return this.error(`minDefault (${this.args[2]}) is less than lowerBound (${this.args[4]}).`);
		if (maxDefault > maxValue) return this.error(`maxDefault (${this.args[3]}) is greater than upperBound (${this.args[5]}).`);
		if (minDefault > maxDefault) return this.error(`minDefault (${this.args[2]}) cannot exceed maxDefault (${this.args[3]}).`);
		if (options.minClamp !== undefined && options.minClamp < minValue)
			return this.error(`minClamp (${options.minClamp}) cannot be less than minValue (${minValue}).`);
		if (options.maxClamp !== undefined && options.maxClamp > maxValue)
			return this.error(`maxClamp (${options.maxClamp}) cannot be greater than maxValue (${maxValue}).`);

		if (Wikifier.getValue(minName) == null) Wikifier.setValue(minName, minDefault ?? minValue);
		if (Wikifier.getValue(maxName) == null) Wikifier.setValue(maxName, maxDefault ?? maxValue);
		const state = {
			minVal: Wikifier.getValue(minName),
			maxVal: Wikifier.getValue(maxName),
		};

		const macroId = Util.slugify(`${minName}-${maxName}`);

		const $outerContainer = $("<div>").addClass("custom-rangeSlider-outer-container").appendTo(this.output);
		const $border = $("<div>").addClass("custom-rangeSlider-border-container").appendTo($outerContainer);
		const $container = $("<div>").addClass("custom-rangeSlider-container").attr("id", `custom-rangeSlider-${macroId}`).appendTo($border);
		const $track = $("<div>").addClass("custom-rangeSlider-track").appendTo($container);
		const $trackHighlight = $("<div>").addClass("custom-rangeSlider-highlight").appendTo($track);
		const $thumbMin = $("<div>").addClass("custom-rangeSlider-thumb custom-rangeSlider-thumb-min").appendTo($track);
		const $thumbMax = $("<div>").addClass("custom-rangeSlider-thumb custom-rangeSlider-thumb-max").appendTo($track);
		const $display = $("<span>").addClass("custom-rangeSlider-display").appendTo($outerContainer);

		let disabled = false;
		let renderPending = false;
		let isDragging = false;
		let draggingThumbMin = null;
		let cursorOffset = 0;

		// Events
		$track.on("mousedown touchstart", handlePointerDown);
		$(document).on("rangeslider::update", handleEvent);
		$container.on("remove", () => {
			$(document).off("rangeslider::update", handleEvent);
		});

		// When element is resized, update the thumbs
		const resizeObserver = new ResizeObserver(() => render());
		resizeObserver.observe($container[0]);
		$container.on("remove", () => {
			resizeObserver.disconnect();
		});

		requestAnimationFrame(() => {
			state.minVal = validateAndApply(true, state.minVal);
			state.maxVal = validateAndApply(false, state.maxVal);
			Wikifier.setValue(minName, state.minVal);
			Wikifier.setValue(maxName, state.maxVal);
			render();
		});
	},
});
