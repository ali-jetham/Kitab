import { DEFAULT_SCALE_DELTA, type PDFSlick, type PDFSlickState, ScrollMode } from "@pdfslick/core"
import { createElementSize } from "@solid-primitives/resize-observer"
import { type Accessor, createEffect, onCleanup } from "solid-js"
import { annotationApi } from "../../../api/annotationApi"
import { bookmarkApi } from "../../../api/bookmarkApi"
import { CommandId, commands } from "../../../core/commands"
import { ViewerStore } from "../components/PDFViewer"

export function createPDFKeybinds(
	pdfSlickStore: PDFSlickState,
	viewerStore: ViewerStore,
	actions: any,
	minScale: Accessor<number>,
	maxScale: Accessor<number>
) {
	const viewerSize = createElementSize(() => pdfSlickStore.pdfSlick?.viewer.container)
	const activePageSize = createElementSize(() => {
		if (pdfSlickStore.scrollMode !== 3) return
		return pdfSlickStore.pdfSlick?.viewer.getPageView(pdfSlickStore.pageNumber - 1)?.div
	})

	createEffect(() => {
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

	function register(commandId: CommandId, callback: (pdf: PDFSlick) => void) {
		return commands.registerCommand(commandId, () => {
			if (!pdfSlickStore.pdfSlick) return
			callback(pdfSlickStore.pdfSlick)
		})
	}

	const unregisters = [
		register("pdf.fitHeight", (pdfSlick) => pdfSlick.currentScaleValue = "page-fit"),
		register("pdf.fitWidth", (pdfSlick) => pdfSlick.currentScale = minScale()),
		register("pdf.zoomIn", (pdfSlick) => {
			let newScale = pdfSlickStore.scale * DEFAULT_SCALE_DELTA
			if (newScale > maxScale()) newScale = maxScale()
			pdfSlick.currentScale = newScale
		}),
		register("pdf.zoomOut", (pdfSlick) => {
			let newScale = pdfSlickStore.scale / DEFAULT_SCALE_DELTA // FIXME: For desktop a different minScale should be used
			if (newScale < minScale()) newScale = minScale()
			pdfSlick.currentScale = newScale
		}),
		register("pdf.nextPage", (pdfSlick) => pdfSlick.viewer.nextPage()),
		register("pdf.prevPage", (pdfSlick) => pdfSlick.viewer.previousPage()),
		register("pdf.gotoFirstPage", (pdfSlick) => pdfSlick.viewer.currentPageNumber = 1),
		register("pdf.gotoLastPage", (pdfSlick) => pdfSlick.viewer.currentPageNumber = pdfSlick.document?.numPages!),
		register("pdf.rotateClockwise", (pdfSlick) => pdfSlick.setRotation(pdfSlickStore.pagesRotation + 90)),
		register("pdf.rotateAntiClockwise", (pdfSlick) => pdfSlick.setRotation(pdfSlickStore.pagesRotation - 90)),
		register("pdf.scrollDown", (pdfSlick) => pdfSlick.viewer.container.scrollBy({ top: 100, behavior: "instant" })),
		register("pdf.scrollUp", (pdfSlick) => pdfSlick.viewer.container.scrollBy({ top: -100, behavior: "instant" })),
		register("pdf.viewModeScrollV", (pdfSlick) => pdfSlick.setScrollMode(ScrollMode.VERTICAL)),
		register("pdf.viewModeScrollH", (pdfSlick) => pdfSlick.setScrollMode(ScrollMode.HORIZONTAL)),
		register("pdf.viewModeSinglePage", (pdfSlick) => pdfSlick.setScrollMode(ScrollMode.PAGE)),
		register("pdf.deleteHighlight", () => {
			if (!viewerStore.annotationId) {
				console.log("Please select an annotation first")
				return
			}
			console.log("Deleting annotation", viewerStore.annotationId)
			actions.deleteAnnotation(viewerStore.annotationId)
			annotationApi.deleteAnnotation(viewerStore.annotationId)
		}),
		register("pdf.addBookmark", (pdfslick) => {
			console.log("Adding bookmark", pdfslick.viewer.currentPageNumber)
			actions.addBookmark(pdfslick.viewer.currentPageNumber)
			bookmarkApi.addBookmark({ docId: viewerStore.docId, note: "", page: pdfslick.viewer.currentPageNumber })
		})
	]

	onCleanup(() => {
		for (const unregister of unregisters) {
			unregister()
		}
	})
}
