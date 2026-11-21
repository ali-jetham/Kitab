import { useLocation, useParams } from "@solidjs/router"
import { Match, Switch, untrack } from "@solidjs/web"
import EPUBViewer from "./components/EPUBViewer"
import PDFViewer from "./components/PDFViewer"
import styles from "./Viewer.module.css"

type ViewerState = { fileType: string }

export default function Viewer() {
	const params = useParams()
	const id = untrack(() => params.id)
	const location = useLocation<ViewerState>()

	if (!id) return <div>Not Found</div>

	return (
		<div class={styles.view}>
			<Switch>
				<Match when={location.state?.fileType === ".pdf"}>
					<PDFViewer id={id} />
				</Match>
				<Match when={location.state?.fileType === ".epub"}>
					<EPUBViewer id={id} />
				</Match>
			</Switch>
		</div>
	)
}
