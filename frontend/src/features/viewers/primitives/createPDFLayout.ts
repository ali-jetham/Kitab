import { MAX_SCALE, MIN_SCALE, type PDFSlick, type PDFSlickState, ScrollMode } from "@pdfslick/core"
import { createElementSize } from "@solid-primitives/resize-observer"
import { type Accessor, createEffect, createMemo } from "solid-js"
import { useAppContext } from "../../../app/contexts/AppContext"

export function createPDFLayout(pdfSlickStore: PDFSlickState, pdfSlick: Accessor<PDFSlick | null>) {
	const { appStore } = useAppContext()
	const viewerSize = createElementSize(() => pdfSlick()?.viewer.container)
	const activePageSize = createElementSize(() => {
		const slick = pdfSlick()
		if (!slick || pdfSlickStore.scrollMode !== ScrollMode.PAGE) return
		return slick.viewer.getPageView(pdfSlickStore.pageNumber - 1)?.div
	})

	const scaleBounds = createMemo(() => {
		const slick = pdfSlick()
		if (!slick || !pdfSlickStore.pagesReady || viewerSize.clientWidth == null) return

		const page = slick.viewer.getPageView(pdfSlickStore.pageNumber - 1)
		if (!page) return

		const fitWidth = viewerSize.clientWidth / (page.width / page.scale)
		return appStore.isMobile()
			? { min: fitWidth, max: fitWidth * 4 }
			: { min: fitWidth * 0.3, max: fitWidth * 4 }
	})

	const minScale = () => scaleBounds()?.min ?? MIN_SCALE
	const maxScale = () => scaleBounds()?.max ?? MAX_SCALE

	createEffect(
		() => ({
			pagesReady: pdfSlickStore.pagesReady,
			isMobile: appStore.isMobile(),
			slick: pdfSlick()
		}),
		({ pagesReady, isMobile, slick }) => {
			if (!pagesReady || !slick) return
			if (isMobile) slick.setScrollMode(ScrollMode.PAGE)
		}
	)

	createEffect(
		() => ({
			scrollMode: pdfSlickStore.scrollMode,
			pageNumber: pdfSlickStore.pageNumber,
			viewerH: viewerSize.clientHeight,
			pageH: activePageSize.clientHeight,
			slick: pdfSlick()
		}),
		({ scrollMode, pageNumber, viewerH, pageH, slick }) => {
			if (scrollMode !== ScrollMode.PAGE || !slick || viewerH == null || pageH == null) return

			const page = slick.viewer.getPageView(pageNumber - 1)
			if (!page) return

			page.div.style.marginTop = `${Math.max(0, (viewerH - pageH) / 2)}px`
			page.div.style.marginBottom = "0"

			return () => {
				page.div.style.marginTop = ""
				page.div.style.marginBottom = ""
			}
		}
	)

	return { minScale, maxScale }
}
