import { usePDFSlick } from "@pdfslick/solid"
import { Bookmark } from "lucide-solid"
import { createEffect, onCleanup, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { documentApi } from "../../../api/documentApi"
import { useSideBarContext } from "../../../app/contexts/SideBarContext"
import { createDocumentStore, type PDFRect } from "../../../stores/createDocumentStore"
import { createDocumentSync } from "../primitives/createDocumentSync"
import { createPDFGestures } from "../primitives/createPDFGestures"
import { createPDFHighlights } from "../primitives/createPDFHighlight"
import { createPDFKeybinds } from "../primitives/createPDFKeybinds"
import { createPDFLayout } from "../primitives/createPDFLayout"
import { createTTS } from "../primitives/createTTS"
import HighlightToolbar from "./HighlightToolbar"
import styles from "./PDFViewer.module.css"

export type ViewerStore = {
	docId: string
	showToolbar: boolean
	anchorRef: HTMLElement | undefined
	selectedColor: string
	annotationId: string | null
	ttsHighlight: { page: number; rects: PDFRect[] } | null
}

type PDFViewerProps = { id: string }

export default function PDFViewer(props: PDFViewerProps) {
	let containerRef!: HTMLDivElement
	const url = documentApi.getFileUrl(props.id)
	const { setTocState, setNavigate } = useSideBarContext()

	const { viewerRef, pdfSlickStore, PDFSlickViewer, error } = usePDFSlick(url, {
		scaleValue: "page-fit",
		removePageBorders: true,
		getDocumentParams: {
			rangeChunkSize: 65536,
			disableAutoFetch: true,
			disableStream: false
		}
	})

	createEffect(() => {
		if (error()) {
			setTocState({ status: "error", outline: null })
		} else if (pdfSlickStore.pagesReady) {
			setTocState({ status: "ready", outline: pdfSlickStore.documentOutline })
			setNavigate(() => (dest: string | any[]) =>
				pdfSlickStore.pdfSlick?.linkService.goToDestination(dest)
			)
			console.log(pdfSlickStore.documentOutline)
		} else {
			setTocState({ status: "loading", outline: null })
		}
	})
	onCleanup(() => setTocState({ status: "empty", outline: null }))

	const [viewerStore, setViewerStore] = createStore<ViewerStore>({
		docId: props.id,
		annotationId: null,
		anchorRef: undefined,
		selectedColor: "#ffd400",
		showToolbar: false,
		ttsHighlight: null
	})

	const { store: documentStore, actions } = createDocumentStore(props.id)
	const { minScale, maxScale } = createPDFLayout(pdfSlickStore)
	createDocumentSync(props.id, actions)
	createPDFGestures(pdfSlickStore, () => containerRef, minScale, maxScale, viewerStore)
	createPDFKeybinds(pdfSlickStore, viewerStore, actions, minScale, maxScale)
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

	return (
		<div ref={containerRef} class="pdfslick-container pdfSlick">
			<div>
				<PDFSlickViewer {...{ store: pdfSlickStore, viewerRef }} />
			</div>

			<HighlightToolbar
				open={viewerStore.showToolbar}
				anchorRef={viewerStore.anchorRef}
				setViewerStore={setViewerStore}
				onSelectColor={(color) => {
					setViewerStore("selectedColor", color)
					setViewerStore((prev) => ({
						...prev,
						showToolbar: false,
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
