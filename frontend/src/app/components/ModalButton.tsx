import { createPointerListeners } from "@solid-primitives/pointer"
import { Command } from "lucide-solid"
import { createSignal, onMount, Setter } from "solid-js"
import styles from "./ModalButton.module.css"

type ModalButtonProps = { setIsModalOpen: Setter<boolean> }

export default function ModalButton(props: ModalButtonProps) {
	const [showModalButton, setShowModalButton] = createSignal(true)
	const [position, setPosition] = createSignal({ x: 0, y: 0 })
	const [isDragging, setIsDragging] = createSignal(false)

	let buttonRef!: HTMLButtonElement
	let startX = 0, startY = 0

	onMount(() => {
		const savedPos = localStorage.getItem("modalButton")
		if (savedPos) {
			setPosition(JSON.parse(savedPos))
		}
	})

	const handlePointerDown = (e: PointerEvent) => {
		setIsDragging(true)
		buttonRef.setPointerCapture(e.pointerId)
		startX = e.clientX - position().x
		startY = e.clientY - position().y
	}

	createPointerListeners({
		target: () => window,
		onmove: e => {
			if (!isDragging()) return

			let newX = e.clientX - startX
			let newY = e.clientY - startY
			// Active Viewport Boundary Clamping
			newX = Math.max(0, Math.min(newX, window.innerWidth - buttonRef.offsetWidth))
			newY = Math.max(0, Math.min(newY, window.innerHeight - buttonRef.offsetHeight))
			setPosition({ x: newX, y: newY })
		},
		onup: () => {
			if (!isDragging()) return
			setIsDragging(false)
			localStorage.setItem("modalButton", JSON.stringify(position()))
		}
	})

	const handleClick = (e: MouseEvent) => {
		if (isDragging()) {
			e.preventDefault()
			return
		}
		props.setIsModalOpen((prev) => !prev)
	}

	return (
		<button
			ref={buttonRef}
			type="button"
			class={`${styles.modalButton} ${showModalButton() ? "" : styles.hidden} ${
				isDragging() ? styles.dragging : ""
			}`}
			onPointerDown={handlePointerDown}
			onClick={handleClick}
			style={{ transform: `translate3d(${position().x}px, ${position().y}px, 0)` }}
		>
			<Command size={30} />
		</button>
	)
}
