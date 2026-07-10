import { Combobox } from "@kobalte/core/combobox";
import { createSignal, onCleanup, onMount } from "solid-js";
import { COMMANDS, executeCommand } from "../../core/keybinds";
import styles from "./Modal.module.css";

export default function Modal() {
	const [currentIndex, setCurrentIndex] = createSignal(0);
	const modalCommands = COMMANDS.filter((c) => !c.hidden);
	let inputRef: HTMLInputElement | undefined = undefined;

	onMount(() => {
		inputRef!.focus();
	});

	onCleanup(() => {
	});

	return (
		<Combobox
			options={modalCommands}
			optionValue="id"
			optionTextValue="label"
			optionDisabled="hidden"
			placeholder="Execute a command..."
			class={styles.combobox}
			gutter={0}
			preventScroll={true}
			open={true}
			onOpenChange={() => {}}
			shouldFocusWrap={true}
			itemComponent={props => (
				<Combobox.Item item={props.item} class={styles.combobox__item}>
					<Combobox.ItemLabel>{props.item.rawValue.label}</Combobox.ItemLabel>
					<Combobox.ItemIndicator class={styles.combobox__itemIndicator}>
					</Combobox.ItemIndicator>
				</Combobox.Item>
			)}
			onChange={(value) => {
				if (!value) return;
				executeCommand(value.id);
			}}
		>
			<Combobox.Control class={styles.combobox__control}>
				<Combobox.Input ref={inputRef} class={styles.combobox__input} />
			</Combobox.Control>
			<Combobox.Portal>
				<Combobox.Content class={styles.combobox__content}>
					<Combobox.Listbox class={styles.combobox__listbox} />
				</Combobox.Content>
			</Combobox.Portal>
		</Combobox>
	);
}
