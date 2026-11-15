import type { TPDFDocumentOutline } from "@pdfslick/core"
import type { TocItem } from "../app/contexts/SideBarContext"

function getCSSVar(name: string) {
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export const fromPDFOutline = (o: TPDFDocumentOutline[number]): TocItem => ({
	label: o.title,
	target: o.dest,
	children: o.items?.map(fromPDFOutline)
})

export const fromEPUBToc = (t: any): TocItem => ({
	label: t.label,
	target: t.href,
	children: t.subitems?.map(fromEPUBToc)
})

export const helper = { getCSSVar, fromPDFOutline, fromEPUBToc }
