import { onCleanup } from "solid-js"
import { documentApi } from "../../../api/documentApi"
import { commands } from "../../../core/commands"

export function createLibraryCommands() {
	const unregisters = [
		commands.registerCommand("library.scan", async () => {
			const res = await documentApi.scanDocs()
		}),
		commands.registerCommand("library.refreshCovers", () => {
			const res = documentApi.refreshCovers()
		})
	]

	onCleanup(() => {
		unregisters.forEach((unregister) => unregister())
	})
}
