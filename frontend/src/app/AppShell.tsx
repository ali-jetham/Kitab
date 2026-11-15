import { createPresence } from "@solid-primitives/presence"
import type { RouteSectionProps } from "@solidjs/router"
import { type JSX, Portal, Show } from "@solidjs/web"
import { onSettled } from "solid-js"
import { attachKeybinds } from "../core/keymap"
import styles from "./AppShell.module.css"
import ActionBar from "./components/ActionBar"
import CommandPallete from "./components/CommandPallete"
import SideBar from "./components/SideBar"
import StatusBar from "./components/StatusBar"
import { AppProvider, useAppContext } from "./contexts/AppContext"
import { SideBarProvider } from "./contexts/SideBarContext"
import { StatusBarProvider } from "./contexts/StatusBarContext"
import { createAppCommands } from "./primitives/createAppCommands"

export default function AppShell(props: RouteSectionProps) {
	return (
		<AppProvider>
			<SideBarProvider>
				<StatusBarProvider>
					<AppLayout>{props.children}</AppLayout>
				</StatusBarProvider>
			</SideBarProvider>
		</AppProvider>
	)
}

function AppLayout(props: { children: JSX.Element }) {
	const { appStore, setAppStore } = useAppContext()
	attachKeybinds(window, () => appStore.context)
	createAppCommands(setAppStore)

	const showActionBar = () => appStore.isActionOpen && appStore.isMobile()
	const presence = createPresence(showActionBar, { transitionDuration: 300 })

	function onContextMenu(e: PointerEvent) {
		e.preventDefault()
	}

	onSettled(() => {
		document.addEventListener("contextmenu", onContextMenu)

		return () => {
			document.removeEventListener("contextmenu", onContextMenu)
		}
	})

	return (
		<div class={styles.app} data-sidebar={appStore.isSideBarOpen ? "open" : "closed"}>
			<Show when={appStore.isSideBarOpen}>
				<SideBar appStore={appStore} setAppStore={setAppStore} />
			</Show>
			<main class={styles.main}>{props.children}</main>

			<Show when={!appStore.isMobile() && appStore.isStatusOpen}>
				<StatusBar appStore={appStore} setAppStore={setAppStore} />
			</Show>

			<Show when={presence.isMounted()}>
				<ActionBar appStore={appStore} setAppStore={setAppStore} visible={presence.isVisible} />
			</Show>

			<Portal>
				<Show when={appStore.isCommandPalleteOpen}>
					<CommandPallete appStore={appStore} setAppStore={setAppStore} />
				</Show>
			</Portal>
		</div>
	)
}
