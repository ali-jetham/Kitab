import { Image } from "@kobalte/core/image"
import { documentApi } from "../../../api/documentApi"
import { paths } from "../../../router"
import styles from "./LibraryItem.module.css"

type LibraryItemProps = {
	id: string
	title: string | null | undefined
	fileName: string
	fileType: string
}

export default function LibraryItem(props: LibraryItemProps) {
	return (
		<a
			class={styles.libraryItem}
			href={paths.viewer(props.id)}
			state={JSON.stringify({ fileType: props.fileType })}
		>
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
		</a>
	)
}
