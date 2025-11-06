import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getRandomWiki } from "../lib/web";
import { encodeToBase64 } from "../lib/utils";
import { getOrCreateChallenge } from "../lib/server/challenge";

export const server = {
	getEncodedGameTitle: defineAction({
		input: z.object({
			minViews: z.number().int().min(0).default(1000),
			maxTry: z.number().int().min(1).default(1000),
		}),
		handler: async (input) => {
			const result = await getRandomWiki(input.minViews, input.maxTry);
			if (!result.data) return null;
			const title = result.success
				? result.data.title
				: result.data[0].title;
			if (!title) return null;
			if (!result.success) {
				console.log(result.error);
			} else {
				console.log(
					"Tried",
					result.data.tried,
					"times to get a suitable article, views:",
					result.data.views,
				);
			}
			console.log("Min views:", input.minViews);
			const finalTitle = encodeToBase64(title);
			if (!finalTitle) return null;
			await getOrCreateChallenge(title);
			return {
				finalTitle,
				tried: result.success ? result.data.tried : null,
			};
		},
	}),
};
