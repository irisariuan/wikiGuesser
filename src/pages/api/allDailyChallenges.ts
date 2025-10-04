export const prerender = false;
import type { APIRoute } from "astro";
import { readDailyChallenges } from "../../lib/server/dailyChallenge";

export const GET: APIRoute = async () => {
	const challenges = readDailyChallenges();
	return new Response(JSON.stringify(challenges), {
		headers: { "Content-Type": "application/json" },
	});
};
