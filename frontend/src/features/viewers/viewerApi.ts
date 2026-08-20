import { http } from "../../core/http";
import type { Annotation, AnnotationCreate } from "../../stores/createBookStore";

async function addAnnotation(ann: AnnotationCreate) {
	console.log(JSON.stringify(ann));
	return await http("/api/annotations", "POST", ann);
}

async function deleteAnnotation(id: string) {
	return await http("/api/annotations", "DELETE");
}

async function getDoc(id: string) {
	return await http(`/api/docs/${id}`, "GET");
}

export const viewerApi = { addAnnotation, getDoc };
