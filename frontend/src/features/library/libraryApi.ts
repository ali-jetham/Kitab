import { http } from "../../core/http";

async function fetchDocs() {
	return await http.get("api/docs");
}

export const libraryApi = { fetchDocs };
