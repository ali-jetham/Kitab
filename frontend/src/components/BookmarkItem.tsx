import { DeleteIcon, TrashIcon } from "lucide-solid"
import { useSideBarContext } from "../app/contexts/SideBarContext"
import { Bookmark } from "../stores/createDocumentStore"
import styles from "./BookmarkItem.module.css"

type BookmarkItemProps = { bookmark: Bookmark }

export default function BookmarkItem(props: BookmarkItemProps) {
	const { sideBarStore } = useSideBarContext()

	return (
		<li>
			<div class={styles.bookmarkitem}>
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
					<DeleteIcon onClick={() => console.log("Delete bookmark")} strokeWidth={1.25} />
				</button>
			</div>
		</li>
	)
}
