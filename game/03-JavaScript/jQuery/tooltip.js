/* eslint-disable no-unused-expressions */
/*
	The main purpose for this jQuery plugin was to enable tooltips for dynamically created elements, by using jQuery
	However, I also added a [tooltip] attribute to be used with an html element, which is more flexible than the old tooltip.

	Example usage: (jquery)
	jqueryElement.tooltip({
		message: "Here is a tooltip",
		delay: 200,
		position: "cursor",
	});

	Enable or disable it:
	jqueryElement.tooltip("enable");
	jqueryElement.tooltip("disable");

	Change message to an already existing tooltip:
	jqueryElement.tooltip({ message: "New message" });


	Example usage: (html)
	<div tooltip="Here is a tooltip" id="someid" class="someclass">
		Content here
	</div>

	Example usage (with added span for separate styles for the tooltip - and sugarcube variable)
	<div tooltip="Here is a tooltip:<span class='yellow'>Current pepper sprays: $spray</span>">
		Pepper sprays
	</div>

	Example usage (with customised settings):
	<div tooltip="Tooltip text" tooltip-title="Title" tooltip-position="bottom">
		Pepper sprays
	</div>


	---------------------------------------------------
	Styling: (tooltip.css)
	.tooltip-popup - The container for the tooltip
	.tooltip-header - An optional title property
	.tooltip-body - The tooltip text
	- Anchor styling can be changed with the property "anchorStyle" (anchor = the object to hover over to display the tooltip)

	Settings:
		title: A bigger title text - default null
		message: The actual tooltip content
		anchorStyle: Optional css class for the anchor
		position: Position of the tooltip. Options: cursor, top, bottom, left, right, bottomRight, bottomLeft, topRight, topLeft
		cursor: Cursor styling when hovering over the anchor
		delay: Optional delay - default 150ms)
		width: Optional width of the tooltip. If set to null, it will resize itself based on the content
		maxWidth: Optional max width of the tooltip. When it reaches this width, text will wrap to the next row
*/

const defaultTooltipSettings = {
	title: "",
	message: "",
	delay: 150,
	position: "cursor",
	cursor: "help",
	style: null,
	anchorStyle: null,
	width: null,
	maxWidth: null,
};

// Robust cleanup if the tooltip element was removed while hover over it with the cursor, to prevent orphaned tooltip elements
const observer = new MutationObserver(mutations => {
	let shouldCleanup = false;

	mutations.forEach(mutation => {
		mutation.removedNodes.forEach(node => {
			const $node = $(node);

			if ($node.is("[tooltip], .tooltip-popup") || $node.find("[tooltip], .tooltip-popup").length > 0) {
				shouldCleanup = true;
			}

			$node
				.find("[tooltip]")
				.addBack("[tooltip]")
				.each(function () {
					const tooltipId = $(this).data("tooltip-id");
					if (tooltipId) {
						$(`.tooltip-popup[data-tooltip-id="${tooltipId}"]`).remove();
					}
				});

			$node
				.find(".tooltip-popup")
				.addBack(".tooltip-popup")
				.each(function () {
					const tooltipId = $(this).data("tooltip-id");
					$(`[tooltip][data-tooltip-id="${tooltipId}"]`).removeData("tooltip-id tooltip-instance");
				});
		});
	});

	// Check for orphaned tooltips - remove them if their container was removed
	if (shouldCleanup) {
		$(".tooltip-popup").each(function () {
			const $tooltip = $(this);
			const tooltipId = $tooltip.attr("data-tooltip-id");

			const associatedAnchor = $(`[tooltip][data-tooltip-id="${tooltipId}"]`);
			if (associatedAnchor.length === 0) {
				$tooltip.remove();
			}
		});
	}
});

observer.observe(document.body, {
	childList: true,
	subtree: true,
});

const getTooltipSettings = element => {
	const settings = { ...defaultTooltipSettings };
	$.each(element.attributes, function () {
		if (this.name.startsWith("tooltip-")) {
			const key = this.name.substring(8);
			if (key in defaultTooltipSettings) {
				// Convert to appropriate type if necessary
				if (key === "delay" || key === "width" || key === "maxWidth") {
					settings[key] = parseInt(this.value, 10) || defaultTooltipSettings[key];
				} else {
					settings[key] = this.value;
				}
			}
		}
	});
	const messageAttr = $(element).attr("tooltip");
	if (messageAttr) {
		const message = $("<div>");
		new Wikifier(message, messageAttr);
		settings.message = message.html();
	}
	return settings;
};

$(document).on("mouseenter.tooltip", "[tooltip]", function (event) {
	const $this = $(this);

	const pluginSettings = $this.data("tooltip-settings") || {};
	const attrSettings = getTooltipSettings(this);
	const settings = $.extend({}, attrSettings, pluginSettings);

	$this.data("tooltip-settings", settings);
	if (settings.cursor) $this.css("cursor", settings.cursor);
	if (settings.anchorStyle) $this.addClass(settings.anchorStyle);
	$this.data("cursorPosition", { x: event.clientX, y: event.clientY });
	show($this);
});

$(document).on("mouseleave.tooltip", "[tooltip]", function () {
	const $this = $(this);
	clearTimeout($this.data("tooltip-timeout"));
	hide($this);
});

$(document).on("mousemove.tooltip", "[tooltip]", function (event) {
	const $this = $(this);
	const settings = $this.data("tooltip-settings");
	if (settings && settings.position.toLowerCase() === "cursor") {
		$this.data("cursorPosition", { x: event.clientX, y: event.clientY });
		const tooltip = $this.data("tooltip-instance");
		if (tooltip) updateMousePosition($this, tooltip);
	}
});

const show = ($element, force = false) => {
	if ($element.data("tooltip-instance")) {
		const tooltip = $element.data("tooltip-instance");
		updatePosition($element, tooltip);
		return;
	}
	const settings = $element.data("tooltip-settings");
	if (!settings || $element.data("tooltip-disabled")) return;

	if (!force) {
		clearTimeout($element.data("tooltip-timeout"));
		const timeout = setTimeout(() => {
			createTooltip($element, settings);
		}, settings.delay);
		$element.data("tooltip-timeout", timeout);
	} else {
		clearTimeout($element.data("tooltip-timeout"));
		createTooltip($element, settings);
	}
};

const hide = $element => {
	clearTimeout($element.data("tooltip-timeout"));
	const tooltip = $element.data("tooltip-instance");
	if (tooltip) {
		tooltip.remove();
		$element.removeData("tooltip-instance");
	}
	$(window).off("resize.tooltip", $element.data("resizeHandler"));
};

const createTooltip = ($element, settings) => {
	const tooltipId = `tooltip-${Date.now()}-${Math.random()}`;
	$element.data("tooltip-id", tooltipId);

	const tooltip = $("<div>").addClass("tooltip-popup").attr("data-tooltip-id", tooltipId);

	if (settings.title) {
		$("<div>").addClass("tooltip-header").html(settings.title).appendTo(tooltip);
	}
	const $body = $("<div>").addClass("tooltip-body").appendTo(tooltip);
	if (settings.style) $body.addClass(settings.style);
	$body.html(settings.message); // or use `.append(settings.message)` if it's HTML

	if (settings.width) tooltip.css("width", settings.width);
	if (settings.maxWidth) tooltip.css("max-width", settings.maxWidth);

	$("body").append(tooltip);
	$element.data("tooltip-instance", tooltip);

	updatePosition($element, tooltip);

	const resizeHandler = () => updatePosition($element, tooltip);
	$(window).on("resize.tooltip", resizeHandler);
	$element.data("resizeHandler", resizeHandler);
};

const updateMousePosition = ($element, tooltip) => {
	const frameId = $element.data("animationFrameId");
	if (frameId) cancelAnimationFrame(frameId);

	const newFrameId = requestAnimationFrame(() => {
		updatePosition($element, tooltip);
	});
	$element.data("animationFrameId", newFrameId);
};

const updatePosition = ($element, tooltip) => {
	if (!$element?.length || !tooltip?.length) return;

	const settings = $element.data("tooltip-settings");
	if (!settings || typeof settings.position !== "string") return;

	const position = settings.position.toLowerCase();
	const distance = 15; // Distance from cursor
	let left = 0;
	let top = 0;

	const zoomLevel = parseFloat($("body").css("zoom")) || 1;

	if (position === "cursor") {
		const cursor = $element.data("cursorPosition") || { x: 0, y: 0 };
		left = cursor.x / zoomLevel + distance;
		top = cursor.y / zoomLevel + distance;
	} else {
		const offset = $element.offset();
		const elementWidth = $element.outerWidth();
		const elementHeight = $element.outerHeight();
		const tooltipWidth = tooltip.outerWidth();
		const tooltipHeight = tooltip.outerHeight();

		const positions = {
			top: () => {
				left = offset.left + (elementWidth - tooltipWidth) / 2;
				top = offset.top - tooltipHeight - distance;
			},
			bottom: () => {
				left = offset.left + (elementWidth - tooltipWidth) / 2;
				top = offset.top + elementHeight + distance;
			},
			left: () => {
				left = offset.left - tooltipWidth - distance;
				top = offset.top + (elementHeight - tooltipHeight) / 2;
			},
			right: () => {
				left = offset.left + elementWidth + distance;
				top = offset.top + (elementHeight - tooltipHeight) / 2;
			},
			bottomright: () => {
				left = offset.left + elementWidth - tooltipWidth;
				top = offset.top + elementHeight + distance;
			},
			bottomleft: () => {
				left = offset.left;
				top = offset.top + elementHeight + distance;
			},
			topleft: () => {
				left = offset.left;
				top = offset.top - tooltipHeight - distance;
			},
			topright: () => {
				left = offset.left + elementWidth - tooltipWidth;
				top = offset.top - tooltipHeight - distance;
			},
		};
		(positions[position] || positions.top)();
	}

	if (settings.position.toLowerCase() === "cursor") {
		left = Math.max(distance, Math.min(left, window.innerWidth - tooltip.outerWidth() - distance));
		top = Math.max(distance, Math.min(top, window.innerHeight - tooltip.outerHeight() - distance));
	} else {
		const windowWidth = $(window).width();
		const windowHeight = $(window).height();
		left = Math.max(distance, Math.min(left, windowWidth - tooltip.outerWidth() - distance));
		top = Math.max(distance, Math.min(top, windowHeight - tooltip.outerHeight() - distance));
	}

	tooltip.css({ left, top, position: "fixed" });
};

// .tooltip() jQuery method
$.fn.tooltip = function (options = {}) {
	return this.each(function () {
		const $this = $(this);
		if (typeof options === "string") {
			switch (options.toLowerCase()) {
				case "show":
					show($this, true);
					break;
				case "hide":
					hide($this, true);
					break;
				case "enable":
					$this.data("tooltip-disabled", false);
					break;
				case "disable":
					$this.data("tooltip-disabled", true);
					hide($this);
					break;
			}
			return;
		}

		const settings = $.extend({}, defaultTooltipSettings, $this.data("tooltip-settings"), options);
		$this.data("tooltip-settings", settings);

		if (settings.cursor) $this.css("cursor", settings.cursor);
		if (settings.anchorStyle) $this.addClass(settings.anchorStyle);
		$this.attr("tooltip", settings.message);

		if (options !== "disable") {
			$this.data("tooltip-disabled", false);
		}
	});
};
