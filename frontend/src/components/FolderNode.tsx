import { For } from "solid-js"
import { commands } from "../core/commands"
import { TreeItem } from "./TreeItem"

export type FolderNodeProps = { name: string; path: string; children: FolderNodeProps[] }

export function FolderNode(props: FolderNodeProps) {
	return (
		<TreeItem
			label={props.name}
			hasChildren={props.children.length > 0}
			onClick={() => commands.executeCommand("app.folderSelect", { arg: props.path })}
		>
			<For each={props.children}>{(child) => <FolderNode {...child} />}</For>
		</TreeItem>
	)
}
