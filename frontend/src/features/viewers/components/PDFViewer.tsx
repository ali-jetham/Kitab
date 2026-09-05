import { usePDFSlick } from "@pdfslick/solid";
import { Bookmark } from "lucide-solid";
import { Show } from "solid-js";
import { createStore } from "solid-js/store";
import { documentApi } from "../../../api/documentApi";
import { createDocumentStore } from "../../../stores/createDocumentStore";
import { createDocumentSync } from "../primitives/createDocumentSync";
import { createPDFGestures } from "../primitives/createPDFGestures";
import { createPDFHighlights } from "../primitives/createPDFHighlight";
import { createPDFKeybinds } from "../primitives/createPDFKeybinds";
import HighlightToolbar from "./HighlightToolbar";
import styles from "./PDFViewer.module.css";

export type ViewerStore = {
	docId: string;
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
		docId: props.id,
		annotationId: null,
		anchorRef: undefined,
		selectedColor: "#ffd400",
		showToolbar: false
	});

	const { store: documentStore, actions } = createDocumentStore(props.id);
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

	const hasBookmark = () => {
		const currentPage = pdfSlickStore.pageNumber;
		if (!currentPage) return false;
		return documentStore.bookmarks.some(bm => bm.page === currentPage);
	};

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

			<Show when={hasBookmark()}>
				<div class={styles.bookmark}>
					<Bookmark fill="red" stroke="red" />
				</div>
			</Show>
		</div>
	);
}
