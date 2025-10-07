import { For } from "solid-js";
import type { Letter } from "../lib/text";
import { DisplayLetter } from "./DisplayLetter";

export default function UsedLetterGrid(props: {
	letters: Pick<Letter, "guessed" | "char">[];
}) {
	return (
		<div class="flex flex-wrap gap-2 w-full max-h-34 overflow-auto">
			<For each={props.letters.toReversed()}>
				{(letter) => {
					return (
						<DisplayLetter
							class={
								letter.guessed
									? "border border-green-600 bg-green-500 text-white font-bold"
									: "border border-zinc-400 text-zinc-700 bg-zinc-300 font-bold"
							}
						>
							<span>{letter.char}</span>
						</DisplayLetter>
					);
				}}
			</For>
		</div>
	);
}
