import { Bookmark } from "@lucide/solid"
import { usePDFSlick } from "@pdfslick/solid"
import { createEffect, onCleanup, Show } from "solid-js"
import { createStore } from "solid-js"
import { documentApi } from "../../../api/documentApi"
import { useSideBarContext } from "../../../app/contexts/SideBarContext"
import { useStatusBarContext } from "../../../app/contexts/StatusBarContext"
import { createDocumentStore, type PDFRect } from "../../../stores/createDocumentStore"
import { createDocumentSync } from "../primitives/createDocumentSync"
import { createPDFCommands } from "../primitives/createPDFCommands"
import { createPDFGestures } from "../primitives/createPDFGestures"
import { createPDFHighlights } from "../primitives/createPDFHighlight"
import { createPDFLayout } from "../primitives/createPDFLayout"
// import { createTTS } from "../primitives/createTTS"
import HighlightToolbar from "./HighlightToolbar"
import "@pdfslick/solid/dist/pdf_viewer.css"
import PDFThumbnails from "./PDFThumbnails"
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

	const {
		viewerRef,
		thumbsRef,
		pdfSlickStore,
		pdfSlick,
		PDFSlickViewer,
		error
	} = usePDFSlick(url, {
		scaleValue: "page-fit",
		removePageBorders: true,
		getDocumentParams: {
			rangeChunkSize: 65536,
			disableAutoFetch: true,
			disableStream: false
		}
	})
	// ;(window as any).raw = pdfSlick
	// ;(window as any).store = pdfSlickStore

	const [viewerStore, setViewerStore] = createStore<ViewerStore>({
		docId: props.id,
		annotationId: null,
		anchorRef: undefined,
		selectedColor: "#ffd400",
		showHighlightToolbar: false,
		ttsHighlight: null
	})

	const { documentStore, actions } = createDocumentStore(props.id)
	const { minScale, maxScale } = createPDFLayout(pdfSlickStore)
	createDocumentSync(props.id, actions)
	createPDFGestures(pdfSlickStore, () => containerRef, minScale, maxScale, viewerStore)
	createPDFCommands(
		pdfSlickStore,
		pdfSlick,
		viewerStore,
		setViewerStore,
		actions,
		minScale,
		maxScale
	)
	// createTTS(setViewerStore, pdfSlickStore, props.id)
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

	createEffect(
		() => ({
			error: error(),
			pagesReady: pdfSlickStore.pagesReady,
			outline: pdfSlickStore.documentOutline,
			page: pdfSlickStore.pageNumber,
			total: pdfSlickStore.numPages
		}),
		({ error, pagesReady, outline }) => {
			if (error) {
				setSideBarStore(draft => {
					draft.tocState = { status: "error", outline: null }
				})
			} else if (pagesReady) {
				setSideBarStore(draft => {
					draft.documentStore = documentStore
					draft.tocState = { status: "ready", outline: outline }
					draft.navigate = (dest: string | any[]) =>
						pdfSlick()?.linkService.goToDestination(dest)
					draft.thumbsRef = thumbsRef
				})
				setStatusStore(draft => {
					draft.currentPage = pdfSlickStore.pageNumber
					draft.totalPages = pdfSlickStore.numPages
				})
			} else {
				setSideBarStore(draft => {
					draft.tocState = { status: "loading", outline: null }
				})
			}
		}
	)
	onCleanup(() => {
		setSideBarStore(draft => {
			draft.tocState = { status: "empty", outline: null }
		})
		setSideBarStore(draft => {
			draft.documentStore = null
		})
		setStatusStore(draft => {
			draft.currentPage = null
		})
		setStatusStore(draft => {
			draft.totalPages = null
		})
	})

	return (
		<div ref={containerRef} class="pdfslick-container pdfSlick">
			<Show
				when={!error()}
				fallback={
					<div class={styles.error}>
						<p>This document couldn't be loaded.</p>
						<p>Consider running the Scan library command.</p>
					</div>
				}
			>
					<PDFSlickViewer viewerRef={viewerRef} store={pdfSlickStore} pdfSlick={pdfSlick}  />
			</Show>

			<HighlightToolbar
				open={viewerStore.showHighlightToolbar}
				anchorRef={viewerStore.anchorRef}
				setViewerStore={setViewerStore}
				onSelectColor={(color) => {
					setViewerStore(draft => {
						draft.selectedColor = color
					})
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
