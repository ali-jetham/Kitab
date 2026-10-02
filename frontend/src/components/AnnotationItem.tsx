import { Button } from "@kobalte/core/button"
import { Collapsible } from "@kobalte/core/collapsible"
import { ColorSwatch } from "@kobalte/core/color-swatch"
import { parseColor } from "@kobalte/core/colors"
import { DropdownMenu } from "@kobalte/core/dropdown-menu"
import { TextField } from "@kobalte/core/text-field"
import {
	DotIcon,
	HighlighterIcon,
	SquarePenIcon,
	TrashIcon,
	UnderlineIcon
} from "lucide-solid"
import { createEffect, createSignal, Match, onMount, Show, Switch } from "solid-js"
import { useSideBarContext } from "../app/contexts/SideBarContext"
import { commands } from "../core/commands"
import { Annotation } from "../stores/createDocumentStore"
import styles from "./AnnotationItem.module.css"

type AnnotationItemProps = { annotation: Annotation }

export default function AnnotationItem(props: AnnotationItemProps) {
	const [isEditing, setIsEditing] = createSignal(false)
	const { sideBarStore } = useSideBarContext()

	function handleClick() {
		sideBarStore.navigate?.([
			props.annotation.page - 1,
			{ name: "XYZ" },
			null,
			null,
			null
		])
	}

	return (
		<Collapsible as="li" class={styles.item} disabled={isEditing()}>
			<Collapsible.Trigger as="div" onClick={handleClick}>
				<div class={styles.item__top}>
					<span>Page {props.annotation.page}</span>
					<Switch>
						<Match when={props.annotation.style === "highlight"}>
							<HighlighterIcon />
						</Match>
						<Match when={props.annotation.style === "underline"}>
							<UnderlineIcon />
						</Match>
					</Switch>
				</div>

				<div class={styles.item__body}>
					<ColorSwatch
						class={styles.colorLine}
						value={parseColor(props.annotation.color)}
					/>
					<Show
						when={isEditing()}
						fallback={<p class={styles.item__description}>{props.annotation.text}</p>}
					>
						<form
							style={{ width: "100%" }}
							onSubmit={(e: SubmitEvent) => {
								e.preventDefault()
								setIsEditing(false)
								const data = new FormData(e.currentTarget as HTMLFormElement)
								commands.executeCommand("pdf.updateAnnotation", {
									arg: { id: props.annotation.id, annotation: { text: data.get("text") } }
								})
							}}
						>
							<TextField
								class={styles.item__textarea}
								defaultValue={props.annotation.text}
								onChange={(value) => console.log(value)}
								onClick={(e) => e.stopPropagation()}
								onKeyDown={(e) => e.stopPropagation()}
								onKeyUp={(e) => e.stopPropagation()}
							>
								<TextField.TextArea name="text" autoResize submitOnEnter />
							</TextField>
						</form>
					</Show>
				</div>
			</Collapsible.Trigger>
			<Collapsible.Content class={styles.item__buttons}>
				<DropdownMenu>
					<DropdownMenu.Trigger class={styles.dropdown__trigger}>
						<SquarePenIcon size={20} style={{ color: "var(--accent-bg-color)" }} />
					</DropdownMenu.Trigger>
					<DropdownMenu.Portal>
						<DropdownMenu.Content class={styles.dropdown__content}>
							<DropdownMenu.Item as="button" class={styles.dropdown__item}>
								<Button onClick={() => setIsEditing(true)}>Edit text</Button>
							</DropdownMenu.Item>
							<DropdownMenu.Item disabled as="button" class={styles.dropdown__item}>
								Edit page number
							</DropdownMenu.Item>

							<DropdownMenu.Separator class={styles.dropdown__separator} />

							<DropdownMenu.Group>
								<DropdownMenu.GroupLabel class={styles.dropdown__group_label}>
									Styles
								</DropdownMenu.GroupLabel>
								<DropdownMenu.RadioGroup
									value={props.annotation.style}
									onChange={(value) =>
										commands.executeCommand("pdf.updateAnnotation", {
											arg: { id: props.annotation.id, annotation: { style: value } }
										})}
								>
									<DropdownMenu.RadioItem class={styles.dropdown__item} value="highlight">
										<DropdownMenu.ItemIndicator
											class={styles["dropdown__item-indicator"]}
										>
											<DotIcon size={30} />
										</DropdownMenu.ItemIndicator>
										Convert to highlight
									</DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem class={styles.dropdown__item} value="underline">
										<DropdownMenu.ItemIndicator
											class={styles["dropdown__item-indicator"]}
										>
											<DotIcon />
										</DropdownMenu.ItemIndicator>
										Convert to underline
									</DropdownMenu.RadioItem>
								</DropdownMenu.RadioGroup>
							</DropdownMenu.Group>
							<DropdownMenu.Arrow />
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu>

				<Button></Button>

				<Button
					onClick={() =>
						commands.executeCommand("pdf.deleteAnnotation", { arg: props.annotation.id })}
				>
					<TrashIcon size={20} style={{ color: "var(--destructive-bg-color)" }} />
				</Button>
			</Collapsible.Content>
		</Collapsible>
	)
}
