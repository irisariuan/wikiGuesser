export interface Letter {
	index: number;
	char: string;
	isPunctuation: boolean;
	isHan: boolean;
	isEnglish: boolean;
	isNumber: boolean;
	shouldInput: boolean;
	guessed: boolean;
}

export function isHan(letter: string) {
	return /^\p{Script=Han}$/u.test(letter);
}
export function isPunctuation(letter: string) {
	return /^\p{P}$/u.test(letter);
}
export function isEnglish(letter: string) {
	return /^[a-zA-Z]$/.test(letter);
}
export function isNumber(letter: string) {
	return /^[0-9]$/.test(letter);
}

export function canBeInput(letter: string) {
	return isHan(letter) || isEnglish(letter) || isNumber(letter);
}

export function convertText(originalText: string, guessed = false): Letter[] {
	const result: Letter[] = [];
	for (let i = 0; i < originalText.length; i++) {
		const letter = originalText[i];
		result.push({
			index: i,
			char: letter,
			isPunctuation: isPunctuation(letter),
			isHan: isHan(letter),
			isEnglish: isEnglish(letter),
			isNumber: isNumber(letter),
			shouldInput: canBeInput(letter),
			guessed,
		});
	}
	return result;
}
export function markNewGuessedLetters(
	letters: Letter[],
	guessedChar: string,
	forceShowAll = false,
): Letter[] {
	return letters.map((letter) => ({
		...letter,
		guessed:
			guessedChar.toUpperCase() === letter.char.toUpperCase() ||
			letter.guessed ||
			forceShowAll,
	}));
}
