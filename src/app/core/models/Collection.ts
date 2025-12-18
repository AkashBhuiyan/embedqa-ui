import {RequestSummary} from "@core/models/RequestSummary";

export interface Collection {
    id: number;
    name: string;
    description?: string;
    requestCount: number;
    requests: RequestSummary[];
    createdAt?: string;
    updatedAt?: string;
}