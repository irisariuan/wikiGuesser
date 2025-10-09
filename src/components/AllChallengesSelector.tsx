import {
	createResource,
	createSignal,
	For,
	Match,
	Show,
	Switch,
} from "solid-js";
import PopupCard from "./PopupCard";
import { getAllChallenges } from "../lib/clientChallenge";
import { IoCaretForwardCircle, IoRefreshCircle } from "solid-icons/io";

export default function AllChallengesSelector(props: { url: URL }) {
	const [openPopup, setPopup] = createSignal(false);
	const [challenges, { refetch }] = createResource(async () => {
		return await getAllChallenges(props.url).catch(() => []);
	});
	return (
		<>
			<Show when={openPopup()}>
				<PopupCard
					title={
						<h1 class="font-bold text-3xl text-zinc-600 flex-1">
							Select All Challenges
						</h1>
					}
					onClose={() => setPopup(false)}
					extraTitleElement={
						<button
							on:click={() => refetch()}
							class="text-3xl text-zinc-600 hover:text-zinc-900 cursor-pointer"
						>
							<IoRefreshCircle />
						</button>
					}
				>
					<div class="flex flex-col my-4 gap-2 overflow-y-auto">
						<For
							each={challenges()}
							fallback={
								<p class="text-zinc-500 text-lg">
									No challenges found.
								</p>
							}
						>
							{(challenge) => (
								<div class="p-1 flex items-center gap-2 hover:underline text-zinc-500 text-lg hover:cursor-pointer hover:bg-zinc-500 hover:text-white rounded-xl">
									<IoCaretForwardCircle />
									<a href={`/game/id/${challenge.id}`}>
										#
										{challenge.id
											.toString()
											.padStart(4, "0")}
									</a>
								</div>
							)}
						</For>
						<Switch>
							<Match when={challenges.loading}>
								<p class="text-zinc-500 text-lg">Loading...</p>
							</Match>
							<Match when={challenges.error}>
								<p class="text-zinc-500 text-lg">
									Failed to load challenges.
								</p>
							</Match>
						</Switch>
					</div>
				</PopupCard>
			</Show>
			<button
				on:click={() => setPopup(true)}
				class="m-2 bg-emerald-500 py-2 px-6 rounded-full hover:bg-emerald-600 text-white transition-colors hover:cursor-pointer"
			>
				All Challenges
			</button>
		</>
	);
}
