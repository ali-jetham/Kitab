import type { PDFSlickState } from "@pdfslick/core";
import { createEffect, onCleanup } from "solid-js";

export function createPDFGestures(pdfSlickStore: PDFSlickState, containerRef: () => HTMLElement | null | undefined) {
	let initialDistance: number | null = null;
	let initialScale: number = pdfSlickStore.scale;
	let newScale: number = pdfSlickStore.scale;
	let midpoint: number[] | null = null;
	let tapStart: { x: number; y: number; } | null = null;
	let isMultiTouch = false;
	let tapCancelled = false;
	const tapSlop = 10;

	function getDistanceBetweenTouches(e: TouchEvent): number {
		return Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
	}

	function getMidpoint(e: TouchEvent): number[] {
		return [(e.touches[0].clientX + e.touches[1].clientX) / 2, (e.touches[0].clientY + e.touches[1].clientY) / 2];
	}

	function onTapNavigation(e: TouchEvent) {
		if (e.type !== "touchend" || isMultiTouch || tapCancelled || !tapStart || e.changedTouches.length !== 1) return;
		if (pdfSlickStore?.pdfSlick?.viewer.scrollMode !== 3) return;

		const touch = e.changedTouches[0];
		if (Math.hypot(touch.clientX - tapStart.x, touch.clientY - tapStart.y) > tapSlop) return;

		const container = pdfSlickStore.pdfSlick?.viewer.container;
		const bounds = container.getBoundingClientRect();
		const zoneWidth = bounds.width / 3;

		if (touch.clientX < bounds.left + zoneWidth) {
			pdfSlickStore.pdfSlick.viewer.previousPage();
		} else if (touch.clientX >= bounds.left + (zoneWidth * 2)) {
			pdfSlickStore.pdfSlick.viewer.nextPage();
		}
	}

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 1) {
			const touch = e.touches[0];
			tapStart = { x: touch.clientX, y: touch.clientY };
			isMultiTouch = false;
			tapCancelled = false;
		}

		if (e.touches.length === 2) {
			isMultiTouch = true;
			tapCancelled = true;
			e.preventDefault();
			initialScale = pdfSlickStore.scale;
			initialDistance = getDistanceBetweenTouches(e);
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (e.touches.length === 1 && tapStart) {
			const touch = e.touches[0];
			if (Math.hypot(touch.clientX - tapStart.x, touch.clientY - tapStart.y) > tapSlop) {
				tapCancelled = true;
			}
		}

		if (e.touches.length === 2) {
			isMultiTouch = true;
			tapCancelled = true;
			e.preventDefault();
			if (initialDistance == null) return;

			const currentDistance = getDistanceBetweenTouches(e);
			midpoint = getMidpoint(e);
			const zoomFactor = currentDistance / initialDistance;
			newScale = initialScale * zoomFactor;

			if (newScale < 0.3) {
				newScale = 0.3;
				return;
			}

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
		onTapNavigation(e);

		if (e.touches.length === 0) {
			tapStart = null;
			isMultiTouch = false;
			tapCancelled = false;
		}

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

			const viewer = document.getElementById("viewer")!.style.transform = "";
			initialDistance = null;
			midpoint = null;
		}
	}

	createEffect(() => {
		const el = containerRef();
		if (!el) return;

		el.addEventListener("touchstart", handleTouchStart, { passive: false });
		el.addEventListener("touchmove", handleTouchMove, { passive: false });
		el.addEventListener("touchend", handleTouchEnd);
		el.addEventListener("touchcancel", handleTouchEnd);

		onCleanup(() => {
			el.removeEventListener("touchstart", handleTouchStart);
			el.removeEventListener("touchmove", handleTouchMove);
			el.removeEventListener("touchend", handleTouchEnd);
			el.removeEventListener("touchcancel", handleTouchEnd);
		});
	});
}
