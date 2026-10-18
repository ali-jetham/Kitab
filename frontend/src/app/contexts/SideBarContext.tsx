import type { TPDFDocumentOutline } from "@pdfslick/core"
import { createContext, type ParentProps, useContext } from "solid-js"
import { createStore, SetStoreFunction } from "solid-js/store"
import { Document } from "../../stores/createDocumentStore"

type Navigate = (dest: string | any[]) => void

export type TocState =
	| { status: "loading"; outline: null }
	| { status: "ready"; outline: TPDFDocumentOutline | null }
	| { status: "error"; outline: null }
	| { status: "empty"; outline: null }

type SideBarStore = {
	documentStore: Document | null
	tocState: TocState
	navigate: Navigate | null
}

type SideBarContextType = {
	sideBarStore: SideBarStore
	setSideBarStore: SetStoreFunction<SideBarStore>
}

const SideBarContext = createContext<SideBarContextType>()

export function SideBarProvider(props: ParentProps) {
	const [sideBarStore, setSideBarStore] = createStore<SideBarStore>({
		documentStore: null,
		navigate: null,
		tocState: { status: "empty", outline: null }
	})

	return (
		<SideBarContext.Provider value={{ sideBarStore, setSideBarStore }}>
			{props.children}
		</SideBarContext.Provider>
	)
}

export function useSideBarContext() {
	const context = useContext(SideBarContext)
	if (!context) throw new Error("SideBarProvider is missing")
	return context
}
