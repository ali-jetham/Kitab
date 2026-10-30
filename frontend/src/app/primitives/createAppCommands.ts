import { useNavigate } from "@solidjs/router"
import { onCleanup } from "solid-js"
import { StoreSetter } from "solid-js"
import { TTSApi } from "../../api/ttsApi"
import { commands } from "../../core/commands"
import { type AppStore } from "../App"

export function createAppCommands(appStore: AppStore, setAppStore: StoreSetter<AppStore>) {
	const navigate = useNavigate()

	const unregisters = [
		commands.registerCommand("app.pallete.toggle", () =>
			setAppStore(draft => {
				draft.isCommandPalleteOpen = !draft.isCommandPalleteOpen
			})),
		commands.registerCommand("app.pallete.close", () =>
			setAppStore(draft => {
				draft.isCommandPalleteOpen = false
			})),
		commands.registerCommand("app.sidebar.toggle", () =>
			setAppStore(draft => {
				draft.isSideBarOpen = !draft.isSideBarOpen
			})),
		commands.registerCommand("app.statusbar.toggle", () =>
			setAppStore(draft => {
				draft.isStatusOpen = !draft.isStatusOpen
			})),

		commands.registerCommand("app.downloadTTS", async ({ arg }) => {
			if (!arg) {
				const models = await TTSApi.getModels()
				setAppStore(draft => {
					draft.commandPalleteArgs = [{
						group: "Models",
						options: models.map(({ id, quality }) => ({ id, label: quality, hidden: false }))
					}]
				})
				return
			}
			console.log("downloading model: ", arg)
			TTSApi.downloadModel(arg)
		}),
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
		unregisters.forEach((unregister) => unregister())
	})
}
