export interface DailyChallenge {
	/*
	 * Date in YYYY-MM-DD format, following ISO 8601 standard in UTC timezone
	 */
	date: string;
	title: string;
	encodedTitle?: string;
}

export async function getTodayDailyChallenge(
	baseURL: URL,
): Promise<DailyChallenge | null> {
	const url = new URL("/api/dailyChallenge", baseURL);
	const res = await fetch(url);
	if (!res.ok) return null;
	const data: DailyChallenge | null = await res.json().catch(() => null);
	if (!data) return null;
	const { date, title } = data;
	return { date, title };
}
export async function getAllDailyChallenges(url: URL) {
	const finalUrl = new URL("/api/allDailyChallenges", url);
	const res = await fetch(finalUrl);
	if (!res.ok) return [];
	const data: DailyChallenge[] = await res.json().catch(() => []);
	return data;
}
