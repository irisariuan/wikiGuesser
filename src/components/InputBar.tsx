import type { Letter } from "../lib/text";
import InputBlocks from "./InputBlocks";
import UsedLetterGrid from "./UsedLetterGrid";

export default function InputBar(props: {
	guessed: Pick<Letter, "char" | "guessed">[];
	handleSend: (word: string) => unknown;
}) {
	return (
		<>
			<div class="flex justify-center items-center w-full h-full">
				<div class="flex-1">
					<InputBlocks
						guessed={props.guessed.map((l) => l.char)}
						handleSend={props.handleSend}
					/>
				</div>
				<span class="text-zinc-500 italic">{props.guessed.length}</span>
			</div>

			{props.guessed.length > 0 && (
				// two lines max height
				<div class="max-h-22 overflow-auto">
					<UsedLetterGrid letters={props.guessed} />
				</div>
			)}
		</>
	);
}
