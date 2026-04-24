import poems from "./data/poems.json" with { type: "json" };
const corpus = poems;
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter((token) => token.length > 1);
}
function scoreByTokenOverlap(query, doc) {
    const q = new Set(tokenize(query));
    const d = tokenize(doc.text);
    if (q.size === 0 || d.length === 0) {
        return 0;
    }
    let overlap = 0;
    for (const token of d) {
        if (q.has(token)) {
            overlap += 1;
        }
    }
    return overlap / d.length;
}
export function retrievePoems(query, limit = 2) {
    return corpus
        .map((doc) => ({ ...doc, score: scoreByTokenOverlap(query, doc) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}
export function formatCitation(result) {
    return `[${result.poet} - ${result.work} - ${result.id}]`;
}
export function getCorpus() {
    return corpus;
}
export function chunkPoem(input, chunkSize = 220) {
    const words = input.text.split(/\s+/).filter(Boolean);
    const chunks = [];
    let index = 0;
    let chunk = 1;
    while (index < words.length) {
        const slice = words.slice(index, index + chunkSize).join(" ");
        chunks.push({
            id: `${input.poet.toLowerCase()}-${input.work.toLowerCase().replace(/\s+/g, "-")}-${chunk}`,
            poet: input.poet,
            work: input.work,
            language: input.language,
            text: slice
        });
        index += chunkSize;
        chunk += 1;
    }
    return chunks;
}
