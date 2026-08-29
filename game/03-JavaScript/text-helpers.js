/* returns text without diacritics, e.g. "Crème Brûlée" -> "Creme Brulee" */
function removeDiacritics(text) {
	return text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}
window.removeDiacritics = removeDiacritics;

/* returns text in lowercase snake case, e.g. "Crème Brûlée" -> "crème_brûlée" */
function normaliseKey(text) {
	return text.replace(/[\s-]+/g, "_").toLowerCase();
}
window.normaliseKey = normaliseKey;

/* returns text in lowercase kebab case without diacritics, e.g. "Crème Brûlée" -> "creme-brulee" */
function normaliseFileName(text) {
	return removeDiacritics(text)
		.replace(/([A-Z])/g, "-$1")
		.replace(/[\s-_]+/g, "-")
		.toLowerCase();
}
window.normaliseFileName = normaliseFileName;
