import { Accessor, For } from "solid-js";
import { type Annotation } from "../../../stores/createBookStore";
import { PDFHighlights } from "../lib/pdfHighlight";
import PDFHighlight from "./PDFHighlight";
import styles from "./PDFHighlightLayer.module.css";

type PDFHighlightLayerProps = {
	width: number;
	height: number;
	annotations: Accessor<Annotation[]>;
};

export default function PDFHighlightLayer(props: PDFHighlightLayerProps) {
	return (
		<svg
			viewBox={`0 0 ${props.width} ${props.height}`}
			class={styles.highlightLayer}
			preserveAspectRatio="none"
			data-highlightLayer="true"
		>
			<For each={props.annotations()}>
				{(annotation) => (
					<For each={annotation.rects}>
						{(r) => {
							const rect = PDFHighlights.convertToSVGRect(r, props.height);
							return (
								<PDFHighlight
									x={rect.x}
									y={rect.y}
									width={rect.width}
									height={rect.height}
									color={annotation.color}
									data-annotation-id={annotation.id}
								/>
							);
						}}
					</For>
				)}
			</For>
		</svg>
	);
}
