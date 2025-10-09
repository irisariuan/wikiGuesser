export interface Challenge {
	id: number;
	title: string;
	encodedTitle: string;
	hints: string[];
	starred: boolean;
}

export interface DailyChallenge extends Challenge {
	/*
	 * Date in YYYY-MM-DD format, following ISO 8601 standard in UTC timezone
	 */
	date: string;
}
export type MayCreatedDailyChallenge = Pick<
	DailyChallenge,
	"date" | "title" | "id" | "starred"
> & { created: boolean };

export async function getAllDailyChallenges(
	url: URL,
): Promise<DailyChallenge[]> {
	const finalUrl = new URL("/api/allChallenges", url);
	finalUrl.searchParams.set("daily", "true");
	const res = await fetch(finalUrl);
	if (!res.ok) return [];
	const data: DailyChallenge[] = await res.json().catch(() => []);
	return data;
}

export async function getAllChallenges(
	url: URL,
): Promise<Omit<Challenge, "hints">[]> {
	const finalUrl = new URL("/api/allChallenges", url);
	const res = await fetch(finalUrl);
	if (!res.ok) return [];
	const data: Omit<Challenge, "hints">[] = await res.json().catch(() => []);
	return data;
}
export async function setStarChallenge(
	title: string,
	starred: boolean,
	url: URL,
) {
	const finalUrl = new URL("/api/starred", url);
	const res = await fetch(finalUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ title, starred }),
	});
	return res.ok;
}
