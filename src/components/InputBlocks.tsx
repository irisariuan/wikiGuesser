import { IoSend } from "solid-icons/io";
import { createSignal } from "solid-js";
import { canBeInput } from "../lib/text";

export default function InputBlocks(props: {
	handleSend: (word: string) => unknown;
	guessed: string[];
}) {
	let inputEl!: HTMLInputElement;
	const [letter, setLetter] = createSignal<string | null>(null);
	function submit() {
		const currentLetter = letter();
		if (!currentLetter) return;
		props.handleSend(currentLetter);
		setLetter(null);
		inputEl.value = "";
	}
	const isDisabled = () => {
		const w = letter();
		return (
			!w ||
			props.guessed.includes(w) ||
			props.guessed.includes(w.toUpperCase()) ||
			!canBeInput(w)
		);
	};
	return (
		<div class="flex gap-2">
			<input
				type="text"
				autocomplete="off"
				class="h-10 w-10 rounded bg-zinc-400 text-center outline-none focus:border
			 text-zinc-800 font-bold border-zinc-600 placeholder:text-zinc-600 placeholder:italic placeholder:font-normal"
				maxLength={1}
				placeholder="?"
				autofocus
				ref={inputEl}
				on:input={(event) => {
					setLetter(
						event.currentTarget.value.length > 0
							? event.currentTarget.value
							: null,
					);
				}}
				on:keydown={(event) => {
					if (
						(event.key === "Enter" ||
							event.key === " " ||
							event.key === "Tab") &&
						event.currentTarget === document.activeElement
					) {
						event.preventDefault();
						if (!isDisabled()) submit();
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
