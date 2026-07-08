import type { AnnotationCreate } from "../../stores/createBookStore";
import { http } from "../../utils/http";

async function addAnnotation(ann: AnnotationCreate) {
	console.log(JSON.stringify(ann));
	return await http.post("/api/annotations", ann);
}

async function getDoc(id: string) {
	return await http.get(`/api/docs/${id}`);
}

export const viewerApi = { addAnnotation, getDoc };
