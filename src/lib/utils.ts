export function encodeToBase64(str: string) {
	try {
		return btoa(encodeURIComponent(str));
	} catch {
		return null;
	}
}

export function decodeFromBase64(str: string) {
	try {
		return decodeURIComponent(atob(str));
	} catch (e) {
		console.error(e);
		return null;
	}
}
export function safeDecodeURIComponent(str: string) {
	try {
		return decodeURIComponent(str);
	} catch {
		return null;
	}
}

export function getDateString(date = new Date()) {
	return date.toISOString().split("T")[0];
}
export function truncateText(
	text: string,
	maxLength: number,
	wordToAdd = "...",
) {
	if (text.length <= maxLength + wordToAdd.length) return text;
	return text.slice(0, maxLength + wordToAdd.length) + wordToAdd;
}
