import { createRouter, defineRoutes } from "@solidjs/router"
import App from "./app/App"
import Library from "./features/library/Library"
import Viewer from "./features/viewers/Viewer"

const routes = defineRoutes([{
	path: "/",
	component: App,
	children: [{ path: "/", component: Library }, { path: "/viewer", component: Viewer }, {
		path: "/viewer/:id",
		component: Viewer
	}]
}])

export const Router = createRouter({ routes })
