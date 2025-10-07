import { For } from "solid-js";
import { type Letter } from "../lib/text";
import LetterBlock from "./LetterBlock";

export default function LetterGrid(props: {
	letters: Letter[];
	showAll: boolean;
	showOthers: boolean;
}) {
	// sorted in index order, from 0 to n
	const sortedLetters = () =>
		props.letters.toSorted((a, b) => a.index - b.index);
	return (
		<div class="flex flex-wrap gap-1 w-fit">
			<For each={sortedLetters()}>
				{(letter) => (
					<LetterBlock
						letter={letter}
						showAll={props.showAll}
						showOthers={props.showOthers}
					/>
				)}
			</For>
		</div>
	);
}
