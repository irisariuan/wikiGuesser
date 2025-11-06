import { actions } from "astro:actions";
const textItems = [
	"Starting new game...",
	"Fetching a random Wikipedia article...",
	"Almost there!",
	"Preparing your game...",
	"Loading fun...",
	"Getting things ready...",
	"Hang tight, loading...",
	"Just a moment more...",
	"Setting up your adventure...",
	"Loading excitement...",
	"Getting your game ready...",
	"Preparing a challenge for you...",
	"Loading knowledge...",
	"Fetching trivia...",
	"Almost ready to play...",
	"Loading the fun...",
	"Getting everything set...",
	"Preparing your challenge...",
	"Loading up the game...",
	"Just a sec, loading...",
];
window.onload = async () => {
	const successDiv: HTMLDivElement | null = document.querySelector(
		"div#astro-actions-success",
	);
	const errorDiv: HTMLDivElement | null = document.querySelector(
		"div#astro-actions-error",
	);
	const loadingDiv: HTMLDivElement | null = document.querySelector(
		"div#astro-actions-loading",
	);
	const a: HTMLAnchorElement | null = document.querySelector("a#gameId");
	const retryButton: HTMLButtonElement | null =
		document.querySelector("button#retryButton");
	const redirectingP: HTMLParagraphElement | null =
		document.querySelector("p#redirecting");
	const loadingP: HTMLParagraphElement | null =
		document.querySelector("p#loading");
	if (
		!a ||
		!successDiv ||
		!errorDiv ||
		!loadingDiv ||
		!retryButton ||
		!redirectingP ||
		!loadingP
	)
		return;
	retryButton.addEventListener("click", reload);

	const randomInterval = setInterval(() => {
		loadingP.textContent = pickRandom(textItems);
	}, 5000);

	const url = new URL(window.location.href);
	const minViewsParam = url.searchParams.get("minViews");
	let minViews: number = Number(minViewsParam);

	const gameTitle = await actions.getEncodedGameTitle({
		minViews: isNaN(minViews) ? undefined : minViews,
	});
	loadingDiv.style.display = "none";
	clearInterval(randomInterval);
	if (!gameTitle.data) {
		errorDiv.style.display = "";
		return;
	}
	successDiv.style.display = "";
	a.href = `/game/${gameTitle.data}`;
	let countdown = 3;
	const interval = setInterval(() => {
		countdown--;
		if (redirectingP) {
			redirectingP.textContent = `Redirecting in ${countdown} seconds...`;
		}
		if (countdown === 0) {
			clearInterval(interval);
			window.location.href = a.href;
		}
	}, 1000);
};
function reload() {
	window.location.reload();
}
function pickRandom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}
