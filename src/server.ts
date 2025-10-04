import express from "express";
import { handler as ssrHandler } from "../dist/server/entry.mjs";
import {
	createOrGetDailyChallenge,
	readDailyChallenges,
} from "./lib/server/dailyChallenge";
const app = express();
const port = 6543;

const flags = process.argv.slice(2);
if (flags.includes("--dev")) {
	console.log("Running in development mode, not serving static files.");
} else {
	app.use("/", express.static("dist/client/"));
	app.use(ssrHandler);
}

app.get("/api/dailyChallenge", async (req, res) => {
	console.log(
		`Received request for daily challenge at ${new Date().toISOString()}`,
	);
	const url = new URL(req.url);
	if (url.searchParams.has("getAll")) {
		const challenges = readDailyChallenges();
		return res.json(challenges);
	}
	const today = new Date();
	const dateString =
		url.searchParams.get("date") ?? today.toISOString().split("T")[0];
	const result = await createOrGetDailyChallenge(dateString);
	if (!result)
		return res
			.status(500)
			.json({ error: "Failed to get or create daily challenge" });
	return res.json(result);
});

app.listen(port, () => {
	console.log(`Server is running at port ${port}`);
});
