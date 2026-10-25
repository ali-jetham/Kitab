/* @refresh reload */
import { render } from "solid-js/web"
import "./core/commands"
import { Route, Router } from "@solidjs/router"
import App from "./app/App"
import Library from "./features/library/Library"
import Viewer from "./features/viewers/Viewer"
import "@pdfslick/solid/dist/pdf_viewer.css"

const root = document.getElementById("root")

render(() => (
	<Router root={App}>
		<Route path="/" component={Library} />
		<Route path="/viewer" component={Viewer} />
	</Router>
), root!)
