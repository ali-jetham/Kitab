import type { TPDFDocumentOutline } from "@pdfslick/core"
import {
	type Accessor,
	createContext,
	createSignal,
	type ParentProps,
	type Setter,
	useContext
} from "solid-js"
import { createStore, SetStoreFunction, Store, StoreSetter } from "solid-js/store"
import { Annotation, Bookmark } from "../../stores/createDocumentStore"

type Navigate = (dest: string | any[]) => void

export type TocState =
	| { status: "loading"; outline: null }
	| { status: "ready"; outline: TPDFDocumentOutline | null }
	| { status: "error"; outline: null }
	| { status: "empty"; outline: null }

type SideBarStore = {
	annotations: Annotation[] | null
	bookmarks: Bookmark[] | null
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
		annotations: null,
		navigate: null,
		bookmarks: null,
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
