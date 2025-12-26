import {HttpMethod} from "@core/enums/HttpMethod";

export interface HistoryFilter {
    method?: HttpMethod;
    statusCode?: number;
    search?: string;
    fromDate?: string;
    toDate?: string;
}