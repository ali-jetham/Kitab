import { onSettled } from "solid-js"
import "../../../lib/foliate-js/view.js"
import styles from "./EPUBViewer.module.css"

type FoliateView = HTMLElement & Record<string, any>

type EPUBViewerProps = { id: string }

export default function EPUBViewer(props: EPUBViewerProps) {
	let host!: HTMLDivElement
	let view: any

	onSettled(() => {
		view = document.createElement("foliate-view") as FoliateView
		host.append(view)

		async function load() {
			try {
				await view.open(props.id)
				view.renderer.setAttribute("flow", "scrolled")
				await view.init({ lastLocation: null })
			} catch (err) {
				console.error("EPUB failed to open:", err)
			}
		}
		load()

		return () => view.close?.()
	})

	return <div ref={host} class={styles.foliate__view} />
}
