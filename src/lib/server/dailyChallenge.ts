import { appendFileSync, readFileSync } from "fs";
import "dotenv/config";
import type { DailyChallenge } from "../dailyChallenge";
import { getRandomWiki } from "../web";
const DAILY_CHALLENGE_FILE = process.env.DAILY_CHALLENGE_FILE_FULL_PATH;
if (!DAILY_CHALLENGE_FILE)
	throw new Error("DAILY_CHALLENGE_FILE env variable not set");
export function createDailyChallenge(date: string, title: string) {
	appendFileSync(DAILY_CHALLENGE_FILE!, `${date};${title}\n`);
}
export function readDailyChallenges(): DailyChallenge[] {
	const challenges: DailyChallenge[] = [];
	const lines = readFileSync(DAILY_CHALLENGE_FILE!, "utf-8").split("\n");
	for (const line of lines) {
		const [date, ...titleStrings] = line.split(";");
		const title = titleStrings.join(";");
		if (date && title) challenges.push({ date, title });
	}
	return challenges;
}
export async function createOrGetDailyChallenge(
	date: string,
): Promise<DailyChallenge & {created: boolean} | null> {
	const challenges = readDailyChallenges();
	const existing = challenges.find((c) => c.date === date);
	if (existing) return {...existing, created: false};
	const titleContent = await getRandomWiki(1);
	if (!titleContent) return null;
	const title = titleContent.title;
	const newChallenge = { date, title, created: true };
	createDailyChallenge(date, title);
	return newChallenge;
}
