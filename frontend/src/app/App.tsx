import type { RouteSectionProps } from "@solidjs/router";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Portal, Show } from "solid-js/web";
import { Transition } from "solid-transition-group";
import { dispatch, registerCommand, setActiveContexts } from "../core/keybinds";
import styles from "./App.module.css";
import ActionBar from "./components/ActionBar";
import actionBarStyles from "./components/ActionBar.module.css";
import Modal from "./components/Modal";
import SideBar from "./components/SideBar";
import StatusBar from "./components/StatusBar";

export type AppStore = {
	isModalOpen: boolean;
	isActionOpen: boolean;
	isSideBarOpen: boolean;
	trigger: number;
};

export default function App(props: RouteSectionProps) {
	const [appStore, setAppStore] = createStore<AppStore>({
		isModalOpen: false,
		isActionOpen: false,
		isSideBarOpen: false,
		trigger: 0
	});

	const [trigger, setTrigger] = createSignal(0);
	const isMobile = window.matchMedia("(max-width: 768px)").matches;
	let startX = 0, startY = 0, moved = false;

	const unregisterToggleModal = registerCommand("ui.modal.toggle", () => {
		setAppStore("isModalOpen", (prev) => !prev);
	});
	const unregisterCloseModal = registerCommand("ui.modal.close", () => {
		setAppStore("isModalOpen", false);
	});

	const unregisterToggleSideBar = registerCommand("ui.sidebar.toggle", () => {
		setAppStore("isSideBarOpen", (prev) => !prev);
	});

	createEffect(() => {
		setActiveContexts(
			appStore.isModalOpen ? ["modal", "viewer", "global"] : ["viewer", "global"]
		);
	});

	onMount(() => {
		document.addEventListener("keydown", dispatch);
		document.addEventListener("contextmenu", (e) => e.preventDefault());

		document.addEventListener("touchstart", (e) => {
			if (e.touches.length > 1) return;
			const t = e.touches[0];
			[startX, startY, moved] = [t.clientX, t.clientY, false];
		});

		document.addEventListener("touchmove", (e) => {
			const t = e.touches[0];
			if (Math.abs(t.clientX - startX) > 10 || Math.abs(t.clientY - startY) > 10) {
				moved = true;
			}
		});

		document.addEventListener("touchend", () => {
			if (!moved) {
				setAppStore("isActionOpen", true);
				setTrigger((prev) => prev + 1);
			}
		});
	});

	createEffect(() => {
		trigger();
		if (!appStore.isActionOpen) return;

		const timer = setTimeout(() => setAppStore("isActionOpen", false), 3000);
		onCleanup(() => clearTimeout(timer));
	});

	onCleanup(() => {
		document.removeEventListener("keydown", dispatch);
		unregisterToggleModal();
		unregisterCloseModal();
		unregisterToggleSideBar();
	});

	return (
		<div class={styles.app}>
			<Show when={appStore.isSideBarOpen}>
				<SideBar />
			</Show>
			<main class={styles.main}>{props.children}</main>

			<Show when={!isMobile}>
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
				<Show when={appStore.isActionOpen && !appStore.isModalOpen}>
					<ActionBar setAppStore={setAppStore} />
				</Show>
			</Transition>

			<Portal>
				<Show when={appStore.isModalOpen}>
					<Modal open={appStore.isModalOpen} setAppStore={setAppStore} />
				</Show>
			</Portal>
		</div>
	);
}
