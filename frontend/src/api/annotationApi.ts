import { http } from "../core/http";
import { AnnotationCreate } from "../stores/createDocumentStore";

async function addAnnotation(ann: AnnotationCreate) {
	return await http("/api/annotations", { method: "POST", body: ann });
}

async function deleteAnnotation(id: string) {
	return await http(`/api/annotations/${id}`, { method: "DELETE" });
}

export const annotationApi = { addAnnotation, deleteAnnotation };
