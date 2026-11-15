import { For } from "solid-js"
import type { TocItem } from "../app/contexts/SideBarContext"
import { useSideBarContext } from "../app/contexts/SideBarContext"
import { TreeItem } from "./TreeItem"

type TocNodeProps = {
	item: TocItem
}

export default function TocNode(props: TocNodeProps) {
	const { sideBarStore } = useSideBarContext()

	return (
		<TreeItem
			label={props.item.label}
			hasChildren={!!props.item.children?.length}
			onClick={() => sideBarStore.navigate?.(props.item.target)}
		>
			<For each={props.item.children}>{(child) => <TocNode item={child} />}</For>
		</TreeItem>
	)
}
