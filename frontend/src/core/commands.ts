const COMMANDS = [
	{ id: "app.theme.toggle", label: "Toggle Dark Mode", hidden: false, withArgs: false, group: "App" },
	{ id: "app.pallete.toggle", label: "", hidden: true, withArgs: false, group: "App" },
	{ id: "app.pallete.close", label: "", hidden: true, withArgs: false, group: "App" },
	{ id: "app.sidebar.toggle", label: "Toggle Sidebar", hidden: false, withArgs: false, group: "App" },
	{ id: "app.statusbar.toggle", label: "Toggle Statusbar", hidden: false, withArgs: false, group: "App" },
	{ id: "app.downloadTTS", label: "Setup Read Aloud", hidden: false, withArgs: true, group: "App" },

	{ id: "library.refreshCovers", label: "Refresh Covers", hidden: false, withArgs: false, group: "Library" },
	{ id: "library.scan", label: "Scan", hidden: false, withArgs: false, group: "Library" },
	{ id: "library.folderSelect", label: "Select Folder", hidden: false, withArgs: true, group: "Library" },

	{ id: "pdf.fitHeight", label: "Fit to Page Height", hidden: false, withArgs: false, group: "Viewer" },
	{ id: "pdf.fitWidth", label: "Fit to Page Width", hidden: false, withArgs: false, group: "Viewer" },
	{ id: "pdf.nextPage", label: "Go to Next Page", hidden: false, withArgs: false, group: "Viewer" },
	{ id: "pdf.prevPage", label: "Go to Previous Page", hidden: false, withArgs: false, group: "Viewer" },
	{ id: "pdf.gotoFirstPage", label: "Go to First Page", hidden: false, withArgs: false, group: "Viewer" },
	{ id: "pdf.gotoLastPage", label: "Go to Last Page", hidden: false, withArgs: false, group: "Viewer" },
	{ id: "pdf.rotateClockwise", label: "Rotate Clockwise", hidden: false, withArgs: false, group: "Viewer" },
	{ id: "pdf.rotateAntiClockwise", label: "Rotate Anticlockwise", hidden: false, withArgs: false, group: "Viewer" },
	{ id: "pdf.viewModeScrollV", label: "Vertical Scrolling View", hidden: false, withArgs: false, group: "Viewer" },
	{ id: "pdf.viewModeScrollH", label: "Horizontal Scrolling View", hidden: false, withArgs: false, group: "Viewer" },
	{ id: "pdf.viewModeSinglePage", label: "Single Page View", hidden: false, withArgs: false, group: "Viewer" },
	{ id: "pdf.deleteAnnotation", label: "Delete Selected Highlight", hidden: true, withArgs: true, group: "Viewer" },
	{ id: "pdf.updateAnnotation", label: "Edit Selected Highlight", hidden: true, withArgs: true, group: "Viewer" },
	{ id: "pdf.addBookmark", label: "Add Bookmark", hidden: true, group: "Viewer" },
	{ id: "pdf.deleteBookmark", label: "Delete Bookmark", hidden: true, withArgs: true, group: "Viewer" },
	{ id: "pdf.readAloud", label: "Toggle Read Aloud", hidden: false, withArgs: false, group: "Viewer" },
	{ id: "pdf.zoomIn", label: "Zoom In", hidden: true, withArgs: false, group: "Viewer" },
	{ id: "pdf.zoomOut", label: "Zoom Out", hidden: true, withArgs: false, group: "Viewer" },
	{ id: "pdf.scrollDown", label: "Scroll Document Down", hidden: true, withArgs: false, group: "Viewer" },
	{ id: "pdf.scrollUp", label: "Scroll Document Up", hidden: true, withArgs: false, group: "Viewer" }
] as const

export type CommandId = (typeof COMMANDS)[number]["id"]
export type Command = { id: CommandId; label: string; hidden: boolean; withArgs: boolean }
export type CommandContext = { event?: KeyboardEvent; count?: number; arg?: string | number }
export type CommandHandler = (context: CommandContext) => void

const commandRegistry = new Map<CommandId, CommandHandler>()

function registerCommand(command: CommandId, handler: CommandHandler): () => void {
	commandRegistry.set(command, handler)

	return function unregister() {
		const currentHandler = commandRegistry.get(command)
		if (currentHandler === handler) {
			commandRegistry.delete(command)
		}
	}
}

function executeCommand(command: CommandId, context: CommandContext = {}): boolean {
	const handler = commandRegistry.get(command)
	if (!handler) return false

	handler(context)
	return true
}

export const commands = { COMMANDS, registerCommand, executeCommand }
