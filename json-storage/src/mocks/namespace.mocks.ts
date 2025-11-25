import type { NamespaceData } from "../interfaces/namespaceData.ts";


export const mockNamespace1Data: NamespaceData = {
    documentsData: [
        {
            "id": "doc-1-1",
            "documentName": "user-profiles.json",
            "createdAt": "2024-01-15T10:30:00Z",
            "updatedAt": "2024-01-20T14:25:00Z",
            "contentLength": 2048,
            "contentHash": "a1b2c3d4e5f6789012345678901234567890abcd",
            "content": {
                "metadata": {
                    "version": "1.0.0",
                    "generatedAt": "2024-01-20T14:25:00Z",
                    "totalUsers": 3
                },
                "users": [
                    {
                        "id": "u-1001",
                        "username": "alice",
                        "email": "alice@example.com",
                        "fullName": "Alice Johnson",
                        "roles": ["admin", "editor"],
                        "preferences": {
                            "theme": "dark",
                            "language": "en-US",
                            "notifications": {
                                "email": true,
                                "sms": false
                            }
                        },
                        "createdAt": "2023-08-01T09:12:00Z",
                        "lastLogin": "2024-01-19T18:05:00Z",
                        "active": true
                    },
                    {
                        "id": "u-1002",
                        "username": "bob",
                        "email": "bob@example.com",
                        "fullName": "Robert Martin",
                        "roles": ["editor"],
                        "preferences": {
                            "theme": "light",
                            "language": "en-GB",
                            "notifications": {
                                "email": true,
                                "sms": true
                            }
                        },
                        "createdAt": "2023-11-14T12:34:00Z",
                        "lastLogin": "2024-01-18T07:20:00Z",
                        "active": true
                    },
                ]
            }
        },
        {
            "id": "doc-1-2",
            "documentName": "app-config.json",
            "createdAt": "2024-01-16T09:15:00Z",
            "updatedAt": "2024-01-18T11:40:00Z",
            "contentLength": 4096,
            "contentHash": "b2c3d4e5f6789012345678901234567890abcde1"
        },
        {
            "id": "doc-1-3",
            "documentName": "api-endpoints.json",
            "createdAt": "2024-01-17T13:20:00Z",
            "updatedAt": "2024-01-19T16:55:00Z",
            "contentLength": 1024,
            "contentHash": "c3d4e5f6789012345678901234567890abcde12"
        },
        {
            "id": "doc-1-4",
            "documentName": "feature-flags.json",
            "createdAt": "2024-01-18T08:45:00Z",
            "updatedAt": "2024-01-21T10:10:00Z",
            "contentLength": 3072,
            "contentHash": "d4e5f6789012345678901234567890abcde123"
        },
        {
            "id": "doc-1-5",
            "documentName": "user-profiles.json",
            "createdAt": "2024-01-15T10:30:00Z",
            "updatedAt": "2024-01-20T14:25:00Z",
            "contentLength": 2048,
            "contentHash": "a1b2c3d4e5f6789012345678901234567890abcd"
        },
        {
            "id": "doc-1-6",
            "documentName": "app-config.json",
            "createdAt": "2024-01-16T09:15:00Z",
            "updatedAt": "2024-01-18T11:40:00Z",
            "contentLength": 4096,
            "contentHash": "b2c3d4e5f6789012345678901234567890abcde1"
        },
        {
            "id": "doc-1-7",
            "documentName": "api-endpoints.json",
            "createdAt": "2024-01-17T13:20:00Z",
            "updatedAt": "2024-01-19T16:55:00Z",
            "contentLength": 1024,
            "contentHash": "c3d4e5f6789012345678901234567890abcde12"
        },
        {
            "id": "doc-1-8",
            "documentName": "feature-flags.json",
            "createdAt": "2024-01-18T08:45:00Z",
            "updatedAt": "2024-01-21T10:10:00Z",
            "contentLength": 3072,
            "contentHash": "d4e5f6789012345678901234567890abcde123"
        }
    ],
    count: 8
};
// Моковые данные для namespace-2

export const mockNamespace2Data: NamespaceData = {
    documentsData: [
        {
            "id": "doc-2-1",
            "documentName": "database-config.json",
            "createdAt": "2024-01-14T11:20:00Z",
            "updatedAt": "2024-01-22T09:30:00Z",
            "contentLength": 5120,
            "contentHash": "e5f6789012345678901234567890abcde1234"
        },
        {
            "id": "doc-2-2",
            "documentName": "cache-settings.json",
            "createdAt": "2024-01-15T16:40:00Z",
            "updatedAt": "2024-01-15T16:40:00Z",
            "contentLength": 1536,
            "contentHash": "f6789012345678901234567890abcde12345"
        },
        {
            "id": "doc-2-3",
            "documentName": "logging-config.json",
            "createdAt": "2024-01-19T14:10:00Z",
            "updatedAt": "2024-01-20T17:25:00Z",
            "contentLength": 2048,
            "contentHash": "789012345678901234567890abcde123456"
        }
    ],
    count: 3
};
// Моковые данные для namespace-3

export const mockNamespace3Data: NamespaceData = {
    documentsData: [
        {
            "id": "doc-3-1",
            "documentName": "payment-gateway.json",
            "createdAt": "2024-01-12T08:15:00Z",
            "updatedAt": "2024-01-21T13:45:00Z",
            "contentLength": 6144,
            "contentHash": "9012345678901234567890abcde12345678"
        },
        {
            "id": "doc-3-2",
            "documentName": "user-preferences.json",
            "createdAt": "2024-01-13T10:30:00Z",
            "updatedAt": "2024-01-18T15:20:00Z",
            "contentLength": 1024,
            "contentHash": "012345678901234567890abcde123456789"
        },
        {
            "id": "doc-3-3",
            "documentName": "notification-templates.json",
            "createdAt": "2024-01-16T11:45:00Z",
            "updatedAt": "2024-01-19T09:30:00Z",
            "contentLength": 4096,
            "contentHash": "12345678901234567890abcde1234567890"
        },
        {
            "id": "doc-3-4",
            "documentName": "analytics-events.json",
            "createdAt": "2024-01-17T14:20:00Z",
            "updatedAt": "2024-01-20T16:10:00Z",
            "contentLength": 8192,
            "contentHash": "2345678901234567890abcde12345678901"
        },
        {
            "id": "doc-3-5",
            "documentName": "security-policies.json",
            "createdAt": "2024-01-18T12:00:00Z",
            "updatedAt": "2024-01-22T08:45:00Z",
            "contentLength": 3072,
            "contentHash": "345678901234567890abcde123456789012"
        }
    ],
    count: 5
};
// Моковые данные для namespace-4

export const mockNamespace4Data: NamespaceData = {
    documentsData: [
        {
            "id": "doc-4-1",
            "documentName": "monitoring-config.json",
            "createdAt": "2024-01-10T09:00:00Z",
            "updatedAt": "2024-01-23T11:15:00Z",
            "contentLength": 2048,
            "contentHash": "45678901234567890abcde1234567890123"
        },
        {
            "id": "doc-4-2",
            "documentName": "backup-schedule.json",
            "createdAt": "2024-01-11T14:30:00Z",
            "updatedAt": "2024-01-17T10:45:00Z",
            "contentLength": 1024,
            "contentHash": "5678901234567890abcde12345678901234"
        },
        {
            "id": "doc-4-3",
            "documentName": "api-keys.json",
            "createdAt": "2024-01-13T16:20:00Z",
            "updatedAt": "2024-01-13T16:20:00Z",
            "contentLength": 512,
            "contentHash": "678901234567890abcde123456789012345"
        }
    ],
    count: 3
};
export const mockDB: Map<String, NamespaceData> = new Map<String, NamespaceData>([
    ["namespace-1", mockNamespace1Data],
    ["namespace-2", mockNamespace2Data],
    ["namespace-3", mockNamespace3Data],
    ["namespace-4", mockNamespace4Data]
]);
