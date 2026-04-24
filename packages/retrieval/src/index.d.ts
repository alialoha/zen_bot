export type PoemDocument = {
    id: string;
    poet: string;
    work: string;
    language: string;
    text: string;
};
export type RetrievalResult = PoemDocument & {
    score: number;
};
export declare function retrievePoems(query: string, limit?: number): RetrievalResult[];
export declare function formatCitation(result: RetrievalResult): string;
export declare function getCorpus(): PoemDocument[];
export type IngestInput = {
    poet: string;
    work: string;
    language: string;
    text: string;
};
export declare function chunkPoem(input: IngestInput, chunkSize?: number): PoemDocument[];
