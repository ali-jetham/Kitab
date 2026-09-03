import { Combobox } from "@kobalte/core/combobox";
import { Accessor, createSignal, onMount, Setter } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { executeCommand } from "../../core/keybinds";
import { AppStore } from "../App";
import styles from "./Modal.module.css";
import { COMMANDS } from "../../core/commands";

type ModalProps = { open: boolean; setAppStore: SetStoreFunction<AppStore> };

export default function Modal(props: ModalProps) {
	const [options, setOptions] = createSignal(COMMANDS.filter((c) => !c.hidden));
	const [aruguments, setArguments] = createSignal<string[]>([]);
	const [selectedCommand, setSelectedCommand] = createSignal<string | null>(
		null,
	);

	let inputRef: HTMLInputElement | undefined;

	onMount(() => {
		inputRef?.focus();
	});

	return (
		<Combobox
			options={options()}
			optionValue="id"
			optionTextValue="label"
			optionDisabled="hidden"
			placeholder="Execute a command..."
			class={styles.combobox}
			gutter={0}
			preventScroll={true}
			open={props.open}
			onOpenChange={(open) => props.setAppStore("isModalOpen", open)}
			shouldFocusWrap={true}
			allowsEmptyCollection={true}
			itemComponent={(props) => (
				<Combobox.Item item={props.item} class={styles.combobox__item}>
					<Combobox.ItemLabel>{props.item.rawValue.label}</Combobox.ItemLabel>
					<Combobox.ItemIndicator
						class={styles.combobox__itemIndicator}
					></Combobox.ItemIndicator>
				</Combobox.Item>
			)}
			onChange={(value) => {
				if (!value) return;
				setSelectedCommand(value.id);
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
