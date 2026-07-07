import { useNavigate } from "@solidjs/router";
import type { JSX } from "solid-js";
import styles from "./LibraryItem.module.css";

type LibraryItemProps = { id: string; name: string; };

export default function LibraryItem(props: LibraryItemProps): JSX.Element {
	const navigate = useNavigate();

	function handleClick() {
		// TODO: check if it is possible to type safe the state
		navigate("/viewer", { state: { id: props.id } });
	}

	return (
		<div class={styles.libraryItem} onclick={handleClick}>
			<img src={`api/docs/${props.id}/cover`} alt="cover" />
			<p>{props.name}</p>
		</div>
	);
}
