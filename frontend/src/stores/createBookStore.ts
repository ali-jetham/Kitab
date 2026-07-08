import { Accessor, onMount } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { viewerApi } from "../features/viewers/viewerApi";
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

export type BookStore = {
	id: string;
	primaryColor: string;
	annotations: Annotation[];
	location: [];
	isDirty: boolean;
};

export function createBookStore(id: string) {
	onMount(() => {
		console.log("createBookStore Mounted");
		init();
	});

	const [store, setStore] = createStore<BookStore>({
		id: id,
		primaryColor: "",
		annotations: [],
		location: [],
		isDirty: false,
	});

	async function init() {
		const doc = await viewerApi.getDoc(id);
		setStore(
			reconcile({
				id,
				primaryColor: doc?.primaryColor,
				annotations: doc?.annotations ?? [],
				location: doc?.location ?? [],
				isDirty: false,
			}),
		);
	}
	async function addAnnotation(annotation: AnnotationCreate) {
		setStore("annotations", store.annotations.length, { ...annotation });
	}

	function getAnnotationsByPage(page: number): Accessor<Annotation[]> {
		return () => store.annotations.filter(ann => ann.page === page);
	}

	return { store, addAnnotation, getAnnotationsByPage };
}
