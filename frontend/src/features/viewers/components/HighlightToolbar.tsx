import { ColorSwatch } from "@kobalte/core/color-swatch"
import { parseColor } from "@kobalte/core/colors"
import { Popover } from "@kobalte/core/popover"
import { For, type StoreSetter } from "solid-js"
import styles from "./HighlightToolbar.module.css"
import type { ViewerStore } from "./PDFViewer"

export type HighlightToolbarProps = {
	open: boolean
	anchorRef: HTMLElement | undefined
	setViewerStore: StoreSetter<ViewerStore>
	onSelectColor: (color: string) => void
}

export default function HighlightToolbar(props: HighlightToolbarProps) {
	const colors = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93", "#666666"]

	return (
		<Popover
			open={props.open}
			anchorRef={() => props.anchorRef}
			placement="top"
			onOpenChange={(open) => {
				props.setViewerStore((draft) => {
					draft.showHighlightToolbar = open
				})
				window.getSelection()?.removeAllRanges()
			}}
			preventScroll={true}
		>
			<Popover.Portal>
				<Popover.Content class={styles.popover__content}>
					<Popover.Arrow />
					<For each={colors}>
						{(color) => (
							<button type="button" onClick={() => props.onSelectColor(color)}>
								<ColorSwatch class="ColorSwatch" value={parseColor(color)} />
							</button>
						)}
					</For>
				</Popover.Content>
			</Popover.Portal>
		</Popover>
	)
}
