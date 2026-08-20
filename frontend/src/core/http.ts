type Method = "GET" | "POST" | "DELETE";

export async function http(url: string, method: Method, body?: any) {
	let response;
	try {
		switch (method) {
			case "GET":
				response = await fetch(url);
				break;
			case "POST":
				response = await fetch(url, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body)
				});
				break;
			case "DELETE":
				response = await fetch(url);
				break;
		}
		if (!response.ok) {
			throw new Error();
		}
		return response.json();
	} catch (error) {
		console.error(error);
	}
}
