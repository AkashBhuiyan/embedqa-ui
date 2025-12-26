import {ApiResult} from "@core/models/ApiResult";
import {PageInfo} from "@core/models/PageInfo";

export interface PagedResult<T> extends ApiResult<T[]> {
    pageInfo?: PageInfo;
}