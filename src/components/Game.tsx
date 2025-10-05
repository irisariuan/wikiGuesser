import { IoCaretBackCircle } from "solid-icons/io";
import { createEffect, createSignal, Show } from "solid-js";
import { convertText, markNewGuessedLetters, type Letter } from "../lib/text";
import type { ExtractedWikiResponseQueryPage } from "../lib/web";
import InputBar from "./InputBar";
import LetterGrid from "./LetterGrid";
import PopupCard from "./PopupCard";
import ToggleViews from "./ToggleViews";

export default function Game(props: {
	text: ExtractedWikiResponseQueryPage;
	encodedTitle: string;
}) {
	function handleSend(word: string) {
		{
			setTitleLetters((prev) => markNewGuessedLetters(prev, word));
			setContentLetters((prev) => markNewGuessedLetters(prev, word));
			setGuessed((prev) => {
				const alreadyGuessed = prev.find((l) => l.char === word);
				if (alreadyGuessed) {
					return prev;
				}
				const newGuessedLetter = {
					char: word.toUpperCase(),
					guessed:
						props.text.extract
							.toUpperCase()
							.includes(word.toUpperCase()) ||
						props.text.title
							.toUpperCase()
							.includes(word.toLowerCase()),
				};
				return [...prev, newGuessedLetter];
			});
		}
	}
	const showAllSignal = createSignal(false);
	const showOthersSignal = createSignal(false);
	const showAll = () => showAllSignal[0]();
	const setShowAll = (value: boolean) => showAllSignal[1](value);
	const showOthers = () => showOthersSignal[0]();
	const [showEndCard, setShowEndCard] = createSignal(false);
	const [hasShowedEndCard, setHasShowedEndCard] = createSignal(false);
	const [titleLetters, setTitleLetters] = createSignal<Letter[]>(
		convertText(props.text.title),
	);
	const [contentLetters, setContentLetters] = createSignal<Letter[]>(
		convertText(props.text.extract),
	);
	const [guessed, setGuessed] = createSignal<
		Pick<Letter, "char" | "guessed">[]
	>([]);

	createEffect(() => {
		for (const letter of titleLetters()) {
			if (!letter.guessed && letter.shouldInput) return;
		}
		if (!hasShowedEndCard()) {
			setShowAll(true);
			setShowEndCard(true);
			setHasShowedEndCard(true);
		}
	});
	
	return (
		<div class="flex flex-col h-full max-h-screen overflow-auto">
			<Show when={showEndCard()}>
				<PopupCard
					title={
						<h1 class="font-bold text-3xl text-zinc-600">
							Congratulations!
						</h1>
					}
					onClose={() => {
						setShowEndCard(false);
					}}
				>
					<p class="text-zinc-500 text-lg">
						You has guessed the article in {guessed().length}{" "}
						guesses!
					</p>
					<a
						href="/"
						class="mt-4 flex items-center gap-2 text-blue-500 hover:underline"
					>
						<IoCaretBackCircle />
						<span>Go back to main page</span>
					</a>
				</PopupCard>
			</Show>

			<div class="sticky top-0 backdrop-blur-3xl rounded-lg">
				<div class="flex flex-row-reverse">
					<ToggleViews
						showAllSignal={showAllSignal}
						showOthersSignal={showOthersSignal}
					/>
				</div>
				<div class="p-4 rounded">
					<LetterGrid
						letters={titleLetters()}
						showAll={showAll()}
						showOthers={showOthers()}
					/>
				</div>
			</div>
			<hr class="border-zinc-700 mb-4 mx-4" />
			<div class="mx-4">
				<LetterGrid
					letters={contentLetters()}
					showAll={showAll()}
					showOthers={showOthers()}
				/>
			</div>
			<div class="sticky bottom-0 bg-zinc-300/80 p-2 rounded backdrop-blur-3xl mt-4 flex flex-col gap-4 items-center justify-center">
				<InputBar guessed={guessed()} handleSend={handleSend} />
			</div>
		</div>
	);
}
