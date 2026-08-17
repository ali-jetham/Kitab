import type { PDFSlickState } from "@pdfslick/solid";
import { createSignal, Setter } from "solid-js";
import { v7 as uuid7 } from "uuid";
import type { AnnotationCreate, PDFRect } from "../../../stores/createBookStore";
import HighlightToolbar, { HighlightToolbarProps } from "../components/HighlightToolbar";
import { ToolbarState } from "../components/PDFViewer";
import { viewerApi } from "../viewerApi";

type SVGRect = { x: number; y: number; width: number; height: number; };

function make(
	pdfStore: PDFSlickState,
	addAnnotation: any,
	docId: string,
	color: string,
	setToolbarState: Setter<ToolbarState>
) {
	const DEFAULT_HIGHLIGHT_COLOR = "#FFCC99";

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
		// TODO: check if modal is active before
		handlePointerUp(e: PointerEvent) {
			const selection = document.getSelection();
			if (!selection || selection.isCollapsed) return;
			const anchorEl =
				(selection.focusNode instanceof Element ? selection.focusNode : selection.focusNode?.parentElement) as
					| HTMLElement
					| undefined;

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

			const annotation: AnnotationCreate = {
				id: uuid7(),
				docId: docId,
				style: "highlight",
				color: color === "" ? DEFAULT_HIGHLIGHT_COLOR : color,
				note: "",
				page: pageNumber,
				text: selection.toString(),
				rects: pdfRects
			};

			const isHighlightFast = e.ctrlKey || e.metaKey;
			if (isHighlightFast) {
				addAnnotation(annotation);
				const res = viewerApi.addAnnotation(annotation);
				selection.removeAllRanges();
			} else {
				setToolbarState((prev) => ({ ...prev, open: true, anchorRef: anchorEl }));
			}
		},

		getPageDimensions(pdfPage: any) {
			const { width, height } = pdfPage.pdfPage.getViewport({ scale: 1 });
			return { width, height };
		}
	};
}

function convertToSVGRect([llx, lly, urx, ury]: PDFRect, pageHeight: number): SVGRect {
	return {
		x: Math.min(llx, urx),
		y: pageHeight - Math.max(lly, ury),
		width: Math.abs(urx - llx),
		height: Math.abs(ury - lly)
	};
}

function toCanvasRelativeRect(rect: DOMRect, canvasRect: DOMRect): DOMRect {
	return new DOMRect(rect.left - canvasRect.left, rect.top - canvasRect.top, rect.width, rect.height);
}

function convertToPDFRect(rect: DOMRect, viewport: any): PDFRect {
	const [x1, y1] = viewport.convertToPdfPoint(rect.left, rect.top);
	const [x2, y2] = viewport.convertToPdfPoint(rect.right, rect.bottom);
	return [x1, y1, x2, y2];
}

export const PDFHighlights = { make, convertToSVGRect };
