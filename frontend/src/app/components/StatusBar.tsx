import { Button } from "@kobalte/core/button"
import { Tooltip } from "@kobalte/core/tooltip"
import { PanelLeftCloseIcon, PanelLeftIcon } from "lucide-solid"
import { Show } from "solid-js"
import { SetStoreFunction } from "solid-js/store"
import { AppStore } from "../App"
import { useStatusBarContext } from "../contexts/StatusBarContext"
import styles from "./StatusBar.module.css"

type StatusBarProps = { appStore: AppStore; setAppStore: SetStoreFunction<AppStore> }

export default function StatusBar(props: StatusBarProps) {
	const { statusStore } = useStatusBarContext()

	return (
		<div class={styles.status}>
			<div class={styles.section}>
				<Tooltip openDelay={1000}>
					<Tooltip.Trigger
						onClick={() => props.setAppStore("isSideBarOpen", (prev) => !prev)}
					>
						<Show
							when={props.appStore.isSideBarOpen}
							fallback={<PanelLeftIcon size={24} strokeWidth={1.5} />}
						>
							<PanelLeftCloseIcon size={24} strokeWidth={1.5} />
						</Show>
					</Tooltip.Trigger>
					<Tooltip.Portal>
						<Tooltip.Content class="tooltip__content">Toggle Sidebar</Tooltip.Content>
					</Tooltip.Portal>
				</Tooltip>
			</div>
			<div class={styles.section}>
				<Tooltip>
					<Tooltip.Trigger as="div">
						[ {statusStore.currentPage} / {statusStore.totalPages} ]
					</Tooltip.Trigger>
					<Tooltip.Portal>
						<Tooltip.Content class="tooltip__content">Page number</Tooltip.Content>
					</Tooltip.Portal>
				</Tooltip>
			</div>
		</div>
	)
}
