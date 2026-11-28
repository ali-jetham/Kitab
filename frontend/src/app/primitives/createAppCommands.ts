import { onCleanup, type StoreSetter } from "solid-js"
import { commands } from "../../core/commands"
import type { AppStore } from "../contexts/AppContext"

export function createAppCommands(setAppStore: StoreSetter<AppStore>) {
	const unregisters = [
		commands.registerCommand("app.pallete.toggle", () =>
			setAppStore((draft) => {
				draft.isCommandPalleteOpen = !draft.isCommandPalleteOpen
			})
		),
		commands.registerCommand("app.sidebar.toggle", () =>
			setAppStore((draft) => {
				draft.isSideBarOpen = !draft.isSideBarOpen
			})
		),
		commands.registerCommand("app.statusbar.toggle", () =>
			setAppStore((draft) => {
				draft.isStatusOpen = !draft.isStatusOpen
			})
		),
		commands.registerCommand("app.theme.toggle", () => {
			const html = document.documentElement
			const theme = html.getAttribute("data-theme")
			if (theme === "light") {
				html.setAttribute("data-theme", "dark")
			} else {
				html.setAttribute("data-theme", "light")
			}
		})
	]

	onCleanup(() => {
		unregisters.forEach((unregister) => {
			unregister()
		})
	})
}
