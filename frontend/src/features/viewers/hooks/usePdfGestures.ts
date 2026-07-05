import type { PDFSlickState } from "@pdfslick/core";
import { onCleanup, onMount } from "solid-js";

export function usePdfGestures(pdfSlickStore: PDFSlickState) {
	let initialDistance: number | null = null;
	let initialScale = pdfSlickStore.scale;
	let newScale = pdfSlickStore.scale;
	let midpoint: number[] | null = null;

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 2) {
			e.preventDefault();
			initialScale = pdfSlickStore.scale;
			initialDistance = getDistanceBetweenTouches(e);
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (e.touches.length === 2) {
			e.preventDefault();
			if (initialDistance == null) return;
			const touch1 = e.touches[0];
			const touch2 = e.touches[1];
			const currentDistance = getDistanceBetweenTouches(e);
			const zoomFactor = currentDistance / initialDistance;
			midpoint = [(touch1.clientX + touch2.clientX) / 2, (touch1.clientY + touch2.clientY) / 2];
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
	}

	function handleTouchEnd(e: TouchEvent) {
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

	function getDistanceBetweenTouches(e: TouchEvent) {
		const touch1 = e.touches[0];
		const touch2 = e.touches[1];
		// Pythagorean Distance
		return Math.hypot(touch1.pageX - touch2.pageX, touch1.pageY - touch2.pageY);
	}

	onMount(() => {
		document.addEventListener("touchstart", handleTouchStart, { passive: false });
		document.addEventListener("touchmove", handleTouchMove, { passive: false });
		document.addEventListener("touchend", handleTouchEnd);
	});

	onCleanup(() => {
		document.removeEventListener("touchstart", handleTouchStart);
		document.removeEventListener("touchmove", handleTouchMove);
		document.removeEventListener("touchend", handleTouchEnd);
	});
}
