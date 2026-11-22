import {
	createContext,
	createSignal,
	createStore,
	type ParentProps,
	type Setter,
	type SourceAccessor,
	type StoreSetter,
	useContext
} from "solid-js"
import type { DocumentRead } from "../../api/types/types.gen"

export type TocItem = {
	label: string
	target: unknown
	children?: TocItem[]
}

export type TocState =
	| { status: "loading"; outline: null }
	| { status: "ready"; outline: TocItem[] | null }
	| { status: "error"; outline: null }
	| { status: "empty"; outline: null }

type SideBarStore = {
	tocState: TocState
	navigate: ((target: unknown) => void) | null
	thumbnailsSlot: HTMLElement | null
}

type SideBarContextType = {
	sideBarStore: SideBarStore
	setSideBarStore: StoreSetter<SideBarStore>
	documentStore: SourceAccessor<DocumentRead | undefined>
	setDocumentStore: Setter<DocumentRead | undefined>
}

const SideBarContext = createContext<SideBarContextType>()

export function SideBarProvider(props: ParentProps) {
	const [sideBarStore, setSideBarStore] = createStore<SideBarStore>({
		navigate: null,
		tocState: { status: "empty", outline: null },
		thumbnailsSlot: null
	})
	const [documentStore, setDocumentStore] = createSignal<DocumentRead>()

	return (
		<SideBarContext value={{ sideBarStore, setSideBarStore, documentStore, setDocumentStore }}>
			{props.children}
		</SideBarContext>
	)
}

export function useSideBarContext() {
	const context = useContext(SideBarContext)
	if (!context) throw new Error("SideBarProvider is missing")
	return context
}
