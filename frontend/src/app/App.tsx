import type { RouteSectionProps } from "@solidjs/router";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { Portal, Show } from "solid-js/web";
import { dispatch, registerCommand, setActiveContexts } from "../core/keybinds";
import styles from "./App.module.css";
import ActionBar from "./components/ActionBar";
import Modal from "./components/Modal";
import StatusBar from "./components/StatusBar";

export default function App(props: RouteSectionProps) {
	const [isModalOpen, setIsModalOpen] = createSignal<boolean>(false);
	const isMobile = window.matchMedia("(max-width: 768px)").matches;

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
		document.addEventListener("contextmenu", (e) => {
			e.preventDefault();
		});
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
			<Show when={isMobile && !isModalOpen()}>
				<ActionBar setModal={setIsModalOpen} />
			</Show>

			<Portal>
				<Show when={isModalOpen()}>
					<Modal open={isModalOpen} setOpen={setIsModalOpen} />
				</Show>
			</Portal>
		</div>
	);
}
