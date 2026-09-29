import { Collapsible } from "@kobalte/core/collapsible"
import { ColorSwatch } from "@kobalte/core/color-swatch"
import { parseColor } from "@kobalte/core/colors"
import { EllipsisIcon } from "lucide-solid"
import { Annotation } from "../stores/createDocumentStore"
import styles from "./AnnotationItem.module.css"

type AnnotationItemProps = { annotation: Annotation }

export default function AnnotationItem(props: AnnotationItemProps) {
	return (
		<Collapsible class={styles.item}>
			<Collapsible.Trigger>
				<div class={styles.item__top}>
					<div>
						<ColorSwatch
							class="ColorSwatch"
							value={parseColor(props.annotation.color)}
						/>
						<span>Page {props.annotation.page}</span>
					</div>

					<EllipsisIcon size={16} />
				</div>
				<div class={styles.item__body}>{props.annotation.text}</div>
			</Collapsible.Trigger>
		</Collapsible>
	)
}
