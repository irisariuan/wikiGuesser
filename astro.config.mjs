// @ts-check
import { defineConfig, envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import node from "@astrojs/node";

import solidJs from "@astrojs/solid-js";

import db from "@astrojs/db";

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
    },

    adapter: node({
        mode: "middleware",
    }),

    integrations: [solidJs(), db()],
    env: {
        schema: {
            AI_KEY: envField.string({
                context: "server",
                access: "secret",
            }),
            AI_MODEL: envField.string({
                context: "server",
                access: "public",
                default: "gpt-4o",
            }),
        },
    },
});