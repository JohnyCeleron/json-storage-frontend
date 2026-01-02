import { API_BASE_URL } from "../config/api";
import { PAGINATION } from "../constants/ui";
import { buildUrl } from "../utils/url";
import type { DocumentListResponse, SearchResponseItem } from "../types/documents";

type FetchOpts = { signal?: AbortSignal };

async function readTextSafe(resp: Response) {
  try {
    return await resp.text();
  } catch {
    return "";
  }
}

export async function apiFetchDocumentsPage(namespace: string, cursor: string | null, opts: FetchOpts = {}): Promise<DocumentListResponse> {
  const url = buildUrl(API_BASE_URL, `/ns/${namespace}/objects`, {
    limit: String(PAGINATION.FETCH_LIMIT),
    cursor,
  });

  const resp = await fetch(url.toString(), { method: "GET", signal: opts.signal });
  if (!resp.ok) {
    const t = await readTextSafe(resp);
    throw new Error(`HTTP ${resp.status}: ${t || "Ошибка загрузки списка документов"}`);
  }
  return (await resp.json()) as DocumentListResponse;
}

export async function apiSearchObjects(namespace: string, filters: string, opts: FetchOpts = {}): Promise<SearchResponseItem[]> {
  const url = buildUrl(API_BASE_URL, `/ns/${namespace}/search`);
  const resp = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
    signal: opts.signal,
  });

  if (!resp.ok) {
    const t = await readTextSafe(resp);
    throw new Error(t || `HTTP ${resp.status}: search failed`);
  }
  return (await resp.json()) as SearchResponseItem[];
}

export async function apiUploadDocument(namespace: string, documentName: string, jsonData: any, opts: FetchOpts = {}) {
  const url = buildUrl(API_BASE_URL, `/ns/${namespace}/objects`, { document_name: documentName });

  const resp = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jsonData),
    signal: opts.signal,
  });

  if (!resp.ok) {
    const t = await readTextSafe(resp);
    throw new Error(`HTTP ${resp.status}: ${t || "Ошибка загрузки"}`);
  }

  const objectId = await resp.text();
  return { id: objectId, documentName };
}

export async function apiDeleteDocument(namespace: string, documentId: string, opts: FetchOpts = {}) {
  const url = buildUrl(API_BASE_URL, `/ns/${namespace}/objects/${documentId}`);
  const resp = await fetch(url.toString(), { method: "DELETE", signal: opts.signal });

  if (!resp.ok) {
    const t = await readTextSafe(resp);
    throw new Error(`HTTP ${resp.status}: ${t || "Ошибка удаления файла"}`);
  }
}

export async function apiSetSearchSchema(namespace: string, schema: any, opts: FetchOpts = {}) {
  const url = buildUrl(API_BASE_URL, `/ns/${namespace}/search-schema`);
  const resp = await fetch(url.toString(), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schema),
    signal: opts.signal,
  });

  if (!resp.ok) {
    const t = await readTextSafe(resp);
    throw new Error(t || `HTTP ${resp.status}: failed to set search schema`);
  }
}
