import { Bookmark } from "@lucide/solid"
import { usePDFSlick } from "@pdfslick/solid"
import "@pdfslick/solid/dist/pdf_viewer.css"
import { Portal } from "@solidjs/web"
import { createEffect, createStore, onCleanup, onSettled, Show, untrack } from "solid-js"
import { documentApi } from "../../../api/documentApi"
import type { PDFRect } from "../../../api/types/types.gen"
import { useAppContext } from "../../../app/contexts/AppContext"
import { useSideBarContext } from "../../../app/contexts/SideBarContext"
import { useStatusBarContext } from "../../../app/contexts/StatusBarContext"
import { commands } from "../../../core/commands"
import { helper } from "../../../core/helper"
import { createDocumentStore } from "../../../stores/createDocumentStore"
import { createPDFCommands } from "../primitives/createPDFCommands"
import { createPDFGestures } from "../primitives/createPDFGestures"
import { createPDFHighlights, type PendingAnnotation } from "../primitives/createPDFHighlight"
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
	pendingAnnotation: PendingAnnotation | null
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
		pendingAnnotation: null,
		anchorRef: undefined,
		selectedColor: "#ffd400",
		showHighlightToolbar: false,
		ttsHighlight: null
	})
	const { documentStore, actions } = createDocumentStore(props.id)
	const { minScale, maxScale } = createPDFLayout(pdfSlickStore, pdfSlick)
	createPDFCommands(
		props.id,
		pdfSlickStore,
		pdfSlick,
		viewerStore,
		setViewerStore,
		actions,
		minScale,
		maxScale
	)
	const el = createPDFGestures(pdfSlickStore, pdfSlick, minScale, maxScale, viewerStore)
	createTTS(setViewerStore, pdfSlickStore, props.id)
	createPDFHighlights(
		pdfSlickStore,
		pdfSlick,
		actions,
		setViewerStore,
		() => viewerStore.ttsHighlight
	)
	const hasBookmark = () => {
		if (!pdfSlickStore.pageNumber) return false
		return documentStore.bookmarks.some((bm) => bm.page === pdfSlickStore.pageNumber)
	}

	onSettled(() => {
		setAppStore((draft) => {
			draft.context = "PDF"
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
					draft.tocState.status = "error"
				})
			} else if (pagesReady) {
				setDocumentStore(documentStore)
				setSideBarStore((draft) => {
					draft.tocState = {
						status: "ready",
						outline: untrack(() => outline?.map(helper.fromPDFOutline) ?? null)
					}
					// biome-ignore lint/suspicious/noExplicitAny: string | any[] is the type signature of the method
					draft.navigate = (dest) => pdfSlick()?.linkService.goToDestination(dest as string | any[])
				})
			} else {
				setSideBarStore((draft) => {
					draft.tocState.status = "loading"
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
		setDocumentStore(undefined)
		setSideBarStore((draft) => {
			draft.tocState.status = "empty"
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
						if (!viewerStore.pendingAnnotation) return
						commands.executeCommand("pdf.annotation.a", {
							arg: { ...viewerStore.pendingAnnotation, color }
						})
						window.getSelection()?.removeAllRanges()
						setViewerStore((draft) => {
							draft.selectedColor = color
							draft.showHighlightToolbar = false
							draft.pendingAnnotation = null
						})
					}}
				/>

				<Show when={hasBookmark()}>
					<Bookmark class={styles.bookmark} />
				</Show>
			</div>
		</>
	)
}
