import { createMediaQuery } from "@solid-primitives/media"
import {
	createContext,
	createStore,
	type ParentProps,
	type StoreSetter,
	useContext
} from "solid-js"
import type { CommandId, Context } from "../../core/commands"

export type AppStore = {
	isMobile: () => boolean
	isCommandPalleteOpen: boolean
	isActionOpen: boolean
	isSideBarOpen: boolean
	isStatusOpen: boolean
	commandPalleteArgs:
		| {
				label: string
				options: { id: string; label: string; hidden: boolean }[]
		  }[]
		| null
	commandPalleteSelectedCommand: CommandId | null
	context: Context
}

export type AppContextType = {
	appStore: AppStore
	setAppStore: StoreSetter<AppStore>
}

export const AppContext = createContext<AppContextType>()

export function AppProvider(props: ParentProps) {
	const isMobile = createMediaQuery("(max-width: 768px)")

	const [appStore, setAppStore] = createStore<AppStore>({
		isMobile,
		isCommandPalleteOpen: false,
		isActionOpen: true,
		isSideBarOpen: !isMobile(),
		isStatusOpen: true,
		commandPalleteArgs: null,
		commandPalleteSelectedCommand: null,
		context: "app"
	})

	return <AppContext value={{ appStore, setAppStore }}>{props.children}</AppContext>
}

export function useAppContext() {
	const context = useContext(AppContext)
	if (!context) throw new Error("AppContext.Provider is missing")
	return context
}
