import { LoaderCircleIcon } from "@lucide/solid"
import styles from "./Spinner.module.css"

export default function Spinner() {
	return (
		<div class={styles.container}>
			<LoaderCircleIcon role="status" aria-label="Loading" class={styles.spinner} />
		</div>
	)
}
