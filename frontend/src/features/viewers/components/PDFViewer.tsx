import { usePDFSlick } from "@pdfslick/solid"
import { Bookmark } from "lucide-solid"
import { createEffect, onCleanup, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { documentApi } from "../../../api/documentApi"
import { useSideBarContext } from "../../../app/contexts/SideBarContext"
import { useStatusBarContext } from "../../../app/contexts/StatusBarContext"
import { createDocumentStore, type PDFRect } from "../../../stores/createDocumentStore"
import { createDocumentSync } from "../primitives/createDocumentSync"
import { createPDFCommands } from "../primitives/createPDFCommands"
import { createPDFGestures } from "../primitives/createPDFGestures"
import { createPDFHighlights } from "../primitives/createPDFHighlight"
import { createPDFLayout } from "../primitives/createPDFLayout"
import { createTTS } from "../primitives/createTTS"
import HighlightToolbar from "./HighlightToolbar"
import styles from "./PDFViewer.module.css"

export type ViewerStore = {
	docId: string
	showHighlightToolbar: boolean
	anchorRef: HTMLElement | undefined
	selectedColor: string
	annotationId: string | null
	ttsHighlight: { page: number; rects: PDFRect[] } | null
}

type PDFViewerProps = { id: string }

export default function PDFViewer(props: PDFViewerProps) {
	let containerRef!: HTMLDivElement
	const url = documentApi.getFileUrl(props.id)
	const { setSideBarStore } = useSideBarContext()
	const { setStatusStore } = useStatusBarContext()

	const { viewerRef, pdfSlickStore, PDFSlickViewer, error } = usePDFSlick(url, {
		scaleValue: "page-fit",
		removePageBorders: true,
		getDocumentParams: {
			rangeChunkSize: 65536,
			disableAutoFetch: true,
			disableStream: false
		}
	})

	const [viewerStore, setViewerStore] = createStore<ViewerStore>({
		docId: props.id,
		annotationId: null,
		anchorRef: undefined,
		selectedColor: "#ffd400",
		showHighlightToolbar: false,
		ttsHighlight: null
	})

	const { store: documentStore, actions } = createDocumentStore(props.id)
	const { minScale, maxScale } = createPDFLayout(pdfSlickStore)
	createDocumentSync(props.id, actions)
	createPDFGestures(pdfSlickStore, () => containerRef, minScale, maxScale, viewerStore)
	createPDFCommands(
		pdfSlickStore,
		viewerStore,
		setViewerStore,
		actions,
		minScale,
		maxScale
	)
	createTTS(setViewerStore, pdfSlickStore, props.id)
	const highlights = createPDFHighlights(
		pdfSlickStore,
		props.id,
		actions,
		viewerStore.selectedColor,
		setViewerStore,
		() => viewerStore.ttsHighlight
	)
	const hasBookmark = () => {
		const currentPage = pdfSlickStore.pageNumber
		if (!currentPage) return false
		return documentStore.bookmarks.some(bm => bm.page === currentPage)
	}

	createEffect(() => {
		if (error()) {
			setSideBarStore("tocState", { status: "error", outline: null })
		} else if (pdfSlickStore.pagesReady) {
			setSideBarStore("tocState", {
				status: "ready",
				outline: pdfSlickStore.documentOutline
			})
			console.log(pdfSlickStore.documentOutline)
			setSideBarStore(
				"navigate",
				() => (dest: string | any[]) =>
					pdfSlickStore.pdfSlick?.linkService.goToDestination(dest)
			)
			setSideBarStore("annotations", documentStore.annotations)
			setSideBarStore("bookmarks", documentStore.bookmarks)
			setStatusStore("currentPage", pdfSlickStore.pageNumber)
			setStatusStore("totalPages", pdfSlickStore.numPages)
		} else {
			setSideBarStore("tocState", { status: "loading", outline: null })
		}
	})
	onCleanup(() => {
		setSideBarStore("tocState", { status: "empty", outline: null })
		setSideBarStore("annotations", null)
		setSideBarStore("bookmarks", null)
		setStatusStore("currentPage", null)
		setStatusStore("totalPages", null)
	})

	return (
		<div ref={containerRef} class="pdfslick-container pdfSlick">
			<div>
				<PDFSlickViewer {...{ store: pdfSlickStore, viewerRef }} />
			</div>

			<HighlightToolbar
				open={viewerStore.showHighlightToolbar}
				anchorRef={viewerStore.anchorRef}
				setViewerStore={setViewerStore}
				onSelectColor={(color) => {
					setViewerStore("selectedColor", color)
					setViewerStore((prev) => ({
						...prev,
						showHighlightToolbar: false,
						anchorRef: undefined
					}))
					highlights.commitAnnotation(color)
				}}
			/>

			<Show when={hasBookmark()}>
				<div class={styles.bookmark}>
					<Bookmark fill="red" stroke="red" />
				</div>
			</Show>
		</div>
	)
}
