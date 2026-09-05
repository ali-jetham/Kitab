import { Combobox } from "@kobalte/core/combobox";
import { createSignal, onMount } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { COMMANDS } from "../../core/commands";
import { Command, executeCommand } from "../../core/keybinds";
import { AppStore } from "../App";
import styles from "./Modal.module.css";

type ModalProps = { appStore: AppStore; setAppStore: SetStoreFunction<AppStore>; };

export default function CommandPallete(props: ModalProps) {
	const [options, setOptions] = createSignal(COMMANDS.filter((c) => !c.hidden));
	const [value, setValue] = createSignal<Command | null>();
	let inputRef: HTMLInputElement | undefined;

	onMount(() => {
		inputRef?.focus();
	});

	return (
		<Combobox
			value={value()}
			options={props.appStore.modalArgs ?? options()}
			optionValue="id"
			optionTextValue="label"
			optionLabel="label"
			optionDisabled="hidden"
			placeholder="Execute a command..."
			closeOnSelection={false}
			class={styles.combobox}
			gutter={0}
			preventScroll={true}
			open={props.appStore.isModalOpen}
			onOpenChange={(open) => {
				props.setAppStore("isModalOpen", open);
				props.setAppStore("modalSelectedCommand", null);
				props.setAppStore("modalArgs", null);
			}}
			shouldFocusWrap={true}
			allowsEmptyCollection={true}
			itemComponent={(props) => (
				<Combobox.Item item={props.item} class={styles.combobox__item}>
					<Combobox.ItemLabel>{props.item.rawValue.label}</Combobox.ItemLabel>
					<Combobox.ItemIndicator class={styles.combobox__itemIndicator}>
					</Combobox.ItemIndicator>
				</Combobox.Item>
			)}
			onChange={(value) => {
				if (!value) return;
				setValue(value);

				if (props.appStore.modalSelectedCommand) {
					executeCommand(props.appStore.modalSelectedCommand, { arg: value.id });
					props.setAppStore("modalSelectedCommand", null);
					props.setAppStore("modalArgs", null);
					props.setAppStore("isModalOpen", false);
					return;
				}
				if (value.withArgs) {
					props.setAppStore("modalSelectedCommand", value.id);
					executeCommand(value.id);
					setValue(null);
					return;
				}
				executeCommand(value.id);
				props.setAppStore("isModalOpen", false);
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
