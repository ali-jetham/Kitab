import { createSignal, createEffect, For, on, onCleanup, onMount } from "solid-js";
import styles from "./Modal.module.css";
import { COMMANDS, executeCommand, registerCommand, type CommandId } from "../../core/keybinds";

export default function Modal() {
	const [search, setSearch] = createSignal("");
	const [currentIndex, setCurrentIndex] = createSignal(0);

	let modalInputRef: HTMLInputElement | undefined;
	let modalOptionsListRef: HTMLUListElement | undefined;

	onMount(() => {
		modalInputRef?.focus();
	});

	const modalCommands = COMMANDS.filter((c) => !c.hidden);

	const runCommand = (command: { id: CommandId }) => {
		console.log("running command", command);

		executeCommand(command.id);
		executeCommand("ui.modal.close");
	};

	const unregisterModalNext = registerCommand("modal.next", () => {
		setCurrentIndex((prev) => (prev + 1 >= modalCommands.length ? 0 : prev + 1));
	});
	const unregisterModalPrev = registerCommand("modal.prev", () => {
		setCurrentIndex((prev) => (prev - 1 < 0 ? modalCommands.length - 1 : prev - 1));
	});
	const unregisterModalSelect = registerCommand("modal.select", () => {
		const command = modalCommands[currentIndex()];
		if (command) {
			runCommand(command);
		}
	});

	onCleanup(() => {
		unregisterModalNext();
		unregisterModalPrev();
		unregisterModalSelect();
	});

	createEffect(
		on(currentIndex, (index) => {
			const activeItem = modalOptionsListRef?.children.item(index);
			if (activeItem instanceof HTMLElement) {
				activeItem.scrollIntoView({
					block: "nearest",
					behavior: "smooth",
				});
			}
		}),
	);

	return (
		<div class={styles.modalContainer}>
			<div class={styles.modal}>
				<input
					ref={modalInputRef}
					value={search()}
					onInput={(e) => setSearch(e.currentTarget.value)}
					autofocus
					type="text"
					placeholder="Search for commands"
				/>
				<div>
					<ul ref={modalOptionsListRef}>
						<For each={modalCommands}>
							{(command, index) => (
								<li class={index() === currentIndex() ? styles.modalItemActive : ""}>
									<button type="button" onClick={() => runCommand(command)}>
										{command.label}
									</button>
								</li>
							)}
						</For>
					</ul>
				</div>
			</div>
		</div>
	);
}
