Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let react = require("react");
react = __toESM(react, 1);
let react_dom = require("react-dom");
let react_jsx_runtime = require("react/jsx-runtime");
let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
//#region dev/shared/console/operation-feedback.mjs
/** Beelli X operation feedback: DSH theme roles and body-portal pattern, centered. */
const h = react.default.createElement;
function surface() {
	let root = document.querySelector("[data-beellix-feedback-root]");
	if (!root) {
		root = document.createElement("div");
		root.dataset.beellixFeedbackRoot = "";
		Object.assign(root.style, {
			position: "fixed",
			top: "50%",
			left: "50%",
			transform: "translate(-50%, -50%)",
			zIndex: "1200",
			display: "flex",
			flexDirection: "column",
			gap: "8px",
			width: "max-content",
			maxWidth: "calc(100vw - 40px)",
			pointerEvents: "none"
		});
		document.body.append(root);
	}
	return root;
}
const style = {
	display: "flex",
	alignItems: "center",
	gap: 10,
	maxWidth: "min(600px, calc(100vw - 40px))",
	maxHeight: "60vh",
	overflow: "auto",
	padding: "12px 16px",
	borderRadius: "var(--dsw-radius-lg, 12px)",
	background: "var(--dsw-alias-toast-bg, #242832)",
	color: "var(--dsw-alias-toast-label, #fff)",
	boxShadow: "var(--dsw-shadow-lv3, 0 8px 24px rgb(0 0 0 / 18%))",
	font: "14px/1.6 system-ui, sans-serif",
	boxSizing: "border-box"
};
/** Success disappears; an error remains until dismissed or resolved. No modal or focus theft. */
function OperationFeedback({ notice, error, onNoticeDone, onErrorDone, duration = 3e3 }) {
	const message = error || notice, tone = error ? "error" : "success", [visible, V] = (0, react.useState)(true), latest = (0, react.useRef)({
		onNoticeDone,
		onErrorDone
	});
	latest.current = {
		onNoticeDone,
		onErrorDone
	};
	const dismiss = () => {
		V(false);
		if (error) {
			latest.current.onErrorDone?.();
			latest.current.onNoticeDone?.();
		} else latest.current.onNoticeDone?.();
	};
	(0, react.useEffect)(() => {
		V(true);
		if (!message || tone === "error") return;
		const timer = setTimeout(() => {
			V(false);
			latest.current.onNoticeDone?.();
		}, duration);
		return () => clearTimeout(timer);
	}, [
		message,
		tone,
		duration
	]);
	(0, react.useEffect)(() => () => {
		queueMicrotask(() => {
			const root = document.querySelector("[data-beellix-feedback-root]");
			if (root && !root.childElementCount) root.remove();
		});
	}, [message, visible]);
	if (!message || !visible || typeof document === "undefined") return null;
	return (0, react_dom.createPortal)(h("div", {
		"data-beellix-feedback": tone,
		role: error ? "alert" : "status",
		"aria-atomic": true,
		style: {
			...style,
			pointerEvents: error ? "auto" : "none"
		}
	}, h("svg", {
		width: 20,
		height: 20,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 1.7,
		style: {
			flexShrink: 0,
			color: error ? "var(--dsw-alias-state-warn-label, #ffcd6b)" : "var(--dsw-alias-state-success-primary, #63cf96)"
		},
		"aria-hidden": true
	}, h("circle", {
		cx: 12,
		cy: 12,
		r: 9
	}), h("path", { d: error ? "M12 7v6m0 3v1" : "m7.5 12 3 3 6-6" })), h("span", {
		tabIndex: error ? 0 : void 0,
		style: {
			minWidth: 0,
			maxHeight: "calc(60vh - 24px)",
			overflowY: "auto",
			overflowWrap: "anywhere",
			whiteSpace: "pre-wrap"
		}
	}, message), error && h("button", {
		type: "button",
		"aria-label": "关闭错误提示",
		onClick: dismiss,
		style: {
			display: "grid",
			placeItems: "center",
			flexShrink: 0,
			width: 30,
			height: 30,
			padding: 0,
			border: 0,
			borderRadius: 6,
			background: "transparent",
			color: "inherit",
			font: "inherit",
			cursor: "pointer",
			pointerEvents: "auto"
		}
	}, h("svg", {
		width: 16,
		height: 16,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 1.7,
		"aria-hidden": true
	}, h("path", { d: "m6 6 12 12M18 6 6 18" })))), surface());
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function r(e) {
	var t, f, n = "";
	if ("string" == typeof e || "number" == typeof e) n += e;
	else if ("object" == typeof e) if (Array.isArray(e)) {
		var o = e.length;
		for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
	} else for (f in e) e[f] && (n && (n += " "), n += f);
	return n;
}
function clsx() {
	for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
	return n;
}
//#endregion
//#region stylesheet
var Button_module_css_default = {
	"button": "bxc_yt7ooW_button",
	"icon": "bxc_yt7ooW_icon",
	"outline": "bxc_yt7ooW_outline",
	"sm": "bxc_yt7ooW_sm",
	"ghost": "bxc_yt7ooW_ghost",
	"primary": "bxc_yt7ooW_primary",
	"md": "bxc_yt7ooW_md",
	"toolbar": "bxc_yt7ooW_toolbar"
};
//#endregion
//#region dev/shared/console/packages/ui/components/src/primitives/Button.tsx
/**
* Render a button.
* @param props.variant - visual family (default 'ghost').
* @param props.size - 'md' 36px capsule (figma Button) or 'sm' 28px compact.
* @param props.icon - optional leading 16px icon node.
* @returns the button element; native button attributes pass through.
*/
function Button({ variant = "ghost", size = "md", icon, className, children, ...rest }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
		type: "button",
		className: clsx(Button_module_css_default.button, Button_module_css_default[variant], Button_module_css_default[size], className),
		...rest,
		children: [icon != null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			className: Button_module_css_default.icon,
			children: icon
		}), children]
	});
}
//#endregion
//#region stylesheet
var Input_module_css_default = {
	"icon": "bxc_Gmgibq_icon",
	"input": "bxc_Gmgibq_input",
	"wrap": "bxc_Gmgibq_wrap"
};
//#endregion
//#region dev/shared/console/packages/ui/components/src/primitives/Input.tsx
/**
* Render a text input with an optional leading icon.
* @param props.icon - optional 16px leading icon node.
* @param ref - the native input, cleared when it unmounts.
* @returns wrapper span containing the native input; input attributes pass through.
*/
const Input = (0, react.forwardRef)(function Input({ icon, className, ...rest }, ref) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
		className: clsx(Input_module_css_default.wrap, className),
		children: [icon != null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			className: Input_module_css_default.icon,
			children: icon
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
			ref,
			className: Input_module_css_default.input,
			...rest
		})]
	});
});
const IconPlusOutlineArtwork = ({ size = 16, className, strokeWidth }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	"aria-hidden": "true",
	strokeWidth,
	children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
		d: "M8 2V14",
		stroke: "currentColor"
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
		d: "M2 8H14",
		stroke: "currentColor"
	})]
});
/** Regular one-pixel IconPlusOutline artwork. */
const IconPlusOutlineRegular = (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconPlusOutlineArtwork, {
	...props,
	strokeWidth: 1
});
const IconChevronDownOutlineArtwork = ({ size = 14, className, strokeWidth }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	"aria-hidden": "true",
	strokeWidth,
	children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
		d: "M4 6L7.29289 9.29289C7.68342 9.68342 8.31658 9.68342 8.70711 9.29289L12 6",
		stroke: "currentColor"
	})
});
/** Regular one-pixel IconChevronDownOutline artwork. */
const IconChevronDownOutlineRegular = (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronDownOutlineArtwork, {
	...props,
	strokeWidth: 1
});
const IconChevronRightOutlineArtwork = ({ size = 14, className, strokeWidth }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	"aria-hidden": "true",
	strokeWidth,
	children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
		d: "M6 12L9.29289 8.70711C9.68342 8.31658 9.68342 7.68342 9.29289 7.29289L6 4",
		stroke: "currentColor"
	})
});
/** Regular one-pixel IconChevronRightOutline artwork. */
const IconChevronRightOutlineRegular = (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronRightOutlineArtwork, {
	...props,
	strokeWidth: 1
});
const IconCloseOutlineArtwork = ({ size = 16, className, strokeWidth }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	"aria-hidden": "true",
	strokeWidth,
	children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
		d: "M2.5 2.5L13.5 13.5",
		stroke: "currentColor"
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
		d: "M13.5 2.5L2.5 13.5",
		stroke: "currentColor"
	})]
});
/** Regular one-pixel IconCloseOutline artwork. */
const IconCloseOutlineRegular = (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCloseOutlineArtwork, {
	...props,
	strokeWidth: 1
});
const IconRefreshOutlineArtwork = ({ size = 16, className, strokeWidth }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	"aria-hidden": "true",
	strokeWidth,
	children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
		d: "M14.5001 8C14.5 9.28552 14.1188 10.5422 13.4045 11.611C12.6903 12.6799 11.6752 13.5129 10.4875 14.0049C9.29982 14.4968 7.99295 14.6255 6.73212 14.3747C5.4713 14.124 4.31314 13.505 3.4041 12.596C2.49514 11.687 1.87614 10.5288 1.62537 9.26798C1.37459 8.00716 1.50331 6.70028 1.99525 5.51261C2.48719 4.32494 3.32025 3.30981 4.3891 2.59557C5.45795 1.88134 6.71458 1.50008 8.0001 1.5C9.9001 1.5 11.7001 2.3 13.0001 3.6L14.5001 5.1",
		stroke: "currentColor"
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
		d: "M14.4999 1.5V5.1H10.8999",
		stroke: "currentColor"
	})]
});
/** Regular one-pixel IconRefreshOutline artwork. */
const IconRefreshOutlineRegular = (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRefreshOutlineArtwork, {
	...props,
	strokeWidth: 1
});
const IconTrashOutlineArtwork = ({ size = 16, className, strokeWidth }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	"aria-hidden": "true",
	strokeWidth,
	children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
			d: "M1.28149 3.88831H14.7187",
			stroke: "currentColor"
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
			d: "M5.41602 3.88833V2.47962C5.41602 2.29282 5.52492 2.11366 5.71876 1.98157C5.9126 1.84948 6.17551 1.77527 6.44964 1.77527H9.55053C9.82466 1.77527 10.0876 1.84948 10.2814 1.98157C10.4753 2.11366 10.5842 2.29282 10.5842 2.47962V3.88833",
			stroke: "currentColor"
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
			d: "M2.57349 3.88831L3.19366 13.2943C3.21937 13.5502 3.33952 13.7872 3.53065 13.9593C3.72178 14.1313 3.97016 14.2259 4.22729 14.2246H11.7728C12.0299 14.2259 12.2783 14.1313 12.4694 13.9593C12.6605 13.7872 12.7807 13.5502 12.8064 13.2943L13.4266 3.88831",
			stroke: "currentColor"
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
			d: "M6.44946 6.98926V11.1238",
			stroke: "currentColor"
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
			d: "M9.55054 6.98926V11.1238",
			stroke: "currentColor"
		})
	]
});
/** Regular one-pixel IconTrashOutline artwork. */
const IconTrashOutlineRegular = (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconTrashOutlineArtwork, {
	...props,
	strokeWidth: 1
});
const IconDataOutlineArtwork = ({ size = 16, className, strokeWidth }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
	width: size,
	height: size,
	className,
	viewBox: "0 0 16 16",
	fill: "none",
	xmlns: "http://www.w3.org/2000/svg",
	"aria-hidden": "true",
	strokeWidth,
	children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
		d: "M7.8667 0.349609C8.96906 0.349634 10.0601 0.481272 11.0317 0.735352C11.9973 0.987845 12.8453 1.362 13.4644 1.84766C14.0744 2.32629 14.507 2.95539 14.5161 3.69336H14.5171V8.53516C14.0843 8.32076 13.6108 8.17679 13.1108 8.11816C13.1831 7.96848 13.2162 7.82856 13.2163 7.70312V5.76758C12.6269 6.16618 11.8739 6.47995 11.0317 6.7002C10.0602 6.95423 8.96896 7.08494 7.8667 7.08496C6.76461 7.08493 5.67411 6.95415 4.70264 6.7002C3.85994 6.48006 3.10694 6.1662 2.51709 5.76758V7.70312L2.521 7.78418C2.56374 8.19554 2.93361 8.74414 3.91357 9.23145C4.9281 9.73585 6.35004 10.0371 7.8667 10.0371C8.26373 10.0371 8.6543 10.0141 9.03271 9.97461C8.75596 10.3799 8.54664 10.8349 8.42041 11.3232C8.23666 11.3313 8.0518 11.3369 7.8667 11.3369C6.20108 11.3369 4.57025 11.01 3.33447 10.3955C3.04163 10.2499 2.76658 10.0836 2.51709 9.90039V11.6738C2.51728 12.1379 2.88589 12.7556 3.92236 13.292C4.93457 13.8157 6.35342 14.1289 7.8667 14.1289C8.12318 14.1289 8.37694 14.1161 8.62646 14.0986C8.82021 14.5535 9.08999 14.9682 9.41943 15.3271C8.91285 15.3934 8.39149 15.4287 7.8667 15.4287C6.19761 15.4287 4.56379 15.0869 3.32568 14.4463C2.11244 13.8185 1.21649 12.8562 1.21631 11.6738V3.76367C1.21595 3.74853 1.21438 3.733 1.21436 3.71777C1.21436 2.96917 1.65103 2.33053 2.26807 1.84668C2.88747 1.36112 3.73675 0.987685 4.70264 0.735352C5.67413 0.481376 6.76457 0.349636 7.8667 0.349609ZM7.8667 1.65039C6.86269 1.65042 5.88326 1.77028 5.03076 1.99316C4.17183 2.2176 3.50421 2.52956 3.06982 2.87012C2.65043 3.19909 2.52622 3.48898 2.51709 3.69336V3.74414C2.52719 3.94845 2.65185 4.23772 3.06982 4.56543C3.50425 4.90601 4.17172 5.21795 5.03076 5.44238C5.88326 5.66527 6.8627 5.78513 7.8667 5.78516C8.8707 5.78513 9.85015 5.66525 10.7026 5.44238C11.5611 5.21787 12.2286 4.9049 12.6626 4.56445C13.0982 4.22252 13.2163 3.9231 13.2163 3.71777L13.2104 3.63574C13.1818 3.43623 13.044 3.16941 12.6626 2.87012C12.2286 2.52957 11.5614 2.21773 10.7026 1.99316C9.85009 1.77025 8.8708 1.65041 7.8667 1.65039Z",
		fill: "currentColor"
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
		d: "M12.8936 10.0361L13.2061 10.5566C13.2296 10.5959 13.2651 10.6562 13.3027 10.707C13.3469 10.7666 13.4148 10.8431 13.5195 10.9023C13.6244 10.9617 13.725 10.9801 13.7988 10.9873C13.8619 10.9934 13.9318 10.9932 13.9775 10.9932H14.6162L14.8896 11.4502L14.5947 11.9443C14.5698 11.9859 14.5312 12.0483 14.5029 12.1084C14.4781 12.1611 14.4514 12.2312 14.4395 12.3164L14.4326 12.4072L14.4395 12.4971C14.4514 12.5825 14.4781 12.6532 14.5029 12.7061C14.5312 12.7661 14.5689 12.8287 14.5938 12.8701L14.8896 13.3633L14.6162 13.8213H13.9775C13.9318 13.8213 13.8619 13.821 13.7988 13.8271C13.7433 13.8326 13.6728 13.8442 13.5967 13.875L13.5195 13.9121C13.4148 13.9714 13.3469 14.0478 13.3027 14.1074C13.265 14.1583 13.2296 14.2186 13.2061 14.2578L12.8936 14.7783H12.3115L11.999 14.2578C11.9755 14.2186 11.9401 14.1583 11.9023 14.1074C11.8693 14.0628 11.823 14.0083 11.7578 13.959L11.6855 13.9121L11.6074 13.875C11.5316 13.8445 11.4615 13.8325 11.4062 13.8271C11.3432 13.821 11.2733 13.8213 11.2275 13.8213H10.5889L10.3135 13.3633L10.6104 12.8701C10.6352 12.8287 10.6739 12.7661 10.7021 12.7061C10.7352 12.6357 10.7724 12.534 10.7725 12.4072C10.7724 12.2804 10.7352 12.1788 10.7021 12.1084C10.6739 12.0483 10.6353 11.9859 10.6104 11.9443L10.3135 11.4502L10.5889 10.9932H11.2275C11.2733 10.9932 11.3432 10.9934 11.4062 10.9873C11.4801 10.9801 11.5808 10.9616 11.6855 10.9023C11.7903 10.843 11.8582 10.7666 11.9023 10.707C11.94 10.6562 11.9755 10.5959 11.999 10.5566L12.3115 10.0361H12.8936Z",
		stroke: "currentColor",
		strokeMiterlimit: "10"
	})]
});
/** Regular one-pixel IconDataOutline artwork. */
const IconDataOutlineRegular = (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconDataOutlineArtwork, {
	...props,
	strokeWidth: 1
});
//#endregion
//#region dev/shared/console/packages/ui/components/src/primitives/icons/index.tsx
/** 现有图标名称映射到 DSH 0.2.0-rc.2 常规线宽；保留企业组件兼容接口。 */
/** ic_ds_plus_outline_16 */
const IconPlusOutline16 = IconPlusOutlineRegular;
/** ic_ds_chevron_down_outline_14 */
const IconChevronDownOutline14 = IconChevronDownOutlineRegular;
/** ic_ds_chevron_right_outline_14 */
const IconChevronRightOutline14 = IconChevronRightOutlineRegular;
/** ic_ds_refresh_outline_16, inset 10%: the exported glyph fills its box edge
* to edge, one visual size above the neighbouring 16px glyphs. */
const IconRefreshOutline16 = IconRefreshOutlineRegular;
/** ic_ds_trash_outline_16 */
const IconTrashOutline16 = IconTrashOutlineRegular;
/** ic_ds_data_outline_16 */
const IconDataOutline16 = IconDataOutlineRegular;
//#endregion
//#region stylesheet
var Modal_module_css_default = {
	"body": "bxc_25g2Oa_body",
	"footer": "bxc_25g2Oa_footer",
	"dialog": "bxc_25g2Oa_dialog",
	"mask": "bxc_25g2Oa_mask",
	"content": "bxc_25g2Oa_content",
	"description": "bxc_25g2Oa_description",
	"title": "bxc_25g2Oa_title",
	"modalEnter": "bxc_25g2Oa_modalEnter",
	"root": "bxc_25g2Oa_root",
	"header": "bxc_25g2Oa_header",
	"close": "bxc_25g2Oa_close"
};
//#endregion
//#region dev/shared/console/packages/ui/components/src/primitives/Modal.tsx
/**
* Render a centered, body-portaled modal over a blurred page mask.
* @param props.open - whether the dialog is showing.
* @param props.onClose - application close command, Escape, or mask click; while a menu is open inside the
* dialog, Escape belongs to that menu first.
* @param props.title - dialog heading (aria-label in every mode).
* @param props.closeLabel - localized accessible close-button label.
* @param props.description - optional supporting sentence under the title.
* @param props.children - dialog body; mark its initial-focus control with
* data-modal-autofocus instead of React autoFocus to preserve return focus.
* @param props.footer - action row (Cancel / Create).
* @param props.contentClassName - optional class for a scrollable content region.
* @param props.backdropBlur - disable when the caller already blurs the page; defaults to true.
* @param props.shortcutModal - command scope allowed by shortcut owners; unnamed
* dialogs block application commands unless their owner allows the "other" scope.
* @param props.headless - render children directly in the card (no default
* header/close/body chrome); mask, card, Escape, and aria-label remain.
* @param props.onKeyDownCapture - handle a nested dialog's keys before the document Escape listeners.
* @returns null when closed; otherwise the overlay tree.
*/
function Modal$2({ open, onClose, title, closeLabel, description, children, footer, className, contentClassName, onKeyDownCapture, headless = false, backdropBlur = true, shortcutModal }) {
	const dialog = (0, react.useRef)(null);
	(0, _deepseek_ai_dsh_client_ui_primitives.useModalLayer)(dialog, open, onClose);
	if (!open) return null;
	return (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: Modal_module_css_default.root,
		role: "presentation",
		onKeyDownCapture,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: Modal_module_css_default.mask,
			style: backdropBlur ? void 0 : { backdropFilter: "none" },
			"aria-hidden": "true",
			onClick: onClose
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			ref: dialog,
			tabIndex: -1,
			"data-shortcut-modal": shortcutModal,
			className: clsx(Modal_module_css_default.dialog, className),
			role: "dialog",
			"aria-modal": "true",
			"aria-label": title,
			children: headless ? children : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: clsx(Modal_module_css_default.content, contentClassName),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Modal_module_css_default.header,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
							className: Modal_module_css_default.title,
							children: title
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: Modal_module_css_default.close,
							"aria-label": closeLabel,
							onClick: onClose,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCloseOutlineRegular, { size: 14 })
						})]
					}),
					description !== void 0 && description !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: Modal_module_css_default.description,
						children: description
					}),
					children !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: Modal_module_css_default.body,
						children
					})
				]
			}), footer !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: Modal_module_css_default.footer,
				children: footer
			})] })
		})]
	}), document.body);
}
//#endregion
//#region stylesheet
var Switch_module_css_default = {
	"thumb": "bxc_PtgtaG_thumb",
	"switch": "bxc_PtgtaG_switch"
};
//#endregion
//#region dev/shared/console/packages/ui/components/src/primitives/Switch.tsx
/**
* Render a toggle switch.
* @param props.checked - the current state; the control is fully controlled.
* @param props.onChange - called with the state the click asks for.
* @param props.label - localized accessible name, owned by the render site.
* @param props.disabled - whether the control refuses input; owners also set it
* while a write is in flight, not only when a deployment locks the toggle.
* @param props.title - localized hover text, typically why the toggle is locked.
* @param props.className - extra class for layout placement.
* @returns the switch element.
*/
function Switch({ checked, onChange, label, disabled = false, title, className }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
		type: "button",
		role: "switch",
		"aria-checked": checked,
		"aria-label": label,
		title,
		disabled,
		className: clsx(Switch_module_css_default.switch, className),
		onClick: () => {
			onChange(!checked);
		},
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: Switch_module_css_default.thumb })
	});
}
//#endregion
//#region dev/shared/console/packages/ui/components/src/primitives/ScenarioIcon.tsx
const icons = {
	general: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8Z" }),
	quotation: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
		x: "4",
		y: "2.5",
		width: "16",
		height: "19",
		rx: "3"
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 6h8M8 10h1m6 0h1M8 14h1m6 0h1M8 18h1m6-4v4" })] }),
	meeting: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
		x: "8",
		y: "2",
		width: "8",
		height: "12",
		rx: "4"
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8" })] }),
	opportunity: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 3h18l-7 8v8l-4 2V11Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M7 7h10" })] }),
	tender: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M10 21H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8l5 5v3M13 2v5h5M7 11h4m-4 4h2" }),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
			cx: "17",
			cy: "16",
			r: "4"
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m15 16 1.5 1.5L19 15m-4 5-1 2m5-2 1 2" })
	] }),
	order: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
			x: "4",
			y: "4",
			width: "16",
			height: "18",
			rx: "2"
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
			x: "8",
			y: "2",
			width: "8",
			height: "4",
			rx: "1.5"
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 10h8m-8 4h3m-2 4 2 2 5-5" })
	] }),
	comparison: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 3v18m-5 0h10M3 6h18M6 6l-4 8h8Zm12 0-4 8h8Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2 14a4 4 0 0 0 8 0m4 0a4 4 0 0 0 8 0" })] }),
	delivery: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2 5h12v12H2Zm12 4h4l4 5v3h-8M18 9v5h4" }),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
			cx: "6",
			cy: "18",
			r: "2.5"
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
			cx: "18",
			cy: "18",
			r: "2.5"
		})
	] }),
	matching: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2 3h6v7H2Zm14 0h6v7h-6ZM9 15h6v7H9ZM5 10v3h14v-3m-7 3v2" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 6h2m12 0h2m-9 13 1 1 2-2" })] }),
	inventory: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2 9h14v13H2ZM2 9l7-4 7 4M9 12v6m-7-9 7 4 7-4M20 15V3m-3 3 3-3 3 3" }) }),
	contract: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M11 21H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M7 7h6m-6 4h5m-5 6h2" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m12 20 1-4 6-6 3 3-6 6Zm5-8 3 3" })] }),
	acceptance: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 22V3m0 0h11l-2 5 2 5H4" }),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
			cx: "17",
			cy: "17",
			r: "5"
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m14.5 17 1.5 1.5 3.5-3.5" })
	] }),
	change: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 3h15v15H3Zm4 0v4m4-4v2m-8 6h4m-4 4h2" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M11 11h10l-3-3m3 3-3 3M21 20H11l3-3m-3 3 3 3" })] }),
	maintenance: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M14 3a6 6 0 0 0-7 8L2.5 17.5a2.8 2.8 0 0 0 4 4L13 17a6 6 0 0 0 8-7l-4 4-4-1-1-4 4-4Z" }),
	quality: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m12 2 8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m8 11 3 3 5-6" })] }),
	receivables: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 6h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8M22 12h-5a3 3 0 0 0 0 6h5" }),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2 5h10m-3-3 3 3-3 3" }),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
			cx: "17",
			cy: "15",
			r: ".6",
			fill: "currentColor"
		})
	] }),
	expense: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 2h14v20l-3-2-4 2-4-2-3 2ZM9 6h6m-6 4h6" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m8 15 2 2 5-4" })] }),
	cost: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 3v16h8M7 14V9m4 3V6m4 3V3" }),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
			cx: "16",
			cy: "16",
			r: "4"
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m19 19 3 3" })
	] }),
	service: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 13v-2a9 9 0 0 1 18 0v2M3 12h3v7H3Zm15 0h3v7h-3Zm0 7v2h-5" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
		x: "10",
		y: "19",
		width: "4",
		height: "3",
		rx: "1"
	})] }),
	recruitment: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
			cx: "9",
			cy: "6",
			r: "4"
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2 21v-3a7 7 0 0 1 11-5" }),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
			cx: "17",
			cy: "16",
			r: "4"
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m20 19 2 3" })
	] }),
	onboarding: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m2 6 10-4 10 4-10 4Zm4 2v4c4 2 8 2 12 0V8m4-2v6M3 16c3-1 6-1 9 1 3-2 6-2 9-1v6c-3-1-6-1-9 1-3-2-6-2-9-1Zm9 1v6" }) }),
	document: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M14 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9ZM14 2v7h7M7 13h10m-10 4h7" }) })
};
const scenarioKinds = {
	"meeting-minutes": "meeting",
	"smart-quotation": "quotation",
	"sales-opportunity": "opportunity",
	"tender-response": "tender",
	"sales-order-review": "order",
	"purchase-comparison": "comparison",
	"purchase-followup": "delivery",
	"three-way-match": "matching",
	"inventory-replenishment": "inventory",
	"contract-management": "contract",
	"project-acceptance": "acceptance",
	"engineering-change": "change",
	"equipment-maintenance": "maintenance",
	"quality-correction": "quality",
	"receivables-collection": "receivables",
	"expense-review": "expense",
	"project-cost-review": "cost",
	"after-sales-service": "service",
	"recruitment-assessment": "recruitment",
	"employee-onboarding": "onboarding"
};
/** 已知场景使用独立业务图形，未登记插件沿原有报价／语音识别保留兼容回退。 */
function scenarioIconKind(id, capabilities = []) {
	if (!id) return "general";
	if (Object.hasOwn(scenarioKinds, id)) return scenarioKinds[id];
	if (/quotation|quote/u.test(id)) return "quotation";
	if (capabilities.includes("speech") || /meeting/u.test(id)) return "meeting";
	return "document";
}
/** 使用系统已有颜色令牌，业务形状是首要识别线索。 */
function scenarioIconPalette(kind) {
	if ([
		"quotation",
		"receivables",
		"expense",
		"cost",
		"comparison"
	].includes(kind)) return "amber";
	if ([
		"meeting",
		"maintenance",
		"change",
		"service"
	].includes(kind)) return "red";
	if ([
		"delivery",
		"matching",
		"inventory",
		"acceptance",
		"quality",
		"onboarding"
	].includes(kind)) return "green";
	return "blue";
}
/** 图标为装饰，场景名称保留为可读和无障碍标签，不重复朗读。 */
function ScenarioIcon({ kind, size = 20, className, x, y }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
		width: size,
		height: size,
		x,
		y,
		className,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "1.7",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		"aria-hidden": "true",
		focusable: "false",
		"data-scenario-icon": kind,
		"data-palette": scenarioIconPalette(kind),
		children: icons[kind]
	});
}
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/apiKey.ts
/**
* Browser-side judgement of a typed API key.
* @module @beellix-ai/ui-admin/models/apiKey
*/
/**
* Twin of `normalizeApiKey` in `@beellix-ai/llm`: printable ASCII, space
* excluded. Client packages reference only client packages, so the charset
* rule is mirrored here rather than imported; keep the two in step, as
* `validateDeepSeekModels` is kept in step with the host's `catalogModel`.
*/
const LEGAL_API_KEY = /^[\x21-\x7E]+$/;
/**
* A pasted `NAME=value` environment line. Two narrowings keep real keys clear
* of it: the name must be upper-case, so `sk-` forms break at the hyphen, and
* the `=` must be followed by something other than another `=`, so base64
* padding on an all-upper-case key (`ABCD==`) is not mistaken for an
* assignment. This heuristic runs only here — a resolver applying it could
* lock a user out of a gateway whose key legitimately takes this shape, with
* the environment refusing it too and no way through.
*/
const ENV_LINE = /^[A-Z][A-Z0-9_]*=[^=]/;
/** Whether a value is wrapped in one matching pair of quotes. */
function isQuoted(value) {
	const first = value[0];
	if (first !== "\"" && first !== "'" && first !== "`") return false;
	return value.length > 1 && value.endsWith(first);
}
/**
* Judge the key input's current value.
*
* An empty field is not a failure: every card opens with it empty even when a
* key is already stored, where it means keep that one. A field holding only
* whitespace is a failure rather than an empty field, so typed input is never
* silently discarded.
* @param draft - the key input's current value, untrimmed.
* @returns the copy key for a field-level failure, or `undefined` to allow submit.
*/
function apiKeyFailure(draft) {
	if (draft.length === 0) return void 0;
	const value = draft.trim();
	if (value.length === 0) return "keyBlank";
	if (ENV_LINE.test(value) || isQuoted(value)) return "keyIllegalCharacters";
	if (!LEGAL_API_KEY.test(value)) return "keyIllegalCharacters";
}
//#endregion
//#region stylesheet
var ModelsSection_module_css_default = {
	"vendorHeader": "bxc_5DSHYG_vendorHeader",
	"addButton": "bxc_5DSHYG_addButton",
	"hiddenLabel": "bxc_5DSHYG_hiddenLabel",
	"vendorIdentity": "bxc_5DSHYG_vendorIdentity",
	"modelCatalogMeta": "bxc_5DSHYG_modelCatalogMeta",
	"rowActions": "bxc_5DSHYG_rowActions",
	"vendorToggle": "bxc_5DSHYG_vendorToggle",
	"modelEmpty": "bxc_5DSHYG_modelEmpty",
	"modelList": "bxc_5DSHYG_modelList",
	"editorActions": "bxc_5DSHYG_editorActions",
	"primaryButton": "bxc_5DSHYG_primaryButton",
	"rows": "bxc_5DSHYG_rows",
	"editorTitle": "bxc_5DSHYG_editorTitle",
	"modelAdvanced": "bxc_5DSHYG_modelAdvanced",
	"candidateToolbar": "bxc_5DSHYG_candidateToolbar",
	"customizedBody": "bxc_5DSHYG_customizedBody",
	"vendorEmpty": "bxc_5DSHYG_vendorEmpty",
	"providerDialog": "bxc_5DSHYG_providerDialog",
	"editorHeader": "bxc_5DSHYG_editorHeader",
	"customizedSummary": "bxc_5DSHYG_customizedSummary",
	"modelFieldLabel": "bxc_5DSHYG_modelFieldLabel",
	"rowName": "bxc_5DSHYG_rowName",
	"vendorAdvanced": "bxc_5DSHYG_vendorAdvanced",
	"credentialSection": "bxc_5DSHYG_credentialSection",
	"rowCard": "bxc_5DSHYG_rowCard",
	"editor": "bxc_5DSHYG_editor",
	"candidateSearch": "bxc_5DSHYG_candidateSearch",
	"title": "bxc_5DSHYG_title",
	"input": "bxc_5DSHYG_input",
	"rowTag": "bxc_5DSHYG_rowTag",
	"modelListHead": "bxc_5DSHYG_modelListHead",
	"addModelButton": "bxc_5DSHYG_addModelButton",
	"vendorEditor": "bxc_5DSHYG_vendorEditor",
	"error": "bxc_5DSHYG_error",
	"savedNotice": "bxc_5DSHYG_savedNotice",
	"modelCatalogTitle": "bxc_5DSHYG_modelCatalogTitle",
	"credentialDotConfigured": "bxc_5DSHYG_credentialDotConfigured",
	"vendorGroup": "bxc_5DSHYG_vendorGroup",
	"selectInput": "bxc_5DSHYG_selectInput",
	"candidate": "bxc_5DSHYG_candidate",
	"editorRoute": "bxc_5DSHYG_editorRoute",
	"fieldLabel": "bxc_5DSHYG_fieldLabel",
	"field": "bxc_5DSHYG_field",
	"candidateLabel": "bxc_5DSHYG_candidateLabel",
	"deleteDialog": "bxc_5DSHYG_deleteDialog",
	"vendorModels": "bxc_5DSHYG_vendorModels",
	"fetchDialog": "bxc_5DSHYG_fetchDialog",
	"modelCatalogHeading": "bxc_5DSHYG_modelCatalogHeading",
	"switchThumb": "bxc_5DSHYG_switchThumb",
	"intro": "bxc_5DSHYG_intro",
	"credentialDotMissing": "bxc_5DSHYG_credentialDotMissing",
	"modelField": "bxc_5DSHYG_modelField",
	"providerStatus": "bxc_5DSHYG_providerStatus",
	"iconButton": "bxc_5DSHYG_iconButton",
	"credentialInspect": "bxc_5DSHYG_credentialInspect",
	"addBlock": "bxc_5DSHYG_addBlock",
	"modelRow": "bxc_5DSHYG_modelRow",
	"vendorFields": "bxc_5DSHYG_vendorFields",
	"advancedHint": "bxc_5DSHYG_advancedHint",
	"secondaryButton": "bxc_5DSHYG_secondaryButton",
	"vendorWideField": "bxc_5DSHYG_vendorWideField",
	"rowHead": "bxc_5DSHYG_rowHead",
	"customized": "bxc_5DSHYG_customized",
	"credentialDot": "bxc_5DSHYG_credentialDot",
	"vendorDialog": "bxc_5DSHYG_vendorDialog",
	"section": "bxc_5DSHYG_section",
	"setupCard": "bxc_5DSHYG_setupCard",
	"iconButtonDanger": "bxc_5DSHYG_iconButtonDanger",
	"vendorToolbar": "bxc_5DSHYG_vendorToolbar",
	"linkButton": "bxc_5DSHYG_linkButton",
	"addActions": "bxc_5DSHYG_addActions",
	"credentialForm": "bxc_5DSHYG_credentialForm",
	"notice": "bxc_5DSHYG_notice",
	"dangerButton": "bxc_5DSHYG_dangerButton",
	"addCard": "bxc_5DSHYG_addCard",
	"modelCatalog": "bxc_5DSHYG_modelCatalog",
	"vendorConnection": "bxc_5DSHYG_vendorConnection",
	"modelEntry": "bxc_5DSHYG_modelEntry",
	"vendorMeta": "bxc_5DSHYG_vendorMeta",
	"deleteConfirm": "bxc_5DSHYG_deleteConfirm",
	"rowIdentity": "bxc_5DSHYG_rowIdentity",
	"candidateList": "bxc_5DSHYG_candidateList",
	"candidateId": "bxc_5DSHYG_candidateId",
	"vendorEditorActions": "bxc_5DSHYG_vendorEditorActions",
	"candidateEmpty": "bxc_5DSHYG_candidateEmpty"
};
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/EditorFooter.tsx
/**
* Render one provider card's action row.
* @param props - the labels, commit gating, and handlers the owning card supplies.
* @returns the cancel/commit row.
*/
function EditorFooter(props) {
	const { t } = props;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: ModelsSection_module_css_default["editorActions"],
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			type: "button",
			className: ModelsSection_module_css_default["secondaryButton"],
			disabled: props.busy,
			onClick: props.onCancel,
			children: t(props.cancelLabelKey ?? "cancel")
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			type: "button",
			className: ModelsSection_module_css_default["primaryButton"],
			disabled: props.submitDisabled,
			onClick: props.onSubmit,
			children: props.busy ? t(props.submitBusyLabelKey) : t(props.submitLabelKey)
		})]
	});
}
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/DeepSeekModelsEditor.tsx
/**
* Curated editor for the direct DeepSeek adapter's advisory model catalog.
* The settings layer replaces `models` as one array, so the parent supplies
* the effective inherited rows until the first edit materializes a user
* override; reset removes that override instead of copying defaults into it.
*/
/** Row index encoded in an editing-buffer key. */
function rowOf(key) {
	return Number(key.slice(0, key.indexOf(":")));
}
/** Accepted capacity spellings: a decimal count with an optional K/M suffix. */
const CAPACITY_PATTERN = /^(\d+(?:\.\d+)?)([km])?$/i;
/** Decimal suffix scales — `1M` is 1000K, matching how model capacities are quoted. */
const CAPACITY_SCALE = {
	k: 1e3,
	m: 1e6
};
/**
* Read a typed capacity, so a user can write `256K` or `1M` instead of counting
* zeroes. The stored value stays a plain token count.
* @param text - raw field text.
* @returns the count; `undefined` when blank (inherit), `NaN` when unreadable
* (rejected by {@link validateDeepSeekModels} before any write).
*/
function parseCapacity(text) {
	const trimmed = text.trim();
	if (trimmed.length === 0) return void 0;
	const match = CAPACITY_PATTERN.exec(trimmed);
	if (match === null) return NaN;
	const suffix = match[2]?.toLowerCase();
	const scale = suffix === "k" || suffix === "m" ? CAPACITY_SCALE[suffix] : 1;
	const scaled = Number(match[1]) * scale;
	const rounded = Math.round(scaled);
	return Math.abs(scaled - rounded) < 1e-6 ? rounded : scaled;
}
/**
* Spell a stored count back in the shortest form that survives a round trip
* through {@link parseCapacity}; a count that is not a whole number of
* thousands stays written out.
* @param value - stored capacity.
* @returns the field text.
*/
function formatCapacity(value) {
	if (!Number.isInteger(value) || value <= 0) return String(value);
	if (value % CAPACITY_SCALE.m === 0) return `${String(value / CAPACITY_SCALE.m)}M`;
	if (value % CAPACITY_SCALE.k === 0) return `${String(value / CAPACITY_SCALE.k)}K`;
	return String(value);
}
/** Convert a schema-validated catalog value into records without dropping hidden fields. */
function modelDrafts(value) {
	if (!Array.isArray(value)) return [];
	return value.map((entry) => typeof entry === "object" && entry !== null && !Array.isArray(entry) ? entry : {});
}
/**
* Validate adapter constraints that the serialized schema cannot express.
* @param value - user-owned `models` value, or undefined while inherited.
* @returns the first invalid row, or undefined when the adapter will accept it.
*/
function validateDeepSeekModels(value) {
	if (value === void 0) return void 0;
	const models = modelDrafts(value);
	const seen = /* @__PURE__ */ new Set();
	for (const [index, model] of models.entries()) {
		const id = model["id"];
		const trimmed = typeof id === "string" ? id.trim() : void 0;
		if (trimmed === void 0 || trimmed.length === 0) return {
			index,
			key: "modelIdRequired"
		};
		if (seen.has(trimmed)) return {
			index,
			key: "modelIdDuplicate"
		};
		seen.add(trimmed);
		const name = model["name"];
		if (name !== void 0 && (typeof name !== "string" || name.length === 0)) return {
			index,
			key: "modelNameInvalid"
		};
		const contextWindow = model["contextWindow"];
		if (contextWindow !== void 0 && (typeof contextWindow !== "number" || !Number.isInteger(contextWindow) || contextWindow <= 0)) return {
			index,
			key: "modelContextInvalid"
		};
		const maxTokens = model["maxTokens"];
		if (maxTokens !== void 0 && (typeof maxTokens !== "number" || !Number.isInteger(maxTokens) || maxTokens <= 0)) return {
			index,
			key: "modelMaxTokensInvalid"
		};
	}
}
/**
* Render the direct DeepSeek adapter's model catalog: id and display name on
* each row, capacities behind the row's own disclosure.
* @param props - effective rows plus the array-level override actions.
* @returns the catalog editor.
*/
function DeepSeekModelsEditor(props) {
	const [editing, setEditing] = (0, react.useState)(() => /* @__PURE__ */ new Map());
	const [expanded, setExpanded] = (0, react.useState)(() => /* @__PURE__ */ new Set());
	const update = (index, key, value) => {
		const next = props.models.map((model, at) => {
			const copy = { ...model };
			if (at !== index) return copy;
			if (value === void 0) Reflect.deleteProperty(copy, key);
			else copy[key] = value;
			return copy;
		});
		props.onChange(next);
	};
	const remove = (index) => {
		setEditing((current) => {
			const next = /* @__PURE__ */ new Map();
			for (const [key, text] of current) {
				const at = rowOf(key);
				if (at === index) continue;
				next.set(at > index ? key.replace(/^\d+/, String(at - 1)) : key, text);
			}
			return next;
		});
		setExpanded((current) => {
			const next = /* @__PURE__ */ new Set();
			for (const at of current) {
				if (at === index) continue;
				next.add(at > index ? at - 1 : at);
			}
			return next;
		});
		props.onChange(props.models.filter((_model, at) => at !== index).map((model) => ({ ...model })));
	};
	const reset = () => {
		setEditing(/* @__PURE__ */ new Map());
		setExpanded(/* @__PURE__ */ new Set());
		props.onReset();
	};
	const toggle = (index) => {
		setExpanded((current) => {
			const next = new Set(current);
			if (!next.delete(index)) next.add(index);
			return next;
		});
	};
	/** The field's text: its live keystrokes, else the stored count spelled short. */
	const capacityText = (model, index, field) => {
		const typed = editing.get(`${String(index)}:${field}`);
		if (typed !== void 0) return typed;
		const value = model[field];
		return typeof value === "number" ? formatCapacity(value) : "";
	};
	const settleCapacity = (index, field) => {
		const key = `${String(index)}:${field}`;
		const typed = editing.get(key);
		if (typed === void 0) return;
		const parsed = parseCapacity(typed);
		if (parsed !== void 0 && Number.isNaN(parsed)) return;
		setEditing((current) => {
			const next = new Map(current);
			next.delete(key);
			return next;
		});
	};
	/** One capacity field of one row, rendered inside the row's disclosure. */
	const capacityField = (model, index, field, fallback) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
		className: ModelsSection_module_css_default["modelField"],
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			className: ModelsSection_module_css_default["modelFieldLabel"],
			children: props.t(field === "contextWindow" ? "contextWindow" : "maxTokens")
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
			className: ModelsSection_module_css_default["input"],
			type: "text",
			inputMode: "numeric",
			value: capacityText(model, index, field),
			placeholder: fallback === void 0 ? props.t(field === "contextWindow" ? "contextWindowPlaceholder" : "maxTokensPlaceholder") : formatCapacity(fallback),
			"aria-label": `${props.t(field === "contextWindow" ? "contextWindow" : "maxTokens")} ${String(index + 1)}`,
			disabled: props.disabled,
			onChange: (event) => {
				const text = event.target.value;
				setEditing((current) => new Map(current).set(`${String(index)}:${field}`, text));
				update(index, field, parseCapacity(text));
			},
			onBlur: () => {
				settleCapacity(index, field);
			}
		})]
	});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
		className: ModelsSection_module_css_default["modelCatalog"],
		"aria-label": props.t("models"),
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["modelListHead"],
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: ModelsSection_module_css_default["modelCatalogHeading"],
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: ModelsSection_module_css_default["modelCatalogTitle"],
						children: props.t("models")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: ModelsSection_module_css_default["modelCatalogMeta"],
						children: props.overridden ? props.t("modelsCustomized") : props.t("modelsInherited")
					})]
				}), props.overridden ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: ModelsSection_module_css_default["linkButton"],
					disabled: props.disabled,
					onClick: reset,
					children: props.t("resetModels")
				}) : null]
			}),
			props.models.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: ModelsSection_module_css_default["modelEmpty"],
				children: props.t("modelsEmpty")
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: ModelsSection_module_css_default["modelList"],
				children: props.models.map((model, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: ModelsSection_module_css_default["modelEntry"],
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["modelRow"],
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: ModelsSection_module_css_default["input"],
								type: "text",
								value: typeof model["id"] === "string" ? model["id"] : "",
								placeholder: props.t("modelId"),
								"aria-label": `${props.t("modelId")} ${String(index + 1)}`,
								disabled: props.disabled,
								onChange: (event) => {
									update(index, "id", event.target.value);
								},
								onBlur: (event) => {
									const trimmed = event.target.value.trim();
									if (trimmed !== event.target.value) update(index, "id", trimmed);
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: ModelsSection_module_css_default["input"],
								type: "text",
								value: typeof model["name"] === "string" ? model["name"] : "",
								placeholder: props.t("modelName"),
								"aria-label": `${props.t("modelName")} ${String(index + 1)}`,
								disabled: props.disabled,
								onChange: (event) => {
									update(index, "name", event.target.value === "" ? void 0 : event.target.value);
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ModelsSection_module_css_default["iconButton"],
								"aria-label": `${props.t("modelAdvanced")} ${String(index + 1)}`,
								"aria-expanded": expanded.has(index),
								title: props.t("modelAdvanced"),
								onClick: () => {
									toggle(index);
								},
								children: expanded.has(index) ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronDownOutline14, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronRightOutline14, {})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: `${ModelsSection_module_css_default["iconButton"]} ${ModelsSection_module_css_default["iconButtonDanger"]}`,
								"aria-label": `${props.t("removeModel")} ${String(index + 1)}`,
								title: props.t("removeModel"),
								disabled: props.disabled,
								onClick: () => {
									remove(index);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconTrashOutline16, { size: 14 })
							})
						]
					}), expanded.has(index) ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["modelAdvanced"],
						children: [capacityField(model, index, "contextWindow", props.defaultContextWindow), capacityField(model, index, "maxTokens", props.defaultMaxTokens)]
					}) : null]
				}, index))
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: ModelsSection_module_css_default["addModelButton"],
				disabled: props.disabled,
				onClick: () => {
					props.onChange([...props.models.map((model) => ({ ...model })), { id: "" }]);
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconPlusOutline16, { size: 14 }), props.t("addModel")]
			})
		]
	});
}
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/ModelListEditor.tsx
/**
* The model list of one pi-ai provider profile, plus the action that asks the
* provider what it serves.
*
* The list is the profile's `models` array as the card holds it: an empty list
* means "serve this route's built-in catalog", and any entry replaces that
* catalog, so a row is only ever added deliberately. Fetching asks the endpoint
* **the form currently shows** — including a key typed but not yet saved — so
* adding a provider is one pass instead of save-then-return; the reply is
* candidates the user picks from, never configuration written behind them.
*
* A provider that cannot be interrogated (an unreachable endpoint, a protocol
* with no readable listing) is not a dead end: the failure is shown next to the
* rows the user can still fill in by hand.
*/
/** A row's text field, or the empty string when unset or not a string. */
function textOf(model, key) {
	const value = model[key];
	return typeof value === "string" ? value : "";
}
/** A row's numeric field, or `undefined` when unset or not a number. */
function numberOf(model, key) {
	const value = model[key];
	return typeof value === "number" ? value : void 0;
}
/** Disclosure chevron; rotates to point down while its row is open. */
function IconChevron({ open }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
		width: "14",
		height: "14",
		viewBox: "0 0 16 16",
		fill: "none",
		"aria-hidden": true,
		style: {
			transform: open ? "rotate(90deg)" : void 0,
			transition: "transform 120ms ease"
		},
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
			d: "M6 3.5L10.5 8L6 12.5",
			stroke: "currentColor",
			strokeWidth: "1.5",
			strokeLinecap: "round",
			strokeLinejoin: "round"
		})
	});
}
/** Removal glyph for one model row. */
function IconTrash() {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
		width: "14",
		height: "14",
		viewBox: "0 0 16 16",
		fill: "none",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
			d: "M2.5 4h11M6.5 4V2.5h3V4M4 4l.7 9a1 1 0 001 .9h4.6a1 1 0 001-.9L12 4M6.5 6.8v4.4M9.5 6.8v4.4",
			stroke: "currentColor",
			strokeWidth: "1.3",
			strokeLinecap: "round",
			strokeLinejoin: "round"
		})
	});
}
/**
* What an empty capacity field is worth, shown as its placeholder so a row left
* blank does not read as a model with no capacity at all.
*
* The magnitudes are the adapter's own route-level fallbacks (`llm-pi-ai`'s
* `defaultContextWindow` and `defaultMaxTokens`), spelled the way a person
* would say them. They are a hint, not a mirror: this page counts `K` as 1000,
* so typing `256K` stores 256000 while leaving the field blank keeps the
* adapter's 262144. A deployment that overrides those defaults is not
* reflected here — nothing on this page can read them.
*/
const CAPACITY_HINT = {
	contextWindow: "256K",
	maxTokens: "32K"
};
/**
* Spell a stored count for a field that may be unset. The spelling itself is
* {@link formatCapacity}, shared with the DeepSeek catalog editor so both
* surfaces read and write one K/M vocabulary.
* @param value - stored capacity, or `undefined` for an unset field.
* @returns the field text, empty when unset.
*/
function capacitySpelling(value) {
	return value === void 0 ? "" : formatCapacity(value);
}
/** Adopt a candidate, keeping whatever capacities the provider disclosed. */
function adopt(candidate) {
	return {
		id: candidate.id,
		...candidate.name === void 0 ? {} : { name: candidate.name },
		...candidate.contextWindow === void 0 ? {} : { contextWindow: candidate.contextWindow },
		...candidate.maxTokens === void 0 ? {} : { maxTokens: candidate.maxTokens }
	};
}
/**
* Render the model list with its fetch action.
* @param props - the drafted rows, probe target, wire face, and copy.
* @returns the model-list editor.
*/
function ModelListEditor(props) {
	const { models, onChange, probe, operations, t, disabled } = props;
	const [busy, setBusy] = (0, react.useState)(false);
	const [failure, setFailure] = (0, react.useState)(void 0);
	const [candidates, setCandidates] = (0, react.useState)(void 0);
	const [picked, setPicked] = (0, react.useState)(/* @__PURE__ */ new Set());
	const [candidateQuery, setCandidateQuery] = (0, react.useState)("");
	const [expanded, setExpanded] = (0, react.useState)(/* @__PURE__ */ new Set());
	const [editing, setEditing] = (0, react.useState)(/* @__PURE__ */ new Map());
	/** Buffer key for one capacity field; the row half moves when rows do. */
	const bufferKey = (index, field) => `${String(index)}:${field}`;
	const editCapacity = (index, field, text) => {
		setEditing((current) => new Map(current).set(bufferKey(index, field), text));
		patch(index, { [field]: parseCapacity(text) });
	};
	/** What a capacity field shows: the buffer while typing, else the stored count. */
	const capacityText = (model, index, field) => editing.get(bufferKey(index, field)) ?? capacitySpelling(numberOf(model, field));
	/** Drop one row's entries and shift the rows after it down, in one pass. */
	const reindexOnRemove = (current, index) => {
		const next = /* @__PURE__ */ new Map();
		for (const [key, value] of current) {
			const at = Number(key.slice(0, key.indexOf(":")));
			if (at === index) continue;
			next.set(at > index ? key.replace(/^\d+/, String(at - 1)) : key, value);
		}
		return next;
	};
	const toggleExpanded = (index) => {
		setExpanded((current) => {
			const next = new Set(current);
			if (!next.delete(index)) next.add(index);
			return next;
		});
	};
	const patch = (index, next) => {
		onChange(models.map((model, at) => {
			if (at !== index) return model;
			const cleared = new Set(Object.entries(next).filter(([, value]) => value === void 0 || value === "").map(([key]) => key));
			return Object.fromEntries(Object.entries({
				...model,
				...next
			}).filter(([key]) => !cleared.has(key)));
		}));
	};
	const fetchModels = async () => {
		setBusy(true);
		setFailure(void 0);
		try {
			const answer = await operations.discoverModels(probe.settingsNs, {
				...probe.provider === void 0 ? {} : { provider: probe.provider },
				...probe.baseURL === void 0 || probe.baseURL.length === 0 ? {} : { baseURL: probe.baseURL },
				...probe.api === void 0 ? {} : { api: probe.api },
				...probe.apiKey === void 0 ? {} : { apiKey: probe.apiKey }
			});
			if (answer.kind === "refused") {
				setFailure(answer.message);
				return;
			}
			const found = answer.models;
			if (found.length === 0) {
				setFailure(t("fetchEmpty"));
				return;
			}
			const known = new Set(models.map((model) => textOf(model, "id")));
			setCandidateQuery("");
			setCandidates(found);
			setPicked(new Set(found.filter((model) => !known.has(model.id)).map((model) => model.id)));
		} finally {
			setBusy(false);
		}
	};
	const closePicker = () => {
		setCandidates(void 0);
		setPicked(/* @__PURE__ */ new Set());
		setCandidateQuery("");
	};
	const adoptPicked = () => {
		/* v8 ignore next -- the dialog only renders with candidates loaded */
		if (candidates === void 0) return;
		const byId = new Map(models.map((model) => [textOf(model, "id"), model]));
		for (const candidate of candidates) {
			if (!picked.has(candidate.id)) continue;
			byId.set(candidate.id, byId.get(candidate.id) ?? adopt(candidate));
		}
		onChange([...byId.values()]);
		closePicker();
	};
	const toggle = (id) => {
		setPicked((current) => {
			const next = new Set(current);
			if (!next.delete(id)) next.add(id);
			return next;
		});
	};
	const activeCandidates = candidates ?? [];
	const normalizedCandidateQuery = candidateQuery.trim().toLowerCase();
	const visibleCandidates = normalizedCandidateQuery.length === 0 ? activeCandidates : activeCandidates.filter((candidate) => candidate.id.toLowerCase().includes(normalizedCandidateQuery) || candidate.name?.toLowerCase().includes(normalizedCandidateQuery) === true);
	const allVisibleCandidatesPicked = visibleCandidates.length > 0 && visibleCandidates.every((candidate) => picked.has(candidate.id));
	const toggleVisibleCandidates = () => {
		setPicked((current) => {
			if (visibleCandidates.every((candidate) => current.has(candidate.id))) return /* @__PURE__ */ new Set();
			const next = new Set(current);
			for (const candidate of visibleCandidates) next.add(candidate.id);
			return next;
		});
	};
	const askable = probe.provider !== void 0 || probe.baseURL !== void 0 && probe.baseURL.length > 0;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
		className: ModelsSection_module_css_default["modelCatalog"],
		"aria-label": t("models"),
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["modelListHead"],
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["modelCatalogHeading"],
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["modelCatalogTitle"],
							children: t("models")
						}), props.overridden === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["modelCatalogMeta"],
							children: props.overridden ? t("modelsCustomized") : t("modelsInherited")
						})]
					}),
					props.overridden === true && props.onReset !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: ModelsSection_module_css_default["linkButton"],
						disabled,
						onClick: props.onReset,
						children: t("resetModels")
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: ModelsSection_module_css_default["linkButton"],
						disabled: disabled || busy || !askable || props.probeBlocked !== void 0,
						title: props.probeBlocked !== void 0 ? t(props.probeBlocked) : askable ? void 0 : t("fetchNeedsBaseUrl"),
						onClick: () => {
							fetchModels();
						},
						children: busy ? t("fetching") : t("fetchModels")
					})
				]
			}),
			models.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: ModelsSection_module_css_default["modelEmpty"],
				children: t("modelsEmpty")
			}) : null,
			models.map((model, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["modelEntry"],
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: ModelsSection_module_css_default["modelRow"],
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: ModelsSection_module_css_default["input"],
							type: "text",
							value: textOf(model, "id"),
							placeholder: t("modelId"),
							"aria-label": `${t("modelId")} ${index + 1}`,
							disabled,
							onChange: (event) => {
								patch(index, { id: event.target.value });
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: ModelsSection_module_css_default["input"],
							type: "text",
							value: textOf(model, "name"),
							placeholder: t("modelName"),
							"aria-label": `${t("modelName")} ${index + 1}`,
							disabled,
							onChange: (event) => {
								patch(index, { name: event.target.value === "" ? void 0 : event.target.value });
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ModelsSection_module_css_default["iconButton"],
							"aria-label": `${t("modelAdvanced")} ${index + 1}`,
							"aria-expanded": expanded.has(index),
							title: t("modelAdvanced"),
							onClick: () => {
								toggleExpanded(index);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevron, { open: expanded.has(index) })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: `${ModelsSection_module_css_default["iconButton"]} ${ModelsSection_module_css_default["iconButtonDanger"]}`,
							"aria-label": `${t("removeModel")} ${index + 1}`,
							title: t("removeModel"),
							disabled,
							onClick: () => {
								onChange(models.filter((_model, at) => at !== index));
								setExpanded((current) => {
									const next = /* @__PURE__ */ new Set();
									for (const at of current) if (at < index) next.add(at);
									else if (at > index) next.add(at - 1);
									return next;
								});
								setEditing((current) => reindexOnRemove(current, index));
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconTrash, {})
						})
					]
				}), expanded.has(index) ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: ModelsSection_module_css_default["modelAdvanced"],
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: ModelsSection_module_css_default["modelField"],
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["modelFieldLabel"],
							children: t("modelContextWindow")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: ModelsSection_module_css_default["input"],
							type: "text",
							inputMode: "numeric",
							value: capacityText(model, index, "contextWindow"),
							placeholder: CAPACITY_HINT.contextWindow,
							"aria-label": `${t("modelContextWindow")} ${index + 1}`,
							disabled,
							onChange: (event) => {
								editCapacity(index, "contextWindow", event.target.value);
							}
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: ModelsSection_module_css_default["modelField"],
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["modelFieldLabel"],
							children: t("modelMaxTokens")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: ModelsSection_module_css_default["input"],
							type: "text",
							inputMode: "numeric",
							value: capacityText(model, index, "maxTokens"),
							placeholder: CAPACITY_HINT.maxTokens,
							"aria-label": `${t("modelMaxTokens")} ${index + 1}`,
							disabled,
							onChange: (event) => {
								editCapacity(index, "maxTokens", event.target.value);
							}
						})]
					})]
				}) : null]
			}, index)),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: ModelsSection_module_css_default["addModelButton"],
				disabled,
				onClick: () => {
					onChange([...models, { id: "" }]);
				},
				children: t("addModel")
			}),
			failure !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: ModelsSection_module_css_default["error"],
				children: failure
			}) : null,
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Modal$2, {
				open: candidates !== void 0,
				onClose: closePicker,
				title: t("fetchTitle"),
				closeLabel: t("close"),
				description: t("fetchDescription"),
				className: ModelsSection_module_css_default["fetchDialog"],
				footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: closePicker,
					children: t("cancel")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: adoptPicked,
					children: t("fetchAdopt")
				})] }),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: ModelsSection_module_css_default["candidateToolbar"],
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						className: `${ModelsSection_module_css_default["input"]} ${ModelsSection_module_css_default["candidateSearch"]}`,
						type: "search",
						value: candidateQuery,
						placeholder: t("fetchSearch"),
						"aria-label": t("fetchSearch"),
						onChange: (event) => {
							setCandidateQuery(event.target.value);
						}
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						disabled: visibleCandidates.length === 0,
						onClick: toggleVisibleCandidates,
						children: t(allVisibleCandidatesPicked ? "fetchDeselectAll" : "fetchSelectAll")
					})]
				}), visibleCandidates.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: ModelsSection_module_css_default["candidateEmpty"],
					role: "status",
					children: t("fetchNoMatches")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
					className: ModelsSection_module_css_default["candidateList"],
					children: visibleCandidates.map((candidate) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
						className: ModelsSection_module_css_default["candidate"],
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: ModelsSection_module_css_default["candidateLabel"],
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: picked.has(candidate.id),
								onChange: () => {
									toggle(candidate.id);
								}
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: ModelsSection_module_css_default["candidateId"],
								children: candidate.id
							})]
						})
					}, candidate.id))
				})]
			})
		]
	});
}
//#endregion
//#region node_modules/zustand/esm/vanilla.mjs
const createStoreImpl = (createState) => {
	let state;
	const listeners = /* @__PURE__ */ new Set();
	const setState = (partial, replace) => {
		const nextState = typeof partial === "function" ? partial(state) : partial;
		if (!Object.is(nextState, state)) {
			const previousState = state;
			state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
			listeners.forEach((listener) => listener(state, previousState));
		}
	};
	const getState = () => state;
	const subscribe = (listener) => {
		listeners.add(listener);
		return () => listeners.delete(listener);
	};
	const destroy = () => {
		if ({ "MODE": "production" }.MODE !== "production") console.warn("[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected.");
		listeners.clear();
	};
	const api = {
		setState,
		getState,
		subscribe,
		destroy
	};
	state = createState(setState, getState, api);
	return api;
};
const createStore = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;
//#endregion
//#region node_modules/zustand/esm/middleware.mjs
const subscribeWithSelectorImpl = (fn) => (set, get, api) => {
	const origSubscribe = api.subscribe;
	api.subscribe = (selector, optListener, options) => {
		let listener = selector;
		if (optListener) {
			const equalityFn = (options == null ? void 0 : options.equalityFn) || Object.is;
			let currentSlice = selector(api.getState());
			listener = (state) => {
				const nextSlice = selector(state);
				if (!equalityFn(currentSlice, nextSlice)) {
					const previousSlice = currentSlice;
					optListener(currentSlice = nextSlice, previousSlice);
				}
			};
			if (options == null ? void 0 : options.fireImmediately) optListener(currentSlice, currentSlice);
		}
		return origSubscribe(listener);
	};
	return fn(set, get, api);
};
const subscribeWithSelector = subscribeWithSelectorImpl;
//#endregion
//#region node_modules/immer/dist/immer.mjs
var NOTHING = Symbol.for("immer-nothing");
var DRAFTABLE = Symbol.for("immer-draftable");
var DRAFT_STATE = Symbol.for("immer-state");
function die(error, ...args) {
	throw new Error(`[Immer] minified error nr: ${error}. Full error at: https://bit.ly/3cXEKWf`);
}
var getPrototypeOf = Object.getPrototypeOf;
function isDraft(value) {
	return !!value && !!value[DRAFT_STATE];
}
function isDraftable(value) {
	if (!value) return false;
	return isPlainObject(value) || Array.isArray(value) || !!value[DRAFTABLE] || !!value.constructor?.[DRAFTABLE] || isMap(value) || isSet(value);
}
var objectCtorString = Object.prototype.constructor.toString();
var cachedCtorStrings = /* @__PURE__ */ new WeakMap();
function isPlainObject(value) {
	if (!value || typeof value !== "object") return false;
	const proto = Object.getPrototypeOf(value);
	if (proto === null || proto === Object.prototype) return true;
	const Ctor = Object.hasOwnProperty.call(proto, "constructor") && proto.constructor;
	if (Ctor === Object) return true;
	if (typeof Ctor !== "function") return false;
	let ctorString = cachedCtorStrings.get(Ctor);
	if (ctorString === void 0) {
		ctorString = Function.toString.call(Ctor);
		cachedCtorStrings.set(Ctor, ctorString);
	}
	return ctorString === objectCtorString;
}
function each(obj, iter, strict = true) {
	if (getArchtype(obj) === 0) (strict ? Reflect.ownKeys(obj) : Object.keys(obj)).forEach((key) => {
		iter(key, obj[key], obj);
	});
	else obj.forEach((entry, index) => iter(index, entry, obj));
}
function getArchtype(thing) {
	const state = thing[DRAFT_STATE];
	return state ? state.type_ : Array.isArray(thing) ? 1 : isMap(thing) ? 2 : isSet(thing) ? 3 : 0;
}
function has(thing, prop) {
	return getArchtype(thing) === 2 ? thing.has(prop) : Object.prototype.hasOwnProperty.call(thing, prop);
}
function set(thing, propOrOldValue, value) {
	const t = getArchtype(thing);
	if (t === 2) thing.set(propOrOldValue, value);
	else if (t === 3) thing.add(value);
	else thing[propOrOldValue] = value;
}
function is(x, y) {
	if (x === y) return x !== 0 || 1 / x === 1 / y;
	else return x !== x && y !== y;
}
function isMap(target) {
	return target instanceof Map;
}
function isSet(target) {
	return target instanceof Set;
}
function latest(state) {
	return state.copy_ || state.base_;
}
function shallowCopy(base, strict) {
	if (isMap(base)) return new Map(base);
	if (isSet(base)) return new Set(base);
	if (Array.isArray(base)) return Array.prototype.slice.call(base);
	const isPlain = isPlainObject(base);
	if (strict === true || strict === "class_only" && !isPlain) {
		const descriptors = Object.getOwnPropertyDescriptors(base);
		delete descriptors[DRAFT_STATE];
		let keys = Reflect.ownKeys(descriptors);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const desc = descriptors[key];
			if (desc.writable === false) {
				desc.writable = true;
				desc.configurable = true;
			}
			if (desc.get || desc.set) descriptors[key] = {
				configurable: true,
				writable: true,
				enumerable: desc.enumerable,
				value: base[key]
			};
		}
		return Object.create(getPrototypeOf(base), descriptors);
	} else {
		const proto = getPrototypeOf(base);
		if (proto !== null && isPlain) return { ...base };
		const obj = Object.create(proto);
		return Object.assign(obj, base);
	}
}
function freeze(obj, deep = false) {
	if (isFrozen(obj) || isDraft(obj) || !isDraftable(obj)) return obj;
	if (getArchtype(obj) > 1) Object.defineProperties(obj, {
		set: dontMutateMethodOverride,
		add: dontMutateMethodOverride,
		clear: dontMutateMethodOverride,
		delete: dontMutateMethodOverride
	});
	Object.freeze(obj);
	if (deep) Object.values(obj).forEach((value) => freeze(value, true));
	return obj;
}
function dontMutateFrozenCollections() {
	die(2);
}
var dontMutateMethodOverride = { value: dontMutateFrozenCollections };
function isFrozen(obj) {
	if (obj === null || typeof obj !== "object") return true;
	return Object.isFrozen(obj);
}
var plugins = {};
function getPlugin(pluginKey) {
	const plugin = plugins[pluginKey];
	if (!plugin) die(0, pluginKey);
	return plugin;
}
var currentScope;
function getCurrentScope() {
	return currentScope;
}
function createScope(parent_, immer_) {
	return {
		drafts_: [],
		parent_,
		immer_,
		canAutoFreeze_: true,
		unfinalizedDrafts_: 0
	};
}
function usePatchesInScope(scope, patchListener) {
	if (patchListener) {
		getPlugin("Patches");
		scope.patches_ = [];
		scope.inversePatches_ = [];
		scope.patchListener_ = patchListener;
	}
}
function revokeScope(scope) {
	leaveScope(scope);
	scope.drafts_.forEach(revokeDraft);
	scope.drafts_ = null;
}
function leaveScope(scope) {
	if (scope === currentScope) currentScope = scope.parent_;
}
function enterScope(immer2) {
	return currentScope = createScope(currentScope, immer2);
}
function revokeDraft(draft) {
	const state = draft[DRAFT_STATE];
	if (state.type_ === 0 || state.type_ === 1) state.revoke_();
	else state.revoked_ = true;
}
function processResult(result, scope) {
	scope.unfinalizedDrafts_ = scope.drafts_.length;
	const baseDraft = scope.drafts_[0];
	if (result !== void 0 && result !== baseDraft) {
		if (baseDraft[DRAFT_STATE].modified_) {
			revokeScope(scope);
			die(4);
		}
		if (isDraftable(result)) {
			result = finalize(scope, result);
			if (!scope.parent_) maybeFreeze(scope, result);
		}
		if (scope.patches_) getPlugin("Patches").generateReplacementPatches_(baseDraft[DRAFT_STATE].base_, result, scope.patches_, scope.inversePatches_);
	} else result = finalize(scope, baseDraft, []);
	revokeScope(scope);
	if (scope.patches_) scope.patchListener_(scope.patches_, scope.inversePatches_);
	return result !== NOTHING ? result : void 0;
}
function finalize(rootScope, value, path) {
	if (isFrozen(value)) return value;
	const useStrictIteration = rootScope.immer_.shouldUseStrictIteration();
	const state = value[DRAFT_STATE];
	if (!state) {
		each(value, (key, childValue) => finalizeProperty(rootScope, state, value, key, childValue, path), useStrictIteration);
		return value;
	}
	if (state.scope_ !== rootScope) return value;
	if (!state.modified_) {
		maybeFreeze(rootScope, state.base_, true);
		return state.base_;
	}
	if (!state.finalized_) {
		state.finalized_ = true;
		state.scope_.unfinalizedDrafts_--;
		const result = state.copy_;
		let resultEach = result;
		let isSet2 = false;
		if (state.type_ === 3) {
			resultEach = new Set(result);
			result.clear();
			isSet2 = true;
		}
		each(resultEach, (key, childValue) => finalizeProperty(rootScope, state, result, key, childValue, path, isSet2), useStrictIteration);
		maybeFreeze(rootScope, result, false);
		if (path && rootScope.patches_) getPlugin("Patches").generatePatches_(state, path, rootScope.patches_, rootScope.inversePatches_);
	}
	return state.copy_;
}
function finalizeProperty(rootScope, parentState, targetObject, prop, childValue, rootPath, targetIsSet) {
	if (childValue == null) return;
	if (typeof childValue !== "object" && !targetIsSet) return;
	const childIsFrozen = isFrozen(childValue);
	if (childIsFrozen && !targetIsSet) return;
	if (isDraft(childValue)) {
		const res = finalize(rootScope, childValue, rootPath && parentState && parentState.type_ !== 3 && !has(parentState.assigned_, prop) ? rootPath.concat(prop) : void 0);
		set(targetObject, prop, res);
		if (isDraft(res)) rootScope.canAutoFreeze_ = false;
		else return;
	} else if (targetIsSet) targetObject.add(childValue);
	if (isDraftable(childValue) && !childIsFrozen) {
		if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) return;
		if (parentState && parentState.base_ && parentState.base_[prop] === childValue && childIsFrozen) return;
		finalize(rootScope, childValue);
		if ((!parentState || !parentState.scope_.parent_) && typeof prop !== "symbol" && (isMap(targetObject) ? targetObject.has(prop) : Object.prototype.propertyIsEnumerable.call(targetObject, prop))) maybeFreeze(rootScope, childValue);
	}
}
function maybeFreeze(scope, value, deep = false) {
	if (!scope.parent_ && scope.immer_.autoFreeze_ && scope.canAutoFreeze_) freeze(value, deep);
}
function createProxyProxy(base, parent) {
	const isArray = Array.isArray(base);
	const state = {
		type_: isArray ? 1 : 0,
		scope_: parent ? parent.scope_ : getCurrentScope(),
		modified_: false,
		finalized_: false,
		assigned_: {},
		parent_: parent,
		base_: base,
		draft_: null,
		copy_: null,
		revoke_: null,
		isManual_: false
	};
	let target = state;
	let traps = objectTraps;
	if (isArray) {
		target = [state];
		traps = arrayTraps;
	}
	const { revoke, proxy } = Proxy.revocable(target, traps);
	state.draft_ = proxy;
	state.revoke_ = revoke;
	return proxy;
}
var objectTraps = {
	get(state, prop) {
		if (prop === DRAFT_STATE) return state;
		const source = latest(state);
		if (!has(source, prop)) return readPropFromProto(state, source, prop);
		const value = source[prop];
		if (state.finalized_ || !isDraftable(value)) return value;
		if (value === peek(state.base_, prop)) {
			prepareCopy(state);
			return state.copy_[prop] = createProxy(value, state);
		}
		return value;
	},
	has(state, prop) {
		return prop in latest(state);
	},
	ownKeys(state) {
		return Reflect.ownKeys(latest(state));
	},
	set(state, prop, value) {
		const desc = getDescriptorFromProto(latest(state), prop);
		if (desc?.set) {
			desc.set.call(state.draft_, value);
			return true;
		}
		if (!state.modified_) {
			const current2 = peek(latest(state), prop);
			const currentState = current2?.[DRAFT_STATE];
			if (currentState && currentState.base_ === value) {
				state.copy_[prop] = value;
				state.assigned_[prop] = false;
				return true;
			}
			if (is(value, current2) && (value !== void 0 || has(state.base_, prop))) return true;
			prepareCopy(state);
			markChanged(state);
		}
		if (state.copy_[prop] === value && (value !== void 0 || prop in state.copy_) || Number.isNaN(value) && Number.isNaN(state.copy_[prop])) return true;
		state.copy_[prop] = value;
		state.assigned_[prop] = true;
		return true;
	},
	deleteProperty(state, prop) {
		if (peek(state.base_, prop) !== void 0 || prop in state.base_) {
			state.assigned_[prop] = false;
			prepareCopy(state);
			markChanged(state);
		} else delete state.assigned_[prop];
		if (state.copy_) delete state.copy_[prop];
		return true;
	},
	getOwnPropertyDescriptor(state, prop) {
		const owner = latest(state);
		const desc = Reflect.getOwnPropertyDescriptor(owner, prop);
		if (!desc) return desc;
		return {
			writable: true,
			configurable: state.type_ !== 1 || prop !== "length",
			enumerable: desc.enumerable,
			value: owner[prop]
		};
	},
	defineProperty() {
		die(11);
	},
	getPrototypeOf(state) {
		return getPrototypeOf(state.base_);
	},
	setPrototypeOf() {
		die(12);
	}
};
var arrayTraps = {};
each(objectTraps, (key, fn) => {
	arrayTraps[key] = function() {
		arguments[0] = arguments[0][0];
		return fn.apply(this, arguments);
	};
});
arrayTraps.deleteProperty = function(state, prop) {
	return arrayTraps.set.call(this, state, prop, void 0);
};
arrayTraps.set = function(state, prop, value) {
	return objectTraps.set.call(this, state[0], prop, value, state[0]);
};
function peek(draft, prop) {
	const state = draft[DRAFT_STATE];
	return (state ? latest(state) : draft)[prop];
}
function readPropFromProto(state, source, prop) {
	const desc = getDescriptorFromProto(source, prop);
	return desc ? `value` in desc ? desc.value : desc.get?.call(state.draft_) : void 0;
}
function getDescriptorFromProto(source, prop) {
	if (!(prop in source)) return void 0;
	let proto = getPrototypeOf(source);
	while (proto) {
		const desc = Object.getOwnPropertyDescriptor(proto, prop);
		if (desc) return desc;
		proto = getPrototypeOf(proto);
	}
}
function markChanged(state) {
	if (!state.modified_) {
		state.modified_ = true;
		if (state.parent_) markChanged(state.parent_);
	}
}
function prepareCopy(state) {
	if (!state.copy_) state.copy_ = shallowCopy(state.base_, state.scope_.immer_.useStrictShallowCopy_);
}
var Immer2 = class {
	constructor(config) {
		this.autoFreeze_ = true;
		this.useStrictShallowCopy_ = false;
		this.useStrictIteration_ = true;
		/**
		* The `produce` function takes a value and a "recipe function" (whose
		* return value often depends on the base state). The recipe function is
		* free to mutate its first argument however it wants. All mutations are
		* only ever applied to a __copy__ of the base state.
		*
		* Pass only a function to create a "curried producer" which relieves you
		* from passing the recipe function every time.
		*
		* Only plain objects and arrays are made mutable. All other objects are
		* considered uncopyable.
		*
		* Note: This function is __bound__ to its `Immer` instance.
		*
		* @param {any} base - the initial state
		* @param {Function} recipe - function that receives a proxy of the base state as first argument and which can be freely modified
		* @param {Function} patchListener - optional function that will be called with all the patches produced here
		* @returns {any} a new state, or the initial state if nothing was modified
		*/
		this.produce = (base, recipe, patchListener) => {
			if (typeof base === "function" && typeof recipe !== "function") {
				const defaultBase = recipe;
				recipe = base;
				const self = this;
				return function curriedProduce(base2 = defaultBase, ...args) {
					return self.produce(base2, (draft) => recipe.call(this, draft, ...args));
				};
			}
			if (typeof recipe !== "function") die(6);
			if (patchListener !== void 0 && typeof patchListener !== "function") die(7);
			let result;
			if (isDraftable(base)) {
				const scope = enterScope(this);
				const proxy = createProxy(base, void 0);
				let hasError = true;
				try {
					result = recipe(proxy);
					hasError = false;
				} finally {
					if (hasError) revokeScope(scope);
					else leaveScope(scope);
				}
				usePatchesInScope(scope, patchListener);
				return processResult(result, scope);
			} else if (!base || typeof base !== "object") {
				result = recipe(base);
				if (result === void 0) result = base;
				if (result === NOTHING) result = void 0;
				if (this.autoFreeze_) freeze(result, true);
				if (patchListener) {
					const p = [];
					const ip = [];
					getPlugin("Patches").generateReplacementPatches_(base, result, p, ip);
					patchListener(p, ip);
				}
				return result;
			} else die(1, base);
		};
		this.produceWithPatches = (base, recipe) => {
			if (typeof base === "function") return (state, ...args) => this.produceWithPatches(state, (draft) => base(draft, ...args));
			let patches, inversePatches;
			return [
				this.produce(base, recipe, (p, ip) => {
					patches = p;
					inversePatches = ip;
				}),
				patches,
				inversePatches
			];
		};
		if (typeof config?.autoFreeze === "boolean") this.setAutoFreeze(config.autoFreeze);
		if (typeof config?.useStrictShallowCopy === "boolean") this.setUseStrictShallowCopy(config.useStrictShallowCopy);
		if (typeof config?.useStrictIteration === "boolean") this.setUseStrictIteration(config.useStrictIteration);
	}
	createDraft(base) {
		if (!isDraftable(base)) die(8);
		if (isDraft(base)) base = current(base);
		const scope = enterScope(this);
		const proxy = createProxy(base, void 0);
		proxy[DRAFT_STATE].isManual_ = true;
		leaveScope(scope);
		return proxy;
	}
	finishDraft(draft, patchListener) {
		const state = draft && draft[DRAFT_STATE];
		if (!state || !state.isManual_) die(9);
		const { scope_: scope } = state;
		usePatchesInScope(scope, patchListener);
		return processResult(void 0, scope);
	}
	/**
	* Pass true to automatically freeze all copies created by Immer.
	*
	* By default, auto-freezing is enabled.
	*/
	setAutoFreeze(value) {
		this.autoFreeze_ = value;
	}
	/**
	* Pass true to enable strict shallow copy.
	*
	* By default, immer does not copy the object descriptors such as getter, setter and non-enumrable properties.
	*/
	setUseStrictShallowCopy(value) {
		this.useStrictShallowCopy_ = value;
	}
	/**
	* Pass false to use faster iteration that skips non-enumerable properties
	* but still handles symbols for compatibility.
	*
	* By default, strict iteration is enabled (includes all own properties).
	*/
	setUseStrictIteration(value) {
		this.useStrictIteration_ = value;
	}
	shouldUseStrictIteration() {
		return this.useStrictIteration_;
	}
	applyPatches(base, patches) {
		let i;
		for (i = patches.length - 1; i >= 0; i--) {
			const patch = patches[i];
			if (patch.path.length === 0 && patch.op === "replace") {
				base = patch.value;
				break;
			}
		}
		if (i > -1) patches = patches.slice(i + 1);
		const applyPatchesImpl = getPlugin("Patches").applyPatches_;
		if (isDraft(base)) return applyPatchesImpl(base, patches);
		return this.produce(base, (draft) => applyPatchesImpl(draft, patches));
	}
};
function createProxy(value, parent) {
	const draft = isMap(value) ? getPlugin("MapSet").proxyMap_(value, parent) : isSet(value) ? getPlugin("MapSet").proxySet_(value, parent) : createProxyProxy(value, parent);
	(parent ? parent.scope_ : getCurrentScope()).drafts_.push(draft);
	return draft;
}
function current(value) {
	if (!isDraft(value)) die(10, value);
	return currentImpl(value);
}
function currentImpl(value) {
	if (!isDraftable(value) || isFrozen(value)) return value;
	const state = value[DRAFT_STATE];
	let copy;
	let strict = true;
	if (state) {
		if (!state.modified_) return state.base_;
		state.finalized_ = true;
		copy = shallowCopy(value, state.scope_.immer_.useStrictShallowCopy_);
		strict = state.scope_.immer_.shouldUseStrictIteration();
	} else copy = shallowCopy(value, true);
	each(copy, (key, childValue) => {
		set(copy, key, currentImpl(childValue));
	}, strict);
	if (state) state.finalized_ = false;
	return copy;
}
var produce = new Immer2().produce;
//#endregion
//#region dev/shared/console/packages/client/store/lib/index.js
/**
* React-free snapshot store engine (zustand vanilla + immer + subscribeWithSelector +
* rafFlush middleware + opt-in persist + dev freeze) plus the declarative
* shell over it: {@link defineStore} bakes an init/persist/actions literal
* into a {@link StoreHandle}, the registration-side store seat of slot
* terminals. Engine products are bare observables — subscribe/getSnapshot/
* update/set, NO selector hook. Hook synthesis is ui-renderer's (the one
* uSES bridge, cached per source at the binding site).
*/
/**
* Notify an observer set without allowing one callback to starve the rest.
* @param listeners - current observer callbacks; copied before dispatch.
* @param label - diagnostic owner prefix.
* @param args - callback arguments.
*/
function notifySubscribers(listeners, label, ...args) {
	for (const listener of [...listeners]) try {
		listener(...args);
	} catch (error) {
		console.error(`${label} subscriber failed:`, error);
	}
}
/** Batches subscriber notification into one flush per animation frame. */
function rafBatch(notify) {
	const schedule = typeof requestAnimationFrame === "function" ? (fn) => {
		requestAnimationFrame(() => {
			fn();
		});
	} : (fn) => {
		queueMicrotask(fn);
	};
	let scheduled = false;
	return () => {
		if (scheduled) return;
		scheduled = true;
		schedule(() => {
			scheduled = false;
			notify();
		});
	};
}
/**
* Create a snapshot store.
*
* Flush default is 'sync' (controlled inputs need same-tick echo); frame-driven
* stores opt into 'raf', where a frame's worth of updates coalesces into one
* notification. Known raf-mode tradeoff: a component mounting mid-frame reads
* fresh state while existing subscribers hear it next flush — transient
* frame-level skew, same nature as the object layer's microtask batching.
*
* @param init - initial state.
* @param opts - flush mode and opt-in persistence (localStorage, keyed by name).
* @returns the store.
*/
function createSnapshotStore(init, opts) {
	const withSelector = subscribeWithSelector(() => init);
	const api = createStore()(withSelector);
	if (opts?.persist) attachPersistence(api, opts.persist.name);
	let subscribe = (fn) => api.subscribe(() => {
		notifySubscribers([fn], "[client-store]");
	});
	if (opts?.flush === "raf") {
		const listeners = /* @__PURE__ */ new Set();
		const flush = rafBatch(() => {
			notifySubscribers(listeners, "[client-store]");
		});
		api.subscribe(flush);
		subscribe = (fn) => {
			listeners.add(fn);
			return () => {
				listeners.delete(fn);
			};
		};
	}
	return {
		getSnapshot: () => api.getState(),
		subscribe: (fn) => subscribe(fn),
		update: (mutator) => {
			api.setState(produce(api.getState(), (draft) => {
				mutator(draft);
			}), true);
		},
		set: (next) => {
			api.setState(devFreeze(next), true);
		}
	};
}
/**
* Whole-value JSON persistence to localStorage. Hand-rolled instead of the
* zustand persist middleware: its write path spreads state into an object
* (`partialize({ ...get() })`), exploding primitive state (a persisted string
* draft becomes {0:'h',1:'e',...}) — not fixable via merge/deserialize options
* because the corruption happens before serialization. Storage failures
* (quota, private mode) only disable persistence, never break the store.
*/
function attachPersistence(api, name) {
	if (typeof localStorage === "undefined") return;
	try {
		const raw = localStorage.getItem(name);
		if (raw !== null) api.setState(devFreeze(JSON.parse(raw)), true);
	} catch (error) {
		console.error(`snapshot store '${name}' rehydration failed:`, error);
	}
	api.subscribe((state) => {
		try {
			localStorage.setItem(name, JSON.stringify(state));
			const native = globalThis.beellixRuntime;
			if (native && name.startsWith("dsh.")) native.request("store-write", {
				name,
				value: state
			}).then((result) => {
				if (!result.ok) console.error(`本机草稿保存失败：${name}`);
			}).catch((error) => {
				console.error("本机草稿保存失败", error);
			});
		} catch (error) {
			console.error(`snapshot store '${name}' persistence failed:`, error);
		}
	});
}
/** Deep-freeze draftable wholesale-set state outside production: set() bypasses immer's freeze. */
function devFreeze(value) {
	return freeze(value, true);
}
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/store.ts
/**
* Any route key walks a dict schema to the same profile node, so the lookup
* names one that cannot collide with a configured route.
*/
const PROBE_ROUTE = "\0probe";
/**
* Join declared configurable providers with the currently registered routes.
* @param registered - live provider routes in registration order.
* @param directory - declared configurable providers in declaration order.
* @returns declared rows followed by live routes with no declaration.
*/
function joinProviderDirectory(registered, directory) {
	const active = new Set(registered.map((provider) => provider.id));
	const declared = new Set(directory.map((entry) => entry.provider));
	const rows = directory.map((entry) => ({
		...entry.vendor === void 0 ? {} : { vendor: entry.vendor },
		...entry.error === void 0 ? {} : { error: entry.error },
		provider: entry.provider,
		displayName: entry.displayName,
		settingsNs: entry.settingsNs,
		settingsPath: [...entry.settingsPath],
		active: active.has(entry.provider),
		...entry.declared === void 0 ? {} : { declared: entry.declared }
	}));
	for (const provider of registered) {
		if (declared.has(provider.id)) continue;
		rows.push({
			provider: provider.id,
			displayName: provider.name,
			settingsNs: "",
			settingsPath: [],
			active: true
		});
	}
	return rows;
}
/**
* Derive the conventional credential reference for a provider route: the v1
* page never asks for an environment-variable name, so a typed key stores
* under this derived reference and the profile records it as `apiKeyEnv`.
* @param provider - provider route id (e.g. `anthropic`, `minimax-cn`).
* @returns the derived reference name (e.g. `MINIMAX_CN_API_KEY`).
*/
function deriveKeyRef(provider) {
	return `${provider.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_API_KEY`;
}
/**
* The wire protocols a hand-declared route may name, read out of the owning
* namespace's own schema. This stays a schema read rather than a wire field so
* the choices the page offers cannot drift from the ones the adapter accepts:
* both come from the same `Config`.
* @param namespace - the namespace view whose schema declares the profile shape.
* @param schema - settings schema operations.
* @returns the protocol identifiers, or an empty list when the schema has none.
*/
function protocolChoices(namespace, schema) {
	if (namespace === void 0) return [];
	const list = schema.nodeAtPath(schema.rehydrate(namespace.schema), [
		"providers",
		PROBE_ROUTE,
		"api"
	]);
	if (list?.type !== "union" || list.list === void 0) return [];
	return list.list.map((entry) => entry.value).filter((value) => typeof value === "string");
}
/** The credential reference a resolved profile names (its `apiKeyEnv` field). */
function apiKeyEnvOf(namespace, path, schema) {
	if (namespace === void 0) return void 0;
	const profile = schema.getPath(namespace.value, path);
	if (typeof profile !== "object" || profile === null) return void 0;
	const ref = profile.apiKeyEnv;
	return typeof ref === "string" && ref.length > 0 ? ref : void 0;
}
/** The models settings page controller (one per settings surface). */
var ModelsSettingsStore = class {
	ctx;
	schema;
	describeFace;
	/** The snapshot the section renders from (uSES-safe store). */
	store = createSnapshotStore({
		status: "idle",
		error: null,
		credentialError: null,
		writable: false,
		rows: [],
		namespaces: /* @__PURE__ */ new Map()
	});
	/** Latest load wins; an older response never overwrites a newer one. */
	generation = 0;
	/**
	* @param ctx - the page plugin's context, whose `remote.llm` and
	* `remote.credentials` namespaces carry the directory and credential reads.
	* @param schema - settings-owned schema and immutable path operations.
	* @param describeFace - the shared mirror's describe face (namespace views and writability).
	*/
	constructor(ctx, schema, describeFace) {
		this.ctx = ctx;
		this.schema = schema;
		this.describeFace = describeFace;
	}
	/**
	* Refresh the whole page snapshot: the provider directory and the mirror's
	* settings answer in parallel, then one batched credential describe over
	* every referenced ref. Provider failure or absence of an initial settings
	* answer keeps the last good rows and surfaces an error; a failed settings
	* refresh reuses the mirror's held view.
	* @returns nothing; the snapshot carries the outcome.
	*/
	async load() {
		const generation = ++this.generation;
		this.store.update((s) => {
			s.status = "loading";
			s.error = null;
		});
		const [registered, declared] = await Promise.all([
			this.ctx.remote.llm.listProviders(),
			this.ctx.remote.llm.listConfigurableProviders(),
			this.describeFace.ensure()
		]);
		if (!registered.ok) {
			this.failLoad(generation, registered.error.message);
			return;
		}
		if (!declared.ok) {
			this.failLoad(generation, declared.error.message);
			return;
		}
		const mirrored = this.describeFace.getSnapshot();
		if (mirrored.view === void 0) {
			this.failLoad(generation, mirrored.error ?? "settings are unavailable in this browser");
			return;
		}
		const providers = joinProviderDirectory(registered.value, declared.value);
		const writable = mirrored.view.writable;
		const views = mirrored.view.namespaces;
		const namespaces = new Map(views.map((view) => [view.ns, view]));
		const rows = providers.map((entry) => {
			const namespace = namespaces.get(entry.settingsNs);
			return {
				entry,
				configured: namespace !== void 0 && (entry.settingsPath.length === 0 || this.schema.getPath(namespace.value, entry.settingsPath) !== void 0),
				removable: namespace !== void 0 && entry.settingsPath.length > 0 && this.schema.hasPath(namespace.user, entry.settingsPath) && !this.schema.hasPath(namespace.base, entry.settingsPath),
				apiKeyEnv: apiKeyEnvOf(namespace, entry.settingsPath, this.schema) ?? entry.vendor?.credentialRef,
				credential: void 0
			};
		});
		const refs = [...new Set(rows.map((row) => row.apiKeyEnv ?? row.entry.nativeAuth?.env?.[0] ?? deriveKeyRef(row.entry.provider)).filter((ref) => ref.length > 0))];
		let credentials = {};
		let credentialError = null;
		if (refs.length > 0) {
			const response = await this.ctx.remote.credentials.describe(refs);
			if (response.ok) credentials = response.value;
			else credentialError = response.error.message;
		}
		if (generation !== this.generation) return;
		this.store.update((s) => {
			s.status = "ready";
			s.error = null;
			s.credentialError = credentialError;
			s.writable = writable;
			s.rows = rows.map((row) => {
				const named = row.apiKeyEnv === void 0 ? void 0 : credentials[row.apiKeyEnv];
				const derived = row.apiKeyEnv !== void 0 ? void 0 : credentials[row.entry.nativeAuth?.env?.[0] ?? deriveKeyRef(row.entry.provider)];
				return {
					...row,
					...named === void 0 ? {} : { credential: named },
					...derived === void 0 ? {} : { derivedCredential: derived }
				};
			});
			s.namespaces = namespaces;
		});
	}
	/** Publish one load's failure text, unless a newer load already took over. */
	failLoad(generation, message) {
		if (generation !== this.generation) return;
		this.store.update((s) => {
			s.status = "error";
			s.error = message;
		});
	}
};
/**
* Whether a joined row can serve model requests as it stands: the route is
* registered with the adapter registry, and whatever credential its resolved
* profile names is stored. A profile naming no reference authenticates through
* the provider's own path (the Bedrock chain, Vertex ADC, a gateway that needs
* nothing), as does a live route with no settings address at all, so neither
* owes this page a key.
* @param row - one joined provider row.
* @returns whether the user already has this provider to talk to.
*/
function providerUsable(row) {
	if (!row.entry.active) return false;
	if (row.apiKeyEnv === void 0) return true;
	return row.credential?.configured === true;
}
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/CustomProviderCard.tsx
/**
* The card that declares a provider pi-ai does not ship — an OpenAI-compatible
* gateway, a self-hosted server, or a provider newer than the installed
* catalog.
*
* This is a create, not an edit, which is why it is its own card rather than
* the provider editor with extra fields: the route id is being *chosen* here,
* and the settings address does not exist until it is. One `settings.mutate`
* sets the whole profile at `providers.<route>`; the key travels separately
* through `credentials/set` under the reference the profile records, exactly as
* an existing provider's key does.
*
* The three fields a hand-declared route cannot default — endpoint, protocol,
* and at least one model — are required here rather than at load, so the
* failure names the field while the user is still looking at it.
*
* There is deliberately no reasoning-effort control, here or on the editor
* card: effort is a per-MODEL capability, and the models under one provider
* disagree about it, so a provider-scoped control can only be set to a value
* some of them reject. The composer's model picker offers each model its own
* levels instead.
*/
/** The settings namespace a hand-declared provider is written into. */
const NS = "llm-pi-ai";
/**
* A route id usable as a settings key AND as the stem of a credential name.
* The leading letter is the second half of that: `deriveKeyRef` uppercases the
* id and replaces every non-alphanumeric run with `_`, and a credential
* reference is a POSIX shell identifier, which cannot start with a digit. A
* digit-leading id passes every check this card makes and then fails at the
* credential seam with a raw regular expression the user cannot act on.
*/
const ROUTE_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
/**
* Render the custom-provider creation card.
* @param props - existing routes, protocol choices, wire faces, and copy.
* @returns the creation card.
*/
function CustomProviderCard(props) {
	const { taken, protocols, operations, t } = props;
	const [openedAt] = (0, react.useState)(() => props.revision);
	const [route, setRoute] = (0, react.useState)("");
	const [displayName, setDisplayName] = (0, react.useState)("");
	const [baseURL, setBaseURL] = (0, react.useState)("");
	const [protocol, setProtocol] = (0, react.useState)(protocols[0] ?? "");
	const [keyDraft, setKeyDraft] = (0, react.useState)("");
	const [models, setModels] = (0, react.useState)([]);
	const [busy, setBusy] = (0, react.useState)(false);
	const [failure, setFailure] = (0, react.useState)(void 0);
	/**
	* The profile write landed. Only the key write can still be outstanding, so
	* the fields that describe the provider are settled and the retry path is
	* the credential alone.
	*/
	const [committed, setCommitted] = (0, react.useState)(false);
	const disabled = props.readOnly || busy;
	/** Everything but the key stops being editable once the provider exists. */
	const profileDisabled = disabled || committed;
	const routeInvalid = route.length > 0 && !ROUTE_PATTERN.test(route);
	const routeTaken = taken.includes(route);
	const modelFailure = validateDeepSeekModels(models);
	const keyFailure = apiKeyFailure(keyDraft);
	const keyValue = keyDraft.trim();
	const ready = route.length > 0 && !routeInvalid && !routeTaken && baseURL.length > 0 && models.length > 0 && modelFailure === void 0 && keyFailure === void 0;
	const hint = failure !== void 0 || ready || keyFailure !== void 0 || route.length === 0 || routeInvalid || routeTaken ? void 0 : baseURL.length === 0 ? t("customNeedsBaseUrl") : modelFailure !== void 0 ? `${t("model")} ${String(modelFailure.index + 1)}: ${t(modelFailure.key)}` : t("customNeedsModels");
	/** Perform the create, returning a failure message or undefined. */
	const createOnce = async () => {
		const keyRef = deriveKeyRef(route);
		const storesKey = keyValue.length > 0;
		if (!committed) {
			const profile = {
				...displayName.length === 0 ? {} : { displayName },
				...storesKey ? { apiKeyEnv: keyRef } : {},
				api: protocol,
				baseURL,
				models: models.map((model) => ({ ...model }))
			};
			const written = await operations.writeSettings(NS, [{
				op: "set",
				path: ["providers", route],
				value: profile
			}], openedAt);
			if (written.kind !== "written") return written.kind === "conflict" ? t("conflict") : written.message;
			setCommitted(true);
		}
		if (storesKey) {
			const stored = await operations.storeCredential(keyRef, keyValue);
			if (stored !== void 0) return stored;
		}
	};
	const create = async () => {
		setBusy(true);
		setFailure(void 0);
		try {
			const outcome = await createOnce();
			if (outcome !== void 0) {
				setFailure(outcome);
				return;
			}
			props.onClose(true);
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: ModelsSection_module_css_default["editor"],
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: ModelsSection_module_css_default["editorHeader"],
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: ModelsSection_module_css_default["editorTitle"],
					children: t("customTitle")
				})
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["field"],
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: ModelsSection_module_css_default["fieldLabel"],
					children: t("customRoute")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					className: ModelsSection_module_css_default["input"],
					type: "text",
					value: route,
					placeholder: "acme-gateway",
					"aria-label": t("customRoute"),
					disabled: profileDisabled,
					onChange: (event) => {
						setRoute(event.target.value);
					}
				})]
			}),
			routeInvalid || routeTaken ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: ModelsSection_module_css_default["error"],
				children: t(routeInvalid ? "customRouteInvalid" : "customRouteTaken")
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: ModelsSection_module_css_default["advancedHint"],
				children: t("customRouteHint")
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["field"],
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: ModelsSection_module_css_default["fieldLabel"],
					children: t("customDisplayName")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					className: ModelsSection_module_css_default["input"],
					type: "text",
					value: displayName,
					placeholder: route.length === 0 ? t("customDisplayName") : route,
					"aria-label": t("customDisplayName"),
					disabled: profileDisabled,
					onChange: (event) => {
						setDisplayName(event.target.value);
					}
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["field"],
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: ModelsSection_module_css_default["fieldLabel"],
					children: t("baseUrl")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					className: ModelsSection_module_css_default["input"],
					type: "text",
					value: baseURL,
					placeholder: t("customBaseUrlPlaceholder"),
					"aria-label": t("baseUrl"),
					disabled: profileDisabled,
					onChange: (event) => {
						setBaseURL(event.target.value);
					}
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["field"],
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: ModelsSection_module_css_default["fieldLabel"],
					children: t("customApi")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
					className: `${ModelsSection_module_css_default["input"]} ${ModelsSection_module_css_default["selectInput"]}`,
					value: protocol,
					"aria-label": t("customApi"),
					disabled: profileDisabled,
					onChange: (event) => {
						setProtocol(event.target.value);
					},
					children: protocols.map((choice) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
						value: choice,
						children: choice
					}, choice))
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["field"],
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: ModelsSection_module_css_default["fieldLabel"],
						children: t("keyInput")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						className: ModelsSection_module_css_default["input"],
						type: "password",
						autoComplete: "off",
						value: keyDraft,
						placeholder: t("keyPlaceholder"),
						"aria-label": t("keyInput"),
						disabled,
						onChange: (event) => {
							setKeyDraft(event.target.value);
						}
					}),
					keyFailure === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["error"],
						children: t(keyFailure === "keyBlank" ? "keyBlankNew" : keyFailure)
					})
				]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelListEditor, {
				models,
				onChange: setModels,
				probe: {
					settingsNs: NS,
					baseURL,
					api: protocol,
					...keyValue.length === 0 ? {} : { apiKey: keyValue }
				},
				probeBlocked: keyFailure === "keyBlank" ? "keyBlankNew" : keyFailure,
				operations,
				t,
				disabled: profileDisabled
			}),
			failure !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: ModelsSection_module_css_default["error"],
				children: failure
			}) : null,
			hint === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: ModelsSection_module_css_default["advancedHint"],
				children: hint
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EditorFooter, {
				t,
				busy,
				submitDisabled: disabled || !ready,
				submitLabelKey: "create",
				submitBusyLabelKey: "creating",
				onCancel: () => {
					props.onClose(committed);
				},
				onSubmit: () => {
					create();
				}
			})
		]
	});
}
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/ProviderEditor.tsx
/**
* One provider's editor card, hand-written per adapter family: the primary
* field is a single write-only **API key** input (the page never asks for an
* environment-variable name — a typed key stores through `credentials/set`
* under the profile's reference, deriving `<ROUTE>_API_KEY` when the profile
* has none. The pi-ai profile records that derivation as `apiKeyEnv` only when
* a key is entered; a blank key materializes a reference-free profile for
* provider-native authentication);
* the collapsed 自定义设置 area carries the per-family extras (`baseURL` for
* both families, DeepSeek's id/name/context-window model catalog, and the
* display name and wire protocol of a pi-ai route the adapter does not ship —
* the two fields the create card asked that route for, editable here for the
* same reason).
* Reasoning effort is deliberately absent: it is a per-MODEL capability, and
* the models under one provider disagree about it, so a provider-scoped
* control can only be set to a value some of them reject. The composer's
* model picker offers each model its own levels; `settings.yaml` keeps the
* profile field for a deployment that knows its route. Everything else stays
* owned by `settings.yaml`. Profile edits land as minimal `settings.mutate`
* path ops against the stored section — the card names only the fields it can
* see instead of rebuilding the whole subtree from a partial descriptor.
*/
/** The public DeepSeek endpoint shown as the deepseek base-URL placeholder. */
const DEEPSEEK_PUBLIC_BASE_URL = "https://api.deepseek.com";
/** A user-section subtree as a plain draft object (absent → empty). */
function draftAt(schema, namespace, path) {
	const subtree = schema.getPath(namespace.user, path);
	if (typeof subtree !== "object" || subtree === null || Array.isArray(subtree)) return {};
	return structuredClone(subtree);
}
/**
* The minimal path ops carrying `after` over `before`, both as the card sees
* them. Only keys the card observed are named; fields absent from both sides
* produce no op, which is why edits are path-addressed rather than a rebuilt
* section.
* @param base - path of the edited subtree inside the user section.
* @param before - the subtree as loaded, or undefined when it is new.
* @param after - the subtree as edited.
* @returns ordered set/unset ops; empty when nothing changed.
*/
function pathOps(base, before, after) {
	const previous = typeof before === "object" && before !== null && !Array.isArray(before) ? before : {};
	const ops = [];
	for (const [key, value] of Object.entries(after)) {
		if (JSON.stringify(previous[key]) === JSON.stringify(value)) continue;
		ops.push({
			op: "set",
			path: [...base, key],
			value
		});
	}
	for (const key of Object.keys(previous)) if (!(key in after)) ops.push({
		op: "unset",
		path: [...base, key]
	});
	return ops;
}
/** The editor layout the owning namespace selects. */
function layoutOf(ns) {
	if (ns === "llm-deepseek") return "deepseek";
	if (ns === "llm-pi-ai") return "pi-ai";
	return "unknown";
}
/** The credential reference this profile resolves keys through. */
function refFor(schema, namespace, path, provider) {
	const profile = schema.getPath(namespace.value, path);
	const named = typeof profile === "object" && profile !== null ? profile.apiKeyEnv : void 0;
	return typeof named === "string" && named.length > 0 ? named : deriveKeyRef(provider);
}
/**
* Render one provider's editing card.
* @param props - the addressed profile plus wire faces and copy.
* @returns the editor card.
*/
function ProviderEditor(props) {
	const { namespace, schema, settingsPath, operations, t } = props;
	const [draft, setDraft] = (0, react.useState)(() => draftAt(schema, namespace, settingsPath));
	const [keyDraft, setKeyDraft] = (0, react.useState)("");
	const [keyState, setKeyState] = (0, react.useState)(void 0);
	const [busy, setBusy] = (0, react.useState)(false);
	const [failure, setFailure] = (0, react.useState)(void 0);
	const [committedOriginal, setCommittedOriginal] = (0, react.useState)(() => schema.getPath(namespace.user, settingsPath));
	const [expectedRevision, setExpectedRevision] = (0, react.useState)(() => namespace.revision);
	const root = (0, react.useMemo)(() => schema.rehydrate(namespace.schema), [namespace.schema, schema]);
	const node = (0, react.useMemo)(() => schema.nodeAtPath(root, settingsPath), [
		root,
		schema,
		settingsPath
	]);
	const fallback = schema.getPath(namespace.value, settingsPath);
	const disabled = props.readOnly || busy;
	const layout = layoutOf(namespace.ns);
	const keyRef = refFor(schema, namespace, settingsPath, props.provider);
	const protocols = (0, react.useMemo)(() => layout === "pi-ai" ? protocolChoices(namespace, schema) : [], [
		layout,
		namespace,
		schema
	]);
	(0, react.useEffect)(() => {
		let stale = false;
		setKeyState(void 0);
		operations.describeCredential(keyRef).then((described) => {
			if (stale) return;
			setKeyState(described);
		});
		return () => {
			stale = true;
		};
	}, [operations, keyRef]);
	const stringAt = (source, key) => {
		const value = schema.getPath(source, [key]);
		return typeof value === "string" && value.trim().length > 0 ? value : void 0;
	};
	const setField = (key, next) => {
		const value = next === void 0 || next.trim().length === 0 ? void 0 : next;
		setDraft((current) => value === void 0 ? schema.deletePath(current, [key]) : schema.setPath(current, [key], value));
	};
	const modelFailure = validateDeepSeekModels(schema.getPath(draft, ["models"]));
	const keyFailure = apiKeyFailure(keyDraft);
	const keyValue = keyDraft.trim();
	const probeApi = stringAt(draft, "api") ?? stringAt(fallback, "api");
	const probeBaseURL = stringAt(draft, "baseURL") ?? stringAt(fallback, "baseURL");
	const probe = {
		settingsNs: namespace.ns,
		provider: props.provider,
		...probeBaseURL === void 0 ? {} : { baseURL: probeBaseURL },
		...probeApi === void 0 ? {} : { api: probeApi },
		...keyValue.length === 0 ? {} : { apiKey: keyValue }
	};
	/**
	* The write for this card, or a failure message. Every edit travels as
	* path ops against the STORED section: the draft comes from the redacted
	* descriptor, so a wholesale replace rebuilt from it could delete fields
	* outside the card. Ops name only the fields this card can see.
	*/
	const applyOnce = async () => {
		const ns = namespace.ns;
		const next = layout === "pi-ai" && stringAt(draft, "apiKeyEnv") === void 0 && stringAt(fallback, "apiKeyEnv") === void 0 && keyValue.length > 0 ? schema.setPath(draft, ["apiKeyEnv"], keyRef) : draft;
		const failure = validateDeepSeekModels(schema.getPath(next, ["models"]));
		/* v8 ignore next 3 -- 同一校验已禁用提交按钮，错误行不可提交。 */
		if (failure !== void 0) return `${t("model")} ${String(failure.index + 1)}: ${t(failure.key)}`;
		/* v8 ignore next -- apply is only reachable from the rendered card, which required a resolved node */
		if (node !== void 0 && settingsPath.length === 0) {
			const sectionError = schema.validate(node, next);
			if (sectionError !== void 0) return sectionError;
		}
		const ops = layout === "pi-ai" && fallback === void 0 && committedOriginal === void 0 && Object.keys(next).length === 0 ? [{
			op: "set",
			path: [...settingsPath],
			value: {}
		}] : pathOps(settingsPath, committedOriginal, next);
		if (ops.length > 0) {
			const written = await operations.writeSettings(ns, ops, expectedRevision);
			if (written.kind !== "written") return written.kind === "conflict" ? t("conflict") : written.message;
			setCommittedOriginal(schema.getPath(written.view.user, settingsPath));
			setExpectedRevision(written.view.revision);
			setDraft(next);
		}
		if (keyValue.length > 0) {
			const stored = await operations.storeCredential(keyRef, keyValue);
			if (stored !== void 0) return stored;
		}
		setKeyDraft("");
	};
	const apply = async () => {
		setBusy(true);
		setFailure(void 0);
		try {
			const failure = await applyOnce();
			if (failure !== void 0) {
				setFailure(failure);
				return;
			}
			props.onClose(true);
		} finally {
			setBusy(false);
		}
	};
	if (node === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
		className: ModelsSection_module_css_default["error"],
		children: [
			props.provider,
			": ",
			props.t("settingsPathUnresolvable")
		]
	});
	const keyLocked = keyState?.writable === false;
	/**
	* The catalog beneath the user layer: what the composition entry pinned, or
	* else the schema default that `resolve` would supply. The effective value
	* cannot answer this — it still carries the stored override until the unset
	* is applied, so reading it would echo that override straight back the
	* moment reset drops it, leaving the rows unchanged until a reload.
	*/
	const inheritedModels = () => {
		return schema.getPath(namespace.base, [...settingsPath, "models"]) ?? schema.nodeAtPath(root, [...settingsPath, "models"])?.meta.default;
	};
	/**
	* The curated fields of one known adapter family. The family arrives
	* narrowed so the per-family branches below are total: an unknown namespace
	* renders the hint instead and never reaches this body.
	*/
	const curatedFields = (family) => {
		const ownsIdentity = family === "pi-ai" && props.declared === true;
		const customModels = schema.getPath(draft, ["models"]);
		const modelsOverridden = schema.hasPath(draft, ["models"]);
		const models = modelDrafts(modelsOverridden ? customModels : inheritedModels());
		const defaultContextWindow = schema.getPath(fallback, ["defaultContextWindow"]);
		const defaultMaxTokens = schema.getPath(fallback, ["maxTokens"]);
		const keyPlaceholder = keyLocked ? t("keyEnvLocked") : keyState?.configured === true ? t("keyStored") : family === "pi-ai" ? t("keyPlaceholderNative") : t("keyPlaceholder");
		/** What both family editors take: the rows, whose layer owns them, and the two writes. */
		const catalogProps = {
			models,
			overridden: modelsOverridden,
			t,
			disabled,
			onChange: (next) => {
				setDraft((current) => schema.setPath(current, ["models"], next));
			},
			onReset: () => {
				setDraft((current) => schema.deletePath(current, ["models"]));
			}
		};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: ModelsSection_module_css_default["field"],
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: ModelsSection_module_css_default["fieldLabel"],
					children: t("keyInput")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					className: ModelsSection_module_css_default["input"],
					type: "password",
					autoComplete: "off",
					value: keyDraft,
					placeholder: keyPlaceholder,
					"aria-label": t("keyInput"),
					"aria-invalid": keyFailure !== void 0,
					disabled: disabled || keyLocked,
					onChange: (event) => {
						setKeyDraft(event.target.value);
					}
				}),
				keyFailure === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: ModelsSection_module_css_default["error"],
					children: t(keyFailure)
				})
			]
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
			className: ModelsSection_module_css_default["customized"],
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", {
				className: ModelsSection_module_css_default["customizedSummary"],
				children: t("customized")
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["customizedBody"],
				children: [
					ownsIdentity ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["field"],
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["fieldLabel"],
							children: t("customDisplayName")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: ModelsSection_module_css_default["input"],
							type: "text",
							value: stringAt(draft, "displayName") ?? "",
							placeholder: stringAt(schema.getPath(namespace.base, settingsPath), "displayName") ?? props.provider,
							"aria-label": t("customDisplayName"),
							disabled,
							onChange: (event) => {
								setField("displayName", event.target.value);
							}
						})]
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["field"],
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["fieldLabel"],
							children: t("baseUrl")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: ModelsSection_module_css_default["input"],
							type: "text",
							value: stringAt(draft, "baseURL") ?? "",
							placeholder: family === "deepseek" ? DEEPSEEK_PUBLIC_BASE_URL : stringAt(fallback, "baseURL") ?? t("baseUrlDefault"),
							"aria-label": t("baseUrl"),
							disabled,
							onChange: (event) => {
								setField("baseURL", event.target.value === "" ? void 0 : event.target.value);
							}
						})]
					}),
					ownsIdentity ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["field"],
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["fieldLabel"],
							children: t("customApi")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							className: `${ModelsSection_module_css_default["input"]} ${ModelsSection_module_css_default["selectInput"]}`,
							value: probeApi ?? "",
							"aria-label": t("customApi"),
							disabled,
							onChange: (event) => {
								setField("api", event.target.value);
							},
							children: [probeApi === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "",
								children: t("customApiUnset")
							}) : null, protocols.map((choice) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: choice,
								children: choice
							}, choice))]
						})]
					}) : null,
					family === "deepseek" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DeepSeekModelsEditor, {
						...catalogProps,
						defaultContextWindow: typeof defaultContextWindow === "number" ? defaultContextWindow : void 0,
						defaultMaxTokens: typeof defaultMaxTokens === "number" ? defaultMaxTokens : void 0
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelListEditor, {
						...catalogProps,
						probe,
						probeBlocked: keyFailure,
						operations
					})
				]
			})]
		})] });
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: ModelsSection_module_css_default["editor"],
		children: [
			props.hideTitle === true ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["editorHeader"],
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: ModelsSection_module_css_default["editorTitle"],
					children: props.displayName
				}), props.provider !== props.displayName ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: ModelsSection_module_css_default["editorRoute"],
					children: props.provider
				}) : null]
			}),
			layout === "unknown" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: ModelsSection_module_css_default["advancedHint"],
				children: `${t("advancedHint")} (${namespace.ns})`
			}) : curatedFields(layout),
			failure !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: ModelsSection_module_css_default["error"],
				children: failure
			}) : null,
			modelFailure === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: ModelsSection_module_css_default["advancedHint"],
				children: `${t("model")} ${String(modelFailure.index + 1)}: ${t(modelFailure.key)}`
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EditorFooter, {
				t,
				busy,
				submitDisabled: disabled || layout === "unknown" || modelFailure !== void 0 || keyFailure !== void 0,
				submitLabelKey: "apply",
				submitBusyLabelKey: "applying",
				onCancel: () => {
					props.onClose(false);
				},
				onSubmit: () => {
					apply();
				}
			})
		]
	});
}
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/ManagedCredentialEditor.tsx
/** 复用凭据 Remote 的只写服务密钥编辑器；从不请求已保存的秘密值。 */
/** @param props - 原有凭据操作、权限与本地化文案。 @returns 按引用检查、写入及确认删除的表单。 */
function ManagedCredentialEditor({ operations, t, readOnly }) {
	const [ref, setRef] = (0, react.useState)("");
	const [secret, setSecret] = (0, react.useState)("");
	const [info, setInfo] = (0, react.useState)();
	const [busy, setBusy] = (0, react.useState)(false);
	const [removeConfirmed, setRemoveConfirmed] = (0, react.useState)(false);
	const [notice, setNotice] = (0, react.useState)();
	const valid = /^[A-Za-z_][A-Za-z0-9_]*$/.test(ref);
	const writable = !readOnly && !busy && info?.writable === true && valid;
	const inspect = async () => {
		if (!valid || busy) return;
		setBusy(true);
		setNotice(void 0);
		setInfo(void 0);
		try {
			const current = await operations.describeCredential(ref);
			setInfo(current);
			if (!current) setNotice("serviceCredentialFailed");
		} catch {
			setNotice("serviceCredentialFailed");
		} finally {
			setBusy(false);
		}
	};
	const change = async (remove) => {
		if (!writable || remove && (!removeConfirmed || !info?.configured) || !remove && !secret) return;
		const value = secret;
		setSecret("");
		setBusy(true);
		setNotice(void 0);
		setRemoveConfirmed(false);
		try {
			const error = remove ? await operations.removeCredential(ref) : await operations.storeCredential(ref, value);
			setNotice(error === void 0 ? "serviceCredentialSaved" : "serviceCredentialFailed");
			setInfo(await operations.describeCredential(ref));
		} catch {
			setNotice("serviceCredentialFailed");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
		id: "managed-credentials",
		className: ModelsSection_module_css_default["credentialSection"],
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
				className: ModelsSection_module_css_default["title"],
				children: t("serviceCredentials")
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: ModelsSection_module_css_default["intro"],
				children: t("serviceCredentialsHelp")
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["credentialInspect"],
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
					className: ModelsSection_module_css_default["field"],
					children: [t("serviceCredentialRef"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Input, {
						disabled: busy,
						value: ref,
						onChange: (event) => {
							setRef(event.target.value);
							setInfo(void 0);
							setSecret("");
							setNotice(void 0);
							setRemoveConfirmed(false);
						}
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					disabled: !valid || busy,
					onClick: () => void inspect(),
					children: t("serviceCredentialInspect")
				})]
			}),
			info && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
				role: "status",
				children: [t(info.configured ? "serviceCredentialPresent" : "serviceCredentialMissing"), info.source ? ` · ${info.source}` : ""]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
				className: ModelsSection_module_css_default["credentialForm"],
				onSubmit: (event) => {
					event.preventDefault();
					change(false);
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
					className: ModelsSection_module_css_default["field"],
					children: [t("serviceCredentialValue"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Input, {
						type: "password",
						autoComplete: "new-password",
						disabled: !writable,
						value: secret,
						onChange: (event) => setSecret(event.target.value)
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "primary",
					disabled: !writable || !secret,
					children: t("serviceCredentialSave")
				})]
			}),
			info?.configured && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
				type: "checkbox",
				disabled: !writable,
				checked: removeConfirmed,
				onChange: (event) => setRemoveConfirmed(event.target.checked)
			}), t("serviceCredentialRemoveConfirm")] }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				disabled: !writable || !info?.configured || !removeConfirmed,
				onClick: () => void change(true),
				children: t("serviceCredentialRemove")
			}),
			notice && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				role: notice === "serviceCredentialFailed" ? "alert" : "status",
				children: t(notice)
			})
		]
	});
}
//#endregion
//#region stylesheet
var NavigationLink_module_css_default = { "link": "bxc_CU5t1W_link" };
//#endregion
//#region stylesheet
var VendorCatalog_module_css_default = {
	"connectionInline": "bxc_Dkx63W_connectionInline",
	"modelCard": "bxc_Dkx63W_modelCard",
	"toolbar": "bxc_Dkx63W_toolbar",
	"purposePanel": "bxc_Dkx63W_purposePanel",
	"back": "bxc_Dkx63W_back",
	"connectionPicker": "bxc_Dkx63W_connectionPicker",
	"mark": "bxc_Dkx63W_mark",
	"modelSwitch": "bxc_Dkx63W_modelSwitch",
	"cardTop": "bxc_Dkx63W_cardTop",
	"panel": "bxc_Dkx63W_panel",
	"facts": "bxc_Dkx63W_facts",
	"primaryLink": "bxc_Dkx63W_primaryLink",
	"chips": "bxc_Dkx63W_chips",
	"headingIdentity": "bxc_Dkx63W_headingIdentity",
	"success": "bxc_Dkx63W_success",
	"modelControls": "bxc_Dkx63W_modelControls",
	"muted": "bxc_Dkx63W_muted",
	"grid": "bxc_Dkx63W_grid",
	"modelDetails": "bxc_Dkx63W_modelDetails",
	"vendorCard": "bxc_Dkx63W_vendorCard",
	"resultCount": "bxc_Dkx63W_resultCount",
	"tabs": "bxc_Dkx63W_tabs",
	"status": "bxc_Dkx63W_status",
	"version": "bxc_Dkx63W_version",
	"cardActions": "bxc_Dkx63W_cardActions",
	"sidePanel": "bxc_Dkx63W_sidePanel",
	"statusFilter": "bxc_Dkx63W_statusFilter",
	"empty": "bxc_Dkx63W_empty",
	"pagination": "bxc_Dkx63W_pagination",
	"catalog": "bxc_Dkx63W_catalog",
	"cardStats": "bxc_Dkx63W_cardStats",
	"metrics": "bxc_Dkx63W_metrics",
	"headerActions": "bxc_Dkx63W_headerActions",
	"modelCapacity": "bxc_Dkx63W_modelCapacity",
	"connectionPanel": "bxc_Dkx63W_connectionPanel",
	"visuallyHidden": "bxc_Dkx63W_visuallyHidden",
	"notice": "bxc_Dkx63W_notice",
	"heading": "bxc_Dkx63W_heading",
	"breadcrumbs": "bxc_Dkx63W_breadcrumbs",
	"detailGrid": "bxc_Dkx63W_detailGrid",
	"catalogActions": "bxc_Dkx63W_catalogActions"
};
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/vendor-icons.ts
/** 厂商品牌图标：Lobe Icons 1.95.0（MIT）及 Simple Icons 的 Xiaomi 标识（CC0）；补充来源与许可见本包 THIRD_PARTY_NOTICES.md。静态内嵌，页面不请求外部资源。 */
const vendorIcons = {
	"amazon-bedrock": {
		monochrome: false,
		src: "data:image/svg+xml,%3Csvg%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EBedrock%3C%2Ftitle%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22lobe-icons-bedrock-_R_0_%22%20x1%3D%2280%25%22%20x2%3D%2220%25%22%20y1%3D%2220%25%22%20y2%3D%2280%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%236350FB%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%233D8FFF%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%239AD8F8%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M13.05%2015.513h3.08c.214%200%20.389.177.389.394v1.82a1.704%201.704%200%20011.296%201.661c0%20.943-.755%201.708-1.685%201.708-.931%200-1.686-.765-1.686-1.708%200-.807.554-1.484%201.297-1.662v-1.425h-2.69v4.663a.395.395%200%2001-.188.338l-2.69%201.641a.385.385%200%2001-.405-.002l-4.926-3.086a.395.395%200%2001-.185-.336V16.3L2.196%2014.87A.395.395%200%20012%2014.555L2%2014.528V9.406c0-.14.073-.27.192-.34l2.465-1.462V4.448c0-.129.062-.249.165-.322l.021-.014L9.77%201.058a.385.385%200%2001.407%200l2.69%201.675a.395.395%200%2001.185.336V7.6h3.856V5.683a1.704%201.704%200%2001-1.296-1.662c0-.943.755-1.708%201.685-1.708.931%200%201.685.765%201.685%201.708%200%20.807-.553%201.484-1.296%201.662v2.311a.391.391%200%2001-.389.394h-4.245v1.806h6.624a1.69%201.69%200%20011.64-1.313c.93%200%201.685.764%201.685%201.707%200%20.943-.754%201.708-1.685%201.708a1.69%201.69%200%2001-1.64-1.314H13.05v1.937h4.953l.915%201.18a1.66%201.66%200%2001.84-.227c.931%200%201.685.764%201.685%201.707%200%20.943-.754%201.708-1.685%201.708-.93%200-1.685-.765-1.685-1.708%200-.346.102-.668.276-.937l-.724-.935H13.05v1.806zM9.973%201.856L7.93%203.122V6.09h-.778V3.604L5.435%204.669v2.945l2.11%201.36L9.712%207.61V5.334h.778V7.83c0%20.136-.07.263-.184.335L7.963%209.638v2.081l1.422%201.009-.446.646-1.406-.998-1.53%201.005-.423-.66%201.605-1.055v-1.99L5.038%208.29l-2.26%201.34v1.676l1.972-1.189.398.677-2.37%201.429V14.3l2.166%201.258%202.27-1.368.397.677-2.176%201.311V19.3l1.876%201.175%202.365-1.426.398.678-2.017%201.216%201.918%201.201%202.298-1.403v-5.78l-4.758%202.893-.4-.675%205.158-3.136V3.289L9.972%201.856zM16.13%2018.47a.913.913%200%2000-.908.92c0%20.507.406.918.908.918a.913.913%200%2000.907-.919.913.913%200%2000-.907-.92zm3.63-3.81a.913.913%200%2000-.908.92c0%20.508.406.92.907.92a.913.913%200%2000.908-.92.913.913%200%2000-.908-.92zm1.555-4.99a.913.913%200%2000-.908.92c0%20.507.407.918.908.918a.913.913%200%2000.907-.919.913.913%200%2000-.907-.92zM17.296%203.1a.913.913%200%2000-.907.92c0%20.508.406.92.907.92a.913.913%200%2000.908-.92.913.913%200%2000-.908-.92z%22%20fill%3D%22url(%23lobe-icons-bedrock-_R_0_)%22%20fill-rule%3D%22nonzero%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"ant-ling": {
		monochrome: false,
		src: "data:image/svg+xml,%3Csvg%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EAntGroup%3C%2Ftitle%3E%3Cpath%20d%3D%22M9.797%206.282a.451.451%200%2001-.336-.315%201.019%201.019%200%20010-.505c.156-.86.3-1.725.501-2.577.14-.7.42-1.367.823-1.96.305-.431.75-.746%201.262-.89.877-.217%201.24.629.937%201.348-.259.593-.877.914-1.334%201.348-.835.795-1.096%202.14-1.336%203.212a.427.427%200%2001-.186.277.437.437%200%2001-.331.062z%22%20fill%3D%22url(%23lobe-icons-ant-group-0-_R_0_)%22%20transform%3D%22translate(3)%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M6.334%204.672c.33-.121.682.146.946.297.278.145.587.219.901.214.231.01.466%200%20.688.018%204.098.176%207.484%203.22%208.05%207.237.565%204.016-1.852%207.859-5.745%209.134-3.894%201.276-8.153-.38-10.126-3.935A8.339%208.339%200%20013.133%207.081c.348-.278.716-.53%201.102-.755a8.404%208.404%200%20001.318-.79c.28-.243.45-.742.781-.864zm4.406%202.15c-2.841.003-4.898%202.533-4.628%205.642.27%203.109%202.781%205.641%205.613%205.665%202.832.024%204.932-2.512%204.658-5.644-.273-3.133-2.802-5.666-5.643-5.663zm.357.57a4.707%204.707%200%20013.304%201.446%205.703%205.703%200%20011.643%203.49%204.841%204.841%200%2001-1.141%203.705v.015a3.923%203.923%200%2001-2.808%201.303%204.664%204.664%200%2001-3.367-1.387%205.678%205.678%200%2001-1.71-3.518%204.832%204.832%200%20011.14-3.753%203.923%203.923%200%20012.813-1.3h.126z%22%20fill%3D%22url(%23lobe-icons-ant-group-1-_R_0_)%22%20transform%3D%22translate(3)%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M2.346%202.054a1.26%201.26%200%2001.384-.594.842.842%200%20011.165.11c.694.82.169%202.078.142%203.02.013.805.208%201.597.57%202.318.084.134.147.279.186.43a.539.539%200%2001-.3.577c-.345.17-.568-.19-.709-.446-.324-.6-.617-1.216-.877-1.846a8.698%208.698%200%2001-.618-1.987%207.523%207.523%200%2001-.051-.37%203.717%203.717%200%2001-.024-.34%202.506%202.506%200%2001.132-.872z%22%20fill%3D%22url(%23lobe-icons-ant-group-2-_R_0_)%22%20transform%3D%22translate(3)%22%3E%3C%2Fpath%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22lobe-icons-ant-group-0-_R_0_%22%20x1%3D%2231.373%25%22%20x2%3D%2261.365%25%22%20y1%3D%2295.551%25%22%20y2%3D%22-.348%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%2306F%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%2220%25%22%20stop-color%3D%22%231677FF%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%2304A6FF%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22lobe-icons-ant-group-1-_R_0_%22%20x1%3D%224.366%25%22%20x2%3D%2294.359%25%22%20y1%3D%2265.982%25%22%20y2%3D%2232.918%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%2306F%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%2220%25%22%20stop-color%3D%22%231677FF%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%2304A6FF%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22lobe-icons-ant-group-2-_R_0_%22%20x1%3D%2256.255%25%22%20x2%3D%2245.986%25%22%20y1%3D%2299.257%25%22%20y2%3D%221.384%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%2306F%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%2220%25%22%20stop-color%3D%22%231677FF%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%2304A6FF%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3C%2Fsvg%3E"
	},
	"anthropic": {
		monochrome: true,
		src: "data:image/svg+xml,%3Csvg%20fill%3D%22currentColor%22%20fill-rule%3D%22evenodd%22%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EAnthropic%3C%2Ftitle%3E%3Cpath%20d%3D%22M13.827%203.52h3.603L24%2020h-3.603l-6.57-16.48zm-7.258%200h3.767L16.906%2020h-3.674l-1.343-3.461H5.017l-1.344%203.46H0L6.57%203.522zm4.132%209.959L8.453%207.687%206.205%2013.48H10.7z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"azure": {
		monochrome: false,
		src: "data:image/svg+xml,%3Csvg%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EAzureAI%3C%2Ftitle%3E%3Cpath%20clip-rule%3D%22evenodd%22%20d%3D%22M16.233%200c.713%200%201.345.551%201.572%201.329.227.778%201.555%205.59%201.555%205.59v9.562h-4.813L14.645%200h1.588z%22%20fill%3D%22url(%23lobe-icons-azure-ai-0-_R_0_)%22%20fill-rule%3D%22evenodd%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M23.298%207.47c0-.34-.275-.6-.6-.6h-2.835a3.617%203.617%200%2000-3.614%203.615v5.996h3.436a3.617%203.617%200%20003.613-3.614V7.47z%22%20fill%3D%22url(%23lobe-icons-azure-ai-1-_R_0_)%22%3E%3C%2Fpath%3E%3Cpath%20clip-rule%3D%22evenodd%22%20d%3D%22M16.233%200a.982.982%200%2000-.989.989l-.097%2018.198A4.814%204.814%200%200110.334%2024H1.6a.597.597%200%2001-.567-.794l7-19.981A4.819%204.819%200%200112.57%200h3.679-.016z%22%20fill%3D%22url(%23lobe-icons-azure-ai-2-_R_0_)%22%20fill-rule%3D%22evenodd%22%3E%3C%2Fpath%3E%3Cdefs%3E%3ClinearGradient%20gradientUnits%3D%22userSpaceOnUse%22%20id%3D%22lobe-icons-azure-ai-0-_R_0_%22%20x1%3D%2218.242%22%20x2%3D%2214.191%22%20y1%3D%2216.837%22%20y2%3D%22.616%22%3E%3Cstop%20stop-color%3D%22%23712575%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.09%22%20stop-color%3D%22%239A2884%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.18%22%20stop-color%3D%22%23BF2C92%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.27%22%20stop-color%3D%22%23DA2E9C%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.34%22%20stop-color%3D%22%23EB30A2%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.4%22%20stop-color%3D%22%23F131A5%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.5%22%20stop-color%3D%22%23EC30A3%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.61%22%20stop-color%3D%22%23DF2F9E%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.72%22%20stop-color%3D%22%23C92D96%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.83%22%20stop-color%3D%22%23AA2A8A%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.95%22%20stop-color%3D%22%2383267C%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23712575%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3ClinearGradient%20gradientUnits%3D%22userSpaceOnUse%22%20id%3D%22lobe-icons-azure-ai-1-_R_0_%22%20x1%3D%2219.782%22%20x2%3D%2219.782%22%20y1%3D%22.34%22%20y2%3D%2223.222%22%3E%3Cstop%20stop-color%3D%22%23DA7ED0%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.08%22%20stop-color%3D%22%23B17BD5%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.19%22%20stop-color%3D%22%238778DB%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.3%22%20stop-color%3D%22%236276E1%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.41%22%20stop-color%3D%22%234574E5%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.54%22%20stop-color%3D%22%232E72E8%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.67%22%20stop-color%3D%22%231D71EB%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.81%22%20stop-color%3D%22%231471EC%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%231171ED%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3ClinearGradient%20gradientUnits%3D%22userSpaceOnUse%22%20id%3D%22lobe-icons-azure-ai-2-_R_0_%22%20x1%3D%2218.404%22%20x2%3D%223.236%22%20y1%3D%22.859%22%20y2%3D%2225.183%22%3E%3Cstop%20stop-color%3D%22%23DA7ED0%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.05%22%20stop-color%3D%22%23B77BD4%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.11%22%20stop-color%3D%22%239079DA%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.18%22%20stop-color%3D%22%236E77DF%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.25%22%20stop-color%3D%22%235175E3%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.33%22%20stop-color%3D%22%233973E7%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.42%22%20stop-color%3D%22%232772E9%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.54%22%20stop-color%3D%22%231A71EB%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22.68%22%20stop-color%3D%22%231371EC%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%231171ED%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3C%2Fsvg%3E"
	},
	"baseten": {
		monochrome: true,
		src: "data:image/svg+xml,%3Csvg%20fill%3D%22currentColor%22%20fill-rule%3D%22evenodd%22%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EBaseten%3C%2Ftitle%3E%3Cpath%20d%3D%22M2.316%204.8h14.682v4.8H7.31a.302.302%200%2000-.308.3v4.2c0%20.171.14.3.308.3h9.688v4.8h-4.686a.302.302%200%2000-.308.3v4.2c0%20.171.141.3.308.3h4.378a.297.297%200%2000.308-.3v-4.5h4.694a.302.302%200%2000.308-.3v-4.2c0-.171-.14-.3-.308-.3h-4.694V9.6h4.694A.302.302%200%200022%209.3V5.1c0-.171-.14-.3-.308-.3h-4.694V.3c0-.171-.14-.3-.308-.3H2.316A.31.31%200%20002%20.3v4.2c0%20.171.14.3.316.3z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"cerebras": {
		monochrome: false,
		src: "data:image/svg+xml,%3Csvg%20fill%3D%22currentColor%22%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3ECerebras%3C%2Ftitle%3E%3Cpath%20clip-rule%3D%22evenodd%22%20d%3D%22M14.121%202.701a9.299%209.299%200%20000%2018.598V22.7c-5.91%200-10.7-4.791-10.7-10.701S8.21%201.299%2014.12%201.299V2.7zm4.752%203.677A7.353%207.353%200%20109.42%2017.643l-.901%201.074a8.754%208.754%200%2001-1.08-12.334%208.755%208.755%200%200112.335-1.08l-.901%201.075zm-2.255.844a5.407%205.407%200%2000-5.048%209.563l-.656%201.24a6.81%206.81%200%20016.358-12.043l-.654%201.24zM14.12%208.539a3.46%203.46%200%20100%206.922v1.402a4.863%204.863%200%20010-9.726v1.402z%22%20fill%3D%22%23F15A29%22%20fill-rule%3D%22evenodd%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M15.407%2010.836a2.24%202.24%200%2000-.51-.409%201.084%201.084%200%2000-.544-.152c-.255%200-.483.047-.684.14a1.58%201.58%200%2000-.84.912c-.074.203-.11.416-.11.631%200%20.218.036.43.11.631a1.594%201.594%200%2000.84.913c.2.093.43.14.684.14.216%200%20.417-.046.602-.135.188-.09.35-.225.475-.392l.928%201.006c-.14.14-.3.261-.482.363a3.367%203.367%200%2001-1.083.38c-.17.026-.317.04-.44.04a3.315%203.315%200%2001-1.182-.21%202.825%202.825%200%2001-.961-.597%202.816%202.816%200%2001-.644-.929%202.987%202.987%200%2001-.238-1.21c0-.444.08-.847.238-1.21.15-.35.368-.666.643-.929.278-.261.605-.464.962-.596a3.315%203.315%200%20011.182-.21c.355%200%20.712.068%201.072.204.361.138.685.36.944.649l-.962.97z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"cloudflare": {
		monochrome: false,
		src: "data:image/svg+xml,%3Csvg%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3ECloudflare%3C%2Ftitle%3E%3Cpath%20d%3D%22M16.493%2017.4c.135-.52.08-.983-.161-1.338-.215-.328-.592-.519-1.05-.519l-8.663-.109a.148.148%200%2001-.135-.082c-.027-.054-.027-.109-.027-.163.027-.082.108-.164.189-.164l8.744-.11c1.05-.054%202.153-.9%202.556-1.937l.511-1.31c.027-.055.027-.11.027-.164C17.92%208.91%2015.66%207%2012.942%207c-2.503%200-4.628%201.638-5.381%203.903a2.432%202.432%200%2000-1.803-.491c-1.21.109-2.153%201.092-2.287%202.32-.027.328%200%20.628.054.9C1.56%2013.688%200%2015.326%200%2017.319c0%20.19.027.355.027.545%200%20.082.08.137.161.137h15.983c.08%200%20.188-.055.215-.164l.107-.437%22%20fill%3D%22%23F38020%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M19.238%2011.75h-.242c-.054%200-.108.054-.135.109l-.35%201.2c-.134.52-.08.983.162%201.338.215.328.592.518%201.05.518l1.855.11c.054%200%20.108.027.135.082.027.054.027.109.027.163-.027.082-.108.164-.188.164l-1.91.11c-1.05.054-2.153.9-2.557%201.937l-.134.355c-.027.055.026.137.107.137h6.592c.081%200%20.162-.055.162-.137.107-.41.188-.846.188-1.31-.027-2.62-2.153-4.777-4.762-4.777%22%20fill%3D%22%23FCAD32%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"deepseek": {
		monochrome: false,
		src: "data:image/svg+xml,%3Csvg%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EDeepSeek%3C%2Ftitle%3E%3Cpath%20d%3D%22M23.748%204.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434%201.202-.422%201.84.027%201.436.633%202.58%201.838%203.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526%205.526%200%2001-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365%2011.365%200%2000-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055%203.055%200%2001-.465.137%209.597%209.597%200%2000-2.883-.102c-1.885.21-3.39%201.102-4.497%202.623C.082%208.606-.231%2010.684.152%2012.85c.403%202.284%201.569%204.175%203.36%205.653%201.858%201.533%203.997%202.284%206.438%202.14%201.482-.085%203.133-.284%204.994-1.86.47.234.962.327%201.78.397.63.059%201.236-.03%201.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926%201.096-1.296%202.746-2.642%203.392-7.003.05-.347.007-.565%200-.845-.004-.17.035-.237.23-.256a4.173%204.173%200%20001.545-.475c1.396-.763%201.96-2.015%202.093-3.517.02-.23-.004-.467-.247-.588zM11.581%2018c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696%204.696%200%20011.529-.039c2.132.312%203.946%201.265%205.468%202.774.868.86%201.525%201.887%202.202%202.891.72%201.066%201.494%202.082%202.48%202.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306%200%2001.415-.287.302.302%200%2001.2.288.306.306%200%2001-.31.307.303.303%200%2001-.304-.308zm3.11%201.596c-.2.081-.399.151-.59.16a1.245%201.245%200%2001-.798-.254c-.274-.23-.47-.358-.552-.758a1.73%201.73%200%2001.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559%200%2001-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136%201.146.016.352.144.618.408%201.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z%22%20fill%3D%22%234D6BFE%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"fireworks": {
		monochrome: false,
		src: "data:image/svg+xml,%3Csvg%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EFireworks%3C%2Ftitle%3E%3Cpath%20clip-rule%3D%22evenodd%22%20d%3D%22M14.8%205l-2.801%206.795L9.195%205H7.397l3.072%207.428a1.64%201.64%200%20003.038.002L16.598%205H14.8zm1.196%2010.352l5.124-5.244-.699-1.669-5.596%205.739a1.664%201.664%200%2000-.343%201.807%201.642%201.642%200%20001.516%201.012L16%2017l8-.02-.699-1.669-7.303.041h-.002zM2.88%2010.104l.699-1.669%205.596%205.739c.468.479.603%201.189.343%201.807a1.643%201.643%200%2001-1.516%201.012l-8-.018-.002.002.699-1.669%207.303.042-5.122-5.246z%22%20fill%3D%22%235019C5%22%20fill-rule%3D%22evenodd%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"github-copilot": {
		monochrome: true,
		src: "data:image/svg+xml,%3Csvg%20fill%3D%22currentColor%22%20fill-rule%3D%22evenodd%22%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EGithubCopilot%3C%2Ftitle%3E%3Cpath%20d%3D%22M19.245%205.364c1.322%201.36%201.877%203.216%202.11%205.817.622%200%201.2.135%201.592.654l.73.964c.21.278.323.61.323.955v2.62c0%20.339-.173.669-.453.868C20.239%2019.602%2016.157%2021.5%2012%2021.5c-4.6%200-9.205-2.583-11.547-4.258-.28-.2-.452-.53-.453-.868v-2.62c0-.345.113-.679.321-.956l.73-.963c.392-.517.974-.654%201.593-.654l.029-.297c.25-2.446.81-4.213%202.082-5.52%202.461-2.54%205.71-2.851%207.146-2.864h.198c1.436.013%204.685.323%207.146%202.864zm-7.244%204.328c-.284%200-.613.016-.962.05-.123.447-.305.85-.57%201.108-1.05%201.023-2.316%201.18-2.994%201.18-.638%200-1.306-.13-1.851-.464-.516.165-1.012.403-1.044.996a65.882%2065.882%200%2000-.063%202.884l-.002.48c-.002.563-.005%201.126-.013%201.69.002.326.204.63.51.765%202.482%201.102%204.83%201.657%206.99%201.657%202.156%200%204.504-.555%206.985-1.657a.854.854%200%2000.51-.766c.03-1.682.006-3.372-.076-5.053-.031-.596-.528-.83-1.046-.996-.546.333-1.212.464-1.85.464-.677%200-1.942-.157-2.993-1.18-.266-.258-.447-.661-.57-1.108-.32-.032-.64-.049-.96-.05zm-2.525%204.013c.539%200%20.976.426.976.95v1.753c0%20.525-.437.95-.976.95a.964.964%200%2001-.976-.95v-1.752c0-.525.437-.951.976-.951zm5%200c.539%200%20.976.426.976.95v1.753c0%20.525-.437.95-.976.95a.964.964%200%2001-.976-.95v-1.752c0-.525.437-.951.976-.951zM7.635%205.087c-1.05.102-1.935.438-2.385.906-.975%201.037-.765%203.668-.21%204.224.405.394%201.17.657%201.995.657h.09c.649-.013%201.785-.176%202.73-1.11.435-.41.705-1.433.675-2.47-.03-.834-.27-1.52-.63-1.813-.39-.336-1.275-.482-2.265-.394zm6.465.394c-.36.292-.6.98-.63%201.813-.03%201.037.24%202.06.675%202.47.968.957%202.136%201.104%202.776%201.11h.044c.825%200%201.59-.263%201.995-.657.555-.556.765-3.187-.21-4.224-.45-.468-1.335-.804-2.385-.906-.99-.088-1.875.058-2.265.394zM12%207.615c-.24%200-.525.015-.84.044.03.16.045.336.06.526l-.001.159a2.94%202.94%200%2001-.014.25c.225-.022.425-.027.612-.028h.366c.187%200%20.387.006.612.028-.015-.146-.015-.277-.015-.409.015-.19.03-.365.06-.526a9.29%209.29%200%2000-.84-.044z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"google": {
		monochrome: false,
		src: "data:image/svg+xml,%3Csvg%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EGoogle%3C%2Ftitle%3E%3Cpath%20d%3D%22M23%2012.245c0-.905-.075-1.565-.236-2.25h-10.54v4.083h6.186c-.124%201.014-.797%202.542-2.294%203.569l-.021.136%203.332%202.53.23.022C21.779%2018.417%2023%2015.593%2023%2012.245z%22%20fill%3D%22%234285F4%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M12.225%2023c3.03%200%205.574-.978%207.433-2.665l-3.542-2.688c-.948.648-2.22%201.1-3.891%201.1a6.745%206.745%200%2001-6.386-4.572l-.132.011-3.465%202.628-.045.124C4.043%2020.531%207.835%2023%2012.225%2023z%22%20fill%3D%22%2334A853%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M5.84%2014.175A6.65%206.65%200%20015.463%2012c0-.758.138-1.491.361-2.175l-.006-.147-3.508-2.67-.115.054A10.831%2010.831%200%20001%2012c0%201.772.436%203.447%201.197%204.938l3.642-2.763z%22%20fill%3D%22%23FBBC05%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M12.225%205.253c2.108%200%203.529.892%204.34%201.638l3.167-3.031C17.787%202.088%2015.255%201%2012.225%201%207.834%201%204.043%203.469%202.197%207.062l3.63%202.763a6.77%206.77%200%20016.398-4.572z%22%20fill%3D%22%23EB4335%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"groq": {
		monochrome: true,
		src: "data:image/svg+xml,%3Csvg%20fill%3D%22currentColor%22%20fill-rule%3D%22evenodd%22%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EGroq%3C%2Ftitle%3E%3Cpath%20d%3D%22M12.036%202c-3.853-.035-7%203-7.036%206.781-.035%203.782%203.055%206.872%206.908%206.907h2.42v-2.566h-2.292c-2.407.028-4.38-1.866-4.408-4.23-.029-2.362%201.901-4.298%204.308-4.326h.1c2.407%200%204.358%201.915%204.365%204.278v6.305c0%202.342-1.944%204.25-4.323%204.279a4.375%204.375%200%2001-3.033-1.252l-1.851%201.818A7%207%200%200012.029%2022h.092c3.803-.056%206.858-3.083%206.879-6.816v-6.5C18.907%204.963%2015.817%202%2012.036%202z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"huggingface": {
		monochrome: false,
		src: "data:image/svg+xml,%3Csvg%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EHuggingFace%3C%2Ftitle%3E%3Cpath%20d%3D%22M2.25%2011.535c0-3.407%201.847-6.554%204.844-8.258a9.822%209.822%200%20019.687%200c2.997%201.704%204.844%204.851%204.844%208.258%200%205.266-4.337%209.535-9.687%209.535S2.25%2016.8%202.25%2011.535z%22%20fill%3D%22%23FF9D0B%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M11.938%2020.086c4.797%200%208.687-3.829%208.687-8.551%200-4.722-3.89-8.55-8.687-8.55-4.798%200-8.688%203.828-8.688%208.55%200%204.722%203.89%208.55%208.688%208.55z%22%20fill%3D%22%23FFD21E%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M11.875%2015.113c2.457%200%203.25-2.156%203.25-3.263%200-.576-.393-.394-1.023-.089-.582.283-1.365.675-2.224.675-1.798%200-3.25-1.693-3.25-.586%200%201.107.79%203.263%203.25%203.263h-.003z%22%20fill%3D%22%23FF323D%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M14.76%209.21c.32.108.445.753.767.585.447-.233.707-.708.659-1.204a1.235%201.235%200%2000-.879-1.059%201.262%201.262%200%2000-1.33.394c-.322.384-.377.92-.14%201.36.153.283.638-.177.925-.079l-.002.003zm-5.887%200c-.32.108-.448.753-.768.585a1.226%201.226%200%2001-.658-1.204c.048-.495.395-.913.878-1.059a1.262%201.262%200%20011.33.394c.322.384.377.92.14%201.36-.152.283-.64-.177-.925-.079l.003.003zm1.12%205.34a2.166%202.166%200%20011.325-1.106c.07-.02.144.06.219.171l.192.306c.069.1.139.175.209.175.074%200%20.15-.074.223-.172l.205-.302c.08-.11.157-.188.234-.165.537.168.986.536%201.25%201.026.932-.724%201.275-1.905%201.275-2.633%200-.508-.306-.426-.81-.19l-.616.296c-.52.24-1.148.48-1.824.48-.676%200-1.302-.24-1.823-.48l-.589-.283c-.52-.248-.838-.342-.838.177%200%20.703.32%201.831%201.187%202.56l.18.14z%22%20fill%3D%22%233A3B45%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M17.812%2010.366a.806.806%200%2000.813-.8c0-.441-.364-.8-.813-.8a.806.806%200%2000-.812.8c0%20.442.364.8.812.8zm-11.624%200a.806.806%200%2000.812-.8c0-.441-.364-.8-.812-.8a.806.806%200%2000-.813.8c0%20.442.364.8.813.8zM4.515%2013.073c-.405%200-.765.162-1.017.46a1.455%201.455%200%2000-.333.925%201.801%201.801%200%2000-.485-.074c-.387%200-.737.146-.985.409a1.41%201.41%200%2000-.2%201.722%201.302%201.302%200%2000-.447.694c-.06.222-.12.69.2%201.166a1.267%201.267%200%2000-.093%201.236c.238.533.81.958%201.89%201.405l.24.096c.768.3%201.473.492%201.478.494.89.243%201.808.375%202.732.394%201.465%200%202.513-.443%203.115-1.314.93-1.342.842-2.575-.274-3.763l-.151-.154c-.692-.684-1.155-1.69-1.25-1.912-.195-.655-.71-1.383-1.562-1.383-.46.007-.889.233-1.15.605-.25-.31-.495-.553-.715-.694a1.87%201.87%200%2000-.993-.312zm14.97%200c.405%200%20.767.162%201.017.46.216.262.333.588.333.925.158-.047.322-.071.487-.074.388%200%20.738.146.985.409a1.41%201.41%200%2001.2%201.722c.22.178.377.422.445.694.06.222.12.69-.2%201.166.244.37.279.836.093%201.236-.238.533-.81.958-1.889%201.405l-.239.096c-.77.3-1.475.492-1.48.494-.89.243-1.808.375-2.732.394-1.465%200-2.513-.443-3.115-1.314-.93-1.342-.842-2.575.274-3.763l.151-.154c.695-.684%201.157-1.69%201.252-1.912.195-.655.708-1.383%201.56-1.383.46.007.889.233%201.15.605.25-.31.495-.553.718-.694.244-.162.523-.265.814-.3l.176-.012z%22%20fill%3D%22%23FF9D0B%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M9.785%2020.132c.688-.994.638-1.74-.305-2.667-.945-.928-1.495-2.288-1.495-2.288s-.205-.788-.672-.714c-.468.074-.81%201.25.17%201.971.977.721-.195%201.21-.573.534-.375-.677-1.405-2.416-1.94-2.751-.532-.332-.907-.148-.782.541.125.687%202.357%202.35%202.14%202.707-.218.362-.983-.42-.983-.42S2.953%2014.9%202.43%2015.46c-.52.558.398%201.026%201.7%201.803%201.308.778%201.41.985%201.225%201.28-.187.295-3.07-2.1-3.34-1.083-.27%201.011%202.943%201.304%202.745%202.006-.2.7-2.265-1.324-2.685-.537-.425.79%202.913%201.718%202.94%201.725%201.075.276%203.813.859%204.77-.522zm4.432%200c-.687-.994-.64-1.74.305-2.667.943-.928%201.493-2.288%201.493-2.288s.205-.788.675-.714c.465.074.807%201.25-.17%201.971-.98.721.195%201.21.57.534.377-.677%201.407-2.416%201.94-2.751.532-.332.91-.148.782.541-.125.687-2.355%202.35-2.137%202.707.215.362.98-.42.98-.42S21.05%2014.9%2021.57%2015.46c.52.558-.395%201.026-1.7%201.803-1.308.778-1.408.985-1.225%201.28.187.295%203.07-2.1%203.34-1.083.27%201.011-2.94%201.304-2.743%202.006.2.7%202.263-1.324%202.685-.537.423.79-2.912%201.718-2.94%201.725-1.077.276-3.815.859-4.77-.522z%22%20fill%3D%22%23FFD21E%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"moonshot": {
		monochrome: true,
		src: "data:image/svg+xml,%3Csvg%20fill%3D%22currentColor%22%20fill-rule%3D%22evenodd%22%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EMoonshotAI%3C%2Ftitle%3E%3Cpath%20d%3D%22M1.052%2016.916l9.539%202.552a21.007%2021.007%200%2000.06%202.033l5.956%201.593a11.997%2011.997%200%2001-5.586.865l-.18-.016-.044-.004-.084-.009-.094-.01a11.605%2011.605%200%2001-.157-.02l-.107-.014-.11-.016a11.962%2011.962%200%2001-.32-.051l-.042-.008-.075-.013-.107-.02-.07-.015-.093-.019-.075-.016-.095-.02-.097-.023-.094-.022-.068-.017-.088-.022-.09-.024-.095-.025-.082-.023-.109-.03-.062-.02-.084-.025-.093-.028-.105-.034-.058-.019-.08-.026-.09-.031-.066-.024a6.293%206.293%200%2001-.044-.015l-.068-.025-.101-.037-.057-.022-.08-.03-.087-.035-.088-.035-.079-.032-.095-.04-.063-.028-.063-.027a5.655%205.655%200%2001-.041-.018l-.066-.03-.103-.047-.052-.024-.096-.046-.062-.03-.084-.04-.086-.044-.093-.047-.052-.027-.103-.055-.057-.03-.058-.032a6.49%206.49%200%2001-.046-.026l-.094-.053-.06-.034-.051-.03-.072-.041-.082-.05-.093-.056-.052-.032-.084-.053-.061-.039-.079-.05-.07-.047-.053-.035a7.785%207.785%200%2001-.054-.036l-.044-.03-.044-.03a6.066%206.066%200%2001-.04-.028l-.057-.04-.076-.054-.069-.05-.074-.054-.056-.042-.076-.057-.076-.059-.086-.067-.045-.035-.064-.052-.074-.06-.089-.073-.046-.039-.046-.039a7.516%207.516%200%2001-.043-.037l-.045-.04-.061-.053-.07-.062-.068-.06-.062-.058-.067-.062-.053-.05-.088-.084a13.28%2013.28%200%2001-.099-.097l-.029-.028-.041-.042-.069-.07-.05-.051-.05-.053a6.457%206.457%200%2001-.168-.179l-.08-.088-.062-.07-.071-.08-.042-.049-.053-.062-.058-.068-.046-.056a7.175%207.175%200%2001-.027-.033l-.045-.055-.066-.082-.041-.052-.05-.064-.02-.025a11.99%2011.99%200%2001-1.44-2.402zm-1.02-5.794l11.353%203.037a20.468%2020.468%200%2000-.469%202.011l10.817%202.894a12.076%2012.076%200%2001-1.845%202.005L.657%2015.923l-.016-.046-.035-.104a11.965%2011.965%200%2001-.05-.153l-.007-.023a11.896%2011.896%200%2001-.207-.741l-.03-.126-.018-.08-.021-.097-.018-.081-.018-.09-.017-.084-.018-.094c-.026-.141-.05-.283-.071-.426l-.017-.118-.011-.083-.013-.102a12.01%2012.01%200%2001-.019-.161l-.005-.047a12.12%2012.12%200%2001-.034-2.145zm1.593-5.15l11.948%203.196c-.368.605-.705%201.231-1.01%201.875l11.295%203.022c-.142.82-.368%201.612-.668%202.365l-11.55-3.09L.124%2010.26l.015-.1.008-.049.01-.067.015-.087.018-.098c.026-.148.056-.295.088-.442l.028-.124.02-.085.024-.097c.022-.09.045-.18.07-.268l.028-.102.023-.083.03-.1.025-.082.03-.096.026-.082.031-.095a11.896%2011.896%200%20011.01-2.232zm4.442-4.4L17.352%204.59a20.77%2020.77%200%2000-1.688%201.721l7.823%202.093c.267.852.442%201.744.513%202.665L2.106%205.213l.045-.065.027-.04.04-.055.046-.065.055-.076.054-.072.064-.086.05-.065.057-.073.055-.07.06-.074.055-.069.065-.077.054-.066.066-.077.053-.06.072-.082.053-.06.067-.074.054-.058.073-.078.058-.06.063-.067.168-.17.1-.098.059-.056.076-.071a12.084%2012.084%200%20012.272-1.677zM12.017%200h.097l.082.001.069.001.054.002.068.002.046.001.076.003.047.002.06.003.054.002.087.005.105.007.144.011.088.007.044.004.077.008.082.008.047.005.102.012.05.006.108.014.081.01.042.006.065.01.207.032.07.012.065.011.14.026.092.018.11.022.046.01.075.016.041.01L14.7.3l.042.01.065.015.049.012.071.017.096.024.112.03.113.03.113.032.05.015.07.02.078.024.073.023.05.016.05.016.076.025.099.033.102.036.048.017.064.023.093.034.11.041.116.045.1.04.047.02.06.024.041.018.063.026.04.018.057.025.11.048.1.046.074.035.075.036.06.028.092.046.091.045.102.052.053.028.049.026.046.024.06.033.041.022.052.029.088.05.106.06.087.051.057.034.053.032.096.059.088.055.098.062.036.024.064.041.084.056.04.027.062.042.062.043.023.017c.054.037.108.075.161.114l.083.06.065.048.056.043.086.065.082.064.04.03.05.041.086.069.079.065.085.071c.712.6%201.353%201.283%201.909%202.031L7.222.994l.062-.027.065-.028.081-.034.086-.035c.113-.045.227-.09.341-.131l.096-.035.093-.033.084-.03.096-.031c.087-.03.176-.058.264-.085l.091-.027.086-.025.102-.03.085-.023.1-.026L9.04.37l.09-.023.091-.022.095-.022.09-.02.098-.021.091-.02.095-.018.092-.018.1-.018.091-.016.098-.017.092-.014.097-.015.092-.013.102-.013.091-.012.105-.012.09-.01.105-.01c.093-.01.186-.018.28-.024l.106-.008.09-.005.11-.006.093-.004.1-.004.097-.002.099-.002.197-.002z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"minimax": {
		monochrome: false,
		src: "data:image/svg+xml,%3Csvg%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EMinimax%3C%2Ftitle%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22lobe-icons-minimax-_R_0_%22%20x1%3D%220%25%22%20x2%3D%22100.182%25%22%20y1%3D%2250.057%25%22%20y2%3D%2250.057%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23E2167E%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23FE603C%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M16.278%202c1.156%200%202.093.927%202.093%202.07v12.501a.74.74%200%2000.744.709.74.74%200%2000.743-.709V9.099a2.06%202.06%200%20012.071-2.049A2.06%202.06%200%200124%209.1v6.561a.649.649%200%2001-.652.645.649.649%200%2001-.653-.645V9.1a.762.762%200%2000-.766-.758.762.762%200%2000-.766.758v7.472a2.037%202.037%200%2001-2.048%202.026%202.037%202.037%200%2001-2.048-2.026v-12.5a.785.785%200%2000-.788-.753.785.785%200%2000-.789.752l-.001%2015.904A2.037%202.037%200%200113.441%2022a2.037%202.037%200%2001-2.048-2.026V18.04c0-.356.292-.645.652-.645.36%200%20.652.289.652.645v1.934c0%20.263.142.506.372.638.23.131.514.131.744%200a.734.734%200%2000.372-.638V4.07c0-1.143.937-2.07%202.093-2.07zm-5.674%200c1.156%200%202.093.927%202.093%202.07v11.523a.648.648%200%2001-.652.645.648.648%200%2001-.652-.645V4.07a.785.785%200%2000-.789-.78.785.785%200%2000-.789.78v14.013a2.06%202.06%200%2001-2.07%202.048%202.06%202.06%200%2001-2.071-2.048V9.1a.762.762%200%2000-.766-.758.762.762%200%2000-.766.758v3.8a2.06%202.06%200%2001-2.071%202.049A2.06%202.06%200%20010%2012.9v-1.378c0-.357.292-.646.652-.646.36%200%20.653.29.653.646V12.9c0%20.418.343.757.766.757s.766-.339.766-.757V9.099a2.06%202.06%200%20012.07-2.048%202.06%202.06%200%20012.071%202.048v8.984c0%20.419.343.758.767.758.423%200%20.766-.339.766-.758V4.07c0-1.143.937-2.07%202.093-2.07z%22%20fill%3D%22url(%23lobe-icons-minimax-_R_0_)%22%20fill-rule%3D%22nonzero%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"mistral": {
		monochrome: false,
		src: "data:image/svg+xml,%3Csvg%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EMistral%3C%2Ftitle%3E%3Cpath%20d%3D%22M3.428%203.4h3.429v3.428H3.428V3.4zm13.714%200h3.43v3.428h-3.43V3.4z%22%20fill%3D%22gold%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M3.428%206.828h6.857v3.429H3.429V6.828zm10.286%200h6.857v3.429h-6.857V6.828z%22%20fill%3D%22%23FFAF00%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M3.428%2010.258h17.144v3.428H3.428v-3.428z%22%20fill%3D%22%23FF8205%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M3.428%2013.686h3.429v3.428H3.428v-3.428zm6.858%200h3.429v3.428h-3.429v-3.428zm6.856%200h3.43v3.428h-3.43v-3.428z%22%20fill%3D%22%23FA500F%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M0%2017.114h10.286v3.429H0v-3.429zm13.714%200H24v3.429H13.714v-3.429z%22%20fill%3D%22%23E10500%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"nvidia": {
		monochrome: false,
		src: "data:image/svg+xml,%3Csvg%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3ENvidia%3C%2Ftitle%3E%3Cpath%20d%3D%22M10.212%208.976V7.62c.127-.01.256-.017.388-.021%203.596-.117%205.957%203.184%205.957%203.184s-2.548%203.647-5.282%203.647a3.227%203.227%200%2001-1.063-.175v-4.109c1.4.174%201.681.812%202.523%202.258l1.873-1.627a4.905%204.905%200%2000-3.67-1.846%206.594%206.594%200%2000-.729.044m0-4.476v2.025c.13-.01.259-.019.388-.024%205.002-.174%208.261%204.226%208.261%204.226s-3.743%204.69-7.643%204.69c-.338%200-.675-.031-1.007-.092v1.25c.278.038.558.057.838.057%203.629%200%206.253-1.91%208.794-4.169.421.347%202.146%201.193%202.501%201.564-2.416%202.083-8.048%203.763-11.24%203.763-.308%200-.603-.02-.894-.048V19.5H24v-15H10.21zm0%209.756v1.068c-3.356-.616-4.287-4.21-4.287-4.21a7.173%207.173%200%20014.287-2.138v1.172h-.005a3.182%203.182%200%2000-2.502%201.178s.615%202.276%202.507%202.931m-5.961-3.3c1.436-1.935%203.604-3.148%205.961-3.336V6.523C5.81%206.887%202%2010.723%202%2010.723s2.158%206.427%208.21%207.015v-1.166C5.77%2016%204.25%2010.958%204.25%2010.958h-.002z%22%20fill%3D%22%2374B71B%22%20fill-rule%3D%22nonzero%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"openai": {
		monochrome: true,
		src: "data:image/svg+xml,%3Csvg%20fill%3D%22currentColor%22%20fill-rule%3D%22evenodd%22%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EOpenAI%3C%2Ftitle%3E%3Cpath%20d%3D%22M9.205%208.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357%201.356-.523%202.117-.523%202.854%200%204.662%202.212%204.662%204.566%200%20.167%200%20.357-.024.547l-4.71-2.759a.797.797%200%2000-.856%200l-5.97%203.473zm10.609%208.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473%201.95-1.118a.433.433%200%2001.476%200l4.543%202.617c1.309.76%202.189%202.378%202.189%203.948%200%201.808-1.07%203.473-2.76%204.163zM7.802%2012.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545%201.95-4.472%204.591-4.472%201%200%201.927.333%202.712.928L8.23%205.067c-.285.166-.428.404-.428.737v6.898zM12%2015.128l-2.795-1.57v-3.33L12%208.658l2.795%201.57v3.33L12%2015.128zm1.796%207.23c-1%200-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974%201.142c.167.095.238.238.238.428v5.233c0%202.545-1.974%204.472-4.614%204.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482%204.482%200%20014.21%206.327v5.423c0%20.333.143.571.428.738l5.947%203.449-1.95%201.118a.432.432%200%2001-.476%200zm-.262%203.9c-2.688%200-4.662-2.021-4.662-4.519%200-.19.024-.38.047-.57l4.686%202.71c.286.167.571.167.856%200l5.97-3.448v2.26c0%20.19-.07.333-.237.428l-4.543%202.616c-.619.357-1.356.523-2.117.523zm5.899%202.83a5.947%205.947%200%20005.827-4.756C22.287%2018.339%2024%2015.84%2024%2013.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498%200-3.401-2.759-5.947-5.946-5.947-.642%200-1.26.095-1.88.31A5.962%205.962%200%200010.205%200a5.947%205.947%200%2000-5.827%204.757C1.713%205.447%200%207.945%200%2010.49c0%201.666.713%203.283%201.998%204.448-.119.5-.19%201-.19%201.499%200%203.401%202.759%205.946%205.946%205.946.642%200%201.26-.095%201.88-.309a5.96%205.96%200%20004.162%201.713z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"opencode": {
		monochrome: true,
		src: "data:image/svg+xml,%3Csvg%20fill%3D%22currentColor%22%20fill-rule%3D%22evenodd%22%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3Eopencode%3C%2Ftitle%3E%3Cpath%20d%3D%22M16%206H8v12h8V6zm4%2016H4V2h16v20z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"openrouter": {
		monochrome: true,
		src: "data:image/svg+xml,%3Csvg%20fill%3D%22currentColor%22%20fill-rule%3D%22evenodd%22%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EOpenRouter%3C%2Ftitle%3E%3Cpath%20d%3D%22M18.654%203.87a5.087%205.087%200%20110%2010.174L23.7%2019.09c.64.641.187%201.737-.72%201.737H8.48a8.479%208.479%200%20010-16.958h10.175zM8.479%207.26a5.087%205.087%200%20100%2010.176%205.087%205.087%200%20000-10.175z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"qwen": {
		monochrome: false,
		src: "data:image/svg+xml,%3Csvg%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EQwen%3C%2Ftitle%3E%3Cpath%20d%3D%22M12.604%201.34c.393.69.784%201.382%201.174%202.075a.18.18%200%2000.157.091h5.552c.174%200%20.322.11.446.327l1.454%202.57c.19.337.24.478.024.837-.26.43-.513.864-.76%201.3l-.367.658c-.106.196-.223.28-.04.512l2.652%204.637c.172.301.111.494-.043.77-.437.785-.882%201.564-1.335%202.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099%200%2000-.081.05%20575.097%20575.097%200%2001-2.705%204.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537%200%2001-.465-.271l-1.335-2.323a.09.09%200%2000-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543%200%2001-.002-.54l1.207-2.12a.198.198%200%20000-.197%20550.951%20550.951%200%2001-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625%201.387-2.436.132-.234.304-.334.584-.335a338.3%20338.3%200%20012.589-.001.124.124%200%2000.107-.063l2.806-4.895a.488.488%200%2001.422-.246c.524-.001%201.053%200%201.583-.006L11.704%201c.341-.003.724.032.9.34zm-3.432.403a.06.06%200%2000-.052.03L6.254%206.788a.157.157%200%2001-.135.078H3.253c-.056%200-.07.025-.041.074l5.81%2010.156c.025.042.013.062-.034.063l-2.795.015a.218.218%200%2000-.2.116l-1.32%202.31c-.044.078-.021.118.068.118l5.716.008c.046%200%20.08.02.104.061l1.403%202.454c.046.081.092.082.139%200l5.006-8.76.783-1.382a.055.055%200%2001.096%200l1.424%202.53a.122.122%200%2000.107.062l2.763-.02a.04.04%200%2000.035-.02.041.041%200%20000-.04l-2.9-5.086a.108.108%200%20010-.113l.293-.507%201.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059%200-.073-.026-.043-.077l1.434-2.505a.107.107%200%20000-.114L9.225%201.774a.06.06%200%2000-.053-.031zm6.29%208.02c.046%200%20.058.02.034.06l-.832%201.465-2.613%204.585a.056.056%200%2001-.05.029.058.058%200%2001-.05-.029L8.498%209.841c-.02-.034-.01-.052.028-.054l.216-.012%206.722-.012z%22%20fill%3D%22url(%23lobe-icons-qwen-_R_0_)%22%20fill-rule%3D%22nonzero%22%3E%3C%2Fpath%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22lobe-icons-qwen-_R_0_%22%20x1%3D%220%25%22%20x2%3D%22100%25%22%20y1%3D%220%25%22%20y2%3D%220%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%236336E7%22%20stop-opacity%3D%22.84%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%236F69F7%22%20stop-opacity%3D%22.84%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3C%2Fsvg%3E"
	},
	"together": {
		monochrome: false,
		src: "data:image/svg+xml,%3Csvg%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3Etogether.ai%3C%2Ftitle%3E%3Cpath%20d%3D%22M23.197%204.503A6%206%200%200015%202.307a5.973%205.973%200%2000-2.995%204.933l5.996.008v.515h-5.996c.039.937.298%201.87.8%202.74a6%206%200%201010.39-6z%22%20fill%3D%22%23EF2CC1%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M.805%204.5A6%206%200%20003%2012.697a5.972%205.972%200%20005.77.127L5.779%207.627l.446-.257%202.997%205.192A6%206%200%2010.804%204.5z%22%20fill%3D%22%23CAAEF5%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M12%2023.894a6%206%200%20005.999-6c0-2.13-1.1-3.996-2.775-5.06l-3.005%205.189-.444-.258%202.997-5.192A6%206%200%201012%2023.894z%22%20fill%3D%22%23FC4C02%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"vercel-ai-gateway": {
		monochrome: true,
		src: "data:image/svg+xml,%3Csvg%20fill%3D%22currentColor%22%20fill-rule%3D%22evenodd%22%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EVercel%3C%2Ftitle%3E%3Cpath%20d%3D%22M12%200l12%2020.785H0L12%200z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"xai": {
		monochrome: true,
		src: "data:image/svg+xml,%3Csvg%20fill%3D%22currentColor%22%20fill-rule%3D%22evenodd%22%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EGrok%3C%2Ftitle%3E%3Cpath%20d%3D%22M6.469%208.776L16.512%2023h-4.464L2.005%208.776H6.47zm-.004%207.9l2.233%203.164L6.467%2023H2l4.465-6.324zM22%202.582V23h-3.659V7.764L22%202.582zM22%201l-9.952%2014.095-2.233-3.163L17.533%201H22z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"xiaomi": {
		monochrome: true,
		src: "data:image/svg+xml,%3Csvg%20role%3D%22img%22%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EXiaomi%3C%2Ftitle%3E%3Cpath%20d%3D%22M12%200C8.016%200%204.756.255%202.493%202.516.23%204.776%200%208.033%200%2012.012c0%203.98.23%207.235%202.494%209.497C4.757%2023.77%208.017%2024%2012%2024c3.983%200%207.243-.23%209.506-2.491C23.77%2019.247%2024%2015.99%2024%2012.012c0-3.984-.233-7.243-2.502-9.504C19.234.252%2015.978%200%2012%200zM4.906%207.405h5.624c1.47%200%203.007.068%203.764.827.746.746.827%202.233.83%203.676v4.54a.15.15%200%200%201-.152.147h-1.947a.15.15%200%200%201-.152-.148V11.83c-.002-.806-.048-1.634-.464-2.051-.358-.36-1.026-.441-1.72-.458H7.158a.15.15%200%200%200-.151.147v6.98a.15.15%200%200%201-.152.148H4.906a.15.15%200%200%201-.15-.148V7.554a.15.15%200%200%201%20.15-.149zm12.131%200h1.949a.15.15%200%200%201%20.15.15v8.892a.15.15%200%200%201-.15.148h-1.949a.15.15%200%200%201-.151-.148V7.554a.15.15%200%200%201%20.151-.149zM8.92%2010.948h2.046c.083%200%20.15.066.15.147v5.352a.15.15%200%200%201-.15.148H8.92a.15.15%200%200%201-.152-.148v-5.352a.15.15%200%200%201%20.152-.147Z%22%2F%3E%3C%2Fsvg%3E"
	},
	"zai": {
		monochrome: true,
		src: "data:image/svg+xml,%3Csvg%20fill%3D%22currentColor%22%20fill-rule%3D%22evenodd%22%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EZ.ai%3C%2Ftitle%3E%3Cpath%20d%3D%22M12.105%202L9.927%204.953H.653L2.83%202h9.276zM23.254%2019.048L21.078%2022h-9.242l2.174-2.952h9.244zM24%202L9.264%2022H0L14.736%202H24z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
	},
	"meta": {
		monochrome: false,
		src: "data:image/svg+xml,%3Csvg%20height%3D%221em%22%20style%3D%22flex%3Anone%3Bline-height%3A1%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%221em%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EMeta%3C%2Ftitle%3E%3Cpath%20d%3D%22M6.897%204h-.024l-.031%202.615h.022c1.715%200%203.046%201.357%205.94%206.246l.175.297.012.02%201.62-2.438-.012-.019a48.763%2048.763%200%2000-1.098-1.716%2028.01%2028.01%200%2000-1.175-1.629C10.413%204.932%208.812%204%206.896%204z%22%20fill%3D%22url(%23lobe-icons-meta-0-_R_0_)%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M6.873%204C4.95%204.01%203.247%205.258%202.02%207.17a4.352%204.352%200%2000-.01.017l2.254%201.231.011-.017c.718-1.083%201.61-1.774%202.568-1.785h.021L6.896%204h-.023z%22%20fill%3D%22url(%23lobe-icons-meta-1-_R_0_)%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M2.019%207.17l-.011.017C1.2%208.447.598%209.995.274%2011.664l-.005.022%202.534.6.004-.022c.27-1.467.786-2.828%201.456-3.845l.011-.017L2.02%207.17z%22%20fill%3D%22url(%23lobe-icons-meta-2-_R_0_)%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M2.807%2012.264l-2.533-.6-.005.022c-.177.918-.267%201.851-.269%202.786v.023l2.598.233v-.023a12.591%2012.591%200%2001.21-2.44z%22%20fill%3D%22url(%23lobe-icons-meta-3-_R_0_)%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M2.677%2015.537a5.462%205.462%200%2001-.079-.813v-.022L0%2014.468v.024a8.89%208.89%200%2000.146%201.652l2.535-.585a4.106%204.106%200%2001-.004-.022z%22%20fill%3D%22url(%23lobe-icons-meta-4-_R_0_)%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M3.27%2016.89c-.284-.31-.484-.756-.589-1.328l-.004-.021-2.535.585.004.021c.192%201.01.568%201.85%201.106%202.487l.014.017%202.018-1.745a2.106%202.106%200%2001-.015-.016z%22%20fill%3D%22url(%23lobe-icons-meta-5-_R_0_)%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M10.78%209.654c-1.528%202.35-2.454%203.825-2.454%203.825-2.035%203.2-2.739%203.917-3.871%203.917a1.545%201.545%200%2001-1.186-.508l-2.017%201.744.014.017C2.01%2019.518%203.058%2020%204.356%2020c1.963%200%203.374-.928%205.884-5.33l1.766-3.13a41.283%2041.283%200%2000-1.227-1.886z%22%20fill%3D%22%230082FB%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M13.502%205.946l-.016.016c-.4.43-.786.908-1.16%201.416.378.483.768%201.024%201.175%201.63.48-.743.928-1.345%201.367-1.807l.016-.016-1.382-1.24z%22%20fill%3D%22url(%23lobe-icons-meta-6-_R_0_)%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M20.918%205.713C19.853%204.633%2018.583%204%2017.225%204c-1.432%200-2.637.787-3.723%201.944l-.016.016%201.382%201.24.016-.017c.715-.747%201.408-1.12%202.176-1.12.826%200%201.6.39%202.27%201.075l.015.016%201.589-1.425-.016-.016z%22%20fill%3D%22%230082FB%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M23.998%2014.125c-.06-3.467-1.27-6.566-3.064-8.396l-.016-.016-1.588%201.424.015.016c1.35%201.392%202.277%203.98%202.361%206.971v.023h2.292v-.022z%22%20fill%3D%22url(%23lobe-icons-meta-7-_R_0_)%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M23.998%2014.15v-.023h-2.292v.022c.004.14.006.282.006.424%200%20.815-.121%201.474-.368%201.95l-.011.022%201.708%201.782.013-.02c.62-.96.946-2.293.946-3.91%200-.083%200-.165-.002-.247z%22%20fill%3D%22url(%23lobe-icons-meta-8-_R_0_)%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M21.344%2016.52l-.011.02c-.214.402-.519.67-.917.787l.778%202.462a3.493%203.493%200%2000.438-.182%203.558%203.558%200%20001.366-1.218l.044-.065.012-.02-1.71-1.784z%22%20fill%3D%22url(%23lobe-icons-meta-9-_R_0_)%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M19.92%2017.393c-.262%200-.492-.039-.718-.14l-.798%202.522c.449.153.927.222%201.46.222.492%200%20.943-.073%201.352-.215l-.78-2.462c-.167.05-.341.075-.517.073z%22%20fill%3D%22url(%23lobe-icons-meta-10-_R_0_)%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M18.323%2016.534l-.014-.017-1.836%201.914.016.017c.637.682%201.246%201.105%201.937%201.337l.797-2.52c-.291-.125-.573-.353-.9-.731z%22%20fill%3D%22url(%23lobe-icons-meta-11-_R_0_)%22%3E%3C%2Fpath%3E%3Cpath%20d%3D%22M18.309%2016.515c-.55-.642-1.232-1.712-2.303-3.44l-1.396-2.336-.011-.02-1.62%202.438.012.02.989%201.668c.959%201.61%201.74%202.774%202.493%203.585l.016.016%201.834-1.914a2.353%202.353%200%2001-.014-.017z%22%20fill%3D%22url(%23lobe-icons-meta-12-_R_0_)%22%3E%3C%2Fpath%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22lobe-icons-meta-0-_R_0_%22%20x1%3D%2275.897%25%22%20x2%3D%2226.312%25%22%20y1%3D%2289.199%25%22%20y2%3D%2212.194%25%22%3E%3Cstop%20offset%3D%22.06%25%22%20stop-color%3D%22%230867DF%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%2245.39%25%22%20stop-color%3D%22%230668E1%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%2285.91%25%22%20stop-color%3D%22%230064E0%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22lobe-icons-meta-1-_R_0_%22%20x1%3D%2221.67%25%22%20x2%3D%2297.068%25%22%20y1%3D%2275.874%25%22%20y2%3D%2223.985%25%22%3E%3Cstop%20offset%3D%2213.23%25%22%20stop-color%3D%22%230064DF%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%2299.88%25%22%20stop-color%3D%22%230064E0%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22lobe-icons-meta-2-_R_0_%22%20x1%3D%2238.263%25%22%20x2%3D%2260.895%25%22%20y1%3D%2289.127%25%22%20y2%3D%2216.131%25%22%3E%3Cstop%20offset%3D%221.47%25%22%20stop-color%3D%22%230072EC%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%2268.81%25%22%20stop-color%3D%22%230064DF%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22lobe-icons-meta-3-_R_0_%22%20x1%3D%2247.032%25%22%20x2%3D%2252.15%25%22%20y1%3D%2290.19%25%22%20y2%3D%2215.745%25%22%3E%3Cstop%20offset%3D%227.31%25%22%20stop-color%3D%22%23007CF6%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%2299.43%25%22%20stop-color%3D%22%230072EC%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22lobe-icons-meta-4-_R_0_%22%20x1%3D%2252.155%25%22%20x2%3D%2247.591%25%22%20y1%3D%2258.301%25%22%20y2%3D%2237.004%25%22%3E%3Cstop%20offset%3D%227.31%25%22%20stop-color%3D%22%23007FF9%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23007CF6%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22lobe-icons-meta-5-_R_0_%22%20x1%3D%2237.689%25%22%20x2%3D%2261.961%25%22%20y1%3D%2212.502%25%22%20y2%3D%2263.624%25%22%3E%3Cstop%20offset%3D%227.31%25%22%20stop-color%3D%22%23007FF9%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%230082FB%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22lobe-icons-meta-6-_R_0_%22%20x1%3D%2234.808%25%22%20x2%3D%2262.313%25%22%20y1%3D%2268.859%25%22%20y2%3D%2223.174%25%22%3E%3Cstop%20offset%3D%2227.99%25%22%20stop-color%3D%22%23007FF8%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%2291.41%25%22%20stop-color%3D%22%230082FB%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22lobe-icons-meta-7-_R_0_%22%20x1%3D%2243.762%25%22%20x2%3D%2257.602%25%22%20y1%3D%226.235%25%22%20y2%3D%2298.514%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230082FB%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%2299.95%25%22%20stop-color%3D%22%230081FA%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22lobe-icons-meta-8-_R_0_%22%20x1%3D%2260.055%25%22%20x2%3D%2239.88%25%22%20y1%3D%224.661%25%22%20y2%3D%2269.077%25%22%3E%3Cstop%20offset%3D%226.19%25%22%20stop-color%3D%22%230081FA%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%230080F9%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22lobe-icons-meta-9-_R_0_%22%20x1%3D%2230.282%25%22%20x2%3D%2261.081%25%22%20y1%3D%2259.32%25%22%20y2%3D%2233.244%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23027AF3%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%230080F9%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22lobe-icons-meta-10-_R_0_%22%20x1%3D%2220.433%25%22%20x2%3D%2282.112%25%22%20y1%3D%2250.001%25%22%20y2%3D%2250.001%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230377EF%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%2299.94%25%22%20stop-color%3D%22%230279F1%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22lobe-icons-meta-11-_R_0_%22%20x1%3D%2240.303%25%22%20x2%3D%2272.394%25%22%20y1%3D%2235.298%25%22%20y2%3D%2257.811%25%22%3E%3Cstop%20offset%3D%22.19%25%22%20stop-color%3D%22%230471E9%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%230377EF%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22lobe-icons-meta-12-_R_0_%22%20x1%3D%2232.254%25%22%20x2%3D%2268.003%25%22%20y1%3D%2219.719%25%22%20y2%3D%2284.908%25%22%3E%3Cstop%20offset%3D%2227.65%25%22%20stop-color%3D%22%230867DF%22%3E%3C%2Fstop%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%230471E9%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3C%2Fsvg%3E"
	}
};
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/CatalogModelCard.tsx
function capacity(value, _t) {
	if (value === void 0) return _t("catalogUnknown");
	return value >= 1e6 ? `${Number((value / 1e6).toFixed(2))}M` : value >= 1e3 ? `${Number((value / 1e3).toFixed(2))}K` : String(value);
}
function Mark({ id }) {
	const icon = vendorIcons[id];
	return icon ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
		className: VendorCatalog_module_css_default["mark"],
		"data-vendor-icon": id,
		"data-monochrome": icon.monochrome,
		src: icon.src,
		alt: "",
		width: 32,
		height: 32
	}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
		className: VendorCatalog_module_css_default["mark"],
		viewBox: "0 0 24 24",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
			d: "m12 3 9 9-9 9-9-9Z",
			fill: "none",
			stroke: "currentColor"
		})
	});
}
function Modalities({ model, t }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
		className: VendorCatalog_module_css_default["chips"],
		children: model.inputModalities?.length ? model.inputModalities.map((input) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: input === "text" ? t("catalogText") : input === "image" ? t("catalogImage") : input === "audio" ? t("catalogAudio") : input === "video" ? t("catalogVideo") : t("catalogOtherInput") }, input)) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("catalogUnknown") })
	});
}
function CatalogModelCard({ model, vendor, speech, t, children, href }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
		className: VendorCatalog_module_css_default["modelCard"],
		"data-model-kind": speech ? "speech" : "chat",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: VendorCatalog_module_css_default["cardTop"],
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Mark, { id: vendor }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						"aria-label": model.name,
						children: href ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
							href,
							"aria-label": `${t("catalogViewModel")} ${model.name}`,
							children: model.name
						}) : model.name
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: VendorCatalog_module_css_default["headerActions"],
						children
					})
				]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: VendorCatalog_module_css_default["modelCapacity"],
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Modalities, {
					model,
					t
				})
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
				className: VendorCatalog_module_css_default["modelDetails"],
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: t("catalogModelDetail") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: model.id })]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: VendorCatalog_module_css_default["modelCapacity"],
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t(speech ? "catalogOutput" : "contextWindow") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: speech ? t("catalogText") : capacity(model.contextWindow, t) })]
			})
		]
	});
}
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/speech-models.ts
/** 已接入企业实时语音协议的 Qwen 模型；不注册到对话模型或 Agent 模型选择器。 */
const qwenSpeechModels = [
	{
		id: "qwen-audio-3.1-asr-flash-streaming",
		name: "Qwen Audio 3.1 ASR Streaming",
		inputModalities: ["audio"],
		endpointPath: "/inference"
	},
	{
		id: "qwen3-asr-flash-realtime",
		name: "Qwen3 ASR Flash Realtime",
		inputModalities: ["audio"],
		endpointPath: "/realtime"
	},
	{
		id: "qwen3-asr-flash-realtime-2026-02-10",
		name: "Qwen3 ASR Flash Realtime · 2026-02-10",
		inputModalities: ["audio"],
		endpointPath: "/realtime"
	}
];
function findSpeechModel(id) {
	return qwenSpeechModels.find((model) => model.id === id);
}
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/VendorCatalog.tsx
/** 模型目录的三级页面；链接携带稳定身份，刷新和浏览器返回均可恢复页面。 */
function href(location = {}) {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(location)) if (value) params.set(key, value);
	return "/admin/models" + (params.size ? `?${params}` : "");
}
function Badge({ active, t }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
		className: VendorCatalog_module_css_default["status"],
		"data-active": active,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { "aria-hidden": "true" }), t(active ? "enabledConnections" : "disabledConnections")]
	});
}
/** 主模型和插件专用连接共用卡片骨架、间距及动作位置。 */
function CatalogVendorCard({ title, identity, actions, summary, status, version, details, label }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
		className: VendorCatalog_module_css_default["vendorCard"],
		"data-model-card": "vendor-summary",
		"aria-label": label,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: VendorCatalog_module_css_default["cardTop"],
				children: [
					identity,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: title }),
					actions
				]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: VendorCatalog_module_css_default["cardStats"],
				children: summary
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", { children: [
				status,
				version && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: VendorCatalog_module_css_default["version"],
					children: ["v", version]
				}),
				details
			] })
		]
	});
}
function connectionLabel(row, t) {
	return row.entry.provider === "qwen-token-plan" ? t("qwenSubscription") : row.entry.provider === "qwen-token-plan-cn" ? t("qwenSubscriptionCn") : row.entry.provider === "qwen-token-plan-individual" ? t("qwenSubscriptionIndividual") : row.entry.displayName;
}
function credential(row, t) {
	return t(!row.entry.vendor.credentialRef ? "nativeAuthentication" : row.credential === void 0 ? "credentialUnknown" : row.credential.configured ? "credentialConfigured" : "credentialMissing");
}
function Pagination({ page, total, onChange, t }) {
	if (total <= 1) return null;
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("nav", {
		className: VendorCatalog_module_css_default["pagination"],
		"aria-label": t("catalogPagination"),
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				disabled: page === 0,
				onClick: () => onChange(page - 1),
				children: t("catalogPrevious")
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
				page + 1,
				" / ",
				total
			] }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				disabled: page + 1 >= total,
				onClick: () => onChange(page + 1),
				children: t("catalogNext")
			})
		]
	});
}
function VendorCatalog({ rows, location, t, readOnly, saved, editor, modelBusy, modelError, onModelChange, onConnectionChange, onVendorChange, renderSpeechControls, webSearch, nativeControls, embedded, renderModelControls }) {
	const [query, setQuery] = (0, react.useState)("");
	const [filter, setFilter] = (0, react.useState)("all");
	const [page, setPage] = (0, react.useState)(0);
	const [editing, setEditing] = (0, react.useState)();
	const [dismissed, setDismissed] = (0, react.useState)(false);
	const groups = /* @__PURE__ */ new Map();
	for (const row of rows) if (row.entry.vendor) groups.set(row.entry.vendor.id, [...groups.get(row.entry.vendor.id) ?? [], row]);
	const allGroups = [...groups.values()].sort((a, b) => (nativeControls ? Number(b.some((row) => row.credential?.configured)) - Number(a.some((row) => row.credential?.configured)) : 0) || Number(b.some((row) => row.entry.active)) - Number(a.some((row) => row.entry.active)) || a[0].entry.vendor.name.localeCompare(b[0].entry.vendor.name));
	const group = location.vendor ? groups.get(location.vendor) : void 0;
	const selectedRow = group && (location.connection ? group.find((row) => row.entry.provider === location.connection) : group.find((row) => row.entry.active) ?? group[0]);
	const vendor = selectedRow?.entry.vendor;
	const selectedModel = location.model ? vendor?.models.find((model) => model.id === location.model) : void 0;
	const selectedSpeechModel = vendor?.id === "qwen" ? findSpeechModel(location.model) : void 0;
	const detailModel = selectedSpeechModel ?? selectedModel;
	const needle = query.trim().toLocaleLowerCase();
	const base = vendor && selectedRow ? {
		vendor: vendor.id,
		connection: selectedRow.entry.provider
	} : {};
	const isConfiguration = location.tab === "connection" && !location.model;
	const isSpeech = vendor?.id === "qwen" && location.tab === "speech";
	const speechConnection = isSpeech || selectedSpeechModel ? rows.find((row) => row.entry.vendor?.id === "qwen" && row.entry.vendor.credentialRef === "QWEN_API_KEY" && !row.entry.provider.startsWith("qwen-token-plan")) : void 0;
	const editingRow = rows.find((row) => row.entry.provider === editing) ?? (!dismissed && isConfiguration ? selectedRow : void 0);
	const closeEditor = () => {
		setEditing(void 0);
		setDismissed(true);
	};
	const connectionActions = (row, showToggle = true, family) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: VendorCatalog_module_css_default["headerActions"],
		title: nativeControls?.[row.entry.provider]?.reason,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": `${t("configureConnection")} ${row.entry.vendor.name}`,
			onClick: () => setEditing(row.entry.provider),
			children: t("configureConnection")
		}), showToggle && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Switch, {
			checked: family ? family.some((item) => item.entry.active) : row.entry.active,
			label: `${t("enableConnection")} ${family ? row.entry.vendor.name : connectionLabel(row, t)}`,
			disabled: readOnly || modelBusy || !onConnectionChange || (family ? family.some((item) => item.entry.active && nativeControls?.[item.entry.provider]?.canToggle === false) || !family.some((item) => nativeControls?.[item.entry.provider]?.canToggle !== false) : nativeControls?.[row.entry.provider]?.canToggle === false),
			onChange: (enabled) => family && onVendorChange ? onVendorChange(family, enabled) : onConnectionChange?.(row, enabled)
		})]
	});
	const modelCount = (items) => new Set(items.flatMap((row) => [...row.entry.vendor.models, ...!nativeControls && row.entry.vendor.id === "qwen" ? qwenSpeechModels : []].map((model) => model.id))).size;
	const filteredGroups = allGroups.filter((items) => {
		const active = items.some((row) => row.entry.active);
		return (filter === "all" || filter === "enabled" === active) && items.some((row) => [
			row.entry.vendor.name,
			row.entry.displayName,
			...row.entry.vendor.id === "deepseek" && webSearch ? [t("webSearch")] : [],
			...row.entry.vendor.id === "qwen" ? [t("catalogSpeech"), ...qwenSpeechModels.flatMap((model) => [model.name, model.id])] : [],
			...row.entry.vendor.models.flatMap((model) => [model.name, model.id])
		].some((label) => label.toLocaleLowerCase().includes(needle)));
	});
	const filteredModels = (isSpeech ? qwenSpeechModels : [...vendor?.models ?? [], ...!nativeControls && vendor?.id === "qwen" ? qwenSpeechModels : []]).filter((model) => `${model.name} ${model.id}`.toLocaleLowerCase().includes(needle));
	const showSearch = vendor?.id === "deepseek" && webSearch && `${t("webSearch")} DeepSeek`.toLocaleLowerCase().includes(needle);
	const shownPage = Math.min(page, Math.max(0, Math.ceil(filteredModels.length / 24) - 1));
	const modelSwitch = (model) => renderModelControls ? renderModelControls(selectedRow, model) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: VendorCatalog_module_css_default["modelSwitch"],
		title: nativeControls && nativeControls[selectedRow.entry.provider]?.canModelToggle !== true ? "此连接的模型清单由 DSH 原生认证维护。" : void 0,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t(model.enabled === false ? "modelBlocked" : !selectedRow.entry.active ? "connectionDisabled" : selectedRow.credential?.configured === false ? "credentialMissing" : "modelAllowed") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Switch, {
			checked: model.enabled !== false,
			label: `${t("enableModel")} ${model.name}`,
			disabled: readOnly || modelBusy || Boolean(nativeControls && nativeControls[selectedRow.entry.provider]?.canModelToggle !== true),
			onChange: (enabled) => onModelChange(selectedRow, model.id, enabled)
		})]
	});
	if (location.vendor && !vendor || location.model && !detailModel || location.connection && !location.vendor) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: VendorCatalog_module_css_default["catalog"],
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
			className: [VendorCatalog_module_css_default["back"], NavigationLink_module_css_default.link].join(" "),
			href: href(),
			children: t("catalogAllVendors")
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			role: "alert",
			className: VendorCatalog_module_css_default["empty"],
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("catalogNotFound") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("catalogNotFoundHelp") })]
		})]
	});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: VendorCatalog_module_css_default["catalog"],
		"data-model-page": detailModel ? "model" : vendor ? "vendor" : "catalog",
		children: [
			vendor && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("nav", {
				className: VendorCatalog_module_css_default["breadcrumbs"],
				"aria-label": t("catalogBreadcrumbs"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
						href: href(),
						children: t("catalogAllVendors")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						"aria-hidden": "true",
						children: "/"
					}),
					detailModel ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
							href: href(base),
							children: vendor.name
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							children: "/"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							"aria-current": "page",
							children: detailModel.name
						})
					] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						"aria-current": "page",
						children: vendor.name
					})
				]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
				"aria-hidden": embedded && !vendor ? true : void 0,
				className: vendor ? VendorCatalog_module_css_default["heading"] : VendorCatalog_module_css_default["visuallyHidden"],
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: VendorCatalog_module_css_default["headingIdentity"],
					children: [vendor && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Mark, { id: vendor.id }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: detailModel?.name ?? vendor?.name ?? t("title") })]
				}), selectedRow && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: VendorCatalog_module_css_default["headerActions"],
					children: [
						selectedModel ? modelSwitch(selectedModel) : null,
						selectedSpeechModel ? renderSpeechControls?.(selectedSpeechModel, "QWEN_API_KEY") : null,
						connectionActions(speechConnection ?? selectedRow, !(isSpeech || selectedSpeechModel))
					]
				})]
			}),
			readOnly && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: VendorCatalog_module_css_default["notice"],
				children: t("readOnly")
			}),
			saved && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				role: "status",
				className: VendorCatalog_module_css_default["success"],
				children: t("vendorSaved")
			}),
			modelError && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				role: "alert",
				className: VendorCatalog_module_css_default["notice"],
				children: modelError
			}),
			!vendor && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: VendorCatalog_module_css_default["toolbar"],
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("vendorSearch") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "search",
						value: query,
						onChange: (event) => setQuery(event.target.value)
					})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: VendorCatalog_module_css_default["statusFilter"],
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("vendorFilter") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
							"aria-label": t("vendorFilter"),
							className: ModelsSection_module_css_default["selectInput"],
							value: filter,
							onChange: (event) => setFilter(event.target.value),
							children: [
								"all",
								"enabled",
								"disabled"
							].map((value) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value,
								children: t(value === "all" ? "catalogAll" : value === "enabled" ? "enabledConnections" : "disabledConnections")
							}, value))
						})]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
					className: VendorCatalog_module_css_default["resultCount"],
					children: [
						filteredGroups.length,
						" / ",
						groups.size
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: VendorCatalog_module_css_default["grid"],
					children: filteredGroups.map((items) => {
						const item = items[0].entry.vendor;
						const active = items.some((row) => row.entry.active);
						return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CatalogVendorCard, {
							title: item.name,
							identity: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Mark, { id: item.id }),
							actions: connectionActions(items.find((row) => row.credential?.configured) ?? items.find((row) => row.entry.active) ?? items[0], true, items),
							summary: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								nativeControls && !items.some((row) => nativeControls[row.entry.provider]?.modelsKnown) ? t("catalogNoModels") : t("modelCount").replace("{count}", String(modelCount(items))),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: "·"
								}),
								items.length,
								" ",
								t("catalogConnections")
							] }),
							status: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
								active,
								t
							}),
							version: item.version,
							details: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								className: NavigationLink_module_css_default.link,
								href: href({ vendor: item.id }),
								"aria-label": `${t("catalogViewVendor")} ${item.name}`,
								children: t("catalogDetails")
							})
						}, item.id);
					})
				}),
				filteredGroups.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: VendorCatalog_module_css_default["empty"],
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("vendorNoResults") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("catalogSearchHelp") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							onClick: () => {
								setQuery("");
								setFilter("all");
							},
							children: t("catalogReset")
						})
					]
				})
			] }),
			vendor && selectedRow && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				selectedRow.entry.error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					role: "alert",
					className: VendorCatalog_module_css_default["notice"],
					children: t("vendorUpdateRejected")
				}),
				!detailModel && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [!isSpeech && group.length > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: VendorCatalog_module_css_default["connectionPicker"],
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("catalogConnectionRoute") }), group.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
						href: href({
							vendor: vendor.id,
							connection: row.entry.provider
						}),
						"aria-current": row === selectedRow ? "page" : void 0,
						children: connectionLabel(row, t)
					}, row.entry.provider))]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: VendorCatalog_module_css_default["toolbar"],
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "search",
							"aria-label": t("modelSearch"),
							placeholder: t("modelSearch"),
							value: query,
							onChange: (event) => {
								setQuery(event.target.value);
								setPage(0);
							}
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: VendorCatalog_module_css_default["muted"],
							children: t("modelCount").replace("{count}", String(filteredModels.length))
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: VendorCatalog_module_css_default["grid"],
						children: [filteredModels.slice(shownPage * 24, (shownPage + 1) * 24).map((model) => {
							const speech = findSpeechModel(model.id) !== void 0 && vendor.id === "qwen";
							return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CatalogModelCard, {
								model,
								vendor: vendor.id,
								speech,
								t,
								href: href({
									...base,
									model: model.id
								}),
								children: speech ? renderSpeechControls?.(model, "QWEN_API_KEY") : modelSwitch(model)
							}, model.id);
						}), showSearch && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
							className: VendorCatalog_module_css_default["modelCard"],
							"aria-label": t("webSearch"),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: VendorCatalog_module_css_default["cardTop"],
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Mark, { id: "deepseek" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("webSearch") }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: VendorCatalog_module_css_default["headerActions"],
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Switch, {
												checked: webSearch.enabled,
												label: t("enableWebSearch"),
												disabled: readOnly || modelBusy || !webSearch.writable || webSearch.busy,
												onChange: webSearch.onChange
											})
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: VendorCatalog_module_css_default["modelCapacity"],
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("webSearchCredential") })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: VendorCatalog_module_css_default["muted"],
									children: credential(selectedRow, t)
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
									active: webSearch.enabled && selectedRow.entry.active && selectedRow.credential?.configured === true,
									t
								})] }),
								webSearch.error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "alert",
									className: VendorCatalog_module_css_default["notice"],
									children: webSearch.error
								})
							]
						})]
					}),
					filteredModels.length === 0 && !showSearch && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: VendorCatalog_module_css_default["empty"],
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("vendorNoResults") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("catalogSearchHelp") })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pagination, {
						page: shownPage,
						total: Math.ceil(filteredModels.length / 24),
						onChange: setPage,
						t
					})
				] })] }),
				selectedModel && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: VendorCatalog_module_css_default["metrics"],
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("contextWindow") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: capacity(selectedModel.contextWindow, t) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "tokens" })
						] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("maxTokens") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: capacity(selectedModel.maxTokens, t) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "tokens" })
						] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("catalogInput") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Modalities, {
							model: selectedModel,
							t
						})] })
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: VendorCatalog_module_css_default["detailGrid"],
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: VendorCatalog_module_css_default["panel"],
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("catalogModelInformation") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
							className: VendorCatalog_module_css_default["facts"],
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("modelName") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: selectedModel.name })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("modelId") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: selectedModel.id }) })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("catalogVendor") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: vendor.name })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("catalogConnectionRoute") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: selectedRow.entry.displayName })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("packageVersion") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: vendor.version })] })
							]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
						className: VendorCatalog_module_css_default["sidePanel"],
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("catalogAccess") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
								active: selectedRow.entry.active,
								t
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: credential(selectedRow, t) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								className: NavigationLink_module_css_default.link,
								href: href({
									...base,
									tab: "connection"
								}),
								children: t("catalogConnectionSettings")
							})
						]
					})]
				})] }),
				selectedSpeechModel && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: VendorCatalog_module_css_default["metrics"],
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("catalogInput") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Modalities, {
							model: selectedSpeechModel,
							t
						})] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("catalogOutput") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("catalogText") })] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("catalogMode") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("catalogSpeech") })] })
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: VendorCatalog_module_css_default["panel"],
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("catalogModelInformation") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
						className: VendorCatalog_module_css_default["facts"],
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("modelName") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: selectedSpeechModel.name })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("modelId") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: selectedSpeechModel.id }) })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("catalogVendor") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: vendor.name })] })
						]
					})]
				})] })
			] }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Modal$2, {
				className: ModelsSection_module_css_default["vendorDialog"],
				open: editingRow !== void 0,
				title: `${editingRow?.entry.vendor?.name ?? ""} · ${t("catalogConnectionSettings")}`,
				closeLabel: t("close"),
				onClose: closeEditor,
				children: editingRow && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: VendorCatalog_module_css_default["muted"],
					children: credential(editingRow, t)
				}), editor(editingRow, closeEditor)] })
			})
		]
	});
}
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/VendorModelsPanel.tsx
/** 厂商共享连接和模型独立启停；开发者定义的模型能力保持只读。 */
function VendorModelsPanel({ rows, namespaces, operations, t, readOnly, onSaved, renderSpeechControls, webSearch, location = {} }) {
	const [saved, setSaved] = (0, react.useState)(false);
	const [busy, setBusy] = (0, react.useState)(false);
	const [error, setError] = (0, react.useState)();
	const toggleConnection = async (row, enabled) => {
		if (readOnly || busy) return;
		const namespace = namespaces.get(row.entry.settingsNs);
		if (!namespace) {
			setError(t("loadFailed"));
			return;
		}
		setBusy(true);
		setSaved(false);
		setError(void 0);
		try {
			const result = await operations.writeSettings(row.entry.settingsNs, [{
				op: "set",
				path: [...row.entry.settingsPath, "enabled"],
				value: enabled
			}], namespace.revision);
			if (result.kind !== "written") {
				setError(result.message);
				await onSaved();
				return;
			}
			await onSaved();
			setSaved(true);
		} catch {
			setError(t("modelSaveFailed"));
		} finally {
			setBusy(false);
		}
	};
	const toggleModel = async (row, model, enabled) => {
		if (readOnly || busy) return;
		const namespace = namespaces.get(row.entry.settingsNs);
		if (!namespace) {
			setError(t("loadFailed"));
			return;
		}
		setBusy(true);
		setSaved(false);
		setError(void 0);
		try {
			const result = await operations.writeSettings(row.entry.settingsNs, [{
				op: "set",
				path: [
					...row.entry.settingsPath,
					"modelEnabled",
					model
				],
				value: enabled
			}], namespace.revision);
			if (result.kind !== "written") {
				setError(result.message);
				await onSaved();
				return;
			}
			await onSaved();
			setSaved(true);
		} catch {
			setError(t("modelSaveFailed"));
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(VendorCatalog, {
		rows,
		location,
		t,
		readOnly,
		saved,
		modelBusy: busy,
		modelError: error,
		renderSpeechControls,
		webSearch,
		onConnectionChange: (row, enabled) => {
			toggleConnection(row, enabled);
		},
		onModelChange: (row, model, enabled) => {
			toggleModel(row, model, enabled);
		},
		editor: (row, close) => {
			const namespace = namespaces.get(row.entry.settingsNs);
			if (!namespace) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				role: "alert",
				className: ModelsSection_module_css_default["error"],
				children: t("loadFailed")
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConnectionEditor$1, {
				row,
				namespace,
				operations,
				t,
				readOnly,
				onCancel: close,
				onSaving: () => setSaved(false),
				onSaved: async () => {
					await onSaved();
					setSaved(true);
					close?.();
				}
			}, row.entry.provider);
		}
	}, JSON.stringify(location));
}
function ConnectionEditor$1({ row, namespace, operations, t, readOnly, onSaved, onCancel, onSaving, preserveNativeAuthentication = false }) {
	const vendor = row.entry.vendor;
	const [timeout, setTimeoutValue] = (0, react.useState)(row.entry.settingsPath.reduce((value, key) => typeof value === "object" && value !== null ? Reflect.get(value, key) : void 0, namespace.value)?.streamIdleTimeoutMs ?? 3e5);
	const [key, setKey] = (0, react.useState)("");
	const [busy, setBusy] = (0, react.useState)(false);
	const [revision, setRevision] = (0, react.useState)(namespace.revision);
	const [error, setError] = (0, react.useState)();
	const ref = row.apiKeyEnv ?? vendor.credentialRef;
	const save = async () => {
		if (readOnly || busy) return;
		onSaving();
		setBusy(true);
		setError(void 0);
		try {
			const result = await operations.writeSettings(row.entry.settingsNs, [...ref && (!preserveNativeAuthentication || key.trim()) ? [{
				op: "set",
				path: [...row.entry.settingsPath, "apiKeyEnv"],
				value: ref
			}] : [], {
				op: "set",
				path: [...row.entry.settingsPath, "streamIdleTimeoutMs"],
				value: timeout
			}], revision);
			if (result.kind !== "written") {
				setError(result.message);
				return;
			}
			setRevision(result.view.revision);
			if (key.trim()) {
				const failure = await operations.storeCredential(ref, key.trim());
				if (failure) {
					setError(`${t("vendorPartialSave")} ${failure}`);
					return;
				}
				setKey("");
			}
			await onSaved();
		} catch {
			setError(t("serviceCredentialFailed"));
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
		className: ModelsSection_module_css_default["vendorEditor"],
		onSubmit: (event) => {
			event.preventDefault();
			save();
		},
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
				disabled: readOnly || busy,
				className: ModelsSection_module_css_default["vendorFields"],
				children: [ref && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
					className: ModelsSection_module_css_default["field"],
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["fieldLabel"],
							children: t("keyInput")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: ModelsSection_module_css_default["input"],
							type: "password",
							"aria-label": t("keyInput"),
							autoComplete: "new-password",
							value: key,
							onChange: (event) => setKey(event.target.value)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["vendorMeta"],
							children: t("vendorKeyHelp")
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
					className: ModelsSection_module_css_default["vendorAdvanced"],
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: t("advancedSettings") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: ModelsSection_module_css_default["field"],
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["fieldLabel"],
							children: t("connectionTimeoutSeconds")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: ModelsSection_module_css_default["input"],
							type: "number",
							required: true,
							min: 1,
							max: 3600,
							step: 1,
							value: timeout / 1e3,
							onChange: (event) => setTimeoutValue(Number(event.target.value) * 1e3)
						})]
					})]
				})]
			}),
			error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				role: "alert",
				className: ModelsSection_module_css_default["error"],
				children: error
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["vendorEditorActions"],
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					className: ModelsSection_module_css_default["secondaryButton"],
					disabled: busy,
					type: "button",
					onClick: onCancel,
					children: t("cancel")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					className: ModelsSection_module_css_default["primaryButton"],
					disabled: readOnly || busy,
					type: "submit",
					children: busy ? t("applying") : t("saveConnection")
				})]
			})
		]
	});
}
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/ModelPurposes.tsx
/** 企业管理员同页选择识别用途，复用现有配置修订和保存接口。 */
function ModelPurposes({ namespace, rows, operations, readOnly, onSaved, t }) {
	const [busy, setBusy] = (0, react.useState)(false), [error, setError] = (0, react.useState)();
	const [open, setOpen] = (0, react.useState)(false);
	if (!namespace) return null;
	const values = namespace.value;
	const choices = rows.filter((row) => row.entry.active && row.credential?.configured !== false).flatMap((row) => row.entry.vendor?.models.filter((model) => model.enabled !== false && model.inputModalities?.includes("image")).map((model) => ({
		row,
		model,
		key: `${row.entry.provider}/${model.id}`
	})) ?? []);
	const save = async (purpose, key) => {
		if (readOnly || busy) return;
		setBusy(true);
		setError(void 0);
		const choice = choices.find((item) => item.key === key);
		try {
			const result = await operations.writeSettings(namespace.ns, [{
				op: "set",
				path: [purpose],
				value: choice ? {
					provider: choice.row.entry.provider,
					model: choice.model.id
				} : null
			}], namespace.revision);
			if (result.kind !== "written") setError(result.message);
			await onSaved();
		} catch {
			setError(t("modelSaveFailed"));
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: VendorCatalog_module_css_default["catalogActions"],
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
			size: "sm",
			variant: "outline",
			onClick: () => setOpen(true),
			children: t("advancedSettings")
		})
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Modal$2, {
		open,
		title: t("modelPurposes"),
		closeLabel: t("close"),
		onClose: () => setOpen(false),
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
			className: VendorCatalog_module_css_default["purposePanel"],
			"aria-label": t("modelPurposes"),
			children: [
				["vision", "ocr"].map((purpose) => {
					const current = values[purpose], key = current ? `${current.provider}/${current.model}` : "";
					const available = choices.filter((choice) => purpose !== "vision" || choice.model.purpose !== "ocr");
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t(purpose === "vision" ? "visionPurpose" : "ocrPurpose") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
						className: ModelsSection_module_css_default["selectInput"],
						"aria-label": t(purpose === "vision" ? "visionPurpose" : "ocrPurpose"),
						value: key,
						disabled: readOnly || busy,
						onChange: (event) => {
							save(purpose, event.target.value);
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "",
								children: t("purposeUnconfigured")
							}),
							key && !available.some((choice) => choice.key === key) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
								value: key,
								children: [
									current.model,
									"（",
									t("purposeUnavailable"),
									"）"
								]
							}),
							available.map((choice) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
								value: choice.key,
								children: [
									choice.model.name,
									" · ",
									choice.row.entry.vendor.name
								]
							}, choice.key))
						]
					})] }, purpose);
				}),
				busy && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					role: "status",
					children: t("applying")
				}),
				error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					role: "alert",
					children: error
				})
			]
		})
	})] });
}
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/ModelsSection.tsx
/**
* Models settings section: the provider rows joined from the configurable
* directory, settings namespaces, and credential states, with one editor
* card at a time. Rows expose only confirmed API-key state through accessible
* solid configured or missing dots. A whole-section provider without a
* configured key renders as its open setup card instead of a row, but only in
* the first-run posture — no provider on the page can serve requests yet — and
* only until the user closes that card; the add flow is a card carrying the
* dormant-provider select. Each card kind owns its own open state, so closing
* one never discards a draft in another. Every mutation writes through the
* wire, while a provider removal first requires confirmation; the page
* re-renders from pushed invalidations or the post-apply reload.
*/
/** Render an editor for either the setup posture or an expanded provider row. */
function renderProviderEditor({ target, ...props }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProviderEditor, {
		provider: target.provider,
		displayName: target.displayName,
		settingsPath: target.settingsPath,
		...target.declared === true ? { declared: true } : {},
		...props
	});
}
/**
* Remove one user-added provider and its page-managed credential. Credential
* removal comes first so a second-step failure leaves the provider row visible
* and the whole operation safely retryable; both unsets are idempotent.
* The settings removal names the profile rather than rebuilding its whole
* namespace from a partial view.
* @param operations - the page's Host operations.
* @param controller - the page store to refresh.
* @param target - the provider's settings address and optional managed credential.
* @returns the failure message, or undefined once the write and reload landed.
*/
async function removeProviderProfile(operations, controller, target) {
	if (target.credentialRef !== void 0) {
		const credential = await operations.removeCredential(target.credentialRef);
		if (credential !== void 0) return credential;
	}
	const written = await operations.writeSettings(target.settingsNs, [{
		op: "unset",
		path: [...target.settingsPath]
	}], void 0);
	if (written.kind !== "written") return written.message;
	await controller.load();
}
/**
* Whether a whole-section provider still needs its first key: an unconfigured
* credential opens the setup card instead of showing a row. This is the
* first-run posture alone — a user who can already reach some provider gets an
* ordinary row with the missing-key dot, since nothing here is blocking them.
* @param row - the joined provider row.
* @param anyUsable - whether any joined row can already serve requests.
* @returns whether to render the setup card.
*/
function needsSetup(row, anyUsable) {
	if (anyUsable) return false;
	if (row.entry.settingsPath.length > 0) return false;
	return row.credential?.configured !== true;
}
/**
* The provider-card seat's credential fact: the reference this page would use
* for the row — the profile's `apiKeyEnv`, or the page's derived
* `<ROUTE>_API_KEY` while the profile names none — confirmed configured. The
* derived half is what keeps the seat consistent with the editor on the
* add-provider draft, whose dormant row names no reference yet.
*/
function keyConfiguredOf(row) {
	return row.apiKeyEnv !== void 0 ? row.credential?.configured === true : row.derivedCredential?.configured === true;
}
function targetOf(row) {
	const managedRef = deriveKeyRef(row.entry.provider);
	const credentialRef = row.apiKeyEnv === managedRef && row.credential?.configured === true && row.credential.writable ? managedRef : void 0;
	return {
		provider: row.entry.provider,
		displayName: row.entry.displayName,
		settingsNs: row.entry.settingsNs,
		settingsPath: row.entry.settingsPath,
		...credentialRef === void 0 ? {} : { credentialRef },
		...row.entry.declared === true ? { declared: true } : {}
	};
}
/** Stable visible and accessible identity for one provider target. */
function providerTargetLabel(target) {
	return target.provider === target.displayName ? target.provider : `${target.displayName} (${target.provider})`;
}
/** Replace the one provider placeholder in localized destructive-action copy. */
function providerCopy(template, target) {
	return template.replace("{provider}", () => providerTargetLabel(target));
}
/**
* Render the Models section content column.
* @param props - slot-delivered injected dependencies.
* @returns the section, or null while the shell has not injected yet.
*/
function ModelsSection(props) {
	const { controller, useSnapshot, operations, schema, t, renderSlot } = props;
	if (controller === void 0 || useSnapshot === void 0 || operations === void 0 || schema === void 0 || t === void 0) return null;
	const search = props.catalogSearch === void 0 ? void 0 : new URLSearchParams(props.catalogSearch);
	const catalogLocation = search === void 0 ? props.catalogLocation : Object.fromEntries([
		"vendor",
		"connection",
		"model",
		"tab"
	].flatMap((key) => {
		const value = search.get(key);
		return value ? [[key, value]] : [];
	}));
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Loaded, {
		injected: {
			controller,
			useSnapshot,
			operations,
			schema,
			t,
			...props.providerCards === void 0 ? {} : { providerCards: props.providerCards },
			...catalogLocation ? { catalogLocation } : {}
		},
		renderSlot,
		readOnly: props.readOnly === true,
		...props.webSearch ? { webSearch: props.webSearch } : {}
	});
}
function Loaded({ injected, renderSlot, readOnly, webSearch }) {
	const { controller, operations, schema, t } = injected;
	const [synchronizing, setSynchronizing] = (0, react.useState)(false);
	const refreshSaved = async () => {
		await webSearch?.refresh?.();
		await controller.load();
	};
	const searchControls = webSearch ? {
		...webSearch,
		busy: webSearch.busy || synchronizing,
		onChange: async (enabled) => {
			if (synchronizing) return;
			setSynchronizing(true);
			try {
				await webSearch.onChange(enabled);
				await operations.refreshSettings?.();
				await controller.load();
			} finally {
				setSynchronizing(false);
			}
		}
	} : void 0;
	const state = injected.useSnapshot((snapshot) => snapshot);
	const refreshReady = state.status === "ready";
	const writable = state.writable && !readOnly && refreshReady && !synchronizing;
	const [editing, setEditing] = (0, react.useState)(void 0);
	const [adding, setAdding] = (0, react.useState)(false);
	const [deleteTarget, setDeleteTarget] = (0, react.useState)(void 0);
	const [deleting, setDeleting] = (0, react.useState)(false);
	const [deleteFailure, setDeleteFailure] = (0, react.useState)(void 0);
	const [savedTarget, setSavedTarget] = (0, react.useState)(void 0);
	const [declaring, setDeclaring] = (0, react.useState)(false);
	const [dismissedSetup, setDismissedSetup] = (0, react.useState)(() => /* @__PURE__ */ new Set());
	const announceSaved = (target) => {
		controller.load().then(() => {
			setSavedTarget(target);
		});
	};
	const closeEditor = (changed, target) => {
		setEditing(void 0);
		setAdding(false);
		setDeclaring(false);
		if (changed) announceSaved(target);
	};
	/**
	* Close a setup card, which owns none of the state above: the row-editor,
	* add, and declare cards each own one of those, so clearing them here would
	* discard a draft the user opened beside this card. Dismissal is this card's
	* own — the provider falls back to an ordinary row for the rest of the
	* session, and reopens through Edit.
	*/
	const closeSetup = (changed, target) => {
		setDismissedSetup((previous) => /* @__PURE__ */ new Set([...previous, target.provider]));
		if (changed) announceSaved(target);
	};
	const closeDelete = () => {
		if (deleting) return;
		setDeleteTarget(void 0);
		setDeleteFailure(void 0);
	};
	const confirmDelete = () => {
		/* v8 ignore next -- the action only renders with a target and is disabled while a deletion is pending */
		if (deleteTarget === void 0 || deleting || !writable) return;
		setDeleting(true);
		setDeleteFailure(void 0);
		removeProviderProfile(operations, controller, deleteTarget).then((failure) => {
			if (failure !== void 0) {
				setDeleteFailure(failure);
				return;
			}
			setDeleteTarget(void 0);
		}).finally(() => {
			setDeleting(false);
		});
	};
	if (state.status === "idle") controller.load();
	if (state.status === "error" && state.rows.length === 0) {
		/* v8 ignore next -- an error status always carries text; the fallback satisfies the nullable type */
		const errorText = state.error ?? "";
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: ModelsSection_module_css_default["section"],
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: ModelsSection_module_css_default["error"],
				children: `${t("loadFailed")}: ${errorText}`
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: ModelsSection_module_css_default["secondaryButton"],
				onClick: () => {
					controller.load();
				},
				children: t("retry")
			})]
		});
	}
	const savedRow = savedTarget === void 0 ? void 0 : state.rows.find((row) => row.entry.provider === savedTarget.provider);
	const savedIdentity = savedRow === void 0 ? savedTarget : {
		provider: savedRow.entry.provider,
		displayName: savedRow.entry.displayName
	};
	const anyUsable = state.rows.some(providerUsable);
	const configured = state.rows.filter((row) => row.configured);
	const addable = state.rows.filter((row) => !row.configured && row.entry.settingsNs !== "");
	const addTarget = adding ? editing : void 0;
	const addNamespace = addTarget === void 0 ? void 0 : state.namespaces.get(addTarget.settingsNs);
	const addRow = addTarget === void 0 ? void 0 : state.rows.find((row) => row.entry.provider === addTarget.provider);
	const protocols = protocolChoices(state.namespaces.get("llm-pi-ai"), schema);
	if (state.rows.some((row) => row.entry.vendor !== void 0)) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		!injected.catalogLocation?.vendor && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelPurposes, {
			namespace: state.namespaces.get("model-provider-routing"),
			rows: state.rows,
			operations,
			readOnly: !writable,
			onSaved: refreshSaved,
			t
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(VendorModelsPanel, {
			location: injected.catalogLocation ?? {},
			rows: state.rows,
			namespaces: state.namespaces,
			operations,
			t,
			readOnly: !writable,
			onSaved: refreshSaved,
			webSearch: searchControls,
			renderSpeechControls: (model, credentialRef) => renderSlot("settings.models.model-controls", {
				modelId: model.id,
				modelName: model.name,
				credentialRef,
				readOnly: !writable
			}, { entryKey: "qwen-asr" })
		}),
		renderSlot("settings.models.footer", {
			catalogLocation: state.rows.some((row) => row.entry.vendor?.id === injected.catalogLocation?.vendor && (!injected.catalogLocation?.connection || row.entry.provider === injected.catalogLocation.connection)) ? injected.catalogLocation ?? {} : {},
			readOnly: !writable,
			keyConfigured: state.rows.find((row) => row.entry.vendor?.id === injected.catalogLocation?.vendor && (!injected.catalogLocation?.connection || row.entry.provider === injected.catalogLocation.connection))?.credential?.configured
		})
	] });
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: ModelsSection_module_css_default["section"],
		"data-provider-cards": injected.providerCards || void 0,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
				className: ModelsSection_module_css_default["title"],
				children: t("title")
			}),
			state.status === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				role: "alert",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: ModelsSection_module_css_default["error"],
					children: `${t("loadFailed")}: ${state.error ?? ""}`
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: ModelsSection_module_css_default["secondaryButton"],
					onClick: () => {
						controller.load();
					},
					children: t("retry")
				})]
			}) : null,
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: ModelsSection_module_css_default["intro"],
				children: t("intro")
			}),
			!writable && state.status === "ready" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: ModelsSection_module_css_default["notice"],
				children: t("readOnly")
			}) : null,
			savedIdentity === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: ModelsSection_module_css_default["savedNotice"],
				role: "status",
				"aria-live": "polite",
				children: providerCopy(t("savedProvider"), savedIdentity)
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
				className: ModelsSection_module_css_default["rows"],
				children: configured.map((row) => {
					const target = targetOf(row);
					const namespace = state.namespaces.get(target.settingsNs);
					/* v8 ignore next -- the join marks a row configured only when its namespace resolved */
					if (namespace === void 0) return null;
					if (needsSetup(row, anyUsable) && !dismissedSetup.has(row.entry.provider)) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
						className: ModelsSection_module_css_default["setupCard"],
						children: [renderProviderEditor({
							target,
							namespace,
							schema,
							operations,
							t,
							readOnly: !writable,
							onClose: (changed) => {
								closeSetup(changed, target);
							}
						}), renderSlot("settings.models.provider-card", {
							provider: row.entry,
							configured: row.configured,
							keyConfigured: keyConfiguredOf(row)
						}, { entryKey: row.entry.settingsNs })]
					}, row.entry.provider);
					const open = !adding && editing?.provider === row.entry.provider;
					const credentialConfigured = row.credential?.configured === true;
					const credentialMissing = !credentialConfigured && row.apiKeyEnv !== void 0 && row.credential?.configured === false;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
						className: ModelsSection_module_css_default["rowCard"],
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: ModelsSection_module_css_default["rowHead"],
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: ModelsSection_module_css_default["rowIdentity"],
									children: [
										injected.providerCards && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Mark, { id: row.entry.provider.startsWith("deepseek") ? "deepseek" : row.entry.provider }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: ModelsSection_module_css_default["rowName"],
											children: row.entry.displayName
										}),
										row.entry.declared === true ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: ModelsSection_module_css_default["rowTag"],
											children: t("customTag")
										}) : null,
										credentialConfigured ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: `${ModelsSection_module_css_default["credentialDot"]} ${ModelsSection_module_css_default["credentialDotConfigured"]}`,
											role: "img",
											"aria-label": t("credentialConfigured"),
											title: t("credentialConfigured")
										}) : credentialMissing ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: `${ModelsSection_module_css_default["credentialDot"]} ${ModelsSection_module_css_default["credentialDotMissing"]}`,
											role: "img",
											"aria-label": t("credentialMissing"),
											title: t("credentialMissing")
										}) : null
									]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: ModelsSection_module_css_default["rowActions"],
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ModelsSection_module_css_default["secondaryButton"],
										"aria-label": providerCopy(t("editProvider"), target),
										onClick: () => {
											setSavedTarget(void 0);
											setDeclaring(false);
											setAdding(false);
											setEditing(open ? void 0 : target);
										},
										children: t(injected.providerCards ? "configureConnection" : "edit")
									}), row.removable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ModelsSection_module_css_default["dangerButton"],
										"aria-label": providerCopy(t("removeProvider"), target),
										disabled: !writable,
										onClick: () => {
											setSavedTarget(void 0);
											setDeleteFailure(void 0);
											setDeleteTarget(target);
										},
										children: t("remove")
									}) : null]
								})]
							}),
							renderSlot("settings.models.provider-card", {
								provider: row.entry,
								configured: row.configured,
								keyConfigured: keyConfiguredOf(row)
							}, { entryKey: row.entry.settingsNs }),
							injected.providerCards && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: ModelsSection_module_css_default["providerStatus"],
								children: t(credentialConfigured ? "credentialConfigured" : credentialMissing ? "credentialMissing" : "credentialUnknown")
							}),
							open ? (() => {
								const editor = renderProviderEditor({
									target,
									namespace,
									schema,
									operations,
									t,
									readOnly: !writable,
									onClose: (changed) => {
										closeEditor(changed, target);
									}
								});
								return injected.providerCards ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Modal$2, {
									open: true,
									className: ModelsSection_module_css_default["providerDialog"],
									title: `${row.entry.displayName} · ${t("configureConnection")}`,
									closeLabel: t("close"),
									onClose: () => setEditing(void 0),
									children: editor
								}) : editor;
							})() : null
						]
					}, row.entry.provider);
				})
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: ModelsSection_module_css_default["addBlock"],
				children: addTarget !== void 0 && addNamespace !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: ModelsSection_module_css_default["addCard"],
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: ModelsSection_module_css_default["field"],
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: ModelsSection_module_css_default["fieldLabel"],
								children: t("provider")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
								className: `${ModelsSection_module_css_default["input"]} ${ModelsSection_module_css_default["selectInput"]}`,
								value: addTarget.provider,
								"aria-label": t("provider"),
								onChange: (event) => {
									const row = addable.find((candidate) => candidate.entry.provider === event.target.value);
									/* v8 ignore next -- the select only lists addable rows */
									if (row === void 0) return;
									setEditing(targetOf(row));
								},
								children: addable.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: row.entry.provider,
									children: row.entry.displayName
								}, row.entry.provider))
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProviderEditor, {
							provider: addTarget.provider,
							displayName: addTarget.displayName,
							hideTitle: true,
							namespace: addNamespace,
							schema,
							settingsPath: addTarget.settingsPath,
							operations,
							t,
							readOnly: !writable,
							onClose: (changed) => {
								closeEditor(changed, addTarget);
							}
						}, addTarget.provider),
						addRow === void 0 ? null : renderSlot("settings.models.provider-card", {
							provider: addRow.entry,
							configured: addRow.configured,
							keyConfigured: keyConfiguredOf(addRow)
						}, { entryKey: addRow.entry.settingsNs })
					]
				}) : declaring ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: ModelsSection_module_css_default["addCard"],
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CustomProviderCard, {
						taken: state.rows.map((row) => row.entry.provider),
						protocols,
						/* v8 ignore next -- the card only opens from a button disabled without this namespace */
						revision: state.namespaces.get("llm-pi-ai")?.revision ?? 0,
						operations,
						t,
						readOnly: !writable,
						onClose: (changed) => {
							setDeclaring(false);
							if (changed) controller.load();
						}
					})
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: ModelsSection_module_css_default["addActions"],
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: ModelsSection_module_css_default["addButton"],
						disabled: addable.length === 0 || !writable,
						onClick: () => {
							const first = addable[0];
							/* v8 ignore next -- the button is disabled while nothing is addable */
							if (first === void 0) return;
							setSavedTarget(void 0);
							setDeclaring(false);
							setAdding(true);
							setEditing(targetOf(first));
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconPlusOutline16, { size: 14 }), t("add")]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: ModelsSection_module_css_default["addButton"],
						disabled: protocols.length === 0 || !writable,
						onClick: () => {
							setSavedTarget(void 0);
							setAdding(false);
							setEditing(void 0);
							setDeclaring(true);
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconPlusOutline16, { size: 14 }), t("customAdd")]
					})]
				})
			}),
			renderSlot("settings.models.footer", {}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ManagedCredentialEditor, {
				operations,
				t,
				readOnly
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Modal$2, {
				open: deleteTarget !== void 0,
				onClose: closeDelete,
				title: deleteTarget === void 0 ? "" : providerCopy(t("deleteTitle"), deleteTarget),
				closeLabel: t("close"),
				description: deleteTarget === void 0 ? "" : providerCopy(deleteTarget.credentialRef === void 0 ? t("deleteDescription") : t("deleteDescriptionWithCredential"), deleteTarget),
				className: ModelsSection_module_css_default["deleteDialog"],
				footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
					variant: "outline",
					autoFocus: true,
					disabled: deleting,
					onClick: closeDelete,
					children: t("cancel")
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: ModelsSection_module_css_default["deleteConfirm"],
					disabled: deleting || !writable,
					onClick: confirmDelete,
					children: deleteTarget === void 0 ? "" : providerCopy(deleting ? t("deleting") : t("deleteConfirm"), deleteTarget)
				})] }),
				children: deleteFailure === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: ModelsSection_module_css_default["error"],
					children: deleteFailure
				})
			})
		]
	});
}
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/operations.ts
/**
* Bind the page's Host operations to the plugin's own Remote namespaces.
* @param ctx - the page plugin's context, which declares `remote.credentials`,
* `remote.llm`, and `remote.settings` in its own `inject`.
* @returns the callbacks the section and its cards are injected with.
*/
function createModelsOperations(ctx) {
	return {
		refreshSettings: () => ctx.settingsScope.refresh(),
		describeCredential: async (ref) => {
			const response = await ctx.remote.credentials.describe([ref]);
			return response.ok ? response.value[ref] : void 0;
		},
		storeCredential: async (ref, value) => {
			const response = await ctx.remote.credentials.set(ref, value);
			return response.ok ? void 0 : response.error.message;
		},
		removeCredential: async (ref) => {
			const response = await ctx.remote.credentials.unset(ref);
			return response.ok ? void 0 : response.error.message;
		},
		writeSettings: async (ns, ops, expectedRevision) => {
			const response = await ctx.remote.settings.mutate(ns, ops, expectedRevision);
			if (response.ok) {
				ctx.settingsScope.describe().acceptView(response.value);
				await ctx.settingsScope.refresh();
				return {
					kind: "written",
					view: response.value
				};
			}
			const { code, message } = response.error;
			return code === "settings/conflict" ? {
				kind: "conflict",
				message
			} : {
				kind: "refused",
				message
			};
		},
		discoverModels: async (settingsNs, request) => {
			const response = await ctx.remote.llm.discoverModels(settingsNs, request);
			return response.ok ? {
				kind: "found",
				models: response.value
			} : {
				kind: "refused",
				message: response.error.message
			};
		}
	};
}
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/schema-operations.ts
/**
* Hide the Cordis service identity behind bound schema callbacks.
* @param service - settings-owned schema service available in the apply context.
* @returns callbacks that cannot expose the service context to React components.
*/
function createSettingsSchemaOperations(service) {
	return {
		rehydrate: (serialized) => service.rehydrate(serialized),
		validate: (schema, draft) => service.validate(schema, draft),
		nodeAtPath: (root, path) => service.nodeAtPath(root, path),
		getPath: (value, path) => service.getPath(value, path),
		hasPath: (value, path) => service.hasPath(value, path),
		setPath: (root, path, value) => service.setPath(root, path, value),
		deletePath: (root, path) => service.deletePath(root, path)
	};
}
//#endregion
//#region dev/shared/console/packages/ui/admin/src/models/client/locales.ts
/** Chinese strings (same keys as {@link en}). */
const zh$1 = {
	advancedSettings: "高级设置",
	connectionTimeoutSeconds: "响应等待时间（秒）",
	webSearch: "网页搜索",
	enableWebSearch: "启用网页搜索",
	webSearchCredential: "共用 DeepSeek 连接",
	webSearchSharedKey: "DeepSeek 模型与网页搜索共用此处保存的 API Key，无需重复填写。",
	configureWebSearch: "配置网页搜索",
	modelPurposes: "模型用途",
	visionPurpose: "视觉理解",
	ocrPurpose: "文字识别",
	purposeUnconfigured: "未配置",
	purposeUnavailable: "不可用",
	connectionDisabled: "连接未启用",
	modelAllowed: "模型已开启",
	modelBlocked: "模型已关闭",
	qwenSubscription: "订阅服务（国际）",
	qwenSubscriptionCn: "订阅服务（中国）",
	qwenSubscriptionIndividual: "个人订阅服务",
	catalogVideo: "视频",
	catalogOtherInput: "其他输入",
	catalogSpeech: "实时转写",
	catalogChatModels: "对话模型",
	catalogAudio: "音频",
	catalogOutput: "输出",
	catalogMode: "模式",
	enableModel: "启用模型",
	modelSaveFailed: "模型状态保存失败，请重试。",
	credentialUnknown: "凭据状态暂不可用",
	nativeAuthentication: "厂商登录 / 部署凭据",
	vendorIntro: "按厂商管理模型连接。模型定义由已安装的厂商包提供。",
	catalogUnknown: "未提供",
	catalogText: "文本",
	catalogImage: "图片",
	catalogPagination: "模型分页",
	catalogPrevious: "上一页",
	catalogNext: "下一页",
	catalogAllVendors: "全部厂商",
	catalogNotFound: "未找到此厂商或模型",
	catalogNotFoundHelp: "插件定义可能已更新，请返回目录选择现有厂商或模型。",
	catalogBreadcrumbs: "模型导航",
	catalogModelDetail: "模型详情",
	catalogVendorDetail: "模型服务商",
	catalogEyebrow: "模型管理",
	catalogVendorIntro: "浏览厂商提供的模型，统一管理连接与访问凭据。",
	catalogIntro: "集中管理模型服务商，为工作区接入所需模型。",
	catalogVendors: "模型厂商",
	catalogEnabledVendors: "已启用厂商",
	catalogAdminHint: "选择厂商，配置连接或查看模型能力。",
	catalogAll: "全部",
	catalogConnections: "连接",
	catalogNoModels: "暂未声明模型",
	catalogViewVendor: "查看厂商",
	catalogManage: "管理厂商",
	catalogSearchHelp: "尝试其他名称，或清除筛选条件。",
	catalogReset: "清除筛选",
	catalogVendorPages: "厂商页面",
	catalogModelLibrary: "模型目录",
	catalogConnectionSettings: "连接配置",
	catalogConnectionRoute: "服务连接",
	catalogConnectionHelp: "此连接下的所有模型共用访问凭据，保存一次即可统一配置。",
	catalogConfigurationGuide: "配置说明",
	catalogGuideKey: "填写服务密钥；已有密钥时，留空即可保留。",
	catalogGuideEnable: "开启连接，让该连接的模型进入可选目录。",
	catalogGuideSave: "保存后，新请求使用更新后的连接参数。",
	catalogCredentialState: "凭据状态",
	catalogViewModel: "查看模型",
	catalogDetails: "查看详情",
	catalogInput: "输入能力",
	catalogDeclaredCapabilities: "来自厂商插件定义",
	catalogModelInformation: "模型信息",
	catalogVendor: "所属厂商",
	catalogDefinitionNote: "以上为插件声明的能力，实际请求还受厂商账户和服务限制。模型定义由开发人员维护。",
	catalogAccess: "模型接入",
	catalogSharedConnection: "此模型与同一服务连接下的其他模型共用配置。",
	catalogFooter: "模型定义由已安装的厂商插件提供；访问密钥独立保存，不回显原文。",
	installedVendors: "已安装 {count} 个厂商",
	vendorSearch: "搜索厂商或模型",
	vendorFilter: "状态",
	allConnections: "全部连接",
	enabledConnections: "已启用",
	disabledConnections: "未启用",
	vendorSaved: "配置已保存，新请求使用更新后的设置。",
	vendorNoResults: "没有匹配的项目",
	packageVersion: "包版本",
	modelCount: "{count} 个模型",
	configureConnection: "配置",
	vendorUpdateRejected: "厂商包更新未通过校验，继续使用上一版定义。",
	vendorDeveloperHint: "开发人员维护厂商包、模型定义和开放参数；新增厂商包随部署重启加载。",
	vendorPartialSave: "参数已保存，密钥尚未保存，请重试完成。",
	enableConnection: "启用此连接",
	connectionTimeout: "响应等待超时（毫秒）",
	vendorKeyHelp: "留空保留现有密钥，已保存的密钥不会回显。",
	includedModels: "包内模型",
	vendorModelsReadOnly: "模型标识与能力由开发人员维护，此处仅供查看。",
	modelSearch: "搜索模型",
	vendorVerificationHint: "启用和密钥已配置，不代表模型调用已验证。",
	saveConnection: "保存配置",
	serviceCredentials: "其他服务凭据",
	serviceCredentialsHelp: "MCP、搜索复用同一个受管凭据库。请先检查引用名；已保存的值不会返回，替换或删除共享引用会影响所有使用它的服务。",
	serviceCredentialRef: "凭据引用名",
	serviceCredentialInspect: "检查引用",
	serviceCredentialPresent: "已配置",
	serviceCredentialMissing: "尚未配置",
	serviceCredentialValue: "新凭据值（只写）",
	serviceCredentialSave: "保存凭据",
	serviceCredentialRemove: "删除凭据",
	serviceCredentialRemoveConfirm: "我知道删除此引用可能导致使用它的服务无法调用。",
	serviceCredentialSaved: "凭据变更已保存。",
	serviceCredentialFailed: "凭据操作失败，请核对权限后重试。",
	nav: "模型",
	title: "模型",
	intro: "填入各提供方的 API 密钥即可使用其模型。",
	edit: "编辑",
	editProvider: "编辑 {provider}",
	remove: "删除",
	removeProvider: "删除 {provider}",
	deleteTitle: "删除 {provider}？",
	deleteDescription: "删除 {provider} 会移除其配置；其使用的凭证（如有）由其他位置管理，将会保留。",
	deleteDescriptionWithCredential: "删除 {provider} 会移除其配置和存储的 API 密钥。",
	deleteConfirm: "删除 {provider}",
	deleting: "正在删除 {provider}…",
	add: "添加提供方",
	provider: "提供方",
	close: "关闭",
	cancel: "取消",
	apply: "保存",
	applying: "保存中…",
	savedProvider: "已保存 {provider}。",
	credentialConfigured: "API 密钥已配置",
	credentialMissing: "API 密钥缺失",
	readOnly: "当前账户或部署只允许查看模型设置。",
	loadFailed: "加载提供方目录失败",
	conflict: "这张卡片打开期间，这些设置已被其他地方改动。请关闭后重新打开，在当前值上编辑。",
	retry: "重试",
	keyInput: "API 密钥",
	keyPlaceholder: "输入 API 密钥",
	keyPlaceholderNative: "输入 API 密钥，或留空使用环境认证",
	keyStored: "已配置——输入新值可替换",
	keyEnvLocked: "由启动环境提供（只读）",
	customized: "自定义设置",
	baseUrl: "API 地址",
	baseUrlDefault: "提供方默认",
	models: "模型目录",
	modelsInherited: "正在使用适配器默认模型",
	modelsCustomized: "已自定义模型目录",
	resetModels: "恢复默认模型",
	model: "模型",
	modelId: "模型 ID",
	modelName: "显示名称",
	modelNamePlaceholder: "留空时使用模型 ID",
	contextWindow: "上下文窗口",
	contextWindowPlaceholder: "使用提供方默认值",
	maxTokens: "最大输出 token 数",
	maxTokensPlaceholder: "使用提供方默认值",
	modelAdvanced: "容量",
	addModel: "添加模型",
	removeModel: "删除模型",
	modelsEmpty: "模型选择器中将不显示任何模型；目录外 ID 仍可直接发送。",
	keyBlank: "请输入 API 密钥；留空则保持已存储的密钥。",
	keyBlankNew: "请输入 API 密钥；若该提供方以其他方式鉴权，可以留空。",
	keyIllegalCharacters: "该 API 密钥格式错误，请检查。",
	modelIdRequired: "模型 ID 不能为空。",
	modelIdDuplicate: "模型 ID 不能重复。",
	modelNameInvalid: "显示名称不能为空。",
	modelContextInvalid: "上下文窗口必须是正数，例如 131072、256K 或 1M。",
	modelMaxTokensInvalid: "最大输出 token 数必须是正数，例如 8192、64K 或 1M。",
	advancedHint: "其他部署字段由平台开发者维护。",
	modelCapacityInvalid: "容量需为数字，可加 K 或 M 后缀。",
	modelDuplicate: "每个模型 ID 只能出现一次。",
	modelContextWindow: "上下文窗口",
	modelMaxTokens: "最大输出 token",
	fetchModels: "获取可用模型",
	fetching: "正在询问提供方…",
	fetchNeedsBaseUrl: "请先填写 API 地址，再获取。",
	fetchEmpty: "该提供方没有列出任何模型，请手动添加。",
	fetchTitle: "选择要添加的模型",
	fetchDescription: "以下是模型提供方的可用模型，勾选要添加的模型。",
	fetchSearch: "搜索模型",
	fetchNoMatches: "没有匹配的模型。",
	fetchSelectAll: "全选",
	fetchDeselectAll: "取消全选",
	fetchAdopt: "添加所选",
	customAdd: "添加自定义提供方",
	customTitle: "自定义提供方",
	customTag: "自定义",
	customRoute: "连接标识",
	customRouteHint: "以小写字母开头的标识，在请求中唯一标识该提供方，并用于派生凭据名。",
	customRouteInvalid: "需以小写字母开头，之后可用小写字母、数字和短横线。",
	customRouteTaken: "已有提供方使用了这个 ID。",
	customDisplayName: "显示名称",
	customApi: "API 协议",
	customApiUnset: "未选择",
	customNeedsBaseUrl: "自定义提供方需要填写 API 地址。",
	customNeedsModels: "自定义提供方至少需要一个模型。",
	customBaseUrlPlaceholder: "https://gateway.example/v1",
	settingsPathUnresolvable: "无法解析设置路径",
	create: "创建提供方",
	creating: "创建中…"
};
//#endregion
//#region dev/shared/console/packages/ui/admin/src/pages/client/readable.ts
function sessionName(row, t) {
	if (row.title) return row.title;
	const time = new Intl.DateTimeFormat(void 0, {
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit"
	}).format(row.updatedAt);
	return `${t(row.parentId ? "console.child" : "console.untitled")} · ${time}`;
}
//#endregion
//#region stylesheet
var admin_module_css_default = {
	"scenariosRelated": "bxc_7bXBuq_scenariosRelated",
	"catalogEditor": "bxc_7bXBuq_catalogEditor",
	"accountCard": "bxc_7bXBuq_accountCard",
	"inventoryResults": "bxc_7bXBuq_inventoryResults",
	"configurationRecovery": "bxc_7bXBuq_configurationRecovery",
	"enterpriseRule": "bxc_7bXBuq_enterpriseRule",
	"catalogFilters": "bxc_7bXBuq_catalogFilters",
	"consoleBars": "bxc_7bXBuq_consoleBars",
	"sceneCheck": "bxc_7bXBuq_sceneCheck",
	"rowActions": "bxc_7bXBuq_rowActions",
	"inventoryCategories": "bxc_7bXBuq_inventoryCategories",
	"sceneChoices": "bxc_7bXBuq_sceneChoices",
	"statePage": "bxc_7bXBuq_statePage",
	"inventoryAdvanced": "bxc_7bXBuq_inventoryAdvanced",
	"auditDetailMeta": "bxc_7bXBuq_auditDetailMeta",
	"inventoryCardActions": "bxc_7bXBuq_inventoryCardActions",
	"inventoryCard": "bxc_7bXBuq_inventoryCard",
	"metricLabel": "bxc_7bXBuq_metricLabel",
	"navGroupLabel": "bxc_7bXBuq_navGroupLabel",
	"enterpriseCheck": "bxc_7bXBuq_enterpriseCheck",
	"skillSourceTag": "bxc_7bXBuq_skillSourceTag",
	"personalProfile": "bxc_7bXBuq_personalProfile",
	"consoleSearch": "bxc_7bXBuq_consoleSearch",
	"inventoryUiTags": "bxc_7bXBuq_inventoryUiTags",
	"configurationModules": "bxc_7bXBuq_configurationModules",
	"inventoryCardName": "bxc_7bXBuq_inventoryCardName",
	"inventoryCardFooter": "bxc_7bXBuq_inventoryCardFooter",
	"sceneMemberList": "bxc_7bXBuq_sceneMemberList",
	"enterpriseCard": "bxc_7bXBuq_enterpriseCard",
	"inventoryPurpose": "bxc_7bXBuq_inventoryPurpose",
	"inventorySwitch": "bxc_7bXBuq_inventorySwitch",
	"formActions": "bxc_7bXBuq_formActions",
	"notice": "bxc_7bXBuq_notice",
	"accountFailure": "bxc_7bXBuq_accountFailure",
	"consoleMetrics": "bxc_7bXBuq_consoleMetrics",
	"configurationAdoption": "bxc_7bXBuq_configurationAdoption",
	"inventoryCards": "bxc_7bXBuq_inventoryCards",
	"empty": "bxc_7bXBuq_empty",
	"configurationCompact": "bxc_7bXBuq_configurationCompact",
	"inventoryStatus": "bxc_7bXBuq_inventoryStatus",
	"inventoryDetails": "bxc_7bXBuq_inventoryDetails",
	"adminNav": "bxc_7bXBuq_adminNav",
	"consoleBack": "bxc_7bXBuq_consoleBack",
	"accountMenuAnchor": "bxc_7bXBuq_accountMenuAnchor",
	"consoleScope": "bxc_7bXBuq_consoleScope",
	"skillCard": "bxc_7bXBuq_skillCard",
	"sidebarAction": "bxc_7bXBuq_sidebarAction",
	"scenariosPage": "bxc_7bXBuq_scenariosPage",
	"consoleNote": "bxc_7bXBuq_consoleNote",
	"consoleColumns": "bxc_7bXBuq_consoleColumns",
	"modelsPage": "bxc_7bXBuq_modelsPage",
	"skillContent": "bxc_7bXBuq_skillContent",
	"catalogField": "bxc_7bXBuq_catalogField",
	"scenariosSymbol": "bxc_7bXBuq_scenariosSymbol",
	"navActive": "bxc_7bXBuq_navActive",
	"backButton": "bxc_7bXBuq_backButton",
	"navFooter": "bxc_7bXBuq_navFooter",
	"statusDisabled": "bxc_7bXBuq_statusDisabled",
	"checkRow": "bxc_7bXBuq_checkRow",
	"inventoryFilters": "bxc_7bXBuq_inventoryFilters",
	"enterpriseFields": "bxc_7bXBuq_enterpriseFields",
	"scenariosEmpty": "bxc_7bXBuq_scenariosEmpty",
	"skillDescription": "bxc_7bXBuq_skillDescription",
	"consoleEmpty": "bxc_7bXBuq_consoleEmpty",
	"configurationLayout": "bxc_7bXBuq_configurationLayout",
	"inventoryMaster": "bxc_7bXBuq_inventoryMaster",
	"navGroup": "bxc_7bXBuq_navGroup",
	"inventoryGuide": "bxc_7bXBuq_inventoryGuide",
	"businessDialogContent": "bxc_7bXBuq_businessDialogContent",
	"form": "bxc_7bXBuq_form",
	"enterpriseToolbar": "bxc_7bXBuq_enterpriseToolbar",
	"consoleBadge": "bxc_7bXBuq_consoleBadge",
	"surface": "bxc_7bXBuq_surface",
	"inventoryTag": "bxc_7bXBuq_inventoryTag",
	"scenariosLayout": "bxc_7bXBuq_scenariosLayout",
	"metric": "bxc_7bXBuq_metric",
	"detailList": "bxc_7bXBuq_detailList",
	"fieldset": "bxc_7bXBuq_fieldset",
	"enterpriseSources": "bxc_7bXBuq_enterpriseSources",
	"inventoryFact": "bxc_7bXBuq_inventoryFact",
	"mutationFields": "bxc_7bXBuq_mutationFields",
	"sceneName": "bxc_7bXBuq_sceneName",
	"primaryNav": "bxc_7bXBuq_primaryNav",
	"skillGrid": "bxc_7bXBuq_skillGrid",
	"scenariosPrimary": "bxc_7bXBuq_scenariosPrimary",
	"inventoryCardToggle": "bxc_7bXBuq_inventoryCardToggle",
	"inventoryModuleName": "bxc_7bXBuq_inventoryModuleName",
	"metricIcon": "bxc_7bXBuq_metricIcon",
	"consoleFactRow": "bxc_7bXBuq_consoleFactRow",
	"topActions": "bxc_7bXBuq_topActions",
	"consolePanelHeading": "bxc_7bXBuq_consolePanelHeading",
	"pageHeading": "bxc_7bXBuq_pageHeading",
	"accountChevron": "bxc_7bXBuq_accountChevron",
	"navIntro": "bxc_7bXBuq_navIntro",
	"consoleLink": "bxc_7bXBuq_consoleLink",
	"emptySymbol": "bxc_7bXBuq_emptySymbol",
	"cardGrid": "bxc_7bXBuq_cardGrid",
	"resourceActions": "bxc_7bXBuq_resourceActions",
	"error": "bxc_7bXBuq_error",
	"sceneToolbar": "bxc_7bXBuq_sceneToolbar",
	"inventoryNote": "bxc_7bXBuq_inventoryNote",
	"metricValue": "bxc_7bXBuq_metricValue",
	"accountDetails": "bxc_7bXBuq_accountDetails",
	"configurationDialog": "bxc_7bXBuq_configurationDialog",
	"inventoryObservation": "bxc_7bXBuq_inventoryObservation",
	"enterpriseCards": "bxc_7bXBuq_enterpriseCards",
	"skillSummary": "bxc_7bXBuq_skillSummary",
	"skillTechnical": "bxc_7bXBuq_skillTechnical",
	"accountEntry": "bxc_7bXBuq_accountEntry",
	"accountName": "bxc_7bXBuq_accountName",
	"main": "bxc_7bXBuq_main",
	"roleCard": "bxc_7bXBuq_roleCard",
	"consoleTrack": "bxc_7bXBuq_consoleTrack",
	"inventoryChevron": "bxc_7bXBuq_inventoryChevron",
	"tableWrap": "bxc_7bXBuq_tableWrap",
	"cardTitle": "bxc_7bXBuq_cardTitle",
	"metricGrid": "bxc_7bXBuq_metricGrid",
	"sceneIcon": "bxc_7bXBuq_sceneIcon",
	"consoleMetric": "bxc_7bXBuq_consoleMetric",
	"configurationPage": "bxc_7bXBuq_configurationPage",
	"statusActive": "bxc_7bXBuq_statusActive",
	"catalogGrid": "bxc_7bXBuq_catalogGrid",
	"auditDetailHeading": "bxc_7bXBuq_auditDetailHeading",
	"inventoryLoading": "bxc_7bXBuq_inventoryLoading",
	"consolePanel": "bxc_7bXBuq_consolePanel",
	"pageTabs": "bxc_7bXBuq_pageTabs",
	"inventoryToolbar": "bxc_7bXBuq_inventoryToolbar",
	"scopeStatus": "bxc_7bXBuq_scopeStatus",
	"consoleActivity": "bxc_7bXBuq_consoleActivity",
	"sceneMembers": "bxc_7bXBuq_sceneMembers",
	"permissionList": "bxc_7bXBuq_permissionList",
	"checkList": "bxc_7bXBuq_checkList",
	"businessDialog": "bxc_7bXBuq_businessDialog",
	"consoleFacts": "bxc_7bXBuq_consoleFacts",
	"inventoryCount": "bxc_7bXBuq_inventoryCount",
	"inventoryCardHeader": "bxc_7bXBuq_inventoryCardHeader",
	"consoleTitle": "bxc_7bXBuq_consoleTitle",
	"body": "bxc_7bXBuq_body",
	"enterpriseSecondary": "bxc_7bXBuq_enterpriseSecondary",
	"catalogRows": "bxc_7bXBuq_catalogRows",
	"closeButton": "bxc_7bXBuq_closeButton",
	"consoleMenu": "bxc_7bXBuq_consoleMenu",
	"accountAvatar": "bxc_7bXBuq_accountAvatar",
	"businessMetrics": "bxc_7bXBuq_businessMetrics"
};
//#endregion
//#region dev/shared/console/packages/ui/admin/src/pages/client/SkillDirectory.tsx
/** 技能目录按来源展示；会话诊断只通过明确的详情入口进入。 */
function SkillDirectory({ state, t, read }) {
	const [query, setQuery] = (0, react.useState)(""), [source, setSource] = (0, react.useState)("all");
	const [content, setContent] = (0, react.useState)({}), [reading, setReading] = (0, react.useState)(), [failed, setFailed] = (0, react.useState)();
	const [variants, setVariants] = (0, react.useState)({});
	if (state.busy) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
		role: "status",
		children: t("loading")
	});
	if (state.error || state.skillsError || state.detail && state.sessionsError) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
		role: "alert",
		children: t(state.skillsError === "forbidden" || state.detail && state.sessionsError === "forbidden" ? "native.operator" : "error.load")
	});
	const diagnostic = !!state.detail;
	const session = state.sessions?.find((row) => row.id === state.detail);
	const groups = /* @__PURE__ */ new Map();
	for (const skill of state.skills ?? []) {
		const key = !diagnostic && skill.environment ? JSON.stringify([
			skill.displayName ?? skill.name,
			skill.provider,
			skill.description,
			skill.modelInvocable,
			skill.userInvocable
		]) : skill.id ?? skill.name;
		groups.set(key, [...groups.get(key) ?? [], skill]);
	}
	const skills = [...groups].filter(([, rows]) => (diagnostic || source === "all" || rows[0].source === source) && rows.some((skill) => [
		skill.name,
		skill.displayName,
		skill.description,
		skill.provider,
		...skill.scopes ?? []
	].join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())));
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
		"aria-label": t("inventory.skills"),
		children: [
			diagnostic && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: admin_module_css_default.consolePanelHeading,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t(diagnostic ? "inventory.skillsDiagnostic" : "inventory.skills") }), diagnostic && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
					href: "/admin/skills",
					className: admin_module_css_default.consoleLink,
					children: t("inventory.skillsBack")
				})]
			}),
			diagnostic && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: admin_module_css_default.inventoryNote,
				children: session ? sessionName(session, t) : t("inventory.skillsSession")
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: admin_module_css_default.inventoryFilters,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("inventory.skillsSearch"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Input, {
					type: "search",
					value: query,
					onChange: (event) => setQuery(event.target.value)
				})] }), !diagnostic && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("inventory.skillsSource"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
					value: source,
					onChange: (event) => setSource(event.target.value),
					children: [
						"all",
						"platform",
						"tool",
						"plugin",
						"workspace"
					].map((value) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
						value,
						children: t(value === "all" ? "inventory.all" : "inventory.skillsSource." + value)
					}, value))
				})] })]
			}),
			state.skillsIncomplete && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				role: "status",
				children: t("inventory.skillsIncomplete")
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: admin_module_css_default.inventoryCount,
				children: t("inventory.skillsCount").replace("{count}", String(skills.length))
			}),
			skills.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: admin_module_css_default.empty,
				children: t(query || source !== "all" ? "inventory.skillsNoMatch" : diagnostic ? "inventory.skillsEmpty" : "inventory.skillsCatalogEmpty")
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: admin_module_css_default.skillGrid,
				children: skills.map(([group, rows]) => {
					const skill = rows.find((row) => (row.id ?? row.name) === variants[group]) ?? rows[0];
					const id = skill.id ?? skill.name, scope = state.detail ?? "catalog", key = scope + ":" + id;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
						className: [admin_module_css_default.inventoryCard, admin_module_css_default.skillCard].join(" "),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("summary", {
							className: admin_module_css_default.inventoryCardToggle,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: admin_module_css_default.skillSummary,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: skill.displayName ?? skill.name }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: admin_module_css_default.skillDescription,
										children: skill.description
									}),
									!diagnostic && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", {
										className: admin_module_css_default.skillSourceTag,
										children: t("inventory.skillsSource." + (skill.source ?? "platform"))
									})
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronDownOutline14, { className: admin_module_css_default.inventoryChevron })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: admin_module_css_default.inventoryDetails,
							children: [
								rows.length > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: admin_module_css_default.catalogField,
									children: [t("inventory.skillEnvironment"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
										value: id,
										disabled: !!reading,
										onChange: (event) => setVariants((current) => ({
											...current,
											[group]: event.target.value
										})),
										children: rows.map((row, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
											value: row.id ?? row.name,
											children: [t(row.environment === "cloud" ? "inventory.skillCloud" : "inventory.skillClient"), rows.filter((item) => item.environment === row.environment).length > 1 ? ` ${index + 1}` : ""]
										}, row.id ?? row.name))
									})]
								}),
								skill.whenToUse && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: skill.whenToUse }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
									className: admin_module_css_default.skillTechnical,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: t("console.technical") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", { children: [
										!diagnostic && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
											skill.provider && skill.source === "plugin" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("inventory.skillsSource") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: skill.provider })] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("inventory.skillsApplies") }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: skill.scopes?.join("、") || t("inventory.skillsSource.platform") })
										] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("inventory.skillsInvocation") }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: t(skill.modelInvocable ? skill.userInvocable === false ? "inventory.skillsOnlyModel" : "inventory.skillsModel" : skill.userInvocable === false ? "inventory.skillsNeither" : "inventory.skillsUser") }),
										skill.path && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("inventory.source") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: skill.path }) })] })
									] })]
								}),
								read && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									disabled: !!reading,
									onClick: () => {
										setReading(key);
										setFailed(void 0);
										read(scope, id).then((value) => {
											if (!value || typeof value !== "object" || !("content" in value) || typeof value.content !== "string") throw Error();
											setContent((current) => ({
												...current,
												[key]: value.content
											}));
										}).catch(() => setFailed(key)).finally(() => setReading(void 0));
									},
									children: t("inventory.skillsRead")
								}),
								failed === key && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "alert",
									children: t("error.load")
								}),
								content[key] !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
									className: admin_module_css_default.skillContent,
									children: content[key]
								})
							]
						})]
					}, group);
				})
			})
		]
	});
}
//#endregion
//#region dev/shared/console/packages/ui/admin/src/plugin-settings/client/device-plugin-locales.ts
/** 本机插件管理的类型化文案，两个既有设置入口共用。 */
const devicePluginsZh = {
	"deviceTitle": "本机插件",
	"deviceConnectionFailed": "设备连接失败",
	"deviceCancelProgress": "正在取消…",
	"deviceSelectFailed": "设备选择失败",
	"deviceArgsInvalid": "参数需要填写字符串数组",
	"deviceInstallProgress": "正在安装并检查工具…",
	"deviceInstallTimeout": "准备超时，请检查设备上的安装状态",
	"deviceInstallFailed": "安装失败",
	"deviceCancelUnknown": "取消结果未确认，请重连设备后检查安装状态",
	"devicePicker": "执行设备",
	"deviceSelect": "选择设备",
	"deviceName": "设备",
	"devicePreferred": "已用于新对话",
	"deviceSetPreferred": "新对话使用此设备",
	"deviceInstall": "安装插件",
	"deviceConnect": "连接客户端后管理本机插件",
	"deviceEmpty": "暂无本机插件",
	"deviceTools": "个工具",
	"deviceReady": "可用",
	"deviceChecking": "检查中",
	"deviceUnavailable": "不可用",
	"deviceUpdate": "更新",
	"deviceUninstall": "卸载",
	"deviceInstallTitle": "安装本机插件",
	"deviceClose": "关闭",
	"deviceSource": "安装来源",
	"deviceNpm": "npm 插件",
	"devicePublished": "企业组件",
	"deviceComponent": "可用组件",
	"deviceComponentEmpty": "暂无匹配组件",
	"devicePackage": "npm 包名",
	"devicePackagePlaceholder": "@组织/插件名",
	"deviceVersion": "版本",
	"deviceCommand": "启动命令",
	"deviceCommandPlaceholder": "插件提供的命令名",
	"deviceArgs": "启动参数",
	"deviceWorkspaceHint": "使用 ${workspace} 引用当前项目目录",
	"deviceCancel": "取消",
	"deviceInstallVerify": "安装并验证",
	"deviceUninstallTitle": "卸载插件"
};
const devicePluginsEn = {
	"deviceTitle": "Local plugins",
	"deviceConnectionFailed": "Device connection failed",
	"deviceCancelProgress": "Cancelling…",
	"deviceSelectFailed": "Device selection failed",
	"deviceArgsInvalid": "Enter an array of strings",
	"deviceInstallProgress": "Installing and checking tools…",
	"deviceInstallTimeout": "Preparation timed out. Check installation status on the device.",
	"deviceInstallFailed": "Installation failed",
	"deviceCancelUnknown": "Cancellation is unconfirmed. Reconnect and check installation status.",
	"devicePicker": "Execution device",
	"deviceSelect": "Select a device",
	"deviceName": "Device",
	"devicePreferred": "Used for new chats",
	"deviceSetPreferred": "Use for new chats",
	"deviceInstall": "Install plugin",
	"deviceConnect": "Connect a client to manage plugins",
	"deviceEmpty": "No installed plugins",
	"deviceTools": "tools",
	"deviceReady": "Ready",
	"deviceChecking": "Checking",
	"deviceUnavailable": "Unavailable",
	"deviceUpdate": "Update",
	"deviceUninstall": "Uninstall",
	"deviceInstallTitle": "Install local plugin",
	"deviceClose": "Close",
	"deviceSource": "Source",
	"deviceNpm": "npm plugin",
	"devicePublished": "Enterprise components",
	"deviceComponent": "Available component",
	"deviceComponentEmpty": "No compatible components",
	"devicePackage": "npm package",
	"devicePackagePlaceholder": "@organization/plugin",
	"deviceVersion": "Version",
	"deviceCommand": "Command",
	"deviceCommandPlaceholder": "Command provided by the plugin",
	"deviceArgs": "Arguments",
	"deviceWorkspaceHint": "Use ${workspace} for the current project directory",
	"deviceCancel": "Cancel",
	"deviceInstallVerify": "Install and verify",
	"deviceUninstallTitle": "Uninstall plugin"
};
//#endregion
//#region dev/shared/console/packages/ui/admin/src/pages/client/business-locales.ts
const businessEn = {
	"business.removeBudgetHint": "Removing this budget stops enforcing this limit. Existing usage records are retained.",
	"business.bindings": "Business functions",
	"business.create": "Add function",
	"business.name": "Function name",
	"business.main": "Main model",
	"business.vision": "Vision model",
	"business.audio": "Audio model",
	"business.video": "Video model",
	"business.none": "Not configured",
	"business.inputPrice": "Input price (CNY / million tokens)",
	"business.outputPrice": "Output price (CNY / million tokens)",
	"business.inputLimit": "Maximum input tokens",
	"business.outputLimit": "Maximum output tokens",
	"business.calls": "Maximum model calls per task",
	"business.tools": "Authorized MCP tools",
	"business.resources": "Enterprise resources",
	"business.approvals": "File change reviewers",
	"business.zero": "No review",
	"business.one": "One reviewer",
	"business.two": "Two reviewers",
	"business.bindHint": "Configure provider credentials in Model configuration. Members receive access through business roles.",
	"business.mcpHint": "Selected MCP tools use the service connection’s full access. Use a scoped data connection for restricted business data.",
	"business.budgets": "Budgets and concurrency",
	"business.budgetEdit": "Set budget",
	"business.subject": "Budget owner",
	"business.account": "Enterprise",
	"business.user": "User",
	"business.department": "Department",
	"business.limit": "Monthly budget (CNY)",
	"business.concurrent": "Maximum concurrent tasks",
	"business.cost": "Recorded cost",
	"business.uncertain": "Reserved / awaiting usage",
	"business.records": "Model request ledger",
	"business.export": "Export current records",
	"business.empty": "No records yet",
	"business.settled": "Settled",
	"business.unknown": "Awaiting verification",
	"business.reserved": "Reserved",
	"business.member": "Member",
	"business.function": "Function",
	"business.model": "Model",
	"business.tokens": "Input / output tokens",
	"business.time": "Time",
	"business.status": "Status",
	"business.projects": "Projects",
	"business.projectCreate": "Add project",
	"business.members": "Project members",
	"business.conflicts": "Incompatible roles",
	"business.conflictAdd": "Add restriction",
	"business.firstRole": "First role",
	"business.secondRole": "Second role",
	"business.fields": "Visible fields (comma separated; blank means all)",
	"business.delete": "Delete"
};
const businessZh = {
	"business.removeBudgetHint": "删除后不再执行这项预算限制，历史用量记录会保留。",
	"business.bindings": "业务功能",
	"business.create": "添加功能",
	"business.name": "功能名称",
	"business.main": "主模型",
	"business.vision": "视觉模型",
	"business.audio": "语音模型",
	"business.video": "视频模型",
	"business.none": "不配置",
	"business.inputPrice": "输入单价（元 / 百万词元）",
	"business.outputPrice": "输出单价（元 / 百万词元）",
	"business.inputLimit": "单次输入词元上限",
	"business.outputLimit": "单次输出词元上限",
	"business.calls": "每项任务最多模型调用次数",
	"business.tools": "允许使用的 MCP 工具",
	"business.resources": "企业资源",
	"business.approvals": "文件变更复核人数",
	"business.zero": "无需复核",
	"business.one": "一人复核",
	"business.two": "双人复核",
	"business.bindHint": "厂商密钥在模型配置中统一维护；成员通过业务角色获得功能使用权。",
	"business.mcpHint": "勾选的 MCP 工具使用该服务连接的完整访问范围。需要限制业务数据范围时，请使用受控数据连接。",
	"business.budgets": "预算与并发",
	"business.budgetEdit": "配置预算",
	"business.subject": "预算归属",
	"business.account": "全企业",
	"business.user": "用户",
	"business.department": "部门",
	"business.limit": "每月预算（元）",
	"business.concurrent": "并发任务上限",
	"business.cost": "已记录费用",
	"business.uncertain": "预留 / 待核实费用",
	"business.records": "模型请求明细",
	"business.export": "导出当前明细",
	"business.empty": "暂无记录",
	"business.settled": "已结算",
	"business.unknown": "待核实",
	"business.reserved": "已预留",
	"business.member": "成员",
	"business.function": "功能",
	"business.model": "模型",
	"business.tokens": "输入 / 输出词元",
	"business.time": "时间",
	"business.status": "状态",
	"business.projects": "项目",
	"business.projectCreate": "添加项目",
	"business.members": "项目成员",
	"business.conflicts": "互斥角色",
	"business.conflictAdd": "添加互斥规则",
	"business.firstRole": "角色一",
	"business.secondRole": "角色二",
	"business.fields": "可见字段（逗号分隔；留空表示全部）",
	"business.delete": "删除"
};
//#endregion
//#region dev/shared/console/packages/ui/admin/src/pages/client/capability-audit.ts
/** 包名逐项登记，不按前缀、源码目录或当前运行状态自动推断归属。 */
const capabilityAuditGroups = [
	{
		id: "beellix-native-entry",
		category: "features",
		zh: "Beelli X 原生接入",
		en: "Beelli X native integration",
		reason: "在原版 DSH 中提供中台入口、配套目录和会话场景资源装配；复用原生执行与安装服务，不代表旧中台完整迁入。",
		names: ["dsh-ui"]
	},
	{
		id: "execution-contract",
		category: "kernel",
		zh: "执行协议契约",
		en: "Execution protocol contracts",
		reason: "定义跨进程目标、调用、回执和协议版本，不执行命令或装配智能体。",
		names: ["execution-contract"]
	},
	{
		id: "client-executor",
		category: "services",
		zh: "本机执行器机制",
		en: "Device execution mechanisms",
		reason: "持久保存本机调用状态和回执，不依赖交互窗口，不装配智能体循环。",
		names: ["client-executor"]
	},
	{
		id: "execution-adapters",
		category: "services",
		zh: "执行目标与工具适配",
		en: "Execution routing and adapters",
		reason: "复用现有会话和工具接口，分别路由到授权电脑与受控云端执行器，不实现第二套推理循环。",
		names: [
			"execution-router",
			"device-execution",
			"cloud-execution",
			"executor-profile"
		]
	},
	{
		id: "embedded-browser",
		category: "features",
		zh: "内置浏览器",
		en: "Embedded browser",
		reason: "管理真实 Chromium 实例并提供 AI 网页操作与人工接管。",
		names: ["browser"]
	},
	{
		id: "mailbox",
		category: "ui",
		zh: "内部工作信箱",
		en: "Internal mailbox",
		reason: "通过既有工作台槽位提供成员往来，执行底座只通过身份桥接访问草稿和授权记录。",
		names: ["ui-mailbox"]
	},
	{
		id: "browser-panel",
		category: "ui",
		zh: "浏览器面板",
		en: "Browser panel",
		reason: "展示同一 Chromium 实例的画面与导航，不启动智能体循环。",
		names: ["ui-browser"]
	},
	{
		"id": "agent-runtime",
		"category": "kernel",
		"zh": "Agent 执行核心",
		"en": "Agent runtime",
		"reason": "拥有 Agent 生命周期、提示组装与工具执行机制；不代表单项模型工具。",
		"names": [
			"agent",
			"agent-loop",
			"tools",
			"system-prompt"
		]
	},
	{
		"id": "agent-composition",
		"category": "kernel",
		"zh": "Agent 组合与预设",
		"en": "Agent composition",
		"reason": "负责选择和组合 Agent 配置；浏览器选择控件另归对话功能。",
		"names": ["agent-presets", "agent-tool-presentation"]
	},
	{
		"id": "plugin-runtime",
		"category": "kernel",
		"zh": "插件加载与作用域",
		"en": "Plugin runtime",
		"reason": "管理插件树、模块解析和作用域；框架库与装配组件保留技术类型，不开放独立安装。",
		"names": [
			"cordis",
			"cordis-plugin-group",
			"cordis-plugin-include",
			"cordis-plugin-loader",
			"cordis-plugin-timer",
			"client-modules",
			"scope"
		]
	},
	{
		"id": "remote-protocol",
		"category": "kernel",
		"zh": "服务通信与协议",
		"en": "Service communication",
		"reason": "提供平台调用、连接和协议反射机制，不是网页搜索或第三方业务功能。",
		"names": [
			"acp",
			"api-gateway",
			"api-remotes",
			"client-connection",
			"sdk-jsonrpc-server",
			"sdk-client",
			"sdk-protocol",
			"typert-loader",
			"typert-registry",
			"typert-protocol",
			"typert-generator"
		]
	},
	{
		"id": "application-boot",
		"category": "kernel",
		"zh": "应用启动与装配",
		"en": "Application assembly",
		"reason": "拥有启动、profile 或制品入口；应用和装配包只在技术目录查阅，不冒充功能插件。",
		"names": [
			"acp-app",
			"app-boot",
			"base",
			"cli",
			"cmdline",
			"harness-runtime",
			"harness-source-profile",
			"harness-web-profile",
			"headless",
			"launch-environment",
			"python-runtime-closure",
			"sdk-app",
			"sdk-minimal",
			"web-app",
			"web-frontend",
			"desktop",
			"mobile"
		]
	},
	{
		"id": "host-delivery",
		"category": "kernel",
		"zh": "宿主路由与静态资源",
		"en": "Host delivery",
		"reason": "提供宿主 HTTP 路由和前端资源交付，不承担模型侧网页访问。",
		"names": ["host-frontend-static", "host-webserver"]
	},
	{
		"id": "package-management",
		"category": "kernel",
		"zh": "插件登记与加载机制",
		"en": "Package management",
		"reason": "拥有插件清单、制品校验和加载接入；已定义职责不等于已接入正式装配。",
		"names": [
			"host-plugin-inventory",
			"agent-package-contract",
			"agent-package-runtime-loader",
			"agent-package-sdk",
			"agent-package-validator",
			"harness-package-host"
		]
	},
	{
		"id": "runtime-diagnostics",
		"category": "kernel",
		"zh": "运行诊断与开发支撑",
		"en": "Runtime diagnostics",
		"reason": "提供一致性检查、日志或开发测试支撑；开发热更新和测试包仍是技术资产。",
		"names": [
			"invariants",
			"cordis-plugin-logger-console",
			"client-hmr",
			"cordis-plugin-hmr",
			"agent-loop-testkit",
			"loader-smoke"
		]
	},
	{
		"id": "core-utilities",
		"category": "kernel",
		"zh": "共享类型与运行辅助",
		"en": "Runtime utilities",
		"reason": "提供跨能力共享的值、配置、时间和集合辅助，不存在独立业务启停语义。",
		"names": [
			"brand",
			"cosmokit",
			"deque",
			"schemastery",
			"util-values",
			"util-crypto",
			"lazy-require",
			"timeout",
			"util-time",
			"util-code-language"
		]
	},
	{
		"id": "experimental-host",
		"category": "kernel",
		"zh": "实验宿主",
		"en": "Experimental hosts",
		"reason": "职责是宿主装配和镜像准备，但实验性质不因完成归类而改变。",
		"names": ["experimental-webworker-packer", "experimental-webworker-runtime"]
	},
	{
		"id": "model-access",
		"category": "services",
		"zh": "模型访问",
		"en": "Model access",
		"reason": "提供模型请求、路由、重试及配置；官方请求元数据属于模型适配，不是通用系统遥测。",
		"names": [
			"llm-vendor",
			"llm-amazon-bedrock",
			"llm-ant-ling",
			"llm-anthropic",
			"llm-azure",
			"llm-baseten",
			"llm-cerebras",
			"llm-cloudflare",
			"llm-fireworks",
			"llm-github-copilot",
			"llm-google",
			"llm-groq",
			"llm-huggingface",
			"llm-moonshot",
			"llm-minimax",
			"llm-mistral",
			"llm-nvidia",
			"llm-openai",
			"llm-opencode",
			"llm-openrouter",
			"llm-qwen",
			"llm-together",
			"llm-vercel-ai-gateway",
			"llm-xai",
			"llm-xiaomi",
			"llm-zai",
			"agent-default-model",
			"llm",
			"llm-deepseek",
			"llm-deepseek-api-key",
			"llm-deepseek-account",
			"llm-pi-ai",
			"llm-retry",
			"deepseek-llm-api-extensions",
			"plugin-package-inventory-deepseek"
		]
	},
	{
		"id": "model-test-support",
		"category": "services",
		"zh": "模型测试支撑",
		"en": "Model testing",
		"reason": "提供模型故障夹具和记录回放；留在技术目录，不当作生产提供方。",
		"names": ["llm-mock-server", "llm-replay"]
	},
	{
		"id": "filesystem-service",
		"category": "services",
		"zh": "文件系统服务",
		"en": "Filesystem services",
		"reason": "定义并实现文件访问；接口与被继承实现无需各自具有 Loader 实例，不等于文件工具入口。",
		"names": [
			"fs",
			"fs-local",
			"fs-sandbox"
		]
	},
	{
		"id": "execution-service",
		"category": "services",
		"zh": "命令、进程与终端",
		"en": "Process and terminal services",
		"reason": "提供命令执行和终端资源；Bash、PowerShell、本地与沙箱实现由部署选择，不是重复的模型工具。",
		"names": [
			"shell",
			"shell-env",
			"bash-local",
			"bash-sandbox",
			"pwsh-local",
			"pwsh-sandbox",
			"subprocess",
			"subprocess-local",
			"win32-process",
			"native-command",
			"terminal",
			"terminal-bash"
		]
	},
	{
		"id": "code-service",
		"category": "services",
		"zh": "代码执行服务",
		"en": "Code execution",
		"reason": "提供可供消费者调用的代码运行后端；实验 Python 实现仍属于技术资产。",
		"names": [
			"ptc-runtime",
			"ptc-runtime-node",
			"code-runtime",
			"code-runtime-worker-thread",
			"experimental-code-runtime-python"
		]
	},
	{
		"id": "remote-environment",
		"category": "services",
		"zh": "远程执行环境",
		"en": "Remote environments",
		"reason": "共享 E2B 执行世界的文件与进程适配组成一个扩展身份；不是三个独立安装项。",
		"names": [
			"e2b",
			"fs-e2b",
			"subprocess-e2b"
		]
	},
	{
		"id": "code-navigation",
		"category": "services",
		"zh": "代码分析服务",
		"en": "Code analysis",
		"reason": "提供语言服务器查询和传输实现；模型侧导航工具另归智能体功能。",
		"names": ["lsp", "lsp-stdio"]
	},
	{
		"id": "web-service",
		"category": "services",
		"zh": "网页访问服务",
		"en": "Web access services",
		"reason": "提供搜索、抓取和出站代理实现；工具入口、宿主 HTTP 路由及事件自动化分别归属其他职责。",
		"names": [
			"web",
			"web-fetch-http",
			"web-search-deepseek",
			"web-search-exa",
			"web-search-perplexity",
			"http-proxy"
		]
	},
	{
		"id": "mcp-service",
		"category": "services",
		"zh": "MCP 连接服务",
		"en": "MCP connections",
		"reason": "连接 MCP 并注册其工具；通用连接机制不按某个具体第三方服务命名。",
		"names": ["mcp-client", "mcp-resources"]
	},
	{
		"id": "file-tools",
		"category": "features",
		"zh": "文件与代码工具",
		"en": "File and code tools",
		"reason": "直接向智能体提供读写、搜索和代码导航；交付文件展示另归对话功能。",
		"names": [
			"tool-fs",
			"tool-fs-search",
			"tool-str-replace-editor",
			"tool-lsp"
		]
	},
	{
		"id": "terminal-tools",
		"category": "features",
		"zh": "命令与终端工具",
		"en": "Command and terminal tools",
		"reason": "把执行服务公开为模型工具；启停只影响明确支持的工具贡献，不代表卸载终端服务。",
		"names": [
			"tool-bash",
			"tool-bash-persistent",
			"tool-pwsh",
			"tool-pwsh-persistent",
			"tool-terminal"
		]
	},
	{
		"id": "web-tools",
		"category": "features",
		"zh": "网页工具",
		"en": "Web tools",
		"reason": "向模型提供搜索和抓取操作，不拥有具体搜索提供方。",
		"names": ["tool-web"]
	},
	{
		"id": "skills",
		"category": "features",
		"zh": "技能加载",
		"en": "Skills",
		"reason": "提供技能发现与加载；固定徽章技能按内容用途归类，不推定部署需要启用。",
		"names": [
			"skill",
			"skill-filesystem",
			"skill-badge",
			"tool-skill"
		]
	},
	{
		"id": "request-context",
		"category": "features",
		"zh": "指令与上下文",
		"en": "Instructions and context",
		"reason": "为模型组织工作区指令、引用、时钟或提示；建议性重复提醒不作为权限控制。",
		"names": [
			"agent-instructions",
			"persona",
			"time-context",
			"tmux-context",
			"file-reference",
			"file-reference-local",
			"session-reference",
			"repeat-tool-reminder"
		]
	},
	{
		"id": "context-budget",
		"category": "features",
		"zh": "上下文容量管理",
		"en": "Context management",
		"reason": "计量并压缩模型上下文或裁剪工具结果；数据落盘由存储组件承担。",
		"names": [
			"compaction-image-offload",
			"compaction",
			"compaction-basic",
			"compaction-tool-result-pruner",
			"command-compact",
			"token-meter",
			"output-retention",
			"spill-policy"
		]
	},
	{
		"id": "goals-plans",
		"category": "features",
		"zh": "目标与计划",
		"en": "Goals and plans",
		"reason": "提供目标续行、计划、待办及对应命令；浏览器展示另归对话功能。",
		"names": [
			"goal",
			"goal-round-driver",
			"command-goal",
			"tool-goal",
			"plan-mode",
			"tool-todo"
		]
	},
	{
		"id": "background-jobs",
		"category": "features",
		"zh": "后台任务",
		"en": "Background jobs",
		"reason": "管理可观察的后台任务及完成通知；浏览器列表另归对话功能。",
		"names": [
			"jobs",
			"jobs-local",
			"tool-jobs"
		]
	},
	{
		"id": "subagents",
		"category": "features",
		"zh": "子智能体协作",
		"en": "Subagents",
		"reason": "提供委派、控制和对应运行后端；协议名称不改变其子智能体职责，技术资产不自动晋升生产扩展。",
		"names": [
			"subagent",
			"subagent-acp",
			"subagent-claude-code",
			"subagent-codex",
			"subagent-dsh-sdk",
			"subagent-fork-in-process",
			"subagent-spawn-in-process",
			"subagent-in-process-driver",
			"tool-subagent",
			"tool-subagent-control"
		]
	},
	{
		"id": "workflows",
		"category": "features",
		"zh": "工作流编排",
		"en": "Workflows",
		"reason": "围绕子智能体执行编排脚本并呈现运行结果；不因内部使用线程就归为通用代码服务。",
		"names": [
			"workflow",
			"workflow-worker-thread",
			"tool-workflow",
			"tool-ralph"
		]
	},
	{
		"id": "reminders",
		"category": "features",
		"zh": "定时提醒",
		"en": "Reminders",
		"reason": "提供持久提醒与到期处理；浏览器提醒列表另归对话功能。",
		"names": ["schedule"]
	},
	{
		"id": "event-automation",
		"category": "features",
		"zh": "事件与钩子自动化",
		"en": "Event automation",
		"reason": "把外部事件或钩子接入 Agent 行为；HTTP 和厂商品牌是接入方式，不作为一级分类。",
		"names": [
			"hook-protocol",
			"hooks-claude-code",
			"hooks-codex",
			"webhook",
			"webhook-github"
		]
	},
	{
		"id": "human-questions",
		"category": "features",
		"zh": "提问与评审",
		"en": "Questions and review",
		"reason": "收集用户答案或计划评审，不承担权限授予；审批许可另归安全与权限。",
		"names": ["user-questions", "tool-ask-user"]
	},
	{
		"id": "history-tools",
		"category": "features",
		"zh": "历史检索工具",
		"en": "History tools",
		"reason": "向模型提供会话历史检索；底层历史数据与查询服务仍由数据与会话组件拥有。",
		"names": ["tool-session-query", "tool-working-directory"]
	},
	{
		"id": "dynamic-development",
		"category": "features",
		"zh": "动态插件开发",
		"en": "Dynamic plugin development",
		"reason": "提供动态插件开发与检查能力；现有开发专用归属保留，不开启生产自修改。",
		"names": [
			"cordis-client-runner",
			"cordis-host-runner",
			"tool-cordis"
		]
	},
	{
		"id": "experimental-features",
		"category": "features",
		"zh": "实验与示例功能",
		"en": "Experimental features",
		"reason": "可确定协作或领域示例职责，但实验和示例仍在技术目录，不表示正式产品采用。",
		"names": [
			"experimental-agent-team",
			"experimental-agent-team-profile",
			"experimental-tool-agent-team",
			"example-contract-review",
			"scenario-starter"
		]
	},
	{
		"id": "session-lifecycle",
		"category": "data",
		"zh": "会话记录与恢复",
		"en": "Sessions and recovery",
		"reason": "拥有会话日志、恢复和持久化检查点；浏览器会话状态桥接另归对话功能。",
		"names": [
			"session",
			"session-checkpoint-policy",
			"session-persistence",
			"session-persistence-jsonl",
			"api-session-controller",
			"working-directory"
		]
	},
	{
		"id": "session-projections",
		"category": "data",
		"zh": "会话投影与统计",
		"en": "Session projections",
		"reason": "从日志派生状态、计数和时间线；浏览器执行轨迹另归对话功能。",
		"names": [
			"session-projection",
			"session-projection-cache",
			"session-stats",
			"session-turn-outline"
		]
	},
	{
		"id": "history-query",
		"category": "data",
		"zh": "历史查询与导出",
		"en": "History and export",
		"reason": "提供历史读取、搜索索引和导出；不按底层 SQLite 或 ZIP 协议划分产品功能。",
		"names": [
			"session-query",
			"session-query-sqlite",
			"session-log-export"
		]
	},
	{
		"id": "workspace-data",
		"category": "data",
		"zh": "工作区与目录选择",
		"en": "Workspaces",
		"reason": "拥有工作区记录、目录选择协议及宿主后端；浏览器导航与选择界面另归工作区功能。",
		"names": [
			"workspace",
			"api-workspace-controller",
			"host-directory-picker",
			"host-directory-picker-auto",
			"host-directory-picker-browse",
			"host-directory-picker-native"
		]
	},
	{
		"id": "storage-backends",
		"category": "data",
		"zh": "存储服务",
		"en": "Storage",
		"reason": "提供领域数据和持久化后端；JSON、SQLite 是实现选择，不代表多个独立业务功能。",
		"names": [
			"storage",
			"storage-domain",
			"storage-json",
			"storage-sqlite"
		]
	},
	{
		"id": "attachments",
		"category": "data",
		"zh": "附件与大结果存储",
		"en": "Attachments and large results",
		"reason": "保存图片附件或大文本并提供取回能力；不把存储后端当作模型读写工具。",
		"names": [
			"attachment",
			"attachment-local",
			"spill",
			"spill-local"
		]
	},
	{
		"id": "session-title",
		"category": "data",
		"zh": "会话标题",
		"en": "Session titles",
		"reason": "维护会话标题及其生成策略；使用模型不改变其会话元数据职责。",
		"names": [
			"session-title",
			"session-title-all-prompts-llm",
			"session-title-first-prompt-llm",
			"session-title-llm"
		]
	},
	{
		"id": "feedback-telemetry",
		"category": "data",
		"zh": "反馈与遥测",
		"en": "Feedback and telemetry",
		"reason": "记录反馈或提供日志上报能力；归类不授权上传，也不改变正式入口禁用遥测的配置。",
		"names": [
			"message-feedback",
			"command-feedback",
			"session-telemetry",
			"session-telemetry-otel",
			"session-log-deepseek",
			"anonymous-user-id"
		]
	},
	{
		"id": "settings-data",
		"category": "data",
		"zh": "设置数据",
		"en": "Settings data",
		"reason": "拥有设置文档、读写及远程访问；浏览器设置同步归 UI 基础运行，凭据解析仍归安全。",
		"names": [
			"settings",
			"settings-file",
			"api-settings-controller"
		]
	},
	{
		"id": "data-support",
		"category": "data",
		"zh": "数据辅助与回放测试",
		"en": "Data support",
		"reason": "提供原子写入、数据路径或回放测试；普通库与测试组件不展示为可安装插件。",
		"names": [
			"atomic-write",
			"home-paths",
			"util-workspace-path",
			"session-snapshot"
		]
	},
	{
		"id": "credentials",
		"category": "security",
		"zh": "凭据与授权",
		"en": "Credentials and authorization",
		"reason": "解析秘密引用并获取授权，不在分类数据中保存凭据值。",
		"names": [
			"credentials",
			"credentials-local",
			"deepseek-account",
			"authorization"
		]
	},
	{
		"id": "approval-permissions",
		"category": "security",
		"zh": "审批与权限",
		"en": "Approval and permissions",
		"reason": "拥有动作许可、权限预设与工具执行前检查；浏览器审批及权限选择另归对话功能。",
		"names": [
			"user-approval",
			"permission-presets",
			"experimental-auto-review"
		]
	},
	{
		"id": "sandbox-security",
		"category": "security",
		"zh": "隔离与访问限制",
		"en": "Isolation and access",
		"reason": "实现或解析进程与文件访问限制；原生平台载体保留技术类型，不作为普通扩展安装项。",
		"names": [
			"sandbox",
			"sandbox-local",
			"sandbox-policy",
			"sandbox-windows-acl",
			"node-addon-landlock-run",
			"node-addon-landlock-run-linux-arm64",
			"node-addon-landlock-run-linux-x64",
			"fs-observation-policy"
		]
	},
	{
		"id": "execution-limits",
		"category": "security",
		"zh": "执行约束",
		"en": "Execution limits",
		"reason": "约束工具执行时间；超时不等于授权机制，也不保证不配合取消的操作可被强制终止。",
		"names": ["tool-call-timeout-policy"]
	},
	{
		"id": "account-governance",
		"category": "security",
		"zh": "账户与治理",
		"en": "Account governance",
		"reason": "管理账户、角色、浏览器认证及审计；控制面库不因为被分类而成为可启停插件。",
		"names": ["control-plane-core"]
	},
	{
		"id": "human-commands",
		"category": "features",
		"zh": "人类命令注册",
		"en": "Human command registration",
		"reason": "定义人类命令注册和执行接口；浏览器命令选择另归对话功能。",
		"names": ["commands"]
	},
	{
		"id": "client-support",
		"category": "kernel",
		"zh": "客户端状态与测试",
		"en": "Client state and testing",
		"reason": "提供非 UI 的共享状态和客户端测试支撑；普通库与测试组件保持技术目录归属。",
		"names": ["client-store", "client-test-runtime"]
	},
	{
		"id": "enterprise-resources",
		"category": "data",
		"zh": "企业资源数据",
		"en": "Enterprise resource data",
		"reason": "拥有知识导入、数据连接和资源授权；不持有 Agent Loop 或替代身份核心。",
		"names": ["control-plane-resources"]
	},
	{
		"id": "enterprise-resource-tools",
		"category": "features",
		"zh": "企业资源工具",
		"en": "Enterprise resource tools",
		"reason": "向模型贡献企业资源操作，依赖公开客户端服务而不导入控制面存储。",
		"names": ["tool-enterprise-resources"]
	},
	{
		"id": "administration-settings",
		"category": "data",
		"zh": "管理配置协议与组合",
		"en": "Administration settings",
		"reason": "公开配置贡献协议并组合已批准的能力配置；具体字段仍归能力所有者。",
		"names": ["admin-setting-contract", "admin-settings"]
	},
	{
		"id": "ui-components",
		"category": "ui",
		"zh": "公共组件",
		"en": "Shared components",
		"reason": "按钮、输入框、菜单、图标与主题标记等可复用展示，不装配运行服务。",
		"names": ["ui-components"]
	},
	{
		"id": "ui-platform",
		"category": "ui",
		"zh": "界面公共运行",
		"en": "UI runtime",
		"reason": "槽位渲染、会话绑定、设置同步、主题、语言及 Web 启动；不包含功能页面。",
		"names": ["ui-platform"]
	},
	{
		"id": "ui-shell",
		"category": "ui",
		"zh": "应用框架",
		"en": "Application shell",
		"reason": "整体布局、主侧栏、导航入口与品牌内容，由功能通过槽位扩展。",
		"names": ["ui-shell"]
	},
	{
		"id": "ui-admin",
		"category": "ui",
		"zh": "管理后台",
		"en": "Administration",
		"reason": "账户、角色、模型、插件目录与运行配置等管理页面，写操作由服务端授权。",
		"names": ["ui-admin"]
	},
	{
		"id": "ui-settings",
		"category": "ui",
		"zh": "设置",
		"en": "Settings",
		"reason": "偏好、新会话默认权限与预设管理；当前会话选择留在对话。",
		"names": ["ui-settings"]
	},
	{
		"id": "ui-conversation",
		"category": "ui",
		"zh": "对话",
		"en": "Conversation",
		"reason": "消息、输入区、当前会话选择、审批、任务及工具结果呈现。",
		"names": ["ui-conversation", "ui-mobile"]
	},
	{
		"id": "ui-workspace",
		"category": "ui",
		"zh": "项目与会话管理",
		"en": "Projects and sessions",
		"reason": "项目和会话导航、创建与归档，以及按宿主能力选择的目录交互。",
		"names": ["ui-workspace"]
	},
	{
		"id": "ui-resources",
		"category": "ui",
		"zh": "后台资源管理",
		"en": "Resource administration",
		"reason": "管理后台通过槽位提供知识库与数据连接管理，不提供独立成员门户。",
		"names": ["ui-resources"]
	},
	{
		"id": "ui-records",
		"category": "ui",
		"zh": "运行记录",
		"en": "Execution records",
		"reason": "请求轨迹、运行记录与会话日志下载，数据来自既有持久记录。",
		"names": ["ui-records"]
	},
	{
		"id": "ui-extension-results",
		"category": "ui",
		"zh": "扩展结果展示",
		"en": "Extension results",
		"reason": "扩展面板数据协议与安全结果展示；不启动或执行业务插件。",
		"names": ["ui-extension-results"]
	},
	{
		"id": "ui-developer",
		"category": "ui",
		"zh": "开发调试",
		"en": "Developer tools",
		"reason": "Cordis 开发诊断及调试展示，不因目录存在开放生产修改权限。",
		"names": ["ui-developer"]
	},
	{
		"id": "system-platform-runtime",
		"category": "kernel",
		"zh": "系统载体与结构",
		"en": "System runtime",
		"names": [
			"node-addon-system-linux-x64",
			"node-addon-system-linux-arm64",
			"node-addon-system",
			"node-addon-system-darwin-x64",
			"node-addon-system-darwin-arm64",
			"chunked-list"
		],
		"reason": "按现有源码职责补齐目录登记；技术库不开放独立插件启停。"
	},
	{
		"id": "session-format-migration",
		"category": "data",
		"zh": "会话格式迁移",
		"en": "Session migrations",
		"names": [
			"session-format-v3-to-v4",
			"session-format-v2-to-v3",
			"session-format-v1-to-v2",
			"session-format-v0-to-v1",
			"session-format-catalog",
			"session-format"
		],
		"reason": "按现有源码职责补齐目录登记；技术库不开放独立插件启停。"
	},
	{
		"id": "file-delivery-interfaces",
		"category": "services",
		"zh": "资源传输与交付",
		"en": "Resource delivery",
		"names": [
			"remote-mock",
			"client-resources",
			"client-file-upload",
			"tool-present",
			"api-workspace-files"
		],
		"reason": "按现有源码职责补齐目录登记；技术库不开放独立插件启停。"
	},
	{
		"id": "enterprise-knowledge",
		"category": "features",
		"zh": "企业知识检索",
		"en": "Enterprise knowledge",
		"reason": "独立检索适配器和指导技能；资料授权、原件和有效版本由 OS 管理，算法在独立 RAG 服务中运行。",
		"names": ["enterprise-knowledge"]
	},
	{
		"id": "after-sales-service",
		"category": "features",
		"zh": "售后服务场景",
		"en": "After-sales service scenario",
		"reason": "BEELLIX 售后服务完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["after-sales-service"]
	},
	{
		"id": "contract-management",
		"category": "features",
		"zh": "合同管理场景",
		"en": "Contract management scenario",
		"reason": "BEELLIX 合同管理完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["contract-management"]
	},
	{
		"id": "employee-onboarding",
		"category": "features",
		"zh": "入职培训场景",
		"en": "Employee onboarding and training scenario",
		"reason": "BEELLIX 入职培训完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["employee-onboarding"]
	},
	{
		"id": "engineering-change",
		"category": "features",
		"zh": "工程变更场景",
		"en": "Engineering change scenario",
		"reason": "BEELLIX 工程变更完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["engineering-change"]
	},
	{
		"id": "equipment-maintenance",
		"category": "features",
		"zh": "设备维护场景",
		"en": "Equipment maintenance scenario",
		"reason": "BEELLIX 设备维护完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["equipment-maintenance"]
	},
	{
		"id": "expense-review",
		"category": "features",
		"zh": "报销审核场景",
		"en": "Expense review scenario",
		"reason": "BEELLIX 报销审核完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["expense-review"]
	},
	{
		"id": "inventory-replenishment",
		"category": "features",
		"zh": "库存补货场景",
		"en": "Inventory replenishment scenario",
		"reason": "BEELLIX 库存补货完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["inventory-replenishment"]
	},
	{
		"id": "project-acceptance",
		"category": "features",
		"zh": "项目验收场景",
		"en": "Project acceptance scenario",
		"reason": "BEELLIX 项目验收完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["project-acceptance"]
	},
	{
		"id": "project-cost-review",
		"category": "features",
		"zh": "成本复盘场景",
		"en": "Project cost review scenario",
		"reason": "BEELLIX 成本复盘完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["project-cost-review"]
	},
	{
		"id": "purchase-comparison",
		"category": "features",
		"zh": "采购比价场景",
		"en": "Purchase comparison scenario",
		"reason": "BEELLIX 采购比价完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["purchase-comparison"]
	},
	{
		"id": "purchase-followup",
		"category": "features",
		"zh": "采购跟单场景",
		"en": "Purchase order follow-up scenario",
		"reason": "BEELLIX 采购跟单完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["purchase-followup"]
	},
	{
		"id": "quality-correction",
		"category": "features",
		"zh": "质量整改场景",
		"en": "Quality correction scenario",
		"reason": "BEELLIX 质量整改完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["quality-correction"]
	},
	{
		"id": "receivables-collection",
		"category": "features",
		"zh": "应收回款场景",
		"en": "Receivables collection scenario",
		"reason": "BEELLIX 应收回款完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["receivables-collection"]
	},
	{
		"id": "recruitment-assessment",
		"category": "features",
		"zh": "招聘评估场景",
		"en": "Recruitment assessment scenario",
		"reason": "BEELLIX 招聘评估完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["recruitment-assessment"]
	},
	{
		"id": "sales-opportunity",
		"category": "features",
		"zh": "商机跟进场景",
		"en": "Sales opportunity follow-up scenario",
		"reason": "BEELLIX 商机跟进完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["sales-opportunity"]
	},
	{
		"id": "sales-order-review",
		"category": "features",
		"zh": "订单审核场景",
		"en": "Sales order review scenario",
		"reason": "BEELLIX 订单审核完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["sales-order-review"]
	},
	{
		"id": "tender-response",
		"category": "features",
		"zh": "投标响应场景",
		"en": "Tender response scenario",
		"reason": "BEELLIX 投标响应完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["tender-response"]
	},
	{
		"id": "three-way-match",
		"category": "features",
		"zh": "三单匹配场景",
		"en": "Three-way matching scenario",
		"reason": "BEELLIX 三单匹配完整业务场景，独立字段、包内专业规则、来源复核与交付，复用既有 Harness 和公开 SDK；工程身份不代表企业已采用。",
		"names": ["three-way-match"]
	},
	{
		"id": "smart-quotation",
		"category": "features",
		"zh": "智能报价场景",
		"en": "Smart quotation",
		"reason": "独立业务制品提供清单报价工具与指导技能，由 Harness 调用；不内置企业数据。",
		"names": ["smart-quotation"]
	},
	{
		id: "office-capabilities",
		category: "features",
		zh: "Office 独立能力",
		en: "Office capabilities",
		reason: "完整插件随包交付文档、表格、演示工具和技能，保留原本机工具协议；不另建执行循环。",
		names: ["office-capabilities"]
	},
	{
		id: "meeting-minutes",
		category: "features",
		zh: "会议纪要场景",
		en: "Meeting minutes",
		reason: "独立业务制品提供实时转写、人物确认和纪要工具，附带企业语音运行依赖；复用用户 Harness、执行目标和产物归档，不新增会议数据库。",
		names: ["meeting-minutes"]
	}
];
//#endregion
//#region dev/shared/console/packages/ui/admin/src/pages/client/package-identities.generated.ts
/** 从各工作区 package.json 的 beellix 声明生成；运行状态与授权仍由服务端负责。勿手改。 */
const definitions = {
	"@beellix-ai/acp": {
		"path": "packages/harness/acp/builtin/acp",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "interfaces",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向程序化客户端与维护者的仅自动化 Agent Client Protocol 服务器，用于通过 JSON-RPC stdio 驱动 DeepSeek Harness agent。",
		"en": "Automation-only Agent Client Protocol server for driving BEELLIX Harness agents over JSON-RPC stdio"
	},
	"@beellix-ai/acp-app": {
		"path": "packages/harness/bundle/acp-app",
		"ownership": "foundation",
		"kind": "bundle",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "面向启动持久 harness agent 的用户与维护者，说明纯自动化 ACP stdio 应用 profile。",
		"en": "The dsh ACP profile bundle: automation-only JSON-RPC stdio and process lifecycle over dsh-base"
	},
	"@beellix-ai/admin-setting-contract": {
		"path": "packages/harness/settings/builtin/admin-setting-contract",
		"ownership": "foundation",
		"kind": "library",
		"group": "sessions",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "定义管理员配置贡献、修订和生效结果的公开协议，不保存配置。",
		"en": "Public protocol for administration setting contributions, revisions and applied results; stores no configuration."
	},
	"@beellix-ai/admin-settings": {
		"path": "packages/harness/settings/builtin/admin-settings",
		"ownership": "foundation",
		"kind": "library",
		"group": "sessions",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "组合已批准的配置贡献，协调配置修订、存储和实际生效读回。",
		"en": "Compose approved setting contributions and coordinate revisions, persistence and applied-value observations."
	},
	"@beellix-ai/after-sales-service": {
		"path": "packages/scenarios/after-sales-service",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "售后服务的资料、专业核对、人员复核、产物与后续记录。",
		"en": "After-sales service workbench.",
		"displayZh": "售后服务",
		"displayEn": "After-sales service"
	},
	"@beellix-ai/agent": {
		"path": "packages/harness/core/agent",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "core",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "提供 Agent 句柄、实时实例注册与运行事件，供界面和编排器控制任务。",
		"en": "Agent interface, registry, initiator scope, and event vocabulary for the BEELLIX Harness"
	},
	"@beellix-ai/agent-default-model": {
		"path": "packages/harness/core/agent-default-model",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "core",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": { "href": "/admin/models" },
		"zh": "为新建 Agent 选择部署默认模型。",
		"en": "Default model selection shared by Agent entry points"
	},
	"@beellix-ai/agent-instructions": {
		"path": "packages/harness/context/builtin/agent-instructions",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "context",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "发现、加载和刷新工作区 AGENTS.md 与 CLAUDE.md 指令。",
		"en": "Workspace context loader for AGENTS.md/CLAUDE.md instruction files"
	},
	"@beellix-ai/agent-loop": {
		"path": "packages/harness/core/agent-loop",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "core",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": { "href": "/admin/plugin-settings/agent-loop" },
		"zh": "驱动 Agent 轮次与步骤，串联模型请求和工具执行。",
		"en": "The concrete agent loop plugin for the BEELLIX Harness"
	},
	"@beellix-ai/agent-loop-testkit": {
		"path": "packages/testing/harness/agent-loop-testkit",
		"ownership": "foundation",
		"kind": "library",
		"group": "engineering",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "为运行具体 AgentLoop 的测试挂载共享服务先决依赖，面向接线真实循环前置依赖的测试作者。",
		"en": "Shared prerequisite mounting for tests that exercise the concrete agent loop"
	},
	"@beellix-ai/agent-package-contract": {
		"path": "packages/agent-package/contract",
		"ownership": "foundation",
		"kind": "library",
		"group": "extensions",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "校验能力包清单、连接、策略、运行配置与发布数据，拒绝未知字段和危险资源路径。",
		"en": "Validate package manifests, connections, policies, profiles and publications; reject unknown fields and unsafe resource paths."
	},
	"@beellix-ai/agent-package-runtime-loader": {
		"path": "packages/agent-package/runtime-loader",
		"ownership": "foundation",
		"kind": "library",
		"group": "extensions",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "校验制品并提供隔离 Worker 加载，保留原工具结果、Skills 和提示注册；可信代码不等同安全沙箱。",
		"en": "Validate artifacts and isolate trusted business execution in workers while retaining native tool, skill and prompt contracts."
	},
	"@beellix-ai/agent-package-sdk": {
		"path": "packages/agent-package/sdk",
		"ownership": "foundation",
		"kind": "sdk",
		"group": "extensions",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "提供能力包与工具的编写辅助函数，复用现有 Harness，不启动独立 Agent Loop。",
		"en": "Package and tool authoring helpers using the existing Harness without starting another Agent Loop."
	},
	"@beellix-ai/agent-package-validator": {
		"path": "packages/agent-package/validator",
		"ownership": "foundation",
		"kind": "library",
		"group": "extensions",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "导入前检查能力包文件、资源、兼容版本和摘要，并暂存受信任制品；摘要不是签名。",
		"en": "Validate package files, resources, engine versions and digests, then stage trusted artifacts; a digest is not a signature."
	},
	"@beellix-ai/agent-presets": {
		"path": "packages/harness/preset/builtin/agent-presets",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "core",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "按预设配置组合每个会话的 Agent，提供预设发现与管理。",
		"en": "Per-session agent composition from preset cordis.yml files for the BEELLIX Harness"
	},
	"@beellix-ai/agent-tool-presentation": {
		"path": "packages/harness/core/agent-tool-presentation",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "core",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "选择工具在模型侧的调用与编排呈现方式。",
		"en": "Agent-plane presentation selector: composes one agent's tools as PTC mode, native, or both"
	},
	"@beellix-ai/anonymous-user-id": {
		"path": "packages/harness/identity/anonymous-user-id",
		"ownership": "foundation",
		"kind": "library",
		"group": "security",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "面向用户与维护者的匿名按 harness home 身份说明，用于追踪遥测、反馈确认与 DeepSeek 提供方请求如何关联记录。",
		"en": "Shared anonymous user identity for BEELLIX Harness telemetry and feedback correlation"
	},
	"@beellix-ai/api-gateway": {
		"path": "packages/harness/api/builtin/gateway",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "interfaces",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "带类型的 Client 到 Host 调用与 stream：分派、校验、取消、重连与转发的 Host 事件。",
		"en": "Typert Remote Host dispatcher and Client API endpoint"
	},
	"@beellix-ai/api-remotes": {
		"path": "packages/harness/api/builtin/remotes",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "interfaces",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "应用 Remote 装配：为 Client 消费方选择带类型的 Host 能力与转发事件。",
		"en": "Remote BFF assembly for application-selected Host capabilities"
	},
	"@beellix-ai/api-session-controller": {
		"path": "packages/harness/api/builtin/session-controller",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "interfaces",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "Host 与 Client 会话控制：创建、恢复、提示、跟随历史并投影实时会话状态。",
		"en": "Session Remote commands, cold reads, and live control transport"
	},
	"@beellix-ai/api-settings-controller": {
		"path": "packages/harness/api/builtin/settings-controller",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "interfaces",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "settings 与凭据配置界面的 Host Remote owner，涵盖脱敏读取、写入、凭据引用与原生文档打开。",
		"en": "Remote owner for the configuration surfaces over the settings-domain seams"
	},
	"@beellix-ai/api-workspace-controller": {
		"path": "packages/harness/api/builtin/workspace-controller",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "interfaces",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "Host 与 Client 工作区控制：修改工作区导航并跟随其完整投影。",
		"en": "Workspace Remote commands and reconnect-safe state transport"
	},
	"@beellix-ai/api-workspace-files": {
		"path": "packages/harness/api/builtin/workspace-files",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "files",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "工作区文件列表、读取与交付接口。",
		"en": "Workspace listing, read and delivery API."
	},
	"@beellix-ai/app-boot": {
		"path": "packages/harness/boot/app-boot",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "dsh profile 与临时 Python SDK 运行时的共享 Loader 启动支持：环境层、patch、诊断与配置预览。",
		"en": "Shared boot glue for the app bins: .env loading, fail-loud Loader guards, snapshot-aware config resolution, and the Loader boot sequence"
	},
	"@beellix-ai/atomic-write": {
		"path": "packages/shared/node/atomic-write",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "原子文件替换与跨进程写锁，供绝不允许在磁盘上留下不完整、被符号链接劫持或权限过宽内容的包使用。",
		"en": "Zero-dependency atomic file replacement: exclusive-create random-suffix temp + rename carrying the caller-stated permissions (writeFileAtomic)"
	},
	"@beellix-ai/attachment": {
		"path": "packages/harness/attachment/builtin/attachment",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "context",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "持久图片附件，供用户与维护者在提示词与命令中附加、复用或排查图片。",
		"en": "Durable immutable attachment storage seam for the BEELLIX Harness"
	},
	"@beellix-ai/attachment-local": {
		"path": "packages/harness/attachment/builtin/attachment-local",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "context",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "DSH_HOME 下附加图片的本地存储，供用户与维护者选择或排查图片附件的存放位置。",
		"en": "Private content-addressed DSH_HOME attachment storage"
	},
	"@beellix-ai/authorization": {
		"path": "packages/harness/credentials/builtin/authorization",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "security",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向用户与维护者的授权 flow 注册表：获取配置无法提供的凭据，因为拿到它需要与人对话。",
		"en": "Authorization seam (ctx.authorization): plugin-owned flows that obtain a credential through a conversation with the human"
	},
	"@beellix-ai/base": {
		"path": "packages/harness/bundle/base",
		"ownership": "foundation",
		"kind": "bundle",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "共享的 dsh 核心：为每个 dsh --profile 表层提供模型访问、工具、持久会话与安全默认值，供用户组合或定制 profile。",
		"en": "The shared dsh core as a profile bundle: the first patch layer of base-backed profiles, inserting core rows over the empty profile root"
	},
	"@beellix-ai/bash-local": {
		"path": "packages/harness/shell/builtin/bash-local",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "在宿主运行普通 Bash 命令，本身不提供进程隔离。",
		"en": "Local-subprocess implementation of the BEELLIX Harness bash executor seam"
	},
	"@beellix-ai/bash-sandbox": {
		"path": "packages/harness/shell/builtin/bash-sandbox",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "按共享沙箱策略执行受限 Bash 命令，保留拒绝与升权信息。",
		"en": "Sandbox-consuming implementation of the BEELLIX Harness bash executor seam (confines every command via ctx.sandbox, reports denial/enforcement result facts)"
	},
	"@beellix-ai/brand": {
		"path": "packages/shared/common/brand",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "供拥有易混淆领域值的包使用的名义字符串与数字类型及无状态构造函数。",
		"en": "Stateless branded primitive types for the BEELLIX Harness"
	},
	"@beellix-ai/browser": {
		"path": "packages/harness/web/builtin/browser",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "web",
		"management": "builtin",
		"contributes": ["tools", "services"],
		"configuration": null,
		"zh": "在当前DSH原生网页按身份与版本受控读取、点击、滚动及发送，不启动独立浏览器。",
		"en": "Read the current DSH native browser without launching another engine.",
		"displayZh": "DSH浏览器",
		"displayEn": "DSH browser access"
	},
	"@beellix-ai/chunked-list": {
		"path": "packages/shared/common/chunked-list",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "维护分块列表数据结构。",
		"en": "Chunked list data structure."
	},
	"@beellix-ai/cli": {
		"path": "apps/harness/original-cli",
		"ownership": "foundation",
		"kind": "application",
		"group": "interfaces",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "通过 dsh 命令启动指定 profile，管理配置层与插件组合包。",
		"en": "Launch selected profiles and manage profile layers and bundles through dsh."
	},
	"@beellix-ai/client-connection": {
		"path": "packages/client/connection",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "ui",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "连接浏览器与宿主 RPC、事件流和 HTTP 路由，处理断线重连。",
		"en": "Authenticated RPC transport, generation lifecycle, and browser fixture"
	},
	"@beellix-ai/client-executor": {
		"path": "packages/client/executor",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "本机文件、进程、终端、浏览器、LSP、插件与设备通道执行器，不装配智能体循环。",
		"en": "Persistent device execution mechanisms."
	},
	"@beellix-ai/client-file-upload": {
		"path": "packages/client/file-upload",
		"ownership": "foundation",
		"kind": "library",
		"group": "interfaces",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "客户端文件上传状态和传输。",
		"en": "Client upload state and transport."
	},
	"@beellix-ai/client-hmr": {
		"path": "packages/client/hmr",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "ui",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "在开发时热重载浏览器插件，保留应用外壳。",
		"en": "Dev-only hot-reload driver for script-loaded client entries: SSE rebuilt frames → invalidate/prefetch → fiber swap through the vendored Loader entry"
	},
	"@beellix-ai/client-modules": {
		"path": "packages/client/modules",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "ui",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "生成客户端模块启动图，在浏览器按需加载插件产物。",
		"en": "Client module system, dual-face: node half composes the __DSH_BOOT__ entry graph (incremental dsh.client scan, bundle route, index tap, webPlugins service); browser half is the lazy-CJS module table the vendored cordis Loader consumes as its internal seam"
	},
	"@beellix-ai/client-resources": {
		"path": "packages/client/resources",
		"ownership": "foundation",
		"kind": "library",
		"group": "interfaces",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "客户端资源状态与访问接口。",
		"en": "Client resource state and access."
	},
	"@beellix-ai/client-store": {
		"path": "packages/client/store",
		"ownership": "foundation",
		"kind": "library",
		"group": "ui",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "提供具有明确快照、订阅和生命周期的浏览器状态存储。",
		"en": "React-free observable and snapshot-store contracts with the shared Zustand/Immer engine"
	},
	"@beellix-ai/client-test-runtime": {
		"path": "packages/testing/client/client-runtime",
		"ownership": "foundation",
		"kind": "library",
		"group": "engineering",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "面向浏览器功能测试的 jsdom slot 测试运行时，供测试作者针对生产机制检验 slot、store 与渲染。",
		"en": "jsdom slot test runtime: real Cordis Context + SlotRegistry + UI renderer with test-owned session/workspace doubles for feature specs"
	},
	"@beellix-ai/cloud-execution": {
		"path": "packages/harness/execution/builtin/cloud-execution",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "Harness 云端工具通道，不装配智能体循环。",
		"en": "Execution integration library."
	},
	"@beellix-ai/cmdline": {
		"path": "packages/harness/boot/cmdline",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "dsh app bin 的应用自有命令行：应用从启动器剩余参数中解析自己的 flag、--help 与退出行为。",
		"en": "Immutable command-line handoff from a dsh launcher to any app plugin that injects cmdlineArgs"
	},
	"@beellix-ai/code-runtime": {
		"path": "packages/harness/code-runtime/builtin/code-runtime",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "抽象代码执行 seam（`ctx.codeRuntime`），供用户与维护者组合、消费或构建后端，以针对宿主提供的绑定运行一段模型编写的程序。",
		"en": "Abstract code-execution seam (ctx.codeRuntime) for the BEELLIX Harness"
	},
	"@beellix-ai/code-runtime-worker-thread": {
		"path": "packages/harness/code-runtime/builtin/code-runtime-worker-thread",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "Worker 线程代码执行，供用户与维护者组合、调优或排查这个已发布的 TypeScript 后端——它在全新的 Node worker 中运行每个程序。",
		"en": "Worker-thread implementation of the BEELLIX Harness code-execution seam"
	},
	"@beellix-ai/command-compact": {
		"path": "packages/harness/compaction/builtin/command-compact",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "context",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向交互式组合的按需 /compact 命令：它做什么、你会看到什么，以及如何挂载。",
		"en": "Human-facing slash command for explicit session compaction"
	},
	"@beellix-ai/command-feedback": {
		"path": "packages/harness/feedback/builtin/command-feedback",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "通过 `/feedback` 命令记录自由文本会话反馈，供用户与维护者选择、组合或排查反馈采集。",
		"en": "Log-only session feedback producer and human-facing slash command"
	},
	"@beellix-ai/command-goal": {
		"path": "packages/harness/goal/builtin/command-goal",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向在 UI 命令平面中选择、组合或排查 goal 控制的用户与维护者的 /goal 斜杠命令说明。",
		"en": "Human-facing slash command for persisted same-session goals"
	},
	"@beellix-ai/commands": {
		"path": "packages/harness/interaction/builtin/commands",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "security",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向交互式 UI 的人类斜杠命令注册表：插件拥有的命令直接针对 agent 执行，不产生模型消息；供组合或扩展命令面的用户与维护者阅读。",
		"en": "Plugin-owned human command registry for BEELLIX Harness UIs"
	},
	"@beellix-ai/compaction": {
		"path": "packages/harness/compaction/builtin/compaction",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "context",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向后端实现者与部署方的共享压缩约定：会话压缩做什么、何时使用，以及如何实现后端。",
		"en": "Abstract compaction service seam (ctx.compaction) for the BEELLIX Harness"
	},
	"@beellix-ai/compaction-basic": {
		"path": "packages/harness/compaction/builtin/compaction-basic",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "context",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向部署方的自动会话压缩：选择、调优或排查随 token 压力上升如何把较早历史摘要为总结。",
		"en": "Token-meter-driven compaction policy and LLM summarization backend for the BEELLIX Harness"
	},
	"@beellix-ai/compaction-image-offload": {
		"path": "packages/harness/context/builtin/compaction-image-offload",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "context",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "持久保存图片卸载决策并在会话重放时恢复投影。",
		"en": "Durable image offload and replay projection."
	},
	"@beellix-ai/compaction-tool-result-pruner": {
		"path": "packages/harness/compaction/builtin/compaction-tool-result-pruner",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "context",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向组合压缩的部署方的工具输出修剪：选择大小限制或排查超大工具结果为何被缩短。",
		"en": "Replay-safe model-free head/middle/tail pruning for tool-result surface nodes"
	},
	"@beellix-ai/contract-management": {
		"path": "packages/scenarios/contract-management",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "合同管理的资料、专业核对、人员复核、产物与后续记录。",
		"en": "Contract management workbench.",
		"displayZh": "合同管理",
		"displayEn": "Contract management"
	},
	"@beellix-ai/control-plane-core": {
		"path": "packages/control-plane/core",
		"ownership": "foundation",
		"kind": "library",
		"group": "security",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "管理账户、用户、角色、群组、浏览器会话、审计及发布登记；登记不等于运行采用。",
		"en": "Accounts, users, roles, groups, browser sessions, audit and release records; registration is not runtime adoption."
	},
	"@beellix-ai/control-plane-resources": {
		"path": "packages/control-plane/resources",
		"ownership": "foundation",
		"kind": "library",
		"group": "sessions",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "管理企业知识与数据连接、资源授权和导入任务；存储事务由应用注入。",
		"en": "Enterprise knowledge, data connections, resource authorization and ingestion jobs with application-provided storage transactions."
	},
	"@beellix-ai/cordis": {
		"path": "vendor/cordis",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "提供插件上下文、服务依赖注入、事件和效果生命周期。",
		"en": "Plugin contexts, service dependency injection, events and effect lifecycles."
	},
	"@beellix-ai/cordis-client-runner": {
		"path": "packages/harness/extensions/development/cordis-client-runner",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "extensions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "动态 Cordis 包的浏览器半说明，供选择、组合或排查页面如何应答运行请求并装载浏览器半代码的用户与维护者阅读。",
		"en": "Browser half of dynamic dual-half plugin packages: event subscription, closure evaluation, guard facade, and loader entries"
	},
	"@beellix-ai/cordis-host-runner": {
		"path": "packages/harness/extensions/development/cordis-host-runner",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "extensions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "动态 Cordis 包的 host 半说明，供选择、组合或排查注册表、沙箱与运行往返的 agent 与维护者阅读。",
		"en": "Dynamic package definition registry, host-half sandbox lifecycle, and invoke handler table for model-mounted dual-half packages"
	},
	"@beellix-ai/cordis-plugin-group": {
		"path": "vendor/group",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "platform",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "把多个插件组织为嵌套配置组并共享组作用域。",
		"en": "Organize plugins in nested configuration groups with a shared group scope."
	},
	"@beellix-ai/cordis-plugin-hmr": {
		"path": "vendor/hmr",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "platform",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "提供开发热更新，在源文件变化后重载宿主插件。",
		"en": "Development hot reload for host plugins after source changes."
	},
	"@beellix-ai/cordis-plugin-include": {
		"path": "vendor/include",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "platform",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "将其他配置文件纳入插件树，组合 profile 配置层。",
		"en": "Include configuration files in the plugin tree and compose profile layers."
	},
	"@beellix-ai/cordis-plugin-loader": {
		"path": "vendor/loader",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "platform",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "读取插件配置，管理插件加载、依赖等待与卸载。",
		"en": "Read plugin configuration and manage loading, dependency waiting and disposal."
	},
	"@beellix-ai/cordis-plugin-logger-console": {
		"path": "vendor/logger-console",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "platform",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "将 Cordis 日志输出到控制台。",
		"en": "Export Cordis logs to the console."
	},
	"@beellix-ai/cordis-plugin-timer": {
		"path": "vendor/timer",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "platform",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "提供随插件生命周期释放的定时器和间隔任务。",
		"en": "Timers and intervals disposed with the owning plugin."
	},
	"@beellix-ai/cosmokit": {
		"path": "vendor/cosmokit",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "提供对象、数组、异步处理等通用 JavaScript 辅助函数。",
		"en": "Common JavaScript utilities for objects, arrays and asynchronous operations."
	},
	"@beellix-ai/credentials": {
		"path": "packages/harness/credentials/builtin/credentials",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "security",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向用户与维护者的凭据 seam：在不把机密值写进配置的前提下解析、描述或存储凭据——引用值与持久化记录。",
		"en": "Abstract credential seam (ctx.credentials): settings carry references to secrets, providers own the values"
	},
	"@beellix-ai/credentials-local": {
		"path": "packages/harness/credentials/builtin/credentials-local",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "security",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向用户与维护者的文件型凭据提供方：选择、配置或排查本地凭据存储及其环境分层。",
		"en": "File-backed credentials provider ($DSH_HOME/.env under the live process environment) for the BEELLIX Harness"
	},
	"@beellix-ai/deepseek-account": {
		"path": "packages/harness/credentials/extensions/deepseek-account",
		"ownership": "foundation",
		"kind": "library",
		"group": "security",
		"management": "technical",
		"contributes": ["services"],
		"configuration": null,
		"zh": "上游账号服务抽象与任务撤销契约；企业入口不自动启用。",
		"en": "Fixed upstream provider compatibility contract."
	},
	"@beellix-ai/deepseek-llm-api-extensions": {
		"path": "packages/harness/llm/extensions/deepseek-llm-api-extensions",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "为官方 DeepSeek 请求注册额外 API 字段。",
		"en": "Additive request-field registry for the official DeepSeek LLM API adapter"
	},
	"@beellix-ai/deque": {
		"path": "packages/shared/common/deque",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "供 Host 和浏览器包使用的环形双端队列，提供摊销常数时间的队列操作、已移除条目的即时释放和有界空闲存储。",
		"en": "Zero-dependency circular deque with amortized constant-time end operations and bounded vacant storage"
	},
	"@beellix-ai/desktop": {
		"path": "apps/desktop",
		"ownership": "foundation",
		"kind": "application",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "个人桌面宿主、内部 Harness 生命周期与受限本机交互。",
		"en": "Personal desktop host and internal Harness lifecycle."
	},
	"@beellix-ai/device-execution": {
		"path": "packages/harness/execution/builtin/device-execution",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "Harness 本机工具适配，调用受授权设备执行器。",
		"en": "Execution integration library."
	},
	"@beellix-ai/dsh-ui": {
		"path": "packages/plugins/dsh-ui",
		"ownership": "business",
		"kind": "plugin",
		"group": "ui",
		"management": "extension",
		"contributes": ["ui", "services"],
		"configuration": null,
		"zh": "DSH 原生中台引导包与配套目录管理",
		"en": "DSH bootstrap and persistent directory management",
		"displayZh": "Beelli X 中台",
		"displayEn": "Beelli X"
	},
	"@beellix-ai/e2b": {
		"path": "packages/harness/sandbox/extensions/e2b",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "E2B 文件与命令工作的共享远程 Linux 沙箱：配置、生命周期，以及启动与关闭时会发生什么。",
		"en": "Shared E2B sandbox lifecycle for BEELLIX Harness provider adapters"
	},
	"@beellix-ai/employee-onboarding": {
		"path": "packages/scenarios/employee-onboarding",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "入职培训的资料、专业核对、人员复核、产物与后续记录。",
		"en": "Employee onboarding and training workbench.",
		"displayZh": "入职培训",
		"displayEn": "Employee onboarding and training"
	},
	"@beellix-ai/engineering-change": {
		"path": "packages/scenarios/engineering-change",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "工程变更的资料、专业核对、人员复核、产物与后续记录。",
		"en": "Engineering change workbench.",
		"displayZh": "工程变更",
		"displayEn": "Engineering change"
	},
	"@beellix-ai/enterprise-knowledge": {
		"path": "packages/plugins/enterprise-knowledge",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": ["skills"],
		"configuration": null,
		"zh": "连接独立 RAG 服务，使用 OS 授权、版本与原文引用。",
		"en": "RAG adapter with OS authorization, version control and source citations.",
		"displayZh": "企业知识检索",
		"displayEn": "Enterprise knowledge"
	},
	"@beellix-ai/equipment-maintenance": {
		"path": "packages/scenarios/equipment-maintenance",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "设备维护的资料、专业核对、人员复核、产物与后续记录。",
		"en": "Equipment maintenance workbench.",
		"displayZh": "设备维护",
		"displayEn": "Equipment maintenance"
	},
	"@beellix-ai/example-contract-review": {
		"path": "examples/agent-packages/contract-review",
		"ownership": "foundation",
		"kind": "example",
		"group": "engineering",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "演示合同关键词检查、工具结果表和 JSON 下载；不是法律判断或已安装生产插件。",
		"en": "Example contract keyword checks, result tables and JSON downloads; not legal analysis or an installed production plugin."
	},
	"@beellix-ai/execution-contract": {
		"path": "packages/shared/execution-contract",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "云端和设备的公共执行封套、结果与版本契约，不包含执行实现。",
		"en": "Shared execution protocol contracts."
	},
	"@beellix-ai/execution-router": {
		"path": "packages/harness/execution/builtin/execution-router",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "Harness 会话执行目标与设备路由。",
		"en": "Execution integration library."
	},
	"@beellix-ai/executor-profile": {
		"path": "apps/harness/executor-profile",
		"ownership": "foundation",
		"kind": "application",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "受控容器内的独立云端工具执行入口，不启动 Harness Loop。",
		"en": "Isolated cloud tool execution entry."
	},
	"@beellix-ai/expense-review": {
		"path": "packages/scenarios/expense-review",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "报销审核的资料、专业核对、人员复核、产物与后续记录。",
		"en": "Expense review workbench.",
		"displayZh": "报销审核",
		"displayEn": "Expense review"
	},
	"@beellix-ai/experimental-agent-team": {
		"path": "packages/harness/experimental/agent-team",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "engineering",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "在一个会话中运行一个小型具名 agent 团队：成员之间的持久消息与共享任务板，供组合实验性 Team 插件的部署方阅读。",
		"en": "Implicit-root Agent Teams roster, durable peer mailbox, and shared task DAG"
	},
	"@beellix-ai/experimental-agent-team-profile": {
		"path": "packages/harness/experimental/agent-team-profile",
		"ownership": "foundation",
		"kind": "bundle",
		"group": "engineering",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "叠加在 dsh-base 上的私有 Agent Teams profile 层，供源码 checkout 用户使用 Team-scoped 协作工具，同时保留一次性 delegation。",
		"en": "Private profile bundle enabling Agent Teams over dsh-base"
	},
	"@beellix-ai/experimental-auto-review": {
		"path": "packages/harness/experimental/auto-review",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "security",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "按当前任务授权审查单次工具调用，企业权限和执行环境限制继续生效。",
		"en": "Per-call authorization review retaining enterprise and execution boundaries."
	},
	"@beellix-ai/experimental-code-runtime-python": {
		"path": "packages/harness/experimental/code-runtime-python",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "engineering",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "CPython 子进程代码 runtime：为 Python 模型代码实现 dsh-code-runtime seam，及其使用的 fd-3 wire 协议。",
		"en": "CPython subprocess implementation of the BEELLIX Harness code-execution seam"
	},
	"@beellix-ai/experimental-tool-agent-team": {
		"path": "packages/harness/experimental/tool-agent-team",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "engineering",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "九个让模型创建、发消息与协调 teammate 的工具，供组合实验性 Team 插件的部署方阅读。",
		"en": "Scoped model-facing Agent Teams tools over ctx.agentTeams"
	},
	"@beellix-ai/experimental-webworker-packer": {
		"path": "packages/harness/experimental/webworker-packer",
		"ownership": "foundation",
		"kind": "library",
		"group": "engineering",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "面向构建或排查实验性预览部署的维护者，说明浏览器 worker VFS 镜像打包。",
		"en": "Build-time packer for the browser runtime's base VFS image and ordered data-overlay archives"
	},
	"@beellix-ai/experimental-webworker-runtime": {
		"path": "packages/harness/experimental/webworker-runtime",
		"ownership": "foundation",
		"kind": "library",
		"group": "engineering",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "面向构建或排查实验性 Web 预览运行时的维护者，说明浏览器 worker 中的 harness 托管。",
		"en": "Browser-only harness runtime: in-memory VFS, module transform and loader, postMessage tunnel, and the dedicated Web Worker assembly, with the Node-compatibility layer that lets the host tree run unchanged"
	},
	"@beellix-ai/file-reference": {
		"path": "packages/harness/context/builtin/file-reference",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "context",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向宿主驱动 UI 的文件引用发现与 @file mention 语法，供选择该 seam 或为其搭配提供方的用户与维护者阅读。",
		"en": "File-reference discovery contract and shared @file grammar"
	},
	"@beellix-ai/file-reference-local": {
		"path": "packages/harness/context/builtin/file-reference-local",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "context",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向用户与维护者的本地工作区 @file 补全提供方，用于启用、设置大小或排查 ctx.fileReferences 的发现能力。",
		"en": "Local-filesystem ctx.fileReferences provider with bounded fuzzy indexes"
	},
	"@beellix-ai/fs": {
		"path": "packages/harness/fs/builtin/fs",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "files",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "提供统一文件系统服务，允许选择本地或沙箱实现。",
		"en": "Abstract filesystem capability seam (ctx.fs) for the BEELLIX Harness — vocabulary types, the FileSystem service (text IO + optional version-guarded atomic mutations), and the fs/* policy event vocabulary"
	},
	"@beellix-ai/fs-e2b": {
		"path": "packages/harness/fs/extensions/fs-e2b",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "共享远程沙箱内的文件操作：agent 可以在那里对文件做什么、何时使用，以及可以期待什么——面向 E2B 家族的部署方与维护者。",
		"en": "E2B filesystem implementation for BEELLIX Harness"
	},
	"@beellix-ai/fs-local": {
		"path": "packages/harness/fs/builtin/fs-local",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "files",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "通过统一文件接口读写宿主文件系统。",
		"en": "Local-filesystem implementation of the BEELLIX Harness filesystem seam (ctx.fs)"
	},
	"@beellix-ai/fs-observation-policy": {
		"path": "packages/harness/fs/builtin/fs-observation-policy",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "files",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "检查文件编辑前的读取记录，保护基于过期观察的写入。",
		"en": "File-context policy plugin for the BEELLIX Harness — observed-state, read-before-edit, and version-guarded write/edit added over the ctx.fs provider seam through the fs/* event gate (no service API)"
	},
	"@beellix-ai/fs-sandbox": {
		"path": "packages/harness/fs/builtin/fs-sandbox",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "files",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "把模型文件访问限制在配置允许的沙箱路径内。",
		"en": "Sandbox-enforcing implementation of the BEELLIX Harness filesystem seam: fences write/edit by the per-call sandbox mode (read-only denies mutation, workspace-write contains it to the workspace + temp roots) while reads pass through"
	},
	"@beellix-ai/goal": {
		"path": "packages/harness/goal/builtin/goal",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向选择、配置或排查同会话持久 goal 服务的用户与维护者：每会话一个持久的完成目标。",
		"en": "Event-sourced same-session goal state and lifecycle service for the BEELLIX Harness"
	},
	"@beellix-ai/goal-round-driver": {
		"path": "packages/harness/goal/builtin/goal-round-driver",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向选择、组合或排查自动 Goal Round 的用户与维护者的同会话续行驱动器说明。",
		"en": "Race-fenced same-session goal-round driver"
	},
	"@beellix-ai/harness-package-host": {
		"path": "packages/harness/extensions/builtin/package-host",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "extensions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": { "href": "/admin/plugin-settings/package-host" },
		"zh": "向现有 Harness 注册可信能力包的工具、Skills 和提示片段。",
		"en": "Register trusted package tools, skills and prompts with the existing Harness."
	},
	"@beellix-ai/harness-runtime": {
		"path": "apps/harness",
		"ownership": "foundation",
		"kind": "application",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "完整 Harness 的 Web、CLI、SDK 与 ACP 应用装配入口。",
		"en": "Full Harness assembly for Web, CLI, SDK and ACP."
	},
	"@beellix-ai/harness-source-profile": {
		"path": "apps/harness/source-profile",
		"ownership": "foundation",
		"kind": "application",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "隔离的源码回放与恢复验收入口，不是日常 Web 服务。",
		"en": "Isolated source replay and recovery verification, not the product Web service."
	},
	"@beellix-ai/harness-web-profile": {
		"path": "apps/harness/web-profile",
		"ownership": "foundation",
		"kind": "application",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "装配正式 Web Harness、标准预设、持久终端与会话提醒。",
		"en": "Product Web Harness assembly with presets, persistent terminals and session reminders."
	},
	"@beellix-ai/headless": {
		"path": "packages/harness/bundle/headless",
		"ownership": "foundation",
		"kind": "bundle",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "dsh 的一次性任务模式：从命令行运行单个任务并打印最终答案，供用户脚本化或自动化 dsh。",
		"en": "The dsh one-shot bundle: a direct core Agent/Session runner over dsh-base with no Host, HTTP, or browser layer"
	},
	"@beellix-ai/home-paths": {
		"path": "packages/harness/boot/home-paths",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "DeepSeek Harness 主目录与用户数据路径的共享解析，供需要统一根目录、波浪号展开与稳定监听路径的包使用。",
		"en": "Shared filesystem path helpers for the BEELLIX Harness"
	},
	"@beellix-ai/hook-protocol": {
		"path": "packages/harness/hooks/hook-protocol",
		"ownership": "foundation",
		"kind": "library",
		"group": "extensions",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "Claude Code 与 Codex 桥接背后的共享钩子规则——钩子能做什么、运行时会发生什么——供 hooks 子系统的用户与维护者阅读。",
		"en": "Shared Claude Code / Codex hook wire protocol: matcher engine, stdin/exit-code/stdout codec, multi-hook merge, and hook/* session events"
	},
	"@beellix-ai/hooks-claude-code": {
		"path": "packages/harness/hooks/extensions/hooks-claude-code",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "extensions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "在 agent 运行期间使用你现有的 Claude Code hooks.json 或 settings 钩子配置——阻塞提示词与工具、附加上下文或强制继续——供本桥接的用户与维护者阅读。",
		"en": "Bridge plugin: run a Claude Code hooks.json / settings hook config on the BEELLIX Harness interception seams"
	},
	"@beellix-ai/hooks-codex": {
		"path": "packages/harness/hooks/extensions/hooks-codex",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "extensions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "在 agent 运行期间使用你现有的 Codex hooks.json 钩子配置——阻塞提示词与工具、附加上下文或强制继续——供本桥接的用户与维护者阅读。",
		"en": "Bridge plugin: run a Codex hooks.json hook config on the BEELLIX Harness interception seams"
	},
	"@beellix-ai/host-directory-picker": {
		"path": "packages/harness/host/builtin/directory-picker",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "interfaces",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向 web GUI 宿主的工作区目录选择 seam：原生与浏览后端所实现的服务约定、能力词汇与错误码。",
		"en": "Abstract workspace-directory picking seam (ctx.directoryPicker) for the BEELLIX Harness web GUI host"
	},
	"@beellix-ai/host-directory-picker-auto": {
		"path": "packages/harness/host/builtin/directory-picker-auto",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "interfaces",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "目录选择 seam 的自适应选择器：在启动时判定一次 web GUI 宿主的处境，并挂载匹配的原生或浏览后端。",
		"en": "Adaptive chooser of the directory-picker seam: resolves the host situation at boot and mounts the native or browse backend for the BEELLIX Harness web GUI host"
	},
	"@beellix-ai/host-directory-picker-browse": {
		"path": "packages/harness/host/builtin/directory-picker-browse",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "interfaces",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "目录选择 seam 的应用内浏览后端：为 web GUI 宿主提供单层目录列举与子目录创建，也能服务于远程客户端。",
		"en": "In-app browsing backend of the directory-picker seam (listing/creation primitives over the host filesystem)"
	},
	"@beellix-ai/host-directory-picker-native": {
		"path": "packages/harness/host/builtin/directory-picker-native",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "interfaces",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "目录选择 seam 的原生 OS 选择器后端：为坐在 web GUI 宿主屏幕前的操作者每次打开一个平台选择器。",
		"en": "Native-OS-chooser backend of the directory-picker seam for the BEELLIX Harness web GUI host"
	},
	"@beellix-ai/host-frontend-static": {
		"path": "packages/harness/host/builtin/frontend-static",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "interfaces",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "Web 壳的 SPA dist 服务器：占据 webserver 回退席位，以遍历拒绝与 SPA index 回退服务已构建的前端。",
		"en": "SPA dist server for the Web shell: owns the webserver fallback seat, serving explicit index entries and static assets with traversal rejection and 404 misses"
	},
	"@beellix-ai/host-plugin-inventory": {
		"path": "packages/harness/host/builtin/plugin-inventory",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "interfaces",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "只读列出全局 Loader 状态与每个会话预设的插件组合。",
		"en": "Read-only Remote projection of current Cordis Loader plugin state"
	},
	"@beellix-ai/host-webserver": {
		"path": "packages/harness/host/builtin/webserver",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "interfaces",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "web GUI 宿主的 HTTP 服务器：具名路由与 upgrade 注册、index 转换，以及服务 Web 壳 SPA dist 的唯一回退席位。",
		"en": "Web route-registration plugin: HTTP and upgrade routes, index transform taps, and static dist fallback; knows no harness concepts"
	},
	"@beellix-ai/http-proxy": {
		"path": "packages/harness/network/http-proxy",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "Harness 的出站 HTTP 代理支持：从启动环境解析出的一份策略，如何覆盖到 Node fetch 本来会直连的每一个请求。",
		"en": "Process-wide outbound HTTP proxy policy for BEELLIX Harness: resolve it from the launch environment and install it as undici's global dispatcher"
	},
	"@beellix-ai/invariants": {
		"path": "packages/harness/runtime-diagnostics/builtin/invariants",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "core",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": { "href": "/admin/plugin-settings/invariants" },
		"zh": "注册并执行各能力包自有的运行时一致性检查。",
		"en": "Registry service for package-owned BEELLIX Harness runtime invariants"
	},
	"@beellix-ai/inventory-replenishment": {
		"path": "packages/scenarios/inventory-replenishment",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "库存补货的资料、专业核对、人员复核、产物与后续记录。",
		"en": "Inventory replenishment workbench.",
		"displayZh": "库存补货",
		"displayEn": "Inventory replenishment"
	},
	"@beellix-ai/jobs": {
		"path": "packages/harness/jobs/builtin/jobs",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "后台任务注册表约定，供组合、实现或排查后台工作的用户与维护者阅读：id、归属、生命周期与完成监听器。",
		"en": "Background job registry (ctx.jobs) for the BEELLIX Harness — shared ids, owner isolation, polling, cancellation, and completion listeners for long-running tool work"
	},
	"@beellix-ai/jobs-local": {
		"path": "packages/harness/jobs/builtin/jobs-local",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "进程本地后台任务注册表，供组合、容量评估或排查进程内任务的用户与维护者阅读：按所有者的准入、生命周期与销毁。",
		"en": "Process-local implementation of the BEELLIX Harness background job registry seam"
	},
	"@beellix-ai/launch-environment": {
		"path": "packages/harness/boot/launch-environment",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "本次运行环境的不可变快照，记住每个值来自哪一层；供必须以不信任压平 process.env 的方式解析面向用户值的包使用。",
		"en": "Immutable BEELLIX Harness launch environment that records which layer supplied each value"
	},
	"@beellix-ai/lazy-require": {
		"path": "packages/shared/node/lazy-require",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "按调用方位置延迟加载宿主依赖，并缓存成功结果。",
		"en": "Caller-relative, success-cached lazy loading for CommonJS-compatible Host dependencies"
	},
	"@beellix-ai/llm": {
		"path": "packages/harness/llm/builtin/llm",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "统一流式模型请求、提供方注册与模型元数据查询。",
		"en": "Provider-neutral LLM service interface for the BEELLIX Harness"
	},
	"@beellix-ai/llm-amazon-bedrock": {
		"path": "packages/harness/llm/extensions/llm-amazon-bedrock",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-ant-ling": {
		"path": "packages/harness/llm/extensions/llm-ant-ling",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-anthropic": {
		"path": "packages/harness/llm/extensions/llm-anthropic",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-azure": {
		"path": "packages/harness/llm/extensions/llm-azure",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-baseten": {
		"path": "packages/harness/llm/extensions/llm-baseten",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-cerebras": {
		"path": "packages/harness/llm/extensions/llm-cerebras",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-cloudflare": {
		"path": "packages/harness/llm/extensions/llm-cloudflare",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-deepseek": {
		"path": "packages/harness/llm/extensions/llm-deepseek",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "连接 DeepSeek Chat Completions，处理 thinking 与图片输入。",
		"en": "DeepSeek chat-completions adapter for the BEELLIX Harness LLM seam"
	},
	"@beellix-ai/llm-deepseek-account": {
		"path": "packages/harness/llm/extensions/llm-deepseek-account",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": null,
		"zh": "可选上游账号提供方；不装配企业身份或登录页面。",
		"en": "Fixed upstream provider compatibility contract."
	},
	"@beellix-ai/llm-deepseek-api-key": {
		"path": "packages/harness/llm/extensions/llm-deepseek-api-key",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": null,
		"zh": "DeepSeek API Key 提供方；凭据由运行环境服务解析。",
		"en": "Fixed upstream provider compatibility contract."
	},
	"@beellix-ai/llm-fireworks": {
		"path": "packages/harness/llm/extensions/llm-fireworks",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-github-copilot": {
		"path": "packages/harness/llm/extensions/llm-github-copilot",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-google": {
		"path": "packages/harness/llm/extensions/llm-google",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-groq": {
		"path": "packages/harness/llm/extensions/llm-groq",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-huggingface": {
		"path": "packages/harness/llm/extensions/llm-huggingface",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-minimax": {
		"path": "packages/harness/llm/extensions/llm-minimax",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-mistral": {
		"path": "packages/harness/llm/extensions/llm-mistral",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-mock-server": {
		"path": "packages/testing/models/llm-mock-server",
		"ownership": "foundation",
		"kind": "library",
		"group": "engineering",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "用于在无提供方密钥的情况下测试 LLM 适配器与恢复策略的可编脚本 OpenAI 兼容故障服务器，面向测试作者与演示。",
		"en": "Scriptable OpenAI-compatible HTTP/SSE fault server for LLM recovery tests"
	},
	"@beellix-ai/llm-moonshot": {
		"path": "packages/harness/llm/extensions/llm-moonshot",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-nvidia": {
		"path": "packages/harness/llm/extensions/llm-nvidia",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-openai": {
		"path": "packages/harness/llm/extensions/llm-openai",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-opencode": {
		"path": "packages/harness/llm/extensions/llm-opencode",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-openrouter": {
		"path": "packages/harness/llm/extensions/llm-openrouter",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-pi-ai": {
		"path": "packages/harness/llm/protocols/pi-ai",
		"ownership": "foundation",
		"kind": "library",
		"group": "models",
		"management": "technical",
		"contributes": [],
		"configuration": { "href": "/admin/models" },
		"zh": "BEELLIX OS 共享模型协议引擎；厂商目录由各厂商包提供。",
		"en": "Shared model protocol engine for BEELLIX OS; vendor packages own catalogs."
	},
	"@beellix-ai/llm-qwen": {
		"path": "packages/harness/llm/extensions/llm-qwen",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-replay": {
		"path": "packages/testing/models/llm-replay",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "engineering",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向快照测试的无密钥 LLM 回放插件，供测试作者针对已记录模型 transcript 启动真实 agent。",
		"en": "Replay LLM plugin: short-circuits llm/stream with model chunks reconstructed from a recorded session JSONL (keyless snapshot tests)"
	},
	"@beellix-ai/llm-retry": {
		"path": "packages/harness/llm/builtin/llm-retry",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "按提供方策略重试模型请求，保留可恢复的步骤记录。",
		"en": "Provider-routed LLM request retry policy for the BEELLIX Harness"
	},
	"@beellix-ai/llm-together": {
		"path": "packages/harness/llm/extensions/llm-together",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-vendor": {
		"path": "packages/harness/llm/builtin/llm-vendor",
		"ownership": "foundation",
		"kind": "library",
		"group": "models",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "厂商定义校验、管理员参数与热更新机制。",
		"en": "Vendor definition validation, administrator settings and live updates."
	},
	"@beellix-ai/llm-vercel-ai-gateway": {
		"path": "packages/harness/llm/extensions/llm-vercel-ai-gateway",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-xai": {
		"path": "packages/harness/llm/extensions/llm-xai",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-xiaomi": {
		"path": "packages/harness/llm/extensions/llm-xiaomi",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/llm-zai": {
		"path": "packages/harness/llm/extensions/llm-zai",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["models"],
		"configuration": { "href": "/admin/models" },
		"zh": "厂商模型定义与管理员连接参数，复用共享协议引擎。",
		"en": "Vendor models and administrator connection settings."
	},
	"@beellix-ai/loader-smoke": {
		"path": "packages/testing/harness/loader-smoke",
		"ownership": "foundation",
		"kind": "library",
		"group": "engineering",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "面向无密钥示例冒烟测试的共享子进程与直接 agent harness，供测试作者启动真实 Loader 组合。",
		"en": "Shared subprocess and direct-agent harness for keyless real-Loader example smoke tests"
	},
	"@beellix-ai/lsp": {
		"path": "packages/harness/lsp/builtin/lsp",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "files",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "LSP 能力 seam（ctx.lsp）：按文件扩展名选择提供方、四种规范化的代码导航操作与结构化错误，供组合或扩展代码导航的用户与维护者阅读。",
		"en": "Abstract LSP capability seam (ctx.lsp) for the BEELLIX Harness — language-server provider registry keyed by branded id and extension mapping, order-independent per-query selection, normalized definition/references/implementation/hover requests and results, and the LspError taxonomy"
	},
	"@beellix-ai/lsp-stdio": {
		"path": "packages/harness/lsp/builtin/lsp-stdio",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "files",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": { "href": "/admin/plugin-settings/lsp-stdio" },
		"zh": "ctx.lsp 的 stdio 语言服务器提供方：配置好的服务器命令、扩展名映射与有边界的临时打开查询，供组合本地代码导航的用户与维护者阅读。",
		"en": "Generic stdio language-server provider for the BEELLIX Harness LSP capability seam (ctx.lsp) — spawns configured servers, translates JSON-RPC, and serves transient-open goToDefinition/findReferences/goToImplementation/hover queries in the host filesystem namespace"
	},
	"@beellix-ai/mcp-client": {
		"path": "packages/harness/mcp/builtin/mcp-client",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "extensions",
		"management": "builtin",
		"contributes": ["mcp"],
		"configuration": { "href": "/admin/connections" },
		"zh": "连接外部 MCP 服务器，并把其工具注册到 Harness 工具服务。",
		"en": "MCP client bridge: connects to MCP servers and registers their tools on ctx.tools"
	},
	"@beellix-ai/mcp-resources": {
		"path": "packages/harness/mcp/builtin/mcp-resources",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "extensions",
		"management": "builtin",
		"contributes": ["mcp"],
		"configuration": { "href": "/admin/connections" },
		"zh": "按会话作用域发现和读取已配置 MCP 服务的资源及资源模板。",
		"en": "Scoped discovery and reading of configured MCP resources and templates."
	},
	"@beellix-ai/meeting-minutes": {
		"path": "packages/scenarios/meeting-minutes",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "会议发言转写、说话人确认、本场与企业声纹复用及有来源的纪要。",
		"en": "Meeting transcripts, confirmed speakers, meeting and enterprise voice profiles, and sourced minutes.",
		"displayZh": "会议纪要",
		"displayEn": "Meeting minutes"
	},
	"@beellix-ai/message-feedback": {
		"path": "packages/harness/feedback/builtin/message-feedback",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "针对已完成 assistant 消息的逐消息评分与备注，供用户与维护者选择、组合或排查该反馈服务。",
		"en": "Lifecycle-bound per-message rating and note sidecar for the BEELLIX Harness"
	},
	"@beellix-ai/mobile": {
		"path": "apps/mobile",
		"ownership": "foundation",
		"kind": "application",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "个人电脑的手机配套端；配对与安全通道完成前禁止构建制品。",
		"en": "Mobile and tablet application delivery."
	},
	"@beellix-ai/native-command": {
		"path": "packages/harness/subprocess/native-command",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "宿主原生命令与路径打开工具，提供无 shell 执行、取消、桌面探测与 WSL 路径交接。",
		"en": "Host-native command and path-opening utilities with shell-free execution, cancellation, desktop detection, and WSL handoff"
	},
	"@beellix-ai/node-addon-landlock-run": {
		"path": "native/landlock-run/packages/entry",
		"ownership": "foundation",
		"kind": "native",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "定位并探测 Linux Landlock 启动器，生成受限进程的授权参数。",
		"en": "Resolve and probe the Linux Landlock launcher and generate process grants."
	},
	"@beellix-ai/node-addon-landlock-run-linux-arm64": {
		"path": "native/landlock-run/packages/linux-arm64",
		"ownership": "foundation",
		"kind": "native",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "提供 Linux ARM64 的 Landlock 沙箱启动二进制，不用于 Windows。",
		"en": "Landlock sandbox launcher binary for Linux ARM64, not Windows."
	},
	"@beellix-ai/node-addon-landlock-run-linux-x64": {
		"path": "native/landlock-run/packages/linux-x64",
		"ownership": "foundation",
		"kind": "native",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "提供 Linux x64 的 Landlock 沙箱启动二进制，不用于 Windows。",
		"en": "Landlock sandbox launcher binary for Linux x64, not Windows."
	},
	"@beellix-ai/node-addon-system": {
		"path": "native/system/packages/entry",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "原生系统能力与对应平台的运行载体。",
		"en": "Native system capabilities and platform runtime artifacts."
	},
	"@beellix-ai/node-addon-system-darwin-arm64": {
		"path": "native/system/packages/darwin-arm64",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "原生系统能力与对应平台的运行载体。",
		"en": "Native system capabilities and platform runtime artifacts."
	},
	"@beellix-ai/node-addon-system-darwin-x64": {
		"path": "native/system/packages/darwin-x64",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "原生系统能力与对应平台的运行载体。",
		"en": "Native system capabilities and platform runtime artifacts."
	},
	"@beellix-ai/node-addon-system-linux-arm64": {
		"path": "native/system/packages/linux-arm64",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "原生系统能力与对应平台的运行载体。",
		"en": "Native system capabilities and platform runtime artifacts."
	},
	"@beellix-ai/node-addon-system-linux-x64": {
		"path": "native/system/packages/linux-x64",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "原生系统能力与对应平台的运行载体。",
		"en": "Native system capabilities and platform runtime artifacts."
	},
	"@beellix-ai/office-capabilities": {
		"path": "packages/plugins/office",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": ["tools", "skills"],
		"configuration": null,
		"zh": "独立交付文档、表格和演示工具及技能，沿用本机插件协议。",
		"en": "Independently delivered document, spreadsheet and presentation tools and skills using the existing local plugin protocol.",
		"displayZh": "Office 文档能力",
		"displayEn": "Office capabilities"
	},
	"@beellix-ai/output-retention": {
		"path": "packages/shared/common/output-retention",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "为必须限制返回上下文量的工具提供有界的面向模型输出：项与文本 retainer，以及标准化的省略页脚。",
		"en": "Zero-dependency bounded-retention primitive: ItemRetainer/TextRetainer + neutral notice helpers (what did we keep, what did we omit)"
	},
	"@beellix-ai/permission-presets": {
		"path": "packages/harness/interaction/builtin/permission-presets",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "security",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向用户的权限预设：供选择、配置或排查把沙箱模式与审批策略捆绑在一起的 Permissions 选择器的用户与维护者阅读。",
		"en": "User-facing permission presets (ctx.permissionPresets) for the BEELLIX Harness: one product-level Permissions select bundling the sandbox-mode and approval-policy knobs, written through to their own session events"
	},
	"@beellix-ai/persona": {
		"path": "packages/harness/preset/builtin/persona",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "core",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "为预设中的 Agent 配置可组合的系统提示词人设。",
		"en": "Composition-authored deployment persona section for the BEELLIX Harness"
	},
	"@beellix-ai/plan-mode": {
		"path": "packages/harness/plan/builtin/plan-mode",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向用户与维护者的计划模式说明：用于选择、配置或排查带部署引导、/plan 命令与经用户评审退出的逐 agent 规划功能。",
		"en": "Logged per-agent plan mode with deployment guidance, a direct slash command, and a user-reviewed exit"
	},
	"@beellix-ai/plugin-package-inventory-deepseek": {
		"path": "packages/harness/llm/extensions/plugin-package-inventory-deepseek",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "向官方 DeepSeek 请求附加活跃 Loader 包清单元数据。",
		"en": "Active Loader-backed plugin package inventory for official DeepSeek LLM API requests"
	},
	"@beellix-ai/project-acceptance": {
		"path": "packages/scenarios/project-acceptance",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "项目验收的资料、专业核对、人员复核、产物与后续记录。",
		"en": "Project acceptance workbench.",
		"displayZh": "项目验收",
		"displayEn": "Project acceptance"
	},
	"@beellix-ai/project-cost-review": {
		"path": "packages/scenarios/project-cost-review",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "成本复盘的资料、专业核对、人员复核、产物与后续记录。",
		"en": "Project cost review workbench.",
		"displayZh": "成本复盘",
		"displayEn": "Project cost review"
	},
	"@beellix-ai/ptc-runtime": {
		"path": "packages/harness/ptc-runtime/builtin/ptc-runtime",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "统一声明程序化工具调用的执行服务与沙箱契约。",
		"en": "Abstract PTC execution seam (ctx.ptcRuntime) for the DeepSeek Harness"
	},
	"@beellix-ai/ptc-runtime-node": {
		"path": "packages/harness/ptc-runtime/builtin/ptc-runtime-node",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "在受管 Node 子进程中运行程序化工具调用，使用共享沙箱与调用边界。",
		"en": "Managed Node process provider for programmatic tool calls."
	},
	"@beellix-ai/purchase-comparison": {
		"path": "packages/scenarios/purchase-comparison",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "采购比价的资料、专业核对、人员复核、产物与后续记录。",
		"en": "Purchase comparison workbench.",
		"displayZh": "采购比价",
		"displayEn": "Purchase comparison"
	},
	"@beellix-ai/purchase-followup": {
		"path": "packages/scenarios/purchase-followup",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "采购跟单的资料、专业核对、人员复核、产物与后续记录。",
		"en": "Purchase order follow-up workbench.",
		"displayZh": "采购跟单",
		"displayEn": "Purchase order follow-up"
	},
	"@beellix-ai/pwsh-local": {
		"path": "packages/harness/shell/builtin/pwsh-local",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": { "href": "/admin/plugin-settings/shell" },
		"zh": "在宿主运行普通 PowerShell 命令，本身不提供进程隔离。",
		"en": "Local PowerShell implementation of the BEELLIX Harness bash executor seam"
	},
	"@beellix-ai/pwsh-sandbox": {
		"path": "packages/harness/shell/builtin/pwsh-sandbox",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": { "href": "/admin/plugin-settings/shell" },
		"zh": "按共享沙箱策略执行受限 PowerShell 命令。",
		"en": "Sandbox-consuming implementation of the BEELLIX Harness PowerShell executor seam (confines every command via ctx.sandbox, reports denial/enforcement result facts)"
	},
	"@beellix-ai/python-runtime-closure": {
		"path": "apps/harness/python/sdk-runtime",
		"ownership": "foundation",
		"kind": "application",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "定义 Python 运行时 wheel 打包的 CLI 与 Node 依赖集合。",
		"en": "CLI and Node dependency closure for Python runtime wheels."
	},
	"@beellix-ai/quality-correction": {
		"path": "packages/scenarios/quality-correction",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "质量整改的资料、专业核对、人员复核、产物与后续记录。",
		"en": "Quality correction workbench.",
		"displayZh": "质量整改",
		"displayEn": "Quality correction"
	},
	"@beellix-ai/receivables-collection": {
		"path": "packages/scenarios/receivables-collection",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "应收回款的资料、专业核对、人员复核、产物与后续记录。",
		"en": "Receivables collection workbench.",
		"displayZh": "应收回款",
		"displayEn": "Receivables collection"
	},
	"@beellix-ai/recruitment-assessment": {
		"path": "packages/scenarios/recruitment-assessment",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "多平台履历归集、沟通草稿、简历初筛与面试交接。",
		"en": "Recruitment assessment workbench.",
		"displayZh": "招聘助手",
		"displayEn": "Recruitment assessment"
	},
	"@beellix-ai/remote-mock": {
		"path": "packages/testing/core/remote-mock",
		"ownership": "foundation",
		"kind": "library",
		"group": "engineering",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "测试 Remote 服务响应与调用。",
		"en": "Mock remote responses and calls."
	},
	"@beellix-ai/repeat-tool-reminder": {
		"path": "packages/harness/guard/builtin/repeat-tool-reminder",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "security",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "建议性循环卫生 guard：当 agent 重复完全相同的工具调用时提醒模型，供选择、配置或排查此插件的用户与维护者阅读。",
		"en": "Repeat-tool-call guard plugin: advisory reminders when an agent loops on identical tool calls"
	},
	"@beellix-ai/sales-opportunity": {
		"path": "packages/scenarios/sales-opportunity",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "商机跟进的资料、专业核对、人员复核、产物与后续记录。",
		"en": "Sales opportunity follow-up workbench.",
		"displayZh": "商机跟进",
		"displayEn": "Sales opportunity follow-up"
	},
	"@beellix-ai/sales-order-review": {
		"path": "packages/scenarios/sales-order-review",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "订单审核的资料、专业核对、人员复核、产物与后续记录。",
		"en": "Sales order review workbench.",
		"displayZh": "订单审核",
		"displayEn": "Sales order review"
	},
	"@beellix-ai/sandbox": {
		"path": "packages/harness/sandbox/builtin/sandbox",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "security",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "进程沙箱服务约定：面向组合、使用或扩展同世界子进程隔离的用户与维护者。",
		"en": "Abstract process-sandbox seam (ctx.sandbox) for the BEELLIX Harness: same-world confinement vocabulary and the SandboxProvider contract"
	},
	"@beellix-ai/sandbox-local": {
		"path": "packages/harness/sandbox/builtin/sandbox-local",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "security",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向 Linux、macOS 或 Windows 上选择、配置或排查进程隔离的用户与维护者的本地各平台沙箱后端。",
		"en": "Local process-sandbox backends for the BEELLIX Harness sandbox seam: bwrap, the npm-distributed landlock-run launcher, macOS Seatbelt, or the Windows ACL restricted-token runner — functionally probed, fail-closed"
	},
	"@beellix-ai/sandbox-policy": {
		"path": "packages/harness/sandbox/builtin/sandbox-policy",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "security",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向组合、配置或排查跨执行能力文件效果策略的用户与维护者的共享逐调用沙箱策略解析器与当前模型上下文。",
		"en": "Per-call sandbox policy resolver and current model context: deployment fallbacks plus each session's mode and workspace root, shared by every enforcing capability family"
	},
	"@beellix-ai/sandbox-windows-acl": {
		"path": "packages/harness/sandbox/sandbox-windows-acl",
		"ownership": "foundation",
		"kind": "library",
		"group": "security",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "面向 Windows 上选择、配置或排查受限令牌进程隔离的用户与维护者的 Windows 写入限制沙箱后端。",
		"en": "Windows ACL write-restriction sandbox backend (restricted-token spawn with capability-SID write allowlist) for the BEELLIX Harness sandbox seam"
	},
	"@beellix-ai/scenario-starter": {
		"path": "examples/agent-packages/scenario-starter",
		"ownership": "foundation",
		"kind": "example",
		"group": "engineering",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "场景开发教学模板，演示公共工具、来源、复核与专属UI；不作为已安装的业务场景。",
		"en": "Scenario authoring example with public tools, sources, review and custom UI; not an installed business scenario."
	},
	"@beellix-ai/schedule": {
		"path": "packages/harness/schedule/builtin/schedule",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "Host 独立持久提醒、显式旧会话导入、投递回执与故障恢复。",
		"en": "Host-wide durable reminders with explicit legacy import and inbox receipt recovery"
	},
	"@beellix-ai/schemastery": {
		"path": "vendor/schemastery",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "定义并验证插件配置，提供类型化配置描述。",
		"en": "Typed configuration definitions and validation."
	},
	"@beellix-ai/scope": {
		"path": "packages/harness/core/scope",
		"ownership": "foundation",
		"kind": "library",
		"group": "core",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "提供按 Agent 或分组隔离贡献的作用域注册辅助库。",
		"en": "Scoped-context registration primitive (scope tags, scope-filtered event dispatch) for the BEELLIX Harness"
	},
	"@beellix-ai/sdk-app": {
		"path": "packages/harness/bundle/sdk-app",
		"ownership": "foundation",
		"kind": "bundle",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "面向启动 JSON-RPC harness 运行时的用户与维护者，说明 SDK stdio 应用 profile。",
		"en": "The dsh SDK profile bundle: stdio JSON-RPC serving and process lifecycle over dsh-base"
	},
	"@beellix-ai/sdk-client": {
		"path": "apps/harness/sdk-client",
		"ownership": "foundation",
		"kind": "sdk",
		"group": "interfaces",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "面向以子进程方式启动 DeepSeek Harness 运行时、并通过 stdio JSON-RPC 驱动 agent 轮次的调用方的 TypeScript SDK 客户端：DeepSeekHarness 运行 API 与低层 HarnessClient。",
		"en": "TypeScript client SDK for driving a BEELLIX Harness runtime subprocess over stdio JSON-RPC: the DeepSeekHarness high-level turns API and the lower-level HarnessClient"
	},
	"@beellix-ai/sdk-jsonrpc-server": {
		"path": "packages/harness/sdk/builtin/server",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "interfaces",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向让进程外 SDK 客户端在 DeepSeek Harness 运行时中打开会话并驱动 agent 的部署的 stdio JSON-RPC 服务插件。",
		"en": "Stdio JSON-RPC server plugin for out-of-process BEELLIX Harness SDK clients"
	},
	"@beellix-ai/sdk-minimal": {
		"path": "packages/harness/bundle/sdk-minimal",
		"ownership": "foundation",
		"kind": "bundle",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "供需要不含共享 base bundle 的极简跨平台 coding agent 的用户使用的独立双工具 SDK profile。",
		"en": "The standalone minimal SDK profile bundle: JSON-RPC, one DeepSeek adapter, persistent shell, editor, and JSONL sessions"
	},
	"@beellix-ai/sdk-protocol": {
		"path": "packages/harness/sdk/protocol",
		"ownership": "foundation",
		"kind": "library",
		"group": "interfaces",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "面向客户端与服务端实现者的 SDK 协议格式说明：Harness 运行时与其 SDK 客户端之间使用的按换行分帧 JSON-RPC 传输，以及具名的请求、结果与通知类型。",
		"en": "Shared wire protocol for the BEELLIX Harness SDK runtime: the newline-delimited JSON-RPC stdio transport and the named request, result, and notification types spoken between the runtime server and SDK clients"
	},
	"@beellix-ai/session": {
		"path": "packages/harness/core/session",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "core",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "记录 Agent 交互事件，提供可回放的会话日志与内存存储。",
		"en": "Event-sourced session store for the BEELLIX Harness"
	},
	"@beellix-ai/session-checkpoint-policy": {
		"path": "packages/harness/session/builtin/session-checkpoint-policy",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向用户与维护者的语义会话持久性检查点说明，用于部署不会在崩溃时丢失模型请求或工具副作用的持久化 agent。",
		"en": "Semantic session durability checkpoints before model requests and tool side effects"
	},
	"@beellix-ai/session-format": {
		"path": "packages/harness/session/builtin/session-format",
		"ownership": "foundation",
		"kind": "library",
		"group": "sessions",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "会话格式定义、版本目录或顺序迁移。",
		"en": "Session format definitions, version catalog or ordered migration."
	},
	"@beellix-ai/session-format-catalog": {
		"path": "packages/harness/session/builtin/session-format-catalog",
		"ownership": "foundation",
		"kind": "library",
		"group": "sessions",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "会话格式定义、版本目录或顺序迁移。",
		"en": "Session format definitions, version catalog or ordered migration."
	},
	"@beellix-ai/session-format-v0-to-v1": {
		"path": "packages/harness/session/builtin/session-format-v0-to-v1",
		"ownership": "foundation",
		"kind": "library",
		"group": "sessions",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "会话格式定义、版本目录或顺序迁移。",
		"en": "Session format definitions, version catalog or ordered migration."
	},
	"@beellix-ai/session-format-v1-to-v2": {
		"path": "packages/harness/session/builtin/session-format-v1-to-v2",
		"ownership": "foundation",
		"kind": "library",
		"group": "sessions",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "会话格式定义、版本目录或顺序迁移。",
		"en": "Session format definitions, version catalog or ordered migration."
	},
	"@beellix-ai/session-format-v2-to-v3": {
		"path": "packages/harness/session/builtin/session-format-v2-to-v3",
		"ownership": "foundation",
		"kind": "library",
		"group": "sessions",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "会话格式定义、版本目录或顺序迁移。",
		"en": "Session format definitions, version catalog or ordered migration."
	},
	"@beellix-ai/session-format-v3-to-v4": {
		"path": "packages/harness/session/builtin/session-format-v3-to-v4",
		"ownership": "foundation",
		"kind": "library",
		"group": "sessions",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "独立的 V3→V4 会话迁移、历史来源兼容和新版格式校验。",
		"en": "Standalone V3 to V4 session migration and validation."
	},
	"@beellix-ai/session-log-deepseek": {
		"path": "packages/harness/session/extensions/session-log-deepseek",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向启用官方 DeepSeek 请求元数据的部署，说明规范会话日志的增量上传。",
		"en": "Incremental lossless session-log request extension for the official DeepSeek LLM API"
	},
	"@beellix-ai/session-log-export": {
		"path": "packages/harness/session-query/builtin/session-log-export",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "Web 会话日志 ZIP 导出：Host 流式传输、认证下载路由、Session Header 操作与 /export 命令。",
		"en": "Web Session-log export command and shared download dialog"
	},
	"@beellix-ai/session-persistence": {
		"path": "packages/harness/session/builtin/session-persistence",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向用户与维护者的持久会话存储 seam 说明，用于选择持久化后端、恢复会话，或按共享服务约定构建后端。",
		"en": "Abstract durable session persistence seam (ctx.sessionPersistence) for the BEELLIX Harness"
	},
	"@beellix-ai/session-persistence-jsonl": {
		"path": "packages/harness/session/builtin/session-persistence-jsonl",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向部署方与维护者的随产品交付 JSONL 会话持久化后端说明，用于选择、配置或排查带可选 Zstandard 压缩的逐会话持久日志。",
		"en": "JSONL durable session persistence backend for the BEELLIX Harness"
	},
	"@beellix-ai/session-projection": {
		"path": "packages/harness/session/builtin/session-projection",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向开发者与维护者的会话投影注册表说明，用于向客户端载体提供日志派生逐会话状态的完整当前值，或维护驱动约定。",
		"en": "Session-projection seam: the merge-extensible projection type table, the provider contract, and the ctx.sessionProjections registry serving whole current values of log-derived per-session state"
	},
	"@beellix-ai/session-projection-cache": {
		"path": "packages/harness/session/builtin/session-projection-cache",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向部署方与维护者的持久会话投影缓存说明，用于选择、配置或排查持久检查点、零 I/O 列表读取与加速的冷投影折叠。",
		"en": "Persisted projection cache (ctx.sessionProjectionCache): durable per-session checkpoint records on the session_projcache storage domain (per-record layout), throttled write-behind, and the cached listing read"
	},
	"@beellix-ai/session-query": {
		"path": "packages/harness/session-query/builtin/session-query",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向消费方与后端作者的统一会话历史查询服务：对实时与持久会话日志的精确读取、关系追踪与提供方无关过滤。",
		"en": "Combined session query service contract with concrete reads, traces, and filters"
	},
	"@beellix-ai/session-query-sqlite": {
		"path": "packages/harness/session-query/builtin/session-query-sqlite",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向部署方与维护者的 SQLite FTS5 会话历史全文搜索后端，用于选择、配置或排查查询服务之上的全文搜索。",
		"en": "Concrete ctx.sessionQuery backend with SQLite FTS5 search"
	},
	"@beellix-ai/session-reference": {
		"path": "packages/harness/context/builtin/session-reference",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "context",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "跨会话快照引用与持久的不受信任模型上下文，供启用或排查 ctx.sessionReferenceResolver 的用户与维护者阅读。",
		"en": "Cross-session snapshot references and durable untrusted model context (ctx.sessionReferenceResolver)"
	},
	"@beellix-ai/session-snapshot": {
		"path": "packages/testing/harness/session-snapshot",
		"ownership": "foundation",
		"kind": "library",
		"group": "engineering",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "面向无密钥 profile 测试的 session-log 快照支持：manifest、身份脱敏、规范化、workspace 检查与协议适配器。",
		"en": "Session-log snapshot core with an ACP protocol adapter, expected-output normalization, and fixture invariants"
	},
	"@beellix-ai/session-stats": {
		"path": "packages/harness/session/builtin/session-stats",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向客户端与维护者的全日志会话计数与墙钟时间说明，用于选择、组合或排查 sessionStats 投影单元。",
		"en": "Whole-log conversation counts and wall times projection (sessionStats) for the BEELLIX Harness"
	},
	"@beellix-ai/session-telemetry": {
		"path": "packages/harness/session/session-telemetry",
		"ownership": "foundation",
		"kind": "library",
		"group": "sessions",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "面向部署方与后端作者的会话遥测捕获 seam 说明，用于选择上报后端、挂载脱敏规则或实现后端约定。",
		"en": "SessionTelemetryBackend seam for the BEELLIX Harness: session-event capture, projection, redaction, and handoff to a reporting backend"
	},
	"@beellix-ai/session-telemetry-otel": {
		"path": "packages/harness/session/extensions/session-telemetry-otel",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向部署方的 OpenTelemetry 会话遥测后端说明，用于选择模式、配置导出器或排查哪些数据离开本机。",
		"en": "OpenTelemetry backend for the BEELLIX Harness telemetry seam: hands captured session records to the OTel JS SDK's log pipeline"
	},
	"@beellix-ai/session-title": {
		"path": "packages/harness/session/builtin/session-title",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向用户与维护者的日志会话标题说明，用于选择标题来源、配置服务或排查标题状态。",
		"en": "Log-backed session title service and provider registry for the BEELLIX Harness"
	},
	"@beellix-ai/session-title-all-prompts-llm": {
		"path": "packages/harness/session/builtin/session-title-all-prompts-llm",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向用户与维护者的全消息 LLM 会话标题提供方说明，用于选择标题策略或排查自动标题生成。",
		"en": "All-user-messages LLM provider plugin for BEELLIX Harness session titles"
	},
	"@beellix-ai/session-title-first-prompt-llm": {
		"path": "packages/harness/session/builtin/session-title-first-prompt-llm",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向用户与维护者的首消息 LLM 会话标题提供方说明，用于选择标题策略或排查自动标题生成。",
		"en": "First-message LLM provider plugin for BEELLIX Harness session titles"
	},
	"@beellix-ai/session-title-llm": {
		"path": "packages/harness/session/session-title-llm",
		"ownership": "foundation",
		"kind": "library",
		"group": "sessions",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "面向用户与维护者的共享模型标题生成策略说明，用于配置标题提供方或排查辅助 LLM 请求。",
		"en": "Shared LLM generation policy for BEELLIX Harness session-title providers"
	},
	"@beellix-ai/session-turn-outline": {
		"path": "packages/harness/session/builtin/session-turn-outline",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向组合或调试 turnOutline 投影单元的客户端与维护者的全量轮次大纲说明，支撑整会话轮次导航。",
		"en": "Whole-log turn outline projection (turnOutline) for the BEELLIX Harness"
	},
	"@beellix-ai/settings": {
		"path": "packages/harness/settings/builtin/settings",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "platform",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向插件作者与维护者的用户设置服务：注册可配置 namespace、读取解析值或接入配置界面。",
		"en": "Abstract user-settings seam (ctx.settings) for the BEELLIX Harness"
	},
	"@beellix-ai/settings-file": {
		"path": "packages/harness/settings/builtin/settings-file",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "platform",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向用户与维护者的文件型设置提供方：选择、配置或排查 YAML/JSON 设置文档及其热重载。",
		"en": "File-backed settings provider (settings.yaml) for the BEELLIX Harness"
	},
	"@beellix-ai/shell": {
		"path": "packages/harness/shell/builtin/shell",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": { "href": "/admin/plugin-settings/shell" },
		"zh": "提供统一命令执行服务，供 Bash、PowerShell 实现与工具使用。",
		"en": "Abstract bash executor seam (ctx.shell) for the BEELLIX Harness"
	},
	"@beellix-ai/shell-env": {
		"path": "packages/harness/shell/builtin/shell-env",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "为模型 Shell 调用注入受管环境信息。",
		"en": "Tool-independent managed DSH_* shell environment registry"
	},
	"@beellix-ai/skill": {
		"path": "packages/harness/skill/builtin/skill",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "extensions",
		"management": "builtin",
		"contributes": ["skills"],
		"configuration": null,
		"zh": "注册并合并来自不同提供方的技能，统一解析与加载。",
		"en": "Agent skill provider registry for the BEELLIX Harness"
	},
	"@beellix-ai/skill-badge": {
		"path": "packages/harness/skill/builtin/skill-badge",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "extensions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "随包附带的「powered by dsh」徽章 skill，供启用、使用或排查该可选徽章提供方的用户与维护者阅读。",
		"en": "Bundled dsh badge skill provider for BEELLIX Harness"
	},
	"@beellix-ai/skill-filesystem": {
		"path": "packages/harness/skill/builtin/skill-filesystem",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "extensions",
		"management": "builtin",
		"contributes": ["skills"],
		"configuration": { "href": "/admin/plugin-settings/skill-filesystem" },
		"zh": "发现并监视项目、用户和自定义目录中的本地技能。",
		"en": "Local filesystem skill provider for the BEELLIX Harness"
	},
	"@beellix-ai/smart-quotation": {
		"path": "packages/scenarios/smart-quotation",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "清单报价工作台、用户字段配置、精确计算、来源核对与交付组织。",
		"en": "List quotation workspace, personal field configuration, calculation and delivery tools.",
		"displayZh": "智能报价-建筑",
		"displayEn": "Smart quotation · Construction"
	},
	"@beellix-ai/spill": {
		"path": "packages/harness/spill/builtin/spill",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "spill 存储服务：部署方与插件作者如何保存过大的工具文本并取回可检索的定位信息。",
		"en": "Abstract spill storage seam (ctx.spillStore) for the BEELLIX Harness — save oversized tool text and return a retrieval locator"
	},
	"@beellix-ai/spill-local": {
		"path": "packages/harness/spill/builtin/spill-local",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "本地文件系统 spill 后端：spill 工具输出如何保存到私有会话级文件，并用 read 或 grep 取回。",
		"en": "Local-filesystem implementation of the BEELLIX Harness spill storage seam (private session-scoped files)"
	},
	"@beellix-ai/spill-policy": {
		"path": "packages/harness/spill/builtin/spill-policy",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "工具结果 spill 策略：部署如何用预览和可检索的 spill 文件把过大的纯文本工具结果挡在模型上下文之外。",
		"en": "Tool-result spill policy for the BEELLIX Harness — replaces oversized plain-text tool results with a retained preview plus a spill-file path (no service API)"
	},
	"@beellix-ai/storage": {
		"path": "packages/harness/storage/builtin/storage",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "存储枢纽（ctx.storage）：面向选择、挂载或排查具名存储后端与数据形式设施的组合方与维护者。",
		"en": "Storage hub (ctx.storage): named backend registry plus mounted data-form facilities for the BEELLIX Harness"
	},
	"@beellix-ai/storage-domain": {
		"path": "packages/harness/storage/builtin/storage-domain",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "领域数据形式（ctx.storageDomain）：面向在存储后端之上选择、挂载或排查经过 schema 校验、发出变更事件的 KV 领域的宿主与维护者。",
		"en": "Domain data form (ctx.storage.domain): schema-validated, event-emitting KV domains over storage backends for the BEELLIX Harness"
	},
	"@beellix-ai/storage-json": {
		"path": "packages/harness/storage/builtin/storage-json",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "JSON 存储后端：面向在配置根目录下选择、配置或排查整单元文件与逐记录文件的宿主与维护者。",
		"en": "JSON file KV storage backend for the BEELLIX Harness storage hub"
	},
	"@beellix-ai/storage-sqlite": {
		"path": "packages/harness/storage/builtin/storage-sqlite",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "SQLite 存储后端：面向在单个数据库文件中选择、配置或排查按行存储文档的 KV 存储的宿主与维护者。",
		"en": "SQLite storage backend (kv facet) for the BEELLIX Harness storage hub"
	},
	"@beellix-ai/subagent": {
		"path": "packages/harness/subagent/builtin/subagent",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向用户与维护者的 subagent 委派 seam，用于选择提供方后端、组装委派工具或排查子 agent 运行问题。",
		"en": "Abstract subagent seam (ctx.subagents): named-provider registry for delegating to child agents"
	},
	"@beellix-ai/subagent-acp": {
		"path": "packages/harness/subagent/extensions/subagent-acp",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向用户与维护者的进程外 ACP subagent 后端，用于选择委派提供方、配置子 ACP agent 命令或排查远程子 agent 运行问题。",
		"en": "Out-of-process ACP subagent backend: drives a child agent in a spawned subprocess over the Agent Client Protocol"
	},
	"@beellix-ai/subagent-claude-code": {
		"path": "packages/harness/subagent/extensions/subagent-claude-code",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "通过官方 Agent SDK 注册一次性 Claude Code 子智能体提供方；随包附带可选装配补丁。",
		"en": "One-shot Claude Code subagent provider over the official Agent SDK, with an optional composition patch"
	},
	"@beellix-ai/subagent-codex": {
		"path": "packages/harness/subagent/extensions/subagent-codex",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "通过官方 app-server 协议注册一次性 Codex 子智能体提供方；随包附带可选装配补丁。",
		"en": "One-shot Codex subagent provider over the official app-server protocol, with an optional composition patch"
	},
	"@beellix-ai/subagent-dsh-sdk": {
		"path": "apps/harness/subagent-sdk",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "interfaces",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向用户与维护者的进程外 SDK subagent 后端，用于选择委派提供方、配置子 Harness 运行时命令或排查远程子 agent 运行问题。",
		"en": "Out-of-process SDK subagent backend: drives a child BEELLIX Harness runtime subprocess over stdio JSON-RPC through the TypeScript SDK client"
	},
	"@beellix-ai/subagent-fork-in-process": {
		"path": "packages/harness/subagent/builtin/subagent-fork-in-process",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向用户与维护者的进程内 fork subagent 后端说明，用于选择、配置或排查以父级已完成轮次作初始内容的子 agent。",
		"en": "In-process fork subagent backend: runs a child agent seeded with a prefix of the parent's log"
	},
	"@beellix-ai/subagent-in-process-driver": {
		"path": "packages/harness/subagent/subagent-in-process-driver",
		"ownership": "foundation",
		"kind": "library",
		"group": "orchestration",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "共享进程内 subagent 运行驱动器，供维护者与后端作者理解或扩展 spawn 与 fork 的运行生命周期。",
		"en": "Shared in-process subagent run driver: drives a child agent on ctx.agents (used by the spawn and fork backends)"
	},
	"@beellix-ai/subagent-spawn-in-process": {
		"path": "packages/harness/subagent/builtin/subagent-spawn-in-process",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向用户与维护者的进程内 spawn subagent 后端说明，用于选择、配置或排查全新子级委派。",
		"en": "In-process spawn subagent backend: runs a fresh child agent on ctx.agents"
	},
	"@beellix-ai/subprocess": {
		"path": "packages/harness/subprocess/builtin/subprocess",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "提供受管子进程和终端的启动、观察与终止接口。",
		"en": "Subprocess seam (ctx.subprocess) for the BEELLIX Harness — managed process groups, bounded spill-backed output, and escalated kills behind one abstract service"
	},
	"@beellix-ai/subprocess-e2b": {
		"path": "packages/harness/subprocess/extensions/subprocess-e2b",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "共享远程沙箱内的 shell 命令与终端：agent 可以在那里运行什么、输出如何处理，以及可以期待什么——面向 E2B 家族的部署方与维护者。",
		"en": "E2B subprocess implementation for BEELLIX Harness"
	},
	"@beellix-ai/subprocess-local": {
		"path": "packages/harness/subprocess/builtin/subprocess-local",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "在本机管理进程树与真实终端，负责退出和清理。",
		"en": "Local-subprocess implementation of the BEELLIX Harness subprocess seam"
	},
	"@beellix-ai/system-prompt": {
		"path": "packages/harness/core/system-prompt",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "core",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "组装系统提示词、变量、工具说明与提示片段。",
		"en": "System prompt assembly registry for the BEELLIX Harness"
	},
	"@beellix-ai/tender-response": {
		"path": "packages/scenarios/tender-response",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "投标响应的资料、专业核对、人员复核、产物与后续记录。",
		"en": "Tender response workbench.",
		"displayZh": "投标响应",
		"displayEn": "Tender response"
	},
	"@beellix-ai/terminal": {
		"path": "packages/harness/terminal/builtin/terminal",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "管理按所有者隔离的持久终端会话。",
		"en": "Persistent PTY session seam for the BEELLIX Harness — owner-scoped ids, backend registry, interactive sends, reads, signals, and awaited cleanup"
	},
	"@beellix-ai/terminal-bash": {
		"path": "packages/harness/terminal/builtin/terminal-bash",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "启动交互式 Bash 或 PowerShell 终端，检测就绪并限制保留输出。",
		"en": "Persistent shell PTY backend over the BEELLIX Harness subprocess terminal primitive"
	},
	"@beellix-ai/three-way-match": {
		"path": "packages/scenarios/three-way-match",
		"ownership": "business",
		"kind": "plugin",
		"group": "extensions",
		"management": "extension",
		"contributes": [
			"tools",
			"skills",
			"ui"
		],
		"configuration": null,
		"zh": "三单匹配的资料、专业核对、人员复核、产物与后续记录。",
		"en": "Three-way matching workbench.",
		"displayZh": "三单匹配",
		"displayEn": "Three-way matching"
	},
	"@beellix-ai/time-context": {
		"path": "packages/harness/context/builtin/time-context",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "context",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "可选的按步骤时钟上下文，包含当前时间、浏览器时区与经过时长，供启用或调优本插件的用户与维护者阅读。",
		"en": "Opt-in durable per-step context with the current time and elapsed time"
	},
	"@beellix-ai/timeout": {
		"path": "packages/shared/common/timeout",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "共享超时运算、截止时间融合与超时/取消分类，供需要限制调用方提示、启动 deadline 并在之后区分二者的能力使用。",
		"en": "Zero-dependency timeout/deadline primitive: clampTimeout, deadline, timeoutOf, TimeoutReason (timing + classification only, no termination)"
	},
	"@beellix-ai/tmux-context": {
		"path": "packages/harness/context/extensions/tmux-context",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "context",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "可选的按轮次 tmux 位置上下文，供启用或调优 agent 的 session、window 与 pane 感知的用户与维护者阅读。",
		"en": "Opt-in durable per-step context with this agent's tmux pane and window location"
	},
	"@beellix-ai/token-meter": {
		"path": "packages/harness/llm/builtin/token-meter",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "models",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "估算 token 与上下文压力，为压缩和容量显示提供计量。",
		"en": "Replay-aware token measurement service (ctx.tokenMeter) for the BEELLIX Harness"
	},
	"@beellix-ai/tool-ask-user": {
		"path": "packages/harness/interaction/builtin/tool-ask-user",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "security",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "基于用户交互 seam 的模型侧 ask_user_question 工具；供组合或排查交互式 agent 表面的用户与维护者阅读。",
		"en": "Model-facing ask_user_question tool over the ctx.userQuestions seam"
	},
	"@beellix-ai/tool-bash": {
		"path": "packages/harness/shell/builtin/tool-bash",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": { "href": "/admin/plugin-settings/shell" },
		"zh": "向模型提供一次性 Bash 命令、后台任务与审批升权入口。",
		"en": "Model-facing bash tool with optional generic background-job and sandbox-escalation support"
	},
	"@beellix-ai/tool-bash-persistent": {
		"path": "packages/harness/shell/builtin/tool-bash-persistent",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "向模型提供跨调用保留状态、按所有者隔离的 Bash 工具。",
		"en": "Model-facing owner-scoped persistent Bash tool backed by the Harness PTY service"
	},
	"@beellix-ai/tool-call-timeout-policy": {
		"path": "packages/harness/guard/builtin/timeout-policy",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "security",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "为配合取消的工具调用设置协作式时间上限，并在超时流程完成后映射为清晰的模型错误，供选择或排查此插件的用户与维护者阅读。",
		"en": "Tool-call timeout policy: a tools/execute wrapper that arms a per-tool deadline on exec.signal and returns TOOL_TIMEOUT when it wins"
	},
	"@beellix-ai/tool-cordis": {
		"path": "packages/harness/extensions/development/tool-cordis",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "extensions",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "面向 agent 与维护者的 Cordis 运行时工具说明，用于选择、组合或排查动态包工作流。",
		"en": "Self-referential cordis toolset: inspect the live runtime, mount and dispose model-written plugins"
	},
	"@beellix-ai/tool-enterprise-resources": {
		"path": "packages/harness/enterprise/builtin/tool-enterprise-resources",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "extensions",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "通过私有资源客户端向模型贡献五个企业资源工具，卸载时释放工具注册。",
		"en": "Five enterprise resource tools through the private resource client; releases registrations on unload."
	},
	"@beellix-ai/tool-fs": {
		"path": "packages/harness/fs/builtin/tool-fs",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "files",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "向模型提供文本读取、图片读取、写入和编辑工具。",
		"en": "Model-facing filesystem tools (read, write, edit) over the BEELLIX Harness filesystem seam (ctx.fs)"
	},
	"@beellix-ai/tool-fs-search": {
		"path": "packages/harness/fs/builtin/tool-fs-search",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "files",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "向模型提供 glob 文件发现和 grep 内容搜索工具。",
		"en": "Model-facing filesystem discovery tools (glob, grep) backed by the packaged ripgrep binary (@vscode/ripgrep)"
	},
	"@beellix-ai/tool-goal": {
		"path": "packages/harness/goal/builtin/tool-goal",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "面向选择、组合或排查 get_goal、create_goal 与 update_goal 的用户与维护者的模型侧 goal 工具说明。",
		"en": "Model-facing same-session goal tools with execution-time authority checks"
	},
	"@beellix-ai/tool-jobs": {
		"path": "packages/harness/jobs/builtin/tool-jobs",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "面向模型的背景任务控制，供选择、配置或排查 job_output、job_list、job_kill 与完成通知的用户与维护者阅读。",
		"en": "Model-facing background job control tools (job_output, job_list, job_kill) over the ctx.jobs registry"
	},
	"@beellix-ai/tool-lsp": {
		"path": "packages/harness/lsp/builtin/tool-lsp",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "files",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": { "href": "/admin/plugin-settings/lsp-stdio" },
		"zh": "向模型提供四种只读代码导航操作，限制返回结果规模。",
		"en": "Model-facing lsp tool over the BEELLIX Harness LSP capability seam (ctx.lsp) — one read-only tool with goToDefinition/findReferences/goToImplementation/hover operations, one-based UTF-16 cursor coordinates, bounded location rendering, and hover normalization"
	},
	"@beellix-ai/tool-present": {
		"path": "packages/harness/fs/builtin/tool-present",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "files",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "向工作区交付文件及预览入口。",
		"en": "Present workspace files and previews."
	},
	"@beellix-ai/tool-pwsh": {
		"path": "packages/harness/shell/builtin/tool-pwsh",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": { "href": "/admin/plugin-settings/shell" },
		"zh": "向模型提供一次性 PowerShell 命令、后台任务与审批升权入口。",
		"en": "Model-facing pwsh tool over the bash executor seam"
	},
	"@beellix-ai/tool-pwsh-persistent": {
		"path": "packages/harness/shell/builtin/tool-pwsh-persistent",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "向模型提供跨调用保留状态、按所有者隔离的 PowerShell 工具。",
		"en": "Model-facing owner-scoped persistent PowerShell tool backed by the Harness PTY service"
	},
	"@beellix-ai/tool-ralph": {
		"path": "packages/harness/workflow/builtin/tool-ralph",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "面向模型的 ralph 工具：面向一个不可变目标的固定前台全新 agent 循环，供选择或配置全新 agent 迭代的用户与维护者阅读。",
		"en": "Model-facing fresh-agent Ralph loop over the workflow and subagent seams"
	},
	"@beellix-ai/tool-session-query": {
		"path": "packages/harness/session-query/builtin/tool-session-query",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "面向 agent 开发者与维护者的工作区授权模型会话历史工具，用于选择、配置或排查既往会话搜索、追踪与事件读取。",
		"en": "Workspace-authorized model-facing session history search, trace, and event read tools"
	},
	"@beellix-ai/tool-skill": {
		"path": "packages/harness/skill/builtin/tool-skill",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "extensions",
		"management": "builtin",
		"contributes": ["tools", "skills"],
		"configuration": { "href": "/admin/plugin-settings/skill-filesystem" },
		"zh": "向模型提供技能目录浏览和技能内容加载工具。",
		"en": "Model-facing skill loading tool for the BEELLIX Harness"
	},
	"@beellix-ai/tool-str-replace-editor": {
		"path": "packages/harness/fs/builtin/tool-str-replace-editor",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "files",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "提供 Claude Code 风格的独立文本替换编辑工具。",
		"en": "Model-facing view, create, literal replace, and line insert tool over the Harness filesystem service"
	},
	"@beellix-ai/tool-subagent": {
		"path": "packages/harness/subagent/builtin/tool-subagent",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": { "href": "/admin/plugin-settings/subagent-model-selection" },
		"zh": "面向模型的 subagent 委派工具，供用户与维护者配置、组合或排查基于 subagent 提供方的委派。",
		"en": "Model-facing subagent delegation tool over the ctx.subagents seam"
	},
	"@beellix-ai/tool-subagent-control": {
		"path": "packages/harness/subagent/builtin/tool-subagent-control",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "全局 send_message、interrupt_agent 与 list_agents 工具，供用户与维护者组合或排查可继续子级的控制。",
		"en": "Globally named send_message, interrupt_agent, and list_agents tools over ctx.subagents continuations"
	},
	"@beellix-ai/tool-terminal": {
		"path": "packages/harness/terminal/builtin/tool-terminal",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "execution",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "向模型提供打开、读写、列出和关闭持久终端的六项工具。",
		"en": "Six model-facing persistent PTY tools with owner isolation and generic background-job integration"
	},
	"@beellix-ai/tool-todo": {
		"path": "packages/harness/todo/builtin/tool-todo",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "面向 DeepSeek Harness 会话日志的模型侧 todo_write 工具：整表替换、单一会话归属与 todos 投影，供选择、配置或排查该工具的用户与维护者阅读。",
		"en": "Model-facing todo_write tool over the BEELLIX Harness event-sourced session log"
	},
	"@beellix-ai/tool-web": {
		"path": "packages/harness/web/builtin/tool-web",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "web",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": { "href": "/admin/plugin-settings/web-search-routing" },
		"zh": "向模型提供 web_search 与 web_fetch 工具。",
		"en": "Model-facing web tools (web_search, web_fetch) over the BEELLIX Harness web capability seam (ctx.web)"
	},
	"@beellix-ai/tool-workflow": {
		"path": "packages/harness/workflow/builtin/tool-workflow",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "面向模型的 workflow 工具：运行扇出 subagent 的 JavaScript 编排脚本，供选择或配置模型驱动编排的用户与维护者阅读。",
		"en": "Model-facing workflow tool: run a JavaScript orchestration script over ctx.workflowEngine"
	},
	"@beellix-ai/tool-working-directory": {
		"path": "packages/harness/session/builtin/tool-working-directory",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["tools"],
		"configuration": null,
		"zh": "读取或切换当前会话的工作目录，保留执行授权。",
		"en": "读取或切换当前会话的工作目录，保留执行授权。"
	},
	"@beellix-ai/tools": {
		"path": "packages/harness/core/tools",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "core",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "注册模型工具，管理调用限制、执行流水线与结果呈现。",
		"en": "Tool registry and execution pipeline for the BEELLIX Harness"
	},
	"@beellix-ai/typert-generator": {
		"path": "packages/harness/typert/generator",
		"ownership": "foundation",
		"kind": "library",
		"group": "interfaces",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "构建时 Typert 生成器：源代码类型分析、与编译器无关的模型与产物生成，供接入 Typert 发布或消费生成产物的维护者阅读。",
		"en": "TypeScript project analyzer and model-driven Typert artifact generator"
	},
	"@beellix-ai/typert-loader": {
		"path": "packages/harness/typert/builtin/loader",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "interfaces",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "生成的 Typert 产物所用的 Loader 集成：已挂载的包如何自动把宿主侧反射与 schema 贡献给运行时注册表。",
		"en": "Loader integration for generated Typert package contributions"
	},
	"@beellix-ai/typert-protocol": {
		"path": "packages/harness/typert/protocol",
		"ownership": "foundation",
		"kind": "library",
		"group": "interfaces",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "共享的 Typert Remote 协议：业务包、生成产物、Host Gateway 与 Client API 使用的装饰器、wire 描述符、编解码器与提供方约定。",
		"en": "Compiler-independent Remote metadata and Typert provider protocols"
	},
	"@beellix-ai/typert-registry": {
		"path": "packages/harness/typert/builtin/registry",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "interfaces",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "运行时 Typert 注册表：保存生成的包反射、实时 Zod schema 与 Remote 调用描述符，并按需为消费方解析。",
		"en": "Runtime registry for generated package reflection and Zod schemas"
	},
	"@beellix-ai/ui-admin": {
		"path": "packages/ui/admin",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "ui",
		"management": "builtin",
		"contributes": ["ui"],
		"configuration": null,
		"zh": "账户、角色、模型、插件目录与运行配置等管理页面，写操作由服务端授权。",
		"en": "Account, role, model, plugin and runtime administration with server-authorized writes.",
		"displayZh": "管理后台",
		"displayEn": "Administration"
	},
	"@beellix-ai/ui-browser": {
		"path": "packages/ui/browser",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "ui",
		"management": "builtin",
		"contributes": ["ui"],
		"configuration": null,
		"zh": "右侧实时网页画面、地址栏与人工接管。",
		"en": "Live browser viewport, navigation and human takeover.",
		"displayZh": "浏览器面板",
		"displayEn": "Browser panel"
	},
	"@beellix-ai/ui-components": {
		"path": "packages/ui/components",
		"ownership": "foundation",
		"kind": "component-library",
		"group": "ui",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "按钮、输入框、菜单、图标与主题标记等可复用展示，不装配运行服务。",
		"en": "Reusable controls, icons and theme tokens without runtime services.",
		"displayZh": "公共组件",
		"displayEn": "Shared components"
	},
	"@beellix-ai/ui-conversation": {
		"path": "packages/ui/conversation",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "ui",
		"management": "builtin",
		"contributes": ["ui"],
		"configuration": null,
		"zh": "消息、输入区、当前会话选择、审批、任务及工具结果呈现。",
		"en": "Messages, composer, active-session controls, approvals, tasks and tool results.",
		"displayZh": "对话",
		"displayEn": "Conversation"
	},
	"@beellix-ai/ui-developer": {
		"path": "packages/ui/developer",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "ui",
		"management": "builtin",
		"contributes": ["ui"],
		"configuration": null,
		"zh": "Cordis 开发诊断及调试展示，不因目录存在开放生产修改权限。",
		"en": "Cordis development diagnostics without granting production modification access.",
		"displayZh": "开发调试",
		"displayEn": "Developer tools"
	},
	"@beellix-ai/ui-extension-results": {
		"path": "packages/ui/extension-results",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "ui",
		"management": "builtin",
		"contributes": ["ui"],
		"configuration": null,
		"zh": "扩展面板数据协议与安全结果展示；不启动或执行业务插件。",
		"en": "Extension panel data and validated result presentation, without business execution.",
		"displayZh": "扩展结果展示",
		"displayEn": "Extension results"
	},
	"@beellix-ai/ui-mailbox": {
		"path": "packages/ui/mailbox",
		"ownership": "business",
		"kind": "plugin",
		"group": "ui",
		"management": "extension",
		"contributes": ["ui"],
		"configuration": null,
		"zh": "工作台内部成员收发、附件、独立草稿及对话引用。",
		"en": "Internal correspondence, attachments, drafts and conversation references in the workbench.",
		"displayZh": "内部工作信箱",
		"displayEn": "Internal mailbox"
	},
	"@beellix-ai/ui-mobile": {
		"path": "packages/ui/mobile",
		"ownership": "foundation",
		"kind": "library",
		"group": "ui",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "移动会话、工作、文件与账户；平板分栏和手机独立聊天页面。",
		"en": "Shared mobile and tablet user interface.",
		"displayZh": "移动端界面",
		"displayEn": "Mobile UI"
	},
	"@beellix-ai/ui-platform": {
		"path": "packages/ui/platform",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "ui",
		"management": "builtin",
		"contributes": ["ui"],
		"configuration": null,
		"zh": "槽位渲染、会话绑定、设置同步、主题、语言及 Web 启动；不包含功能页面。",
		"en": "Slot rendering, session binding, settings synchronization, theme, locale and Web bootstrap.",
		"displayZh": "界面公共运行",
		"displayEn": "UI runtime"
	},
	"@beellix-ai/ui-records": {
		"path": "packages/ui/records",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "ui",
		"management": "builtin",
		"contributes": ["ui"],
		"configuration": null,
		"zh": "请求轨迹、运行记录与会话日志下载，数据来自既有持久记录。",
		"en": "Request trajectories, execution records and durable session-log downloads.",
		"displayZh": "运行记录",
		"displayEn": "Execution records"
	},
	"@beellix-ai/ui-resources": {
		"path": "packages/ui/resources",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "ui",
		"management": "builtin",
		"contributes": ["ui"],
		"configuration": null,
		"zh": "为已确认的管理后台提供知识库与数据连接界面，不挂载独立成员门户。",
		"en": "Knowledge and connection views for administration, without standalone member portals.",
		"displayZh": "后台资源管理",
		"displayEn": "Resource administration"
	},
	"@beellix-ai/ui-settings": {
		"path": "packages/ui/settings",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "ui",
		"management": "builtin",
		"contributes": ["ui"],
		"configuration": null,
		"zh": "偏好、新会话默认权限与预设管理；当前会话选择留在对话。",
		"en": "Preferences, default permissions and preset management.",
		"displayZh": "设置",
		"displayEn": "Settings"
	},
	"@beellix-ai/ui-shell": {
		"path": "packages/ui/shell",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "ui",
		"management": "builtin",
		"contributes": ["ui"],
		"configuration": null,
		"zh": "整体布局、主侧栏、导航入口与品牌内容，由功能通过槽位扩展。",
		"en": "Application layout, sidebar, navigation and branding extended through slots.",
		"displayZh": "应用框架",
		"displayEn": "Application shell"
	},
	"@beellix-ai/ui-workspace": {
		"path": "packages/ui/workspace",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "ui",
		"management": "builtin",
		"contributes": ["ui"],
		"configuration": null,
		"zh": "项目和会话导航、创建与归档，以及按宿主能力选择的目录交互。",
		"en": "Project and session navigation, creation, archiving and host-selected directory interaction.",
		"displayZh": "项目与会话管理",
		"displayEn": "Projects and sessions"
	},
	"@beellix-ai/user-approval": {
		"path": "packages/harness/interaction/builtin/user-approval",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "security",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "与通道无关的一次性审批 seam；供组合应答者、设置策略或排查以拒绝方式关闭的权限决定的用户与维护者阅读。",
		"en": "User-approval seam (ctx.approval) for the BEELLIX Harness: one-shot permission decisions dispatched to composed answerers over the approval/request waterfall, fail-closed by default"
	},
	"@beellix-ai/user-questions": {
		"path": "packages/harness/interaction/builtin/user-questions",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "security",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "基于 waterfall 的问答服务，用于工具、权限插件、本地 answerer 与 Agent-scoped Web 交互。",
		"en": "Abstract user-questions seam (ctx.userQuestions) for asking the human during agent runs"
	},
	"@beellix-ai/util-code-language": {
		"path": "packages/shared/common/code-language",
		"ownership": "foundation",
		"kind": "library",
		"group": "engineering",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "统一文件扩展名与语法高亮语言映射。",
		"en": "统一文件扩展名与语法高亮语言映射。"
	},
	"@beellix-ai/util-crypto": {
		"path": "packages/shared/common/crypto",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "面向替换仅安全上下文可用的 crypto.randomUUID 调用的维护者，说明跨运行时 UUID 生成。",
		"en": "Zero-dependency browser-safe UUID and byte-encoding helpers"
	},
	"@beellix-ai/util-time": {
		"path": "packages/shared/common/time",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "面向在协议边界接收调用方所报时区的维护者，说明 IANA 时区校验与规范化。",
		"en": "Zero-dependency time vocabulary shared by wire boundaries: canonicalClientTimeZone (IANA zone validation and canonicalization only, no formatting)"
	},
	"@beellix-ai/util-values": {
		"path": "packages/shared/common/values",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "供运行时包使用的无损 JSON 校验、分离式快照、深度冻结、结构相等与穷尽联合类型辅助函数。",
		"en": "Duplicate-install-safe value primitives for the BEELLIX Harness"
	},
	"@beellix-ai/util-workspace-path": {
		"path": "packages/harness/workspace/paths",
		"ownership": "foundation",
		"kind": "library",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "浏览器安全的 Workspace 路径辅助函数：拼接相对路径、缩写 POSIX 主目录并生成显示标题。",
		"en": "Browser-safe Workspace path and display helpers"
	},
	"@beellix-ai/web": {
		"path": "packages/harness/web/builtin/web",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "web",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": { "href": "/admin/plugin-settings/web-search-routing" },
		"zh": "统一网页搜索与 URL 抓取，选择对应提供方。",
		"en": "Abstract web access capability seam (ctx.web) for the BEELLIX Harness — search/fetch provider registry, registration-order-independent selection, request/result vocabulary, and the WebError taxonomy"
	},
	"@beellix-ai/web-app": {
		"path": "apps/harness/web-bundle",
		"ownership": "foundation",
		"kind": "bundle",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "dsh 的浏览器 GUI：交互式聊天、模型与设置管理、会话历史，供用户运行 dsh web 表层。",
		"en": "The dsh browser-surface bundle: the web patch layer over dsh-base plus the runtime glue plugin (frontend dist serving, web-surface prompt, bash runtime variables, URL line)"
	},
	"@beellix-ai/web-fetch-http": {
		"path": "packages/harness/web/builtin/web-fetch-http",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "web",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "ctx.web 的匿名公共 HTTP(S) 抓取后端：部署方如何挂载有界、安全的 URL 抓取，含同源重定向与仅文本解码。",
		"en": "Anonymous public HTTP(S) fetch provider for the BEELLIX Harness web capability seam (ctx.web)"
	},
	"@beellix-ai/web-frontend": {
		"path": "apps/web",
		"ownership": "foundation",
		"kind": "application",
		"group": "platform",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "Web 产品入口，构建登录页并装配会话与管理员界面。",
		"en": "Web application entry, login page, conversation and administration assembly."
	},
	"@beellix-ai/web-search-deepseek": {
		"path": "packages/harness/web/extensions/web-search-deepseek",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "web",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": { "href": "/admin/plugin-settings/web-search-deepseek" },
		"zh": "ctx.web 的 DeepSeek 搜索提供方：部署方如何通过 Anthropic 兼容 Messages API 挂载 DeepSeek 原生 web 搜索，并逐次解析凭据。",
		"en": "DeepSeek-backed search provider (native web_search via the Anthropic-compatible API) for the BEELLIX Harness web capability seam (ctx.web)"
	},
	"@beellix-ai/web-search-exa": {
		"path": "packages/harness/web/extensions/web-search-exa",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "web",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": { "href": "/admin/plugin-settings/web-search-routing" },
		"zh": "ctx.web 的 Exa 搜索提供方：部署方如何挂载厂商原生 web 搜索，获得可移植 snippet 与发布日期。",
		"en": "Exa-backed search provider for the BEELLIX Harness web capability seam (ctx.web)"
	},
	"@beellix-ai/web-search-perplexity": {
		"path": "packages/harness/web/extensions/web-search-perplexity",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "web",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": { "href": "/admin/plugin-settings/web-search-routing" },
		"zh": "ctx.web 的 Perplexity 搜索提供方：部署方如何挂载 OpenAI 兼容的 Perplexity 搜索，获得生成答案与引用。",
		"en": "Perplexity-backed search provider for the BEELLIX Harness web capability seam (ctx.web)"
	},
	"@beellix-ai/webhook": {
		"path": "packages/harness/webhook/builtin/webhook",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "web",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向注册可信外部事件策略并创建 Workspace Session 的维护者，说明 webhook 规则运行时。",
		"en": "Fire-and-forget webhook rule runtime that creates Workspace-backed BEELLIX Harness Sessions"
	},
	"@beellix-ai/webhook-github": {
		"path": "packages/harness/webhook/extensions/webhook-github",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "web",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "面向把已认证 JSON 事件路由到 webhook 运行时的部署，说明带签名的 GitHub webhook 适配器。",
		"en": "Signed GitHub HTTP webhook adapter for the BEELLIX Harness webhook runtime"
	},
	"@beellix-ai/win32-process": {
		"path": "packages/harness/subprocess/win32-process",
		"ownership": "foundation",
		"kind": "library",
		"group": "execution",
		"management": "technical",
		"contributes": [],
		"configuration": null,
		"zh": "面向实现或排查 Windows ACL 沙箱的维护者，说明底层 Win32 进程原语。",
		"en": "Low-level Win32 process, stdio, and Job Object primitives for the BEELLIX Harness Windows sandbox"
	},
	"@beellix-ai/workflow": {
		"path": "packages/harness/workflow/builtin/workflow",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "工作流编排能力：运行由模型编写的、扇出 subagent 的脚本，供选择或构建在 ctx.workflowEngine 之上的用户与维护者阅读。",
		"en": "Workflow capability seam: ctx.workflowEngine service, run vocabulary, and workflow/* events"
	},
	"@beellix-ai/workflow-worker-thread": {
		"path": "packages/harness/workflow/builtin/workflow-worker-thread",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "orchestration",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "worker-thread 工作流引擎：在宿主事件循环之外执行由模型编写的编排脚本，供选择或配置执行隔离的用户与维护者阅读。",
		"en": "worker-thread workflow engine: executes model-written orchestration scripts off the host event loop, bridging agent() calls back to ctx.subagents"
	},
	"@beellix-ai/working-directory": {
		"path": "packages/harness/session/builtin/working-directory",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "sessions",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "维护会话当前目录、有效性和持久化恢复。",
		"en": "维护会话当前目录、有效性和持久化恢复。"
	},
	"@beellix-ai/workspace": {
		"path": "packages/harness/workspace/builtin/workspace",
		"ownership": "foundation",
		"kind": "plugin",
		"group": "files",
		"management": "builtin",
		"contributes": ["services"],
		"configuration": null,
		"zh": "持久保存工作区记录，校验会话所属工作区。",
		"en": "Workspace entity registry (ctx.workspaceRegistry): durable workspace records with validated session attachment over the domain data form for the BEELLIX Harness"
	}
};
//#endregion
//#region dev/shared/console/packages/ui/admin/src/pages/client/capability-catalog.ts
/** 本版工作区的能力说明；不是安装登记或运行状态。README 维护详细约束。 */
const audits = new Map(capabilityAuditGroups.flatMap((group) => group.names.map((name) => [`@beellix-ai/${name}`, group])));
/** 只读能力目录；不推导是否启用或可卸载。 */
const capabilityCatalog = Object.entries(definitions).map(([name, data]) => {
	const audit = audits.get(name);
	return {
		name,
		...data,
		category: audit.category,
		topic: audit.id,
		auditReason: audit.reason
	};
});
/** 管理页面消费的中文能力词典。 */
const capabilityZh = Object.fromEntries(capabilityCatalog.map((item) => [`capability.${item.name}`, item.zh]));
/** 管理页面消费的英文能力词典。 */
const capabilityEn = Object.fromEntries(capabilityCatalog.map((item) => [`capability.${item.name}`, item.en]));
/** 卡片名称属于展示词典；包标识及运行管理身份保持原值。 */
const capabilityTitleZh = Object.fromEntries(capabilityCatalog.map((item) => [`capabilityTitle.${item.name}`, item.displayZh ?? item.name.replace(/^@beellix-ai\//, "")]));
/** 英文卡片名称使用同一包标识索引。 */
const capabilityTitleEn = Object.fromEntries(capabilityCatalog.map((item) => [`capabilityTitle.${item.name}`, item.displayEn ?? item.name.replace(/^@beellix-ai\//, "")]));
//#endregion
//#region dev/shared/console/packages/ui/admin/src/pages/client/inventory-locales.ts
/** 只读能力目录与运行清单的中英文界面文字。 */
const topicEn = Object.fromEntries(capabilityAuditGroups.map((group) => [`inventory.topic.${group.id}`, group.en]));
const topicZh = Object.fromEntries(capabilityAuditGroups.map((group) => [`inventory.topic.${group.id}`, group.zh]));
const inventoryEn = {
	"inventory.manage.agent-instructions": "Project instructions",
	"inventory.manage.command-compact": "Compact conversation",
	"inventory.manage.command-feedback": "Send feedback",
	"inventory.manage.command-goal": "Goal command",
	"inventory.manage.persona": "Agent persona",
	"inventory.manage.session-reference": "Conversation references",
	"inventory.manage.session-telemetry-otel": "Session telemetry",
	"inventory.manage.time-context": "Time context",
	"inventory.manage.tool-ask-user": "Ask user",
	"inventory.manage.tool-bash": "Bash commands",
	"inventory.manage.tool-fs": "File operations",
	"inventory.manage.tool-fs-search": "File search",
	"inventory.manage.tool-goal": "Task goals",
	"inventory.manage.tool-jobs": "Background tasks",
	"inventory.manage.tool-lsp": "Code navigation",
	"inventory.manage.tool-pwsh": "PowerShell commands",
	"inventory.manage.tool-ralph": "Goal iterations",
	"inventory.manage.tool-session-query": "Conversation search",
	"inventory.manage.tool-skill": "Skill loading",
	"inventory.manage.tool-str-replace-editor": "Text replacement",
	"inventory.manage.tool-subagent": "Subtasks",
	"inventory.manage.tool-subagent-control": "Subtask coordination",
	"inventory.manage.tool-terminal": "Persistent terminal",
	"inventory.manage.tool-todo": "Task plan",
	"inventory.manage.tool-web": "Search and web pages",
	"inventory.manage.tool-workflow": "Task orchestration",
	"inventory.assetsName": "Package name",
	"inventory.skillsAudit": "Skill instructions viewed",
	"inventory.assetsNote": "Libraries, SDKs and build support used by the foundation. These are maintained with the platform release and do not have independent plugin switches.",
	"inventory.assetsSearch": "Search technical components",
	"inventory.assetsVersion": "Package version",
	"inventory.assetsPurpose": "Function",
	"inventory.assetsVersionNote": "Versions come from package.json in this build; they are not runtime status or necessarily the upstream release number.",
	"inventory.unregisteredModules": "Unidentified runtime modules",
	"inventory.unregisteredHelp": "These modules appear in runtime observations but have no matching package identity. Their type, version and purpose are unverified; maintainers must register or investigate them.",
	"inventory.kindHelp.library": "Reusable code called by other packages.",
	"inventory.kindHelp.sdk": "Public development interfaces and client helpers.",
	"inventory.kindHelp.component-library": "Shared UI components and styles.",
	"inventory.kindHelp.bundle": "A composition of packages and default configuration.",
	"inventory.kindHelp.application": "An application startup and assembly entry.",
	"inventory.kindHelp.native": "A native runtime or platform binding.",
	"inventory.kindHelp.example": "Developer example, not a deployed feature.",
	"inventory.skillsDiagnostic": "Session skill diagnostics",
	"inventory.skillsBack": "Back to skill directory",
	"inventory.skillsSearch": "Search skills",
	"inventory.skillsSource": "Skill source",
	"inventory.skillsSource.platform": "Platform skills",
	"inventory.skillsSource.tool": "Tool skills",
	"inventory.skillEnvironment": "Available environment",
	"inventory.skillCloud": "Cloud",
	"inventory.skillClient": "Client",
	"inventory.skillsSource.plugin": "Plugin skills",
	"inventory.skillsSource.workspace": "Workspace skills",
	"inventory.skillsApplies": "Available in",
	"inventory.skillsIncomplete": "Some sources could not be read. Showing the available results.",
	"inventory.skillsCatalogScope": "Platform, active plugin and registered workspace skills.",
	"inventory.skillsCatalogEmpty": "No skills discovered in the configured sources.",
	"inventory.skillsNoMatch": "No matching skills.",
	"inventory.skillsCount": "{count} skills",
	"inventory.skillsRead": "Read instructions",
	"inventory.skillsOnlyModel": "Model only",
	"inventory.skillsNeither": "Discovery only",
	"inventory.skills": "Skills",
	"inventory.skillsScope": "Skills available to the selected session. This view uses its existing workspace and discovery rules; it does not list every employee’s local files.",
	"inventory.skillsSession": "Session scope",
	"inventory.skillsChoose": "Select a session to view its available skills.",
	"inventory.skillsEmpty": "No matching skills in this session.",
	"inventory.skillsSourceUnknown": "No file source supplied",
	"inventory.skillsInvocation": "Invocation",
	"inventory.skillsModel": "User and model",
	"inventory.skillsUser": "User",
	"inventory.technicalAssets": "Foundation components",
	"inventory.businessEmpty": "No business extensions are connected.",
	"inventory.kind.sdk": "SDK",
	"inventory.kind.component-library": "Component library",
	"inventory.uiManagement.system": "Platform managed",
	"inventory.uiManagement.switch": "Independently switchable",
	"inventory.uiManagement.deployment": "Deployment configuration required",
	"inventory.uiManagement.unintegrated": "Not integrated",
	"inventory.uiManagement.unknown": "Unclassified",
	"inventory.uiManagement.unavailable": "Control unavailable",
	"inventory.status": "Status",
	"inventory.status.loaded": "Loaded",
	"inventory.status.unloaded": "Not loaded",
	"inventory.status.failed": "Error",
	"inventory.status.processing": "Processing",
	"inventory.status.unknown": "Unknown",
	"inventory.configure": "Configure",
	"inventory.detailAction": "Details",
	"inventory.actions": "Plugin actions",
	"inventory.guide": "Usage notes",
	...topicEn,
	"inventory.setup.title": "Configuration and activation",
	"inventory.setup.system": "This component is managed by platform composition or an agent preset, without an independent switch. A missing independent entry does not establish that the capability is unused. Deployment changes require its package configuration and dependencies to be checked.",
	"inventory.setup.deployment": "No independent configuration entry was returned. A maintainer must compose this module and its dependencies in the deployment or agent preset, then verify loading before it can be switched here.",
	"inventory.setup.unintegrated": "This capability is retained as an integration asset and is not part of the production Web composition. Platform integration and acceptance are required; a switch cannot enable it.",
	"inventory.setup.unknown": "This runtime module is not in the verified catalog. Verify its package, maintainer and configuration before offering setup or switching.",
	"inventory.setup.unavailable": "Control information could not be confirmed. Refresh and inspect the page error; this is not evidence that the plugin is disabled.",
	"inventory.setup.switch": "The switch persistently allows or blocks this plugin across its configured entries. Turning it on restores deployment conditions; it does not create configuration, install dependencies or supply credentials. Switch only when tasks are idle, then refresh to inspect loading.",
	"inventory.setup.deploymentDisabled": "Some deployment entries are disabled. Turning the switch on does not override them; a maintainer must first check their platform conditions and configuration.",
	"inventory.setup.existingEditor": "The link opens the existing settings editor. Save there, return to this page and refresh to inspect loading. If the relevant editor is absent, the deployment must first provide its settings service. Parameter saving and plugin activation are separate operations.",
	"inventory.setup.acp": "ACP is a protocol endpoint for programmatic clients, not a prerequisite for using Web. Enabling this separate entry requires an explicit deployment and model configuration; it is not a Web plugin switch.",
	"inventory.setup.presentation": "Tool presentation belongs to the agent preset. A maintainer selects native, ptc or both in that preset; ptc and both additionally require a code runtime. No independent global switch is offered.",
	"inventory.version": "Package version",
	"inventory.versionNote": "Versions come from package.json in this source build, not verified running artifacts.",
	"inventory.master": "Master switch",
	"inventory.master.on": "On",
	"inventory.masterMeaning": "The master switch permits loading; deployment and preset conditions still apply.",
	"inventory.browser": "Current browser",
	"inventory.providedBy": "Provided by {provider}",
	"inventory.unknownProvider": "an unidentified module",
	"inventory.serviceRegistered": "Registered service {service}, provider: {provider}; this is not an execution check.",
	"inventory.notLoaded.master": "Master switch is off",
	"inventory.notLoaded.disabled": "Disabled by deployment or platform conditions",
	"inventory.notLoaded.preset": "Configured in a preset; no active instance observed",
	"inventory.notLoaded.service": "Service definition; no registered provider observed",
	"inventory.notLoaded.deployment": "Not selected by this deployment",
	"inventory.master.off": "Off",
	"inventory.master.unknown": "Unconfirmed",
	"inventory.master.locked": "Locked",
	"inventory.assembly": "Composition",
	"inventory.assembly.unconfigured": "Not configured",
	"inventory.assembly.configured": "Configured",
	"inventory.assembly.conditional": "Conditional composition",
	"inventory.assembly.unknown": "Incomplete information",
	"inventory.configuration": "Entry configuration",
	"inventory.configuration.enabled": "Configuration enabled",
	"inventory.configuration.disabled": "Configuration disabled",
	"inventory.configuration.conditional": "Condition unresolved",
	"inventory.configurationCount.enabled": "Configuration enabled {count}",
	"inventory.configurationCount.disabled": "Configuration disabled {count}",
	"inventory.configurationCount.conditional": "Condition unresolved {count}",
	"inventory.instances": "Instance observations",
	"inventory.instance.active": "Active",
	"inventory.instance.inactive": "No instance observed",
	"inventory.instance.failed": "Failed",
	"inventory.instance.transitional": "Transitioning",
	"inventory.instance.unknown": "Incomplete information",
	"inventory.instanceCount.active": "Active {count}",
	"inventory.instanceCount.failed": "Failed {count}",
	"inventory.instanceCount.transitional": "Transitioning {count}",
	"inventory.partialObservation": "Incomplete inventory",
	"inventory.observationNote": "Counts cover the current service, browser and presets; they are not task counts.",
	"inventory.extensionNote": "Connected business plugins only. Check each plugin for its runtime status.",
	"inventory.topic": "Responsibility group",
	"inventory.unconfiguredNote": "No standalone configuration found; another plugin may use this module.",
	"inventory.control.label": "Enable {name}",
	"inventory.control.hint": "Master switch for this plugin. Enabling still requires valid deployment configuration.",
	"inventory.control.locked": "This component requires a platform configuration change; independent switching is unavailable.",
	"inventory.control.forbidden": "Plugin management permission is required.",
	"inventory.control.unavailable": "Refresh to obtain the current plugin state before changing it.",
	"inventory.control.busy": "A task is running or a plugin change is in progress. Retry when it finishes.",
	"inventory.control.conflict": "Plugin settings changed elsewhere. The latest state has been loaded; review it before retrying.",
	"inventory.control.failed": "The plugin change failed. Refresh and inspect its current state.",
	"inventory.builtinNote": "Maintained with the platform. Expand a plugin to inspect its source and runtime entries.",
	"inventory.presetNote": "Preset composition is configuration, not a list of running session instances.",
	"inventory.noGlobal": "No global instance returned.",
	"inventory.incompletePresets": "Some presets failed to load; preset membership is incomplete.",
	"inventory.category.kernel": "System kernel",
	"inventory.category.services": "Foundation services",
	"inventory.category.features": "Agent capabilities",
	"inventory.category.data": "Data & sessions",
	"inventory.category.security": "Security & permissions",
	"inventory.category.ui": "UI & interaction",
	"inventory.category.unknown": "Needs classification",
	"inventory.scope": "Runtime scope",
	"inventory.global": "Global plugins",
	"inventory.presetPrefix": "Session preset: ",
	"inventory.presetMissing": "The selected preset is not in the current service inventory.",
	"inventory.presetFailed": "Preset composition failed to load. Check the service build, package resolution and preset configuration.",
	"inventory.noEntry": "No explicit entry ID",
	"inventory.runtime": "Runtime inventory",
	"inventory.catalog": "All capabilities",
	"inventory.search": "Search package or capability",
	"inventory.group": "Capability category",
	"inventory.kind": "Package type",
	"inventory.all": "All",
	"inventory.count": "{shown} / {total} entries",
	"inventory.purpose": "Capability",
	"inventory.details": "Package details",
	"inventory.source": "Source directory",
	"inventory.entry": "Runtime entry ID",
	"inventory.module": "Runtime module",
	"inventory.readOnly": "Read only; this page does not enable, disable or uninstall plugins.",
	"inventory.catalogNote": "This build's workspace catalog, not an installed, mounted or callable inventory.",
	"inventory.runtimeNote": "Status comes from the running service; active does not mean available to the current session.",
	"inventory.unknownNote": "These modules await classification and cannot be installed or switched here.",
	"inventory.unknown": "Needs classification",
	"inventory.unknownPurpose": "This module is not in the audited catalog. Its responsibility and source need review.",
	"inventory.disabled": "Configuration disabled",
	"inventory.failed": "Load failed",
	"inventory.active": "Active",
	"inventory.pending": "Waiting for dependencies",
	"inventory.loading": "Loading",
	"inventory.unloading": "Unloading",
	"inventory.unmounted": "Not mounted",
	"inventory.conditional": "Condition not evaluated",
	"inventory.reason.disabled": "The entry or an ancestor group is disabled. The service does not provide the specific reason.",
	"inventory.reason.failed": "Plugin loading failed. Check service diagnostics and package resolution; failure is not disabled status.",
	"inventory.reason.pending": "The plugin is waiting for required services or dependencies and is not yet active.",
	"inventory.reason.loading": "The Loader is loading this plugin. Refresh to read its latest status.",
	"inventory.reason.unloading": "The Loader is disposing this plugin. Refresh to read its latest status.",
	"inventory.reason.unmounted": "The configuration includes this entry, but no mounted instance was returned.",
	"inventory.reason.active": "The plugin instance is active. Tool access still depends on session composition, configuration and permissions.",
	"inventory.reason.conditional": "The preset is not mounted; its condition must be evaluated in an actual session context.",
	"inventory.empty": "No matching packages.",
	"inventory.group.core": "Agent core & presets",
	"inventory.group.models": "Models & requests",
	"inventory.group.execution": "Commands, terminals & code execution",
	"inventory.group.files": "Files, workspaces & code navigation",
	"inventory.group.web": "Search, web & external events",
	"inventory.group.orchestration": "Subagents, workflows & tasks",
	"inventory.group.context": "Context, attachments & compaction",
	"inventory.group.sessions": "Sessions, history & storage",
	"inventory.group.security": "Permissions, security & governance",
	"inventory.group.extensions": "Skills, MCP & extensions",
	"inventory.group.interfaces": "APIs, SDKs & host connections",
	"inventory.group.ui": "UI & interaction",
	"inventory.group.platform": "Platform, boot & libraries",
	"inventory.group.engineering": "Tests, experiments & examples",
	"inventory.group.unknown": "Uncataloged modules",
	"inventory.kind.plugin": "Plugin",
	"inventory.kind.library": "Library",
	"inventory.kind.bundle": "Assembly bundle",
	"inventory.kind.application": "Application entry",
	"inventory.kind.native": "Native carrier",
	"inventory.kind.example": "Package example"
};
const inventoryZh = {
	"inventory.manage.agent-instructions": "项目规则",
	"inventory.manage.command-compact": "对话整理指令",
	"inventory.manage.command-feedback": "反馈指令",
	"inventory.manage.command-goal": "目标指令",
	"inventory.manage.persona": "智能体设定",
	"inventory.manage.session-reference": "跨对话引用",
	"inventory.manage.session-telemetry-otel": "运行遥测",
	"inventory.manage.time-context": "时间信息",
	"inventory.manage.tool-ask-user": "用户问询",
	"inventory.manage.tool-bash": "Bash 命令",
	"inventory.manage.tool-fs": "文件操作",
	"inventory.manage.tool-fs-search": "文件搜索",
	"inventory.manage.tool-goal": "任务目标",
	"inventory.manage.tool-jobs": "后台任务",
	"inventory.manage.tool-lsp": "代码导航",
	"inventory.manage.tool-pwsh": "PowerShell 命令",
	"inventory.manage.tool-ralph": "目标迭代",
	"inventory.manage.tool-session-query": "对话记录查询",
	"inventory.manage.tool-skill": "技能调用",
	"inventory.manage.tool-str-replace-editor": "文本替换",
	"inventory.manage.tool-subagent": "子任务执行",
	"inventory.manage.tool-subagent-control": "子任务协作",
	"inventory.manage.tool-terminal": "终端会话",
	"inventory.manage.tool-todo": "任务计划",
	"inventory.manage.tool-web": "联网搜索与网页读取",
	"inventory.manage.tool-workflow": "任务编排",
	"inventory.assetsName": "包名称",
	"inventory.skillsAudit": "查看技能正文",
	"inventory.assetsNote": "基座依赖的代码库、开发接口和构建支撑，随基座版本维护，不提供独立的插件开关。",
	"inventory.assetsSearch": "搜索技术组件",
	"inventory.assetsVersion": "包版本",
	"inventory.assetsPurpose": "功能说明",
	"inventory.assetsVersionNote": "版本取自当前构建的 package.json，不代表运行状态，也不一定等于上游发布版本。",
	"inventory.unregisteredModules": "待识别运行模块",
	"inventory.unregisteredHelp": "运行时发现了这些模块，但未匹配到包身份登记。类型、版本和用途尚未确认，需要开发维护人员补充登记或排查。",
	"inventory.kindHelp.library": "供其他包调用的可复用代码。",
	"inventory.kindHelp.sdk": "供开发者接入的公开接口和调用封装。",
	"inventory.kindHelp.component-library": "多个页面共用的界面组件与样式。",
	"inventory.kindHelp.bundle": "组合多个包及其默认配置。",
	"inventory.kindHelp.application": "应用启动和能力装配入口。",
	"inventory.kindHelp.native": "本机运行组件或平台接口。",
	"inventory.kindHelp.example": "开发示例，不代表已部署功能。",
	"inventory.skillsDiagnostic": "会话技能诊断",
	"inventory.skillsBack": "返回技能目录",
	"inventory.skillsSearch": "搜索技能",
	"inventory.skillsSource": "技能来源",
	"inventory.skillsSource.platform": "平台技能",
	"inventory.skillsSource.tool": "工具技能",
	"inventory.skillEnvironment": "可用环境",
	"inventory.skillCloud": "云端",
	"inventory.skillClient": "客户端",
	"inventory.skillsSource.plugin": "插件技能",
	"inventory.skillsSource.workspace": "工作区技能",
	"inventory.skillsApplies": "适用范围",
	"inventory.skillsIncomplete": "部分来源暂时无法读取，当前展示已读取的技能。",
	"inventory.skillsCatalogScope": "汇总平台、已启用插件和已登记工作区的技能。",
	"inventory.skillsCatalogEmpty": "当前已配置来源中尚未发现技能。",
	"inventory.skillsNoMatch": "没有符合筛选条件的技能。",
	"inventory.skillsCount": "共 {count} 个技能",
	"inventory.skillsRead": "查看技能正文",
	"inventory.skillsOnlyModel": "仅模型",
	"inventory.skillsNeither": "仅目录展示",
	"inventory.skills": "技能目录",
	"inventory.skillsScope": "查看所选会话可用的技能，沿用其工作区与发现规则，不代表企业全部本地技能。",
	"inventory.skillsSession": "会话范围",
	"inventory.skillsChoose": "请选择会话查看可用技能",
	"inventory.skillsEmpty": "此会话未发现可用技能",
	"inventory.skillsSourceUnknown": "未提供文件来源",
	"inventory.skillsInvocation": "调用方式",
	"inventory.skillsModel": "用户与模型",
	"inventory.skillsUser": "用户",
	"inventory.technicalAssets": "基座技术组件",
	"inventory.businessEmpty": "尚未接入业务扩展插件",
	"inventory.kind.sdk": "SDK",
	"inventory.kind.component-library": "组件库",
	"inventory.uiManagement.system": "平台管理",
	"inventory.uiManagement.switch": "可独立启停",
	"inventory.uiManagement.deployment": "需部署配置",
	"inventory.uiManagement.unintegrated": "尚未接入",
	"inventory.uiManagement.unknown": "待归类",
	"inventory.uiManagement.unavailable": "管理信息不可用",
	"inventory.status": "状态",
	"inventory.status.loaded": "已加载",
	"inventory.status.unloaded": "未加载",
	"inventory.status.failed": "异常",
	"inventory.status.processing": "处理中",
	"inventory.status.unknown": "状态未知",
	"inventory.configure": "配置",
	"inventory.detailAction": "详情",
	"inventory.actions": "插件操作",
	"inventory.guide": "使用说明",
	...topicZh,
	"inventory.setup.title": "配置与启用",
	"inventory.setup.system": "该组件由平台装配或智能体预设管理，不提供独立开关。没有独立条目不等于功能未被使用；调整部署前需核对该包的配置和依赖。",
	"inventory.setup.deployment": "当前清单没有独立配置条目。维护者需在部署或智能体预设中配置该模块及依赖，验证加载后才能在这里启停。",
	"inventory.setup.unintegrated": "该能力保留为集成资产，尚未接入正式 Web 装配。需完成平台接入和验收，不能通过开关启用。",
	"inventory.setup.unknown": "该运行模块未纳入已核定目录。需先核对插件包、维护归属及配置方式，暂不开放配置或启停。",
	"inventory.setup.unavailable": "尚未取得可靠的管理信息。请刷新并查看页面错误提示；这不表示插件已关闭。",
	"inventory.setup.switch": "开关持久控制该插件的全部已配置条目。开启只恢复原部署条件，不会创建配置、安装依赖或补充凭据。请在任务空闲时切换，成功后刷新核对加载结果。",
	"inventory.setup.deploymentDisabled": "部分部署条目本身处于关闭状态，总开关开启不会覆盖它们。需由维护者先核对平台条件与原配置。",
	"inventory.setup.existingEditor": "链接打开已有设置编辑器。保存后返回本页并刷新，核对加载结果；若设置页没有对应项目，需先由部署提供该设置服务。保存参数与启用插件是两个操作。",
	"inventory.setup.acp": "ACP 面向程序化客户端，不是使用 Web 的前提。需要该协议入口时，由维护者明确部署入口与模型配置，不在这里作为普通 Web 插件开启。",
	"inventory.setup.presentation": "工具呈现方式由智能体预设管理。维护者在预设中选择 native、ptc 或 both；ptc 和 both 还需代码运行时，不提供独立全局开关。",
	"inventory.version": "包版本",
	"inventory.versionNote": "版本来自本版源码的 package.json，不代表已核验的运行制品版本。",
	"inventory.master": "总开关",
	"inventory.master.on": "开启",
	"inventory.masterMeaning": "总开关只允许加载，仍须满足部署和预设条件。",
	"inventory.browser": "当前浏览器",
	"inventory.providedBy": "由 {provider} 提供",
	"inventory.unknownProvider": "未识别模块",
	"inventory.serviceRegistered": "已注册服务 {service}，提供方：{provider}；这不是功能执行验收。",
	"inventory.notLoaded.master": "总开关已关闭",
	"inventory.notLoaded.disabled": "部署或平台条件已关闭",
	"inventory.notLoaded.preset": "预设内配置，尚未观察到激活实例",
	"inventory.notLoaded.service": "服务定义，尚未观察到注册提供方",
	"inventory.notLoaded.deployment": "本部署未选用",
	"inventory.master.off": "关闭",
	"inventory.master.unknown": "待确认",
	"inventory.master.locked": "锁定",
	"inventory.assembly": "装配情况",
	"inventory.assembly.unconfigured": "未配置",
	"inventory.assembly.configured": "已配置",
	"inventory.assembly.conditional": "按条件装配",
	"inventory.assembly.unknown": "信息不完整",
	"inventory.configuration": "条目配置",
	"inventory.configuration.enabled": "配置启用",
	"inventory.configuration.disabled": "配置关闭",
	"inventory.configuration.conditional": "条件未定",
	"inventory.configurationCount.enabled": "配置启用 {count}",
	"inventory.configurationCount.disabled": "配置关闭 {count}",
	"inventory.configurationCount.conditional": "条件未定 {count}",
	"inventory.instances": "实例状态",
	"inventory.instance.active": "已激活",
	"inventory.instance.inactive": "未观察到实例",
	"inventory.instance.failed": "异常",
	"inventory.instance.transitional": "处理中",
	"inventory.instance.unknown": "信息不完整",
	"inventory.instanceCount.active": "已激活 {count}",
	"inventory.instanceCount.failed": "异常 {count}",
	"inventory.instanceCount.transitional": "处理中 {count}",
	"inventory.partialObservation": "信息不完整",
	"inventory.observationNote": "数量来自当前服务、浏览器和预设，不代表运行任务数。",
	"inventory.extensionNote": "仅列出已接入的业务插件，运行状态见各插件。",
	"inventory.topic": "职责分组",
	"inventory.unconfiguredNote": "暂无独立配置，可能由其他插件使用。",
	"inventory.control.label": "启用 {name}",
	"inventory.control.hint": "控制该插件的总开关；启用仍需满足部署配置条件。",
	"inventory.control.locked": "该组件需随平台配置调整，暂不支持单独切换。",
	"inventory.control.forbidden": "需要插件管理权限。",
	"inventory.control.unavailable": "请先刷新并取得当前插件状态，再修改开关。",
	"inventory.control.busy": "有任务正在运行或正在切换插件，请完成后重试。",
	"inventory.control.conflict": "插件设置已被其他操作修改，已读取最新状态，请核对后重试。",
	"inventory.control.failed": "插件切换失败，请刷新并核对当前状态。",
	"inventory.builtinNote": "由平台统一维护。展开查看源码目录与运行条目。",
	"inventory.presetNote": "会话预设显示配置组合，不代表实际会话实例正在运行。",
	"inventory.noGlobal": "未返回全局实例。",
	"inventory.incompletePresets": "部分预设加载失败，预设归属信息不完整。",
	"inventory.category.kernel": "系统内核",
	"inventory.category.services": "基础服务",
	"inventory.category.features": "智能体功能",
	"inventory.category.data": "数据与会话",
	"inventory.category.security": "安全与权限",
	"inventory.category.ui": "界面交互",
	"inventory.category.unknown": "待归类",
	"inventory.scope": "运行作用域",
	"inventory.global": "全局插件",
	"inventory.presetPrefix": "会话预设：",
	"inventory.presetMissing": "所选预设不在当前服务清单中。",
	"inventory.presetFailed": "预设组合加载失败，请核对服务构建、包解析和预设配置。",
	"inventory.noEntry": "未声明条目标识",
	"inventory.runtime": "运行清单",
	"inventory.catalog": "全部能力目录",
	"inventory.search": "搜索包名或能力",
	"inventory.group": "能力分类",
	"inventory.kind": "包类型",
	"inventory.all": "全部",
	"inventory.count": "{shown} / {total} 项",
	"inventory.purpose": "能力说明",
	"inventory.details": "包详情",
	"inventory.source": "源码目录",
	"inventory.entry": "运行条目标识",
	"inventory.module": "运行模块",
	"inventory.readOnly": "只读查看；本页不启停或卸载插件。",
	"inventory.catalogNote": "本版工作区目录，不代表全部已安装、已挂载或可调用。",
	"inventory.runtimeNote": "状态来自当前运行服务；运行中不等于工具已向当前会话开放。",
	"inventory.unknownNote": "这些模块尚待归类，暂不支持安装或启停。",
	"inventory.unknown": "待归类",
	"inventory.unknownPurpose": "本版审计目录未收录此模块，来源与职责待核对。",
	"inventory.disabled": "配置关闭",
	"inventory.failed": "加载失败",
	"inventory.active": "运行中",
	"inventory.pending": "等待依赖",
	"inventory.loading": "加载中",
	"inventory.unloading": "卸载中",
	"inventory.unmounted": "尚未挂载",
	"inventory.conditional": "条件待求值",
	"inventory.reason.disabled": "当前配置关闭了该条目或其上级组；服务未提供具体关闭原因。",
	"inventory.reason.failed": "插件加载失败，请检查服务诊断和包解析；本页不会将失败标为停用。",
	"inventory.reason.pending": "插件正在等待所需服务或依赖，尚未进入运行状态。",
	"inventory.reason.loading": "Loader 正在加载插件，状态以刷新后的服务清单为准。",
	"inventory.reason.unloading": "Loader 正在释放插件，状态以刷新后的服务清单为准。",
	"inventory.reason.unmounted": "配置包含该条目，但当前未返回已挂载的插件实例。",
	"inventory.reason.active": "插件实例已激活；工具可用性仍受会话装配、配置和权限控制。",
	"inventory.reason.conditional": "该预设尚未挂载，配置条件需由实际会话上下文求值。",
	"inventory.empty": "没有匹配的包。",
	"inventory.group.core": "Agent 核心与预设",
	"inventory.group.models": "模型与请求",
	"inventory.group.execution": "命令、终端与代码执行",
	"inventory.group.files": "文件、工作区与代码导航",
	"inventory.group.web": "搜索、网页与外部事件",
	"inventory.group.orchestration": "子智能体、工作流与任务",
	"inventory.group.context": "上下文、附件与压缩",
	"inventory.group.sessions": "会话、历史与存储",
	"inventory.group.security": "权限、安全与治理",
	"inventory.group.extensions": "Skills、MCP 与扩展",
	"inventory.group.interfaces": "API、SDK 与宿主连接",
	"inventory.group.ui": "界面与交互",
	"inventory.group.platform": "平台、启动与基础库",
	"inventory.group.engineering": "测试、实验与示例",
	"inventory.group.unknown": "未收录模块",
	"inventory.kind.plugin": "插件",
	"inventory.kind.library": "普通库",
	"inventory.kind.bundle": "装配包",
	"inventory.kind.application": "应用入口",
	"inventory.kind.native": "原生载体",
	"inventory.kind.example": "能力包示例"
};
//#endregion
//#region dev/shared/console/packages/ui/admin/src/pages/client/plugin-settings-locales.ts
/** 通用配置目录与请求错误提示。 */
const pluginSettingsEn = {
	"configuration.controlScope": "Switches apply across this enterprise. Busy instances wait until their tasks are idle; saving does not mean every instance has applied the change. Refresh to see adoption reports.",
	"configuration.instanceUnavailable": "The instance is unavailable. Configuration history and recovery remain available.",
	"configuration.restoreVersion": "Restore version",
	"configuration.selectVersion": "Select a previous version",
	"configuration.defaultVersion": "0 · Deployment defaults",
	"configuration.restore": "Restore this version",
	"configuration.confirmRestore": "Confirm restore",
	"configuration.restoreNotice": "This publishes a new enterprise configuration version. Running tasks continue; startup parameters take effect after restart.",
	"configuration.enterpriseVersion": "Enterprise configuration version",
	"configuration.adoption": "Instance adoption",
	"configuration.enterpriseScope": "Saved parameters apply to this enterprise. The form shows this administrator’s instance values; refresh to see each user’s latest adoption report.",
	"configuration.noInstances": "No user instances yet. New instances receive the published configuration at startup.",
	"configuration.adoption.pending": "Pending sync",
	"configuration.adoption.applied": "Adopted",
	"configuration.adoption.restart-required": "Restart required",
	"configuration.adoption.failed": "Adoption failed",
	"configuration.instanceStopped": "Stopped",
	"configuration.instanceVersion": "Reported version",
	"configuration.lastReport": "Last report",
	"nav.pluginSettings": "Core configuration",
	"nav.businessPluginSettings": "Business configuration",
	"configuration.businessEmpty": "No business plugin configuration is available.",
	"configuration.empty": "No configuration forms are available.",
	"configuration.unknown": "This configuration module is unavailable.",
	"configuration.error.conflict": "The configuration changed. Refresh before saving again.",
	"configuration.error.invalid": "Check the parameter values.",
	"configuration.error.artifact": "Artifact validation failed. Check the directory, manifest and digest; do not add duplicate packages.",
	"configuration.error.failed": "Configuration could not be saved. Check your access and refresh."
};
const pluginSettingsZh = {
	"configuration.controlScope": "开关作用于本企业。正在执行任务的实例会等待空闲后应用；保存成功不代表所有实例已生效。刷新可查看采用回报。",
	"configuration.instanceUnavailable": "实例暂不可用，仍可查看历史并恢复企业配置。",
	"configuration.restoreVersion": "恢复到版本",
	"configuration.selectVersion": "选择历史版本",
	"configuration.defaultVersion": "0 · 部署默认配置",
	"configuration.restore": "恢复此版本",
	"configuration.confirmRestore": "确认恢复",
	"configuration.restoreNotice": "将重新发布一版企业配置。不会终止正在执行的任务；启动参数须在实例重启后生效。",
	"configuration.enterpriseVersion": "企业配置版本",
	"configuration.adoption": "实例采用情况",
	"configuration.enterpriseScope": "保存的参数作用于本企业。表单中的运行值属于当前管理员实例；刷新可查看各用户实例最近的采用回报。",
	"configuration.noInstances": "尚无用户实例，新实例启动时会领取企业已发布配置。",
	"configuration.adoption.pending": "待同步",
	"configuration.adoption.applied": "已采用",
	"configuration.adoption.restart-required": "待重启",
	"configuration.adoption.failed": "采用失败",
	"configuration.instanceStopped": "已停止",
	"configuration.instanceVersion": "回报版本",
	"configuration.lastReport": "最近回报",
	"nav.pluginSettings": "核心插件配置",
	"nav.businessPluginSettings": "业务插件配置",
	"configuration.businessEmpty": "尚无可配置的业务插件",
	"configuration.empty": "暂无可用配置表单",
	"configuration.unknown": "此配置模块不可用。",
	"configuration.error.conflict": "配置已被修改，请刷新后重新保存。",
	"configuration.error.invalid": "请检查参数值。",
	"configuration.error.artifact": "制品校验未通过，请检查目录、清单和摘要，不要重复添加同一个包。",
	"configuration.error.failed": "配置未能保存，请核对权限并刷新。"
};
//#endregion
//#region dev/shared/console/packages/ui/admin/src/pages/client/resource-locales.ts
/** 管理外壳的资源导航与授权文字；领域表单由 ui-admin-resources 提供。 */
const resourceEn = {
	"nav.resourcesPages": "Enterprise resource pages",
	"resource.portal": "My enterprise resources",
	"resource.knowledge": "Enterprise knowledge bases",
	"resource.connection": "Data connection center",
	"permission.resources:read": "View enterprise resource configuration",
	"permission.resources:write": "Manage enterprise resources",
	"permission.resources:grant": "Grant enterprise resource access"
};
const resourceZh = {
	"nav.resourcesPages": "企业资源页面",
	"resource.portal": "我的企业资源",
	"resource.knowledge": "企业知识库",
	"resource.connection": "数据对接中心",
	"permission.resources:read": "查看企业资源配置",
	"permission.resources:write": "管理企业资源",
	"permission.resources:grant": "分配企业资源使用权"
};
//#endregion
//#region dev/shared/console/packages/ui/admin/src/pages/client/console-locales.ts
/** Vocabulary for console views, including unavailable data states. */
const consoleEn = {
	"nav.capabilityArea": "Models & tools",
	"nav.scenarioArea": "Scenario apps",
	"nav.resourceArea": "Knowledge & data",
	"nav.organizationArea": "People & access",
	"nav.operationsArea": "Operations & audit",
	"nav.enterpriseArea": "Enterprise settings",
	"nav.generalTools": "General tools",
	"nav.mcpConnections": "MCP connections",
	"nav.skillCatalog": "Skill catalog",
	"nav.scenarioAccess": "Usage access",
	"nav.scenarioPackages": "Installation & versions",
	"nav.capabilityPages": "Models and tools pages",
	"nav.scenarioPages": "Scenario app pages",
	"console.eventType": "Event type",
	"console.allEvents": "All events",
	"console.technicalComponents": "Technical components",
	"console.configurationDiagnostics": "Configuration diagnostics",
	"console.connectionHistory": "Previous connection records",
	"console.profileHistory": "Previous configuration records",
	"workAudit.title": "Work records",
	"workAudit.search": "Search work",
	"workAudit.creator": "Creator",
	"workAudit.assignee": "Owner",
	"workAudit.confirmer": "Reviewer",
	"workAudit.status": "Status",
	"workAudit.updated": "Updated",
	"workAudit.content": "Content",
	"workAudit.progress": "Progress",
	"workAudit.history": "Edit history",
	"workAudit.attachment": "Previous attachment",
	"workAudit.empty": "No work records",
	"workAudit.error": "Could not read work records. Check access and retry.",
	"workAudit.pending": "Pending",
	"workAudit.active": "In progress",
	"workAudit.review": "In review",
	"workAudit.done": "Completed",
	"workAudit.cancelled": "Cancelled",
	"workAudit.event.create": "Created",
	"workAudit.event.start": "Started",
	"workAudit.event.submit": "Submitted",
	"workAudit.event.approve": "Approved",
	"workAudit.event.return": "Returned",
	"workAudit.event.transfer": "Transferred",
	"workAudit.event.cancel": "Cancelled",
	"workAudit.event.reopen": "Reopened",
	"workAudit.event.update": "Requirements updated",
	"workAudit.event.comment": "Commented",
	"workAudit.event.edit": "Edited",
	"auditDirectory.error.directory": "Could not load sessions. Refresh to retry.",
	"auditDirectory.error.content": "Could not read this record. Check access and availability.",
	"auditDirectory.back": "Back",
	"auditDirectory.defaultWorkspace": "Platform workspace",
	"auditDirectory.loadedEvents": "Events loaded; more are available:",
	"auditDirectory.moreEvents": "Load later events",
	"auditDirectory.search": "Search sessions or working directories",
	"auditDirectory.searchHint": "Session, user or working directory",
	"auditDirectory.user": "User",
	"auditDirectory.allUsers": "All users",
	"auditDirectory.from": "Start date",
	"auditDirectory.to": "End date",
	"auditDirectory.contentPermission": "Reading conversations, traces and logs also requires AI audit content access.",
	"auditDirectory.permissions": "Administrator permissions",
	"auditDirectory.loading": "Loading sessions…",
	"auditDirectory.sessions": "Sessions:",
	"auditDirectory.loaded": "Loaded:",
	"auditDirectory.archiveNote": "These are archived copies of original records. Recent events may still be syncing; the last archive time is shown for each session.",
	"auditDirectory.sync.title": "Archive sync status",
	"auditDirectory.sync.backlog": "View pending sessions",
	"auditDirectory.sync.backlogNote": "Pending sessions loaded:",
	"auditDirectory.sync.quota": "Enterprise archive capacity (MiB)",
	"auditDirectory.sync.used": "Used:",
	"auditDirectory.sync.saveQuota": "Save capacity",
	"auditDirectory.sync.offset": "Confirmed event position",
	"auditDirectory.sync.changeFailed": "Could not complete the request. Refresh and retry; capacity cannot be lower than stored records.",
	"auditDirectory.sync.note": "Latest check; updates may be delayed. Failed transfers retry automatically. Free storage when capacity is reached.",
	"auditDirectory.sync.refresh": "Refresh sync status",
	"auditDirectory.sync.state": "Status",
	"auditDirectory.sync.checked": "Checked / discovered sessions",
	"auditDirectory.sync.pending": "Awaiting tail check",
	"auditDirectory.sync.failed": "Failed sessions",
	"auditDirectory.sync.reported": "Last report",
	"auditDirectory.sync.healthy": "No pending transfers at last check",
	"auditDirectory.sync.syncing": "Syncing",
	"auditDirectory.sync.retrying": "Retrying failed transfers",
	"auditDirectory.sync.capacity": "Archive capacity limit reached",
	"auditDirectory.sync.stopped": "Execution environment stopped",
	"auditDirectory.sync.pendingReport": "Awaiting report",
	"auditDirectory.sync.stale": "Status is stale",
	"auditDirectory.session": "Session",
	"auditDirectory.workspace": "Working directory",
	"auditDirectory.createdAt": "Created",
	"auditDirectory.archivedAt": "Last archived",
	"auditDirectory.actions": "Actions",
	"auditDirectory.parent": "Parent session:",
	"auditDirectory.cloudExecution": "Cloud execution",
	"auditDirectory.deviceExecution": "Computer execution",
	"auditDirectory.parentMissing": "Not in this directory",
	"auditDirectory.notArchived": "Not available",
	"auditDirectory.read": "View records",
	"auditDirectory.empty": "No matching sessions",
	"auditDirectory.more": "Load more",
	"account.login": "Sign in",
	"account.title": "My account",
	"account.logoutFailed": "Could not sign out. Please try again.",
	"accounts.changeFailed": "Could not change account access. Keep at least one administrator; access inherited from a group must be adjusted in that group first.",
	"accounts.type": "Account type",
	"accounts.administrator": "Administrator",
	"accounts.member": "Regular user",
	"accounts.change": "Change account type",
	"accounts.adminHelp": "Administrators can open the console and manage all users in this organization.",
	"accounts.memberHelp": "Regular users have no administrator console. They use resources explicitly granted to them.",
	"accounts.newHelp": "New accounts are regular users. An administrator can change the account type after creation.",
	"console.untitled": "Untitled session",
	"console.child": "Subtask",
	"console.workspace": "Project",
	"console.technical": "Technical information",
	"console.systemActor": "System",
	"console.unavailableUser": "User information unavailable",
	"console.otherEvent": "Administrative change",
	"console.userCreated": "Created a user",
	"console.userStatus": "Changed account status",
	"console.passwordReset": "Reset a password",
	"console.userRoles": "Changed account access",
	"console.groupMembers": "Updated group members",
	"console.groupRoles": "Updated group access",
	"console.groupCreated": "Created a group",
	"console.roleCreated": "Created a role",
	"console.configChanged": "Updated configuration",
	"console.signIn": "Signed in",
	"console.signOut": "Signed out",
	"console.usagePages": "Usage & costs pages",
	"console.connectionsPages": "Connections & credentials pages",
	"console.operationsPages": "Operations pages",
	"console.sections": "Page sections",
	"console.overview": "Usage overview",
	"console.sessions": "Session usage",
	"console.budgets": "Budgets & alerts",
	"console.prices": "Price rules",
	"console.mcp": "MCP services",
	"console.other": "Other connections",
	"console.credentials": "Credentials",
	"console.tasks": "Running sessions",
	"console.services": "Service health",
	"console.changes": "Configuration changes",
	"console.general": "General",
	"console.login": "Login & sessions",
	"console.retention": "Data retention",
	"console.backup": "Updates & backups",
	"console.loginRecords": "Login records",
	"console.grants": "Resource access",
	"console.versions": "Versions",
	"console.totalTokens": "Reported tokens",
	"console.input": "Uncached input",
	"console.output": "Output",
	"console.cacheRead": "Cache read",
	"console.cacheWrite": "Cache write",
	"console.cost": "Estimated cost",
	"console.unpriced": "Not priced",
	"console.unknown": "Not reported",
	"console.scope": "Visible sessions · recorded usage",
	"console.scopeNote": "Reported usage only; updates may be delayed. Not a bill.",
	"console.noSessions": "No sessions to display",
	"console.noMatch": "No matching results",
	"console.search": "Search by identifier or action",
	"console.searchAction": "Search",
	"console.clear": "Clear",
	"console.details": "Details",
	"console.back": "Back to list",
	"console.updated": "Last updated",
	"console.session": "Session",
	"console.running": "Running",
	"console.idle": "Idle",
	"console.parent": "Parent session",
	"console.breakdown": "Token breakdown",
	"console.related": "Related configuration",
	"console.recent": "Recent activity",
	"console.budgetTitle": "Budget enforcement is not connected",
	"console.budgetBody": "Account, group and member budgets require a metering ledger and server-side enforcement before they can take effect.",
	"console.priceTitle": "Price rules are not connected",
	"console.priceBody": "Versioned model prices and billable units are required to calculate costs. Unknown prices remain unpriced.",
	"console.credentialsTitle": "Manage credentials with their service",
	"console.credentialsBody": "Model API keys are configured per provider connection. MCP stores a credential reference; the secret is supplied by the host.",
	"console.mcpUnavailable": "MCP configuration is unavailable",
	"console.mcpUnavailableBody": "The current host did not return a registered MCP configuration form.",
	"console.systemNote": "Current account",
	"console.managed": "Managed by the server",
	"console.loginBody": "Manage member status, passwords and roles in Organization & members. Session policy editing is not available yet.",
	"console.retentionBody": "Retention schedules are not configurable here yet. Existing sessions and audit records are preserved.",
	"console.backupBody": "Update deployment and backup scheduling are not connected to the console yet.",
	"console.grantsBody": "Knowledge and data access are managed on each resource. Model and plugin usage grants are not connected yet; administrative roles control management permissions.",
	"console.versionsBody": "Scenario publishing and version history are not available yet.",
	"console.notFound": "This record is not in the current result set",
	"console.auditScope": "Latest 50 audit events",
	"console.loginEmpty": "No login events in the current audit result set",
	"console.activeSessions": "Running sessions",
	"console.recordedSessions": "Sessions with usage",
	"console.service": "Service",
	"console.noAuditAccess": "Audit access is required to view configuration changes"
};
const consoleZh = {
	"nav.capabilityArea": "模型与工具",
	"nav.scenarioArea": "场景应用",
	"nav.resourceArea": "知识与数据",
	"nav.organizationArea": "组织与权限",
	"nav.operationsArea": "运行与审计",
	"nav.enterpriseArea": "企业设置",
	"nav.generalTools": "通用工具",
	"nav.mcpConnections": "MCP 连接",
	"nav.skillCatalog": "技能目录",
	"nav.scenarioAccess": "使用权限",
	"nav.scenarioPackages": "安装与版本",
	"nav.capabilityPages": "模型与工具页面",
	"nav.scenarioPages": "场景应用页面",
	"console.eventType": "事件类型",
	"console.allEvents": "全部事件",
	"console.technicalComponents": "技术组件",
	"console.configurationDiagnostics": "配置诊断",
	"console.connectionHistory": "历史连接记录",
	"console.profileHistory": "历史配置记录",
	"workAudit.title": "工作记录",
	"workAudit.search": "搜索工作",
	"workAudit.creator": "发起人",
	"workAudit.assignee": "负责人",
	"workAudit.confirmer": "确认人",
	"workAudit.status": "状态",
	"workAudit.updated": "更新时间",
	"workAudit.content": "内容",
	"workAudit.progress": "进度",
	"workAudit.history": "修改历史",
	"workAudit.attachment": "历史附件",
	"workAudit.empty": "暂无工作记录",
	"workAudit.error": "无法读取工作记录，请检查权限后重试。",
	"workAudit.pending": "待接手",
	"workAudit.active": "处理中",
	"workAudit.review": "待确认",
	"workAudit.done": "已完成",
	"workAudit.cancelled": "已取消",
	"workAudit.event.create": "发起工作",
	"workAudit.event.start": "接手处理",
	"workAudit.event.submit": "提交成果",
	"workAudit.event.approve": "确认完成",
	"workAudit.event.return": "退回补充",
	"workAudit.event.transfer": "转交工作",
	"workAudit.event.cancel": "取消工作",
	"workAudit.event.reopen": "重新打开",
	"workAudit.event.update": "修改要求",
	"workAudit.event.comment": "补充内容",
	"workAudit.event.edit": "修改内容",
	"auditDirectory.error.directory": "会话目录读取失败，请刷新重试。",
	"auditDirectory.error.content": "无法查看记录，请检查正文权限或记录是否仍可用。",
	"auditDirectory.back": "返回",
	"auditDirectory.defaultWorkspace": "平台工作区",
	"auditDirectory.loadedEvents": "已读取事件，后续记录尚未加载：",
	"auditDirectory.moreEvents": "加载后续记录",
	"auditDirectory.search": "搜索会话或工作目录",
	"auditDirectory.searchHint": "会话名称、用户、工作目录",
	"auditDirectory.user": "用户",
	"auditDirectory.allUsers": "全部用户",
	"auditDirectory.from": "开始日期",
	"auditDirectory.to": "结束日期",
	"auditDirectory.contentPermission": "查看对话、轨迹和日志还需要“读取 AI 审计正文”权限。",
	"auditDirectory.permissions": "配置管理员权限",
	"auditDirectory.loading": "正在读取会话目录…",
	"auditDirectory.sessions": "会话总数：",
	"auditDirectory.loaded": "已加载：",
	"auditDirectory.archiveNote": "这里展示原记录的归集副本，最新事件可能仍在同步；每条会话显示最近归集时间。",
	"auditDirectory.sync.title": "归集状态",
	"auditDirectory.sync.backlog": "查看积压会话",
	"auditDirectory.sync.backlogNote": "已加载待同步会话：",
	"auditDirectory.sync.quota": "企业归集容量（MiB）",
	"auditDirectory.sync.used": "已使用：",
	"auditDirectory.sync.saveQuota": "保存容量",
	"auditDirectory.sync.offset": "已确认事件位置",
	"auditDirectory.sync.changeFailed": "操作未完成，请刷新后重试；容量不能低于已保存的记录大小。",
	"auditDirectory.sync.note": "最近检查结果，可能有延迟。失败会自动重试；容量不足时请清理存储。",
	"auditDirectory.sync.refresh": "刷新归集状态",
	"auditDirectory.sync.state": "状态",
	"auditDirectory.sync.checked": "已检查 / 已发现会话",
	"auditDirectory.sync.pending": "待确认传完",
	"auditDirectory.sync.failed": "失败会话",
	"auditDirectory.sync.reported": "最近报告",
	"auditDirectory.sync.healthy": "最近检查无待传记录",
	"auditDirectory.sync.syncing": "同步中",
	"auditDirectory.sync.retrying": "失败后重试中",
	"auditDirectory.sync.capacity": "达到归集容量上限",
	"auditDirectory.sync.stopped": "执行环境已停止",
	"auditDirectory.sync.pendingReport": "等待报告",
	"auditDirectory.sync.stale": "状态已过期",
	"auditDirectory.session": "会话",
	"auditDirectory.workspace": "工作目录",
	"auditDirectory.createdAt": "创建时间",
	"auditDirectory.archivedAt": "最近归集",
	"auditDirectory.actions": "操作",
	"auditDirectory.parent": "父会话：",
	"auditDirectory.cloudExecution": "云端执行",
	"auditDirectory.deviceExecution": "电脑执行",
	"auditDirectory.parentMissing": "目录中尚未加载",
	"auditDirectory.notArchived": "暂无",
	"auditDirectory.read": "查看记录",
	"auditDirectory.empty": "没有符合条件的会话记录",
	"auditDirectory.more": "加载更多",
	"account.login": "用户登录",
	"account.title": "我的账号",
	"account.logoutFailed": "退出失败，请重试。",
	"accounts.changeFailed": "修改失败。请保留至少一位管理员；如果权限来自用户组，请先调整该用户组的授权。",
	"accounts.type": "账号身份",
	"accounts.administrator": "管理员",
	"accounts.member": "普通用户",
	"accounts.change": "修改账号身份",
	"accounts.adminHelp": "管理员可进入后台，管理本企业全部用户及平台配置。",
	"accounts.memberHelp": "普通用户没有管理后台，只使用已授权的功能与资源。",
	"accounts.newHelp": "新账号默认为普通用户，创建后可由管理员修改账号身份。",
	"console.untitled": "未命名会话",
	"console.child": "子任务",
	"console.workspace": "所属项目",
	"console.technical": "技术信息",
	"console.systemActor": "系统",
	"console.unavailableUser": "用户信息不可用",
	"console.otherEvent": "管理操作",
	"console.userCreated": "创建用户",
	"console.userStatus": "修改账号状态",
	"console.passwordReset": "重置密码",
	"console.userRoles": "修改账号权限",
	"console.groupMembers": "调整用户组成员",
	"console.groupRoles": "调整用户组权限",
	"console.groupCreated": "创建用户组",
	"console.roleCreated": "创建角色",
	"console.configChanged": "更新配置",
	"console.signIn": "登录",
	"console.signOut": "退出登录",
	"console.usagePages": "用量与费用页面",
	"console.connectionsPages": "连接与凭证页面",
	"console.operationsPages": "运行管理页面",
	"console.sections": "页面分区",
	"console.overview": "用量总览",
	"console.sessions": "会话用量",
	"console.budgets": "预算与告警",
	"console.prices": "价格规则",
	"console.mcp": "MCP 服务",
	"console.other": "其他连接",
	"console.credentials": "凭证",
	"console.tasks": "运行会话",
	"console.services": "服务状态",
	"console.changes": "配置变更",
	"console.general": "基本信息",
	"console.login": "登录与会话",
	"console.retention": "数据保留",
	"console.backup": "更新与备份",
	"console.loginRecords": "登录记录",
	"console.grants": "资源授权",
	"console.versions": "版本记录",
	"console.totalTokens": "已上报 Token",
	"console.input": "非缓存输入",
	"console.output": "输出",
	"console.cacheRead": "缓存读取",
	"console.cacheWrite": "缓存写入",
	"console.cost": "预估费用",
	"console.unpriced": "尚未计价",
	"console.unknown": "未上报",
	"console.scope": "可见会话 · 已上报用量",
	"console.scopeNote": "仅统计已上报用量，可能有延迟，不作为账单。",
	"console.noSessions": "暂无可展示的会话",
	"console.noMatch": "没有匹配的结果",
	"console.search": "搜索标识或操作",
	"console.searchAction": "搜索",
	"console.clear": "清除",
	"console.details": "详情",
	"console.back": "返回列表",
	"console.updated": "最近更新",
	"console.session": "会话",
	"console.running": "运行中",
	"console.idle": "空闲",
	"console.parent": "父会话",
	"console.breakdown": "Token 构成",
	"console.related": "相关配置",
	"console.recent": "最近动态",
	"console.budgetTitle": "预算控制尚未接通",
	"console.budgetBody": "账户、用户组和成员预算需要用量账本与服务端限额执行支持，接通后才能生效。",
	"console.priceTitle": "价格规则尚未接通",
	"console.priceBody": "费用计算需要模型价格版本和计费单位。未配置价格的用量保持未计价。",
	"console.credentialsTitle": "在所属服务中管理凭证",
	"console.credentialsBody": "模型 API Key 在厂商连接中统一配置。MCP 配置保存凭证引用，密钥由宿主提供。",
	"console.mcpUnavailable": "MCP 配置暂不可用",
	"console.mcpUnavailableBody": "当前宿主尚未返回已注册的 MCP 配置表单。",
	"console.systemNote": "当前账户信息",
	"console.managed": "由服务端管理",
	"console.loginBody": "成员状态、密码和角色在组织与成员中管理。登录会话策略暂未开放编辑。",
	"console.retentionBody": "暂未开放保留周期配置，已有会话和审计记录继续保留。",
	"console.backupBody": "更新部署和定时备份尚未接入后台。",
	"console.grantsBody": "知识库和数据源在资源详情中授权。模型与插件使用授权尚未接通；管理角色控制后台操作权限。",
	"console.versionsBody": "场景发布与版本记录尚未开放。",
	"console.notFound": "当前结果集中没有这条记录",
	"console.auditScope": "最近 50 条审计事件",
	"console.loginEmpty": "当前审计结果中暂无登录事件",
	"console.activeSessions": "运行会话",
	"console.recordedSessions": "已上报用量会话",
	"console.service": "服务",
	"console.noAuditAccess": "查看配置变更需要审计读取权限"
};
//#endregion
//#region dev/shared/console/packages/ui/admin/src/pages/client/enterprise-locales.ts
const enterpriseEn = {
	"enterprise.delete": "Delete",
	"enterprise.confirmDelete": "Confirm deletion",
	"enterprise.edit": "Edit details",
	"enterprise.deleteBlocked": "Resolve these references before deleting:",
	"enterprise.deleteReady": "This item can be deleted. Historical audit records will be preserved.",
	"enterprise.departmentDeleted": "Department deleted",
	"enterprise.groupDeleted": "User group deleted",
	"enterprise.roleDeleted": "Business role deleted",
	"enterprise.groupChanged": "User group updated",
	"enterprise.loadGroupFailed": "Could not load members. Close and try again.",
	"enterprise.departments": "Departments",
	"enterprise.createDepartment": "New department",
	"enterprise.editDepartment": "Edit department",
	"enterprise.code": "Department code",
	"enterprise.parent": "Parent department",
	"enterprise.root": "Enterprise root",
	"enterprise.members": "Members",
	"enterprise.emptyDepartments": "No departments yet",
	"enterprise.department": "Department",
	"enterprise.primary": "Primary department",
	"enterprise.secondary": "Additional departments",
	"enterprise.none": "Unassigned",
	"enterprise.membership": "Department membership",
	"enterprise.preview": "Permission sources",
	"enterprise.scope": "Data scope",
	"enterprise.action": "Business action",
	"enterprise.source": "Source",
	"enterprise.emptyRules": "No business permissions assigned",
	"enterprise.createRole": "New business role",
	"enterprise.editRules": "Edit permissions",
	"enterprise.emptyRoles": "No business roles yet",
	"enterprise.roleName": "Role name",
	"enterprise.description": "Description",
	"enterprise.rules": "Permission rules",
	"enterprise.assignments": "Role assignments",
	"enterprise.assign": "Assign role",
	"enterprise.role": "Business role",
	"enterprise.subjectType": "Assign to",
	"enterprise.subject": "Member, department or group",
	"enterprise.user": "Member",
	"enterprise.group": "User group",
	"enterprise.anchor": "Department scope anchor",
	"enterprise.followPrimary": "Use each member’s primary department",
	"enterprise.children": "Include subdepartments",
	"enterprise.until": "Valid until (optional)",
	"enterprise.forever": "No expiry",
	"enterprise.from": "Valid from (optional)",
	"enterprise.revoke": "Revoke assignment",
	"enterprise.emptyAssignments": "No role assignments yet",
	"enterprise.self": "Owned by the member",
	"enterprise.account": "Entire enterprise",
	"enterprise.departmentScope": "Assigned department",
	"enterprise.department_tree": "Assigned department and descendants",
	"enterprise.departmentsScope": "Selected departments",
	"enterprise.resources": "Selected resources",
	"enterprise.addRule": "Add permission",
	"enterprise.removeRule": "Remove rule",
	"enterprise.choose": "Select…",
	"enterprise.failed": "Could not save. Check the values and retry; refresh if another administrator changed this configuration.",
	"enterprise.loadFailed": "Could not load permissions. Close and retry.",
	"enterprise.scopeMissing": "No department anchor; this rule currently grants no department data.",
	"enterprise.stage": "Roles govern knowledge and business data access. Multi-user assistant execution is not open yet.",
	"enterprise.readOnlyScope": "This resource selection is preserved. Resource editing will be available when its picker is connected.",
	"enterprise.revokeHelp": "Only this assignment will be removed. Other role sources remain effective.",
	"enterprise.disabledUser": "This member is disabled and cannot use business permissions.",
	"enterprise.departmentChanged": "Department updated",
	"enterprise.membershipChanged": "Department membership updated",
	"enterprise.roleChanged": "Business role updated",
	"enterprise.rulesChanged": "Business permissions updated",
	"enterprise.roleAssigned": "Business role assigned",
	"enterprise.roleRevoked": "Business role assignment revoked"
};
const enterpriseZh = {
	"enterprise.delete": "删除",
	"enterprise.confirmDelete": "确认删除",
	"enterprise.edit": "编辑资料",
	"enterprise.deleteBlocked": "请先处理以下关联，再删除：",
	"enterprise.deleteReady": "该对象可以删除，历史审计记录将保留。",
	"enterprise.departmentDeleted": "部门已删除",
	"enterprise.groupDeleted": "用户组已删除",
	"enterprise.roleDeleted": "业务角色已删除",
	"enterprise.groupChanged": "用户组已更新",
	"enterprise.loadGroupFailed": "成员加载失败，请关闭后重试。",
	"enterprise.departments": "部门管理",
	"enterprise.createDepartment": "新建部门",
	"enterprise.editDepartment": "编辑部门",
	"enterprise.code": "部门编码",
	"enterprise.parent": "上级部门",
	"enterprise.root": "企业直属",
	"enterprise.members": "成员",
	"enterprise.emptyDepartments": "尚未创建部门",
	"enterprise.department": "部门",
	"enterprise.primary": "主部门",
	"enterprise.secondary": "兼职部门",
	"enterprise.none": "未分配",
	"enterprise.membership": "部门归属",
	"enterprise.preview": "权限来源",
	"enterprise.scope": "数据范围",
	"enterprise.action": "业务操作",
	"enterprise.source": "授权来源",
	"enterprise.emptyRules": "尚未分配业务权限",
	"enterprise.createRole": "新建业务角色",
	"enterprise.editRules": "编辑权限",
	"enterprise.emptyRoles": "尚未创建业务角色",
	"enterprise.roleName": "角色名称",
	"enterprise.description": "说明",
	"enterprise.rules": "权限规则",
	"enterprise.assignments": "角色分配",
	"enterprise.assign": "分配角色",
	"enterprise.role": "业务角色",
	"enterprise.subjectType": "分配对象类型",
	"enterprise.subject": "分配对象",
	"enterprise.user": "成员",
	"enterprise.group": "用户组",
	"enterprise.anchor": "部门数据范围依据",
	"enterprise.followPrimary": "沿用各成员的主部门",
	"enterprise.children": "包含下级部门",
	"enterprise.until": "结束时间（可选）",
	"enterprise.forever": "长期有效",
	"enterprise.from": "开始时间（可选）",
	"enterprise.revoke": "撤销分配",
	"enterprise.emptyAssignments": "尚未分配业务角色",
	"enterprise.self": "本人负责",
	"enterprise.account": "全企业",
	"enterprise.departmentScope": "指定归属部门",
	"enterprise.department_tree": "归属部门及下级",
	"enterprise.departmentsScope": "选择的部门",
	"enterprise.resources": "指定资源",
	"enterprise.addRule": "添加权限",
	"enterprise.removeRule": "移除规则",
	"enterprise.choose": "请选择",
	"enterprise.failed": "保存失败，请检查填写内容后重试；如果其他管理员修改了配置，请刷新后重新编辑。",
	"enterprise.loadFailed": "权限加载失败，请关闭后重试。",
	"enterprise.scopeMissing": "未设置部门依据，此规则当前不会授予部门数据访问。",
	"enterprise.stage": "业务角色已接通知识库与数据连接的使用权限，多人助手执行尚未开放。",
	"enterprise.readOnlyScope": "已保留现有资源选择，资源选择器接通后可在此编辑。",
	"enterprise.revokeHelp": "只撤销这一项分配，其他来源的角色仍然有效。",
	"enterprise.disabledUser": "该成员已停用，无法使用业务权限。",
	"enterprise.departmentChanged": "调整部门",
	"enterprise.membershipChanged": "调整成员部门",
	"enterprise.roleChanged": "调整业务角色",
	"enterprise.rulesChanged": "调整业务权限",
	"enterprise.roleAssigned": "分配业务角色",
	"enterprise.roleRevoked": "撤销业务角色分配"
};
//#endregion
//#region dev/shared/console/packages/ui/admin/src/pages/client/scenario-locales.ts
const sceneZh = {
	"scene.unavailableUser": "已移除的用户",
	"scene.search": "搜索场景",
	"scene.status": "状态",
	"scene.allStatuses": "全部状态",
	"scene.enabled": "已启用",
	"scene.disabled": "已停用",
	"scene.name": "场景",
	"scene.version": "版本",
	"scene.scope": "使用范围",
	"scene.permissions": "使用权限",
	"scene.allUsers": "全体用户可用",
	"scene.selectedUsers": "指定用户可用",
	"scene.noUsers": "暂不开放",
	"scene.searchUsers": "搜索用户",
	"scene.chooseUsers": "请至少选择一名用户",
	"scene.noUsersMatch": "没有匹配的用户",
	"scene.usersUnavailable": "没有读取用户列表的权限",
	"scene.noMatch": "没有匹配的场景",
	"scene.empty": "当前运行环境尚未加载场景包",
	"scene.loadFailed": "场景列表加载失败，请刷新重试",
	"scene.loading": "正在读取场景列表…"
};
const sceneEn = {
	"scene.unavailableUser": "Removed user",
	"scene.search": "Search scenarios",
	"scene.status": "Status",
	"scene.allStatuses": "All statuses",
	"scene.enabled": "Enabled",
	"scene.disabled": "Disabled",
	"scene.name": "Scenario",
	"scene.version": "Version",
	"scene.scope": "Who can use",
	"scene.permissions": "Usage permissions",
	"scene.allUsers": "All users",
	"scene.selectedUsers": "Selected users",
	"scene.noUsers": "Not open to users",
	"scene.searchUsers": "Search users",
	"scene.chooseUsers": "Select at least one user",
	"scene.noUsersMatch": "No matching users",
	"scene.usersUnavailable": "You cannot read the user directory",
	"scene.noMatch": "No matching scenarios",
	"scene.empty": "No scenario packages are loaded in this environment",
	"scene.loadFailed": "Unable to load scenarios. Refresh to retry.",
	"scene.loading": "Loading scenarios…"
};
({ ...devicePluginsEn }), { ...sceneEn }, {
	...businessEn,
	...enterpriseEn,
	...consoleEn,
	...resourceEn,
	...pluginSettingsEn,
	...capabilityEn,
	...capabilityTitleEn,
	...inventoryEn
};
/** Simplified Chinese administrator UI copy. */
const zh = {
	"account.local": "账户",
	"account.openData": "打开数据目录",
	"account.reload": "重新加载界面",
	"account.restart": "退出并重启",
	"account.actionFailed": "操作未完成，请重试。",
	"personal.sessions": "已保存会话",
	"personal.entry": "管理控制台",
	"personal.accounts": "账号与授权",
	"personal.settings": "品牌设置",
	"personal.profile": "账号资料",
	"personal.displayName": "显示名称",
	"personal.sceneManage": "管理",
	...devicePluginsZh,
	"nav.devicePlugins": "本机插件",
	"speech.title": "实时转写",
	"speech.enabled": "已启用",
	"speech.disabled": "未启用",
	"speech.enableModel": "启用模型",
	"speech.connection": "连接配置",
	"speech.selected": "已选用",
	"speech.unselected": "未选用",
	"speech.loading": "正在读取配置…",
	"speech.retry": "重试",
	"speech.readOnly": "当前配置只读",
	"speech.description": "企业统一配置语音 API",
	"speech.configured": "已配置",
	"speech.unconfigured": "未配置",
	"speech.model": "语音模型",
	"speech.endpoint": "WebSocket 接入地址",
	"speech.key": "API Key",
	"speech.keepKey": "留空保留已有密钥",
	"speech.enterKey": "填写百炼 API Key",
	"speech.identityLimit": "当前实时 API 不支持说话人分离和声纹入库。",
	"speech.save": "保存",
	"speech.saved": "已保存",
	"speech.failed": "加载或保存失败，请检查权限和配置。",
	...sceneZh,
	"auditOutputs.title": "任务产物",
	"auditOutputs.failed": "留存文件读取失败",
	"auditOutputs.empty": "暂无留存文件",
	"auditOutputs.file": "文件",
	"auditOutputs.captured": "版本时间",
	"auditOutputs.size": "大小",
	"auditOutputs.download": "下载",
	"auditOutputs.pending": "上传中",
	"catalog.policyUnavailable": "企业统一策略尚未启用",
	"catalog.policyUnavailableNote": "已登记策略尚未生效。可用工具请在插件管理中配置。",
	"catalog.managePlugins": "前往插件管理",
	"catalog.policyHistory": "历史策略记录",
	"catalog.policyEmpty": "暂无历史策略记录",
	"catalog.policyTools": "工具",
	"catalog.policyHosts": "域名",
	"catalog.policyStatus": "状态",
	"catalog.policyInactive": "未生效",
	"console.businessRoles": "业务角色",
	"console.sessionRead": "查看 AI 会话记录",
	"console.sessionExport": "导出 Session 日志",
	"console.administrators": "管理员权限",
	"console.aiSessions": "AI 使用记录",
	"enterprise.legacyProject": "历史项目范围",
	...businessZh,
	...enterpriseZh,
	...consoleZh,
	...resourceZh,
	...pluginSettingsZh,
	...capabilityZh,
	...capabilityTitleZh,
	...inventoryZh,
	"nav.pluginsPages": "插件管理页面",
	"nav.installed": "核心插件",
	"nav.registry": "业务扩展插件",
	"nav.runtime": "运行状态",
	"native.operator": "需要本机操作员权限",
	"native.default": "默认",
	"native.name": "名称",
	"native.identifier": "标识",
	"native.state": "状态",
	"native.active": "运行中",
	"native.disabled": "已停用",
	"native.failed": "异常",
	"native.pending": "等待中",
	"native.loading": "加载中",
	"native.unloading": "卸载中",
	"native.unmounted": "未挂载",
	"nav.resources": "场景与资源",
	"nav.platform": "平台配置与运行",
	"nav.governance": "组织与治理",
	"nav.directory": "管理目录",
	"nav.scenarios": "场景管理",
	"scenarios.description": "围绕业务任务组合能力与资源，复用同一套通用底座。",
	"scenarios.unavailable": "暂未开放",
	"scenarios.emptyTitle": "场景配置尚未开放",
	"scenarios.emptyBody": "场景创建与发布暂未开放。",
	"scenarios.workspace": "前往工作台",
	"scenarios.composition": "场景的组成",
	"scenarios.capabilities": "插件能力",
	"scenarios.capabilitiesDescription": "完成业务任务所需的工具与工作流。",
	"scenarios.resources": "资源引用",
	"scenarios.resourcesDescription": "场景使用的模型、知识库与数据连接。",
	"scenarios.interface": "业务界面",
	"scenarios.interfaceDescription": "场景欢迎区与专属业务工作面板。",
	"scenarios.modeNote": "标准模式与管理员模式属于执行权限，不是业务场景。",
	"scenarios.related": "相关配置",
	"scenarios.pluginsLink": "查看通用能力及实际加载状态",
	"scenarios.modelsLink": "管理可用模型与调用凭据",
	"scenarios.connectionsLink": "查看已登记连接与凭据引用",
	"nav.knowledge": "知识库与数据源",
	"nav.models": "模型配置",
	"nav.connections": "连接与凭证",
	"nav.operations": "运行管理",
	"nav.usage": "用量与费用",
	"nav.organization": "组织与成员",
	"nav.security": "安全与审计",
	"nav.system": "系统设置",
	"nav.policies": "工具与网络策略",
	"nav.organizationPages": "组织与成员页面",
	"nav.securityPages": "安全与审计页面",
	"nav.systemPages": "系统设置页面",
	"status.notConnected": "尚未接入",
	"status.healthy": "连接正常",
	"status.unavailable": "连接异常",
	"operations.appserver": "AppServer",
	"operations.harness": "Harness",
	"operations.connection": "服务连接",
	"system.account": "账户",
	"system.identity": "账户标识",
	"system.mode": "执行模式",
	"system.original": "原版 Harness",
	"models.pending": "模型配置尚未接入后台。",
	"knowledge.pending": "知识库管理尚未启用。",
	"usage.pending": "账户用量与费用尚未接入。",
	"catalog.registeredOnly": "已登记配置 · 未应用到运行时",
	"nav.packages": "插件管理",
	"nav.skills": "技能管理",
	"nav.configuration": "连接与策略",
	"nav.profiles": "运行配置",
	"permission.packages:read": "查看插件包目录",
	"permission.packages:write": "管理插件包与分配",
	"permission.runtime:read": "查看运行配置",
	"permission.runtime:write": "发布运行配置",
	"catalog.description": "登记包版本、发布并分配给用户或用户组。登记元数据本身不会安装可执行代码。",
	"catalog.register": "登记版本",
	"catalog.manifest": "插件包清单（JSON）",
	"catalog.digest": "制品 SHA-256",
	"catalog.release": "发布／启用",
	"catalog.disable": "停用",
	"catalog.assign": "分配使用权限",
	"catalog.revoke": "撤销",
	"catalog.version": "插件包版本",
	"catalog.target": "用户或用户组",
	"catalog.choose": "请选择…",
	"catalog.empty": "暂无记录。",
	"catalog.invalid": "请检查表单字段或 JSON 格式。",
	"catalog.draft": "草稿",
	"catalog.released": "已发布",
	"catalog.disabled": "已停用",
	"catalog.assignments": "使用权限分配",
	"catalog.name": "名称",
	"catalog.create": "创建",
	"catalog.configuration.description": "密钥仅由服务端管理。这里只填写凭据环境变量名称，不得填写密钥值。",
	"catalog.connection": "新建连接",
	"catalog.kind": "连接类型",
	"catalog.model": "模型",
	"catalog.mcp": "MCP",
	"catalog.endpoint": "HTTPS 地址",
	"catalog.credential": "凭据引用（可选）",
	"catalog.policy": "新建工具／网络策略",
	"catalog.profiles.description": "新建不可变配置草稿，再通过版本号检查发布或回滚。发布记录目标配置，运行时是否采用需要单独验证。",
	"catalog.profile": "新建配置草稿",
	"catalog.publish": "发布配置",
	"catalog.rollback": "回滚到此版本",
	"catalog.history": "发布历史",
	"catalog.revision": "修订号",
	"catalog.noSelection": "不选择表示不包含插件包或受管连接。",
	"catalog.configurations": "已登记配置",
	"catalog.pending": "配置已发布不等于运行时已采用。",
	"entry.label": "管理后台",
	"title": "管理后台",
	"subtitle": "在智能体工作区内管理当前企业账户。",
	"back": "返回工作台",
	"logout": "退出登录",
	"refresh": "刷新",
	"close": "关闭",
	"cancel": "取消",
	"save": "保存",
	"saved": "更改已保存。",
	"loading": "正在加载管理数据…",
	"forbidden.title": "需要管理员权限",
	"forbidden.body": "当前账户没有打开管理后台的权限。",
	"unauthenticated.title": "登录已过期",
	"unauthenticated.body": "请重新登录后继续。",
	"error.load": "管理数据加载失败。",
	"error.mutation": "更改保存失败。",
	"submitting": "提交中…",
	"console.serviceMissing": "该功能的管理服务尚未接入。",
	"nav.overview": "后台总览",
	"nav.users": "用户",
	"nav.roles": "角色与权限",
	"nav.groups": "用户组",
	"nav.audit": "审计日志",
	"overview.title": "后台总览",
	"overview.users": "管理用户",
	"overview.roles": "角色",
	"overview.groups": "用户组",
	"overview.audit": "近期事件",
	"overview.scope": "账户范围",
	"users.title": "用户",
	"users.description": "创建账户、控制访问状态并分配直接角色。",
	"users.create": "新建用户",
	"users.create.submit": "创建用户",
	"users.create.title": "创建管理用户",
	"users.email": "邮箱",
	"users.name": "姓名",
	"users.password": "临时密码",
	"users.status": "状态",
	"users.roles": "直接角色",
	"users.reset": "重置密码",
	"users.reset.title": "重置用户密码",
	"users.activate": "启用",
	"users.disable": "停用",
	"users.active": "已启用",
	"users.disabled": "已停用",
	"roles.title": "角色",
	"roles.description": "把后台权限组合成可复用的访问角色。",
	"roles.create": "新建角色",
	"roles.create.submit": "创建角色",
	"roles.create.title": "创建自定义角色",
	"roles.name": "角色名称",
	"roles.description.label": "说明",
	"roles.permissions": "权限",
	"roles.system": "系统内置",
	"groups.title": "用户组",
	"groups.description": "以用户组为单位分配成员和继承角色。",
	"groups.create": "新建用户组",
	"groups.create.submit": "创建用户组",
	"groups.create.title": "创建管理用户组",
	"groups.name": "用户组名称",
	"groups.members": "成员",
	"groups.roles": "继承角色",
	"groups.manage": "管理用户组",
	"groups.manage.title": "管理用户组分配",
	"audit.title": "审计日志",
	"audit.description": "只追加记录的账户管理活动。",
	"audit.time": "时间",
	"audit.action": "操作",
	"audit.actor": "操作人",
	"audit.target": "对象",
	"audit.details": "详情",
	"empty.users": "暂无管理用户。",
	"empty.roles": "暂无角色。",
	"empty.groups": "暂无用户组。",
	"empty.audit": "暂无审计活动。",
	"table.actions": "操作",
	"permission.admin:access": "打开管理后台",
	"permission.users:read": "查看用户",
	"permission.users:write": "管理用户",
	"permission.roles:read": "查看角色",
	"permission.roles:write": "管理角色",
	"permission.groups:read": "查看用户组",
	"permission.groups:write": "管理用户组",
	"permission.audit:read": "查看审计日志",
	"permission.audit:content": "查看 AI 对话正文"
};
//#endregion
//#region packages/platform/community/src/console-icons.mjs
/** 沿用中台侧栏的细线图形，所有页面共享同一套视觉语义。 */
const paths = {
	account: "M15.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM5 21v-2a7 7 0 0 1 14 0v2",
	home: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
	models: "M8 3v3m8-3v3M8 18v3m8-3v3M3 8h3m-3 8h3m12-8h3m-3 8h3M6 6h12v12H6z",
	scenarios: "M3 3h6v6H3zM15 15h6v6h-6zM6 9v9h9M15 3h6v6h-6zM18 9v6",
	resources: "M12 5C9 2 4 3 2 4v16c3-2 7-2 10 0 3-2 7-2 10 0V4c-3-1-7-2-10 1v15",
	integrations: "M9 7H7a5 5 0 0 0 0 10h2m6-10h2a5 5 0 0 1 0 10h-2M8 12h8",
	data: "M21 6c0 2-4 3-9 3S3 8 3 6s4-3 9-3 9 1 9 3ZM3 6v12c0 2 4 3 9 3s9-1 9-3V6M3 12c0 2 4 3 9 3s9-1 9-3",
	archives: "M3 4h18v4H3V4Zm2 4v12h14V8M9 12h6",
	chat: "M4 3h16v14H9l-5 4V3Z",
	operations: "M3 12h4l3-8 4 16 3-8h4",
	tasks: "M9 4h11v17H4V4h2m1-2h8v4H7V2Zm1 9 2 2 4-4m-6 8h8",
	branch: "M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 0v8m0 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0-8h8a4 4 0 0 0 4-4V4m0 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
	folder: "M3 7V5h6l2 2h10v13H3V7Zm0 3h18",
	plugins: "M9 3h6v4h4v6h-4v7H9v-7H5V7h4V3Z",
	settings: "M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-5 0v6",
	prices: "M4 4h16v16H4V4Zm4 4 4 4 4-4m-4 4v6m-4-5h8m-8 3h8",
	balance: "M4 6h15v14H4V6Zm0 0V4h13v2m-1 5h5v5h-5v-5Zm2 2.5h.01",
	usage: "M5 20V10m7 10V4m7 16v-7M3 20h18",
	skills: "m12 3 9 5-9 5-9-5 9-5Zm-7 9v5l7 4 7-4v-5",
	back: "m10 5-7 7 7 7M3 12h18",
	panel: "M3 4h18v16H3zM9 4v16"
};
function ConsoleIcon({ kind = "plugins", size = 20 }) {
	return react.default.createElement("svg", {
		width: size,
		height: size,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 1.6,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		"aria-hidden": true
	}, react.default.createElement("path", { d: paths[kind] ?? paths.plugins }));
}
function ConsoleGlyph({ kind = "plugins", children }) {
	return react.default.createElement("span", {
		className: "beellix-glyph",
		"data-kind": kind,
		"aria-hidden": true
	}, children ?? react.default.createElement(ConsoleIcon, { kind }));
}
//#endregion
//#region dev/shared/console/section-tabs.tsx
function SectionTabs({ label, items, active, onChange, buttons = false, disabled = false }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
		className: "beellix-section-tabs",
		"aria-label": label,
		children: items.map(([id, title]) => buttons ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			className: "beellix-section-tab",
			type: "button",
			disabled,
			"aria-pressed": active === id,
			"aria-current": active === id ? "page" : void 0,
			onClick: () => onChange(id),
			children: title
		}, id) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
			className: "beellix-section-tab",
			href: "#beellix-" + id,
			"aria-current": active === id ? "page" : void 0,
			onClick: (e) => {
				e.preventDefault();
				onChange(id);
			},
			children: title
		}, id))
	});
}
//#endregion
//#region packages/platform/community/src/console-structure.tsx
/** 中台共用层级与对象详情组件；只组织已有能力。 */
const applicationStates = {
	unavailable: "安装包待提供",
	available: "未安装",
	enabled: "已启用",
	disabled: "已停用",
	pending: "待接入",
	invalid: "安装包校验失败",
	failed: "加载失败",
	installing: "安装中…"
};
function DetailHeading({ parent, title, onBack, actions, status }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("nav", {
		className: "beellix-breadcrumbs",
		"aria-label": "当前位置",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onBack,
				children: parent
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				"aria-hidden": "true",
				children: "/"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				"aria-current": "page",
				children: title
			})
		]
	}), (status || actions) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
		className: "beellix-page-toolbar",
		children: [status && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			className: "beellix-object-status",
			children: status
		}), actions && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "beellix-bootstrap__actions",
			children: actions
		})]
	})] });
}
function DetailSection({ title, children, actions, kind = "settings" }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
		className: "beellix-detail-section",
		"aria-label": title,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "beellix-card-title",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConsoleGlyph, { kind }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: title })]
		}), actions && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "beellix-bootstrap__actions",
			children: actions
		})] }), children]
	});
}
function ObjectFacts({ items }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dl", {
		className: "beellix-object-facts",
		children: items.map(([label, value]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: value ?? "未提供" })] }, label))
	});
}
function EmptyState({ title, action }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "beellix-collection-empty",
		role: "status",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: title }), action]
	});
}
function ScenarioDirectory({ items, allItems = items, allCount, busy, filters, onToggle, onManage }) {
	const [selected, setSelected] = react.default.useState("");
	const scene = allItems.find((row) => row.packageName === selected);
	if (selected && !scene) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DetailHeading, {
		kind: "scenarios",
		parent: "已安装场景",
		title: "场景暂不可用",
		onBack: () => setSelected("")
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: "请返回列表刷新。" })] });
	const control = (row) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Switch, {
		label: "启用 " + row.title,
		checked: row.enabled,
		disabled: busy,
		onChange: (enabled) => onToggle(row, enabled)
	});
	if (scene) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DetailHeading, {
			kind: "scenarios",
			parent: "已安装场景",
			title: scene.title,
			onBack: () => setSelected(""),
			status: scene.enabled ? "已启用" : "已停用",
			actions: control(scene)
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DetailSection, {
			kind: "scenarios",
			title: "场景信息",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ObjectFacts, { items: [
				["安装包", scene.packageName],
				["版本", "v" + scene.version],
				["运行模式", "场景模式"],
				["执行组成", "标准模式＋当前场景包"]
			] })
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DetailSection, {
			kind: "plugins",
			title: "安装与版本",
			actions: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				onClick: () => onManage("scenarios"),
				children: "管理安装包"
			})
		})
	] });
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		filters,
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
			className: "beellix-card-grid",
			"aria-label": "已安装场景",
			children: items.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
				className: "beellix-scenario-card",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "beellix-card-title",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConsoleGlyph, {
							kind: "scenarios",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ScenarioIcon, {
								kind: scenarioIconKind(row.packageName),
								size: 24
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: row.title }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: ["v", row.version] })] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "beellix-card-switch",
							children: control(row)
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "beellix-state",
					"data-state": row.enabled ? "enabled" : "disabled",
					children: row.enabled ? "已启用" : "已停用"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					"aria-label": "查看场景 " + row.title,
					onClick: () => setSelected(row.packageName),
					children: "详情"
				})] })]
			}, row.packageName))
		}),
		!busy && !items.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: allCount ? "没有匹配的场景" : "暂无已安装场景" })
	] });
}
const resourceSections = (items) => [
	["knowledge", "知识库"],
	["data", "数据中台"],
	["database", "数据库"],
	...items.some((row) => ![
		"knowledge",
		"data-platform",
		"database"
	].includes(row.id)) ? [["other", "其他扩展"]] : []
];
function ResourceDirectory({ items, busy, selected, onEnable, renderCapability, registerActions }) {
	const matches = (row, id) => id === "knowledge" ? row.id === "knowledge" : id === "data" ? row.id === "data-platform" : id === "database" ? row.id === "database" : ![
		"knowledge",
		"data-platform",
		"database"
	].includes(row.id);
	const rows = items.filter((row) => matches(row, selected));
	const content = (row) => {
		if ([
			"unavailable",
			"available",
			"invalid"
		].includes(row.state)) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: "未安装" });
		if (row.state === "disabled") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
			title: "已停用",
			action: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				disabled: busy,
				onClick: () => onEnable(row),
				children: "启用"
			})
		});
		if (row.state === "failed") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: "加载失败" });
		if (row.state === "pending" || row.connection === "waiting") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: "连接中…" });
		if (row.state === "installing") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: "安装中…" });
		if (row.state !== "enabled") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: "状态暂不可用" });
		if (!row.panel) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: "插件未提供功能界面" });
		return renderCapability?.(row, {
			embedded: true,
			registerActions
		}) ?? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: "功能界面加载中…" });
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: !rows.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: "未安装" }) : rows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
		className: "beellix-resource-surface",
		"aria-label": row.title,
		children: content(row)
	}, row.id)) });
}
//#endregion
//#region packages/platform/community/src/model-catalog.tsx
/** 原控制台外观，目录身份、凭据和操作全部指向原生 DSH。 */
const vendorNames = {
	deepseek: "DeepSeek",
	meta: "Meta",
	radius: "Radius",
	qwen: "Qwen",
	"amazon-bedrock": "Amazon Bedrock",
	"ant-ling": "Ant Ling",
	anthropic: "Anthropic",
	azure: "Azure AI",
	baseten: "Baseten",
	cerebras: "Cerebras",
	cloudflare: "Cloudflare",
	fireworks: "Fireworks AI",
	"github-copilot": "GitHub Copilot",
	google: "Google",
	groq: "Groq",
	huggingface: "Hugging Face",
	moonshot: "Moonshot",
	minimax: "MiniMax",
	mistral: "Mistral",
	nvidia: "NVIDIA",
	openai: "OpenAI",
	opencode: "OpenCode",
	openrouter: "OpenRouter",
	together: "Together AI",
	"vercel-ai-gateway": "Vercel AI Gateway",
	xai: "xAI",
	xiaomi: "Xiaomi",
	zai: "Z.ai"
};
function vendorIdentity(provider) {
	const id = provider.startsWith("deepseek") ? "deepseek" : provider.startsWith("qwen") || provider.startsWith("alibaba") ? "qwen" : provider.startsWith("xiaomi") ? "xiaomi" : provider.startsWith("cloudflare") ? "cloudflare" : provider.startsWith("google") ? "google" : provider.startsWith("minimax") ? "minimax" : provider.startsWith("moonshot") || provider === "kimi-coding" ? "moonshot" : provider.startsWith("openai") ? "openai" : provider.startsWith("opencode") ? "opencode" : provider.startsWith("zai") || provider.startsWith("z-ai") ? "zai" : {
		"cloudflare-workers-ai": "cloudflare",
		"fireworks-ai": "fireworks",
		"together-ai": "together",
		"azure-openai": "azure",
		"x-ai": "xai"
	}[provider] ?? provider;
	return {
		id,
		name: vendorNames[id] ?? provider
	};
}
function NativeModelCatalog({ state, catalog, operations, location, onRefresh, onEnabled, onModelEnabled, t, schema, webSearch, modelSelection }) {
	const [busy, setBusy] = (0, react.useState)(false), [error, setError] = (0, react.useState)(), [saved, setSaved] = (0, react.useState)(false);
	const rows = catalog.items.map((item) => {
		const original = state.rows.find((row) => row.entry.provider === item.provider);
		const nativeRef = item.nativeAuth?.env?.[0];
		const apiKeyEnv = original?.apiKeyEnv ?? nativeRef ?? (item.nativeAuth || item.provider === "deepseek-account" ? void 0 : deriveKeyRef(item.provider));
		const identity = original?.entry.vendor ?? item.vendor ?? vendorIdentity(item.provider);
		return {
			...original,
			apiKeyEnv,
			credential: original?.credential ?? original?.derivedCredential,
			configured: original?.configured ?? false,
			removable: false,
			entry: {
				...original?.entry,
				provider: item.provider,
				displayName: original?.entry.displayName ?? item.displayName ?? item.provider,
				settingsNs: original?.entry.settingsNs ?? item.settingsNs ?? "",
				settingsPath: original?.entry.settingsPath ?? item.settingsPath ?? [],
				active: item.enabled,
				vendor: {
					...identity,
					version: item.version ?? "",
					credentialRef: apiKeyEnv ?? "",
					models: item.models
				}
			}
		};
	});
	const controls = Object.fromEntries(catalog.items.map((item) => [item.provider, {
		canToggle: item.canToggle,
		canModelToggle: item.canModelToggle === true,
		modelsKnown: item.modelsKnown,
		reason: item.controlReason
	}]));
	const run = async (action) => {
		if (busy) return;
		setBusy(true);
		setError(void 0);
		setSaved(false);
		try {
			const result = await action();
			await onRefresh();
			if (result.application === "restart-required") setError("更改已保存，请重启客户端生效。");
			else setSaved(true);
		} catch (e) {
			setError(e instanceof Error ? e.message : "更新失败，请刷新重试。");
			await onRefresh().catch(() => {});
		} finally {
			setBusy(false);
		}
	};
	const toggle = (row, enabled) => {
		const item = catalog.items.find((x) => x.provider === row.entry.provider);
		if (!item?.canToggle) return;
		run(() => onEnabled({
			provider: item.provider,
			entryId: item.entryId,
			enabled,
			expectedEnabled: item.enabled,
			expectedRevision: item.revision
		}));
	};
	const toggleVendor = (family, enabled) => {
		const targets = enabled ? [family.find((row) => row.credential?.configured && controls[row.entry.provider]?.canToggle) ?? family.find((row) => controls[row.entry.provider]?.canToggle)].filter(Boolean) : family.filter((row) => row.entry.active);
		run(async () => {
			let result = { application: "applied" };
			for (const row of targets) {
				const item = catalog.items.find((x) => x.provider === row.entry.provider);
				result = await onEnabled({
					provider: item.provider,
					entryId: item.entryId,
					enabled,
					expectedEnabled: item.enabled
				});
			}
			return result;
		});
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(VendorCatalog, {
		embedded: true,
		rows,
		location,
		nativeControls: controls,
		webSearch,
		renderModelControls: modelSelection ? (row, model) => {
			const selected = modelSelection.selection?.provider === row.entry.provider && modelSelection.selection?.model === model.id;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: VendorCatalog_module_css_default.modelSwitch,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: selected ? "已选用" : "未选用" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Switch, {
					checked: selected,
					label: "将 " + model.name + " 用于" + modelSelection.label,
					disabled: busy || modelSelection.disabled || !selected && (!row.entry.active || model.enabled === false || row.credential?.configured === false),
					onChange: (enabled) => modelSelection.onSelect(enabled ? {
						provider: row.entry.provider,
						model: model.id
					} : null)
				})]
			});
		} : void 0,
		t,
		readOnly: !state.writable,
		saved,
		modelBusy: busy,
		modelError: error,
		onVendorChange: toggleVendor,
		onModelChange: (row, model, enabled) => {
			const item = catalog.items.find((x) => x.provider === row.entry.provider), selected = item?.models.find((x) => x.id === model);
			if (!item?.canModelToggle || !selected || !onModelEnabled) return;
			run(() => onModelEnabled({
				provider: item.provider,
				model,
				enabled,
				expectedEnabled: selected.enabled !== false,
				expectedRevision: item.revision
			}));
		},
		onConnectionChange: toggle,
		editor: (row, close) => {
			const namespace = state.namespaces.get(row.entry.settingsNs);
			if (!namespace) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				role: "status",
				children: "请先启用连接，再配置参数。"
			});
			if (schema && ["llm-deepseek", "llm-pi-ai"].includes(namespace.ns)) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProviderEditor, {
				hideTitle: true,
				provider: row.entry.provider,
				displayName: row.entry.displayName,
				declared: row.entry.declared === true,
				namespace,
				settingsPath: row.entry.settingsPath,
				operations,
				schema,
				t,
				readOnly: !state.writable,
				onClose: async (changed) => {
					if (changed) await onRefresh();
					close?.();
				}
			});
			if (!row.apiKeyEnv) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				role: "status",
				children: "此连接使用 DSH 原生认证，请在客户端模型设置中登录或配置。"
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConnectionEditor$1, {
				row,
				namespace,
				operations,
				t,
				readOnly: !state.writable,
				preserveNativeAuthentication: !state.rows.find((x) => x.entry.provider === row.entry.provider)?.apiKeyEnv,
				onCancel: close,
				onSaving: () => setSaved(false),
				onSaved: async () => {
					await onRefresh();
					setSaved(true);
					close?.();
				}
			}, row.entry.provider);
		}
	});
}
//#endregion
//#region packages/platform/community/src/source-installer.tsx
/** 同一安装表单供插件管理、知识库和数据中台使用；不执行用户粘贴的命令。 */
function SourceInstaller({ api, expectedName, close, onInstalled, embedded = false, onBusyChange }) {
	const [source, setSource] = (0, react.useState)(expectedName ?? ""), [preview, setPreview] = (0, react.useState)(), [busy, setBusy] = (0, react.useState)(false), [error, setError] = (0, react.useState)("");
	const alive = (0, react.useRef)(true);
	(0, react.useEffect)(() => {
		alive.current = true;
		return () => {
			alive.current = false;
		};
	}, []);
	(0, react.useEffect)(() => {
		onBusyChange?.(busy);
	}, [busy, onBusyChange]);
	const check = async (event) => {
		event.preventDefault();
		if (busy || !source.trim()) return;
		setBusy(true);
		setError("");
		setPreview(void 0);
		try {
			const value = await api.mutate("addons/source/preview", {
				source: source.trim(),
				...expectedName ? { expectedName } : {}
			});
			if (alive.current) setPreview(value);
		} catch (e) {
			if (alive.current) setError(e.message);
		} finally {
			if (alive.current) setBusy(false);
		}
	};
	const install = async () => {
		if (busy || !preview) return;
		setBusy(true);
		setError("");
		try {
			const result = await api.mutate("addons/source/install", {
				name: preview.name,
				version: preview.version,
				digest: preview.digest,
				...preview.expectedVersion ? { expectedVersion: preview.expectedVersion } : {}
			});
			if (["failed", "cancelled"].includes(result.application)) throw Error("安装未完成，原环境已保留。");
			if (alive.current) await onInstalled?.(result, preview);
		} catch (e) {
			if (alive.current) setError(e.message);
		} finally {
			if (alive.current) setBusy(false);
		}
	};
	const content = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			className: "beellix-source-form",
			onSubmit: (event) => void check(event),
			"aria-busy": busy,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: ["包名或链接", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
				value: source,
				disabled: busy,
				required: true,
				"data-modal-autofocus": embedded ? "" : void 0,
				maxLength: 500,
				spellCheck: false,
				autoComplete: "off",
				placeholder: "@beellix-ai/插件名 或 npm 链接",
				onChange: (event) => {
					setSource(event.target.value);
					setPreview(void 0);
					setError("");
				}
			})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "submit",
				disabled: busy || !source.trim(),
				children: busy && !preview ? "正在检查…" : "检查安装包"
			})]
		}),
		error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
			role: "alert",
			className: "beellix-market__message",
			children: error
		}),
		preview && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "beellix-source-preview",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ObjectFacts, { items: [
				["插件", preview.title ?? preview.name],
				["安装包", preview.name],
				["版本", "v" + preview.version],
				...preview.expectedVersion ? [["当前版本", "v" + preview.expectedVersion]] : []
			] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				className: "beellix-bootstrap__primary",
				disabled: busy,
				onClick: () => void install(),
				children: busy ? "正在安装…" : preview.expectedVersion ? "确认升级" : "确认安装"
			})]
		})
	] });
	return embedded ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "beellix-source-installer",
		children: content
	}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DetailSection, {
		kind: "plugins",
		title: "npm / pnpm 安装",
		actions: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			disabled: busy,
			onClick: close,
			children: "取消"
		}),
		children: content
	});
}
//#endregion
//#region dev/shared/runtime/plugin-categories.mjs
/** 包的目录分类与运行资源类型分开；未预设的新包类可由清单声明。 */
const labels = {
	scenarios: "场景包",
	tools: "工具包",
	capabilities: "能力包",
	models: "模型包",
	skills: "技能包",
	ui: "界面扩展",
	integrations: "连接包",
	other: "其他插件"
};
function normalizeCatalogCategory(value) {
	if (typeof value === "string" && Object.hasOwn(labels, value)) return {
		id: value,
		label: labels[value]
	};
	if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some((key) => !["id", "label"].includes(key))) return void 0;
	if (!/^[a-z][a-z0-9-]{0,47}$/u.test(value.id ?? "") || value.id === "all" || typeof value.label !== "string" || !value.label.trim() || value.label.trim().length > 24 || /[\p{C}<>]/u.test(value.label)) return void 0;
	return {
		id: value.id,
		label: Object.hasOwn(labels, value.id) ? labels[value.id] : value.label.trim()
	};
}
function rowCatalogCategory(row) {
	const explicit = normalizeCatalogCategory(row.catalogCategory);
	if (explicit) return explicit;
	return normalizeCatalogCategory(row.category === "resources" ? "capabilities" : row.category === "mcp" ? "integrations" : row.category) ?? normalizeCatalogCategory("other");
}
//#endregion
//#region packages/platform/community/src/plugin-classification.mjs
/** 应用目录分类是展示维度，不改变 DSH 资源类型、安装归属或执行权限。 */
/** 已交付版本的使用说明集中维护，不修改业务包或旧安装登记。 */
const introductions = {
	"@beellix-ai/database": {
		summary: "为各场景独立保存业务数据，支持自动备份与恢复。",
		features: [
			"场景与数据库独立存储",
			"本机及第二份备份",
			"恢复到新副本，保留原数据"
		]
	},
	"@beellix-ai/smart-quotation": {
		summary: "整理工程清单、套用报价模板、核算费用并导出报价单。",
		features: [
			"工程清单与项目分组",
			"报价模板与费用参数",
			"报价预览与文件导出"
		]
	},
	"@beellix-ai/dsh-beellix-plugin": {
		summary: "连接 Beelli X 中台，统一管理插件、模型与场景工作区。",
		features: [
			"工作区与场景切换",
			"插件安装与管理",
			"模型配置与归档对话"
		]
	}
};
function pluginIntroduction(row) {
	const value = introductions[row.name];
	return value ? {
		summary: value.summary,
		features: [...value.features]
	} : {
		summary: typeof row.description === "string" ? row.description.trim().slice(0, 500) : "",
		features: []
	};
}
function pluginCategory(row) {
	const { id, label } = rowCatalogCategory(row);
	return [id, label];
}
function pluginDirectory(rows, { query = "", tab = "discover", category = "all" } = {}) {
	const installed = (row) => [
		"enabled",
		"disabled",
		"pending",
		"failed"
	].includes(row.state);
	const scope = rows.filter((row) => tab === "installed" ? installed(row) : tab === "available" ? row.state === "available" || Boolean(row.updateVersion) : true);
	const needle = query.trim().toLocaleLowerCase();
	const matched = scope.filter((row) => [
		row.title,
		row.name,
		pluginIntroduction(row).summary,
		...pluginIntroduction(row).features,
		typeof row.author === "string" ? row.author : row.author?.name,
		pluginCategory(row)[1]
	].filter(Boolean).join(" ").toLocaleLowerCase().includes(needle));
	const counts = /* @__PURE__ */ new Map();
	for (const row of matched) {
		const [id, label] = pluginCategory(row), old = counts.get(id);
		counts.set(id, {
			id,
			label,
			count: (old?.count ?? 0) + 1
		});
	}
	return {
		total: matched.length,
		categories: [...counts.values()],
		rows: matched.filter((row) => category === "all" || pluginCategory(row)[0] === category)
	};
}
//#endregion
//#region packages/platform/community/src/package-manager.tsx
/** 自有插件目录、详情与安装操作；所有写入沿既有中台契约。 */
const tabs = {
	discover: "发现",
	available: "可安装",
	installed: "已安装",
	sources: "来源"
};
const isInstalled = (row) => [
	"enabled",
	"disabled",
	"pending",
	"failed"
].includes(row.state);
function ApplicationManager({ api, close, openPanel, embedded = false }) {
	const [state, setState] = (0, react.useState)(), [busy, setBusy] = (0, react.useState)(false), [error, setError] = (0, react.useState)(""), [notice, setNotice] = (0, react.useState)(""), [query, setQuery] = (0, react.useState)(""), [tab, setTab] = (0, react.useState)("installed"), [removing, setRemoving] = (0, react.useState)(), [selected, setSelected] = (0, react.useState)("");
	const generation = (0, react.useRef)(0), upload = (0, react.useRef)(null);
	const [sourceOpen, setSourceOpen] = (0, react.useState)(false);
	const [category, setCategory] = (0, react.useState)("all");
	const load = async () => {
		const ticket = ++generation.current;
		const next = await api.read("state");
		if (ticket === generation.current) setState(next);
		return next;
	};
	(0, react.useEffect)(() => {
		load().catch((e) => setError(e.message));
		return () => {
			generation.current++;
		};
	}, []);
	const refresh = async () => {
		if (busy) return;
		setBusy(true);
		setError("");
		try {
			await load();
		} catch (e) {
			setError(e.message);
		} finally {
			setBusy(false);
		}
	};
	const run = async (path, input) => {
		if (busy) return;
		setBusy(true);
		setError("");
		setNotice("");
		try {
			const result = await api.mutate(path, input);
			if (result.application === "failed") throw Error("操作未完成，请刷新后重试。");
			await load();
			setRemoving(void 0);
			if (path === "addons/remove") setSelected("");
			if (result.application === "restart-required") setNotice("更改已保存，请重启客户端生效。");
			else setNotice(path === "addons/remove" ? "插件已卸载，业务数据和安装包已保留。" : "已完成");
			if (result.items?.some((item) => item.application === "failed")) setError("部分应用接入失败，请刷新后重试。");
		} catch (e) {
			setError(e.message);
		} finally {
			setBusy(false);
		}
	};
	const importFile = async (file) => {
		if (!file || busy) return;
		setError("");
		setNotice("");
		if (!file.name.endsWith(".tgz") || file.size > 64 * 1024 * 1024) {
			setError("请选择不超过64 MiB的 .tgz 安装包。");
			return;
		}
		setBusy(true);
		try {
			const value = await api.importArchive(file);
			await load();
			setQuery(value.name);
			setCategory("all");
			setTab("discover");
			setSelected("");
			setNotice("安装包已导入，确认版本后安装。");
		} catch (e) {
			setError(e.message);
		} finally {
			setBusy(false);
			if (upload.current) upload.current.value = "";
		}
	};
	const checkUpdates = async () => {
		if (busy) return;
		setBusy(true);
		setError("");
		setNotice("");
		try {
			if ((await load()).updates?.status === "not-launched") {
				setNotice("更新服务尚未上线");
				return;
			}
			await api.mutate("updates/check", {});
			const count = ((await load()).applications ?? []).filter((row) => row.onlineUpdate?.state === "available" || row.onlineUpdate?.state === "manual").length;
			setNotice(count ? `发现 ${count} 个可更新插件` : "检查完成，未发现可安装的新版");
		} catch (e) {
			setError(e.message);
			try {
				await load();
			} catch {}
		} finally {
			setBusy(false);
		}
	};
	const all = state?.applications ?? state?.capabilities ?? [], item = all.find((row) => row.id === selected);
	const directory = pluginDirectory(all, {
		query,
		tab,
		category
	}), rows = directory.rows;
	const updateLabels = {
		current: "已是最新",
		manual: "导入更新包",
		stale: "重新检查",
		"not-launched": "检查更新",
		"not-published": "未提供更新",
		conflict: "同版包不一致",
		incompatible: "中台版本不兼容",
		"migration-required": "需要数据迁移",
		unverified: "需核对安装包"
	};
	const onlineAction = (row, detail) => {
		const update = row.onlineUpdate;
		if (!update || !isInstalled(row)) return null;
		if (update.state === "available") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			className: ModelsSection_module_css_default.secondaryButton,
			disabled: busy || row.state === "pending",
			"aria-label": detail ? void 0 : "更新 " + row.title,
			onClick: () => detail ? void run("updates/install", update.confirmation) : setSelected(row.id),
			children: detail ? "确认更新至 v" + update.version : "更新"
		});
		if (update.state === "manual") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			className: ModelsSection_module_css_default.secondaryButton,
			disabled: busy || !api.importArchive,
			onClick: () => upload.current?.click(),
			children: "导入更新包"
		});
		const canCheck = ["stale", "not-launched"].includes(update.state);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			className: ModelsSection_module_css_default.secondaryButton,
			disabled: busy || !canCheck,
			"aria-label": canCheck ? "检查 " + row.title + " 更新" : void 0,
			onClick: () => void checkUpdates(),
			children: updateLabels[update.state] ?? "检查更新"
		});
	};
	const actions = (row, detail = false) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		detail && ["enabled", "disabled"].includes(row.state) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			className: "beellix-object-status",
			children: "启用插件"
		}),
		["enabled", "disabled"].includes(row.state) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Switch, {
			label: "启用 " + row.title,
			checked: row.enabled ?? row.state === "enabled",
			disabled: busy,
			onChange: (enabled) => {
				run("addons/enabled", {
					id: row.id,
					enabled,
					expectedVersion: row.version,
					expectedEnabled: row.enabled ?? row.state === "enabled"
				});
			}
		}),
		(row.configPanel || row.panel) && row.state === "enabled" && openPanel && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			className: ModelsSection_module_css_default.secondaryButton,
			disabled: busy || row.connection === "waiting",
			onClick: () => openPanel(row.configPanel ?? row.panel, {
				capabilityId: row.id,
				title: row.title,
				view: row.configPanel ? "settings" : "main"
			}),
			children: "配置"
		}),
		row.onlineUpdate?.state === "available" ? onlineAction(row, detail) : row.updateVersion ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			className: ModelsSection_module_css_default.secondaryButton,
			disabled: busy,
			onClick: () => void run("addons/install", {
				id: row.id,
				digest: row.digest,
				expectedVersion: row.version
			}),
			children: row.updateKind === "rebuild" ? "更新安装包" : "升级至 " + row.updateVersion
		}) : row.state === "available" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			className: ModelsSection_module_css_default.primaryButton,
			disabled: busy,
			onClick: () => void run("addons/install", {
				id: row.id,
				digest: row.digest
			}),
			children: "安装"
		}) : row.state === "pending" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			className: ModelsSection_module_css_default.secondaryButton,
			disabled: busy,
			onClick: () => void run("addons/reconnect", {}),
			children: "重新接入"
		}) : onlineAction(row, detail)
	] });
	const goBack = () => {
		setSelected("");
		setRemoving(void 0);
	};
	const content = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "beellix-market",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
				className: "beellix-page-toolbar",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTabs, {
					buttons: true,
					label: "插件市场页面",
					items: Object.entries(tabs),
					active: tab,
					onChange: (id) => {
						setTab(id);
						setCategory("all");
						goBack();
					}
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "beellix-bootstrap__actions beellix-market__actions",
					children: [
						!sourceOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: ModelsSection_module_css_default.secondaryButton,
							disabled: busy,
							onClick: () => setSourceOpen(true),
							children: "npm / pnpm 安装"
						}),
						api.importArchive && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							ref: upload,
							type: "file",
							accept: ".tgz",
							hidden: true,
							"aria-label": "选择 Beelli X 安装包",
							onChange: (event) => void importFile(event.target.files?.[0])
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: ModelsSection_module_css_default.secondaryButton,
							disabled: busy,
							onClick: () => upload.current?.click(),
							children: "导入安装包"
						})] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							className: ModelsSection_module_css_default.secondaryButton,
							disabled: busy,
							onClick: () => void (state?.updates ? checkUpdates() : refresh()),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRefreshOutline16, {}), busy && state?.updates ? "处理中…" : state?.updates ? "检查更新" : "刷新"]
						})
					]
				})]
			}),
			sourceOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SourceInstaller, {
				api,
				close: () => setSourceOpen(false),
				onInstalled: async (result) => {
					await load();
					setSourceOpen(false);
					setTab("installed");
					setQuery("");
					goBack();
					setNotice(result.application === "restart-required" ? "安装已保存，请重启客户端生效。" : "已安装");
				}
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(OperationFeedback, {
				error: error || state?.addonError,
				notice,
				onErrorDone: () => setError(""),
				onNoticeDone: () => setNotice("")
			}),
			tab === "sources" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(DetailSection, {
				title: "Beelli X 本地交付",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "beellix-market__description",
					children: "导入已交付的 .tgz 安装包。"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
					className: "beellix-package-technical",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: "目录位置" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ObjectFacts, { items: [["清单", "config/install-catalog.json"], ["安装包", "environment/packages"]] })]
				})]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DetailSection, {
				title: "npm / pnpm",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ObjectFacts, { items: [["包源", "registry.npmjs.org"], ["安装目录", "Beellix/environment"]] })
			})] }) : selected ? item ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DetailHeading, {
					parent: tabs[tab],
					title: item.title ?? item.name,
					onBack: goBack,
					status: applicationStates[item.state]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(DetailSection, {
					kind: "plugins",
					title: "插件信息",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ObjectFacts, { items: [["安装包", item.name], ["版本", item.version ? "v" + item.version : "未提供"]] }),
						pluginIntroduction(item).summary && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "beellix-market__description",
							children: pluginIntroduction(item).summary
						}),
						pluginIntroduction(item).features.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: "beellix-plugin-features",
							children: pluginIntroduction(item).features.map((text) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: text }, text))
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(DetailSection, {
					kind: "settings",
					title: "安装与版本",
					actions: actions(item, true),
					children: [
						item.onlineUpdate?.version && item.onlineUpdate.version !== item.version && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
							className: "beellix-market__description",
							children: [
								item.version,
								" → ",
								item.onlineUpdate.version
							]
						}),
						item.onlineUpdate?.notes && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "beellix-market__description",
							children: item.onlineUpdate.notes
						}),
						item.updateVersion && !item.onlineUpdate?.version && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "beellix-market__description",
							children: item.updateKind === "rebuild" ? "已导入新的安装包" : "可升级至 v" + item.updateVersion
						}),
						item.packageError && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "alert",
							children: item.packageError
						}),
						item.state === "unavailable" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "beellix-market__description",
							children: "安装包待提供，可从上方导入。"
						})
					]
				}),
				isInstalled(item) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(DetailSection, {
					title: "卸载插件",
					actions: !removing && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						className: ModelsSection_module_css_default.secondaryButton,
						disabled: busy,
						onClick: () => setRemoving(item),
						children: "卸载"
					}),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "beellix-market__description",
						children: "保留业务数据和安装包。"
					}), removing?.id === item.id && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "beellix-market__confirmation",
						role: "group",
						"aria-label": "卸载 " + item.title,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
							"卸载 ",
							item.title,
							"？"
						] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "beellix-market__actions",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: ModelsSection_module_css_default.secondaryButton,
								disabled: busy,
								onClick: () => setRemoving(void 0),
								children: "取消"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: ModelsSection_module_css_default.primaryButton,
								disabled: busy,
								onClick: () => void run("addons/remove", {
									id: item.id,
									expectedVersion: item.version,
									expectedEnabled: item.enabled ?? item.state === "enabled"
								}),
								children: "确认卸载"
							})]
						})]
					})]
				})
			] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DetailHeading, {
				parent: tabs[tab],
				title: "插件已不可用",
				onBack: goBack
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: "请返回列表刷新。" })] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "beellix-market__search",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutlineRegular, { size: 20 }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "beellix-market__sr",
							children: "搜索插件"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "beellix-market__search-input",
							type: "search",
							"aria-label": "搜索插件",
							placeholder: "按插件、作者或能力搜索",
							value: query,
							onChange: (event) => {
								setQuery(event.target.value);
								setCategory("all");
							}
						})
					] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						"aria-live": "polite",
						children: state ? `${rows.length.toLocaleString()} 个插件` : "读取中…"
					})]
				}),
				state && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
					className: "beellix-market__categories",
					"aria-label": "插件分类",
					children: [{
						id: "all",
						label: "全部",
						count: directory.total
					}, ...directory.categories].map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						className: "beellix-market__category-filter",
						type: "button",
						"aria-label": `${item.label} ${item.count}`,
						"aria-pressed": category === item.id,
						onClick: () => setCategory(item.id),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: item.label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "beellix-market__count",
							"aria-hidden": "true",
							children: item.count.toLocaleString()
						})]
					}, item.id))
				}),
				!state ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					role: "status",
					children: "读取中…"
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "beellix-market__grid beellix-card-grid",
					"data-view": tab,
					children: rows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
						className: "beellix-market__card",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "beellix-market__identity",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "beellix-market__icon",
										children: row.category === "scenarios" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ScenarioIcon, {
											kind: scenarioIconKind(row.name),
											size: 22
										}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconDataOutline16, {})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: row.title ?? row.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: row.name })] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "beellix-market__version",
										children: row.version ? "v" + row.version : ""
									})
								]
							}),
							pluginIntroduction(row).summary && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "beellix-market__description",
								children: pluginIntroduction(row).summary
							}),
							row.packageError && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								role: "status",
								className: "beellix-market__description",
								children: row.packageError
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "beellix-market__meta",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "beellix-market__category",
									children: pluginCategory(row)[1]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									"data-state": row.state,
									children: applicationStates[row.state] ?? "状态未提供"
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "beellix-market__actions",
								children: [actions(row), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: ModelsSection_module_css_default.secondaryButton,
									"aria-label": "查看插件 " + (row.title ?? row.name),
									onClick: () => setSelected(row.id),
									children: "详情"
								})]
							})] })
						]
					}, row.id))
				}),
				state && !rows.length && !state.addonError && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					role: "status",
					className: "beellix-market__empty",
					children: tab === "installed" ? "暂无已安装插件" : tab === "available" ? "暂无可安装插件" : "暂无匹配插件"
				})
			] })
		]
	});
	return embedded ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "beellix-bootstrap",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "beellix-bootstrap__page beellix-console",
			role: "region",
			"aria-label": "插件管理",
			children: content
		})
	}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Modal$2, {
		open: true,
		title: "Beelli X 插件市场",
		closeLabel: "关闭",
		className: "beellix-console__manager",
		contentClassName: "beellix-market-content",
		onClose: () => {
			if (!busy) close();
		},
		children: content
	});
}
//#endregion
//#region packages/platform/community/src/resource-installer.tsx
/** 两种安装方式共用目标、校验与完成回调；业务功能仍由实际插件提供。 */
function ResourceInstaller({ api, target, offered, onClose, onInstalled }) {
	const [method, setMethod] = (0, react.useState)("local"), [busy, setBusy] = (0, react.useState)(false), [error, setError] = (0, react.useState)("");
	const [preview, setPreview] = (0, react.useState)(offered?.state === "available" ? offered : void 0);
	const generation = (0, react.useRef)(0);
	const readFile = async (file) => {
		if (!file || busy) return;
		setError("");
		setPreview(void 0);
		if (!file.name.endsWith(".tgz") || file.size > 64 * 1024 * 1024) {
			setError("请选择不超过64 MiB的 .tgz 安装包。");
			return;
		}
		const ticket = ++generation.current;
		setBusy(true);
		try {
			const value = await api.importArchive(file, { expectedName: target.name });
			if (value.name !== target.name || value.id !== target.id || !/^[a-f0-9]{64}$/u.test(value.digest ?? "")) throw Error("安装包与所选插件不一致。");
			const state = await api.read("state"), owned = (state.applications ?? state.capabilities ?? []).find((row) => row.name === target.name && [
				"enabled",
				"disabled",
				"pending",
				"failed"
			].includes(row.state));
			if (ticket === generation.current) setPreview({
				...value,
				...owned ? { expectedVersion: owned.version } : {}
			});
		} catch (e) {
			if (ticket === generation.current) setError(e.message);
		} finally {
			if (ticket === generation.current) setBusy(false);
		}
	};
	const install = async () => {
		if (busy || !preview) return;
		setBusy(true);
		setError("");
		try {
			const result = await api.mutate("addons/install", {
				id: target.id,
				digest: preview.digest,
				...preview.expectedVersion ? { expectedVersion: preview.expectedVersion } : {}
			});
			if (["failed", "cancelled"].includes(result.application)) throw Error("安装未完成，原环境已保留。");
			await onInstalled(result, target.id);
		} catch (e) {
			setError(e.message);
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Modal$2, {
		open: true,
		title: "安装" + target.title,
		closeLabel: "关闭",
		className: "beellix-resource-installer beellix-console",
		contentClassName: "beellix-resource-installer__content",
		onClose: () => {
			if (!busy) {
				generation.current++;
				onClose();
			}
		},
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTabs, {
			buttons: true,
			label: "安装方式",
			items: [["local", "本地安装包"], ["npm", "pnpm 安装"]],
			active: method,
			disabled: busy,
			onChange: (id) => {
				setMethod(id);
				setError("");
			}
		}), method === "npm" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SourceInstaller, {
			embedded: true,
			api,
			expectedName: target.name,
			onBusyChange: setBusy,
			onInstalled: (result) => onInstalled(result, target.id)
		}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "beellix-resource-installer__local",
			"aria-busy": busy,
			children: [
				api.importArchive && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
					className: "beellix-resource-installer__file",
					children: ["选择安装包", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "file",
						accept: ".tgz",
						disabled: busy,
						onChange: (event) => {
							const file = event.target.files?.[0];
							event.target.value = "";
							readFile(file);
						}
					})]
				}),
				!api.importArchive && !preview && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					role: "status",
					children: "当前连接不支持本地包导入。"
				}),
				error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "beellix-market__message",
					children: error
				}),
				preview && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ObjectFacts, { items: [["插件", target.title], ["版本", "v" + preview.version]] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					className: "beellix-bootstrap__primary",
					disabled: busy,
					onClick: () => void install(),
					children: busy ? "正在安装…" : "确认安装"
				})] })
			]
		})]
	});
}
//#endregion
//#region packages/platform/community/src/plugin-model-connections.tsx
const key = (row) => row.id + ":" + row.purpose.id;
const title = (row) => row.title + " · " + row.purpose.title;
const chat = (row) => !row.purpose.operation || row.purpose.operation === "chat";
const inheritsMain = (row) => row.models?.purposes?.find((purpose) => purpose.id === row.purpose.id)?.default === "host-main";
const configured = (row) => chat(row) ? !!row.purpose.selection || inheritsMain(row) : row.purpose.configured;
const active = (row) => row.enabled && configured(row) && row.purpose.enabled !== false;
const status$1 = (row) => !row.enabled ? "插件已停用" : !configured(row) ? "未配置" : row.purpose.enabled === false ? "已停用" : "已启用";
const localQwen = /* @__PURE__ */ new Set(["qwen3-embedding:0.6b", "qwen3-embedding:4b"]);
function PluginModelConnections({ items, groups = [], busy, onSave, onConfigure, onCatalog }) {
	const [query, setQuery] = (0, react.useState)(""), [filter, setFilter] = (0, react.useState)("all"), [detail, setDetail] = (0, react.useState)("");
	const needle = query.trim().toLocaleLowerCase();
	const model = (row) => chat(row) ? row.purpose.selection?.model ?? (inheritsMain(row) ? "沿用主模型" : "未选择模型") : row.purpose.connection?.model;
	const provider = (row) => groups.find((group) => group.id === row.purpose.selection?.provider)?.name ?? row.purpose.selection?.provider;
	const rows = items.filter((row) => (filter === "all" || filter === "enabled" === !!active(row)) && [
		row.title,
		row.purpose.title,
		model(row),
		provider(row),
		row.purpose.connection?.endpoint
	].some((value) => value?.toLocaleLowerCase().includes(needle)));
	const selected = items.find((row) => key(row) === detail);
	const configure = (row) => chat(row) ? onCatalog?.(row) : onConfigure(row.purpose.configurationPanel, {
		capabilityId: row.id.split("/").at(-1),
		title: row.title,
		view: "model:" + row.purpose.id
	});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: VendorCatalog_module_css_default.catalog,
		"data-model-page": "plugin-connections",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: VendorCatalog_module_css_default.toolbar,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "搜索厂商或模型" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					type: "search",
					value: query,
					onChange: (e) => setQuery(e.target.value)
				})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
					className: VendorCatalog_module_css_default.statusFilter,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "状态" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
						"aria-label": "状态",
						value: filter,
						onChange: (e) => setFilter(e.target.value),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "all",
								children: "全部"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "enabled",
								children: "已启用"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "disabled",
								children: "未启用"
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
				className: VendorCatalog_module_css_default.resultCount,
				children: [
					rows.length,
					" / ",
					items.length
				]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: VendorCatalog_module_css_default.grid,
				children: rows.map((row) => {
					const name = title(row), purpose = row.purpose, connection = purpose.connection;
					const reason = !row.enabled ? "请先启用插件" : !purpose.configured ? "请先配置模型" : !purpose.canToggle ? "此插件尚未提供模型启停" : void 0;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CatalogVendorCard, {
						label: name,
						title: name,
						identity: connection?.kind === "local" && localQwen.has(connection.model) ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Mark, { id: "qwen" }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: VendorCatalog_module_css_default.mark,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConsoleIcon, { kind: "resources" })
						}),
						actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: VendorCatalog_module_css_default.headerActions,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "配置 " + name,
								disabled: busy || !row.enabled || (chat(row) ? !onCatalog : !onConfigure || !purpose.configurationPanel),
								onClick: () => configure(row),
								children: "配置"
							}), !chat(row) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Switch, {
								label: "启用 " + name,
								checked: !!active(row),
								disabled: busy || !!reason,
								title: reason,
								onChange: (enabled) => onSave({
									pluginId: row.id,
									purposeId: purpose.id,
									enabled,
									expectedRevision: row.revision
								})
							})]
						}),
						summary: chat(row) ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "beellix-plugin-model-id",
							children: model(row)
						}), provider(row) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							children: "·"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: provider(row) })] })] }) : connection ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "beellix-plugin-model-id",
								children: connection.model
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								children: "·"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: connection.kind === "local" ? "本地运行" : "API" })
						] }) : purpose.operation === "embedding" ? "本地模型或 API" : "API 服务",
						status: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: VendorCatalog_module_css_default.status,
							"data-active": !!active(row),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { "aria-hidden": "true" }), status$1(row)]
						}),
						version: row.version,
						details: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: NavigationLink_module_css_default.link,
							"aria-label": "查看详情 " + name,
							onClick: () => setDetail(key(row)),
							children: "查看详情"
						})
					}, key(row));
				})
			}),
			!rows.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: VendorCatalog_module_css_default.empty,
				children: "没有匹配的模型"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Modal$2, {
				open: !!selected,
				title: selected ? title(selected) : "模型详情",
				closeLabel: "关闭",
				onClose: () => setDetail(""),
				className: "beellix-plugin-model-details",
				children: selected && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
					className: VendorCatalog_module_css_default.facts,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "插件" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: selected.title })] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "用途" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: selected.purpose.title })] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "状态" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: status$1(selected) })] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "模型" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: model(selected) ?? "未配置" })] }),
						selected.purpose.connection && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "运行方式" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: selected.purpose.connection.kind === "local" ? "本地运行" : "API" })] }),
						selected.purpose.connection?.endpoint && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "API 地址" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: selected.purpose.connection.endpoint })] })
					]
				})
			})
		]
	});
}
//#endregion
//#region packages/platform/community/src/model-center.tsx
function PluginModelConfiguration({ state, busy, onSave, renderModels, onConfigure, onCatalogChange }) {
	const [pluginId, setPluginId] = (0, react.useState)(""), [target, setTarget] = (0, react.useState)("");
	const plugins = (state?.plugins ?? []).filter((plugin) => plugin.purposes?.length);
	const plugin = plugins.find((item) => item.id === pluginId) ?? plugins[0], active = plugin?.id;
	const rows = (plugin?.purposes ?? []).map((purpose) => ({
		...plugin,
		purpose
	}));
	const row = rows.find((item) => item.id + ":" + item.purpose.id === target);
	const nativeCatalog = !!row && (!row.purpose.operation || row.purpose.operation === "chat");
	(0, react.useEffect)(() => {
		onCatalogChange?.(nativeCatalog);
	}, [nativeCatalog, onCatalogChange]);
	if (!state) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
		role: "status",
		className: "beellix-console__empty",
		children: "读取中…"
	});
	if (!plugins.length) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
		role: "status",
		className: "beellix-console__empty",
		children: "暂无需要配置的插件模型"
	});
	const key = row ? row.id + ":" + row.purpose.id : "";
	const save = (selection) => onSave({
		pluginId: row.id,
		purposeId: row.purpose.id,
		selection,
		expectedRevision: row.revision
	});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
		"aria-label": "插件模型配置",
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "beellix-plugin-model-toolbar",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTabs, {
				label: "插件模型分组",
				buttons: true,
				disabled: busy,
				items: plugins.map((item) => [item.id, item.title]),
				active,
				onChange: (id) => {
					setPluginId(id);
					setTarget("");
				}
			})
		}), nativeCatalog ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "beellix-plugin-model-toolbar",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					onClick: () => setTarget(""),
					children: "返回插件模型"
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: row.purpose.title }),
				row.purpose.selection && !state.groups?.some((group) => group.id === row.purpose.selection.provider && group.models.some((model) => model.id === row.purpose.selection.model)) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					disabled: busy || !row.enabled,
					onClick: () => save(null),
					children: "清除选择"
				})
			]
		}), renderModels?.({
			key,
			modalities: row.purpose.inputModalities ?? [],
			selection: row.purpose.selection,
			label: row.purpose.title,
			disabled: busy || !row.enabled,
			onSelect: save
		})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PluginModelConnections, {
			items: rows,
			groups: state.groups ?? [],
			busy,
			onSave,
			onConfigure,
			onCatalog: (item) => setTarget(item.id + ":" + item.purpose.id)
		}, active)]
	});
}
const dash = (data) => data?.message ?? "暂无官方数据";
const amount = (value) => typeof value === "string" || typeof value === "number" ? String(value) : "—";
function OfficialModelAccounts({ state }) {
	const [selected, setSelected] = (0, react.useState)("");
	if (!state) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
		role: "status",
		className: "beellix-console__empty",
		children: "读取中…"
	});
	if (!state.items.length) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
		className: "beellix-console__empty",
		children: "请先配置模型连接"
	});
	const account = state.items.find((row) => row.provider === selected) ?? state.items[0];
	const prices = account.prices?.status === "ready" ? account.prices.value.items : [];
	const models = account.models?.status === "ready" ? account.models.value : [];
	const names = new Map(models.map((model) => [model.id, model.name ?? model.id]));
	const rows = prices.length ? prices : models.map((model) => ({ model: model.id }));
	const balances = account.balance?.status === "ready" ? account.balance.value : [];
	const price = (row, key) => row[key] !== void 0 ? `${row.currency} ${row[key]}` : "—";
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
		className: "beellix-model-accounts",
		"aria-label": "已配置模型用量与余额",
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "beellix-account-toolbar",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "beellix-model-name",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Mark, { id: vendorIdentity(account.provider).id }), state.items.length > 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
						"aria-label": "模型服务",
						value: account.provider,
						onChange: (event) => setSelected(event.target.value),
						children: state.items.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: row.provider,
							children: row.name
						}, row.provider))
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: account.name })]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: "beellix-account-links",
					children: [account.prices?.source && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
						href: account.prices.source,
						target: "_blank",
						rel: "noreferrer",
						title: account.prices.value?.rule ?? dash(account.prices),
						children: "官方价格 ↗"
					}), account.usage?.source && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
						href: account.usage.source,
						target: "_blank",
						rel: "noreferrer",
						children: "官方账单 ↗"
					})]
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
				className: "beellix-account-summary",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					title: account.balance?.status === "ready" ? "当前连接所属账户余额" : dash(account.balance),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dt", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConsoleIcon, { kind: "balance" }), "余额"] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: balances.length ? balances.map((balance) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
						balance.currency,
						" ",
						balance.total_balance
					] }, balance.currency)) : "—" })]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					title: dash(account.usage),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dt", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConsoleIcon, { kind: "usage" }), "用量"] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: account.usage?.status === "ready" ? amount(account.usage.value?.totalTokens) : "—" })]
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "beellix-account-table-label",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "模型与价格" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", {
					title: account.checkedAt ? new Date(account.checkedAt).toLocaleString() : void 0,
					children: "单价 / 百万 Token"
				})]
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "beellix-model-table",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
					"aria-label": "模型用量与价格",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "模型" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "计费时段" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "输入价格" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "输出价格" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "缓存价格" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "用量" })
					] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tbody", { children: [rows.map((row, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							title: row.model,
							children: names.get(row.model) ?? row.model
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							title: account.prices.value?.rule ?? dash(account.prices),
							children: row.period ?? "—"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							title: dash(account.prices),
							children: price(row, "input")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							title: dash(account.prices),
							children: price(row, "output")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							title: dash(account.prices),
							children: price(row, "cacheRead")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							title: dash(account.usage),
							children: "—"
						})
					] }, row.model + ":" + (row.period ?? index))), !rows.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
						colSpan: 6,
						className: "beellix-model-no-data",
						title: dash(account.models),
						children: "暂无可用数据"
					}) })] })]
				})
			})
		]
	});
}
//#endregion
//#region packages/platform/community/src/archived-sessions.tsx
/** 沿旧版 ArchiveList 的恢复、选择及确认清理流程；原存储由 DSH 和归档适配器承载。 */
function ArchivedConversations({ api, restore }) {
	const [state, setState] = (0, react.useState)(), [query, setQuery] = (0, react.useState)(""), [location, setLocation] = (0, react.useState)("*"), [selected, setSelected] = (0, react.useState)([]), [scope, setScope] = (0, react.useState)("all");
	const [busy, setBusy] = (0, react.useState)(false), [error, setError] = (0, react.useState)(""), [confirmation, setConfirmation] = (0, react.useState)(), [deleteError, setDeleteError] = (0, react.useState)("");
	const generation = (0, react.useRef)(0);
	const load = async () => {
		const ticket = ++generation.current;
		setBusy(true);
		setError("");
		try {
			const value = await api.read("archives");
			if (ticket === generation.current) setState(value);
		} catch (e) {
			if (ticket === generation.current) setError(e.message);
		} finally {
			if (ticket === generation.current) setBusy(false);
		}
	};
	(0, react.useEffect)(() => {
		load();
		return () => {
			generation.current++;
		};
	}, []);
	const scoped = (state?.items ?? []).filter((row) => scope === "all" || (scope === "scene" ? Boolean(row.sceneId) : !row.sceneId));
	const locations = [...new Set(scoped.map((row) => row.location))];
	const rows = scoped.filter((row) => (location === "*" || row.location === location) && `${row.title} ${row.location}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
	const visible = new Set(rows.map((row) => row.id)), selection = selected.filter((id) => visible.has(id));
	const requestClear = (ids) => {
		setDeleteError("");
		setConfirmation({
			ids,
			revision: state.revision
		});
	};
	const clear = async () => {
		if (busy || !confirmation) return;
		setBusy(true);
		setDeleteError("");
		try {
			await api.mutate("archives/clear", {
				sessionIds: confirmation.ids,
				expectedRevision: confirmation.revision
			});
			setSelected((previous) => previous.filter((id) => !confirmation.ids.includes(id)));
			setConfirmation(void 0);
			await load();
		} catch (e) {
			setDeleteError(e.message);
		} finally {
			setBusy(false);
		}
	};
	const recover = async (id) => {
		if (busy) return;
		setBusy(true);
		setError("");
		try {
			await restore(id);
			setSelected((previous) => previous.filter((value) => value !== id));
			await load();
		} catch (e) {
			setError(e.message);
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "beellix-bootstrap",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "beellix-bootstrap__page beellix-console",
			"aria-busy": busy,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: "beellix-page-toolbar",
					"aria-label": "归档操作",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTabs, {
						buttons: true,
						label: "归档对话分类",
						items: [
							["all", "全部对话"],
							["workspace", "工作区对话"],
							["scene", "场景对话"]
						],
						active: scope,
						disabled: busy || Boolean(confirmation),
						onChange: (id) => {
							setScope(id);
							setLocation("*");
							setSelected([]);
						}
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "beellix-bootstrap__actions",
						children: [selection.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							disabled: busy,
							onClick: () => requestClear(selection),
							children: [
								"清理所选（",
								selection.length,
								"）"
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							disabled: busy,
							onClick: () => void load(),
							children: "刷新"
						})]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(OperationFeedback, {
					error,
					onErrorDone: () => setError("")
				}),
				!state ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					role: "status",
					className: "beellix-console__empty",
					children: busy ? "读取中…" : "请刷新重试"
				}) : !state.items.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "beellix-console__empty",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConsoleIcon, {
						kind: "archives",
						size: 26
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "暂无已归档对话" })]
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "beellix-archive-toolbar",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "search",
						"aria-label": "搜索归档对话",
						placeholder: "搜索对话",
						value: query,
						disabled: busy,
						onChange: (e) => {
							setQuery(e.target.value);
							setSelected([]);
						}
					}), locations.length > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
						"aria-label": "对话归属",
						value: location,
						disabled: busy,
						onChange: (e) => {
							setLocation(e.target.value);
							setSelected([]);
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: "*",
							children: "全部位置"
						}), locations.map((value) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value,
							children: value
						}, value))]
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "beellix-model-table",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
						"aria-label": "已归档对话列表",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								"aria-label": "全选归档对话",
								disabled: busy || !rows.length || rows.length > 1e3,
								checked: !!rows.length && selection.length === rows.length,
								onChange: (e) => setSelected(e.target.checked ? rows.map((row) => row.id) : [])
							}) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "对话" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "归属" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "更新时间" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { "aria-label": "操作" })
						] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tbody", { children: [rows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								"aria-label": "选择 " + row.title,
								checked: selection.includes(row.id),
								disabled: busy || !selection.includes(row.id) && selection.length >= 1e3,
								onChange: (e) => setSelected(e.target.checked ? [...selection, row.id] : selection.filter((id) => id !== row.id))
							}) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "beellix-model-name",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConsoleIcon, {
									kind: row.sceneId ? "scenarios" : "chat",
									size: 16
								}), row.title]
							}) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: row.location }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "—" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", {
								className: "beellix-archive-row-actions",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									disabled: busy || !row.recoverable,
									"aria-label": "恢复 " + row.title,
									title: !row.recoverable ? "原对话暂不可读取" : void 0,
									onClick: () => void recover(row.id),
									children: "恢复"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									disabled: busy,
									"aria-label": "清理 " + row.title,
									onClick: () => requestClear([row.id]),
									children: "清理"
								})]
							})
						] }, row.id)), !rows.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							colSpan: 5,
							className: "beellix-model-no-data",
							children: "没有匹配的对话"
						}) })] })]
					})
				})] }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
					open: !!confirmation,
					title: `清理这 ${confirmation?.ids.length ?? 0} 条归档对话？`,
					closeLabel: "关闭",
					onClose: () => {
						if (!busy) setConfirmation(void 0);
					},
					footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "beellix-bootstrap__actions",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							disabled: busy,
							onClick: () => setConfirmation(void 0),
							children: "取消"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							disabled: busy,
							onClick: () => void clear(),
							children: busy ? "清理中…" : "确认清理"
						})]
					}),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "从 Beelli X 归档清单移除，保留会话文件和场景资料。" }), deleteError && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						children: deleteError
					})]
				})
			]
		})
	});
}
//#endregion
//#region packages/platform/community/src/integration-page.tsx
const date = (value) => value ? new Date(value).toLocaleString() : "";
const status = (row) => !row.enabled ? "已停用" : row.status !== "ready" ? "待检查" : row.expired ? "已到期" : !row.available ? "插件未就绪" : "已启用";
const operations = {
	"grant.create": "新建连接",
	"grant.change": "更改启用状态",
	"grant.update": "更改权限与映射",
	"inventory.catalog": "读取商品",
	"inventory.createDraft": "创建销售草稿",
	"inventory.orderStatus": "查询订单状态",
	"inventory.paymentSummary": "查询回款汇总",
	"crm.customer": "读取客户资料"
};
/** All selection queries are bounded and go through the central owner API. */
function RecordPicker({ api, contractId, side, accountId, collection, label, value, multiple = false, onChange, disabled = false }) {
	const [query, Q] = (0, react.useState)(""), [page, P] = (0, react.useState)(0), [result, S] = (0, react.useState)(), [loading, B] = (0, react.useState)(false), [error, E] = (0, react.useState)(""), [open, O] = (0, react.useState)(false), [names, N] = (0, react.useState)({});
	const ids = multiple ? value ?? [] : value === void 0 || value === "" ? [] : [value], key = JSON.stringify(ids), identity = [
		contractId,
		side,
		accountId,
		collection
	].join(":");
	const generation = (0, react.useRef)(0), root = (0, react.useRef)(null), list = (0, react.useRef)(null), [refresh, Refresh] = (0, react.useState)(0);
	(0, react.useLayoutEffect)(() => {
		if (!open || !list.current) return;
		const node = list.current, rect = root.current.getBoundingClientRect();
		node.style.width = Math.min(Math.max(rect.width, 280), window.innerWidth - 32) + "px";
		node.style.left = Math.max(16, Math.min(rect.left, window.innerWidth - parseFloat(node.style.width) - 16)) + "px";
		node.style.top = Math.min(rect.bottom + 6, Math.max(16, window.innerHeight - 350)) + "px";
		node.showPopover?.();
		node.querySelector("input")?.focus();
		return () => {
			try {
				node.hidePopover?.();
			} catch {}
		};
	}, [open]);
	(0, react.useEffect)(() => {
		P(0);
		Q("");
		S(void 0);
		N({});
		O(false);
	}, [identity]);
	(0, react.useEffect)(() => {
		const close = (e) => {
			if (!root.current?.contains(e.target)) O(false);
		};
		document.addEventListener("pointerdown", close);
		return () => document.removeEventListener("pointerdown", close);
	}, []);
	(0, react.useEffect)(() => {
		const ticket = ++generation.current;
		if (!accountId) {
			B(false);
			return;
		}
		B(true);
		E("");
		const timer = setTimeout(() => {
			const params = new URLSearchParams({
				contractId,
				side,
				accountId,
				collection,
				q: query,
				offset: String(page * 25),
				limit: "25",
				ids: key
			});
			api.read("integrations/choices?" + params).then((v) => {
				if (ticket !== generation.current) return;
				S(v);
				N((old) => ({
					...old,
					...Object.fromEntries([...v.items ?? [], ...v.selected ?? []].map((r) => [String(r.id), r.name]))
				}));
			}).catch((e) => {
				if (ticket === generation.current) E(e.message);
			}).finally(() => {
				if (ticket === generation.current) B(false);
			});
		}, query ? 180 : 0);
		return () => {
			generation.current++;
			clearTimeout(timer);
		};
	}, [
		api,
		identity,
		query,
		page,
		key,
		refresh
	]);
	const choose = (row) => {
		N((old) => ({
			...old,
			[String(row.id)]: row.name
		}));
		if (multiple) onChange(ids.some((id) => id === row.id) ? ids.filter((id) => id !== row.id) : [...ids, row.id]);
		else {
			onChange(row.id);
			O(false);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "beellix-connection-picker",
		ref: root,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [label, /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				className: "beellix-connection-select",
				type: "button",
				disabled: disabled || !accountId,
				"aria-label": label,
				"aria-expanded": open,
				"aria-haspopup": "dialog",
				onClick: () => O(!open),
				children: [ids.length ? multiple ? `已选择 ${ids.length} 项` : names[String(ids[0])] ?? (loading ? "读取中…" : "原记录暂不可用") : "请选择", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
					width: "14",
					height: "14",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.6",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m6 9 6 6 6-6" })
				})]
			})] }),
			multiple && ids.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "beellix-connection-chips",
				children: ids.map((id) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					disabled,
					"aria-label": "移除 " + (names[String(id)] ?? "已选记录"),
					onClick: () => onChange(ids.filter((v) => v !== id)),
					children: [names[String(id)] ?? "已选记录", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
						width: "12",
						height: "12",
						viewBox: "0 0 24 24",
						stroke: "currentColor",
						strokeWidth: "1.6",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m6 6 12 12M18 6 6 18" })
					})]
				}, id))
			}),
			open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				popover: "manual",
				className: "beellix-connection-options",
				role: "dialog",
				"aria-label": "选择" + label,
				ref: list,
				onKeyDown: (event) => {
					if ([
						"ArrowDown",
						"ArrowUp",
						"Home",
						"End"
					].includes(event.key)) {
						const options = [...list.current.querySelectorAll("[role=option]")], index = options.indexOf(document.activeElement);
						options[event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : event.key === "ArrowDown" ? Math.min(index + 1, options.length - 1) : Math.max(index - 1, 0)]?.focus();
						event.preventDefault();
					}
					if (event.key === "Escape") {
						event.preventDefault();
						event.stopPropagation();
						O(false);
						root.current?.querySelector("button")?.focus();
					}
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						"aria-label": "搜索" + label,
						placeholder: "搜索名称",
						value: query,
						onChange: (e) => {
							Q(e.target.value);
							P(0);
						},
						autoFocus: true
					}),
					error ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						role: "alert",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: error }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => Refresh((v) => v + 1),
							children: "重新读取"
						})]
					}) : loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						children: "读取中…"
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						role: "listbox",
						"aria-label": label + "记录",
						"aria-multiselectable": multiple || void 0,
						children: [result?.items.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							role: "option",
							"aria-selected": ids.some((id) => id === row.id),
							onClick: () => choose(row),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: row.name }), ids.some((id) => id === row.id) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
								width: "14",
								height: "14",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "1.6",
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m5 12 4 4L19 6" })
							})]
						}, row.id)), result?.items.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "status",
							children: "没有匹配的记录"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: loading || page === 0,
							onClick: () => P(page - 1),
							children: "上一页"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [result?.total ?? 0, " 项"] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: loading || result?.nextOffset == null,
							onClick: () => P(page + 1),
							children: "下一页"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => O(false),
							children: "完成"
						})
					] })
				]
			}),
			!open && error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", {
				role: "alert",
				children: error
			})
		]
	});
}
function ConnectionEditor({ api, state, initial, close, saved }) {
	const [contractId, C] = (0, react.useState)(initial?.contractId ?? state.contracts[0]?.id ?? ""), [data, D] = (0, react.useState)(initial ? Object.fromEntries(Object.entries(initial).filter(([k]) => [
		...state.contracts.flatMap((c) => [
			c.source.accountKey,
			c.target.accountKey,
			...c.fields.map((f) => f.key)
		]),
		"permissions",
		"expiresAt"
	].includes(k))) : {}), [busy, B] = (0, react.useState)(false), [error, E] = (0, react.useState)("");
	const contract = state.contracts.find((c) => c.id === contractId), source = state.providers.find((p) => p.packageName === contract?.source.packageName), target = state.providers.find((p) => p.packageName === contract?.target.packageName);
	const defaults = (c) => Object.fromEntries([
		["permissions", c.operations.filter((o) => o.default && !o.write).map((o) => o.id)],
		["expiresAt", new Date(Date.now() + 365 * 864e5).toISOString()],
		...c.fields.map((f) => [f.key, f.kind === "mapping" ? [{}] : f.kind === "multiple" ? [] : f.kind === "checks" ? f.default ?? [] : ""])
	]);
	(0, react.useEffect)(() => {
		if (!initial && contract) D(defaults(contract));
	}, [contractId]);
	const set = (key, value) => D((old) => ({
		...old,
		[key]: value
	})), picker = (f, side, value, onChange, label = f.title) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RecordPicker, {
		api,
		contractId: contract.id,
		side,
		accountId: data[contract[side].accountKey],
		collection: f.collection,
		label,
		value,
		multiple: f.kind === "multiple",
		onChange,
		disabled: busy
	});
	const form = (0, react.useRef)(null);
	const formId = (0, react.useId)();
	const valid = contract && data[contract.source.accountKey] && data[contract.target.accountKey] && data.permissions?.length > 0 && contract.fields.every((f) => !f.required || (f.kind === "mapping" ? data[f.key]?.length > 0 && data[f.key].every((r) => r[f.sourceKey] && r[f.targetKey]) : f.kind === "multiple" ? data[f.key]?.length > 0 : !!data[f.key]));
	const submit = async (e) => {
		e.preventDefault();
		if (!valid || busy) return;
		B(true);
		E("");
		try {
			const input = {
				...data,
				contractId: contract.id
			};
			await api.mutate(initial ? "integrations/update" : "integrations/create", initial ? {
				id: initial.id,
				expectedRevision: initial.revision,
				input
			} : input);
			await saved();
			close();
		} catch (e) {
			E(e.message);
		} finally {
			B(false);
		}
	};
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Modal$2, {
		open: true,
		className: "beellix-connection-dialog",
		contentClassName: "beellix-connection-content",
		title: initial ? "配置连接" : "新建连接",
		closeLabel: "关闭",
		onClose: () => {
			if (!busy) close();
		},
		footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "beellix-connection-footer",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: busy,
				onClick: close,
				children: "取消"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "submit",
				form: formId,
				className: "beellix-bootstrap__primary",
				disabled: busy || !valid,
				children: busy ? "保存中…" : initial ? "保存配置" : "建立连接"
			})]
		}),
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
			id: formId,
			className: "beellix-connection-form",
			ref: form,
			onSubmit: submit,
			children: [error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "beellix-connection-error",
				children: error
			}), !contract ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: "暂无可配置的互通协议" }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				!initial && state.contracts.length > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: ["连接类型", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
					value: contractId,
					onChange: (e) => C(e.target.value),
					children: state.contracts.map((c) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
						value: c.id,
						children: c.title
					}, c.id))
				})] }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
					disabled: busy,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", { children: "连接数据库" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "beellix-connection-columns",
						children: [["source", source], ["target", target]].map(([side, provider]) => {
							const key = contract[side].accountKey;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [
								provider?.title ?? (side === "source" ? "来源插件" : "目标插件"),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									"aria-label": (side === "source" ? "来源" : "目标") + "数据库",
									required: true,
									disabled: Boolean(initial),
									value: data[key] ?? "",
									onChange: (e) => D((old) => ({
										...old,
										...defaults(contract),
										[key]: e.target.value,
										[contract[side === "source" ? "target" : "source"].accountKey]: old[contract[side === "source" ? "target" : "source"].accountKey]
									})),
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: "",
										children: "选择数据库"
									}), provider?.accounts.map((a) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: a.instanceId,
										children: a.title ?? "未命名数据库"
									}, a.instanceId))]
								}),
								!provider?.accounts.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "请先启用插件并初始化数据库" })
							] }, side);
						})
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
					disabled: busy,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", { children: "允许的操作" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "beellix-connection-permissions",
						children: contract.operations.map((op) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: "beellix-connection-check",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: data.permissions?.includes(op.id) ?? false,
								onChange: (e) => set("permissions", e.target.checked ? [...data.permissions ?? [], op.id] : (data.permissions ?? []).filter((id) => id !== op.id))
							}), op.title]
						}, op.id))
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
					disabled: busy,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", { children: "共享范围" }), contract.fields.filter((f) => f.kind !== "checks").map((f) => f.kind === "mapping" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "beellix-connection-mapping",
						"aria-label": f.title,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: f.title }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: (data[f.key]?.length ?? 0) >= 100,
							onClick: () => set(f.key, [...data[f.key] ?? [], {}]),
							children: "添加对应"
						})] }), (data[f.key] ?? []).map((row, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "beellix-connection-map-row",
							children: [
								picker({
									...f,
									collection: f.sourceCollection
								}, "source", row[f.sourceKey], (id) => set(f.key, data[f.key].map((r, j) => j === i ? {
									...r,
									[f.sourceKey]: id
								} : r)), `${f.sourceLabel ?? "来源记录"} ${i + 1}`),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "beellix-connection-arrow",
									"aria-hidden": "true",
									children: "→"
								}),
								picker({
									...f,
									collection: f.targetCollection
								}, "target", row[f.targetKey], (id) => set(f.key, data[f.key].map((r, j) => j === i ? {
									...r,
									[f.targetKey]: id
								} : r)), `${f.targetLabel ?? "目标记录"} ${i + 1}`),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": `移除${f.title} ${i + 1}`,
									disabled: data[f.key].length === 1,
									onClick: () => set(f.key, data[f.key].filter((_r, j) => j !== i)),
									children: "移除"
								})
							]
						}, i))]
					}, f.key) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "beellix-connection-scope",
						children: picker(f, f.side, data[f.key], (value) => set(f.key, value))
					}, f.key))]
				}),
				contract.fields.filter((f) => f.kind === "checks" && (!f.whenPermission || data.permissions?.includes(f.whenPermission))).map((f) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
					disabled: busy,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", { children: f.title }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "beellix-connection-permissions",
						children: f.options.map((o) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: "beellix-connection-check",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: data[f.key]?.includes(o.id) ?? false,
								onChange: (e) => set(f.key, e.target.checked ? [...data[f.key] ?? [], o.id] : (data[f.key] ?? []).filter((id) => id !== o.id))
							}), o.title]
						}, o.id))
					})]
				}, f.key)),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: "有效期" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: ["到期日期", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					type: "date",
					"aria-label": "到期日期",
					required: true,
					min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
					max: new Date(Date.now() + 366 * 864e5).toISOString().slice(0, 10),
					value: data.expiresAt?.slice(0, 10) ?? "",
					onChange: (e) => set("expiresAt", e.target.value ? (/* @__PURE__ */ new Date(e.target.value + "T23:59:59")).toISOString() : "")
				})] })] })
			] })]
		})
	});
}
function IntegrationPage({ api }) {
	const [state, S] = (0, react.useState)(), [tab, T] = (0, react.useState)("connections"), [query, Q] = (0, react.useState)(""), [editing, Edit] = (0, react.useState)(), [busy, B] = (0, react.useState)(true), [error, E] = (0, react.useState)(""), [notice, N] = (0, react.useState)(""), [audit, A] = (0, react.useState)(), [offset, Offset] = (0, react.useState)(0);
	const generation = (0, react.useRef)(0);
	const load = async () => {
		const ticket = ++generation.current;
		B(true);
		E("");
		try {
			const v = await api.read("integrations");
			if (ticket !== generation.current) return;
			S(v);
			if (tab === "audit") {
				const list = await api.read(`integrations/audit?offset=${offset}&limit=40`);
				if (ticket === generation.current) A(list);
			}
		} catch (e) {
			if (ticket === generation.current) E(e.message);
		} finally {
			if (ticket === generation.current) B(false);
		}
	};
	(0, react.useEffect)(() => {
		S(void 0);
		A(void 0);
		load();
		return () => {
			generation.current++;
		};
	}, [
		api,
		tab,
		offset
	]);
	const toggle = async (row, enabled) => {
		B(true);
		E("");
		N("");
		try {
			await api.mutate("integrations/enabled", {
				id: row.id,
				expectedRevision: row.revision,
				enabled
			});
			N(enabled ? "连接已启用" : "连接已停用，业务资料保留");
			await load();
		} catch (e) {
			E(e.message);
			B(false);
		}
	};
	const contracts = state?.contracts ?? [], rows = (state?.connections ?? []).filter((row) => [
		row.sourcePlugin,
		row.sourceTitle,
		row.targetPlugin,
		row.targetTitle
	].join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
	const operationTitle = (id) => contracts.flatMap((c) => c.operations).find((o) => o.id === id)?.title ?? operations[id] ?? "业务调用";
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "beellix-bootstrap",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
			className: "beellix-bootstrap__page beellix-console beellix-integrations",
			"aria-label": "插件互通",
			"aria-busy": busy,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: "beellix-page-toolbar",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTabs, {
						buttons: true,
						label: "插件互通分类",
						items: [["connections", "连接"], ["audit", "操作记录"]],
						active: tab,
						onChange: (id) => {
							T(id);
							Offset(0);
							N("");
						}
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "beellix-bootstrap__actions",
						children: [tab === "connections" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "beellix-bootstrap__primary",
							disabled: !state || busy || !contracts.length,
							onClick: () => Edit(null),
							children: "新建连接"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							disabled: busy,
							onClick: () => void load(),
							children: "刷新"
						})]
					})]
				}),
				error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "beellix-connection-error",
					children: error
				}),
				notice && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					role: "status",
					children: notice
				}),
				!state ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: busy ? "读取中…" : "请刷新重试" }) : tab === "connections" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "beellix-connection-search",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						"aria-label": "搜索连接",
						placeholder: "搜索插件或数据库",
						value: query,
						onChange: (e) => Q(e.target.value)
					})
				}), !rows.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: query ? "没有匹配的连接" : "暂无连接" }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "beellix-connection-table",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "连接" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "允许的操作" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "状态" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "操作" })
					] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: rows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [
							row.sourcePlugin,
							" → ",
							row.targetPlugin
						] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [
							row.sourceTitle,
							" → ",
							row.targetTitle
						] })] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "beellix-connection-operation-tags",
							children: row.permissions.map((id) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: operationTitle(id) }, id))
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: (contracts.find((c) => c.id === row.contractId)?.fields ?? []).filter((f) => ["mapping", "multiple"].includes(f.kind)).map((f) => f.title + " " + String(row[f.key]?.length ?? 0) + " 项").join(" · ") })] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "beellix-state",
							"data-state": row.enabled && row.available && !row.expired && row.status === "ready" ? "enabled" : "disabled",
							children: status(row)
						}) }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "beellix-bootstrap__actions",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Switch, {
								label: "启用 " + row.sourceTitle + " 与 " + row.targetTitle + " 连接",
								checked: row.enabled,
								disabled: busy || !row.enabled && (!row.available || row.expired),
								onChange: (enabled) => void toggle(row, enabled)
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								disabled: busy || !row.available,
								onClick: () => Edit(row),
								children: "配置"
							})]
						}) })
					] }, row.id)) })] })
				})] }) : !audit ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: busy ? "读取中…" : "请刷新重试" }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "beellix-connection-table",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "时间" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "连接" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "操作" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "结果" })
						] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: audit.items.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: date(row.at) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", { children: [
								state.connections.find((g) => g.id === row.grantId)?.sourceTitle ?? "原连接",
								" → ",
								state.connections.find((g) => g.id === row.grantId)?.targetTitle ?? "原连接"
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: operations[row.operation] ?? operationTitle(row.operation) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: row.result === "complete" ? "成功" : "已拒绝" })
						] }, row.id)) })] })
					}),
					!audit.items.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: "暂无操作记录" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
						className: "beellix-connection-pagination",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [audit.total, " 条"] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								disabled: busy || offset === 0,
								onClick: () => Offset(Math.max(0, offset - 40)),
								children: "上一页"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								disabled: busy || audit.nextOffset == null,
								onClick: () => Offset(audit.nextOffset),
								children: "下一页"
							})
						]
					})
				] }),
				state && editing !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConnectionEditor, {
					api,
					state,
					initial: editing,
					close: () => Edit(void 0),
					saved: load
				}, editing?.id ?? "new")
			]
		})
	});
}
//#endregion
//#region packages/platform/community/src/console-page.tsx
/** 原控制台页面与原生宿主的薄适配；不安装旧客户端装配或重复设置入口。 */
function createConsoleFace(ctx) {
	const mirror = ctx.configForms.describe();
	const scope = {
		describe: () => mirror,
		refresh: async () => {
			const response = await ctx.remote.settings.describe();
			if (!response.ok) throw Error(response.error.message);
			for (const view of response.value.namespaces) mirror.acceptView(view);
		}
	};
	const schema = createSettingsSchemaOperations(ctx.settingsSchema);
	const modelCtx = {
		remote: ctx.remote,
		settingsScope: scope
	};
	const models = new ModelsSettingsStore(modelCtx, schema, mirror);
	const operations = createModelsOperations(modelCtx);
	const refresh = () => {
		if (models.store.getSnapshot().status !== "idle") models.load();
	};
	ctx.effect(() => {
		const off = [
			ctx.remote.$on("settings/document-updated", refresh),
			ctx.remote.$on("credentials/reference-updated", refresh),
			ctx.remote.$on("llm/adapters-updated", refresh),
			ctx.on("connection/reset", refresh)
		];
		return () => off.forEach((fn) => fn());
	}, "Beelli X：原模型页状态同步");
	return {
		models,
		operations,
		schema
	};
}
function AddModelForm({ face, state, onClose, onRefresh }) {
	const choices = state.rows.filter((row) => ["llm-deepseek", "llm-pi-ai"].includes(row.entry.settingsNs) && state.namespaces.has(row.entry.settingsNs));
	const [kind, setKind] = (0, react.useState)(choices.length ? "provider" : "custom"), [selected, setSelected] = (0, react.useState)(choices[0]?.entry.provider ?? "");
	const row = choices.find((item) => item.entry.provider === selected) ?? choices[0];
	const protocols = protocolChoices(state.namespaces.get("llm-pi-ai"), face.schema), t = (key) => key === "enableWebSearch" ? "使用 Search API" : zh$1[key] ?? key;
	const close = async (changed) => {
		if (changed) {
			await face.models.load();
			await onRefresh?.();
		}
		onClose();
	};
	if (state.status !== "ready") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
		role: state.error ? "alert" : "status",
		children: state.error ?? "读取配置中…"
	});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTabs, {
		label: "模型接入方式",
		buttons: true,
		items: [["provider", "模型提供商"], ["custom", "自定义 API"]],
		active: kind,
		onChange: setKind
	}), kind === "provider" ? row ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
		className: "beellix-model-provider-select",
		children: ["提供商", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
			"aria-label": "模型提供商",
			value: row.entry.provider,
			onChange: (e) => setSelected(e.target.value),
			children: choices.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
				value: item.entry.provider,
				children: item.entry.displayName
			}, item.entry.provider))
		})]
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProviderEditor, {
		hideTitle: true,
		provider: row.entry.provider,
		displayName: row.entry.displayName,
		declared: row.entry.declared === true,
		namespace: state.namespaces.get(row.entry.settingsNs),
		settingsPath: row.entry.settingsPath,
		schema: face.schema,
		operations: face.operations,
		t,
		readOnly: !state.writable,
		onClose: close
	}, row.entry.provider)] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
		role: "status",
		children: "DSH 模型适配器尚未就绪"
	}) : protocols.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CustomProviderCard, {
		taken: state.rows.map((item) => item.entry.provider),
		protocols,
		revision: state.namespaces.get("llm-pi-ai").revision,
		operations: face.operations,
		t,
		readOnly: !state.writable,
		onClose: close
	}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
		role: "status",
		children: "DSH 通用模型适配器尚未就绪"
	})] });
}
function ModelsPage({ face, catalog, onEnabled, onModelEnabled, onRefresh, adding, onCloseAdd, webSearch, modelSelection }) {
	const state = (0, react.useSyncExternalStore)(face.models.store.subscribe, face.models.store.getSnapshot);
	(0, react.useEffect)(() => {
		if (face.models.store.getSnapshot().status === "idle") face.models.load();
	}, [face]);
	const [location, setLocation] = (0, react.useState)({});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
		open: Boolean(adding),
		title: "添加模型",
		closeLabel: "关闭",
		onClose: onCloseAdd,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AddModelForm, {
			face,
			state,
			onClose: onCloseAdd,
			onRefresh
		})
	}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "beellix-console__original-models",
		onClickCapture: (event) => {
			const anchor = event.target.closest("a[href]");
			if (!anchor) return;
			const url = new URL(anchor.getAttribute("href"), document.baseURI);
			if (url.pathname !== "/admin/models") return;
			event.preventDefault();
			setLocation(Object.fromEntries(url.searchParams));
		},
		children: catalog ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NativeModelCatalog, {
			modelSelection,
			webSearch,
			state,
			catalog,
			operations: face.operations,
			location,
			onEnabled,
			onModelEnabled,
			schema: face.schema,
			onRefresh: async () => {
				await face.models.load();
				await onRefresh?.();
			},
			t: (key) => key === "enableWebSearch" ? "使用 Search API" : zh$1[key] ?? key
		}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelsSection, {
			webSearch,
			providerCards: true,
			catalogLocation: location,
			controller: face.models,
			operations: face.operations,
			schema: face.schema,
			t: (key) => zh$1[key] ?? key,
			useSnapshot: (selector) => selector(state),
			renderSlot: () => null
		})
	})] });
}
function SkillsPage({ items, read }) {
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkillDirectory, {
		state: {
			skills: items,
			skillsIncomplete: false
		},
		t: (key) => zh[key] ?? key,
		read
	});
}
const includes = (row, query) => Object.values(row).filter((value) => typeof value === "string").join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
const resourceTargets = [
	{
		id: "knowledge",
		name: "@beellix-ai/knowledge",
		title: "知识库"
	},
	{
		id: "data-platform",
		name: "@beellix-ai/data-platform",
		title: "数据中台"
	},
	{
		id: "database",
		name: "@beellix-ai/database",
		title: "数据库"
	}
];
const installedResource = (row) => row && [
	"enabled",
	"disabled",
	"pending",
	"failed"
].includes(row.state);
function ConsoleContent(props) {
	return props.tab === "integrations" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IntegrationPage, { api: props.api }) : ["archives", "operations"].includes(props.tab) ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ArchivedConversations, {
		api: props.api,
		restore: props.restoreArchive
	}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConsoleModules, { ...props });
}
function ConsoleModules({ tab, api, modelFace, openPanel, initialPrice, openManager, renderCapability }) {
	const [state, setState] = (0, react.useState)(), [inventory, setInventory] = (0, react.useState)(), [modelCatalog, setModelCatalog] = (0, react.useState)();
	const [error, setError] = (0, react.useState)(""), [notice, setNotice] = (0, react.useState)(""), [busy, setBusy] = (0, react.useState)(true), [section, setSection] = (0, react.useState)(initialPrice?.section ?? (initialPrice ? "account" : "models"));
	const [installing, setInstalling] = (0, react.useState)(), [query, setQuery] = (0, react.useState)(""), [status, setStatus] = (0, react.useState)("all");
	const [pluginUsesCatalog, setPluginUsesCatalog] = (0, react.useState)(false);
	const [addingModel, setAddingModel] = (0, react.useState)(false), [pluginModels, setPluginModels] = (0, react.useState)(), [officialModels, setOfficialModels] = (0, react.useState)(), [search, setSearch] = (0, react.useState)();
	const [resourceInstalling, setResourceInstalling] = (0, react.useState)(), [resourceSection, setResourceSection] = (0, react.useState)("knowledge");
	const [resourceActions, setResourceActions] = (0, react.useState)({});
	const registerActions = (0, react.useCallback)((id, actions) => {
		setResourceActions((current) => ({
			...current,
			[id]: actions
		}));
		return () => setResourceActions((current) => current[id] === actions ? {
			...current,
			[id]: void 0
		} : current);
	}, []);
	const reading = busy;
	const generation = (0, react.useRef)(0);
	const load = async () => {
		const ticket = ++generation.current;
		setBusy(true);
		setError("");
		try {
			const next = await api.read("state");
			if (ticket !== generation.current) return;
			setState(next);
			const tasks = [];
			if (tab === "scenarios") tasks.push(api.read("inventory").then((value) => {
				if (ticket === generation.current) setInventory(value);
			}));
			if (tab === "models" && section === "models") tasks.push(api.read("models/catalog").then((value) => {
				if (ticket === generation.current) setModelCatalog(value);
			}), api.read("models/search").then((value) => {
				if (ticket === generation.current) setSearch(value);
			}));
			if (tab === "models" && section === "plugin-models") tasks.push(api.read("models/plugins").then((value) => {
				if (ticket === generation.current) setPluginModels(value);
			}), api.read("models/catalog").then((value) => {
				if (ticket === generation.current) setModelCatalog(value);
			}));
			if (tab === "models" && section === "account") tasks.push(api.read("models/official").then((value) => {
				if (ticket === generation.current) setOfficialModels(value);
			}));
			const failures = (await Promise.allSettled(tasks)).filter((row) => row.status === "rejected");
			if (ticket === generation.current && failures.length) setError(failures.map((row) => row.reason.message).join("；"));
		} catch (e) {
			if (ticket === generation.current) setError(e.message);
		} finally {
			if (ticket === generation.current) setBusy(false);
		}
	};
	(0, react.useEffect)(() => {
		load();
		return () => {
			generation.current++;
		};
	}, [tab, section]);
	const refresh = async () => {
		try {
			if (tab === "models" && section === "account") {
				const ticket = ++generation.current;
				setBusy(true);
				setError("");
				try {
					const value = await api.read("models/official?refresh=true");
					if (ticket === generation.current) setOfficialModels(value);
				} catch (e) {
					if (ticket === generation.current) setError(e.message);
				} finally {
					if (ticket === generation.current) setBusy(false);
				}
				return;
			}
			if (tab === "models" && modelFace) {
				const face = modelFace();
				await face.operations.refreshSettings?.();
				if (["models", "plugin-models"].includes(section)) await face.models.load();
			}
			await load();
		} catch (e) {
			setError(e.message);
			setBusy(false);
		}
	};
	const manage = (category) => openManager ? openManager(category) : setInstalling(category);
	const run = async (fn) => {
		if (busy) return;
		setBusy(true);
		setError("");
		setNotice("");
		try {
			const value = await fn();
			await load();
			setNotice(value.application === "restart-required" ? "更改已保存，重启客户端后生效。" : "已保存");
		} catch (e) {
			setError(e.message);
		} finally {
			setBusy(false);
		}
	};
	const title = {
		models: "模型",
		scenarios: "场景应用",
		resources: "知识与数据"
	}[tab];
	const tabs = tab === "models" ? [
		["models", "主模型配置"],
		["plugin-models", "插件模型配置"],
		["account", "用量与余额"]
	] : tab === "resources" ? resourceSections(state?.capabilities ?? []) : tab === "scenarios" ? [
		["all", "全部场景"],
		["true", "已启用"],
		["false", "已停用"]
	] : [];
	const scenes = (inventory?.scenes ?? []).filter((row) => includes(row, query) && (status === "all" || String(row.enabled) === status));
	const resourceTarget = resourceTargets.find((target) => target.id === (resourceSection === "data" ? "data-platform" : resourceSection));
	const resourceRow = state?.capabilities?.find((row) => row.id === resourceTarget?.id);
	const needsResourceInstall = tab === "resources" && resourceTarget !== void 0 && !installedResource(resourceRow) && !error && !state?.addonError;
	const resourceSettings = tab === "resources" && resourceRow?.state === "enabled" && resourceRow.connection !== "waiting" && resourceRow.configPanel && openPanel;
	const sceneFilters = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "beellix-console__filters beellix-console__filters--search",
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
			type: "search",
			"aria-label": "搜索场景",
			placeholder: "搜索场景",
			value: query,
			onChange: (event) => setQuery(event.target.value)
		})
	});
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "beellix-bootstrap" + (tab === "resources" && resourceTarget?.id === "knowledge" ? " beellix-bootstrap--knowledge" : ""),
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "beellix-bootstrap__page beellix-console",
			"data-resource": tab === "resources" ? resourceTarget?.id : void 0,
			"aria-busy": reading,
			role: "region",
			"aria-label": title,
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: "beellix-page-toolbar",
					children: [tabs.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SectionTabs, {
						label: title + "分类",
						items: tabs,
						active: tab === "resources" ? resourceSection : tab === "scenarios" ? status : section,
						onChange: (id) => {
							if (tab === "scenarios") {
								setStatus(id);
								return;
							}
							if (tab === "resources") setResourceSection(id);
							else setSection(id);
							setAddingModel(false);
							setNotice("");
							setQuery("");
							setStatus("all");
						}
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "beellix-bootstrap__actions",
						children: [
							tab === "models" && (section === "models" || section === "plugin-models" && pluginUsesCatalog) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								onClick: () => setAddingModel(true),
								children: "添加模型"
							}),
							tab === "scenarios" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								onClick: () => manage("scenarios"),
								children: "安装 / 升级场景"
							}),
							resourceSettings && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								disabled: reading,
								onClick: () => resourceActions[resourceRow.id]?.configure ? resourceActions[resourceRow.id].configure() : openPanel(resourceRow.configPanel, {
									capabilityId: resourceRow.id,
									title: resourceRow.title,
									view: "settings"
								}),
								children: "配置"
							}),
							needsResourceInstall ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								"aria-label": "安装" + resourceTarget?.title,
								disabled: reading || !state || resourceRow?.state === "installing",
								onClick: () => setResourceInstalling({
									...resourceTarget,
									offered: resourceRow
								}),
								children: "安装"
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								disabled: reading,
								onClick: () => void refresh(),
								children: "刷新"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(OperationFeedback, {
					error,
					notice,
					onErrorDone: () => setError(""),
					onNoticeDone: () => setNotice("")
				}),
				!state ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					role: "status",
					className: "beellix-console__empty",
					children: busy ? "读取中…" : "请刷新重试"
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					tab === "models" && section === "models" && (modelCatalog && modelFace ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelsPage, {
						webSearch: search ? {
							...search,
							busy,
							onChange: (enabled) => void run(() => api.mutate("models/search", {
								enabled,
								expectedRevision: search.revision
							}))
						} : void 0,
						face: modelFace(),
						catalog: modelCatalog,
						adding: addingModel,
						onCloseAdd: () => setAddingModel(false),
						onEnabled: (input) => api.mutate("models/enabled", input),
						onModelEnabled: (input) => api.mutate("models/selection", input),
						onRefresh: load
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						className: "beellix-console__empty",
						children: busy ? "读取中…" : "模型目录暂不可用，请刷新。"
					})),
					tab === "models" && section === "plugin-models" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PluginModelConfiguration, {
						onCatalogChange: setPluginUsesCatalog,
						onConfigure: openPanel,
						state: pluginModels,
						busy,
						onSave: (input) => void run(() => api.mutate("models/plugins", input)),
						renderModels: (purpose) => modelCatalog && modelFace ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelsPage, {
							face: modelFace(),
							modelSelection: purpose,
							catalog: {
								...modelCatalog,
								items: modelCatalog.items.map((item) => ({
									...item,
									models: item.models.filter((model) => !model.inputModalities || purpose.modalities.every((kind) => model.inputModalities.includes(kind)))
								})).filter((item) => item.models.length || !item.modelsKnown)
							},
							adding: addingModel,
							onCloseAdd: () => setAddingModel(false),
							onEnabled: (input) => api.mutate("models/enabled", input),
							onModelEnabled: (input) => api.mutate("models/selection", input),
							onRefresh: load
						}, purpose.key) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "status",
							className: "beellix-console__empty",
							children: busy ? "读取中…" : "模型目录暂不可用，请刷新。"
						})
					}),
					tab === "models" && section === "account" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(OfficialModelAccounts, { state: officialModels }),
					tab === "scenarios" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ScenarioDirectory, {
						items: scenes,
						allItems: inventory?.scenes ?? [],
						allCount: inventory?.scenes?.length ?? 0,
						busy,
						filters: sceneFilters,
						onManage: manage,
						onToggle: (row, enabled) => void run(() => api.mutate("scene/enabled", {
							packageName: row.packageName,
							enabled,
							expectedVersion: row.version,
							expectedEnabled: row.enabled
						}))
					}),
					tab === "resources" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [state.addonError && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						children: state.addonError
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ResourceDirectory, {
						items: state.capabilities ?? [],
						busy,
						selected: resourceSection,
						renderCapability,
						registerActions,
						onEnable: (row) => void run(() => api.mutate("addons/enabled", {
							id: row.id,
							enabled: true,
							expectedVersion: row.version,
							expectedEnabled: false
						})),
						openPanel
					})] })
				] }),
				installing && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ApplicationManager, {
					api,
					openPanel,
					close: () => {
						setInstalling(void 0);
						load();
					}
				}),
				tab === "resources" && resourceInstalling && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ResourceInstaller, {
					api,
					target: resourceInstalling,
					offered: resourceInstalling.offered,
					onClose: () => setResourceInstalling(void 0),
					onInstalled: async (result, id) => {
						await load();
						setResourceSection(id === "data-platform" ? "data" : id);
						setResourceInstalling(void 0);
						setNotice(result.application === "restart-required" ? "安装已保存，请重启客户端生效。" : "");
					}
				}, resourceInstalling.id)
			]
		})
	});
}
//#endregion
exports.ApplicationManager = ApplicationManager;
exports.ConsoleContent = ConsoleContent;
exports.DetailHeading = DetailHeading;
exports.DetailSection = DetailSection;
exports.ModelsPage = ModelsPage;
exports.ObjectFacts = ObjectFacts;
exports.SectionTabs = SectionTabs;
exports.SkillsPage = SkillsPage;
exports.createConsoleFace = createConsoleFace;
