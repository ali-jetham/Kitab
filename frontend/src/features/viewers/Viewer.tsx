import { useParams } from "@solidjs/router"
import { Match, Switch } from "@solidjs/web"
import PDFViewer from "./components/PDFViewer"
import styles from "./Viewer.module.css"

type ViewProps = { id: string; fileType: "pdf" | "epub" }

export default function Viewer() {
	const params = useParams()
	const fileType = "pdf"

	return (
		<div class={styles.view}>
			<Switch>
				<Match when={fileType === "pdf"}>
					<PDFViewer id={params.id!} />
				</Match>
			</Switch>
		</div>
	)
}
