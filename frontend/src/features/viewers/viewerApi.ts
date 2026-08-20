import { http } from "../../core/http";
import type { Annotation, AnnotationCreate } from "../../stores/createBookStore";

async function addAnnotation(ann: AnnotationCreate) {
	console.log(JSON.stringify(ann));
	return await http.post("/api/annotations", ann);
}

async function deleteAnnotation(id: string) {
	return await http.delete("/api/annotations");
}

async function getDoc(id: string) {
	return await http.get(`/api/docs/${id}`);
}

export const viewerApi = { addAnnotation, getDoc };
