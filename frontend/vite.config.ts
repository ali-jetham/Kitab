import devtools from "solid-devtools/vite";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import solidPlugin from "vite-plugin-solid";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [
			devtools(),
			solidPlugin()
			// TODO: enable PWA once complete
			// VitePWA({
			// 	registerType: "autoUpdate",
			// 	manifest: {
			// 		name: "My App",
			// 		short_name: "App",
			// 		start_url: "/",
			// 		display: "standalone",
			// 		description: "Peronsal library",
			// 		theme_color: "#ffffff",
			// 		icons: [
			// 			{
			// 				src: "/book-192.png",
			// 				sizes: "192x192",
			// 				type: "image/png",
			// 			},
			// 			{
			// 				src: "book-512.png",
			// 				sizes: "512x512",
			// 				type: "image/png",
			// 			},
			// 		],
			// 	},
			// 	devOptions: {
			// 		enabled: true,
			// 	},
			// }),
		],
		server: { port: 3000, host: true, proxy: { "/api": "http://localhost:8000" } },
		optimizeDeps: { exclude: ["@pdfslick/core"] },
		build: { target: "esnext" }
	};
});
