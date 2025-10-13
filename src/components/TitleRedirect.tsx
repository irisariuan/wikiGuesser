import { createSignal, Match, onCleanup, Switch } from "solid-js";
import { checkChallenge, createChallenge } from "../lib/clientChallenge";

export default function TitleRedirect(props: { url: URL }) {
	let inputRef: HTMLInputElement | undefined;

	const [status, setStatus] = createSignal<
		"idle" | "error" | "loading" | "invalid" | "sendable"
	>("idle");

	const [debouncedTimeout, setDebouncedTimeout] =
		createSignal<NodeJS.Timeout | null>(null);

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
				class="outline-none flex-1 text-zinc-700 appearance-none bg-zinc-100 rounded-full p-2 placeholder:font-medium placeholder:italic"
			/>
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
			<Switch>
				<Match when={status() === "error"}>
					<div class="fixed bottom-10 bg-rose-500 rounded-xl py-2 px-4 border border-rose-700 left-1/2 -translate-x-1/2">
						<p class="text-white italic">Server Error</p>
					</div>
				</Match>
				<Match when={status() === "invalid"}>
					<div class="fixed bottom-10 bg-rose-500 rounded-xl py-2 px-4 border border-rose-700 left-1/2 -translate-x-1/2">
						<p class="text-white italic">Invalid Title</p>
					</div>
				</Match>
			</Switch>
		</>
	);
}
