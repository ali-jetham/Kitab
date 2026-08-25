import { usePDFSlick } from "@pdfslick/solid";
import { createStore } from "solid-js/store";
import { documentApi } from "../../../api/documentApi";
import { createDocumentStore } from "../../../stores/createDocumentStore";
import { createDocumentSync } from "../primitives/createDocumentSync";
import { createPDFGestures } from "../primitives/createPDFGestures";
import { createPDFHighlights } from "../primitives/createPDFHighlight";
import { createPDFKeybinds } from "../primitives/createPDFKeybinds";
import HighlightToolbar from "./HighlightToolbar";

export type ViewerStore = {
	showToolbar: boolean;
	anchorRef: HTMLElement | undefined;
	selectedColor: string;
	annotationId: string | null;
};

type PDFViewerProps = { id: string; };

export default function PDFViewer(props: PDFViewerProps) {
	let containerRef!: HTMLDivElement;
	const url = documentApi.getFileUrl(props.id);

	const { viewerRef, pdfSlickStore, PDFSlickViewer } = usePDFSlick(url, {
		scaleValue: "page-fit",
		removePageBorders: true,
		getDocumentParams: {
			rangeChunkSize: 65536,
			disableAutoFetch: true,
			disableStream: false
		}
	});

	const [viewerStore, setViewerStore] = createStore<ViewerStore>({
		annotationId: null,
		anchorRef: undefined,
		selectedColor: "#ffd400",
		showToolbar: false
	});

	const { actions } = createDocumentStore(props.id);
	createDocumentSync(props.id, actions);
	createPDFGestures(pdfSlickStore, () => containerRef);
	createPDFKeybinds(pdfSlickStore, viewerStore, actions);

	const highlights = createPDFHighlights(
		pdfSlickStore,
		props.id,
		actions,
		viewerStore.selectedColor,
		setViewerStore
	);

	return (
		<div ref={containerRef} class="pdfslick-container pdfSlick">
			<div>
				<PDFSlickViewer {...{ store: pdfSlickStore, viewerRef }} />
			</div>

			<HighlightToolbar
				open={viewerStore.showToolbar}
				anchorRef={viewerStore.anchorRef}
				setViewerStore={setViewerStore}
				onSelectColor={(color) => {
					setViewerStore("selectedColor", color);
					setViewerStore((prev) => ({
						...prev,
						showToolbar: false,
						anchorRef: undefined
					}));
					highlights.commitAnnotation(color);
				}}
			/>
		</div>
	);
}
