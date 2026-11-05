import { PDFSlickState } from "@pdfslick/core"
import { makeEventListener } from "@solid-primitives/event-listener"
import { createEffect, createMemo, createSignal, isPending, mapArray, onCleanup, type StoreSetter } from "solid-js"
import { documentApi } from "../../../api/documentApi"
import { ttsApi } from "../../../api/ttsApi"
import { commands } from "../../../core/commands"
import { PDFRect } from "../../../stores/createDocumentStore"
import { ViewerStore } from "../components/PDFViewer"

const PREFETCH = 6

export type Sentence = { text: string; rects: PDFRect[] }

export function createTTS(setViewerStore: StoreSetter<ViewerStore>, pdfSlickStore: PDFSlickState, id: string) {
	const [isPlaying, setIsPlaying] = createSignal(false)
	const [currentPage, setCurrentPage] = createSignal<number>()
	const [currentSentence, setCurrentSentence] = createSignal(0)

	const sentences = createMemo(async () => currentPage() ? await documentApi.getPageText(id, currentPage()!) : [])

	function start() {
		setCurrentSentence(0)
		setCurrentPage(pdfSlickStore.pageNumber)
		setIsPlaying(true)
	}

	function stop() {
		setIsPlaying(false)
		setCurrentSentence(0)
		audio.pause()
		audio.removeAttribute("src")
	}

	const audio = new Audio()
	onCleanup(() => audio.remove())

	const window = () => (isPlaying() ? sentences().slice(currentSentence(), currentSentence() + PREFETCH) : [])

	const audioUrls = mapArray(window, (sentence) =>
		createMemo(async () => {
			const controller = new AbortController()
			let url: string | undefined
			onCleanup(() => {
				controller.abort()
				if (url) URL.revokeObjectURL(url)
			})
			url = URL.createObjectURL(await ttsApi.synthesize(sentence.text, controller.signal))
			return url
		}))

	const current = () => {
		const sentence = window()[0]
		const url = audioUrls()[0]
		return sentence && url ? { sentence, url: url() } : undefined
	}

	const loading = () => isPlaying() && isPending(current)

	makeEventListener(audio, "ended", () => {
		if (currentSentence() + 1 >= sentences().length) stop()
		else setCurrentSentence((i) => i + 1)
	})

	createEffect(() => current(), (current) => {
		if (!current) return
		audio.src = current.url
		audio.play().catch(() => {})
		setViewerStore((draft) => {
			draft.ttsHighlight = { page: currentPage(), rects: current.sentence.rects }
		})
		return () =>
			setViewerStore((draft) => {
				draft.ttsHighlight = null
			})
	})

	const unregister = commands.registerCommand("pdf.readAloud", () => (isPlaying() ? stop() : start()))
	onCleanup(unregister)

	return { isPlaying, loading }
}
