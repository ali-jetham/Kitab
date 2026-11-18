import { createEffect, createSignal } from "solid-js"
import { useAppContext } from "../../../app/contexts/AppContext"

type ViewerGestures = {
	onLeftTap: () => void
	onCenterTap: () => void
	onRightTap: () => void
}

export function createViewerGestures() {
	const [trigger, setTrigger] = createSignal(false)
	const { appStore, setAppStore } = useAppContext()

	createEffect(
		() => trigger(),
		() => {
			if (!appStore.isActionOpen) return

			const timer = setTimeout(() => {
				setAppStore((draft) => {
					draft.isActionOpen = false
				})
			}, 3000)

			return () => clearTimeout(timer)
		}
	)
}
