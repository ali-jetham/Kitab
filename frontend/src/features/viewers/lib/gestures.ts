import type { PDFSlickState } from "@pdfslick/core";

function make(pdfSlickStore: PDFSlickState) {
	let initialDistance: number | null = null;
	let initialScale: number = pdfSlickStore.scale;
	let newScale: number = pdfSlickStore.scale;
	let midpoint: number[] | null = null;

	function getDistanceBetweenTouches(e: TouchEvent): number {
		return Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
	}

	function getMidpoint(e: TouchEvent) {
		return [(e.touches[0].clientX + e.touches[1].clientX) / 2, (e.touches[0].clientY + e.touches[1].clientY) / 2];
	}

	return {
		handleTouchStart(e: TouchEvent) {
			if (e.touches.length === 2) {
				e.preventDefault();
				initialScale = pdfSlickStore.scale;
				initialDistance = getDistanceBetweenTouches(e);
			}
		},

		handleTouchMove(e: TouchEvent) {
			if (e.touches.length === 2) {
				e.preventDefault();
				if (initialDistance == null) return;

				const currentDistance = getDistanceBetweenTouches(e);
				midpoint = getMidpoint(e);
				const zoomFactor = currentDistance / initialDistance;
				newScale = initialScale * zoomFactor;
				const viewer = document.getElementById("viewer");
				const viewerContainer = pdfSlickStore.pdfSlick?.viewer.container;
				if (viewer == null || viewerContainer == null) return;

				// Anchor the zoom at the pinch midpoint, in #viewer local coords
				const rect = viewerContainer.getBoundingClientRect();
				const originX = midpoint[0] - rect.left + viewerContainer.scrollLeft;
				const originY = midpoint[1] - rect.top + viewerContainer.scrollTop;
				viewer.style.transformOrigin = `${originX}px ${originY}px`;
				viewer.style.transform = `scale(${zoomFactor})`;
			}
		},

		handleTouchEnd(e: TouchEvent) {
			if (e.touches.length < 2) {
				if (!pdfSlickStore.pdfSlick) return;
				if (initialDistance == null || midpoint == null) return;

				const zoomFactor = newScale / initialScale;
				const viewerContainer = pdfSlickStore.pdfSlick.viewer.container;
				const rect = viewerContainer.getBoundingClientRect();

				const mx = midpoint[0] - rect.left;
				const my = midpoint[1] - rect.top;
				const scrollLeft = viewerContainer.scrollLeft;
				const scrollTop = viewerContainer.scrollTop;

				pdfSlickStore.pdfSlick.currentScale = newScale;

				// Keep the pinch midpoint fixed after pdf.js re-layouts at the real scale
				viewerContainer.scrollLeft = (scrollLeft + mx) * zoomFactor - mx;
				viewerContainer.scrollTop = (scrollTop + my) * zoomFactor - my;

				const viewer = document.getElementById("viewer");
				if (viewer != null) viewer.style.transform = "";
				initialDistance = null;
				midpoint = null;
			}
		}
	};
}

export const Gestures = { make };
