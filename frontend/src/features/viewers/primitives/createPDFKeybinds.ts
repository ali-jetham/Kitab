import type { PDFSlick, PDFSlickState } from "@pdfslick/core";
import { onCleanup } from "solid-js";
import { type CommandId, registerCommand } from "../../../core/keybinds";

export function usePDFKeybinds(pdfSlickStore: PDFSlickState) {
	function register(commandId: CommandId, callback: (pdf: PDFSlick) => void) {
		return registerCommand(commandId, () => {
			if (!pdfSlickStore.pdfSlick) return;
			callback(pdfSlickStore.pdfSlick);
		});
	}

	const unregisters = [
		register("pdf.fitHeight", (pdf) => pdf.currentScaleValue = "page-fit"),
		register("pdf.fitWidth", (pdf) => pdf.currentScaleValue = "page-width"),
		register("pdf.zoomIn", (pdf) => pdf.increaseScale()),
		register("pdf.zoomOut", (pdf) => pdf.decreaseScale()),
		register("pdf.nextPage", (pdf) => pdf.viewer.nextPage()),
		register("pdf.prevPage", (pdf) => pdf.viewer.previousPage()),
		register("pdf.gotoFirstPage", (pdf) => pdf.viewer.currentPageNumber = 1),
		register("pdf.gotoLastPage", (pdf) => pdf.viewer.currentPageNumber = pdf.document?.numPages!),
		register("pdf.rotateClockwise", (pdf) => pdf.setRotation(pdfSlickStore.pagesRotation + 90)),
		register("pdf.rotateAntiClockwise", (pdf) => pdf.setRotation(pdfSlickStore.pagesRotation - 90)),
		register("pdf.scrollDown", (pdf) => pdf.viewer.container.scrollBy({ top: 100, behavior: "instant" })),
		register("pdf.scrollUp", (pdf) => pdf.viewer.container.scrollBy({ top: -100, behavior: "instant" }))
	];

	onCleanup(() => {
		for (const unregister of unregisters) {
			unregister();
		}
	});
}
