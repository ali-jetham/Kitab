import { onCleanup, type Setter } from "solid-js"
import { commands } from "../../../core/commands"

function goToSection(view: any, delta: 1 | -1) {
	const current = view.renderer.getContents()[0]?.index
	if (current == null) return
	const { sections } = view.book
	let target = current + delta
	while (sections[target] && sections[target].linear === "no") target += delta
	if (target < 0 || target >= sections.length) return // stay put at the book's ends

	return view.goTo(target)
}

export function createEPUBCommands(view: any, setFontSize: Setter<number>) {
	const unregisters = [
		commands.registerCommand("epub.sectionN", () => goToSection(view, 1)),
		commands.registerCommand("epub.sectionP", () => goToSection(view, -1)),
		commands.registerCommand("epub.goRight", () => view.goRight()),
		commands.registerCommand("epub.goLeft", () => view.goLeft()),
		commands.registerCommand("epub.textIn", () => setFontSize((prev) => prev + 0.1)),
		commands.registerCommand("epub.textDec", () => setFontSize((prev) => prev - 0.1)),
		commands.registerCommand("epub.textReset", () => setFontSize(1)),
		commands.registerCommand("epub.Paginated", () => view.renderer.setAttribute("flow", "paginated")), // biome-ignore format: f
		commands.registerCommand("epub.Scrolled", () => view.renderer.setAttribute("flow", "scrolled"))
	]

	onCleanup(() => {
		unregisters.forEach((unregister) => {
			unregister()
		})
	})
}
