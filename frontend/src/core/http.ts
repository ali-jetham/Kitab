interface RequestOptions extends Omit<RequestInit, "body"> {
	body?: any
}

export async function http(
	url: string,
	options: RequestOptions,
	parse: (r: Response) => Promise<any> = (r) => r.json()
) {
	try {
		const response = await fetch(url, {
			...options,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(options.body)
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
