interface RequestOptions extends Omit<RequestInit, "body"> {
	body?: any
	queryParams?: Record<string, any>
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
				Object.entries(queryParams).filter(([_, value]) => value !== undefined && value !== null).map((
					[key, value]
				) => [key, String(value)])
			).toString()

			url += `?${queryString}`
		}
		const response = await fetch(url, {
			...requestInit,
			headers: { "Content-Type": "application/json" }, // TODO: apply when POST
			body: JSON.stringify(body) // TODO: apply only when POST
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
