import { createMediaQuery } from "@solid-primitives/media"
import type { RouteSectionProps } from "@solidjs/router"
import { Portal, Show } from "@solidjs/web"
import { createContext, onSettled, StoreSetter, useContext } from "solid-js"
import { createStore } from "solid-js"
import { tinykeys } from "tinykeys"
import { CommandId } from "../core/commands"
import { commands } from "../core/commands"
import { keymap } from "../core/keymap"
import styles from "./App.module.css"
import ActionBar from "./components/ActionBar"
import CommandPallete from "./components/CommandPallete"
import SideBar from "./components/SideBar"
import StatusBar from "./components/StatusBar"
import { SideBarProvider } from "./contexts/SideBarContext"
import { StatusBarProvider } from "./contexts/StatusBarContext"
import { createAppCommands } from "./primitives/createAppCommands"

export type AppStore = {
	isMobile: () => boolean
	isCommandPalleteOpen: boolean
	isActionOpen: boolean
	isSideBarOpen: boolean
	isStatusOpen: boolean
	commandPalleteArgs: {
		group: string
		options: { id: string; label: string; hidden: boolean }[]
	}[] | null

	commandPalleteSelectedCommand: CommandId | null
	trigger: number
}

export type AppContextType = { appStore: AppStore; setAppStore: StoreSetter<AppStore> }

export const AppContext = createContext<AppContextType>()

export default function App(props: RouteSectionProps) {
	const [appStore, setAppStore] = createStore<AppStore>({
		isMobile: createMediaQuery("(max-width: 768px)"),
		isCommandPalleteOpen: false,
		isActionOpen: true,
		isSideBarOpen: true,
		isStatusOpen: true,
		commandPalleteArgs: null,
		commandPalleteSelectedCommand: null,
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

	onSettled(() => {
		const unregister = tinykeys(window, bindings)
		document.addEventListener("contextmenu", (e) => e.preventDefault())

		return () => {
			unregister()
			document.removeEventListener("contextmenu", (e) => e.preventDefault())
		}
	})

	return (
		<AppContext value={{ appStore, setAppStore }}>
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

						{
							/*<Transition
							enterClass={actionBarStyles.slideEnter}
							enterActiveClass={actionBarStyles.slideEnterActive}
							enterToClass={actionBarStyles.slideEnterTo}
							exitClass={actionBarStyles.slideExit}
							exitActiveClass={actionBarStyles.slideExitActive}
							exitToClass={actionBarStyles.slideExitTo}
						>*/
						}
						<Show
							when={appStore.isActionOpen && appStore.isMobile()
								|| appStore.isMobile() && appStore.isSideBarOpen}
						>
							<ActionBar appStore={appStore} setAppStore={setAppStore} />
						</Show>
						{/*</Transition>*/}

						<Portal>
							<Show when={appStore.isCommandPalleteOpen}>
								<CommandPallete appStore={appStore} setAppStore={setAppStore} />
							</Show>
						</Portal>
					</div>
				</StatusBarProvider>
			</SideBarProvider>
		</AppContext>
	)
}

export function useAppContext() {
	const context = useContext(AppContext)
	if (!context) throw new Error("AppContext.Provider is missing")
	return context
}
