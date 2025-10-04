import type { JSXElement } from "solid-js";

export function DisplayLetter(props: {
	children?: JSXElement;
	class?: string;
	size?: number;
}) {
	const finalSize = () => props.size ?? 10;
	return (
		<div
			class={`h-${finalSize()} w-${finalSize()} flex justify-center items-center rounded select-none ${finalSize() === 10 ? "text-xl" : ""} ${props.class ?? ""}`}
		>
			{props.children}
		</div>
	);
}
