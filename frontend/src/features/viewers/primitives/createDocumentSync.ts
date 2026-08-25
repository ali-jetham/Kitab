import { onMount } from "solid-js";
import { documentApi } from "../../../api/documentApi";

export function createDocumentSync(id: string, actions: any) {
	onMount(async () => {
		try {
			const doc = await documentApi.getDoc(id);
			if (doc) {
				actions.init(doc);
			}
		} catch (error) {
			console.error("Failed to load document:", error);
		}
	});
}
