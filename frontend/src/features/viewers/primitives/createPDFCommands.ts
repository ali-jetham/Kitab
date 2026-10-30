import { DEFAULT_SCALE_DELTA, type PDFSlick, type PDFSlickState, ScrollMode } from "@pdfslick/core"
import { createElementSize } from "@solid-primitives/resize-observer"
import { type Accessor, createEffect, onCleanup } from "solid-js"
import { StoreSetter } from "solid-js"
import { annotationApi } from "../../../api/annotationApi"
import { bookmarkApi } from "../../../api/bookmarkApi"
import { CommandId, commands } from "../../../core/commands"
import { ViewerStore } from "../components/PDFViewer"

export function createPDFCommands(
	pdfSlickStore: PDFSlickState,
	pdfSlick: Accessor<PDFSlick>,
	viewerStore: ViewerStore,
	setViewerStore: StoreSetter<ViewerStore>,
	actions: any,
	minScale: Accessor<number>,
	maxScale: Accessor<number>
) {
	const viewerSize = createElementSize(() => pdfSlickStore.pdfSlick?.viewer.container)
	const activePageSize = createElementSize(() => {
		if (pdfSlickStore.scrollMode !== 3) return
		return pdfSlickStore.pdfSlick?.viewer.getPageView(pdfSlickStore.pageNumber - 1)?.div
	})

	createEffect(() => viewerSize, (viewerSize) => {
		if (pdfSlickStore.scrollMode === ScrollMode.PAGE) {
			const page = pdfSlickStore.pdfSlick?.viewer.getPageView(pdfSlickStore.pageNumber - 1)
			const containerHeight = viewerSize.clientHeight
			const pageHeight = activePageSize.clientHeight
			if (!page || containerHeight == null || pageHeight == null) return
			page.div.style.marginTop = `${Math.max(0, (containerHeight - pageHeight) / 2)}px`
			page.div.style.marginBottom = "0"

			onCleanup(() => {
				page.div.style.marginTop = ""
				page.div.style.marginBottom = ""
			})
		}
	})

	const unregisters = [
		commands.registerCommand("pdf.fitHeight", () => {
			pdfSlick().currentScaleValue = "page-fit"
		}),
		commands.registerCommand("pdf.fitWidth", () => {
			pdfSlick().currentScaleValue = "page-width"
		}),
		commands.registerCommand("pdf.zoomIn", () => {
			let newScale = pdfSlickStore.scale * DEFAULT_SCALE_DELTA
			if (newScale > maxScale()) newScale = maxScale()
			pdfSlick().currentScale = newScale
		}),
		commands.registerCommand("pdf.zoomOut", () => {
			let newScale = pdfSlickStore.scale / DEFAULT_SCALE_DELTA
			if (newScale < minScale()) newScale = minScale()
			pdfSlick().currentScale = newScale
		}),
		commands.registerCommand("pdf.nextPage", () => pdfSlick()?.viewer.nextPage()),
		commands.registerCommand("pdf.prevPage", () => pdfSlick()?.viewer.previousPage()),
		commands.registerCommand("pdf.gotoFirstPage", () => pdfSlick().viewer.currentPageNumber = 1),
		commands.registerCommand(
			"pdf.gotoLastPage",
			() => pdfSlick().viewer.currentPageNumber = pdfSlick().document?.numPages!
		),
		commands.registerCommand("pdf.rotateClockwise", () => pdfSlick().setRotation(pdfSlickStore.pagesRotation + 90)),
		commands.registerCommand("pdf.rotateAntiClockwise", () => pdfSlick().setRotation(pdfSlickStore.pagesRotation - 90)),
		commands.registerCommand(
			"pdf.scrollDown",
			() => pdfSlick().viewer.container.scrollBy({ top: 100, behavior: "instant" })
		),
		commands.registerCommand(
			"pdf.scrollUp",
			() => pdfSlick().viewer.container.scrollBy({ top: -100, behavior: "instant" })
		),
		commands.registerCommand("pdf.viewModeScrollV", () => pdfSlick().setScrollMode(ScrollMode.VERTICAL)),
		commands.registerCommand("pdf.viewModeScrollH", () => pdfSlick().setScrollMode(ScrollMode.HORIZONTAL)),
		commands.registerCommand("pdf.viewModeSinglePage", () => pdfSlick().setScrollMode(ScrollMode.PAGE)),
		commands.registerCommand("pdf.deleteAnnotation", ({ arg }) => {
			let id
			if (typeof arg === "string") id = arg
			else if (viewerStore.annotationId) id = viewerStore.annotationId
			else return
			actions.deleteAnnotation(id)
			annotationApi.deleteAnnotation(id)
			setViewerStore(draft => {
				draft.annotationId = null
			})
		}),
		commands.registerCommand("pdf.addBookmark", () => {
			actions.addBookmark({ docId: viewerStore.docId, note: "", page: pdfSlick().viewer.currentPageNumber })
			bookmarkApi.addBookmark({ docId: viewerStore.docId, note: "", page: pdfSlick().viewer.currentPageNumber })
		}),
		commands.registerCommand("pdf.deleteBookmark", ({ arg }) => {
			console.log("pdf.deletebookmark called")
			if (typeof arg !== "number") return
			bookmarkApi.deleteBookmark(arg)
			actions.deleteBookmark(arg)
		}),
		commands.registerCommand("pdf.updateAnnotation", ({ arg }) => {
			actions.updateAnnotation(arg.id, arg.annotation)
			annotationApi.updateAnnotation(arg.id, arg.annotation)
		})
	]

	onCleanup(() => {
		for (const unregister of unregisters) {
			unregister()
		}
	})
}
