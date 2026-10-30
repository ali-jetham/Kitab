import { Button } from "@kobalte/core/button"
import { CommandIcon, PanelLeftCloseIcon, PanelLeftIcon } from "@lucide/solid"
import { Show } from "solid-js"
import { StoreSetter } from "solid-js"
import { AppStore } from "../App"
import styles from "./ActionBar.module.css"

type ActionBarProps = { appStore: AppStore; setAppStore: StoreSetter<AppStore> }

export default function ActionBar(props: ActionBarProps) {
	return (
		<div class={styles.actionBar}>
			{
				/*<Slider class={styles.SliderRoot}>
				<div class={styles.SliderLabel}></div>
				<Slider.Track class={styles.SliderTrack}>
					<Slider.Fill class={styles.SliderRange} />
					<Slider.Thumb class={styles.SliderThumb}>
						<Slider.Input />
					</Slider.Thumb>
				</Slider.Track>
			</Slider>*/
			}

			<div class={styles.actionButtons}>
				<Button
					onClick={() =>
						props.setAppStore(draft => {
							draft.isSideBarOpen = !draft.isSideBarOpen
						})}
				>
					<Show when={props.appStore.isSideBarOpen} fallback={<PanelLeftIcon />}>
						<PanelLeftCloseIcon />
					</Show>
				</Button>

				<Button
					onClick={() =>
						props.setAppStore(draft => {
							draft.isCommandPalleteOpen = !draft.isCommandPalleteOpen
						})}
				>
					<CommandIcon />
				</Button>

				<button></button>
			</div>
		</div>
	)
}
