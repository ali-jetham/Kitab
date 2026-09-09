import { Accessor, For, Show } from "solid-js";
import { type Annotation } from "../../../stores/createDocumentStore";
import {
	convertToSVGRect,
	getPageDimensions,
	getRotationTransform
} from "../primitives/createPDFHighlight";
import styles from "./PDFHighlightLayer.module.css";
import type { ViewerStore } from "./PDFViewer";

type PDFHighlightLayerProps = {
	page: any;
	pageNumber: number;
	annotations: Accessor<Annotation[]>;
	onSelectAnnotation: (id: string) => void;
	ttsHighlight: Accessor<ViewerStore["ttsHighlight"]>;
};

export default function PDFHighlightLayer(props: PDFHighlightLayerProps) {
	const { width: baseW, height: baseH } = props.page.pdfPage.getViewport({
		scale: 1,
		rotation: 0
	});
	const { width, height } = getPageDimensions(props.page);
	const transform = getRotationTransform(props.page.viewport.rotation, baseW, baseH);

	function handleClick(e: MouseEvent) {
		e.stopPropagation();
		const target = (e.target as Element).closest("[data-annotation-id]");
		const annotationId = target?.getAttribute("data-annotation-id");
		if (annotationId) {
			props.onSelectAnnotation(annotationId);
		}
	}

	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			class={styles.highlightLayer}
			preserveAspectRatio="none"
			data-highlightLayer="true"
		>
			<g transform={transform} style={{ "pointer-events": "auto" }}>
				<For each={props.annotations()}>
					{(annotation) => (
						<g data-annotation-id={annotation.id}>
							<For each={annotation.rects}>
								{(r) => {
									const rect = convertToSVGRect(r, baseH);
									return (
										<rect
											onClick={handleClick}
											x={rect.x}
											y={rect.y}
											width={rect.width}
											height={rect.height}
											fill={annotation.color}
											fill-opacity="0.3"
										/>
									);
								}}
							</For>
						</g>
					)}
				</For>
				<Show
					when={props.ttsHighlight()?.page === props.pageNumber
						? props.ttsHighlight()
						: null}
				>
					{(ttsHighlight) => (
						<g data-tts-highlight="true" style={{ "pointer-events": "none" }}>
							<For each={ttsHighlight().rects}>
								{([x0, y0, x1, y1]) => (
									<rect
										x={x0}
										y={y0}
										width={x1 - x0}
										height={y1 - y0}
										fill-opacity="0.3"
									/>
								)}
							</For>
						</g>
					)}
				</Show>
			</g>
		</svg>
	);
}
