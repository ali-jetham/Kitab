import type { PDFSlick, PDFSlickState } from "@pdfslick/core";
import { createElementSize } from "@solid-primitives/resize-observer";
import { createEffect, onCleanup } from "solid-js";
import { type CommandId, registerCommand } from "../../../core/keybinds";
import { ViewerStore } from "../components/PDFViewer";
import { viewerApi } from "../viewerApi";

export function createPDFKeybinds(pdfSlickStore: PDFSlickState, viewerStore: ViewerStore, actions: any) {
	const viewerContainerSize = createElementSize(() => pdfSlickStore.pdfSlick?.viewer.container);

	const activePageSize = createElementSize(() => {
		if (pdfSlickStore.scrollMode !== 3) return;
		return pdfSlickStore.pdfSlick?.viewer.getPageView(pdfSlickStore.pageNumber - 1)?.div;
	});

	createEffect(() => {
		if (pdfSlickStore.scrollMode !== 3) return;

		const page = pdfSlickStore.pdfSlick?.viewer.getPageView(pdfSlickStore.pageNumber - 1);
		const containerHeight = viewerContainerSize.clientHeight;
		const pageHeight = activePageSize.clientHeight;
		if (!page || containerHeight == null || pageHeight == null) return;
		page.div.style.marginTop = `${Math.max(0, (containerHeight - pageHeight) / 2)}px`;
		page.div.style.marginBottom = "0";

		onCleanup(() => {
			page.div.style.marginTop = "";
			page.div.style.marginBottom = "";
		});
	});

	function register(commandId: CommandId, callback: (pdf: PDFSlick) => void) {
		return registerCommand(commandId, () => {
			if (!pdfSlickStore.pdfSlick) return;
			callback(pdfSlickStore.pdfSlick);
		});
	}

	const unregisters = [
		register("pdf.fitHeight", (pdfSlick) => pdfSlick.currentScaleValue = "page-fit"),
		register("pdf.fitWidth", (pdfSlick) => {
			const page = pdfSlick.viewer.getPageView(pdfSlick.viewer.currentPageNumber - 1);
			if (!page) return;
			const containerWidth = pdfSlick.viewer.container.clientWidth;
			const scale = containerWidth / (page.width / page.scale);
			pdfSlick.currentScale = scale;
		}),
		register("pdf.zoomIn", (pdfSlick) => pdfSlick.increaseScale()),
		register("pdf.zoomOut", (pdfSlick) => pdfSlick.decreaseScale()),
		register("pdf.nextPage", (pdfSlick) => pdfSlick.viewer.nextPage()),
		register("pdf.prevPage", (pdfSlick) => pdfSlick.viewer.previousPage()),
		register("pdf.gotoFirstPage", (pdfSlick) => pdfSlick.viewer.currentPageNumber = 1),
		register("pdf.gotoLastPage", (pdfSlick) => pdfSlick.viewer.currentPageNumber = pdfSlick.document?.numPages!),
		register("pdf.rotateClockwise", (pdfSlick) => pdfSlick.setRotation(pdfSlickStore.pagesRotation + 90)),
		register("pdf.rotateAntiClockwise", (pdfSlick) => pdfSlick.setRotation(pdfSlickStore.pagesRotation - 90)),
		register("pdf.scrollDown", (pdfSlick) => pdfSlick.viewer.container.scrollBy({ top: 100, behavior: "instant" })),
		register("pdf.scrollUp", (pdfSlick) => pdfSlick.viewer.container.scrollBy({ top: -100, behavior: "instant" })),
		register("pdf.viewModeScrollV", (pdfSlick) => {
			pdfSlick.setScrollMode(0);
		}),
		register("pdf.viewModeScrollH", (pdfSlick) => {
			pdfSlick.setScrollMode(1);
		}),
		register("pdf.viewModeSinglePage", (pdfSlick) => {
			pdfSlick.setScrollMode(3);
		}),
		register("pdf.deleteHighlight", () => {
			if (!viewerStore.annotationId) {
				console.log("Please select an annotation first");
				return;
			}
			console.log("Deleting annotation", viewerStore.annotationId);
			actions.deleteAnnotation(viewerStore.annotationId);
			viewerApi.deleteAnnotation(viewerStore.annotationId);
		})
	];

	onCleanup(() => {
		for (const unregister of unregisters) {
			unregister();
		}
	});
}
