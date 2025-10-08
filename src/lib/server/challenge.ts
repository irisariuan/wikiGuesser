import type {
	Challenge,
	DailyChallenge,
	MayCreatedDailyChallenge,
} from "../dailyChallenge";
import { getRandomWiki } from "../web";
import {
	asc,
	ChallengeRecord,
	DailyChallengeRecord,
	db,
	eq,
	HintsRecord,
} from "astro:db";
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
	await db
		.insert(DailyChallengeRecord)
		.values({
			date: new Date(date),
			id: insertedId,
		})
		.returning({
			insertedId: DailyChallengeRecord.id,
		});
	return insertedId;
}
export async function readDailyChallenges(): Promise<DailyChallenge[]> {
	const records = await db
		.select()
		.from(DailyChallengeRecord)
		.innerJoin(
			ChallengeRecord,
			eq(DailyChallengeRecord.id, ChallengeRecord.id),
		)
		.leftJoin(HintsRecord, eq(ChallengeRecord.id, HintsRecord.id))
		.orderBy(asc(DailyChallengeRecord.id))
		.catch(() => []);
	if (!records) return [];
	return records.map((r) => ({
		date: getDateString(r.DailyChallengeRecord.date),
		title: r.ChallengeRecord.title,
		encodedTitle: r.ChallengeRecord.encodedTitle,
		hints: r.HintsRecord?.hint.split("\n") ?? [],
		id: r.ChallengeRecord.id,
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
		.leftJoin(HintsRecord, eq(ChallengeRecord.id, HintsRecord.id))
		.orderBy(asc(DailyChallengeRecord.id))
		.where(eq(DailyChallengeRecord.date, new Date(date)))
		.catch(() => []);
	if (!result) return null;
	return {
		date: getDateString(result.DailyChallengeRecord.date),
		title: result.ChallengeRecord.title,
		encodedTitle: result.ChallengeRecord.encodedTitle,
		hints: result.HintsRecord?.hint.split("\n") ?? [],
		id: result.ChallengeRecord.id,
	};
}

export async function createOrGetDailyChallenge(
	date: string,
): Promise<MayCreatedDailyChallenge | null> {
	const existing = await getDailyChallenge(date);
	if (existing) return { ...existing, created: false };
	const titleContent = await getRandomWiki(1);
	if (!titleContent) return null;
	const title = titleContent.title;
	const id = await createDailyChallenge(date, title);
	const newChallenge = { date, title, id, created: true };
	return newChallenge;
}

export async function getChallenge(title: string): Promise<Challenge | null> {
	const [result] = await db
		.selectDistinct()
		.from(ChallengeRecord)
		.where(eq(ChallengeRecord.title, title))
		.leftJoin(HintsRecord, eq(ChallengeRecord.id, HintsRecord.id))
		.catch(() => [null]);
	if (!result) return null;
	return {
		title: result.ChallengeRecord.title,
		encodedTitle: result.ChallengeRecord.encodedTitle,
		hints: result.HintsRecord?.hint.split("\n") ?? [],
		id: result.ChallengeRecord.id,
	};
}

export async function createChallenge(title: string): Promise<number | null> {
	const encodedTitle = encodeToBase64(title);
	if (!encodedTitle) return null;
	const [{ insertedId }] = await db
		.insert(ChallengeRecord)
		.values({
			title,
			encodedTitle,
		})
		.returning({ insertedId: ChallengeRecord.id })
		.catch(() => [{ insertedId: null }]);
	return insertedId;
}

export async function getOrCreateChallengeAndReturnId(
	title: string,
): Promise<number | null> {
	const existing = await getChallenge(title);
	if (existing) return existing.id;
	return await createChallenge(title);
}

export async function getChallengeById(id: number): Promise<Challenge | null> {
	const [result] = await db
		.select()
		.from(ChallengeRecord)
		.where(eq(ChallengeRecord.id, id))
		.leftJoin(HintsRecord, eq(ChallengeRecord.id, HintsRecord.id))
		.catch(() => [null]);
	if (!result) return null;
	return {
		title: result.ChallengeRecord.title,
		encodedTitle: result.ChallengeRecord.encodedTitle,
		hints: result.HintsRecord?.hint.split("\n") ?? [],
		id: result.ChallengeRecord.id,
	};
}

export async function getAllChallenges(): Promise<Omit<Challenge, 'hints'>[]> {
	const result = await db
		.select()
		.from(ChallengeRecord)
		.orderBy(asc(ChallengeRecord.id))
		.catch(() => []);
	if (!result) return [];
	return result
}