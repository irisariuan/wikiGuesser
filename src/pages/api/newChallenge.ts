export const prerender = false;
import type { APIRoute } from "astro";
import { z } from "zod";
import { getOrCreateChallenge } from "../../lib/server/challenge";
import { extractContentLengthFromWiki } from "../../lib/web";
import { safeDecodeURIComponent } from "../../lib/utils";
const schema = z.object({
	title: z.string().min(1),
	create: z.boolean().default(true),
});
const wikiRegex =
	/^(https:\/\/|http:\/\/)?zh\.wikipedia\.org\/zh-hk\/(\p{Script=Han}+)$/u;
const wikiEncodedRegex =
	/^(https:\/\/|http:\/\/)?zh\.wikipedia\.org\/zh-hk\/([\w%]+)$/u;

export const POST: APIRoute = async ({ request }) => {
	const json = await request.json().catch(() => null);
	const parsed = schema.safeParse(json);
	if (!parsed.success) {
		return new Response("Invalid request body", { status: 400 });
	}
	const { title, create } = parsed.data;

	const match = title.match(wikiRegex);
	const encodedMatch = title.match(wikiEncodedRegex);
	const extractedTitle = match
		? match[2]
		: encodedMatch
			? safeDecodeURIComponent(encodedMatch[2])
			: title;
	if (!extractedTitle || extractedTitle.trim().length === 0) {
		return new Response("Failed to extract wiki title", { status: 400 });
	}

	const contentLength = await extractContentLengthFromWiki(extractedTitle);
	if (contentLength === null || contentLength === 0) {
		return new Response("Invalid wiki title", { status: 400 });
	}
	if (!create) return new Response("OK", { status: 200 });

	const challenge = await getOrCreateChallenge(extractedTitle).catch(
		() => null,
	);
	if (!challenge)
		return new Response("Failed to create challenge", { status: 500 });

	return new Response(
		JSON.stringify({
			created: challenge.created,
			encodedTitle: challenge.encodedTitle,
			id: challenge.id,
		}),
		{
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
};
