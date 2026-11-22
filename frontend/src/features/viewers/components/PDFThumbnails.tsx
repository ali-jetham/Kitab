import { Button } from "@kobalte/core/button"
import { type PDFSlick, type PDFSlickState, PDFSlickThumbnails } from "@pdfslick/solid"
import { type Accessor, Show } from "solid-js"
import styles from "./PDFThumbnails.module.css"

type ThumbnailsProps = {
	store: PDFSlickState
	pdfSlick: Accessor<PDFSlick | null>
	thumbsRef: (instance: HTMLElement) => void
}

export default function PDFThumbnails(props: ThumbnailsProps) {
	return (
		<div class={styles.thumbnails__container}>
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
								<img
									src={src!}
									alt="Page Thumbnail"
									width={width}
									height={height}
									decoding="async"
								/>
							</Show>
						</Button>
						<p class={styles.label}>{pageLabel ?? pageNumber}</p>
					</div>
				)}
			</PDFSlickThumbnails>
		</div>
	)
}
