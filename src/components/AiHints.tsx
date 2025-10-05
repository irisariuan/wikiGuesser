import {
	createEffect,
	createResource,
	createSignal,
	For,
	Match,
	Show,
	Switch,
} from "solid-js";
import { getAIGuessHints } from "../lib/ai";
import HintBlock from "./HintBlock";

export default function AiHints(props: {
	text: string;
	title: string;
	url: URL;
	hints?: string[] | null;
}) {
	const [loadHints, setLoadHints] = createSignal(false);
	const [hints, { refetch }] = createResource(async () => {
		if (props.hints && props.hints.length > 0) {
			return props.hints;
		}
		if (!loadHints()) return null;
		const result = await getAIGuessHints(
			props.title,
			props.text,
			props.url,
		).catch(() => null);
		if (!result) setLoadHints(false);
		return result;
	});
	createEffect(() => {
		if (loadHints()) {
			refetch();
		}
		if (hints() && !loadHints()) {
			setLoadHints(true);
		}
	});

	return (
		<>
			<Show when={!loadHints()}>
				<button
					on:click={() => setLoadHints(true)}
					class="rounded-full bg-blue-500 hover:bg-blue-600 hover:cursor-pointer px-4 py-2 text-white"
				>
					Generate
				</button>
			</Show>
			<Switch>
				<Match when={hints()}>
					<For each={hints()}>
						{(hint) => <HintBlock hint={hint} />}
					</For>
				</Match>
				<Match when={loadHints() && hints.loading}>
					<HintBlock />
					<HintBlock />
					<HintBlock />
				</Match>
				<Match when={loadHints() && hints()?.length === 0}>
					<p class="text-zinc-500 italic">No hints available.</p>
				</Match>
				<Match when={loadHints() && hints.error}>
					<p class="text-red-500 italic">
						Failed to load hints. Please try again later.
					</p>
				</Match>
			</Switch>
		</>
	);
}
