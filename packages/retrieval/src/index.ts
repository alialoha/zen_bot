import poems from "./data/poems.json" with { type: "json" };

export type PoemDocument = {
  id: string;
  poet: string;
  work: string;
  language: string;
  text: string;
};

export type RetrievalResult = PoemDocument & { score: number };

const corpus = poems as PoemDocument[];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function scoreByTokenOverlap(query: string, doc: PoemDocument): number {
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

export function retrievePoems(query: string, limit = 2): RetrievalResult[] {
  return corpus
    .map((doc) => ({ ...doc, score: scoreByTokenOverlap(query, doc) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function formatCitation(result: RetrievalResult): string {
  return `[${result.poet} - ${result.work} - ${result.id}]`;
}

export function getCorpus(): PoemDocument[] {
  return corpus;
}

export type IngestInput = {
  poet: string;
  work: string;
  language: string;
  text: string;
};

export function chunkPoem(input: IngestInput, chunkSize = 220): PoemDocument[] {
  const words = input.text.split(/\s+/).filter(Boolean);
  const chunks: PoemDocument[] = [];
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

