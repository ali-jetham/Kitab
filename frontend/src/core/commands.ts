import { http } from "./http";
import { registerCommand } from "./keybinds";

async function libraryScan() {
	const res = http("api/docs/scan", "GET");
}

// TODO
async function setPrimaryColor(id: string, color: string) {
	const res = http(`/api/docs/{id}`, "POST", { primary_color: color });
}

registerCommand("library.scan", libraryScan);
