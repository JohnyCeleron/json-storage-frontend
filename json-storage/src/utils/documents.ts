import type { DocumentApi, DocumentUI } from "../types/documents";

export function mapApiToUI(d: DocumentApi): DocumentUI {
  return {
    id: d.id,
    documentName: d.documentName ?? d.document_name ?? "",
    createdAt: d.createdAt ?? d.created_at ?? "",
    contentHash: d.contentHash ?? d.content_hash ?? "",
    contentLength: d.contentLength ?? d.content_length ?? 0,
    updatedAt: d.updatedAt ?? d.updated_at ?? "",
  };
}

export function mapSearchItemToUI(x: any): DocumentUI | null {
  if (!x?.id) return null;

  if (x?.documentName || x?.document_name || x?.createdAt || x?.created_at) {
    return mapApiToUI(x as DocumentApi);
  }

  return {
    id: String(x?.id ?? ""),
    documentName: String(x?.documentName ?? x?.document_name ?? ""),
    createdAt: String(x?.createdAt ?? x?.created_at ?? ""),
    contentHash: String(x?.contentHash ?? x?.content_hash ?? ""),
    contentLength: Number(x?.contentLength ?? x?.content_length ?? 0),
    updatedAt: String(x?.updatedAt ?? x?.updated_at ?? ""),
  };
}
