export const prerender = false;
import type { APIRoute } from "astro";
import { readDailyChallenges } from "../../lib/server/challenge";

export const GET: APIRoute = async () => {
	const challenges = await readDailyChallenges();
	return new Response(JSON.stringify(challenges), {
		headers: { "Content-Type": "application/json" },
	});
};
