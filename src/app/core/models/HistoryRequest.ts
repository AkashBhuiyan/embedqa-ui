import {HttpMethod} from "@core/enums/HttpMethod";

export interface HistoryRequest {
    url: string;
    method: HttpMethod;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    body?: string;
    bodyType?: string;
    authType?: string;
    authConfig?: Record<string, string>;
}