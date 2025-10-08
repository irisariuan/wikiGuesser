import type { DailyChallenge } from "../dailyChallenge";
import { getRandomWiki } from "../web";
import { ChallengeRecord, DailyChallengeRecord, db, eq } from "astro:db";
import { encodeToBase64, getDateString } from "../utils";
export async function createDailyChallenge(date: string, title: string) {
	const encodedTitle = encodeToBase64(title);
	if (!encodedTitle) throw new Error("Failed to encode title");
	const result = await db
		.insert(ChallengeRecord)
		.values({
			title: title,
			encodedTitle: encodedTitle,
		})
		.returning({ insertedId: ChallengeRecord.id });
	const [{ insertedId }] = result;
	await db.insert(DailyChallengeRecord).values({
		date: new Date(date),
		id: insertedId,
	});
}
export async function readDailyChallenges(): Promise<DailyChallenge[]> {
	const records = await db
		.select()
		.from(DailyChallengeRecord)
		.innerJoin(
			ChallengeRecord,
			eq(DailyChallengeRecord.id, ChallengeRecord.id),
		);
	return records.map((r) => ({
		date: getDateString(r.DailyChallengeRecord.date),
		title: r.ChallengeRecord.title,
		encodedTitle: r.ChallengeRecord.encodedTitle,
	}));
}

export async function getDailyChallenge(
	date: string,
): Promise<DailyChallenge | null> {
	const [result] = await db
		.selectDistinct()
		.from(DailyChallengeRecord)
		.innerJoin(
			ChallengeRecord,
			eq(DailyChallengeRecord.id, ChallengeRecord.id),
		)
		.where(eq(DailyChallengeRecord.date, new Date(date)))
		.catch(() => []);
	if (!result) return null;
	return {
		date: getDateString(result.DailyChallengeRecord.date),
		title: result.ChallengeRecord.title,
		encodedTitle: result.ChallengeRecord.encodedTitle,
	};
}

export async function createOrGetDailyChallenge(
	date: string,
): Promise<(DailyChallenge & { created: boolean }) | null> {
	const existing = await getDailyChallenge(date);
	if (existing) return { ...existing, created: false };
	const titleContent = await getRandomWiki(1);
	if (!titleContent) return null;
	const title = titleContent.title;
	const newChallenge = { date, title, created: true };
	await createDailyChallenge(date, title);
	return newChallenge;
}
