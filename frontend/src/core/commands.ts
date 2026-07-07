import { http } from "../utils/http";
import { registerCommand } from "./keybinds";

async function libraryScan() {
	const res = http.get("api/docs/scan");
}

async function setPrimaryColor() {
}

registerCommand("library.scan", libraryScan);
