/* @refresh reload */
import { render } from "solid-js/web";
import "solid-devtools";

import AppShell from "./app/AppShell";
import { Route, Router } from "@solidjs/router";
import "@pdfslick/solid/dist/pdf_viewer.css";
import "pdfjs-dist/web/pdf_viewer.css";
import Library from "./features/library/Library";
import App from "./app/App";
import "./core/commands";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		"Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
	);
}

render(
	() => (
		<Router root={App}>
			<Route path="/" component={Library} />
			<Route path="/viewer" component={AppShell} />
		</Router>
	),
	root!,
);
