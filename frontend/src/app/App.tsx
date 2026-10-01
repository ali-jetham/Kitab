import { createMediaQuery } from "@solid-primitives/media"
import type { RouteSectionProps } from "@solidjs/router"
import { createContext, createEffect, onCleanup, onMount } from "solid-js"
import { createStore, type SetStoreFunction } from "solid-js/store"
import { Portal, Show } from "solid-js/web"
import { Transition } from "solid-transition-group"
import { tinykeys } from "tinykeys"
import { CommandId } from "../core/commands"
import { commands } from "../core/commands"
import { keymap } from "../core/keymap"
import styles from "./App.module.css"
import ActionBar from "./components/ActionBar"
import actionBarStyles from "./components/ActionBar.module.css"
import Modal from "./components/Modal"
import SideBar from "./components/SideBar"
import StatusBar from "./components/StatusBar"
import { SideBarProvider } from "./contexts/SideBarContext"
import { StatusBarProvider } from "./contexts/StatusBarContext"
import { createAppCommands } from "./primitives/createAppCommands"

export type AppStore = {
	isMobile: () => boolean
	isModalOpen: boolean
	isActionOpen: boolean
	isSideBarOpen: boolean
	isStatusOpen: boolean
	modalArgs: { id: string; label: string; hidden: boolean }[] | null
	modalSelectedCommand: CommandId | null
	trigger: number
}

export type AppContextType = {
	appStore: AppStore
	setAppStore: SetStoreFunction<AppStore>
}

export const AppContext = createContext<AppContextType>()
export default function App(props: RouteSectionProps) {
	const [appStore, setAppStore] = createStore<AppStore>({
		isMobile: createMediaQuery("(max-width: 768px)"),
		isModalOpen: false,
		isActionOpen: true,
		isSideBarOpen: true,
		isStatusOpen: true,
		modalArgs: null,
		modalSelectedCommand: null,
		trigger: 0
	})

	const bindings: Record<string, (event: KeyboardEvent) => void> = {}
	for (const binding of keymap) {
		bindings[binding.key] = (event) => {
			event.preventDefault()
			commands.executeCommand(binding.command, { event })
			console.log(binding.key, "pressed")
		}
	}
	createAppCommands(appStore, setAppStore)

	onMount(() => {
		const unregister = tinykeys(window, bindings)
		document.addEventListener("contextmenu", (e) => e.preventDefault())

		onCleanup(() => {
			unregister()
			document.removeEventListener("contextmenu", (e) => e.preventDefault())
		})
	})

	return (
		<AppContext.Provider value={{ appStore, setAppStore }}>
			<SideBarProvider>
				<StatusBarProvider>
					<div
						class={styles.app}
						data-sidebar={appStore.isSideBarOpen ? "open" : "closed"}
					>
						<Show when={appStore.isSideBarOpen}>
							<SideBar appStore={appStore} setAppStore={setAppStore} />
						</Show>
						<main class={styles.main}>{props.children}</main>

						<Show when={!appStore.isMobile() && appStore.isStatusOpen}>
							<StatusBar appStore={appStore} setAppStore={setAppStore} />
						</Show>

						<Transition
							enterClass={actionBarStyles.slideEnter}
							enterActiveClass={actionBarStyles.slideEnterActive}
							enterToClass={actionBarStyles.slideEnterTo}
							exitClass={actionBarStyles.slideExit}
							exitActiveClass={actionBarStyles.slideExitActive}
							exitToClass={actionBarStyles.slideExitTo}
						>
							<Show
								when={appStore.isActionOpen && appStore.isMobile()
									|| appStore.isMobile() && appStore.isSideBarOpen}
							>
								<ActionBar appStore={appStore} setAppStore={setAppStore} />
							</Show>
						</Transition>

						<Portal>
							<Show when={appStore.isModalOpen}>
								<Modal appStore={appStore} setAppStore={setAppStore} />
							</Show>
						</Portal>
					</div>
				</StatusBarProvider>
			</SideBarProvider>
		</AppContext.Provider>
	)
}
