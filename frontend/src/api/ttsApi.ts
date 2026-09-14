import { http } from "../core/http";

interface TTSResponse {
	quality: string;
	id: string;
}

async function downloadModel(id: string) {
	return await http(`/api/tts/models`, { method: "POST", body: { id } });
}

async function getModels(): Promise<TTSResponse[]> {
	return await http("/api/tts/models", { method: "GET" });
}

async function synthesize(text: string, signal?: AbortSignal): Promise<Blob> {
	return await http("/api/tts/synthesize", { method: "POST", body: { text }, signal }, (r) => r.blob());
}

export const TTSApi = { getModels, downloadModel, synthesize };
