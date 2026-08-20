import { type TEventBusEvent, usePDFSlick } from "@pdfslick/solid";
import { createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";
import { render } from "solid-js/web";
import { createBookStore } from "../../../stores/createBookStore";
import { usePDFGestures } from "../primitives/createPDFGestures";
import { getPageDimensions, usePDFHighlights } from "../primitives/createPDFHighlight";
import { usePDFKeybinds } from "../primitives/createPDFKeybinds";
import HighlightToolbar, { HighlightToolbarProps } from "./HighlightToolbar";
import PDFHighlightLayer from "./PDFHighlightLayer";

type PDFViewerProps = { id: string; };
export type ToolbarState = { open: boolean; anchorRef: HTMLElement | undefined; };

export default function PDFViewer(props: PDFViewerProps) {
	let containerRef!: HTMLDivElement;

	const url = `api/docs/${props.id}/file`;
	const { viewerRef, pdfSlickStore, PDFSlickViewer } = usePDFSlick(url, {
		scaleValue: "page-fit",
		getDocumentParams: {
			rangeChunkSize: 65536,
			disableAutoFetch: true,
			disableStream: false
		}
	});

	const [toolbarState, setToolbarState] = createSignal<ToolbarState>({
		open: false,
		anchorRef: undefined
	});
	const [selectedColor, setSelectedColor] = createSignal("#ffd400");

	const { store, addAnnotation, deleteAnnotation, getAnnotationsByPage } = createBookStore(props.id);
	usePDFGestures(pdfSlickStore, () => containerRef);
	usePDFKeybinds(pdfSlickStore);
	const highlights = usePDFHighlights(
		pdfSlickStore,
		addAnnotation,
		props.id,
		selectedColor,
		setToolbarState
	);

	function handlePageRendered(e: TEventBusEvent) {
		const page = pdfSlickStore.pdfSlick?.getPageView(e.pageNumber - 1);
		if (!page) return;
		if (page.div.querySelector("[data-highlightLayer]")) return;

		const annotations = getAnnotationsByPage(e.pageNumber);
		render(() => <PDFHighlightLayer onHighlightDelete={onHighlightDelete} page={page} annotations={annotations} />, page.div);
	}

	function onHighlightDelete(id: string) {
		deleteAnnotation(id)
	}

	createEffect(() => {
		if (!pdfSlickStore.pdfSlick) return;
		pdfSlickStore.pdfSlick.eventBus.on("pagerendered", handlePageRendered);

		onCleanup(() => {
			pdfSlickStore.pdfSlick?.eventBus.off("pagerendered", handlePageRendered);
		});
	});

	onMount(() => {
		document.addEventListener("pointerup", (e) => highlights.handlePointerUp(e));
	});

	onCleanup(() => {
		document.removeEventListener("pointerup", highlights.handlePointerUp); // fix
	});

	return (
		<div ref={containerRef} class="pdfslick-container pdfSlick">
			<div>
				<PDFSlickViewer {...{ store: pdfSlickStore, viewerRef }} />
			</div>

			<HighlightToolbar
				{...toolbarState()}
				setToolbarState={setToolbarState}
				onSelectColor={(color) => {
					setSelectedColor(color);
					setToolbarState(() => ({ open: false, anchorRef: undefined }));
					highlights.commitAnnotation(color);
				}}
			/>
		</div>
	);
}
