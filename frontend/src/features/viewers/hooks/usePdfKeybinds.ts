import type { PDFSlickState } from "@pdfslick/core";
import { onCleanup } from "solid-js";
import { registerCommand } from "../../../core/keybinds";

export function usePdfKeybinds(pdfSlickStore: PDFSlickState) {
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
	const unregisterGotoFirstPage = registerCommand("pdf.gotoFirstPage", ({ count }) => {
		if (!pdfSlickStore.pdfSlick) return;
		const totalPages = pdfSlickStore.pdfSlick.document?.numPages;
		if (!totalPages) return;

		const targetPage = count ?? 1;
		if (targetPage < 1 || targetPage > totalPages) return;

		pdfSlickStore.pdfSlick.viewer.currentPageNumber = targetPage;
	});
	const unregisterGotoLastPage = registerCommand("pdf.gotoLastPage", () => {
		if (!pdfSlickStore.pdfSlick) return;
		const lastPage = pdfSlickStore.pdfSlick.document?.numPages;
		if (lastPage) {
			pdfSlickStore.pdfSlick.viewer.currentPageNumber = lastPage;
		}
	});
	const unregisterRotateClockwise = registerCommand("pdf.rotateClockwise", () => {
		if (!pdfSlickStore.pdfSlick) return;
		pdfSlickStore.pdfSlick.setRotation(pdfSlickStore.pagesRotation + 90);
	});
	const unregisterRotateAntiClockwise = registerCommand("pdf.rotateAntiClockwise", () => {
		if (!pdfSlickStore.pdfSlick) return;
		pdfSlickStore.pdfSlick.setRotation(pdfSlickStore.pagesRotation - 90);
	});
	const unregisterScrollDown = registerCommand("pdf.scrollDown", () => {
		const el = pdfSlickStore.pdfSlick?.viewer.container;
		el?.scrollBy({ top: 100, behavior: "instant" });
	});
	const unregisterScrollUp = registerCommand("pdf.scrollUp", () => {
		const el = pdfSlickStore.pdfSlick?.viewer.container;
		el?.scrollBy({ top: -100, behavior: "instant" });
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
}
