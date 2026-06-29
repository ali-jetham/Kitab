import Status from "./components/Status";
import styles from "./App.module.css";
import { useLocation } from "@solidjs/router";
import View from "./components/View";

export default function AppShell() {
	const location = useLocation();
	const id = location.state?.id;
	console.log("appshell loaded");

	return (
		<div class={styles.app}>
			<View id={id} />
			<Status />
		</div>
	);
}
