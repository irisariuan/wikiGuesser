import { AI_MODEL, AI_KEY } from "astro:env/server";
const models = AI_MODEL.split(",").map((v) => v.trim());

export const prompt = {
	role: "system",
	content:
		"You are a helpful assistant that helps people guess the title of a Wikipedia article based on its extract. You will only respond with three hints that can help guessing for the title of the article. Do not include any additional information or punctuation. The hints should be in Traditional Chinese and separated by lines. The hints should not be too obvious, and should not directly reveal the title. For example, if the title is '愛因斯坦', you might say '相對論\n物理學家\n德國'. If the title is '萬里長城', you might say '古代建築\n防禦工事\n中國'.",
};

const hintCache = new Map<string, string[] | null>();

export async function getAIGuessHints(
	title: string,
	extract: string,
	forceFetch = true,
	noCache = false,
): Promise<string[] | null> {
	if (!noCache && hintCache.has(title)) {
		return hintCache.get(title) ?? null;
	}
	if (!forceFetch) return null;
	const hints = await generateAIGuessPrompt(title, extract).catch(() => null);
	if (hints) hintCache.set(title, hints);
	return hints;
}

export async function generateAIGuessPrompt(title: string, extract: string) {
	const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${AI_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: models[0],
			models: models.slice(1),
			messages: [
				prompt,
				{
					role: "user",
					content: `Title: ${title}, extract: ${extract}`,
				},
			],
		}),
	});
	if (!res.ok) {
		console.error("AI request failed", await res.text());
		return null;
	}
	const data = await res.json();
	const aiMessage = data.choices[0].message;
	return (aiMessage.content as string)
		.split("\n")
		.map((v) => v.trim())
		.filter((line) => line !== "");
}
