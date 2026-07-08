import { http } from "../utils/http";
import { registerCommand } from "./keybinds";

async function libraryScan() {
	const res = http.get("api/docs/scan");
}

// bookmark
async function setPrimaryColor(id: string, color: string) {
	const res = http.post(`/api/docs/{id}`, { primary_color: color });
}

registerCommand("library.scan", libraryScan);
