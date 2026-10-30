import { useNavigate } from "@solidjs/router"
import { onCleanup } from "solid-js"
import { documentApi } from "../../../api/documentApi"
import { commands } from "../../../core/commands"

export function createLibraryCommands() {
	const navigate = useNavigate()

	const unregisters = [
		commands.registerCommand("library.scan", async () => {
			const res = await documentApi.scanDocs()
		}),
		commands.registerCommand("library.refreshCovers", () => {
			const res = documentApi.refreshCovers()
		}),
		commands.registerCommand("library.folderSelect", ({ arg }) => {
			console.log("navigate", arg)
			navigate(`/?folder=${encodeURIComponent(arg)}`)
		})
	]

	onCleanup(() => {
		unregisters.forEach((unregister) => unregister())
	})
}
