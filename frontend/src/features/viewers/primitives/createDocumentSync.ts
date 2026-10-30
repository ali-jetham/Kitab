import { createEffect, createMemo } from "solid-js"
import { documentApi } from "../../../api/documentApi"

export function createDocumentSync(id: string, actions: any) {
	const doc = createMemo(() => documentApi.getDoc(id))

	createEffect(() => doc(), (doc) => {
		if (doc) actions.init(doc)
	})
}
