import { http } from "../../core/http";
import type { AnnotationCreate } from "../../stores/createBookStore";

async function addAnnotation(ann: AnnotationCreate) {
	console.log(JSON.stringify(ann));
	return await http.post("/api/annotations", ann);
}

async function getDoc(id: string) {
	return await http.get(`/api/docs/${id}`);
}

export const viewerApi = { addAnnotation, getDoc };
