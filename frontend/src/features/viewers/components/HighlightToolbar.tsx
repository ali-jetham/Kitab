import { ColorSwatch } from "@kobalte/core/color-swatch";
import { parseColor } from "@kobalte/core/colors";
import { Popover } from "@kobalte/core/popover";
import { type Setter } from "solid-js";
import styles from "./HighlightToolbar.module.css";
import { ToolbarState } from "../lib/pdfHighlight";

export type HighlightToolbarProps = {
	open: boolean;
	anchorRef: HTMLElement | undefined;
	setToolbarState: Setter<ToolbarState>;
};

export default function HighlightToolbar(props: HighlightToolbarProps) {
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
					<ColorSwatch class={styles.ColorSwatchRoot} value={parseColor("#ffd400")} />
					<ColorSwatch class={styles.ColorSwatchRoot} value={parseColor("#ff6666")} />
					<ColorSwatch class={styles.ColorSwatchRoot} value={parseColor("#2ea8e5")} />
					<ColorSwatch class={styles.ColorSwatchRoot} value={parseColor("#e56eee")} />
					<ColorSwatch class={styles.ColorSwatchRoot} value={parseColor("#aaaaaa")} />
				</Popover.Content>
			</Popover.Portal>
		</Popover>
	);
}
