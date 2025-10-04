import { BiRegularShow, BiSolidShow } from "solid-icons/bi";
import { BsLightbulbFill, BsLightbulbOffFill } from "solid-icons/bs";
import { createEffect, createSignal } from "solid-js";
import { convertText, markNewGuessedLetters, type Letter } from "../lib/text";
import type { ExtractedWikiResponseQueryPage } from "../lib/web";
import PopupCard from "./PopupCard";
import InputBar from "./InputBar";
import LetterGrid from "./LetterGrid";
import UsedLetterGrid from "./UsedLetterGrid";
import { IoCaretBackCircle } from "solid-icons/io";

export default function Game(props: { text: ExtractedWikiResponseQueryPage }) {
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
	const [showAll, setShowAll] = createSignal(false);
	const [showOthers, setShowOthers] = createSignal(false);
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
			if (!(letter.guessed || !(letter.isEnglish || letter.isHan)))
				return;
		}
		if (!hasShowedEndCard()) {
			setShowAll(true);
			setShowEndCard(true);
			setHasShowedEndCard(true);
		}
	});

	return (
		<div class="flex flex-col h-full max-h-screen overflow-auto">
			{showEndCard() && (
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
			)}
			<div class="self-end sticky top-0">
				<div class="bg-zinc-300/50 p-2 m-2 rounded backdrop-blur-3xl flex gap-2">
					<button
						class="h-10 w-10 hover:cursor-pointer bg-blue-500 hover:bg-blue-600 rounded flex items-center justify-center text-white text-xl"
						onClick={() => {
							setShowAll((prev) => !prev);
						}}
						title={showAll() ? "Hide All" : "Show All"}
					>
						{showAll() ? <BiRegularShow /> : <BiSolidShow />}
					</button>
					<button
						class={`h-10 w-10 hover:cursor-pointer rounded flex items-center justify-center text-white text-xl ${showOthers() ? "bg-cyan-500 hover:bg-cyan-600" : "bg-cyan-700 hover:bg-cyan-500"}`}
						onClick={() => {
							setShowOthers((prev) => !prev);
						}}
						title={showOthers() ? "Hide Others" : "Show Others"}
					>
						{showOthers() ? (
							<BsLightbulbOffFill />
						) : (
							<BsLightbulbFill />
						)}
					</button>
				</div>
			</div>
			<div class="mx-4">
				<LetterGrid
					letters={titleLetters()}
					showAll={showAll()}
					showOthers={showOthers()}
				/>
				<hr class="my-4" />
				<LetterGrid
					letters={contentLetters()}
					showAll={showAll()}
					showOthers={showOthers()}
				/>
			</div>
			<div class="sticky bottom-0 bg-zinc-300/50 p-2 rounded backdrop-blur-3xl mt-4 flex flex-col gap-4 items-center justify-center">
				<div class="flex justify-center items-center w-full h-full">
					<span class="text-zinc-500 italic flex-1">
						{guessed().length}
					</span>
					<div class="flex-1">
						<InputBar
							guessed={guessed().map((l) => l.char)}
							handleSend={handleSend}
						/>
					</div>
				</div>
				{guessed().length > 0 && <UsedLetterGrid letters={guessed()} />}
			</div>
		</div>
	);
}
