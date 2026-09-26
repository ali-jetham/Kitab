import { createWindowSize } from "@solid-primitives/resize-observer"

type ViewerGestures = { onLeftTap: () => void; onCenterTap: () => void; onRightTap: () => void }

export function createViewerGestures(gestures: ViewerGestures) {
	const windowSize = createWindowSize()
	console.log(windowSize.width)

	function handleTap() {
	}
}
