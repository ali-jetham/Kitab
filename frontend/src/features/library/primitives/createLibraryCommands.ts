import { onCleanup } from "solid-js"
import { documentApi } from "../../../api/documentApi"
import { registerCommand } from "../../../core/keybinds"

export function createLibraryCommands() {
	const unregisters = [
		registerCommand("library.scan", async () => {
			const res = await documentApi.scanDocs()
		}),
		registerCommand("library.refreshCovers", () => {
			const res = documentApi.refreshCovers()
		})
	]

	onCleanup(() => {
		unregisters.forEach((unregister) => unregister())
	})
}
