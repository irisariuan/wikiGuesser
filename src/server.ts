import express from "express";
import { handler as ssrHandler } from "../dist/server/entry.mjs";
import {
	createOrGetDailyChallenge,
	readDailyChallenges,
} from "./lib/server/challenge";
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
	
});

app.listen(port, () => {
	console.log(`Server is running at port ${port}`);
});
