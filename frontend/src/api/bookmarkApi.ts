import { http } from "../core/http"
import type { BookmarkCreate } from "./types/types.gen"

const BASE_URL = "/api/bookmarks"

async function getBookmark() {}

async function addBookmark(bookmark: BookmarkCreate) {
	return await http(BASE_URL, { method: "POST", body: bookmark })
}

async function deleteBookmark(id: string) {
	return await http(`${BASE_URL}/${id}`, { method: "DELETE" })
}

export const bookmarkApi = { getBookmark, addBookmark, deleteBookmark }
