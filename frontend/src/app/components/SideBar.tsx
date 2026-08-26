import { Tabs } from "@kobalte/core/tabs";
import { Bookmark, Highlighter, TableOfContents } from "lucide-solid";
import styles from "./SideBar.module.css";

export default function SideBar() {
	return (
		<Tabs aria-label="Main navigation" class={styles.tabs}>
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
				Table of Contents
			</Tabs.Content>
			<Tabs.Content class={styles.tabs__content} value="annotations">
				Annotations
			</Tabs.Content>
			<Tabs.Content class={styles.tabs__content} value="bookmarks">
				Bookmarks
			</Tabs.Content>
		</Tabs>
	);
}
