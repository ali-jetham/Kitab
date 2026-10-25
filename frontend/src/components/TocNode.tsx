import { TPDFDocumentOutline } from "@pdfslick/core"
import { For } from "solid-js"
import { useSideBarContext } from "../app/contexts/SideBarContext"
import { TreeItem } from "./TreeItem"

type TocNodeProps = { outline: TPDFDocumentOutline[number] }

export default function TocNode(props: TocNodeProps) {
	const { sideBarStore } = useSideBarContext()

	return (
		<TreeItem
			label={props.outline.title}
			hasChildren={props.outline.items.length > 0}
			onClick={() => sideBarStore.navigate?.(props.outline.dest)}
		>
			<For each={props.outline.items}>{(item) => <TocNode outline={item} />}</For>
		</TreeItem>
	)
}
