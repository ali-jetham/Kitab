import { http } from "../../core/http";
import type { AnnotationCreate } from "../../stores/createDocumentStore";

async function addAnnotation(ann: AnnotationCreate) {
	console.log(JSON.stringify(ann));
	return await http("/api/annotations", "POST", ann);
}

async function deleteAnnotation(id: string) {
	return await http(`/api/annotations/${id}`, "DELETE");
}

async function getDoc(id: string) {
	return await http(`/api/docs/${id}`, "GET");
}

export const viewerApi = { getDoc, addAnnotation, deleteAnnotation };
