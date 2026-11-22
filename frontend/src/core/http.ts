interface RequestOptions extends Omit<RequestInit, "body"> {
	body?: any
	queryParams?: Record<string, string | number>
}

export async function http(
	url: string,
	options: RequestOptions,
	parse: (r: Response) => Promise<any> = (r) => r.json()
) {
	try {
		const { queryParams, body, ...requestInit } = options
		if (queryParams) {
			console.log(queryParams)
			const queryString = new URLSearchParams(
				Object.entries(queryParams)
					.filter(([_, value]) => value !== undefined && value !== null)
					.map(([key, value]) => [key, String(value)])
			).toString()

			if (queryString) {
				url += (url.includes("?") ? "&" : "?") + queryString
			}
		}

		const postContent = ["POST", "PUT"].includes(options.method?.toUpperCase() ?? "")
			? {
					headers: {
						"Content-Type": "application/json",
						...options.headers
					},
					body: body !== undefined ? JSON.stringify(body) : undefined
				}
			: {}

		const response = await fetch(url, {
			...requestInit,
			...postContent
		})

		if (!response.ok) {
			throw new Error()
		}
		return parse(response)
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") throw error
		console.error(error)
	}
}
