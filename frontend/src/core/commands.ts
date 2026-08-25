import { documentApi } from "../api/documentApi";
import { registerCommand } from "./keybinds";

async function libraryScan() {
	const res = await documentApi.scanDocs();
}

async function refreshCovers() {
	const res = documentApi.refreshCovers();
}

registerCommand("library.scan", libraryScan);
registerCommand("library.refreshCovers", refreshCovers);
