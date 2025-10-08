export interface Challenge {
	id: number;
	title: string;
	encodedTitle: string;
	hints: string[];
}

export interface DailyChallenge extends Challenge {
	/*
	 * Date in YYYY-MM-DD format, following ISO 8601 standard in UTC timezone
	 */
	date: string;
}
export type MayCreatedDailyChallenge = Pick<
	DailyChallenge,
	"date" | "title" | "id"
> & { created: boolean };

export async function getAllDailyChallenges(
	url: URL,
): Promise<DailyChallenge[]> {
	const finalUrl = new URL("/api/allDailyChallenges", url);
	const res = await fetch(finalUrl);
	if (!res.ok) return [];
	const data: DailyChallenge[] = await res.json().catch(() => []);
	return data;
}
