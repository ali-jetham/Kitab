import { useLocation, useParams } from "@solidjs/router"
import { Match, Switch } from "@solidjs/web"
import { documentApi } from "../../api/documentApi"
import EPUBViewer from "./components/EPUBViewer"
import PDFViewer from "./components/PDFViewer"
import styles from "./Viewer.module.css"

type ViewerState = { fileType: string }

export default function Viewer() {
	const params = useParams()
	const location = useLocation<ViewerState>()
	const url = documentApi.getFileUrl(params.id!)
	console.log(location.state)

	return (
		<div class={styles.view}>
			<Switch>
				<Match when={location.state?.fileType === ".pdf"}>
					<PDFViewer id={params.id!} />
				</Match>
				<Match when={location.state?.fileType === ".epub"}>
					<EPUBViewer id={params.id!} />
				</Match>
			</Switch>
		</div>
	)
}
