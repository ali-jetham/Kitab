import { http } from "../core/http";

interface TTSResponse {
	quality: string;
	id: string;
}

async function downloadModel(id: string) {
	return await http(`/api/tts/models`, "POST", { id });
}

async function getModels(): Promise<TTSResponse[]> {
	return await http("/api/tts/models", "GET");
}

export const TTSApi = { getModels, downloadModel };
