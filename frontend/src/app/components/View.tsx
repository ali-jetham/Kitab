import { Match, Switch } from "solid-js/web";
import PDFViewer from "../../features/viewers/components/PDFViewer";
import styles from "./View.module.css";

type ViewProps = {
	id: string;
	// fileType: "pdf" | "epub";
};
export default function View(props: ViewProps) {
	const fileType = "pdf";

	return (
		<div class={styles.view}>
			<Switch>
				<Match when={fileType === "pdf"}>
					<PDFViewer id={props.id} />
				</Match>
			</Switch>
		</div>
	);
}
