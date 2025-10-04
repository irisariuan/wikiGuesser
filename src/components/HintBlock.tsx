import { BsLightbulbFill } from "solid-icons/bs";
import { createSignal } from "solid-js";
export default function HintBlock(props: { hint: string }) {
	const [show, setShow] = createSignal(false);
	return (
		<div
			class="bg-zinc-800 p-2 m-2 rounded group"
			on:click={() => setShow((prev) => !prev)}
		>
			<div class="text-white flex items-center gap-2 break-words select-none hover:cursor-pointer">
				<BsLightbulbFill />
				<div class={show() ? "" : "bg-zinc-400 rounded"}>
					<p class={show() ? "" : "invisible"}>{props.hint}</p>
				</div>
			</div>
		</div>
	);
}
