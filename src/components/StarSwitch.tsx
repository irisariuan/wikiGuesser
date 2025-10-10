import { AiFillStar, AiOutlineStar } from "solid-icons/ai";
import { createSignal, Match, Switch } from "solid-js";
import { setStarChallenge } from "../lib/clientChallenge";

export default function StarSwitch(props: {
	title: string;
	starred: boolean;
	url: URL;
}) {
	async function handleClick(value: boolean) {
		setIsStarred(value);
		if (!(await setStarChallenge(props.title, value, props.url))) {
			setIsStarred(!value);
		}
	}

	const [isStarred, setIsStarred] = createSignal(props.starred);
	return (
		<Switch>
			<Match when={isStarred()}>
				<button
					class="text-amber-500 text-3xl hover:cursor-pointer"
					on:click={() => handleClick(false)}
				>
					<AiFillStar />
				</button>
			</Match>
			<Match when={!isStarred()}>
				<button
					class="text-zinc-700 text-3xl hover:cursor-pointer"
					on:click={() => handleClick(true)}
				>
					<AiOutlineStar />
				</button>
			</Match>
		</Switch>
	);
}
