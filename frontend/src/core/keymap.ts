import { createEffect } from "solid-js"
import { tinykeys } from "tinykeys"
import { COMMANDS_MAP, type CommandId, type Context, commands } from "./commands"

type Keybind = {
	key: string
	command: CommandId
	isInputAllowed?: boolean
}

// biome-ignore format: Manual formatting
export const keybinds: readonly Keybind[] = [
	{ key: "Shift+:", command: "app.pallete.toggle"  },
	{ key: "Control+/", command: "app.pallete.toggle"  },
	{ key: "t h", command: "app.sidebar.toggle", isInputAllowed: false	},
	{ key: "t j", command: "app.statusbar.toggle", isInputAllowed: false	},

	{ key: "f h", command: "pdf.fitH" },
	{ key: "f w", command: "pdf.fitW" },
	{ key: "=", command: "pdf.zoomIn" },
	{ key: "-", command: "pdf.zoomOut" },
	{ key: "j", command: "pdf.scrollDown" },
	{ key: "k", command: "pdf.scrollUp" },
	{ key: "pagedown", command: "pdf.pageN" },
	{ key: "pageup", command: "pdf.pageP" },
	{ key: "n", command: "pdf.pageN" },
	{ key: "p", command: "pdf.pageP" },
	{ key: "r", command: "pdf.rotateCW" },
	{ key: "Shift+R", command: "pdf.rotateACW" },
	{ key: "g g", command: "pdf.gotoFirstPage" },
	{ key: "Shift+G", command: "pdf.gotoLastPage" },
	{ key: "d h", command: "pdf.annotation.d" },
	{ key: "b a", command: "pdf.bookmark.a" },

	{ key: "j", command: "epub.goRight" },
	{ key: "k", command: "epub.goLeft" },
	{ key: "n", command: "epub.sectionN" },
	{ key: "p", command: "epub.sectionP" },
	{ key: "=", command: "epub.textIn" },
	{ key: "-", command: "epub.textDec" },
]

export const KEYMAP_MAP = new Map(
	keybinds.map((k) => [k.command, k.key.includes(" ") ? k.key.split(" ") : k.key.split("+")])
)

function buildBindings(ctx: Context) {
	const bindings: Record<string, (event: KeyboardEvent) => void> = {}

	for (const bind of keybinds) {
		const context = COMMANDS_MAP.get(bind.command)?.group
		if (context !== "App" && context !== ctx) continue

		bindings[bind.key] = (event) => {
			event.preventDefault()
			commands.executeCommand(bind.command, { event })
			console.log(bind.key, "pressed")
			console.log(bind.command)
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
