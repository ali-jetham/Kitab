import { Accessor, onMount } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
export type PDFRect = [llx: number, lly: number, urx: number, ury: number];

export type Annotation = {
	id: string;
	docId: string;
	page: number;
	text: string;
	style: "highlight" | "underline";
	color: string;
	note: string;
	rects: PDFRect[];
	createdAt: string;
	updatedAt: string;
};
export type AnnotationCreate = Omit<Annotation, "createdAt" | "updatedAt">;

export type Doc = {
	id: string;
	primaryColor: string;
	annotations: Annotation[];
	location: [];
	isDirty: boolean;
	annotationId: string | null;
};

export function createDocumentStore(id: string) {
	const [store, setStore] = createStore<Doc>({
		id: id,
		primaryColor: "",
		annotations: [],
		location: [],
		isDirty: false,
		annotationId: null
	});

	async function init(doc: Doc) {
		setStore(
			reconcile({
				id,
				primaryColor: doc.primaryColor,
				annotations: doc.annotations ?? [],
				location: doc.location ?? [],
				isDirty: false,
				annotationId: null
			})
		);
	}

	async function addAnnotation(annotation: AnnotationCreate) {
		setStore("annotations", store.annotations.length, { ...annotation });
	}

	async function deleteAnnotation(id: string) {
		setStore("annotations", (list) => list.filter((a) => a.id !== id));
	}

	function getAnnotationsByPage(page: number): Accessor<Annotation[]> {
		return () => store.annotations.filter(ann => ann.page === page);
	}

	return { store, actions: { init, addAnnotation, deleteAnnotation, getAnnotationsByPage } };
}
