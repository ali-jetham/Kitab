import { http } from "../core/http"
import { Annotation, AnnotationCreate } from "../stores/createDocumentStore"

async function getAllAnnotations() {
	return await http(`/api/annotations`, { method: "GET" })
}

async function addAnnotation(ann: AnnotationCreate) {
	return await http("/api/annotations", { method: "POST", body: ann })
}

async function updateAnnotation(id: string, ann: Annotation) {
	return await http(`/api/annotations/${id}`, { method: "PUT", body: ann })
}

async function deleteAnnotation(id: string) {
	return await http(`/api/annotations/${id}`, { method: "DELETE" })
}

export const annotationApi = { getAllAnnotations, addAnnotation, deleteAnnotation, updateAnnotation }
