import { IoCaretBackCircle, IoCloseCircle } from "solid-icons/io";

export default function EndCard(props: {
	onClose: () => unknown;
	guesses: number;
}) {
	return (
		<div class="h-full w-full absolute left-0 top-0 bg-zinc-100/50 backdrop-blur-2xl z-10 flex items-center justify-center">
			<div class="bg-zinc-300 p-8 rounded-3xl h-2/3 w-2/3 flex flex-col drop-shadow-2xl">
				<div class="flex items-center">
					<h1 class="font-bold text-3xl flex-1 text-zinc-600">
						Well Done!
					</h1>
					<button
						on:click={props.onClose}
						class="text-3xl text-zinc-600 hover:text-zinc-900 cursor-pointer"
					>
						<IoCloseCircle />
					</button>
				</div>
				<p class="text-zinc-500 text-lg">
					You has guessed the article in {props.guesses} guesses!
				</p>
				<a
					href="/"
					class="mt-4 flex items-center gap-2 text-blue-500 hover:underline"
				>
					<IoCaretBackCircle />
					<span>Go back to main page</span>
				</a>
			</div>
		</div>
	);
}
