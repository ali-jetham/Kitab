import { registerCommand } from "./keybinds";

async function libraryScan() {
	const url = "api/docs/scan";
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const result = await response.json();
		console.log(result);
	} catch (error) {
		console.error(error.message);
	}
}

registerCommand("library.scan", libraryScan);
