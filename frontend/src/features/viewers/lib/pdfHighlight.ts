import type { PDFSlickState } from "@pdfslick/solid";
import { PageViewport } from "pdfjs-dist/types/src/display/editor/annotation_editor_layer";
import type { PDFPageView } from "pdfjs-dist/web/pdf_viewer.mjs";
import type { NewAnnotation, PDFRect } from "../../../stores/createBookStore";

type SVGRect = { x: number; y: number; width: number; height: number; };

function make(pdfStore: PDFSlickState, addAnnotation: any) {
	// TODO: rewrite this
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

	return {
		handlePointerUp() {
			const selection = document.getSelection();
			if (!selection || selection.isCollapsed) return;

			const range = selection.getRangeAt(0);
			const selectionRects: DOMRect[] = [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0);
			const mergedRects = mergeSelectionRects(selectionRects);

			const pageNumber = pdfStore.pdfSlick?.viewer.currentPageNumber;
			const page = pageNumber ? pdfStore.pdfSlick?.getPageView(pageNumber - 1) : undefined;
			if (!page?.canvas || !page.viewport || !pageNumber) return;

			const canvasRect = (page.canvas as HTMLCanvasElement).getBoundingClientRect();
			const pdfRects = mergedRects.map((rect) => {
				const relativeRect = toCanvasRelativeRect(rect, canvasRect);
				return convertToPDFRect(relativeRect, page.viewport);
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
		},
		getPageDimensions(pdfPage: PDFPageView) {
			const { width, height } = pdfPage.pdfPage.getViewport({ scale: 1 });
			return { width, height };
		},
	};
}
function convertToSVGRect([llx, lly, urx, ury]: PDFRect, pageHeight: number): SVGRect {
	return {
		x: Math.min(llx, urx),
		y: pageHeight - Math.max(lly, ury),
		width: Math.abs(urx - llx),
		height: Math.abs(ury - lly),
	};
}

function toCanvasRelativeRect(rect: DOMRect, canvasRect: DOMRect): DOMRect {
	return new DOMRect(rect.left - canvasRect.left, rect.top - canvasRect.top, rect.width, rect.height);
}

function convertToPDFRect(rect: DOMRect, viewport: PageViewport): PDFRect {
	const [x1, y1] = viewport.convertToPdfPoint(rect.left, rect.top);
	const [x2, y2] = viewport.convertToPdfPoint(rect.right, rect.bottom);
	return [x1, y1, x2, y2];
}

export const PDFHighlights = { make, convertToSVGRect };
