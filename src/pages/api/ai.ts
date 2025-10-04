export const prerender = false;
import type { APIRoute } from "astro";
import { z } from "zod";
import { getAIGuessHints } from "../../lib/server/ai";
const schema = z.object({
	title: z.string().min(1),
	extract: z.string().min(1),
});

export const POST: APIRoute = async ({ request }) => {
	const json = await request.json().catch(() => null);
	const parsed = schema.safeParse(json);
	if (!parsed.success) {
		return new Response("Invalid request body", { status: 400 });
	}
	const { title, extract } = parsed.data;
	const hints = await getAIGuessHints(title, extract);
	if (!hints) {
		return new Response("Could not get hints", { status: 500 });
	}
	return new Response(JSON.stringify(hints), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
};
