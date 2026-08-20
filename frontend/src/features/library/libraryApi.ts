import { http } from "../../core/http";

async function fetchDocs() {
	return await http("api/docs", "GET");
}

export const libraryApi = { fetchDocs };
