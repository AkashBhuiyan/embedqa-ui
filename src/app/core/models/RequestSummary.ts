import {HttpMethod} from "@core/enums/HttpMethod";

export interface RequestSummary {
    id: number;
    name: string;
    url: string;
    method: HttpMethod;
    description?: string;
    collectionId?: number;
    collectionName?: string;
    createdAt?: string;
    updatedAt?: string;
}