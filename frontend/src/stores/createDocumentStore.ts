import { Accessor } from "solid-js"
import { createStore, reconcile } from "solid-js"
export type PDFRect = [llx: number, lly: number, urx: number, ury: number]

export type Annotation = {
	id: string
	docId: string
	page: number
	text: string
	style: "highlight" | "underline"
	color: string
	note: string
	rects: PDFRect[]
	createdAt: string
	updatedAt: string
}
export type AnnotationCreate = Omit<Annotation, "createdAt" | "updatedAt">
export type AnnotationUpdate = Partial<Omit<Annotation, "id" | "docId" | "rects" | "createdAt" | "updatedAt">>

export type Bookmark = { id: number; docId: string; page: number; note: string; createdAt: string; updatedAt: string }
export type BookmarkCreate = Omit<Bookmark, "id" | "createdAt" | "updatedAt">

export type Document = {
	id: string
	primaryColor: string
	annotations: Annotation[]
	bookmarks: Bookmark[]
	location: []
	isDirty: boolean
}

export function createDocumentStore(id: string) {
	const [documentStore, setDocumentStore] = createStore<Document>({
		id: id,
		primaryColor: "",
		annotations: [],
		bookmarks: [],
		location: [],
		isDirty: false
	})

	async function init(doc: Document) {
		setDocumentStore(
			reconcile({
				id,
				primaryColor: doc.primaryColor,
				annotations: doc.annotations ?? [],
				bookmarks: doc.bookmarks ?? [],
				location: doc.location ?? [],
				isDirty: false
			})
		)
	}

	async function addAnnotation(annotation: AnnotationCreate) {
		setDocumentStore(draft => {
			draft.annotations.push(annotation)
		})
	}

	async function updateAnnotation(id: string, annotationUpdate: AnnotationUpdate) {
		setDocumentStore(draft => {
			const ann = draft.annotations.find((a) => a.id === id)
			if (ann) Object.assign(ann, annotationUpdate)
		})
	}

	async function deleteAnnotation(id: string) {
		setDocumentStore(draft => {
			draft.annotations = draft.annotations.filter(a => a.id !== id)
		})
	}

	function getAnnotationsByPage(page: number): Accessor<Annotation[]> {
		return () => documentStore.annotations.filter(ann => ann.page === page)
	}

	function addBookmark(bookmark: BookmarkCreate) {
		setDocumentStore(draft => {
			draft.bookmarks.push(bookmark)
		})
	}

	function deleteBookmark(id: number) {
		setDocumentStore(draft => {
			draft.bookmarks = draft.bookmarks.filter(bm => bm.id !== id)
		})
	}

	return {
		documentStore,
		actions: {
			init,
			addAnnotation,
			deleteAnnotation,
			getAnnotationsByPage,
			addBookmark,
			deleteBookmark,
			updateAnnotation
		}
	}
}
