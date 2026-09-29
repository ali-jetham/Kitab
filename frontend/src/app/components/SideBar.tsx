import { Tabs } from "@kobalte/core/tabs"
import { Bookmark, Highlighter, TableOfContents } from "lucide-solid"
import { createSignal, For, Match, Show, Switch } from "solid-js"
import { SetStoreFunction } from "solid-js/store"
import AnnotationItem from "../../components/AnnotationItem"
import BookmarkItem from "../../components/BookmarkItem"
import { NavLink } from "../../components/NavLink"
import { AppStore } from "../App"
import { useSideBarContext } from "../contexts/SideBarContext"
import styles from "./SideBar.module.css"

type SideBarProps = { appStore: AppStore; setAppStore: SetStoreFunction<AppStore> }

export default function SideBar(props: SideBarProps) {
	const { sideBarStore } = useSideBarContext()
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
					<Match when={sideBarStore.tocState.status === "empty"}>
						<div>Open a document to see its TOC here</div>
					</Match>
					<Match when={sideBarStore.tocState.status === "ready"}>
						{/*TODO: completely rewrite NavLink component*/}
						<ol class={styles.tabs__content}>
							<For each={sideBarStore.tocState.outline}>
								{(item) => (
									<Show
										when={item.items.length > 0}
										fallback={
											<NavLink
												appStore={props.appStore}
												setAppStore={props.setAppStore}
												label={item.title}
												dest={item.dest}
											/>
										}
									>
										<NavLink
											appStore={props.appStore}
											setAppStore={props.setAppStore}
											label={item.title}
											dest={item.dest}
										>
											<For each={item.items}>
												{(item) => (
													<NavLink
														appStore={props.appStore}
														setAppStore={props.setAppStore}
														label={item.title}
														dest={item.dest}
													/>
												)}
											</For>
										</NavLink>
									</Show>
								)}
							</For>
						</ol>
					</Match>
				</Switch>
			</Tabs.Content>

			<Tabs.Content
				class={`${styles.tabs__content} ${styles.tabs__content__annotations}`}
				value="annotations"
			>
				<For each={sideBarStore.annotations}>
					{(annotation) => <AnnotationItem annotation={annotation} />}
				</For>
			</Tabs.Content>

			<Tabs.Content class={styles.tabs__content} value="bookmarks">
				<For each={sideBarStore.bookmarks}>{(bm) => <BookmarkItem bookmark={bm} />}</For>
			</Tabs.Content>
		</Tabs>
	)
}
