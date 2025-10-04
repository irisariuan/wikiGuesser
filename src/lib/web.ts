import { JSDOM } from "jsdom";
import { Converter } from "opencc-js";
import { isEnglish } from "./text";

interface ExtractedWikiResponse<Success extends boolean> {
	batchcomplete: Success;
	query: Success extends true
		? { pages: ExtractedWikiResponseQueryPage[] }
		: undefined;
}

export interface ExtractedWikiResponseQueryPage {
	pageid: number;
	ns: number;
	title: string;
	extract: string;
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
): Promise<
	({ originalExtract: string } & ExtractedWikiResponseQueryPage) | null
> {
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
	const data = (await response.json().catch(() => {
		console.error("Failed to parse JSON from wiki");
		return null;
	})) as ExtractedWikiResponse<boolean> | null;
	if (!data || !data.batchcomplete || !data.query?.pages?.[0]) return null;
	const mayContainHtml = data.query.pages[0];
	const converter = Converter({ from: "cn", to: "hk" });
	const newTitle = converter(mayContainHtml.title.replaceAll(" ", ""));
	return {
		...mayContainHtml,
		extract: removeHtml(mayContainHtml.extract),
		originalExtract: mayContainHtml.extract,
		title: newTitle,
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

export const validNamespaces = [
	0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 90, 91, 92, 93, 100,
	101, 102, 103, 104, 105, 106, 107, 710, 711, 828, 829, 1198, 1199, 2600,
	5500, 5501,
] as const;
export type Namespace = (typeof validNamespaces)[number];

export async function getRandomWiki(
	limit: number,
	namespaces?: Namespace[],
): Promise<WikiQueryResponseRandomContent[] | null>;
export async function getRandomWiki(
	limit: 1,
	namespaces?: Namespace[],
): Promise<WikiQueryResponseRandomContent | null>;
export async function getRandomWiki(
	limit: number,
	namespaces: Namespace[] = [0],
): Promise<
	WikiQueryResponseRandomContent | WikiQueryResponseRandomContent[] | null
> {
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
	if (limit === 1) return data.query.random[0];
	return data.query.random;
}
