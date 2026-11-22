import { DeleteIcon } from "@lucide/solid"
import type { BookmarkRead } from "../api/types/types.gen"
import { useSideBarContext } from "../app/contexts/SideBarContext"
import { commands } from "../core/commands"
import styles from "./BookmarkItem.module.css"

type BookmarkItemProps = { bookmark: BookmarkRead }

export default function BookmarkItem(props: BookmarkItemProps) {
	const { sideBarStore } = useSideBarContext()

	return (
		<li class={styles.bookmarkitem}>
			<button
				type="button"
				class={styles.bookmarkitem__navigate}
				onClick={() => {
					sideBarStore.navigate?.([props.bookmark.page - 1, { name: "XYZ" }, null, null, null])
				}}
			>
				<span>{props.bookmark.page}</span>
			</button>
			<button
				type="button"
				onClick={() => {
					commands.executeCommand("pdf.bookmark.d", {
						arg: { id: props.bookmark.id }
					})
				}}
			>
				<DeleteIcon strokeWidth={1.25} />
			</button>
		</li>
	)
}
