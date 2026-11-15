import { createRouter, defineRoutes } from "@solidjs/router"
import AppLayout from "./app/AppShell"
import Library from "./features/library/Library"
import Viewer from "./features/viewers/Viewer"

const routes = defineRoutes([
	{
		path: "/",
		component: AppLayout,
		children: [
			{ path: "/", component: Library },
			{ path: "/viewer", component: Viewer },
			{
				path: "/viewer/:id",
				component: Viewer
			}
		]
	}
])

export const Router = createRouter({ routes })
export const { paths } = Router
