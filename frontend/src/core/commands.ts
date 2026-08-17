import { http } from "./http";
import { registerCommand } from "./keybinds";

async function libraryScan() {
	const res = http.get("api/docs/scan");
}

// TODO
async function setPrimaryColor(id: string, color: string) {
	const res = http.post(`/api/docs/{id}`, { primary_color: color });
}

registerCommand("library.scan", libraryScan);
