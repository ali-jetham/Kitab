import { Button } from "@kobalte/core/button"
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
				<Button onClick={() => props.setAppStore("isSideBarOpen", (prev) => !prev)}>
					<Show
						when={props.appStore.isSideBarOpen}
						fallback={<PanelLeftIcon size={24} strokeWidth={1.5} />}
					>
						<PanelLeftCloseIcon size={24} strokeWidth={1.5} />
					</Show>
				</Button>
			</div>
			<div class={styles.section}>
				<div>[ {statusStore.currentPage} / {statusStore.totalPages} ]</div>
			</div>
		</div>
	)
}
