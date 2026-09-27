import { Tabs } from "@kobalte/core/tabs"
import { Bookmark, Highlighter, TableOfContents } from "lucide-solid"
import { createResource, createSignal, For, Match, Show, Switch } from "solid-js"
import { annotationApi } from "../../api/annotationApi"
import AnnotationItem from "../../components/AnnotationItem"
import { NavLink } from "../../components/NavLink"
import { useSideBarContext } from "../contexts/SideBarContext"
import styles from "./SideBar.module.css"
import { useNavigate } from "@solidjs/router"

export default function SideBar() {
	const { tocState, annotations } = useSideBarContext()
	const [selectedTab, setSelectedTab] = createSignal("annotations")

	return (
		<Tabs class={styles.tabs} value={selectedTab()} onChange={setSelectedTab}>
			<Tabs.List class={styles.tabs__list}>
				<Tabs.Trigger class={styles.tabs__trigger} value="toc">
					<TableOfContents />
				</Tabs.Trigger>

				<Tabs.Trigger class={styles.tabs__trigger} value="annotations">
					<Highlighter />
				</Tabs.Trigger>

				<Tabs.Trigger class={styles.tabs__trigger} value="bookmarks">
					<Bookmark />
				</Tabs.Trigger>

				<Tabs.Indicator class={styles.tabs__indicator} />
			</Tabs.List>

			<Tabs.Content class={styles.tabs__content} value="toc">
				<Switch>
					<Match when={tocState().status === "empty"}>
						<div>Open a document to see its TOC here</div>
					</Match>

					<Match when={tocState().status === "ready"}>
						<div class={styles.toc__list}>
							<For each={tocState().outline}>
								{(item) => (
									<Show
										when={item.items.length > 0}
										fallback={<NavLink label={item.title} dest={item.dest} />}
									>
										<NavLink label={item.title} dest={item.dest}>
											<For each={item.items}>
												{(item) => <NavLink label={item.title} dest={item.dest} />}
											</For>
										</NavLink>
									</Show>
								)}
							</For>
						</div>
					</Match>
				</Switch>
			</Tabs.Content>

			<Tabs.Content class={styles.tabs__content} value="annotations">
				<div class={styles.ann__list}>
					<For each={annotations()}>
						{(annotation) => <AnnotationItem annotation={annotation} />}
					</For>
				</div>
			</Tabs.Content>

			<Tabs.Content class={styles.tabs__content} value="bookmarks">
				Bookmarks
			</Tabs.Content>
		</Tabs>
	)
}
