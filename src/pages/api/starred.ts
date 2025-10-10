export const prerender = false;
import type { APIRoute } from "astro";
import { z } from "zod";
import { getChallenge, updateChallenge } from "../../lib/server/challenge";
const schema = z.object({
	title: z.string().min(1),
	starred: z.boolean(),
});

export const POST: APIRoute = async ({ request }) => {
	const json = await request.json().catch(() => null);
	const parsed = schema.safeParse(json);
	if (!parsed.success) {
		return new Response("Invalid request body", { status: 400 });
	}
	const { title, starred } = parsed.data;
	const challenge = await getChallenge(title);
	console.log(title);
	if (!challenge) return new Response("Challenge not found", { status: 404 });
	const success = await updateChallenge({
		id: challenge.id,
		starred,
	});
	if (!success)
		return new Response("Failed to update challenge", { status: 500 });

	return new Response("OK", {
		status: 200,
	});
};
