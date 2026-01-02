export type DocumentUI = {
  id: string;
  documentName: string;
  createdAt: string;
  contentLength: number;
  contentHash: string;
  updatedAt: string;
};

export type DocumentApi = {
  id: string;

  // expected (camelCase)
  documentName?: string;
  createdAt?: string;
  updatedAt?: string;
  contentLength?: number;
  contentHash?: string;

  // compat (snake_case)
  document_name?: string;
  created_at?: string;
  updated_at?: string;
  content_length?: number;
  content_hash?: string;
};

export type DocumentListResponse = {
  items: DocumentApi[];
  count: number;
};

export type SearchResponseItem = DocumentApi | DocumentUI | Record<string, any>;