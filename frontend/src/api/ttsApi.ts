import { http } from "../core/http"

async function synthesize(input: string, signal?: AbortSignal): Promise<Blob> {
	return await http("/api/tts/synthesize", { method: "POST", body: { input }, signal }, (r) =>
		r.blob()
	)
}

export const ttsApi = { synthesize }
