import { Bookmark } from "@lucide/solid"
import { usePDFSlick } from "@pdfslick/solid"
import "@pdfslick/solid/dist/pdf_viewer.css"
import { Portal } from "@solidjs/web"
import { createEffect, createStore, onCleanup, onSettled, Show } from "solid-js"
import { documentApi } from "../../../api/documentApi"
import { useAppContext } from "../../../app/contexts/AppContext"
import { useSideBarContext } from "../../../app/contexts/SideBarContext"
import { useStatusBarContext } from "../../../app/contexts/StatusBarContext"
import { helper } from "../../../core/helper"
import { createDocumentStore, type PDFRect } from "../../../stores/createDocumentStore"
import { createPDFCommands } from "../primitives/createPDFCommands"
import { createPDFGestures } from "../primitives/createPDFGestures"
import { createPDFHighlights } from "../primitives/createPDFHighlight"
import { createPDFLayout } from "../primitives/createPDFLayout"
import { createTTS } from "../primitives/createTTS"
import HighlightToolbar from "./HighlightToolbar"
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
	const url = documentApi.getFileUrl(props.id)
	const { sideBarStore, setSideBarStore, setDocumentStore } = useSideBarContext()
	const { setStatusStore } = useStatusBarContext()
	const { setAppStore } = useAppContext()

	const { viewerRef, thumbsRef, pdfSlickStore, pdfSlick, PDFSlickViewer, error } = usePDFSlick(
		url,
		{
			scaleValue: "page-fit",
			removePageBorders: true,
			getDocumentParams: {
				rangeChunkSize: 65536,
				disableAutoFetch: true,
				disableStream: false
			}
		}
	)

	const [viewerStore, setViewerStore] = createStore<ViewerStore>({
		docId: props.id,
		annotationId: null,
		anchorRef: undefined,
		selectedColor: "#ffd400",
		showHighlightToolbar: false,
		ttsHighlight: null
	})

	const { documentStore, actions } = createDocumentStore(props.id)
	const { minScale, maxScale } = createPDFLayout(pdfSlickStore, pdfSlick)
	const el = createPDFGestures(pdfSlickStore, pdfSlick, minScale, maxScale, viewerStore)
	createPDFCommands(
		pdfSlickStore,
		pdfSlick,
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
		if (!pdfSlickStore.pageNumber) return false
		return documentStore.bookmarks.some((bm) => bm.page === pdfSlickStore.pageNumber)
	}

	onSettled(() => {
		setAppStore((draft) => {
			draft.context = "pdf"
		})
	})

	createEffect(
		() => ({
			error: error(),
			pagesReady: pdfSlickStore.pagesReady,
			outline: pdfSlickStore.documentOutline
		}),
		({ error, pagesReady, outline }) => {
			if (error) {
				setSideBarStore((draft) => {
					draft.tocState = { status: "error", outline: null }
				})
			} else if (pagesReady) {
				setDocumentStore(documentStore)
				setSideBarStore((draft) => {
					draft.tocState = { status: "ready", outline: outline?.map(helper.fromPDFOutline) ?? null }
					draft.navigate = (dest) => pdfSlick()?.linkService.goToDestination(dest as string | any[])
				})
			} else {
				setSideBarStore((draft) => {
					draft.tocState = { status: "loading", outline: null }
				})
			}
		}
	)

	createEffect(
		() => ({
			ready: pdfSlickStore.pagesReady,
			page: pdfSlickStore.pageNumber,
			total: pdfSlickStore.numPages
		}),
		({ ready, page, total }) => {
			if (!ready) return
			setStatusStore((draft) => {
				draft.currentPage = page
				draft.totalPages = total
			})
		}
	)

	onCleanup(() => {
		setDocumentStore(null)
		setSideBarStore((draft) => {
			draft.tocState = { status: "empty", outline: null }
		})
		setStatusStore((draft) => {
			draft.currentPage = null
			draft.totalPages = null
		})
	})

	return (
		<>
			<Show when={sideBarStore.thumbnailsSlot}>
				<Portal mount={sideBarStore.thumbnailsSlot!}>
					<PDFThumbnails thumbsRef={thumbsRef} store={pdfSlickStore} pdfSlick={pdfSlick} />
				</Portal>
			</Show>

			<div ref={el} class="pdfslick-container pdfSlick">
				<Show when={!error()} fallback={<p>This document couldn't be loaded.</p>}>
					<PDFSlickViewer viewerRef={viewerRef} store={pdfSlickStore} pdfSlick={pdfSlick} />
				</Show>

				<HighlightToolbar
					open={viewerStore.showHighlightToolbar}
					anchorRef={viewerStore.anchorRef}
					setViewerStore={setViewerStore}
					onSelectColor={(color) => {
						setViewerStore((draft) => {
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
		</>
	)
}
