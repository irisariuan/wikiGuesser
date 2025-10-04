import { For } from "solid-js";
import type { Letter } from "../lib/text";
import { DisplayLetter } from "./DisplayLetter";

export default function UsedLetterGrid(props: {
	letters: Pick<Letter, "guessed" | "char">[];
}) {
	return (
		<div class="grid grid-cols-6 md:grid-cols-12 lg:grid-cols-24 gap-1 w-full h-full">
			<For each={props.letters}>
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
