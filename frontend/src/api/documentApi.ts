import { http } from "../core/http"
import { Sentence } from "../features/viewers/primitives/createTTS"
import { PDFRect } from "../stores/createDocumentStore"

async function getDoc(id: string) {
	return await http(`/api/documents/${id}`, { method: "GET" })
}

async function getDocs() {
	return await http("api/documents", { method: "GET" })
}

async function scanDocs() {
	return await http("api/documents/scan", { method: "POST" })
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
	const sentences: Sentence[] = await http(`/api/documents/${id}/${page}/text`, { method: "GET", signal })
	return sentences.map(({ text, rects }) => ({
		text,
		rects: rects.map(({ x0, y0, x1, y1 }): PDFRect => [x0, y0, x1, y1])
	}))
}

export const documentApi = { getDoc, getDocs, getCoverUrl, getFileUrl, getPageText, scanDocs, refreshCovers }
