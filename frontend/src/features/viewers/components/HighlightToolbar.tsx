import { ColorSwatch } from "@kobalte/core/color-swatch";
import { parseColor } from "@kobalte/core/colors";
import { Popover } from "@kobalte/core/popover";
import { For, type Setter } from "solid-js";
import styles from "./HighlightToolbar.module.css";
import { ToolbarState } from "./PDFViewer";

export type HighlightToolbarProps = {
	open: boolean;
	anchorRef: HTMLElement | undefined;
	setToolbarState: Setter<ToolbarState>;
	onSelectColor: (color: string) => void;
};

export default function HighlightToolbar(props: HighlightToolbarProps) {
	const colors = ["#ffd400", "#ff6666", "#2ea8e5", "#e56eee", "#aaaaaa"];

	return (
		<Popover
			open={props.open}
			onOpenChange={(open) => props.setToolbarState((prev) => ({ ...prev, open }))}
			anchorRef={() => props.anchorRef}
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
