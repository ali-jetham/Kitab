import { PendingAnnotation } from "../features/viewers/primitives/createPDFHighlight"
import type { AnnotationCreate, AnnotationUpdate } from "../stores/createDocumentStore"

// biome-ignore format: Manual formatting
const COMMANDS = [
	{ id: "app.theme.toggle",      label: "Toggle Dark Mode",          hidden: false, withArgs: false, group: "App" },
	{ id: "app.pallete.toggle",    label: "",                          hidden: true,  withArgs: false, group: "App" },
	{ id: "app.sidebar.toggle",    label: "Toggle Sidebar",            hidden: false, withArgs: false, group: "App" },
	{ id: "app.statusbar.toggle",  label: "Toggle Statusbar",          hidden: false, withArgs: false, group: "App" },
	{ id: "app.downloadTTS",       label: "Setup Read Aloud",          hidden: false, withArgs: true,  group: "App" },

	{ id: "library.refreshCovers", label: "Refresh Covers",            hidden: false, withArgs: false, group: "Library" },
	{ id: "library.folderSelect",  label: "Select Folder",             hidden: true,  withArgs: true,  group: "Library" },

	{ id: "pdf.fitH",              label: "Fit to Page Height",        hidden: false, withArgs: false, group: "PDF" },
	{ id: "pdf.fitW",              label: "Fit to Page Width",         hidden: false, withArgs: false, group: "PDF" },
	{ id: "pdf.pageN",             label: "Go to Next Page",           hidden: false, withArgs: false, group: "PDF" },
	{ id: "pdf.pageP",             label: "Go to Previous Page",       hidden: false, withArgs: false, group: "PDF" },
	{ id: "pdf.gotoFirstPage",     label: "Go to First Page",          hidden: false, withArgs: false, group: "PDF" },
	{ id: "pdf.gotoLastPage",      label: "Go to Last Page",           hidden: false, withArgs: false, group: "PDF" },
	{ id: "pdf.rotateCW",          label: "Rotate Clockwise",          hidden: false, withArgs: false, group: "PDF" },
	{ id: "pdf.rotateACW",         label: "Rotate Anticlockwise",      hidden: false, withArgs: false, group: "PDF" },
	{ id: "pdf.ScrollV",           label: "Vertical Scrolling View",   hidden: false, withArgs: false, group: "PDF" },
	{ id: "pdf.ScrollH",           label: "Horizontal Scrolling View", hidden: false, withArgs: false, group: "PDF" },
	{ id: "pdf.SinglePage",        label: "Single Page View",          hidden: false, withArgs: false, group: "PDF" },
	{ id: "pdf.annotation.a",      label: "Add Highlight",             hidden: true,  withArgs: true,  group: "PDF" },
	{ id: "pdf.annotation.u",      label: "Edit Selected Highlight",   hidden: true,  withArgs: true, group:  "PDF" },
	{ id: "pdf.annotation.d",      label: "Delete Selected Highlight", hidden: true,  withArgs: true, group:  "PDF" },
	{ id: "pdf.bookmark.a",        label: "Add Bookmark",              hidden: true,  withArgs: false, group: "PDF" },
	{ id: "pdf.bookmark.d",        label: "Delete Bookmark",           hidden: true,  withArgs: true,  group: "PDF" },
	{ id: "pdf.readAloud",         label: "Toggle Read Aloud",         hidden: false, withArgs: false, group: "PDF" },
	{ id: "pdf.zoomIn",            label: "Zoom In",                   hidden: true,  withArgs: false, group: "PDF" },
	{ id: "pdf.zoomOut",           label: "Zoom Out",                  hidden: true,  withArgs: false, group: "PDF" },
	{ id: "pdf.scrollDown",        label: "Scroll Document Down",      hidden: true,  withArgs: false, group: "PDF" },
	{ id: "pdf.scrollUp",          label: "Scroll Document Up",        hidden: true,  withArgs: false, group: "PDF" },

	{ id: "epub.goLeft",           label: "Scroll Left",               hidden: false, withArgs: false, group: "EPUB" },
	{ id: "epub.goRight",          label: "Scroll Right",              hidden: false, withArgs: false, group: "EPUB" },
	{ id: "epub.sectionN",         label: "Next Section",              hidden: false, withArgs: false, group: "EPUB" },
	{ id: "epub.sectionP",         label: "Previous Section",          hidden: false, withArgs: false, group: "EPUB" },
	{ id: "epub.Scrolled",        label: "Scrolling Mode",             hidden: false, withArgs: false, group: "EPUB" },
	{ id: "epub.Paginated",        label: "Paginated Mode",            hidden: false, withArgs: false, group: "EPUB" },
	{ id: "epub.textIn",           label: "Zoom In",                   hidden: false, withArgs: false, group: "EPUB" },
	{ id: "epub.textDec",          label: "Zoom Out",                  hidden: false, withArgs: false, group: "EPUB" },
	{ id: "epub.textReset",        label: "Zoom Reset",                hidden: false, withArgs: false, group: "EPUB" },
] as const

type CommandArgs = {
	"pdf.annotation.a": PendingAnnotation
	"pdf.annotation.u": { id: string; annotation: AnnotationUpdate }
	"pdf.annotation.d": { id: string }
	"pdf.bookmark.d": { id: string }
	"library.folderSelect": string
	"app.downloadTTS": string
}

export type CommandId = (typeof COMMANDS)[number]["id"]
export type Command = {
	id: CommandId
	label: string
	hidden: boolean
	withArgs: boolean
}
export type Context = "app" | "palette" | "pdf" | "epub"
export type CommandContext<K extends CommandId = CommandId> = {
	event?: KeyboardEvent
	count?: number
	arg?: K extends keyof CommandArgs ? CommandArgs[K] : unknown
}
export type CommandHandler<K extends CommandId = CommandId> = (context: CommandContext<K>) => void

const commandRegistry = new Map<CommandId, CommandHandler<any>>()

function registerCommand<K extends CommandId>(command: K, handler: CommandHandler<K>): () => void {
	commandRegistry.set(command, handler)

	return function unregister() {
		if (commandRegistry.get(command) === handler) {
			commandRegistry.delete(command)
		}
	}
}

function executeCommand<K extends CommandId>(command: K, context: CommandContext<K> = {}): boolean {
	const handler = commandRegistry.get(command)
	if (!handler) return false

	handler(context)
	return true
}

export const commands = { COMMANDS, registerCommand, executeCommand }
