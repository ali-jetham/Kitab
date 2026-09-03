import { onCleanup } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { registerCommand } from "../../core/keybinds";
import { type AppStore } from "../App";

export function createAppCommands(setAppStore: SetStoreFunction<AppStore>) {
	const unregisters = [
		registerCommand("app.modal.toggle", () => {
			setAppStore("isModalOpen", (prev) => !prev);
		}),
		registerCommand("app.modal.close", () => {
			setAppStore("isModalOpen", false);
		}),
		registerCommand("app.sidebar.toggle", () => {
			setAppStore("isSideBarOpen", (prev) => !prev);
		}),
		registerCommand("app.downloadTTS", () => {
			// fetch available models
			// update arguments with available models
		}),
		registerCommand("modal.argument", () => {
			// get selecteCommands
			// execute selectedCommmads with argument
		})
	];

	onCleanup(() => {
		unregisters.forEach((unregister) => unregister());
	});
}
