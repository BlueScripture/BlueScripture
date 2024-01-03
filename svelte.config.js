import adapter from "@sveltejs/adapter-cloudflare"
import { vitePreprocess } from "@sveltejs/kit/vite"

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess({
        scss: {
            includePaths: ["**"]
        }
    }),

    kit: {
        adapter: adapter({
            precompress: true,
            routes: {
                include: ["/*"],
                exclude: ["<all>"]
            }
        })
    }
}

export default config
