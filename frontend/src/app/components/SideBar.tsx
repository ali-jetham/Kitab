import { Tabs } from "@kobalte/core/tabs"
import { Bookmark, Highlighter, TableOfContents } from "lucide-solid"
import { createSignal, For, Match, Show, Switch } from "solid-js"
import { SetStoreFunction } from "solid-js/store"
import AnnotationItem from "../../components/AnnotationItem"
import BookmarkItem from "../../components/BookmarkItem"
import { TocItem } from "../../components/TocItem"
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
						<ol class={styles.tabs__content}>
							<For each={sideBarStore.tocState.outline}>
								{(item) => (
									<TocItem
										outline={item}
										appStore={props.appStore}
										setAppStore={props.setAppStore}
									/>
								)}
							</For>
						</ol>
					</Match>
				</Switch>
			</Tabs.Content>

			<Tabs.Content
				as="ol"
				class={styles.tabs__content}
				value="annotations"
				data-tab="annotations"
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
