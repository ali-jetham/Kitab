import { TextField } from "@kobalte/core/text-field";
import { useSearchParams } from "@solidjs/router";
import { createResource, For, type JSX, Show, Suspense } from "solid-js";
import LibraryItem from "./components/LibraryItem";
import styles from "./Library.module.css";
import { libraryApi as api } from "./libraryApi";

export default function Library(): JSX.Element {
	const [searchParams, setSearchParams] = useSearchParams();
	const [books] = createResource(api.fetchDocs);

	const filteredBooks = () =>
		books()?.filter((book: any) =>
			book.title?.toLowerCase().includes(
				(searchParams.q as string)?.toLowerCase() ?? "",
			)
		);

	return (
		<div class={styles.library}>
			<div class={styles.headerBar}>
				<TextField>
					<TextField.Label />
					<TextField.Input
						class={styles.input}
						onChange={(e) => setSearchParams({ q: e.target.value })}
					/>
					<TextField.Description />
					<TextField.ErrorMessage />
				</TextField>

				{
					/* <div>
					<button type="button">+</button>
					<button type="button">o</button>
				</div> */
				}
			</div>

			<Suspense fallback={<div>Loading books...</div>}>
				{/* FIXME: show when no books found*/}

				<div class={styles.bookshelf}>
					<For each={filteredBooks()}>
						{(book) => <LibraryItem name={book.title} id={book.id} />}
					</For>
				</div>
			</Suspense>
		</div>
	);
}
