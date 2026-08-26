import type { RouteSectionProps } from "@solidjs/router";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { Portal, Show } from "solid-js/web";
import { Transition } from "solid-transition-group";
import { dispatch, registerCommand, setActiveContexts } from "../core/keybinds";
import styles from "./App.module.css";
import ActionBar from "./components/ActionBar";
import actionBarStyles from "./components/ActionBar.module.css";
import Modal from "./components/Modal";
import StatusBar from "./components/StatusBar";

export default function App(props: RouteSectionProps) {
	const [isModalOpen, setIsModalOpen] = createSignal<boolean>(false);
	const [isActionOpen, setIsActionOpen] = createSignal<boolean>(false);
	const [trigger, setTrigger] = createSignal(0);
	const isMobile = window.matchMedia("(max-width: 768px)").matches;
	let startX = 0, startY = 0, moved = false;

	const unregisterToggleModal = registerCommand("ui.modal.toggle", () => {
		setIsModalOpen((prev) => !prev);
		console.log("toggling modal", isModalOpen());
	});
	const unregisterCloseModal = registerCommand("ui.modal.close", () => {
		setIsModalOpen(false);
	});

	createEffect(() => {
		setActiveContexts(
			isModalOpen() ? ["modal", "viewer", "global"] : ["viewer", "global"]
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
				setIsActionOpen(true);
				setTrigger((prev) => prev + 1);
			}
		});
	});

	createEffect(() => {
		trigger();
		if (!isActionOpen()) return;

		const timer = setTimeout(() => setIsActionOpen(false), 3000);
		onCleanup(() => clearTimeout(timer));
	});

	onCleanup(() => {
		document.removeEventListener("keydown", dispatch);
		unregisterToggleModal();
		unregisterCloseModal();
	});
	return (
		<div class={styles.app}>
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
				<Show when={isActionOpen() && !isModalOpen()}>
					<ActionBar setModal={setIsModalOpen} />
				</Show>
			</Transition>

			<Portal>
				<Show when={isModalOpen()}>
					<Modal open={isModalOpen} setOpen={setIsModalOpen} />
				</Show>
			</Portal>
		</div>
	);
}
