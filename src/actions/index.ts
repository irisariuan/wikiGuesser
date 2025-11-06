import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getRandomWiki } from "../lib/web";
import { encodeToBase64 } from "../lib/utils";
import { getOrCreateChallenge } from "../lib/server/challenge";

export const server = {
	getEncodedGameTitle: defineAction({
		input: z.object({
			minViews: z.number().min(0).optional(),
		}),
		handler: async (input) => {
			const result = await getRandomWiki(input.minViews);
			if (!result.data) return null;
			const title = result.success
				? result.data.title
				: result.data[0].title;
			if (!title) return null;
			if (!result.success) {
				console.log(result.error)
			} else {
				console.log('Tried', result.data.tried, 'times to get a suitable article, views:', result.data.views)
			}
			console.log('Min views:', input.minViews ?? 'undefined')
			const finalTitle = encodeToBase64(title);
			if (!finalTitle) return null;
			await getOrCreateChallenge(title);
			return finalTitle;
		},
	}),
};
