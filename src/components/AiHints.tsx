import { createEffect, createResource, createSignal, For } from "solid-js";
import { getAIGuessHints } from "../lib/ai";
import HintBlock from "./HintBlock";

export default function AiHints(props: {
	text: string;
	title: string;
	url: URL;
}) {
	const [loadHints, setLoadHints] = createSignal(false);
	const [hints, { refetch }] = createResource(async () => {
		if (!loadHints()) return null;
		const result = await getAIGuessHints(props.title, props.text, props.url).catch(
			() => null,
		);
		if (!result) setLoadHints(false)
		return result
	});
	createEffect(() => {
		if (loadHints()) {
			refetch();
		}
	});

	return (
		<>
			<button
				disabled={loadHints()}
				on:click={() => setLoadHints(true)}
				class="rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-400 disabled:text-zinc-500 hover:cursor-pointer disabled:cursor-not-allowed px-4 py-2 text-white"
			>
				Generate
			</button>
			{loadHints() && (
				<For each={hints()}>
					{(hint) => (
						<HintBlock hint={hint} />
					)}
				</For>
			)}
		</>
	);
}
