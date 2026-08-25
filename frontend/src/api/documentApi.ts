import { http } from "../core/http";

async function getDoc(id: string) {
	return await http(`/api/documents/${id}`, "GET");
}

async function getDocs() {
	return await http("api/documents", "GET");
}

async function scanDocs() {
	return await http("api/documents/scan", "POST");
}

async function refreshCovers() {
	return await http("api/documents/refresh", "POST");
}

function getCoverUrl(id: string) {
	return `/api/documents/${id}/cover`;
}

function getFileUrl(id: string) {
	return `/api/documents/${id}/file`;
}

export const documentApi = { getDoc, getDocs, getCoverUrl, getFileUrl, scanDocs, refreshCovers };
