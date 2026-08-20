import { Accessor, For } from "solid-js";
import { type Annotation } from "../../../stores/createBookStore";
import {
	convertToSVGRect,
	getPageDimensions,
	getRotationTransform
} from "../primitives/createPDFHighlight";
import styles from "./PDFHighlightLayer.module.css";

type PDFHighlightLayerProps = { page: any; annotations: Accessor<Annotation[]>; };

export default function PDFHighlightLayer(props: PDFHighlightLayerProps) {
	const { width: baseW, height: baseH } = props.page.pdfPage.getViewport({
		scale: 1,
		rotation: 0
	});
	const { width, height } = getPageDimensions(props.page);
	console.log(width, height, props.page.viewport.rotation);
	const transform = getRotationTransform(props.page.viewport.rotation, baseW, baseH);

	function handleClick(e: MouseEvent) {
		const target = (e.target as Element).closest("[data-annotation-id]")
		console.log("highlight clicked")
		console.log(target)
		if (target) {
			console.log(`Annotation with id ${target.getAttribute("data-annotation-id")} clicked`)
		}
	}

	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			class={styles.highlightLayer}
			preserveAspectRatio="none"
			data-highlightLayer="true"
		>
			<g transform={transform}>
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
			</g>
		</svg>
	);
}
