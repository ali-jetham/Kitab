import { type PDFSlick, type PDFSlickState, ScrollMode } from "@pdfslick/core"
import { createWindowSize } from "@solid-primitives/resize-observer"
import { type Accessor, createSignal, onSettled } from "solid-js"
import { useAppContext } from "../../../app/contexts/AppContext"
import type { ViewerStore } from "../components/PDFViewer"

export function createPDFGestures(
	pdfSlickStore: PDFSlickState,
	pdfSlick: Accessor<PDFSlick | null>,
	minScale: Accessor<number>,
	maxScale: Accessor<number>,
	viewerStore: ViewerStore
) {
	let el: HTMLElement | undefined
	let initialDistance: number | null = null
	let initialScale = pdfSlickStore.scale
	let newScale = pdfSlickStore.scale
	let midpoint: number[] | null = null
	let tapStart: { x: number; y: number } | null = null
	let isMultiTouch = false
	let tapCancelled = false
	const tapSlop = 10

	const [trigger, setTrigger] = createSignal(0)
	const { appStore, setAppStore } = useAppContext()

	const windowSize = createWindowSize()

	function getDistanceBetweenTouches(e: TouchEvent): number {
		const [a, b] = e.touches
		if (!a || !b) return 0
		return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY)
	}

	function getMidpoint(e: TouchEvent): number[] {
		const [a, b] = e.touches
		if (!a || !b) return []
		return [(a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2]
	}

	function onTapNavigation(e: TouchEvent) {
		if (
			e.type !== "touchend" ||
			isMultiTouch ||
			tapCancelled ||
			!tapStart ||
			e.changedTouches.length !== 1 ||
			viewerStore.showHighlightToolbar
		) {
			return
		}

		const touch = e.changedTouches[0]
		if (!touch) return
		if (Math.hypot(touch.clientX - tapStart.x, touch.clientY - tapStart.y) > tapSlop) return

		const zoneWidth = windowSize.width / 3
		e.stopPropagation()

		const slick = pdfSlick()
		if (touch.clientX < zoneWidth && pdfSlickStore.scrollMode === ScrollMode.PAGE) {
			slick?.viewer.previousPage()
		} else if (touch.clientX >= zoneWidth * 2 && pdfSlickStore.scrollMode === ScrollMode.PAGE) {
			slick?.viewer.nextPage()
		} else {
			setAppStore((draft) => {
				draft.isActionOpen = !draft.isActionOpen
			})
			setTrigger((n) => n + 1)
		}
	}

	function onPinchStart(e: TouchEvent) {
		if (e.touches.length !== 2) return

		e.preventDefault()
		initialScale = pdfSlickStore.scale
		initialDistance = getDistanceBetweenTouches(e)
	}

	function onPinchMove(e: TouchEvent) {
		if (e.touches.length !== 2) return
		e.preventDefault()
		if (initialDistance == null) return

		const currentDistance = getDistanceBetweenTouches(e)
		midpoint = getMidpoint(e)
		newScale = initialScale * (currentDistance / initialDistance)
		if (newScale < minScale()) newScale = minScale()
		if (newScale > maxScale()) newScale = maxScale()

		const zoomFactor = newScale / initialScale
		const viewer = document.getElementById("viewer")
		const viewerContainer = pdfSlick()?.viewer.container
		if (viewer == null || viewerContainer == null || midpoint == null) return

		const rect = viewerContainer.getBoundingClientRect()
		const originX = midpoint[0] - rect.left + viewerContainer.scrollLeft
		const originY = midpoint[1] - rect.top + viewerContainer.scrollTop
		viewer.style.transformOrigin = `${originX}px ${originY}px`
		viewer.style.transform = `scale(${zoomFactor})`
	}

	function onPinchEnd(e: TouchEvent) {
		if (e.touches.length >= 2 || initialDistance == null || midpoint == null) return

		const slick = pdfSlick()
		const viewerContainer = slick?.viewer.container
		if (!slick || !viewerContainer) return

		const zoomFactor = newScale / initialScale
		const rect = viewerContainer.getBoundingClientRect()

		const mx = midpoint[0] - rect.left
		const my = midpoint[1] - rect.top
		const scrollLeft = viewerContainer.scrollLeft
		const scrollTop = viewerContainer.scrollTop

		slick.currentScale = newScale

		// Keep the pinch midpoint fixed after pdf.js re-layouts at the real scale
		viewerContainer.scrollLeft = (scrollLeft + mx) * zoomFactor - mx
		viewerContainer.scrollTop = (scrollTop + my) * zoomFactor - my

		const viewer = document.getElementById("viewer")
		if (viewer != null) viewer.style.transform = ""

		initialDistance = null
		midpoint = null
	}

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 1) {
			const touch = e.touches[0]
			tapStart = { x: touch.clientX, y: touch.clientY }
		}

		if (e.touches.length === 2) {
			isMultiTouch = true
			tapCancelled = true
			onPinchStart(e)
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (e.touches.length === 1 && tapStart) {
			const touch = e.touches[0]
			if (Math.hypot(touch.clientX - tapStart.x, touch.clientY - tapStart.y) > tapSlop) {
				tapCancelled = true
			}
		}

		if (e.touches.length === 2) {
			isMultiTouch = true
			tapCancelled = true
			onPinchMove(e)
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		onTapNavigation(e)
		onPinchEnd(e)

		if (e.touches.length === 0) {
			tapStart = null
			isMultiTouch = false
			tapCancelled = false
		}
	}

	// Attach listeners when the container element exists
	onSettled(() => {
		if (!el) return

		el.addEventListener("touchstart", handleTouchStart, { passive: false })
		el.addEventListener("touchmove", handleTouchMove, { passive: false })
		el.addEventListener("touchend", handleTouchEnd)
		el.addEventListener("touchcancel", handleTouchEnd)

		return () => {
			el.removeEventListener("touchstart", handleTouchStart)
			el.removeEventListener("touchmove", handleTouchMove)
			el.removeEventListener("touchend", handleTouchEnd)
			el.removeEventListener("touchcancel", handleTouchEnd)
		}
	})

	return (node: HTMLElement) => {
		el = node
	}
}
