import { useLocation } from "@solidjs/router";
import styles from "./App.module.css";
import Status from "./components/Status";
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
