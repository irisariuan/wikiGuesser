import { createEffect, createSignal, onMount, Show } from "solid-js";
import { convertText, markNewGuessedLetters, type Letter } from "../lib/text";
import type { ExtractedWikiResponseQueryPage } from "../lib/web";
import EndCard from "./EndCard";
import InputBar from "./InputBar";
import LetterGrid from "./LetterGrid";

export default function Game(props: {
	text: ExtractedWikiResponseQueryPage;
	encodedTitle: string;
	id: number | null;
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
	const [enableSave, setEnableSave] = createSignal(true);
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
			setEnableSave(false);
			window.localStorage.removeItem(props.encodedTitle);
		}
	});

	onMount(() => {
		const letters = window.localStorage.getItem(props.encodedTitle);
		if (!letters) return;
		const guessedLetters = JSON.parse(letters) as string[];
		for (const letter of guessedLetters) {
			handleSend(letter);
		}
	});

	createEffect(() => {
		if (guessed().length <= 0 || !enableSave()) return;
		const letters = guessed().map((l) => l.char);
		window.localStorage.setItem(
			props.encodedTitle,
			JSON.stringify(letters),
		);
	});

	return (
		<div class="h-full max-h-screen overflow-auto">
			<Show when={showEndCard()}>
				<EndCard
					guessedLength={guessed().length}
					setShowEndCard={setShowEndCard}
				/>
			</Show>
			<Show when={props.id !== null}>
				<h1 class="text-4xl font-bold m-2">
					#{props.id?.toString().padStart(4, "0")}
				</h1>
			</Show>
			<div class="sticky top-0 backdrop-blur-3xl rounded-lg p-2 m-2">
				<LetterGrid
					letters={titleLetters()}
					showAll={showAll()}
					showOthers={showOthers()}
				/>
			</div>
			<hr class="border-zinc-700 mb-4 mx-4" />
			<div class="mx-4">
				<LetterGrid
					letters={contentLetters()}
					showAll={showAll()}
					showOthers={showOthers()}
				/>
			</div>
			<div class="sticky bottom-0 bg-zinc-300/80 m-2 p-2 rounded backdrop-blur-3xl mt-4 flex flex-col gap-4 items-center justify-center">
				<InputBar
					guessed={guessed()}
					handleSend={handleSend}
					showAllSignal={showAllSignal}
					showOthersSignal={showOthersSignal}
					totalLength={contentLetters().length}
				/>
			</div>
		</div>
	);
}
