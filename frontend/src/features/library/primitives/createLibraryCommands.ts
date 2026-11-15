import { useNavigate } from "@solidjs/router"
import { onCleanup } from "solid-js"
import { documentApi } from "../../../api/documentApi"
import { commands } from "../../../core/commands"

export function createLibraryCommands() {
	const navigate = useNavigate()

	const unregisters = [
		commands.registerCommand("library.refreshCovers", () => documentApi.refreshCovers()),
		commands.registerCommand("library.folderSelect", ({ arg }) => {
			if (!arg) return
			navigate(`/?folder=${encodeURIComponent(arg)}`)
		})
	]

	onCleanup(() => {
		unregisters.forEach((unregister) => {
			unregister()
		})
	})
}
