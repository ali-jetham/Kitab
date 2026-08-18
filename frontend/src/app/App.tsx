import type { RouteSectionProps } from "@solidjs/router";
import { Command } from "lucide-solid";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { Portal, Show } from "solid-js/web";
import { dispatch, registerCommand, setActiveContexts } from "../core/keybinds";
import styles from "./App.module.css";
import Modal from "./components/Modal";
import ModalButton from "./components/ModalButton";
import Status from "./components/Status";

export default function App(props: RouteSectionProps) {
	const [isModalOpen, setIsModalOpen] = createSignal<boolean>(false);

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
			<Modal open={isModalOpen} setOpen={setIsModalOpen} />

			<Portal>
				<ModalButton setIsModalOpen={setIsModalOpen} />
			</Portal>
		</div>
	);
}
