import { Tabs } from "@kobalte/core/tabs"
import { Tooltip } from "@kobalte/core/tooltip"
import {
	BookmarkIcon,
	FolderTreeIcon,
	Grid2X2Icon,
	HighlighterIcon,
	TableOfContentsIcon
} from "@lucide/solid"
import { useLocation, useMatch } from "@solidjs/router"
import { createMemo, createSignal, For, Loading, Match, onCleanup, Show, Switch } from "solid-js"
import { documentApi } from "../../api/documentApi"
import AnnotationItem from "../../components/AnnotationItem"
import BookmarkItem from "../../components/BookmarkItem"
import { FolderNode } from "../../components/FolderNode"
import Spinner from "../../components/Spinner"
import TocNode from "../../components/TocNode"
import { useSideBarContext } from "../contexts/SideBarContext"
import styles from "./SideBar.module.css"

export default function SideBar() {
	const { setSideBarStore, sideBarStore, documentStore } = useSideBarContext()
	const [selectedTab, setSelectedTab] = createSignal("folders")
	const match = useMatch(() => "/viewer/:id")
	const location = useLocation()
	const folders = createMemo(() => documentApi.getDocsFolders())

	const tabs = [
		{
			label: "Folders",
			value: "folders",
			icon: FolderTreeIcon,
			show: () => location.pathname === "/"
		},
		{
			label: "Table of Contents",
			value: "toc",
			icon: TableOfContentsIcon,
			show: () => match()
		},
		{
			label: "Thumbnails",
			value: "thumbnails",
			icon: Grid2X2Icon,
			show: () => match()
		},
		{
			label: "Annotations",
			value: "annotations",
			icon: HighlighterIcon,
			show: () => true
		},
		{
			label: "Bookmarks",
			value: "bookmarks",
			icon: BookmarkIcon,
			show: () => true
		}
	]

	onCleanup(() =>
		setSideBarStore((draft) => {
			draft.thumbnailsSlot = null
		})
	)

	return (
		<Tabs class={styles.tabs} value={selectedTab()} onChange={setSelectedTab}>
			<Tabs.List class={styles.tabs__list}>
				<For each={tabs}>
					{(tab) => (
						<Show when={tab.show()}>
							<Tooltip openDelay={1000}>
								<Tooltip.Trigger as={Tabs.Trigger} value={tab.value} class={styles.tabs__trigger}>
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
				<Loading fallback={<Spinner />}>
					<For each={folders()}>{(folder) => <FolderNode {...folder} />}</For>
				</Loading>
			</Tabs.Content>

			<Tabs.Content class={styles.tabs__content} value="toc">
				<Switch>
					<Match when={sideBarStore.tocState.status === "empty"}>
						<div>Document does not have a TOC</div>
					</Match>
					<Match when={sideBarStore.tocState.status === "ready"}>
						<ol class={styles.tabs__content}>
							<For each={sideBarStore.tocState.outline}>{(item) => <TocNode item={item} />}</For>
						</ol>
					</Match>
				</Switch>
			</Tabs.Content>

			<Tabs.Content as="ol" class={styles.tabs__content} value="annotations" data-tab="annotations">
				<For each={documentStore()?.annotations}>
					{(annotation) => <AnnotationItem annotation={annotation} />}
				</For>
			</Tabs.Content>

			<Tabs.Content as="ol" class={styles.tabs__content} value="bookmarks">
				<For each={documentStore()?.bookmarks}>{(bm) => <BookmarkItem bookmark={bm} />}</For>
			</Tabs.Content>

			<Tabs.Content
				class={styles.tabs__content}
				value="thumbnails"
				data-tab="thumbnails"
				forceMount
				style={{ display: selectedTab() === "thumbnails" ? undefined : "none" }}
				ref={(el) => {
					setSideBarStore((draft) => {
						draft.thumbnailsSlot = el
					})
				}}
			/>
		</Tabs>
	)
}
