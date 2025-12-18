import {ApiResponse} from "@core/models/ApiResponse";
import {ExecuteRequest} from "@core/models/ExecuteRequest";

export interface RequestTab {
    id: string;
    name: string;
    request: ExecuteRequest;
    response?: ApiResponse;
    loading: boolean;
    dirty: boolean;
    savedRequestId?: number;
}