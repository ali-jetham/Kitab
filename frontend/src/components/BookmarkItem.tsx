import { DeleteIcon, TrashIcon } from "lucide-solid"
import { useSideBarContext } from "../app/contexts/SideBarContext"
import { commands } from "../core/commands"
import { Bookmark } from "../stores/createDocumentStore"
import styles from "./BookmarkItem.module.css"

type BookmarkItemProps = { bookmark: Bookmark }

export default function BookmarkItem(props: BookmarkItemProps) {
	const { sideBarStore } = useSideBarContext()

	return (
		<li class={styles.bookmarkitem}>
			<button
				class={styles.bookmarkitem__navigate}
				onClick={() => {
					sideBarStore.navigate?.([
						props.bookmark.page - 1,
						{ name: "XYZ" },
						null,
						null,
						null
					])
				}}
			>
				<span>{props.bookmark.page}</span>
			</button>
			<button>
				<DeleteIcon
					onClick={() => {
						commands.executeCommand("pdf.deleteBookmark", { arg: props.bookmark.id })
					}}
					strokeWidth={1.25}
				/>
			</button>
		</li>
	)
}
