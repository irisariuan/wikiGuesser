import {
	createResource,
	createSignal,
	For,
	Match,
	onCleanup,
	Show,
	Switch,
} from "solid-js";
import PopupCard from "./PopupCard";
import { getAllChallenges } from "../lib/clientChallenge";
import { IoCaretForwardCircle, IoRefreshCircle } from "solid-icons/io";
import { AiFillStar } from "solid-icons/ai";
import { OcFeedstar2 } from "solid-icons/oc";

export default function AllChallengesSelector(props: { url: URL }) {
	const [openPopup, setPopup] = createSignal(false);
	const [challenges, { refetch }] = createResource(async () => {
		return await getAllChallenges(props.url).catch(() => []);
	});
	const [filterStar, setFilterStar] = createSignal(false);

	const timer = setInterval(() => {
		if (openPopup()) {
			refetch();
		}
	}, 10000); // Refresh every 10 seconds
	onCleanup(() => clearInterval(timer));

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
						<>
							<button
								on:click={() => refetch()}
								class="text-3xl text-zinc-600 hover:text-zinc-900 cursor-pointer mx-1"
							>
								<IoRefreshCircle />
							</button>
							<button
								on:click={() => setFilterStar(!filterStar())}
								class={`text-2xl mr-1 ${
									filterStar()
										? "text-yellow-800 hover:text-zinc-900"
										: "text-zinc-600 hover:text-yellow-900"
								} cursor-pointer`}
							>
								<OcFeedstar2 />
							</button>
						</>
					}
				>
					<div class="flex flex-col my-4 gap-2 overflow-y-auto">
						<For
							each={
								filterStar()
									? challenges()?.filter((v) => v.starred)
									: challenges()
							}
							fallback={
								<p class="text-zinc-500 text-lg">
									No challenges found.
								</p>
							}
						>
							{(challenge) => (
								<a href={`/game/id/${challenge.id}`}>
									<div class="p-1 flex items-center gap-2 hover:underline text-zinc-500 text-lg hover:cursor-pointer hover:bg-zinc-500 hover:text-white rounded-xl">
										<IoCaretForwardCircle />
										<span>
											#
											{challenge.id
												.toString()
												.padStart(4, "0")}
										</span>
										<Show when={challenge.starred}>
											<AiFillStar class="text-xl" />
										</Show>
									</div>
								</a>
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
