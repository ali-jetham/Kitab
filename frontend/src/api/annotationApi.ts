import { http } from "../core/http"
import type { AnnotationCreate, AnnotationUpdate } from "./types/types.gen"

async function getAllAnnotations() {
	return await http(`/api/annotations`, { method: "GET" })
}

async function addAnnotation(ann: AnnotationCreate) {
	return await http("/api/annotations", { method: "POST", body: ann })
}

async function updateAnnotation(id: string, ann: AnnotationUpdate) {
	return await http(`/api/annotations/${id}`, { method: "PUT", body: ann })
}

async function deleteAnnotation(id: string) {
	return await http(`/api/annotations/${id}`, { method: "DELETE" }, async (_r) => null)
}

export const annotationApi = {
	getAllAnnotations,
	addAnnotation,
	deleteAnnotation,
	updateAnnotation
}
