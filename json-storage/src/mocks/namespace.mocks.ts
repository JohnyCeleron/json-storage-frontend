
// Моковые данные для namespace-1


export const mockNamespace1Data = {
    items: [
        {
            "id": "doc-1-1",
            "document_name": "user-profiles.json",
            "createdAt": "2024-01-15T10:30:00Z",
            "updatedAt": "2024-01-20T14:25:00Z",
            "contentLength": 2048,
            "contentHash": "a1b2c3d4e5f6789012345678901234567890abcd"
        },
        {
            "id": "doc-1-2",
            "document_name": "app-config.json",
            "createdAt": "2024-01-16T09:15:00Z",
            "updatedAt": "2024-01-18T11:40:00Z",
            "contentLength": 4096,
            "contentHash": "b2c3d4e5f6789012345678901234567890abcde1"
        },
        {
            "id": "doc-1-3",
            "document_name": "api-endpoints.json",
            "createdAt": "2024-01-17T13:20:00Z",
            "updatedAt": "2024-01-19T16:55:00Z",
            "contentLength": 1024,
            "contentHash": "c3d4e5f6789012345678901234567890abcde12"
        },
        {
            "id": "doc-1-4",
            "document_name": "feature-flags.json",
            "createdAt": "2024-01-18T08:45:00Z",
            "updatedAt": "2024-01-21T10:10:00Z",
            "contentLength": 3072,
            "contentHash": "d4e5f6789012345678901234567890abcde123"
        }
    ],
    count: 4
};
// Моковые данные для namespace-2

export const mockNamespace2Data = {
    items: [
        {
            "id": "doc-2-1",
            "document_name": "database-config.json",
            "createdAt": "2024-01-14T11:20:00Z",
            "updatedAt": "2024-01-22T09:30:00Z",
            "contentLength": 5120,
            "contentHash": "e5f6789012345678901234567890abcde1234"
        },
        {
            "id": "doc-2-2",
            "document_name": "cache-settings.json",
            "createdAt": "2024-01-15T16:40:00Z",
            "updatedAt": "2024-01-15T16:40:00Z",
            "contentLength": 1536,
            "contentHash": "f6789012345678901234567890abcde12345"
        },
        {
            "id": "doc-2-3",
            "document_name": "logging-config.json",
            "createdAt": "2024-01-19T14:10:00Z",
            "updatedAt": "2024-01-20T17:25:00Z",
            "contentLength": 2048,
            "contentHash": "789012345678901234567890abcde123456"
        }
    ],
    count: 3
};
// Моковые данные для namespace-3

export const mockNamespace3Data = {
    items: [
        {
            "id": "doc-3-1",
            "document_name": "payment-gateway.json",
            "createdAt": "2024-01-12T08:15:00Z",
            "updatedAt": "2024-01-21T13:45:00Z",
            "contentLength": 6144,
            "contentHash": "9012345678901234567890abcde12345678"
        },
        {
            "id": "doc-3-2",
            "document_name": "user-preferences.json",
            "createdAt": "2024-01-13T10:30:00Z",
            "updatedAt": "2024-01-18T15:20:00Z",
            "contentLength": 1024,
            "contentHash": "012345678901234567890abcde123456789"
        },
        {
            "id": "doc-3-3",
            "document_name": "notification-templates.json",
            "createdAt": "2024-01-16T11:45:00Z",
            "updatedAt": "2024-01-19T09:30:00Z",
            "contentLength": 4096,
            "contentHash": "12345678901234567890abcde1234567890"
        },
        {
            "id": "doc-3-4",
            "document_name": "analytics-events.json",
            "createdAt": "2024-01-17T14:20:00Z",
            "updatedAt": "2024-01-20T16:10:00Z",
            "contentLength": 8192,
            "contentHash": "2345678901234567890abcde12345678901"
        },
        {
            "id": "doc-3-5",
            "document_name": "security-policies.json",
            "createdAt": "2024-01-18T12:00:00Z",
            "updatedAt": "2024-01-22T08:45:00Z",
            "contentLength": 3072,
            "contentHash": "345678901234567890abcde123456789012"
        }
    ],
    count: 5
};
// Моковые данные для namespace-4

export const mockNamespace4Data = {
    items: [
        {
            "id": "doc-4-1",
            "document_name": "monitoring-config.json",
            "createdAt": "2024-01-10T09:00:00Z",
            "updatedAt": "2024-01-23T11:15:00Z",
            "contentLength": 2048,
            "contentHash": "45678901234567890abcde1234567890123"
        },
        {
            "id": "doc-4-2",
            "document_name": "backup-schedule.json",
            "createdAt": "2024-01-11T14:30:00Z",
            "updatedAt": "2024-01-17T10:45:00Z",
            "contentLength": 1024,
            "contentHash": "5678901234567890abcde12345678901234"
        },
        {
            "id": "doc-4-3",
            "document_name": "api-keys.json",
            "createdAt": "2024-01-13T16:20:00Z",
            "updatedAt": "2024-01-13T16:20:00Z",
            "contentLength": 512,
            "contentHash": "678901234567890abcde123456789012345"
        }
    ],
    count: 3
};
export const mockDB = new Map<String, any>([
    ["namespace-1", mockNamespace1Data],
    ["namespace-2", mockNamespace2Data],
    ["namespace-3", mockNamespace3Data],
    ["namespace-4", mockNamespace4Data]
]);
