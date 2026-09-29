const COMMANDS = [
	{ id: "app.modal.toggle", label: "", hidden: true, withArgs: false },
	{ id: "app.modal.close", label: "", hidden: true, withArgs: false },
	{ id: "app.sidebar.toggle", label: "App: Toggle Sidebar", hidden: false, withArgs: false },
	{ id: "app.statusbar.toggle", label: "App: Toggle Statusbar", hidden: false, withArgs: false },
	{ id: "app.downloadTTS", label: "App: Setup Read Aloud", hidden: false, withArgs: true },

	{ id: "library.refreshCovers", label: "Library: Refresh Covers", hidden: false, withArgs: false },
	{ id: "library.scan", label: "Library: Scan", hidden: false, withArgs: false },

	{ id: "pdf.fitHeight", label: "Viewer: Fit to Page Height", hidden: false, withArgs: false },
	{ id: "pdf.fitWidth", label: "Viewer: Fit to Page Width", hidden: false, withArgs: false },
	{ id: "pdf.nextPage", label: "Viewer: Go to Next Page", hidden: false, withArgs: false },
	{ id: "pdf.prevPage", label: "Viewer: Go to Previous Page", hidden: false, withArgs: false },
	{ id: "pdf.gotoFirstPage", label: "Viewer: Go to First Page", hidden: false, withArgs: false },
	{ id: "pdf.gotoLastPage", label: "Viewer: Go to Last Page", hidden: false, withArgs: false },
	{ id: "pdf.rotateClockwise", label: "Viewer: Rotate Clockwise", hidden: false, withArgs: false },
	{ id: "pdf.rotateAntiClockwise", label: "Viewer: Rotate Anti Clockwise", hidden: false, withArgs: false },
	{ id: "pdf.viewModeScrollV", label: "Viewer: Vertical Scrolling View", hidden: false, withArgs: false },
	{ id: "pdf.viewModeScrollH", label: "Viewer: Horizontal Scrolling View", hidden: false, withArgs: false },
	{ id: "pdf.viewModeSinglePage", label: "Viewer: Single Page View", hidden: false, withArgs: false },
	{ id: "pdf.deleteHighlight", label: "Delete selected highlight", hidden: true, withArgs: false },
	{ id: "pdf.addBookmark", label: "Add Bookmark", hidden: true },
	{ id: "pdf.deleteBookmark", label: "Delete Bookmark", hidden: true, withArgs: true },
	{ id: "pdf.readAloud", label: "Viewer: Toggle Read Aloud", hidden: false, withArgs: false },

	{ id: "pdf.zoomIn", label: "Zoom In", hidden: true, withArgs: false },
	{ id: "pdf.zoomOut", label: "Zoom Out", hidden: true, withArgs: false },
	{ id: "pdf.scrollDown", label: "Scroll Document Down", hidden: true, withArgs: false },
	{ id: "pdf.scrollUp", label: "Scroll Document Up", hidden: true, withArgs: false }
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
