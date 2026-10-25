import { Tabs } from "@kobalte/core/tabs"
import { Tooltip } from "@kobalte/core/tooltip"
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
import { AppStore } from "../App"
import { useSideBarContext } from "../contexts/SideBarContext"
import styles from "./SideBar.module.css"

type SideBarProps = { appStore: AppStore; setAppStore: SetStoreFunction<AppStore> }

export default function SideBar(props: SideBarProps) {
	const { sideBarStore } = useSideBarContext()
	const [folders] = createResource(() => documentApi.getDocsFolders())
	const [selectedTab, setSelectedTab] = createSignal("folders")
	const location = useLocation()
	// dprint-ignore
	const tabs = [
		{ label: "Folders", value: "folders", icon: FolderTreeIcon, show: () => location.pathname === "/" },
		{ label: "Table of Contents", value: "toc", icon: TableOfContentsIcon, show: () => location.pathname === "/viewer" },
		{ label: "Annotations", value: "annotations", icon: HighlighterIcon, show: () => true },
		{ label: "Bookmarks", value: "bookmarks", icon: BookmarkIcon, show: () => true }
	]

	return (
		<Tabs class={styles.tabs} value={selectedTab()} onChange={setSelectedTab}>
			<Tabs.List class={styles.tabs__list}>
				<For each={tabs}>
					{(tab) => (
						<Show when={tab.show()}>
							<Tooltip openDelay={1000}>
								<Tooltip.Trigger
									as={Tabs.Trigger}
									value={tab.value}
									class={styles.tabs__trigger}
								>
									<tab.icon />
								</Tooltip.Trigger>
								<Tooltip.Portal>
									<Tooltip.Content class="tooltip__content">
										<Tooltip.Arrow />
										<p>Show {tab.label}</p>
									</Tooltip.Content>
								</Tooltip.Portal>
							</Tooltip>
						</Show>
					)}
				</For>
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
