from enum import Enum


class ModelId(Enum):
    KOKORO_V1_0 = "kokoro-v1.0"
    KOKORO_V1_0_FP16 = "kokoro-v1.0-fp16"
    KOKORO_V1_0_INT8 = "kokoro-v1.0-int8"


MODEL_URLS: dict[ModelId, dict[str, str]] = {
    ModelId.KOKORO_V1_0: {
        "quality": "High",
        "url": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/kokoro-v1.0.onnx",
    },
    ModelId.KOKORO_V1_0_FP16: {
        "quality": "Medium",
        "url": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/kokoro-v1.0.fp16.onnx",
    },
    ModelId.KOKORO_V1_0_INT8: {
        "quality": "Balanced",
        "url": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/kokoro-v1.0.int8.onnx",
    },
}
