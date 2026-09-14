import { ColorSwatch } from "@kobalte/core/color-swatch";
import { parseColor } from "@kobalte/core/colors";
import { Popover } from "@kobalte/core/popover";
import { For } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import styles from "./HighlightToolbar.module.css";
import { ViewerStore } from "./PDFViewer";

export type HighlightToolbarProps = {
	open: boolean;
	anchorRef: HTMLElement | undefined;
	setViewerStore: SetStoreFunction<ViewerStore>;
	onSelectColor: (color: string) => void;
};

export default function HighlightToolbar(props: HighlightToolbarProps) {
	const colors = ["#ffd400", "#ff6666", "#2ea8e5", "#e56eee", "#aaaaaa"];

	return (
		<Popover
			open={props.open}
			anchorRef={() => props.anchorRef}
			placement="top"
			onOpenChange={(open) =>
				props.setViewerStore((prev) => ({ ...prev, showToolbar: open }))}
			preventScroll={true}
		>
			<Popover.Portal>
				<Popover.Content class={styles.popover__content}>
					<Popover.Arrow />
					<For each={colors}>
						{(color) => (
							<button
								type="button"
								onClick={() => props.onSelectColor(color)}
							>
								<ColorSwatch class={styles.ColorSwatch} value={parseColor(color)} />
							</button>
						)}
					</For>
				</Popover.Content>
			</Popover.Portal>
		</Popover>
	);
}
