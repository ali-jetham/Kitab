import { Collapsible } from "@kobalte/core/collapsible"
import { EllipsisIcon } from "lucide-solid"
import { Annotation } from "../stores/createDocumentStore"
import styles from "./AnnotationItem.module.css"

type AnnotationItemProps = { annotation: Annotation }

export default function AnnotationItem(props: AnnotationItemProps) {
	return (
		<Collapsible class={styles.item}>
			<Collapsible.Trigger>
				<div class={styles.item__top}>
					<span>{props.annotation.page}</span>
					<EllipsisIcon size={16} />
				</div>
				<div class={styles.item__body}>{props.annotation.text}</div>
			</Collapsible.Trigger>
		</Collapsible>
	)
}
