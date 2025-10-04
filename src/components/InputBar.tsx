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
				<span class="text-zinc-500 italic flex-1">
					{props.guessed.length}
				</span>
				<div class="flex-1">
					<InputBlocks
						guessed={props.guessed.map((l) => l.char)}
						handleSend={props.handleSend}
					/>
				</div>
			</div>
			{props.guessed.length > 0 && <UsedLetterGrid letters={props.guessed} />}
		</>
	);
}
