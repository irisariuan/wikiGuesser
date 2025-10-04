export async function getAIGuessHints(
	title: string,
	text: string,
	baseUrl: URL,
) {
	const res = await fetch(new URL("/api/ai", baseUrl), {
		method: "POST",
		body: JSON.stringify({ title, extract: text }),
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (!res.ok) {
		console.error("Error fetching AI hints:", res.statusText);
		return null;
	}
	const hints = await res.json().catch(() => null);
	if (!hints || !Array.isArray(hints)) {
		console.error("Invalid hints format:", hints);
		return null;
	}
	return hints as string[];
}
