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
export function getDateString() {
	const today = new Date();
	return today.toISOString().split("T")[0];
}
