import { BsLightbulbFill } from "solid-icons/bs";
import { createSignal, Show } from "solid-js";
export default function HintBlock(props: { hint?: string }) {
	const [show, setShow] = createSignal(false);
	return (
		<div
			class="bg-zinc-800 p-2 m-2 rounded group"
			on:click={() => setShow((prev) => !prev)}
		>
			<div class="text-white flex items-center gap-2 break-words select-none hover:cursor-pointer h-6 overflow-x-auto">
				<BsLightbulbFill />
				<Show when={props.hint}>
					<div class={show() ? "" : "bg-zinc-400 rounded"}>
						<p class={show() ? "" : "invisible"}>{props.hint}</p>
					</div>
				</Show>
				<Show when={!props.hint}>
					<div class="w-full h-full bg-zinc-400 rounded animate-pulse"></div>
				</Show>
			</div>
		</div>
	);
}
