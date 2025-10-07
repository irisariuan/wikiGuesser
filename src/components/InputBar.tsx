import { Show, type Signal } from "solid-js";
import type { Letter } from "../lib/text";
import InputBlocks from "./InputBlocks";
import UsedLetterGrid from "./UsedLetterGrid";
import ToggleViews from "./ToggleViews";

export default function InputBar(props: {
	guessed: Pick<Letter, "char" | "guessed">[];
	totalLength: number;
	handleSend: (word: string) => unknown;
	showAllSignal: Signal<boolean>;
	showOthersSignal: Signal<boolean>;
}) {
	return (
		<>
			<div class="flex justify-center items-center w-full h-full gap-2">
				<div class="flex-1 flex gap-2">
					<InputBlocks
						guessed={props.guessed.map((l) => l.char)}
						handleSend={props.handleSend}
					/>
				</div>
				<span class="text-zinc-500 italic">
					{props.guessed.length}(
					<span class="text-green-700 font-bold">
						{props.guessed.filter((v) => v.guessed).length}
					</span>
					)/
					{props.totalLength}
				</span>
				<ToggleViews
					showAllSignal={props.showAllSignal}
					showOthersSignal={props.showOthersSignal}
				/>
			</div>
			<Show when={props.guessed.length > 0}>
				<UsedLetterGrid letters={props.guessed} />
			</Show>
		</>
	);
}
