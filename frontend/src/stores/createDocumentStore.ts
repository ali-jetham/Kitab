import { type Accessor, createStore, reconcile } from "solid-js"
import type { components } from "../api/schema"
import { documentApi } from "../api/documentApi"

export type PDFRect = components["schemas"]["PDFRect"]

export type AnnotationBase = components["schemas"]["AnnotationBase"]
export type AnnotationRead = components["schemas"]["AnnotationRead"]
export type AnnotationCreate = components["schemas"]["AnnotationCreate"]
export type AnnotationUpdate = components["schemas"]["AnnotationUpdate"]

export type BookmarkCreate = components["schemas"]["BookmarkCreate"]
export type BookmarkRead = components["schemas"]["BookmarkRead"]

export type Document = components["schemas"]["DocumentRead"]

export function createDocumentStore(id: string) {
	const [documentStore, setDocumentStore] = createStore<Document>(async () =>
		documentApi.getDoc(id)
	)

	async function addAnnotation(annotation: AnnotationCreate) {
		const now = new Date().toUTCString()
		setDocumentStore((draft) => {
			draft.annotations.push({ ...annotation, createdAt: now, updatedAt: now })
		})
	}

	async function updateAnnotation(id: string, annotationUpdate: AnnotationUpdate) {
		setDocumentStore((draft) => {
			const ann = draft.annotations.find((a) => a.id === id)
			if (ann) Object.assign(ann, annotationUpdate)
		})
	}

	async function deleteAnnotation(id: string) {
		setDocumentStore((draft) => {
			draft.annotations = draft.annotations.filter((a) => a.id !== id)
		})
	}

	function getAnnotationsByPage(page: number): Accessor<AnnotationBase[]> {
		return () => documentStore.annotations.filter((ann) => ann.page === page)
	}

	function addBookmark(bookmark: BookmarkCreate) {
		const now = new Date().toUTCString()
		setDocumentStore((draft) => {
			draft.bookmarks.push({ ...bookmark, createdAt: now, updatedAt: now })
		})
	}

	function deleteBookmark(id: string) {
		setDocumentStore((draft) => {
			draft.bookmarks = draft.bookmarks.filter((bm) => bm.id !== id)
		})
	}

	return {
		documentStore,
		actions: {
			addAnnotation,
			deleteAnnotation,
			getAnnotationsByPage,
			addBookmark,
			deleteBookmark,
			updateAnnotation
		}
	}
}
