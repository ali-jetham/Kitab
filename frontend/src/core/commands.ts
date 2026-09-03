export const COMMANDS = [
	{ id: "library.refreshCovers", label: "Library: Refresh Covers", hidden: false },
	{ id: "library.scan", label: "Library: Scan", hidden: false },

	{ id: "pdf.fitHeight", label: "Viewer: Fit to Page Height", hidden: false },
	{ id: "pdf.fitWidth", label: "Viewer: Fit to Page Width", hidden: false },
	{ id: "pdf.nextPage", label: "Viewer: Go to Next Page", hidden: false },
	{ id: "pdf.prevPage", label: "Viewer: Go to Previous Page", hidden: false },
	{ id: "pdf.gotoFirstPage", label: "Viewer: Go to First Page", hidden: false },
	{ id: "pdf.gotoLastPage", label: "Viewer: Go to Last Page", hidden: false },
	{ id: "pdf.rotateClockwise", label: "Viewer: Rotate Clockwise", hidden: false },
	{ id: "pdf.rotateAntiClockwise", label: "Viewer: Rotate Anti Clockwise", hidden: false },
	{ id: "pdf.viewModeScrollV", label: "Viewer: Vertical Scrolling View", hidden: false },
	{ id: "pdf.viewModeScrollH", label: "Viewer: Horizontal Scrolling View", hidden: false },
	{ id: "pdf.viewModeSinglePage", label: "Viewer: Single Page View", hidden: false },
	{ id: "pdf.deleteHighlight", label: "Delete selected highlight", hidden: true },
	{ id: "pdf.addBookmark", label: "Add Bookmark", hidden: true },

	{ id: "pdf.zoomIn", label: "Zoom In", hidden: true },
	{ id: "pdf.zoomOut", label: "Zoom Out", hidden: true },
	{ id: "pdf.scrollDown", label: "Scroll Document Down", hidden: true },
	{ id: "pdf.scrollUp", label: "Scroll Document Up", hidden: true },

	{ id: "app.modal.toggle", label: "", hidden: true },
	{ id: "app.modal.close", label: "", hidden: true },
	{ id: "app.sidebar.toggle", label: "App: Toggle Sidebar", hidden: false },
	{ id: "app.downloadTTS", label: "App: Setup TTS", hidden: false },

	{ id: "modal.next", label: "", hidden: true },
	{ id: "modal.prev", label: "", hidden: true },
	{ id: "modal.select", label: "", hidden: true },
	{ id: "modal.argument", label: "", hidden: true }
] as const;
