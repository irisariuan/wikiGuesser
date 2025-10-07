import "dotenv/config";
import type { DailyChallenge } from "../dailyChallenge";
import { getRandomWiki } from "../web";
import { readFile, appendFile } from "fs/promises";
const DAILY_CHALLENGE_FILE = process.env.DAILY_CHALLENGE_FILE_FULL_PATH;
if (!DAILY_CHALLENGE_FILE)
	throw new Error("DAILY_CHALLENGE_FILE env variable not set");

const map = new Map<string, DailyChallenge>();
export async function createDailyChallenge(date: string, title: string) {
	await appendFile(DAILY_CHALLENGE_FILE!, `${date};${title}\n`);
	map.set(date, { date, title });
}
export async function readDailyChallenges(): Promise<DailyChallenge[]> {
	const challenges: DailyChallenge[] = [];
	const lines = (await readFile(DAILY_CHALLENGE_FILE!, "utf-8")).split("\n");
	for (const line of lines) {
		const [date, ...titleStrings] = line.split(";");
		const title = titleStrings.join(";");
		if (date && title) {
			challenges.push({ date, title });
			map.set(date, { date, title });
		}
	}
	return challenges;
}
export async function createOrGetDailyChallenge(
	date: string,
): Promise<(DailyChallenge & { created: boolean }) | null> {
	if (map.has(date)) return { ...map.get(date)!, created: false };
	const challenges = await readDailyChallenges();
	const existing = challenges.find((c) => c.date === date);
	if (existing) return { ...existing, created: false };
	const titleContent = await getRandomWiki(1);
	if (!titleContent) return null;
	const title = titleContent.title;
	const newChallenge = { date, title, created: true };
	await createDailyChallenge(date, title);
	return newChallenge;
}
