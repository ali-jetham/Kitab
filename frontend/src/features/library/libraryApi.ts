async function fetchDocs() {
	const res = await fetch("api/docs");

	if (!res.ok) {
		throw new Error(`Server error: ${res.status}`);
	}
	return await res.json();
}

export const libraryApi = { fetchDocs };
