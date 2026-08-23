import devtools from "solid-devtools/vite";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import solidPlugin from "vite-plugin-solid";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");

	return {
		plugins: [
			devtools(),
			solidPlugin(),
			VitePWA({
				registerType: "autoUpdate",
				manifest: {
					name: "Kitab",
					short_name: "Kitab",
					start_url: "/",
					display: "standalone",
					description: "Self Hosted Peronsal Library",
					theme_color: "#ffffff",
					icons: [{ src: "/book-192.png", sizes: "192x192", type: "image/png" }, {
						src: "book-512.png",
						sizes: "512x512",
						type: "image/png"
					}]
				},
				devOptions: { enabled: true }
			})
		],
		// server: { port: 3000, proxy: { "/api": env.VITE_BACKEND_URL } },
		server: { port: 3000, proxy: { "/api": "http://localhost:8000" } },
		optimizeDeps: { exclude: ["@pdfslick/core"] },
		build: { target: "esnext" }
	};
});
