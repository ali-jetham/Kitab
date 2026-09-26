import { TextField } from "@kobalte/core/text-field"
import { useSearchParams } from "@solidjs/router"
import { createResource, For, type JSX, Suspense } from "solid-js"
import { documentApi } from "../../api/documentApi"
import LibraryItem from "./components/LibraryItem"
import styles from "./Library.module.css"
import { createLibraryCommands } from "./primitives/createLibraryCommands"

export default function Library(): JSX.Element {
	const [searchParams, setSearchParams] = useSearchParams()
	const [books] = createResource(documentApi.getDocs)
	createLibraryCommands()

	const filteredBooks = () =>
		books()?.filter((book: any) => {
			return book.title
				? book.title?.toLowerCase().includes(
					(searchParams.q as string)?.toLowerCase() ?? ""
				)
				: book.fileName?.toLowerCase().includes(
					(searchParams.q as string)?.toLowerCase() ?? ""
				)
		})

	return (
		<div class={styles.library}>
			{/*<div class={styles.headerBar}>*/}
			<TextField class={styles.textField}>
				<TextField.Label />
				<TextField.Input
					class={styles.input}
					placeholder="Search for books"
					onChange={(e) => setSearchParams({ q: e.target.value })}
				/>
				<TextField.Description />
				<TextField.ErrorMessage />
			</TextField>
			{/*</div>*/}

			<Suspense fallback={<div>Loading books...</div>}>
				{/* FIXME: show when no books found*/}
				<div class={styles.bookshelf}>
					<For each={filteredBooks()}>
						{(book) => (
							<LibraryItem id={book.id} title={book.title} fileName={book.fileName} />
						)}
					</For>
				</div>
			</Suspense>
		</div>
	)
}
