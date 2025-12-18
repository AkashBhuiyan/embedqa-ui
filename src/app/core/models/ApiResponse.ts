import {ResponseHeader} from "@core/models/ResponseHeader";


export interface ApiResponse {
    statusCode: number;
    statusText: string;
    body: string;
    contentType: string;
    bodySize: number;
    headers: ResponseHeader[];
    responseTimeMs: number;
    requestUrl: string;
    requestMethod: string;
    timestamp: string;
    success: boolean;
    errorMessage?: string;
}