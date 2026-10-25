import { Tabs } from "@kobalte/core/tabs"
import { useLocation } from "@solidjs/router"
import {
	BookmarkIcon,
	FolderTreeIcon,
	HighlighterIcon,
	TableOfContentsIcon
} from "lucide-solid"
import { createResource, createSignal, For, Match, Show, Switch } from "solid-js"
import { SetStoreFunction } from "solid-js/store"
import { documentApi } from "../../api/documentApi"
import AnnotationItem from "../../components/AnnotationItem"
import BookmarkItem from "../../components/BookmarkItem"
import { FolderNode } from "../../components/FolderNode"
import TocNode from "../../components/TocNode"
import { TreeItem } from "../../components/TreeItem"
import { AppStore } from "../App"
import { useSideBarContext } from "../contexts/SideBarContext"
import styles from "./SideBar.module.css"

type SideBarProps = { appStore: AppStore; setAppStore: SetStoreFunction<AppStore> }

export default function SideBar(props: SideBarProps) {
	const { sideBarStore } = useSideBarContext()
	const [folders] = createResource(() => documentApi.getDocsFolders())
	const [selectedTab, setSelectedTab] = createSignal("folders")
	const location = useLocation()

	return (
		<Tabs class={styles.tabs} value={selectedTab()} onChange={setSelectedTab}>
			<Tabs.List class={styles.tabs__list}>
				<Show when={location.pathname === "/"}>
					<Tabs.Trigger class={styles.tabs__trigger} value="folders">
						<FolderTreeIcon />
					</Tabs.Trigger>
				</Show>
				<Show when={location.pathname === "/viewer"}>
					<Tabs.Trigger class={styles.tabs__trigger} value="toc">
						<TableOfContentsIcon />
					</Tabs.Trigger>
				</Show>
				<Tabs.Trigger class={styles.tabs__trigger} value="annotations">
					<HighlighterIcon />
				</Tabs.Trigger>
				<Tabs.Trigger class={styles.tabs__trigger} value="bookmarks">
					<BookmarkIcon />
				</Tabs.Trigger>
				<Tabs.Indicator class={styles.tabs__indicator} />
			</Tabs.List>

			<Tabs.Content as="ul" value="folders" class={styles.tabs__content}>
				<For each={folders()}>{(folder) => <FolderNode {...folder} />}</For>
			</Tabs.Content>

			<Tabs.Content class={styles.tabs__content} value="toc">
				<Switch>
					<Match when={sideBarStore.tocState.status === "empty"}>
						<div>Document does not have a TOC</div>
					</Match>
					<Match when={sideBarStore.tocState.status === "ready"}>
						<ol class={styles.tabs__content}>
							<For each={sideBarStore.tocState.outline}>
								{(item) => <TocNode outline={item} />}
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
				<For each={sideBarStore.documentStore?.annotations}>
					{(annotation) => <AnnotationItem annotation={annotation} />}
				</For>
			</Tabs.Content>

			<Tabs.Content class={styles.tabs__content} value="bookmarks">
				<For each={sideBarStore.documentStore?.bookmarks}>
					{(bm) => <BookmarkItem bookmark={bm} />}
				</For>
			</Tabs.Content>
		</Tabs>
	)
}
