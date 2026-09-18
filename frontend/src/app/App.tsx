import { createMediaQuery } from "@solid-primitives/media";
import type { RouteSectionProps } from "@solidjs/router";
import { createContext, createEffect, onCleanup, onMount } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";
import { Portal, Show } from "solid-js/web";
import { Transition } from "solid-transition-group";
import { type CommandId, dispatch, setActiveContexts } from "../core/keybinds";
import styles from "./App.module.css";
import ActionBar from "./components/ActionBar";
import actionBarStyles from "./components/ActionBar.module.css";
import Modal from "./components/Modal";
import SideBar from "./components/SideBar";
import StatusBar from "./components/StatusBar";
import { SideBarProvider } from "./contexts/SideBarContext";
import { createAppCommands } from "./primitives/createAppCommands";

export type AppStore = {
	isMobile: () => boolean;
	isModalOpen: boolean;
	isActionOpen: boolean;
	isSideBarOpen: boolean;
	modalArgs: { id: string; label: string; hidden: boolean; }[] | null;
	modalSelectedCommand: CommandId | null;
	trigger: number;
};

export type AppContextType = {
	appStore: AppStore;
	setAppStore: SetStoreFunction<AppStore>;
};

export const AppContext = createContext<AppContextType>();
export default function App(props: RouteSectionProps) {
	const [appStore, setAppStore] = createStore<AppStore>({
		isMobile: createMediaQuery("(max-width: 768px)"),
		isModalOpen: false,
		isActionOpen: true,
		isSideBarOpen: true,
		modalArgs: null,
		modalSelectedCommand: null,
		trigger: 0
	});
	createAppCommands(appStore, setAppStore);

	createEffect(() => {
		setActiveContexts(
			appStore.isModalOpen ? ["modal", "viewer", "global"] : ["viewer", "global"]
		);
	});

	onMount(() => {
		document.addEventListener("keydown", dispatch);
		document.addEventListener("contextmenu", (e) => e.preventDefault());
	});

	onCleanup(() => {
		document.removeEventListener("keydown", dispatch);
		document.removeEventListener("contextmenu", (e) => e.preventDefault());
	});

	return (
		<AppContext.Provider value={{ appStore, setAppStore }}>
			<SideBarProvider>
				<div
					class={styles.app}
					classList={{ [styles.sidebarClosed]: !appStore.isSideBarOpen }}
				>
					<Show when={appStore.isSideBarOpen}>
						<SideBar />
					</Show>
					<main class={styles.main}>{props.children}</main>

					<Show when={!appStore.isMobile()}>
						<StatusBar />
					</Show>

					<Transition
						enterClass={actionBarStyles.slideEnter}
						enterActiveClass={actionBarStyles.slideEnterActive}
						enterToClass={actionBarStyles.slideEnterTo}
						exitClass={actionBarStyles.slideExit}
						exitActiveClass={actionBarStyles.slideExitActive}
						exitToClass={actionBarStyles.slideExitTo}
					>
						<Show when={appStore.isActionOpen && appStore.isMobile()}>
							<ActionBar setAppStore={setAppStore} />
						</Show>
					</Transition>

					<Portal>
						<Show when={appStore.isModalOpen}>
							<Modal appStore={appStore} setAppStore={setAppStore} />
						</Show>
					</Portal>
				</div>
			</SideBarProvider>
		</AppContext.Provider>
	);
}
