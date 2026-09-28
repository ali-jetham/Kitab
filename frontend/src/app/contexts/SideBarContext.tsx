import type { TPDFDocumentOutline } from "@pdfslick/core"
import {
	type Accessor,
	createContext,
	createSignal,
	type ParentProps,
	type Setter,
	useContext
} from "solid-js"

type Navigate = (dest: string | any[]) => void

export type TocState =
	| { status: "loading"; outline: null }
	| { status: "ready"; outline: TPDFDocumentOutline | null }
	| { status: "error"; outline: null }
	| { status: "empty"; outline: null }

type SideBarContextType = {
	tocState: Accessor<TocState>
	setTocState: Setter<TocState>
	navigate: Accessor<Navigate | null>
	setNavigate: Setter<Navigate | null>
	annotations: Accessor<any>
	setAnnotations: Setter<any>
}

const SideBarContext = createContext<SideBarContextType>()

export function SideBarProvider(props: ParentProps) {
	const [tocState, setTocState] = createSignal<TocState>({
		status: "empty",
		outline: null
	})
	const [annotations, setAnnotations] = createSignal(null)
	const [navigate, setNavigate] = createSignal<Navigate | null>(null)

	return (
		<SideBarContext.Provider
			value={{
				annotations,
				setAnnotations,
				tocState,
				setTocState,
				navigate,
				setNavigate
			}}
		>
			{props.children}
		</SideBarContext.Provider>
	)
}

export function useSideBarContext() {
	const context = useContext(SideBarContext)
	if (!context) throw new Error("SideBarProvider is missing")
	return context
}
