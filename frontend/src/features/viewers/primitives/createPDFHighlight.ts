import type { PDFSlickState, TEventBusEvent } from "@pdfslick/solid"
import { debounce } from "@solid-primitives/scheduled"
import { type Accessor, createEffect, createSignal, onCleanup, onMount } from "solid-js"
import { SetStoreFunction } from "solid-js/store"
import { createComponent, render } from "solid-js/web"
import { v7 as uuid7 } from "uuid"
import { annotationApi } from "../../../api/annotationApi"
import type { AnnotationCreate, PDFRect } from "../../../stores/createDocumentStore"
import PDFHighlightLayer from "../components/PDFHighlightLayer"
import { ViewerStore } from "../components/PDFViewer"

export type SVGRect = { x: number; y: number; width: number; height: number }

type PendingAnnotation = { pageNumber: number; text: string; pdfRects: PDFRect[] }

export function createPDFHighlights(
	pdfSlickStore: PDFSlickState,
	docId: string,
	actions: any,
	selectedColor: string,
	setViewerStore: SetStoreFunction<ViewerStore>,
	ttsHighlight: Accessor<ViewerStore["ttsHighlight"]>
) {
	const DEFAULT_HIGHLIGHT_COLOR = "#FFCC99"
	let isMouseDown = false
	const [pendingAnnotation, setPendingAnnotation] = createSignal<PendingAnnotation | null>(null)

	function commitAnnotation(color?: string) {
		const pending = pendingAnnotation()
		if (!pending) return

		const activeColor = color ?? selectedColor ?? DEFAULT_HIGHLIGHT_COLOR

		const annotation: AnnotationCreate = {
			id: uuid7(),
			docId: docId,
			style: "highlight",
			color: activeColor,
			note: "",
			page: pending.pageNumber,
			text: pending.text,
			rects: pending.pdfRects
		}

		actions.addAnnotation(annotation)
		annotationApi.addAnnotation(annotation)
		window.getSelection()?.removeAllRanges()
		setPendingAnnotation(null)
	}

	// TODO: rewrite this
	function mergeSelectionRects(selectionRects: DOMRect[]): DOMRect[] {
		const sorted = selectionRects.toSorted((a, b) => {
			if (Math.abs(a.y - b.y) > 3) return a.y - b.y
			return a.x - b.x
		})
		const merged: DOMRect[] = []
		let i = 0
		while (i < sorted.length) {
			const lineY = sorted[i].y
			let j = i
			while (j < sorted.length && Math.abs(sorted[j].y - lineY) <= 3) {
				j++
			}
			const lineRects = sorted.slice(i, j)
			const minX = Math.min(...lineRects.map((r) => r.left))
			const maxRight = Math.max(...lineRects.map((r) => r.right))
			const minY = Math.min(...lineRects.map((r) => r.top))
			const maxBottom = Math.max(...lineRects.map((r) => r.bottom))
			merged.push(new DOMRect(minX, minY, maxRight - minX, maxBottom - minY))

			i = j
		}
		return merged
	}

	function handleSelectionChange(e: Event) {
		if (isMouseDown) return

		const selection = window.getSelection()
		if (!selection || selection.isCollapsed) return

		const anchorEl =
			(selection?.anchorNode?.nodeType === Node.ELEMENT_NODE
				? selection.anchorNode as HTMLElement
				: selection?.anchorNode?.parentElement) ?? undefined

		const range = selection.getRangeAt(0)
		const selectionRects: DOMRect[] = [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0)
		const mergedRects = mergeSelectionRects(selectionRects)

		const pageNumber = pdfSlickStore.pdfSlick?.viewer.currentPageNumber
		const page = pageNumber ? pdfSlickStore.pdfSlick?.getPageView(pageNumber - 1) : undefined
		if (!page?.canvas || !page.viewport || !pageNumber) return

		const canvasRect = (page.canvas as HTMLCanvasElement).getBoundingClientRect()
		const pdfRects = mergedRects.map((rect) => {
			const relativeRect = convertToCanvasRelativeRect(rect, canvasRect)
			return convertToPDFRect(relativeRect, page.viewport)
		})

		setPendingAnnotation({ pageNumber, text: selection.toString(), pdfRects })
		setViewerStore((prev) => ({ ...prev, showToolbar: true, anchorRef: anchorEl }))
	}

	function handlePageRendered(e: TEventBusEvent) {
		const page = pdfSlickStore.pdfSlick?.getPageView(e.pageNumber - 1)
		if (!page) return
		if (page.div.querySelector("[data-highlightLayer]")) return
		const annotations = actions.getAnnotationsByPage(e.pageNumber)
		render(
			() =>
				createComponent(PDFHighlightLayer, {
					page,
					pageNumber: e.pageNumber,
					annotations,
					onSelectAnnotation: (id: string) => setViewerStore("annotationId", id),
					ttsHighlight
				}),
			page.div
		)
	}

	const debouncedHandleSelectionChange = debounce(handleSelectionChange, 100)

	function handleMouseDown(e: MouseEvent) {
		if (e.button === 0) isMouseDown = true
	}

	function handleMouseUp(e: MouseEvent) {
		if (e.button !== 0 || !isMouseDown) return
		isMouseDown = false
		debouncedHandleSelectionChange(new Event("selectionchange"))
	}

	function handleWindowBlur() {
		isMouseDown = false
		debouncedHandleSelectionChange.clear()
	}

	onMount(() => {
		document.addEventListener("selectionchange", debouncedHandleSelectionChange)
		document.addEventListener("mousedown", handleMouseDown, true)
		document.addEventListener("mouseup", handleMouseUp, true)
		window.addEventListener("blur", handleWindowBlur)
	})

	onCleanup(() => {
		document.removeEventListener("selectionchange", debouncedHandleSelectionChange)
		document.removeEventListener("mousedown", handleMouseDown, true)
		document.removeEventListener("mouseup", handleMouseUp, true)
		window.removeEventListener("blur", handleWindowBlur)
		debouncedHandleSelectionChange.clear()
	})

	createEffect(() => {
		if (!pdfSlickStore.pdfSlick) return
		pdfSlickStore.pdfSlick.eventBus.on("pagerendered", handlePageRendered)

		onCleanup(() => {
			pdfSlickStore.pdfSlick?.eventBus.off("pagerendered", handlePageRendered)
		})
	})

	return { commitAnnotation }
}

export function getPageDimensions(pdfPage: any) {
	const rotation = pdfPage.viewport.rotation
	const { width, height } = pdfPage.pdfPage.getViewport({ scale: 1, rotation })
	return { width, height }
}

export function getRotationTransform(rotation: number, width: number, height: number): string {
	const transforms: Record<number, string> = {
		0: "",
		90: `translate(${height}, 0) rotate(90)`,
		180: `translate(${width}, ${height}) rotate(180)`,
		270: `translate(0, ${width}) rotate(270)`
	}
	return transforms[rotation] ?? ""
}

export function convertToSVGRect([llx, lly, urx, ury]: PDFRect, pageHeight: number): SVGRect {
	return {
		x: Math.min(llx, urx),
		y: pageHeight - Math.max(lly, ury),
		width: Math.abs(urx - llx),
		height: Math.abs(ury - lly)
	}
}

export function convertToCanvasRelativeRect(rect: DOMRect, canvasRect: DOMRect): DOMRect {
	return new DOMRect(rect.left - canvasRect.left, rect.top - canvasRect.top, rect.width, rect.height)
}

export function convertToPDFRect(rect: DOMRect, viewport: any): PDFRect {
	const [x1, y1] = viewport.convertToPdfPoint(rect.left, rect.top)
	const [x2, y2] = viewport.convertToPdfPoint(rect.right, rect.bottom)
	return [x1, y1, x2, y2]
}
