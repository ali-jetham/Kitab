import { Image } from "@kobalte/core/image"
import { useNavigate } from "@solidjs/router"
import { documentApi } from "../../../api/documentApi"
import styles from "./LibraryItem.module.css"

type LibraryItemProps = { id: string; title: string | null; fileName: string }

export default function LibraryItem(props: LibraryItemProps) {
	const navigate = useNavigate()

	return (
		<div class={styles.libraryItem} onClick={() => navigate(`/viewer/${props.id}`)}>
			<Image>
				<Image.Img src={documentApi.getCoverUrl(props.id)} alt="cover" />
				<Image.Fallback>
					<img
						src="https://placehold.co/400x566?text=Cover+Not+Found\nConsider+Refreshing+Covers"
						alt="cover placeholder"
					/>
				</Image.Fallback>
			</Image>
			<p>{props.title ?? props.fileName}</p>
		</div>
	)
}
