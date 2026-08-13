import { Image } from "@kobalte/core/image";
import { useNavigate } from "@solidjs/router";
import type { JSX } from "solid-js";
import styles from "./LibraryItem.module.css";

type LibraryItemProps = { id: string; title: string | null; fileName: string; };

export default function LibraryItem(props: LibraryItemProps): JSX.Element {
	const navigate = useNavigate();

	function handleClick() {
		// TODO: check if it is possible to type safe the state
		navigate("/viewer", { state: { id: props.id } });
	}

	return (
		<div class={styles.libraryItem} onclick={handleClick}>
			<Image>
				<Image.Img src={`api/docs/${props.id}/cover`} alt="cover" />
			</Image>
			<p>{props.title ?? props.fileName}</p>
		</div>
	);
}
