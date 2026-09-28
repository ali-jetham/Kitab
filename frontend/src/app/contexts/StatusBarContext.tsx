import { createContext, ParentProps, useContext } from "solid-js"
import { createStore, SetStoreFunction } from "solid-js/store"

type StatusBarStore = { currentPage: number | null; totalPages: number | null }
type StatusBarContextType = {
	statusStore: StatusBarStore
	setStatusStore: SetStoreFunction<StatusBarStore>
}

const StatusBarContext = createContext<StatusBarContextType>()

export function StatusBarProvider(props: ParentProps) {
	const [statusStore, setStatusStore] = createStore<StatusBarStore>({
		currentPage: null,
		totalPages: null
	})

	return (
		<StatusBarContext.Provider value={{ statusStore, setStatusStore }}>
			{props.children}
		</StatusBarContext.Provider>
	)
}

export function useStatusBarContext() {
	const context = useContext(StatusBarContext)
	if (!context) throw new Error("SideBarProvider is missing")
	return context
}
