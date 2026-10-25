import { useNavigate } from "@solidjs/router"
import { onCleanup } from "solid-js"
import { SetStoreFunction } from "solid-js/store"
import { TTSApi } from "../../api/ttsApi"
import { commands } from "../../core/commands"
import { type AppStore } from "../App"

export function createAppCommands(appStore: AppStore, setAppStore: SetStoreFunction<AppStore>) {
	const navigate = useNavigate()

	const unregisters = [
		commands.registerCommand("app.pallete.toggle", () => setAppStore("isCommandPalleteOpen", (prev) => !prev)),
		commands.registerCommand("app.pallete.close", () => setAppStore("isCommandPalleteOpen", false)),
		commands.registerCommand("app.sidebar.toggle", () => setAppStore("isSideBarOpen", (prev) => !prev)),
		commands.registerCommand("app.statusbar.toggle", () => setAppStore("isStatusOpen", (prev) => !prev)),
		commands.registerCommand("app.downloadTTS", async ({ arg }) => {
			if (!arg) {
				const models = await TTSApi.getModels()
				setAppStore("commandPalleteArgs", [{
					group: "Models",
					options: models.map(({ id, quality }) => ({ id, label: quality, hidden: false }))
				}])
				return
			}
			console.log("downloading model: ", arg)
			TTSApi.downloadModel(arg)
		}),
		commands.registerCommand("app.folderSelect", ({ arg }) => {
			console.log("navigate", arg)
			navigate(`/?folder=${encodeURIComponent(arg)}`)
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
