import { Portal, Show } from "solid-js/web";
import Modal from "./components/Modal";
import { createEffect, createSignal, type JSX, onCleanup, onMount } from "solid-js";
import { dispatch, registerCommand, setActiveContexts } from "../core/keybinds";
import type { RouteSectionProps } from "@solidjs/router";

export default function App(props: RouteSectionProps) {
	const [isModalVisible, setModalVisible] = createSignal(false);

	const unregisterToggleModal = registerCommand("ui.modal.toggle", () => {
		setModalVisible((prev) => !prev);
	});
	const unregisterCloseModal = registerCommand("ui.modal.close", () => {
		setModalVisible(false);
	});

	createEffect(() => {
		setActiveContexts(isModalVisible() ? ["modal", "viewer", "global"] : ["viewer", "global"]);
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
		<>
			{props.children}

			<Portal>
				<Show when={isModalVisible()}>
					<Modal />
				</Show>
			</Portal>
		</>
	);
}
