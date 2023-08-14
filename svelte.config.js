import adapter from "@sveltejs/adapter-node"
import { vitePreprocess } from "@sveltejs/kit/vite"

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess({
        scss: {
            includePaths: ["**"],
        },
    }),

    kit: {
        adapter: adapter({
            precompress: true,
        })
    }
}

export default config
