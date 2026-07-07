type PDFHighlightProps = {
	x: number;
	y: number;
	width: number;
	height: number;
	color: string;
};
export default function PDFHighlight(props: PDFHighlightProps) {
	return (
		<rect
			x={props.x}
			y={props.y}
			width={props.width}
			height={props.height}
			fill={props.color}
			fill-opacity="0.3"
		/>
	);
}
