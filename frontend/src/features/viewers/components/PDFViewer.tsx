import { usePDFSlick } from "@pdfslick/solid";
import { createEffect, createSignal, For, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";
import { registerCommand } from "../../../core/keybinds";
import { usePdfGestures } from "../hooks/usePdfGestures";
import { usePdfHighlight } from "../hooks/usePdfHighlight";

type PDFViewerProps = {
	id: string;
};

export default function PDFViewer(props: PDFViewerProps) {
	const url = `api/docs/${props.id}/file`;

	const [tick, setTick] = createSignal(0);
	const { viewerRef, pdfSlickStore, PDFSlickViewer } = usePDFSlick(url, {
		scaleValue: "page-fit",
		getDocumentParams: {
			rangeChunkSize: 65536,
			disableAutoFetch: true,
			disableStream: false,
		},
	});
	const { highlightRects } = usePdfHighlight(pdfSlickStore, tick, props.id);
	let pdfSlickContainerRef: HTMLDivElement | undefined;

	usePdfGestures(pdfSlickStore, setTick);

	const unregisterFitHeight = registerCommand("pdf.fitHeight", () => {
		if (!pdfSlickStore.pdfSlick) return;
		pdfSlickStore.pdfSlick.currentScaleValue = "page-fit";
	});
	const unregisterFitWidth = registerCommand("pdf.fitWidth", () => {
		if (!pdfSlickStore.pdfSlick) return;
		pdfSlickStore.pdfSlick.currentScaleValue = "page-width";
	});
	const unregisterZoomIn = registerCommand("pdf.zoomIn", () => {
		if (!pdfSlickStore.pdfSlick) return;
		pdfSlickStore.pdfSlick.increaseScale();
	});
	const unregisterZoomOut = registerCommand("pdf.zoomOut", () => {
		if (!pdfSlickStore.pdfSlick) return;
		pdfSlickStore.pdfSlick.decreaseScale();
	});
	const unregisterNextPage = registerCommand("pdf.nextPage", () => {
		if (!pdfSlickStore.pdfSlick) return;
		pdfSlickStore.pdfSlick.viewer.nextPage();
	});
	const unregisterPrevPage = registerCommand("pdf.prevPage", () => {
		if (!pdfSlickStore.pdfSlick) return;
		pdfSlickStore.pdfSlick.viewer.previousPage();
	});
	const unregisterGotoFirstPage = registerCommand(
		"pdf.gotoFirstPage",
		({ count }) => {
			if (!pdfSlickStore.pdfSlick) return;
			const totalPages = pdfSlickStore.pdfSlick.document?.numPages;
			if (!totalPages) return;

			const targetPage = count ?? 1;
			if (targetPage < 1 || targetPage > totalPages) return;

			pdfSlickStore.pdfSlick.viewer.currentPageNumber = targetPage;
		},
	);
	const unregisterGotoLastPage = registerCommand("pdf.gotoLastPage", () => {
		if (!pdfSlickStore.pdfSlick) return;
		const lastPage = pdfSlickStore.pdfSlick.document?.numPages;
		if (lastPage) {
			pdfSlickStore.pdfSlick.viewer.currentPageNumber = lastPage;
		}
	});
	const unregisterRotateClockwise = registerCommand(
		"pdf.rotateClockwise",
		() => {
			if (!pdfSlickStore.pdfSlick) return;
			pdfSlickStore.pdfSlick.setRotation(pdfSlickStore.pagesRotation + 90);
		},
	);
	const unregisterRotateAntiClockwise = registerCommand(
		"pdf.rotateAntiClockwise",
		() => {
			if (!pdfSlickStore.pdfSlick) return;
			pdfSlickStore.pdfSlick.setRotation(pdfSlickStore.pagesRotation - 90);
		},
	);
	const unregisterScrollDown = registerCommand("pdf.scrollDown", () => {
		const el = pdfSlickStore.pdfSlick?.viewer.container;
		el?.scrollBy({ top: 100, behavior: "instant" });
	});
	const unregisterScrollUp = registerCommand("pdf.scrollUp", () => {
		const el = pdfSlickStore.pdfSlick?.viewer.container;
		el?.scrollBy({ top: -100, behavior: "instant" });
	});

	// const debouncedTick = debounce(() => setTick((t) => t + 1), 100);
	function handlePageRendered() {
		setTick((t) => t + 1);
	}

	createEffect(() => {
		if (!pdfSlickStore.pdfSlick) return;
		pdfSlickStore.pdfSlick.eventBus.on("pagerendered", handlePageRendered);
		onCleanup(() => {
			pdfSlickStore.pdfSlick?.eventBus.off("pagerendered", handlePageRendered);
		});
	});

	onCleanup(() => {
		unregisterFitHeight();
		unregisterFitWidth();
		unregisterZoomIn();
		unregisterZoomOut();
		unregisterNextPage();
		unregisterPrevPage();
		unregisterGotoFirstPage();
		unregisterGotoLastPage();
		unregisterRotateClockwise();
		unregisterRotateAntiClockwise();
		unregisterScrollDown();
		unregisterScrollUp();
	});

	return (
		<div ref={pdfSlickContainerRef} class="pdfslick-container pdfSlick">
			<div>
				<PDFSlickViewer {...{ store: pdfSlickStore, viewerRef }} />
				<Portal>
					<For each={highlightRects()}>
						{(rect) => (
							<div
								style={{
									position: "fixed",
									left: `${rect.left}px`,
									top: `${rect.top}px`,
									width: `${rect.width}px`,
									height: `${rect.height}px`,
									background: "yellow",
									opacity: "0.4",
									"mix-blend-mode": "multiply",
									"pointer-events": "none",
								}}
							/>
						)}
					</For>
				</Portal>
			</div>
		</div>
	);
}
