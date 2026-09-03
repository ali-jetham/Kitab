import { http } from "../core/http";

function downloadModel(id: string) {
}

function getModels() {
	http("/api/tts/registry", "GET");
}
