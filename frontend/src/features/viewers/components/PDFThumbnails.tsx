import { PDFSlick, type PDFSlickState, PDFSlickThumbnails } from "@pdfslick/solid"
import { createResizeObserver } from "@solid-primitives/resize-observer"
import { createSignal, onSettled } from "solid-js"
import styles from "./PDFThumbnails.module.css"

type ThumbnailsProps = {
	store: PDFSlickState
	pdfSlick: PDFSlick
	thumbsRef: (instance: HTMLElement) => void
	show: boolean
}

export default function PDFThumbnails(props: ThumbnailsProps) {
	let ref!: HTMLDivElement
	const [width, setWidth] = createSignal(200)

	const cols = () => Math.round(width() / 200)
	createResizeObserver(ref, ({ width, height }, el) => {
		if (el === ref) {
			setWidth(width)
		}
	})

	onSettled(() => {})

	return (
		<div
			class="overflow-auto absolute inset-0"
			// classList={{ invisible: !props.show }}
			ref={ref}
		>
			<div class="px-2 relative h-full">
				<PDFSlickThumbnails
					{...{ thumbsRef: props.thumbsRef, store: props.store }}
					class={styles.pdfSlickThumbnails}
				>
					{({ pageNumber, width, height, src, pageLabel, loaded }) => (
						<div class="">
							<div>
								<div class="">
									<button
										onClick={() => {
											console.log("thumbnail clicked")
											props.pdfSlick?.gotoPage(pageNumber)
										}}
										class="p-0.5"
										// classList={{
										//   "bg-blue-400 shadow-sm":
										//     loaded && pageNumber === props.store.pageNumber,
										//   "bg-transparent":
										//     pageNumber !== props.store.pageNumber || !loaded,
										// }}
									>
										<div
											class="box-border relative border"
											// classList={{
											//   "border-slate-300 border-solid bg-slate-400/5 shadow-xs":
											//     !loaded,
											//   "border-slate-300 border-solid hover:border-blue-400 shadow-sm hover:shadow-sm":
											//     loaded && pageNumber !== props.store.pageNumber,
											//   "border-transparent border-solid shadow-md":
											//     loaded && pageNumber === props.store.pageNumber,
											// }}
											style={{ width: `${width + 2}px`, height: `${height + 2}px` }}
										>
											{src && <img src={src} width={width} height={height} />}
										</div>
									</button>
								</div>
								<div class="">
									{pageLabel ?? pageNumber}
								</div>
							</div>
						</div>
					)}
				</PDFSlickThumbnails>
			</div>
		</div>
	)
}
