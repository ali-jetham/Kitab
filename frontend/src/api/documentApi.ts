import { http } from "../core/http"

async function getDoc(id: string) {
	return await http(`/api/documents/${id}`, { method: "GET" })
}

async function getDocs(folder?: string) {
	return await http("api/documents", {
		method: "GET",
		queryParams: { folder }
	})
}

async function getDocsFolders() {
	return await http("/api/documents:folders", { method: "GET" })
}

async function refreshCovers() {
	return await http("api/documents/refresh", { method: "POST" })
}

function getCoverUrl(id: string) {
	return `/api/documents/${id}/cover`
}

function getFileUrl(id: string) {
	return `/api/documents/${id}/file`
}

async function getPageText(id: string, page: number, signal?: AbortSignal) {
	return await http(`/api/documents/${id}/${page}/text`, {
		method: "GET",
		signal
	})
}

export const documentApi = {
	getDoc,
	getDocs,
	getDocsFolders,
	getCoverUrl,
	getFileUrl,
	getPageText,
	refreshCovers
}
