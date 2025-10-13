import { db, DailyChallengeRecord, ChallengeRecord } from "astro:db";

export default async function () {
	await db
		.insert(ChallengeRecord)
		.values([{ title: "abc", encodedTitle: "encodedAbc", id: 1 }]);
	await db
		.insert(ChallengeRecord)
		.values([{ title: "abcdefg", encodedTitle: "encodedAbcdefg", id: 2 }]);
	await db
		.insert(DailyChallengeRecord)
		.values([{ date: new Date("2024-01-01"), id: 1 }]);
	await db
		.insert(DailyChallengeRecord)
		.values([{ date: new Date("2024-01-02"), id: 2 }]);
}
