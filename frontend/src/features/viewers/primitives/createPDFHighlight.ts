import type { PDFSlick, PDFSlickState, TEventBusEvent } from "@pdfslick/solid"
import { createComponent, render } from "@solidjs/web"
import { type Accessor, createEffect, onCleanup, onSettled, type StoreSetter } from "solid-js"
import type { AnnotationCreate, PDFRect } from "../../../stores/createDocumentStore"
import PDFHighlightLayer from "../components/PDFHighlightLayer"
import type { ViewerStore } from "../components/PDFViewer"

export type SVGRect = { x: number; y: number; width: number; height: number }
export type PendingAnnotation = Pick<AnnotationCreate, "page" | "text" | "rects" | "color">

export function createPDFHighlights(
	pdfSlickStore: PDFSlickState,
	pdfSlick: Accessor<PDFSlick | null>,
	actions: any,
	setViewerStore: StoreSetter<ViewerStore>,
	ttsHighlight: Accessor<ViewerStore["ttsHighlight"]>
) {
	function handleSelectionChange(e: Event) {
		const selection = window.getSelection()
		if (!selection || selection.isCollapsed) return

		const anchorEl =
			(selection?.anchorNode?.nodeType === Node.ELEMENT_NODE
				? (selection.anchorNode as HTMLElement)
				: selection?.anchorNode?.parentElement) ?? undefined

		const range = selection.getRangeAt(0)
		const selectionRects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0)
		const mergedRects = convertToMergeRects(selectionRects)

		const page = pdfSlickStore.pageNumber
			? pdfSlick()?.getPageView(pdfSlickStore.pageNumber - 1)
			: undefined
		if (!page?.canvas || !page.viewport) return

		const canvasRect = (page.canvas as HTMLCanvasElement).getBoundingClientRect()
		const pdfRects = mergedRects.map((rect) => {
			const relativeRect = convertToCanvasRelativeRect(rect, canvasRect)
			return convertToPDFRect(relativeRect, page.viewport)
		})

		setViewerStore((draft) => {
			draft.pendingAnnotation = {
				page: pdfSlickStore.pageNumber,
				text: selection.toString().replaceAll("\n", " "),
				rects: pdfRects,
				color: ""
			}
			draft.showHighlightToolbar = true
			draft.anchorRef = anchorEl
		})
	}

	// FIXME: only create one PDFHighlightLayer that updates based on pages
	function handlePageRendered(e: TEventBusEvent) {
		const page = pdfSlick()?.getPageView(e.pageNumber - 1)
		if (!page) return
		if (page.div.querySelector("[data-highlightLayer]")) return
		const annotations = actions.getAnnotationsByPage(e.pageNumber)
		render(
			() =>
				createComponent(PDFHighlightLayer, {
					page,
					pageNumber: e.pageNumber,
					annotations,
					ttsHighlight,
					onSelectAnnotation: (id: string) =>
						setViewerStore((draft) => {
							draft.annotationId = id
						})
				}),
			page.div
		)
	}

	onSettled(() => {
		document.addEventListener("pointerup", handleSelectionChange)

		return () => {
			document.removeEventListener("pointerup", handleSelectionChange)
		}
	})

	createEffect(
		() => pdfSlick(),
		(pdfSlick) => {
			if (!pdfSlick) return
			pdfSlick?.eventBus.on("pagerendered", handlePageRendered)

			onCleanup(() => {
				pdfSlick?.eventBus.off("pagerendered", handlePageRendered)
			})
		}
	)
}

/**
 * Merges overlapping and/or redundant rects into one rect per line.
 */
function convertToMergeRects(rects: DOMRect[]): DOMRect[] {
	rects.sort((a, b) => a.y - b.y)
	const merged: DOMRect[] = []

	for (const rect of rects) {
		const i = merged.length - 1
		const line = merged[i]

		if (line && Math.abs(rect.y - line.y) <= 3) {
			const left = Math.min(line.left, rect.left)
			const top = Math.min(line.top, rect.top)
			const right = Math.max(line.right, rect.right)
			const bottom = Math.max(line.bottom, rect.bottom)
			merged[i] = new DOMRect(left, top, right - left, bottom - top)
		} else {
			merged.push(rect)
		}
	}

	return merged
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

export function convertToSVGRect([llx, lly, urx, ury]: PDFRect, page: any): SVGRect {
	const [x0, , , y1] = page.viewport.viewBox
	return {
		x: Math.min(llx, urx) - x0,
		y: y1 - Math.max(lly, ury),
		width: Math.abs(urx - llx),
		height: Math.abs(ury - lly)
	}
}

export function convertToCanvasRelativeRect(rect: DOMRect, canvasRect: DOMRect): DOMRect {
	return new DOMRect(
		rect.left - canvasRect.left,
		rect.top - canvasRect.top,
		rect.width,
		rect.height
	)
}

export function convertToPDFRect(rect: DOMRect, viewport: any): PDFRect {
	const [x1, y1] = viewport.convertToPdfPoint(rect.left, rect.top)
	const [x2, y2] = viewport.convertToPdfPoint(rect.right, rect.bottom)
	return [x1, y1, x2, y2]
}
