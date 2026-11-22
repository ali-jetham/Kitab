import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
	input: "http://localhost:8000/openapi.json",
	output: {
		path: "src/api/types",
		entryFile: false
	},
	plugins: [
		{
			name: "@hey-api/typescript",
			case: "preserve"
		}
	]
})
