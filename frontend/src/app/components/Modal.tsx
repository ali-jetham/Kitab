import { Combobox } from "@kobalte/core/combobox";
import { Dialog } from "@kobalte/core/dialog";
import { Accessor, createSignal, Setter } from "solid-js";
import { COMMANDS, executeCommand } from "../../core/keybinds";
import styles from "./Modal.module.css";

type ModalProps = { open: Accessor<boolean>; setOpen: Setter<boolean>; };

export default function Modal(props: ModalProps) {
	const [options, setOptions] = createSignal(COMMANDS.filter((c) => !c.hidden));

	return (
		<Dialog
			open={props.open()}
			onOpenChange={(isOpen) => {
				props.setOpen(isOpen);
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay class={styles.dialog__overlay} />
				<div class={styles.dialog__positioner}>
					<Dialog.Content class={styles.dialog__content}>
						<Combobox
							options={options()}
							optionValue="id"
							optionTextValue="label"
							optionDisabled="hidden"
							placeholder="Execute a command..."
							allowsEmptyCollection={true}
							class={styles.combobox}
							gutter={0}
							preventScroll={true}
							open={props.open()}
							onOpenChange={(isOpen) => {
								if (!isOpen) props.setOpen(false);
							}}
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
								props.setOpen(false);
							}}
						>
							<Combobox.Control class={styles.combobox__control}>
								<Combobox.Input class={styles.combobox__input} />
							</Combobox.Control>
							<Combobox.Portal>
								<Combobox.Content class={styles.combobox__content}>
									<Combobox.Listbox class={styles.combobox__listbox} />
								</Combobox.Content>
							</Combobox.Portal>
						</Combobox>
					</Dialog.Content>
				</div>
			</Dialog.Portal>
		</Dialog>
	);
}
