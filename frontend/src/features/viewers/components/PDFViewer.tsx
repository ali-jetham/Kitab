import { type TEventBusEvent, usePDFSlick } from "@pdfslick/solid";
import { createEffect, onCleanup, onMount } from "solid-js";
import { render } from "solid-js/web";
import { createBookStore } from "../../../stores/createBookStore";
import { Gestures } from "../lib/gestures";
import { PDFHighlights } from "../lib/pdfHighlight";
import { PDFKeybinds } from "../lib/pdfKeybinds";
import PDFHighlightLayer from "./PDFHighlightLayer";
import styles from "./PDFViewer.module.css";

type PDFViewerProps = { id: string; };

export default function PDFViewer(props: PDFViewerProps) {
	const url = `api/docs/${props.id}/file`;
	const { viewerRef, pdfSlickStore, PDFSlickViewer } = usePDFSlick(url, {
		scaleValue: "page-fit",
		getDocumentParams: {
			rangeChunkSize: 65536,
			disableAutoFetch: true,
			disableStream: false,
		},
	});
	const { store, addAnnotation, getAnnotationsByPage } = createBookStore(
		props.id,
	);
	const gestures = Gestures.make(pdfSlickStore);
	const keybinds = PDFKeybinds.make(pdfSlickStore);
	const highlights = PDFHighlights.make(
		pdfSlickStore,
		addAnnotation,
		props.id,
		store.primaryColor,
	);

	function handlePageRendered(e: TEventBusEvent) {
		const page = pdfSlickStore.pdfSlick?.getPageView(e.pageNumber - 1);
		if (!page) return;
		if (page.div.querySelector("[data-highlightLayer]")) return;

		const { width, height } = highlights.getPageDimensions(page);
		const annotations = getAnnotationsByPage(e.pageNumber);
		render(
			() => (
				<PDFHighlightLayer
					width={width}
					height={height}
					annotations={annotations}
				/>
			),
			page.div,
		);
	}

	createEffect(() => {
		if (!pdfSlickStore.pdfSlick) return;
		pdfSlickStore.pdfSlick.eventBus.on("pagerendered", handlePageRendered);

		onCleanup(() => {
			pdfSlickStore.pdfSlick?.eventBus.off("pagerendered", handlePageRendered);
		});
	});

	onMount(() => {
		document.addEventListener("touchstart", gestures.handleTouchStart, {
			passive: false,
		});
		document.addEventListener("touchmove", gestures.handleTouchMove, {
			passive: false,
		});
		document.addEventListener("touchend", gestures.handleTouchEnd);
		document.addEventListener("pointerup", highlights.handlePointerUp);
	});

	onCleanup(() => {
		document.removeEventListener("touchstart", gestures.handleTouchStart);
		document.removeEventListener("touchmove", gestures.handleTouchMove);
		document.removeEventListener("touchend", gestures.handleTouchEnd);
		document.removeEventListener("pointerup", highlights.handlePointerUp);

		keybinds.destroy();
	});

	return (
		<div class="pdfslick-container pdfSlick">
			<div>
				<PDFSlickViewer {...{ store: pdfSlickStore, viewerRef }} />
			</div>
		</div>
	);
}
