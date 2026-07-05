import { type TEventBusEvent, usePDFSlick } from "@pdfslick/solid";
import { createEffect, onCleanup } from "solid-js";
import { usePdfGestures } from "../hooks/usePdfGestures";
import { usePdfHighlight } from "../hooks/usePdfHighlight";
import { usePdfKeybinds } from "../hooks/usePdfKeybinds";

type PDFViewerProps = {
	id: string;
};

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

	const { createHighlightLayer } = usePdfHighlight(pdfSlickStore, props.id);
	usePdfGestures(pdfSlickStore);
	usePdfKeybinds(pdfSlickStore);

	function handlePageRendered(e: TEventBusEvent) {
		const page = pdfSlickStore.pdfSlick?.getPageView(e.pageNumber - 1);
		if (!page) return;
		createHighlightLayer(page, e.pageNumber);
	}

	createEffect(() => {
		if (!pdfSlickStore.pdfSlick) return;
		pdfSlickStore.pdfSlick.eventBus.on("pagerendered", handlePageRendered);

		onCleanup(() => {
			pdfSlickStore.pdfSlick?.eventBus.off("pagerendered", handlePageRendered);
		});
	});

	return (
		<div class="pdfslick-container pdfSlick">
			<div>
				<PDFSlickViewer {...{ store: pdfSlickStore, viewerRef }} />
			</div>
		</div>
	);
}
