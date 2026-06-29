import type { NewAnnotation } from "../../stores/bookStore";

async function addAnnotation(ann: NewAnnotation) {
	console.log("adding annotation", JSON.stringify(ann));

	const res = await fetch("/api/annotations", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(ann),
	});
	if (!res.ok) {
		throw new Error(`Server error: ${res.status}`);
	}
	return await res.json();
}

async function getDoc(id: string) {
	const result = await fetch(`/api/docs/${id}`);
	if (!result.ok) {
		throw new Error(`Cannot find document with id: ${id}`);
	}
	return await result.json();
}

export const viewerApi = { addAnnotation, getBook: getDoc };
