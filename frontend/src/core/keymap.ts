import type { Keybind } from "./keybinds";

export const keymap: readonly Keybind[] = [
	{ key: ":", command: "ui.modal.toggle", context: "global" },
	{ key: "escape", command: "ui.modal.close", context: "modal", isInputAllowed: true },

	{ key: "a", command: "pdf.fitHeight", context: "viewer" },
	{ key: "s", command: "pdf.fitWidth", context: "viewer" },
	{ key: "=", command: "pdf.zoomIn", context: "viewer" },
	{ key: "-", command: "pdf.zoomOut", context: "viewer" },
	{ key: "j", command: "pdf.scrollDown", context: "viewer" },
	{ key: "k", command: "pdf.scrollUp", context: "viewer" },
	{ key: "pagedown", command: "pdf.nextPage", context: "viewer" },
	{ key: "pageup", command: "pdf.prevPage", context: "viewer" },
	{ key: "n", command: "pdf.nextPage", context: "viewer" },
	{ key: "p", command: "pdf.prevPage", context: "viewer" },
	{ key: "r", command: "pdf.rotateClockwise", context: "viewer" },
	{ key: "R", command: "pdf.rotateAntiClockwise", context: "viewer" },

	{ key: "g g", command: "pdf.gotoFirstPage", context: "viewer" },
	{ key: "G", command: "pdf.gotoLastPage", context: "viewer" },

	{ key: "d h", command: "pdf.deleteHighlight", context: "viewer" },

	{ key: "ArrowDown", command: "modal.next", context: "modal", isInputAllowed: true },
	{ key: "ArrowUp", command: "modal.prev", context: "modal", isInputAllowed: true },
	{ key: "Enter", command: "modal.select", context: "modal", isInputAllowed: true }
];
