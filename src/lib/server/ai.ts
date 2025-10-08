import { ChallengeRecord, db, eq, HintsRecord } from "astro:db";
import { AI_MODEL, AI_KEY } from "astro:env/server";
const models = AI_MODEL.split(",").map((v) => v.trim());

export const prompt = {
	role: "system",
	content:
		"You are a helpful assistant that helps people guess the title of a Wikipedia article based on its extract. You will only respond with three hints that can help guessing for the title of the article. Do not include any additional information or punctuation. The hints should be in Traditional Chinese and separated by lines. The hints should not be too obvious, and should not directly reveal the title. For example, if the title is '愛因斯坦', you might say '相對論\n物理學家\n德國'. If the title is '萬里長城', you might say '古代建築\n防禦工事\n中國'.",
};

export async function getExistingHints(title: string) {
	const [result] = await db
		.select()
		.from(HintsRecord)
		.innerJoin(ChallengeRecord, eq(ChallengeRecord.id, HintsRecord.id))
		.where(eq(ChallengeRecord.title, title))
		.limit(1)
		.catch(() => []);
	if (!result) return null;
	return result.HintsRecord.hint
		.split("\n")
		.map((v) => v.trim())
		.filter((v) => v.length > 0);
}

export async function saveHints(title: string, hints: string[]) {
	const [challenge] = await db
		.select()
		.from(ChallengeRecord)
		.where(eq(ChallengeRecord.title, title))
		.limit(1);
	if (!challenge) return false;
	const result = await db
		.insert(HintsRecord)
		.values({
			id: challenge.id,
			hint: hints.join("\n"),
		})
		.catch(() => null);
	if (!result) return false;
	return true;
}

export async function getAIGuessHints(
	title: string,
	extract: string,
	forceFetch = true,
	noCache = false,
): Promise<string[] | null> {
	const hints = await getExistingHints(title);
	if (!noCache && hints) {
		return hints;
	}
	if (!forceFetch) return null;
	const generatedHints = await generateAIGuessPrompt(title, extract).catch(
		() => null,
	);
	return generatedHints;
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
