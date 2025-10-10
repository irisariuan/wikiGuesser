import type {
	Challenge,
	DailyChallenge,
	MayCreatedDailyChallenge,
} from "../clientChallenge";
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
	const result = await getOrCreateChallenge(title);
	if (!result) throw new Error("Failed to create challenge");
	const { id } = result;
	await db.insert(DailyChallengeRecord).values({
		date: new Date(date),
		id,
	});
	return id;
}
export async function readDailyChallenges(): Promise<DailyChallenge[]> {
	const records = await db
		.selectDistinct()
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
		starred: r.ChallengeRecord.starred,
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
		starred: result.ChallengeRecord.starred,
	};
}

export async function createOrGetDailyChallenge(
	date: string,
	allowCreate: boolean,
): Promise<MayCreatedDailyChallenge | null> {
	const existing = await getDailyChallenge(date);
	if (existing) return { ...existing, created: false };
	if (!allowCreate) return null;
	const titleContent = await getRandomWiki(1);
	if (!titleContent) return null;
	const title = titleContent.title;
	const id = await createDailyChallenge(date, title);
	const newChallenge = { date, title, id, created: true, starred: false };
	return newChallenge;
}

export async function getChallenge(title: string): Promise<Challenge | null> {
	const [result] = await db
		.selectDistinct()
		.from(ChallengeRecord)
		.where(eq(ChallengeRecord.title, title))
		.leftJoin(HintsRecord, eq(ChallengeRecord.id, HintsRecord.id))
		.catch((err) => {
			console.error(err);
			return [null];
		});
	if (!result) return null;
	return {
		title: result.ChallengeRecord.title,
		encodedTitle: result.ChallengeRecord.encodedTitle,
		hints: result.HintsRecord?.hint.split("\n") ?? [],
		id: result.ChallengeRecord.id,
		starred: result.ChallengeRecord.starred,
	};
}

export async function createChallenge(
	title: string,
): Promise<Challenge | null> {
	const encodedTitle = encodeToBase64(title);
	if (!encodedTitle) return null;
	const [inserted] = await db
		.insert(ChallengeRecord)
		.values({
			title,
			encodedTitle,
		})
		.returning()
		.catch(() => [null]);
	return inserted ? { ...inserted, hints: [] } : null;
}

export async function getOrCreateChallenge(
	title: string,
): Promise<Challenge | null> {
	const existing = await getChallenge(title);
	if (existing) return existing;
	return await createChallenge(title);
}

export async function updateChallenge(
	challenge: Pick<Challenge, "id"> & Partial<Challenge>,
) {
	const result = await db
		.update(ChallengeRecord)
		.set({
			title: challenge.title,
			encodedTitle: challenge.encodedTitle,
			starred: challenge.starred,
		})
		.where(eq(ChallengeRecord.id, challenge.id))
		.catch(() => null);
	if (!result) return false;
	if (challenge.hints) {
		await db
			.update(HintsRecord)
			.set({
				hint: challenge.hints.join("\n"),
			})
			.where(eq(HintsRecord.id, challenge.id))
			.catch(() => null);
	}
	return result.rowsAffected > 0;
}

export async function getChallengeById(id: number): Promise<Challenge | null> {
	const [result] = await db
		.selectDistinct()
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
		starred: result.ChallengeRecord.starred,
	};
}

export async function getAllChallenges(): Promise<Omit<Challenge, "hints">[]> {
	const result = await db
		.selectDistinct()
		.from(ChallengeRecord)
		.leftJoin(HintsRecord, eq(ChallengeRecord.id, HintsRecord.id))
		.orderBy(asc(ChallengeRecord.id))
		.catch(() => []);
	if (!result) return [];
	return result.map((v) => ({
		title: v.ChallengeRecord.title,
		encodedTitle: v.ChallengeRecord.encodedTitle,
		id: v.ChallengeRecord.id,
		starred: v.ChallengeRecord.starred,
	}));
}
