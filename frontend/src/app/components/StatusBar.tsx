import { useStatusBarContext } from "../contexts/StatusBarContext"
import styles from "./StatusBar.module.css"

export default function StatusBar() {
	const { statusStore } = useStatusBarContext()

	return (
		<div class={styles.status}>
			<div class={styles.section}>
				<div>[ {statusStore.currentPage} / {statusStore.totalPages} ]</div>
			</div>
			<div class={styles.section}>TTS status</div>
		</div>
	)
}
