export const prerender = false;
import type { APIRoute } from "astro";
import {
	getAllChallenges,
	readDailyChallenges,
} from "../../lib/server/challenge";

export const GET: APIRoute = async (req) => {
	if (req.url.searchParams.get("daily") === "true") {
		const challenges = await readDailyChallenges().catch(() => null);
		if (!challenges) {
			return new Response("Failed to get daily challenges", {
				status: 500,
			});
		}
		return new Response(JSON.stringify(challenges), {
			headers: { "Content-Type": "application/json" },
		});
	}
	const allIds = await getAllChallenges().catch(() => null);
	if (!allIds) {
		return new Response("Failed to get challenges", { status: 500 });
	}
	return new Response(JSON.stringify(allIds), {
		headers: { "Content-Type": "application/json" },
	});
};
