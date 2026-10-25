import { Collapsible } from "@kobalte/core/collapsible"
import { ChevronDownIcon } from "lucide-solid"
import { JSX, Show } from "solid-js"
import styles from "./TreeItem.module.css"

export interface TreeItemProps {
	label: string
	onClick: (e: MouseEvent) => void
	hasChildren: boolean
	children?: JSX.Element
}

export function TreeItem(props: TreeItemProps) {
	return (
		<Show
			when={props.hasChildren}
			fallback={
				<button type="button" class={styles.treeitem} onClick={props.onClick}>
					{props.label}
				</button>
			}
		>
			<Collapsible>
				<div class={`${styles.treeitem__container} ${styles.treeitem}`}>
					<button type="button" onClick={props.onClick}>{props.label}</button>
					<Collapsible.Trigger class={styles.treeitem__trigger}>
						<ChevronDownIcon size={16} strokeWidth={3} class={styles.treeitem__chevron} />
					</Collapsible.Trigger>
				</div>
				<Collapsible.Content class={styles.treeitem__content}>
					<div class={styles.treeitem__children}>{props.children}</div>
				</Collapsible.Content>
			</Collapsible>
		</Show>
	)
}
