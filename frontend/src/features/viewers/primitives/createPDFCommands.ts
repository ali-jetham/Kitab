import { DEFAULT_SCALE_DELTA, type PDFSlick, type PDFSlickState, ScrollMode } from "@pdfslick/core"
import { type Accessor, onCleanup, type StoreSetter } from "solid-js"
import { v7 as uuidv7 } from "uuid"
import { annotationApi } from "../../../api/annotationApi"
import { bookmarkApi } from "../../../api/bookmarkApi"
import type { AnnotationCreate } from "../../../api/types/types.gen"
import { type CommandContext, type CommandId, commands } from "../../../core/commands"
import type { DocumentStoreActions } from "../../../stores/createDocumentStore"
import type { ViewerStore } from "../components/PDFViewer"

export function createPDFCommands(
	docId: string,
	pdfSlickStore: PDFSlickState,
	pdfSlick: Accessor<PDFSlick | null>,
	viewerStore: ViewerStore,
	setViewerStore: StoreSetter<ViewerStore>,
	actions: DocumentStoreActions,
	minScale: Accessor<number>,
	maxScale: Accessor<number>
) {
	function register<K extends CommandId>(
		id: K,
		fn: (slick: PDFSlick, context: CommandContext<K>) => void
	) {
		return commands.registerCommand(id, (context) => {
			const slick = pdfSlick()
			if (slick) fn(slick, context)
		})
	}

	const unregisters = [
		register("pdf.fitH", (pdfSlick) => {
			pdfSlick.currentScaleValue = "page-fit"
		}),
		register("pdf.fitW", (slick) => {
			slick.currentScaleValue = "page-width"
		}),
		register("pdf.zoomIn", (slick) => {
			let newScale = pdfSlickStore.scale * DEFAULT_SCALE_DELTA
			if (newScale > maxScale()) newScale = maxScale()
			slick.currentScale = newScale
		}),
		register("pdf.zoomOut", (slick) => {
			let newScale = pdfSlickStore.scale / DEFAULT_SCALE_DELTA
			if (newScale < minScale()) newScale = minScale()
			slick.currentScale = newScale
		}),
		register("pdf.pageN", (slick) => slick.viewer.nextPage()),
		register("pdf.pageP", (slick) => slick.viewer.previousPage()),
		register("pdf.gotoFirstPage", (slick) => (slick.viewer.currentPageNumber = 1)),
		register(
			"pdf.gotoLastPage",
			(slick) => (slick.viewer.currentPageNumber = pdfSlickStore.numPages)
		),
		register("pdf.rotateCW", (slick) => slick.setRotation(pdfSlickStore.pagesRotation + 90)),
		register("pdf.rotateACW", (slick) => slick.setRotation(pdfSlickStore.pagesRotation - 90)),
		register("pdf.scrollDown", (slick) =>
			slick.viewer.container.scrollBy({ top: 100, behavior: "instant" })
		),
		register("pdf.scrollUp", (slick) =>
			slick.viewer.container.scrollBy({ top: -100, behavior: "instant" })
		),
		register("pdf.ScrollV", (slick) => slick.setScrollMode(ScrollMode.VERTICAL)),
		register("pdf.ScrollH", (slick) => slick.setScrollMode(ScrollMode.HORIZONTAL)),
		register("pdf.SinglePage", (slick) => slick.setScrollMode(ScrollMode.PAGE)),
		register("pdf.annotation.a", (_slick, { arg }) => {
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
		register("pdf.annotation.d", (_slick, { arg }) => {
			let id: string
			if (arg?.id) id = arg.id
			else if (viewerStore.annotationId) id = viewerStore.annotationId
			else return
			actions.deleteAnnotation(id)
			annotationApi.deleteAnnotation(id)
			setViewerStore((draft) => {
				draft.annotationId = null
			})
		}),
		register("pdf.bookmark.a", (slick) => {
			const id = uuidv7()
			actions.addBookmark({
				id,
				docId: viewerStore.docId,
				note: "",
				page: slick.viewer.currentPageNumber
			})
			bookmarkApi.addBookmark({
				id,
				docId: viewerStore.docId,
				note: "",
				page: slick.viewer.currentPageNumber
			})
		}),
		register("pdf.bookmark.d", (_slick, { arg }) => {
			if (!arg) return
			bookmarkApi.deleteBookmark(arg.id)
			actions.deleteBookmark(arg.id)
		}),
		register("pdf.annotation.u", (_slick, { arg }) => {
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
