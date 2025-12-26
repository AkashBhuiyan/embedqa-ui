export interface HistoryResponse {
    statusCode: number;
    statusText: string;
    headers?: Record<string, string>;
    body?: string;
    responseTime: number;
    responseSize: number;
}