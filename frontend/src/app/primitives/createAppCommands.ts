import { onCleanup } from "solid-js"
import { SetStoreFunction } from "solid-js/store"
import { TTSApi } from "../../api/ttsApi"
import { registerCommand } from "../../core/keybinds"
import { type AppStore } from "../App"

export function createAppCommands(appStore: AppStore, setAppStore: SetStoreFunction<AppStore>) {
	const unregisters = [
		registerCommand("app.modal.toggle", () => {
			setAppStore("isModalOpen", (prev) => !prev)
		}),
		registerCommand("app.modal.close", () => {
			setAppStore("isModalOpen", false)
		}),
		registerCommand("app.sidebar.toggle", () => {
			setAppStore("isSideBarOpen", (prev) => !prev)
		}),
		registerCommand("app.downloadTTS", async ({ arg }) => {
			if (!arg) {
				const models = await TTSApi.getModels()
				setAppStore("modalArgs", models.map(({ id, quality }) => ({ id, label: quality, hidden: false })))
				return
			}
			console.log("downloading model: ", arg)
			TTSApi.downloadModel(arg)
		})
	]

	onCleanup(() => {
		unregisters.forEach((unregister) => unregister())
	})
}
