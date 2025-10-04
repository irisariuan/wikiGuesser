import { IoCloseCircle } from "solid-icons/io";
import type { JSXElement } from "solid-js";

export default function PopupCard(props: {
	onClose: () => unknown;
	title?: JSXElement;
	extraTitleElement?: JSXElement;
	children?: JSXElement;
}) {
	return (
		<div class="h-full w-full absolute left-0 top-0 bg-zinc-100/50 backdrop-blur-2xl z-10 flex items-center justify-center p-2">
			<div class="bg-zinc-300 p-8 rounded-3xl h-full w-full lg:h-2/3 lg:w-2/3 flex flex-col drop-shadow-2xl">
				<div class="flex items-center">
					<div class="flex-1">{props.title}</div>
					{props.extraTitleElement}
					<button
						on:click={props.onClose}
						class="text-3xl text-zinc-600 hover:text-zinc-900 cursor-pointer"
					>
						<IoCloseCircle />
					</button>
				</div>
				{props.children}
			</div>
		</div>
	);
}
