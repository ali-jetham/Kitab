import { createStore, reconcile } from "solid-js/store";
import { viewerApi } from "../features/viewers/viewerApi";
import { onMount } from "solid-js";
export type PDFRect = [x1: number, y1: number, x2: number, y2: number];

export type Annotation = {
	id: number;
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
export type NewAnnotation = Omit<Annotation, "id" | "createdAt" | "updatedAt">;

export type BookStore = {
	id: string;
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
		annotations: [],
		location: [],
		isDirty: false,
	});

	async function init() {
		const doc = await viewerApi.getBook(id);
		setStore(
			reconcile({
				id,
				annotations: doc?.annotations ?? [],
				location: doc?.location ?? [],
				isDirty: false,
			}),
		);
	}
	async function addAnnotation(annotation: NewAnnotation) {
		annotation.docId = id;
		setStore("annotations", store.annotations.length, {
			...annotation,
		});
		const res = viewerApi.addAnnotation(annotation);
		// TODO: if res error remove annotation from store and notify user
		// TODO: assign tempId to annotation before adding to store, to remove later if needed
	}

	return {
		store,
		addAnnotation,
	};
}
