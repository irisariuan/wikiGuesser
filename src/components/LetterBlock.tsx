import type { Letter } from "../lib/text";
import { DisplayLetter } from "./DisplayLetter";
export default function LetterBlock(props: {
	letter: Letter;
	showAll: boolean;
	showOthers: boolean;
}) {
	const style = () => {
		if (props.letter.guessed) return "bg-green-500 text-white"; // guessed

		if (props.letter.isPunctuation)
			return "bg-zinc-300 text-zinc-700 font-bold";

		if (props.showAll && (props.letter.isEnglish || props.letter.isHan))
			return "bg-purple-500 text-white";

		if (props.letter.isHan) return "bg-zinc-800 text-white"; // hanzi

		if (props.letter.isEnglish) return "bg-zinc-500"; // english

		if (props.showOthers) return "bg-cyan-500 text-white"; // other

		return "bg-cyan-700 text-white"; // other not shown
	};

	return (
		<DisplayLetter class={style()}>
			{(props.showAll ||
				props.letter.guessed ||
				props.letter.isPunctuation ||
				(!(props.letter.isHan || props.letter.isEnglish) &&
					props.showOthers)) && <span>{props.letter.char}</span>}
		</DisplayLetter>
	);
}
