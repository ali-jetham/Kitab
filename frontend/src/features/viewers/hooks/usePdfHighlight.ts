import type { PDFSlickState } from "@pdfslick/solid";
import type { PDFPageView } from "pdfjs-dist/web/pdf_viewer.mjs";
import { onCleanup, onMount } from "solid-js";
import { createBookStore, type NewAnnotation, type PDFRect } from "../../../stores/bookStore";
import styles from "../components/PDFViewer.module.css";

export function usePdfHighlight(pdfStore: PDFSlickState, id: string) {
	const { store, addAnnotation } = createBookStore(id);

	function getHighlightRectsByPage(pageNumber: number): Array<PDFRect[]> {
		const highlights = store.annotations
			.filter((ann) => ann.page === pageNumber)
			.map((ann) => ann.rects);
		return highlights;
	}

	function pdfRectToSvgRect(
		[x1, y1, x2, y2]: PDFRect,
		pageHeight: number,
	): { x: number; y: number; width: number; height: number } {
		return {
			x: Math.min(x1, x2),
			y: pageHeight - Math.max(y1, y2),
			width: Math.abs(x2 - x1),
			height: Math.abs(y2 - y1),
		};
	}

	function makeHighlight(ann: NewAnnotation) {}

	function renderHighlights(pageNumber: number, pageHeight: number, svg: SVGSVGElement) {
		const pdfRects: Array<PDFRect[]> = getHighlightRectsByPage(pageNumber);

		for (const rects of pdfRects) {
			for (const rect of rects) {
				const { x, y, width, height } = pdfRectToSvgRect(rect, pageHeight);
				const svgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
				svgRect.setAttribute("x", String(x));
				svgRect.setAttribute("y", String(y));
				svgRect.setAttribute("width", String(width));
				svgRect.setAttribute("height", String(height));
				svgRect.setAttribute("fill", "yellow"); // TODO: use color from ann
				svgRect.setAttribute("fill-opacity", "0.3");
				svgRect.classList.add("highlight");
				svg.appendChild(svgRect);
			}
		}
	}

	function addHighlightLayer(pdfPageView: PDFPageView, pageNumber: number) {
		const svgExists = pdfPageView?.div.querySelector('[data-highlight-layer="true"]');
		if (svgExists) return;

		const { width, height } = pdfPageView.pdfPage.getViewport({ scale: 1 });
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
		svg.setAttribute("preserveAspectRatio", "none");
		svg.setAttribute("data-highlight-layer", "true");
		svg.classList.add(styles.highlightLayer);
		pdfPageView.div.appendChild(svg);
		renderHighlights(pageNumber, height, svg);
	}

	// TODO: way too big, make smaller and easier to understand
	function handlePointerUp() {
		const selection = document.getSelection();
		if (!selection || selection.isCollapsed) {
			return;
		}

		const range = selection.getRangeAt(0);
		const selectionRects: DOMRect[] = [...range.getClientRects()].filter(
			(rect) => rect.width > 0 && rect.height > 0,
		);
		console.log("selectionRects", selectionRects);

		const mergedRects = mergeSelectionRects(selectionRects);
		console.log("mergedRects", mergedRects);

		const pageNumber = pdfStore.pdfSlick?.viewer.currentPageNumber;
		if (!pageNumber) {
			console.error("Cannot detect current page number");
			return;
		}
		const page = pdfStore.pdfSlick?.getPageView(pageNumber - 1);
		if (!page?.canvas || !page.viewport) {
			console.error("Page canvas or viewport not found");
			return;
		}

		const canvasRect = (page.canvas as HTMLCanvasElement).getBoundingClientRect();

		const pdfRects: Array<PDFRect> = mergedRects.map((rect) => {
			// TODO: rename to llx, lly, urx, ury
			const [x1, y1] = page.viewport.convertToPdfPoint(
				rect.left - canvasRect.left,
				rect.top - canvasRect.top,
			);
			const [x2, y2] = page.viewport.convertToPdfPoint(
				rect.right - canvasRect.left,
				rect.bottom - canvasRect.top,
			);
			return [x1, y1, x2, y2];
		});

		const annotation: NewAnnotation = {
			style: "highlight",
			color: "",
			note: "",
			page: pageNumber,
			text: selection.toString(),
			rects: pdfRects,
		};
		addAnnotation(annotation);
		makeHighlight(annotation);
	}

	onMount(() => {
		document.addEventListener("pointerup", handlePointerUp);
	});

	onCleanup(() => {
		document.removeEventListener("pointerup", handlePointerUp);
	});

	return { getHighlightsByPage: getHighlightRectsByPage, createHighlightLayer: addHighlightLayer };
}

function mergeSelectionRects(selectionRects: DOMRect[]): DOMRect[] {
	const sorted = selectionRects.toSorted((a, b) => {
		if (Math.abs(a.y - b.y) > 3) return a.y - b.y;
		return a.x - b.x;
	});

	const merged: DOMRect[] = [];
	let i = 0;

	while (i < sorted.length) {
		const lineY = sorted[i].y;

		let j = i;
		while (j < sorted.length && Math.abs(sorted[j].y - lineY) <= 3) {
			j++;
		}
		const lineRects = sorted.slice(i, j);

		const minX = Math.min(...lineRects.map((r) => r.left));
		const maxRight = Math.max(...lineRects.map((r) => r.right));
		const minY = Math.min(...lineRects.map((r) => r.top));
		const maxBottom = Math.max(...lineRects.map((r) => r.bottom));

		merged.push(new DOMRect(minX, minY, maxRight - minX, maxBottom - minY));

		i = j;
	}
	return merged;
}
