import { Combobox } from "@kobalte/core/combobox"
import { createSignal, onSettled, Show } from "solid-js"
import { StoreSetter } from "solid-js"
import { type Command, commands } from "../../core/commands"
import { AppStore } from "../App"
import styles from "./CommandPallete.module.css"

type CommandPalleteProps = { appStore: AppStore; setAppStore: StoreSetter<AppStore> }

export default function CommandPallete(props: CommandPalleteProps) {
	const options = commands.COMMANDS.filter((c) => !c.hidden)
	console.log(options)
	const grouped = Object.groupBy(options, option => option.group ?? "Other")
	console.log(grouped)
	const result = Object.entries(grouped).map(([label, options]) => ({ label, options }))
	console.log(result)
	const [value, setValue] = createSignal<Command | null>()
	let inputRef: HTMLInputElement | undefined

	onSettled(() => {
		inputRef?.focus()
	})

	return (
		<Combobox
			value={value()}
			options={props.appStore.commandPalleteArgs ?? result}
			optionGroupChildren="options"
			optionValue="id"
			optionTextValue="label"
			optionLabel="label"
			optionDisabled="hidden"
			placeholder="Search for commands"
			closeOnSelection={false}
			class={styles.combobox}
			gutter={0}
			preventScroll={true}
			open={props.appStore.isCommandPalleteOpen}
			onOpenChange={(open) => {
				props.setAppStore(draft => {
					draft.isCommandPalleteOpen = open
					draft.commandPalleteSelectedCommand = null
					draft.commandPalleteArgs = null
				})
			}}
			shouldFocusWrap={true}
			allowsEmptyCollection={true}
			itemComponent={(props) => (
				<Combobox.Item item={props.item} class={styles.combobox__item}>
					<Combobox.ItemLabel>{props.item.rawValue.label}</Combobox.ItemLabel>
				</Combobox.Item>
			)}
			sectionComponent={props => (
				<Combobox.Section class={styles.combobox__group}>
					{props.section.rawValue.label}
				</Combobox.Section>
			)}
			onChange={(value) => {
				if (!value) return
				setValue(value)

				if (props.appStore.commandPalleteSelectedCommand) {
					commands.executeCommand(props.appStore.commandPalleteSelectedCommand, {
						arg: value.id
					})
					props.setAppStore(draft => {
						draft.commandPalleteSelectedCommand = null
						draft.commandPalleteArgs = null
						draft.isCommandPalleteOpen = false
					})
					return
				}
				if (value.withArgs) {
					props.setAppStore(draft => {
						draft.commandPalleteSelectedCommand = value.id
					})
					commands.executeCommand(value.id)
					setValue(null)
					return
				}
				commands.executeCommand(value.id)
				console.log(value.id)
				props.setAppStore(draft => {
					draft.isCommandPalleteOpen = false
				})
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
	)
}
