import { createEffect } from "solid-js"
import { tinykeys } from "tinykeys"
import { type CommandId, type Context, commands } from "./commands"

type Keybind = {
	key: string
	command: CommandId
	context: Context
	isInputAllowed?: boolean
}

// biome-ignore format: Manual formatting
export const keymap: readonly Keybind[] = [
	{ key: "Shift+:", command: "app.pallete.toggle", context: "app" },
	{ key: "t h", command: "app.sidebar.toggle", context: "app", isInputAllowed: false	},
	{ key: "t j", command: "app.statusbar.toggle", context: "app", isInputAllowed: false	},

	{ key: "f h", command: "pdf.fitH", context: "pdf" },
	{ key: "f w", command: "pdf.fitW", context: "pdf" },
	{ key: "=", command: "pdf.zoomIn", context: "pdf" },
	{ key: "-", command: "pdf.zoomOut", context: "pdf" },
	{ key: "j", command: "pdf.scrollDown", context: "pdf" },
	{ key: "k", command: "pdf.scrollUp", context: "pdf" },
	{ key: "pagedown", command: "pdf.pageN", context: "pdf" },
	{ key: "pageup", command: "pdf.pageP", context: "pdf" },
	{ key: "n", command: "pdf.pageN", context: "pdf" },
	{ key: "p", command: "pdf.pageP", context: "pdf" },
	{ key: "r", command: "pdf.rotateCW", context: "pdf" },
	{ key: "Shift+R", command: "pdf.rotateACW", context: "pdf" },
	{ key: "g g", command: "pdf.gotoFirstPage", context: "pdf" },
	{ key: "Shift+G", command: "pdf.gotoLastPage", context: "pdf" },
	{ key: "d h", command: "pdf.annotation.d", context: "pdf" },
	{ key: "b a", command: "pdf.bookmark.a", context: "pdf" },

	{ key: "j", command: "epub.goRight", context: "epub" },
	{ key: "k", command: "epub.goLeft", context: "epub" },
	{ key: "n", command: "epub.sectionN", context: "epub" },
	{ key: "p", command: "epub.sectionP", context: "epub" },
	{ key: "=", command: "epub.textIn", context: "epub" },
	{ key: "-", command: "epub.textDec", context: "epub" },
]

function buildBindings(ctx: Context) {
	const bindings: Record<string, (event: KeyboardEvent) => void> = {}

	for (const binding of keymap) {
		if (binding.context !== "app" && binding.context !== ctx) continue

		bindings[binding.key] = (event) => {
			event.preventDefault()
			commands.executeCommand(binding.command, { event })
			console.log(binding.key, "pressed")
			console.log(binding.command)
		}
	}

	return bindings
}

export function attachKeybinds(target: Window | HTMLElement, context: () => Context) {
	let unsubscribe: (() => void) | undefined

	createEffect(context, (ctx) => {
		unsubscribe?.()
		unsubscribe = tinykeys(target, buildBindings(ctx))
	})

	return () => unsubscribe?.()
}
