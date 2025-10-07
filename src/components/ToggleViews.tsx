import { BiRegularShow, BiSolidShow } from "solid-icons/bi";
import { BsLightbulbFill, BsLightbulbOffFill } from "solid-icons/bs";
import type { Signal } from "solid-js";

export default function ToggleViews(props: {
	showAllSignal: Signal<boolean>;
	showOthersSignal: Signal<boolean>;
}) {
	const showAll = () => props.showAllSignal[0]();
	const setShowAll = () => props.showAllSignal[1];
	const showOthers = () => props.showOthersSignal[0]();
	const setShowOthers = () => props.showOthersSignal[1];
	return (
		<div class="flex gap-2">
			<button
				class="h-10 w-10 hover:cursor-pointer bg-blue-500 hover:bg-blue-600 rounded flex items-center justify-center text-white text-xl"
				onClick={() => {
					setShowAll()((prev) => !prev);
				}}
				title={showAll() ? "Hide All" : "Show All"}
			>
				{showAll() ? <BiRegularShow /> : <BiSolidShow />}
			</button>
			<button
				class={`h-10 w-10 hover:cursor-pointer rounded flex items-center justify-center text-white text-xl ${showOthers() ? "bg-cyan-500 hover:bg-cyan-600" : "bg-cyan-700 hover:bg-cyan-500"}`}
				onClick={() => {
					setShowOthers()((prev) => !prev);
				}}
				title={showOthers() ? "Hide Others" : "Show Others"}
			>
				{showOthers() ? <BsLightbulbOffFill /> : <BsLightbulbFill />}
			</button>
		</div>
	);
}
