// GenesisCompat 0.5.8 渲染模块（自动提取自 dol-0.5.8.10 canvasmodel-main.js，勿手改）
// humanoid: 人模组图层（body/face/hair/tf/writings）
// clothes: 衣服组图层（clothes 各槽位）
// helpers: 路径生成辅助函数（0.5.8 版本）
// gen: 生成器调用图层（函数体在 helpers.tf_generators）
(function () {
  'use strict';
  const helpers = {
    getWritingImgPath: function getWritingImgPath(area_name, writing) {
	if (writing.type === "text") {
		if (writing.sprites && writing.sprites.length > 0 && writing.sprites.includes(area_name)) {
			return `img/bodywriting/text/${writing.key}/${area_name}.png`;
		}
		return `img/bodywriting/text/default/${area_name}.png`;
	}
	if (writing.type === "object") return `img/bodywriting/${writing.writing}/${area_name}.png`;
	return '';
},
    getWritingImgPathArrow: function getWritingImgPathArrow(area_name, writing) {
	if (writing.type === "text") {
		if (writing.sprites && writing.sprites.length > 0 && writing.sprites.includes(area_name)) {
			return `img/bodywriting/text/${writing.key}/${area_name}.png`;
		}
		return `img/bodywriting/text/default/${area_name}${writing.arrow ? "_arrow" : ""}.png`;
	}
	if (writing.type === "object") return `img/bodywriting/${writing.writing}/${area_name}.png`;
	return '';
},
    gray_suffix: function gray_suffix(path, filter) {
	if (!filter || filter.blendMode !== "hard-light" || !filter.blend) return path;
	return path.replace('.png', '_gray.png');
},
    genlayer_prop: function genlayer_prop(overrideOptions) {
	return Object.assign({
		animationfn(options) {
			return options.prop.animation;
		},
		filtersfn(options) {
			if (options.prop.colour === "hair") return ["hair"];
			return ["prop"];
		},
		showfn(options) {
			return !!options.prop.show;
		},
		srcfn(options) {
			return `img/clothes/props/${options.prop.folder}/${options.prop.name}.png`
		},
		zfn(options) {
			return ZIndices[options.prop.zIndex];
		},
	}, overrideOptions);
},
    genlayer_prop_acc: function genlayer_prop_acc(overrideOptions) {
	return helpers.genlayer_prop(Object.assign({
		filtersfn(options) {
			if (options.prop.accColour === "hair") return ["hair"];
			return ["prop_acc"];
		},
		showfn(options) {
			return !!options.prop.show && !!options.prop.hasAccessory;
		},
		srcfn(options) {
			return `img/clothes/props/${options.prop.folder}/${options.prop.name}-acc.png`
		},
	}, overrideOptions));
},
    genlayer_clothing_basic: function genlayer_clothing_basic(slot, overrideOptions) {
	return Object.assign({
		animation: "idle",
		alphafn(options) {
			return options.worn[slot].alpha;
		},
		wornfn(options) {
			return {
				slot,
				integrity: options.worn[slot].integrity,
				alt: options.worn[slot].alt,
				index: options.worn[slot].setup.index
			}
		},
	}, overrideOptions);
},
    genlayer_clothing_main: function genlayer_clothing_main(slot, overrideOptions) {
	return helpers.genlayer_clothing_basic(slot, Object.assign({
		z: ZIndices[slot],
		filtersfn(options) {
			const altFilterSwap = !options.alt_override
				&& options.worn[slot].setup.altposition !== undefined
				&& options.worn[slot].alt === 'alt'
				&& options.worn[slot].setup.altdisabled.includes('filter');
			return altFilterSwap ? [`worn_${slot}_acc`] : [`worn_${slot}`];
		},

		showfn(options) {
			return options.show_clothes
				&& options.worn[slot].index > 0
				&& options.worn[slot].setup.mainImage !== 0;
		},
		srcfn(options) {
			const setup = options.worn[slot].setup;

			const isHoodDown = options.hood_down
				&& setup.hoodposition !== undefined
				&& setup.outfitPrimary.head !== undefined;
			const isAltPosition = !options.alt_override && setup.altposition !== undefined
				&& options.worn[slot].alt === "alt"
				&& !setup.altdisabled.includes("full");

			const pattern = options.worn[slot].pattern && !["secondary", "tertiary"].includes(options.worn[slot].setup.pattern_layer) ? "_" + options.worn[slot].pattern?.replace(/ /g,"_") : '';

			const end = isHoodDown ? '_down' : isAltPosition ? '_alt' : '';
			const path = `img/clothes/${slot}/${setup.variable}/${options.worn[slot].integrity}${pattern}${end}.png`;
			return helpers.gray_suffix(path, options.filters[`worn_${slot}`]);
		},
	}, overrideOptions));
},
    genlayer_clothing_fitted_left: function genlayer_clothing_fitted_left(slot, overrideOptions) {
	return helpers.genlayer_clothing_main(slot, Object.assign({
		showfn(options) {
			const checks = options.show_clothes
				&& options.worn[slot].index > 0
				&& options.worn[slot].setup.mainImage !== 0
				&& ((options.worn[slot].setup.formfitting === 1 && ["curvy", "slender"].includes(options.body_type)) || (options.body_type === "soft" && ((V.bellyTucked && ["under_lower", "lower"].includes(slot)) || V.worn[slot].setup.one_piece)))
				&& !between(options.belly, 8, 24);
			return checks;
		},
	}, overrideOptions));
},
    genlayer_clothing_fitted_right: function genlayer_clothing_fitted_right(slot, overrideOptions) {
	return helpers.genlayer_clothing_main(slot, Object.assign({
		showfn(options) {
			const checks = options.show_clothes
				&& options.worn[slot].index > 0
				&& options.worn[slot].setup.mainImage !== 0
				&& ((options.worn[slot].setup.formfitting === 1 && options.body_type == "curvy") || (options.body_type === "soft" && ((V.bellyTucked && ["under_lower", "lower"].includes(slot)) || V.worn[slot].setup.one_piece)))
				&& !between(options.belly, 8, 24);
			return checks;
		},
	}, overrideOptions));
},
    genlayer_clothing_fitted_left_acc: function genlayer_clothing_fitted_left_acc(slot, overrideOptions) {
	return helpers.genlayer_clothing_accessory(slot, Object.assign({
		showfn(options) {
			const checks = options.worn[slot].index > 0
				&& options.worn[slot].setup.accImage !== 0
				&& options.worn[slot].setup.accessory === 1
				&& ((options.worn[slot].setup.formfitting === 1 && ["curvy", "slender"].includes(options.body_type)) || (options.body_type === "soft" && (V.bellyTucked || V.worn[slot].setup.one_piece)))
				&& !between(options.belly, 8, 24);
			return checks;
		},

		srcfn(options) {
			const setup = options.worn[slot].setup;

			const isHoodDown = options.hood_down
				&& setup.hoodposition !== undefined
				&& setup.outfitPrimary.head !== undefined;
			const isAltPosition = !options.alt_override
				&& setup.altposition !== undefined
				&& options.worn[slot].alt === "alt"
				&& !setup.altdisabled.includes("acc");

			const integrity = setup.accessory_integrity_img ? `_${options.worn[slot].integrity}` : '';
			const pattern = options.worn[slot].pattern && options.worn[slot].setup.pattern_layer === "secondary" ? "_" + options.worn[slot].pattern?.replace(/ /g,"_") : '';
			const end = isHoodDown ? '_down' : isAltPosition ? '_alt' : '';
			const path = `img/clothes/${slot}/${setup.variable}/acc${integrity}${pattern}${end}.png`;
			return helpers.gray_suffix(path, options.filters[`worn_${slot}_acc`]);
		},
	}, overrideOptions));
},
    genlayer_clothing_fitted_right_acc: function genlayer_clothing_fitted_right_acc(slot, overrideOptions) {
	return helpers.genlayer_clothing_accessory(slot, Object.assign({
		showfn(options) {
			const checks = options.worn[slot].index > 0
				&& options.worn[slot].setup.accImage !== 0
				&& options.worn[slot].setup.accessory === 1
				&& ((options.worn[slot].setup.formfitting === 1 && options.body_type == "curvy") || (options.body_type === "soft" && (V.bellyTucked || V.worn[slot].setup.one_piece)))
				&& !between(options.belly, 8, 24);
			return checks;
		},

		srcfn(options) {
			const setup = options.worn[slot].setup;

			const isHoodDown = options.hood_down
				&& setup.hoodposition !== undefined
				&& setup.outfitPrimary.head !== undefined;
			const isAltPosition = !options.alt_override
				&& setup.altposition !== undefined
				&& options.worn[slot].alt === "alt"
				&& !setup.altdisabled.includes("acc");

			const integrity = setup.accessory_integrity_img ? `_${options.worn[slot].integrity}` : '';
			const pattern = options.worn[slot].pattern && options.worn[slot].setup.pattern_layer === "secondary" ? "_" + options.worn[slot].pattern?.replace(/ /g,"_") : '';
			const end = isHoodDown ? '_down' : isAltPosition ? '_alt' : '';

			const path = `img/clothes/${slot}/${setup.variable}/acc${integrity}${pattern}${end}.png`;
			return helpers.gray_suffix(path, options.filters[`worn_${slot}_acc`]);
		},
	}, overrideOptions));
},
    genlayer_clothing_accessory: function genlayer_clothing_accessory(slot, overrideOptions) {
	return helpers.genlayer_clothing_main(slot, Object.assign({
		filtersfn(options) {
			const altFilterSwap = !options.alt_override
				&& options.worn[slot].setup.altposition !== undefined
				&& options.worn[slot].alt === 'alt'
				&& options.worn[slot].setup.altdisabled.includes('filter');
			return altFilterSwap ? [`worn_${slot}`] : [`worn_${slot}_acc`];
		},
		showfn(options) {
			return options.show_clothes
				&& options.worn[slot].index > 0
				&& options.worn[slot].setup.accImage !== 0
				&& options.worn[slot].setup.accessory === 1;
		},
		srcfn(options) {
			const setup = options.worn[slot].setup;

			const isHoodDown = options.hood_down
				&& setup.hoodposition !== undefined
				&& setup.outfitPrimary.head !== undefined;
			const isAltPosition = !options.alt_override
				&& setup.altposition !== undefined
				&& options.worn[slot].alt === "alt"
				&& !setup.altdisabled.includes("acc");

			const integrity = setup.accessory_integrity_img ? `_${options.worn[slot].integrity}` : '';
			const pattern = options.worn[slot].pattern && options.worn[slot].setup.pattern_layer === "secondary" ? "_" + options.worn[slot].pattern?.replace(/ /g,"_") : '';
			const end = isHoodDown ? '_down' : isAltPosition ? '_alt' : '';

			const path = `img/clothes/${slot}/${setup.variable}/acc${integrity}${pattern}${end}.png`;
			return helpers.gray_suffix(path, options.filters[`worn_${slot}_acc`]);
		},
	}, overrideOptions));
},
    genlayer_clothing_detail: function genlayer_clothing_detail(slot, overrideOptions) {
	return helpers.genlayer_clothing_basic(slot, Object.assign({
		z: ZIndices[slot],

		showfn(options) {
			return options.show_clothes
				&& options.worn[slot].index > 0
				&& !!options.worn[slot].pattern
				&& options.worn[slot].setup.pattern_layer === "tertiary"
				&& options.worn[slot].setup.mainImage !== 0;
		},
		srcfn(options) {
			const setup = options.worn[slot].setup;

			const isAltPosition = !options.alt_override && setup.altposition !== undefined
				&& options.worn[slot].alt === "alt"
				&& !setup.altdisabled.includes("full");

			const pattern = options.worn[slot].pattern ? options.worn[slot].pattern?.replace(/ /g,"_") : '';

			const end = isAltPosition ? '_alt' : '';
			return `img/clothes/${slot}/${setup.variable}/${pattern}${end}.png`;
		},
	}, overrideOptions));
},
    genlayer_clothing_breasts_detail: function genlayer_clothing_breasts_detail(slot, overrideOptions) {
	return helpers.genlayer_clothing_detail(slot, Object.assign({
		showfn(options) {
				let breastImg = options.worn[slot].setup.breast_acc_img;
				if (typeof breastImg === 'object' && breastImg[options.breast_size] !== null) breastImg = 1;
				return options.show_clothes && options.worn[slot].index > 0 && breastImg === 1 && !!options.worn[slot].pattern && !!options.worn[slot].setup.breast_pattern;
			},
		srcfn(options) {
			const breastImg = options.worn[slot].setup.breast_img;
			const breastAccImg = options.worn[slot].setup.breast_acc_img;
			const breastSize = typeof breastAccImg === 'object' ? breastAccImg[options.breast_size] : typeof breastImg === 'object' ? breastImg[options.breast_size] : Math.min(options.breast_size, 6);

			const pattern = options.worn[slot].pattern ? options.worn[slot].pattern?.replace(/ /g,"_") : '';
			return`img/clothes/${slot}/${options.worn[slot].setup.variable}/${breastSize}_${pattern}.png`;
		},
	}, overrideOptions));
},
    genlayer_clothing_breasts: function genlayer_clothing_breasts_detail(slot, overrideOptions) {
	return helpers.genlayer_clothing_detail(slot, Object.assign({
		showfn(options) {
				let breastImg = options.worn[slot].setup.breast_acc_img;
				if (typeof breastImg === 'object' && breastImg[options.breast_size] !== null) breastImg = 1;
				return options.show_clothes && options.worn[slot].index > 0 && breastImg === 1 && !!options.worn[slot].pattern && !!options.worn[slot].setup.breast_pattern;
			},
		srcfn(options) {
			const breastImg = options.worn[slot].setup.breast_img;
			const breastAccImg = options.worn[slot].setup.breast_acc_img;
			const breastSize = typeof breastAccImg === 'object' ? breastAccImg[options.breast_size] : typeof breastImg === 'object' ? breastImg[options.breast_size] : Math.min(options.breast_size, 6);

			const pattern = options.worn[slot].pattern ? options.worn[slot].pattern?.replace(/ /g,"_") : '';
			return`img/clothes/${slot}/${options.worn[slot].setup.variable}/${breastSize}_${pattern}.png`;
		},
	}, overrideOptions));
},
    genlayer_clothing_belly: function genlayer_clothing_belly(slot, overrideOptions) {
	return helpers.genlayer_clothing_main(slot, Object.assign({
		z: ZIndices.bellyClothes,
		showfn(options) {
			const commonChecks = options.belly > 7
				&& options.show_clothes
				&& options.worn[slot].index > 0
				&& options.worn[slot].setup.mainImage !== 0;

			if (slot.includes("lower")) return commonChecks && !options.belly_hides_lower;
			if (slot == "under_upper") return commonChecks;
			return commonChecks && !options.shirt_mask_clip_src;
		},
		dxfn(options) {
			if (options.belly >= 24) return 10;
			if (options.belly >= 23) return 8;
			if (options.belly >= 22) return 6;
			if (options.belly >= 19) return 4;
			if (options.belly >= 15) return 2;
			return 0;
		},

		srcfn(options) {
			const setup = options.worn[slot].setup;

			const isAltPosition = !options.alt_override
				&& setup.altposition !== undefined
				&& options.worn[slot].alt === "alt"
				&& !setup.altdisabled.includes("full");

			const integrity = options.worn[slot].integrity;
			const end = isAltPosition ? '_alt' : '';
			const pattern = options.worn[slot].pattern && !["tertiary", "secondary"].includes(options.worn[slot].setup.pattern_layer) ? "_" + options.worn[slot].pattern?.replace(/ /g,"_") : '';
			const path = `img/clothes/${slot}/${setup.variable}/${integrity}${pattern}${end}.png`;
			return helpers.gray_suffix(path, options.filters[`worn_${slot}`]);
		},
	}, overrideOptions));
},
    genlayer_clothing_belly_2: function genlayer_clothing_belly_2(slot, overrideOptions) {
	return helpers.genlayer_clothing_belly(slot, Object.assign({
		dxfn(options) {
			if (options.belly >= 22) return 6;
			if (options.belly >= 19) return 4;
			if (options.belly >= 15) return 2;
			return 0;
		},
	}, overrideOptions));
},
    genlayer_clothing_belly_split: function genlayer_clothing_belly_split(slot, overrideOptions) {
	return helpers.genlayer_clothing_belly(slot, Object.assign({
		showfn(options) {
			return options.belly > 7
				&& options.show_clothes
				&& options.worn[slot].index > 0
				&& options.worn[slot].setup.mainImage !== 0;
		},
		dxfn(options) {
			if (options.shirt_move_right_src) return -2;
		},
	}, overrideOptions));
},
    genlayer_clothing_belly_split_acc: function genlayer_clothing_belly_split_acc(slot, overrideOptions) {

	return helpers.genlayer_clothing_belly(slot, Object.assign({
		filters: [`worn_${slot}_acc`],

		showfn(options) {
			return options.belly > 7
				&& options.show_clothes
				&& options.worn[slot].index > 0
				&& options.worn[slot].setup.accessory === 1
				&& options.worn[slot].setup.mainImage !== 0;
		},
		dxfn(options) {
			if (options.shirt_move_right_src) return -2;
		},

		srcfn(options) {
			const setup = options.worn[slot].setup;

			const isHoodDown = options.hood_down
				&& setup.hoodposition !== undefined
				&& setup.outfitPrimary.head !== undefined;
			const isAltPosition = !options.alt_override
				&& setup.altposition !== undefined
				&& options.worn[slot].alt === "alt"
				&& !setup.altdisabled.includes("acc");

			const integrity = setup.accessory_integrity_img ? `_${options.worn[slot].integrity}` : '';
			const pattern = options.worn[slot].pattern && options.worn[slot].setup.pattern_layer === "secondary" ? "_" + options.worn[slot].pattern?.replace(/ /g,"_") : '';
			const end = isAltPosition ? '_alt' : '';
			const hoodDown = isHoodDown ? '_down' : end;

			const path = `img/clothes/${slot}/${setup.variable}/acc${integrity}${pattern}${hoodDown}.png`;
			return helpers.gray_suffix(path, options.filters[`worn_${slot}_acc`]);
		},
	}, overrideOptions));
},
    genlayer_clothing_belly_shadow: function genlayer_clothing_belly_shadow(slot, overrideOptions) {
	return helpers.genlayer_clothing_main(slot, Object.assign({
		z: ZIndices.bellyClothesShadow,
		srcfn(options) {
			const pattern = options.worn[slot].pattern && !["tertiary", "secondary"].includes(options.worn[slot].setup.pattern_layer) ? "_" + options.worn[slot].pattern?.replace(/ /g,"_") : '';
			return helpers.gray_suffix(
				`img/clothes/${slot}/${options.worn[slot].setup.variable}/${options.worn[slot].integrity}${pattern}.png`,
				options.filters[`worn_${slot}`]
			);
		},
		showfn(options) {
			return (options.belly > 7 || (options.body_type === "soft" && !options.worn[slot].setup.outfitSecondary))
				&& options.show_clothes
				&& options.worn[slot].index > 0
				&& options.worn[slot].setup.mainImage !== 0;
		},
		brightnessfn(options) {
			const mask = ((slot === "lower" && options.lowerShadowMask) || (slot === "under_lower" && options.underLowerShadowMask && !playerHasStrapon()))
			return between(options.belly, 8, 24) && mask ? -0.25 : options.body_type === "soft" && mask ? -0.4 : 0;
		},
		masksrcfn(options) {
			return slot === "lower" ? options.lowerShadowMask : slot === "under_lower" && !playerHasStrapon() ? options.underLowerShadowMask : ""
		}
	}, overrideOptions));
},
    genlayer_clothing_belly_acc: function genlayer_clothing_belly_acc(slot, overrideOptions) {
	return helpers.genlayer_clothing_accessory(slot, Object.assign({
		z: ZIndices[slot],

		showfn(options) {
			const commonChecks = options.belly > 7
				&& options.worn[slot].index > 0
				&& options.worn[slot].setup.accessory === 1
				&& options.worn[slot].setup.mainImage !== 0
				&& options.show_clothes;

			if (slot.includes("lower")) return commonChecks && !options.belly_hides_lower;
			if (slot.includes("upper")) return commonChecks
				&& options.worn.upper.setup.pregType != "min"
				&& !options.shirt_mask_clip_src;
			return commonChecks;
		},
		srcfn(options) {
			const setup = options.worn[slot].setup;

			const isHoodDown = options.hood_down
				&& setup.hoodposition !== undefined
				&& setup.outfitPrimary.head !== undefined;
			const isAltPosition = !options.alt_override
				&& setup.altposition !== undefined
				&& options.worn[slot].alt === "alt"
				&& !setup.altdisabled.includes("acc");

			const integrity = setup.accessory_integrity_img ? `_${options.worn[slot].integrity}` : '';
			const pattern = options.worn[slot].pattern && options.worn[slot].setup.pattern_layer === "secondary" ? "_" + options.worn[slot].pattern?.replace(/ /g,"_") : '';
			const end = isAltPosition ? '_alt' : '';
			const hoodDown = isHoodDown ? '_down' : end;

			const path = `img/clothes/${slot}/${setup.variable}/acc${integrity}${pattern}${hoodDown}.png`;
			return helpers.gray_suffix(path, options.filters[`worn_${slot}_acc`]);
		},
		dxfn(options) {
			if (options.belly >= 24) return 10;
			if (options.belly >= 23) return 8;
			if (options.belly >= 22) return 6;
			if (options.belly >= 19) return 4;
			if (options.belly >= 15) return 2;
			return 0;
		},
	}, overrideOptions));
},
    genlayer_clothing_breasts_acc: function genlayer_clothing_breasts_acc(slot, overrideOptions) {
	return helpers.genlayer_clothing_accessory(slot, Object.assign({
		filters: [`worn_${slot}_acc`],

		srcfn(options) {
			return getClothingPathBreastsAcc(slot, options);
		},
		showfn(options) {
			const breastAccImg = options.worn[slot].setup.breast_acc_img;
			const breastImg = options.worn[slot].setup.breast_img;
			let breastAcc = 0;

			if (breastAccImg === 1 && typeof breastImg === 'object' && breastImg[options.breast_size] !== null)
				breastAcc = 1;
			else if (typeof breastAccImg === 'object' && options.worn[slot].setup.breast_acc_img[options.breast_size] !== null)
				breastAcc = 1;

			return options.show_clothes
				&& options.worn[slot].index > 0
				&& breastAcc === 1
		},
	}, overrideOptions));
},
    genlayer_clothing_back_img: function genlayer_clothing_back_img(slot, overrideOptions) {
	return helpers.genlayer_clothing_basic(slot, Object.assign({
		z: ZIndices['over_head_back'],

		filtersfn(options) {
			switch (options.worn[slot].setup.back_img_colour) {
				case "none":
					return [];
				case "":
				case undefined:
				case "primary":
					return [`worn_${slot}`];
				case "secondary":
					return [`worn_${slot}_acc`];
			}
		},
		showfn(options) {
			if (!options.show_clothes) return false;

			const isHoodDown = options.hood_down
				&& options.worn[slot].setup.hood
				&& options.worn[slot].setup.outfitSecondary !== undefined;
			return options.worn[slot].index > 0 && options.worn[slot].setup.back_img === 1 && !isHoodDown;
		},
		srcfn(options) {
			const isAltPosition = !options.alt_override
				&& options.worn[slot].setup.altposition !== undefined
				&& options.worn[slot].alt === "alt"
				&& !options.worn[slot].setup.altdisabled.includes("back");

			const prefix = isAltPosition ? 'back_alt' : 'back';
			const suffix = options.worn[slot].setup.back_integrity_img ? `_${options.worn[slot].integrity}` : '';
			const pattern = options.worn[slot].pattern && !["tertiary", "secondary"].includes(options.worn[slot].setup.pattern_layer) ? "_" + options.worn[slot].pattern?.replace(/ /g,"_") : '';

			const path = `img/clothes/${slot}/${options.worn[slot].setup.variable}/${prefix}${suffix}${pattern}.png`;
			return helpers.gray_suffix(path, options.filters[this.filtersfn(options)[0]]);
		},
	}, overrideOptions));
},
    genlayer_clothing_back_img_acc: function genlayer_clothing_back_img_acc(slot, overrideOptions) {
	return helpers.genlayer_clothing_basic(slot, Object.assign({
		z: ZIndices['head_back'],

		filtersfn(options) {
			switch (options.worn[slot].setup.back_img_acc_colour) {
				case "none":
					return [];
				case "":
				case undefined:
				case "primary":
					return [`worn_${slot}`];
				case "secondary":
					return [`worn_${slot}_acc`]
			}
		},
		showfn(options) {
			if (!options.show_clothes) return false;

			const isHoodDown = options.hood_down
				&& options.worn[slot].setup.hood
				&& options.worn[slot].setup.outfitSecondary !== undefined;
			return options.worn[slot].index > 0 && options.worn[slot].setup.back_img_acc === 1 && !isHoodDown;
		},
		srcfn(options) {
			const isAltPosition = !options.alt_override
				&& options.worn[slot].setup.altposition !== undefined
				&& options.worn[slot].alt === "alt"
				&& !options.worn[slot].setup.altdisabled.includes("back");

			const prefix = isAltPosition ? 'back_alt' : 'back';
			const suffix = options.worn[slot].setup.back_integrity_img ? `_${options.worn[slot].integrity}` : '';
			const pattern = options.worn[slot].pattern && options.worn[slot].setup.pattern_layer === "secondary" ? "_" + options.worn[slot].pattern?.replace(/ /g,"_") : '';

			const path = `img/clothes/${slot}/${options.worn[slot].setup.variable}/${prefix}${suffix}${pattern}_acc.png`;
			return helpers.gray_suffix(path, options.filters[this.filtersfn(options)[0]]);
		},
	}, overrideOptions));
},
    genlayer_clothing_arm: function genlayer_clothing_arm(arm, slot, overrideOptions) {
	return helpers.genlayer_clothing_basic(slot, Object.assign({
		filtersfn(options) {
			return filterFnArm(options.worn[slot].setup.sleeve_colour, slot, options);
		},
		showfn(options) {
			return options.show_clothes
				&& options.worn[slot].index > 0
				&& options.worn[slot].setup.sleeve_img === 1
				&& options[`arm_${arm}`] !== "none";
		},
		srcfn(options) {
			const setup = options.worn[slot].setup;

			const isAltPosition = !options.alt_override
				&& setup.altposition !== undefined
				&& options.worn[slot].alt === 'alt'
				&& !setup.altdisabled.includes('sleeves');
			const isAltSleeve = !options.alt_override
				&& options.alt_sleeve_state
				&& V.worn[slot]?.altsleeve === 'alt';

			const held = options.handheld_position && arm === 'right' ? options.handheld_position : arm;
			const cover = options[`arm_${arm}`] === 'cover' ? `${arm}_cover` : held;
			const alt = isAltPosition ? "_alt" : '';
			const rolled = isAltSleeve ? '_rolled' : '';
			const pattern = setup.sleeve_colour === "pattern" && options.worn[slot].pattern ? `_${options.worn[slot].pattern?.replace(/ /g,"_")}` : '';
			const path = `img/clothes/${slot}/${setup.variable}/${cover}${alt}${pattern}${rolled}.png`;
			return helpers.gray_suffix(path, options.filters[this.filtersfn(options)[0]]);
		},
	}, overrideOptions));
},
    genlayer_clothing_arm_fitted: function genlayer_clothing_arm_fitted(arm, slot, overrideOptions) {
	return helpers.genlayer_clothing_arm(arm, slot, Object.assign({
		showfn(options) {
			return options.show_clothes
				&& options.worn[slot].index > 0
				&& options.worn[slot].setup.sleeve_img === 1
				&& ["curvy", "slender"].includes(options.body_type)
				&& options.arm_left === "idle"
				&& !(options.belly > 7)
				&& options["arm_" + arm] !== "none";
		},
		masksrcfn(options) {
			return options[`${slot}_fitted_left_move_src`];
		},
		dxfn() {
			return -2;
		},
	}, overrideOptions));
},
    genlayer_clothing_arm_acc: function genlayer_clothing_arm_acc(arm, slot, overrideOptions) {
	return helpers.genlayer_clothing_basic(slot, Object.assign({
		filtersfn(options) {
			return filterFnArm(options.worn[slot].setup.accessory_colour_sidebar, slot, options);
		},
		showfn(options) {
			return options.worn[slot].index > 0
				&& options.worn[slot].setup.sleeve_img === 1
				&& options.worn[slot].setup.sleeve_acc_img === 1
				&& options[`arm_${arm}`] !== "none";
		},
		srcfn(options) {
			const setup = options.worn[slot].setup;

			const isAltPosition = !options.alt_override
				&& setup.altposition !== undefined
				&& options.worn[slot].alt === "alt"
				&& !setup.altdisabled.includes("sleeves")
				&& !setup.altdisabled.includes("sleeve_acc");

			let filename = `${arm}_cover_acc`;
			if (options[`arm_${arm}`] !== "cover") {
				filename = (options.handheld_position && arm === "right") ? options.handheld_position : arm;
				filename += (isAltPosition) ? '_alt_acc' : '_acc';
			}

			const path = `img/clothes/${slot}/${setup.variable}/${filename}.png`;
			return helpers.gray_suffix(path, options.filters[this.filtersfn(options)[0]]);
		},
	}, overrideOptions));
},
    genlayer_clothing_arm_acc_fitted: function genlayer_clothing_arm_acc_fitted(arm, slot, overrideOptions) {
	return helpers.genlayer_clothing_arm_acc(arm, slot, Object.assign({
		showfn(options) {
			return options.show_clothes
				&& options.worn[slot].index > 0
				&& options.worn[slot].setup.sleeve_img === 1
				&& options.worn[slot].setup.sleeve_acc_img === 1
				&& ["curvy", "slender"].includes(options.body_type)
				&& options.arm_left === "idle"
				&& !(options.belly > 7)
				&& options[`arm_${arm}`] !== "none";
		},
		masksrcfn(options) {
			return options[`${slot}_fitted_left_move_src`];
		},
		dxfn() {
			return -2;
		},
	}, overrideOptions))
},
    genlayer_tanning: function genlayer_tanning(slot, index, tanningLayer, value, animation = "idle") {
	return {
		alphafn() {
			return value / 100;
		},
		animation,
		blendMode: "multiply",
		filters: ["body"],
		showfn(options) {
			return V.options.tanLines
				&& options.tanningEnabled
				&& !options.mannequin
				&& options.skin_type !== "custom"
				&& this.model.layers[slot].show;
		},
		masksrcfn() {
			return tanningLayer;
		},
		srcfn(options) {
			// Clear from cache and reload if src has been changed
			if (this.model.layers[slot].src !== options.generatedLayers[`tan_${slot}${index}`].src) {
				delete Renderer.ImageCaches[this.model.layers[slot].src];
			}
			return this.model.layers[slot].src;
		},
		zfn() {
			return this.model.layers[slot].z;
		},
	};
},
    genlayer_tf: function genlayer_tf(tf, folder, part, overrideOptions) {
	return Object.assign({
		filters: ["hair"],
		z: ZIndices.lower,
		animation: "idle",

		srcfn(options) {
			if (folder !== part) return `img/transformations/${tf}/${folder}/${part}-${options[`${tf}_${part}_type`]}.png`;
			return `img/transformations/${tf}/${folder}/${options[`${tf}_${part}_type`]}.png`;
		},
		showfn(options) {
			return options.show_tf
			&& isPartEnabled(options[`${tf}_${part}_type`])
			&& !options.hideAll;
		},
	}, overrideOptions);
},
    genlayer_wings: function genlayer_wings(side, tf, hair, overrideOptions) {
	return Object.assign({
		animation: "idle",
		filters: hair ? ["hair"] : [],
		srcfn(options) {
			return `img/transformations/${tf}/wings-idle/${options[`${tf}_wings_type`]}.png`;
		},
		showfn(options) {
			return options.show_tf
				&& isPartEnabled(`${options[`${tf}_wings_type`]}`)
				&& `${options[`${tf}_wing_${side}`]}` === "idle"
				&& !options.hideAll;
		},
		zfn(options) {
			if (`${options[`${tf}_wings_layer`]}` === "back") return ZIndices.over_head_back
			return ZIndices.backhair;
		},
		masksrcfn(options) {
			return `img/face/masks/${side}.png`;
		},
	}, overrideOptions);
},
    genlayer_wings_cover: function genlayer_wings_cover(side, tf, hair, overrideOptions) {
	return Object.assign({
		z: ZIndices.tailPenisCover,
		animation: "idle",
		filters: hair ? ["hair"] : [],
		srcfn(options) {
			return `img/transformations/${tf}/wings-cover/${options[`${tf}_wings_type`]}-${side}.png`;
		},
		showfn(options) {
			return options.show_tf
			&& isPartEnabled(options[`${tf}_wings_type`])
			&& `${options[`${tf}_wing_${side}`]}` === "cover"
			&& !options.hideAll;
		},
	}, overrideOptions);
},
    genlayer_halo: function genlayer_halo(side, tf, overrideOptions) {
	return Object.assign({
		animation: "idle",
		srcfn(options) {
			return `img/transformations/${tf}/halo/${options[`${tf}_halo_type`]}-${side}.png`;
		},
		showfn(options) {
			return options.show_tf
				&& isPartEnabled(options[`${tf}_halo_type`])
				&& !options.hideAll;
		},
		dyfn(options) {
			return options.angel_halo_lower && isPartEnabled(options.angel_halo_type) ? 15 : 0;
		},
		zfn(options) {
			if (side === "back") {
				return options.angel_halo_lower && isPartEnabled(options.angel_halo_type) ? ZIndices.head_back : ZIndices.over_head_back;
			};
			return options.angel_halo_lower && isPartEnabled(options.angel_halo_type) ? ZIndices.over_head : ZIndices.old_over_upper;
		},
	}, overrideOptions);
},
    genlayer_tail: function genlayer_tail(tf, hair, overrideOptions) {
	return helpers.genlayer_tf(tf, "tail", "tail", Object.assign({
		z: ZIndices.tailPenisCover,
		filters: hair ? ["hair"] : [],

		srcfn(options) {
			const demon = tf === "demon" || isChimeraEnabled("demoncow", "tail") || isChimeraEnabled("demoncat", "tail") || isChimeraEnabled("demonwolf", "tail") || isChimeraEnabled("demonfox", "tail");
			const tail = demon ? `tail-${options.demon_tail_state}` : "tail-idle";

			return `img/transformations/${tf}/${tail}/${options[`${tf}_tail_type`]}.png`;
		},
		zfn(options) {
			const cover = ["cover", "flaunt"].includes(options.demon_tail_state) && (tf === "demon" || isChimeraEnabled("demoncow", "tail") || isChimeraEnabled("demoncat", "tail") || isChimeraEnabled("demonwolf", "tail") || isChimeraEnabled("demonfox", "tail"));
			if (cover) return ZIndices.tailPenisCover;
			if (options[`${tf}_tail_layer`] === "back") return ZIndices.tail;
			return ZIndices.back_lower;
		},
	}, overrideOptions))
},
    genlayer_cheeks: function genlayer_cheeks(tf, overrideOptions) {
	return helpers.genlayer_tf(tf, "cheeks", "cheeks", Object.assign({
		filters: ["hair"],
		z: ZIndices.lower,
	}, overrideOptions))
},
    genlayer_tf_pubes: function genlayer_tf_pubes(tf, folder, overrideOptions) {
	return helpers.genlayer_tf(tf, folder, "pubes", Object.assign({
		z: ZIndices.hirsute,
		showfn(options) {
			return options.show_tf
			&& isPartEnabled(options[`${tf}_pubes_type`])
			&& !options.belly_hides_under_lower
			&& !options.hideAll;
		},
		masksrcfn(options) {
			return options.body_type === "soft" ? "img/clothes/masks/soft_lower_clip.png" : null;
		},
	}, overrideOptions))
},
    genlayer_tf_pits: function genlayer_tf_pits(tf, folder, overrideOptions) {
	return helpers.genlayer_tf(tf, folder, "pits", Object.assign({
		z: ZIndices.hirsute,
		showfn(options) {
			return options.show_tf
			&& isPartEnabled(options[`${tf}_pits_type`])
			&& !options.hideAll;
		},
	}, overrideOptions))
},
    genlayer_ears: function genlayer_ears(tf, hair, overrideOptions) {
	return helpers.genlayer_tf(tf, "ears", "ears", Object.assign({
		filters: hair ? ["hair"] : [],

		masksrcfn(options) {
			if (!options.hideHeadAcc) return options.head_mask_src;
		},

		zfn(options) {
			if (options.hideHeadAcc) {
				return ZIndices.over_head;
			}
			return ZIndices.backhair;
		}
	}, overrideOptions))
},
    genlayer_horns: function genlayer_horns(tf, overrideOptions) {
	return helpers.genlayer_tf(tf, "horns", "horns", Object.assign({
		filters: [],
		animation: "idle",
		zfn(options) {
			return options[`${tf}_horns_layer`] === "front" ? ZIndices.over_head : ZIndices.horns;
		},
		masksrcfn(options) {
			return options[`${tf}_horns_layer`] !== "front" ? options.head_mask_src : null;
		},
	}, overrideOptions))
},
    genlayer_effect: function genlayer_effect(effect, layer, overrideOptions) {
	return Object.assign({
		animationfn() {
			if (effect === "precipitation") return Weather.precipitation === "snow" ? `snow${layer.toUpperFirst()}` : "rain";
			return `${effect}${layer.toUpperFirst()}`;
		},
		srcfn() {
			const type = Weather.precipitation;
			const intensity = Weather.name;
			if (effect === "precipitation") return `img/misc/ambient/${effect}/${type}/${intensity}${layer.toUpperFirst()}.png`
			return`img/misc/ambient/${effect}/${layer}.png`
		},
		showfn(options) {
			return !T.hideSidebarEffects && !!options[effect];
		},
		zfn() {
			if (layer === "back") return ZIndices.bg;
			return ZIndices.precipitationFront;
		}
}, overrideOptions);
},
    genlayer_breath: function genlayer_breath(type, layer, overrideOptions) {
	const breath = `${type}Breath`;
	const effect = breath === "playerBreath" ? "temperature" : breath;
	return helpers.genlayer_effect(effect, layer, Object.assign({
		animationfn() {
			if (V.arousal >= 6000 || V.pain >= 40) return `${breath}Fast`;
			return breath;
		},
		srcfn() {
			return `img/misc/ambient/${breath}.png`
		},
	}, overrideOptions))
},
  };
  window.GenesisCompatRetroModel = {
    humanoid: function () { return {
      "base": {
			show: true,
			filters: ["tan"],
			z: ZIndices.base,
			animation: "idle",

			srcfn(options) {
				return options.mannequin ? "img/body/mannequin/basenoarms.png" : `img/body/basenoarms-${options.body_type}.png`;
			},
		},
      "basehead": {
			show: true,
			filters: ["tan"],
			z: ZIndices.basehead,
			animation: "idle",

			srcfn(options) {
				return options.mannequin ? "img/body/mannequin/basehead.png" : "img/body/basehead.png";
			},
		},
      "belly": {
			filters: ["tan"],
			z: ZIndices.bellyBase,
			animation: "idle",

			showfn(options) {
				return !!options.belly
			},
			srcfn(options) {
				return between(options.belly, 1, 24) ? `img/body/preggyBelly/pregnancy_belly_${options.belly}.png` : "";
			},
		},
      "bellyLeft": {
			filters: ["tan"],
			z: ZIndices.bellyBase,
			animation: "idle",

			showfn(options) {
				return !!options.belly
			},
			srcfn(options) {
				return options.body_type === "soft" && between(options.belly, 11, 14) ? `img/body/preggyBelly/pregnancy_belly_${options.belly}.png` : "";
			},
			masksrcfn(options) {
				return options.upper_fitted_left_move_src;
			},
			dxfn(options) {
				return 2;
			},
		},
      "bellyRight": {
			filters: ["tan"],
			z: ZIndices.bellyBase,
			animation: "idle",

			showfn(options) {
				return !!options.belly
			},
			srcfn(options) {
				return options.body_type === "soft" && between(options.belly, 11, 14) ? `img/body/preggyBelly/pregnancy_belly_${options.belly}.png` : "";
			},
			masksrcfn(options) {
				return options.upper_fitted_right_move_src;
			},
			dxfn(options) {
				return -2;
			},
		},
      "bird_eyes": {
			z: ZIndices.irisacc,
			animation: "idle",

			srcfn(options) {
				return `img/transformations/bird/eyes/${options.bird_eyes_type}.png`;
			},
			showfn(options) {
				return options.show_tf
					&& options.show_face
					&& isPartEnabled(options.bird_eyes_type)
					&& !options.hideAll;
			},
			masksrcfn(options) {
				return {
					path: `img/face/${options.facestyle}/${options.facevariant}/iris.png`,
					convert: true,
				};
			}
		},
      "bird_wings_loose": {
			filters: ["hair"],
			animation: "looseFeathers",
			z: ZIndices.tailPenisCover,
			src: `img/transformations/bird/feathers/loose.png`,
			showfn(options) {
				return options.show_tf && isPartEnabled(options.bird_wings_type) && !options.hideAll && T.selfFeatherNum > 0;
			},
		},
      "blush": {
			filters: ["tan"],
			z: ZIndices.blush,

			srcfn(options) {
				return `img/face/${options.facestyle}/blush${options.blush}.png`;
			},
			showfn(options) {
				return options.show_face && options.blush > 0;
			},
		},
      "breasts": {
			show: true,
			filters: ["tan"],
			z: ZIndices.breasts,
			animation: "idle",

			masksrcfn(options) {
				return options.breasts_mask_src;
			},
			srcfn(options) {
				const mannequin = (options.mannequin) ? "mannequin/" : "";
				const prefix = `img/body/${mannequin}`;
				const suffix = options.breasts === "cleavage" && options.breast_size >= 3 ? "_clothed.png" : ".png";
				return `${prefix}breasts/breasts${options.breast_size}${suffix}`;
			},
		},
      "breasts_parasite": {
			filters: ["breasts_parasite"],
			z: ZIndices.breastsparasite,
			animation: "idle",

			showfn(options) {
				return !!options.breasts_parasite;
			},
			srcfn(options) {
				return options.breasts_parasite === 'parasite' ? `img/body/breasts/breastsparasite${options.breast_size}.png` : "";
			},
		},
      "brows": {
			filters: ["brows"],
			z: ZIndices.brow,

			srcfn(options) {
				return `img/face/${options.facestyle}/${options.facevariant}/brow-${options.brows}.png`;
			},
			zfn(options) {
				return options.brows_position === "back" ? ZIndices.back_brow : ZIndices.brow;
			},
			showfn(options) {
				return options.show_face && options.brows !== "none";
			},
		},
      "clit_parasite": {
			filters: ["clit_parasite"],
			animation: "idle",

			srcfn(options) {
				switch (options.clit_parasite) {
					case "urchin":
						/* Swap to cliturchingray for new sprites, make sure to include colour changes to the code */
						return 'img/body/cliturchin.png';
					case "slime":
						return 'img/body/clitslime.png';
					case "parasite":
						return 'img/body/parasitepanty.png';
					case "parasitem":
						return 'img/body/parasiteshorts.png';
					default:
						return "";
				}
			},
			showfn(options) {
				if (options.clit_parasite === "parasite") return !options.belly_hides_under_lower;
				return options.crotch_visible && !!options.clit_parasite && !options.chastity && !options.belly_hides_under_lower
			},
			zfn(options) {
				if (["parasite", "parasitem"].includes(options.clit_parasite))
					return options.crotch_exposed ? ZIndices.penis_chastity - 0.1 : ZIndices.penisunderclothes - 0.1;
				if (options.crotch_exposed) return ZIndices.parasite;
				return ZIndices.underParasite;
			},
		},
      "cum_chest": {
			z: ZIndices.tears,
			animation: "idle",

			srcfn(options) {
				return `img/body/cum/Chest ${options.cum_chest}.png`;
			},
			showfn(options) {
				return !!options.cum_chest;
			},
		},
      "cum_face": {
			z: ZIndices.tears,
			animation: "idle",

			srcfn(options) {
				return `img/body/cum/Face ${options.cum_face}.png`;
			},
			showfn(options) {
				return options.show_face && !!options.cum_face;
			},
		},
      "cum_feet": {
			z: ZIndices.tears,
			animation: "idle",

			srcfn(options) {
				return `img/body/cum/Feet ${options.cum_feet}.png`;
			},
			showfn(options) {
				return !!options.cum_feet;
			},
		},
      "cum_leftarm": {
			animation: "idle",
			srcfn(options) {
				return `img/body/cum/Left Arm ${options.cum_leftarm}.png`;
			},
			showfn(options) {
				return options.arm_left !== "none" && options.arm_left != "cover" && !!options.cum_leftarm;
			},
			zfn(options) {
				return (options.arm_right === "cover") ? ZIndices.arms_cover + 0.05 : options.zarms + 0.05;
			},
		},
      "cum_neck": {
			z: ZIndices.tears,
			animation: "idle",

			srcfn(options) {
				return `img/body/cum/Neck ${options.cum_neck}.png`;
			},
			showfn(options) {
				return !!options.cum_neck;
			},
		},
      "cum_rightarm": {
			animation: "idle",

			srcfn(options) {
				return `img/body/cum/Right Arm ${options.cum_rightarm}.png`;
			},
			showfn(options) {
				return options.arm_right !== "none"
					&& options.arm_right != "cover"
					&& options.arm_right != "hold"
					&& !!options.cum_rightarm;
			},
			zfn(options) {
				return (options.arm_right === "cover" || options.arm_right === "hold") ? ZIndices.arms_cover + 0.05 : options.zarms + 0.05;
			},
		},
      "cum_thigh": {
			z: ZIndices.tears,
			animation: "idle",

			srcfn(options) {
				return `img/body/cum/Thighs ${options.cum_thigh}.png`;
			},
			showfn(options) {
				return !!options.cum_thigh;
			},
		},
      "cum_tummy": {
			z: ZIndices.tears,
			animation: "idle",

			srcfn(options) {
				return `img/body/cum/Tummy ${options.cum_tummy}.png`;
			},
			showfn(options) {
				return !!options.cum_tummy;
			},
		},
      "demon_wings": {
			filters: ["demon_wings"],
			animation: "idle",

			srcfn(options) {
				return `img/transformations/demon/wings-${options.demon_wings_state}/${options.demon_wings_type}.png`;
			},
			showfn(options) {
				return options.show_tf
					&& isPartEnabled(options.demon_wings_type)
					&& !isPartEnabled(options.bird_wings_type)
					&& !options.hideAll;
			},
			zfn(options) {
				if (["cover", "flaunt"].includes(options.demon_wings_state)) return ZIndices.tailPenisCover
				if (options.demon_wings_layer === "back") return ZIndices.head_back;
				return ZIndices.backhair
			},
		},
      "drip_anal": {
			z: ZIndices.tears,

			srcfn(options) {
				return `img/body/cum/AnalCumDrip${options.drip_anal}.png`;
			},
			showfn(options) {
				return !!options.drip_anal;
			},
			animationfn(options) {
				return `AnalCumDrip${options.drip_anal}`;
			},
		},
      "drip_mouth": {
			z: ZIndices.semen_cough,

			srcfn(options) {
				return `img/body/cum/MouthCumDrip${options.drip_mouth}.png`;
			},
			showfn(options) {
				return options.show_face
					&& !!options.drip_mouth
					&& !options.worn.face.setup.type.includesAny("mask", "covered");
			},
			dxfn(options) {
				return options.facestyle === "small-eyes" ? 2 : 0;
			},
			animationfn(options) {
				return `MouthCumDrip${options.drip_mouth}`;
			},
		},
      "drip_vaginal": {
			z: ZIndices.tears,

			srcfn(options) {
				return `img/body/cum/VaginalCumDrip${options.drip_vaginal}.png`;
			},
			showfn(options) {
				return !!options.drip_vaginal;
			},
			animationfn(options) {
				return `VaginalCumDrip${options.drip_vaginal}`;
			},
		},
      "ears": {
			filters: ["tan"],
			z: ZIndices.ears,

			srcfn(options) {
				return `img/face/${options.facestyle}/ears.png`;
			},
			showfn(options) {
				return options.show_face && options.ears_position === "front";
			},
		},
      "eyelids": {
			show: true,
			filters: ["tan"],
			z: ZIndices.eyelids,

			srcfn(options) {
				const half = options.eyes_half ? "-half-closed" : "";
				return `img/face/${options.facestyle}/${options.facevariant}/eyelids${half}.png`;
			},
			animationfn(options) {
				return options.blink_animation;
			},
		},
      "eyes": {
			filters: ["tan"],
			z: ZIndices.eyes,

			srcfn(options) {
				return `img/face/${options.facestyle}/${options.facevariant}/eyes.png`;
			},
			showfn(options) {
				return options.show_face;
			},
		},
      "freckles": {
			filters: ["tan"],
			z: ZIndices.freckles,

			srcfn(options) {
				return `img/face/${options.facestyle}/freckles.png`;
			},
			showfn(options) {
				return options.show_face && !!options.freckles;
			},
		},
      "hair_extra": { // Extra layer for thighs+ long hair for certain styles
			filters: ["hair"],
			z: ZIndices.backhair,
			animation: "idle",

			srcfn(options) {
				const hairs = [
					"default",
					"loose",
					"curl",
					"defined curl",
					"neat",
					"dreads",
					"afro pouf",
					"thick ponytail",
					"all down",
					"half-up",
					"messy ponytail",
					"ruffled",
					"half up twintail",
					"princess wave",
					"space buns",
					"sleek",
					"bedhead",
				];

				const path = `img/hair/back/${options.hair_sides_type}`;
				if (options.hair_sides_length === "feet" && [...hairs, "straight"].includes(options.hair_sides_type))
					return `${path}/feet.png`;
				if (options.hair_sides_length === "thighs" && hairs.includes(options.hair_sides_type))
					return `${path}/thighs.png`;
				if (options.hair_sides_length === "navel" && options.hair_sides_type === "messy ponytail")
					return `${path}/navel.png`;
				return "";
			},
			masksrcfn(options) {
				return options.head_mask_src;
			},
			showfn(options) {
				return !!options.show_hair && !!options.hair_sides_type;
			},
		},
      "hair_fringe": {
			filters: ["hair_fringe"],
			z: ZIndices.front_hair,
			animation: "idle",

			srcfn(options) {
				return `img/hair/fringe/${options.hair_fringe_type}/${options.hair_fringe_length}.png`;
			},
			showfn(options) {
				return !!options.show_hair && !!options.hair_fringe_type;
			},
			masksrcfn(options) {
				return options.head_mask_src ? options.head_mask_src : options.fringe_mask_src;
			},
		},
      "hair_sides": {
			filters: ["hair"],
			animation: "idle",

			srcfn(options) {
				return `img/hair/sides/${options.hair_sides_type}/${options.hair_sides_length}.png`;
			},
			zfn(options) {
				return options.hair_sides_position === "front" ? ZIndices.hair_forward : ZIndices.backhair;
			},
			masksrcfn(options) {
				return options.head_mask_src;
			},
			showfn(options) {
				return !!options.show_hair && !!options.hair_sides_type;
			},
		},
      "lashes": {
			filters: ["tan"],
			z: ZIndices.lashes,

			srcfn(options) {
				const half = options.eyes_half ? "-half-closed" : "";
				return `img/face/${options.facestyle}/${options.facevariant}/lashes${half}.png`;
			},
			showfn(options) {
				return options.show_face;
			},
			animationfn(options) {
				return options.blink_animation;
			},
		},
      "left_iris": {
			filters: ["left_eye"],
			z: ZIndices.iris,
			animation: "idle",

			srcfn(options) {
				const iris = options.trauma ? "iris-empty" : "iris";
				const half = options.eyes_half ? "-half-closed" : "";
				return `img/face/${options.facestyle}/${options.facevariant}/${iris}${half}.png`;
			},
			showfn(options) {
				return options.show_face;
			},
			masksrcfn(options) {
				return "img/face/masks/left.png"
			}
		},
      "leftarm": {
			filters: ["tan"],
			animation: "idle",

			zfn(options) {
				return (options.arm_left === "cover") ? ZIndices.left_cover_arm : options.zarms;
			},
			showfn(options) {
				return options.arm_left !== "none";
			},
			srcfn(options) {
				if (options.mannequin) return "img/body/mannequin/leftarmidle.png";
				if (options.arm_left === "cover") return "img/body/leftarmcover.png";
				return `img/body/leftarmidle-${options.body_type}.png`
			},
		},
      "makeup_blusher": {
			filters: ["tan"],
			z: ZIndices.blush + 1,

			srcfn(options) {
				return `img/face/${options.facestyle}/blusher.png`;
			},
			showfn(options) {
				return options.show_face && !!options.blusher_colour;
			},
		},
      "makeup_eyeshadow": {
			filters: ["eyeshadow"],
			z: ZIndices.eyelids,

			brightnessfn(options) {
				makeupAdjustment(options);
				return options.makeup_adjustment;
			},

			srcfn(options) {
				const half = options.eyes_half ? "-half-closed" : "";
				return `img/face/${options.facestyle}/${options.facevariant}/makeup/eyeshadow${half}.png`;
			},
			animationfn(options) {
				return options.blink_animation;
			},
			showfn(options) {
				return options.show_face && !!options.eyeshadow_colour;
			},
		},
      "makeup_lipstick": {
			filters: ["lipstick"],
			z: ZIndices.mouth,

			brightnessfn(options) {
				makeupAdjustment(options);
				return options.makeup_adjustment;
			},

			srcfn(options) {
				return `img/face/${options.facestyle}/lipstick-${options.mouth}.png`;
			},
			showfn(options) {
				return options.show_face && !!options.lipstick_colour;
			},
		},
      "makeup_mascara": {
			filters: ["mascara"],
			z: ZIndices.lashes,

			srcfn(options) {
				const half = options.eyes_half ? "-half-closed" : "";
				return `img/face/${options.facestyle}/${options.facevariant}/makeup/mascara${half}.png`;
			},
			animationfn(options) {
				return options.blink_animation;
			},
			showfn(options) {
				return options.show_face && !!options.mascara_colour;
			},
		},
      "makeup_mascara_tears": {
			filters: ["mascara"],
			z: ZIndices.mascara_running,

			srcfn(options) {
				return `img/face/${options.facestyle}/${options.facevariant}/makeup/mascara${options.mascara_running}.png`;
			},
			showfn(options) {
				return options.show_face && options.mascara_running > 0 && !!options.mascara_colour;
			},
		},
      "mouth": {
			filters: ["tan"],
			z: ZIndices.mouth,

			srcfn(options) {
				return `img/face/${options.facestyle}/mouth-${options.mouth}.png`;
			},
			showfn(options) {
				return options.show_face && options.mouth !== "none";
			},
		},
      "nipples_parasite": {
			z: ZIndices.breastsparasite + 0.1,
			animation: "idle",

			showfn(options) {
				return !!options.nipples_parasite;
			},
			srcfn(options) {
				switch (options.nipples_parasite) {
					case "urchin":
						/* Swap to chestparasitegray for new sprites, make sure to include colour changes to the code */
						return `img/body/breasts/chestparasite${options.breast_size}.png`;
					case "slime":
						return `img/body/breasts/chestslime${options.breast_size}.png`;
					default:
						return "";
				}
			},
		},
      "pbhair_balls": {
			filters: ["pbhair"],
			animation: "idle",

			zfn(options) {
				return options.crotch_exposed ? ZIndices.pbhairballs : ZIndices.pbhairballsunderclothes;
			},
			srcfn(options) {
				return `img/hair/phair/balls/${options.penis_size}_pb${options.pbhair_balls}.png`;
			},
			showfn(options) {
				return options.crotch_visible
					&& options.pbhair_balls > 1
					&& options.balls
					&& !options.genitals_chastity;
			},
		},
      "penis": {
			filters: ["tan"],
			animation: "idle",

			zfn(options) {
				if (!options.crotch_exposed) return ZIndices.penisunderclothes
				return (options.genitals_chastity) ? ZIndices.penis_chastity : ZIndices.penis
			},
			srcfn(options) {
				if (options.mannequin) return "img/body/mannequin/penis.png";
				if (options.genitals_chastity) {
					if (["chastity belt", "flat chastity cage", "chastity parasite"].includes(options.worn.genitals.setup.name)) return;
					if (options.worn.genitals.setup.name === "small chastity cage") return "img/body/penis/penis_chastitysmall.png";
					return "img/body/penis/penis_chastity.png";
				}
				if (!playerHasStrapon()) {
					return `img/body/${options.balls ? 'penis' : 'penisnoballs'}/${options.penis === "virgin" ? "penis_virgin" : "penis"}${options.penis_size}.png`;
				}

				return; //if the player has a strapon, then we want to hide their penis
			},
			showfn(options) {
				return options.crotch_visible && !!options.penis;
			},
		},
      "penis_condom": {
			alpha: 0.4,
			animation: "idle",
			filters: ["condom"],

			srcfn(options) {
				return options.penis_condom === 'plain' ? `img/body/penis/condom${options.penis_size}.png` : '';
			},
			showfn(options) {
				return options.crotch_visible
					&& !!options.penis
					&& !!options.penis_condom
					&& !options.genitals_chastity;
			},
			zfn(options) {
				return options.crotch_exposed ? ZIndices.parasite : ZIndices.underParasite;
			},
		},
      "right_iris": {
			filters: ["right_eye"],
			z: ZIndices.iris,
			animation: "idle",

			srcfn(options) {
				const iris = options.trauma ? "iris-empty" : "iris";
				const half = options.eyes_half ? "-half-closed" : "";
				return `img/face/${options.facestyle}/${options.facevariant}/${iris}${half}.png`;
			},
			showfn(options) {
				return options.show_face;
			},
			masksrcfn(options) {
				return "img/face/masks/right.png"
			}
		},
      "rightarm": {
			filters: ["tan"],
			animation: "idle",

			zfn(options) {
				if (["cover", "hold"].includes(options.arm_right)) return ZIndices.right_cover_arm;
				return options.zarms;
			},
			showfn(options) {
				return options.arm_right !== "none";
			},
			srcfn(options) {
				if (options.mannequin && options.handheld_position) return `img/body/mannequin/rightarm${options.handheld_position === "right_cover" ? "cover" : options.handheld_position}.png`;
				if (options.mannequin) return "img/body/mannequin/rightarmidle.png";
				if (options.arm_right === "cover" || options.handheld_position === "right_cover") return "img/body/rightarmcover.png";
				if (options.handheld_position) return `img/body/rightarm${options.handheld_position}.png`;
				return `img/body/rightarmidle-${options.body_type}.png`
			},
		},
      "scars": {
			z: ZIndices.neck,

			srcfn() {
				return 'img/body/wraith_scars.png';
			},
			showfn(options) {
				return options.show_face && options.scars;
			},
		},
      "sclera": {
			z: ZIndices.sclera,

			srcfn(options) {
				return `img/face/${options.facestyle}/${options.facevariant}/${options.eyes_bloodshot ? "sclera-bloodshot" : "sclera"}.png`;
			},
			showfn(options) {
				return options.show_face;
			},
		},
      "tears": {
			z: ZIndices.tears,
			animation: "idle",

			srcfn(options) {
				return `img/face/${options.facestyle}/tear${options.tears}.png`;
			},
			showfn(options) {
				return options.show_face && options.tears > 0;
			},
		},
      "tummy_parasite": {
			filters: ["tummy_parasite"],
			animation: "idle",

			srcfn(options) {
				switch (options.tummy_parasite) {
					case "urchin":
						/* Swap to img/body/tummyurchingray for new sprites, make sure to include colour changes to the code */
						return 'img/body/tummyurchin.png';
					case "slime":
						return 'img/body/tummyslime.png';
					default:
						return "";
				}
			},
			showfn(options) {
				return !!options.tummy_parasite
			},
			zfn(options) {
				if (options.crotch_exposed) return ZIndices.parasite;
				return ZIndices.underParasite;
			},
			dxfn(options) {
				if (options.belly >= 23) return 10;
				if (options.belly >= 22) return 8;
				if (options.belly >= 20) return 6;
				if (options.belly >= 15) return 4;
				if (options.belly >= 8) return 2;
				return 0;
			},
			dyfn(options) {
				if (options.belly >= 24) return 6;
				if (options.belly >= 8) return 4;
				if (options.belly >= 2) return 2;
				return 0;
			},
		},
      "writing_breasts": {
			z: ZIndices.skin,
			animation: "idle",

			srcfn(options) {
				const area_name = "breasts"
				const writing = setup.bodywriting[options.writing_breasts];
				if (writing.type === "text") {
					if (writing.sprites && writing.sprites.length > 0 && writing.sprites.includes(area_name)) {
						return `img/bodywriting/text/${writing.key}/${area_name}.png`;
					}
					return `img/bodywriting/text/default/${area_name}1.png`;
				}
				if (writing.type === "object") {
					return `img/bodywriting/${writing.writing}/${area_name}${options.breast_size}.png`;
				}
				return '';
			},
			showfn(options) {
				return options.show_writings && !!options.writing_breasts;
			},
		},
      "writing_breasts_extra": {
			z: ZIndices.skin,
			animation: "idle",

			srcfn(options) {
				const writing = setup.bodywriting[options.writing_breasts];
				if ((!writing.sprites || writing.sprites.length == 0)
					&& writing.type === "text" && options.breast_size >= 2) {
					return `img/bodywriting/text/default/breasts${options.breast_size}.png`;
				}
				return '';
			},
			showfn(options) {
				return options.show_writings && !!options.writing_breasts;
			},
		},
      "writing_forehead": {
			z: ZIndices.skin,
			animation: "idle",

			srcfn(options) {
				return getWritingImgPath('forehead', setup.bodywriting[options.writing_forehead]);
			},
			showfn(options) {
				return options.show_writings && !!options.writing_forehead;
			},
		},
      "writing_left_cheek": {
			z: ZIndices.skin,
			animation: "idle",

			srcfn(options) {
				return getWritingImgPath('left_cheek', setup.bodywriting[options.writing_left_cheek]);
			},
			showfn(options) {
				return options.show_writings && !!options.writing_left_cheek;
			},
		},
      "writing_left_shoulder": {
			animation: "idle",

			srcfn(options) {
				return getWritingImgPath('left_shoulder', setup.bodywriting[options.writing_left_shoulder]);
			},
			showfn(options) {
				return options.show_writings && !!options.writing_left_shoulder;
			},
			zfn(options) {
				if (["cover", "hold"].includes(options.arm_left)) return ZIndices.left_cover_arm + 0.5;
				return ZIndices.breasts + 0.5;
			},
		},
      "writing_left_thigh": {
			z: ZIndices.skin,
			animation: "idle",

			srcfn(options) {
				return getWritingImgPathArrow('left_thigh', setup.bodywriting[options.writing_left_thigh]);
			},
			showfn(options) {
				return options.show_writings && !!options.writing_left_thigh;
			},
		},
      "writing_pubic": {
			z: ZIndices.skin,
			animation: "idle",

			srcfn(options) {
				return getWritingImgPathArrow('pubic', setup.bodywriting[options.writing_pubic]);
			},
			showfn(options) {
				return options.show_writings && !!options.writing_pubic;
			},
			dxfn(options) {
				if (options.belly >= 23) return 10;
				if (options.belly >= 22) return 8;
				if (options.belly >= 20) return 6;
				if (options.belly >= 17) return 4;
				if (options.belly >= 8) return 2;
				return 0;
			},
			dyfn(options) {
				if (options.belly >= 24) return 6;
				if (options.belly >= 22) return 4;
				if (options.belly >= 21) return 2;
				return 0;
			},
		},
      "writing_right_cheek": {
			z: ZIndices.skin,
			animation: "idle",

			srcfn(options) {
				const area_name = "right_cheek"
				const writing = setup.bodywriting[options.writing_right_cheek];
				if (writing.type === "text") {
					if (writing.sprites && writing.sprites.length > 0 && writing.sprites.includes(area_name)) {
						return `img/bodywriting/text/${writing.key}/${area_name}.png`;
					}
					return `img/bodywriting/text/default/${area_name}.png`;
				}

				const arrow = writing.arrow ? "_arrow" : "";
				if (writing.type === "object") return `img/bodywriting/${writing.writing}/${area_name}${arrow}.png`;
				return '';
			},
			showfn(options) {
				return options.show_writings && !!options.writing_right_cheek;
			},
		},
      "writing_right_shoulder": {
			animation: "idle",

			srcfn(options) {
				return getWritingImgPath('right_shoulder', setup.bodywriting[options.writing_right_shoulder]);
			},
			showfn(options) {
				return options.show_writings && !!options.writing_right_shoulder;
			},
			dxfn(options) {
				if (["none", "cover"].includes(options.arm_right) || options.handheld_position === "right_cover") return 4;
				return 0;
			},
			zfn(options) {
				if (["cover", "hold"].includes(options.arm_right)) return ZIndices.right_cover_arm + 0.5;
				return ZIndices.armsidle + 0.5;
			},
		},
      "writing_right_thigh": {
			z: ZIndices.skin,
			animation: "idle",

			srcfn(options) {
				return getWritingImgPathArrow('right_thigh', setup.bodywriting[options.writing_right_thigh]);
			},
			showfn(options) {
				return !!options.writing_right_thigh;
			},
		},
      "angel_halo_back": function (helpers) { return helpers.genlayer_halo("back", "angel"); },
      "angel_halo_front": function (helpers) { return helpers.genlayer_halo("front", "angel"); },
      "angel_wings_left": function (helpers) { return helpers.genlayer_wings("left", "angel", false); },
      "angel_wings_leftcover": function (helpers) { return helpers.genlayer_wings_cover("left", "angel", false); },
      "angel_wings_right": function (helpers) { return helpers.genlayer_wings("right", "angel", false); },
      "angel_wings_rightcover": function (helpers) { return helpers.genlayer_wings_cover("right", "angel", false); },
      "bird_malar": function (helpers) { return helpers.genlayer_tf("bird", "feathers", "malar"); },
      "bird_plumage": function (helpers) { return helpers.genlayer_tf("bird", "feathers", "plumage"); },
      "bird_pubes": function (helpers) { return helpers.genlayer_tf_pubes("bird", "feathers"); },
      "bird_tail": function (helpers) { return helpers.genlayer_tail("bird", true); },
      "bird_wings_left": function (helpers) { return helpers.genlayer_wings("left", "bird", true); },
      "bird_wings_leftcover": function (helpers) { return helpers.genlayer_wings_cover("left", "bird", true); },
      "bird_wings_right": function (helpers) { return helpers.genlayer_wings("right", "bird", true); },
      "bird_wings_rightcover": function (helpers) { return helpers.genlayer_wings_cover("right", "bird", true); },
      "cat_ears": function (helpers) { return helpers.genlayer_ears("cat", true); },
      "cat_tail": function (helpers) { return helpers.genlayer_tail("cat", true); },
      "cold_breath": function (helpers) { return helpers.genlayer_breath('player','front'); },
      "cow_ear_left": function (helpers) { return helpers.genlayer_ears("cow", false, {
			z: ZIndices.horns,
			masksrcfn() {
				return "img/face/masks/left.png"
			}
		}); },
      "cow_ear_right": function (helpers) { return helpers.genlayer_ears("cow", false, {
			zfn() {
				return ZIndices.ears + 0.5;
			},
			masksrcfn() {
				return "img/face/masks/right.png"
			}
		}); },
      "cow_horns": function (helpers) { return helpers.genlayer_horns("cow", {
			zfn(options) {
				return options.cow_horns_layer === "front" ? ZIndices.over_head + 1 : ZIndices.horns + 1;
			},
		}); },
      "cow_tag": function (helpers) { return helpers.genlayer_ears("cow", false, {
			z: ZIndices.facewear,
			src: `img/transformations/cow/ears/tag.png`,
		}); },
      "cow_tail": function (helpers) { return helpers.genlayer_tail("cow", false); },
      "demon_horns": function (helpers) { return helpers.genlayer_horns("demon", {
			filters: ["demon_horns"],
		}); },
      "demon_tail": function (helpers) { return helpers.genlayer_tail("demon", false, {
			filters: ["demon_tail"],
		}); },
      "fallen_halo_back": function (helpers) { return helpers.genlayer_halo("back", "fallen"); },
      "fallen_halo_front": function (helpers) { return helpers.genlayer_halo("front", "fallen"); },
      "fallen_wings_left": function (helpers) { return helpers.genlayer_wings("left", "fallen", false); },
      "fallen_wings_leftcover": function (helpers) { return helpers.genlayer_wings_cover("left", "fallen", false); },
      "fallen_wings_right": function (helpers) { return helpers.genlayer_wings("right", "fallen", false); },
      "fallen_wings_rightcover": function (helpers) { return helpers.genlayer_wings_cover("right", "fallen", false); },
      "fire_back": function (helpers) { return helpers.genlayer_effect('fire','back', {
			animationfn() {
				const intensity = V.farm_assault ? 2 : T.tempEffects?.fire || V.fire;
				return `fireBack${intensity}`;
			},
			srcfn() {
				const intensity = V.farm_assault ? 2 : T.tempEffects?.fire || V.fire;
				return `img/misc/ambient/fire/back${intensity}.png`
			},
		}); },
      "fire_front": function (helpers) { return helpers.genlayer_effect('fire','front', {
			showfn(options) {
				return !T.hideSidebarEffects && (!!options.fire || !!options.fireFront);
			},
		}); },
      "fox_cheeks": function (helpers) { return helpers.genlayer_cheeks("fox"); },
      "fox_ears": function (helpers) { return helpers.genlayer_ears("fox", true); },
      "fox_tail": function (helpers) { return helpers.genlayer_tail("fox", true); },
      "petals_back": function (helpers) { return helpers.genlayer_effect('petals','back', {
			animationfn() {
				const direction = T.tempEffects?.petals === "reverse" ? "Floating" : "Falling";
				return `petals${direction}`;
			},
			srcfn(options) {
				return `img/misc/ambient/petals/back${options.petalColour.toUpperFirst()}.png`
			},
		}); },
      "petals_front": function (helpers) { return helpers.genlayer_effect('petals','front', {
			animationfn() {
				const direction = T.tempEffects?.petals === "reverse" ? "Floating" : "Falling";
				return `petals${direction}`;
			},
			srcfn(options) {
				return `img/misc/ambient/petals/front${options.petalColour.toUpperFirst()}.png`
			},
		}); },
      "precipitation_back": function (helpers) { return helpers.genlayer_effect('precipitation', 'back'); },
      "precipitation_front": function (helpers) { return helpers.genlayer_effect('precipitation','front'); },
      "prop": function (helpers) { return helpers.genlayer_prop(); },
      "prop_acc": function (helpers) { return helpers.genlayer_prop_acc(); },
      "water_back": function (helpers) { return helpers.genlayer_effect('water','back'); },
      "water_breath": function (helpers) { return helpers.genlayer_breath('water','front', {
			srcfn() {
				return `img/misc/ambient/water/breath.png`
			},
		}); },
      "water_front": function (helpers) { return helpers.genlayer_effect('water','front'); },
      "wolf_cheeks": function (helpers) { return helpers.genlayer_cheeks("wolf"); },
      "wolf_ears": function (helpers) { return helpers.genlayer_ears("wolf", true); },
      "wolf_pits": function (helpers) { return helpers.genlayer_tf_pits("wolf", "hirsute"); },
      "wolf_pubes": function (helpers) { return helpers.genlayer_tf_pubes("wolf", "hirsute"); },
      "wolf_tail": function (helpers) { return helpers.genlayer_tail("wolf", true); },
    }; },
    clothes: function () { return {
      "buttplug": {
			z: ZIndices.backhair,
			animation: "idle",
			showfn(options) {
				return playerHasButtPlug() && V.worn.butt_plug.name.includes("tail") && !options.mannequin;
			},
			srcfn() {
				return `img/clothes/back/${V.worn.butt_plug.name}/back.png`;
			},
		},
      "follower_base": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.base}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.base;
			},
			z: ZIndices.head,
		},
      "follower_clothes": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.clothes}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.clothes;
			},
			z: ZIndices.head + 5,
		},
      "follower_clothes_left_arm": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.clothes_left_arm}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.clothes_left_arm;
			},
			z: ZIndices.head + 4,
		},
      "follower_hair": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.hair}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.hair;
			},
			z: ZIndices.head + 6,
		},
      "follower_left_arm": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.left_arm}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.left_arm;
			},
			z: ZIndices.head + 1,
		},
      "follower_under_clothes": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.under_clothes}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.under_clothes;
			},
			z: ZIndices.head + 3,
		},
      "follower_writing_chest": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.writing_chest}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.writing_chest;
			},
			z: ZIndices.head + 2,
		},
      "follower_writing_left_arm": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.writing_left_arm}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.writing_left_arm;
			},
			z: ZIndices.head + 2,
		},
      "follower_writing_left_foot": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.writing_left_foot}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.writing_left_foot;
			},
			z: ZIndices.head + 2,
		},
      "follower_writing_left_leg": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.writing_left_leg}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.writing_left_leg;
			},
			z: ZIndices.head + 2,
		},
      "follower_writing_left_shoulder": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.writing_left_shoulder}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.writing_left_shoulder;
			},
			z: ZIndices.head + 2,
		},
      "follower_writing_left_thigh": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.writing_left_thigh}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.writing_left_thigh;
			},
			z: ZIndices.head + 2,
		},
      "follower_writing_right_arm": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.writing_right_arm}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.writing_right_arm;
			},
			z: ZIndices.head + 2,
		},
      "follower_writing_right_cheek": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.writing_right_cheek}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.writing_right_cheek;
			},
			z: ZIndices.head + 2,
		},
      "follower_writing_right_foot": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.writing_right_foot}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.writing_right_foot;
			},
			z: ZIndices.head + 2,
		},
      "follower_writing_right_leg": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.writing_right_leg}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.writing_right_leg;
			},
			z: ZIndices.head + 2,
		},
      "follower_writing_right_shoulder": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.writing_right_shoulder}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.writing_right_shoulder;
			},
			z: ZIndices.head + 2,
		},
      "follower_writing_right_thigh": {
			animation: "idle",
			srcfn(options) {
				return `img/clothes/props/npc/${options.follower.name}/${options.follower.writing_right_thigh}.png`;
			},
			showfn(options) {
				return !!options.follower && !!options.follower.writing_right_thigh;
			},
			z: ZIndices.head + 2,
		},
      "handheld_left": {
			srcfn(options) {
				const cover = options.arm_left === "cover" ? "left_cover" : "left";
				const path = `img/clothes/handheld/${options.worn.handheld.setup.variable}/${cover}.png`;
				return gray_suffix(path, options.filters['worn_handheld']);
			},
			showfn(options) {
				if (options.worn.handheld.index <= 0 || !options.show_clothes || options.hideAll || options.arm_left === "none" || (options.prop && options.prop.armPosition !== "handsfree")) return false;

				if (options.arm_left === "cover") return options.worn.handheld.setup.leftImage === 1 && options.worn.handheld.setup.coverImage;
				return options.worn.handheld.setup.leftImage === 1;
			},
			zfn(options) {
				if (options.arm_left === "cover") return ZIndices.old_over_upper;
				if (!options.worn.handheld.setup.zIndex) return ZIndices.handheld;
				return ZIndices[options.worn.handheld.setup.zIndex];
			},
			filtersfn() {
				return ["worn_handheld"];
			},
		},
      "handheld_left_acc": {
			srcfn(options) {
				const cover = options.arm_left === "cover" ? "left_cover" : "left";
				const path = `img/clothes/handheld/${options.worn.handheld.setup.variable}/${cover}_acc.png`;
				return gray_suffix(path, options.filters['worn_handheld_acc']);
			},
			showfn(options) {
				if (options.worn.handheld.index <= 0 || !options.show_clothes || options.hideAll || options.arm_left === "none" || (options.prop && options.prop.armPosition !== "handsfree")) return false;

				const hasLeftAcc = options.worn.handheld.setup.leftImage === 1 && options.worn.handheld.setup.accessory === 1

				if (options.arm_left === "cover") return hasLeftAcc && options.worn.handheld.setup.coverImage;
				return hasLeftAcc;
			},
			zfn(options) {
				if (options.arm_left === "cover") return ZIndices.old_over_upper;
				if (!options.worn.handheld.setup.zIndex) return ZIndices.handheld;
				return ZIndices[options.worn.handheld.setup.zIndex];
			},
			filtersfn() {
				return ["worn_handheld_acc"];
			},
		},
      "hands_left": {
			filters: ["worn_hands"],
			animation: "idle",

			srcfn(options) {
				const suffix = options.arm_left === "cover" ? "left_cover" : "left";
				const pattern = options.worn.hands.pattern && !["tertiary", "secondary"].includes(options.worn.hands.setup.pattern_layer) ? "_" + options.worn.hands.pattern?.replace(/ /g,"_") : '';
				const path = `img/clothes/hands/${options.worn.hands.setup.variable}/${suffix}${pattern}.png`;
				return gray_suffix(path, options.filters['worn_hands']);
			},
			showfn(options) {
				return options.show_clothes
					&& options.worn.hands.index > 0
					&& options.worn.hands.setup.leftImage === 1
					&& options.arm_left !== "none";
			},
			zfn(options) {
				return options.arm_left === "cover" ? options.zupperleft - 0.5 : options.zarms + 0.2;
			},
		},
      "hands_left_acc": {
			filters: ["worn_hands_acc"],
			animation: "idle",

			srcfn(options) {
				const suffix = options.arm_left === "cover" ? "left_cover" : "left";
				const pattern = options.worn.hands.pattern && options.worn.hands.setup.pattern_layer === "secondary" ? "_" + options.worn.hands.pattern?.replace(/ /g,"_") : '';
				const path = `img/clothes/hands/${options.worn.hands.setup.variable}/${suffix}${pattern}_acc.png`;
				return gray_suffix(path, options.filters['worn_hands_acc']);
			},
			showfn(options) {
				return options.show_clothes
					&& options.worn.hands.index > 0
					&& options.worn.hands.setup.leftImage === 1
					&& options.worn.hands.setup.accessory === 1
					&& options.arm_left !== "none";
			},
			zfn(options) {
				return options.arm_left === "cover" ? options.zupperleft - 0.5 : options.zarms + 0.2;
			},
		},
      "hands_left_detail": {
			animation: "idle",

			srcfn(options) {
				const hold = options.handheld_position || "right";
				const suffix = options.arm_right === "cover" ? "right_cover" : hold;
				return `img/clothes/hands/${options.worn.hands.setup.variable}/${suffix}_${options.worn.hands.pattern}.png`;
			},
			showfn(options) {
				return options.show_clothes
					&& options.worn.hands.index > 0
					&& options.worn.hands.setup.leftImage === 1
					&& options.worn.hands.setup.pattern_layer === "tertiary"
					&& !!options.worn.hands.setup.pattern
					&& options.arm_right !== "none";
			},
			zfn(options) {
				return (options.arm_right === "cover" || options.arm_right === "hold") ?
					ZIndices.hands : options.zarms + 0.2;
			},
		},
      "hands_left_fitted": {
			filters: ["worn_hands"],
			animation: "idle",

			srcfn(options) {
				const suffix = options.arm_left === "cover" ? "left_cover" : "left";
				const pattern = options.worn.hands.pattern && !["tertiary", "secondary"].includes(options.worn.hands.setup.pattern_layer) ? "_" + options.worn.hands.pattern?.replace(/ /g,"_") : '';
				const path = `img/clothes/hands/${options.worn.hands.setup.variable}/${suffix}${pattern}.png`;
				return gray_suffix(path, options.filters['worn_hands']);
			},
			showfn(options) {
				return options.show_clothes
					&& options.worn.hands.index > 0
					&& options.worn.hands.setup.leftImage === 1
					&& ["curvy", "slender"].includes(options.body_type)
					&& options.arm_left === "idle"
					&& !(options.belly > 7)
			},
			masksrcfn(options) {
				return options.upper_fitted_left_move_src || options.under_upper_fitted_left_move_src ;
			},
			dxfn() {
				return -2;
			},
			zfn(options) {
				return options.zarms + 0.1;
			},
		},
      "hands_left_fitted_acc": {
			filters: ["worn_hands_acc"],
			animation: "idle",

			srcfn(options) {
				const suffix = options.arm_left === "cover" ? "left_cover" : "left";
				const pattern = options.worn.hands.pattern && options.worn.hands.setup.pattern_layer === "secondary" ? "_" + options.worn.hands.pattern?.replace(/ /g,"_") : '';
				const path = `img/clothes/hands/${options.worn.hands.setup.variable}/${suffix}${pattern}_acc.png`;
				return gray_suffix(path, options.filters['worn_hands_acc']);
			},
			showfn(options) {
				return options.show_clothes
					&& options.worn.hands.index > 0
					&& options.worn.hands.setup.leftImage === 1
					&& options.worn.hands.setup.accessory === 1
					&& ["curvy", "slender"].includes(options.body_type)
					&& options.arm_left === "idle"
					&& !(options.belly > 7);
			},
			masksrcfn(options) {
				return options.upper_fitted_left_move_src || options.under_upper_fitted_left_move_src;
			},
			dxfn() {
				return -2;
			},
			zfn(options) {
				return options.zarms + 0.1;
			},
		},
      "hands_right": {
			filters: ["worn_hands"],
			animation: "idle",

			srcfn(options) {
				const hold = options.handheld_position || "right";
				const suffix = options.arm_right === "cover" ? "right_cover" : hold;
				const pattern = options.worn.hands.pattern && !["tertiary", "secondary"].includes(options.worn.hands.setup.pattern_layer) ? "_" + options.worn.hands.pattern?.replace(/ /g,"_") : '';
				const path = `img/clothes/hands/${options.worn.hands.setup.variable}/${suffix}${pattern}.png`;
				return gray_suffix(path, options.filters['worn_hands']);
			},
			showfn(options) {
				return options.show_clothes
					&& options.worn.hands.index > 0
					&& options.worn.hands.setup.rightImage === 1
					&& options.arm_right !== "none";
			},
			zfn(options) {
				return ["cover", "hold"].includes(options.arm_right) ? options.zupperright - 0.5 : options.zarms + 0.2;
			},
		},
      "hands_right_acc": {
			filters: ["worn_hands_acc"],
			animation: "idle",

			srcfn(options) {
				const hold = options.handheld_position || "right";
				const suffix = options.arm_right === "cover" ? "right_cover" : hold;
				const pattern = options.worn.hands.pattern && options.worn.hands.setup.pattern_layer === "secondary" ? "_" + options.worn.hands.pattern?.replace(/ /g,"_") : '';
				const path = `img/clothes/hands/${options.worn.hands.setup.variable}/${suffix}${pattern}_acc.png`;
				return gray_suffix(path, options.filters['worn_hands_acc']);
			},
			showfn(options) {
				return options.show_clothes
					&& options.worn.hands.index > 0
					&& options.worn.hands.setup.rightImage === 1
					&& options.worn.hands.setup.accessory === 1
					&& options.arm_right !== "none";
			},
			zfn(options) {
				return ["cover", "hold"].includes(options.arm_right) ? options.zupperright - 0.5 : options.zarms + 0.2;
			},
		},
      "hands_right_detail": {
			animation: "idle",

			srcfn(options) {
				const hold = options.handheld_position || "right";
				const suffix = options.arm_right === "cover" ? "right_cover" : hold;
				return `img/clothes/hands/${options.worn.hands.setup.variable}/${suffix}_${options.worn.hands.pattern}.png`;
			},
			showfn(options) {
				return options.show_clothes
					&& options.worn.hands.index > 0
					&& options.worn.hands.setup.rightImage === 1
					&& options.worn.hands.setup.pattern_layer === "tertiary"
					&& !!options.worn.hands.setup.pattern
					&& options.arm_right !== "none";
			},
			zfn(options) {
				return (options.arm_right === "cover" || options.arm_right === "hold") ?
					ZIndices.hands : options.zarms + 0.2;
			},
		},
      "lower_penis": {
			z: ZIndices.lower_top,
			filters: ["worn_lower"],
			animation: "idle",

			//ToDo: add images for lower penis bulges. check against pregnancy belly
			srcfn(options) {
				return gray_suffix(
					`img/clothes/lower/${options.worn.lower.setup.variable}/penis.png`,
					options.filters['worn_lower']
				);
			},
			showfn(options) {
				return options.show_clothes
					&& !options.belly_hides_lower
					&& options.worn.lower.index > 0
					&& options.worn.lower.setup.penis_img === 1
					&& calculatePenisBulge() - 6 > 0;
			},
		},
      "lower_penis_acc": {
			z: ZIndices.lower_top,
			filters: ["worn_lower_acc"],
			animation: "idle",

			//ToDo: add images for lower penis bulges. check against pregnancy belly
			srcfn(options) {
				return gray_suffix(
					`img/clothes/lower/${options.worn.lower.setup.variable}/acc_penis.png`,
					options.filters['worn_lower_acc']
				);
			},
			showfn(options) {
				return options.show_clothes
					&& !options.belly_hides_lower
					&& options.worn.lower.index > 0
					&& options.worn.lower.setup.penis_acc_img === 1
					&& options.worn.lower.setup.accessory === 1
					&& calculatePenisBulge() - 6 > 0;
			},
		},
      "pbhair": {
			filters: ["pbhair"],
			z: ZIndices.pbhair,
			animation: "idle",

			srcfn(options) {
				return `img/hair/phair/pb${options.pbhair_level}.png`;
			},
			showfn(options) {
				// $pblevel 4 does not exist
				return options.crotch_visible
					&& options.pbhair_level > 1
					&& !options.belly_hides_under_lower
					&& options.pbhair_level !== 4;
			},
			masksrcfn(options) {
				return options.body_type === "soft" ? "img/clothes/masks/soft_lower_clip.png" : null;
			}
		},
      "pbhair_strip": {
			filters: ["pbhair"],
			z: ZIndices.pbhair,
			animation: "idle",

			srcfn(options) {
				return `img/hair/phair/pbstrip${options.pbhair_strip}.png`;
			},
			showfn(options) {
				return options.crotch_visible
					&& options.pbhair_strip >= 1
					&& !options.belly_hides_under_lower;
			},
			masksrcfn(options) {
				return options.body_type === "soft" ? "img/clothes/masks/soft_lower_clip.png" : null;
			}
		},
      "penis_parasite": {
			filters: ["penis_parasite"],
			animation: "idle",

			srcfn(options) {
				if (options.genitals_chastity) {
					if (!options.worn.genitals.setup.name.includes("cage")) return "";
					switch (options.penis_parasite) {
						case "urchin":
							return `img/clothes/genitals/${options.worn.genitals.setup.variable}/urchin.png`;
						case "slime":
							return `img/clothes/genitals/${options.worn.genitals.setup.variable}/slime.png`;
						default:
							break;
					}
				}

				switch (options.penis_parasite) {
					case "urchin":
						/* Swap to penisurchingray for new sprites, make sure to include colour changes to the code */
						return `img/body/penis/penisurchin${options.penis_size}.png`;
					case "slime":
						return `img/body/penis/penisslime${options.penis_size}.png`;
					case "parasite":
						return `img/body/penis/penisparasite${options.balls ? 'balls' : ''}${options.penis_size}.png`;
					default:
						return "";
				}
			},
			showfn(options) {
				return options.crotch_visible && !!options.penis && !!options.penis_parasite && !playerHasStrapon();
			},
			zfn(options) {
				if (options.genitals_chastity) return options.crotch_exposed ? ZIndices.penis_chastity : ZIndices.penisunderclothes;
				if (options.crotch_exposed) return ZIndices.parasite;
				return ZIndices.underParasite;
			},
		},
      "toast": {
			filters: ["toast"],
			z: ZIndices.toast,

			srcfn() {
				return `img/clothes/props/food/toast-${V.trauma > 4000 ? "raw" : "buttered"}.png`;
			},
			showfn(options) {
				return options.show_face && !!options.toast;
			},
		},
      "under_lower_penis": {
			z: ZIndices.under_lower_top,
			filters: ["worn_under_lower"],
			animation: "idle",

			//ToDo: expand the existing bulk images by providing a small bulge when `calculatePenisBulge()` is less than 8 (max is 15). check against pregnancy belly
			srcfn(options) {
				return gray_suffix(
					`img/clothes/under_lower/${options.worn.under_lower.setup.variable}/penis.png`,
					options.filters['worn_under_lower']
				);
			},
			showfn(options) {
				return options.show_clothes
					&& !options.belly_hides_under_lower
					&& options.worn.under_lower.index > 0
					&& options.worn.under_lower.setup.penis_img === 1
					&& calculatePenisBulge() > 0;
			},
			masksrcfn(options) {
				return options.underLowerMask;
			},
		},
      "under_lower_penis_acc": {
			z: ZIndices.under_lower_top,
			filters: ["worn_under_lower_acc"],
			animation: "idle",

			//ToDo: expand the existing bulk images by providing a small bulge when `calculatePenisBulge()` is less than 8 (max is 15). check against pregnancy belly
			srcfn(options) {
				return gray_suffix(
					`img/clothes/under_lower/${options.worn.under_lower.setup.variable}/acc_penis.png`,
					options.filters['worn_under_lower_acc']
				);
			},
			showfn(options) {
				return options.show_clothes
					&& !options.belly_hides_under_lower
					&& options.worn.under_lower.index > 0
					&& options.worn.under_lower.setup.penis_acc_img === 1
					&& options.worn.under_lower.setup.accessory === 1
					&& calculatePenisBulge() > 0;
			},
			masksrcfn(options) {
				return options.underLowerMask;
			},
		},
      "vines": {
			animation: "idle",
			z: ZIndices.upper,
			showfn(options) {
				return !!options.vines;
			},
			src: `img/clothes/feet/vines/full_body.png`,
		},
      "face": function (helpers) { return helpers.genlayer_clothing_main('face', {
			zfn(options) {
				const isAltPosition = !options.alt_override
					&& options.worn.face.setup.altposition !== undefined
					&& options.worn.face.alt === "alt";
				const check = isAltPosition
					&& (options.worn.face.setup.type.includes("cool")
						|| options.worn.face.setup.type.includes("glasses"));

				if (check) return ZIndices.over_head;
				return options.facewear_layer === "front" ? ZIndices.facewear - 12.5 : ZIndices.facewear;
			},
		}); },
      "face_acc": function (helpers) { return helpers.genlayer_clothing_accessory('face', {
			zfn(options) {
				const isAltPosition = !options.alt_override
					&& options.worn.face.setup.altposition !== undefined
					&& options.worn.face.alt === "alt";
				const check = isAltPosition
					&& (options.worn.face.setup.type.includes("cool")
						|| options.worn.face.setup.type.includes("glasses"));

				if (check) return ZIndices.over_head;
				return options.facewear_layer === "front" ? ZIndices.facewear - 12.5 : ZIndices.facewear;
			},
		}); },
      "face_back": function (helpers) { return helpers.genlayer_clothing_back_img('face'); },
      "face_back_acc": function (helpers) { return helpers.genlayer_clothing_back_img_acc('face'); },
      "feet": function (helpers) { return helpers.genlayer_clothing_main('feet', {
			zfn(options) {
				const check = options.lower_tucked
					&& !options.worn.lower.setup.notuck
					&& !options.worn.feet.setup.notuck;

				if (check) return ZIndices.lower_tucked_feet;
				return ZIndices.feet;
			},
		}); },
      "feet_acc": function (helpers) { return helpers.genlayer_clothing_accessory('feet', {
			zfn(options) {
				const check = options.lower_tucked
					&& !options.worn.lower.setup.notuck
					&& !options.worn.feet.setup.notuck;

				if (check) return ZIndices.lower_tucked_feet;
				return ZIndices.feet;
			},
		}); },
      "feet_back": function (helpers) { return helpers.genlayer_clothing_back_img('feet'); },
      "feet_back_acc": function (helpers) { return helpers.genlayer_clothing_back_img_acc('feet'); },
      "feet_details": function (helpers) { return helpers.genlayer_clothing_detail('feet'); },
      "genitals": function (helpers) { return helpers.genlayer_clothing_main('genitals', {
			zfn(options) {
				return options.crotch_exposed ? ZIndices.penis_chastity + 0.1 : ZIndices.penisunderclothes + 0.1;
			},
			showfn(options) {
				return options.worn.genitals.index > 0
					&& options.worn.genitals.setup.mainImage !== 0
					&& !options.worn.genitals.setup.hideUnderLower.includes(options.worn.under_lower.setup.name)
					&& !options.belly_hides_under_lower;
			},
			srcfn(options) {
				let size = "";
				if (options.worn.genitals.setup.penisSize) {
					switch (options.penis_size) {
						case -2: case -1:
							size = -1;
							break;
						case 0:
							size = 0;
							break;
						case 1: case 2:
							size = 1;
							break;
						case 3: case 4:
							size = 2;
							break;
					}
				}

				const setupVar = options.worn.genitals.setup.variable;
				const integrity = options.worn.genitals.integrity;
				return `img/clothes/genitals/${setupVar}/${integrity}${size}.png`;
			},
			masksrcfn(options) {
				return options.body_type === "soft" ? "img/clothes/masks/soft_lower_clip.png" : null;
			}
		}); },
      "handheld_back": function (helpers) { return helpers.genlayer_clothing_back_img('handheld', {
			showfn(options) {
				if (options.worn.handheld.index <= 0 || !options.show_clothes || options.hideAll || ["none", "cover"].includes(options.arm_right) || (options.prop && options.prop.armPosition !== "handsfree")) return false;

				return options.worn.handheld.setup.back_img === 1;
			},
			z: ZIndices.over_head_back
		}); },
      "handheld_back_acc": function (helpers) { return helpers.genlayer_clothing_back_img_acc('handheld', {
			showfn(options) {
				if (options.worn.handheld.index <= 0 || !options.show_clothes || options.hideAll || ["none", "cover"].includes(options.arm_right) || (options.prop && options.prop.armPosition !== "handsfree")) return false;

				return options.worn.handheld.setup.back_img_acc === 1;
			},
			z: ZIndices.over_head_back
		}); },
      "handheld_left_detail": function (helpers) { return helpers.genlayer_clothing_detail('handheld', {
			srcfn(options) {
				const pattern = options.worn.handheld.pattern ? "_" + options.worn.handheld.pattern?.replace(/ /g,"_") : "";
				const cover = options.arm_left === "cover" ? "left_cover" : "left";
				return `img/clothes/handheld/${options.worn.handheld.setup.variable}/${cover}${pattern}.png`;
			},
			showfn(options) {
				if (options.worn.handheld.index <= 0 || !options.show_clothes || options.hideAll || options.arm_left === "none" || (options.prop && options.prop.armPosition !== "handsfree")) return false;

				const hasLeftDetail = !!options.worn.handheld.pattern && options.worn.handheld.setup.pattern_layer === "tertiary";

				if (options.arm_left === "cover") return hasLeftDetail && options.worn.handheld.setup.coverImage;
				return hasLeftDetail;
			},
			zfn(options) {
				if (options.arm_left === "cover") return ZIndices.old_over_upper;
				if (!options.worn.handheld.setup.zIndex) return ZIndices.handheld;
				return ZIndices[options.worn.handheld.setup.zIndex];
			},
		}); },
      "handheld_right": function (helpers) { return helpers.genlayer_clothing_main('handheld', {
			srcfn(options) {
				const pattern = options.worn.handheld.pattern && !["tertiary", "secondary"].includes(options.worn.handheld.setup.pattern_layer) ? "_" + options.worn.handheld.pattern?.replace(/ /g,"_") : '';
				const cover = options.arm_right === "cover" && options.handheld_position !== 'right_cover' ? "right_cover" : "right";
				const extra = pattern || '';

				const path = `img/clothes/handheld/${options.worn.handheld.setup.variable}/${cover}${extra}.png`;
				return gray_suffix(path, options.filters['worn_handheld']);
			},
			showfn(options) {
				if (options.worn.handheld.index <= 0 || !options.show_clothes || options.hideAll || options.arm_right === "none" || (options.prop && options.prop?.armPosition !== "handsfree")) return false;

				if (options.arm_right === "cover") return options.worn.handheld.setup.coverImage !== 0;
				return true;
			},
			zfn(options) {
				const setup = options.worn.handheld.setup;
				if (options.arm_right === "cover" && V.worn.handheld.holdPosition === "right_cover" && setup.zIndex) return ZIndices[setup.zIndex];
				if (options.arm_right === "cover") return ZIndices.arms_cover;
				if (!options.worn.handheld.setup.zIndex) return ZIndices.handheld;
				return ZIndices[options.worn.handheld.setup.zIndex];
			},
			animationfn(options) {
				return options.handheld_animation
			},
			filtersfn(options) {
				if (["feather"].includes(options.worn.handheld.setup.variable) && options.worn.handheld.colour === "grey") {
					return ["hair"];
				}
				return ["worn_handheld"];
			},
		}); },
      "handheld_right_acc": function (helpers) { return helpers.genlayer_clothing_accessory('handheld', {
			srcfn(options) {
				const pattern = options.worn.handheld.pattern && options.worn.handheld.setup.pattern_layer === "secondary" ? "_" + options.worn.handheld.pattern?.replace(/ /g,"_") : '';

				const cover = options.arm_right === "cover" && options.handheld_position !== 'right_cover' ? "right_cover" : "right";
				const extra = pattern || '';
				const path = `img/clothes/handheld/${options.worn.handheld.setup.variable}/${cover}${extra}_acc.png`;
				return gray_suffix(path, options.filters['worn_handheld_acc']);
			},
			showfn(options) {
				if (options.worn.handheld.index <= 0 || !options.show_clothes || options.hideAll || options.arm_right === "none" || (options.prop && options.prop?.armPosition !== "handsfree")) return false;

				if (options.arm_right === "cover") return options.worn.handheld.setup.accessory === 1 && options.worn.handheld.setup.coverImage !== 0;
				return options.worn.handheld.setup.accessory === 1;
			},
			zfn(options) {
				const setup = options.worn.handheld.setup;
				if (options.arm_right === "cover" && V.worn.handheld.holdPosition === "right_cover" && setup.zIndex) return ZIndices[setup.zIndex];
				if (options.arm_right === "cover") return ZIndices.arms_cover;
				if (!options.worn.handheld.setup.zIndex) return ZIndices.handheld;
				return ZIndices[options.worn.handheld.setup.zIndex];
			},
		}); },
      "handheld_right_detail": function (helpers) { return helpers.genlayer_clothing_detail('handheld', {
			srcfn(options) {
				const pattern = options.worn.handheld.pattern ? "_" + options.worn.handheld.pattern?.replace(/ /g,"_") : "";

				const cover = options.arm_right === "cover" && options.handheld_position !== 'right_cover' ? "right_cover" : "right";

				return `img/clothes/handheld/${options.worn.handheld.setup.variable}/${cover}${pattern}.png`;
			},
			showfn(options) {
				if (options.worn.handheld.index <= 0 || !options.show_clothes || options.hideAll || options.arm_right === "none" || (options.prop && options.prop?.armPosition !== "handsfree")) return false;

				const hasRightDetail = options.worn.handheld.setup.pattern_layer === "tertiary" && !!options.worn.handheld.pattern;

				if (options.arm_right === "cover") return hasRightDetail && options.worn.handheld.setup.coverImage !== 0;
				return hasRightDetail;
			},
			zfn(options) {
				const setup = options.worn.handheld.setup;
				if (options.arm_right === "cover" && V.worn.handheld.holdPosition === "right_cover" && setup.zIndex) return ZIndices[setup.zIndex];
				if (options.arm_right === "cover") return ZIndices.arms_cover;
				if (!options.worn.handheld.setup.zIndex) return ZIndices.handheld;
				return ZIndices[options.worn.handheld.setup.zIndex];
			},
		}); },
      "hands": function (helpers) { return helpers.genlayer_clothing_main('hands'); },
      "head": function (helpers) { return helpers.genlayer_clothing_main('head', {
			srcfn(options) {
				const dmg = options.worn.head.setup.accessory_integrity_img ? options.worn.upper.integrity : options.worn.head.integrity;
				const pattern = options.worn.head.pattern && !["tertiary", "secondary"].includes(options.worn.head.setup.pattern_layer) ? "_" + options.worn.head.pattern?.replace(/ /g,"_") : '';

				const path = `img/clothes/head/${options.worn.head.setup.variable}/${dmg}${pattern}.png`;
				return gray_suffix(path, options.filters['worn_head']);
			},
			showfn(options) {
				return options.show_clothes
					&& options.worn.head.index > 0
					&& options.worn.head.setup.mainImage !== 0
					&& !options.hideAll;
			},
		}); },
      "head_acc": function (helpers) { return helpers.genlayer_clothing_accessory('head', {
			srcfn(options) {
				const dmg = options.worn.head.setup.accessory_integrity_img ? `_${options.worn.upper.integrity}` : '';
				const pattern = options.worn.head.pattern && options.worn.head.setup.pattern_layer === "secondary" ? "_" + options.worn.head.pattern?.replace(/ /g,"_") : '';
				const path = `img/clothes/head/${options.worn.head.setup.variable}/acc${dmg}${pattern}.png`;
				return gray_suffix(path, options.filters['worn_head_acc']);
			},
			showfn(options) {
				return options.show_clothes
					&& options.worn.head.index > 0
					&& options.worn.head.setup.accImage !== 0
					&& options.worn.head.setup.accessory === 1
					&& !options.hideHeadAcc
					&& !options.hideAll;
			},
		}); },
      "head_back": function (helpers) { return helpers.genlayer_clothing_back_img('head'); },
      "head_back_acc": function (helpers) { return helpers.genlayer_clothing_back_img_acc('head'); },
      "head_detail": function (helpers) { return helpers.genlayer_clothing_detail('head', {
			showfn(options) {
				return options.show_clothes
					&& options.worn.head.index > 0
					&& options.worn.head.setup.mainImage !== 0
					&& options.worn.head.setup.pattern_layer === "tertiary"
					&& !!options.worn.head.pattern
					&& !options.hideAll;
			},
		}); },
      "legs": function (helpers) { return helpers.genlayer_clothing_main('legs', {
			zfn(options) {
				const check = (options.worn.under_lower.setup.set === options.worn.under_upper.setup.set
					|| options.worn.under_lower.setup.high_img === 1) && options.worn.legs.setup.high_img !== 1;

				if (check) return ZIndices.legs;
				return ZIndices.legs_high;
			},
			masksrcfn(options) {
				return options.legsMask;
			},
		}); },
      "legs_acc": function (helpers) { return helpers.genlayer_clothing_accessory('legs', {
			zfn(options) {
				const check = options.worn.under_lower.setup.set === options.worn.under_upper.setup.set
					|| options.worn.under_lower.setup.high_img === 1;

				if (check) return ZIndices.legs;
				return ZIndices.legs_high;
			},
			masksrcfn(options) {
				return options.legsMask;
			},
		}); },
      "legs_back": function (helpers) { return helpers.genlayer_clothing_back_img('legs'); },
      "legs_back_acc": function (helpers) { return helpers.genlayer_clothing_back_img_acc('legs'); },
      "lower": function (helpers) { return helpers.genlayer_clothing_main('lower', {
			zfn(options) {
				const secondary = options.worn.lower.setup.type.includes("covered") ? ZIndices.lower_cover : ZIndices.lower;
				return options.worn.lower.setup.high_img ? ZIndices.lower_high : secondary;
			},
			masksrcfn(options) {
				return options.lowerMask;
			},
		}); },
      "lower_acc": function (helpers) { return helpers.genlayer_clothing_accessory("lower", {
			srcfn(options) {
				const secondary = options.worn.upper.setup.name === "school blouse" && options.worn.lower.setup.name.includes("pinafore") ? '_under' : '';
				const suffix = options.worn.lower.setup.accessory_integrity_img ? `_${options.worn.lower.integrity}` : secondary;
				const pattern = options.worn.lower.pattern && options.worn.lower.setup.pattern_layer === "secondary" ? "_" + options.worn.lower.pattern?.replace(/ /g,"_") : '';
				return gray_suffix(`img/clothes/lower/${options.worn.lower.setup.variable}/acc${suffix}${pattern}.png`, options.filters['worn_lower_acc']);
			},
			zfn(options) {
				if (options.worn.lower.setup.name.includes("ballgown") || options.worn.lower.setup.name.includes("pinafore"))
					return ZIndices.upper_top;
				if (options.worn.lower.setup.type.includes("covered")) return ZIndices.lower_cover;

				return ZIndices.lower;
			},
			masksrcfn(options) {
				return options.lowerMask;
			},
		}); },
      "lower_back": function (helpers) { return helpers.genlayer_clothing_back_img('lower', {
			z: ZIndices.back_lower
		}); },
      "lower_back_acc": function (helpers) { return helpers.genlayer_clothing_back_img_acc('lower', {
			z: ZIndices.back_lower
		}); },
      "lower_belly": function (helpers) { return helpers.genlayer_clothing_belly("lower", {
			masksrcfn(options) {
				return options.lowerBellyMask;
			},
			zfn(options) {
				return options.worn.lower.setup.high_img ? ZIndices.lower_high : ZIndices.lower_belly;
			},
		}); },
      "lower_belly_2": function (helpers) { return helpers.genlayer_clothing_belly_2("lower", {
			masksrcfn(options) {
				return options.lowerBellyMask;
			},
			zfn(options) {
				return options.worn.lower.setup.high_img ? ZIndices.lower_high : ZIndices.lower_belly;
			},
		}); },
      "lower_belly_acc": function (helpers) { return helpers.genlayer_clothing_belly_acc("lower", {
			masksrcfn(options) {
				return options.lowerBellyMask;
			},
			zfn(options) {
				return options.worn.lower.setup.high_img ? ZIndices.lower_high : ZIndices.lower_belly;
			},
		}); },
      "lower_belly_shadow": function (helpers) { return helpers.genlayer_clothing_belly_shadow("lower", {
			zfn(options) {
				return options.worn.lower.setup.high_img ? ZIndices.lower_high : ZIndices.lower_belly;
			},
		}); },
      "lower_breasts": function (helpers) { return helpers.genlayer_clothing_breasts("lower", {
			zfn(options) {
				return options.acc_layer_under ? ZIndices.lower_high + 1 : ZIndices.lower_high;
			},
		}); },
      "lower_breasts_acc": function (helpers) { return helpers.genlayer_clothing_breasts_acc("lower", {
			zfn(options) {
				return options.acc_layer_under ? ZIndices.lower_high + 1 : ZIndices.lower_high;
			},
		}); },
      "lower_detail": function (helpers) { return helpers.genlayer_clothing_detail("lower", {
			z:ZIndices.lower,
			masksrcfn(options) {
				return options.lowerMask;
			},
		}); },
      "lower_fitted_acc_left": function (helpers) { return helpers.genlayer_clothing_fitted_left_acc("lower", {
			zfn(options) {
				const secondary = options.worn.lower.setup.type.includes("covered") ? ZIndices.lower_cover : ZIndices.lower;
				return options.worn.lower.setup.high_img ? ZIndices.lower_high : secondary;
			},
			masksrcfn(options) {
				return options.upper_fitted_left_move_src;
			},
			dxfn(options) {
				return options.body_type === "soft" ? 2 : -2;
			},
		}); },
      "lower_fitted_acc_right": function (helpers) { return helpers.genlayer_clothing_fitted_right_acc("lower", {
			zfn(options) {
				const secondary = options.worn.lower.setup.type.includes("covered") ? ZIndices.lower_cover : ZIndices.lower;
				return options.worn.lower.setup.high_img ? ZIndices.lower_high : secondary;
			},
			masksrcfn(options) {
				return options.upper_fitted_right_move_src;
			},
			dxfn(options) {
				return options.body_type === "soft" ? -2 : 2;
			},
		}); },
      "lower_fitted_left": function (helpers) { return helpers.genlayer_clothing_fitted_left("lower", {
			zfn(options) {
				const secondary = options.worn.lower.setup.type.includes("covered") ? ZIndices.lower_cover : ZIndices.lower;
				return options.worn.lower.setup.high_img ? ZIndices.lower_high : secondary;
			},
			masksrcfn(options) {
				return options.upper_fitted_left_move_src;
			},
			dxfn(options) {
				return options.body_type === "soft" ? 2 : -2;
			},
		}); },
      "lower_fitted_right": function (helpers) { return helpers.genlayer_clothing_fitted_right("lower", {
			zfn(options) {
				const secondary = options.worn.lower.setup.type.includes("covered") ? ZIndices.lower_cover : ZIndices.lower;
				return options.worn.lower.setup.high_img ? ZIndices.lower_high : secondary;
			},
			masksrcfn(options) {
				return options.upper_fitted_right_move_src;
			},
			dxfn(options) {
				return options.body_type === "soft" ? -2 : 2;
			},
		}); },
      "neck": function (helpers) { return helpers.genlayer_clothing_main('neck', {
			srcfn(options) {
				const isAltPosition = !options.alt_override
					&& options.worn.neck.setup.altposition !== undefined
					&& options.worn.neck.alt === "alt";

				let collar = "";
				if (options.worn.neck.setup.has_collar === 1 && options.worn.upper.setup.has_collar === 1 && !(options.worn.upper.setup.name === "dress shirt" && options.worn.upper.alt === "alt")) {
					collar = '_nocollar';
				} else if (options.worn.neck.setup.name === "sailor ribbon" && options.worn.upper.setup.name === "serafuku") {
					collar = "_serafuku";
				}
				const pattern = options.worn.neck.pattern && !["tertiary", "secondary"].includes(options.worn.neck.pattern_layer) ? "_" + options.worn.neck.pattern?.replace(/ /g,"_") : '';
				const alt = isAltPosition ? '_alt' : '';

				const setupVar = options.worn.neck.setup.variable;
				const integrity = options.worn.neck.integrity;
				const path = `img/clothes/neck/${setupVar}/${integrity}${collar}${pattern}${alt}.png`;
				return gray_suffix(path, options.filters['worn_neck']);
			},
			showfn(options) {
				return options.show_clothes
					&& options.worn.neck.index > 0
					&& options.worn.neck.setup.mainImage !== 0
					&& !options.hideAll;
			},
			masksrcfn(options) {
				return options.high_waist_suspenders ? "img/clothes/neck/suspenders/mask.png" : null;
			},
			zfn(options) {
				return options.hood_mask ? ZIndices.collar : ZIndices.neck;
			},
		}); },
      "neck_acc": function (helpers) { return helpers.genlayer_clothing_accessory('neck', {
			srcfn(options) {
				const isAltPosition = !options.alt_override
					&& options.worn.neck.setup.altposition !== undefined
					&& options.worn.neck.alt === "alt";
				const integrity = options.worn.neck.setup.accessory_integrity_img ? `_${options.worn.neck.integrity}` : '';
				const alt = isAltPosition ? '_alt' : '';
				const pattern = options.worn.neck?.pattern && options.worn.neck?.pattern_layer === "secondary" ? "_" + options.worn.neck.pattern?.replace(/ /g,"_") : '';

				const setupVar = options.worn.neck.setup.variable;
				const path = `img/clothes/neck/${setupVar}/acc${integrity}${pattern}${alt}.png`;
				return gray_suffix(path, options.filters['worn_neck_acc']);
			},
			showfn(options) {
				return options.show_clothes
					&& options.worn.neck.index > 0
					&& options.worn.neck.setup.accImage !== 0
					&& options.worn.neck.setup.accessory === 1
					&& !options.hideLeash;
			},
			zfn(options) {
				const check = options.worn.head.setup.mask_img === 1
					&& !(options.hood_down
						&& options.worn.head.setup.hood
						&& options.worn.head.setup.outfitSecondary !== undefined);
				return check ? ZIndices.collar : ZIndices.neck;
			},
			dyfn(options) {
				return options.high_waist_suspenders ? -8 : 0;
			},
		}); },
      "over_head": function (helpers) { return helpers.genlayer_clothing_main('over_head'); },
      "over_head_acc": function (helpers) { return helpers.genlayer_clothing_accessory('over_head'); },
      "over_head_back": function (helpers) { return helpers.genlayer_clothing_back_img('over_head'); },
      "over_head_back_acc": function (helpers) { return helpers.genlayer_clothing_back_img_acc('over_head'); },
      "over_lower": function (helpers) { return helpers.genlayer_clothing_main('over_lower'); },
      "over_lower_acc": function (helpers) { return helpers.genlayer_clothing_accessory('over_lower'); },
      "over_lower_back": function (helpers) { return helpers.genlayer_clothing_back_img('over_lower'); },
      "over_lower_detail": function (helpers) { return helpers.genlayer_clothing_detail('over_lower'); },
      "over_upper_acc": function (helpers) { return helpers.genlayer_clothing_accessory('over_upper'); },
      "over_upper_breasts": function (helpers) { return helpers.genlayer_clothing_breasts("over_upper"); },
      "over_upper_detail": function (helpers) { return helpers.genlayer_clothing_detail('over_upper'); },
      "over_upper_leftarm": function (helpers) { return helpers.genlayer_clothing_arm("left", "over_upper", {
			zfn(options) {
				return options.arm_left === "cover" ?
					options.zupperleft + 1 : ZIndices.over_upper_arms;
			},
		}); },
      "over_upper_main": function (helpers) { return helpers.genlayer_clothing_main('over_upper'); },
      "over_upper_rightarm": function (helpers) { return helpers.genlayer_clothing_arm("right", "over_upper", {
			zfn(options) {
				return (options.arm_right === "cover" || options.arm_right === "hold") ?
					options.zupperright + 1 : ZIndices.over_upper_arms;
			},
		}); },
      "prop_underarm": function (helpers) { return helpers.genlayer_prop({
			showfn(options) {
				return !!options.prop.show && !!options.prop.overUnderSplit;
			},
			srcfn(options) {
				return `img/clothes/props/${options.prop.folder}/${options.prop.name}-underarm.png`
			},
			zfn() {
				return ZIndices.handheld;
			},
		}); },
      "prop_underarm_acc": function (helpers) { return helpers.genlayer_prop_acc({
			showfn(options) {
				return !!options.prop.show && !!options.prop.overUnderAccSplit;
			},
			srcfn(options) {
				return `img/clothes/props/${options.prop.folder}/${options.prop.name}-underarm-acc.png`
			},
			zfn() {
				return ZIndices.handheld;
			},
		}); },
      "under_lower": function (helpers) { return helpers.genlayer_clothing_main('under_lower', {
			zfn(options) {
				return options.worn.lower.setup.high_img ?
					ZIndices.under_lower_high : ZIndices.under_lower;
			},
			masksrcfn(options) {
				return options.underLowerMask;
			},
		}); },
      "under_lower_acc": function (helpers) { return helpers.genlayer_clothing_accessory("under_lower", {
			masksrcfn(options) {
				return options.underLowerMask;
			},
		}); },
      "under_lower_belly": function (helpers) { return helpers.genlayer_clothing_belly("under_lower", {
			masksrcfn(options) {
				return options.belly_mask_src;
			},
			zfn(options) {
				return options.worn.lower.setup.high_img ?
					ZIndices.under_lower_high : ZIndices.under_lower;
			},
			showfn(options) {
				return options.belly > 7
					&& options.show_clothes
					&& !options.belly_hides_under_lower
					&& options.worn.under_lower.index > 0
					&& options.worn.under_lower.setup.mainImage !== 0;
			},
		}); },
      "under_lower_belly_2": function (helpers) { return helpers.genlayer_clothing_belly_2("under_lower", {
			masksrcfn(options) {
				return options.belly_mask_src;
			},
			zfn(options) {
				return options.worn.lower.setup.high_img ?
					ZIndices.under_lower_high : ZIndices.under_lower;
			},
			showfn(options) {
				return options.belly > 7
					&& options.show_clothes
					&& !options.belly_hides_under_lower
					&& options.worn.under_lower.index > 0
					&& options.worn.under_lower.setup.mainImage !== 0;
			},
		}); },
      "under_lower_belly_acc": function (helpers) { return helpers.genlayer_clothing_belly_acc("under_lower", {
			masksrcfn(options) {
				return options.belly_mask_src;
			},
			zfn(options) {
				return options.worn.lower.setup.high_img ?
					ZIndices.under_lower_high : ZIndices.under_lower;
			},
			showfn(options) {
				return options.belly > 7
					&& options.show_clothes
					&& !options.belly_hides_under_lower
					&& options.worn.under_lower.index > 0
					&& options.worn.under_lower.setup.accessory === 1;
			},
		}); },
      "under_lower_belly_shadow": function (helpers) { return helpers.genlayer_clothing_belly_shadow("under_lower", {
			zfn() {
				return ZIndices.under_lower_top_high;
			},
			showfn(options) {
				return (options.belly > 7 || (options.body_type === "soft" && !options.worn.under_upper.setup.outfitPrimary))
					&& options.show_clothes
					&& !options.belly_hides_under_lower
					&& options.worn.under_lower.index > 0
					&& options.worn.under_lower.setup.mainImage !== 0;
			},
		}); },
      "under_lower_detail": function (helpers) { return helpers.genlayer_clothing_detail("under_lower", {
			masksrcfn(options) {
				return options.underLowerMask;
			},
		}); },
      "under_upper": function (helpers) { return helpers.genlayer_clothing_main('under_upper', {
			masksrcfn(options) {
				if (options.belly >= 19 && options.worn.upper.setup.pregType == "split")
					return options.worn.under_upper.setup.pregType === "split"
						&& options.shirt_mask_clip_src;

				return options.underUpperMask;
			}
		}); },
      "under_upper_acc": function (helpers) { return helpers.genlayer_clothing_accessory('under_upper', {
			masksrcfn(options) {
				if (options.belly >= 19 && options.worn.upper.setup.pregType == "split")
					return options.worn.under_upper.setup.pregType === "split"
						&& options.shirt_mask_clip_src;

				return options.underUpperMask;
			}
		}); },
      "under_upper_back": function (helpers) { return helpers.genlayer_clothing_back_img('under_upper'); },
      "under_upper_belly": function (helpers) { return helpers.genlayer_clothing_belly("under_upper", {
			masksrcfn(options) {
				return options.belly_mask_src;
			},
			zfn() {
				return ZIndices.under_upper_top;
			},
		}); },
      "under_upper_belly_2": function (helpers) { return helpers.genlayer_clothing_belly_2("under_upper", {
			masksrcfn(options) {
				return options.belly_mask_src;
			},
			zfn() {
				return ZIndices.under_upper_top;
			},
		}); },
      "under_upper_belly_acc": function (helpers) { return helpers.genlayer_clothing_belly_acc("under_upper", {
			masksrcfn(options) {
				return options.belly_mask_src;
			},
			zfn(options) {
				return options.worn.lower.setup.high_img ?
					ZIndices.under_upper_top_acc : ZIndices.under_upper_top_acc;
			},
		}); },
      "under_upper_breasts": function (helpers) { return helpers.genlayer_clothing_breasts("under_upper"); },
      "under_upper_breasts_acc": function (helpers) { return helpers.genlayer_clothing_breasts_acc('under_upper'); },
      "under_upper_breasts_detail": function (helpers) { return helpers.genlayer_clothing_breasts_detail("under_upper"); },
      "under_upper_fitted_left": function (helpers) { return helpers.genlayer_clothing_fitted_left("under_upper", {
			masksrcfn(options) {
				return options.under_upper_fitted_left_move_src;
			},
			dxfn(options) {
				return options.body_type === "soft" ? 2 : -2;
			},
		}); },
      "under_upper_fitted_left_acc": function (helpers) { return helpers.genlayer_clothing_fitted_left_acc("under_upper", {
			masksrcfn(options) {
				return options.under_upper_fitted_left_move_src;
			},
			dxfn(options) {
				return options.body_type === "soft" ? 2 : -2;
			},
		}); },
      "under_upper_fitted_right": function (helpers) { return helpers.genlayer_clothing_fitted_right("under_upper", {
			masksrcfn(options) {
				return options.under_upper_fitted_right_move_src;
			},
			dxfn(options) {
				return options.body_type === "soft" ? -2 : 2;
			},
		}); },
      "under_upper_fitted_right_acc": function (helpers) { return helpers.genlayer_clothing_fitted_right_acc("under_upper", {
			masksrcfn(options) {
				return options.under_upper_fitted_right_move_src;
			},
			dxfn(options) {
				return options.body_type === "soft" ? -2 : 2;
			},
		}); },
      "under_upper_leftarm": function (helpers) { return helpers.genlayer_clothing_arm("left", "under_upper", {
			zfn(options) {
				return options.arm_left === "cover" ? options.zupperleft - 1 : ZIndices.under_upper_arms;
			},
		}); },
      "under_upper_leftarm_fitted": function (helpers) { return helpers.genlayer_clothing_arm_fitted("left", "under_upper", {
			zfn() {
				return ZIndices.under_upper_arms - 0.1;
			},
		}); },
      "under_upper_leftarm_fitted_acc": function (helpers) { return helpers.genlayer_clothing_arm_acc_fitted("left", "under_upper", {
			zfn() {
				return ZIndices.under_upper_arms - 0.1;
			},
		}); },
      "under_upper_rightarm": function (helpers) { return helpers.genlayer_clothing_arm("right", "under_upper", {
			zfn(options) {
				return options.arm_right === "cover" || options.arm_right === "hold" ?
					options.zupperright - 1 : ZIndices.under_upper_arms;
			},
		}); },
      "upper_acc": function (helpers) { return helpers.genlayer_clothing_accessory("upper", {
			zfn(options) {
				return options.arm_right === "hold" && options.sleeve_over_hold ? ZIndices.lower_high : options.zupper;
			},
			masksrcfn(options) {
				return options.upperMask;
			},
		}); },
      "upper_back": function (helpers) { return helpers.genlayer_clothing_back_img('upper', {
			z: ZIndices.back_lower
		}); },
      "upper_belly": function (helpers) { return helpers.genlayer_clothing_belly("upper", {
			zfn(options) {
				return options.zupper;
			},
			masksrcfn(options) {
				return options.belly_mask_src;
			},
		}); },
      "upper_belly_2": function (helpers) { return helpers.genlayer_clothing_belly_2("upper", {
			zfn(options) {
				return options.zupper;
			},
			masksrcfn(options) {
				return options.belly_mask_src;
			},
		}); },
      "upper_belly_acc": function (helpers) { return helpers.genlayer_clothing_belly_acc("upper", {
			zfn(options) {
				return options.zupper;
			},
			masksrcfn(options) {
				return options.belly_mask_src;
			},
		}); },
      "upper_belly_split_acc_l": function (helpers) { return helpers.genlayer_clothing_belly_split_acc("upper", {
			zfn(options) {
				return options.zupper;
			},
			masksrcfn(options) {
				return options.shirt_move_left_src;
			},
			dxfn(options) {
				if (options.shirt_move_left_src) return options.belly >= 22 ? 12 : 10;
				return 0;
			},
			dyfn(options) {
				return options.shirt_move_left_src ? -4 : 0;
			},
		}); },
      "upper_belly_split_acc_l2": function (helpers) { return helpers.genlayer_clothing_belly_split_acc("upper", {
			zfn(options) {
				return options.zupper;
			},
			masksrcfn(options) {
				return options.shirt_move_left2_src;
			},
			dxfn(options) {
				if (options.shirt_move_left2_src) return options.belly >= 22 ? 14 : 12;
				return 0;
			},
			dyfn(options) {
				return options.shirt_move_left2_src ? -2 : 0;
			},
		}); },
      "upper_belly_split_acc_r": function (helpers) { return helpers.genlayer_clothing_belly_split_acc("upper", {
			zfn(options) {
				return options.zupper;
			},
			masksrcfn(options) {
				return options.shirt_move_right_src;
			},
		}); },
      "upper_belly_split_acc_r2": function (helpers) { return helpers.genlayer_clothing_belly_split_acc("upper", {
			zfn(options) {
				return options.zupper;
			},
			masksrcfn(options) {
				return options.shirt_move_right2_src;
			},
			dxfn(options) {
				if (options.shirt_move_right2_src) return -4;
			},
		}); },
      "upper_belly_split_acc_r3": function (helpers) { return helpers.genlayer_clothing_belly_split_acc("upper", {
			zfn(options) {
				return options.zupper;
			},
			masksrcfn(options) {
				return options.shirt_move_right3_src;
			},
			dxfn(options) {
				if (options.shirt_move_right3_src) return -6;
			},
		}); },
      "upper_belly_split_acc_shadow": function (helpers) { return helpers.genlayer_clothing_belly_split_acc("upper", {
			zfn(options) {
				return options.zupper - 1;
			},
			masksrcfn(options) {
				return options.shirt_mask_clip_src;
			},
			dyfn(options) {
				return options.shirt_move_left_src ? 2 : 0;
			},
			dxfn() {
				return 0;
			},
			brightnessfn(options) {
				return options.shirt_move_left_src && options.shirt_mask_clip_src ? -0.3 : 0;
			},
		}); },
      "upper_belly_split_l": function (helpers) { return helpers.genlayer_clothing_belly_split("upper", {
			zfn(options) {
				return options.zupper;
			},
			masksrcfn(options) {
				return options.shirt_move_left_src;
			},
			dxfn(options) {
				if (options.shirt_move_left_src)
					return options.belly >= 22 ? 12 : 8;
				return 0;
			},
			dyfn(options) {
				return options.shirt_move_left_src ? -2 : 0;
			},
		}); },
      "upper_belly_split_l2": function (helpers) { return helpers.genlayer_clothing_belly_split("upper", {
			zfn(options) {
				return options.zupper;
			},
			masksrcfn(options) {
				return options.shirt_move_left2_src;
			},
			dxfn(options) {
				if (options.shirt_move_left2_src)
					return options.belly >= 22 ? 14 : 10;
				return 0;
			},
			dyfn() {
				return 0;
			},
		}); },
      "upper_belly_split_l2_shadow": function (helpers) { return helpers.genlayer_clothing_belly_split("upper", {
			zfn(options) {
				return options.zupper - 1;
			},
			masksrcfn(options) {
				return options.shirt_move_left2_src;
			},
			dxfn(options) {
				if (options.shirt_move_left2_src)
					return options.belly >= 22 ? 16 : 12;
				return 0;
			},
			dyfn() {
				return 0;
			},
			brightnessfn(options) {
				return options.shirt_move_left2_src ? -0.3 : 0;
			},
		}); },
      "upper_belly_split_l_shadow": function (helpers) { return helpers.genlayer_clothing_belly_split("upper", {
			zfn(options) {
				return options.zupper - 1;
			},
			masksrcfn(options) {
				return options.shirt_move_left_src
			},
			dxfn(options) {
				if (options.shirt_move_left_src)
					return options.belly >= 22 ? 14 : 10;
				return 0;
			},
			dyfn(options) {
				return options.shirt_move_left_src ? -2 : 0;
			},
			brightnessfn(options) {
				return options.shirt_move_left_src ? -0.3 : 0;
			},
		}); },
      "upper_belly_split_r": function (helpers) { return helpers.genlayer_clothing_belly_split("upper", {
			zfn(options) {
				return options.zupper;
			},
			masksrcfn(options) {
				return options.shirt_move_right_src;
			},
		}); },
      "upper_belly_split_r2": function (helpers) { return helpers.genlayer_clothing_belly_split("upper", {
			zfn(options) {
				return options.zupper;
			},
			masksrcfn(options) {
				return options.shirt_move_right2_src;
			},
			dxfn(options) {
				if (options.shirt_move_right2_src) return -4;
			},
		}); },
      "upper_belly_split_r3": function (helpers) { return helpers.genlayer_clothing_belly_split("upper", {
			zfn(options) {
				return options.zupper;
			},
			masksrcfn(options) {
				return options.shirt_move_right3_src;
			},
			dxfn(options) {
				if (options.shirt_move_right3_src) return -6;
			},
		}); },
      "upper_belly_split_shadow": function (helpers) { return helpers.genlayer_clothing_belly_split("upper", {
			zfn(options) {
				return options.zupper - 1;
			},
			masksrcfn(options) {
				return options.shirt_mask_clip_src;
			},
			dyfn(options) {
				return options.shirt_move_left_src ? 2 : 0;
			},
			dxfn() {
				return 0;
			},
			brightnessfn(options) {
				return options.shirt_move_left_src && options.shirt_mask_clip_src ? -0.3 : 0;
			},
		}); },
      "upper_breasts": function (helpers) { return helpers.genlayer_clothing_breasts("upper", {
			zfn(options) {
				return options.acc_layer_under ? ZIndices.upper + 1 : options.zupper;
			},
		}); },
      "upper_breasts_acc": function (helpers) { return helpers.genlayer_clothing_breasts_acc("upper", {
			zfn(options) {
				return options.zupper;
			},
		}); },
      "upper_breasts_detail": function (helpers) { return helpers.genlayer_clothing_breasts_detail("upper", {
			zfn(options) {
				return options.zupper;
			},
		}); },
      "upper_detail": function (helpers) { return helpers.genlayer_clothing_detail('upper', {
			zfn(options) {
				return options.zupper;
			},
		}); },
      "upper_fitted_left": function (helpers) { return helpers.genlayer_clothing_fitted_left("upper", {
			zfn(options) {
				return options.zupper;
			},
			masksrcfn(options) {
				return options.upper_fitted_left_move_src;
			},
			dxfn(options) {
				return options.body_type === "soft" ? 2 : -2;
			},
		}); },
      "upper_fitted_left_acc": function (helpers) { return helpers.genlayer_clothing_fitted_left_acc("upper", {
			zfn(options) {
				return options.zupper;
			},
			masksrcfn(options) {
				return options.upper_fitted_left_move_src;
			},
			dxfn(options) {
				return options.body_type === "soft" ? 2 : -2;
			},
		}); },
      "upper_fitted_right": function (helpers) { return helpers.genlayer_clothing_fitted_right("upper", {
			zfn(options) {
				return options.zupper;
			},
			masksrcfn(options) {
				return options.upper_fitted_right_move_src;
			},
			dxfn(options) {
				return options.body_type === "soft" ? -2 : 2;
			},
		}); },
      "upper_fitted_right_acc": function (helpers) { return helpers.genlayer_clothing_fitted_right_acc("upper", {
			zfn(options) {
				return options.zupper;
			},
			masksrcfn(options) {
				return options.upper_fitted_right_move_src;
			},
			dxfn(options) {
				return options.body_type === "soft" ? -2 : 2;
			},
		}); },
      "upper_leftarm": function (helpers) { return helpers.genlayer_clothing_arm("left", "upper", {
			zfn(options) {
				return options.zupperleft;
			},
			masksrcfn(options) {
				return options.belly_hides_lower ? options.belly_mask_clip_src : null;
			},
		}); },
      "upper_leftarm_acc": function (helpers) { return helpers.genlayer_clothing_arm_acc("left", "upper", {
			zfn(options) {
				return options.zupperleft;
			},
		}); },
      "upper_leftarm_fitted": function (helpers) { return helpers.genlayer_clothing_arm_fitted("left", "upper", {
			zfn(options) {
				return options.zupperleft - 1;
			},
		}); },
      "upper_leftarm_fitted_acc": function (helpers) { return helpers.genlayer_clothing_arm_acc_fitted("left", "upper", {
			zfn(options) {
				return options.zupperleft - 1;
			},
		}); },
      "upper_main": function (helpers) { return helpers.genlayer_clothing_main('upper', {
			zfn(options) {
				return options.worn.upper.setup.name === "cocoon" ? ZIndices.over_head : options.zupper;
			},
			masksrcfn(options) {
				return options.upperMask;
			},
		}); },
      "upper_rightarm": function (helpers) { return helpers.genlayer_clothing_arm("right", "upper", {
			zfn(options) {
				return options.zupperright;
			},
		}); },
      "upper_rightarm_acc": function (helpers) { return helpers.genlayer_clothing_arm_acc("right", "upper", {
			zfn(options) {
				return options.zupperright;
			},
		}); },
    }; },
    helpers,
  };
})();