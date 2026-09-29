import { Collapsible } from "@kobalte/core/collapsible"
import { ChevronDownIcon } from "lucide-solid"
import { children as resolveChildren, type JSX, Show, splitProps } from "solid-js"
import { useSideBarContext } from "../app/contexts/SideBarContext"
import styles from "./NavLink.module.css"

export interface NavLinkProps {
	label: string
	dest: string | any[]
	active?: boolean
	disabled?: boolean
	opened?: boolean
	defaultOpened?: boolean
	onOpenedChange?: (opened: boolean) => void
	children?: JSX.Element
}

export function NavLink(props: NavLinkProps) {
	const { sideBarStore } = useSideBarContext()

	function handleClick(e: MouseEvent) {
		e.preventDefault()
		if (props.dest) {
			sideBarStore.navigate?.(props.dest)
		}
	}

	const resolved = resolveChildren(() => props.children)
	const hasChildren = () => {
		const value = resolved()
		return Array.isArray(value) ? value.length > 0 : value != null && value !== false
	}
	const rowContent = (
		<button type="button" onClick={handleClick} class={styles.navLinkLabel}>
			{props.label}
		</button>
	)

	return (
		<Show
			when={hasChildren()}
			fallback={
				<button
					type="button"
					onClick={handleClick}
					class={styles.navlink}
					data-active={props.active ? "" : undefined}
					data-disabled={props.disabled ? "" : undefined}
					aria-disabled={props.disabled}
				>
					{rowContent}
				</button>
			}
		>
			<Collapsible
				class={styles.navlink}
				open={props.opened}
				defaultOpen={props.defaultOpened}
				onOpenChange={props.onOpenedChange}
				disabled={props.disabled}
			>
				<Collapsible.Trigger
					as="a"
					class={styles.navlink__trigger}
					data-active={props.active ? "" : undefined}
				>
					{rowContent}
					<span class={styles.navlink__chevron} aria-hidden="true">
						<ChevronDownIcon style={{ color: "var(--accent-bg-color)" }} />
					</span>
				</Collapsible.Trigger>

				<Collapsible.Content class={styles.navLinkContent}>
					<div class={styles.navLinkChildren}>{props.children}</div>
				</Collapsible.Content>
			</Collapsible>
		</Show>
	)
}
