import { PDFSlickState } from "@pdfslick/core"
import { createEffect, createResource, createSignal, onCleanup } from "solid-js"
import { SetStoreFunction } from "solid-js/store"
import { documentApi } from "../../../api/documentApi"
import { TTSApi } from "../../../api/ttsApi"
import { registerCommand } from "../../../core/keybinds"
import { PDFRect } from "../../../stores/createDocumentStore"
import { ViewerStore } from "../components/PDFViewer"

export type Sentence = { text: string; rects: PDFRect[] }
interface ReadySentence extends Sentence {
	audio: string
	index: number
}

const QUEUE_SIZE = 3

export function createTTS(setViewerStore: SetStoreFunction<ViewerStore>, pdfSlickStore: PDFSlickState, id: string) {
	let nextIndex = 0
	let nextPlay = 0
	let abortControllers: AbortController[] = []
	let currentAudio: HTMLAudioElement | null = null

	const [isPlaying, setIsPlaying] = createSignal(false)
	const [currentPage, setCurrentPage] = createSignal<number | undefined>(undefined)
	const [sentences, { mutate: mutateSentences, refetch: refetchSentences }] = createResource(
		currentPage,
		async (page) => documentApi.getPageText(id, page)
	)
	const [queue, setQueue] = createSignal<ReadySentence[]>([])
	const [inFlight, setInFlight] = createSignal(0)

	createEffect(() => {
		if (!isPlaying() || sentences.loading || !currentPage()) return

		const list = sentences()
		if (!list) return

		const queueRemaining = QUEUE_SIZE - queue().length - inFlight()

		for (let i = 0; i < queueRemaining && nextIndex < list.length; i++) {
			const index = nextIndex++
			const controller = new AbortController()
			abortControllers.push(controller)
			setInFlight((count) => count + 1)

			TTSApi.synthesize(list[index].text, controller.signal).then((audio) => {
				if (controller.signal.aborted) return
				const readySentence: ReadySentence = { ...list[index], audio: URL.createObjectURL(audio), index }
				setQueue((q) => [...q, readySentence].sort((a, b) => a.index - b.index))
				play()
			}).catch(error => {
				if (error.name !== "AbortError") console.error(error)
			}).finally(() => {
				abortControllers = abortControllers.filter((item) => item !== controller)
				if (!controller.signal.aborted) setInFlight((count) => count - 1)
			})
		}
	})

	function play() {
		if (currentAudio) return

		const [current, ...rest] = queue()
		if (!current || current.index !== nextPlay) {
			return
		}

		setQueue(rest)
		nextPlay++
		const audio = new Audio(current.audio)
		currentAudio = audio
		audio.addEventListener("ended", () => {
			currentAudio = null
			URL.revokeObjectURL(current.audio)
			setViewerStore("ttsHighlight", null)
			play()
		})
		setViewerStore("ttsHighlight", { page: currentPage(), rects: current.rects })
		audio.play()
	}

	function stop() {
		setIsPlaying(false)
		setViewerStore("ttsHighlight", null)
		abortControllers.forEach((c) => c.abort())
		abortControllers = []
		currentAudio?.pause()
		currentAudio = null
		setInFlight(0)
		queue().forEach((sentence) => URL.revokeObjectURL(sentence.audio))
		setQueue([])
		mutateSentences(undefined)
		nextIndex = 0
		nextPlay = 0
	}

	const unregister = registerCommand("pdf.readAloud", () => {
		if (isPlaying()) {
			stop()
			return
		}
		setIsPlaying(true)
		if (currentPage() === pdfSlickStore.pageNumber) {
			refetchSentences()
		} else {
			setCurrentPage(pdfSlickStore.pageNumber)
		}
	})

	onCleanup(() => {
		unregister()
	})
}
