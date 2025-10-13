import { createSignal, Match, onCleanup, Show, Switch } from "solid-js";
import { checkChallenge, createChallenge } from "../lib/clientChallenge";
import { IoCloseCircle } from "solid-icons/io";

export default function TitleRedirect(props: { url: URL }) {
	let inputRef: HTMLInputElement | undefined;

	const [status, setStatus] = createSignal<
		"idle" | "error" | "loading" | "invalid" | "sendable"
	>("idle");

	const [debouncedTimeout, setDebouncedTimeout] =
		createSignal<NodeJS.Timeout | null>(null);
	const [canBeCleared, setCanBeCleared] = createSignal(false);

	async function send(title: string) {
		setStatus("loading");
		const result = await createChallenge(title, props.url);
		if (!result) return setStatus("error");
		window.location.href = `/game/id/${result.id}`;
	}

	async function check(title: string) {
		if (status() === "loading") return;
		setStatus("loading");
		const result = await checkChallenge(title, props.url);
		if (!result) return setStatus("invalid");
		setStatus("sendable");
	}
	onCleanup(() => {
		if (debouncedTimeout()) {
			clearTimeout(debouncedTimeout()!);
			setDebouncedTimeout(null);
		}
	});

	return (
		<>
			<div class="bg-zinc-100 rounded-full p-2 flex-1 flex relative items-center border border-zinc-100 focus-within:border-zinc-700">
				<input
					ref={inputRef}
					type="text"
					on:keydown={(e) => {
						if (
							e.key === "Enter" &&
							inputRef &&
							status() === "sendable"
						) {
							e.preventDefault();
							const title = inputRef.value.trim();
							if (title.length === 0) return;
							send(title);
						}
					}}
					on:keyup={() => {
						if (!inputRef) return;
						const title = inputRef.value.trim();
						setCanBeCleared(title.length > 0);
						if (debouncedTimeout()) {
							clearTimeout(debouncedTimeout()!);
							setDebouncedTimeout(null);
						}
						if (title.length === 0) {
							return setStatus("idle");
						}
						const timeout = setTimeout(() => {
							check(title);
							setDebouncedTimeout(null);
						}, 500);
						setDebouncedTimeout(timeout);
					}}
					on:blur={() => {
						if (debouncedTimeout()) {
							clearTimeout(debouncedTimeout()!);
							setDebouncedTimeout(null);
						}
					}}
					placeholder="Enter URL or title"
					class="outline-none text-zinc-700 appearance-none placeholder:font-medium placeholder:italic w-full"
				/>
				<Show when={canBeCleared()}>
					<button
						on:click={() => {
							if (!inputRef) return;
							inputRef.value = "";
							inputRef.focus();
							setCanBeCleared(false);
							setStatus("idle");
						}}
						class="right-0 absolute text-2xl text-zinc-500 hover:text-zinc-800 backdrop-blur-xl rounded-full p-1 m-1 hover:cursor-pointer"
					>
						<IoCloseCircle />
					</button>
				</Show>
			</div>
			<button
				on:click={(e) => {
					if (!inputRef) return;
					e.preventDefault();
					const title = inputRef.value.trim();
					if (title.length === 0) return;
					send(title);
				}}
				type="submit"
				disabled={status() !== "sendable"}
				class="bg-blue-500 hover:bg-blue-600 hover:cursor-pointer p-2 text-white font-bold flex items-center justify-center rounded-full disabled:bg-zinc-500 disabled:cursor-not-allowed"
			>
				Go!
			</button>
			<Switch
				fallback={
					<div class="bg-zinc-100 rounded-xl py-2 px-4 border border-zinc-400 shadow-xl">
						<p class="text-zinc-500 text-center">Enter a title</p>
					</div>
				}
			>
				<Match when={status() === "error"}>
					<div class="bg-rose-500 rounded-xl py-2 px-4 border border-rose-700 shadow-xl">
						<p class="text-white text-center">Server Error</p>
					</div>
				</Match>
				<Match when={status() === "invalid"}>
					<div class="bg-rose-500 rounded-xl py-2 px-4 border border-rose-700 shadow-xl">
						<p class="text-white text-center">Invalid Title</p>
					</div>
				</Match>
				<Match when={status() === "loading"}>
					<div class="bg-zinc-100 rounded-xl py-2 px-4 border border-zinc-400 shadow-xl">
						<p class="text-zinc-500 text-center">Checking...</p>
					</div>
				</Match>
				<Match when={status() === "sendable"}>
					<div class="bg-green-500 rounded-xl py-2 px-4 border border-green-700 shadow-xl">
						<p class="text-white text-center">Title Found!</p>
					</div>
				</Match>
			</Switch>
		</>
	);
}
