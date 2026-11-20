import { Button } from "@kobalte/core/button"
import { Slider } from "@kobalte/core/slider"
import {
	CommandIcon,
	LineDotLeftHorizontalIcon,
	PanelLeftCloseIcon,
	PanelLeftIcon
} from "@lucide/solid"
import { type Accessor, createSignal, Show, type StoreSetter } from "solid-js"
import type { AppStore } from "../contexts/AppContext"
import styles from "./ActionBar.module.css"

type ActionBarProps = {
	appStore: AppStore
	setAppStore: StoreSetter<AppStore>
	visible: Accessor<boolean>
}

export default function ActionBar(props: ActionBarProps) {
	const [showSlider, setShowSlider] = createSignal(false)

	return (
		<div class={[styles.actionBar, { [styles.actionbar__visible!]: props.visible() }]}>
			<Show when={showSlider()}>
				<Slider class={styles.slider__root}>
					<Slider.Track class={styles.slider__track}>
						<Slider.Fill class={styles.slider__fill} />
						<Slider.Thumb class={styles.slider__thumb}>
							<Slider.Input />
						</Slider.Thumb>
					</Slider.Track>
				</Slider>
			</Show>

			<div class={styles.actionButtons}>
				<Button
					onClick={() =>
						props.setAppStore((draft) => {
							draft.isSideBarOpen = !draft.isSideBarOpen
						})
					}
				>
					<Show when={props.appStore.isSideBarOpen} fallback={<PanelLeftIcon />}>
						<PanelLeftCloseIcon />
					</Show>
				</Button>

				<Button
					onClick={() =>
						props.setAppStore((draft) => {
							draft.isCommandPalleteOpen = !draft.isCommandPalleteOpen
						})
					}
				>
					<CommandIcon />
				</Button>

				<Button onClick={() => setShowSlider((prev) => !prev)}>
					<LineDotLeftHorizontalIcon />
				</Button>
			</div>
		</div>
	)
}
