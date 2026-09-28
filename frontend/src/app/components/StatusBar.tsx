import { useContext } from "solid-js"
import { useStatusBarContext } from "../contexts/StatusBarContext"
import styles from "./StatusBar.module.css"

export default function StatusBar() {
	const { statusStore } = useStatusBarContext()

	return (
		<div class={styles.status}>
			<div>
				<div>[ {statusStore.currentPage} / {statusStore.totalPages} ]</div>
			</div>
			<div></div>
		</div>
	)
}
