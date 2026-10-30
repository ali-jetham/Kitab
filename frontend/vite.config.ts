import solid from "@solidjs/vite-plugin"
import { defineConfig, loadEnv } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "")

	return {
		plugins: [
			solid({ start: true, extensions: [".jsx", ".tsx"], diagnostics: true })
			// VitePWA({
			// 	registerType: "autoUpdate",
			// 	strategies: "generateSW",
			// 	devOptions: { enabled: true, type: "classic" },
			// 	manifest: {
			// 		name: "Kitab",
			// 		short_name: "Kitab",
			// 		start_url: "/",
			// 		display: "standalone",
			// 		description: "Self Hosted Peronsal Library",
			// 		theme_color: "#222226", // TODO: make this dynamic based on the theme color
			// 		icons: [{ src: "/book-192.png", sizes: "192x192", type: "image/png" }, {
			// 			src: "/book-512.png",
			// 			sizes: "512x512",
			// 			type: "image/png"
			// 		}]
			// 	}
			// })
		],
		server: { port: 3000, proxy: { "/api": env.VITE_BACKEND_URL } },
		preview: { port: 3000 },
		optimizeDeps: { exclude: ["@pdfslick/core"] },
		build: { target: "esnext" }
	}
})
