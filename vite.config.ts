import { defineConfig } from "vite";
import { ViteMinifyPlugin } from "vite-plugin-minify";

export default defineConfig({
	plugins: [ViteMinifyPlugin({})],

	base: "./",
	root: "./src",
	publicDir: "../public",
	build: {
		outDir: "../dist",
		emptyOutDir: true,
	},

	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `$primeColor: #373737;`,
			},
		},
	},
});
