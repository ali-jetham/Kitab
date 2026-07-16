import { useLocation } from "@solidjs/router";
import { Match, Switch } from "solid-js/web";
import PDFViewer from "../../features/viewers/components/PDFViewer";
import styles from "./View.module.css";

type ViewProps = { id: string; fileType: "pdf" | "epub"; };

export default function View() {
	const location = useLocation();
	const id = location.state?.id;
	const fileType = "pdf";

	return (
		<div class={styles.view}>
			<Switch>
				<Match when={fileType === "pdf"}>
					<PDFViewer id={id} />
				</Match>
			</Switch>
		</div>
	);
}
