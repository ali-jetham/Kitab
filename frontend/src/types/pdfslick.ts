import type { PDFSlick } from "@pdfslick/solid"

declare module "@pdfslick/solid" {
	export type PDFPageView = NonNullable<ReturnType<PDFSlick["getPageView"]>>
	export type PDFPageViewport = PDFPageView["viewport"]
	export type PDFPage = PDFPageView["pdfPage"]
}
