import { CommandId } from "./commands"

type Keybind = { key: string; command: CommandId; context: KeybindContext; isInputAllowed?: boolean }
type KeybindContext = "global" | "viewer" | "modal"

export const keymap: readonly Keybind[] = [
	{ key: "Shift+:", command: "app.modal.toggle", context: "global" },
	{ key: "escape", command: "app.modal.close", context: "modal", isInputAllowed: true },
	{ key: "t h", command: "app.sidebar.toggle", context: "global", isInputAllowed: false },
	{ key: "t j", command: "app.statusbar.toggle", context: "global", isInputAllowed: false },

	{ key: "h", command: "pdf.fitHeight", context: "viewer" },
	{ key: "w", command: "pdf.fitWidth", context: "viewer" },
	{ key: "=", command: "pdf.zoomIn", context: "viewer" },
	{ key: "-", command: "pdf.zoomOut", context: "viewer" },
	{ key: "j", command: "pdf.scrollDown", context: "viewer" },
	{ key: "k", command: "pdf.scrollUp", context: "viewer" },
	{ key: "pagedown", command: "pdf.nextPage", context: "viewer" },
	{ key: "pageup", command: "pdf.prevPage", context: "viewer" },
	{ key: "n", command: "pdf.nextPage", context: "viewer" },
	{ key: "p", command: "pdf.prevPage", context: "viewer" },
	{ key: "r", command: "pdf.rotateClockwise", context: "viewer" },
	{ key: "Shift+R", command: "pdf.rotateAntiClockwise", context: "viewer" },

	{ key: "g g", command: "pdf.gotoFirstPage", context: "viewer" },
	{ key: "G", command: "pdf.gotoLastPage", context: "viewer" },

	{ key: "d h", command: "pdf.deleteHighlight", context: "viewer" },
	{ key: "b a", command: "pdf.addBookmark", context: "viewer" }
]
