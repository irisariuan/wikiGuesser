import { actions } from "astro:actions";
import { text } from "./text";

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
	const extraInfoP: HTMLParagraphElement | null =
		document.querySelector("p#extraInfo");
	if (
		!a ||
		!successDiv ||
		!errorDiv ||
		!loadingDiv ||
		!retryButton ||
		!redirectingP ||
		!loadingP ||
		!extraInfoP
	)
		return;
	retryButton.addEventListener("click", reload);

	const randomInterval = setInterval(() => {
		loadingP.textContent = pickRandom(text);
	}, 5000);

	const url = new URL(window.location.href);
	const minViewsParam = url.searchParams.get("minViews");
	const minViews = minViewsParam ? Number(minViewsParam) : null;
	const minViewsValid = minViews && !isNaN(minViews) && minViews >= 0;
	const maxTryParam = url.searchParams.get("maxTry");
	const maxTry = maxTryParam ? Number(maxTryParam) : null;
	const maxTryValid = maxTry && !isNaN(maxTry) && maxTry >= 1;

	const gameTitle = await actions.getEncodedGameTitle({
		minViews: minViewsValid ? minViews : undefined,
		maxTry: maxTryValid ? maxTry : undefined,
	});
	loadingDiv.style.display = "none";
	clearInterval(randomInterval);
	if (!gameTitle.data) {
		errorDiv.style.display = "";
		return;
	}
	successDiv.style.display = "";
	if (gameTitle.data.tried) {
		extraInfoP.textContent = `Found a suitable article after trying ${gameTitle.data.tried} times.`;
		extraInfoP.style.display = "";
	}
	a.href = `/game/${gameTitle.data.finalTitle}`;
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
