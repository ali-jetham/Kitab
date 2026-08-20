async function get(url: string) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error();
		}
		return response.json();
	} catch (error) {
		console.error(error);
	}
}

async function post(url: string, body: any) {
	try {
		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			throw new Error();
		}
		return response.json();
	} catch (error) {
		console.error(error);
	}
}

// type Method = "GET" | "PUT" | "DELETE";

// async function http(url: string, method: Method, body?: any) {
// 	let response;
// 	try {
// 		switch (method) {
// 			case "GET":
// 				response = await fetch(url);
// 				break;
// 			case "PUT":
// 				response = await fetch(url, {
// 					method: "POST",
// 					headers: { "Content-Type": "application/json" },
// 					body: JSON.stringify(body)
// 				});
// 				break;
// 			case "DELETE":
// 				response = await fetch(url);
// 				break;
// 		}
// 		if (!response.ok) {
// 			throw new Error();
// 		}
// 		return response.json();
// 	} catch (error) {
// 		console.error(error);
// 	}
// }

export const http = { get, post };
