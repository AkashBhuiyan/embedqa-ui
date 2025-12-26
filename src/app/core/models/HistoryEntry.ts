import {HttpMethod} from '@core/enums/HttpMethod';
import {HistoryRequest} from "@core/models/HistoryRequest";
import {HistoryResponse} from "@core/models/HistoryResponse";

export interface HistoryEntry {
    id: number;
    url: string;
    method: HttpMethod;
    statusCode: number;
    statusText: string;
    responseTime: number;
    responseSize: number;
    executedAt: string;
    requestName?: string;
    collectionName?: string;

    request?: HistoryRequest;
    response?: HistoryResponse;
}



