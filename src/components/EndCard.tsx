import type { Setter } from "solid-js";
import PopupCard from "./PopupCard";
import { IoCaretBackCircle, IoCaretForwardCircle } from "solid-icons/io";

export default function EndCard(props: {
	setShowEndCard: Setter<boolean>;
	guessedLength: number;
}) {
	return (
		<PopupCard
			title={
				<h1 class="font-bold text-3xl text-zinc-600">
					Congratulations!
				</h1>
			}
			onClose={() => {
				props.setShowEndCard(false);
			}}
		>
			<p class="text-zinc-500 text-lg">
				You have guessed the article in {props.guessedLength} guesses!
			</p>
			<a
				href="/"
				class="mt-4 flex items-center gap-2 text-blue-500 hover:underline"
			>
				<IoCaretBackCircle />
				<span>Go back to the main page</span>
			</a>
			<a
				href="/game/new"
				class="mt-4 flex items-center gap-2 text-blue-500 hover:underline"
			>
				<IoCaretForwardCircle />
				<span>Start a new game</span>
			</a>
		</PopupCard>
	);
}
