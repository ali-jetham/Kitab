import { http } from "../../utils/http";

async function fetchDocs() {
	return await http.get("api/docs");
}

export const libraryApi = { fetchDocs };
