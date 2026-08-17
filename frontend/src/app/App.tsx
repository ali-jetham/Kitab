import type { RouteSectionProps } from "@solidjs/router";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { Portal, Show } from "solid-js/web";
import { dispatch, registerCommand, setActiveContexts } from "../core/keybinds";
import styles from "./App.module.css";
import Modal from "./components/Modal";
import Status from "./components/Status";

export default function App(props: RouteSectionProps) {
	const [isModalVisible, setModalVisible] = createSignal(false);

	const unregisterToggleModal = registerCommand("ui.modal.toggle", () => {
		setModalVisible((prev) => !prev);
	});
	const unregisterCloseModal = registerCommand("ui.modal.close", () => {
		setModalVisible(false);
	});

	createEffect(() => {
		setActiveContexts(
			isModalVisible() ? ["modal", "viewer", "global"] : ["viewer", "global"]
		);
	});

	onMount(() => {
		document.addEventListener("keydown", dispatch);
	});

	onCleanup(() => {
		document.removeEventListener("keydown", dispatch);
		unregisterToggleModal();
		unregisterCloseModal();
	});
	return (
		<div class={styles.app}>
			<main class={styles.main}>{props.children}</main>
			<Status />
			<Portal>
				<Show when={isModalVisible()}>
					<Modal />
				</Show>
			</Portal>
		</div>
	);
}
