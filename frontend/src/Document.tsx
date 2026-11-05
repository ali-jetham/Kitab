import type { ParentProps } from "solid-js"
import "../themes.css"
import "../style.css"
import "@fontsource/adwaita-sans"
import { HydrationScript } from "@solidjs/web"

export default function Document(props: ParentProps) {
	return (
		<html lang="en" data-theme="dark">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="theme-color" media="(prefers-color-scheme: light)" content="#fafafb" />
				<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#222226" />
				<title>Kitab</title>
				<HydrationScript />
			</head>
			<body>{props.children}</body>
		</html>
	)
}
