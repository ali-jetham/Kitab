import { createSignal, onCleanup, onSettled } from "solid-js"

export function createPDFSelection() {
	function handleSelection(e: PointerEvent) {
		const selection = window.getSelection()
		if (!selection || selection.isCollapsed) return
	}

	onSettled(() => {
		document.addEventListener("pointerup", handleSelection)
	})

	onCleanup(() => {
		document.removeEventListener("pointerup", handleSelection)
	})
}
