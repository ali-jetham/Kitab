import { Button } from "@kobalte/core/button"
import { TextField } from "@kobalte/core/text-field"
import { SearchXIcon } from "@lucide/solid"
import { useSearchParams } from "@solidjs/router"
import { createMemo, createSignal, For, Loading } from "solid-js"
import { documentApi } from "../../api/documentApi"
import Spinner from "../../components/Spinner"
import LibraryItem from "./components/LibraryItem"
import styles from "./Library.module.css"
import { createLibraryCommands } from "./primitives/createLibraryCommands"

export default function Library() {
	const [value, setValue] = createSignal("")
	const [searchParams, setSearchParams] = useSearchParams()
	const books = createMemo(() => documentApi.getDocs([searchParams.folder].flat()[0]))
	createLibraryCommands()

	const filteredBooks = () =>
		books()?.filter((book: any) => {
			return book.title
				? book.title?.toLowerCase().includes((searchParams.q as string)?.toLowerCase() ?? "")
				: book.fileName?.toLowerCase().includes((searchParams.q as string)?.toLowerCase() ?? "")
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
