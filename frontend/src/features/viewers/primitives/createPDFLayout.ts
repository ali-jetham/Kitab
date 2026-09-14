import { MAX_SCALE, MIN_SCALE, PDFSlickState } from "@pdfslick/core";
import { createMediaQuery } from "@solid-primitives/media";
import { createElementSize } from "@solid-primitives/resize-observer";
import { createEffect, createMemo } from "solid-js";

export function createPDFLayout(pdfSlickStore: PDFSlickState) {
	const isMobile = createMediaQuery("(max-width: 768px)");
	const viewerSize = createElementSize(() => pdfSlickStore.pdfSlick?.viewer.container);
	const scaleBounds = createMemo(() => {
		if (!pdfSlickStore.pagesReady || !pdfSlickStore.pdfSlick || viewerSize.clientWidth == null) return;

		const page = pdfSlickStore.pdfSlick.viewer.getPageView(pdfSlickStore.pageNumber - 1);
		if (!page) return;

		const min = viewerSize.clientWidth / (page.width / page.scale);
		return { min, max: min * 4 };
	});

	const minScale = () => scaleBounds()?.min ?? MIN_SCALE;
	const maxScale = () => scaleBounds()?.max ?? MAX_SCALE;

	createEffect(() => {
		if (!pdfSlickStore.pdfSlick || !pdfSlickStore.pagesReady) return;
		if (isMobile()) {
			pdfSlickStore.pdfSlick.setScrollMode(3);
		}
	});

	return { minScale, maxScale };
}
