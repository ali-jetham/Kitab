import { DEFAULT_SCALE_DELTA, type PDFSlick, type PDFSlickState, ScrollMode } from "@pdfslick/core"
import { type Accessor, onCleanup, type StoreSetter } from "solid-js"
import { v7 as uuidv7 } from "uuid"
import { annotationApi } from "../../../api/annotationApi"
import { bookmarkApi } from "../../../api/bookmarkApi"
import { commands } from "../../../core/commands"
import type { ViewerStore } from "../components/PDFViewer"
import { AnnotationCreate } from "../../../stores/createDocumentStore"

export function createPDFCommands(
	docId: string,
	pdfSlickStore: PDFSlickState,
	pdfSlick: Accessor<PDFSlick>,
	viewerStore: ViewerStore,
	setViewerStore: StoreSetter<ViewerStore>,
	actions: any,
	minScale: Accessor<number>,
	maxScale: Accessor<number>
) {
	const unregisters = [
		commands.registerCommand("pdf.fitH", () => {
			pdfSlick().currentScaleValue = "page-fit"
		}),
		commands.registerCommand("pdf.fitW", () => {
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
		commands.registerCommand("pdf.pageN", () => pdfSlick()?.viewer.nextPage()),
		commands.registerCommand("pdf.pageP", () => pdfSlick()?.viewer.previousPage()),
		commands.registerCommand("pdf.gotoFirstPage", () => (pdfSlick().viewer.currentPageNumber = 1)),
		commands.registerCommand(
			"pdf.gotoLastPage",
			() => (pdfSlick().viewer.currentPageNumber = pdfSlickStore.numPages)
		),
		commands.registerCommand("pdf.rotateCW", () =>
			pdfSlick().setRotation(pdfSlickStore.pagesRotation + 90)
		),
		commands.registerCommand("pdf.rotateACW", () =>
			pdfSlick().setRotation(pdfSlickStore.pagesRotation - 90)
		),
		commands.registerCommand("pdf.scrollDown", () =>
			pdfSlick().viewer.container.scrollBy({ top: 100, behavior: "instant" })
		),
		commands.registerCommand("pdf.scrollUp", () =>
			pdfSlick().viewer.container.scrollBy({ top: -100, behavior: "instant" })
		),
		commands.registerCommand("pdf.ScrollV", () => pdfSlick().setScrollMode(ScrollMode.VERTICAL)),
		commands.registerCommand("pdf.ScrollH", () => pdfSlick().setScrollMode(ScrollMode.HORIZONTAL)),
		commands.registerCommand("pdf.SinglePage", () => pdfSlick().setScrollMode(ScrollMode.PAGE)),
		commands.registerCommand("pdf.annotation.a", ({ arg }) => {
			if (!arg) return
			const annotation: AnnotationCreate = {
				id: uuidv7(),
				docId: docId,
				style: "highlight",
				color: arg.color,
				note: "",
				page: arg.page,
				text: arg.text,
				rects: arg.rects
			}
			actions.addAnnotation(annotation)
			annotationApi.addAnnotation(annotation)
		}),
		commands.registerCommand("pdf.annotation.d", ({ arg }) => {
			let id: any
			if (arg?.id) id = arg.id
			else if (viewerStore.annotationId) id = viewerStore.annotationId
			else return
			actions.deleteAnnotation(id)
			annotationApi.deleteAnnotation(id)
			setViewerStore((draft) => {
				draft.annotationId = null
			})
		}),
		commands.registerCommand("pdf.bookmark.a", () => {
			actions.addBookmark({
				docId: viewerStore.docId,
				note: "",
				page: pdfSlick().viewer.currentPageNumber
			})
			bookmarkApi.addBookmark({
				id: uuidv7(),
				docId: viewerStore.docId,
				note: "",
				page: pdfSlick().viewer.currentPageNumber
			})
		}),
		commands.registerCommand("pdf.bookmark.d", ({ arg }) => {
			if (!arg) return
			bookmarkApi.deleteBookmark(arg.id)
			actions.deleteBookmark(arg.id)
		}),
		commands.registerCommand("pdf.annotation.u", ({ arg }) => {
			if (!arg) return
			actions.updateAnnotation(arg.id, arg.annotation)
			annotationApi.updateAnnotation(arg.id, arg.annotation)
		})
	]

	onCleanup(() => {
		unregisters.forEach((unregister) => {
			unregister()
		})
	})
}
