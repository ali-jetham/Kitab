import { onMount } from "solid-js";
import { viewerApi } from "../viewerApi";

export function createDocumentSync(id: string, actions: any) {
	onMount(async () => {
		try {
			const doc = await viewerApi.getDoc(id);
			if (doc) {
				actions.init(doc);
			}
		} catch (error) {
			console.error("Failed to load document:", error);
		}
	});
}
