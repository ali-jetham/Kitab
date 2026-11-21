import { TextField } from "@kobalte/core/text-field"
import { useSearchParams } from "@solidjs/router"
import { createMemo, createSignal, For, Loading, onSettled, untrack } from "solid-js"
import { documentApi } from "../../api/documentApi"
import { useAppContext } from "../../app/contexts/AppContext"
import Spinner from "../../components/Spinner"
import LibraryItem from "./components/LibraryItem"
import styles from "./Library.module.css"
import { createLibraryCommands } from "./primitives/createLibraryCommands"

export default function Library() {
	const { setAppStore } = useAppContext()
	const [searchParams, setSearchParams] = useSearchParams()
	const [value, setValue] = createSignal(untrack(() => (searchParams.q as string) ?? ""))
	const books = createMemo(() => documentApi.getDocs([searchParams.folder].flat()[0]))
	createLibraryCommands()

	const filteredBooks = () =>
		books()?.filter((book: any) => {
			return book.title
				? book.title?.toLowerCase().includes((searchParams.q as string)?.toLowerCase() ?? "")
				: book.fileName?.toLowerCase().includes((searchParams.q as string)?.toLowerCase() ?? "")
		})

	onSettled(() => {
		setAppStore((draft) => {
			draft.context = "Library"
		})
	})

	return (
		<div class={styles.library}>
			<TextField
				value={value()}
				onChange={(value) => {
					setValue(value)
					setSearchParams({ q: value })
				}}
				class={styles.textField}
			>
				<TextField.Input placeholder="Search for books" />
			</TextField>
			<Loading fallback={<Spinner />}>
				<div class={styles.bookshelf}>
					<For each={filteredBooks()}>
						{(book) => (
							<LibraryItem
								id={book.id}
								title={book.title}
								fileName={book.fileName}
								fileType={book.fileType}
							/>
						)}
					</For>
				</div>
			</Loading>
		</div>
	)
}
