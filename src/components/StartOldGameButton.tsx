import { createResource, createSignal, For } from "solid-js";
import PopupCard from "./PopupCard";
import {
	getAllDailyChallenges,
	type DailyChallenge,
} from "../lib/dailyChallenge";
import { IoCaretForwardCircle, IoRefreshCircle } from "solid-icons/io";
import { encodeToBase64 } from "../lib/utils";

export default function StartOldGameButton(props: { url: URL }) {
	const [openDashboard, setOpenDashboard] = createSignal(true);
	const [challenges, { refetch }] = createResource<DailyChallenge[]>(
		async () => {
			return await getAllDailyChallenges(props.url);
		},
	);
	return (
		<>
			{openDashboard() && (
				<PopupCard
					title={
						<h1 class="font-bold text-3xl text-zinc-600 flex-1">
							Select A Past Challenge
						</h1>
					}
					extraTitleElement={
						<button
							on:click={() => refetch()}
							class="text-3xl text-zinc-600 hover:text-zinc-900 cursor-pointer"
						>
							<IoRefreshCircle />
						</button>
					}
					onClose={() => setOpenDashboard(false)}
				>
					<div class="flex flex-col my-4 gap-2 overflow-y-auto">
						<For each={challenges()}>
							{(challenge) => (
								<div class="p-1 flex items-center gap-2 hover:underline text-zinc-500 text-lg hover:cursor-pointer hover:bg-zinc-500 hover:text-white rounded-xl">
									<IoCaretForwardCircle />
									<a
										href={`/game/${encodeToBase64(challenge.title)}?date=${challenge.date}`}
									>
										{challenge.date}
									</a>
								</div>
							)}
						</For>
						{challenges()?.length === 0 && (
							<p class="text-zinc-500 text-lg">
								No past challenges found.
							</p>
						)}
					</div>
				</PopupCard>
			)}
			<button
				on:click={() => setOpenDashboard(true)}
				class="m-2 bg-yellow-500 py-2 px-6 rounded-full hover:bg-yellow-600 text-white transition-colors hover:cursor-pointer"
			>
				Past Challenges
			</button>
		</>
	);
}
