import { createEffect, createSignal, onCleanup, onSettled } from "solid-js"
import { documentApi } from "../../../api/documentApi.js"
import { useAppContext } from "../../../app/contexts/AppContext.jsx"
import { useSideBarContext } from "../../../app/contexts/SideBarContext.jsx"
import { helper } from "../../../core/helper"
import { attachKeybinds } from "../../../core/keymap.js"
import "../../../lib/foliate-js/view.js"
import { createEPUBCommands } from "../primitives/createEPUBCommands"
import styles from "./EPUBViewer.module.css"

type FoliateView = HTMLElement & Record<string, any>
type EPUBViewerProps = { id: string }

export default function EPUBViewer(props: EPUBViewerProps) {
	const url = documentApi.getFileUrl(props.id)
	const { setAppStore, appStore } = useAppContext()
	const { setSideBarStore } = useSideBarContext()
	const [fontSize, setFontSize] = createSignal(1)

	const view = document.createElement("foliate-view") as FoliateView
	view.addEventListener("load", ({ detail: { doc } }: any) => {
		attachKeybinds(doc.defaultView, () => appStore.context)
	})

	createEPUBCommands(view, setFontSize)

	const css = () => `
	html {
		background-color: ${helper.getCSSVar("--view-bg-color")};
		color: ${helper.getCSSVar("--view-fg-color")};
		font-size: ${fontSize()}rem;
	}
	a {
	color: ${helper.getCSSVar("--accent-color")};
	}
	::selection {
	background: color-mix(in srgb, ${helper.getCSSVar("--accent-bg-color")} 30%, transparent);
	}
	`

	async function load() {
		try {
			await view.open(url)
			view.renderer.setStyles(css())
			view.renderer.setAttribute("flow", "scrolled")
			view.renderer.setAttribute("animated", "")
			view.renderer.setAttribute("margin", "0")
			await view.init({ lastLocation: null })
			console.log(view.book.toc)
			setSideBarStore((draft) => {
				draft.tocState = {
					status: "ready",
					outline: view.book.toc?.map(helper.fromEPUBToc) ?? null
				}
				draft.navigate = (target) => view.goTo(target)
			})
		} catch (err) {
			console.error("EPUB failed to open:", err)
			setSideBarStore((draft) => {
				draft.tocState = { status: "error", outline: null }
			})
		}
	}

	createEffect(
		() => css(),
		(css) => {
			view?.renderer?.setStyles?.(css)
		}
	)

	onSettled(() => {
		setAppStore((draft) => {
			draft.context = "epub"
		})
		load()
	})
	onCleanup(() => view.close?.())

	return <div class={styles.foliate__view}>{view}</div>
}
