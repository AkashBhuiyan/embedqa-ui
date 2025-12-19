import { Injectable } from '@angular/core';
import {environment} from "@env/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ApiResult} from "@core/models/ApiResult";
import {Page} from "@core/models/Page";
import {RequestSummary} from "@core/models/RequestSummary";
import {map, Observable} from "rxjs";
import {RequestDetail} from "@core/models/RequestDetail";
import {SaveRequest} from "@core/models/SaveRequest";

@Injectable({
  providedIn: 'root'
})
export class RequestService {

    private readonly baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    getRequests(page = 0, size = 20, sortBy = 'updatedAt', sortDir = 'desc'): Observable<Page<RequestSummary>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortBy', sortBy)
            .set('sortDir', sortDir);

        return this.http.get<ApiResult<Page<RequestSummary>>>(`${this.baseUrl}/requests`, { params })
            .pipe(map(result => result.data));
    }

    getRequest(id: number): Observable<RequestDetail> {
        return this.http.get<ApiResult<RequestDetail>>(`${this.baseUrl}/requests/${id}`)
            .pipe(map(result => result.data));
    }

    saveRequest(request: SaveRequest): Observable<RequestDetail> {
        return this.http.post<ApiResult<RequestDetail>>(`${this.baseUrl}/requests`, request)
            .pipe(map(result => result.data));
    }

    updateRequest(id: number, request: SaveRequest): Observable<RequestDetail> {
        return this.http.put<ApiResult<RequestDetail>>(`${this.baseUrl}/requests/${id}`, request)
            .pipe(map(result => result.data));
    }

    deleteRequest(id: number): Observable<void> {
        return this.http.delete<ApiResult<void>>(`${this.baseUrl}/requests/${id}`)
            .pipe(map(() => undefined));
    }

}
