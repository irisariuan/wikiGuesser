import { JSDOM } from "jsdom";
import { Converter } from "opencc-js";
import { isEnglish } from "./text";
import type { Tried } from "./utils";

interface BasePage {
	pageid: number;
	ns: number;
	title: string;
}

interface ExtractedWikiResponse<
	ExtraResponse,
	Success extends boolean = boolean,
> {
	batchcomplete: Success;
	query: Success extends true
		? {
				pages: ExtraResponse[];
			}
		: undefined;
}

export interface ExtractedWikiResponseQueryPage extends BasePage {
	extract: string;
}

export interface ExtractedWikiResponseQueryPageReturn
	extends ExtractedWikiResponseQueryPage {
	originalExtract: string;
	originalTitle: string;
}
export interface ExtractWikiResponseViewsPage extends BasePage {
	pageviews: Record<string, number>;
}

export function removeHtml(html: string, removeEnglish = false) {
	const dom = new JSDOM(html);
	const document = dom.window.document;
	if (!document.body) return "";
	const queue = [document.body.firstChild];
	let isFirst = true;
	while (queue.length) {
		const node = queue.shift();
		if (!node) continue;
		if (node.nodeType === dom.window.Node.ELEMENT_NODE) {
			const el = node as Element;
			// remove elements that are lang=en
			if (
				(el.getAttribute("lang") === "en" ||
					isEnglish(el.textContent)) &&
				!isFirst &&
				removeEnglish
			) {
				el.remove();
				continue;
			}
			for (const child of Array.from(el.childNodes)) {
				queue.push(child);
			}
		}
		isFirst = false;
	}
	const textContent = document.body.textContent;
	return textContent.trim().replaceAll("\n", "").replaceAll(/\s/g, "");
}

export async function extractDataFromWiki(
	title: string,
): Promise<ExtractedWikiResponseQueryPageReturn | null> {
	const url = new URL("https://zh.wikipedia.org/w/api.php");
	url.searchParams.set("action", "query");
	url.searchParams.set("variant", "zh-hk");
	url.searchParams.set("titles", title);
	url.searchParams.set("prop", "extracts");
	url.searchParams.set("exintro", "true");
	url.searchParams.set("exsectionformat", "plain");
	url.searchParams.set("format", "json");
	url.searchParams.set("formatversion", "2");
	url.searchParams.set("redirects", "1");
	const response = await fetch(url).catch(() => null);
	if (!response || !response.ok) return null;
	const data = (await response
		.json()
		.catch(() => null)) as ExtractedWikiResponse<
		ExtractedWikiResponseQueryPage,
		boolean
	> | null;
	if (!data || !data.batchcomplete || !data.query?.pages?.[0]) return null;
	const mayContainHtml = data.query.pages[0];
	if (mayContainHtml.extract.trim().length === 0) return null;
	const converter = Converter({ from: "cn", to: "hk" });
	const newTitle = converter(mayContainHtml.title.replaceAll(" ", ""));
	return {
		...mayContainHtml,
		extract: removeHtml(mayContainHtml.extract),
		originalExtract: mayContainHtml.extract,
		title: newTitle,
		originalTitle: mayContainHtml.title,
	};
}

interface WikiQueryResponseRandom {
	query: {
		random: WikiQueryResponseRandomContent[];
	};
}

interface WikiQueryResponseRandomContent {
	id: number;
	ns: number;
	title: string;
}
interface WikiQueryResponseRandomContentWithViews
	extends WikiQueryResponseRandomContent {
	views: number;
}

export const validNamespaces = [
	0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 90, 91, 92, 93, 100,
	101, 102, 103, 104, 105, 106, 107, 710, 711, 828, 829, 1198, 1199, 2600,
	5500, 5501,
] as const;
export type Namespace = (typeof validNamespaces)[number];

export async function getRandomWiki(
	minViews = 1000,
	maxTry = 50,
	namespaces: Namespace[] = [0],
): Promise<
	Tried<
		WikiQueryResponseRandomContentWithViews & { tried: number },
		any,
		WikiQueryResponseRandomContentWithViews[]
	>
> {
	if (maxTry <= 0)
		throw new Error("maxTry must be a positive integer greater than 0");

	const newResult: WikiQueryResponseRandomContentWithViews[] = [];
	let tried = 0;
	// fetch in batches of 500
	for (let i = 0; i < maxTry; i += 500) {
		const result = await fetchRandomWiki(
			Math.min(maxTry - i, 500),
			namespaces,
		);
		if (!result) {
			return {
				success: false,
				error: "Failed to fetch random wiki",
				data: null,
			};
		}
		for (let j = 0; j < result.length; j += 50) {
			const batch = result.slice(j, j + 50);
			const titles = batch.map((item) => item.title);
			const views = await getViewsOfWiki(titles);
			if (!views) continue;
			for (let k = 0; k < batch.length; k++) {
				tried++;
				const viewCount = views[k];
				if (viewCount >= minViews) {
					return {
						success: true,
						data: {
							...batch[k],
							views: viewCount,
							tried,
						},
						error: null,
					};
				}
				newResult.push({
					...batch[k],
					views: viewCount,
				});
			}
		}
	}
	return {
		success: false,
		error: "No match",
		data: newResult,
	};
}

export async function fetchRandomWiki(
	limit: number,
	namespaces: Namespace[] = [0],
): Promise<WikiQueryResponseRandomContent[] | null> {
	const url = new URL(
		"https://zh.wikipedia.org/w/api.php?action=query&list=random&format=json",
	);
	url.searchParams.set("rnnamespace", namespaces.join("|"));
	url.searchParams.set("rnlimit", limit.toString());
	const result = await fetch(url).catch(() => null);
	if (!result || !result.ok) return null;
	const data = (await result
		.json()
		.catch(() => null)) as WikiQueryResponseRandom | null;
	if (!data) return null;
	return data.query.random;
}

export async function extractContentLengthFromWiki(title: string) {
	const url = new URL(
		"https://zh.wikipedia.org/w/api.php?action=query&prop=info&inprop=url&format=json&formatversion=2",
	);
	url.searchParams.set("titles", title);
	const res = await fetch(url).catch(() => null);
	if (!res || !res.ok) return null;
	const data = (await res.json().catch(() => null)) as {
		query?: { pages: { length: number }[] };
	} | null;
	if (!data?.query?.pages?.[0]?.length) return null;
	return data.query.pages[0].length;
}
export async function getViewsOfWiki(title: string): Promise<number | null>;
export async function getViewsOfWiki(
	titles: string[],
): Promise<number[] | null>;
export async function getViewsOfWiki(
	titles: string[] | string,
): Promise<number[] | null | number> {
	if (typeof titles !== "string" && titles.length > 50)
		throw new Error("Cannot get pageviews for more than 50 titles at once");

	const url = new URL("https://zh.wikipedia.org/w/api.php");
	url.searchParams.set("action", "query");
	url.searchParams.set("variant", "zh-hk");
	url.searchParams.set(
		"titles",
		typeof titles === "string" ? titles : titles.join("|"),
	);
	url.searchParams.set("prop", "pageviews");
	url.searchParams.set("format", "json");
	url.searchParams.set("formatversion", "2");
	url.searchParams.set("redirects", "1");
	const res = await fetch(url).catch(() => null);
	if (!res || !res.ok) return null;
	const data: ExtractedWikiResponse<ExtractWikiResponseViewsPage> = await res
		.json()
		.catch(() => null);
	if (typeof titles === "string") {
		if (!data.query?.pages?.[0]) return null;
		return Object.values(data.query.pages[0].pageviews).reduce(
			(a, b) => a + b,
			0,
		);
	}
	if (!data.query?.pages) return null;
	return data.query.pages.map((page) =>
		Object.values(page.pageviews).reduce((a, b) => a + b, 0),
	);
}
