import { IoSend } from "solid-icons/io";
import { createSignal } from "solid-js";
import { isEnglish, isHan, isPunctuation } from "../lib/text";

export default function InputBar(props: {
	handleSend: (word: string) => unknown;
	guessed: string[];
}) {
	let inputEl!: HTMLInputElement;
	const [word, setWord] = createSignal<string | null>(null);
	function submit() {
		const currentWord = word();
		if (!currentWord) return;
		props.handleSend(currentWord);
		setWord(null);
		inputEl.value = "";
	}
	const isDisabled = () => {
		const w = word();
		return (
			!w ||
			props.guessed.includes(w) ||
			props.guessed.includes(w.toUpperCase()) ||
			!(isHan(w) || isEnglish(w)) ||
			isPunctuation(w)
		);
	};
	return (
		<div class="flex gap-2">
			<input
				type="text"
				class="h-10 w-10 rounded bg-zinc-400 text-center outline-none focus:border
			 text-zinc-800 font-bold border-zinc-600 placeholder:text-zinc-600 placeholder:italic placeholder:font-normal"
				maxLength={1}
				placeholder="?"
				ref={inputEl}
				on:input={(event) => {
					setWord(
						event.currentTarget.value.length > 0
							? event.currentTarget.value
							: null,
					);
				}}
				on:keydown={(event) => {
					if (
						event.key === "Enter" &&
						!isDisabled() &&
						event.currentTarget === document.activeElement
					) {
						submit();
					}
				}}
			/>
			<button
				type="submit"
				disabled={isDisabled()}
				class="bg-blue-500 hover:bg-blue-600 hover:cursor-pointer disabled:bg-zinc-500 disabled:cursor-not-allowed
				h-10 w-10 flex items-center justify-center rounded "
				on:click={submit}
			>
				<IoSend class="text-white" />
			</button>
		</div>
	);
}
