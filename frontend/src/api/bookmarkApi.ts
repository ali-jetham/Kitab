import { http } from "../core/http";
import { BookmarkCreate } from "../stores/createDocumentStore";
const BASE_URL = "/api/bookmarks";

async function addBookmark(bookmark: BookmarkCreate) {
	return await http(BASE_URL, { method: "POST", body: bookmark });
}

async function getBookmark() {
}

export const bookmarkApi = { addBookmark, getBookmark };
