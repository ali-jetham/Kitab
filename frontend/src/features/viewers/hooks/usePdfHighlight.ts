import type { PDFSlickState } from "@pdfslick/solid";
import { type Accessor, onCleanup, onMount } from "solid-js";
import {
	createBookStore,
	type PDFRect,
	type Annotation,
	type NewAnnotation,
} from "../../../stores/bookStore";

export function usePdfHighlight(pdfStore: PDFSlickState, tick: Accessor<number>, id: string) {
	const { store, addAnnotation } = createBookStore(id);

	const highlightRects = () => {
		tick();
		const rects = store.annotations.flatMap((annotation: Annotation) => {
			const page = pdfStore.pdfSlick?.getPageView(annotation.page - 1);
			if (!page?.viewport || !page.canvas) return [];

			const canvasRect = (page?.canvas as HTMLCanvasElement).getBoundingClientRect();

			return annotation.rects
				.map((rect: PDFRect) => {
					const [x1, y1] = page.viewport.convertToViewportPoint(rect[0], rect[1]);
					const [x2, y2] = page.viewport.convertToViewportPoint(rect[2], rect[3]);

					return {
						left: canvasRect.left + Math.min(x1, x2),
						top: canvasRect.top + Math.min(y1, y2),
						width: Math.abs(x2 - x1),
						height: Math.abs(y2 - y1),
					};
				})
				.filter((rect) => rect.width > 0 && rect.height > 0);
		});
		return rects;
	};

	function handleMouseUp() {
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
	}

	onMount(() => {
		document.addEventListener("mouseup", handleMouseUp);
	});

	onCleanup(() => {
		document.removeEventListener("mouseup", handleMouseUp);
	});

	return {
		highlightRects,
	};
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
