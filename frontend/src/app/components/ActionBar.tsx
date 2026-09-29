import { Button } from "@kobalte/core/button"
import { Slider } from "@kobalte/core/slider"
import {
	CommandIcon,
	Menu,
	MenuIcon,
	PanelLeftClose,
	PanelLeftCloseIcon,
	PanelLeftIcon
} from "lucide-solid"
import { Show } from "solid-js"
import { SetStoreFunction } from "solid-js/store"
import { AppStore } from "../App"
import styles from "./ActionBar.module.css"

type ActionBarProps = { appStore: AppStore; setAppStore: SetStoreFunction<AppStore> }

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
				<Button onClick={() => props.setAppStore("isSideBarOpen", (prev) => !prev)}>
					<Show when={props.appStore.isSideBarOpen} fallback={<PanelLeftIcon />}>
						<PanelLeftCloseIcon />
					</Show>
				</Button>

				<Button onClick={() => props.setAppStore("isModalOpen", (prev) => !prev)}>
					<CommandIcon />
				</Button>

				<button></button>
			</div>
		</div>
	)
}
