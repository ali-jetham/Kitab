import { Accessor, For } from "solid-js";
import { type Annotation } from "../../../stores/createBookStore";
import { convertToSVGRect } from "../primitives/createPDFHighlight";
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
							const rect = convertToSVGRect(r, props.height);
							return (
								<rect
									x={rect.x}
									y={rect.y}
									width={rect.width}
									height={rect.height}
									fill={annotation.color}
									fill-opacity="0.3"
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
