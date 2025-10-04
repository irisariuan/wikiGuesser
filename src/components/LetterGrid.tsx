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
		<div class="grid grid-cols-6 md:grid-cols-12 lg:grid-cols-22 xl:grid-cols-28 gap-1">
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
