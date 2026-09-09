from enum import Enum


class ModelId(Enum):
    KOKORO_V1_0 = "kokoro-v1.0"


class VoiceId(Enum):
    KOKORO_V1_0 = "voices-v1.0"


MODEL_URLS = {
    ModelId.KOKORO_V1_0: {
        "quality": "Kokoro: High",
        "url": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/kokoro-v1.0.onnx",
        "voices": [
            {
                "id": VoiceId.KOKORO_V1_0.value,
                "name": "voices-v1.0.bin",
                "url": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/voices-v1.0.bin",
            }
        ],
        "required_voice_ids": [VoiceId.KOKORO_V1_0],
    }
}
