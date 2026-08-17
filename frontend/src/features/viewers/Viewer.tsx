import { useLocation } from "@solidjs/router";
import { Match, Switch } from "solid-js/web";
import PDFViewer from "./components/PDFViewer";
import styles from "./Viewer.module.css";

type ViewProps = { id: string; fileType: "pdf" | "epub"; };

export default function Viewer() {
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
