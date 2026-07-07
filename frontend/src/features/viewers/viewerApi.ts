import type { NewAnnotation } from "../../stores/createBookStore";
import { http } from "../../utils/http";

async function addAnnotation(ann: NewAnnotation) {
	return await http.post("/api/annotations", ann);
}

async function getDoc(id: string) {
	return await http.get(`/api/docs/${id}`);
}

export const viewerApi = { addAnnotation, getBook: getDoc };
