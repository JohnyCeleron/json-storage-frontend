export interface DocumentData {
    id: string;
    documentName: string;
    createdAt: string;
    updatedAt: string;
    contentLength: number;
    contentHash: string;
    content?: Record<string, unknown>;
}