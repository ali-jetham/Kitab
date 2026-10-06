import { Collapsible } from "@kobalte/core/collapsible"
import { TPDFDocumentOutline } from "@pdfslick/core"
import { ChevronDownIcon } from "lucide-solid"
import { For, JSX, Show } from "solid-js"
import { SetStoreFunction } from "solid-js/store"
import { AppStore } from "../app/App"
import { useSideBarContext } from "../app/contexts/SideBarContext"
import styles from "./TocItem.module.css"

type TPDFDocumentOutlineNode = TPDFDocumentOutline[number]

export interface TocItemProps {
	outline: TPDFDocumentOutlineNode
	appStore?: AppStore
	setAppStore?: SetStoreFunction<AppStore>
	active?: boolean
}

export function TocItem(props: TocItemProps) {
	const { sideBarStore } = useSideBarContext()

	function handleClick(e: MouseEvent) {
		e.preventDefault()
		if (props.outline.dest) {
			sideBarStore.navigate?.(props.outline.dest)
		}
		if (props.appStore?.isMobile()) {
			props.setAppStore?.("isSideBarOpen", false)
		}
	}
	return (
		<Show
			when={props.outline.items.length > 0}
			fallback={
				<OutLineNodeEl
					handleClick={handleClick}
					outline={props.outline}
					class={styles.tocitem}
				/>
			}
		>
			<Collapsible>
				<div class={`${styles.tocitem__container} ${styles.tocitem}`}>
					<OutLineNodeEl handleClick={handleClick} outline={props.outline} />
					<Collapsible.Trigger class={styles.tocitem__trigger}>
						<ChevronDownIcon size={16} strokeWidth={3} class={styles.tocitem__chevron} />
					</Collapsible.Trigger>
				</div>

				<Collapsible.Content class={styles.tocitem__content}>
					<div class={styles.tocitem__children}>
						{/*TODO: add a limit to deeply nested outlines*/}
						<For each={props.outline.items}>
							{(item) => (
								<TocItem
									appStore={props.appStore}
									setAppStore={props.setAppStore}
									outline={item}
								/>
							)}
						</For>
					</div>
				</Collapsible.Content>
			</Collapsible>
		</Show>
	)
}

type OutLineNodeElProps = {
	handleClick: (e: MouseEvent) => void
	outline: TPDFDocumentOutlineNode
	class?: string | undefined
	isNested?: boolean
}

function OutLineNodeEl(props: OutLineNodeElProps) {
	return (
		<button
			type="button"
			onClick={props.handleClick}
			class={props.class}
			classList={{ [styles.tocitem__nested]: props.isNested }}
		>
			{props.outline.title}
		</button>
	)
}
