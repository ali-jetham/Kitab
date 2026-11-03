import { Button } from "@kobalte/core/button"
import { PDFSlick, type PDFSlickState, PDFSlickThumbnails } from "@pdfslick/solid"
import { createResizeObserver } from "@solid-primitives/resize-observer"
import { Accessor, createSignal, onSettled, Show } from "solid-js"
import styles from "./PDFThumbnails.module.css"

type ThumbnailsProps = {
	store: PDFSlickState
	pdfSlick: Accessor<PDFSlick | null>
	thumbsRef: (instance: HTMLElement) => void
}

export default function PDFThumbnails(props: ThumbnailsProps) {
	let ref!: HTMLDivElement
	const [width, setWidth] = createSignal(200)

	createResizeObserver(ref, ({ width }, el) => {
		if (el === ref) {
			setWidth(width)
		}
	})

	onSettled(() => {})

	return (
		<div class={styles.thumbnails__container} ref={ref}>
			<PDFSlickThumbnails
				thumbsRef={props.thumbsRef}
				store={props.store}
				pdfSlick={props.pdfSlick}
				class={styles.pdfSlickThumbnails}
			>
				{({ pageNumber, width, height, src, pageLabel }) => (
					<div>
						<Button
							class={styles.thumbnail__button}
							data-active={props.store.pageNumber === pageNumber}
							onClick={() => props.pdfSlick()?.gotoPage(pageNumber)}
						>
							<Show when={src}>
								<img src={src!} width={width} height={height} decoding="async" />
							</Show>
						</Button>
						<p class={styles.label}>{pageLabel ?? pageNumber}</p>
					</div>
				)}
			</PDFSlickThumbnails>
		</div>
	)
}
