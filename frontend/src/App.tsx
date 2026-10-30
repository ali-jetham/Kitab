import { Title } from "@solidjs/meta"
import { Errored } from "solid-js"
import AppShell from "./app/App"
import { Router } from "./router"

export default function App() {
	return (
		<Router>
			{(props) => (
				<>
					<Title>Kitab</Title>
					<Errored
						fallback={(...args) => {
							console.error("Errored args:", args)
							return <pre>check console</pre>
						}}
					>
						{props.children}
					</Errored>
				</>
			)}
		</Router>
	)
}
