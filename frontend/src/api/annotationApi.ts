import { http } from "../core/http";
import { AnnotationCreate } from "../stores/createDocumentStore";

async function addAnnotation(ann: AnnotationCreate) {
	return await http("/api/annotations", "POST", ann);
}

async function deleteAnnotation(id: string) {
	return await http(`/api/annotations/${id}`, "DELETE");
}

export const annotationApi = { addAnnotation, deleteAnnotation };
